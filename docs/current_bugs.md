# 🐛 Current Bugs — Ubiqueme.com

> **Versión del documento:** 1.0  
> **Última actualización:** 2026-06-16 12:20 PM (America/Mexico_City)  
> **Propósito:** Hoja de ruta de bugs críticos para release. Cada bug se marca con checklist. Cuando un paso se completa, se agrega la fecha de terminación al lado del checkbox para que cualquier agente retome desde donde se quedó con contexto completo.

---

## 📋 Niveles de Criticidad

| Nivel | Nombre                 | Descripción                                                   |
| ----- | ---------------------- | ------------------------------------------------------------- |
| **1** | 🔴 **Critico Supremo** | Deja todo. No se puede lanzar a producción sin arreglar esto. |
| **2** | 🟠 **Crítico**         | Bug grave que puede causar pérdida de datos o inconsistencia. |
| **3** | 🟡 **Alto**            | Funcionalidad rota pero no corruptora de datos.               |
| **4** | 🔵 **Medio**           | UX incorrecta, comportamiento inesperado no crítico.          |
| **5** | ⚪ **Bajo**            | Mejora / cosmetico / deuda técnica.                           |

---

## 🔴 BUG #1 (Nivel 1) — `_setQrPrivate()` destruye el documento `publicQR/{id}` dejando logs huérfanos y rompe `onSnapshot`

### 🎯 Descripción

Cuando un usuario hace clic en "Hacer Privado" desde el menú del QR Card, se ejecuta `_setQrPrivate()` en `QRCard.vue` (línea 135). Esta función hace:

```ts
const publicQrRef = doc(db, 'publicQR', props.id)
batch.delete(publicQrRef) // ❌ Elimina el documento
batch.update(qrDoc, { status: 'Paused' })
```

### 💥 Impacto

| #   | Problema                                                                                                                           | Consecuencia                                                                                                            |
| --- | ---------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| 1   | `batch.delete(publicQrRef)` borra el documento `publicQR/{id}`                                                                     | ❌ Los logs en `publicQR/{id}/logs` quedan **huérfanos** — datos fantasma que nunca se limpian                          |
| 2   | El `onSnapshot` en `onMounted` (línea 169) escucha `doc(db, 'publicQR', props.id)`. Al borrarse, `docSnapshot.exists()` es `false` | ❌ **Toast de error permanente** cada vez que se actualiza el snapshot. La UI muestra "QR no encontrado" constantemente |
| 3   | Si el QR se reactiva después (`_setQrPublic()`), los logs viejos de la subcolección siguen ahí                                     | ❌ Datos inconsistentes — logs de cuando el QR estaba "privado" se mezclan con los nuevos                               |
| 4   | No hay forma de que el worker sepa que el QR está privado (el doc simplemente no existe)                                           | ⚠️ El worker no puede diferenciar entre "nunca existió" y "fue desactivado"                                             |

### 🧬 Archivos Afectados para este Fix

| Archivo                                           | Rol                                 | Cambio necesario                                                               |
| ------------------------------------------------- | ----------------------------------- | ------------------------------------------------------------------------------ |
| `src/components/user/dashboard/QRDash/QRCard.vue` | Frontend — acciones público/privado | Cambiar `delete` por `update` con flag `isPublic`                              |
| `src/interfaces/IPublicQR.ts`                     | Tipo de dato                        | Agregar campo `isPublic: boolean`                                              |
| `ubiqueme-worker/src/index.ts`                    | Worker de WhatsApp                  | Validar `isPublic === true` y `status === 'Active'` antes de procesar escaneos |
| `src/views/public/QRScannedView.vue`              | Vista pública de escaneo            | La vista ya lee `publicQR/{id}`, debe validar `isPublic`                       |

### ✅ Suggested Solution (Flag `isPublic`)

En lugar de borrar el documento, se agrega un campo `isPublic: boolean` al documento `publicQR/{id}`:

**1. `_setQrPrivate()` — QRCard.vue:135**

```ts
// ANTES (bug):
const publicQrRef = doc(db, 'publicQR', props.id)
batch.delete(publicQrRef)
batch.update(qrDoc, { status: 'Paused' })

// DESPUÉS (fix):
const publicQrRef = doc(db, 'publicQR', props.id)
batch.update(publicQrRef, {
  isPublic: false,
  status: 'Paused',
})
batch.update(qrDoc, { status: 'Paused' })
```

**2. `_setQrPublic()` — QRCard.vue:100**

```ts
// Agregar isPublic: true a los datos que se setean
const publicQRData: Record<string, unknown> = {
  ...existingData,
  isPublic: true,
  // ...resto igual
}
```

**3. `IPublicQR.ts`**

```ts
export interface IPublicQR {
  // ...campos existentes
  isPublic: boolean // 👈 NUEVO
}
```

