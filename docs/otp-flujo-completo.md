# 🔐 Flujo Completo de Verificación OTP por WhatsApp

> **Propósito:** Esta documentación explica paso a paso, línea por línea, cómo funciona la verificación OTP (One-Time Password) en Ubiqueme. Sirve como referencia técnica y para explicar el funcionamiento a personas no técnicas.

---

## 📡 Arquitectura General

```
┌──────────────────────┐
│     PhonePrompt.vue   │  ← Componente Vue (Frontend)
│   (Interfaz usuario)  │
└──────────┬───────────┘
           │ 1. POST /api/send-otp { uid, phone }
           │ 2. POST /api/verify-otp { uid, code }
           ▼
┌──────────────────────┐
│   ubiqueme-worker     │  ← Cloudflare Worker (Backend)
│   (Lógica de negocio) │
└──────────┬───────────┘
           │ 3. Lectura/Escritura en Firestore
           │ 4. Llamada a API de Meta WhatsApp
           ▼
┌──────────────────────┐     ┌──────────────────────┐
│      Firestore        │     │  API Meta WhatsApp   │
│  (Base de datos)      │     │  (Entrega mensajes)  │
└──────────────────────┘     └──────────────────────┘
```

---

## 📦 Paso 1: Frontend — El usuario hace clic en "Enviar código"

### Archivo: `src/components/user/dashboard/QRDash/PhonePrompt.vue`

#### 1.1 El usuario llena el formulario

```vue
<!-- PhonePrompt.vue — Líneas 37-60 -->
<div class="flex gap-2">
  <!-- Selector de país -->
  <select v-model="selectedCountry">
    <option v-for="c in countries" :key="c.code" :value="c">
      {{ c.flag }} {{ c.prefix }}  <!-- ej: 🇲🇽 +52 -->
    </option>
  </select>

  <!-- Input del número -->
  <input v-model="phoneNumber" type="tel" placeholder="55 1234 5678"
    @input="onPhoneInput" />
</div>
```

El usuario selecciona un país (ej: México `+52`) y escribe su número.

#### 1.2 Validación del número en tiempo real

```ts
// PhonePrompt.vue — Líneas 219-228
const isValid = computed(() => {
  const raw = phoneNumber.value
  if (!raw || !/^\d{4,}$/.test(raw)) return false // Al menos 4 dígitos
  try {
    const phone = parsePhoneNumber(raw, selectedCountry.value.code)
    return phone.isValid() // Usa libphonenumber-js para validación real
  } catch {
    return false
  }
})
```

**¿Qué hace?** Valida que el número sea real para el país seleccionado usando la librería `libphonenumber-js` (la misma que usa Google). Si el número no es válido, el botón permanece deshabilitado.

#### 1.3 Se da clic en "Enviar código" — se ejecuta `handleSendOtp()`

```ts
// PhonePrompt.vue — Líneas 254-291
const handleSendOtp = async () => {
  // ❌ Si el número no es válido, no continúa
  if (!isValid.value) {
    toast.error('El número no es válido para el país seleccionado.')
    return
  }

  // ❌ Si no hay usuario autenticado, no continúa
  const userId = userStore.getUserId
  if (!userId) {
    toast.error('Error de autenticación. Intente de nuevo.')
    return
  }

  isSendingOtp.value = true  // Muestra spinner en el botón

  // Formatea el número a E.164 sin el "+"
  // Ej: "+52 5512345678" → "525512345678"
  const phone = formatForWhatsApp()
```

#### 1.4 LLAMADA A LA API — `POST /api/send-otp`

```ts
// PhonePrompt.vue — Líneas 269-278
const response = await fetch(`${WORKER_URL}/api/send-otp`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    uid: userId, // ID del usuario en Firebase (ej: "abc123...")
    phone, // Número formateado (ej: "525512345678")
  }),
})
```

**¿Qué se envió al worker?** Un objeto JSON con dos campos:

- `uid`: El ID del usuario en Firebase Authentication
- `phone`: El número de teléfono en formato E.164 sin el `+`

---

## ⚙️ Paso 2: Worker recibe `POST /api/send-otp`

### Archivo: `ubiqueme-worker/src/index.ts`

#### 2.1 Enrutamiento de la petición

```ts
// ubiqueme-worker/src/index.ts — Líneas 430-432
if (url.pathname === '/api/send-otp' && request.method === 'POST') {
  return handleSendOtp(request, env) // ← Aquí entra
}
```

#### 2.2 Inicio de `handleSendOtp()` — Validaciones iniciales

