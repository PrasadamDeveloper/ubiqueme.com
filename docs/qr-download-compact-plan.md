# Plan de Compactación de Descarga de QRs

## Problema

El QR descargado tiene excesivo padding en los 4 lados (X e Y) debido a:

1. **Padding excesivo en X**: Los dominios (`localizarme.com` / `contactomio.com`) están ubicados en los extremos horizontales del canvas, generando un ancho innecesario en las barras negras laterales.
2. **Padding excesivo en Y**: El margen superior antes del QR y el margen inferior después de los dominios son demasiado grandes.
3. **El resultado**: La imagen PNG final incluye mucho espacio vacío alrededor del contenido útil, haciendo el QR más grande de lo necesario.

## Objetivo

Compactar la descarga **sin cambiar el diseño visual ni el tamaño aparente**. No se rediseña — solo se recorta el exceso de padding eliminando el "overwidth" de las barras negras, manteniendo el mismo aspecto visual pero en un canvas más ajustado.

---

## Análisis Técnico

### Componentes involucrados

- **`src/components/user/dashboard/QRDash/QRCard.vue`** — Template del QR (vista escritorio). Aquí se define la estructura:
  - Contenedor principal con padding (classes `p-*`).
  - Barra negra superior: logo + texto "Ubiqueme".
  - QR code central generado con la librería `qrcode`.
  - Barra negra inferior: dominios `localizarme.com` / `contactomio.com`.
- **`src/components/user/dashboard/QRDash/QRCardMobile.vue`** — Versión mobile del template (misma estructura, estilos responsive).

- **`src/components/user/dashboard/QRDash/MyQrDashMobile.vue`** — Vista que contiene el QR y el botón de descarga. Usa `html2canvas` para capturar el `QRCard` y descargar como PNG.

### Flujo de descarga actual

1. Usuario hace clic en "Descargar QR".
2. Se llama a `downloadQRCode()` en `MyQrDashMobile.vue`.
3. `html2canvas` captura el elemento DOM del `QRCard` con opciones como `scale: 3` (alta resolución).
4. Se genera un `canvas` → `toDataURL` → se crea un link de descarga → se descarga como PNG.

### Causa raíz del exceso de espacio

- **CSS padding**: El contenedor del QRCard usa clases Tailwind como `p-8` o `p-6` (padding interno), que agregan espacio entre el borde del contenedor y el contenido.
- **Estructura de las barras laterales**: Los dominios se renderizan en los extremos del flexbox (`justify-between` o similar), forzando a que ocupen todo el ancho disponible + los paddings laterales.
- **Altura excesiva**: Padding superior e inferior alrededor del QR central + altura de las barras negras.

---

## Planteamiento de Solución

### 1. Reducir padding interno del QRCard

**Archivo**: `QRCard.vue` y `QRCardMobile.vue`

| Ubicación                            | Cambio propuesto                                    |
| ------------------------------------ | --------------------------------------------------- |
| Contenedor principal (`div.card-qr`) | Reducir `p-8` → `p-3` o `p-4` (según prueba visual) |
| Padding vertical alrededor del QR    | Mínimo: `py-2` en lugar de `py-6` o `py-8`          |
| Padding horizontal                   | `px-2` o `px-3` en lugar de `px-6` o `px-8`         |

### 2. Acercar los dominios al centro

**Archivo**: `QRCard.vue` y `QRCardMobile.vue`

| Cambio propuesto                                                               |
| ------------------------------------------------------------------------------ | ------------------------------------- |
| Cambiar la barra inferior de `justify-between` a `justify-center` con `gap-*`  |
| Agregar un separador visual (un pipe `                                         | `) entre los dominios si es necesario |
| Asegurar que los dominios queden "casi pegados" en el centro de la barra negra |

### 3. Reducir padding superior (top bar)

| Cambio propuesto                                                                                    |
| --------------------------------------------------------------------------------------------------- |
| Reducir `pt-*` / `py-*` en la barra superior (logo + "Ubiqueme") para que quede más compacta arriba |
| Misma lógica para la barra inferior                                                                 |

### 4. Ajustar el crop en html2canvas (alternativa de respaldo)

Si los cambios de padding no son suficientes, se puede usar la opción `x`, `y`, `width`, `height` de `html2canvas` para recortar la imagen final. Sin embargo, el enfoque principal es **corregir el CSS** para que el renderizado ya sea compacto desde el DOM.

### 5. Verificar que la descarga no se distorsione

El `html2canvas` usa `scale: 3` para alta resolución. Si recortamos desde CSS, el scale se mantiene igual — la imagen será más pequeña en dimensiones totales pero igual en resolución y calidad visual.

---

## Archivos a modificar

1. **`src/components/user/dashboard/QRDash/QRCard.vue`** — Ajustes de padding (X e Y), acercar dominios al centro.
2. **`src/components/user/dashboard/QRDash/QRCardMobile.vue`** — Mismos ajustes para versión mobile.
3. **`src/components/user/dashboard/QRDash/MyQrDashMobile.vue`** — Verificar llamada a `html2canvas` y opciones de captura (sin cambios mayores, solo revisión).

---

## Resumen visual del cambio (antes vs después)

```
ANTES (con overwidth):
┌──────────────────────────────────────┐  ← mucho padding externo
│  ┌────────────────────────────────┐  │
│  │  [LOGO] Ubiqueme               │  │  ← padding superior
│  │                                │  │
│  │         ████████████            │  │
│  │         ██  QR   ██            │  │  ← QR centrado
│  │         ████████████            │  │
│  │                                │  │
│  │  localizarme.com    contactomio│  │  ← dominios en extremos
│  └────────────────────────────────┘  │
└──────────────────────────────────────┘

DESPUÉS (compactado):
┌────────────────────────────┐
│ [LOGO] Ubiqueme            │  ← padding superior reducido
│                            │
│     ████████████            │
│     ██  QR   ██            │  ← QR mismo tamaño
│     ████████████            │
│                            │
│ localizarme.com | contact..│  ← dominios centrados, padding lateral mínimo
└────────────────────────────┘
```

---

## Notas adicionales

- No se modifica la lógica de generación del QR (librería `qrcode`), solo su contenedor visual.
- No se cambia el tamaño del QR code en sí — solo se reduce el espacio vacío alrededor.
- Los cambios deben probarse tanto en vista mobile (donde se descarga) como en vista escritorio.
- La imagen descargada debe mantener su calidad (scale 3) y verse idéntica en apariencia pero más compacta.