**4. Worker (`ubiqueme-worker/src/index.ts`) — función `getQRData` y validaciones**

```ts
// En getQRData (línea 92), agregar:
interface QRData {
  uid?: string
  name?: string
  status?: string
  isPublic?: boolean // 👈 NUEVO
}
```

```ts
// En las validaciones de status (línea 368 y 480):
if (qrData.status !== 'Active' || !qrData.isPublic) {
  // Rechazar escaneo
}
```

**5. `onSnapshot` en QRCard.vue (línea 169)**

```ts
onSnapshot(doc(db, 'publicQR', props.id), (docSnapshot) => {
  if (!docSnapshot.exists()) {
    // NO mostrar toast de error — es normal para QRs de bronce o nuevos
    // simplemente no actualizar stats
    return
  }
  // ...resto igual
})
```

### 📋 Checklist de Implementación

- [x] **COMPLETADO — 2026-06-16** — `IPublicQR.ts`: Agregar campo `isPublic: boolean`
- [x] **COMPLETADO — 2026-06-16** — `QRCard.vue` `_setQrPrivate()`: Cambiar `delete` por `update` con `{ isPublic: false, status: 'Paused' }`
- [x] **COMPLETADO — 2026-06-16** — `QRCard.vue` `_setQrPublic()`: Agregar `isPublic: true` al set
- [x] **COMPLETADO — 2026-06-16** — `QRCard.vue` `onSnapshot`: Silenciar toast de error cuando doc no existe
- [x] **COMPLETADO — 2026-06-16** — `ubiqueme-worker/src/index.ts`: Validar `isPublic === true` en flujo de escaneo
- [x] **COMPLETADO — 2026-06-16** — `ubiqueme-worker/src/index.ts`: Agregar `isPublic` a `QRData`
- [x] **COMPLETADO — 2026-06-16** — `QRScannedView.vue`: Validar `isPublic` antes de mostrar datos (opcional, la vista de todas formas se considera deprecated)

### 📝 Notas de Implementación

- No hay necesidad de migración de datos para documentos `publicQR/{id}` existentes. Para los que ya existen (creados con `_setQrPublic`), son públicos por definición. Si hay documentos huérfanos por `_setQrPrivate`, habrá que limpiarlos manualmente en Firestore.
- Los logs en `publicQR/{id}/logs` se conservan intactos con este enfoque.
- El worker ya tiene lógica para `status !== 'Active'`, solo hay que agregar la validación de `isPublic`.

### 🔗 Referencias

- `QRCard.vue:_setQrPrivate` — línea 135-154
- `QRCard.vue:_setQrPublic` — línea 100-133
- `QRCard.vue:onSnapshot` — línea 169-186
- `ubiqueme-worker/src/index.ts:getQRData` — línea 92-104
- `ubiqueme-worker/src/index.ts:status validation` — línea 368-372 y 479-484
- `src/views/public/QRScannedView.vue:loadQRData` — línea 27-38
- `src/interfaces/IPublicQR.ts` — línea 1-18

### 📌 Next Steps

1. ✅ Cambios implementados en ACT MODE (2026-06-16)
2. ⏳ Verificar que el worker se despliega correctamente con `wrangler deploy`
3. ⏳ Probar flujo completo: bronce → hacer QR → hacer público → escanear → hacer privado → logs intactos
4. ⏳ Pasar a BUGS #2-6

### 👁️ Observations

> `2026-06-16 12:20 PM` — Bug documentado. Pendiente de implementación.
> `2026-06-16 12:25 PM` — Implementación completada. Todos los cambios en código aplicados. Worker: `isPublic` en `QRData`, `getQRData` lo retorna, validación en flujo de imagen y texto. Frontend: `_setQrPrivate` usa `update` en vez de `delete`, `_setQrPublic` escribe `isPublic: true`, `onSnapshot` silenciado. `IPublicQR.ts` actualizado.

---

## 🟠 BUG #2 (Nivel 2) — `handleCancelQR()` falla si `publicQR/{id}` no existe (QR de bronce nunca publicado)

### 🎯 Descripción

En `QRCard.vue:192`, `handleCancelQR()` intenta hacer `batch.update(publicQrDoc, { status: 'Canceled' })`. Si el QR nunca fue público (bronce), el documento `publicQR/{id}` **no existe**, y `update` sobre un doc inexistente lanza error.

### 💥 Impacto

- ❌ Usuarios bronce no pueden cancelar/desactivar su QR
- ❌ Error en consola, toast de error para el usuario

### 🧬 Archivos Afectados

- `src/components/user/dashboard/QRDash/QRCard.vue` — línea 192-210

### 📋 Estado

- [ ] **PENDIENTE** — Discutir solución antes de implementar

---

