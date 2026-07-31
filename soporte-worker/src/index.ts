import { EmailMessage } from 'cloudflare:email';
import { Resend } from 'resend';
import { initializeApp, FirebaseOptions, FirebaseApp } from 'firebase/app';
import {
	getFirestore,
	Firestore,
	doc,
	getDoc,
	getDocs,
	collection,
	query,
	where,
	addDoc,
	writeBatch,
	deleteDoc,
	runTransaction,
	Timestamp,
	type DocumentReference,
} from 'firebase/firestore/lite';
import { getAuth, Auth, signInWithEmailAndPassword } from 'firebase/auth';
import { SignJWT, importPKCS8 } from 'jose';

// Extend Env with secrets
declare global {
	interface Env {
		RESEND_API_KEY: string;
		FIREBASE_PROJECT_ID: string;
		FIREBASE_API_KEY: string;
		FIREBASE_AUTH_EMAIL: string;
		FIREBASE_AUTH_PASSWORD: string;
		FIREBASE_CLIENT_EMAIL: string;
		FIREBASE_PRIVATE_KEY: string;
	}
}

// ─── Email templates ─────────────────────────────────────────────
const EMAIL_HEADER = `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#ffffff">
  <tr>
    <td align="center" style="padding:24px;border-bottom:1px solid #e4e4e7">
      <span style="color:#111111;font-size:22px;font-weight:800;letter-spacing:-0.5px">ubiqueme</span>
      <span style="color:#ff7900;font-size:22px;font-weight:800">.com</span>
    </td>
  </tr>
</table>`.trim();

const EMAIL_FOOTER = `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#ffffff">
  <tr>
    <td align="center" style="padding:32px 24px;border-top:1px solid #e4e4e7;font-size:11px;color:#999999;line-height:1.6">
      &copy; 2026 Ubiqueme. Todos los derechos reservados.<br>
      Este es un correo autom&aacute;tico, por favor no responda directamente.
    </td>
  </tr>
</table>`.trim();

const EMAIL_WRAPPER = (content: string) =>
	`<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
</head>
<body bgcolor="#f4f4f5" style="margin:0;padding:0;background:#f4f4f5">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#f4f4f5" style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  <tr>
    <td align="center" style="padding:32px 16px">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#ffffff" style="max-width:560px;border-radius:16px;border:1px solid #e4e4e7">
        <tr><td style="border-radius:16px 16px 0 0;overflow:hidden">${EMAIL_HEADER}</td></tr>
        <tr><td style="padding:32px 28px;color:#111111;font-size:14px;line-height:1.7">${content}</td></tr>
        <tr><td style="border-radius:0 0 16px 16px;overflow:hidden">${EMAIL_FOOTER}</td></tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>`.trim();

// ─── Auto-response template for incoming emails ────────────────
const AUTO_REPLY_HTML = `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%">
  <tr>
    <td align="center" style="padding-bottom:8px">
      <span style="display:inline-block;width:56px;height:56px;border-radius:16px;background:#fff7ed;border:1px solid #ffedd5;line-height:56px;text-align:center;font-size:28px">&#x1F4EC;</span>
    </td>
  </tr>
  <tr>
    <td align="center" style="padding-bottom:16px">
      <h1 style="margin:0;font-size:22px;color:#111111;font-weight:800;letter-spacing:-0.3px">Hemos recibido su mensaje</h1>
    </td>
  </tr>
  <tr>
    <td align="center" style="padding-bottom:6px;font-size:14px;color:#666666;line-height:1.7;max-width:420px;margin:0 auto">
      Gracias por contactar al equipo de <strong style="color:#111111">Ubiqueme</strong>.
    </td>
  </tr>
  <tr>
    <td align="center" style="padding-bottom:20px;font-size:14px;color:#666666;line-height:1.7;max-width:420px;margin:0 auto">
      Hemos recibido su mensaje y lo estamos revisando. Le responderemos a la brevedad posible.
    </td>
  </tr>
  <tr>
    <td style="padding:20px;background:#fafafa;border-radius:12px;border:1px solid #e4e4e7">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="font-size:13px;color:#666666;line-height:1.7">
            <strong>Horarios de atenci&oacute;n:</strong><br>
            Lunes a viernes de 9:00 a 18:00 (Centro de M&eacute;xico).<br><br>
            Intentaremos responderle en un m&aacute;ximo de 24 a 48 horas h&aacute;biles.
          </td>
        </tr>
        <tr>
          <td style="padding-top:12px;font-size:12px;color:#999999;line-height:1.6">
            Si su consulta es urgente, puede responder a este correo para darle seguimiento.
          </td>
        </tr>
      </table>
    </td>
  </tr>
  <tr>
    <td align="center" style="padding-top:20px;font-size:14px;color:#111111;font-weight:500;letter-spacing:-0.2px">
      &mdash; Equipo Ubiqueme
    </td>
  </tr>
</table>`.trim();

