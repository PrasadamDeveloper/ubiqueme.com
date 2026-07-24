<script lang="ts" setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import FeatureCard from './FeatureCard.vue'

const features = [
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
    const wrappers = sectionEl.value.querySelectorAll('.feature-card-wrapper')
    wrappers.forEach((el) => observer?.observe(el))
  }
})

onBeforeUnmount(() => {
  observer?.disconnect()
})
</script>

<template>
  <section data-od-id="features-section" ref="sectionEl" class="relative overflow-hidden bg-white py-20 sm:py-28">
    <div class="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div class="bg-gradient-to-br from-orange-400/8 to-orange-500/15 absolute -right-48 -top-48 h-[500px] w-[500px] rounded-full blur-3xl" />
      <div class="bg-gradient-to-tr from-orange-400/5 to-orange-500/10 absolute -bottom-40 -left-40 h-[400px] w-[400px] rounded-full blur-3xl" />
    </div>

    <div class="relative mx-auto max-w-7xl px-5 sm:px-8">
      <header data-od-id="features-header" class="mx-auto mb-16 max-w-2xl text-center sm:mb-20">
        <span
          class="inline-block rounded-full border border-orange-200 bg-orange-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-orange-600">
          Características
        </span>
        <h2 data-od-id="features-heading"
          class="mt-6 text-4xl font-bold leading-tight tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
          Diseñado para proteger,<br>
          <span class="text-orange-600">creado para confiar</span>
        </h2>
        <p class="mx-auto mt-4 max-w-lg text-base leading-7 text-gray-500">
          Cada función mantiene sus objetos localizables sin comprometer su privacidad.
        </p>
      </header>
      <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="(feature, index) in features"
          :key="feature.title"
          class="feature-card-wrapper"
          :style="{ transitionDelay: `${index * 80}ms` }"
        >
          <FeatureCard :feature="feature" />
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.feature-card-wrapper {
  opacity: 0;
  transform: translateY(24px);
  transition: opacity 0.6s cubic-bezier(0.22, 1, 0.36, 1), transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
}

@media (prefers-reduced-motion: reduce) {
  .feature-card-wrapper {
    opacity: 1;
    transform: none;
    transition: none;
  }
}

.feature-card-wrapper.is-visible {
  opacity: 1;
  transform: translateY(0);
}
</style>
