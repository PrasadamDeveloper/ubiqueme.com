# Next Steps

> Centraliza los próximos cambios planificados del proyecto.  
> Cada sección es un bloque de trabajo independiente con su propia prioridad y criterios.

_Última actualización: 7/7/2026_

---

## 1. Plan → Bronce de Prueba ✅ COMPLETADO

> Renombrar visualmente `trial` → **"Bronce de prueba"** y extender duración de 30 días → 1 año.

### 1.1 Cambios Visuales — Realizados

| Archivo                                     | Cambio                                                                                         |
| ------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `src/components/admin/BanConfirmPrompt.vue` | `"Trial termina:"` → `"Bronce de prueba termina:"`                                             |
| `src/views/admin/AdminDashboardView.vue`    | Botón "Fin Trial" → "Fin Bronce", "Trial" → "Bronce Prueba", abreviatura `trial: 'T'` → `'BP'` |
| `src/views/admin/AdminDashboardView.vue`    | Badge usar `planDisplayName()` / `statusDisplayName()` para "Bronce de prueba" y "Acabado"     |
| `src/views/admin/AdminDashboardView.vue`    | Botón "Migrar trials a 1 año" agreagado en filters row                                         |
| `src/views/public/HomeView.vue`             | Banner "30 días gratis" → "Bronce de prueba — 1 año gratis"                                    |
| `src/views/SecurityTestView.vue`            | "Assign Free Trial" → "Assign Bronce de Prueba", label `(bronce-prueba)`                       |
| `MyQrDash.vue` / `MyQrDashMobile.vue`       | Badge del plan: `'trial'` → "Bronce de prueba"; status `inactive` → "Acabado"                  |

**No tocar** — `ISubscription.planType`, `IUser.trialActive/EndsAt/isTrialUsed`, worker.

### 1.2 Duración — Realizado

- `RegisterView.vue` — `30 * 24 * 60 * 60 * 1000` → `365 * 24 * 60 * 60 * 1000`
- `AdminDashboardView.vue` — `nextMonth.setMonth(...)` → `nextYear.setFullYear(...)`
- `SecurityTestView.vue` — `30 * 86400000` → `365 * 86400000`
- Worker sin cambios.

### 1.3 Estado "Acabado" — Realizado

```text
planType === 'trial' && status === 'inactive'  →  mostrar "Acabado" (con badge ámbar)
planType === 'bronce'|'plata'|'oro' && status === 'inactive'  →  "Inactivo" / "Cancelado"
```

### 1.4 Migración — Botón en Admin (Realizado)

Botón "Migrar trials a 1 año" en la fila de filtros del panel admin. Busca todas las subs `planType === 'trial' && status === 'active'` y actualiza `endDate` y `trialEndsAt` a `now + 365 días` en batches de 500.

### 1.5 Prioridad Final

| #   | Tarea                                                       | Prioridad          | Estado |
| --- | ----------------------------------------------------------- | ------------------ | ------ |
| 1   | Cambiar duración 30d → 1 año en registro y admin            | 🔴 Alta            | ✅     |
| 2   | Renombrar strings "Trial" → "Bronce de prueba"              | 🟡 Media           | ✅     |
| 3   | Badge "Acabado" para trial inactivo                         | 🟡 Media           | ✅     |
| 4   | Revisar componentes dashboard por strings "trial" restantes | 🟢 Baja            | ✅     |
| 5   | Botón migración trials existentes en panel admin            | 🔵 Post-producción | ✅     |

### 1.6 Criterios de Aceptación

- [x] Registro nuevo: `trialEndsAt` = 1 año desde hoy
- [x] Admin asigna trial: `endDate` = 1 año desde hoy
- [x] En admin se lee "Bronce de prueba" (no "Trial")
- [x] En landing se lee "1 año gratis" (no "30 días")
- [x] Worker expira trial normalmente cuando pasa 1 año
- [x] Botón "Migrar trials a 1 año" en panel admin
- [x] Badge "Acabado" visible cuando trial expira (admin + dashboard)
- [x] Dashboard muestra "Bronce de prueba" y "Acabado"

---

## 2. Info explicativa del plan en Dashboard ✅ COMPLETADO

> Agregar bloque informativo en el Subscription Header del dashboard (desktop y mobile) que explique claramente el estado del plan, fecha de término y QRs disponibles.

### 2.1 Cambios Realizados

