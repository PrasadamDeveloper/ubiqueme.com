# Auditoría Pre-Lanzamiento — Ubiqueme

> Documento de hallazgos clasificados por prioridad. Cada entrada describe el problema, archivos afectados y solución recomendada.

---

## 🔴 Prioridad Alta — Debe corregirse antes del lanzamiento

### 1. Google Auth — Login no crea subscripción (inconsistencia crítica)

| Campo        | Detalle                                                                                                                                                                                                                                                                                                                                                                             |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Archivo**  | `src/views/auth/LoginView.vue` (líneas 288–315)                                                                                                                                                                                                                                                                                                                                     |
| **Problema** | `handleGoogleAuth` en `LoginView.vue` crea un documento en `users/{uid}` con campos plan directamente (`plan: 'alpha'`, `subscriptionStatus: 'active'`), mientras que `RegisterView.vue` (líneas 278–315) crea una subcolleción `users/{uid}/subscriptions/{subId}` con la estructura correcta. **Login con Google no crea subscripción → el usuario queda sin plan al dashboard.** |
| **Impacto**  | Usuarios que hacen login con Google no pueden crear QRs (el dashboard muestra "No tiene suscripciones activas")                                                                                                                                                                                                                                                                     |
| **Solución** | Reemplazar la creación plana en `LoginView.vue:288-315` por la misma estructura de `RegisterView.vue`: crear subcollection `subscriptions` con `planType: 'bronce'`, `status: 'active'`, y los campos `totalQRsAllowed`, `totalQRsCreated`, `freeShipmentsAllowed`, `freeShipmentsUsed`.                                                                                            |

### 2. Ruta `/dashboard/request-qr` rota

| Campo        | Detalle                                                                                                                                                                                                                                           |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Archivo**  | `src/router/index.ts:49-51` + `src/components/user/dashboard/DashboardView.vue:91,123`                                                                                                                                                            |
| **Problema** | La ruta está definida como redirect sin nombre (`path: '/dashboard/request-qr'`, `redirect: '/dashboard'`), pero los botones del sidebar y mobile nav hacen `router.push({ name: 'request-qr' })`. El nombre `request-qr` no existe en el router. |
| **Impacto**  | Los botones "Solicitar QR" no navegan a ningún lado (error silencioso de Vue Router)                                                                                                                                                              |
| **Solución** | Opción A: Agregar `name: 'request-qr'` a la ruta redirect. Opción B: Cambiar los `router.push({ name: 'request-qr' })` por `router.push('/dashboard/request-qr')`.                                                                                |

### 3. Botón "Salir del Panel" no hace logout (solo navega a Home)

