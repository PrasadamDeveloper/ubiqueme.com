import { Resend } from 'resend';
import { initializeApp, FirebaseOptions, FirebaseApp } from 'firebase/app';
import {
	getFirestore,
	Firestore,
	doc,
	getDoc,
	writeBatch,
	increment,
	Timestamp,
	collection,
	query,
	where,
	getDocs,
	deleteField,
} from 'firebase/firestore/lite';
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
					image?: { id?: string; mime_type?: string; caption?: string };
				}>;
			};
		}>;
	}>;
}

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
	RESEND_API_KEY: string;
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
	isPublic?: boolean;
}

interface UserData {
	email?: string;
	displayName?: string;
	phone?: string;
	trialActive?: boolean;
	trialEndsAt?: Timestamp;
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
		isPublic: data.isPublic,
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
		trialActive: data.trialActive,
		trialEndsAt: data.trialEndsAt,
	};
}

/**
 * Expires a user's trial and deactivates all their QRs.
 * Called when a scan is attempted but the trial has ended.
 */
async function expireUserTrial(env: Env, uid: string): Promise<void> {
	await ensureAuthenticated(env);
	const { db } = getFirebase(env);
	const now = Timestamp.now();

	const batch = writeBatch(db!);

	// 1. Update user document — mark trial as expired
	const userRef = doc(db!, 'users', uid);
	batch.update(userRef, {
		trialActive: false,
		isTrialUsed: true,
	});

	// 2. Find and deactivate the user's trial subscription
	const subsQuery = query(
		collection(db!, 'users', uid, 'subscriptions'),
		where('planType', '==', 'trial'),
		where('status', '==', 'active'),
	);
	const subsSnap = await getDocs(subsQuery);
	subsSnap.forEach((subDoc) => {
		const subRef = doc(db!, 'users', uid, 'subscriptions', subDoc.id);
		batch.update(subRef, {
			status: 'inactive',
			autoExpiredAt: now,
		});
	});

	// 3. Deactivate all QRs owned by this user
	const qrQuery = query(collection(db!, 'publicQR'), where('uid', '==', uid), where('status', '==', 'Active'));
	const qrSnap = await getDocs(qrQuery);
	qrSnap.forEach((qrDoc) => {
		const qrRef = doc(db!, 'publicQR', qrDoc.id);
		batch.update(qrRef, {
			status: 'Inactive',
			isPublic: false,
		});
	});

	await batch.commit();
	console.log(`[Worker] Trial expirado automáticamente para usuario ${uid}: ${subsSnap.size} sub(s), ${qrSnap.size} QR(s) desactivados.`);
}

/**
 * Checks if a user's trial has ended. If so, expires the trial and returns true.
 * Returns false if trial is still valid or not applicable.
 */
