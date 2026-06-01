import { SignJWT, importPKCS8 } from 'jose';

interface Env {
	FIREBASE_PROJECT_ID: string;
	FIREBASE_CLIENT_EMAIL: string;
	FIREBASE_PRIVATE_KEY: string;
	WHATSAPP_PHONE_NUMBER_ID: string;
	WHATSAPP_VERIFY_TOKEN: string;
	WHATSAPP_ACCESS_TOKEN: string;
}

const CORS_HEADERS = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'POST, OPTIONS',
	'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

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

		return new Response(JSON.stringify({ error: 'Not found or method not allowed' }), {
			status: 404,
			headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
		});
	},
};

/**
 * Endpoint /api/notify — Called from QRScannedView
 * Receives { qrId, message, scannerEmail } and sends WhatsApp to the QR owner.
 */
async function handleNotify(request: Request, env: Env): Promise<Response> {
	try {
		const body: { qrId?: string; message?: string; scannerEmail?: string } = await request.json();
		const { qrId, message, scannerEmail } = body;

		if (!qrId || !message) {
			return new Response(JSON.stringify({ error: 'qrId and message are required' }), {
				status: 400,
				headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
			});
		}

		console.log(`[Worker /api/notify] QR: ${qrId}, De: ${scannerEmail || 'anónimo'}`);

		const accessToken = await getGoogleAccessToken(env);

		// Fetch QR data
		const qrData = await getFirestoreQR(env.FIREBASE_PROJECT_ID, accessToken, qrId);
		if (!qrData || !qrData.uid) {
			console.log(`[Worker] Error: QR ${qrId} no encontrado en BD.`);
			return new Response(JSON.stringify({ error: 'QR not found' }), {
				status: 404,
				headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
			});
		}

		// Fetch owner data
		const ownerData = await getFirestoreUser(env.FIREBASE_PROJECT_ID, accessToken, qrData.uid);
		if (!ownerData || !ownerData.phone) {
			console.log(`[Worker] Error: Dueño ${qrData.uid} sin teléfono.`);
			return new Response(JSON.stringify({ error: 'Owner has no phone' }), {
				status: 400,
				headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
			});
		}

		// Prepare notification
		const ownerWhatsApp = ownerData.phone.replace('whatsapp:', '').replace('+', '');
		const scannerContact = scannerEmail || 'Anónimo';

		const notificationText = `*Aviso de ubiqueme.com*\n\nHola ${ownerData.displayName || 'propietario'},\n\nAlguien escaneó su código QR *${qrData.name || 'Desconocido'}* y dejó este mensaje:\n\n_"${message}"_\n\n📧 Contacto del escáner: ${scannerContact}\n\n⚠️ _Interacción segura. Actúe con cuidado si responde._`;

		// Send via Meta API
		const url = `https://graph.facebook.com/v20.0/${env.WHATSAPP_PHONE_NUMBER_ID}/messages`;
		const payload = {
			messaging_product: 'whatsapp',
			recipient_type: 'individual',
			to: ownerWhatsApp,
			type: 'text',
			text: { preview_url: false, body: notificationText },
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
			const result: any = await response.json();
			console.error(`[Worker] Error Meta API:`, result.error?.message || result);
			return new Response(JSON.stringify({ error: 'Meta API Error' }), {
				status: 502,
				headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
			});
		}

		console.log(`[Worker /api/notify] Notificación enviada al dueño.`);
		return new Response(JSON.stringify({ success: true }), {
			status: 200,
			headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
		});
	} catch (e: any) {
		console.error('[Worker /api/notify] Excepción:', e);
		return new Response(JSON.stringify({ error: 'Internal error' }), {
			status: 500,
			headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
		});
	}
}

/**
 * Endpoint for WhatsApp Webhook (Meta Cloud API Exclusive)
 */
