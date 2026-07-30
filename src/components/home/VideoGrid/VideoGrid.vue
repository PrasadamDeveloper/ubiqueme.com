<template>
  <section class="bg-white py-16 sm:py-20 overflow-hidden">
    <div class="mx-auto max-w-7xl px-5 sm:px-8">
      <!-- Header -->
      <header class="mx-auto mb-10 max-w-2xl text-center sm:mb-14">
        <span class="inline-block rounded-full bg-orange-50 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-orange-600">
          Demostración
        </span>
        <h2 class="mt-5 text-[28px] font-semibold leading-tight tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
          Ubiqueme en acción
        </h2>
        <p class="mx-auto mt-3 max-w-lg text-[15px] leading-relaxed text-slate-500">
          Descubra cómo nuestra tecnología protege lo que más valora.
        </p>
      </header>

      <!-- Mobile: horizontal scroll snap carousel -->
      <div class="sm:hidden -mx-5 overflow-hidden">
        <div ref="scrollContainer" @scroll="onScroll"
          class="flex gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-none px-5 pb-2">
          <div v-for="(v, i) in videoSources" :key="i" class="w-[85vw] shrink-0 snap-center">
            <div class="bg-slate-50 rounded-2xl overflow-hidden">
              <div class="relative aspect-video bg-black">
                <video class="absolute inset-0 w-full h-full object-cover"
                  v-lazy-video="v.src" autoplay loop muted playsinline :ref="setVideoRef(i)">
                </video>
                <div class="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/50 to-transparent pointer-events-none"></div>
                <button @click="activateSound(i)"
                  class="absolute bottom-2 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-xs text-[10px] font-semibold text-slate-800 transition active:scale-95 flex items-center gap-1 shadow-xs">
                  <span class="material-symbols-outlined notranslate text-[13px]">{{ mutedStates[i] ? 'volume_off' : 'volume_up' }}</span>
                  {{ mutedStates[i] ? 'Activar sonido' : 'Silenciar' }}
                </button>
              </div>
              <div class="p-3">
                <div class="flex items-start gap-2">
                  <div class="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-100">
                    <span class="material-symbols-outlined notranslate text-[14px] text-orange-500">play_arrow</span>
                  </div>
                  <div class="min-w-0">
                    <p class="text-[14px] font-medium text-slate-900">{{ v.title }}</p>
                    <p class="mt-0.5 text-[11px] text-slate-500 leading-relaxed">{{ v.description }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- Scroll hint dots -->
        <div class="flex justify-center gap-1.5 mt-4">
          <span v-for="(v, i) in videoSources" :key="i"
            class="h-1.5 rounded-full transition-all duration-300"
            :class="i === activeIndex ? 'w-5 bg-orange-500' : 'w-1.5 bg-slate-300'">
          </span>
        </div>
      </div>

      <!-- Tablet / Desktop: grid -->
      <div class="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="(v, i) in videoSources" :key="i" class="flex flex-col gap-3">
          <h3 class="text-lg font-semibold text-slate-900 text-center">{{ v.title }}</h3>
          <div class="relative bg-white border border-slate-200 rounded-2xl overflow-hidden group">
            <video class="w-full h-auto object-cover main-video"
              v-lazy-video="v.src" autoplay loop muted playsinline :ref="setVideoRef(i)">
            </video>
            <div
              class="absolute inset-0 bg-white/90 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20 flex items-center justify-center p-8 pointer-events-none text-center">
              <p class="text-slate-600 text-sm leading-relaxed">{{ v.description }}</p>
            </div>
            <div
              class="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-white/80 to-transparent pointer-events-none z-10">
            </div>
            <button @click="activateSound(i)"
              class="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-white border border-slate-200 text-slate-700 text-[10px] font-semibold uppercase tracking-wider rounded-full transition z-30 flex items-center gap-1.5 shadow-xs hover:border-orange-300 hover:text-orange-600 whitespace-nowrap">
              <span class="material-symbols-outlined notranslate text-[14px]">{{ mutedStates[i] ? 'volume_off' : 'volume_up' }}</span>
              {{ mutedStates[i] ? 'Activar sonido' : 'Silenciar' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { toast } from 'vue-sonner'

const videoSources = [
  {
    src: new URL('../../../assets/videos/vid01.mp4', import.meta.url).href,
    title: 'Mascota en peligro',
    description: 'Avise al dueño de la mascota, si nota que esta en algun problema'
  },
  {
    src: new URL('../../../assets/videos/vid02.mp4', import.meta.url).href,
    title: 'Familiar con enfermedad',
    description: 'Avise al familiar de una persona, si la persona tiene un problema médico o alguna emergencia'
  },
  {
    src: new URL('../../../assets/videos/vid03.mp4', import.meta.url).href,
    title: 'Cartero sin respuesta',
    description: 'Si tiene algun sobre o paquete importante y usted no se encuentra en casa, con el código qr en su puerta permite que el repartidor se comunique con usted'
  },
  {
    src: new URL('../../../assets/videos/vid04.mp4', import.meta.url).href,
    title: 'Destrozos en propiedad',
    description: 'Si alguien nota destrozos en una propiedad, el codigo qr en la puerta permite avisar a la persona dueña de la propiedad'
  },
  {
    src: new URL('../../../assets/videos/vid05.mp4', import.meta.url).href,
    title: 'Auto con luces encendidas',
    description: 'Si olvida su auto con las luces encendidas, el codigo qr permitirá que sea notificado de su auto'
  },
  {
    src: new URL('../../../assets/videos/vid06.mp4', import.meta.url).href,
    title: 'Casa en llamas',
    description: 'Si ve una casa en llamas, el codigo qr en la puerta permitirá que sea notificado del incendio'
  },
  {
    src: new URL('../../../assets/videos/vid07.mp4', import.meta.url).href,
    title: 'Maleta perdida',
    description: 'Si usted pierde su maleta en el aeropuerto, el codigo qr en su maleta permitirá que sea notificado de su maleta'
  },
  {
    src: new URL('../../../assets/videos/vid09.mp4', import.meta.url).href,
    title: 'Bicicleta perdida',
    description: 'Si alguien ve su bicicleta en peligro, el codigo qr en su bicicleta permitirá que sea notificado de su bicicleta'
  },
  {
    src: new URL('../../../assets/videos/vid08.mp4', import.meta.url).href,
    title: 'Únase a la comunidad',
    description: 'Únase a la comunidad Ubiqueme y disfrute de todos los beneficios que tiene para usted'
  },
]

const mutedStates = ref(videoSources.map(() => true))

const videoRefs = ref<(HTMLVideoElement | null)[]>([])

const setVideoRef = (index: number) => (el: unknown) => {
  videoRefs.value[index] = el as HTMLVideoElement | null
}

const scrollContainer = ref<HTMLElement | null>(null)
const activeIndex = ref(0)

const onScroll = () => {
  const container = scrollContainer.value
  if (!container) return
  const children = Array.from(container.children) as HTMLElement[]
  const containerCenter = container.scrollLeft + container.clientWidth / 2
  let closest = 0
  let closestDist = Infinity
  children.forEach((child, i) => {
    const childCenter = child.offsetLeft + child.offsetWidth / 2
    const dist = Math.abs(childCenter - containerCenter)
    if (dist < closestDist) {
      closestDist = dist
      closest = i
    }
  })
  activeIndex.value = closest
}

const activateSound = (videoId: number) => {
  const videoSelected = videoRefs.value[videoId]
  if (!videoSelected) return

  videoSelected.muted = !videoSelected.muted
  mutedStates.value[videoId] = videoSelected.muted

  if (!videoSelected.muted) {
    videoSources.forEach((_, index) => {
      if (index !== videoId) {
        const otherVideo = videoRefs.value[index]
        if (otherVideo && !otherVideo.muted) {
          otherVideo.muted = true
          mutedStates.value[index] = true
        }
      }
    })
    videoSelected.play()
  }

  toast.info(videoSelected.muted ? 'Sonido desactivado' : 'Sonido activado')
}
</script>

<style scoped>
.scrollbar-none {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-none::-webkit-scrollbar {
  display: none;
}
</style>
