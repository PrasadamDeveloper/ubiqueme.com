# Template WhatsApp — ~~`ubiqueme_qr_scanned`~~ 🚫 DEPRECATED

> **🚫 DO NOT USE IN PROD AND DO NOT SUGGEST ANYMORE THIS TEMPLATE.**
> The actual template registered in Meta Business is **`notif`** (header image + 5 body params).
> See `ubiqueme-worker/src/index.ts` for the correct implementation.

**Categoría:** Utility  
**Idioma:** Spanish (MEX)

---

## Body del template

```
Notificación de ubiqueme.com

Alguien acaba de escanear su código QR {{qr_name}} y dejó este mensaje: "{{user_msg}}". Puede contactarlo en: {{scanner_contact}}
```

## Variables

| Variable              | Descripción                  | Ejemplo             |
| --------------------- | ---------------------------- | ------------------- |
| `{{qr_name}}`         | Nombre del código QR         | Mi Tienda           |
| `{{user_msg}}`        | Mensaje que dejó el escáner  | Hola, me interesa   |
| `{{scanner_contact}}` | Email o teléfono de contacto | <cliente@email.com> |

## Reglas cumplidas

- ✅ Variables en minúsculas con guiones bajos (`{{qr_name}}`, `{{user_msg}}`, `{{scanner_contact}}`)
- ✅ Variables NO están al principio ni al final del template
- ✅ 80/1028 caracteres (dentro del límite)
- ✅ Sin caracteres especiales prohibidos

## Header (opcional)

```
Alguien escaneó tu QR
```

## Footer (opcional)

```
⚠️ Interacción segura. Actúe con cuidado si responde.
```

---

## Cómo se usa en el worker

El worker usa el template `ubiqueme_qr_scanned` con **5 parámetros posicionales**:

| Parámetro | Variable Meta | Origen                           |
| --------- | ------------- | -------------------------------- |
| `{{1}}`   | Dueño         | `ownerData.displayName`          |
| `{{2}}`   | Contacto      | `scannerContact` del mensaje     |
| `{{3}}`   | Mensaje       | `customMessage` del mensaje      |
| `{{4}}`   | QR name       | `qrName` del mensaje / Firestore |
| `{{5}}`   | Hora          | `scanTime` del mensaje           |

### Mensaje que envía el escáner

El escáner envía vía WhatsApp un texto con este formato (el worker parsea con regex):

```
ID: {qrId}
QR: {QRName}
Contacto: {scannerContact}
Hora: {scanTime}
Mensaje: {mensaje}
```

### Payload que envía el worker a Meta

```json
{
  "messaging_product": "whatsapp",
  "recipient_type": "individual",
  "to": "521234567890",
  "type": "template",
  "template": {
    "name": "ubiqueme_qr_scanned",
    "language": { "code": "es_MX" },
    "components": [
      {
        "type": "body",
        "parameters": [
          { "type": "text", "text": "Nombre del dueño" },
          { "type": "text", "text": "cliente@email.com" },
          { "type": "text", "text": "Hola, me interesa" },
          { "type": "text", "text": "Mi Tienda" },
          { "type": "text", "text": "08/06/2026 10:00" }
        ]
      }
    ]
  }
}
```