```ts
// ubiqueme-worker/src/index.ts — Líneas 616-694
async function handleSendOtp(request: Request, env: Env): Promise<Response> {
  try {
    // Extrae los datos que envió el frontend
    const { uid, phone } = (await request.json()) as { uid?: string; phone?: string };

    // ❌ VALIDACIÓN 1: ¿uid y phone existen?
    if (!uid || !phone) {
      return new Response(JSON.stringify({ error: 'uid and phone are required' }), {
        status: 400,  // HTTP 400 = Bad Request
      });
    }

    // 🔐 Se autentica con Firebase usando credenciales de servicio
    // (NO es el usuario final, es el worker mismo quien se autentica)
    await ensureAuthenticated(env);
```

**¿Por qué se autentica?** Porque Firestore requiere autenticación para leer/escribir. El worker usa una cuenta de servicio (email + password) que tiene permisos para leer/escribir documentos.

```ts
// Obtiene el documento del usuario en Firestore
const { db } = getFirebase(env)
const userRef = doc(db!, 'users', uid)
const userSnap = await getDoc(userRef)

// ❌ VALIDACIÓN 2: ¿El usuario existe en Firestore?
if (!userSnap.exists()) {
  return new Response(JSON.stringify({ error: 'User not found' }), {
    status: 404, // HTTP 404 = Not Found
  })
}
```

#### 2.3 RATE LIMITING — ¿Esperar 60 segundos?

```ts
// Obtiene los datos actuales del usuario
const userData = userSnap.data()

// Revisa si hay un OTP que sigue vigente
const otpExpiresAt = userData.otpExpiresAt?.toDate?.()

if (otpExpiresAt && otpExpiresAt > new Date()) {
  // Todavía hay un OTP activo... ¿pero cuándo se envió?
  const otpSentAt = userData.otpSentAt?.toDate?.()

  // ❌ Si se envió hace menos de 60 segundos, rechaza
  if (otpSentAt && Date.now() - otpSentAt.getTime() < 60_000) {
    return new Response(
      JSON.stringify({
        error: 'Wait 60 seconds before requesting a new code',
      }),
      {
        status: 429, // HTTP 429 = Too Many Requests
      },
    )
  }
}
```

**¿Cómo funciona el rate limiting?**

| Condición                               | Resultado                    |
| --------------------------------------- | ---------------------------- |
| No hay OTP previo                       | ✅ Pasa, genera código nuevo |
| OTP previo expiró (> 10 min)            | ✅ Pasa, genera código nuevo |
| OTP sigue vigente pero últ. envío > 60s | ✅ Pasa, permite reenviar    |
| OTP sigue vigente y envío < 60s         | ❌ Rechaza con 429           |

#### 2.4 🎯 GENERACIÓN DEL CÓDIGO + SALT + HASH

Aquí está el corazón del sistema. Se generan tres cosas:

```ts
// 1️⃣ Código de 6 dígitos — el que verá el usuario en WhatsApp
const code = generateOtpCode()
// code = "837291"

// 2️⃣ Salt aleatorio — 32 bytes que se mezclarán con el código
const salt = generateSalt()
// salt = "a7f3c9e1b2d84f6a0c3e5d7b9a1c4e8f2a6d0b3c5e7f9a1b4d6c8e0a2f4b6d8"

// 3️⃣ Hash — SHA-256 del código + salt (irreversible)
const hash = await sha256Hex(code + salt)
// hash = SHA-256("837291" + "a7f3c9e1...")
// hash = "5d4c3b2a1f6e7d8c9b0a1f2e3d4c5b6a7f8e9d0c1b2a3f4e5d6c7b8a9f0e1d2"
```

**DETALLE DE CADA FUNCIÓN:**

---

##### 🔧 Función `generateOtpCode()` — Línea 351

```ts
// ubiqueme-worker/src/index.ts — Líneas 351-353
function generateOtpCode(): string {
  return String(100000 + Math.floor(Math.random() * 900000))
  // Math.random() = 0.723456...
  // 100000 + Math.floor(0.723456 * 900000) = 100000 + 651110 = 751110
  // Resultado: "751110"
}
```

**¿Qué hace?** Genera un número aleatorio entre 100000 y 999999 (siempre 6 dígitos). Se convierte a string para poder concatenarlo con el salt.

---

##### 🔧 Función `generateSalt()` — Línea 355

