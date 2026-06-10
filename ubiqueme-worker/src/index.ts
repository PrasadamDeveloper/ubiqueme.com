import { initializeApp, FirebaseOptions, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore, doc, getDoc, writeBatch, increment, Timestamp, collection } from 'firebase/firestore/lite';
import { getAuth, Auth, signInWithEmailAndPassword } from 'firebase/auth';

// ─── Meta Webhook Types ─────────────────────────────────────────
interface MetaWebhookPayload {
	entry?: Array<{
		changes?: Array<{
			value?: {
				messages?: Array<{
					from?: string;
					type?: string;
					text?: { body?: string };
					image?: { id?: string; mime_type?: string };
				}>;
			};
		}>;
	}>;
}

interface MetaApiError {
	error?: { message?: string };
}

// TODO: Create a cron job or endpoint that auto-refreshes WHATSAPP_ACCESS_TOKEN
// before it expires. Meta tokens last 24h-60d. To implement auto-refresh:
//   1. Add WHATSAPP_APP_ID and WHATSAPP_APP_SECRET as secrets (Meta dev app)
//   2. Call GET /oauth/access_token?grant_type=fb_exchange_token&
//        client_id={APP_ID}&client_secret={APP_SECRET}&
//        fb_exchange_token={WHATSAPP_ACCESS_TOKEN}
//   3. Store the new token back into secrets via Workers API
interface Env {
	FIREBASE_PROJECT_ID: string;
	FIREBASE_API_KEY: string;
	FIREBASE_AUTH_EMAIL: string;
	FIREBASE_AUTH_PASSWORD: string;
	WHATSAPP_PHONE_NUMBER_ID: string;
	WHATSAPP_VERIFY_TOKEN: string;
	WHATSAPP_ACCESS_TOKEN: string;
}

const CORS_HEADERS = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'POST, OPTIONS',
	'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

const HEADER_IMAGE_URL = 'https://files.catbox.moe/rhrrcc.png'; //Still is important to migrate to R2 for hosting this image, but for now we keep it in catbox for simplicity. This image is used in the WhatsApp template header.

// ─── Lazy Firebase Singleton ────────────────────────────────────
let firebaseApp: FirebaseApp | null = null;
let firestoreDb: Firestore | null = null;
let firebaseAuth: Auth | null = null;

function getFirebase(env: Env) {
	if (!firebaseApp) {
		const config: FirebaseOptions = {
			apiKey: env.FIREBASE_API_KEY,
			authDomain: `${env.FIREBASE_PROJECT_ID}.firebaseapp.com`,
			projectId: env.FIREBASE_PROJECT_ID,
			storageBucket: `${env.FIREBASE_PROJECT_ID}.firebasestorage.app`,
			messagingSenderId: 'worker',
			appId: 'worker:ubiqueme',
		};
		firebaseApp = initializeApp(config);
		firestoreDb = getFirestore(firebaseApp);
		firebaseAuth = getAuth(firebaseApp);
	}
	return { app: firebaseApp, db: firestoreDb, auth: firebaseAuth };
}

// ─── Auth helper ────────────────────────────────────────────────
async function ensureAuthenticated(env: Env) {
	const { auth } = getFirebase(env);
	if (!auth) throw new Error('Firebase Auth no inicializado');

	if (!auth.currentUser) {
		await signInWithEmailAndPassword(auth, env.FIREBASE_AUTH_EMAIL, env.FIREBASE_AUTH_PASSWORD);
		console.log('[Worker] Firebase Auth: sesión iniciada con email/password');
	}
	return auth;
}

// ─── Firestore helpers ──────────────────────────────────────────
interface QRData {
	uid?: string;
	name?: string;
	status?: string;
}

interface UserData {
	email?: string;
	displayName?: string;
	phone?: string;
}

async function getQRData(env: Env, qrId: string): Promise<QRData | null> {
	await ensureAuthenticated(env);
	const { db } = getFirebase(env);
	const ref = doc(db!, 'publicQR', qrId);
	const snap = await getDoc(ref);
	if (!snap.exists()) return null;
	const data = snap.data();
	return {
		uid: data.uid,
		name: data.name,
		status: data.status,
	};
}

