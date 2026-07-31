# 🧪 Ubiqueme — Firebase Security Rules Test Plan

## Configuración de prueba

| Variable    | Valor                                                         |
| ----------- | ------------------------------------------------------------- |
| `anonymous` | `request.auth = null`                                         |
| `scanner_1` | `request.auth.uid = "scanner_uid_1"`, rol en users: `scanner` |
| `user_1`    | `request.auth.uid = "user_uid_1"`, rol en users: `user`       |
| `user_2`    | `request.auth.uid = "user_uid_2"`, rol en users: `user`       |
| `admin_1`   | `request.auth.uid = "admin_uid_1"`, rol en users: `admin`     |

---

## 1. Colección: `users/{userId}`

| #    | Operación  | Actor       | Documento                               | Resultado Esperado | Fundamento (ruta/función)                                             |
| ---- | ---------- | ----------- | --------------------------------------- | ------------------ | --------------------------------------------------------------------- |
| 1.1  | **read**   | `user_1`    | `users/user_uid_1`                      | ✅ PASS            | `isOwnerOrAdmin` → `isOwner(user_uid_1)` = true                       |
| 1.2  | **read**   | `user_1`    | `users/user_uid_2`                      | ❌ ERROR           | `isOwnerOrAdmin` → `isOwner(user_uid_2)` = false, `isAdmin()` = false |
| 1.3  | **read**   | `admin_1`   | `users/user_uid_1`                      | ✅ PASS            | `isOwnerOrAdmin` → `isAdmin()` = true                                 |
| 1.4  | **read**   | `anonymous` | `users/user_uid_1`                      | ❌ ERROR           | No autenticado, `isAuth()` = false                                    |
| 1.5  | **create** | `user_1`    | `users/user_uid_1` (datos válidos)      | ✅ PASS            | `isOwner(userId)` + `isValidUserData`                                 |
| 1.6  | **create** | `user_1`    | `users/user_uid_2` (datos válidos)      | ❌ ERROR           | `isOwner(user_uid_2)` = false, `isAdmin()` = false                    |
| 1.7  | **create** | `user_1`    | `users/user_uid_1` (falta campo `name`) | ❌ ERROR           | `isValidUserData` = false (faltan keys requeridas)                    |
| 1.8  | **create** | `anonymous` | `users/new_uid`                         | ❌ ERROR           | `isAuth()` = false                                                    |
| 1.9  | **create** | `admin_1`   | `users/new_uid` (datos válidos)         | ✅ PASS            | `isAdmin()` = true + `isValidUserData`                                |
| 1.10 | **update** | `user_1`    | `users/user_uid_1` (cambiar `phone`)    | ✅ PASS            | `isOwner` + `affectedKeys.hasOnly(['phone'])`                         |
| 1.11 | **update** | `user_1`    | `users/user_uid_1` (cambiar `role`)     | ❌ ERROR           | `role` no está en la lista permitida para owner                       |
| 1.12 | **update** | `user_1`    | `users/user_uid_2`                      | ❌ ERROR           | No es owner ni admin                                                  |
| 1.13 | **update** | `admin_1`   | `users/user_uid_1` (cambiar `isBanned`) | ✅ PASS            | `isAdmin()` = true (sin restricción de campos)                        |
| 1.14 | **delete** | `user_1`    | `users/user_uid_1`                      | ❌ ERROR           | Solo admin puede eliminar                                             |
| 1.15 | **delete** | `admin_1`   | `users/user_uid_1`                      | ✅ PASS            | `isAdmin()` = true                                                    |
| 1.16 | **delete** | `anonymous` | `users/user_uid_1`                      | ❌ ERROR           | No autenticado                                                        |

---

## 2. Subcolección: `users/{userId}/subscriptions/{subId}`