// ─── New notification template for the support team ─────────────
const NOTIF_HTML = (fromEmail: string, subject: string, body: string) =>
	`
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%">
  <tr>
    <td style="padding-bottom:20px">
      <span style="display:inline-block;padding:4px 12px;border-radius:100px;background:#fff7ed;border:1px solid #ffedd5;color:#ff7900;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px">
        Nuevo mensaje de soporte
      </span>
    </td>
  </tr>
  <tr>
    <td style="font-size:13px;color:#666666;padding-bottom:6px;text-transform:uppercase;letter-spacing:1px;font-weight:600">Datos del remitente</td>
  </tr>
  <tr>
    <td style="padding-top:8px">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:separate;border-spacing:0 4px">
        <tr>
          <td bgcolor="#f9f9f9" style="width:40%;padding:10px 14px;border-radius:8px 0 0 8px;font-size:12px;color:#666666;font-weight:500;vertical-align:top">De</td>
          <td bgcolor="#f9f9f9" style="width:60%;padding:10px 14px;border-radius:0 8px 8px 0;font-size:13px;color:#111111;font-weight:500;vertical-align:top">${fromEmail}</td>
        </tr>
        <tr>
          <td bgcolor="#f9f9f9" style="width:40%;padding:10px 14px;border-radius:8px 0 0 8px;font-size:12px;color:#666666;font-weight:500;vertical-align:top">Asunto</td>
          <td bgcolor="#f9f9f9" style="width:60%;padding:10px 14px;border-radius:0 8px 8px 0;font-size:13px;color:#111111;font-weight:500;vertical-align:top">${subject}</td>
        </tr>
        <tr>
          <td bgcolor="#f9f9f9" style="width:40%;padding:10px 14px;border-radius:8px 0 0 8px;font-size:12px;color:#666666;font-weight:500;vertical-align:top">Mensaje</td>
          <td bgcolor="#f9f9f9" style="width:60%;padding:10px 14px;border-radius:0 8px 8px 0;font-size:13px;color:#111111;font-weight:500;vertical-align:top">${body.replace(/\n/g, '<br>')}</td>
        </tr>
      </table>
    </td>
  </tr>
</table>`.trim();

// ─── Generic notification table (used by /api/contact and /api/physical-request) ─
const NOTIF_TABLE_HTML = (title: string, fields: Record<string, string>) =>
	`
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%">
  <tr>
    <td style="padding-bottom:20px">
      <span style="display:inline-block;padding:4px 12px;border-radius:100px;background:#fff7ed;border:1px solid #ffedd5;color:#ff7900;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px">${title}</span>
    </td>
  </tr>
  <tr>
    <td style="padding:0">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:separate;border-spacing:0;border-radius:12px;overflow:hidden;border:1px solid #e4e4e7">
        <tr>
          <td style="padding:0">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:separate;border-spacing:0">
              ${Object.entries(fields)
								.map(
									([label, value], idx) => `
              <tr>
                <td bgcolor="${idx % 2 === 0 ? '#fafafa' : '#ffffff'}" style="width:35%;padding:12px 16px;font-size:12px;color:#71717a;font-weight:600;vertical-align:top;border-bottom:1px solid #e4e4e7">${label}</td>
                <td bgcolor="${idx % 2 === 0 ? '#fafafa' : '#ffffff'}" style="width:65%;padding:12px 16px;font-size:13px;color:#18181b;font-weight:400;vertical-align:top;border-bottom:1px solid #e4e4e7">${value.replace(/\n/g, '<br>')}</td>
              </tr>`,
								)
								.join('')}
            </table>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`.trim();

