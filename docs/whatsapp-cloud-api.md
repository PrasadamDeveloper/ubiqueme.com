# WhatsApp Cloud API — Núcleo de integración

> Documentación extraída de la implementación real en `ubiqueme-worker`.
> Toda la lógica de infraestructura (Firebase, Firestore, auth, logs, validaciones) ha sido eliminada.
> Aquí solo está **el mínimo necesario** para enviar mensajes a WhatsApp Cloud API.

---

## 1. Endpoint base

```
POST https://graph.facebook.com/v20.0/{WHATSAPP_PHONE_NUMBER_ID}/messages
```

| Variable | Descripción |
|----------|-------------|
| `WHATSAPP_PHONE_NUMBER_ID` | ID del número de teléfono asignado por Meta Business |

---

## 2. Headers obligatorios

```javascript
{
  Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
  'Content-Type': 'application/json',
}
```

| Header | Valor |
|--------|-------|
| `Authorization` | `Bearer {token}` — token permanente generado desde Meta Business |
| `Content-Type` | `application/json` |

> El token se obtiene desde **Meta Business Suite → WhatsApp → API Setup**.
> Tiene vigencia de 24h a 60d. Se puede refrescar con OAuth, pero en producción se almacena como secreto.

---

## 3. Estructura base del payload

```javascript
{
  messaging_product: 'whatsapp',
  recipient_type: 'individual',
  to: '{número_destino}',
  type: 'template' | 'text',
  // según el type, se agrega template: {} o text: {}
}
```

| Campo | Valor fijo | Descripción |
|-------|-----------|-------------|
| `messaging_product` | `'whatsapp'` | Siempre este valor |
| `recipient_type` | `'individual'` | Solo individual, no grupos |
| `to` | número sin `+` | Destinatario en formato internacional sin signos (ej. `5511470315`) |
| `type` | `'template'` o `'text'` | Determina el tipo de mensaje |

---

## 4. Envío de template normal (con header + body + botón URL)

Usado en nuestro worker para la plantilla `notif`.
    
### Payload completo

```javascript
const payload = {
  messaging_product: 'whatsapp',
  recipient_type: 'individual',
  to: '5511470315',                            // destinatario
  type: 'template',
  template: {
    name: 'notif',                                 // nombre exacto de la plantilla
    language: { code: 'es' },                      // idioma
    components: [
      {
        type: 'header',
        parameters: [
          { type: 'image', image: { link: 'https://ejemplo.com/imagen.jpg' } }
        ],
      },
      {
        type: 'body',
        parameters: [
          { type: 'text', text: 'Nombre del dueño' },
          { type: 'text', text: '5512345678' },
          { type: 'text', text: 'Encontré tu mochila' },
          { type: 'text', text: 'Mochila negra' },
          { type: 'text', text: '21/6/2026, 3:30 pm' },
        ],
      },
      {
        type: 'button',
        sub_type: 'url',
        index: 0,
        parameters: [
          { type: 'text', text: encodeURIComponent('Mochila negra') },
        ],
      },
    ],
  },
};
```

### Reglas de la plantilla `notif`

| Componente | Tipo | Parámetros |
|-----------|------|------------|
| `header` | `image` | 1 parámetro: `{ type: 'image', image: { link: string } }` |
| `body` | `text` | 5 parámetros de texto en orden: nombre del dueño, teléfono del scanner, mensaje, nombre del QR, hora del scan |
| `button` | `url` | 1 parámetro: el nombre del QR codificado con `encodeURIComponent()` |

**Nota**: El botón URL abre un enlace. El parámetro se inyecta en el placeholder `{{1}}` definido en la URL de la plantilla.

---

## 5. Envío de template OTP (autenticación — "Copiar código")

Usado en nuestro worker para la plantilla `verify_otp`.

### Payload completo

```javascript
const payload = {
  messaging_product: 'whatsapp',
  recipient_type: 'individual',
  to: '5511470315',                            // teléfono del usuario
  type: 'template',
  template: {
    name: 'verify_otp',                           // nombre exacto de la plantilla
    language: { code: 'es' },
    components: [
      {
        type: 'body',
        parameters: [
          { type: 'text', text: '483920' },       // código OTP de 6 dígitos
        ],
      },
      {
        type: 'button',
        sub_type: 'url',
        index: 0,
        parameters: [
          { type: 'text', text: '483920' },       // mismo código para el botón URL
        ],
      },
    ],
  },
};
```

### Reglas de la plantilla `verify_otp`

| Componente | Tipo | Parámetros |
|-----------|------|------------|
| `body` | `text` | 1 parámetro: el código OTP de 6 dígitos |
| `button` | `url` | 1 parámetro: el mismo código OTP |

**Importante**: aunque en el panel de Meta aparezca como "Copiar código", el botón en el payload sigue siendo de tipo `url`. Meta reemplaza el placeholder de la URL con el código OTP, y el usuario copia manualmente el código que ve en el body del mensaje.

