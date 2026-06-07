import { initializeApp, FirebaseOptions, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore, doc, getDoc } from 'firebase/firestore/lite';
import { getAuth, Auth, signInWithEmailAndPassword } from 'firebase/auth';

// ─── Meta Webhook Types ─────────────────────────────────────────
interface MetaWebhookPayload {
	entry?: Array<{
		changes?: Array<{
			value?: {
				messages?: Array<{
					from?: string;
					text?: { body?: string };
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

		// Notify endpoint (called from QRScannedView to send WhatsApp to owner)
		if (cleanPath === '/api/notify' && request.method === 'POST') {
			return await handleNotify(request, env);
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
 * POST /api/notify — Called from QRScannedView
 * Body: { qrId, message, scannerEmail }
 */
async function handleNotify(request: Request, env: Env): Promise<Response> {
	try {
		const body: { qrId?: string; message?: string; scannerEmail?: string } = await request.json();
		const { qrId, message, scannerEmail } = body;

		if (!qrId || !message) {
			return json({ error: 'qrId and message are required' }, 400);
		}

		console.log(`[Worker /api/notify] QR: ${qrId}, De: ${scannerEmail || 'anónimo'}`);

		// Fetch QR data via Firebase SDK
		const qrData = await getQRData(env, qrId);
		if (!qrData || !qrData.uid) {
			console.log(`[Worker] Error: QR ${qrId} no encontrado en BD.`);
			return json({ error: 'QR not found' }, 404);
		}

		// Fetch owner data via Firebase SDK
		const ownerData = await getUserData(env, qrData.uid);
		if (!ownerData || !ownerData.phone) {
			console.log(`[Worker] Error: Dueño ${qrData.uid} sin teléfono.`);
			return json({ error: 'Owner has no phone' }, 400);
		}

		// Prepare notification
		const ownerWhatsApp = ownerData.phone.replace('whatsapp:', '').replace('+', '');
		const scannerContact = scannerEmail || 'Anónimo';

		// Send via Meta API using template notif
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
						type: 'body',
						parameters: [
							{ type: 'text', text: String(ownerData.displayName || 'propietario') },
							{ type: 'text', text: String(scannerContact || 'Anónimo') },
							{ type: 'text', text: String(message || 'Sin mensaje') },
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

		if (!response.ok) {
			const result = await response.json();
			console.error('[Worker] Respuesta completa de Meta:', JSON.stringify(result));
			return json({ error: 'Meta API Error' }, 502);
		}

		console.log(`[Worker /api/notify] Notificación enviada al dueño.`);
		return json({ success: true });
	} catch (e: unknown) {
		console.error('[Worker /api/notify] Excepción:', e);
		return json({ error: 'Internal error' }, 500);
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

		const bodyText: string = message.text?.body || '';
		const senderPhone: string = message.from || '';

		if (!bodyText || !senderPhone) {
			return new Response('Missing data', { status: 200 });
		}

		// 2. Extract QR ID and optional message
		const idMatch = bodyText.match(/ID:\s*([A-Za-z0-9_-]+)/i);
		if (!idMatch || !idMatch[1]) {
			return new Response('OK', { status: 200 }); // Always 200 so Meta doesn't retry
		}

		const qrId = idMatch[1];
		const msgMatch = bodyText.match(/Mensaje:\s*([\s\S]*)/i);
		const customMessage = msgMatch && msgMatch[1] ? msgMatch[1].trim() : 'Sin mensaje adicional.';

		console.log(`[Worker] QR detectado: ${qrId} (De: ${senderPhone})`);

		// 3. Fetch QR Data via Firebase SDK
		const qrData = await getQRData(env, qrId);
		if (!qrData || !qrData.uid) {
			console.log(`[Worker] Error: QR ${qrId} no encontrado en BD.`);
			return new Response('QR not found', { status: 200 });
		}

		// 4. Fetch Owner Data via Firebase SDK
		const ownerData = await getUserData(env, qrData.uid);
		if (!ownerData || !ownerData.phone) {
			console.log(`[Worker] Error: Dueño ${qrData.uid} sin teléfono.`);
			return new Response('Owner missing phone', { status: 200 });
		}

		// 5. Prepare Notification
		const cleanScannerPhone = senderPhone.replace('+', '');
		const ownerWhatsApp = ownerData.phone.replace('whatsapp:', '').replace('+', '');

		// 6. Send via Meta API using template notif
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
						type: 'body',
						parameters: [
							{ type: 'text', text: String(ownerData.displayName || 'propietario') },
							{ type: 'text', text: String(cleanScannerPhone || 'Anónimo') },
							{ type: 'text', text: String(customMessage || 'Sin mensaje') },
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

		if (!response.ok) {
			const result = await response.json();
			console.error('[Worker] Respuesta completa de Meta:', JSON.stringify(result));
			return new Response('Meta API Error', { status: 200 });
		}

		console.log(`[Worker] Éxito: Notificación entregada al dueño.`);
		return new Response('OK', { status: 200 });
	} catch (e: unknown) {
		console.error('[Worker] Excepción en Webhook:', e);
		return new Response('Error', { status: 200 });
	}
}