// ─── Final account-deletion confirmation template (email to the user) ─
const DELETE_CONFIRM_HTML = (userName: string) =>
	`
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%">
  <tr>
    <td align="center" style="padding-bottom:8px">
      <span style="display:inline-block;width:56px;height:56px;border-radius:16px;background:#fff7ed;border:1px solid #ffedd5;line-height:56px;text-align:center;font-size:28px">&#x1F5D1;&#xFE0F;</span>
    </td>
  </tr>
  <tr>
    <td align="center" style="padding-bottom:16px">
      <h1 style="margin:0;font-size:22px;color:#111111;font-weight:800;letter-spacing:-0.3px">Tu cuenta ha sido eliminada</h1>
    </td>
  </tr>
  <tr>
    <td align="center" style="padding-bottom:6px;font-size:14px;color:#666666;line-height:1.7;max-width:420px;margin:0 auto">
      Hola${userName ? ` <strong style="color:#111111">${userName}</strong>` : ''}, te confirmamos que tu cuenta de <strong style="color:#111111">Ubiqueme</strong> y todos tus datos asociados han sido eliminados de forma permanente.
    </td>
  </tr>
  <tr>
    <td align="center" style="padding-bottom:20px;font-size:14px;color:#666666;line-height:1.7;max-width:420px;margin:0 auto">
      Esto incluye tus c&oacute;digos QR, suscripciones y registros de actividad. Esta acci&oacute;n no se puede deshacer.
    </td>
  </tr>
  <tr>
    <td align="center" style="padding-top:20px;font-size:14px;color:#111111;font-weight:500;letter-spacing:-0.2px">
      &mdash; Equipo Ubiqueme
    </td>
  </tr>
</table>`.trim();

// ─── HTTP helpers ──────────────────────────────────────────────
const CORS_HEADERS = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'POST, OPTIONS',
	'Access-Control-Allow-Headers': 'Content-Type',
};

function json(data: Record<string, unknown>, status = 200): Response {
	return new Response(JSON.stringify(data), {
		status,
		headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
	});
}

// ─── Detect auto-replies / bounces to prevent loops ─────────
function isAutoReplyOrBounce(headers: Headers): boolean {
	const autoSubmitted = headers.get('Auto-Submitted');
	if (autoSubmitted && !['no', undefined].includes(autoSubmitted.toLowerCase())) {
		return true;
	}

	const precedence = headers.get('Precedence');
	if (precedence && ['bulk', 'junk', 'list'].includes(precedence.toLowerCase())) {
		return true;
	}

	const xAutoreply = headers.get('X-Autoreply');
	if (xAutoreply && xAutoreply.toLowerCase() === 'yes') {
		return true;
	}

	const xAutoResponseSuppress = headers.get('X-Auto-Response-Suppress');
	if (xAutoResponseSuppress) {
		return true;
	}

	const returnPath = headers.get('Return-Path');
	if (returnPath && returnPath.trim() === '<>') {
		return true;
	}

	return false;
}

// ─── Firebase Singleton (lazy) ────────────────────────────────
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
			appId: 'worker:soporte',
		};
		firebaseApp = initializeApp(config);
		firestoreDb = getFirestore(firebaseApp);
		firebaseAuth = getAuth(firebaseApp);
	}
	return { app: firebaseApp, db: firestoreDb, auth: firebaseAuth };
}

async function ensureAuthenticated(env: Env) {
	const { auth } = getFirebase(env);
	if (!auth) throw new Error('Firebase Auth no inicializado');
	if (!auth.currentUser) {
		await signInWithEmailAndPassword(auth, env.FIREBASE_AUTH_EMAIL, env.FIREBASE_AUTH_PASSWORD);
		console.log('[SoporteWorker] Firebase Auth: sesi\u00f3n iniciada');
	}
	return auth;
}