---

## 6. Envío de texto plano (sin plantilla)

Usado para mensajes directos sin aprobación de Meta.

### Payload completo

```javascript
const payload = {
  messaging_product: 'whatsapp',
  recipient_type: 'individual',
  to: '5511470315',
  type: 'text',
  text: {
    body: 'Hola, este es un mensaje de texto directo',
  },
};
```

---

## 7. Llamada a la API

Código mínimo para enviar cualquier mensaje:

```javascript
const MESSAGES_URL = `https://graph.facebook.com/v20.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`;

const response = await fetch(MESSAGES_URL, {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(payload),
});

const result = await response.json();
```

---

## 8. Interpretación de la respuesta de Meta

### Éxito (HTTP 200/201)

```json
{
  "messaging_product": "whatsapp",
  "contacts": [
    {
      "input": "5511470315",
      "wa_id": "5511470315"
    }
  ],
  "messages": [
    {
      "id": "wamid.HBgLNTE...
    }
  ]
}
```

| Campo | Significado |
|-------|-------------|
| `contacts[0].wa_id` | WhatsApp ID del destinatario — confirma que el número es válido |
| `messages[0].id` | ID único del mensaje enviado — **presencia de este campo = éxito** |

### Error (HTTP 400)

```json
{
  "error": {
    "message": "(#132018) There's an issue with the parameters in your template",
    "type": "OAuthException",
    "code": 132018,
    "error_data": {
      "messaging_product": "whatsapp",
      "details": "buttons: Button at index 0 must be of type Url"
    },
    "fbtrace_id": "At9l2kGJhZ5Q2Nd5tmIlkvI"
  }
}
```

| Campo | Significado |
|-------|-------------|
| `error.message` | Descripción del error |
| `error.code` | Código numérico del error |
| `error.error_data.details` | Detalle específico — **leer esto primero para debuggear** |

### Códigos de error comunes

| Código | Mensaje | Causa |
|--------|---------|-------|
| `132018` | Issue with parameters in your template | El payload no coincide con la estructura de la plantilla (componentes faltantes, parámetros incorrectos) |
| `131008` | Required parameter is missing | Falta un campo obligatorio en el payload |
| `100` | Invalid parameter | Tipo de parámetro incorrecto (ej. `text` donde se esperaba `image`) |

### Cómo determinar si el envío fue exitoso

```javascript
const response = await fetch(MESSAGES_URL, { method: 'POST', headers, body });
const result = await response.json();

if (response.ok && result.messages?.[0]?.id) {
  // ✅ Enviado exitosamente
  console.log('Message ID:', result.messages[0].id);
} else {
  // ❌ Meta rechazó el mensaje
  console.error('Error:', result.error?.message, result.error?.error_data?.details);
}
```

---

## 9. Código funcional mínimo (todo junto)

```javascript
const WHATSAPP_PHONE_NUMBER_ID = '123456789';
const WHATSAPP_ACCESS_TOKEN    = 'EAAT...';

const MESSAGES_URL = `https://graph.facebook.com/v20.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`;

async function sendTemplate(to, code) {
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

  const response = await fetch(MESSAGES_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const result = await response.json();

  if (response.ok && result.messages?.[0]?.id) {
    return { success: true, messageId: result.messages[0].id };
  } else {
    return { success: false, error: result.error?.message, details: result.error?.error_data?.details };
  }
}

// Uso:
// const res = await sendTemplate('5511470315', '483920');
```

---

## 10. Resumen de reglas para construir payloads

1. **`recipient_type`** siempre es `'individual'`
2. **`to`** debe ser el número sin `+` (el worker también elimina el prefijo `whatsapp:` si existe)
3. **Los componentes del template** deben coincidir exactamente con lo que Meta espera:
   - Si la plantilla tiene header, debe incluirse el componente `header`
   - Si la plantilla tiene botón, debe incluirse el componente `button`
   - Los parámetros deben estar **en el orden exacto** en que aparecen los placeholders `{{1}}`, `{{2}}`, etc.
4. **Botón URL**: requiere `sub_type: 'url'`, `index: 0` (o el índice que corresponda), y `parameters` con un `{ type: 'text', text: valor }`
5. **Códigos OTP**: deben ser strings de 6 dígitos. Se envían igual al body y al botón
6. **encodeURIComponent**: se usa en los parámetros del botón URL cuando el valor puede contener caracteres especiales (espacios, acentos, etc.)

---

## 11. Tipos plantilla según su propósito en nuestros workers

| Plantilla | Componentes | Propósito |
|-----------|------------|-----------|
| `notif` | header (image) + body (5 text) + button (url) | Notificar al dueño de un QR que alguien lo escaneó |
| `verify_otp` | body (1 text) + button (url) | Enviar código de verificación OTP para autenticación por teléfono |

Ambas usan `language.code: 'es'` (español).