async function getUserData(env: Env, uid: string): Promise<UserData | null> {
	await ensureAuthenticated(env);
	const { db } = getFirebase(env);
	const ref = doc(db!, 'users', uid);
	const snap = await getDoc(ref);
	if (!snap.exists()) return null;
	const data = snap.data();
	return {
		email: data.email,
		displayName: data.displayName || data.name,
		phone: data.phone,
	};
}

// ─── Scan logging helper ────────────────────────────────────────
async function logScan(env: Env, qrId: string, logData: Record<string, unknown>): Promise<void> {
	const { db } = getFirebase(env);
	await ensureAuthenticated(env);

	const batch = writeBatch(db!);
	const qrRef = doc(db!, 'publicQR', qrId);
	const logRef = doc(collection(db!, 'publicQR', qrId, 'logs'), Date.now().toString());

	batch.update(qrRef, {
		totalScans: increment(1),
		lastScan: Timestamp.now(),
	});
	batch.set(logRef, logData);
	await batch.commit();

	console.log(`[Worker] Scan log escrito para QR ${qrId}: totalScans incrementado.`);
}

// ─── JSON helper ─────────────────────────────────────────────────
function json(data: Record<string, unknown>, status = 200): Response {
	return new Response(JSON.stringify(data), {
		status,
		headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
	});
}

// ─── Main handler ───────────────────────────────────────────────
export default {
	async fetch(request: Request, env: Env, _ctx: ExecutionContext): Promise<Response> {
		const url = new URL(request.url);
		const cleanPath = url.pathname.replace(/\/$/, '');

		// Handle CORS preflight
		if (request.method === 'OPTIONS') {
			return new Response(null, { headers: CORS_HEADERS });
		}

		// Webhook routing (Exclusively for Meta)
		if (cleanPath === '/api/whatsapp') {
			if (request.method === 'GET') {
				// Mandatory Meta verification
				const mode = url.searchParams.get('hub.mode');
				const token = url.searchParams.get('hub.verify_token');
				const challenge = url.searchParams.get('hub.challenge');

				if (mode === 'subscribe' && token === env.WHATSAPP_VERIFY_TOKEN) {
					console.log('[Worker] Webhook verificado correctamente por Meta.');
					return new Response(challenge, { status: 200 });
				}
				return new Response('Verification failed', { status: 403 });
			}

			if (request.method === 'POST') {
				return await handleWhatsAppWebhook(request, env);
			}
		}

		return json({ error: 'Not found or method not allowed' }, 404);
	},
};

/**
 * Handles image messages from WhatsApp webhook.
 * Downloads the image from Meta's media endpoint, converts to base64,
 * and stores a separate log entry in Firestore.
 */
async function handleImageMessage(env: Env, mediaId: string, senderPhone: string): Promise<Response> {
	try {
		console.log(`[Worker] Imagen recibida de ${senderPhone}, media_id: ${mediaId}`);

		// 1. Get the image URL from Meta's media endpoint
		const mediaUrlResponse = await fetch(`https://graph.facebook.com/v20.0/${mediaId}`, {
			headers: { Authorization: `Bearer ${env.WHATSAPP_ACCESS_TOKEN}` },
		});

		if (!mediaUrlResponse.ok) {
			console.error('[Worker] Error obteniendo URL de imagen de Meta:', mediaUrlResponse.status);
			return new Response('Media fetch failed', { status: 200 });
		}

		const mediaData = (await mediaUrlResponse.json()) as { url?: string; mime_type?: string };
		const imageUrl = mediaData.url;
		if (!imageUrl) {
			console.error('[Worker] Meta no devolvió URL de imagen.');
			return new Response('No media URL', { status: 200 });
		}

		// 2. Download the image
		const imageResponse = await fetch(imageUrl, {
			headers: { Authorization: `Bearer ${env.WHATSAPP_ACCESS_TOKEN}` },
		});
		if (!imageResponse.ok) {
			console.error('[Worker] Error descargando imagen:', imageResponse.status);
			return new Response('Image download failed', { status: 200 });
		}

		// 3. Convert to base64
		const imageBuffer = await imageResponse.arrayBuffer();
		const mimeType = mediaData.mime_type || 'image/jpeg';
		const base64 = btoa(String.fromCharCode(...new Uint8Array(imageBuffer)));
		const dataUrl = `data:${mimeType};base64,${base64}`;

		// 4. Store as a separate log entry (simplest approach for image correlation)
		// We don't know which QR this image belongs to, so we log it by senderPhone.
		// The dashboard can correlate by timestamp proximity with text scans.
		const { db } = getFirebase(env);
		await ensureAuthenticated(env);

		// Store in a generic images collection scoped to senderPhone
		const logRef = doc(collection(db!, 'whatsapp_images'), Date.now().toString());
		const batch = writeBatch(db!);
		batch.set(logRef, {
			senderPhone: senderPhone,
			scanDate: Timestamp.now(),
			interaction: { type: 'image' },
			mimeType,
			img: dataUrl,
		});
		await batch.commit();

		console.log(`[Worker] Imagen almacenada para ${senderPhone}.`);
		return new Response('Image stored', { status: 200 });
	} catch (e: unknown) {
		console.error('[Worker] Excepción en handleImageMessage:', e);
		return new Response('Image error', { status: 200 });
	}
}

