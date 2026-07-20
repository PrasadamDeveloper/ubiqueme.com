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
    title: 'Alertas multi-canal',
    description:
      'Reciba avisos mediante WhatsApp, correo o SMS cuando alguien interactúe con su QR.',
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

  <section class="bg-slate-50 py-16 sm:py-20">

    <div class="px-5 sm:px-8">


      <header class="max-w-2xl mb-10 sm:mb-14">

        <span class="text-xs font-semibold uppercase tracking-[0.18em] text-orange-600">
          Características
        </span>


        <h2 class="mt-3 text-3xl sm:text-4xl font-semibold tracking-tight text-slate-950">
          Diseñado para proteger, creado para confiar
        </h2>


        <p class="mt-4 text-base leading-7 text-slate-600">
          Cada función mantiene sus objetos localizables sin comprometer
          su privacidad.
        </p>

      </header>



      <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

        <FeatureCard v-for="feature in features" :key="feature.title" :feature="feature" />

      </div>


    </div>

  </section>

</template>
