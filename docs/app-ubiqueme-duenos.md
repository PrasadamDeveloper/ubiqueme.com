# App Ubiqueme — Dueños de QR (Ionic App)

> Documentación completa para construir una app móvil Ionic dirigida **exclusivamente a los dueños de códigos QR de Ubiqueme**.  
> No incluye landing pública, vista de QR escaneado, admin, checkout, ni páginas legales.

---

## 1. Stack Tecnológico

| Capa                | Tecnología                               | Versión       |
| ------------------- | ---------------------------------------- | ------------- |
| Framework principal | **Ionic 8** (con Vue 3)                  | `^8.x`        |
| UI nativa           | **Ionic Vue** + **Capacitor**            | `^8.x`        |
| Lenguaje            | **TypeScript**                           | `~5.9`        |
| Sistema de build    | **Vite**                                 | `^7.x`        |
| Estilos             | **Tailwind CSS 4** + Ionic UI Components | `^4.x`        |
| Estado global       | **Pinia** + persistencia                 | `^3.x`        |
| Router              | **Vue Router** (con transiciones Ionic)  | `^5.x`        |
| Backend             | **Firebase** (Auth + Firestore)          | `^12.x`       |
| Iconos              | **oh-vue-icons** (mismos que web)        | `^1.x`        |
| Toasts              | **vue-sonner**                           | `^2.x`        |
| Mapas               | **Leaflet** (para ubicación en QR)       | `^1.9`        |
| QR                  | **qrcode.vue** + **qrcode**              | `^3.8 / ^1.5` |
| Compresión imágenes | **browser-image-compression**            | `^2.x`        |
| Captura pantalla    | **html2canvas**                          | `^1.4`        |
| PDF                 | **jspdf**                                | `^4.x`        |
| Descargas           | **FileSaver** / Capacitor Filesystem     | —             |

> La app **no** requiere Workers de Cloudflare del lado del frontend, pero Firebase Admin sí está en el worker.

---

## 2. Alcance de la App (qué SÍ y qué NO incluye)

### ✅ Incluye

- **Login / Register / Verify** (auth con Firebase + OTP)
- **Mis QR** — CRUD completo de códigos QR del usuario
  - Lista con estado (Active, Canceled, Process, Error, Paused)
  - Scans count + lastScan
  - Crear QR digital
  - Descargar QR
  - Ver historial de escaneos
  - Editar nombre
- **Notificaciones** — Centro de notificaciones del usuario
  - Tipos: `qr_scan`, `system`, `billing`
  - Lista con estado leído/no leído
  - Marcar como leídas
- **Configuración** — Ajustes del perfil
  - Nombre, email, teléfono
  - Preferencias de notificación (email, SMS, WhatsApp)
  - Cerrar sesión
  - Eliminar cuenta
- **Planes / Pricing** (opcional) — Ver planes disponibles y estado de suscripción actual

### ❌ Excluye (existe en web pero NO va en app)

- Landing page `/` (HomeView pública)
- Vista de QR escaneado `/qr/:qrId`
- Admin dashboard `/admin`
- Checkout `/checkout/:planId`
- Páginas: Help, Privacy, Contact, Terms, DeleteAccount, SecurityTest
- Componentes de admin (BanConfirmPrompt, CancelReasonPrompt, etc.)
- Componentes de home (Features, HowItWorks, PricingPlans, StepByStep, VideoGrid)

---

## 3. Estructura de Directorios (Sugerida)

