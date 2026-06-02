import { EmailMessage } from 'cloudflare:email';
import { Resend } from 'resend';

// Extend Env with the Resend API key secret (set via `wrangler secret put`)
declare global {
	interface Env {
		RESEND_API_KEY: string;
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

// ─── Main export ──────────────────────────────────────────────
export default {
	// ── Incoming email (Email Routing) ────────────────────────
	async email(message: ForwardableEmailMessage, env: Env, ctx: ExecutionContext): Promise<void> {
		const from = message.from;
		const subject = message.headers.get('subject') || 'Sin asunto';

		// 1. Forward the email to the support team
		await message.forward('informes@prasadam.mx');

		// 2. Send auto-response to the sender via Email Binding
		const autoReply = new EmailMessage('soporte@ubiqueme.com', from, EMAIL_WRAPPER(AUTO_REPLY_HTML));
		(autoReply as any).setHeader('subject', 'Hemos recibido su mensaje — Ubiqueme');
		await env.SEND_EMAIL.send(autoReply);

		// 3. Send notification to the support team via Resend (with body preview)
		try {
			const resend = new Resend(env.RESEND_API_KEY);
			await resend.emails.send({
				from: 'Ubiqueme <soporte@ubiqueme.com>',
				to: ['informes@prasadam.mx'],
				subject: `Nuevo mensaje de soporte — ${subject}`,
				html: EMAIL_WRAPPER(NOTIF_HTML(from, subject, '(Contenido reenviado por Email Routing)')),
			});
		} catch (error) {
			console.error('Resend notification failed:', error);
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
					subject: `Nuevo mensaje de contacto — ${name}`,
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
						subject: 'Hemos recibido su mensaje — Ubiqueme',
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
					subject: 'Solicitud de cancelación de cuenta',
					html: EMAIL_WRAPPER(NOTIF_TABLE_HTML('Solicitud de cancelación de cuenta', fields)),
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
				'Código Postal': body.postalCode || 'N/A',
				Teléfono: body.phone || 'N/A',
				'Notas de envío': body.shippingNotes || 'Ninguna',
				'Notas adicionales': body.notes || 'Ninguna',
			};

			try {
				const resend = new Resend(env.RESEND_API_KEY);
				const notifResult = await resend.emails.send({
					from: 'Ubiqueme <soporte@ubiqueme.com>',
					to: ['informes@prasadam.mx'],
					subject: 'Nueva solicitud de QR físico',
					html: EMAIL_WRAPPER(NOTIF_TABLE_HTML('Nueva solicitud de QR físico', fields)),
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