function escapeHtml(text: string): string {
	const amp = String.fromCharCode(38) + 'amp;';
	const lt = String.fromCharCode(38) + 'lt;';
	const gt = String.fromCharCode(38) + 'gt;';
	return text
		.replace(new RegExp(String.fromCharCode(38), 'g'), amp)
		.replace(/</g, lt)
		.replace(/>/g, gt);
}

function getAdminEmailHtml(subject: string, message: string): string {
	const safeSubject = escapeHtml(subject);
	const safeMessage = escapeHtml(message).replace(/\n/g, '<br>');
	const content = `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%">
  <tr>
    <td style="padding-bottom:16px">
      <h1 style="margin:0;font-size:20px;color:#111111;font-weight:700;letter-spacing:-0.3px">${safeSubject}</h1>
    </td>
  </tr>
  <tr>
    <td style="font-size:14px;color:#333333;line-height:1.7">
      ${safeMessage}
    </td>
  </tr>
</table>`.trim();
	return EMAIL_WRAPPER(content);
}

// ─── Admin send-email endpoint ─────────────────────────────────
async function handleAdminSendEmail(request: Request, env: Env): Promise<Response> {
	try {
		const body = await request.json<{
			to: string;
			toName: string;
			toUid: string;
			subject: string;
			message: string;
			category: string;
			sentBy: { uid: string; name: string; email: string };
		}>();

		if (!body.to || !body.subject || !body.message || !body.sentBy) {
			return json({ error: 'Missing required fields: to, subject, message, sentBy' }, 400);
		}

		// Send via Resend from soporte@ubiqueme.com
		const resend = new Resend(env.RESEND_API_KEY);
		const sendResult = await resend.emails.send({
			from: 'Ubiqueme <soporte@ubiqueme.com>',
			to: [body.to],
			subject: body.subject,
			html: getAdminEmailHtml(body.subject, body.message),
		});

		if (sendResult.error) {
			console.error('[SoporteWorker] Resend error:', sendResult.error);
			return json({ error: 'Failed to send email' }, 500);
		}

		// Save to Firestore sentEmails collection
		try {
			console.log('[SoporteWorker] Attempting to save sentEmail to Firestore...');
			console.log('[SoporteWorker] Firebase env vars present:', {
				projectId: !!env.FIREBASE_PROJECT_ID,
				apiKey: !!env.FIREBASE_API_KEY,
				authEmail: !!env.FIREBASE_AUTH_EMAIL,
				authPass: !!env.FIREBASE_AUTH_PASSWORD,
			});
			await ensureAuthenticated(env);
			console.log('[SoporteWorker] Firebase authenticated successfully');
			const { db } = getFirebase(env);
			const docRef = await addDoc(collection(db!, 'sentEmails'), {
				toEmail: body.to,
				toName: body.toName || '',
				toUid: body.toUid || '',
				subject: body.subject,
				message: body.message,
				category: body.category || 'general',
				sentBy: {
					uid: body.sentBy.uid,
					name: body.sentBy.name,
					email: body.sentBy.email,
				},
				fromAddress: 'soporte@ubiqueme.com',
				sentAt: Timestamp.now(),
				resendMessageId: sendResult.data?.id || null,
			});
		} catch (fsError) {
			// Non-critical: log but don't fail the request
			console.error('[SoporteWorker] Failed to save sentEmail to Firestore:', fsError);
		}

		return json({ success: true });
	} catch (e) {
		console.error('[SoporteWorker] Error in handleAdminSendEmail:', e);
		return json({ error: 'Internal error' }, 500);
	}
}

// ─── User deletion (admin console) ──────────────────────────────
interface DeletionSummary {
	subscriptions: number;
	userQrs: number;
	publicQrs: number;
	logs: number;
	planTypes: string[];
	hadActivePlan: boolean;
}

const BATCH_LIMIT = 450; // Firestore cap is 500 ops/batch; headroom for safety

/**
 * Verifies an admin caller by exchanging their Firebase ID token for a localId
 * via the Identity Toolkit REST API, then confirming role === 'admin' in /users.
 * Returns the admin uid, or null if the caller is not a verified admin.
 */