```
src/
├── App.vue                      # Root — solo <ion-app> + <router-view>
├── main.ts                      # Entry point — configura Ionic + Firebase + Pinia
├── styles.css                   # Tailwind base + overrides Ionic
├── firebase.ts                  # Config Firebase (MISMA que web)
├── handleAuth.ts                # Logout utility (MISMA que web)
│
├── router/
│   └── index.ts                 # Rutas con guards de auth
│
├── stores/
│   ├── user.ts                  # Mismo store que web
│   ├── components.ts            # Store de componente activo (se elimina si no aplica)
│   └── imageStore.ts            # Mismo que web
│
├── interfaces/
│   ├── IMyQR.ts                 # Misma que web
│   ├── INotification.ts         # Misma que web
│   ├── ISubscription.ts         # Misma que web
│   ├── IUser.ts                 # Misma que web
│   ├── IQRCard.ts               # Misma que web
│   └── IPublicQR.ts             # (si se necesita, misma que web)
│
├── composables/
│   ├── useQRDownload.ts         # Mismo que web
│   └── (otros reutilizables)
│
├── directives/
│   └── vLazyVideo.ts            # (probablemente no se necesita en app)
│
├── layouts/
│   ├── AuthLayout.vue           # Layout limpio para login/register/verify
│   └── TabsLayout.vue           # Layout con IonTabs para secciones protegidas
│
├── views/
│   ├── auth/
│   │   ├── LoginView.vue        # Login con IonInput
│   │   ├── RegisterView.vue     # Register con IonInput
│   │   └── VerifyView.vue       # Verify OTP con IonInput
│   │
│   └── app/                     # Secciones protegidas (dentro de tabs)
│       ├── NotificationsView.vue  # Centro de notificaciones
│       ├── MyQRView.vue           # Lista de QR del usuario
│       ├── SettingsView.vue       # Ajustes del perfil
│       └── PricingView.vue        # (opcional) Planes y suscripción
│
├── components/
│   ├── ui/
│   │   └── MainLoader.vue       # Loader reutilizable (mismo que web)
│   │
│   ├── auth/
│   │   └── VerificationBanner.vue  # Banner de verificación (mismo que web)
│   │
│   └── app/
│       ├── QRCard.vue              # Card de QR (adaptado de dashboard/QRDash/QRCard.vue)
│       ├── QRCardMobile.vue        # Card mobile de QR (adaptado de web)
│       ├── CreateQRModal.vue       # Modal crear QR (adaptado de web)
│       ├── NotificationCard.vue    # Card de notificación (adaptado de NotificationsDash.vue)
│       └── SettingsForm.vue        # Formulario de ajustes (adaptado de web)
│
└── assets/
    ├── Logo_Ubiqueme.webp
    └── (otros assets)
```

---

## 4. Esquema de Rutas

```ts
// src/router/index.ts
const routes = [
  // ── Auth (sin layout de tabs) ──────────────────────
  {
    path: '/login',
    name: 'login',
    meta: { requiresAuth: false },
    component: () => import('@/views/auth/LoginView.vue'),
  },
  {
    path: '/register',
    name: 'register',
    meta: { requiresAuth: false },
    component: () => import('@/views/auth/RegisterView.vue'),
  },
  {
    path: '/verify',
    name: 'verify',
    meta: { requiresAuth: false },
    component: () => import('@/views/auth/VerifyView.vue'),
  },

  // ── App (protegido, con TabsLayout) ────────────────
  {
    path: '/',
    component: () => import('@/layouts/TabsLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        redirect: { name: 'notifications' },
      },
      {
        path: 'notifications',
        name: 'notifications',
        meta: { tab: 0, title: 'Notificaciones' },
        component: () => import('@/views/app/NotificationsView.vue'),
      },
      {
        path: 'my-qr',
        name: 'my-qr',
        meta: { tab: 1, title: 'Mis QR' },
        component: () => import('@/views/app/MyQRView.vue'),
      },
      {
        path: 'settings',
        name: 'settings',
        meta: { tab: 2, title: 'Configuración' },
        component: () => import('@/views/app/SettingsView.vue'),
      },
    ],
  },

  // ── Pricing (opcional, puede ir fuera o dentro de tabs) ──
  {
    path: '/pricing',
    name: 'pricing',
    meta: { requiresAuth: false }, // o true si es solo para usuarios logueados
    component: () => import('@/views/app/PricingView.vue'),
  },

  // ── Catch-all ──────────────────────────────────────
  {
    path: '/:pathMatch(.*)*',
    redirect: { name: 'notifications' },
  },
]
```

### Guard de Autenticación

- Misma lógica que `src/router/index.ts` de la web:
  - Esperar a que Firebase valide el estado inicial (`waitForAuth()`)
  - Si `requiresAuth && !isAuth` → redirigir a `/login`
  - Si `(login o register) && isAuth` → redirigir a `/notifications`

---

## 5. Configuración de Firebase

### `src/firebase.ts` — **IDENTICA a la web**

```ts
import { initializeApp } from 'firebase/app'
import { getAnalytics } from 'firebase/analytics'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyBUnGSjA5JAstb-l-NukKeNmrBQyTEO1D4',
  authDomain: 'ubiqueme-services.firebaseapp.com',
  projectId: 'ubiqueme-services',
  storageBucket: 'ubiqueme-services.firebasestorage.app',
  messagingSenderId: '239704119257',
  appId: '1:239704119257:web:f77f867a60796c379bebc8',
}

const firebaseApp = initializeApp(firebaseConfig)
const _analytics = getAnalytics(firebaseApp)
const auth = getAuth(firebaseApp)
const db = getFirestore(firebaseApp)

export { auth, db }
```

