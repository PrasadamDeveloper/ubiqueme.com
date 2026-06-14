# Guía de Producción: Dashboard de Administración (Firestore en Tiempo Real)

Esta guía detalla los pasos técnicos y mejores prácticas de arquitectura para llevar el panel de control administrativo de **Ubiqueme** a producción. Nos enfocaremos en reemplazar la información estática (mock) por sincronización reactiva en tiempo real y transacciones atómicas seguras.

---

## 🚀 1. Sincronización en Tiempo Real (`onSnapshot`)

Para que el administrador visualice en todo momento el estado actualizado de los usuarios sin necesidad de refrescar la pantalla manualmente (evitando el botón "Sincronizar DB"), implementamos un listener de Firestore reactivo.

### 💡 Sugerencias de Código Óptimo
En lugar de estructurar un mapeo complejo de objetos, podemos aprovechar la desestructuración de JavaScript para poblar los 17 campos del modelo de datos de forma limpia.

#### Reemplazar la sección de `onMounted` y `fetchUsers` por:

```typescript
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore'
import { db } from '@/firebase'

// Listener activo en tiempo real
onMounted(() => {
  loading.value = true
  const usersQuery = query(collection(db, 'users'), orderBy('createdAt', 'desc'))
  
  onSnapshot(usersQuery, (snapshot) => {
    users.value = snapshot.docs.map(doc => ({
      uid: doc.id,
      ...doc.data()
    })) as MockUser[]
    loading.value = false
  }, (error) => {
    toast.error(`Error al sincronizar usuarios en tiempo real: ${error.message}`)
    loading.value = false
  })
})
```

---

## 🔒 2. Operaciones Atómicas y Seguras en Firestore

Para evitar inconsistencias en la base de datos (por ejemplo, suspender a un usuario pero que la interfaz no refresque correctamente, o que se asigne un QR pero falle el conteo total), todas las mutaciones administrativas deben ser escritas directamente en Firestore. Gracias al `onSnapshot`, la interfaz de usuario se actualizará sola de forma automática al completarse la transacción.

### 🚫 A. Suspender / Reactivar Acceso (Baneo)
La suspensión debe actualizar el campo `isBanned` y registrar el `banReason` en el documento del usuario.

#### 💡 Sugerencia de Una Sola Línea (Arrow Function)
Podemos escribir la mutación atómica en una función flecha ultra compacta:

```typescript
import { doc, updateDoc } from 'firebase/firestore'

// Función compacta atómica
const toggleUserBan = (uid: string, isBanned: boolean, banReason: string = '') =>
  updateDoc(doc(db, 'users', uid), { isBanned, banReason })
```

#### Integración en el controlador del Modal:
```typescript
const handleBanSubmit = async (reason: string) => {
  if (!selectedUserForBan.value) return
  const { id: uid, isBanned } = selectedUserForBan.value
  
  try {
    await toggleUserBan(uid, !isBanned, !isBanned ? reason : '')
    toast.success(isBanned ? 'Usuario reactivado' : 'Acceso suspendido con éxito')
  } catch (error: any) {
    toast.error(`Error al modificar restricción: ${error.message}`)
  } finally {
    isBanModalOpen.value = false
    selectedUserForBan.value = null
  }
}
```

---

### 💳 B. Actualizar Nivel de Suscripción (Plan)
Cuando el administrador cambia manualmente el plan de un usuario, debemos actualizar tanto el plan como sincronizar el estado del pago (`subscriptionStatus`).

#### 💡 Sugerencia de Código Limpio (Arrow Function con Expresión Condicional)
```typescript
const updateUserPlan = (uid: string, plan: string) =>
  updateDoc(doc(db, 'users', uid), { 
    plan, 
    subscriptionStatus: plan === 'alpha' ? 'inactive' : 'active' 
  })
```

