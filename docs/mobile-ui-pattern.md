# Mobile UI Pattern — Android Material You (M3)

## Propósito

Este documento define el patrón de UI para todas las vistas **móviles** (viewport < 768px) en Ubiqueme. Las vistas de escritorio conservan su diseño original intacto. El objetivo es ofrecer una experiencia nativa Android con Material Design 3 (Material You) en dispositivos móviles, sin modificar la funcionalidad existente.

## Stack y Dependencias

| Herramienta             | Propósito                                                                                |
| ----------------------- | ---------------------------------------------------------------------------------------- |
| **Tailwind CSS**        | Utility-first styling con clases `bg-`, `text-`, `p-`, `rounded-`, `shadow-`             |
| **Material Symbols**    | Iconos vectoriales (se usa `material-symbols-outlined` con variación `FILL 1, wght 400`) |
| **Google Sans**         | Tipografía principal (`font-google-sans`)                                                |
| **html2canvas**         | Captura de QR para descarga como PNG                                                     |
| **Firebase Firestore**  | Backend de datos (CRUD de QRs, suscripciones, logs)                                      |
| **qrcode.vue / qrcode** | Generación de QR en cliente                                                              |

## Herramienta de Diseño Asistido

Para generar sistemas de diseño y guías de UI, se recomienda usar el skill `ui-ux-pro-max`:

```bash
npx skills add https://github.com/nextlevelbuilder/ui-ux-pro-max-skill --skill ui-ux-pro-max
```

Luego, para obtener un sistema de diseño completo:

```bash
python3 <skill-path>/scripts/search.py "<producto> <industria> <keywords>" --design-system [-p "Nombre del Proyecto"]
```

Ejemplo usado en este proyecto:

```bash
python3 ~/.agents/skills/ui-ux-pro-max/scripts/search.py \
  "QR code tracker management tool android dark material-you" \
  --design-system -p "Ubiqueme Mobile" -f markdown
```

Para consultas específicas por dominio:

```bash
python3 ~/.agents/skills/ui-ux-pro-max/scripts/search.py "<keyword>" --domain <dominio>
# Domains: product, style, color, typography, ux, chart, google-fonts, landing, react, web, prompt
```

## Arquitectura Mobile

### Convención de Nombres

Los componentes móviles se nombran con el sufijo `Mobile` y se colocan junto al componente de escritorio original:

```
src/components/user/dashboard/QRDash/
├── MyQrDash.vue              ← Desktop (intacto)
├── MyQrDashMobile.vue        ← Mobile (nuevo)
├── QRCard.vue                ← Desktop (intacto)
├── QRCardMobile.vue          ← Mobile (nuevo)
├── RequestQROverlay.vue      ← Desktop (intacto)
├── RequestQROverlayMobile.vue ← Mobile (nuevo)
```

### Detección de Dispositivo

En el layout principal (`DashboardView.vue`), se usa un reactive `isMobile` con event listener `resize` para decidir qué componente renderizar:

```typescript
const isMobile = ref(window.innerWidth < 768)
const onResize = () => {
  isMobile.value = window.innerWidth < 768
}
onMounted(() => window.addEventListener('resize', onResize))
onUnmounted(() => window.removeEventListener('resize', onResize))
```

El `componentsMap` incluye ambas versiones y el `currentComponent` computado elige la mobile cuando corresponde:

```typescript
const componentsMap = {
  'Mis QR': withLoader(() => import('...MyQrDash.vue')),
  'Mis QR Mobile': withLoader(() => import('...MyQrDashMobile.vue')),
}

const currentComponent = computed(() => {
  const name = componentsStore.getCurrentComponent
  if (isMobile.value && name === 'Mis QR') {
    return componentsMap['Mis QR Mobile']
  }
  return componentsMap[name]
})
```

### Lógica Compartida

Se debe **reutilizar la capa de datos** de los componentes desktop. No se duplica lógica Firestore ni stores. Los componentes mobile importan las mismas funciones y hooks:

- Stores: `useUserStore()`, `useImageStore()`
- Firebase: `db`, `collection`, `doc`, `onSnapshot`, `writeBatch`, `increment`, `Timestamp`
- Tipos: `IQRCard`, `IMyQR`, `ISubscription`, `IQRLog`

## Sistema de Colores M3 (Tema Oscuro)

Basado en el sistema de diseño generado con `ui-ux-pro-max`, adaptado al brand existente (naranja `#F38020`):

| Token M3                            | Valor     | Uso                                        |
| ----------------------------------- | --------- | ------------------------------------------ |
| `--md-sys-color-surface`            | `#1C1B1F` | Fondo de página y tarjetas base            |
| `--md-sys-color-surface-container`  | `#2B2930` | Tarjetas elevadas, contenedores            |
| `--md-sys-color-surface-variant`    | `#49454F` | Bordes, divisores, superficies secundarias |
| `--md-sys-color-primary`            | `#F38020` | Acciones primarias, botones, FAB           |
| `--md-sys-color-on-primary`         | `#000000` | Texto sobre primary                        |
| `--md-sys-color-on-surface`         | `#E6E1E5` | Texto principal                            |
| `--md-sys-color-on-surface-variant` | `#CAC4D0` | Texto secundario, etiquetas                |
| `--md-sys-color-outline`            | `#49454F` | Bordes de inputs y cards                   |