### Firestore Offline Persistence (NUEVO para app móvil)

```ts
import { enableMultiTabIndexedDbPersistence } from 'firebase/firestore'

// En main.ts, después de inicializar db:
enableMultiTabIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    // Múltiples pestañas abiertas — persistence solo en una
  } else if (err.code === 'unimplemented') {
    // Navegador no soporta
  }
})
```

> En Capacitor (iOS/Android) se puede habilitar **persistencia SQLite** con el plugin `@capacitor-community/firebase-firestore` si se necesita offline robusto.

---

## 6. Store de Usuario (Pinia)

**MISMO store que web:** `src/stores/user.ts`

Se importa tal cual, con persistencia `pinia-plugin-persistedstate`.  
En Ionic/Capacitor, `localStorage` funciona igual.

---

## 7. Componentes a Reutilizar (con adaptaciones)

| Componente Web (ruta original)                                      | Adaptación para App                            | Cambios necesarios                                              |
| ------------------------------------------------------------------- | ---------------------------------------------- | --------------------------------------------------------------- |
| `src/components/auth/VerificationBanner.vue`                        | → `src/components/auth/VerificationBanner.vue` | Ninguno (es puramente visual)                                   |
| `src/components/user/dashboard/QRDash/QRCard.vue`                   | → `src/components/app/QRCard.vue`              | Reemplazar clases Tailwind desktop por `ion-item` / `ion-card`  |
| `src/components/user/dashboard/QRDash/QRCardMobile.vue`             | → ideal para app, casi no requiere cambios     | Ajustar padding y reemplazar `button` por `ion-button`          |
| `src/components/user/dashboard/QRDash/CreateDigitalQRModal.vue`     | → `src/components/app/CreateQRModal.vue`       | Reemplazar modal custom por `ion-modal`                         |
| `src/components/user/dashboard/notifications/NotificationsDash.vue` | → `src/components/app/NotificationCard.vue`    | Extraer el bucle de notificaciones, usarlo dentro de `ion-list` |
| `src/components/user/dashboard/settings/SettingsDash.vue`           | → `src/components/app/SettingsForm.vue`        | Reemplazar inputs por `ion-item` + `ion-input`                  |
| `src/components/user/dashboard/pricing/PricingDash.vue`             | → `src/components/app/PricingCards.vue`        | Reemplazar por `ion-card` si se incluye pricing                 |
| `src/components/ui/MainLoader.vue`                                  | → `src/components/ui/MainLoader.vue`           | Mismo                                                           |
| `src/composables/useQRDownload.ts`                                  | → `src/composables/useQRDownload.ts`           | Mismo (usa `html2canvas` + `jspdf`)                             |
| `src/directives/vLazyVideo.ts`                                      | ❌ No usar                                     | No hay videos en la app                                         |

---

## 8. Tabs Layout (Ionic Tabs)

```vue
<!-- src/layouts/TabsLayout.vue -->
<template>
  <ion-page>
    <ion-tabs>
      <ion-tab-bar slot="bottom">
        <ion-tab-button tab="notifications" href="/notifications">
          <ion-icon :icon="notificationsOutline" />
          <ion-label>Notificaciones</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="my-qr" href="/my-qr">
          <ion-icon :icon="qrCodeOutline" />
          <ion-label>Mis QR</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="settings" href="/settings">
          <ion-icon :icon="settingsOutline" />
          <ion-label>Configuración</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  </ion-page>
</template>
```

> Usar iconos de **Ionicons** (vienen con Ionic) o **oh-vue-icons** si prefieres mantener consistencia con web.  
> El badge de notificaciones no leídas va en `ion-tab-button`.

---

## 9. Instalación Paso a Paso

### 9.1 Crear proyecto Ionic + Vue

```bash
npm install -g @ionic/cli
ionic start ubiqueme-app tabs --type vue
cd ubiqueme-app
```

### 9.2 Instalar dependencias del proyecto web

```bash
# Firebase
npm install firebase

# Pinia + persistencia
npm install pinia pinia-plugin-persistedstate

# Iconos (mismos que web)
npm install oh-vue-icons

# Toasts
npm install vue-sonner

# QR
npm install qrcode qrcode.vue

# Utilidades (mapas, PDF, captura)
npm install leaflet html2canvas jspdf browser-image-compression

# Tailwind CSS 4
npm install tailwindcss @tailwindcss/vite
```

### 9.3 Copiar archivos del proyecto web