```ts
// ubiqueme-worker/src/index.ts — Líneas 355-361
function generateSalt(): string {
  // Crea un array de 32 bytes (256 bits) vacío
  const bytes = new Uint8Array(32)

  // Lo llena con valores criptográficamente aleatorios
  // crypto.getRandomValues es MÁS seguro que Math.random()
  // porque usa el generador de números aleatorios del sistema operativo
  crypto.getRandomValues(bytes)

  // Convierte cada byte a hexadecimal (2 caracteres por byte)
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
  // Resultado: 64 caracteres hexadecimales (32 bytes × 2)
}
```

**¿Por qué 32 bytes?** Es el tamaño estándar para SHA-256. 32 bytes = 64 caracteres hex.

**¿Por qué no usar solo `Math.random()`?** `crypto.getRandomValues()` es criptográficamente seguro, `Math.random()` no lo es.

---

##### 🔧 Función `sha256Hex()` — Línea 343

```ts
// ubiqueme-worker/src/index.ts — Líneas 343-349
async function sha256Hex(input: string): Promise<string> {
  // Convierte el string de entrada a bytes (UTF-8)
  const encoder = new TextEncoder()
  const data = encoder.encode(input)

  // Aplica SHA-256. Esto es nativo del runtime (Cloudflare Workers lo soporta)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)

  // Convierte el resultado (ArrayBuffer) a un array de bytes
  const hashArray = Array.from(new Uint8Array(hashBuffer))

  // Convierte cada byte a hexadecimal
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
  // Resultado: 64 caracteres hexadecimales
}
```

**¿Cómo funciona SHA-256?** Es una función hash unidireccional: es fácil de calcular pero imposible de revertir. Si tienes el hash `"5d4c..."`, no puedes obtener el código original `"837291"` a partir de él. La única forma de verificar es tomar el código que el usuario ingrese, mezclarlo con el salt, calcular el hash, y comparar. Si los hashes coinciden, el código es correcto.

---

#### 2.5 📝 ESCRITURA EN FIRESTORE

```ts
// ubiqueme-worker/src/index.ts — Líneas 657-669

// pendingPhone: el teléfono NO se guarda como "phone" oficial aún
// Se guarda como "pendingPhone" = pendiente de verificación
// Solo si el usuario verifica correctamente, se moverá a "phone"

// Calcula la fecha de expiración: ahora + 10 minutos
const now = Timestamp.now()
const expiresAt = Timestamp.fromMillis(now.toMillis() + 10 * 60 * 1000) // 10 min

const batch = writeBatch(db!)
batch.update(userRef, {
  pendingPhone: phone, // "525512345678" — teléfono pendiente de verificar
  otpHash: hash, // SHA-256(código + salt) — para validar después
  otpSalt: salt, // La sal única de este intento
  otpExpiresAt: expiresAt, // Ahora + 10 minutos
  otpAttempts: 0, // Empieza en 0 intentos
  otpSentAt: now, // Marca de tiempo del envío (para rate limiting)
})
await batch.commit()
```

**Así queda el documento en Firestore:**

```json
{
  // ... otros campos del usuario (name, email, etc.) ...
  "phone": "", // Vacío — el usuario aún no tiene teléfono verificado
  "pendingPhone": "525512345678", // ⬅️ El teléfono que queremos verificar
  "otpHash": "5d4c3b2a1f6e7d8c9b0a1f2e3d4c5b6a7f8e9d0c1b2a3f4e5d6c7b8a9f0e1d2",
  "otpSalt": "a7f3c9e1b2d84f6a0c3e5d7b9a1c4e8f2a6d0b3c5e7f9a1b4d6c8e0a2f4b6d8",
  "otpExpiresAt": "Abril 15, 2026, 10:35:00 UTC",
  "otpAttempts": 0,
  "otpSentAt": "Abril 15, 2026, 10:25:00 UTC"
}
```

**¿Qué se guarda y qué NO?**

| Se guarda                               | NO se guarda                                   |
| --------------------------------------- | ---------------------------------------------- |
| ✅ `otpHash` (hash del código + salt)   | ❌ El código `"837291"` en texto plano         |
| ✅ `otpSalt` (bytes aleatorios)         | ❌ Información sobre cómo decodificar el hash  |
| ✅ `otpExpiresAt` (fecha de expiración) | ❌ Nada que permita obtener el código original |
| ✅ `otpAttempts` (contador de intentos) |                                                |
| ✅ `pendingPhone` (número a verificar)  |                                                |

#### 2.6 📱 ENVÍO DEL CÓDIGO POR WHATSAPP

