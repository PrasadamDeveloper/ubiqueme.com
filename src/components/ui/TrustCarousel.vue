<script lang="ts" setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'

import SatIcon from '@/assets/images/formal/sat.webp'
import YearsIcon from '@/assets/images/formal/15YearsExp.webp'
import SafeIcon from '@/assets/images/formal/safeSite.webp'

interface TrustItem {
  text: string
  icon: string
  alt: string
  description: string
  detail: string
}

const items: TrustItem[] = [
  {
    text: 'Registrados SAT',
    icon: SatIcon,
    alt: 'Registro SAT',
    description: 'Registrado ante el SAT · RFC activo',
    detail: 'Nuestra trayectoria en el mercado nos ha permitido consolidar un servicio integral enfocado en la importación de productos desde México, ofreciendo procesos de supervisión y certificación. Con esa misma visión de calidad y transparencia, creamos esta plataforma para ayudar a las personas a estar alertadas sobre las cosas que aman mediante códigos QR, facilitando una conexión segura y confiable con la información que realmente les importa.',
  },
  {
    text: '15 Años Exp.',
    icon: YearsIcon,
    alt: 'Experiencia',
    description: 'Más de 15 años de experiencia en el mercado',
    detail: 'Creemos firmemente en la responsabilidad social y en el poder de la tecnología para generar bienestar. Con más de 15 años de experiencia, hemos desarrollado diversos proyectos enfocados en ayudar a las personas. Esta plataforma de alertas QR refleja ese mismo compromiso: queremos que las personas se mantengan alertadas sobre lo que aman, poniendo la tecnología al servicio de sus necesidades y el bienestar en el centro de cada proyecto.',
  },
  {
    text: 'Sitio Seguro',
    icon: SafeIcon,
    alt: 'Sitio seguro',
    description: 'Conexión cifrada SSL 256-bit — tus datos protegidos',
    detail: 'La seguridad es fundamental en cada aspecto de nuestra operación. Nuestro sitio cuenta con conexión cifrada SSL 256-bit y certificación HTTPS, protegiendo cada interacción. Así como garantizamos procesos seguros en la importación, también aseguramos que los datos compartidos a través de nuestros códigos QR estén protegidos con altos estándares, para que los usuarios puedan usar la plataforma con total confianza al mantenerse alertados sobre lo que aman.',
  },
]

const currentIndex = ref(0)
const isHovered = ref(false)
const hoveredItemIndex = ref<number | null>(null)
const showMobileOverlay = ref(false)
const mobileSelectedIndex = ref<number | null>(null)
let timer: ReturnType<typeof setInterval> | undefined
let leaveTimer: ReturnType<typeof setTimeout> | undefined

