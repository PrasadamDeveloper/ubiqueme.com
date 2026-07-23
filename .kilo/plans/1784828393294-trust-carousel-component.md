# TrustCarousel — Expand-on-Hover with Descriptions

## Goal

Add an interactive hover behavior to the TrustCarousel pill in the header. When the user hovers over the pill, it smoothly expands vertically (no blur, no shadows) to reveal a short description underneath each cycling trust signal. The carousel pauses while hovered.

**Only one file changes:** `src/components/ui/TrustCarousel.vue`

---

## 1. Interface — add `description`

```ts
interface TrustItem {
  text: string
  icon: string
  alt: string
  description: string    // NEW
}
```

## 2. Items — add descriptions

```ts
const items: TrustItem[] = [
  {
    text: 'Empresa registrada',
    icon: SatIcon,
    alt: 'Registro SAT',
    description: 'Registrado ante el SAT · RFC activo',
  },
  {
    text: '15 Años Exp.',
    icon: YearsIcon,
    alt: 'Experiencia',
    description: 'Más de 15 años de experiencia en el mercado',
  },
  {
    text: 'Sitio Seguro',
    icon: SafeIcon,
    alt: 'Sitio seguro',
    description: 'Conexión cifrada SSL 256-bit — tus datos protegidos',
  },
]
```

## 3. Reactive state — add `isHovered`

```ts
const isHovered = ref(false)
```

Update the interval to pause when hovered:

```ts
onMounted(() => {
  timer = setInterval(() => {
    if (!isHovered.value) {
      currentIndex.value = (currentIndex.value + 1) % items.length
    }
  }, 4000)
})
```

## 4. Template — restructure inner item

The outer `<div>` gets `@mouseenter`/`@mouseleave` and a dynamic height:

```html
<div
  class="hidden md:flex items-center gap-2 bg-white/5 px-3 py-2 overflow-hidden transition-all duration-300"
  :style="{ height: isHovered ? '80px' : '55px' }"
  style="transition-timing-function: cubic-bezier(0.16, 1, 0.3, 1)"
  @mouseenter="isHovered = true"
  @mouseleave="isHovered = false"
>
```

Each item inside the `<Transition>` now has a two-row layout:

```html
<div :key="currentIndex" class="absolute inset-x-0 flex flex-col justify-center px-2" style="inset-block: 0;">
  <!-- Row 1: dot + text + icon -->
  <div class="flex items-center justify-start gap-2">
    <div class="flex items-center gap-2">
      <span class="w-[7px] h-[7px] rounded-xl bg-blue-400 shrink-0"></span>
      <span class="text-[11px] font-medium tracking-wide text-slate-500 whitespace-nowrap">
        {{ items[currentIndex]!.text }}
      </span>
    </div>
    <img
      :src="items[currentIndex]!.icon"
      :alt="items[currentIndex]!.alt"
      class="h-[40px] w-[40px] object-contain shrink-0 ml-auto"
    />
  </div>
  <!-- Row 2: description (only visible on hover) -->
  <div
    class="transition-all duration-300"
    :style="{ 
      opacity: isHovered ? 1 : 0,
      transform: isHovered ? 'translateY(0)' : 'translateY(4px)',
      transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)'
    }"
  >
    <span class="text-[10px] leading-snug text-slate-400">
      {{ items[currentIndex]!.description }}
    </span>
  </div>
</div>
```

## 5. Height calculation

| State | Height | Content |
|-------|--------|---------|
| Normal | `55px` | 16px padding (py-2) + 40px icon/row + negative space = 55px |
| Expanded | `80px` | 16px padding + 40px icon + 4px gap + ~18px description + 2px breathing = 80px |

The outer container uses `overflow-hidden` and CSS `transition: height 0.3s cubic-bezier(0.16, 1, 0.3, 1)` for a spring-like Framer Motion feel. The description fades+slides in at the same timing.

## 6. Edge cases

| Risk | Mitigation |
|------|------------|
| Description clipped during height transition | `overflow-hidden` on outer container handles this — content inside is always fully rendered, just clipped |
| Height jitters when cycling while not hovered | No change to existing behavior; carousel works exactly as before |
| Text reflows on hover | The title row is stable (40px icon + ~11px text); only the description row appears below, pushing nothing |
| Timer continues during hover | Pausing via `!isHovered.value` check prevents index changes while hovered |

## 7. Summary of all edits

| Location | Change |
|----------|--------|
| `TrustItem` interface | Add `description: string` |
| `items` array | Add `description` to each of 3 objects |
| Script | Add `isHovered = ref(false)`, update interval to check `isHovered` |
| Outer `<div>` | Add `overflow-hidden`, `:style="{ height }"`, `@mouseenter`/`@mouseleave`, custom transition-timing |
| Inner item `<div>` | Restructure: title row + collapsible description row with opacity/translate animation |

---

## Validation

1. `npm run type-check` — no new errors
2. `npm run lint` — 0 warnings/errors
3. Manual check:
   - Hover the trust pill — height expands smoothly from 55px to ~80px
   - Description fades+s lifts in below the title
   - Carousel pauses while hovered
   - Move mouse away — pill shrinks back, description fades out, carousel resumes
   - Description text matches each item: SAT / 15 Años / SSL
   - No blur, no shadows, no glass effects