| Campo        | Detalle                                                                                                                                                               |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Archivo**  | `src/layouts/UserDashoardLayout.vue` (líneas 85–89 y 116–121)                                                                                                         |
| **Problema** | El botón "Salir del Panel" usa `RouterLink` a `{ name: 'home' }`. No ejecuta `handleLogout()`. El usuario sigue autenticado al navegar a Home. Versión mobile igual.  |
| **Impacto**  | Usuario cree que cerró sesión pero sigue autenticado. La sesión persiste.                                                                                             |
| **Solución** | Cambiar los RouterLink por un `<button>` que ejecute `handleLogout()` y luego redirija a home. Nota: `handleLogout` actualmente redirige a `login` (ver problema #4). |

### 4. Logout redirige a login — posible loop con el guard

| Campo        | Detalle                                                                                                                                                                                                                                                          |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Archivo**  | `src/handleAuth.ts:15` + `src/router/index.ts:156-171`                                                                                                                                                                                                           |
| **Problema** | `handleLogout()` hace `router.push({ name: 'login' })`. El `beforeEach` guard redirige usuarios autenticados de `/login` a `/dashboard`. Si `onAuthStateChanged` no ha limpiado el store aún (hay async gap), el usuario podría rebotar entre login y dashboard. |
| **Impacto**  | Posible race condition post-logout.                                                                                                                                                                                                                              |
| **Solución** | Redirigir a `{ name: 'home' }` en vez de `login`. Home no tiene restricciones de auth y es más seguro.                                                                                                                                                           |

### 5. Código de test `createQR()` presente en producción

| Campo        | Detalle                                                                                                                                                                                                                                                                                                                                  |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Archivo**  | `src/components/user/dashboard/QRDash/MyQrDash.vue` (líneas 241–324)                                                                                                                                                                                                                                                                     |
| **Problema** | La función `createQR()` tiene el comentario "ATENTION THIS MUST BE ONLY FOR ADMIN ITS CREATED HERE FOR TEST PURPOUSE ONLY". Esta función opera con `runTransaction` y crea QRs de prueba. El botón para invocarla no es visible en el template actual (no se ve un llamado directo), pero el código está presente y podría ser invocado. |
| **Impacto**  | Riesgo de dejar funcionalidad de prueba ejecutándose en producción.                                                                                                                                                                                                                                                                      |
| **Solución** | Eliminar la función `createQR()` completa o envolverla en un flag de entorno `if (import.meta.env.DEV)`.                                                                                                                                                                                                                                 |

### 6. Admin — Login Google no crea subcollection (duplicado del #1 para login)

| Campo        | Detalle                                                                                                                                      |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------- |
| **Archivo**  | `src/views/auth/LoginView.vue` (líneas 288–315)                                                                                              |
| **Problema** | Mismo que #1. Al hacer login con Google, si `additionalInfo?.isNewUser` es true, crea el doc con campos plan planos en vez de subcollection. |
| **Solución** | Ver #1.                                                                                                                                      |

---

## 🟡 Prioridad Media — Debe corregirse pronto

### 7. Admin — Filtro "future" no considera `isActive`

| Campo        | Detalle                                                                                                                                                                                 |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Archivo**  | `src/views/admin/AdminDashboardView.vue` (líneas 561–566)                                                                                                                               |
| **Problema** | El filtro "Próximos a vencer" solo filtra por `sub.status === 'active' && sub.endDate > now`. No verifica `user.isActive === true`. Un usuario inactivo con sub activa aparecería aquí. |
| **Solución** | Agregar `&& u.isActive` al filter.                                                                                                                                                      |

### 8. Admin — Filtro "inactive" busca status que nunca existe

| Campo        | Detalle                                                                                                                                                                                   |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Archivo**  | `src/views/admin/AdminDashboardView.vue` (líneas 572–577)                                                                                                                                 |
| **Problema** | El filtro "Expirados" busca `sub.status === 'inactive'`, pero según la interfaz `ISubscription`, los únicos status válidos son `'active'                                                  | 'inactive' | 'canceled'`. Sin embargo, en todo el código solo se asignan `'active'`y`'canceled'`. **Nunca se asigna `'inactive'`\*\* a ninguna subscripción. Este filtro siempre devolverá 0 resultados. |
| **Solución** | Definir cuándo una subscripción debe marcarse como `'inactive'` (ej: endDate ya pasó y nadie la canceló), y/o ajustar el filtro para detectar expiradas por fecha en lugar de por status. |

### 9. MyQrDash — Sin navegación a planes desde estado vacío

| Campo        | Detalle                                                                                                                                                                                                                     |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Archivo**  | `src/components/user/dashboard/QRDash/MyQrDash.vue` (líneas 189–193)                                                                                                                                                        |
| **Problema** | Cuando `groupedQRs` está vacío, muestra "No tiene suscripciones activas" y "Adquiera un plan para poder registrar códigos QR", pero **no hay botón para navegar a `/pricing`**. El usuario queda en un callejón sin salida. |
| **Solución** | Agregar un `RouterLink` a `/pricing` o `/checkout/plata` en el estado vacío.                                                                                                                                                |

### 10. LimitReached — Estado no se resetea al cambiar de subscripción

| Campo        | Detalle                                                                                                                                                                                                                   |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Archivo**  | `src/components/user/dashboard/QRDash/MyQrDash.vue` (líneas 120-121, 349-369)                                                                                                                                             |
| **Problema** | `showLimitReached` se activa en `toggleCreateQrModal` cuando el límite se alcanza. Pero nunca se resetea a `false` cuando el usuario cambia a otra subscripción que SÍ tenga capacidad. El banner puede quedarse visible. |
| **Solución** | Resetear `showLimitReached = false` al inicio de `toggleCreateQrModal`.                                                                                                                                                   |

### 11. `createQRForSubscription` — batch sobre `publicQR` con datos incompletos

| Campo        | Detalle                                                                                                                                                                                                                          |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Archivo**  | `src/components/user/dashboard/QRDash/MyQrDash.vue` (líneas 392–441)                                                                                                                                                             |
| **Problema** | La función `createQRForSubscription` setea en `publicQR` los mismos datos que en `user/qrs/{id}`, incluyendo campos internos como `subscriptionId`, `freeShipmentUsed`, `physicalShipped`. Datos que no deberían estar públicos. |
| **Solución** | Al setear el documento `publicQR`, solo incluir: `id`, `name`, `category`, `status`, `lastScan`, `totalScans`, `isBanned`, `banReason`, `uid`, `tier`, `createdAt`. Separar datos privados.                                      |

---

## 🔵 Prioridad Baja — Podría esperar, pero ideal corregir

### 12. VerifyView — Estilos con colores no definidos

| Campo        | Detalle                                                                                                                                                                                                                                                                                        |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Archivo**  | `src/views/auth/VerifyView.vue` (líneas 16, 25)                                                                                                                                                                                                                                                |
| **Problema** | Usa clases `bg-primary` y `text-primary` y `border-t-primary` que no están definidas en el scope ni en `syles.css` (ojo: typo en el nombre del archivo CSS importado, es `syles.css` en vez de `styles.css`). En Vue, `bg-primary` no existe por defecto en Tailwind a menos que se configure. |
| **Impacto**  | Los elementos con estas clases pueden no tener el color esperado.                                                                                                                                                                                                                              |
| **Solución** | Reemplazar por el color exacto (ej: `bg-[#ff7900]`/`bg-orange-500`) o definir la variable primary en Tailwind config.                                                                                                                                                                          |

### 13. scannerEmail vacío en QRScannedView

| Campo        | Detalle                                                                                                                                                                                               |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Archivo**  | `src/views/public/QRScannedView.vue` (línea 148)                                                                                                                                                      |
| **Problema** | `sendMessageToAPI()` envía `scannerEmail: userStore.email`. El scanner puede no estar logueado (usa Google One Tap para autenticarse, pero el store no se actualiza automáticamente tras el One Tap). |
| **Impacto**  | El email del scanner llegaría vacío al worker de notificación.                                                                                                                                        |
| **Solución** | Después de `handleCredentialResponse`, setear el email en el store antes de llamar `sendMessageToAPI()`, o pasar el email directamente desde el resultado del One Tap.                                |

### 14. OrderPlanView — Doble sistema de notificaciones

| Campo        | Detalle                                                                                                                                                   |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Archivo**  | `src/views/public/OrderPlanView.vue` (líneas 89–101, 148–162)                                                                                             |
| **Problema** | El componente implementa su propio sistema de toast manual en vez de usar `vue-sonner` (que ya está importado globalmente en `App.vue`). Hay duplicación. |
| **Solución** | Reemplazar el toast manual (líneas 89–101, 148–162) por `toast.success()` y `toast.error()` de vue-sonner.                                                |

### 15. Verificación en Login — resendVerification con credenciales vacías

| Campo        | Detalle                                                                                                                                                                                                                              |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Archivo**  | `src/views/auth/LoginView.vue` (líneas 257–278)                                                                                                                                                                                      |
| **Problema** | Si el usuario llega a la pantalla de verificación (email no verificado) por un login previo con Google (que no requiere contraseña), el form de email/password está vacío. `resendVerification` fallaría porque no hay credenciales. |
| **Solución** | Manejar el caso donde no hay credenciales disponibles. Mostrar mensaje: "Debe iniciar sesión con email y contraseña para reenviar la verificación."                                                                                  |

### 16. `syles.css` — Typo en el nombre del archivo

| Campo        | Detalle                                                                                                        |
| ------------ | -------------------------------------------------------------------------------------------------------------- |
| **Archivo**  | `src/main.ts:1`                                                                                                |
| **Problema** | `import './syles.css'` en vez de `import './styles.css'`                                                       |
| **Impacto**  | Bajo. El import funciona porque el archivo se llama `syles.css`. No es un bug funcional pero es mala práctica. |
| **Solución** | Renombrar a `styles.css` y actualizar el import.                                                               |

---

## ⚪ Workers — Requieren verificación adicional

### 17. email-worker — Endpoint `/api/purchase-request`

| Campo        | Detalle                                                                                                                |
| ------------ | ---------------------------------------------------------------------------------------------------------------------- |
| **Problema** | Pendiente verificar que el worker procesa correctamente los datos de `OrderPlanView` y envía el email de confirmación. |
| **Solución** | Revisar `email-worker/src/index.ts` y confirmar que recibe `{ plan, fullName, email, phone, firebaseUid, notes }`.     |

### 18. ubiqueme-worker — Endpoint `/api/notify`

| Campo        | Detalle                                                                                                                            |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| **Problema** | Pendiente verificar que el worker recibe `{ qrId, message, scannerEmail }` de `QRScannedView` y notifica al propietario.           |
| **Solución** | Revisar `ubiqueme-worker/src/index.ts`. Confirmar que busca el `uid` del QR en `publicQR/{qrId}` y encuentra el email del usuario. |

### 19. soporte-worker — Endpoint `/api/contact`

| Campo        | Detalle                                                                                                 |
| ------------ | ------------------------------------------------------------------------------------------------------- |
| **Problema** | Pendiente verificar que `ContactView` envía correctamente y el worker responde con el formato esperado. |
| **Solución** | Revisar `soporte-worker/src/index.ts`.                                                                  |

---

## Resumen de Archivos Modificados

| Archivo                                             | Issues                       |
| --------------------------------------------------- | ---------------------------- |
| `src/views/auth/LoginView.vue`                      | #1, #6, #15                  |
| `src/views/auth/RegisterView.vue`                   | — (referencia para solución) |
| `src/router/index.ts`                               | #2                           |
| `src/components/user/dashboard/DashboardView.vue`   | #2                           |
| `src/layouts/UserDashoardLayout.vue`                | #3                           |
| `src/handleAuth.ts`                                 | #4                           |
| `src/components/user/dashboard/QRDash/MyQrDash.vue` | #5, #9, #10, #11             |
| `src/views/admin/AdminDashboardView.vue`            | #7, #8                       |
| `src/views/auth/VerifyView.vue`                     | #12                          |
| `src/views/public/QRScannedView.vue`                | #13                          |
| `src/views/public/OrderPlanView.vue`                | #14                          |
| `src/main.ts`                                       | #16                          |
| `email-worker/src/index.ts`                         | #17                          |
| `ubiqueme-worker/src/index.ts`                      | #18                          |
| `soporte-worker/src/index.ts`                       | #19                          |

---

_Documento generado el 6 de febrero de 2026 — Auditoría Pre-Lanzamiento v1_
