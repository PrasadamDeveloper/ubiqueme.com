<script lang="ts" setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

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

const panelWidth = computed(() => {
  if (!isHovered.value) return '195px'
  if (hoveredItemIndex.value !== null) return '480px'
  return '300px'
})
</script>

<template>
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
</template>
