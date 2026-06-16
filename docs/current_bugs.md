# 🐛 Current Bugs — Ubiqueme.com

> **Versión del documento:** 1.2  
> **Última actualización:** 2026-06-16 2:49 PM (America/Mexico_City)  
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

Cuando un usuario hace clic en "Hacer Privado" desde el menú del QR Card, se ejecuta `_setQrPrivate()` en `QRCard.vue` (línea 135). Esta función hacía:

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

### ✅ Solución Implementada (Flag `isPublic`)

En lugar de borrar el documento, se agregó un campo `isPublic: boolean` al documento `publicQR/{id}`:

**1. `_setQrPrivate()` — QRCard.vue:136-145**

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

**2. `_setQrPublic()` — QRCard.vue:100-134**

```ts
// Agregar isPublic: true a los datos que se setean
const publicQRData: Record<string, unknown> = {
  ...existingData,
  isPublic: true,
  // ...resto igual
}
```

**3. `IPublicQR.ts` — Se agregó `isPublic: boolean`**

**4. Worker (`ubiqueme-worker/src/index.ts`):**

- `QRData` interface: agregado `isPublic?: boolean`
- `getQRData()`: retorna `isPublic` desde Firestore
- Validación en flujo de imagen (línea 370): `qrData.status !== 'Active' || qrData.isPublic === false`
- Validación en flujo de texto (línea 482): `qrData.status !== 'Active' || qrData.isPublic === false`

**5. `onSnapshot` en QRCard.vue (línea 173-177)**

```ts
onSnapshot(doc(db, 'publicQR', props.id), (docSnapshot) => {
  if (!docSnapshot.exists()) {
    // NO mostrar toast de error — es normal para QRs de bronce o nuevos
    return
  }
  // ...resto igual
})
```

### ✅ Checklist de Implementación

- [x] **COMPLETADO — 2026-06-16** — `IPublicQR.ts`: Agregar campo `isPublic: boolean`
- [x] **COMPLETADO — 2026-06-16** — `QRCard.vue` `_setQrPrivate()`: Cambiar `delete` por `update` con `{ isPublic: false, status: 'Paused' }`
- [x] **COMPLETADO — 2026-06-16** — `QRCard.vue` `_setQrPublic()`: Agregar `isPublic: true` al set
- [x] **COMPLETADO — 2026-06-16** — `QRCard.vue` `onSnapshot`: Silenciar toast de error cuando doc no existe
- [x] **COMPLETADO — 2026-06-16** — `ubiqueme-worker/src/index.ts`: Validar `isPublic === true` en flujo de escaneo
- [x] **COMPLETADO — 2026-06-16** — `ubiqueme-worker/src/index.ts`: Agregar `isPublic` a `QRData`
- [x] **COMPLETADO — 2026-06-16** — `ubiqueme-worker` desplegado con `wrangler deploy`

### 📝 Notas de Implementación

- No hay necesidad de migración de datos para documentos `publicQR/{id}` existentes. Para los que ya existen (creados con `_setQrPublic`), son públicos por definición. Si hay documentos huérfanos por `_setQrPrivate`, habrá que limpiarlos manualmente en Firestore.
- Los logs en `publicQR/{id}/logs` se conservan intactos con este enfoque.
- El worker ya tiene lógica para `status !== 'Active'`, solo se agregó la validación de `isPublic`.

### 👁️ Observations

> `2026-06-16 12:20 PM` — Bug documentado. Pendiente de implementación.
> `2026-06-16 12:25 PM` — Implementación completada. Todos los cambios en código aplicados.
> `2026-06-16 02:11 PM` — Worker desplegado y verificado.

---

## 🟡 BUG #2 (Nivel 4 → Bajó de Nivel 2) — `handleCancelQR()` falla si `publicQR/{id}` no existe

> **⚠️ Criticidad re-evaluada post-fix BUG #1:** Antes era Nivel 2 porque `_setQrPrivate()` borraba el doc, haciendo que este fallo ocurriera en cada "Hacer Privado". Ahora que el doc **ya no se borra** (solo se marca `isPublic: false`), este bug solo ocurre para QR que **nunca fueron públicos** (bronce). Bajó a Nivel 4.

### 🎯 Descripción

En `QRCard.vue:194`, `handleCancelQR()` intenta hacer `batch.update(publicQrDoc, { status: 'Canceled' })`. Si el QR nunca fue público (bronce), el documento `publicQR/{id}` **no existe**, y `update` sobre un doc inexistente lanza error.

