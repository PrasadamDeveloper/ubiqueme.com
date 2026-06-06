# Template WhatsApp — `ubiqueme_qr_scanned`

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

## Cómo se usará en el worker (una vez aprobado)

El worker enviará:

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
          { "type": "text", "text": "Mi Tienda" },
          { "type": "text", "text": "Hola, me interesa" },
          { "type": "text", "text": "cliente@email.com" }
        ]
      }
    ]
  }
}
```