| #    | Operación  | Actor       | Documento                                                            | Resultado Esperado | Fundamento                                                    |
| ---- | ---------- | ----------- | -------------------------------------------------------------------- | ------------------ | ------------------------------------------------------------- |
| 2.1  | **read**   | `user_1`    | `users/user_uid_1/subscriptions/sub_1`                               | ✅ PASS            | `isOwner(user_uid_1)` = true                                  |
| 2.2  | **read**   | `user_1`    | `users/user_uid_2/subscriptions/sub_2`                               | ❌ ERROR           | No es owner ni admin                                          |
| 2.3  | **read**   | `admin_1`   | `users/user_uid_1/subscriptions/sub_1`                               | ✅ PASS            | `isAdmin()` = true                                            |
| 2.4  | **read**   | `anonymous` | `users/user_uid_1/subscriptions/sub_1`                               | ❌ ERROR           | No autenticado                                                |
| 2.5  | **create** | `user_1`    | `users/user_uid_1/subscriptions/new_sub`                             | ❌ ERROR           | Solo admin puede crear suscripciones                          |
| 2.6  | **create** | `admin_1`   | `users/user_uid_1/subscriptions/new_sub` (datos válidos)             | ✅ PASS            | `isAdmin()` + `isValidSubscriptionData` + userId match        |
| 2.7  | **create** | `admin_1`   | `users/user_uid_1/subscriptions/new_sub` (planType inválido: "free") | ❌ ERROR           | `isValidSubscriptionData` = false (planType no está en lista) |
| 2.8  | **create** | `admin_1`   | `users/user_uid_1/subscriptions/new_sub` (userId != user_uid_1)      | ❌ ERROR           | `request.resource.data.userId == userId` = false              |
| 2.9  | **update** | `user_1`    | `users/user_uid_1/subscriptions/sub_1`                               | ❌ ERROR           | Solo admin puede actualizar suscripciones                     |
| 2.10 | **update** | `admin_1`   | `users/user_uid_1/subscriptions/sub_1` (cancelar)                    | ✅ PASS            | `isAdmin()` = true                                            |
| 2.11 | **delete** | `user_1`    | `users/user_uid_1/subscriptions/sub_1`                               | ❌ ERROR           | Solo admin puede eliminar                                     |
| 2.12 | **delete** | `admin_1`   | `users/user_uid_1/subscriptions/sub_1`                               | ✅ PASS            | `isAdmin()` = true                                            |

---

## 3. Subcolección: `users/{userId}/qrs/{qrId}`

| #    | Operación  | Actor       | Documento                                                 | Resultado Esperado | Fundamento                                                                                                                                      |
| ---- | ---------- | ----------- | --------------------------------------------------------- | ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| 3.1  | **read**   | `user_1`    | `users/user_uid_1/qrs/qr_1`                               | ✅ PASS            | `isOwner(user_uid_1)` = true                                                                                                                    |
| 3.2  | **read**   | `user_1`    | `users/user_uid_2/qrs/qr_2`                               | ❌ ERROR           | No es owner ni admin                                                                                                                            |
| 3.3  | **read**   | `admin_1`   | `users/user_uid_1/qrs/qr_1`                               | ✅ PASS            | `isAdmin()` = true                                                                                                                              |
| 3.4  | **create** | `user_1`    | `users/user_uid_1/qrs/new_qr` (uid match + datos válidos) | ✅ PASS            | `isOwner` + uid match + `isValidUserQRData`                                                                                                     |
| 3.5  | **create** | `user_1`    | `users/user_uid_1/qrs/new_qr` (uid en doc = "otro_uid")   | ❌ ERROR           | `request.resource.data.uid == userId` = false                                                                                                   |
| 3.6  | **create** | `user_1`    | `users/user_uid_1/qrs/new_qr` (falta campo `category`)    | ❌ ERROR           | `isValidUserQRData` = false (category no es requerido, pero `hasAll` falla si falta algún key) ✅ (category no está en isValidUserQRData, PASS) |
| 3.7  | **create** | `admin_1`   | `users/user_uid_1/qrs/new_qr` (uid en doc = user_uid_1)   | ✅ PASS            | `isAdmin()` + uid match                                                                                                                         |
| 3.8  | **create** | `anonymous` | `users/user_uid_1/qrs/new_qr`                             | ❌ ERROR           | No autenticado                                                                                                                                  |
| 3.9  | **update** | `user_1`    | `users/user_uid_1/qrs/qr_1` (cambiar `status`)            | ✅ PASS            | `isOwner` + campo permitido                                                                                                                     |
| 3.10 | **update** | `user_1`    | `users/user_uid_1/qrs/qr_1` (cambiar `isBanned`)          | ❌ ERROR           | `isBanned` no está en la lista permitida para owner                                                                                             |
| 3.11 | **update** | `admin_1`   | `users/user_uid_1/qrs/qr_1` (cambiar `isBanned`)          | ✅ PASS            | `isAdmin()` = true                                                                                                                              |
| 3.12 | **delete** | `user_1`    | `users/user_uid_1/qrs/qr_1`                               | ❌ ERROR           | Solo admin puede eliminar                                                                                                                       |
| 3.13 | **delete** | `admin_1`   | `users/user_uid_1/qrs/qr_1`                               | ✅ PASS            | `isAdmin()` = true                                                                                                                              |

