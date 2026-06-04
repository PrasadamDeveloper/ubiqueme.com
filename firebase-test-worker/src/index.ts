/**
 * ===============================================================
 *  FIREBASE SDK TEST WORKER — Cloudflare Workers
 * ===============================================================
 *
 *  Propósito:
 *    Worker de prueba para verificar si el SDK de Firebase
 *    (firebase/app, firebase/firestore, firebase/auth, firebase/firestore/lite)
 *    es compatible con el runtime de Cloudflare Workers.
 *
 *  Contexto del proyecto (ubiqueme.com):
 *    El proyecto principal (ubiqueme-worker) accede a Firestore mediante
 *    REST API + cuenta de servicio (jose + OAuth2). Esta prueba determinó
 *    que NO es posible reemplazar ese enfoque con firebase/auth porque
 *    el SDK requiere APIs del browser (XMLHttpRequest, indexedDB, etc.)
 *    que no existen en Workers.
 *
 *  Resultados de la ejecución:
 *    ✅ initializeApp()     → funciona
 *    ✅ getFirestore(app)   → funciona
 *    ❌ getAuth(app)        → falla (incompatible con Workers)
 *    ❓ firebase/firestore/lite + getDocs() → no se pudo probar
 *       porque getAuth() falló primero. Teóricamente podría funcionar
 *       si las reglas de seguridad lo permiten sin auth.
 *
 *  Conclusión:
 *    - El SDK de Firebase NO es viable para Workers que necesiten
 *      autenticación o permisos de administración.
 *    - El enfoque actual (REST API + service account) es el correcto.
 *    - Si se desea simplificar, crear una clase FirestoreClient que
 *      encapsule las REST calls es mejor que forzar Firebase SDK.
 *
 *  Cómo ejecutar:
 *    wrangler dev (necesita las env vars en .dev.vars o dashboard)
 *    wrangler deploy
 *
 *  Variables de entorno requeridas:
 *    FIREBASE_PROJECT_ID, FIREBASE_API_KEY,
 *    FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY
 * ===============================================================
 */

import { initializeApp, getApps, FirebaseOptions, FirebaseApp } from 'firebase/app'
import { getFirestore, Firestore } from 'firebase/firestore'
import { getAuth, signInWithCustomToken, Auth, UserCredential } from 'firebase/auth'
import { SignJWT, importPKCS8 } from 'jose'
import type { ExecutionContext } from '@cloudflare/workers-types'

// ─── Env ───────────────────────────────────────────────────────
declare global {
  interface Env {
    FIREBASE_PROJECT_ID: string
    FIREBASE_API_KEY: string
    FIREBASE_CLIENT_EMAIL: string
    FIREBASE_PRIVATE_KEY: string
  }
}

// ─── Response helpers ──────────────────────────────────────────
function htmlPage(body: string): Response {
  return new Response(
    `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><title>Firebase Test Worker</title>
<style>
  body { font-family: monospace; background: #0d1117; color: #c9d1d9; padding: 20px; }
  h1 { color: #58a6ff; }
  .step { margin: 8px 0; padding: 10px 14px; border-radius: 6px; }
  .ok { background: #1a3a2a; border-left: 4px solid #3fb950; }
  .fail { background: #3a1a1a; border-left: 4px solid #f85149; }
  .info { background: #1a2a3a; border-left: 4px solid #58a6ff; }
  .label { font-weight: bold; }
  .error-msg { color: #f85149; margin-top: 4px; white-space: pre-wrap; word-break: break-word; }
  hr { border-color: #30363d; margin: 20px 0; }
</style>
</head>
<body><h1>🔥 Firebase SDK en Cloudflare Worker</h1>${body}</body></html>`,
    { headers: { 'content-type': 'text/html;charset=utf-8' } },
  )
}

function step(label: string, status: 'ok' | 'fail' | 'info', detail = ''): string {
  const emoji = status === 'ok' ? '✅' : status === 'fail' ? '❌' : 'ℹ️'
  return `<div class="step ${status}"><span class="label">${emoji} ${label}</span>${
    detail ? `<div class="error-msg">${escapeHtml(detail)}</div>` : ''
  }</div>`
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, '&').replace(/</g, '<').replace(/>/g, '>').replace(/\n/g, '<br>')
}

function formatLogs(logs: string[]): string {
  return logs.map((l) => `[${new Date().toISOString()}] ${l}`).join('\n')
}

