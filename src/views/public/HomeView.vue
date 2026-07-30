<script lang="ts" setup>
import FeaturesComponent from '@/components/home/Features/FeaturesComponent.vue'
import HowItWorks from '@/components/home/HowItWorks/HowItWorks.vue'
import PricingPlans from '@/components/home/Pricing/PricingPlans.vue'
import StepByStep from '@/components/home/StepByStep/StepByStep.vue'
import VideoGrid from '@/components/home/VideoGrid/VideoGrid.vue'
import VideoMarquee from '@/components/home/VideoMarquee/VideoMarquee.vue'
import HomeLayout from '@/layouts/HomeLayout.vue'
import { useUserStore } from '@/stores/user';
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { toast } from 'vue-sonner';
import bag from '@/assets/images/bag-ubq.webp'
import dog from '@/assets/images/dog-ubq.webp'
import electro from '@/assets/images/eletro-ubq.webp'
import house from '@/assets/images/house.jpg'
import car from '@/assets/images/car.webp'
import suitcase from '@/assets/images/suitcase.webp'
import eldery from '@/assets/images/eldery.webp'
import laptop from '@/assets/images/laptop-ubq.webp'
import smartphone from '@/assets/images/smartphone.webp'

import QrcodeVue, { type ImageSettings } from 'qrcode.vue'

const heroVideos = [
  { src: new URL('../../assets/videos/vid04.mp4', import.meta.url).href, id: 'hero-vid-1' },
  { src: new URL('../../assets/videos/vid02.mp4', import.meta.url).href, id: 'hero-vid-2' },
];

const mutedStates = ref(heroVideos.map(() => true));

const toggleSound = (index: number) => {
  if (!heroVideos[index]) return;
  const video = document.getElementById(heroVideos[index].id) as HTMLVideoElement;
  if (!video) return;

  video.muted = !video.muted;
  mutedStates.value[index] = video.muted;

  if (!video.muted) {
    // Mute other hero videos
    heroVideos.forEach((v, i) => {
      if (i !== index) {
        const otherVideo = document.getElementById(v.id) as HTMLVideoElement;
        if (otherVideo) {
          otherVideo.muted = true;
          mutedStates.value[i] = true;
        }
      }
    });
    video.play();
  }

  toast.info(video.muted ? 'Sonido desactivado' : 'Sonido activado');
};

const imageSettings = ref<ImageSettings>({
  src: 'https://files.catbox.moe/eslt94.webp',
  width: 40,
  height: 40,
  // x: 10,
  // y: 10,
  excavate: false,
  // crossOrigin: 'anonymous', // Set this when you need to export the canvas to an image.
})


const qrPlaces = [
  {
    name: 'Automóvil',
    image: car,
  },
  {
    name: 'Hogar',
    image: house,
  },
  {
    name: 'Celular',
    image: smartphone,
  },
  {
    name: 'Bolso',
    image: bag,
  },
  {
    name: 'Maleta',
    image: suitcase,
  },
  {
    name: 'Mascota',
    image: dog,
  },
  {
    name: 'Laptop',
    image: laptop,
  },
  {
    name: 'Familiar',
    image: eldery,
  },
  {
    name: 'Electrónico',
    image: electro, // o laptop/smartphone según prefieras
  },
]
const currentPlace = ref<{ name: string, image: string } | undefined>(qrPlaces[0]);
const qrDynamicUrl = computed(() => {
  const text = `Hola, es mi primera vez escaneando en ubiqueme`
  return `https://wa.me/525652094079?text=${encodeURIComponent(text)}`
})
let placeInterval: ReturnType<typeof setInterval> | undefined;

const featureCards = [
  { icon: 'public', title: 'Cobertura mundial', desc: 'Funciona en todo el mundo' },
  { icon: 'notifications_active', title: 'Alertas inmediatas', desc: 'Notifica al instante' },
  { icon: 'install_mobile', title: 'Sin aplicaciones', desc: 'Sin apps, solo QR' },
  { icon: 'bi-whatsapp', title: 'WhatsApp en tiempo real', desc: 'Alerta por WhatsApp' },
  { icon: 'schedule', title: 'Notificaciones 24/7', desc: 'Monitoreo constante' },
  { icon: 'shield_lock', title: 'Privacidad protegida', desc: 'Tus datos seguros' },
]

const switchPlaces = () => {
  placeInterval = setInterval(() => {
    const placeIndexRandom = Math.round(Math.random() * qrPlaces.length - 1);
    currentPlace.value = qrPlaces[placeIndexRandom]
  }, 3600);
}

onMounted(() => {
  switchPlaces()
})

onUnmounted(() => {
  if (placeInterval) clearInterval(placeInterval);
})

//Frase: Por que localizar es seguridad y tranquilidad
</script>

