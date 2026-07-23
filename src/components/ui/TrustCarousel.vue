<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from 'vue'

import SatIcon from '@/assets/images/formal/sat.webp'
import YearsIcon from '@/assets/images/formal/15YearsExp.webp'
import SafeIcon from '@/assets/images/formal/safeSite.webp'

interface TrustItem {
  text: string
  icon: string
  alt: string
}

const items: TrustItem[] = [
  { text: 'Empresa registrada', icon: SatIcon, alt: 'Registro SAT' },
  { text: '15 Años Exp.', icon: YearsIcon, alt: 'Experiencia' },
  { text: 'Sitio Seguro', icon: SafeIcon, alt: 'Sitio seguro' },
]

const currentIndex = ref(0)
let timer: ReturnType<typeof setInterval> | undefined

onMounted(() => {
  timer = setInterval(() => {
    currentIndex.value = (currentIndex.value + 1) % items.length
  }, 4000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<template>
  <div class="hidden md:flex items-center gap-2  bg-white/5 px-3 py-2 transition-all duration-300 ">
    <div class="relative w-[170px] h-[55px] overflow-hidden">
      <Transition name="slide-up">
        <div :key="currentIndex" class="absolute inset-0 flex items-center justify-start gap-2">
          <div class="flex items-center gap-2">
            <span class="w-[7px] h-[7px] rounded-xl bg-blue-400 shrink-0"></span>
            <span class="text-[11px] font-medium tracking-wide text-slate-500 whitespace-nowrap">
              {{ items[currentIndex]!.text }}
            </span>
          </div>
          <img :src="items[currentIndex]!.icon" :alt="items[currentIndex]!.alt"
            class="h-[40px] w-[40px] object-contain shrink-0" />
        </div>
      </Transition>
    </div>
  </div>
</template>

<style scoped>
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-up-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.slide-up-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>