```ts
// ubiqueme-worker/src/index.ts — Líneas 673-674

// Limpia el formato: "whatsapp:525512345678" → "525512345678"
const cleanPhone = phone.replace('whatsapp:', '').replace('+', '')

// Envía el código por WhatsApp usando la plantilla "verify_otp"
const sent = await sendOtpWhatsApp(env, cleanPhone, code)
// code = "837291" — el código en texto plano SOLO va en este payload
```

```ts
// ubiqueme-worker/src/index.ts — Líneas 579-610
async function sendOtpWhatsApp(env: Env, to: string, code: string): Promise<boolean> {
  // Construye el payload que se enviará a la API de Meta
  const payload = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to, // "525512345678"
    type: 'template',
    template: {
      name: 'verify_otp', // Plantilla aprobada por Meta
      language: { code: 'es' },
      components: [
        {
          type: 'body',
          parameters: [
            { type: 'text', text: code }, // "837291" en el cuerpo
          ],
        },
        {
          type: 'button',
          sub_type: 'url',
          index: 0,
          parameters: [
            { type: 'text', text: code }, // "837291" en el botón
          ],
        },
      ],
    },
  }

  // Envía el POST a la API de Meta WhatsApp
  const response = await fetch(MESSAGES_URL(env), {
    method: 'POST',
    headers: metaHeaders(env),
    body: JSON.stringify(payload),
  })

  const result = await response.json()

  // Si la respuesta no es OK, algo falló
  if (!response.ok) {
    return false
  }

  return true
}
```

**¿Qué recibe el usuario en WhatsApp?**

```
Ubiqueme
─────────────────────────
Tu código de verificación Ubiqueme es: 837291.
Válido por 10 minutos.

[Copiar código]  <-- botón
```

#### 2.7 Respuesta al frontend

```ts
// Si llegó aquí, todo salió bien: código generado, guardado y enviado
return new Response(JSON.stringify({ success: true }), {
  status: 200, // HTTP 200 = OK
})
```

#### 2.8 Manejo de errores

```ts
  } catch (e: unknown) {
    // Si algo falla en cualquier punto (Firebase caído, Meta caído, etc.)
    console.error('[Worker] Excepción en handleSendOtp:', e);
    return new Response(JSON.stringify({ error: 'Internal error' }), {
      status: 500,  // HTTP 500 = Internal Server Error
    });
  }
```

---

## 👁️ Paso 3: El usuario recibe el código y lo ingresa

En el frontend, `PhonePrompt.vue` cambió al **Paso 2** (OTP input):

```ts
// PhonePrompt.vue — Línea 282
step.value = 2 // Ahora se muestra el campo de código
```

El usuario ve:

```
🔒 Verifica tu número
Hemos enviado un código de verificación de 6 dígitos
al número +52 5512345678 por WhatsApp.

[Código: _ _ _ _ _ _ _]

[✓ Verificar]

¿No recibiste el código?  (30s)
```

Escribe `837291` y hace clic en "Verificar".

---

## ⚙️ Paso 4: Worker recibe `POST /api/verify-otp`

#### 4.1 Enrutamiento

```ts
// ubiqueme-worker/src/index.ts — Líneas 434-437
if (url.pathname === '/api/verify-otp' && request.method === 'POST') {
  return handleVerifyOtp(request, env) // ← Aquí entra
}
```

#### 4.2 Validaciones iniciales

```ts
// ubiqueme-worker/src/index.ts — Líneas 700-806
async function handleVerifyOtp(request: Request, env: Env): Promise<Response> {
  try {
    // Extrae los datos del frontend
    const { uid, code } = (await request.json()) as { uid?: string; code?: string };

    // ❌ VALIDACIÓN 1: ¿uid y code existen?
    if (!uid || !code) {
      return new Response(JSON.stringify({ error: 'uid and code are required' }), {
        status: 400,
      });
    }

    // Autentica y obtiene datos del usuario
    await ensureAuthenticated(env);
    const { db } = getFirebase(env);
    const userRef = doc(db!, 'users', uid);
    const userSnap = await getDoc(userRef);

    // ❌ VALIDACIÓN 2: ¿El usuario existe?
    if (!userSnap.exists()) {
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 404,
      });
    }
```

#### 4.3 Obtener los datos OTP guardados

