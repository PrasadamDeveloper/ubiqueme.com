# 🐛 Bugs & Future Updates — Ubiqueme.com

> **Versión del documento:** 1.0  
> **Última actualización:** 2026-06-29 2:55 PM (America/Mexico_City)  
> **Propósito:** Registro de bugs activos por corregir y futuras actualizaciones planeadas.

---

## 🐛 Bugs

### 🔴 Bug #1 — Mezcla de audios entre secciones A y B del VideoGrid (Home)

#### Nombre

Mezcla de audios entre secciones A y B del VideoGrid

#### Descripción

En la página de Home, el `VideoGrid` muestra 9 videos en una sola grilla. Los primeros 2 corresponden a una **sección A** (parte superior) y los 7 restantes a una **sección B** (parte inferior).

La función `activateSound()` en `VideoGrid.vue` recorre todos los videos del array `videoSources` y silencia los demás cuando uno nuevo se activa. Sin embargo, existe un problema:

- Si la **sección B** tiene un video con audio activo y se activa un video de la **sección A**, **ambos audios se reproducen simultáneamente** (se mezclan).
- Comportamiento esperado: al activar el audio de cualquier video (en A o B), **todos los demás deben silenciarse**, igual como funciona dentro de la misma sección B.

#### Estado

- [x] Fixed — 2026-06-23

---

### 🔴 Bug #2 — Números de step cortados y mal posicionados en StepsCard (Home)

#### Nombre

Números de step cortados y mal posicionados en StepsCard

#### Descripción

En `StepsCard.vue`, el `<div>` que muestra el número del step (1, 2, 3) tiene:

- `text-[8rem]` — fuente extremadamente grande (~128px)
- `-top-20` — desplazado -80px hacia arriba
- `-left-4` — ligeramente desplazado a la izquierda

Esto provoca que el número se salga del contenedor, se corte visualmente en la parte superior y se superponga al contenido interior (título, descripción). El número debería estar contenido dentro de la card y no afectar la legibilidad del resto del contenido.

#### Estado

- [ ] To be fixed

---

### 🔴 Bug #3 — Botón "Planes" en Dashboard cambia de layout (Inconsistencia UX)

#### Nombre

Botón "Planes" en Dashboard cambia de layout

#### Descripción

En `DashboardView.vue:72-73`, al hacer clic en "Planes" se ejecuta `router.push('/pricing')`, lo que carga `PricingView.vue` envuelto en `HomeLayout`. Esto saca al usuario del layout del dashboard (`UserDashoardLayout`) de forma abrupta.

**Comportamiento esperado:** El contenido de planes debería mostrarse dentro del dashboard, igual que "Mis QR", "Configuración" y "Soporte".

#### Sugerencia

1. Crear un componente `src/components/user/dashboard/pricing/PricingDash.vue` que contenga SOLO el template de los planes (el contenido dentro de `<template #main>` de `PricingView.vue`, sin el `HomeLayout` wrapper).
2. Registrarlo en `componentsMap` del `DashboardView.vue` con la clave `'Planes'`.
3. Cambiar `changeComponent('Planes')` en `DashboardView.vue:72-73` para que use `componentsStore.changeComponent('Planes')` en lugar de `router.push('/pricing')`.
4. La vista pública `/pricing` se mantiene intacta para usuarios no autenticados con su `HomeLayout`.

#### Estado

- [ ] To be fixed

---

### 🔴 Bug #4 — Botón "Asignar QR" marca `(-1 restantes)` tras cancelar/regenerar QRs

#### Nombre

Botón "Asignar QR" muestra contador negativo tras cancelar o regenerar QRs

#### Descripción

En `MyQrDash.vue`, el botón "Asignar QR" muestra el cálculo:

```
{{ group.subscription.totalQRsAllowed - group.subscription.totalQRsCreated }}
```

Cuando un usuario cancela o regenera un QR, el contador `totalQRsCreated` en la suscripción se desincroniza, pudiendo llegar a valores negativos.

#### Probable Bug Reason (Unsure)

**`handleRenewQR()`** en `QRCard.vue` crea un QR nuevo SIN incrementar `totalQRsCreated` (reusa el slot lógicamente pero no actualiza el contador). El QR viejo queda como `Inactive`.

**`handleCancelQR()`** en `QRCard.vue` SIEMPRE ejecuta `batch.update(subDoc, { totalQRsCreated: increment(-1) })` sin verificar el estado real del QR ni si ya fue reemplazado por un renew.

**Escenario que produce `-1`:**

1. `totalQRsCreated = 1`, `totalQRsAllowed = 1` → botón muestra `(0 restantes)`
2. Usuario hace **renew** → nuevo QR creado, viejo = `Inactive`, `totalQRsCreated` sigue en `1` (no se incrementó)
3. Usuario ve 2 QRs y cancela el **viejo** (Inactive) → `increment(-1)` → `totalQRsCreated = 0` — pero aún hay 1 QR Activo
4. Botón muestra `(1 restante)` incorrectamente
5. Usuario cancela el QR Activo → `increment(-1)` → **`totalQRsCreated = -1`**
6. Botón muestra **`(-1 restantes)`**

**Causa raíz:** `handleCancelQR` no distingue si el QR ya fue reemplazado (Inactive por renew). Siempre decrementa. Y `handleRenewQR` no incrementa el contador asumiendo que reusa el slot, pero `handleCancelQR` rompe ese supuesto.

#### Estado

- [ ] To be fixed

---

### 🔴 Bug #5 — Menú de opciones no responsive en mobile (QRCard)

#### Nombre

Menú de opciones no responsive en mobile

#### Descripción

En `QRCard.vue`, el menú que se abre al hacer clic en los 3 puntos (`more_horiz`) tiene un popover con `max-h-[200px]` y overflow-y-auto. En mobile, el menú puede salirse de la pantalla, verse cortado, y las opciones son difíciles de tocar por su tamaño reducido.

#### Fix aplicado

- Se reemplazó el popover pequeño en mobile por un **bottom sheet** a pantalla completa con fondo oscuro overlay
- El bottom sheet ocupa la mitad inferior de la pantalla con opciones más grandes, espaciadas y fáciles de tocar
- En desktop se mantiene el popover original con tooltips
- Se agregó un botón de descarga directo fuera del menú de opciones

#### Estado

- [x] Fixed — 2026-06-29

---

### 🔴 Bug #6 — Descarga de QR con nombre incorrecto a partir del 2do QR

#### Nombre

Descarga de QR con nombre del QR 1 al descargar desde el 2do QR en adelante

#### Descripción

Al descargar un QR desde `QRCard.vue`, si hay múltiples QRs en el grid, las funciones `handleDownloadPNG()` y `handleDownloadCompactPNG()` usan `document.getElementById('qr-capture-normal')` y `document.getElementById('qr-capture-compact')`. Como múltiples instancias del componente comparten los mismos IDs, `getElementById` siempre devuelve la primera instancia encontrada en el DOM, descargando siempre el QR 1 sin importar cuál se seleccione.

#### Fix aplicado

- Se reemplazaron los IDs estáticos por IDs dinámicos únicos usando `props.id`
- Las funciones de descarga ahora reciben el elemento por template refs dinámicas con IDs únicos

#### Estado

- [x] Fixed — 2026-06-29

---

## 🚀 Future Updates

_(Aún sin contenido. Sección reservada para features planeados a futuro.)_

---