**Regla:** No se usan colores hardcodeados por pantalla. Todos los componentes mobile deben usar estos tokens directamente en clases Tailwind (ej. `bg-[#1C1B1F]`, `text-[#E6E1E5]`, `border-[#49454F]/30`).

## Patrones de Componentes M3

### 1. Tarjeta de QR (`QRCardMobile.vue`)

```
┌──────────────────────────────────┐
│          ┌──────────┐            │
│          │   QR     │            │  ← Hero: QR grande centrado
│          │  Code    │            │     (glow naranja detrás)
│          └──────────┘            │
│                                  │
│  Nombre QR          ⋮           │  ← Menú vertical (3 puntos)
│  #ID123    [Activo]             │  ← Status chip
│                                  │
│  📷 Escaneos: 42   [Descargar]  │  ← Stats + CTA
│                                  │
│  ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐    │
│  │  Ver registros          │    │  ← Logs toggle (dashed border)
│  └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘    │
└──────────────────────────────────┘
```

- Layout **vertical** (QR arriba, info abajo) — opuesto al desktop
- `bg-[#1C1B1F]`, `rounded-2xl`, `border-[#49454F]/30`
- Menú lateral en bottom sheet (`Teleport to body`, `bg-[#2B2930]`, handle bar)
- Prompts (cancelar, reemplazar, editar): **M3 Alert Dialog** centrado (`max-w-xs`, `bg-[#2B2930]`, `rounded-2xl`)
- Download: **Bottom sheet** (no full-screen overlay)

### 2. Bottom Sheet (Menú)

```html
<Teleport to="body">
  <!-- Backdrop scrim -->
  <Transition>
    <div
      v-if="showMenu"
      @click="showMenu = false"
      class="fixed inset-0 bg-black/40 z-40 cursor-default"
    />
  </Transition>

  <!-- Sheet -->
  <Transition>
    <div
      v-if="showMenu"
      class="fixed bottom-0 left-0 right-0 z-50 bg-[#2B2930] rounded-t-2xl
             pb-[env(safe-area-inset-bottom,16px)] max-h-[80vh] overflow-y-auto"
    >
      <!-- Handle bar -->
      <div class="w-10 h-1 bg-[#CAC4D0]/20 rounded-full mx-auto my-3" />
      <!-- Items con icono + label + descripción -->
      <button class="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5" />
    </div>
  </Transition>
</Teleport>
```

**Reglas del bottom sheet:**

- Handle bar siempre presente
- `pb-[env(safe-area-inset-bottom,16px)]` para notch/home indicator
- `max-h-[80vh]` con `overflow-y-auto`
- Items con altura ≥ 44px
- Opciones bloqueadas: `opacity-60`, icono `lock`, `cursor-not-allowed`
- Botón de "Cerrar" al final

### 3. M3 Alert Dialog

```html
<div class="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-6">
  <div class="w-full max-w-xs bg-[#2B2930] rounded-2xl p-6 border border-[#49454F]/30 space-y-4">
    <!-- Icono decorativo (warning, info, etc.) -->
    <div class="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center mx-auto">
      <span class="material-symbols-outlined text-rose-500 text-[24px]">warning</span>
    </div>
    <!-- Título + descripción -->
    <div class="text-center">
      <h3 class="text-[#E6E1E5] text-base font-medium">¿Desactivar código?</h3>
      <p class="text-[#CAC4D0]/60 text-sm mt-1">Descripción</p>
    </div>
    <!-- Botones: lado a lado -->
    <div class="flex gap-3">
      <button class="flex-1 py-2.5 bg-[#49454F]/30 text-[#E6E1E5] rounded-xl">Cancelar</button>
      <button class="flex-1 py-2.5 bg-rose-500 text-white rounded-xl">Desactivar</button>
    </div>
  </div>
</div>
```

### 4. Overlay de Envío Físico (`RequestQROverlayMobile.vue`)

- Full-screen bottom sheet (92vh max)
- Secciones colapsables con `<details>` / `<summary>` (acordeón nativo)
- Pricing banner compacto
- Formulario de dirección vertical (stacked)
- Lista de QRs con checkbox + expansión inline para personalización
- Sticky CTA button al final

### 5. FAB (Floating Action Button)

```html
<button
  @click="toggleCreateQrModal"
  class="fixed right-5 bottom-24 z-30 w-14 h-14 rounded-full
         bg-orange-500 text-black shadow-lg shadow-orange-500/30
         flex items-center justify-center active:scale-90 transition-all cursor-pointer"
>
  <span class="material-symbols-outlined text-[28px]">add</span>
</button>
```

Posicionado a `bottom-24` para no chocar con la bottom navigation bar del layout (`bottom-4` + `h-16` aprox).

## Espaciados y Ritmo

