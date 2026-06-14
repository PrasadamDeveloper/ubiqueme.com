# 🛠️ Documentación Técnica: Ubiqueme Worker

Este componente actúa como una pasarela de seguridad entre la interfaz de usuario y la base de datos Firestore. Su función principal es la recuperación de datos sensibles mediante una arquitectura de servidor para evitar la exposición de credenciales en el cliente.

## Arquitectura del Sistema

El sistema utiliza la **API REST de Google Cloud** en lugar de librerías cliente pesadas. Esto permite un rendimiento óptimo en entornos de ejecución restringidos como Cloudflare Workers (V8 Isolates).

### Flujo de Ejecución:

1. **Petición Entrante**: Recepción de un identificador de usuario (`uid`) vía POST.
2. **Autenticación**: Generación de un Token de Acceso (Access Token) mediante el intercambio de un JWT firmado.
3. **Consulta de Datos**: Comunicación con los endpoints de Firestore utilizando el token obtenido.
4. **Respuesta**: Procesamiento y mapeo de los tipos de datos de Firestore antes de la entrega al cliente.

---

## 🔐 1. Protocolo de Autenticación OAuth2

La autenticación se realiza mediante la implementación manual del flujo de cuenta de servicio, garantizando una ejecución ligera.

### Generación del JWT (JSON Web Token)

Se construye un objeto JWT compuesto por:

- **Header**: Especificación del algoritmo de firma `RS256`.
- **Payload**: Declaración de emisor (`iss`), audiencia (`aud`) y alcances de acceso (`scope`).
- **Firma**: Ejecutada mediante la API nativa `crypto.subtle.sign` para asegurar la integridad y origen de la petición ante los servidores de Google.

### Gestión de Claves Criptográficas

Se utiliza la API Web Crypto (`crypto.subtle.importKey`) con el estándar `pkcs8`. Este proceso transforma la clave privada en un objeto criptográfico optimizado para el motor de ejecución, evitando la latencia de procesamiento de texto plano.

---

## 2. Integración con Firestore REST API

La respuesta original de Firestore contiene estructuras de datos complejas para definir tipos. Este componente implementa un mapeador automático.

**Transformación de Datos:**

- Se extraen los valores reales de objetos de tipo `stringValue`, `integerValue`, `booleanValue`, etc.
- Se unifican en un objeto JSON estándar compatible con cualquier interfaz de frontend.

---

## 3. Optimización de Lectura

El componente está diseñado para una ejecución de paso único:

- **Reducción de Peticiones**: Se elimina la necesidad de consultar documentos intermedios si el identificador final ya es conocido por la aplicación.
- **Latencia**: El arranque en frío (cold start) se mantiene por debajo de los 10ms debido a la ausencia de dependencias externas.

---

## 4. Configuración de Seguridad y CORS

El componente implementa el protocolo de intercambio de recursos de origen cruzado (CORS).

- Se gestionan las peticiones `OPTIONS` (Preflight).
- Se restringen los métodos permitidos a `POST` para asegurar la integridad de las transacciones.

---

## 5. Gestión de Secretos

La configuración se realiza de forma externa al código fuente mediante variables de entorno cifradas:

- `FIREBASE_PRIVATE_KEY`: Clave RSA del proveedor.
- `FIREBASE_CLIENT_EMAIL`: Identificador de la cuenta de servicio.
- `FIREBASE_PROJECT_ID`: Identificador del proyecto en Google Cloud.

## 6. Referencia de Implementación (Código Fuente)

Esta sección contiene el código íntegro del Worker. Se han incluido comentarios técnicos para facilitar el seguimiento de la lógica criptográfica y de comunicación.