/**
 * POST /api/whatsapp — Incoming webhook from Meta
 */
async function handleWhatsAppWebhook(request: Request, env: Env): Promise<Response> {
	try {
		const jsonBody: MetaWebhookPayload = await request.json();

		// 1. Extract Meta payload
		const message = jsonBody.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
		if (!message) return new Response('No message found', { status: 200 });

		const senderPhone: string = message.from || '';
		if (!senderPhone) {
			return new Response('Missing sender', { status: 200 });
		}

		// 🚧 TEMPORARY: Only accept messages from test number
		const ALLOWED_TEST_PHONE = '5215635752789';
		if (senderPhone !== ALLOWED_TEST_PHONE) {
			console.log(`[Worker] Rechazado número no autorizado: ${senderPhone}`);
			return new Response('OK', { status: 200 });
		}

		// 1b. Branch: image vs text
		if (message.type === 'image' && message.image?.id) {
			return await handleImageMessage(env, message.image.id, senderPhone);
		}

		// ─── TEXT MESSAGE FLOW ──────────────────────────────────
		const bodyText: string = message.text?.body || '';
		if (!bodyText) {
			return new Response('No text body', { status: 200 });
		}

		// 2. Extract QR ID and optional fields
		const idMatch = bodyText.match(/ID:\s*([A-Za-z0-9_-]+)/i);
		if (!idMatch || !idMatch[1]) {
			return new Response('OK', { status: 200 }); // Always 200 so Meta doesn't retry
		}

		const qrId = idMatch[1];
		const qrNameMatch = bodyText.match(/QR:\s*(.+)/i);
		const timeMatch = bodyText.match(/Hora:\s*(.+)/i);
		const msgMatch = bodyText.match(/Mensaje:\s*([\s\S]*)/i);

		const qrName = qrNameMatch && qrNameMatch[1] ? qrNameMatch[1].trim() : 'objeto';
		const scanTime = timeMatch && timeMatch[1] ? timeMatch[1].trim() : new Date().toLocaleString('es-MX');
		const customMessage = msgMatch && msgMatch[1] ? msgMatch[1].trim() : 'Sin mensaje adicional.';

		console.log(`[Worker] QR detectado: ${qrId} (De: ${senderPhone})`);

		// 3. Fetch QR Data via Firebase SDK
		const qrData = await getQRData(env, qrId);
		if (!qrData || !qrData.uid) {
			console.log(`[Worker] Error: QR ${qrId} no encontrado en BD.`);
			return new Response('QR not found', { status: 200 });
		}

		// 3b. Validate QR status
		if (qrData.status !== 'Active') {
			console.log(`[Worker] QR ${qrId} inactivo (status: ${qrData.status}). Respondiendo al scanner.`);
			await fetch(`https://graph.facebook.com/v20.0/${env.WHATSAPP_PHONE_NUMBER_ID}/messages`, {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${env.WHATSAPP_ACCESS_TOKEN}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					messaging_product: 'whatsapp',
					recipient_type: 'individual',
					to: senderPhone,
					type: 'text',
					text: { body: 'Este código QR ya no está activo. El propietario lo ha desactivado.' },
				}),
			});
			return new Response('QR inactive', { status: 200 });
		}

		// 4. Fetch Owner Data via Firebase SDK
		const ownerData = await getUserData(env, qrData.uid);
		if (!ownerData || !ownerData.phone) {
			console.log(`[Worker] Error: Dueño ${qrData.uid} sin teléfono.`);
			return new Response('Owner missing phone', { status: 200 });
		}

		// 4b. Log scan to Firestore BEFORE sending notification
		await logScan(env, qrId, {
			scanDate: Timestamp.now(),
			scanMetrics: { country: '', city: '', region: '' },
			interaction: { type: 'whatsapp_scan', message: customMessage },
		});

		// 5. Prepare Notification
		const cleanScannerPhone = senderPhone.replace('+', '');
		const ownerWhatsApp = ownerData.phone.replace('whatsapp:', '').replace('+', '');

		console.log(`[Worker] Owner WhatsApp (after clean): "${ownerWhatsApp}" (raw: "${ownerData.phone}")`);

		// 6. Send via Meta API using template
		const url = `https://graph.facebook.com/v20.0/${env.WHATSAPP_PHONE_NUMBER_ID}/messages`;
		const payload = {
			messaging_product: 'whatsapp',
			recipient_type: 'individual',
			to: ownerWhatsApp,
			type: 'template',
			template: {
				name: 'notif',
				language: { code: 'es' },
				components: [
					{
						type: 'header',
						parameters: [
							{
								type: 'image',
								image: { link: HEADER_IMAGE_URL },
							},
						],
					},
					{
						type: 'body',
						parameters: [
							{ type: 'text', text: String(ownerData.displayName || 'propietario') }, // {{1}} — nombre del dueño
							{ type: 'text', text: String(cleanScannerPhone) }, // {{2}} — número del scanner
							{ type: 'text', text: String(customMessage || 'Sin mensaje') }, // {{3}} — mensaje
							{ type: 'text', text: String(qrData.name || qrName || 'objeto') }, // {{4}} — nombre del QR
							{ type: 'text', text: String(scanTime) }, // {{5}} — hora del escaneo
						],
					},
				],
			},
		};

		const response = await fetch(url, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${env.WHATSAPP_ACCESS_TOKEN}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(payload),
		});

		// Always log Meta's response body — even 200 can hide errors
		const result = (await response.json()) as { messages?: Array<{ id: string }>; error?: { message: string } };
		console.log(`[Worker] Meta response status: ${response.status}, body: ${JSON.stringify(result)}`);

		if (!response.ok) {
			console.error('[Worker] Meta API error — notification NOT sent to owner.');
			return new Response('Meta API Error', { status: 200 });
		}

		const msgStatus = result.messages?.[0]?.id ? 'ACEPTADO por Meta (message_id presente)' : 'POSIBLE FALLO SILENCIOSO';
		console.log(`[Worker] Notificación al dueño: ${msgStatus}. message_id: ${result.messages?.[0]?.id || 'N/A'}`);

		// 7. Send scanner confirmation reply
		const scannerReplyPayload = {
			messaging_product: 'whatsapp',
			recipient_type: 'individual',
			to: senderPhone,
			type: 'text',
			text: {
				body: `Notificación enviada exitosamente\n\nSu mensaje ha sido recibido y enviado al propietario de "${qrData.name || 'objeto'}". Él podrá ver su información de contacto y responderle directamente.\n\nAgradecemos mucho que haya utilizado los servicios de Ubiqueme para facilitar esta conexión.\n\nSi desea proteger sus pertenencias, familia, hogar y más, visítenos en:\nhttps://ubiqueme.com\n\nNo espere a perder algo para protegerlo — _únase a los miles que ya confían en nosotros para proteger lo que más les importa._\n\n_-ubiqueme_`,
			},
		};

		const scannerResponse = await fetch(url, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${env.WHATSAPP_ACCESS_TOKEN}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(scannerReplyPayload),
		});

		if (!scannerResponse.ok) {
			const result = await scannerResponse.json();
			console.error('[Worker] Error enviando confirmación al scanner:', JSON.stringify(result));
		} else {
			console.log(`[Worker] Confirmación enviada al scanner ${senderPhone}.`);
		}

		return new Response('OK', { status: 200 });
	} catch (e: unknown) {
		console.error('[Worker] Excepción en Webhook:', e);
		return new Response('Error', { status: 200 });
	}
}
