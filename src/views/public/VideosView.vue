<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import HomeLayout from '@/layouts/HomeLayout.vue'
import AOS from 'aos'
import 'aos/dist/aos.css'
import { toast } from 'vue-sonner'

const route = useRoute()

interface VideoItem {
  src: string
  title: string
  slug: string
  description: string
}

const videoSources: VideoItem[] = [
  {
    src: new URL('../../assets/videos/vid01.mp4', import.meta.url).href,
    title: 'Mascota en peligro',
    slug: 'mascota-en-peligro',
    description: 'Avise al dueño de la mascota, si nota que esta en algun problema'
  },
  {
    src: new URL('../../assets/videos/vid02.mp4', import.meta.url).href,
    title: 'Familiar con enfermedad',
    slug: 'familiar-enfermedad',
    description: 'Avise al familiar de una persona, si la persona tiene un problema médico o alguna emergencia'
  },
  {
    src: new URL('../../assets/videos/vid03.mp4', import.meta.url).href,
    title: 'Cartero sin respuesta',
    slug: 'cartero-sin-respuesta',
    description: 'Si tiene algun sobre o paquete importante y usted no se encuentra en casa, con el código qr en su puerta permite que el repartidor se comunique con usted'
  },
  {
    src: new URL('../../assets/videos/vid04.mp4', import.meta.url).href,
    title: 'Destrozos en propiedad',
    slug: 'destrozos-propiedad',
    description: 'Si alguien nota destrozos en una propiedad, el codigo qr en la puerta permite avisar a la persona dueña de la propiedad'
  },
  {
    src: new URL('../../assets/videos/vid05.mp4', import.meta.url).href,
    title: 'Auto con luces encendidas',
    slug: 'auto-luces-encendidas',
    description: 'Si olvida su auto con las luces encendidas, el codigo qr permitirá que sea notificado de su auto'
  },
  {
    src: new URL('../../assets/videos/vid06.mp4', import.meta.url).href,
    title: 'Casa en llamas',
    slug: 'casa-en-llamas',
    description: 'Si ve una casa en llamas, el codigo qr en la puerta permitirá que sea notificado del incendio'
  },
  {
    src: new URL('../../assets/videos/vid07.mp4', import.meta.url).href,
    title: 'Maleta perdida',
    slug: 'maleta-perdida',
    description: 'Si usted pierde su maleta en el aeropuerto, el codigo qr en su maleta permitirá que sea notificado de su maleta'
  },
  {
    src: new URL('../../assets/videos/vid09.mp4', import.meta.url).href,
    title: 'Bicicleta perdida',
    slug: 'bicicleta-perdida',
    description: 'Si alguien ve su bicicleta en peligro, el codigo qr en su bicicleta permitirá que sea notificado de su bicicleta'
  },
  {
    src: new URL('../../assets/videos/vid08.mp4', import.meta.url).href,
    title: 'Únase a la comunidad',
    slug: 'unase-comunidad',
    description: 'Únase a la comunidad Ubiqueme y disfrute de todos los beneficios que tiene para usted'
  },
]

const mutedStates = ref(videoSources.map(() => true))