## 🟠 BUG #3 (Nivel 2) — `handleRenewQR()` falla si `publicQR/{id}` no existe

### 🎯 Descripción

En `QRCard.vue:212`, `handleRenewQR()` intenta `batch.update(publicQrDoc, { ... })`. Misma falla que BUG #2.

### 🧬 Archivos Afectados

- `src/components/user/dashboard/QRDash/QRCard.vue` — línea 212-238

### 📋 Estado

- [ ] **PENDIENTE** — Discutir solución antes de implementar

---

## 🟡 BUG #4 (Nivel 3) — `canMakePublic` bloquea "Hacer Privado" para plan bronce aunque el QR ya esté público

### 🎯 Descripción

En `QRCard.vue:241`:

```ts
const canMakePublic = computed(
  () => propsComputed.value.planType && propsComputed.value.planType !== 'bronce',
)
```

Este computed se usa TANTO para "Hacer Público" como para "Hacer Privado" (línea 246). Si el usuario es bronce:

- No puede hacer público un QR (correcto, solo 1 QR y es privado por defecto)
- **Pero si el QR milagrosamente ya está público** (ej: por upgrade temporal), **no puede hacerlo privado** — queda atrapado

### 💥 Impacto

- ⚠️ Usuario bronce con QR público no tiene forma de hacerlo privado
- ⚠️ UX incorrecta — el botón "Hacer Privado" no debería requerir plan pago si el QR ya está público

### 🧬 Archivos Afectados

- `src/components/user/dashboard/QRDash/QRCard.vue` — línea 241, 246

### 📋 Estado

- [ ] **PENDIENTE** — Discutir solución antes de implementar

---

## 🔵 BUG #5 (Nivel 4) — Plan `bronce` crea QR con `status: 'Active'` en `users/{uid}/qrs/{id}` pero no en `publicQR`

### 🎯 Descripción

Cuando se crea un QR desde el dashboard para plan bronce, el documento en `users/{uid}/qrs/{id}` tiene `status: 'Active'`. Pero el documento en `publicQR/{id}` nunca se crea (porque bronce no puede hacer públicos). El `onSnapshot` en QRCard.vue escucha `publicQR/{id}` y como no existe, muestra toast de error (actualmente silenciado o no).

### 💥 Impacto

- ⚠️ Confusión: el QR está "Activo" para el usuario pero no existe en la colección pública
- ⚠️ El `onSnapshot` puede generar errores en consola

### 📋 Estado

- [ ] **PENDIENTE** — Discutir solución antes de implementar

---

## ⚪ BUG #6 (Nivel 5) — `onSnapshot` sin unsubscribe en error

### 🎯 Descripción

En `QRCard.vue:169-186`, el `onSnapshot` tiene callback de error pero no hace `unsubscribe()` cuando ocurre el error. Esto puede causar fugas de memoria si el error es persistente.

### 💥 Impacto

- 🟢 Muy bajo — el snapshot se limpia con `onUnmounted` de todas formas

### 📋 Estado

- [ ] **PENDIENTE** — Discutir solución antes de implementar

---

## 📊 Resumen

| #   | Nivel    | Bug                                                   | Archivo          | Estado                                         |
| --- | -------- | ----------------------------------------------------- | ---------------- | ---------------------------------------------- |
| 1   | 🔴 **1** | `_setQrPrivate()` borra doc y logs huérfanos          | `QRCard.vue:135` | ✅ Implementado (flag `isPublic`) — 2026-06-16 |
| 2   | 🟠 **2** | `handleCancelQR()` falla si `publicQR/{id}` no existe | `QRCard.vue:192` | ⏳ Pendiente discusión                         |
| 3   | 🟠 **2** | `handleRenewQR()` falla si `publicQR/{id}` no existe  | `QRCard.vue:212` | ⏳ Pendiente discusión                         |
| 4   | 🟡 **3** | `canMakePublic` bloquea "Hacer Privado" para bronce   | `QRCard.vue:241` | ⏳ Pendiente discusión                         |
| 5   | 🔵 **4** | Plan bronce QR "Active" sin doc en `publicQR`         | `QRCard.vue:169` | ⏳ Pendiente discusión                         |
| 6   | ⚪ **5** | `onSnapshot` sin unsubscribe en error                 | `QRCard.vue:169` | ⏳ Pendiente discusión                         |

---

## 📐 Convenciones del Documento

- **Checklist items**: `- [ ] PENDIENTE — YYYY-MM-DD` o `- [x] COMPLETADO — YYYY-MM-DD`
- **Fechas**: Siempre en formato ISO con timezone
- **Referencias a código**: Incluir archivo y línea
- **Next Steps**: Al final de cada bug, listar los siguientes pasos concretos
- **Observations**: Timestampear cada observación para trazabilidad entre sesiones de diferentes agentes
