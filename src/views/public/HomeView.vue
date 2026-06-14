<script lang="ts" setup>
import FeaturesComponent from '@/components/home/Features/FeaturesComponent.vue'
import HowItWorks from '@/components/home/HowItWorks/HowItWorks.vue'
import PricingPlans from '@/components/home/Pricing/PricingPlans.vue'
import StepByStep from '@/components/home/StepByStep/StepByStep.vue'
import VideoGrid from '@/components/home/VideoGrid/VideoGrid.vue'
import HomeLayout from '@/layouts/HomeLayout.vue'
import { useUserStore } from '@/stores/user';
import { ref } from 'vue';
import { toast } from 'vue-sonner';

import QrcodeVue from 'qrcode.vue'

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
</script>

<template>
  <HomeLayout>
    <template #main>
      <main class="relative bg-[#09090b] overflow-hidden font-google-sans">

        <!-- 🎨 BACKGROUND ORNAMENTATION (Blueprint Style) -->
        <div class="absolute inset-0 z-0">
          <div
            class="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] border border-white/5 rounded-full pointer-events-none">
          </div>
          <div
            class="absolute top-[-5%] right-[-5%] w-[400px] h-[400px] border border-white/5 rounded-full pointer-events-none">
          </div>
          <div class="absolute inset-0 z-0 opacity-[0.22]"
            style="background-image: linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px); background-size: 100px 100px;">
          </div>
        </div>

        <!-- ✨ DECORATIVE FLOATING ICONS -->
        <div class="absolute inset-0 pointer-events-none overflow-hidden z-[5] select-none">
          <!-- QR Icon Top Left -->
          <span
            class="material-symbols-outlined absolute top-[15%] left-[5%] text-amber-500/20 text-8xl animate-float-slow">qr_code_2</span>
          <!-- Smartphone Mid Right -->
          <span
            class="material-symbols-outlined absolute top-[40%] right-[8%] text-red-500/20 text-9xl animate-float-medium">smartphone</span>
          <!-- Alert Bottom Left -->
          <span
            class="material-symbols-outlined absolute bottom-[20%] left-[10%] text-amber-500/20 text-7xl animate-float-fast">notifications_active</span>
          <!-- Security Top Right -->
          <span
            class="material-symbols-outlined absolute top-[10%] right-[15%] text-white/10 text-[12rem] animate-float-slow">security</span>
          <!-- Location Mid Left -->
          <span
            class="material-symbols-outlined absolute top-[60%] left-[15%] text-amber-500/15 text-6xl animate-float-medium">location_on</span>
          <!-- Pets Bottom Right -->
          <span
            class="material-symbols-outlined absolute bottom-[10%] right-[12%] text-red-500/20 text-8xl animate-float-slow">pets</span>
          <!-- Shopping Bag scattered -->
          <span
            class="material-symbols-outlined absolute top-[25%] right-[30%] text-white/10 text-5xl animate-float-fast">shopping_bag</span>
          <!-- Emergency scattered -->
          <span
            class="material-symbols-outlined absolute bottom-[45%] left-[5%] text-amber-500/20 text-[10rem] animate-float-medium">emergency_share</span>
          <!-- Shield Mid Right -->
          <span
            class="material-symbols-outlined absolute top-[75%] right-[25%] text-white/10 text-7xl animate-float-slow">verified_user</span>
        </div>


        <article class="relative z-10 w-full flex flex-col lg:flex-row pt-24 lg:pt-32 px-6 sm:px-8  gap-12 lg:gap-8">

          <!-- Left Content -->
          <section class="w-full lg:w-1/2 flex flex-col items-center lg:items-start text-center lg:text-left relative">

            <!-- Live QR Tag (Mobile Hidden or Responsive) -->
            <div class="hidden  absolute -left-12 top-0 flex-col items-center gap-3 animate-float-medium z-20">
              <div
                class="bg-white p-3 rounded-2xl shadow-[0_0_50px_rgba(255,255,255,0.1)] border border-white/20 hover:scale-110 transition-transform">
                <QrcodeVue value="https://ubiqueme.com" :size="80" render-as="canvas" />
              </div>
              <span
                class="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 rotate-90 origin-left translate-x-4 mt-8">Escanee
                para probar</span>
            </div>

            <!-- Subtle Badge -->
            <div
              class="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 rounded-full border border-amber-500/20 mb-8 transition-colors hover:bg-amber-500/20 cursor-default">
              <span class="material-symbols-outlined text-amber-500 text-sm">enhanced_encryption</span>
              <span class="text-[11px] font-black uppercase tracking-[0.2em] text-amber-500">Privacidad Absoluta</span>
            </div>

            <!-- Main Headline -->
            <h1 class="text-4xl sm:text-6xl lg:text-[4rem] font-black text-white tracking-tight mb-6 leading-[1.1]">
              Códigos QR inteligentes para<br />
              <div class="flex justify-center items-center">
                <span class="text-transparent bg-clip-text bg-linear-to-r m-0! p-0! from-white to-white/80">recibir
                  alertas
                  de su familia y
                  pertenencias.</span>
                <article class="p-2 bg-white rounded-xl pb-8 relative">
                  <qrcode-vue value="https://ubiqueme.com" :size="100" render-as="canvas" />
                  <span
                    class="absolute bottom-2 left-1/2 -translate-x-1/2 text-sm text-black/50 leading-tight">ubiqueme.com</span>
                </article>
              </div>
            </h1>

            <!-- Sub-headline -->
            <p class="text-white/50 text-lg sm:text-xl font-medium leading-relaxed max-w-2xl mb-10">
              Etiquetas físicas y pulseras que permiten a cualquiera reportar sus artículos perdidos o asistir a sus
              mascotas, niños y adultos mayores al instante, manteniendo su información de contacto 100% oculta.
            </p>

            <!-- CTA Buttons -->
            <div class="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              <router-link :to="{ name: 'pricing' }"
                class="w-full max-w-xs flex justify-center items-center gap-2 px-6 py-3 bg-slate-700/50 border border-white/20 text-amber-400 font-semibold rounded-lg hover:bg-amber-400 hover:text-black transition-all duration-300">
                Obtener mi Código QR <span class="material-symbols-outlined">qr_code_scanner</span>
              </router-link>


              <router-link v-if="!useUserStore().getUserId" :to="{ name: 'login' }"
                class="w-full sm:w-auto px-6 py-3 bg-transparent border border-[#ff9800]/50 text-[#ff9800] font-bold text-sm tracking-wider rounded-lg hover:bg-[#ff9800]/10 hover:border-[#ff9800] transition-all duration-200 text-center">
                INICIAR SESIÓN
              </router-link>
            </div>

            <!-- Lightweight Features Grid -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-12 mt-20 pt-10 border-t border-white/5 w-full">
              <div class="flex flex-col items-center lg:items-start gap-2 text-white/40 group">
                <span
                  class="material-symbols-outlined text-2xl mb-1 text-amber-500 group-hover:scale-110 transition-transform">notifications_active</span>
                <span class="text-xs font-black uppercase tracking-widest text-white/60">Alertas Inmediatas</span>
              </div>
              <div class="flex flex-col items-center lg:items-start gap-2 text-white/40 group">
                <span
                  class="material-symbols-outlined text-2xl mb-1 text-amber-500 group-hover:scale-110 transition-transform">vpn_key</span>
                <span class="text-xs font-black uppercase tracking-widest text-white/60">Cero Datos Expuestos</span>
              </div>
              <div class="flex flex-col items-center lg:items-start gap-2 text-white/40 group">
                <span
                  class="material-symbols-outlined text-2xl mb-1 text-amber-500 group-hover:scale-110 transition-transform">public</span>
                <span class="text-xs font-black uppercase tracking-widest text-white/60">Cobertura Global</span>
              </div>
            </div>
          </section>

          <!-- Right Content: Responsive Video Grid -->
          <section class="w-full lg:w-1/2 flex flex-col gap-6 lg:gap-8 items-center">
            <div v-for="(video, index) in heroVideos" :key="index"
              class="relative w-full max-w-md lg:max-w-none rounded-[2rem] overflow-hidden group border border-white/10 bg-[#09090b]">

              <!-- Main video -->
              <video :id="video.id" :src="video.src" autoplay muted loop playsinline
                class="w-full h-auto object-cover drop-shadow-2xl main-video">
              </video>

              <div
                class="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors pointer-events-none z-20">
              </div>

              <!-- Sound Toggle Button -->
              <button @click="toggleSound(index)"
                class="absolute bottom-1 right-1 z-30 p-3 gap-2 flex items-center bg-black/60 backdrop-blur-md border border-white/10 text-white rounded-full hover:bg-amber-500 transition-all hover:scale-[1.01] cursor-pointer shadow-lg">
                <span>Haga click para {{ !mutedStates[index] ? 'apagar' :
                  'encender' }} el sonido</span>
                <span class="material-symbols-outlined text-xl">{{ mutedStates[index] ? 'volume_off' : 'volume_up'
                  }}</span>
              </button>
            </div>
          </section>

        </article>

        <HowItWorks />
        <VideoGrid />
        <StepByStep />
        <FeaturesComponent />
        <PricingPlans />
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
</style>