// ─── Main handler ──────────────────────────────────────────────
export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const steps: string[] = []
    const logs: string[] = []

    function log(label: string, data?: unknown): void {
      const msg = data ? `${label}: ${JSON.stringify(data, null, 2)}` : label
      logs.push(msg)
      console.log(msg)
    }

    function failPage(): Response {
      const totalOk = steps.filter((s) => s.includes('class="ok"')).length
      const totalFail = steps.filter((s) => s.includes('class="fail"')).length
      const resumen = `<hr><h2>📊 Resumen</h2>
        <div class="step info">Pasos exitosos: ${totalOk} | Fallos: ${totalFail} | Total: ${steps.length}</div>
        <hr><h3>📋 Logs completos</h3>
        <pre style="background:#161b22;padding:16px;border-radius:8px;font-size:12px;overflow-x:auto">${escapeHtml(formatLogs(logs))}</pre>`
      return htmlPage(steps.join('\n') + resumen)
    }

    log('🔥 ===== INICIANDO PRUEBA FIREBASE SDK EN WORKER =====')
    log('Entorno:', {
      projectId: env.FIREBASE_PROJECT_ID,
      hasApiKey: !!env.FIREBASE_API_KEY,
      hasClientEmail: !!env.FIREBASE_CLIENT_EMAIL,
      hasPrivateKey: !!env.FIREBASE_PRIVATE_KEY,
    })

    // ── PASO 1: Import check ──────────────────────────────
    try {
      log('📦 PASO 1: Verificando que los imports funcionaron')
      if (typeof initializeApp !== 'function') throw new Error('initializeApp no es una función')
      if (typeof getFirestore !== 'function') throw new Error('getFirestore no es una función')
      if (typeof getAuth !== 'function') throw new Error('getAuth no es una función')
      log('✅ PASO 1: Imports OK — todos los símbolos son funciones')
      steps.push(step('PASO 1: Imports de firebase funcionan', 'ok'))
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e)
      log('❌ PASO 1: Fallaron los imports:', msg)
      steps.push(step('PASO 1: Imports de firebase', 'fail', msg))
    }

    // ── PASO 2: Firebase config ────────────────────────────
    let firebaseConfig: FirebaseOptions
    try {
      log('📦 PASO 2: Creando config de Firebase')
      firebaseConfig = {
        apiKey: env.FIREBASE_API_KEY,
        authDomain: `${env.FIREBASE_PROJECT_ID}.firebaseapp.com`,
        projectId: env.FIREBASE_PROJECT_ID,
        storageBucket: `${env.FIREBASE_PROJECT_ID}.firebasestorage.app`,
        messagingSenderId: 'unused',
        appId: 'unused:test-worker',
      }
      log('✅ PASO 2: Config creada correctamente')
      steps.push(step('PASO 2: Crear firebaseConfig', 'ok'))
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e)
      log('❌ PASO 2: Error creando config:', msg)
      steps.push(step('PASO 2: Crear firebaseConfig', 'fail', msg))
      return failPage()
    }

    // ── PASO 3: initializeApp ──────────────────────────────
    let app: FirebaseApp
    try {
      log('📦 PASO 3: Llamando initializeApp(firebaseConfig)')
      log('   Apps existentes antes:', getApps().length)
      app = initializeApp(firebaseConfig)
      log('✅ PASO 3: initializeApp() ejecutado sin error')
      log('   Nombre de la app:', app.name)
      log('   Apps existentes después:', getApps().length)
      steps.push(step('PASO 3: initializeApp()', 'ok', `app.name = ${app.name}`))
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e)
      log('❌ PASO 3: initializeApp() falló:', msg)
      steps.push(step('PASO 3: initializeApp()', 'fail', msg))
      return failPage()
    }

    // ── PASO 4: getFirestore ───────────────────────────────
    let db: Firestore
    try {
      log('📦 PASO 4: Llamando getFirestore(app)')
      db = getFirestore(app)
      log('✅ PASO 4: getFirestore() ejecutado sin error')
      log('   Firestore type:', typeof db)
      steps.push(step('PASO 4: getFirestore(app)', 'ok', `type=${typeof db}`))
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e)
      log('❌ PASO 4: getFirestore() falló:', msg)
      steps.push(step('PASO 4: getFirestore(app)', 'fail', msg))
      return failPage()
    }

    // ── PASO 5: getAuth ────────────────────────────────────
    let auth: Auth
    try {
      log('📦 PASO 5: Llamando getAuth(app)')
      auth = getAuth(app)
      log('✅ PASO 5: getAuth() ejecutado sin error')
      log('   Auth type:', typeof auth)
      steps.push(step('PASO 5: getAuth(app)', 'ok', `type=${typeof auth}`))
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e)
      log('❌ PASO 5: getAuth() falló:', msg)
      steps.push(step('PASO 5: getAuth(app)', 'fail', msg))
      return failPage()
    }

    // ── PASO 6: Generar Custom Token con jose ──────────────
    let customToken: string
    try {
      log('📦 PASO 6: Generando Custom Token JWT con jose (service account → uid)')
      const privateKey = await importPKCS8(env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'), 'RS256')
      log('   Private key importada OK')
      customToken = await new SignJWT({
        iss: env.FIREBASE_CLIENT_EMAIL,
        sub: env.FIREBASE_CLIENT_EMAIL,
        aud: 'https://identitytoolkit.googleapis.com/google.identity.identitytoolkit.v1.IdentityToolkit',
        uid: 'test-worker-uid',
        claims: { role: 'admin' },
      })
        .setProtectedHeader({ alg: 'RS256' })
        .setIssuedAt()
        .setExpirationTime('1h')
        .sign(privateKey)
      log(
        '✅ PASO 6: Custom Token generado (primeros 50 chars):',
        customToken.substring(0, 50) + '...',
      )
      steps.push(step('PASO 6: Generar Custom Token JWT', 'ok', 'Token generado correctamente'))
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e)
      log('❌ PASO 6: Error generando custom token:', msg)
      steps.push(step('PASO 6: Generar Custom Token JWT', 'fail', msg))
      return failPage()
    }

    // ── PASO 7: signInWithCustomToken ──────────────────────
    let userCredential: UserCredential
    try {
      log('📦 PASO 7: Intentando signInWithCustomToken(auth, customToken)')
      log('   Token (completo):', customToken)
      userCredential = await signInWithCustomToken(auth, customToken)
      log('✅ PASO 7: signInWithCustomToken() ejecutado sin error')
      log('   UID:', userCredential.user.uid)
      log('   Email:', userCredential.user.email)
      const idToken = await userCredential.user.getIdToken()
      log('   Token de acceso (primeros 50):', idToken.substring(0, 50) + '...')
      steps.push(step('PASO 7: signInWithCustomToken()', 'ok', `UID=${userCredential.user.uid}`))
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e)
      const stack = e instanceof Error ? e.stack : ''
      log('❌ PASO 7: signInWithCustomToken() falló:', msg)
      log('   Stack:', stack)
      const errorDetail =
        msg.includes('fetch') || msg.includes('XMLHttpRequest')
          ? 'Parece que el SDK intenta usar XMLHttpRequest/fetch de forma incompatible con Workers.\n\nEl SDK de Firebase Auth requiere APIs del browser (window, XMLHttpRequest) que no existen en Workers Runtime.'
          : msg
      steps.push(step('PASO 7: signInWithCustomToken()', 'fail', errorDetail))
      return failPage()
    }

    // ── PASO 8: getDocs (Firestore Lite) ───────────────────
    try {
      log('📦 PASO 8: Importando firebase/firestore/lite')
      const { collection, getDocs } = await import('firebase/firestore/lite')
      log('   Imports de /lite OK')
      const colRef = collection(db, 'test-collection')
      log('   collection() OK')
      log('📦 PASO 8: Ejecutando getDocs()')
      const snapshot = await getDocs(colRef)
      log('✅ PASO 8: getDocs() ejecutado sin error')
      log('   Documentos encontrados:', snapshot.size)
      const docsData = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
      log('   Datos:', JSON.stringify(docsData))
      steps.push(
        step('PASO 8: getDocs(collection, /lite)', 'ok', `${snapshot.size} documentos encontrados`),
      )
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e)
      const stack = e instanceof Error ? e.stack : ''
      log('❌ PASO 8: getDocs() falló:', msg)
      log('   Stack:', stack)
      const errorDetail =
        msg.includes('fetch') || msg.includes('XMLHttpRequest')
          ? 'El SDK Lite intenta usar fetch/xhr propio del browser y no es compatible con Workers Runtime'
          : msg.includes('credentials')
            ? 'El SDK Lite necesita credential del auth state activo y no puede encontrarlo en Workers'
            : msg
      steps.push(step('PASO 8: getDocs(collection, /lite)', 'fail', errorDetail))
    }

    // ── RESUMEN ────────────────────────────────────────────
    const totalOk = steps.filter((s) => s.includes('class="ok"')).length
    const totalFail = steps.filter((s) => s.includes('class="fail"')).length
    const resumen = `<hr><h2>📊 Resumen</h2>
      <div class="step info">Pasos exitosos: ${totalOk} | Fallos: ${totalFail} | Total: ${steps.length}</div>
      <hr><h3>📋 Logs completos</h3>
      <pre style="background:#161b22;padding:16px;border-radius:8px;font-size:12px;overflow-x:auto">${escapeHtml(formatLogs(logs))}</pre>`

    return htmlPage(steps.join('\n') + resumen)
  },
}