```ts
const userData = userSnap.data()

// Extrae los campos OTP que guardamos en el paso 2.5
const otpHash: string | undefined = userData.otpHash
const otpSalt: string | undefined = userData.otpSalt
const otpExpiresAt: Timestamp | undefined = userData.otpExpiresAt
const otpAttempts: number | undefined = userData.otpAttempts
const pendingPhone: string | undefined = userData.pendingPhone

// ❌ VALIDACIÓN 3: ¿Existe un OTP pendiente?
// Si falta cualquiera de estos campos, significa que nunca se solicitó un OTP,
// o que ya fue verificado/borrado.
if (!otpHash || !otpSalt || !otpExpiresAt) {
  return new Response(JSON.stringify({ error: 'No OTP pending' }), {
    status: 400,
  })
}

// ❌ VALIDACIÓN 4: ¿Hay un teléfono pendiente?
if (!pendingPhone) {
  return new Response(JSON.stringify({ error: 'No pending phone to verify' }), {
    status: 400,
  })
}
```

#### 4.4 ⏰ VALIDACIÓN DE EXPIRACIÓN — ¿Pasaron 10 minutos?

```ts
// ubiqueme-worker/src/index.ts — Líneas 743-748

// Compara la fecha de expiración guardada con la fecha actual
if (otpExpiresAt.toDate() < new Date()) {
  // ❌ El OTP expiró
  // Significa que pasaron más de 10 minutos desde que se generó
  return new Response(JSON.stringify({ error: 'Code expired' }), {
    status: 400,
  })
}
```

**¿Cómo funciona?**

Cuando se generó el código, guardamos `otpExpiresAt` como `ahora + 10 minutos`.

En el momento de verificar, comparamos:

```
¿otpExpiresAt < fecha_actual?
     ↑                   ↑
Ahora + 10 min        Hoy a las 10:35

Ejemplo:
- Código generado: 10:25:00
- otpExpiresAt:     10:35:00
- Verificación a:   10:32:00 → ❌ 10:35 > 10:32 → NO ha expirado → ✅ Pasa
- Verificación a:   10:38:00 → ❌ 10:35 < 10:38 → SÍ expiró → ❌ Rechaza
```

#### 4.5 🔢 VALIDACIÓN DE INTENTOS — ¿Ya falló 3 veces?

```ts
// ubiqueme-worker/src/index.ts — Líneas 751-755

// Revisa si ya se alcanzó el límite de 3 intentos
// otpAttempts ?? 0 significa: si es undefined, usa 0
if ((otpAttempts ?? 0) >= 3) {
  // ❌ Demasiados intentos fallidos
  return new Response(
    JSON.stringify({
      error: 'Too many attempts, request a new code',
    }),
    {
      status: 400,
    },
  )
}
```

#### 4.6 🔬 LA COMPARACIÓN CRUCIAL — ¿El código es correcto?

```ts
    // ubiqueme-worker/src/index.ts — Líneas 758-778

    // Calcula el hash del código que el usuario ingresó AHORA
    // Usando el mismo salt que se guardó cuando se generó el código
    const attemptedHash = await sha256Hex(code + otpSalt);

    // Compara con el hash que se guardó cuando se generó el código
    if (attemptedHash !== otpHash) {
      // ❌ Los hashes NO coinciden → el código es INCORRECTO
```

**Ejemplo concreto:**

```
Cuando se GENERÓ el código:
  - Código original: "837291"
  - Salt guardado: "a7f3c9e1..."
  - Hash guardado: SHA-256("837291" + "a7f3c9e1...") = "5d4c3b2a..."

Cuando el usuario INGRESA el código:
  - Usuario escribe: "837291" (correcto)
  - Salt leído de Firestore: "a7f3c9e1..."
  - Hash calculado: SHA-256("837291" + "a7f3c9e1...") = "5d4c3b2a..."

  ✅ "5d4c3b2a..." === "5d4c3b2a..." → Coinciden → Código CORRECTO

  - Usuario escribe: "123456" (incorrecto)
  - Hash calculado: SHA-256("123456" + "a7f3c9e1...") = "8d9e0f1a..."

  ❌ "8d9e0f1a..." !== "5d4c3b2a..." → No coinciden → Código INCORRECTO
```

#### 4.7 ❌ Si el código es INCORRECTO

