<script lang="ts" setup>
import type { IFeature } from '@/interfaces/IFeature'
import { ref, onMounted, onBeforeUnmount } from 'vue'
import FeatureCard from './FeatureCard.vue'

const features: IFeature[] = [
  {
    icon: 'visibility_off',
    title: 'Privacidad blindada',
    description:
      'Su identidad permanece protegida. La comunicación ocurre sin revelar teléfono, correo o dirección.',
  },
  {
    icon: 'notifications_active',
    title: 'Alertas en tiempo real',
    description:
      'Reciba una notificación al instante cuando alguien encuentre su objeto, directamente a su WhatsApp sin necesidad de revisar otras aplicaciones.',
  },
  {
    icon: 'grid_view',
    title: 'Gestión centralizada',
    description:
      'Administre todos sus códigos desde un único panel para objetos, mascotas o familiares.',
  },
  {
    icon: 'chat_bubble',
    title: 'Comunicación segura',
    description:
      'Permita contacto mediante mensajes protegidos manteniendo la privacidad de ambas partes.',
  },
  {
    icon: 'toggle_on',
    title: 'Control instantáneo',
    description:
      'Active o desactive cualquier código cuando lo necesite con un solo clic.',
  },
  {
    icon: 'verified_user',
    title: 'Seguridad moderna',
    description:
      'Información protegida mediante prácticas actuales de seguridad y privacidad.',
  },
]

const sectionEl = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null

onMounted(() => {
  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible')
          observer?.unobserve(entry.target)
        }
      })
    },
    { threshold: 0.1 }
  )
  if (sectionEl.value) {
    const els = sectionEl.value.querySelectorAll('.feature-stagger')
    els.forEach((el) => observer?.observe(el))
  }
})

onBeforeUnmount(() => {
  observer?.disconnect()
})
</script>

<template>
  <section data-od-id="features-section" ref="sectionEl"
    class="bg-white py-16 sm:py-20">

    <div class="mx-auto max-w-7xl px-5 sm:px-8">
      <header data-od-id="features-header" class="mx-auto mb-12 max-w-2xl text-center sm:mb-16">
        <span
          class="inline-block rounded-full bg-orange-50 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-orange-600">
          Características
        </span>
        <h2 data-od-id="features-heading"
          class="mt-5 text-[28px] font-semibold leading-tight tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
          Diseñado para proteger,<br>
          <span class="text-orange-500">creado para confiar</span>
        </h2>
        <p class="mx-auto mt-3 max-w-lg text-[15px] leading-relaxed text-slate-500">
          Cada función mantiene sus objetos localizables sin comprometer su privacidad.
        </p>
      </header>

      <!-- Mobile: iOS grouped cells -->
      <div class="bg-slate-50 rounded-2xl overflow-hidden sm:hidden">
        <div v-for="(feature, index) in features" :key="feature.title" class="feature-stagger"
          :style="{ transitionDelay: `${index * 60}ms` }">
          <div class="flex items-start gap-3 px-4 py-3.5"
            :class="index < features.length - 1 ? 'border-b border-[#C6C6C8]/30' : ''">
            <div class="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-orange-100">
              <span class="material-symbols-outlined notranslate text-[16px] text-orange-500">
                {{ feature.icon }}
              </span>
            </div>
            <div class="min-w-0">
              <p class="text-[15px] font-medium text-slate-900">{{ feature.title }}</p>
              <p class="mt-0.5 text-[13px] leading-relaxed text-slate-500">{{ feature.description }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Tablet / Desktop: card grid -->
      <div class="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="(feature, index) in features" :key="feature.title" class="feature-stagger"
          :style="{ transitionDelay: `${index * 80}ms` }">
          <FeatureCard :feature="feature" />
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.feature-stagger {
  opacity: 0;
  transform: translateY(16px);
  transition: opacity 0.5s cubic-bezier(0.22, 1, 0.36, 1), transform 0.5s cubic-bezier(0.22, 1, 0.36, 1);
}

@media (prefers-reduced-motion: reduce) {
  .feature-stagger {
    opacity: 1;
    transform: none;
    transition: none;
  }
}

.feature-stagger.is-visible {
  opacity: 1;
  transform: translateY(0);
}
</style>