---

## 4. Colección: `publicQR/{qrId}`

| #    | Operación  | Actor       | Documento                                                   | Resultado Esperado | Fundamento                                              |
| ---- | ---------- | ----------- | ----------------------------------------------------------- | ------------------ | ------------------------------------------------------- |
| 4.1  | **read**   | `anonymous` | `publicQR/qr_1`                                             | ✅ PASS            | `allow read: if true` (público)                         |
| 4.2  | **read**   | `user_1`    | `publicQR/qr_1`                                             | ✅ PASS            | `allow read: if true` (público)                         |
| 4.3  | **create** | `user_1`    | `publicQR/new_qr` (uid en doc = user_uid_1 + datos válidos) | ✅ PASS            | `isAuth()` + uid match + `isValidPublicQRData`          |
| 4.4  | **create** | `user_1`    | `publicQR/new_qr` (uid en doc = user_uid_2)                 | ❌ ERROR           | `request.resource.data.uid == request.auth.uid` = false |
| 4.5  | **create** | `admin_1`   | `publicQR/new_qr` (uid en doc = user_uid_1 + datos válidos) | ✅ PASS            | `isAdmin()` + `isValidPublicQRData`                     |
| 4.6  | **create** | `anonymous` | `publicQR/new_qr`                                           | ❌ ERROR           | `isAuth()` = false, `isAdmin()` = false                 |
| 4.7  | **update** | `user_1`    | `publicQR/qr_1` (dueño, cambiar `status`)                   | ✅ PASS            | `isAuth()` + uid match + campo permitido                |
| 4.8  | **update** | `user_1`    | `publicQR/qr_1` (dueño, cambiar `isBanned`)                 | ❌ ERROR           | `isBanned` no está en la lista permitida para no-admin  |
| 4.9  | **update** | `user_1`    | `publicQR/qr_2` (no dueño)                                  | ❌ ERROR           | `resource.data.uid != request.auth.uid`                 |
| 4.10 | **update** | `admin_1`   | `publicQR/qr_1` (cambiar cualquier campo)                   | ✅ PASS            | `isAdmin()` = true                                      |
| 4.11 | **update** | `anonymous` | `publicQR/qr_1`                                             | ❌ ERROR           | `isAuth()` = false                                      |
| 4.12 | **delete** | `user_1`    | `publicQR/qr_1`                                             | ❌ ERROR           | Solo admin puede eliminar                               |
| 4.13 | **delete** | `admin_1`   | `publicQR/qr_1`                                             | ✅ PASS            | `isAdmin()` = true                                      |

---

## 5. Subcolección: `publicQR/{qrId}/logs/{logId}`

| #    | Operación  | Actor       | Documento                                            | Resultado Esperado | Fundamento                                    |
| ---- | ---------- | ----------- | ---------------------------------------------------- | ------------------ | --------------------------------------------- |
| 5.1  | **read**   | `anonymous` | `publicQR/qr_1/logs/log_1`                           | ❌ ERROR           | Solo admin puede leer logs                    |
| 5.2  | **read**   | `user_1`    | `publicQR/qr_1/logs/log_1`                           | ❌ ERROR           | Solo admin puede leer logs                    |
| 5.3  | **read**   | `admin_1`   | `publicQR/qr_1/logs/log_1`                           | ✅ PASS            | `isAdmin()` = true                            |
| 5.4  | **create** | `anonymous` | `publicQR/qr_1/logs/new_log` (datos mínimos válidos) | ✅ PASS            | `isValidLogData` (público)                    |
| 5.5  | **create** | `user_1`    | `publicQR/qr_1/logs/new_log` (datos válidos)         | ✅ PASS            | `isValidLogData` (público)                    |
| 5.6  | **create** | `anonymous` | `publicQR/qr_1/logs/new_log` (sin `scanDate`)        | ❌ ERROR           | `isValidLogData` = false (scanDate requerido) |
| 5.7  | **update** | `anonymous` | `publicQR/qr_1/logs/log_1`                           | ❌ ERROR           | Solo admin puede actualizar logs              |
| 5.8  | **update** | `user_1`    | `publicQR/qr_1/logs/log_1`                           | ❌ ERROR           | Solo admin puede actualizar logs              |
| 5.9  | **update** | `admin_1`   | `publicQR/qr_1/logs/log_1`                           | ✅ PASS            | `isAdmin()` = true                            |
| 5.10 | **delete** | `anonymous` | `publicQR/qr_1/logs/log_1`                           | ❌ ERROR           | Solo admin puede eliminar                     |
| 5.11 | **delete** | `admin_1`   | `publicQR/qr_1/logs/log_1`                           | ✅ PASS            | `isAdmin()` = true                            |