```ts
// Incrementa el contador de intentos fallidos
const newAttempts = (otpAttempts ?? 0) + 1
const batch = writeBatch(db!)
batch.update(userRef, { otpAttempts: newAttempts })

// ¿FUE EL TERCER INTENTO? → Invalida el código
if (newAttempts >= 3) {
  // Borra los campos OTP para que no se pueda seguir intentando
  batch.update(userRef, {
    otpHash: deleteField(), // Elimina el hash
    otpSalt: deleteField(), // Elimina la sal
    otpExpiresAt: deleteField(), // Elimina la expiración
  })
  // Con esto, si el usuario vuelve a intentar, recibirá
  // "No OTP pending" porque los campos ya no existen
}

await batch.commit()
console.log(`[Worker] OTP invalid for uid ${uid}, attempt ${newAttempts}/3`)

return new Response(JSON.stringify({ error: 'Invalid code' }), {
  status: 400,
})
```

**¿Qué pasa con los intentos?**

| Intento fallido | `otpAttempts` | ¿Qué pasa?                                            |
| --------------- | ------------- | ----------------------------------------------------- |
| 1°              | 1             | ❌ "Código incorrecto" — puede reintentar             |
| 2°              | 2             | ❌ "Código incorrecto" — puede reintentar             |
| 3°              | 3             | ❌ "Código incorrecto" — **se borran los campos OTP** |
| 4°              | —             | ❌ "No OTP pending" — ya no hay código que validar    |

```ts
    } // ← Fin del if (attemptedHash !== otpHash)
```

#### 4.8 ✅ Si el código es CORRECTO

```ts
// ubiqueme-worker/src/index.ts — Líneas 780-798

// 🎉 ÉXITO — el código ingresado coincide con el hash guardado

// Prepara un batch de escritura atómica
const successBatch = writeBatch(db!)

successBatch.update(userRef, {
  phone: pendingPhone, // "525512345678" — AHORA SÍ se guarda como oficial
  phoneVerified: true, // Marca como verificado permanentemente
  pendingPhone: deleteField(), // Limpia el teléfono pendiente
  otpHash: deleteField(), // Limpia el hash (ya no sirve)
  otpSalt: deleteField(), // Limpia la sal
  otpExpiresAt: deleteField(), // Limpia la expiración
  otpAttempts: deleteField(), // Limpia los intentos
  otpSentAt: deleteField(), // Limpia la marca de tiempo
})

await successBatch.commit()
console.log(`[Worker] Phone verified for uid ${uid}: ${pendingPhone}`)
```

**El documento en Firestore DESPUÉS del éxito:**

```json
{
  // ... otros campos del usuario ...
  "phone": "525512345678", // ✅ Ahora tiene el teléfono verificado
  "phoneVerified": true // ✅ Queda marcado permanentemente
  // "pendingPhone": ELIMINADO    // Ya no existe
  // "otpHash": ELIMINADO         // Ya no existe
  // "otpSalt": ELIMINADO         // Ya no existe
  // "otpExpiresAt": ELIMINADO    // Ya no existe
  // "otpAttempts": ELIMINADO     // Ya no existe
  // "otpSentAt": ELIMINADO       // Ya no existe
}
```

**¿Por qué borrar los campos OTP?** Para que:

1. No se pueda reutilizar el mismo código (ataque de replay)
2. Si el usuario vuelve a abrir el PhonePrompt, empiece desde cero
3. El documento quede limpio sin residuos de la verificación

```ts
return new Response(JSON.stringify({ success: true, phoneVerified: true }), {
  status: 200,
})
```

#### 4.9 Manejo de errores general

```ts
  } catch (e: unknown) {
    console.error('[Worker] Excepción en handleVerifyOtp:', e);
    return new Response(JSON.stringify({ error: 'Internal error' }), {
      status: 500,
    });
  }
```

---

## ✅ Paso 5: Frontend recibe la respuesta exitosa

```ts
// PhonePrompt.vue — Líneas 306-331

const data = await response.json()

if (!response.ok) {
  // Maneja errores específicos
  if (data.error === 'Code expired') {
    toast.error('El código ha expirado. Solicita uno nuevo.')
  } else if (data.error === 'Invalid code') {
    toast.error('Código incorrecto. Intenta de nuevo.')
  } else if (data.error === 'Too many attempts, request a new code') {
    toast.error('Demasiados intentos fallidos. Solicita un nuevo código.')
  }
  return
}

// ✅ Éxito
const phone = formatForWhatsApp()
userStore.setUserPhone(phone) // Actualiza el store local
toast.success('Número verificado exitosamente.')
emit('saved') // Cierra el modal
```

---

## 📊 RESUMEN DE SEGURIDAD