onMounted(() => {
  timer = setInterval(() => {
    if (!isHovered.value) {
      currentIndex.value = (currentIndex.value + 1) % items.length
    }
  }, 4000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
  if (leaveTimer) clearTimeout(leaveTimer)
})

const onItemEnter = (index: number) => {
  if (leaveTimer) {
    clearTimeout(leaveTimer)
    leaveTimer = undefined
  }
  hoveredItemIndex.value = index
}

const onItemLeave = () => {
  leaveTimer = setTimeout(() => {
    hoveredItemIndex.value = null
  }, 150)
}

const onDetailEnter = () => {
  if (leaveTimer) {
    clearTimeout(leaveTimer)
    leaveTimer = undefined
  }
}

const onDetailLeave = () => {
  hoveredItemIndex.value = null
}

const openMobileOverlay = () => {
  showMobileOverlay.value = true
  mobileSelectedIndex.value = null
}

const closeMobileOverlay = () => {
  showMobileOverlay.value = false
  mobileSelectedIndex.value = null
}

watch(showMobileOverlay, (open) => {
  document.body.style.overflow = open ? 'hidden' : ''
})

const panelWidth = computed(() => {
  if (!isHovered.value) return '195px'
  if (hoveredItemIndex.value !== null) return '480px'
  return '300px'
})
</script>

<template>
  <!-- DESKTOP: hover-expand panel -->
  <div class="relative hidden md:block h-[59px] w-[195px] overflow-visible shrink-0">

    <div
      class="absolute left-0 top-0 overflow-hidden transition-all duration-300 bg-white/90 backdrop-blur-xl rounded-2xl border"
      :style="{
        width: panelWidth,
        maxHeight: isHovered ? '500px' : '59px',
        borderColor: isHovered ? 'rgba(226,232,240,1)' : 'rgba(226,232,240,0.5)',
        boxShadow: isHovered
          ? '0 20px 40px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.08)'
          : '0 1px 2px rgba(0,0,0,0.04)',
        transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
        zIndex: isHovered ? 40 : 'auto',
      }" @mouseenter="isHovered = true" @mouseleave="isHovered = false">
      <div class="flex items-center justify-between px-3 py-2" :class="isHovered ? 'border-b border-slate-100' : ''">
        <div class="flex items-center gap-2 min-w-0">
          <span class="text-[11px] font-medium tracking-wide text-slate-500 whitespace-nowrap">
            {{ isHovered ? 'Señales de confianza' : items[currentIndex]!.text }}
          </span>
        </div>

        <img v-if="!isHovered" :src="items[currentIndex]!.icon" :alt="items[currentIndex]!.alt"
          class="h-[45px] w-[45px] object-contain shrink-0 grayscale" />
      </div>

      <div class="px-2 py-1.5 flex gap-3 overflow-y-auto relative" :style="{
        opacity: isHovered ? 1 : 0,
        pointerEvents: isHovered ? 'auto' : 'none',
        transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
      }">

        <div class="flex-1 min-w-0">
          <div v-for="(item, index) in items" :key="index"
            class="flex flex-col gap-0.5 rounded-lg px-2 py-2 transition-colors hover:bg-blue-50"
            @mouseenter="onItemEnter(index)" @mouseleave="onItemLeave">
            <div class="flex items-start gap-2">
              <span class="w-[7px] h-[7px] rounded-xl bg-blue-400 shrink-0 mt-1.5"></span>
              <div class="flex-1 min-w-0">
                <img :src="item.icon" :alt="item.alt" class="h-[42px] w-[42px] object-contain float-right ml-2 mb-1" />
                <span class="text-sm font-medium text-slate-700 block">{{ item.text }}</span>
                <p class="mt-0.5 text-xs leading-snug text-slate-400">{{ item.description }}</p>
              </div>
            </div>
          </div>
        </div>

        <div
          class="w-[220px] shrink-0 rounded-2xl  border border-slate-200 shadow-lg overflow-hidden transition-all duration-300 relative"
          :style="{
            opacity: hoveredItemIndex !== null ? 1 : 0,
            transform: hoveredItemIndex !== null ? 'translateX(0)' : 'translateX(-8px)',
            maxWidth: hoveredItemIndex !== null ? '220px' : '0',
            padding: hoveredItemIndex !== null ? '16px' : '0 16px',
            transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
          }" @mouseenter="onDetailEnter" @mouseleave="onDetailLeave">

          <div v-if="hoveredItemIndex !== null">
            <div class="flex items-center gap-2 mb-3">
              <span class="w-[7px] h-[7px] rounded-xl bg-blue-400 shrink-0"></span>
              <span class="text-[11px] font-medium tracking-wide text-slate-500">{{ items[hoveredItemIndex].text
                }}</span>
            </div>
            <p class="text-[11px] leading-relaxed text-slate-500">
              <img :src="items[hoveredItemIndex].icon" :alt="items[hoveredItemIndex].alt"
                class="w-14 object-contain float-right ml-2 mb-1" />
              {{ items[hoveredItemIndex].detail }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- MOBILE: tappable trigger -->
  <div class="md:hidden flex items-center gap-1.5 shrink-0">
    <div @click="openMobileOverlay"
      class="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white/90 px-2 py-1 shadow-xs active:scale-95 transition-all duration-150 cursor-pointer select-none">
      <img :src="items[currentIndex]!.icon" :alt="items[currentIndex]!.alt" class="h-5 w-5 object-contain shrink-0" />
      <span class="text-[10px] font-medium text-slate-600 whitespace-nowrap">{{ items[currentIndex]!.text }}</span>
      <span class="material-symbols-outlined notranslate text-[14px] text-slate-400">expand_more</span>
    </div>
  </div>

  <!-- MOBILE: full-screen overlay -->
  <Teleport to="body">
    <Transition name="fade-scale">
      <div v-if="showMobileOverlay" @click.self="closeMobileOverlay"
        class="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-6 bg-black/40">

        <div class="w-full max-h-[85vh] sm:max-h-[75vh] sm:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl overflow-hidden flex flex-col shadow-2xl"
          @click.stop>

          <!-- Handle bar + close -->
          <div class="flex items-center justify-between px-5 pt-3 pb-2 shrink-0">
            <div class="w-8 h-1 rounded-full bg-slate-300 mx-auto sm:hidden"></div>
            <button @click="closeMobileOverlay"
              class="hidden sm:flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors cursor-pointer">
              <span class="material-symbols-outlined notranslate text-[18px]">close</span>
            </button>
          </div>

          <div class="px-5 pb-2 shrink-0">
            <h3 class="text-sm font-semibold text-slate-900">Señales de confianza</h3>
          </div>

          <!-- Scrollable items -->
          <div class="flex-1 overflow-y-auto px-5 pb-6 space-y-3">
            <div v-for="(item, index) in items" :key="index"
              class="rounded-xl border border-slate-200 overflow-hidden transition-all duration-200"
              :class="mobileSelectedIndex === index ? 'border-orange-200 bg-orange-50' : 'bg-white'">
              <button @click="mobileSelectedIndex = mobileSelectedIndex === index ? null : index"
                class="w-full flex items-center gap-3 px-4 py-3 cursor-pointer text-left transition-colors">
                <img :src="item.icon" :alt="item.alt" class="h-9 w-9 object-contain shrink-0" />
                <div class="flex-1 min-w-0">
                  <span class="text-sm font-medium text-slate-900 block">{{ item.text }}</span>
                  <span class="text-[11px] text-slate-500 block mt-0.5">{{ item.description }}</span>
                </div>
                <span class="material-symbols-outlined notranslate text-[18px] text-slate-400 transition-transform duration-200"
                  :class="mobileSelectedIndex === index ? 'rotate-180' : ''">expand_more</span>
              </button>
              <Transition name="slide-down">
                <div v-if="mobileSelectedIndex === index" class="px-4 pb-4 pt-0">
                  <div class="border-t border-slate-200 pt-3 mt-1">
                    <p class="text-[12px] leading-relaxed text-slate-600">
                      <img :src="item.icon" :alt="item.alt" class="h-10 w-10 object-contain float-right ml-2 mb-1" />
                      {{ item.detail }}
                    </p>
                  </div>
                </div>
              </Transition>
            </div>
          </div>

        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.fade-scale-enter-active {
  transition: opacity 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}
.fade-scale-leave-active {
  transition: opacity 0.2s ease;
}
.fade-scale-enter-from,
.fade-scale-leave-to {
  opacity: 0;
}
.fade-scale-enter-active > div:last-child {
  transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}
.fade-scale-leave-active > div:last-child {
  transition: transform 0.2s ease;
}
.fade-scale-enter-from > div:last-child {
  transform: translateY(20px) scale(0.97);
}
.fade-scale-leave-to > div:last-child {
  transform: translateY(20px) scale(0.97);
}

.slide-down-enter-active {
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}
.slide-down-leave-active {
  transition: all 0.15s ease;
}
.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
