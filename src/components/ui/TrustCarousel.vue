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
  <div
    class="relative hidden md:block"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
  >
    <!-- Pill (fixed size, always visible) -->
    <div
      class="flex items-center gap-2 bg-white/5 px-3 py-2"
    >
      <div class="relative w-[170px] h-[55px] overflow-hidden">
        <Transition name="slide-up">
          <div
            :key="currentIndex"
            class="absolute inset-0 flex items-center justify-start gap-2"
          >
            <div class="flex items-center gap-2">
              <span class="w-[7px] h-[7px] rounded-xl bg-blue-400 shrink-0"></span>
              <span class="text-[11px] font-medium tracking-wide text-slate-500 whitespace-nowrap">
                {{ items[currentIndex]!.text }}
              </span>
            </div>
            <img
              :src="items[currentIndex]!.icon"
              :alt="items[currentIndex]!.alt"
              class="h-[40px] w-[40px] object-contain shrink-0"
            />
          </div>
        </Transition>
      </div>
    </div>

    <!-- Dropdown (appears below on hover) -->
    <Transition name="trust-dropdown">
      <div
        v-if="isHovered"
        class="absolute left-0 top-full z-50 mt-2 w-[280px] overflow-hidden rounded-xl border border-slate-200 bg-white"
      >
        <div class="border-b border-slate-100 bg-gradient-to-r from-blue-50/50 to-white px-4 py-3">
          <h4 class="text-[11px] font-semibold tracking-wide text-slate-600">
            Señales de confianza
          </h4>
        </div>
        <div class="p-2">
          <div
            v-for="(item, index) in items"
            :key="index"
            class="flex items-start gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-blue-50"
          >
            <span class="w-[7px] h-[7px] rounded-xl bg-blue-400 shrink-0 mt-1.5"></span>
            <div class="flex min-w-0 flex-1 items-start gap-2">
              <div class="flex-1">
                <span class="text-sm font-medium text-slate-700">
                  {{ item.text }}
                </span>
                <p class="mt-0.5 text-[11px] leading-snug text-slate-400">
                  {{ item.description }}
                </p>
              </div>
              <img
                :src="item.icon"
                :alt="item.alt"
                class="h-[32px] w-[32px] object-contain shrink-0"
              />
            </div>
          </div>
        </div>
      </div>
    </Transition>
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

.trust-dropdown-enter-active {
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.trust-dropdown-leave-active {
  transition: all 0.15s cubic-bezier(0.4, 0, 1, 1);
}

.trust-dropdown-enter-from {
  opacity: 0;
  transform: translateY(-8px) scale(0.97);
}

.trust-dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px) scale(0.97);
}
</style>