```
src/interfaces/          →  src/interfaces/
src/stores/user.ts       →  src/stores/user.ts
src/stores/imageStore.ts →  src/stores/imageStore.ts (opcional)
src/firebase.ts           →  src/firebase.ts
src/handleAuth.ts         →  src/handleAuth.ts
src/composables/          →  src/composables/
```

### 9.4 Configurar Tailwind

```ts
// vite.config.ts
import tailwindcss from '@tailwindcss/vite'

plugins: [
  tailwindcss(),
  // ...
]
```

```css
/* src/styles.css */
@import 'tailwindcss';
```

### 9.5 Configurar Firebase Persistencia Offline

```ts
// src/main.ts (después de crear la app)
import { enableMultiTabIndexedDbPersistence } from 'firebase/firestore'
import { db } from './firebase'

enableMultiTabIndexedDbPersistence(db).catch(/* manejo de errores */)
```

### 9.6 Construir Native (Capacitor)

```bash
npm install @capacitor/android @capacitor/ios

# Android
npx cap add android
npx cap copy android
npx cap open android

# iOS
npx cap add ios
npx cap copy ios
npx cap open ios
```

---

## 10. Notificaciones Push (Opcional pero Recomendado)

Para notificaciones push nativas:

```bash
npm install @capacitor/push-notifications firebase/messaging
```

Flujo:

1. Usuario da permiso → se obtiene token FCM
2. Token se guarda en Firestore (`users/{uid}/fcmTokens/{token}`)
3. Worker (`ubiqueme-worker`) envía push cuando hay un scan nuevo
4. App recibe notificación y actualiza badge en tab

---

## 11. Biometría / Bloqueo de App (Opcional)

```bash
npm install @capacitor-community/biometric-auth
```

- Bloquear acceso a la app con Face ID / Touch ID / huella
- Desbloquear al abrir la app (en `App.vue` `onMounted`)

---

## 12. Deep Linking (Opcional)

Para que un QR escaneado abra la app directamente:

```xml
<!-- Android: AndroidManifest.xml -->
<intent-filter>
  <action android:name="android.intent.action.VIEW" />
  <data android:scheme="ubiqueme" />
</intent-filter>
```

```xml
<!-- iOS: Info.plist -->
<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleURLSchemes</key>
    <array><string>ubiqueme</string></array>
  </dict>
</array>
```

Con Capacitor App API (`appUrlOpen` listener).

---

## 13. Resumen de Diferencias con la Web App

| Aspecto            | Web App (actual)       | App Móvil (nueva)          |
| ------------------ | ---------------------- | -------------------------- |
| Framework          | Vue 3 + Vite           | **Ionic 8** + Vue 3 + Vite |
| Navegación         | Sidebar + header       | **Bottom tabs**            |
| Landing            | ✅ Completa            | ❌ Eliminada               |
| Vista QR Escaneado | ✅                     | ❌ Eliminada               |
| Admin              | ✅                     | ❌ Eliminada               |
| Checkout           | ✅                     | ❌ Eliminada               |
| Páginas legales    | ✅                     | ❌ Eliminadas              |
| Mis QR             | ✅                     | ✅ (adaptado)              |
| Notificaciones     | ✅ (componente existe) | ✅ (pestaña principal)     |
| Configuración      | ✅                     | ✅ (adaptado)              |
| Pricing            | ✅                     | ⚠️ Opcional                |
| Offline            | ❌ No configurado      | ✅ Firestore persistence   |
| Push Notifications | ❌                     | ✅ FCM (recomendado)       |
| Biometría          | ❌                     | ✅ Opcional                |
| Capacitor          | ❌                     | ✅ Nativo (Android/iOS)    |

---

## 14. Firebase Firestore — Colecciones que Usa la App

| Colección                             | Subcolección | Uso en App                                                 |
| ------------------------------------- | ------------ | ---------------------------------------------------------- |
| `users/{uid}`                         | —            | Perfil del usuario (nombre, email, teléfono, preferencias) |
| `users/{uid}/subscriptions/{subId}`   | —            | Plan actual, estado, QRs permitidos                        |
| `users/{uid}/qrs/{qrId}`              | —            | Códigos QR del usuario (nombre, estado, scans)             |
| `users/{uid}/qrs/{qrId}/logs/{logId}` | —            | Historial de escaneos individuales                         |
| `users/{uid}/notifications/{notifId}` | —            | Notificaciones del usuario (tipo, leído, fecha)            |

> La app SOLO lee/escribe documentos del usuario autenticado (reglas Firestore seguras).

---

