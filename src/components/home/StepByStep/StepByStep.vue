<script lang="ts" setup>
import StepsCard from './StepsCard.vue'

const steps = [
  {
    icon: 'layers',
    title: 'Compre y adhiera el QR',
    description:
      'Compre su QR y péguelo en su maleta, reja, puerta o cualquier lugar visible para un fácil acceso.',
    number: 1,
    video: new URL('@/assets/videos/step_two.mp4', import.meta.url).href,
  },
  {
    icon: 'qr_code_scanner',
    title: 'Alguien escanea el QR',
    description:
      'En caso de emergencia, cualquier persona puede escanear el QR y seleccionar un mensaje predefinido.',
    number: 2,
    video: new URL('@/assets/videos/step_three.mp4', import.meta.url).href,
  },
  {
    icon: 'notifications_active',
    title: 'Reciba alerta instantánea',
    description: 'Reciba una notificación vía WhatsApp o SMS sin exponer su información personal.',
    number: 3,
    video: new URL('@/assets/videos/step_four.mp4', import.meta.url).href,
  },
]
</script>

<template>
  <section class="bg-[#09090b] pb-24">
    <div class="px-8 md:px-24 max-w-screen-2xl mx-auto">
      <div class="text-center mb-24 pt-32">
        <h2 class="font-headline text-6xl font-bold mb-4 text-white">Ubiqueme en 3 pasos</h2>
        <p class="text-on-surface-variant max-w-2xl mx-auto">
          Desde la configuración hasta la seguridad, hemos diseñado cada interacción para que sea
          fluida y confiable.
        </p>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
        <StepsCard v-for="step in steps" :key="step.number" :steps="step" />
      </div>
    </div>
  </section>
</template>

<style scoped></style>