- **Gutter horizontal móvil:** `px-4` (16px) consistente en todas las páginas
- **Separación entre secciones:** `space-y-4` (16px)
- **Padding de tarjetas:** `p-3` (12px) o `p-4` (16px)
- **Altura inputs:** `h-10` (40px) — cumple touch target mínimo
- **Touch targets:** Todos los elementos interactivos ≥ 44px. Si el icono es más pequeño, se expande el área táctil con padding.

## Reglas de UI Mobile

### Layout

- `min-h-dvh` en lugar de `min-h-screen` para evitar problemas con la barra de navegación móvil
- `pb-32` en el contenedor principal para evitar que el contenido quede detrás de la bottom nav
- Safe-area insets: `pb-[env(safe-area-inset-bottom,16px)]` en bottom sheets
- Sin scroll horizontal en ningún componente

### Tipografía

- Títulos: `text-lg font-bold text-[#E6E1E5]`
- Body: `text-sm text-[#E6E1E5]`
- Secundaria: `text-xs text-[#CAC4D0]/50`
- Etiquetas pequeñas: `text-[9px] font-bold uppercase tracking-wider`
- Mono (IDs): `font-mono text-[8px] tracking-[0.15em]`

### Iconos

- Siempre usar `material-symbols-outlined` con clase `notranslate`
- Tamaños: `text-[14px]` (small), `text-[18px]` (medium), `text-[22px]` (large), `text-[28px]` (FAB)
- Variación: `font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24` (en CSS scoped)
- **Nunca usar emojis como iconos estructurales**

### Estados de Interacción

- `active:scale-[0.98]` o `active:scale-90` en elementos pulsables
- `cursor-pointer` en todo elemento clickable
- Transiciones: `transition-all duration-150` o `duration-300`
- Disabled: `opacity-50 cursor-not-allowed`
- Loading: spinner de `w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin`

### Animaciones

- Bottom sheet: `translate-y-full` → `translate-y-0`, 300ms ease-out
- Scrim backdrop: opacity 0 → 1, 300ms ease-out
- Alert dialog: opacity 0 → 1, 200ms ease-out
- Salida siempre más rápida que entrada (200ms vs 300ms)

## Cómo Agregar un Nuevo Componente Mobile

1. Identificar el componente desktop existente en `src/components/user/dashboard/`
2. Crear el archivo `NombreComponenteMobile.vue` en el mismo directorio
3. Copiar la lógica del script (Firebase, stores, tipos) — sin modificar la lógica de negocio
4. Reescribir el template siguiendo los patrones M3 de este documento
5. En el layout `DashboardView.vue`:
   - Agregar el import con `withLoader`
   - Agregar al `componentsMap` con key `"Nombre Componente Mobile"`
   - Asegurar que `currentComponent` computado resuelva la versión mobile cuando `isMobile.value` es true y `name` coincide
6. Verificar que el build no tenga errores: `npx vite build --logLevel error`

## Validación de UI Mobile

Antes de dar por terminado un componente mobile, verificar:

- [ ] Todos los touch targets ≥ 44px
- [ ] Sin scroll horizontal en viewport 375px
- [ ] Safe-area insets en bottom sheets y fixed elements
- [ ] `min-h-dvh` en contenedores principales
- [ ] No hay emojis usados como iconos
- [ ] Colores M3 consistentes (no hex hardcodeados por pantalla)
- [ ] Bottom sheet tiene handle bar
- [ ] Alert dialogs están centrados con scrim
- [ ] Loading states visibles durante operaciones async
- [ ] `cursor-pointer` en todos los botones
- [ ] El build compila sin errores
- [ ] La funcionalidad es idéntica al componente desktop (solo cambia el UI)

## Referencias

- Skill UI/UX Pro Max: `~/.agents/skills/ui-ux-pro-max/`
- Componentes mobile existentes: `src/components/user/dashboard/QRDash/*Mobile.vue`
- Layout con detección mobile: `src/views/dashboard/DashboardView.vue`

## Apéndice: Skills de Cline

### ¿Qué son las skills?

Son paquetes de instrucciones especializadas que extienden el conocimiento de Cline en temas específicos (diseño UI, Cloudflare Workers, email, etc.). Al activarse, Cline sigue automáticamente sus reglas sin necesidad de explicarle todo desde cero.

### ¿Dónde se almacenan?

```
~/.agents/skills/
├── ui-ux-pro-max/       ← Skill de diseño UI/UX
├── cloudflare/          ← Skill de Cloudflare (si se instala)
└── .../
```

### Instalación

```bash
npx skills add <url-del-repositorio>
```

### Listar skills instaladas

```bash
ls ~/.agents/skills/
```

### Desinstalar una skill

```bash
rm -rf ~/.agents/skills/<nombre-skill>
```

### Notas importantes

- Las skills no necesitan activación manual — Cline detecta automáticamente cuál aplicar según el contexto de la conversación.
- No hay un comando nativo `npx skills list`; se listan explorando el directorio directamente.
- Cada skill es independiente; instalarlas o eliminarlas no afecta otras funcionalidades del proyecto.