| Archivo              | Cambio                                                                                         |
| -------------------- | ---------------------------------------------------------------------------------------------- |
| `MyQrDash.vue`       | Bloque informativo con icono `info` debajo del ID con 6 variantes de mensaje según plan/estado |
| `MyQrDashMobile.vue` | Misma información en banners compactos de color (ámbar, rojo, verde, gris)                     |
| `MyQrDashMobile.vue` | Se agregó `:subscriptionStatus` prop a `QRCardMobile` para overlay de QRs cancelados           |
| `MyQrDashMobile.vue` | Se agregó helper `formatEndDate()` para formatear Timestamp en español                         |

### 2.2 Mensajes por estado

| Estado                        | Desktop                                                                                                                                                                     | Mobile (banner)                                                 |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| **Trial activo**              | "Este es un plan gratuito de prueba con duración de 1 año incluido en su cuenta. Termina el {fecha}. Después de esa fecha si decide continuar con el plan podrá renovarlo." | Banner ámbar con icono `info` + mismo texto                     |
| **Trial cancelado**           | "Este plan gratuito de prueba fue cancelado. Los QRs asociados ya no están disponibles."                                                                                    | Banner rojo ✕ "Plan de prueba cancelado — QRs no disponibles"   |
| **Trial finalizado**          | "Este plan gratuito de prueba ha finalizado. Terminó el {fecha}. Adquiera un plan para reactivar sus QRs."                                                                  | Banner gris ⌛ "Plan de prueba finalizado — reactiva tus QRs"   |
| **Plan pago activo**          | "Plan {tipo} — termina el {fecha}. Tienes X de Y QRs disponibles."                                                                                                          | Banner verde ✓ "Plan {tipo} activo — termina {fecha} · X/Y QRs" |
| **Plan cancelado (no trial)** | "Plan {tipo} cancelado. Los QRs asociados ya no están disponibles."                                                                                                         | Banner rojo ✕ "Plan {tipo} cancelado — QRs no disponibles"      |
| **Inactivo**                  | "Plan {tipo} inactivo. Adquiere o reactiva un plan para usar tus QRs."                                                                                                      | Banner gris ⚬ "Plan {tipo} inactivo"                            |

### 2.3 Helper `formatEndDate()`

```ts
function formatEndDate(date: Timestamp | null): string {
  if (!date) return 'fecha no disponible'
  const d = date.toDate()
  return d.toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
```

Formatea el `Timestamp` de Firestore a formato legible en español, ej. "26 de junio de 2027".

---

---

## 3. Promo "1 año de Bronce gratis" en landing y registro ✅ COMPLETADO

> Agregar banners promocionales impactantes en Home, Pricing y Register promocionando 1 año de Bronce gratis, visibles solo para usuarios no logueados. El plan Bronce permanece intacto (sin modificaciones en su botón ni funcionalidad).

### 3.1 Cambios Realizados

| Archivo                                        | Cambio                                                                                                                                                                                 |
| ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/views/public/HomeView.vue`                | Banner promo debajo del sub-headline con gradiente ámbar/naranja, glow, texto "1 AÑO DE BRONCE — TOTALMENTE GRATIS", botón "Obtenga su año gratis" → `/register`, disclaimer integrado |
| `src/components/home/Pricing/PricingPlans.vue` | Banner promo separado arriba de tarjetas + disclaimer; plan Bronce intacto con su botón "Activar Bronce" original                                                                      |
| `src/views/public/PricingView.vue`             | Mismo banner promo arriba de tarjetas + disclaimer; plan Bronce intacto                                                                                                                |
| `src/views/auth/RegisterView.vue`              | Banner en panel izquierdo desktop (icono `card_giftcard` + badge "OFERTA") + banner mobile arriba del formulario                                                                       |

### 3.2 Comportamiento

- Todo el contenido promocional (banners + disclaimers) se muestra **solo a usuarios no logueados** vía `v-if="!useUserStore().getUserId"`
- Los banners tienen `router-link` a `/register`
- El plan Bronce en los pricing mantiene su botón "Activar Bronce" y flujo original (checkout/login)

### 3.3 Estilo visual

- Gradiente: `bg-gradient-to-r from-amber-500/15 via-orange-500/15 to-amber-500/15`
- Borde: `border border-orange-500/30`
- Glow decorativo con círculos `blur-3xl` en esquinas
- Disclaimer: `text-[10px] text-white/30`
- Sin emojis, todo en formato formal (usted)

---

_Agregar nuevas secciones abajo conforme se definan próximos pasos._