async function verifyAdminIdToken(env: Env, idToken: string): Promise<string | null> {
	const resp = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${env.FIREBASE_API_KEY}`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ idToken }),
	});
	if (!resp.ok) return null;
	const data = (await resp.json()) as { users?: Array<{ localId?: string }> };
	const localId = data.users?.[0]?.localId;
	if (!localId) return null;

	await ensureAuthenticated(env);
	const { db } = getFirebase(env);
	const snap = await getDoc(doc(db!, 'users', localId));
	if (!snap.exists() || snap.data().role !== 'admin') return null;
	return localId;
}

/**
 * Signs a JWT assertion with the Firebase service account (RS256) so the worker
 * can call Firebase Admin REST endpoints (OAuth2 jwt-bearer flow).
 */
async function signServiceAccountJwt(env: Env): Promise<string> {
	const privateKey = await importPKCS8(env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'), 'RS256');
	return new SignJWT({ scope: 'https://www.googleapis.com/auth/cloud-platform' })
		.setProtectedHeader({ alg: 'RS256' })
		.setIssuer(env.FIREBASE_CLIENT_EMAIL)
		.setSubject(env.FIREBASE_CLIENT_EMAIL)
		.setAudience('https://oauth2.googleapis.com/token')
		.setIssuedAt()
		.setExpirationTime('1h')
		.sign(privateKey);
}

/**
 * Deletes a Firebase Auth account via the Identity Toolkit Admin REST API.
 * A USER_NOT_FOUND response is treated as success (idempotent).
 */
async function deleteFirebaseAuthUser(env: Env, uid: string): Promise<void> {
	const assertion = await signServiceAccountJwt(env);
	const tokenResp = await fetch('https://oauth2.googleapis.com/token', {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body: new URLSearchParams({
			grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
			assertion,
		}),
	});
	if (!tokenResp.ok) {
		throw new Error(
			`Failed to obtain service account access token: ${tokenResp.status} ${await tokenResp.text()}`,
		);
	}
	const { access_token } = (await tokenResp.json()) as { access_token: string };

	const delResp = await fetch(`https://identitytoolkit.googleapis.com/v1/projects/${env.FIREBASE_PROJECT_ID}/accounts:delete`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${access_token}` },
		body: JSON.stringify({ localId: uid }),
	});

	if (delResp.status === 400) {
		const body = (await delResp.json()) as { error?: { message?: string } };
		if (body.error?.message?.includes('USER_NOT_FOUND')) return; // already gone → success
	}
	if (!delResp.ok) {
		throw new Error(`Failed to delete auth user ${uid}: status ${delResp.status}`);
	}
}

/**
 * Lists every document owned by the user: subscriptions, user QRs,
 * public QRs (top-level collection keyed by uid) and their scan logs.
 */
async function enumerateUserData(db: Firestore, uid: string): Promise<{ refs: DocumentReference[]; summary: DeletionSummary }> {
	const refs: DocumentReference[] = [];
	const summary: DeletionSummary = {
		subscriptions: 0,
		userQrs: 0,
		publicQrs: 0,
		logs: 0,
		planTypes: [],
		hadActivePlan: false,
	};

	const subsSnap = await getDocs(collection(db, 'users', uid, 'subscriptions'));
	subsSnap.forEach((subDoc) => {
		refs.push(doc(db, 'users', uid, 'subscriptions', subDoc.id));
		summary.subscriptions++;
		const planType = subDoc.data().planType as string | undefined;
		if (planType && !summary.planTypes.includes(planType)) summary.planTypes.push(planType);
		if (subDoc.data().status === 'active') summary.hadActivePlan = true;
	});

	const qrsSnap = await getDocs(collection(db, 'users', uid, 'qrs'));
	qrsSnap.forEach((qrDoc) => {
		refs.push(doc(db, 'users', uid, 'qrs', qrDoc.id));
		summary.userQrs++;
	});

	const publicSnap = await getDocs(query(collection(db, 'publicQR'), where('uid', '==', uid)));
	for (const qrDoc of publicSnap.docs) {
		refs.push(doc(db, 'publicQR', qrDoc.id));
		summary.publicQrs++;
		const logsSnap = await getDocs(collection(db, 'publicQR', qrDoc.id, 'logs'));
		logsSnap.forEach((logDoc) => {
			refs.push(doc(db, 'publicQR', qrDoc.id, 'logs', logDoc.id));
			summary.logs++;
		});
	}

	return { refs, summary };
}

