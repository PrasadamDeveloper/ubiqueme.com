# Dashboard — Flujo de datos: Suscripciones + QRs

Este documento explica cómo `MyQrDash.vue` obtiene y agrupa los datos de suscripciones y códigos QR del usuario.

---

## 1. Fuentes de datos (Firebase)

Se escuchan **2 colecciones en tiempo real** con `onSnapshot`:

```ts
// Suscripciones del usuario
const subscriptionsCollection = collection(db, `users/${userId}/subscriptions`)

// QRs del usuario
const userQrsCollection = collection(db, `users/${userId}/qrs`)
```

Cada vez que cambian los datos en Firebase, los listeners actualizan:

- `userSubscriptions.value` → array de `ISubscription[]`
- `userQRs.value` → array de `IMyQR[]`

---

## 2. El problema: `groupedQRs` y el `Record`

### Código actual (el confuso)

```ts
const groupedQRs = computed(() => {
  const groups: Record<string, { subscription: ISubscription; qrs: IMyQR[] }> = {}

  // Inicializar grupos basados en suscripciones
  userSubscriptions.value.forEach((sub) => {
    groups[sub.id] = { subscription: sub, qrs: [] }
  })

  // Asignar cada QR al grupo de su suscripción
  userQRs.value.forEach((qr) => {
    if (qr.subscriptionId) {
      const group = groups[qr.subscriptionId]
      if (group) {
        group.qrs.push(qr)
      }
    }
  })

  return Object.values(groups)
})
```

### ¿Qué hace paso a paso?

1. **Crea un objeto vacío `groups`** que usará como diccionario.
   - `Record<string, { subscription: ISubscription; qrs: IMyQR[] }>` significa: "un objeto donde cada **llave** es un string (el ID de la suscripción) y cada **valor** es un objeto con la suscripción y un array de QRs".
   - Ejemplo de cómo se ve por dentro:

     ```ts
     {
       "sub_abc123": { subscription: {...}, qrs: [...] },
       "sub_xyz789": { subscription: {...}, qrs: [] }
     }
     ```

2. **Llena el diccionario**: por cada suscripción, crea una entrada en `groups` con su `id` como llave y un array vacío de QRs.

3. **Asigna QRs a sus grupos**: por cada QR, si tiene `subscriptionId`, busca el grupo correspondiente en el diccionario y lo agrega al array `qrs`.

4. **Convierte a array**: `Object.values(groups)` transforma el diccionario en un array plano de grupos, que es lo que necesita el template para iterar con `v-for`.

### ¿Por qué es confuso?

- `Record<string, {...}>` no es intuitivo. Es un "diccionario" o "mapa" escrito a mano.
- Requiere crear el diccionario, llenarlo, luego convertirlo a array.
- Para alguien sin experiencia con este patrón, es difícil de leer.

---

## 3. Versión simplificada sugerida

### Alternativa A — `Map` (más legible)

```ts
const groupedQRs = computed(() => {
  // 1. Crear un Map: llave = sub.id, valor = grupo
  const groups = new Map<string, { subscription: ISubscription; qrs: IMyQR[] }>()

  // 2. Inicializar un grupo por cada suscripción
  for (const sub of userSubscriptions.value) {
    groups.set(sub.id, { subscription: sub, qrs: [] })
  }

  // 3. Asignar cada QR al grupo correcto
  for (const qr of userQRs.value) {
    const group = groups.get(qr.subscriptionId)
    if (group) {
      group.qrs.push(qr)
    }
  }

  // 4. Devolver solo los valores (sin las llaves)
  return [...groups.values()]
})
```

**Por qué es mejor:**

- `Map` comunica intención: "esto es un mapa llave → valor".
- `.set()`, `.get()`, `.values()` son explícitos.
- `[...groups.values()]` es más declarativo que `Object.values(groups)`.

### Alternativa B — `Array.map` + `filter` (aún más simple)

```ts
const groupedQRs = computed(() => {
  return userSubscriptions.value.map((sub) => ({
    subscription: sub,
    qrs: userQRs.value.filter((qr) => qr.subscriptionId === sub.id),
  }))
})
```

**Cómo funciona:**

1. `map` itera las suscripciones.
2. Por cada suscripción, `filter` busca todos los QRs cuyo `subscriptionId` coincida con el `sub.id`.
3. Devuelve directamente un array de grupos, sin diccionarios intermedios.

**Ventajas:**

- Sin `Record`, sin `Map`, sin mutación de objetos.
- 3 líneas de lógica real.
- Fácil de leer: "para cada suscripción, dame sus QRs filtrados".

**Desventaja mínima:** Si hay muchas suscripciones y muchos QRs, `filter` dentro de `map` es técnicamente `O(n*m)` en vez de `O(n+m)`. En la práctica, con < 10 suscripciones y < 50 QRs, la diferencia es imperceptible.

---

## 4. Resumen

| Concepto            | Explicación                                                                                               |
| ------------------- | --------------------------------------------------------------------------------------------------------- |
| `onSnapshot`        | Listener en tiempo real que actualiza `userSubscriptions` y `userQRs` cuando algo cambia en Firebase      |
| `computed`          | Reactivo: cada vez que `userSubscriptions` o `userQRs` cambian, `groupedQRs` se recalcula automáticamente |
| `Record<string, T>` | Un objeto usado como diccionario: las llaves son strings (IDs), los valores son del tipo `T`              |
| `Object.values()`   | Convierte el diccionario en un array para usarlo en `v-for`                                               |
| **Alternativas**    | Usar `Map` para más claridad, o `map` + `filter` para máxima simplicidad                                  |

La versión con `map` + `filter` es la recomendada si se busca código más legible y menos verboso.
