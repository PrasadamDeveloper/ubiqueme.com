# 🚀 Master Template: Cloudflare Worker ↔️ Firebase Firestore

Este documento proporciona una plantilla estandarizada para la implementación de backends de alto rendimiento en Cloudflare Workers con integración directa a Google Firebase Firestore.

## 🏗️ 1. Definición Técnica
Este sistema utiliza comunicación de bajo nivel, operando directamente sobre los protocolos HTTP y Criptografía nativa. 
- **Rendimiento**: Minimización del tiempo de arranque y consumo de recursos.
- **Seguridad**: Aislamiento total de las credenciales maestras del entorno del cliente.

---

## 🛠️ 2. Configuración de Entorno (`wrangler.jsonc`)
Se requiere la especificación del nombre del servicio y la activación de los flags de compatibilidad necesarios para operaciones criptográficas.

```json
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "worker-service-name",
  "main": "src/index.ts",
  "compatibility_date": "2026-04-22",
  "compatibility_flags": [ "nodejs_compat" ]
}
```

## 🔐 3. Suministro de Credenciales (Secrets)
Para la ejecución del servicio, se deben configurar las siguientes variables de entorno cifradas en la plataforma de despliegue:
- `FIREBASE_PROJECT_ID`: Identificador único del proyecto.
- `FIREBASE_CLIENT_EMAIL`: Email asociado a la cuenta de servicio.
- `FIREBASE_PRIVATE_KEY`: Clave privada RSA.

---

## ⚙️ 4. Estructura de Código Fuente (`index.ts`)

### Definición de Tipos
Se definen las interfaces necesarias para el manejo de variables de entorno y respuestas de datos.

```typescript
interface Env {
  FIREBASE_PROJECT_ID: string;
  FIREBASE_CLIENT_EMAIL: string;
  FIREBASE_PRIVATE_KEY: string;
}
```

### Funciones de Autenticación
Implementación del flujo de obtención de tokens mediante el intercambio de JWT firmados.

```typescript
async function getAccessToken(clientEmail: string, privateKey: string) {
  const now = Math.floor(Date.now() / 1000);
  const jwtHeader = base64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const jwtPayload = base64url(JSON.stringify({
    iss: clientEmail, sub: clientEmail,
    aud: 'https://oauth2.googleapis.com/token',
    iat: now, exp: now + 3600,
    scope: 'https://www.googleapis.com/auth/datastore'
  }));

  const signatureInput = `${jwtHeader}.${jwtPayload}`;
  const key = await importPrivateKey(privateKey);
  const signature = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, new TextEncoder().encode(signatureInput));
  const jwt = `${signatureInput}.${base64url(signature)}`;

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: jwt })
  });
  const data: any = await res.json();
  return data.access_token;
}

async function importPrivateKey(pem: string) {
  const cleanPem = pem.replace(/-----(BEGIN|END) PRIVATE KEY-----/g, '').replace(/\\n/g, '').replace(/\n/g, '').trim();
  const binaryDer = new Uint8Array(atob(cleanPem).split('').map(c => c.charCodeAt(0)));
  return await crypto.subtle.importKey('pkcs8', binaryDer.buffer, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['sign']);
}

function base64url(input: string | ArrayBuffer): string {
  let base64 = typeof input === 'string' ? btoa(unescape(encodeURIComponent(input))) : btoa(String.fromCharCode(...new Uint8Array(input)));
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
```

### Gestión de Firestore
Procesamiento de peticiones fetch y normalización de la estructura de datos retornada por la API REST.

```typescript
async function getDocument(projectId: string, token: string, collection: string, docId: string) {
  const res = await fetch(`https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${collection}/${docId}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data: any = await res.json();
  
  const result: any = {};
  if (data.fields) {
    for (const [key, value] of Object.entries(data.fields)) {
      const v: any = value;
      result[key] = v.stringValue || parseInt(v.integerValue) || v.booleanValue || v.doubleValue;
    }
  }
  return result;
}
```

### Controlador de Peticiones (Handler)
Definición del punto de entrada del Worker y gestión de respuestas CORS.

```typescript
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const headers = { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' };
    if (request.method === 'OPTIONS') return new Response(null, { headers });

    try {
      const body: any = await request.json();
      const token = await getAccessToken(env.FIREBASE_CLIENT_EMAIL, env.FIREBASE_PRIVATE_KEY);
      const data = await getDocument(env.FIREBASE_PROJECT_ID, token, 'targets_collection', body.identifier);
      
      return new Response(JSON.stringify(data), { headers });
    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), { status: 500, headers });
    }
  }
};
```

---

## 🚀 5. Procedimiento de Despliegue
1. Acceso al directorio del servicio.
2. Ejecución del comando de publicación: `npx wrangler deploy`.
3. Verificación de la URL productiva proporcionada por la plataforma.