## 15. Flujo de Autenticación Detallado

### 15.1 Login (Email + Password)

Basado en `src/views/auth/LoginView.vue` del proyecto web:

```ts
// Comportamiento esperado en LoginView.vue

const form = reactive({
  email: '',
  password: '',
})

const handleLogin = async () => {
  if (!form.email || !form.password) {
    toast.error('Por favor, complete todos los campos.')
    return
  }

  loading.value = true
  const user = await signInWithEmailAndPassword(auth, form.email, form.password)

  // Si el email NO está verificado → cerrar sesión y mostrar VerificationBanner
  if (!user.user.emailVerified) {
    loading.value = false
    emailVerified.value = false // ← muestra el VerificationBanner
    await signOut(auth)
    return
  }

  // Login exitoso → guardar datos en store y redirigir
  userStore.setFullName(user.user.displayName || '')
  userStore.setEmail(user.user.email || '')
  userStore.setUserId(user.user.uid)
  // ...
  navigateAfterAuth()
}
```

**Flujo visual en la app:**

1. Usuario ingresa email + password → "Iniciar Sesión"
2. Si no verificó email → se cierra la sesión, se oculta el formulario, se muestra `<VerificationBanner>`
3. `VerificationBanner` permite reenviar el email de verificación
4. Botón "Volver al Login" para reintentar

**Forgot Password:**

```ts
const handleForgotPassword = async () => {
  if (!form.email) {
    toast.error('Por favor, ingrese su correo electrónico primero.')
    return
  }
  await sendPasswordResetEmail(auth, form.email)
  toast.success('Correo de restablecimiento enviado.')
}
```

### 15.2 Register (Creación de Cuenta)

Basado en `src/views/auth/RegisterView.vue`:

```ts
const form = reactive({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  terms: false,
})

const handleRegister = async () => {
  // Validaciones
  if (form.name === '' || form.email === '' || form.password === '') return
  if (form.password !== form.confirmPassword) return
  if (!form.terms) return

  loading.value = true

  // 1. Crear usuario en Firebase Auth
  const credentials = await createUserWithEmailAndPassword(auth, form.email, form.password)
  const user = credentials.user

  // 2. Actualizar displayName
  await updateProfile(user, { displayName: form.name.trim() })

  // 3. Enviar email de verificación
  await sendEmailVerification(user, {
    url: 'https://ubiqueme.com/verify',
    handleCodeInApp: true,
  })

  // 4. Crear documento en Firestore (batch)
  const batch = writeBatch(db)
  batch.set(doc(db, `users/${user.uid}`), {
    uid: user.uid,
    name: form.name.trim(),
    email: form.email.trim(),
    phone: '',
    role: 'user',
    isActive: true,
    isBanned: false,
    banReason: '',
    totalQRs: 0,
    preferences: {
      emailNotifications: false,
      smsNotifications: false,
      whatsappNotifications: false,
    },
    lastLoginAt: Timestamp.now(),
    createdAt: Timestamp.now(),
    trialActive: true,
    trialStartsAt: Timestamp.now(),
    trialEndsAt: Timestamp.fromDate(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)),
    isTrialUsed: false,
  })

  // 5. Crear suscripción trial (1 año)
  const subId = nanoid(15)
  batch.set(doc(db, `users/${user.uid}/subscriptions/${subId}`), {
    id: subId,
    userId: user.uid,
    planType: 'trial',
    status: 'active',
    purchasedAt: Timestamp.now(),
    endDate: Timestamp.fromDate(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)),
    paymentProviderId: '',
    totalQRsAllowed: 1,
    totalQRsCreated: 0,
    freeShipmentsAllowed: 0,
    freeShipmentsUsed: 0,
  })

  await batch.commit()
  await signOut(auth) // Cerrar sesión para forzar verificación
  toast.success('Registro completado. Verifique su correo.')
  router.push({ name: 'verify' })
}
```

**Campos del formulario Register:**

- Nombre Completo (text)
- Correo Electrónico (email)
- Contraseña (password)
- Confirmar Contraseña (password)
- Checkbox: Acepto Términos y Condiciones + Política de Privacidad

### 15.3 Verify (Post-Registro)

Basado en `src/views/auth/VerifyView.vue`:

La vista `/verify` tiene **dos modos**:

**Modo 1 — Sin oobCode (post-registro):**

- Muestra un mensaje: "Le hemos enviado un correo de verificación"
- Botón "Ir al Login"

**Modo 2 — Con oobCode (click en enlace del correo):**