/**
 * Deletes doc refs in chunks of BATCH_LIMIT. Deleting already-deleted docs
 * is a silent no-op, so re-running after a partial failure is safe.
 */
async function deleteInChunks(db: Firestore, refs: DocumentReference[]): Promise<void> {
	for (let i = 0; i < refs.length; i += BATCH_LIMIT) {
		const chunk = refs.slice(i, i + BATCH_LIMIT);
		const batch = writeBatch(db);
		chunk.forEach((ref) => batch.delete(ref));
		await batch.commit();
	}
}

/**
 * POST /api/admin-delete-user
 * Permanently deletes a user: all subscriptions, QRs, scan logs, the
 * users/{uid} doc and the Firebase Auth account, writes an anonymized
 * retention record, and emails the user a final confirmation.
 */
async function handleAdminDeleteUser(request: Request, env: Env): Promise<Response> {
	try {
		const body = (await request.json()) as { targetUid?: string; adminIdToken?: string };
		if (!body.targetUid || !body.adminIdToken) {
			return json({ error: 'Missing required fields: targetUid, adminIdToken' }, 400);
		}

		// 1. Authorize
		const adminUid = await verifyAdminIdToken(env, body.adminIdToken);
		if (!adminUid) return json({ error: 'Unauthorized' }, 403);
		if (body.targetUid === adminUid) return json({ error: 'Cannot delete your own account' }, 403);

		const { db } = getFirebase(env);
		const userRef = doc(db!, 'users', body.targetUid);
		const userSnap = await getDoc(userRef);
		if (!userSnap.exists()) {
			// Idempotent: a missing target after a previous run is success, but the
			// Auth account may still exist if a previous run degraded. Clean it up.
			let authDeleted = false;
			try {
				await deleteFirebaseAuthUser(env, body.targetUid);
				authDeleted = true;
			} catch (authError) {
				console.error(
					`[SoporteWorker] Auth account ${body.targetUid} was NOT deleted (service-account credentials missing?):`,
					authError,
				);
			}
			return json({ success: true, alreadyDeleted: true, authDeleted });
		}
		const userData = userSnap.data();
		if (userData.role === 'admin') return json({ error: 'Cannot delete an admin account' }, 403);

		// PII captured ONLY for the one-time final email; never persisted
		const targetEmail = userData.email as string | undefined;
		const targetName = (userData.name as string | undefined) || '';

		// 2. Enumerate all owned docs (reads only)
		const { refs, summary } = await enumerateUserData(db!, body.targetUid);

		// 3. Atomic commit of intent: anonymized retention record + deletion marker
		const retentionId = crypto.randomUUID();
		await runTransaction(db!, async (transaction) => {
			transaction.set(doc(db!, 'deletionRecords', retentionId), {
				deletedAt: Timestamp.now(),
				planTypes: summary.planTypes,
				hadActivePlan: summary.hadActivePlan,
				totalQrsDeleted: summary.publicQrs,
				initiator: 'admin',
			});
			transaction.update(userRef, {
				deletionInProgress: true,
				deletionStartedAt: Timestamp.now(),
			});
		});

		// 4. Cascade delete (idempotent, chunked)
		await deleteInChunks(db!, refs);

		// 5. Final commit: delete the user doc itself
		await deleteDoc(userRef);

		// 6. Delete the Firebase Auth account.
		// Graceful degradation: if the service-account credentials aren't
		// provisioned (FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY), the data
		// cascade still succeeds and authDeleted is reported false.
		let authDeleted = false;
		try {
			await deleteFirebaseAuthUser(env, body.targetUid);
			authDeleted = true;
		} catch (authError) {
			console.error(
				`[SoporteWorker] Auth account ${body.targetUid} was NOT deleted (service-account credentials missing?):`,
				authError,
			);
		}

		// 7. Orphan verification
		const leftover = await getDocs(query(collection(db!, 'publicQR'), where('uid', '==', body.targetUid)));
		if (leftover.size > 0) {
			console.error(
				`[SoporteWorker] ORPHAN ALERT: ${leftover.size} publicQR docs remain for deleted uid ${body.targetUid}`,
			);
		}

		// 8. Final email (best-effort, after deletion is complete)
		if (targetEmail) {
			try {
				const resend = new Resend(env.RESEND_API_KEY);
				await resend.emails.send({
					from: 'Ubiqueme <soporte@ubiqueme.com>',
					to: [targetEmail],
					subject: 'Confirmación: tu cuenta de Ubiqueme ha sido eliminada',
					html: EMAIL_WRAPPER(DELETE_CONFIRM_HTML(targetName)),
				});
			} catch (emailError) {
				console.error('[SoporteWorker] Failed to send deletion confirmation email:', emailError);
			}
		}

		console.log(`[SoporteWorker] User ${body.targetUid} deleted: ${JSON.stringify(summary)}`);

		return json({
			success: true,
			authDeleted,
			deletedSubscriptions: summary.subscriptions,
			deletedQrs: summary.publicQrs,
			deletedLogs: summary.logs,
			planTypes: summary.planTypes,
		});
	} catch (e) {
		console.error('[SoporteWorker] Error in handleAdminDeleteUser:', e);
		return json({ error: 'Internal error' }, 500);
	}
}