<template>
  <HomeLayout>
    <template #main>
      <main class="relative bg-white overflow-hidden font-google-sans">

        <!-- HERO -->
        <section class="px-6 sm:px-10 lg:px-6 pt-24 lg:pt-20 pb-20 relative z-20 min-h-[600px]">

          <!-- Background images with crossfade -->
          <div aria-hidden="true" class="absolute inset-0 -z-20 overflow-hidden">
            <Transition name="crossfade" mode="out-in">
              <img :key="currentPlace?.image" :src="currentPlace?.image" alt=""
                class="absolute inset-0 h-full w-full object-cover" />
            </Transition>
          </div>

          <!-- Gradient overlay -->
          <div aria-hidden="true" class="absolute inset-0 -z-10 bg-white">
          </div>

          <!-- VIDEO MARQUEE -->
          <VideoMarquee />

          <!-- Badge -->
          <div class="flex justify-center hidden">

            <div class="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-5 py-2">

              <span class="material-symbols-outlined text-green-900 text-[20px]">
                verified_user
              </span>

              <span class="text-sm font-semibold text-slate-700">
                Notificaciones privadas
              </span>

            </div>

          </div>

          <!-- Hero Content: Grid 3 columnas [cards_scroll] [texto] [phone] -->
          <div class="hidden lg:grid lg:grid-cols-[1fr_3fr_1fr] gap-6 lg:gap-4">

            <!-- COL 1: Cards con scroll infinito hacia arriba (solo desktop) -->
            <div class="hidden lg:block relative max-h-[600px] cards-scroll-mask">
              <div class="cards-scroll-track flex flex-col gap-3">

                <!-- === SET 1 === -->
                <!-- Cobertura mundial -->
                <div
                  class="w-full rounded-2xl border border-slate-100 bg-white/80 p-3 text-left shadow-xs flex items-start gap-3 shrink-0">
                  <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-orange-50">
                    <span class="material-symbols-outlined text-orange-600 text-lg">public</span>
                  </div>
                  <div>
                    <h3 class="font-semibold text-slate-900 text-xs">Cobertura mundial</h3>
                    <p class="mt-0.5 text-[11px] leading-4 text-slate-500">Funciona desde cualquier lugar con internet.
                    </p>
                  </div>
                </div>

                <!-- Alertas inmediatas -->
                <div
                  class="w-full rounded-2xl border border-slate-100 bg-white/80 p-3 text-left shadow-xs flex items-start gap-3 shrink-0">
                  <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-orange-50">
                    <span class="material-symbols-outlined text-orange-600 text-lg">notifications_active</span>
                  </div>
                  <div>
                    <h3 class="font-semibold text-slate-900 text-xs">Alertas inmediatas</h3>
                    <p class="mt-0.5 text-[11px] leading-4 text-slate-500">Notificación en segundos al escanear tu QR.
                    </p>
                  </div>
                </div>

                <!-- Sin aplicaciones -->
                <div
                  class="w-full rounded-2xl border border-slate-100 bg-white/80 p-3 text-left shadow-xs flex items-start gap-3 shrink-0">
                  <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-orange-50">
                    <span class="material-symbols-outlined text-orange-600 text-lg">install_mobile</span>
                  </div>
                  <div>
                    <h3 class="font-semibold text-slate-900 text-xs">Sin aplicaciones</h3>
                    <p class="mt-0.5 text-[11px] leading-4 text-slate-500">Solo escanea el QR, el navegador hace todo.
                    </p>
                  </div>
                </div>

                <!-- WhatsApp en tiempo real -->
                <div
                  class="w-full rounded-2xl border border-slate-100 bg-white/80 p-3 text-left shadow-xs flex items-start gap-3 shrink-0">
                  <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-orange-50">
                    <v-icon name="bi-whatsapp" class="text-orange-600 text-lg notranslate" />
                  </div>
                  <div>
                    <h3 class="font-semibold text-slate-900 text-xs">
                      <span class="flex items-center gap-1">
                        WhatsApp en tiempo real
                        <span class="h-1.5 w-1.5 rounded-full bg-orange-500 animate-pulse inline-block"></span>
                      </span>
                    </h3>
                    <p class="mt-0.5 text-[11px] leading-4 text-slate-500">Alerta directa a WhatsApp, sin apps extra.
                    </p>
                  </div>
                </div>

                <!-- Notificaciones 24/7 -->
                <div
                  class="w-full rounded-2xl border border-slate-100 bg-white/80 p-3 text-left shadow-xs flex items-start gap-3 shrink-0">
                  <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-orange-50">
                    <span class="material-symbols-outlined text-orange-600 text-lg">schedule</span>
                  </div>
                  <div>
                    <h3 class="font-semibold text-slate-900 text-xs">Notificaciones 24/7</h3>
                    <p class="mt-0.5 text-[11px] leading-4 text-slate-500">Monitoreo constante, incluso mientras
                      duermes.</p>
                  </div>
                </div>

                <!-- Privacidad protegida -->
                <div
                  class="w-full rounded-2xl border border-slate-100 bg-white/80 p-3 text-left shadow-xs flex items-start gap-3 shrink-0">
                  <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-orange-50">
                    <span class="material-symbols-outlined text-orange-600 text-lg">shield_lock</span>
                  </div>
                  <div>
                    <h3 class="font-semibold text-slate-900 text-xs">Privacidad protegida</h3>
                    <p class="mt-0.5 text-[11px] leading-4 text-slate-500">Nunca compartimos tu info personal.</p>
                  </div>
                </div>

                <!-- CTA: 1 año gratis -->
                <router-link :to="{ name: 'register' }"
                  class="w-full rounded-2xl border border-orange-200 bg-orange-50/80 p-3 text-left hover:bg-orange-100/80 transition flex items-start gap-3 shrink-0">
                  <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-orange-100">
                    <span class="material-symbols-outlined text-orange-600 text-lg">workspace_premium</span>
                  </div>
                  <div class="flex-1">
                    <h3 class="font-semibold text-orange-800 text-xs">1 año Plan Bronce GRATIS</h3>
                    <p class="text-[11px] leading-4 text-orange-600/80">Crea tu cuenta y actívalo hoy sin costo.</p>
                    <span
                      class="mt-1.5 inline-block rounded-lg bg-orange-600 px-3 py-1 text-[11px] font-semibold text-white">Crear
                      cuenta</span>
                  </div>
                </router-link>

                <!-- === SET 2 (duplicado para scroll seamless) === -->
                <!-- Cobertura mundial -->
                <div
                  class="w-full rounded-2xl border border-slate-100 bg-white/80 p-3 text-left shadow-xs flex items-start gap-3 shrink-0">
                  <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-orange-50">
                    <span class="material-symbols-outlined text-orange-600 text-lg">public</span>
                  </div>
                  <div>
                    <h3 class="font-semibold text-slate-900 text-xs">Cobertura mundial</h3>
                    <p class="mt-0.5 text-[11px] leading-4 text-slate-500">Funciona desde cualquier lugar con internet.
                    </p>
                  </div>
                </div>

                <!-- Alertas inmediatas -->
                <div
                  class="w-full rounded-2xl border border-slate-100 bg-white/80 p-3 text-left shadow-xs flex items-start gap-3 shrink-0">
                  <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-orange-50">
                    <span class="material-symbols-outlined text-orange-600 text-lg">notifications_active</span>
                  </div>
                  <div>
                    <h3 class="font-semibold text-slate-900 text-xs">Alertas inmediatas</h3>
                    <p class="mt-0.5 text-[11px] leading-4 text-slate-500">Notificación en segundos al escanear tu QR.
                    </p>
                  </div>
                </div>

                <!-- Sin aplicaciones -->
                <div
                  class="w-full rounded-2xl border border-slate-100 bg-white/80 p-3 text-left shadow-xs flex items-start gap-3 shrink-0">
                  <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-orange-50">
                    <span class="material-symbols-outlined text-orange-600 text-lg">install_mobile</span>
                  </div>
                  <div>
                    <h3 class="font-semibold text-slate-900 text-xs">Sin aplicaciones</h3>
                    <p class="mt-0.5 text-[11px] leading-4 text-slate-500">Solo escanea el QR, el navegador hace todo.
                    </p>
                  </div>
                </div>

                <!-- WhatsApp en tiempo real -->
                <div
                  class="w-full rounded-2xl border border-slate-100 bg-white/80 p-3 text-left shadow-xs flex items-start gap-3 shrink-0">
                  <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-orange-50">
                    <v-icon name="bi-whatsapp" class="text-orange-600 text-lg notranslate" />
                  </div>
                  <div>
                    <h3 class="font-semibold text-slate-900 text-xs">
                      <span class="flex items-center gap-1">
                        WhatsApp en tiempo real
                        <span class="h-1.5 w-1.5 rounded-full bg-orange-500 animate-pulse inline-block"></span>
                      </span>
                    </h3>
                    <p class="mt-0.5 text-[11px] leading-4 text-slate-500">Alerta directa a WhatsApp, sin apps extra.
                    </p>
                  </div>
                </div>

                <!-- Notificaciones 24/7 -->
                <div
                  class="w-full rounded-2xl border border-slate-100 bg-white/80 p-3 text-left shadow-xs flex items-start gap-3 shrink-0">
                  <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-orange-50">
                    <span class="material-symbols-outlined text-orange-600 text-lg">schedule</span>
                  </div>
                  <div>
                    <h3 class="font-semibold text-slate-900 text-xs">Notificaciones 24/7</h3>
                    <p class="mt-0.5 text-[11px] leading-4 text-slate-500">Monitoreo constante, incluso mientras
                      duermes.</p>
                  </div>
                </div>

                <!-- Privacidad protegida -->
                <div
                  class="w-full rounded-2xl border border-slate-100 bg-white/80 p-3 text-left shadow-xs flex items-start gap-3 shrink-0">
                  <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-orange-50">
                    <span class="material-symbols-outlined text-orange-600 text-lg">shield_lock</span>
                  </div>
                  <div>
                    <h3 class="font-semibold text-slate-900 text-xs">Privacidad protegida</h3>
                    <p class="mt-0.5 text-[11px] leading-4 text-slate-500">Nunca compartimos tu info personal.</p>
                  </div>
                </div>

                <!-- CTA: 1 año gratis -->
                <router-link :to="{ name: 'register' }"
                  class="w-full rounded-2xl border border-orange-200 bg-orange-50/80 p-3 text-left hover:bg-orange-100/80 transition flex items-start gap-3 shrink-0">
                  <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-orange-100">
                    <span class="material-symbols-outlined text-orange-600 text-lg">workspace_premium</span>
                  </div>
                  <div class="flex-1">
                    <h3 class="font-semibold text-orange-800 text-xs">1 año Plan Bronce GRATIS</h3>
                    <p class="text-[11px] leading-4 text-orange-600/80">Crea tu cuenta y actívalo hoy sin costo.</p>
                    <span
                      class="mt-1.5 inline-block rounded-lg bg-orange-600 px-3 py-1 text-[11px] font-semibold text-white">Crear
                      cuenta</span>
                  </div>
                </router-link>

              </div>
            </div>

            <!-- COL 2: Text Content -->
            <div class="text-center lg:text-left  flex flex-col items-center">
              <h1
                class="text-4xl sm:text-5xl lg:text-4xl xl:text-5xl 2xl:text-6xl font-bold tracking-tight leading-[1.1] pt-2 text-slate-800">

                Códigos QR para notificar

              </h1>
              <div class="flex gap-2 min-w-full justify-center">
                <h2
                  class="text-4xl sm:text-5xl lg:text-4xl xl:text-5xl 2xl:text-6xl font-bold tracking-tight leading-[1.1] text-slate-700">
                  sobre su:</h2>

                <div class="relative overflow-hidden ">
                  <Transition name="slide-up" mode="out-in">
                    <div :key="currentPlace?.name"
                      class="bg-gradient-to-r from-orange-600 via-amber-500 to-orange-800 bg-clip-text text-transparent text-4xl sm:text-5xl lg:text-4xl xl:text-5xl 2xl:text-6xl font-black tracking-tight leading-[1.1]">
                      {{ currentPlace?.name }}
                    </div>
                  </Transition>
                </div>

              </div>

              <p
                class="mt-2 sm:mt-6 text-base sm:text-lg leading-7 sm:leading-8 text-slate-600  lg:mx-0 text-center lg:px-2">
                Etiquetas físicas y pulseras inteligentes para recuperar
                objetos perdidos, ayudar a mascotas, niños y adultos mayores,
                manteniendo siempre protegida su información personal.
              </p>

              <!-- QR + CTA: row en lg, columna en mobile -->
              <div class="mt-8 flex flex-col lg:flex-row lg:items-center lg:justify-between lg:gap-8">

                <!-- QR -->
                <div
                  class="relative  bg-white rounded-3xl border border-neutral-200 p-4 shadow-[0_18px_40px_rgba(0,0,0,.12)] w-fit">

                  <!-- Header -->
                  <div class="flex items-center justify-between mb-3">
                    <span class="text-[11px] uppercase tracking-[0.35em] text-neutral-400">
                      Prueba Gratuita
                    </span>

                    <div class="flex-1 h-px bg-neutral-200 mx-3"></div>

                    <span class="text-xs font-semibold text-green-500">
                      WhatsApp
                    </span>
                  </div>

                  <!-- QR -->
                  <div class="rounded-2xl border border-neutral-100 bg-white p-2 flex justify-center">
                    <QrcodeVue :value="qrDynamicUrl" :size="185" render-as="svg" level="Q"
                      :image-settings="imageSettings" />
                  </div>

                  <!-- Texto -->
                  <p class="mt-3 text-xs text-neutral-500 leading-relaxed text-center">
                    Escanee para probar cómo funciona.
                  </p>

                  <!-- Detalle inferior -->
                  <div
                    class="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-green-500 ring-4 ring-white animate-pulse">
                  </div>

                </div>
                <!-- CTA buttons -->
                <div class="flex flex-col items-center lg:items-end gap-3 sm:gap-4">

                  <router-link :to="{ name: 'register' }"
                    class="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-6 sm:px-8 py-3 sm:py-4 text-white font-semibold transition hover:bg-slate-800 text-sm sm:text-base">
                    Crear cuenta gratis
                    <span class="material-symbols-outlined">arrow_forward</span>
                  </router-link>

                  <router-link :to="{ name: 'pricing' }"
                    class="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 sm:px-8 py-3 sm:py-4 font-semibold text-slate-700 transition hover:bg-slate-50 text-sm sm:text-base">
                    Ver planes
                    <span class="material-symbols-outlined">payments</span>
                  </router-link>

                </div>

              </div>

            </div>

            <!-- COL 3: Phone Mockup -->
            <div class="flex justify-center lg:items-start lg:pt-4 relative group">
              <article
                class="bg-black w-16 min-h-5 group-hover:w-22  rounded-3xl absolute top-7 z-40 transition-all duration-300 ease-in-out flex justify-center items-center text-white/70 text-[8px]">
                <p>Ubiqueme.com</p>
              </article>
              <div
                class="relative z-20 origin-top scale-[0.85] sm:scale-[0.9] lg:scale-[1] xl:scale-[0.9] 2xl:scale-100 shrink-0">

                <!-- Marco del teléfono -->
                <img src="../../assets/images/phonemockup-ubq.webp" alt=""
                  class="w-48 sm:w-56 lg:w-56 xl:w-64 relative z-20">

                <!-- Pantalla -->
                <section
                  class="absolute inset-[10px] rounded-[36px] overflow-hidden bg-[#efeae2] z-10 flex flex-col p-0">

                  <!-- Barra superior -->
                  <div class="h-6 bg-[#00342e] text-white text-[10px] flex justify-between items-center px-4">
                    <span class="pl-3.5">9:41</span>
                    <div class="flex items-center gap-1">
                      <i class="ri-signal-wifi-fill text-[9px]"></i>
                      <i class="ri-wifi-fill text-[9px]"></i>
                      <i class="ri-battery-fill text-[10px]"></i>
                    </div>
                  </div>

                  <!-- Header -->
                  <header class="bg-[#075E54] h-14 flex items-center px-3 text-white">
                    <i class="ri-arrow-left-line text-xl mr-2"></i>
                    <div
                      class="w-9 h-9 rounded-full bg-gray-300 flex items-center justify-center text-[#075E54] font-bold">
                      <img src="../../assets/Logo_Ubiqueme.webp" class="rounded-full p-0.5 bg-emerald-50">
                    </div>
                    <div class="ml-3 flex-1">
                      <p class="font-medium text-xs">Ubiqueme</p>
                      <p class="text-[11px] text-green-100">en línea</p>
                    </div>
                    <div class="flex gap-3 text-lg">
                      <i class="ri-video-line"></i>
                      <i class="ri-phone-line"></i>
                      <i class="ri-more-2-fill"></i>
                    </div>
                  </header>

                  <!-- Conversación -->
                  <main
                    class="flex-1 bg-[url('https://www.transparenttextures.com/patterns/diamond-upholstery.png')] p-3 space-y-3 overflow-hidden font-google-sans">
                    <div class="flex">
                      <div :key="currentPlace?.name"
                        class="bg-white rounded-xl rounded-tl-sm px-3 py-2 max-w-[75%] shadow text-[9px] animate-fade-left">
                        Hola Juan,<br><br>
                        Alguien acaba de escanear su código QR
                        <b>{{ currentPlace?.name }}</b>.<br><br>
                        Número de contacto:<br>
                        <b class="italic">+52 55555555</b><br><br>
                        Hora del escaneo:<br>
                        <b>21/6/2026, 8:27:03 p.m.</b><br><br>
                        Mensaje:<br>
                        "Escaneé su QR
                        <span class="font-bold">{{ currentPlace?.name }}</span>
                        para contactarlo"<br><br>
                        Recuerde <b>NO compartir datos personales</b> si decide contactar al usuario que escaneó su
                        QR.<br><br>
                        <i>Gracias por usar los servicios de Ubiqueme.</i>
                        <div class="text-right text-[9px] text-gray-500 mt-1">9:40</div>
                      </div>
                    </div>
                  </main>

                  <!-- Input -->
                  <footer class="bg-[#f0f2f5] h-14 px-3 flex items-center gap-2">
                    <i class="ri-emotion-line text-xl text-gray-500"></i>
                    <div class="flex-1 bg-white rounded-full px-4 py-2 text-xs text-gray-400">Escribe un mensaje...
                    </div>
                    <i class="ri-attachment-2 text-lg text-gray-500"></i>
                    <i class="ri-camera-line text-lg text-gray-500"></i>
                    <div class="w-9 h-9 rounded-full bg-[#25D366] flex items-center justify-center">
                      <i class="ri-mic-fill text-white"></i>
                    </div>
                  </footer>

                </section>

              </div>
            </div>

          </div>

          <!-- MOBILE HERO — iOS style -->
          <div class="lg:hidden flex flex-col gap-6">

            <!-- 1. Heading -->
            <div class="flex flex-col items-center text-center pt-4">
              <h1 class="text-[26px] font-semibold text-slate-900 tracking-tight leading-[1.15]">
                Códigos QR para notificar
              </h1>
              <div class="flex items-baseline gap-1.5 mt-1">
                <span class="text-[15px] text-slate-500">sobre su:</span>
                <div class="relative overflow-hidden">
                  <Transition name="slide-up" mode="out-in">
                    <div :key="currentPlace?.name"
                      class="text-[26px] font-semibold text-orange-500 tracking-tight leading-[1.15]">
                      {{ currentPlace?.name }}
                    </div>
                  </Transition>
                </div>
              </div>
              <p class="mt-2 text-[14px] leading-5 text-slate-500 max-w-sm">
                Etiquetas físicas y pulseras inteligentes para recuperar objetos perdidos, ayudando a mascotas, niños y adultos mayores, manteniendo siempre protegida su información personal.
              </p>
            </div>

            <!-- 2. Phone (left) + iOS-style pills (right) -->
            <div class="flex items-center gap-2.5 sm:gap-4 -my-3">
              <!-- Phone - left -->
              <div class="relative w-44 sm:w-52 shrink-0">
                <img src="../../assets/images/phonemockup-ubq.webp" alt="" class="w-full relative z-20">
                <section class="absolute inset-[8px] rounded-[30px] overflow-hidden bg-[#efeae2] z-10 flex flex-col">
                  <div class="h-6 bg-[#00342e] text-white text-[9px] flex justify-between items-center px-3.5">
                    <span class="pl-4">9:41</span>
                    <div class="flex items-center gap-1">
                      <i class="ri-signal-wifi-fill text-[8px]"></i>
                      <i class="ri-wifi-fill text-[8px]"></i>
                      <i class="ri-battery-fill text-[9px]"></i>
                    </div>
                  </div>
                  <header class="bg-[#075E54] h-11 flex items-center px-3 text-white">
                    <i class="ri-arrow-left-line text-lg mr-2"></i>
                    <div class="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-[#075E54] font-bold">
                      <img src="../../assets/Logo_Ubiqueme.webp" class="rounded-full p-0.5 bg-emerald-50">
                    </div>
                    <div class="ml-2.5 flex-1">
                      <p class="font-medium text-[11px]">Ubiqueme</p>
                      <p class="text-[10px] text-green-100">en línea</p>
                    </div>
                    <div class="flex gap-2.5 text-base">
                      <i class="ri-video-line"></i>
                      <i class="ri-phone-line"></i>
                      <i class="ri-more-2-fill"></i>
                    </div>
                  </header>
                  <main class="flex-1 bg-[url('https://www.transparenttextures.com/patterns/diamond-upholstery.png')] p-2.5 space-y-2 overflow-hidden">
                    <div class="flex">
                      <div :key="currentPlace?.name"
                        class="bg-white rounded-lg rounded-tl-sm px-2.5 py-2 max-w-[75%] shadow text-[8px]">
                        Hola Juan,<br><br>
                        Alguien acaba de escanear su código QR
                        <b>{{ currentPlace?.name }}</b>.<br><br>
                        Número de contacto:<br>
                        <b class="italic">+52 55555555</b><br><br>
                        Hora del escaneo:<br>
                        <b>21/6/2026, 8:27:03 p.m.</b><br><br>
                        Mensaje:<br>
                        "Escaneé su QR
                        <span class="font-semibold">{{ currentPlace?.name }}</span>
                        para contactarlo"<br><br>
                        Recuerde <b>NO compartir datos personales</b> si decide contactar al usuario que escaneó su QR.<br><br>
                        <i>Gracias por usar los servicios de Ubiqueme.</i>
                        <div class="text-right text-[8px] text-gray-500 mt-0.5">9:40</div>
                      </div>
                    </div>
                  </main>
                  <footer class="bg-[#f0f2f5] h-11 px-3 flex items-center gap-2">
                    <i class="ri-emotion-line text-base text-gray-500"></i>
                    <div class="flex-1 bg-white rounded-full px-3.5 py-1.5 text-[11px] text-gray-400">Escribe un mensaje...</div>
                    <i class="ri-attachment-2 text-sm text-gray-500"></i>
                    <i class="ri-camera-line text-sm text-gray-500"></i>
                    <div class="w-8 h-8 rounded-full bg-[#25D366] flex items-center justify-center">
                      <i class="ri-mic-fill text-white text-sm"></i>
                    </div>
                  </footer>
                </section>
              </div>

              <!-- iOS-style pills - right (supporting) -->
              <div class="flex-1 flex flex-col gap-1.5">
                <div v-for="(card, i) in featureCards" :key="card.title"
                     class="bg-white rounded-xl p-2 shadow-sm border border-slate-100 flex items-center gap-2 animate-fade-right"
                     :style="{ animationDelay: `${i * 0.08}s` }">
                  <div class="h-6 w-6 shrink-0 rounded-full bg-orange-100 flex items-center justify-center">
                    <span v-if="card.icon !== 'bi-whatsapp'" class="material-symbols-outlined notranslate text-orange-500 text-[13px]">{{ card.icon }}</span>
                    <v-icon v-else name="bi-whatsapp" class="text-orange-500 text-[13px] notranslate" />
                  </div>
                  <div class="min-w-0 flex-1">
                    <p class="text-[11px] font-semibold text-slate-900 leading-tight truncate">{{ card.title }}</p>
                    <p class="text-[10px] text-slate-500 leading-tight truncate">{{ card.desc }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- 3. QR + CTA compact row -->
            <div class="bg-slate-50 rounded-2xl p-3.5">
              <div class="flex items-center gap-3">
                <div class="shrink-0">
                  <div class="rounded-xl bg-white p-1.5 flex justify-center border border-slate-100">
                    <QrcodeVue :value="qrDynamicUrl" :size="64" render-as="svg" level="Q" :image-settings="imageSettings" />
                  </div>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-[9px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Prueba Gratuita · Escanea</p>
                  <router-link :to="{ name: 'register' }"
                    class="flex items-center justify-center gap-1 w-full h-9 rounded-full bg-orange-500 text-white text-[12px] font-semibold hover:bg-orange-600 active:scale-[0.97] transition-all duration-150 mb-1.5">
                    Crear cuenta gratis
                    <span class="material-symbols-outlined text-[15px]">arrow_forward</span>
                  </router-link>
                  <router-link :to="{ name: 'pricing' }"
                    class="flex items-center justify-center gap-1 w-full h-9 rounded-full bg-orange-50 text-orange-600 text-[12px] font-semibold hover:bg-orange-100 active:scale-[0.97] transition-all duration-150">
                    Ver planes
                    <span class="material-symbols-outlined text-[15px]">payments</span>
                  </router-link>
                </div>
              </div>
            </div>

          </div>

        </section>



        <!-- FEATURES — iOS style -->
        <section id="benefits" class="px-5 sm:px-8 lg:px-10 pb-20">

          <header class="max-w-2xl">
            <span class="text-[12px] font-semibold uppercase tracking-[0.15em] text-orange-500">
              Beneficios
            </span>
            <h2 class="mt-2 text-[24px] font-semibold tracking-tight text-slate-900 leading-tight">
              Diseñado para proteger lo que más le importa
            </h2>
            <p class="mt-3 text-[15px] leading-6 text-slate-500">
              Cada código QR conecta a la persona que encuentra un objeto con su propietario de forma inmediata, segura y privada.
            </p>
          </header>

          <div class="mt-8 space-y-3">

            <article class="bg-slate-50 rounded-2xl p-4 flex items-start gap-3.5">
              <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-100 mt-0.5">
                <span class="material-symbols-outlined text-orange-500 text-[18px]">notifications_active</span>
              </div>
              <div class="flex-1 min-w-0">
                <h3 class="text-[15px] font-semibold text-slate-900">Alertas inmediatas</h3>
                <p class="mt-1 text-[13px] leading-5 text-slate-500">Reciba una notificación apenas alguien escanee el código QR. La comunicación ocurre prácticamente en tiempo real.</p>
              </div>
            </article>

            <article class="bg-slate-50 rounded-2xl p-4 flex items-start gap-3.5">
              <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-100 mt-0.5">
                <span class="material-symbols-outlined text-orange-500 text-[18px]">shield_lock</span>
              </div>
              <div class="flex-1 min-w-0">
                <h3 class="text-[15px] font-semibold text-slate-900">Privacidad protegida</h3>
                <p class="mt-1 text-[13px] leading-5 text-slate-500">Sus datos permanecen ocultos. La persona que encuentra el objeto nunca accede a su teléfono, correo o dirección.</p>
              </div>
            </article>

            <article class="bg-slate-50 rounded-2xl p-4 flex items-start gap-3.5">
              <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-100 mt-0.5">
                <span class="material-symbols-outlined text-orange-500 text-[18px]">public</span>
              </div>
              <div class="flex-1 min-w-0">
                <h3 class="text-[15px] font-semibold text-slate-900">Cobertura mundial</h3>
                <p class="mt-1 text-[13px] leading-5 text-slate-500">Funciona desde cualquier país con un teléfono conectado a internet. Sin depender de aplicaciones específicas.</p>
              </div>
            </article>

            <article class="bg-slate-50 rounded-2xl p-4 flex items-start gap-3.5">
              <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-100 mt-0.5">
                <span class="material-symbols-outlined text-orange-500 text-[18px]">install_mobile</span>
              </div>
              <div class="flex-1 min-w-0">
                <h3 class="text-[15px] font-semibold text-slate-900">Sin aplicaciones</h3>
                <p class="mt-1 text-[13px] leading-5 text-slate-500">Solo escanee el código QR. El navegador realiza todo sin instalaciones ni configuraciones adicionales.</p>
              </div>
            </article>

          </div>

          <!-- WhatsApp -->
          <div class="mt-8 bg-slate-50 rounded-2xl p-5">
            <div class="flex items-start gap-3.5">
              <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-100 mt-0.5">
                <v-icon name="bi-whatsapp" class="text-orange-500 text-lg notranslate" />
              </div>
              <div class="flex-1 min-w-0">
                <span class="text-[10px] font-semibold uppercase tracking-[0.15em] text-orange-500">WhatsApp</span>
                <h3 class="mt-1.5 text-[16px] font-semibold text-slate-900 leading-tight">Reciba notificaciones en tiempo real</h3>
                <p class="mt-1.5 text-[13px] leading-5 text-slate-500">Cuando alguien encuentre su objeto recibirá una alerta directamente en WhatsApp sin revisar correos ni instalar apps.</p>
                <div class="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-[11px] font-semibold text-slate-600 border border-slate-100">
                  <span class="h-1.5 w-1.5 rounded-full bg-orange-500 animate-pulse"></span>
                  Tiempo real
                </div>
              </div>
            </div>
          </div>

        </section>
        <section id="how-it-works">
          <HowItWorks />
        </section>
        <section id="videos">
          <VideoGrid />
        </section>
        <section id="steps">
          <StepByStep />
        </section>
        <section id="features">
          <FeaturesComponent />
        </section>
        <section id="pricing">
          <PricingPlans />
        </section>
      </main>
    </template>
  </HomeLayout>
</template>

<style scoped>
.cursor-custom {
  cursor: url('../../assets/phone_cursor.png'), auto;
}

.font-google-sans {
  font-family: 'Google Sans', sans-serif;
}

.material-symbols-outlined {
  font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}

button {
  transition: all 0.2s ease;
}

.content-visibility-auto {
  content-visibility: auto;
  contain-intrinsic-size: 600px;
}

@keyframes float {

  0%,
  100% {
    transform: translateY(0) rotate(0deg);
  }

  50% {
    transform: translateY(-20px) rotate(5deg);
  }
}

.animate-float-slow {
  animation: float 8s ease-in-out infinite;
}

.animate-float-medium {
  animation: float 6s ease-in-out infinite;
  animation-delay: 1s;
}

.animate-float-fast {
  animation: float 4s ease-in-out infinite;
  animation-delay: 0.5s;
}

/* Infinite scroll testimonials */
@keyframes scroll-up {
  0% {
    transform: translateY(0);
  }

  100% {
    transform: translateY(-50%);
  }
}

.testimonials-mask {
  mask-image: linear-gradient(to bottom,
      transparent 0%,
      black 12%,
      black 88%,
      transparent 100%);
  -webkit-mask-image: linear-gradient(to bottom,
      transparent 0%,
      black 12%,
      black 88%,
      transparent 100%);
}

.testimonials-track {
  animation: scroll-up 120s linear infinite;
}

.testimonials-track:hover {
  animation-play-state: paused;
}

/* Infinite scroll cards - upward slow animation */
@keyframes cards-scroll {
  0% {
    transform: translateY(0);
  }

  100% {
    transform: translateY(-50%);
  }
}

.cards-scroll-mask {
  mask-image: linear-gradient(to bottom,
      transparent 0%,
      black 12%,
      black 88%,
      transparent 100%);
  -webkit-mask-image: linear-gradient(to bottom,
      transparent 0%,
      black 12%,
      black 88%,
      transparent 100%);
  overflow: hidden;
}

.cards-scroll-track {
  animation: cards-scroll 120s linear infinite;
  will-change: transform;
}

.cards-scroll-track:hover {
  animation-play-state: paused;
}

/* Slide-up transition for place name rotation */
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

/* Crossfade transition for background images */
.crossfade-enter-active,
.crossfade-leave-active {
  transition: opacity 0.6s ease;
}

.crossfade-enter-from,
.crossfade-leave-to {
  opacity: 0;
}

/* Fade animations for mini-cards behind phone */
@keyframes fade-left {
  from { opacity: 0; transform: translateX(-20px); }
  to { opacity: 1; transform: translateX(0); }
}
@keyframes fade-right {
  from { opacity: 0; transform: translateX(20px); }
  to { opacity: 1; transform: translateX(0); }
}
.animate-fade-left {
  animation: fade-left 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
}
.animate-fade-right {
  animation: fade-right 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
}
</style>
