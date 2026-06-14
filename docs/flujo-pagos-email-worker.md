# Flujo de Pagos — Solicitud de Plan vía Email Worker

## Arquitectura

```
Usuario llena formulario en OrderPlanView.vue
         │
         ▼
   fetch POST → API / Cloud Function
         │
         ▼
   Envío de correo a pagos@ubiqueme.com
   (con datos: nombre, email, teléfono, plan, uid)
         │
         ▼
   ┌─── Cloudflare Email Worker ──────────────────────┐
   │                                                   │
   │  1. message.forward('jefe@destino.com')           │
   │     → Reenvía el correo original al jefe          │
   │                                                   │
   │  2. new EmailMessage() + message.reply()          │
   │     → Auto-respuesta al usuario:                  │
   │       "Recibimos tu solicitud, te contactaremos"  │
   │                                                   │
   └───────────────────────────────────────────────────┘
         │
         ▼
   Jefe recibe correo con datos del solicitante
         │
         ▼
   Jefe verifica pago manualmente (fuera del sistema)
         │
         ▼
   Jefe asigna el plan al usuario desde el admin
   (AdminDashboardView → ChangePlanPrompt)
```

## Componentes

### 1. Frontend — Formulario de solicitud

**Archivo:** `src/views/public/OrderPlanView.vue`

Actualmente el formulario recolecta:

- `fullName` — desde userStore
- `email` — desde userStore
- `phone` — input manual
- `firebaseUid` — desde userStore
- `specialNotes` — campo opcional
- `selectedPlan` — del plan elegido (bronce/plata/oro)

**Lo que falta implementar:** Al hacer submit, en lugar del `setTimeout` simulado, debe hacer un fetch a un endpoint que envíe el correo a `pagos@ubiqueme.com`.

Ejemplo de implementación en `handleSubmit`:

```ts
const handleSubmit = async () => {
  isSubmitting.value = true
  try {
    const res = await fetch('https://tu-api.com/send-purchase-request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        plan: selectedPlan.value,
        fullName: formData.value.fullName,
        email: formData.value.email,
        phone: formData.value.phone,
        firebaseUid: formData.value.firebaseUid,
        notes: formData.value.specialNotes,
      }),
    })
    if (!res.ok) throw new Error('Error al enviar')
    isSuccess.value = true
  } catch (e) {
    // mostrar error
  } finally {
    isSubmitting.value = false
  }
}
```

### 2. Backend — Endpoint que envía el correo

Puede ser:

- Una **Cloud Function** (Firebase) que use `nodemailer` o SendGrid
- O directamente desde el frontend con **EmailJS** / **SendGrid API** si no quieres backend

Ejemplo con Cloud Function (Firebase):

```ts
// functions/src/sendPurchaseRequest.ts
import * as functions from 'firebase-functions'
import * as nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({ ... })

export const sendPurchaseRequest = functions.https.onCall(async (data, context) => {
  const { plan, fullName, email, phone, firebaseUid, notes } = data

  const mailOptions = {
    from: 'sistema@ubiqueme.com',
    to: 'pagos@ubiqueme.com',
    subject: `Nueva solicitud de suscripción - ${plan}`,
    text: `
      Plan: ${plan}
      Nombre: ${fullName}
      Email: ${email}
      Teléfono: ${phone}
      UID: ${firebaseUid}
      Notas: ${notes || 'Ninguna'}
    `,
  }

  await transporter.sendMail(mailOptions)
  return { success: true }
})
```

### 3. Cloudflare Email Worker

**Archivo:** `email-worker/src/index.ts`

```ts
import { EmailMessage } from 'cloudflare:email'

export default {
  async email(message: ForwardableEmailMessage, env, ctx): Promise<void> {
    // 1. Reenviar al jefe
    await message.forward('correodestino@destino.com')

    // 2. Auto-respuesta al usuario
    const autoReply = new EmailMessage(
      'pagos@ubiqueme.com',
      message.from,
      `Subject: Hemos recibido su solicitud de suscripción

Hola,

Hemos recibido correctamente su solicitud de suscripción a Ubiqueme.

Uno de nuestros asesores se pondrá en contacto con usted pronto para
proporcionarle el enlace de pago y finalizar el proceso.

Si tiene alguna duda, puede responder a este correo.

Saludos,
Equipo Ubiqueme`,
    )
    await message.reply(autoReply)
  },
} satisfies ExportedHandler<Env>
```

## Configuración de Cloudflare

### wrangler.jsonc

```jsonc
{
  "name": "email-worker",
  "main": "src/index.ts",
  "compatibility_date": "2026-05-28",
  "compatibility_flags": ["nodejs_compat"],
  "send_email": [
    {
      "name": "SEND_EMAIL",
      "destination_address": "shykandev@gmail.com",
    },
  ],
}
```

### Enrutamiento de email en Cloudflare

1. Ir a [Cloudflare Dashboard → Email → Routing](https://dash.cloudflare.com/?to=/:account/email/routing/overview)
2. Agregar dirección `pagos@ubiqueme.com` (si usas dominio en Cloudflare)
3. En **Catch-All** o **Routing rules**, crear regla que entregue los correos de `pagos@ubiqueme.com` al worker `email-worker`
4. En **Destination addresses**, verificar `correodestino@destino.com` (la del jefe) para que `message.forward()` funcione

## Flujo manual (jefe)

1. Recibe el correo con los datos del solicitante
2. Verifica el pago (transferencia, depósito, etc.) por su cuenta
3. Entra al admin del sistema → asigna el plan manualmente
4. El usuario ve el cambio reflejado en su dashboard

## Resumen de acciones pendientes

| #   | Acción                                                                                   | Responsable |
| --- | ---------------------------------------------------------------------------------------- | ----------- |
| 1   | Implementar envío de correo desde `handleSubmit` en `OrderPlanView.vue`                  | Dev         |
| 2   | Configurar dominio `ubiqueme.com` en Cloudflare Email Routing (si no está)               | Dev / Ops   |
| 3   | Verificar `correodestino@destino.com` en Cloudflare como destino                         | Dev         |
| 4   | Actualizar `message.forward('correodestino@destino.com')` con el email real del jefe     | Dev         |
| 5   | Configurar regla de enrutamiento: correos a `pagos@ubiqueme.com` → Email Worker          | Dev / Ops   |
| 6   | Probar flujo completo: submit → correo a pagos → worker reenvía al jefe + auto-respuesta | QA          |
| 7   | Jefe asigna plan manualmente desde admin                                                 | Jefe        |

## Notas

- `SendEmail` binding no es necesario para `message.forward()` o `message.reply()`, esas son operaciones del handler `email` directamente.
- Si se quiere enviar correos **desde el frontend sin backend**, opciones simples: EmailJS, SendGrid API Key desde cliente (con restricciones CORS), o Resend.
- `message.from` contiene el email del remitente original, `message.to` contiene `pagos@ubiqueme.com`.