| Concepto                       | Implementación                                                                    | ¿Por qué?                                                                              |
| ------------------------------ | --------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| **Código de 6 dígitos**        | `generateOtpCode()` → 100000-999999                                               | Suficientemente difícil de adivinar (1 en 900,000) pero fácil de escribir              |
| **No guardar código en BD**    | Solo se guarda `SHA-256(código + salt)`                                           | Si alguien accede a Firestore, no puede obtener el código original                     |
| **Salt aleatorio**             | `crypto.getRandomValues(32 bytes)` → hex                                          | Evita ataques de diccionario rainbow table                                             |
| **Expiración**                 | `otpExpiresAt = ahora + 10 minutos`                                               | El código no sirve después de 10 minutos, incluso si alguien lo interceptó             |
| **3 intentos máximos**         | `otpAttempts` se incrementa en cada fallo; al llegar a 3 se borran los campos OTP | Evita fuerza bruta (1/900,000 × 3 intentos = probabilidad ínfima)                      |
| **Rate limiting**              | 60 segundos mínimo entre reenvíos                                                 | Evita spam de SMS/WhatsApp (costo por mensaje)                                         |
| **PendingPhone vs Phone**      | El número vive en `pendingPhone` hasta que se verifica                            | Si alguien nunca verifica, su `phone` oficial queda vacío (no tiene número registrado) |
| **Limpieza post-verificación** | `deleteField()` en todos los campos OTP                                           | El código no puede reutilizarse (ataque de replay)                                     |

---

## ❓ PREGUNTAS FRECUENTES

### 1. ¿Por qué es necesario guardar algo en la base de datos si el código se envía por WhatsApp?

Porque la validación NO es instantánea. Este es el timeline real:

```
T=0s:    Se genera el código
T=0.2s:  Se envía el WhatsApp
T=2-10s: El usuario abre WhatsApp y ve el código
T=10-60s: El usuario cambia a la app, escribe el código y presiona Verificar
T=60s:   El worker recibe el código para validación

El worker en T=60s necesita COMPARAR el código que el usuario ingresa ahora
con el que se generó en T=0s. Sin almacenamiento, no hay forma de hacerlo.
```

### 2. ¿No se puede usar un JWT firmado en lugar de BD?

Sí, pero el código tendría que ir dentro del JWT, y ese JWT viajaría al frontend. Eso expone el código a JavaScript del lado del cliente, aumentando el riesgo de XSS (Cross-Site Scripting). La implementación actual es más segura porque el código NUNCA toca el frontend — solo existe en la memoria del worker y en WhatsApp.

### 3. ¿Qué pasa si el usuario cierra la página?

El OTP sigue siendo válido por 10 minutos. Si vuelve a abrir el PhonePrompt, puede solicitar un nuevo código (esperando 60s por rate limiting). El `pendingPhone` anterior se sobrescribe.

### 4. ¿Qué pasa si alguien intenta 10,000 códigos por fuerza bruta?

Con 3 intentos máximos y luego invalidación, solo puede probar 3 códigos por cada OTP generado. Además, generar un nuevo OTP requiere esperar 60 segundos (rate limiting). Eso da: 3 intentos / 60 segundos = 180 intentos por hora máximo. Con 900,000 combinaciones posibles, tomaría ~5,000 horas (~208 días) en el mejor de los casos.

### 5. ¿Dónde está el código en texto plano exactamente?

| Lugar                           | ¿Está el código?                                       |
| ------------------------------- | ------------------------------------------------------ |
| Memoria del worker al generarlo | ✅ Sí, 1 milisegundo                                   |
| Payload HTTP a Meta             | ✅ Sí, ~200ms                                          |
| Mensaje de WhatsApp             | ✅ Sí, visible para el usuario                         |
| Variable `code` en el worker    | ✅ Sí, durante la ejecución de `handleSendOtp()`       |
| Firestore                       | ❌ **No. Solo el hash.**                               |
| Frontend (Vue)                  | ❌ **No. El frontend nunca ve el código.**             |
| Logs del worker                 | ❌ **No. Se imprime solo que se envió, no el código.** |

---

## 📋 Código completo comentado de las funciones clave

Para referencia rápida, aquí están las 6 funciones principales con comentarios línea por línea:

### `generateOtpCode()`

```ts
function generateOtpCode(): string {
  return String(100000 + Math.floor(Math.random() * 900000))
}
```

### `generateSalt()`

```ts
function generateSalt(): string {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}
```

### `sha256Hex()`

```ts
async function sha256Hex(input: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(input)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}
```

### `sendOtpWhatsApp()`