async function handleWhatsAppWebhook(request: Request, env: Env): Promise<Response> {
	try {
		const json: any = await request.json();

		// 1. Extract Meta payload
		const message = json.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
		if (!message) return new Response('No message found', { status: 200 });

		const bodyText: string = message.text?.body || '';
		const senderPhone: string = message.from;

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

		const accessToken = await getGoogleAccessToken(env);

		// 3. Fetch QR Data
		const qrData = await getFirestoreQR(env.FIREBASE_PROJECT_ID, accessToken, qrId);
		if (!qrData || !qrData.uid) {
			console.log(`[Worker] Error: QR ${qrId} no encontrado en BD.`);
			return new Response('QR not found', { status: 200 });
		}

		// 4. Fetch Owner Data
		const ownerData = await getFirestoreUser(env.FIREBASE_PROJECT_ID, accessToken, qrData.uid);
		if (!ownerData || !ownerData.phone) {
			console.log(`[Worker] Error: Dueño ${qrData.uid} sin teléfono.`);
			return new Response('Owner missing phone', { status: 200 });
		}

		// 5. Prepare Notification
		const cleanScannerPhone = senderPhone.replace('+', '');
		const ownerWhatsApp = ownerData.phone.replace('whatsapp:', '').replace('+', '');

		const notificationText = `*Aviso de ubiqueme.com*\n\nHola ${ownerData.displayName || 'propietario'},\n\nEl número *${cleanScannerPhone}* escaneó su código QR *${qrData.name || 'Desconocido'}* y dejó este mensaje:\n\n_"${customMessage}"_\n\n⚠️ _Interacción segura. Actúe con cuidado si responde._`;

		// 6. Send via Meta API
		const url = `https://graph.facebook.com/v20.0/${env.WHATSAPP_PHONE_NUMBER_ID}/messages`;
		const payload = {
			messaging_product: 'whatsapp',
			recipient_type: 'individual',
			to: ownerWhatsApp,
			type: 'text',
			text: { preview_url: false, body: notificationText },
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
			const result: any = await response.json();
			console.error(`[Worker] Error Meta API:`, result.error?.message || result);
			return new Response('Meta API Error', { status: 200 });
		}

		console.log(`[Worker] Éxito: Notificación entregada al dueño.`);
		return new Response('OK', { status: 200 });
	} catch (e: any) {
		console.error('[Worker] Excepción en Webhook:', e);
		return new Response('Error', { status: 200 });
	}
}

/**
 * Helpers Root (Firebase)
 */
async function getGoogleAccessToken(env: Env) {
	const privateKey = await importPKCS8(env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'), 'RS256');
	const jwt = await new SignJWT({
		iss: env.FIREBASE_CLIENT_EMAIL,
		sub: env.FIREBASE_CLIENT_EMAIL,
		aud: 'https://oauth2.googleapis.com/token',
		scope: 'https://www.googleapis.com/auth/datastore',
	})
		.setProtectedHeader({ alg: 'RS256' })
		.setIssuedAt()
		.setExpirationTime('1h')
		.sign(privateKey);

	const res = await fetch('https://oauth2.googleapis.com/token', {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: jwt }),
	});

	const data: any = await res.json();
	if (!data.access_token) throw new Error('No admin token');
	return data.access_token;
}

async function getFirestoreUser(projectId: string, token: string, uid: string) {
	const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/users/${uid}`;
	const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
	if (res.status === 404) return null;
	const data: any = await res.json();
	const fields = data.fields || {};
	return {
		email: fields.email?.stringValue,
		displayName: fields.displayName?.stringValue || fields.name?.stringValue,
		phone: fields.phone?.stringValue, // <-- Añadido para sacar el teléfono
	};
}

async function getFirestoreQR(projectId: string, token: string, qrId: string) {
	const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/publicQR/${qrId}`;
	const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
	if (res.status === 404) return null;
	const data: any = await res.json();
	const fields = data.fields || {};
	return {
		uid: fields.uid?.stringValue,
		name: fields.name?.stringValue,
	};
}
