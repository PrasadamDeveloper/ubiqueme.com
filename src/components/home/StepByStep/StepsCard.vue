<script lang="ts" setup>
import type { IStep } from '@/interfaces/IStep'

const props = defineProps<{
  steps: IStep
}>()
</script>

<template>
  <!-- Step  -->
  <div class="relative group rounded-3xl overflow-hidden bg-[#09090b]" data-aos="fade-up"
    :data-aos-delay="(steps.number - 1) * 100">
    <!-- Main Video -->
    <video class="w-full h-auto object-cover" v-lazy-video="steps.video" autoplay loop muted playsinline></video>

    <div
      class="text-[6rem] sm:text-[7rem] font-black text-white/30 absolute inset-0 z-20 flex items-center justify-center select-none opacity-30 font-headline pointer-events-none leading-none">
      {{ steps.number }}
    </div>
    <div
      class="absolute inset-0 z-10 flex flex-col justify-around h-full text-center p-4 bg-black/45 items-center rounded-3xl">
      <div
        class="w-16 h-16 rounded-2xl bg-orange-950/30 flex items-center justify-center mb-8 border border-orange-500/20">
        <span class="material-symbols-outlined notranslate text-orange-500 text-3xl" :data-icon="steps.icon">{{
          steps.icon
        }}</span>
      </div>
      <h3 class="font-headline text-xl font-bold mb-4 text-slate-100">{{ steps.title }}</h3>
      <p class="text-white font-rubik leading-relaxed p-1.5 bg-black/40 rounded-2xl">
        {{ steps.description }}
      </p>
    </div>
  </div>
</template>

<style scoped></style>