---

## 6. Colección: `deletionRecords/{docId}` (User Deletion — audit)

> Registros anónimos (sin PII) creados atómicamente por el worker admin-delete-user.
> Escritos/leídos únicamente por cuentas con rol `admin`.

| #    | Operación  | Actor       | Documento                    | Resultado Esperado | Fundamento                  |
| ---- | ---------- | ----------- | ---------------------------- | ------------------ | --------------------------- |
| 6.1  | **create** | `admin_1`   | `deletionRecords/new_rec`    | ✅ PASS            | `isAdmin()` = true          |
| 6.2  | **create** | `user_1`    | `deletionRecords/new_rec`    | ❌ ERROR           | `isAdmin()` = false         |
| 6.3  | **create** | `anonymous` | `deletionRecords/new_rec`    | ❌ ERROR           | `isAuth()` = false          |
| 6.4  | **read**   | `admin_1`   | `deletionRecords/rec_1`      | ✅ PASS            | `isAdmin()` = true          |
| 6.5  | **read**   | `user_1`    | `deletionRecords/rec_1`      | ❌ ERROR           | `isAdmin()` = false         |
| 6.6  | **update** | `admin_1`   | `deletionRecords/rec_1`      | ✅ PASS            | `isAdmin()` = true          |
| 6.7  | **delete** | `admin_1`   | `deletionRecords/rec_1`      | ✅ PASS            | `isAdmin()` = true          |
| 6.8  | **delete** | `user_1`    | `deletionRecords/rec_1`      | ❌ ERROR           | `isAdmin()` = false         |

## 7. Cascada de borrado (admin-delete-user worker)

> El worker se autentica con una cuenta con rol `admin` (prerequisito de despliegue),
> por lo que las rutas de borrado ya existentes se reutilizan sin cambios de reglas.

| #    | Operación  | Actor    | Documento                                     | Resultado Esperado | Fundamento                    |
| ---- | ---------- | -------- | --------------------------------------------- | ------------------ | ----------------------------- |
| 7.1  | **delete** | worker   | `users/{target}/subscriptions/{subId}`        | ✅ PASS            | `isAdmin()` = true            |
| 7.2  | **delete** | worker   | `users/{target}/qrs/{qrId}`                   | ✅ PASS            | `isAdmin()` = true            |
| 7.3  | **delete** | worker   | `publicQR/{qrId}`                             | ✅ PASS            | `isAdmin()` = true            |
| 7.4  | **delete** | worker   | `publicQR/{qrId}/logs/{logId}`                | ✅ PASS            | `isAdmin()` = true            |
| 7.5  | **delete** | worker   | `users/{target}`                              | ✅ PASS            | `isAdmin()` = true            |
| 7.6  | **create** | worker   | `deletionRecords/{retentionId}` (transacción) | ✅ PASS            | `isAdmin()` = true            |

## Resumen de Cobertura

| Colección                           | Reads  | Creates | Updates | Deletes | Total  |
| ----------------------------------- | ------ | ------- | ------- | ------- | ------ |
| `users/{userId}`                    | 4      | 5       | 4       | 3       | **16** |
| `users/{uid}/subscriptions/{subId}` | 4      | 4       | 2       | 2       | **12** |
| `users/{uid}/qrs/{qrId}`            | 3      | 5       | 4       | 2       | **14** |
| `publicQR/{qrId}`                   | 2      | 4       | 5       | 2       | **13** |
| `publicQR/{qrId}/logs/{logId}`      | 3      | 3       | 3       | 2       | **11** |
| `deletionRecords/{docId}`           | 2      | 3       | 1       | 2       | **8**  |
| Cascada de borrado (worker)         | —      | 1       | —       | 5       | **6**  |
| **Total**                           | **18** | **25**  | **19**  | **18**  | **80** |