```typescript
/**
 * Definición de tipos para las variables de entorno configuradas en Cloudflare.
 */
interface Env {
  FIREBASE_PROJECT_ID: string;
  FIREBASE_CLIENT_EMAIL: string;
  FIREBASE_PRIVATE_KEY: string;
}

/**
 * Endpoints globales para el intercambio de tokens y acceso a Firestore.
 */
const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const FIRESTORE_BASE = 'https://firestore.googleapis.com/v1';

export default {
  /**
   * Punto de entrada principal (Handler).
   * Gestiona el ciclo de vida de la petición: Validación -> Auth -> Consulta -> Respuesta.
   */
  async fetch(request: Request, env: Env): Promise<Response> {
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Respuesta inmediata a peticiones Preflight (CORS)
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // El worker solo acepta peticiones de tipo POST
    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405, headers: corsHeaders });
    }

    try {
      const body: any = await request.json();
      const uid = body.uid;

      if (!uid) {
        return Response.json({ error: 'UID requerido' }, { status: 400, headers: corsHeaders });
      }

      // 1. Fase de Autenticación: Obtención del token OAuth2 de Google
      const accessToken = await getAccessToken(
        env.FIREBASE_CLIENT_EMAIL,
        env.FIREBASE_PRIVATE_KEY
      );

      // 2. Fase de Consulta: Recuperación del documento de usuario
      const userData = await getDocument(
        env.FIREBASE_PROJECT_ID,
        accessToken,
        'users',
        uid
      );

      if (!userData) {
        return Response.json({ error: 'Usuario no encontrado' }, { status: 404, headers: corsHeaders });
      }

      // 3. Fase de Respuesta: Retorno de datos normalizados
      return Response.json({
        email: userData.email,
        displayName: userData.displayName || userData.name || 'Usuario'
      }, { headers: corsHeaders });

    } catch (err: any) {
      console.error('Worker Execution Error:', err);
      return Response.json({
        error: err.message || 'Error interno del servidor'
      }, { status: 500, headers: corsHeaders });
    }
  }
};

/**
 * Genera un JSON Web Token firmado y lo intercambia por un Access Token de Google.
 */
async function getAccessToken(clientEmail: string, privateKey: string) {
  const now = Math.floor(Date.now() / 1000);
  const jwtHeader = { alg: 'RS256', typ: 'JWT' };
  const jwtPayload = {
    iss: clientEmail,
    sub: clientEmail,
    aud: TOKEN_URL,
    iat: now,
    exp: now + 3600, // Duración de 1 hora
    scope: 'https://www.googleapis.com/auth/datastore'
  };

  const encodedHeader = base64urlEncode(JSON.stringify(jwtHeader));
  const encodedPayload = base64urlEncode(JSON.stringify(jwtPayload));
  const signatureInput = `${encodedHeader}.${encodedPayload}`;

  // Firma criptográfica del input usando RS256
  const key = await importPrivateKey(privateKey);
  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    key,
    new TextEncoder().encode(signatureInput)
  );

  const jwt = `${signatureInput}.${base64urlEncode(signature)}`;

  // Petición de intercambio al servidor de Google
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt
    })
  });

  const data: any = await res.json();
  if (!data.access_token) {
    throw new Error(`Google OAuth failure: ${JSON.stringify(data)}`);
  }
  return data.access_token;
}

/**
 * Importa una clave privada tipo PEM al formato nativo Web Crypto.
 */
async function importPrivateKey(pem: string) {
  const cleanPem = pem
    .replace('-----BEGIN PRIVATE KEY-----', '')
    .replace('-----END PRIVATE KEY-----', '')
    .replace(/\\n/g, '')
    .replace(/\n/g, '')
    .trim();

  const binaryDerString = atob(cleanPem);
  const binaryDer = new Uint8Array(binaryDerString.length);
  for (let i = 0; i < binaryDerString.length; i++) {
    binaryDer[i] = binaryDerString.charCodeAt(i);
  }

  return await crypto.subtle.importKey(
    'pkcs8',
    binaryDer.buffer,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  );
}

/**
 * Recupera un documento de Firestore mediante peticiones HTTP autenticadas.
 */
async function getDocument(projectId: string, token: string, collection: string, docId: string) {
  const url = `${FIRESTORE_BASE}/projects/${projectId}/databases/(default)/documents/${collection}/${docId}`;
  const res = await fetch(url, {
    headers: { 'Authorization': `Bearer ${token}` }
  });

  if (res.status === 404) return null;
  const data: any = await res.json();
  
  if (data.error) throw new Error(`Firestore REST Error: ${data.error.message}`);
  
  // Transformación de la estructura de campos de Google a JSON estándar
  return data.fields ? mapFirestoreFields(data.fields) : null;
}

/**
 * Mapea los tipos específicos de Firestore a tipos primitivos de JavaScript.
 */
function mapFirestoreFields(fields: any) {
  const result: any = {};
  for (const [key, value] of Object.entries(fields)) {
    const val: any = value;
    if ('stringValue' in val) result[key] = val.stringValue;
    else if ('integerValue' in val) result[key] = parseInt(val.integerValue, 10);
    else if ('booleanValue' in val) result[key] = val.booleanValue;
    else if ('doubleValue' in val) result[key] = parseFloat(val.doubleValue);
  }
  return result;
}

/**
 * Codificador Base64URL según estándar RFC 4648 sección 5.
 */
function base64urlEncode(input: string | ArrayBuffer): string {
  let base64 = "";
  if (typeof input === 'string') {
    // Escapa caracteres multi-byte antes de btoa
    base64 = btoa(unescape(encodeURIComponent(input)));
  } else {
    const bytes = new Uint8Array(input);
    for (let i = 0; i < bytes.length; i++) {
      base64 += String.fromCharCode(bytes[i]);
    }
    base64 = btoa(base64);
  }
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
```