### 💥 Impacto

- ❌ Usuarios bronce no pueden cancelar/desactivar su QR si nunca lo hicieron público
- ❌ Error en consola, toast de error para el usuario

### 🧬 Archivos Afectados

- `src/components/user/dashboard/QRDash/QRCard.vue` — línea 194-212

### 💡 Solución Sugerida

Verificar si el documento `publicQR/{id}` existe antes de hacer `update`. Si no existe, solo actualizar `users/{uid}/qrs/{docId}`:

```ts
const handleCancelQR = async () => {
  try {
    isLoading.value = true
    const batch = writeBatch(db)
    const userQRDoc = doc(db, `users/${userStore.getUserId}/qrs/${props.docId}`)
    const publicQrDoc = doc(db, 'publicQR', props.id)

    batch.update(userQRDoc, { status: 'Canceled' })

    // Check if publicQR doc exists before trying to update it
    const publicSnap = await getDoc(publicQrDoc)
    if (publicSnap.exists()) {
      batch.update(publicQrDoc, { status: 'Canceled' })
    }

    await batch.commit()
    closeAll()
    toast.success(`QR desactivado permanentemente`)
  } catch (error) {
    const e = error as Error
    toast.error(`Error al desactivar QR: ${e.message}`)
  } finally {
    isLoading.value = false
  }
}
```

> **Nota:** Requiere importar `getDoc` desde `firebase/firestore`.

### 📋 Estado

- [x] **COMPLETADO — 2026-06-16** — Implementado: `getDoc` check antes de `batch.update`

---

## 🟡 BUG #3 (Nivel 4 → Bajó de Nivel 2) — `handleRenewQR()` falla si `publicQR/{id}` no existe

> **⚠️ Criticidad re-evaluada post-fix BUG #1:** Misma razón que BUG #2. Como el doc ya no se borra, solo afecta bronces nunca publicados. Bajó a Nivel 4.

### 🎯 Descripción

En `QRCard.vue:214`, `handleRenewQR()` intenta `batch.update(publicQrDoc, { ... })`. Misma falla que BUG #2.

### 🧬 Archivos Afectados

- `src/components/user/dashboard/QRDash/QRCard.vue` — línea 214-240

### 💡 Solución Sugerida

Misma estrategia que BUG #2 — verificar existencia del doc antes de `update`:

```ts
// Verificar si publicQR existe antes de actualizar
const publicSnap = await getDoc(publicQrDoc)
if (publicSnap.exists()) {
  batch.update(publicQrDoc, {
    status: 'Active',
    totalScans: 0,
    lastScan: null,
  })
}
```

### 📋 Estado

- [x] **COMPLETADO — 2026-06-16** — Implementado: `getDoc` check antes de `batch.update`

---

## 🟠 BUG #4 (Nivel 2 → Subió de Nivel 3) — `canMakePublic` bloquea "Hacer Privado" para plan bronce aunque el QR ya esté público

> **⚠️ Criticidad re-evaluada post-fix BUG #1:** **SUBIÓ a Nivel 2 (Crítico)** porque ahora que `_setQrPrivate()` marca `isPublic: false` en lugar de borrar el doc, un bronce con QR público queda atrapado — no puede hacerlo privado porque `canMakePublic` es `false` para bronce, y el botón "Hacer Privado" aparece bloqueado con candado.

### 🎯 Descripción

En `QRCard.vue:243`:

```ts
const canMakePublic = computed(
  () => propsComputed.value.planType && propsComputed.value.planType !== 'bronce',
)
```

Este computed se usa TANTO para "Hacer Público" como para "Hacer Privado" (línea 248). Si el usuario es bronce:

- No puede hacer público un QR (correcto, solo 1 QR y es privado por defecto)
- **Pero si el QR milagrosamente ya está público** (ej: por upgrade temporal o admin), **no puede hacerlo privado** — queda atrapado

### 💥 Impacto

- ❌ Usuario bronce con QR público no tiene forma de hacerlo privado
- ❌ UX incorrecta — el botón "Hacer Privado" no debería requerir plan pago si el QR ya está público
- ❌ Ahora con el fix de BUG #1, el QR público de bronce tiene `isPublic: true` y no hay forma de cambiarlo a `false`

### 🧬 Archivos Afectados

- `src/components/user/dashboard/QRDash/QRCard.vue` — línea 243, 248

### 💡 Solución Sugerida

Separar la lógica en dos computeds:

```ts
const isPublic = computed(() => /* check if QR is currently public */)
const canMakePublic = computed(() => propsComputed.value.planType !== 'bronce')
const canMakePrivate = computed(() => true) // Siempre se puede hacer privado
```

O mejor: que `canMakePrivate` esté disponible si el QR está público, independientemente del plan:

```ts
const canMakePrivate = computed(() => qrStatus.totalScans !== undefined || /* existe doc publicQR */)
```

En el menú:

```ts
{ label: 'Hacer Privado', action: canMakePrivate.value ? _setQrPrivate : undefined, locked: !canMakePrivate.value, ... }
```

### 📋 Estado

- [x] **COMPLETADO — 2026-06-16** — Separado `canMakePrivate` computed. "Hacer Privado" usa `canMakePrivate` que es `true` si `qrStatusLoaded` (publicQR doc existe) o si el plan lo permite.

---

## 🔵 BUG #5 (Nivel 4) — Plan `bronce` crea QR con `status: 'Active'` en `users/{uid}/qrs/{id}` pero no en `publicQR`

### 🎯 Descripción

Cuando se crea un QR desde el dashboard para plan bronce, el documento en `users/{uid}/qrs/{id}` tiene `status: 'Active'`. Pero el documento en `publicQR/{id}` nunca se crea (porque bronce no puede hacer públicos). El `onSnapshot` en QRCard.vue escucha `publicQR/{id}` y como no existe, antes mostraba toast de error (ahora silenciado en BUG #1).

### 💥 Impacto

- ⚠️ Confusión: el QR está "Activo" para el usuario pero no existe en la colección pública
- ⚠️ El `onSnapshot` ya no muestra error (silenciado en BUG #1), pero la UI sigue mostrando "Activo" aunque nunca se publicó

### 🧬 Archivos Afectados

- `src/components/user/dashboard/QRDash/QRCard.vue` — línea 173-177 (snapshot silenciado)
- Probablemente lógica de creación de QR para bronce

### 💡 Solución Sugerida

1. Opción A: Mostrar estado "Sin publicar" en la UI para bronces que nunca publicaron
2. Opción B: Cambiar el status inicial de bronce a algo como `'Draft'` o `'Unpublished'`
3. Opción C: Crear el documento `publicQR/{id}` desde el inicio con `isPublic: false`, así el `onSnapshot` siempre tiene un doc que escuchar

### 📋 Estado

- [x] **COMPLETADO — 2026-06-16** — `currentStatus` muestra "Sin publicar" si `planType === 'bronce'`, status `'Active'`, y `qrStatusLoaded` es `false`.

---

## ⚪ BUG #6 (Nivel 5) — `onSnapshot` sin unsubscribe en error

### 🎯 Descripción

En `QRCard.vue:173-187`, el `onSnapshot` tiene callback de error (línea 184-186) pero no hace `unsubscribe()` cuando ocurre el error. Esto puede causar fugas de memoria si el error es persistente.

### 💥 Impacto

- 🟢 Muy bajo — el snapshot se limpia con `onUnmounted` de todas formas
- Sin embargo, si el error ocurre, el snapshot sigue activo intentando reconectar

### 🧬 Archivos Afectados

- `src/components/user/dashboard/QRDash/QRCard.vue` — línea 173-187

### 💡 Solución Sugerida

```ts
onSnapshot(
  doc(db, 'publicQR', props.id),
  (docSnapshot) => {
    // ...success handler
  },
  (error) => {
    toast.error(`Error al obtener datos: ${error}`)
    if (unsubscribe) unsubscribe() // 👈 Limpiar listener en error
  },
)
```

### 📋 Estado

- [x] **COMPLETADO — 2026-06-16** — Agregado `if (unsubscribe) unsubscribe()` en error callback de `onSnapshot`.

---

## 🔵 BUG #7 (Nivel 4 — NUEVO) — `handleEdit` falla si `publicQR/{id}` no existe

### 🎯 Descripción

En `QRCard.vue:76`, `handleEdit()` hace:

```ts
const publicQrDoc = doc(db, 'publicQR', props.id)
batch.update(publicQrDoc, { name: qrName.value })
```

Si el QR nunca fue público (bronce), el documento `publicQR/{id}` no existe → `batch.update` falla.

### 💥 Impacto

- ❌ Usuarios bronce no pueden editar el nombre de su QR (error en consola + toast)
- ❌ La actualización del nombre en `users/{uid}/qrs/{id}` tampoco se aplica porque falla todo el batch

### 🧬 Archivos Afectados

- `src/components/user/dashboard/QRDash/QRCard.vue` — línea 76-98

### 💡 Solución Sugerida

Verificar si `publicQR/{id}` existe antes de hacer `update`. Similar a BUG #2/3:

```ts
const handleEdit = async () => {
  try {
    isLoading.value = true
    const userQRDoc = doc(db, `users/${userStore.getUserId}/qrs/${props.id}`)
    const publicQrDoc = doc(db, 'publicQR', props.id)
    const batch = writeBatch(db)

    batch.update(userQRDoc, { name: qrName.value })

    // Only update publicQR doc if it exists
    const publicSnap = await getDoc(publicQrDoc)
    if (publicSnap.exists()) {
      batch.update(publicQrDoc, { name: qrName.value })
    }

    await batch.commit()
    closeAll()
    toast.success(`Nombre de QR actualizado`)
  } catch (error) {
    const e = error as Error
    toast.error(`Error al editar el nombre del QR: ${e.message}`)
  } finally {
    isLoading.value = false
  }
}
```

### 📋 Estado

- [x] **COMPLETADO — 2026-06-16** — Implementado: `getDoc` check antes de `batch.update`

---

## 📊 Resumen

| #   | Nivel (Nuevo) | Nivel (Original) | Bug                                                   | Archivo          | Estado                                         |
| --- | ------------- | ---------------- | ----------------------------------------------------- | ---------------- | ---------------------------------------------- |
| 1   | 🔴 **1**      | 🔴 1             | `_setQrPrivate()` borra doc y logs huérfanos          | `QRCard.vue:135` | ✅ Implementado (flag `isPublic`) — 2026-06-16 |
| 2   | 🔵 **4**      | 🟠 2             | `handleCancelQR()` falla si `publicQR/{id}` no existe | `QRCard.vue:194` | ✅ Implementado — 2026-06-16                   |
| 3   | 🔵 **4**      | 🟠 2             | `handleRenewQR()` falla si `publicQR/{id}` no existe  | `QRCard.vue:214` | ✅ Implementado — 2026-06-16                   |
| 4   | 🟠 **2**      | 🟡 3             | `canMakePublic` bloquea "Hacer Privado" para bronce   | `QRCard.vue:243` | ✅ Implementado — 2026-06-16                   |
| 5   | 🔵 **4**      | 🔵 4             | Plan bronce QR "Active" sin doc en `publicQR`         | `QRCard.vue:173` | ✅ Implementado — 2026-06-16                   |
| 6   | ⚪ **5**      | ⚪ 5             | `onSnapshot` sin unsubscribe en error                 | `QRCard.vue:173` | ✅ Implementado — 2026-06-16                   |
| 7   | 🔵 **4**      | — (NUEVO)        | `handleEdit` falla si `publicQR/{id}` no existe       | `QRCard.vue:76`  | ✅ Implementado — 2026-06-16                   |

### 🔑 Prioridad de Implementación Recomendada

**✅ Todos los bugs han sido implementados.**

### ⚠️ Cambios de Criticidad por BUG #1

- **BUG #2**: Bajó de 🟠 Nivel 2 → 🔵 Nivel 4 (el doc ya no se borra, solo afecta bronces)
- **BUG #3**: Bajó de 🟠 Nivel 2 → 🔵 Nivel 4 (misma razón)
- **BUG #4**: Subió de 🟡 Nivel 3 → 🟠 Nivel 2 (bronce queda atrapado con QR público sin poder hacerlo privado) ✅ Implementado
- **BUG #5**: 🔵 Nivel 4 — Estado "Sin publicar" para bronce ✅ Implementado
- **BUG #6**: ⚪ Nivel 5 — `unsubscribe()` en error callback ✅ Implementado
- **BUG #7**: Nuevo descubrimiento al revisar `handleEdit` — Nivel 4 ✅ Implementado

---

## 📐 Convenciones del Documento

- **Checklist items**: `- [ ] PENDIENTE — YYYY-MM-DD` o `- [x] COMPLETADO — YYYY-MM-DD`
- **Fechas**: Siempre en formato ISO con timezone
- **Referencias a código**: Incluir archivo y línea
- **Next Steps**: Al final de cada bug, listar los siguientes pasos concretos
- **Observations**: Timestampear cada observación para trazabilidad entre sesiones de diferentes agentes
- **Re-evaluaciones**: Cuando un bug cambia de criticidad por cambios en otro bug, documentar la razón del cambio