- Firebase `applyActionCode` para verificar email
- Si el código es válido → mensaje de éxito y redirigir a login
- Si el código expiró → mensaje de error con botón para reenviar

**Reset Password (dentro de VerifyView):**

- Si el `oobCode` corresponde a `resetPassword`:
  - Formulario: Nueva Contraseña + Confirmar Contraseña
  - `confirmPasswordReset(auth, oobCode, newPassword)`
  - Éxito → toast + redirigir a login

---

## 16. Contratos de Componentes (Props / Emits / Slots)

### 16.1 `QRCard.vue`

```vue
<!-- Basado en src/components/user/dashboard/QRDash/QRCard.vue -->
<script setup lang="ts">
import type { IQRCard } from '@/interfaces/IQRCard'

// ─── Props ───
// Usa IQRCard completa:
interface QRCardProps {
  name: string
  category: string
  isActive: boolean
  isBanned: boolean
  banReason: string
  status: 'Active' | 'Canceled' | 'Process' | 'Error' | 'Paused' | 'Inactive'
  scans: number
  lastScan: string | Timestamp | null
  id: string
  createdAt: Timestamp
  docId: string
  img?: string
  subscriptionId: string
  link?: string
  physicalShipped?: boolean
  physicalShippedAt?: Timestamp | string
  shippingNotes?: string
  freeShipmentUsed?: boolean
  planType?: 'bronce' | 'plata' | 'oro' | 'trial'
  subscriptionStatus?: string
}

// ─── Emits ───
const emit = defineEmits<{
  (e: 'request-physical', subscriptionId: string): void
  (e: 'cancel', qrId: string): void
  (e: 'renew', qrId: string): void
  (e: 'edit', qrId: string, newName: string): void
  (e: 'download', qrId: string): void
  (e: 'toggle-public', qrId: string, makePublic: boolean): void
}>()
```

**Estados visuales:**

- `status === 'Inactive'` → opacidad reducida, overlay "QR inactivo"
- `status === 'Canceled'` → filtro sepia/gris, overlay "QR cancelado"
- `isBanned === true` → estado muestra "Baneado" en rojo

**Menú de opciones (mobile bottom sheet / desktop grid):**

1. Descargar QR → emit `'download'`
2. Editar nombre → emit `'edit'`
3. Reemplazar QR → emit `'renew'`
4. Pedir QR físico → emit `'request-physical'` (locked si no es teléfono MX)
5. Activar/Desactivar QR → emit `'toggle-public'`
6. Eliminar QR → emit `'cancel'`

### 16.2 `CreateQRModal.vue`

```vue
<script setup lang="ts">
interface CreateQRProps {
  isOpen: boolean
  subscriptions: Array<{ id: string; planType: string; totalQRsAllowed: number; totalQRsCreated: number }>
}

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'create', data: {
    name: string
    category: string
    img?: string
    subscriptionId: string
    link?: string
  }): void
}>()
```

**Campos del formulario:**

- Nombre del QR (requerido)
- Categoría (select: vehicle, home, phone, laptop, pet, other)
- Imagen del objeto (opcional, file input → comprimir con `browser-image-compression`)
- Enlace (opcional)
- Suscripción a usar (select, si el usuario tiene múltiples)

**Validaciones:**

- `totalQRsCreated < totalQRsAllowed` de la suscripción seleccionada
- Nombre no vacío

### 16.3 `NotificationCard.vue`

```vue
<script setup lang="ts">
import type { INotification } from '@/interfaces/INotification'

interface NotificationProps {
  id: number
  type: 'qr_scan' | 'system' | 'billing'
  title: string
  message: string
  date: string
  read: boolean
}

const emit = defineEmits<{
  (e: 'mark-read', id: number): void
  (e: 'delete', id: number): void
}>()
```

**Tipos de notificación (determinan ícono y color):**

- `qr_scan` → ícono `qr_code_scanner`, color naranja
- `system` → ícono `info`, color azul
- `billing` → ícono `credit_card`, color verde

**Estados:**

- `read === false` → fondo ligeramente más claro o indicador de "no leído" (dot)
- `read === true` → opacidad reducida

### 16.4 `SettingsForm.vue`

```vue
<script setup lang="ts">
interface SettingsFormProps {
  user: {
    name: string
    email: string
    phone: string
    preferences: {
      emailNotifications: boolean
      smsNotifications: boolean
      whatsappNotifications: boolean
    }
  }
}

const emit = defineEmits<{
  (e: 'save', data: {
    name: string
    phone: string
    preferences: {
      emailNotifications: boolean
      smsNotifications: boolean
      whatsappNotifications: boolean
    }
  }): void
  (e: 'logout'): void
  (e: 'delete-account'): void
}>()
```

