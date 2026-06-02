import { EmailMessage } from 'cloudflare:email';
import { Resend } from 'resend';

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

const CONFIRM_HTML = `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%">
  <tr>
    <td align="center" style="padding-bottom:8px">
      <span style="display:inline-block;width:56px;height:56px;border-radius:16px;background:#fff7ed;border:1px solid #ffedd5;line-height:56px;text-align:center;font-size:28px">&#x2705;</span>
    </td>
  </tr>
  <tr>
    <td align="center" style="padding-bottom:16px">
      <h1 style="margin:0;font-size:22px;color:#111111;font-weight:800;letter-spacing:-0.3px">Solicitud recibida</h1>
    </td>
  </tr>
  <tr>
    <td align="center" style="padding-bottom:6px;font-size:14px;color:#666666;line-height:1.7;max-width:420px;margin:0 auto">
      Hemos recibido correctamente su solicitud de suscripci&oacute;n a <strong style="color:#111111">Ubiqueme</strong>. Agradecemos su preferencia.
    </td>
  </tr>
  <tr>
    <td align="center" style="padding-bottom:20px;font-size:14px;color:#666666;line-height:1.7;max-width:420px;margin:0 auto">
      Est&eacute; atento a este correo, pronto recibir&aacute; el enlace para realizar el pago.
    </td>
  </tr>
  <tr>
    <td style="padding:20px;background:#fafafa;border-radius:12px;border:1px solid #e4e4e7">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="font-size:13px;color:#666666;line-height:1.7">
            Uno de nuestros asesores se pondr&aacute; en contacto con usted en las pr&oacute;ximas 24 a 48 horas para proporcionarle el enlace de pago y finalizar el proceso.
          </td>
        </tr>
        <tr>
          <td style="padding-top:12px;font-size:12px;color:#999999;line-height:1.6">
            Si tiene alguna duda, puede responder a este correo.
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

const NOTIF_HTML = (planLabel: string, fields: Record<string, string>) =>
	`
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%">
  <tr>
    <td style="padding-bottom:20px">
      <span style="display:inline-block;padding:4px 12px;border-radius:100px;background:#fff7ed;border:1px solid #ffedd5;color:#ff7900;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px">
        Nueva solicitud &mdash; ${planLabel}
      </span>
    </td>
  </tr>
  <tr>
    <td style="font-size:13px;color:#666666;padding-bottom:6px;text-transform:uppercase;letter-spacing:1px;font-weight:600">Datos del solicitante</td>
  </tr>
  <tr>
    <td style="padding-top:8px">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:separate;border-spacing:0 4px">
        ${Object.entries(fields)
					.map(
						([label, value]) => `
        <tr>
          <td bgcolor="#f9f9f9" style="width:40%;padding:10px 14px;border-radius:8px 0 0 8px;font-size:12px;color:#666666;font-weight:500;vertical-align:top">${label}</td>
          <td bgcolor="#f9f9f9" style="width:60%;padding:10px 14px;border-radius:0 8px 8px 0;font-size:13px;color:#111111;font-weight:500;vertical-align:top">${value}</td>
        </tr>`,
					)
					.join('')}
      </table>
    </td>
  </tr>
  <tr>
    <td style="padding-top:24px">
      <table role="presentation" cellpadding="0" cellspacing="0" bgcolor="#fafafa" style="border-radius:12px;border:1px solid #e4e4e7;padding:16px 20px;width:100%">
        <tr>
          <td style="font-size:12px;color:#666666;line-height:1.6">
            <strong style="color:#ff7900">Acci&oacute;n requerida:</strong> Verifique el pago del solicitante y asigne el plan manualmente desde el panel de administraci&oacute;n.
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`.trim();

export default {
	async fetch(request: Request, env, ctx): Promise<Response> {
		if (request.method === 'OPTIONS') {
			return new Response(null, { status: 204, headers: CORS_HEADERS });
		}
		if (request.method !== 'POST') {
			return new Response('Method not allowed', { status: 405, headers: CORS_HEADERS });
		}

		const url = new URL(request.url);
		if (url.pathname !== '/api/purchase-request') {
			return new Response('Not found', { status: 404, headers: CORS_HEADERS });
		}

		let body: Record<string, string>;
		try {
			body = await request.json<Record<string, string>>();
		} catch {
			return json({ error: 'Invalid JSON' }, 400);
		}

		const plan = body.plan;
		const fullName = body.fullName;
		const email = body.email;
		const phone = body.phone;

		if (!plan || !fullName || !email || !phone) {
			return json({ error: 'Missing required fields' }, 400);
		}

		const planLabel = plan.charAt(0).toUpperCase() + plan.slice(1);
		const resend = new Resend(env.RESEND_API_KEY);

		const fields = {
			Plan: planLabel,
			'Nombre completo': fullName,
			'Correo electrónico': email,
			Teléfono: phone,
			'UID Firebase': body.firebaseUid || 'N/A',
			'Notas adicionales': body.notes || 'Ninguna',
		};

		const [notifResult] = await Promise.all([
			resend.emails.send({
				from: 'Ubiqueme <pagos@ubiqueme.com>',
				to: ['pagos@ubiqueme.com'],
				subject: `Nueva solicitud de suscripción — ${planLabel}`,
				html: EMAIL_WRAPPER(NOTIF_HTML(planLabel, fields)),
			}),
			resend.emails
				.send({
					from: 'Ubiqueme <pagos@ubiqueme.com>',
					to: [email],
					subject: 'Hemos recibido su solicitud de suscripción',
					html: EMAIL_WRAPPER(CONFIRM_HTML),
				})
				.catch(() => null),
		]);

		if (notifResult?.error) {
			console.error('Resend error:', notifResult.error);
			return json({ error: 'Failed to send email' }, 500);
		}

		return json({ success: true });
	},

	async email(message: ForwardableEmailMessage, env, ctx): Promise<void> {
		await message.forward('informes@prasadam.mx');
	},
} satisfies ExportedHandler<Env>;
