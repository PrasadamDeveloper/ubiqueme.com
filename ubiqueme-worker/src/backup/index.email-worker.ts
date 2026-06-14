import { SignJWT, importPKCS8 } from 'jose';
import PostalMime from 'postal-mime';

// Interfaz unificada para todas tus variables de entorno
interface Env {
	FIREBASE_PROJECT_ID: string;
	FIREBASE_CLIENT_EMAIL: string;
	FIREBASE_PRIVATE_KEY: string;
	RESEND_API_KEY: string;
}

export default {
	/**
	 * MANEJADOR DE EMAIL: El Relevo de Privacidad (Privacy Relay)
	 * Cuando alguien escribe a soporte@ubiqueme.com con ID:[UID]
	 */
	async email(message: any, env: Env, _ctx: ExecutionContext): Promise<void> {
		const subject = message.headers.get('subject') || '';
		const sender = message.from; // El correo del que escaneó el QR
		console.log(`[Worker] 📧 Email recibido de: ${sender} | Asunto: ${subject}`);

		// Parseamos el email para obtener el mensaje real convirtiendo el stream a ArrayBuffer primero (más seguro en CF Workers)
		const parser = new PostalMime();
		const rawBuffer = await new Response(message.raw).arrayBuffer();
		const parsedEmail = await parser.parse(rawBuffer);

		let messageBody = parsedEmail.text || parsedEmail.html || 'No se pudo extraer el mensaje.';
		// Limpiamos etiquetas html si extrajimos texto con formato
		messageBody = messageBody.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>');

		// Buscamos el ID del QR en el asunto del correo
		const qrIdMatch = subject.match(/ID:\[(.*?)\]/);

		if (qrIdMatch && qrIdMatch[1]) {
			const qrId = qrIdMatch[1].trim();
			console.log(`[Worker] 🔍 QR ID Extraído: ${qrId}`);

			try {
				const accessToken = await getGoogleAccessToken(env);

				// 1. Buscamos el QR para saber de quién es
				const qrData = await getFirestoreQR(env.FIREBASE_PROJECT_ID, accessToken, qrId);
				console.log(`[Worker] 📦 Datos del QR obtenidos:`, qrData);

				if (qrData && qrData.uid) {
					// 2. Buscamos quién es el dueño real en Firestore
					const ownerData = await getFirestoreUser(env.FIREBASE_PROJECT_ID, accessToken, qrData.uid);
					console.log(`[Worker] 👤 Datos del dueño obtenidos:`, ownerData);

					if (ownerData && ownerData.email) {
						console.log(`[Worker] 🚀 Preparando envío de correo vía Resend a: ${ownerData.email}`);
						// 2. Preparamos el email con diseño Premium Vercel (Dark Mode obligatorio)
						const emailPayload = {
							from: 'ubiqueme.com <soporte@ubiqueme.com>',
							to: ownerData.email,
							subject: `Aviso de Escaneo: ${qrData.name || 'QR'}`,
							html: `
<!DOCTYPE html>
<html lang="es" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
  <title>Aviso de Escaneo</title>
  <style>
    :root {
      color-scheme: dark;
      supported-color-schemes: dark;
    }
    body {
      margin: 0;
      padding: 0;
      width: 100% !important;
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
      background-color: #000000 !important;
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #000000 !important; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #000000;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <!-- Card Container -->
        <table width="100%" max-width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #0a0a0a; border: 1px solid #222222; border-radius: 8px;">
          <tr>
            <td style="padding: 32px;">

              <div style="font-size: 14px; font-weight: 600; letter-spacing: -0.02em; color: #ededed; margin-bottom: 32px;">
                ubiqueme.com
              </div>

              <div style="font-size: 15px; line-height: 1.6; color: #a1a1aa;">
                <div style="color: #ededed; font-size: 18px; font-weight: 500; margin-bottom: 24px; letter-spacing: -0.01em;">
                  Hola <span style="color: #ededed; font-weight: 500;">${ownerData.displayName || 'propietario'}</span>,
                </div>

                <p style="margin: 0 0 16px 0;">
                  Alguien escaneó su código QR <span style="color: #ededed; font-weight: 500;">${qrData.name || 'Desconocido'}</span> con el remitente <span style="color: #ededed; font-weight: 500;">${sender}</span> y con el siguiente mensaje:
                </p>

                <div style="background-color: #111111; border: 1px solid #222222; border-radius: 6px; padding: 20px; margin: 24px 0; color: #ededed; font-size: 14px; word-break: break-word;">${messageBody}</div>

                <div style="font-size: 13px; color: #71717a; margin-top: 32px; padding-top: 24px; border-top: 1px solid #222222; line-height: 1.5;">
                  <p style="margin: 0 0 16px 0;">
                    Hasta este punto su correo y su información están protegidas y privadas, si usted desea responder proceda con precaución y no de información personal, al usted responder acepta que ubiqueme.com no es responsable conforme a nuestra política de privacidad y términos y condiciones.
                  </p>
                  <p style="margin: 0;">
                    Excelente día, para cualquier duda contáctenos en <a href="mailto:ayuda@ubiqueme.com" style="color: #ededed; text-decoration: none;">ayuda@ubiqueme.com</a>
                  </p>
                </div>
              </div>

            </td>
          </tr>
        </table>
        <!-- Footer -->
        <table width="100%" max-width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px;">
          <tr>
            <td align="center" style="padding-top: 24px; font-size: 12px; color: #52525b;">
              &copy; ${new Date().getFullYear()} ubiqueme.com derechos reservados.
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>
</body>
</html>
            `,
						};

						// 3. Enviamos el correo al dueño vía Resend
						const res = await fetch('https://api.resend.com/emails', {
							method: 'POST',
							headers: {
								Authorization: `Bearer ${env.RESEND_API_KEY}`,
								'Content-Type': 'application/json',
							},
							body: JSON.stringify(emailPayload),
						});

						const responseText = await res.text();
						console.log(`[Worker] Resultado Resend Status: ${res.status}`);
						console.log(`[Worker] Resultado Resend Body: ${responseText}`);
					}
				}
			} catch (e) {
				console.error('Error en Privacy Relay:', e);
			}
		} else {
			// Fallback: Si no tiene el formato ID:[], reenviar a tu backup
			await message.forward('alejandrocarbajal@prasadam.mx');
		}
	},
};

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