**Secciones del formulario:**

1. Información personal: Nombre (editable), Email (solo lectura)
2. Teléfono (editable, con formateo para +52)
3. Preferencias de notificación: 3 toggles (Email, SMS, WhatsApp)
4. Botón "Cerrar Sesión" (rojo)
5. Botón "Eliminar Cuenta" (rojo, con confirmación)

---

## 17. Manejo de Errores Global

### 17.1 Error Handler en Firebase

```ts
// utils/firebaseErrors.ts
const firebaseErrorMessages: Record<string, string> = {
  'auth/user-not-found': 'No encontramos una cuenta con ese correo electrónico.',
  'auth/wrong-password': 'Contraseña incorrecta. Intente de nuevo.',
  'auth/invalid-email': 'El correo electrónico no es válido.',
  'auth/email-already-in-use': 'Este correo ya está registrado.',
  'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres.',
  'auth/too-many-requests': 'Demasiados intentos. Espere unos minutos.',
  'auth/invalid-verification-code': 'El código de verificación no es válido.',
  'auth/expired-action-code': 'El enlace de verificación ha expirado. Solicite uno nuevo.',
  'permission-denied': 'No tienes permisos para realizar esta acción.',
  unavailable: 'El servicio no está disponible en este momento. Intente más tarde.',
}

export const getFirebaseErrorMessage = (error: { code?: string; message?: string }): string => {
  return firebaseErrorMessages[error.code || ''] || error.message || 'Error desconocido.'
}
```

### 17.2 Conexión / Offline

```vue
<!-- components/ui/OfflineBanner.vue -->
<template>
  <ion-banner v-if="!isOnline" color="warning">
    <ion-icon :icon="cloudOfflineOutline" slot="start" />
    Sin conexión. Los datos se sincronizarán cuando vuelva a tener internet.
  </ion-banner>
</template>
```

```ts
// En App.vue o composable
import { ref, onMounted, onUnmounted } from 'vue'

const isOnline = ref(navigator.onLine)

const handleOnline = () => {
  isOnline.value = true
}
const handleOffline = () => {
  isOnline.value = false
}

onMounted(() => {
  window.addEventListener('online', handleOnline)
  window.addEventListener('offline', handleOffline)
})

onUnmounted(() => {
  window.removeEventListener('online', handleOnline)
  window.removeEventListener('offline', handleOffline)
})
```

### 17.3 Toast Global

Usar `vue-sonner` igual que en web:

```ts
import { toast } from 'vue-sonner'

// Success
toast.success('QR creado exitosamente.')

// Error
toast.error('Error al crear QR. Intente de nuevo.')

// Info
toast.info('No hay escaneos registrados aún.')
```

---

## 18. Estados Vacíos y de Carga

### 18.1 Lista Vacía de QR

```vue
<template>
  <div class="flex flex-col items-center justify-center py-12 px-4">
    <ion-icon :icon="qrCodeOutline" class="text-6xl text-white/20 mb-4" />
    <h3 class="text-lg font-semibold text-white/60 mb-2">No tienes códigos QR aún</h3>
    <p class="text-sm text-white/40 mb-6 text-center max-w-xs">
      Crea tu primer código QR para empezar a proteger tus pertenencias.
    </p>
    <ion-button color="primary" @click="$emit('create')">
      <ion-icon :icon="addOutline" slot="start" />
      Crear QR
    </ion-button>
  </div>
</template>
```

### 18.2 Lista Vacía de Notificaciones

```vue
<template>
  <div class="flex flex-col items-center justify-center py-12 px-4">
    <ion-icon :icon="notificationsOffOutline" class="text-6xl text-white/20 mb-4" />
    <h3 class="text-lg font-semibold text-white/60 mb-2">Sin notificaciones</h3>
    <p class="text-sm text-white/40 text-center max-w-xs">
      No tienes notificaciones nuevas. Cuando alguien escanee tu QR, recibirás una alerta aquí.
    </p>
  </div>
</template>
```

### 18.3 Loader Principal

```vue
<!-- components/ui/MainLoader.vue (igual que web) -->
<template>
  <div class="flex items-center justify-center p-8">
    <ion-spinner name="crescent" color="warning" />
  </div>
</template>
```

### 18.4 Pull-to-Refresh (Ionic)