async function checkAndExpireTrial(env: Env, uid: string, ownerData: UserData): Promise<boolean> {
	if (ownerData.trialActive && ownerData.trialEndsAt) {
		const trialEndDate = ownerData.trialEndsAt.toDate();
		if (trialEndDate < new Date()) {
			console.log(`[Worker] Trial expirado detectado para usuario ${uid}. Ejecutando expireUserTrial...`);
			await expireUserTrial(env, uid);
			return true;
		}
	}
	return false;
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

// ─── ArrayBuffer to base64 (chunked to avoid stack overflow) ────
function arrayBufferToBase64(buffer: ArrayBuffer): string {
	const bytes = new Uint8Array(buffer);
	let binary = '';
	const chunkSize = 8192;
	for (let i = 0; i < bytes.length; i += chunkSize) {
		binary += String.fromCharCode(...bytes.slice(i, i + chunkSize));
	}
	return btoa(binary);
}

// ─── WhatsApp API helpers ────────────────────────────────────────
const MESSAGES_URL = (env: Env) => `https://graph.facebook.com/v20.0/${env.WHATSAPP_PHONE_NUMBER_ID}/messages`;

function metaHeaders(env: Env): Record<string, string> {
	return {
		Authorization: `Bearer ${env.WHATSAPP_ACCESS_TOKEN}`,
		'Content-Type': 'application/json',
	};
}

const FORMAT_INSTRUCTION_TEXT =
	'❌ Formato incorrecto\n\nPara notificar al propietario, envía el mensaje EXACTAMENTE como aparece al escanear el QR:\n\nID: [código del QR]\nQR: [nombre del objeto]\nMensaje: [tu mensaje]\n\nEjemplo:\nID: abc123\nQR: Mochila negra\nMensaje: Encontré tu mochila, contáctame por favor\n\nGracias por usar Ubiqueme';

async function sendFormatInstruction(env: Env, to: string): Promise<void> {
	await fetch(MESSAGES_URL(env), {
		method: 'POST',
		headers: metaHeaders(env),
		body: JSON.stringify({
			messaging_product: 'whatsapp',
			recipient_type: 'individual',
			to,
			type: 'text',
			text: { body: FORMAT_INSTRUCTION_TEXT },
		}),
	});
}

async function sendOwnerNotification(
	env: Env,
	to: string,
	displayName: string,
	scannerPhone: string,
	message: string,
	qrName: string,
	scanTime: string,
): Promise<boolean> {
	const payload = {
		messaging_product: 'whatsapp',
		recipient_type: 'individual',
		to,
		type: 'template',
		template: {
			name: 'notif',
			language: { code: 'es' },
			components: [
				{
					type: 'header',
					parameters: [{ type: 'image', image: { link: HEADER_IMAGE_URL } }],
				},
				{
					type: 'body',
					parameters: [
						{ type: 'text', text: displayName },
						{ type: 'text', text: scannerPhone },
						{ type: 'text', text: message },
						{ type: 'text', text: qrName },
						{ type: 'text', text: scanTime },
					],
				},
				{
					type: 'button',
					sub_type: 'url',
					index: 0,
					parameters: [{ type: 'text', text: encodeURIComponent(qrName) }],
				},
			],
		},
	};
	const response = await fetch(MESSAGES_URL(env), {
		method: 'POST',
		headers: metaHeaders(env),
		body: JSON.stringify(payload),
	});
	const result = (await response.json()) as { messages?: Array<{ id: string }>; error?: { message: string } };
	console.log(`[Worker] Meta response status: ${response.status}, body: ${JSON.stringify(result)}`);
	return response.ok;
}

async function sendScannerConfirmation(env: Env, to: string, qrName: string): Promise<void> {
	const payload = {
		messaging_product: 'whatsapp',
		recipient_type: 'individual',
		to,
		type: 'text',
		text: {
			body: `Notificación enviada exitosamente\n\nSu mensaje ha sido recibido y enviado al propietario de "${qrName}". Él podrá ver su información de contacto y responderle directamente.\n\nAgradecemos mucho que haya utilizado los servicios de Ubiqueme para facilitar esta conexión.\n\nSi desea proteger sus pertenencias, familia, hogar y más, visítenos en:\nhttps://ubiqueme.com\n\nNo espere a perder algo para protegerlo — _únase a los miles que ya confían en nosotros para proteger lo que más les importa._\n\n_-ubiqueme_`,
		},
	};
	await fetch(MESSAGES_URL(env), {
		method: 'POST',
		headers: metaHeaders(env),
		body: JSON.stringify(payload),
	});
}

async function sendQRInactiveReply(env: Env, to: string, message: string): Promise<void> {
	await fetch(MESSAGES_URL(env), {
		method: 'POST',
		headers: metaHeaders(env),
		body: JSON.stringify({
			messaging_product: 'whatsapp',
			recipient_type: 'individual',
			to,
			type: 'text',
			text: { body: message },
		}),
	});
}

// ─── Resend scan copy email (only for ubiqueme.services@gmail.com) ──
const SCAN_EMAIL_WRAPPER = (content: string) =>
	`<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  body{margin:0;padding:0;background-color:#f5f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif}
  .container{max-width:580px;margin:0 auto;padding:40px 20px}
  .card{background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.04),0 4px 16px rgba(0,0,0,0.06)}
  .header{padding:28px 32px 20px;text-align:center;background:#ffffff}
  .header-logo{font-size:26px;font-weight:800;color:#1a1a1a;letter-spacing:-0.8px;text-decoration:none}
  .header-logo .hl-orange{color:#ff7900}
  .header-divider{height:1px;background:linear-gradient(to right,transparent,#e0e0e0,transparent);margin:0 32px}
  .body{padding:28px 32px 24px;color:#1a1a1a;font-size:15px;line-height:1.6}
  .badge{display:inline-block;padding:5px 14px;border-radius:100px;background:#fff7ed;border:1px solid #ffd9a3;color:#c25e00;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1.8px;margin-bottom:18px}
  .qr-title{font-size:20px;font-weight:700;color:#1a1a1a;margin:0 0 20px;letter-spacing:-0.4px}
  .fields-table{width:100%;border-collapse:collapse;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #ececec}
  .fields-table td{padding:13px 16px;font-size:14px;border-bottom:1px solid #f0f0f0;vertical-align:top}
  .fields-table tr:last-child td{border-bottom:none}
  .fields-table .fl{color:#888;font-weight:500;width:38%;background:#fafafa}
  .fields-table .fv{color:#1a1a1a;font-weight:600;width:62%}
  .image-wrap{margin-top:20px;border-radius:14px;overflow:hidden;border:1px solid #ececec}
  .image-wrap img{display:block;max-width:100%;height:auto}
  .image-label{display:flex;align-items:center;gap:6px;padding:10px 16px;background:#fafafa;font-size:12px;color:#888;font-weight:600;text-transform:uppercase;letter-spacing:1px;border-bottom:1px solid #ececec}
  .footer{padding:24px 32px 28px;background:#fafafa;text-align:center}
  .footer-text{font-size:12px;color:#aaa;line-height:1.6;margin:0}
  .footer-text strong{color:#888}
</style>
</head>
<body>
<div class="container">
  <div class="card">
    <div class="header"><span class="header-logo">ubiqueme<span class="hl-orange">.com</span></span></div>
    <div class="header-divider"></div>
    <div class="body">${content}</div>
    <div class="footer">
      <p class="footer-text">Este es un correo automático enviado por el sistema de escaneo de Ubiqueme. No es necesario responder a este mensaje.<br><br><strong>ubiqueme</strong> &mdash; Protege lo que más te importa.</p>
      <p class="footer-text" style="margin-top:14px">&copy; 2026 Ubiqueme. Todos los derechos reservados.</p>
    </div>
  </div>
</div>
</body>
</html>`.trim();

async function sendScanEmail(
	env: Env,
	ownerEmail: string,
	qrName: string,
	scannerPhone: string,
	customMessage: string,
	scanTime: string,
	displayName: string,
	imageBase64?: string,
	imageMimeType?: string,
): Promise<void> {
	try {
		const rows = [
			{ label: 'Objeto', value: qrName },
			{ label: 'Teléfono del escáner', value: scannerPhone },
			{ label: 'Mensaje', value: customMessage },
			{ label: 'Hora del escaneo', value: scanTime },
			{ label: 'Propietario', value: displayName },
		];

		const fieldsHtml = rows.map((r) => `<tr><td class="fl">${r.label}</td><td class="fv">${r.value}</td></tr>`).join('');

		const hasImage = !!imageBase64 && !!imageMimeType;
		const imgHtml = hasImage
			? `<div class="image-wrap"><div class="image-label">Imagen del escaneo</div><img src="cid:scan-image" alt="Imagen del escaneo" /></div>`
			: '';

		const content = `
      <span class="badge">Nuevo escaneo QR</span>
      <h1 class="qr-title">${qrName}</h1>
      <table class="fields-table" cellpadding="0" cellspacing="0">${fieldsHtml}</table>
      ${imgHtml}`;

		const emailPayload: {
			from: string;
			to: string[];
			subject: string;
			html: string;
			attachments?: Array<{ filename: string; content: string; content_id: string; disposition: 'inline' }>;
		} = {
			from: 'Ubiqueme <scan@ubiqueme.com>',
			to: [ownerEmail],
			subject: `Nuevo escaneo QR — ${qrName}`,
			html: SCAN_EMAIL_WRAPPER(content),
		};

		if (hasImage) {
			emailPayload.attachments = [
				{
					filename: 'scan-image',
					content: imageBase64!,
					content_id: 'scan-image',
					disposition: 'inline',
				},
			];
		}

		const resend = new Resend(env.RESEND_API_KEY);
		await resend.emails.send(emailPayload);
		console.log(`[Worker] Scan email enviado a ${ownerEmail} para QR ${qrName}`);
	} catch (error) {
		console.error('[Worker] Error enviando scan email:', error);
	}
}

// ─── SHA-256 helper (native Workers crypto) ─────────────────────
async function sha256Hex(input: string): Promise<string> {
	const encoder = new TextEncoder();
	const data = encoder.encode(input);
	const hashBuffer = await crypto.subtle.digest('SHA-256', data);
	const hashArray = Array.from(new Uint8Array(hashBuffer));
	return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

function generateOtpCode(): string {
	return String(100000 + Math.floor(Math.random() * 900000));
}

function generateSalt(): string {
	const bytes = new Uint8Array(32);
	crypto.getRandomValues(bytes);
	return Array.from(bytes)
		.map((b) => b.toString(16).padStart(2, '0'))
		.join('');
}

// ─── Caption/text parsing ────────────────────────────────────────
interface ParsedScanData {
	qrId: string;
	qrName: string;
	scanTime: string;
	customMessage: string;
}

function parseScanFields(text: string): ParsedScanData {
	const idMatch = text.match(/ID:\s*([A-Za-z0-9_-]+)/i);
	const qrNameMatch = text.match(/QR:\s*(.+)/i);
	const timeMatch = text.match(/Hora:\s*(.+)/i);
	const msgMatch = text.match(/Mensaje:\s*([\s\S]*)/i);
	return {
		qrId: idMatch![1],
		qrName: qrNameMatch && qrNameMatch[1] ? qrNameMatch[1].trim() : 'objeto',
		scanTime:
			timeMatch && timeMatch[1]
				? timeMatch[1].trim()
				: new Date().toLocaleString('es-MX', { timeZone: 'America/Mexico_City' }) +
					' (hora CDMX) • ' +
					new Date().toISOString().replace('T', ' ').replace('Z', '') +
					' UTC',
		customMessage: msgMatch && msgMatch[1] ? msgMatch[1].trim() : 'Sin mensaje adicional.',
	};
}

// ─── Main handler ───────────────────────────────────────────────
export default {
	async fetch(request: Request, env: Env, _ctx: ExecutionContext): Promise<Response> {
		const url = new URL(request.url);

		// Handle CORS preflight
		if (request.method === 'OPTIONS') {
			return new Response(null, { headers: CORS_HEADERS });
		}

		// ─── POST /api/send-otp ──────────────────────────────────
		if (url.pathname === '/api/send-otp' && request.method === 'POST') {
			return handleSendOtp(request, env);
		}

		// ─── POST /api/verify-otp ────────────────────────────────
		if (url.pathname === '/api/verify-otp' && request.method === 'POST') {
			return handleVerifyOtp(request, env);
		}

		// ───POST /api/cancel-otp
		if (url.pathname === '/api/cancel-otp' && request.method === 'POST') {
			return handleCancelOTPCode(env, request);
		}

		// Webhook routing (Exclusively for Meta)
		if (url.pathname.replace(/\/$/, '') === '/api/whatsapp') {
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

		return new Response(JSON.stringify({ error: 'Not found or method not allowed' }), {
			status: 404,
			headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
		});
	},
};

/**
 * Handles an image WITH caption containing QR ID.
 * Downloads the image, parses the caption for QR data, notifies the owner,
 * and logs the scan with the image in Firestore.
 */
async function handleImageWithCaption(
	env: Env,
	mediaId: string,
	senderPhone: string,
	caption: string,
	mimeType?: string,
): Promise<Response> {
	try {
		console.log(`[Worker] Imagen con caption recibida de ${senderPhone}, media_id: ${mediaId}`);

		// 1. Download the image
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
		const imageResponse = await fetch(imageUrl, {
			headers: { Authorization: `Bearer ${env.WHATSAPP_ACCESS_TOKEN}` },
		});
		if (!imageResponse.ok) {
			console.error('[Worker] Error descargando imagen:', imageResponse.status);
			return new Response('Image download failed', { status: 200 });
		}
		const imageBuffer = await imageResponse.arrayBuffer();
		const imgMimeType = mimeType || mediaData.mime_type || 'image/jpeg';
		const base64 = arrayBufferToBase64(imageBuffer);
		const dataUrl = `data:${imgMimeType};base64,${base64}`;

		// 2. Extract QR data from caption
		const parsed = parseScanFields(caption);
		console.log(`[Worker] QR detectado en caption: ${parsed.qrId} (De: ${senderPhone})`);

		// 3. Fetch QR Data via Firebase SDK
		const qrData = await getQRData(env, parsed.qrId);
		if (!qrData || !qrData.uid) {
			console.log(`[Worker] Error: QR ${parsed.qrId} no encontrado en BD.`);
			return new Response('QR not found', { status: 200 });
		}
		if (qrData.status !== 'Active' || qrData.isPublic === false) {
			console.log(`[Worker] QR ${parsed.qrId} inactivo (status: ${qrData.status}, isPublic: ${qrData.isPublic}).`);
			await sendQRInactiveReply(env, senderPhone, 'Este código QR ya no está activo, intentelo de nuevo más tarde.');
			return new Response('QR inactive', { status: 200 });
		}

		// 4. Fetch Owner Data via Firebase SDK
		const ownerData = await getUserData(env, qrData.uid);
		if (!ownerData || !ownerData.phone) {
			console.log(`[Worker] Error: Dueño ${qrData.uid} sin teléfono.`);
			return new Response('Owner missing phone', { status: 200 });
		}

		// 4a. Check if owner's trial has expired — if so, expire it and deny the scan
		const trialExpired = await checkAndExpireTrial(env, qrData.uid, ownerData);
		if (trialExpired) {
			await sendQRInactiveReply(env, senderPhone, 'Este código QR ha expirado. El periodo de prueba del propietario ha finalizado.');
			return new Response('Trial expired', { status: 200 });
		}

		// 5. Log scan to Firestore WITH the image included
		await logScan(env, parsed.qrId, {
			scanDate: Timestamp.now(),
			scanMetrics: { country: '', city: '', region: '' },
			interaction: { type: 'whatsapp_scan', message: parsed.customMessage },
			img: dataUrl,
			scannerPhone: senderPhone,
		});

		// 6. Notify the owner
		const cleanScannerPhone = senderPhone.replace('+', '');
		const ownerWhatsApp = ownerData.phone.replace('whatsapp:', '').replace('+', '');
		const qrNameParam = qrData.name || parsed.qrName || 'objeto';
		const notified = await sendOwnerNotification(
			env,
			ownerWhatsApp,
			String(ownerData.displayName || 'propietario'),
			String(cleanScannerPhone),
			String(parsed.customMessage),
			String(qrNameParam),
			String(parsed.scanTime),
		);
		if (!notified) {
			console.error('[Worker] Meta API error — notification NOT sent to owner.');
			return new Response('Meta API Error', { status: 200 });
		}

		// 6a. If owner email is ubiqueme.services@gmail.com, send a copy via Resend
		if (ownerData.email === 'ubiqueme.services@gmail.com') {
			await sendScanEmail(
				env,
				ownerData.email,
				qrNameParam,
				cleanScannerPhone,
				parsed.customMessage,
				parsed.scanTime,
				ownerData.displayName || 'propietario',
				base64, // raw base64 (without prefix)
				imgMimeType, // e.g. "image/jpeg"
			);
		}

		// 7. Send scanner confirmation reply
		await sendScannerConfirmation(env, senderPhone, qrData.name?.trim() || parsed.qrName || 'objeto');
		console.log(`[Worker] Confirmación enviada al scanner ${senderPhone}.`);

		return new Response('OK', { status: 200 });
	} catch (e: unknown) {
		console.error('[Worker] Excepción en handleImageWithCaption:', e);
		return new Response('Error', { status: 200 });
	}
}

/**
 * POST /api/whatsapp — Incoming webhook from Meta
 */
// ─── OTP helpers ────────────────────────────────────────────────
async function sendOtpWhatsApp(env: Env, to: string, code: string): Promise<boolean> {
	const payload = {
		messaging_product: 'whatsapp',
		recipient_type: 'individual',
		to,
		type: 'template',
		template: {
			name: 'verify_otp',
			language: { code: 'es' },
			components: [
				{
					type: 'body',
					parameters: [{ type: 'text', text: code }],
				},
				{
					type: 'button',
					sub_type: 'url',
					index: 0,
					parameters: [{ type: 'text', text: code }],
				},
			],
		},
	};
	const response = await fetch(MESSAGES_URL(env), {
		method: 'POST',
		headers: metaHeaders(env),
		body: JSON.stringify(payload),
	});
	const result = (await response.json()) as { messages?: Array<{ id: string }>; error?: { message: string } };
	console.log(`[Worker] sendOtpWhatsApp status: ${response.status}, body: ${JSON.stringify(result)}`);
	return response.ok;
}

/**
 * POST /api/send-otp
 * Generates a 6-digit code, stores SHA-256 hash in Firestore, sends via WhatsApp template.
 */
async function handleSendOtp(request: Request, env: Env): Promise<Response> {
	try {
		const { uid, phone } = (await request.json()) as { uid?: string; phone?: string };
		if (!uid || !phone) {
			return new Response(JSON.stringify({ error: 'uid and phone are required' }), {
				status: 400,
				headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
			});
		}

		await ensureAuthenticated(env);
		const { db } = getFirebase(env);
		const userRef = doc(db!, 'users', uid);
		const userSnap = await getDoc(userRef);
		if (!userSnap.exists()) {
			return new Response(JSON.stringify({ error: 'User not found' }), {
				status: 404,
				headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
			});
		}

		const userData = userSnap.data();

		//Check if user is spamming and preventing spam
		if (userData.totalOtpAttempts == 10) {
			return new Response(
				JSON.stringify({
					error: 'Attempts limit reached',
				}),
				{
					status: 401,
					headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
				},
			);
		}

		// Rate limit: check if a recent OTP was sent (within last 60s)
		const otpExpiresAt = userData.otpExpiresAt?.toDate?.();
		if (otpExpiresAt && otpExpiresAt > new Date()) {
			// An OTP is still pending — allow resend only if more than 60s have passed since last sent
			const otpSentAt = userData.otpSentAt?.toDate?.();
			if (otpSentAt && Date.now() - otpSentAt.getTime() < 60_000) {
				return new Response(JSON.stringify({ error: 'Wait 60 seconds before requesting a new code' }), {
					status: 429,
					headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
				});
			}
		}

		// Generate code, salt, hash
		const code = generateOtpCode();
		const salt = generateSalt();
		const hash = await sha256Hex(code + salt);

		// Store pendingPhone + OTP data in Firestore (DO NOT set phone yet)
		const now = Timestamp.now();
		const expiresAt = Timestamp.fromMillis(now.toMillis() + 10 * 60 * 1000); // 10 min
		const batch = writeBatch(db!);
		batch.update(userRef, {
			pendingPhone: phone,
			otpHash: hash,
			otpSalt: salt,
			otpExpiresAt: expiresAt,
			otpAttempts: 0,
			otpSentAt: now,
			totalOtpAttempts: increment(1),
		});
		await batch.commit();
		console.log(`[Worker] OTP stored for uid ${uid}, expires at ${expiresAt.toDate().toISOString()}`);

		// Send via WhatsApp
		const cleanPhone = phone.replace('whatsapp:', '').replace('+', '');
		const sent = await sendOtpWhatsApp(env, cleanPhone, code);
		if (!sent) {
			console.error('[Worker] Failed to send OTP WhatsApp to', cleanPhone);
			return new Response(JSON.stringify({ error: 'Failed to send OTP via WhatsApp' }), {
				status: 500,
				headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
			});
		}

		return new Response(JSON.stringify({ success: true }), {
			status: 200,
			headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
		});
	} catch (e: unknown) {
		console.error('[Worker] Excepción en handleSendOtp:', e);
		return new Response(JSON.stringify({ error: 'Internal error' }), {
			status: 500,
			headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
		});
	}
}

/**
 * POST /api/verify-otp
 * Validates the submitted code against stored hash, marks phone as verified on success.
 */
async function handleVerifyOtp(request: Request, env: Env): Promise<Response> {
	try {
		const { uid, code } = (await request.json()) as { uid?: string; code?: string };
		if (!uid || !code) {
			return new Response(JSON.stringify({ error: 'uid and code are required' }), {
				status: 400,
				headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
			});
		}

		await ensureAuthenticated(env);
		const { db } = getFirebase(env);
		const userRef = doc(db!, 'users', uid);
		const userSnap = await getDoc(userRef);
		if (!userSnap.exists()) {
			return new Response(JSON.stringify({ error: 'User not found' }), {
				status: 404,
				headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
			});
		}

		const userData = userSnap.data();
		const otpHash: string | undefined = userData.otpHash;
		const otpSalt: string | undefined = userData.otpSalt;
		const otpExpiresAt: Timestamp | undefined = userData.otpExpiresAt;
		const otpAttempts: number | undefined = userData.otpAttempts;
		const pendingPhone: string | undefined = userData.pendingPhone;

		if (!otpHash || !otpSalt || !otpExpiresAt) {
			return new Response(JSON.stringify({ error: 'No OTP pending' }), {
				status: 400,
				headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
			});
		}

		if (!pendingPhone) {
			return new Response(JSON.stringify({ error: 'No pending phone to verify' }), {
				status: 400,
				headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
			});
		}

		// Check expiration
		if (otpExpiresAt.toDate() < new Date()) {
			return new Response(JSON.stringify({ error: 'Code expired' }), {
				status: 400,
				headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
			});
		}

		// Check attempt limit
		if ((otpAttempts ?? 0) >= 3) {
			return new Response(JSON.stringify({ error: 'Too many attempts, request a new code' }), {
				status: 400,
				headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
			});
		}

		// Compare hash
		const attemptedHash = await sha256Hex(code + otpSalt);
		if (attemptedHash !== otpHash) {
			const newAttempts = (otpAttempts ?? 0) + 1;
			const batch = writeBatch(db!);
			batch.update(userRef, { otpAttempts: newAttempts });
			// If this was the 3rd attempt, also clear the hash so it can't be tried again
			if (newAttempts >= 3) {
				batch.update(userRef, {
					otpHash: deleteField(),
					otpSalt: deleteField(),
					otpExpiresAt: deleteField(),
				});
			}
			await batch.commit();
			console.log(`[Worker] OTP invalid for uid ${uid}, attempt ${newAttempts}/3`);
			return new Response(JSON.stringify({ error: 'Invalid code' }), {
				status: 400,
				headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
			});
		}

		// Success — move pendingPhone to phone, mark as verified, clean up OTP + pending fields
		const successBatch = writeBatch(db!);
		successBatch.update(userRef, {
			phone: pendingPhone,
			phoneVerified: true,
			pendingPhone: deleteField(),
			otpHash: deleteField(),
			otpSalt: deleteField(),
			otpExpiresAt: deleteField(),
			otpAttempts: deleteField(),
			otpSentAt: deleteField(),
			totalOtpAttempts: deleteField(),
		});
		await successBatch.commit();
		console.log(`[Worker] Phone verified for uid ${uid}: ${pendingPhone}`);

		return new Response(JSON.stringify({ success: true, phoneVerified: true }), {
			status: 200,
			headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
		});
	} catch (e: unknown) {
		console.error('[Worker] Excepción en handleVerifyOtp:', e);
		return new Response(JSON.stringify({ error: 'Internal error' }), {
			status: 500,
			headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
		});
	}
}

//Cancel OTP (when user clicks on 'wrong number button')
async function handleCancelOTPCode(env: Env, request: Request) {
	try {
		const { uid } = (await request.json()) as { uid?: string };
		if (!uid) {
			return new Response(JSON.stringify({ error: 'uid is required' }), {
				status: 400,
				headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
			});
		}
		await ensureAuthenticated(env);
		const { db } = getFirebase(env);

		const batch = writeBatch(db!);
		const userRef = doc(db!, `users/${uid}`);
		batch.update(userRef, {
			pendingPhone: deleteField(),
			otpHash: deleteField(),
			otpSalt: deleteField(),
			otpExpiresAt: deleteField(),
			otpAttempts: deleteField(),
			otpSentAt: deleteField(),
		});
		await batch.commit();
		return new Response(JSON.stringify({ success: true }), {
			status: 200,
			headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
		});
	} catch (error) {
		console.log(`Internal Error: ${error}`);
		return new Response(JSON.stringify({ error: 'Internal error' }), {
			status: 500,
			headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
		});
	}
}

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

		// 1b. Reject unsupported message types (video, audio, document, sticker, etc.)
		const SUPPORTED_TYPES = ['text', 'image'];
		if (!SUPPORTED_TYPES.includes(message.type || '')) {
			console.log(`[Worker] Tipo no soportado ignorado: ${message.type}`);
			return new Response('OK', { status: 200 });
		}

		// 1c. Branch: image with caption containing QR ID
		if (message.type === 'image' && message.image?.id) {
			const caption = message.image.caption || '';
			const idMatch = caption.match(/ID:\s*([A-Za-z0-9_-]+)/i);
			if (idMatch && idMatch[1]) {
				return await handleImageWithCaption(env, message.image.id, senderPhone, caption, message.image.mime_type);
			}
			// Image without caption or without QR ID → send instructive reply
			await sendFormatInstruction(env, senderPhone);
			console.log(`[Worker] Imagen sin caption válido, se instruyó al usuario ${senderPhone}`);
			return new Response('OK', { status: 200 });
		}

		// ─── TEXT MESSAGE FLOW ──────────────────────────────────
		const bodyText: string = message.text?.body || '';
		if (!bodyText) {
			return new Response('No text body', { status: 200 });
		}

		// 2. Extract QR ID and optional fields
		const idMatch = bodyText.match(/ID:\s*([A-Za-z0-9_-]+)/i);
		if (!idMatch || !idMatch[1]) {
			await sendFormatInstruction(env, senderPhone);
			console.log(`[Worker] Formato incorrecto, se instruyó al usuario ${senderPhone}`);
			return new Response('OK', { status: 200 });
		}

		const parsed = parseScanFields(bodyText);
		console.log(`[Worker] QR detectado: ${parsed.qrId} (De: ${senderPhone})`);

		// 3. Fetch QR Data via Firebase SDK
		const qrData = await getQRData(env, parsed.qrId);
		if (!qrData || !qrData.uid) {
			console.log(`[Worker] Error: QR ${parsed.qrId} no encontrado en BD.`);
			return new Response('QR not found', { status: 200 });
		}

		// 3b. Validate QR status and isPublic flag
		if (qrData.status !== 'Active' || qrData.isPublic === false) {
			console.log(`[Worker] QR ${parsed.qrId} inactivo (status: ${qrData.status}, isPublic: ${qrData.isPublic}). Respondiendo al scanner.`);
			await sendQRInactiveReply(env, senderPhone, 'Este código QR ya no está activo. El propietario lo ha desactivado.');
			return new Response('QR inactive', { status: 200 });
		}

		// 4. Fetch Owner Data via Firebase SDK
		const ownerData = await getUserData(env, qrData.uid);
		if (!ownerData || !ownerData.phone) {
			console.log(`[Worker] Error: Dueño ${qrData.uid} sin teléfono.`);
			return new Response('Owner missing phone', { status: 200 });
		}

		// 4a. Check if owner's trial has expired — if so, expire it and deny the scan
		const trialExpired = await checkAndExpireTrial(env, qrData.uid, ownerData);
		if (trialExpired) {
			await sendQRInactiveReply(env, senderPhone, 'Este código QR ha expirado. El periodo de prueba del propietario ha finalizado.');
			return new Response('Trial expired', { status: 200 });
		}

		// 4b. Log scan to Firestore BEFORE sending notification
		await logScan(env, parsed.qrId, {
			scanDate: Timestamp.now(),
			scanMetrics: { country: '', city: '', region: '' },
			interaction: { type: 'whatsapp_scan', message: parsed.customMessage },
			scannerPhone: senderPhone,
			// No image in text flow, but we keep the field for consistency in logs
			img: null,
		});

		// 5. Prepare Notification
		const cleanScannerPhone = senderPhone.replace('+', '');
		const ownerWhatsApp = ownerData.phone.replace('whatsapp:', '').replace('+', '');
		const qrNameParam = qrData.name || parsed.qrName || 'objeto';

		console.log(`[Worker] Owner WhatsApp (after clean): "${ownerWhatsApp}" (raw: "${ownerData.phone}")`);

		// 6. Send via Meta API using template
		const notified = await sendOwnerNotification(
			env,
			ownerWhatsApp,
			String(ownerData.displayName || 'propietario'),
			String(cleanScannerPhone),
			String(parsed.customMessage || 'Sin mensaje'),
			String(qrNameParam),
			String(parsed.scanTime),
		);
		if (!notified) {
			console.error('[Worker] Meta API error — notification NOT sent to owner.');
			return new Response('Meta API Error', { status: 200 });
		}

		const msgStatus = 'ACEPTADO por Meta (message_id presente)';
		console.log(`[Worker] Notificación al dueño: ${msgStatus}.`);

		// 6a. If owner email is ubiqueme.services@gmail.com, send a copy via Resend (text flow, no image)
		if (ownerData.email === 'ubiqueme.services@gmail.com') {
			await sendScanEmail(
				env,
				ownerData.email,
				qrNameParam,
				cleanScannerPhone,
				parsed.customMessage || 'Sin mensaje',
				parsed.scanTime,
				ownerData.displayName || 'propietario',
				// No imageUrl in text flow
			);
		}

		// 7. Send scanner confirmation reply
		await sendScannerConfirmation(env, senderPhone, qrData.name || parsed.qrName || 'objeto');
		console.log(`[Worker] Confirmación enviada al scanner ${senderPhone}.`);

		return new Response('OK', { status: 200 });
	} catch (e: unknown) {
		console.error('[Worker] Excepción en Webhook:', e);
		return new Response('Error', { status: 200 });
	}
}
