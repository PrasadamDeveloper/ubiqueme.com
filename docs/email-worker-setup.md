# Configurar Cloudflare Worker para Email — ubiqueme.com

Este documento explica cómo reenviar correos entrantes (ej. `pagos@ubiqueme.com`, `soporte@ubiqueme.com`) usando Cloudflare Email Routing + Cloudflare Worker + Resend.

---

## 1. Arquitectura

```
Usuario envía email a pagos@ubiqueme.com
    ↓
Cloudflare Email Routing (recibe el email en tu dominio)
    ↓
Cloudflare Worker (procesa, consulta Firestore si es necesario)
    ↓
Resend API (reenvía al destinatario real)
```

---

## 2. Requisitos previos

- Dominio en Cloudflare (ubiqueme.com)
- Cuenta en [Resend](https://resend.com) (plan gratuito: 100 emails/día)
- Proyecto Firebase/Firestore (ya lo tienes)

---

## 3. Configurar Email Routing en Cloudflare

1. Ve a Cloudflare Dashboard → tu dominio → **Email** (menú izquierdo)
2. En **Email Routing** → **Routing rules** → **Catch-all** o crear regla específica:
   - Para un solo correo: `pagos@ubiqueme.com` → enviar a tu Worker
   - O catch-all: `*@ubiqueme.com` → enviar a tu Worker
3. En **Email Workers** → selecciona tu worker (o crea uno nuevo)
4. Guarda

---

## 4. Worker: manejar email entrante

El worker ya tiene un handler de email en `ubiqueme-worker/src/backup/index.email-worker.ts`. La estructura base es:

```ts
export default {
  async email(message: EmailMessage, env: Env, ctx: ExecutionContext) {
    const sender = message.from
    const subject = message.headers.get('subject') || ''
    const raw = await new Response(message.raw).arrayBuffer()
    const parsed = await new PostalMime().parse(raw)
    const body = parsed.text || parsed.html || ''

    // Procesar y reenviar con Resend
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'ubiqueme.com <pagos@ubiqueme.com>',
        to: 'tu-email-real@ejemplo.com',
        subject: `Reenviado: ${subject}`,
        html: `De: ${sender}<br>${body}`,
      }),
    })
  },
}
```

**Diferencia clave con endpoints HTTP:**  
El handler de email NO usa `fetch(request)` — usa `email(message)`. Cloudflare Email Routing llama directamente a esta función cuando llega un correo.

---

## 5. Configurar variables de entorno (secrets)

```bash
# En el directorio del worker
cd ubiqueme-worker

# Agregar la API key de Resend
echo "re_abc123..." | npx wrangler secret put RESEND_API_KEY

# Si ya tienes las de Firebase configuradas, no necesitas repetirlas
```

En `wrangler.jsonc` no se declaran secrets (se ponen con `wrangler secret put`).

---

## 6. PostalMime para parsear el email

`postal-mime` es una librería que parsea el raw del email (MIME) a texto plano/html. Se usa así:

```ts
import PostalMime from 'postal-mime'

const parser = new PostalMime()
const rawBuffer = await new Response(message.raw).arrayBuffer()
const parsed = await parser.parse(rawBuffer)
// parsed.text → texto plano
// parsed.html → HTML del email
// parsed.subject → asunto
// parsed.from → remitente
```

---

## 7. Ejemplo completo: reenviar pagos@ubiqueme.com

```ts
export default {
  async email(message: EmailMessage, env: Env, ctx: ExecutionContext) {
    const sender = message.from
    const subject = message.headers.get('subject') || ''

    const parser = new PostalMime()
    const raw = await new Response(message.raw).arrayBuffer()
    const parsed = await parser.parse(raw)
    const bodyText = parsed.text || ''

    // Reenviar al equipo de pagos
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'ubiqueme.com <pagos@ubiqueme.com>',
        to: ['alejandrocarbajal@prasadam.mx'],
        subject: `[Pagos] ${subject}`,
        html: `
          <p><strong>De:</strong> ${sender}</p>
          <p><strong>Asunto:</strong> ${subject}</p>
          <hr>
          <pre>${bodyText}</pre>
        `,
      }),
    })
  },
}
```

---

## 8. Desplegar

```bash
npx wrangler deploy
```

Luego en Cloudflare Dashboard → Email → Email Workers, asegúrate de que el worker esté seleccionado como destino de las reglas de routing.

---

## 9. Probar

Envía un correo a `pagos@ubiqueme.com` desde Gmail/Hotmail. El worker lo reenviará al destino configurado. Revisa los logs:

```bash
npx wrangler tail
```

---

## 10. Notas importantes

- **No uses fetch(request)** para email handlers — usa `email(message)`
- **PostalMime** necesita `nodejs_compat` flag (ya está en `wrangler.jsonc`)
- Resend gratuito da 100 emails/día, suficiente para empezar
- El worker actual ya tiene `index.email-worker.ts` como referencia funcional con Firebase lookup + Resend
