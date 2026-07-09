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

## 15. Recomendaciones Finales

1. **Mobile-first** — Ionic ya fuerza mobile, pero los layouts deben probarse en 320px–428px.
2. **Pull-to-refresh** — Usar `ion-refresher` en listas (QR, notificaciones).
3. **Infinite scroll** — Para listas largas de QR o logs de escaneo.
4. **Gestión de estado offline** — Mostrar indicador visual cuando no hay conexión.
5. **Seguridad** — No exponer API keys en el bundle. Las reglas de Firestore protegen los datos.
6. **Mismo Firestore** — Usar la misma base de datos que la web para que los datos sean compartidos.
7. **Store de user.ts** — Usar **exactamente el mismo** para que la lógica de auth coincida.
8. **Animated transitions** — Ionic tiene transiciones nativas entre páginas (usar `ion-router-outlet`).