#### Integración en el controlador del Modal:
```typescript
const handlePlanSubmit = async (newPlan: string) => {
  if (!selectedUserForPlan.value) return
  const { id: uid } = selectedUserForPlan.value
  
  try {
    await updateUserPlan(uid, newPlan)
    toast.success(`Plan del usuario actualizado a ${newPlan.toUpperCase()}`)
  } catch (error: any) {
    toast.error(`Error al cambiar el plan: ${error.message}`)
  } finally {
    isPlanModalOpen.value = false
    selectedUserForPlan.value = null
  }
}
```

---

### ⚡ C. Asignar Nuevo Código QR (Atomic Transaction con `writeBatch`)
Esta es la operación más crítica y propensa a errores si no se realiza atómicamente. Cuando asignamos un nuevo QR a un usuario, debemos realizar **tres tareas** de manera simultánea:
1. Crear el QR en la subcolección del usuario: `users/{uid}/qrs/{qrId}`.
2. Registrar la entrada pública en la colección global: `publicQR/{qrId}`.
3. Incrementar el contador acumulado del usuario `totalQRs` en `users/{uid}`.

Si alguna de estas operaciones falla individualmente, la base de datos quedará en un estado inconsistente. Por ello, es imperativo utilizar `writeBatch` combinando la función atómica `increment`.

#### 💡 Sugerencia de Estructuración de Lote (Batch)
```typescript
import { writeBatch, increment } from 'firebase/firestore'
import { nanoid } from 'nanoid'

const createQRAtomic = async (uid: string, qrName: string) => {
  const batch = writeBatch(db)
  const qrId = nanoid(10) // ID compacto y único de 10 caracteres

  // 1. Crear documento en la subcolección del usuario
  const userQRRef = doc(db, `users/${uid}/qrs`, qrId)
  batch.set(userQRRef, {
    id: qrId,
    name: qrName,
    status: 'Active',
    scans: 0,
    lastScan: null,
    createdAt: new Date(),
    isBanned: false,
    banReason: ''
  })

  // 2. Crear documento de referencia pública global
  const publicQRRef = doc(db, 'publicQR', qrId)
  batch.set(publicQRRef, {
    id: qrId,
    name: qrName,
    status: 'Active',
    isBanned: false,
    banReason: '',
    totalScans: 0,
    lastScan: null,
    uid: uid,
    tier: 'alpha' // Se puede mapear dinámicamente al plan del usuario
  })

  // 3. Incrementar atómicamente el contador totalQRs en el usuario
  const userRef = doc(db, 'users', uid)
  batch.update(userRef, {
    totalQRs: increment(1)
  })

  // Comprometer todos los cambios simultáneamente
  return batch.commit()
}
```

#### Integración en el controlador del Modal:
```typescript
const handleQRSubmit = async (qrName: string) => {
  if (!selectedUserForQR.value) return
  const { id: uid } = selectedUserForQR.value
  
  try {
    await createQRAtomic(uid, qrName)
    toast.success('Nuevo código QR asignado y registrado de forma atómica')
  } catch (error: any) {
    toast.error(`Error al asignar el código QR: ${error.message}`)
  } finally {
    isQRModalOpen.value = false
    selectedUserForQR.value = null
  }
}
```

---

## 🏆 Checklist de Producción para el Administrador

- [ ] **Suscripción al Listener**: Asegurarse de retornar la función unsubscribe en el ciclo `onUnmounted` del componente para liberar memoria en la sesión del administrador.
  ```typescript
  let unsubscribe: any = null
  
  onMounted(() => {
    unsubscribe = onSnapshot(...)
  })
  
  onUnmounted(() => {
    if (unsubscribe) unsubscribe()
  })
  ```
- [ ] **Validación de Identidades**: Asegurarse de que el panel de administración esté protegido mediante reglas de seguridad de Firestore (`firestore.rules`), impidiendo lecturas/escrituras en `/users` a cualquiera cuyo rol no sea explícitamente `'admin'` en su sesión autenticada.
- [ ] **Filtros de Búsqueda y Densidad**: El scroll horizontal (`min-w-[1200px]`) e indicadores tooltip aplicados en la interfaz de usuario garantizan un control absoluto de altas densidades de registros sin romper la vista en resoluciones bajas.
