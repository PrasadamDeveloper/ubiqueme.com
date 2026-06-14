<script lang="ts" setup>
import FeatureCard from './FeatureCard.vue'

const features = [
  {
    icon: 'visibility_off',
    title: 'Privacidad Blindada',
    description:
      'Mantenga su identidad y datos personales bajo llave. El sistema intermedia cada interacción para que nunca tenga que exponer su número telefónico o dirección real.',
  },
  {
    icon: 'notifications_active',
    title: 'Alertas Multi-Canal',
    description: 'Reciba notificaciones instantáneas a través de WhatsApp, correo electrónico o SMS en el preciso momento en que alguien escanea uno de sus códigos QR.',
  },
  {
    icon: 'grid_view',
    title: 'Gestión Centralizada',
    description: 'Controle todos sus QR desde un solo lugar. Administre códigos para su auto, mascotas, maletas y familiares de forma independiente pero en un mismo panel.',
  },
  {
    icon: 'chat_bubble',
    title: 'Comunicación Segura',
    description: 'Filtre el contacto inicial mediante mensajes predefinidos o permita que le dejen un mensaje directo, siempre manteniendo el anonimato de ambas partes.',
  },
  {
    icon: 'toggle_on',
    title: 'Control Total Instantáneo',
    description: 'Active o desactive cualquier código QR con un solo clic. Si recupera un objeto o cambia de planes, usted decide cuándo su código debe ser localizable.',
  },
  {
    icon: 'verified_user',
    title: 'Seguridad Certificada',
    description: 'Construido bajo estándares de seguridad modernos. Toda la información enviada y recibida está protegida para garantizar que solo usted reciba las alertas.',
  },
]
</script>

<template>
  <section class="pb-5 bg-[#09090b] px-8 md:px-24 mx-auto">
    <div class="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
      <div class="max-w-xl">
        <h2 class="font-headline text-4xl font-bold mb-6 text-white">
          Diseñado para la seguridad, construido para la tranquilidad.
        </h2>
        <p class="text-on-surface-variant text-lg">
          Cada función está diseñada para mantener su privacidad mientras lo mantiene perfectamente
          localizable en los momentos que más importan.
        </p>
      </div>
      <div class="pb-2"></div>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      <FeatureCard v-for="feature in features" :key="feature.title" :feature="feature" />
    </div>
  </section>
</template>

<style scoped></style>
