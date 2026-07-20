<script lang="ts" setup>
import StepsCard from './StepsCard.vue'

const steps = [
  {
    icon: 'layers',
    title: 'Compre y adhiera el QR',
    description:
      'Pegue el código en su maleta, puerta, vehículo o cualquier objeto que quiera proteger.',
    number: '01',
    video: new URL('@/assets/videos/step_two.mp4', import.meta.url).href,
  },
  {
    icon: 'qr_code_scanner',
    title: 'Alguien escanea el QR',
    description:
      'Cualquier persona puede escanearlo desde la cámara del teléfono sin instalar aplicaciones.',
    number: '02',
    video: new URL('@/assets/videos/step_three.mp4', import.meta.url).href,
  },
  {
    icon: 'notifications_active',
    title: 'Reciba una alerta',
    description:
      'Reciba la notificación por WhatsApp o SMS manteniendo sus datos protegidos.',
    number: '03',
    video: new URL('@/assets/videos/step_four.mp4', import.meta.url).href,
  },
]
</script>


<template>
  <section class="bg-slate-50 py-2 sm:py-5">

    <div class=" px-5 sm:px-8">

      <header class="max-w-2xl mb-10 sm:mb-14">

        <span class="text-xs font-semibold uppercase tracking-[0.18em] text-orange-600">
          Cómo funciona
        </span>

        <h2 class="mt-3 text-3xl sm:text-4xl font-semibold tracking-tight text-slate-950">
          <span class="text-orange-500">Ubiqueme</span> en 3 simples pasos
        </h2>

        <p class="mt-4 text-slate-600 leading-7">
          Diseñamos cada interacción para que encontrar sus objetos
          sea rápido, seguro y sin complicaciones.
        </p>

      </header>


      <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

        <StepsCard v-for="step in steps" :key="step.number" :steps="step" />

      </div>


    </div>

  </section>
</template>