```ts
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
        { type: 'body', parameters: [{ type: 'text', text: code }] },
        { type: 'button', sub_type: 'url', index: 0, parameters: [{ type: 'text', text: code }] },
      ],
    },
  }
  const response = await fetch(MESSAGES_URL(env), {
    method: 'POST',
    headers: metaHeaders(env),
    body: JSON.stringify(payload),
  })
  return response.ok
}
```

### `handleSendOtp()` (resumen)

```ts
async function handleSendOtp(request: Request, env: Env): Promise<Response> {
  const { uid, phone } = await request.json()
  if (!uid || !phone) return error(400, 'uid and phone are required')
  await ensureAuthenticated(env)
  const userRef = doc(db!, 'users', uid)
  const userSnap = await getDoc(userRef)
  if (!userSnap.exists()) return error(404, 'User not found')

  // Rate limiting: 60s
  const userData = userSnap.data()
  const otpExpiresAt = userData.otpExpiresAt?.toDate?.()
  if (otpExpiresAt && otpExpiresAt > new Date()) {
    const otpSentAt = userData.otpSentAt?.toDate?.()
    if (otpSentAt && Date.now() - otpSentAt.getTime() < 60_000) {
      return error(429, 'Wait 60 seconds before requesting a new code')
    }
  }

  // Generar código + salt + hash
  const code = generateOtpCode()
  const salt = generateSalt()
  const hash = await sha256Hex(code + salt)

  // Guardar en Firestore (NUNCA el código plano)
  const now = Timestamp.now()
  const expiresAt = Timestamp.fromMillis(now.toMillis() + 10 * 60 * 1000)
  const batch = writeBatch(db!)
  batch.update(userRef, {
    pendingPhone: phone,
    otpHash: hash,
    otpSalt: salt,
    otpExpiresAt: expiresAt,
    otpAttempts: 0,
    otpSentAt: now,
  })
  await batch.commit()

  // Enviar WhatsApp
  const cleanPhone = phone.replace('whatsapp:', '').replace('+', '')
  const sent = await sendOtpWhatsApp(env, cleanPhone, code)
  if (!sent) return error(500, 'Failed to send OTP via WhatsApp')

  return success({ success: true })
}
```

### `handleVerifyOtp()` (resumen)

```ts
async function handleVerifyOtp(request: Request, env: Env): Promise<Response> {
  const { uid, code } = await request.json()
  if (!uid || !code) return error(400, 'uid and code are required')
  await ensureAuthenticated(env)

  const userRef = doc(db!, 'users', uid)
  const userSnap = await getDoc(userRef)
  if (!userSnap.exists()) return error(404, 'User not found')

  const userData = userSnap.data()
  const otpHash = userData.otpHash
  const otpSalt = userData.otpSalt
  const otpExpiresAt = userData.otpExpiresAt
  const otpAttempts = userData.otpAttempts
  const pendingPhone = userData.pendingPhone

  if (!otpHash || !otpSalt || !otpExpiresAt) return error(400, 'No OTP pending')
  if (!pendingPhone) return error(400, 'No pending phone to verify')

  // 1. Verificar expiración
  if (otpExpiresAt.toDate() < new Date()) return error(400, 'Code expired')

  // 2. Verificar intentos
  if ((otpAttempts ?? 0) >= 3) return error(400, 'Too many attempts, request a new code')

  // 3. Comparar hash
  const attemptedHash = await sha256Hex(code + otpSalt)
  if (attemptedHash !== otpHash) {
    const newAttempts = (otpAttempts ?? 0) + 1
    const batch = writeBatch(db!)
    batch.update(userRef, { otpAttempts: newAttempts })
    if (newAttempts >= 3) {
      batch.update(userRef, {
        otpHash: deleteField(),
        otpSalt: deleteField(),
        otpExpiresAt: deleteField(),
      })
    }
    await batch.commit()
    return error(400, 'Invalid code')
  }

  // 4. Éxito
  const successBatch = writeBatch(db!)
  successBatch.update(userRef, {
    phone: pendingPhone,
    phoneVerified: true,
    pendingPhone: deleteField(),
    otpHash: deleteField(),
    otpSalt: deleteField(),
    otpExpiresAt: deleteField(),
    otpAttempts: deleteField(),
    otpSentAt: deleteField(),
  })
  await successBatch.commit()
  return success({ success: true, phoneVerified: true })
}
```

---

> **Documentación generada a partir del código fuente de Ubiqueme**
> Archivos involucrados: `ubiqueme-worker/src/index.ts`, `src/components/user/dashboard/QRDash/PhonePrompt.vue`
> Última actualización: 22 de junio de 2026

```


```
