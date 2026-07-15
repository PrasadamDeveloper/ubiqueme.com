<template>
  <section class="relative z-10 overflow-hidden py-2 sm:py-3">
    <!-- Marquee container -->
    <div class="marquee-container overflow-hidden" @mouseenter="isHovering = true" @mouseleave="isHovering = false">
      <div class="marquee-track flex gap-3 sm:gap-4" :class="{ 'paused': isHovering }">
        <!-- Two copies for seamless loop -->
        <template v-for="copy in 2" :key="'copy-' + copy">
          <div v-for="(video, i) in videoSources" :key="copy + '-' + i"
            class="marquee-item flex-shrink-0 cursor-pointer rounded-xl sm:rounded-2xl overflow-hidden border border-gray-200 bg-white transition-transform duration-300 hover:scale-105 hover:shadow-lg"
            :class="{ 'active-preview': selectedVideoIndex === i }" @click="openPreview(i)">
            <video :src="video.src" muted autoplay loop playsinline
              class="h-full w-full object-cover pointer-events-none" />
          </div>
        </template>
      </div>
    </div>

    <!-- Overlay / Modal for video preview -->
    <Teleport to="body">
      <Transition name="overlay-fade">
        <div v-if="selectedVideoIndex !== null"
          class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 sm:p-8"
          @click.self="closePreview">
          <Transition name="modal-scale" appear>
            <div v-if="selectedVideoIndex !== null"
              class="relative w-full max-w-3xl rounded-3xl sm:rounded-[2rem] overflow-hidden bg-black shadow-2xl">
              <!-- Close button -->
              <button @click="closePreview"
                class="absolute top-3 right-3 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition hover:bg-white/40">
                <span class="material-symbols-outlined notranslate text-xl">close</span>
              </button>

              <!-- Video -->
              <video ref="previewVideoRef" :src="videoSources[selectedVideoIndex]?.src" autoplay loop controls
                playsinline class="w-full aspect-video object-contain bg-black" />

              <!-- Caption -->
              <div
                class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 sm:p-6 pt-12">
                <h3 class="text-white text-lg sm:text-xl font-bold">
                  {{ videoSources[selectedVideoIndex]?.title }}
                </h3>
                <p class="text-gray-300 text-sm sm:text-base mt-1">
                  {{ videoSources[selectedVideoIndex]?.description }}
                </p>
              </div>
            </div>
          </Transition>
        </div>
      </Transition>
    </Teleport>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface VideoSource {
  src: string
  title: string
  description: string
}

const videoSources: VideoSource[] = [
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

const isHovering = ref(false)
const selectedVideoIndex = ref<number | null>(null)
const previewVideoRef = ref<HTMLVideoElement | null>(null)

function openPreview(index: number) {
  selectedVideoIndex.value = index
  // Prevent body scroll when overlay is open
  document.body.style.overflow = 'hidden'
}

function closePreview() {
  selectedVideoIndex.value = null
  document.body.style.overflow = ''
  // Pause the preview video when closing
  if (previewVideoRef.value) {
    previewVideoRef.value.pause()
    previewVideoRef.value.currentTime = 0
  }
}
</script>

<style scoped>
/* Marquee animation */
.marquee-container {
  mask-image: linear-gradient(to right, transparent 0%, black 4%, black 96%, transparent 100%);
  -webkit-mask-image: linear-gradient(to right, transparent 0%, black 4%, black 96%, transparent 100%);
}

.marquee-track {
  width: max-content;
  animation: marquee-scroll 60s linear infinite;
}

.marquee-track.paused {
  animation-play-state: paused;
}

@keyframes marquee-scroll {
  0% {
    transform: translateX(0);
  }

  100% {
    transform: translateX(-50%);
  }
}

/* Item sizing */
.marquee-item {
  width: 180px;
  height: 100px;
}

@media (min-width: 640px) {
  .marquee-item {
    width: 240px;
    height: 135px;
  }
}

@media (min-width: 1024px) {
  .marquee-item {
    width: 280px;
    height: 158px;
  }
}

/* Active preview state (subtle ring) */
.marquee-item.active-preview {
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.5);
}

/* Overlay transitions */
.overlay-fade-enter-active,
.overlay-fade-leave-active {
  transition: opacity 0.3s ease;
}

.overlay-fade-enter-from,
.overlay-fade-leave-to {
  opacity: 0;
}

.modal-scale-enter-active {
  transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.modal-scale-leave-active {
  transition: all 0.2s ease;
}

.modal-scale-enter-from {
  opacity: 0;
  transform: scale(0.8) translateY(20px);
}

.modal-scale-leave-to {
  opacity: 0;
  transform: scale(0.9) translateY(10px);
}

.material-symbols-outlined {
  font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}
</style>
