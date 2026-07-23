# Enhanced Nav Dropdown — Descriptions & Smooth Animation

## Goal

Enhance the existing desktop nav dropdowns in `HomeLayout.vue` with:
1. **Rich descriptions** — each section and each child item gets a short explanatory description drawn from existing page content
2. **Smoother animation** — replace the basic `.dropdown` CSS transition with a Framer-Motion-like spring easing (longer duration, scale + opacity + translateY)

Only one file is affected: `src/layouts/HomeLayout.vue`

---

## 1. Interface changes (lines 26–39)

Add optional `description` fields to both interfaces:

```ts
interface NavChild {
  label: string
  href?: string
  pathName?: string
  params?: Record<string, string>
  icon?: string
  description?: string              // NEW
}

interface NavLink {
  name: string
  pathName: string
  icon: string
  requiredLogin: boolean
  children?: NavChild[]
  description?: string              // NEW
}
```

---

## 2. Data — descriptions for each navLink (lines 42–71)

### Inicio (section)

```ts
{
  name: 'Inicio', pathName: 'home', icon: 'home', requiredLogin: false,
  description: 'Protege a tus seres queridos y pertenencias con tecnología QR inteligente',
  children: [
    { label: 'Beneficios', href: '#benefits', icon: 'verified',
      description: 'Conoce las características que hacen de Ubiqueme tu mejor aliado' },
    { label: 'Cómo funciona', href: '#how-it-works', icon: 'settings',
      description: 'Activa, vincula y recibe alertas en solo 3 pasos' },
    { label: 'Paso a paso', href: '#steps', icon: 'format_list_numbered',
      description: 'Guía visual con videos para configurar tu primer QR' },
    { label: 'Planes y precios', href: '#pricing', icon: 'payments',
      description: 'Compara planes desde $499 MXN/año con envío gratis' },
    { label: 'Videos de su Uso', href: '#videos', icon: 'play_circle',
      description: 'Mira cómo otros usuarios protegen sus objetos' },
    { label: 'Volver a la página principal', pathName: 'home', icon: 'open_in_new',
      description: 'Regresar al inicio del sitio' },
  ],
},
```

### Dashboard (no children, no changes needed — just a RouterLink)

```ts
{ name: 'Dashboard', pathName: 'dashboard', icon: 'dashboard_customize', requiredLogin: true },
```

### Ayuda (section)

```ts
{
  name: 'Ayuda', pathName: 'help', icon: 'help', requiredLogin: false,
  description: 'Resuelve tus dudas y obtén soporte personalizado',
  children: [
    { label: 'Preguntas frecuentes', pathName: 'help', icon: 'quiz',
      description: 'Respuestas a las preguntas más comunes sobre Ubiqueme' },
    { label: 'Contacto', pathName: 'contact', icon: 'contact_mail',
      description: 'Escríbenos y nuestro equipo te atenderá rápidamente' },
    { label: 'Guía de uso', pathName: 'help', icon: 'menu_book',
      description: 'Manual completo con todas las funciones disponibles' },
  ],
},
```

### Precios (section)

```ts
{
  name: 'Precios', pathName: 'pricing', icon: 'payments', requiredLogin: false,
  description: 'Planes flexibles desde $499 MXN/año — elige el tuyo',
  children: [
    { label: 'Plan Bronce', pathName: 'checkout', params: { planId: 'bronce' }, icon: 'workspace_premium',
      description: 'Protección básica — 1 QR activo, contador de escaneos' },
    { label: 'Plan Plata', pathName: 'checkout', params: { planId: 'plata' }, icon: 'workspace_premium',
      description: 'La opción más equilibrada — 3 QRs, historial 30 días' },
    { label: 'Plan Oro', pathName: 'checkout', params: { planId: 'oro' }, icon: 'workspace_premium',
      description: 'Control total — 5 QRs, mapa dinámico, ilimitado' },
    { label: 'Ver todos los planes', pathName: 'pricing', icon: 'apps',
      description: 'Compara todos los planes y elige el que más te convenga' },
  ],
},
```

---

## 3. Template — enhance dropdown rendering (lines 326–373)

### Before (current dropdown header)