```vue
<template>
  <ion-refresher slot="fixed" @ionRefresh="handleRefresh($event)">
    <ion-refresher-content
      pulling-text="Desliza para actualizar..."
      refreshing-text="Actualizando..."
    />
  </ion-refresher>
</template>

<script setup lang="ts">
const handleRefresh = async (event: CustomEvent) => {
  // Recargar datos
  await loadQRs()
  event.detail.complete()
}
</script>
```

---

## 19. Patrones Comunes de Ionic

### 19.1 IonModal en lugar de modales custom

```vue
<template>
  <ion-modal :is-open="isOpen" @didDismiss="$emit('close')">
    <ion-header>
      <ion-toolbar>
        <ion-title>Crear QR</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="$emit('close')">Cerrar</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <!-- formulario -->
    </ion-content>
  </ion-modal>
</template>
```

### 19.2 IonInput reemplazando inputs HTML

```vue
<template>
  <ion-item>
    <ion-label position="floating">Correo Electrónico</ion-label>
    <ion-input v-model="email" type="email" placeholder="nombre@dominio.com" :disabled="loading" />
  </ion-item>
</template>
```

### 19.3 IonList + IonItem para listas

```vue
<template>
  <ion-list>
    <ion-item v-for="notif in notifications" :key="notif.id" button @click="markAsRead(notif.id)">
      <ion-icon :icon="getIcon(notif.type)" slot="start" />
      <ion-label>
        <h2>{{ notif.title }}</h2>
        <p>{{ notif.message }}</p>
      </ion-label>
      <ion-note slot="end">{{ notif.date }}</ion-note>
    </ion-item>
  </ion-list>
</template>
```

### 19.4 Safe Areas (Notch / Dynamic Island)

```css
/* src/styles.css */
:root {
  --ion-safe-area-top: env(safe-area-inset-top);
  --ion-safe-area-bottom: env(safe-area-inset-bottom);
}

.ion-padding-top-safe {
  padding-top: var(--ion-safe-area-top);
}

.ion-padding-bottom-safe {
  padding-bottom: var(--ion-safe-area-bottom);
}
```

### 19.5 Manejo de Teclado

```ts
// En Capacitor, usar Keyboard plugin
import { Keyboard } from '@capacitor/keyboard'

Keyboard.addListener('keyboardWillShow', (info) => {
  // Ajustar layout cuando el teclado aparece
})

Keyboard.addListener('keyboardWillHide', () => {
  // Restaurar layout
})
```

### 19.6 IonRouterOutlet con Transiciones

```vue
<!-- App.vue -->
<template>
  <ion-app>
    <ion-router-outlet :animated="true" />
  </ion-app>
</template>
```

### 19.7 Permisos de Cámara y Galería

```bash
npm install @capacitor/camera @capacitor/filesystem
```

```ts
import { Camera, CameraResultType } from '@capacitor/camera'

const takePicture = async () => {
  const image = await Camera.getPhoto({
    quality: 90,
    resultType: CameraResultType.Uri,
  })
  // image.webPath para mostrar preview
  // image.path para guardar/subir
}
```

---

## 20. Recomendaciones Finales (Extendido)

1. **Mobile-first** — Ionic ya fuerza mobile, pero los layouts deben probarse en 320px–428px.
2. **Pull-to-refresh** — Usar `ion-refresher` en listas (QR, notificaciones).
3. **Infinite scroll** — Para listas largas de QR o logs de escaneo.
4. **Gestión de estado offline** — Mostrar indicador visual cuando no hay conexión.
5. **Seguridad** — No exponer API keys en el bundle. Las reglas de Firestore protegen los datos.
6. **Mismo Firestore** — Usar la misma base de datos que la web para que los datos sean compartidos.
7. **Store de user.ts** — Usar **exactamente el mismo** para que la lógica de auth coincida.
8. **Animated transitions** — Ionic tiene transiciones nativas entre páginas (usar `ion-router-outlet`).
9. **Error handling centralizado** — Usar `getFirebaseErrorMessage()` en todos los catch.
10. **Estados vacíos** — Implementar pantallas vacías para QR, notificaciones y logs de escaneo.
11. **Formateo de teléfono** — El número debe guardarse con código de país (+52 para MX) en Firestore.
12. **Suscripción trial** — Todo usuario nuevo obtiene 1 año Bronce gratis (1 QR permitido).
13. **Email de verificación obligatorio** — Sin email verificado no se puede iniciar sesión.
14. **Deep link para QR** — Configurar esquema `ubiqueme://` para que escanear un QR abra la app.
15. **Fondo de la app** — Usar `#09090b` para mantener consistencia con la web.
