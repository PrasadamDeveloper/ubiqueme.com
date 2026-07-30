# Plan: QR Download Readonly Mode for Regular Users

## Overview

Unify download entry points: "Personalizar posición" becomes the download UI for all users, but regular users see a readonly version (no drag, just size/format selection + export). Admin and a special email keep the full drag editor plus the classic "Descargar QR" prompt.

## Permission Logic

```typescript
const isEditor = computed(() =>
  userStore.getRole === 'admin' || userStore.getEmail === 'ubiqueme.services@gmail.com'
)
```

- `isEditor = true` → full "Personalizar posición" (drag enabled) + classic "Descargar QR" prompt
- `isEditor = false` → "Descargar QR" button opens DragPositioner readonly (no drag, download only)

## Files to Modify

### 1. `src/components/user/dashboard/QRDash/DragPositioner.vue`

**New prop:**
```typescript
readonly?: boolean  // default false
```

**When `readonly = true`:**
- Title: `"Descargar QR — {qrName}"` (instead of `"Personalizar posición — {qrName}"`)
- Subtitle: `"Selecciona el tamaño y formato para descargar"` (instead of `"Arrastra cada elemento para reposicionarlo"`)
- All `@mousedown` drag handlers become no-ops (early return if `readonly`)
- Remove `cursor-grab` classes from all draggable elements
- Hide the admin toolbar row entirely ("Copiar posiciones", "Restablecer", "Arrastra los elementos")
- Keep size selector (SM/MD/LG), Cancelar, PDF, PNG buttons

**Implementation pattern for drag disable:**
- In `startDrag()`: add `if (props.readonly) return` at the top
- In template: add `:class="readonly ? '' : 'cursor-grab'"` on draggable elements, or use `:style` to skip cursor changes

### 2. `src/components/user/dashboard/QRDash/QRCard.vue`

**New computed:**
```typescript
const isEditor = computed(() =>
  userStore.getRole === 'admin' || userStore.getEmail === 'ubiqueme.services@gmail.com'
)
```

**`menuOptions` → computed** (currently a plain array, must become a computed to filter based on role):

- If `isEditor`: keep options as-is (both "Personalizar posición" and "Descargar QR" entries unchanged)
- If `!isEditor`:
  - Entry 1: `{ label: 'Descargar QR', icon: 'download', description: 'Selecciona tamaño y formato para descargar', action: openDrag }`
  - Remove the second "Descargar QR" entry
  - Keep all other entries unchanged

**Direct download button** (line 654-658):
- Change `@click="openPrompt('download')"` to `@click="isEditor ? openPrompt('download') : openDrag()"`

**DragPositioner binding** (line 1223-1224):
- Add `:readonly="!isEditor"`

**Import:** `userStore` is already imported (line 6, used at line 93).

### 3. `src/components/user/dashboard/QRDash/QRCardMobile.vue`

**Add import:**
```typescript
import DragPositioner from './DragPositioner.vue'
```

**New computed:**
```typescript
const isEditor = computed(() =>
  userStore.getRole === 'admin' || userStore.getEmail === 'ubiqueme.services@gmail.com'
)
```

**Add `showDrag` ref and `openDrag` function:**
```typescript
const showDrag = ref(false)
const openDrag = () => {
  showMenu.value = false
  showDrag.value = true
}
```

**`menuOptions` → computed:**

- If `isEditor`: add "Personalizar posición" entry before "Descargar QR":
  - `{ label: 'Personalizar posición', icon: 'open_with', description: 'Arrastre cada elemento del QR para reposicionarlo a su gusto.', action: openDrag }`
  - Keep existing "Descargar QR" entry unchanged
- If `!isEditor`:
  - Entry: `{ label: 'Descargar QR', icon: 'download', description: 'Selecciona tamaño y formato para descargar', action: openDrag }`
  - Remove the classic "Descargar QR" entry

**Direct download button** (line 435-439):
- Change `@click="openPrompt('download')"` to `@click="isEditor ? openPrompt('download') : openDrag()"`

**Render DragPositioner** (at bottom of template, inside the root div, similar to QRCard.vue):
```html
<DragPositioner :visible="showDrag" :qr-id="props.id" :qr-name="props.name" :qr-img="props.img"
  :qr-data-url="qrHighResUrl" :download-size="downloadSize" :readonly="!isEditor"
  @close="showDrag = false" />
```

## What's NOT Changing

- The classic "Descargar QR" download prompt (format/style/size overlay) — kept as-is, still works for `isEditor` users via menu and direct button.
- Admin/special-email drag functionality — completely unchanged.
- DragPositioner's export (PDF/PNG), size selector, and template rendering — all kept.

## Edge Cases

- `userStore.getEmail` is empty string → `=== 'ubiqueme.services@gmail.com'` is `false` → treated as regular user. Correct.
- `role: 'scanner'` → not admin, not the special email → regular user behavior. Correct.
- DragPositioner already renders via Teleport to body, so mobile usage works without layout issues.
- The `downloadSize` prop passed to DragPositioner comes from `useQRDownload` composable, which is already imported in both QRCard and QRCardMobile.