// ─── Main export ──────────────────────────────────────────────
export default {
	// ── Incoming email (Email Routing) ────────────────────────
	async email(message: ForwardableEmailMessage, env: Env, ctx: ExecutionContext): Promise<void> {
		// Ignore auto-replies, bounces, and out-of-office to prevent infinite loops
		if (isAutoReplyOrBounce(message.headers)) {
			console.log('Ignored auto-reply/bounce from', message.from);
			return;
		}

		const from = message.from;
		const subject = message.headers.get('subject') || 'Sin asunto';

		// 1. Forward the email to the support team
		await message.forward('informes@prasadam.mx');

		// 2. Send auto-response via Resend (not SEND_EMAIL binding, to avoid bounce loops)
		try {
			const resend = new Resend(env.RESEND_API_KEY);
			await resend.emails.send({
				from: 'Ubiqueme <soporte@ubiqueme.com>',
				to: [from],
				subject: 'Hemos recibido su mensaje \u2014 Ubiqueme',
				html: EMAIL_WRAPPER(AUTO_REPLY_HTML),
			});
		} catch (error) {
			console.error('Resend auto-reply error:', error);
		}
	},

	// ── HTTP endpoint (for contact form frontend) ─────────────
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		if (request.method === 'OPTIONS') {
			return new Response(null, { status: 204, headers: CORS_HEADERS });
		}
		if (request.method !== 'POST') {
			return new Response('Method not allowed', { status: 405, headers: CORS_HEADERS });
		}

		const url = new URL(request.url);

		// ── POST /api/contact ──────────────────────────────
		if (url.pathname === '/api/contact') {
			let body: Record<string, string>;
			try {
				body = await request.json<Record<string, string>>();
			} catch {
				return json({ error: 'Invalid JSON' }, 400);
			}

			const name = body.name?.trim();
			const email = body.email?.trim();
			const message = body.message?.trim();

			if (!name || !email || !message) {
				return json({ error: 'Missing required fields: name, email, message' }, 400);
			}

			const fields = {
				Nombre: name,
				Correo: email,
				Mensaje: message,
				'UID Firebase': body.firebaseUid || 'N/A',
				Teléfono: body.phone || 'N/A',
			};

			try {
				const resend = new Resend(env.RESEND_API_KEY);

				// Send notification to support team
				const notifResult = await resend.emails.send({
					from: 'Ubiqueme <soporte@ubiqueme.com>',
					to: ['informes@prasadam.mx'],
					subject: `Nuevo mensaje de contacto \u2014 ${name}`,
					html: EMAIL_WRAPPER(NOTIF_TABLE_HTML('Nuevo mensaje de contacto', fields)),
				});

				if (notifResult.error) {
					console.error('Resend error:', notifResult.error);
					return json({ error: 'Failed to send email' }, 500);
				}

				// Send confirmation to the user
				await resend.emails
					.send({
						from: 'Ubiqueme <soporte@ubiqueme.com>',
						to: [email],
						subject: 'Hemos recibido su mensaje \u2014 Ubiqueme',
						html: EMAIL_WRAPPER(AUTO_REPLY_HTML),
					})
					.catch(() => null);

				return json({ success: true });
			} catch (error) {
				console.error('Resend error:', error);
				return json({ error: 'Failed to send email' }, 500);
			}
		}

		// ── POST /api/account-deletion (notify account cancellation) ──
		if (url.pathname === '/api/account-deletion') {
			let body: Record<string, string>;
			try {
				body = await request.json<Record<string, string>>();
			} catch {
				return json({ error: 'Invalid JSON' }, 400);
			}

			const fields = {
				'UID Firebase': body.firebaseUid || 'N/A',
				'Correo del usuario': body.email || 'N/A',
				'Nombre del usuario': body.userName || 'N/A',
				Motivo: body.reason || 'N/A',
				'Detalle adicional': body.customReason || 'N/A',
			};

			try {
				const resend = new Resend(env.RESEND_API_KEY);
				const notifResult = await resend.emails.send({
					from: 'Ubiqueme <soporte@ubiqueme.com>',
					to: ['informes@prasadam.mx'],
					subject: 'Solicitud de cancelaci\u00f3n de cuenta',
					html: EMAIL_WRAPPER(NOTIF_TABLE_HTML('Solicitud de cancelaci\u00f3n de cuenta', fields)),
				});

				if (notifResult.error) {
					console.error('Resend error:', notifResult.error);
					return json({ error: 'Failed to send email' }, 500);
				}

				return json({ success: true });
			} catch (error) {
				console.error('Resend error:', error);
				return json({ error: 'Failed to send email' }, 500);
			}
		}

		// ── POST /api/admin-send-email (admin console) ─────────
		if (url.pathname === '/api/admin-send-email') {
			return handleAdminSendEmail(request, env);
		}

		// ── POST /api/admin-delete-user (admin console) ────────
		if (url.pathname === '/api/admin-delete-user') {
			return handleAdminDeleteUser(request, env);
		}

		// ── POST /api/physical-request (notify QR shipment) ──
		if (url.pathname === '/api/physical-request') {
			let body: Record<string, string>;
			try {
				body = await request.json<Record<string, string>>();
			} catch {
				return json({ error: 'Invalid JSON' }, 400);
			}

			const fields = {
				'UID Firebase': body.firebaseUid || 'N/A',
				'Correo del usuario': body.email || 'N/A',
				'Nombre del usuario': body.userName || 'N/A',
				Plan: body.planType || 'N/A',
				'IDs de QR': body.qrIds || 'N/A',
				Costo: body.cost || 'N/A',
				Ciudad: body.city || 'N/A',
				'C\u00f3digo Postal': body.postalCode || 'N/A',
				Teléfono: body.phone || 'N/A',
				'Notas de env\u00edo': body.shippingNotes || 'Ninguna',
				'Notas adicionales': body.notes || 'Ninguna',
			};

			try {
				const resend = new Resend(env.RESEND_API_KEY);
				const notifResult = await resend.emails.send({
					from: 'Ubiqueme <soporte@ubiqueme.com>',
					to: ['informes@prasadam.mx'],
					subject: 'Nueva solicitud de QR f\u00edsico',
					html: EMAIL_WRAPPER(NOTIF_TABLE_HTML('Nueva solicitud de QR f\u00edsico', fields)),
				});

				if (notifResult.error) {
					console.error('Resend error:', notifResult.error);
					return json({ error: 'Failed to send email' }, 500);
				}

				return json({ success: true });
			} catch (error) {
				console.error('Resend error:', error);
				return json({ error: 'Failed to send email' }, 500);
			}
		}

		return new Response('Not found', { status: 404, headers: CORS_HEADERS });
	},
} satisfies ExportedHandler<Env>;