const activateSound = (videoId: number) => {
  const videoSelected = document.querySelector(`#video-${videoId} .main-video`) as HTMLVideoElement;
  if (!videoSelected) return;

  videoSelected.muted = !videoSelected.muted;
  mutedStates.value[videoId] = videoSelected.muted;

  if (!videoSelected.muted) {
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

onMounted(() => {
  AOS.init({
    duration: 800,
    once: true,
    offset: 50,
    easing: 'ease-out-cubic'
  })

  // Scroll to anchor if present
  if (route.hash) {
    setTimeout(() => {
      const el = document.getElementById(route.hash.slice(1))
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
        // Highlight effect
        el.classList.add('ring-2', 'ring-orange-500/50', 'rounded-[2rem]')
        setTimeout(() => {
          el.classList.remove('ring-2', 'ring-orange-500/50')
        }, 3000)
      }
    }, 300)
  }
})

const preventDownload = (event: Event) => {
  event.preventDefault();
}
</script>

<template>
  <HomeLayout>
    <template #main>
      <main class="relative bg-white overflow-hidden font-google-sans min-h-screen">

        <!-- Background ornamentation -->
        <div class="absolute inset-0 z-0 opacity-[0.05] pointer-events-none"
          style="background-image: linear-gradient(rgba(0,0,0,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.5) 1px, transparent 1px); background-size: 100px 100px;">
        </div>

        <article class="relative z-10 w-full pt-28 pb-24 px-6 sm:px-8 max-w-7xl mx-auto">

          <!-- Header -->
          <div class="text-center mb-16" data-aos="fade-up">
            <h1 class="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight mb-4">
              Ubiqueme en acción
              <span
                class="material-symbols-outlined notranslate text-4xl sm:text-5xl text-orange-500 align-middle">play_circle</span>
            </h1>
            <p class="text-slate-500 text-base sm:text-lg font-medium max-w-2xl mx-auto">
              Descubra cómo nuestra tecnología protege lo que más valora. Haga clic en un video para verlo en detalle.
            </p>
          </div>

          <!-- Quick nav pills -->
          <div class="flex flex-wrap justify-center gap-2 mb-16" data-aos="fade-up" data-aos-delay="100">
            <a v-for="v in videoSources" :key="v.slug" :href="`#${v.slug}`"
              class="px-4 py-2 bg-slate-50 border border-slate-200 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-orange-500 hover:border-orange-400/40 hover:bg-orange-50 transition-all duration-300">
              {{ v.title }}
            </a>
          </div>

          <!-- Video Grid -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            <div v-for="(v, i) in videoSources" :key="v.slug" :id="v.slug" class="flex flex-col gap-4 scroll-mt-32"
              data-aos="fade-up" :data-aos-delay="(i) * 80">

              <h3 class="text-xl sm:text-2xl font-bold text-slate-900 text-center px-2">{{ v.title }}</h3>

              <div class="relative bg-white border border-slate-200 rounded-[2rem] overflow-hidden group"
                :id="`video-${i}`">
                <video
                  class="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105 main-video select-none"
                  :src="v.src" autoplay loop muted playsinline draggable="false"
                  controlslist="nodownload" @contextmenu="preventDownload">
                </video>

                <div
                  class="absolute inset-0 bg-white/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20 flex items-center justify-center p-8 pointer-events-none text-center">
                  <p class="text-slate-700 text-sm md:text-base font-medium leading-relaxed mb-8">{{ v.description }}</p>
                </div>

                <div
                  class="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-white/80 to-transparent pointer-events-none transition-opacity duration-300 z-10">
                </div>

                <button @click="activateSound(i)"
                  class="absolute bottom-6 left-1/2 -translate-x-1/2 px-5 py-3 bg-white hover:bg-orange-500 border border-slate-200 hover:border-transparent text-slate-700 hover:text-white text-[10px] font-black uppercase tracking-widest rounded-full transition-all duration-300 z-30 flex items-center gap-2 whitespace-nowrap shadow-[0_4px_15px_rgba(0,0,0,0.08)] hover:shadow-[0_0_25px_rgba(249,115,22,0.3)]">
                  <span class="material-symbols-outlined notranslate text-[14px]">{{ mutedStates[i] ? 'volume_off' :
                    'volume_up' }}</span>
                  {{ mutedStates[i] ? 'Haga click para activar el sonido' : 'Haga click para silenciar' }}
                </button>
              </div>
            </div>
          </div>

          <!-- CTA -->
          <div class="text-center mt-20" data-aos="fade-up">
            <p class="text-slate-500 text-sm font-medium mb-6">¿Listo para proteger lo que más valora?</p>
            <router-link :to="{ name: 'register' }"
              class="inline-flex items-center gap-2 px-8 py-4 bg-orange-500 text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-900 transition-all duration-300 active:scale-95 shadow-[0_10px_20px_rgba(249,115,22,0.15)]">
              <span class="material-symbols-outlined notranslate text-sm">qr_code_scanner</span>
              Active su código QR gratis — 30 días sin tarjeta
            </router-link>
          </div>

        </article>
      </main>
    </template>
  </HomeLayout>
</template>

<style scoped>
.material-symbols-outlined {
  font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}

html {
  scroll-behavior: smooth;
}
</style>
