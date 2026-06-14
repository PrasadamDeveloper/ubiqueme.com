<template>
  <section class="relative z-10 px-6 sm:px-8 py-24 mx-auto max-w-7xl">

    <!-- Section Header -->
    <div class="text-center mb-16" data-aos="fade-up">
      <h2 class="text-3xl sm:text-5xl font-black text-white tracking-tight mb-4">
        Ubiqueme en acción <span class="material-symbols-outlined text-4xl sm:text-5xl text-orange-500 align-middle">play_circle</span>
      </h2>
      <p class="text-white/50 text-base sm:text-lg font-medium max-w-2xl mx-auto">
        Descubra cómo nuestra tecnología protege lo que más valora.
      </p>
    </div>

    <!-- Responsive Grid of 6 Videos -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">

      <!-- Video Item Wrapper -->
      <div v-for="(v, i) in videoSources" :key="i"
        class="flex flex-col gap-4"
        data-aos="fade-up" :data-aos-delay="(i - 1) * 100">
        
        <!-- Title Above Video -->
        <h3 class="text-xl sm:text-2xl font-bold text-white text-center px-2">{{ v.title }}</h3>

        <!-- Video Card -->
        <div
          class="relative bg-[#09090b] border border-white/10 rounded-[2rem] overflow-hidden group"
          :id="`video-${i}`">
          <!-- User's Main Video -->
          <video
            class="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105 main-video"
            v-lazy-video="v.src" autoplay loop muted playsinline>
          </video>

          <!-- Hover Overlay for Description -->
          <div class="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20 flex items-center justify-center p-8 pointer-events-none text-center">
            <p class="text-white/90 text-sm md:text-base font-medium leading-relaxed mb-8">{{ v.description }}</p>
          </div>

          <!-- Bottom Gradient for button readability -->
          <div
            class="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#09090b]/80 to-transparent pointer-events-none transition-opacity duration-300 z-10">
          </div>

          <!-- Sound Activation Button -->
          <button @click="activateSound(i)"
            class="absolute bottom-6 left-1/2 -translate-x-1/2 px-5 py-3 bg-[#09090b] hover:bg-orange-500 border border-orange-500/30 hover:border-transparent text-white/90 hover:text-white text-[10px] font-black uppercase tracking-widest rounded-full transition-all duration-300 z-30 flex items-center gap-2 whitespace-nowrap shadow-[0_0_15px_rgba(249,115,22,0.15)] hover:shadow-[0_0_25px_rgba(249,115,22,0.3)]">
            <span class="material-symbols-outlined text-[14px]">{{ mutedStates[i] ? 'volume_off' : 'volume_up' }}</span>
            {{ mutedStates[i] ? 'Haga click para activar el sonido' : 'Haga click para silenciar' }}
          </button>
        </div>
      </div>

    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import AOS from 'aos'
import 'aos/dist/aos.css'
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

onMounted(() => {
  AOS.init({
    duration: 800,
    once: true,
    offset: 50,
    easing: 'ease-out-cubic'
  })
})

const mutedStates = ref(videoSources.map(() => true))

const activateSound = (videoId: number) => {
  const videoSelected = document.querySelector(`#video-${videoId} .main-video`) as HTMLVideoElement;

  if (!videoSelected) return;

  videoSelected.muted = !videoSelected.muted;
  mutedStates.value[videoId] = videoSelected.muted;

  if (!videoSelected.muted) {
    // Silenciar los demás videos
    videoSources.forEach((_, index) => {
      if (index !== videoId) {
        const otherVideo = document.querySelector(`#video-${index} .main-video`) as HTMLVideoElement;
        if (otherVideo && !otherVideo.muted) {
          otherVideo.muted = true;
          mutedStates.value[index] = true;
        }
      }
    });

    videoSelected.play();
  }

  toast.info(videoSelected.muted ? 'Sonido desactivado' : 'Sonido activado');
}
</script>

<style scoped>
.material-symbols-outlined {
  font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}
</style>
