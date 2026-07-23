<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from 'vue'

import SatIcon from '@/assets/images/formal/sat.webp'
import YearsIcon from '@/assets/images/formal/15YearsExp.webp'
import SafeIcon from '@/assets/images/formal/safeSite.webp'

interface TrustItem {
  text: string
  icon: string
  alt: string
  description: string
}

const items: TrustItem[] = [
  {
    text: 'Empresa registrada',
    icon: SatIcon,
    alt: 'Registro SAT',
    description: 'Registrado ante el SAT · RFC activo',
  },
  {
    text: '15 Años Exp.',
    icon: YearsIcon,
    alt: 'Experiencia',
    description: 'Más de 15 años de experiencia en el mercado',
  },
  {
    text: 'Sitio Seguro',
    icon: SafeIcon,
    alt: 'Sitio seguro',
    description: 'Conexión cifrada SSL 256-bit — tus datos protegidos',
  },
]

const currentIndex = ref(0)
const isHovered = ref(false)
let timer: ReturnType<typeof setInterval> | undefined

onMounted(() => {
  timer = setInterval(() => {
    if (!isHovered.value) {
      currentIndex.value = (currentIndex.value + 1) % items.length
    }
  }, 4000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<template>
  <!-- Root: sits in flex flow, fixed 59×195px, never alters layout -->
  <div
    class="relative hidden md:block h-[59px] w-[195px] overflow-visible shrink-0"
  >
    <!-- Inner: absolute left-0, on hover translates down below nav + expands -->
    <div
      class="absolute left-0 top-0 overflow-hidden transition-all duration-300 bg-white/5 rounded-2xl border"
      :style="{
        width: isHovered ? '300px' : '195px',
        height: isHovered ? '265px' : '59px',
        transform: isHovered ? 'translateY(80px)' : 'translateY(0)',
        borderColor: isHovered ? 'rgba(226,232,240,1)' : 'rgba(226,232,240,0.5)',
        transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
        zIndex: isHovered ? 40 : 'auto',
      }"
      @mouseenter="isHovered = true"
      @mouseleave="isHovered = false"
    >
      <!-- Header row (always visible) -->
      <div
        class="flex items-center justify-between px-3 py-2"
        :class="isHovered ? 'border-b border-slate-100' : ''"
      >
        <div class="flex items-center gap-2 min-w-0">
          <span class="w-[7px] h-[7px] rounded-xl bg-blue-400 shrink-0"></span>
          <span class="text-[11px] font-medium tracking-wide text-slate-500 whitespace-nowrap">
            {{ isHovered ? 'Señales de confianza' : items[currentIndex]!.text }}
          </span>
        </div>
        <img
          v-if="!isHovered"
          :src="items[currentIndex]!.icon"
          :alt="items[currentIndex]!.alt"
          class="h-[40px] w-[40px] object-contain shrink-0"
        />
      </div>

      <!-- Expanded: 3 items (visible on hover) -->
      <div
        class="px-2 py-1.5 transition-all duration-300"
        :style="{
          opacity: isHovered ? 1 : 0,
          pointerEvents: isHovered ? 'auto' : 'none',
          transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
        }"
      >
        <div
          v-for="(item, index) in items"
          :key="index"
          class="flex items-start gap-2 rounded-lg px-2 py-2 transition-colors hover:bg-blue-50"
        >
          <span class="w-[7px] h-[7px] rounded-xl bg-blue-400 shrink-0 mt-1.5"></span>
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between gap-2">
              <span class="text-sm font-medium text-slate-700">{{ item.text }}</span>
              <img
                :src="item.icon"
                :alt="item.alt"
                class="h-[48px] w-[48px] object-contain shrink-0"
              />
            </div>
            <p class="mt-0.5 text-xs leading-snug text-slate-400">{{ item.description }}</p>
          </div>
        </div>
      </div>
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
