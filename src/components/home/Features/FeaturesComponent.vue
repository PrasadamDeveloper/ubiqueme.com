<script lang="ts" setup>
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
</script>

<template>
  <section data-od-id="features-section" class="bg-white py-20 sm:py-28">
    <div class="mx-auto max-w-7xl px-5 sm:px-8">
      <header data-od-id="features-header" class="mx-auto mb-16 max-w-2xl text-center sm:mb-20">
        <span
          class="inline-block rounded-full border border-orange-200 bg-orange-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-orange-600">
          Características
        </span>
        <h2 data-od-id="features-heading"
          class="mt-6 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
          Diseñado para proteger,<br>creado para confiar
        </h2>
        <p class="mx-auto mt-4 max-w-lg text-base leading-7 text-gray-500">
          Cada función mantiene sus objetos localizables sin comprometer su privacidad.
        </p>
      </header>
      <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <FeatureCard v-for="feature in features" :key="feature.title" :feature="feature" />
      </div>
    </div>
  </section>
</template>