```html
<div class="border-b border-gray-100 bg-gradient-to-r from-orange-50 to-white px-5 py-4">
  <h4 class="font-google-sans text-sm font-semibold text-gray-700">
    {{ link.name }}
  </h4>
</div>
```

### After (with section description)

```html
<div class="border-b border-gray-100 bg-gradient-to-r from-orange-50 to-white px-5 py-4">
  <h4 class="font-google-sans text-sm font-semibold text-gray-700">
    {{ link.name }}
  </h4>
  <p v-if="link.description" class="mt-1 text-[11px] leading-snug text-gray-500">
    {{ link.description }}
  </p>
</div>
```

### Before (current item row)

```html
<button v-for="child in link.children" :key="child.label" @click="handleChildClick(child)"
  class="group flex w-full cursor-pointer items-center gap-3 rounded-xl px-4 py-3 transition-all duration-200 hover:bg-orange-50">

  <span v-if="child.icon"
    class="material-symbols-outlined notranslate text-[20px] text-gray-400 transition-colors duration-300 group-hover:text-orange-500">
    {{ child.icon }}
  </span>

  <div class="flex flex-col items-start">
    <span class="text-sm font-medium text-gray-700 transition-colors group-hover:text-orange-600">
      {{ child.label }}
    </span>
  </div>

</button>
```

### After (with item description)

```html
<button v-for="child in link.children" :key="child.label" @click="handleChildClick(child)"
  class="group flex w-full cursor-pointer items-start gap-3 rounded-xl px-4 py-3 transition-all duration-200 hover:bg-orange-50">

  <span v-if="child.icon"
    class="material-symbols-outlined notranslate mt-0.5 text-[20px] text-gray-400 transition-colors duration-300 group-hover:text-orange-500">
    {{ child.icon }}
  </span>

  <div class="flex flex-col items-start min-w-0">
    <span class="text-sm font-medium text-gray-700 transition-colors group-hover:text-orange-600">
      {{ child.label }}
    </span>
    <span v-if="child.description" class="mt-0.5 text-[11px] leading-snug text-gray-400 text-left">
      {{ child.description }}
    </span>
  </div>

</button>
```

Key changes in the item row:
- `items-center` → `items-start` (so icon aligns with title when description wraps)
- `mt-0.5` on icon to align with the first text line
- `min-w-0` on the text container to prevent overflow
- Description span below the title in `text-[11px] text-gray-400`

---

## 4. CSS — smoother dropdown transition (lines 815–832)

Replace the existing `.dropdown` transition rules:

```css
.dropdown-enter-active {
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.dropdown-leave-active {
  transition: all 0.15s cubic-bezier(0.4, 0, 1, 1);
}

.dropdown-enter-from {
  opacity: 0;
  transform: translateY(-8px) scale(0.97);
}

.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px) scale(0.97);
}
```

| Token | Before | After | Effect |
|-------|--------|-------|--------|
| Enter duration | `0.15s` | `0.25s` | Slightly longer = feels deliberate |
| Enter easing | `ease-out` | `cubic-bezier(0.16, 1, 0.3, 1)` | Spring-like overshoot (Framer Motion feel) |
| Leave duration | `0.1s` | `0.15s` | Slightly slower exit |
| Leave easing | `ease-in` | `cubic-bezier(0.4, 0, 1, 1)` | Quick deceleration |
| Enter transform | `translateY(-4px)` | `translateY(-8px) scale(0.97)` | More travel distance + subtle scale-in |
| Leave transform | `translateY(-2px)` | `translateY(-4px) scale(0.97)` | Adds depth on exit |

---

## 5. Dropdown width (no change)

The dropdown remains `w-72` (288px). With descriptions wrapping to the second line (at 11px font), the longest description ("Compara planes desde $499 MXN/año con envío gratis") fits within 288px at roughly 2 lines. No width change needed.

---

## Validation

1. `npm run type-check` — no new errors (descriptions are optional strings)
2. `npm run lint` — 0 warnings/errors
3. Visual check:
   - Hover each nav item with children (Inicio, Ayuda, Precios)
   - Dropdown appears with section description below the header title
   - Each item shows its label + a smaller description below
   - Animation feels smooth with slight spring motion
   - Animation on leave is fast but not jarring
   - Description text is readable and accurate to the page content
