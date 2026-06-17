<script lang="ts" setup>
import { useUserStore } from '@/stores/user';
import { RouterLink } from 'vue-router'

import { onMounted, onUnmounted, ref } from 'vue';

import UbiquemeLogo from '@/assets/Ubiqueme_Logo_white.webp';

const openAziechrie = () => window.open('https://www.aziechriepharma.com', '_blank');

const navLinks = [
  { name: 'Inicio', pathName: 'home', icon: 'home', requiredLogin: false },
  { name: 'Dashboard', pathName: 'dashboard', icon: 'dashboard_customize', requiredLogin: true },
  { name: 'Ayuda', pathName: 'help', icon: 'help', requiredLogin: false },
  { name: 'Precios', pathName: 'pricing', icon: 'payments', requiredLogin: false },
]

const domains = ['ubiqueme.com', 'contactomio.com', 'localizarme.com'];
const currentDomainIndex = ref(0);

const taglines = [
  { text: 'por AZIECHRIE PHARMA', clickable: true },
  { text: '30+ años de experiencia', clickable: false },
  { text: 'Soluciones tecnológicas', clickable: false },
];
const currentTaglineIndex = ref(0);
const isMobileMenuOpen = ref(false);
let intervalId: ReturnType<typeof setInterval> | undefined;

onMounted(() => {
  intervalId = setInterval(() => {
    currentDomainIndex.value = (currentDomainIndex.value + 1) % domains.length;
    currentTaglineIndex.value = (currentTaglineIndex.value + 1) % taglines.length;
  }, 5000);
});

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId);
});
</script>

<template>
  <div class="font-google-sans">
    <!-- TopNavBar -->
    <nav class="fixed top-0 w-full z-50 bg-[#09090b] border-b border-white/5 transition-all duration-300">

      <!-- Subtle Orange Top Line -->
      <div
        class="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-orange-500/40 to-transparent">
      </div>

      <div class="flex justify-between items-center h-20 px-6 md:px-16 w-full max-w-screen-2xl mx-auto relative">

        <!-- Logo -->
        <div class="flex items-center gap-3 relative">
          <!-- SSL Badge (Cloudflare Style) -->
          <div
            class="hidden sm:flex items-center gap-1.5 px-0.5 py-1.5 ml-4 rounded-lg border border-orange-500/20 bg-orange-500/[0.06] hover:bg-orange-500/[0.1] hover:shadow-[0_0_20px_rgba(249,115,22,0.15)] transition-all duration-300">
            <span class="material-symbols-outlined notranslate text-orange-400" style="font-size:18px">shield</span>
            <span class="text-[11px] font-black uppercase tracking-[0.2em] text-orange-500/80">SSL</span>
          </div>
          <RouterLink :to="{ name: 'home' }" class="flex items-center gap-2 group cursor-pointer z-50">
            <img :src="UbiquemeLogo" alt="Ubiqueme Logo"
              class="w-10 h-10 sm:w-12 sm:h-12 object-contain" />
            <!-- Desktop: domains side by side -->
            <div class="hidden lg:flex flex-col min-w-[140px] sm:min-w-[200px]">
              <div class="relative h-9 sm:h-10 overflow-hidden flex items-center">
                <Transition name="slide-up">
                  <div :key="currentDomainIndex"
                    class="absolute left-0 flex items-baseline text-[#dce7ff] font-black tracking-tighter text-[15px] sm:text-[22px] lowercase leading-none whitespace-nowrap">
                    <span>{{ domains[currentDomainIndex]?.split('.com')[0] }}</span>
                    <span class="text-orange-500">.com</span>
                  </div>
                </Transition>
              </div>
              <div class="relative h-4 sm:h-5 overflow-hidden flex items-center">
                <Transition name="slide-up">
                  <div :key="currentTaglineIndex"
                    class="absolute left-0 text-[9px]! sm:text-[10px] text-white/30 font-medium tracking-wider whitespace-nowrap font-google-sans"
                    style="font-variation-settings: normal">
                    <template v-if="taglines[currentTaglineIndex]!.clickable">
                      por <span @click.stop="openAziechrie"
                        class="font-semibold text-orange-400/60 hover:text-orange-400 transition-colors cursor-pointer">AZIECHRIE
                        PHARMA</span>
                    </template>
                    <template v-else>
                      {{ taglines[currentTaglineIndex]!.text }}
                    </template>
                  </div>
                </Transition>
              </div>
            </div>
          </RouterLink>
        </div>

        <!-- Mobile: domains centered with absolute positioning to prevent animation jumps -->
        <div class="lg:hidden flex-1 flex justify-center min-w-0">
          <RouterLink :to="{ name: 'home' }" class="flex flex-col items-center w-full max-w-fit">
            <div class="relative h-8 w-full overflow-hidden flex items-center justify-center">
              <Transition name="slide-up">
                <div :key="currentDomainIndex"
                  class="absolute left-0 right-0 flex justify-center items-baseline text-[#dce7ff] font-black tracking-tighter text-[16px] lowercase leading-none whitespace-nowrap">
                  <span>{{ domains[currentDomainIndex]?.split('.com')[0] }}</span>
                  <span class="text-orange-500">.com</span>
                </div>
              </Transition>
            </div>
            <div class="relative h-3.5 w-full overflow-hidden flex items-center justify-center">
              <Transition name="slide-up">
                <div :key="currentTaglineIndex"
                  class="absolute left-0 right-0 flex justify-center text-[8px] text-white/30 font-medium tracking-wider whitespace-nowrap font-google-sans"
                  style="font-variation-settings: normal">
                  <template v-if="taglines[currentTaglineIndex]!.clickable">
                    por <span @click.stop="openAziechrie"
                      class="font-semibold text-orange-400/60 hover:text-orange-400 transition-colors cursor-pointer">AZIECHRIE
                      PHARMA</span>
                  </template>
                  <template v-else>
                    {{ taglines[currentTaglineIndex]!.text }}
                  </template>
                </div>
              </Transition>
            </div>
          </RouterLink>
        </div>

        <!-- Menu -->
        <div class="hidden lg:flex items-center space-x-2 tracking-tight">
          <RouterLink v-for="link in navLinks" :key="link.name" :to="{ name: link.pathName }"
            :class="{ 'hidden': !useUserStore().getUserId && link.requiredLogin }"
            class="flex items-center gap-2 text-white/40 hover:text-orange-500 px-4 py-2 rounded-xl transition-all duration-300 group relative">
            <span class="material-symbols-outlined notranslate text-[20px] group-hover:scale-110 transition-transform">{{ link.icon
              }}</span>
            <span class="text-[11px] font-black uppercase tracking-widest">{{ link.name }}</span>

            <!-- Indicator Line -->
            <div
              class="absolute bottom-0 left-4 right-4 h-[2px] bg-orange-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-center">
            </div>
          </RouterLink>
        </div>

        <!-- Buttons (Desktop Only) -->
        <div class="hidden lg:flex items-center space-x-4 z-50">
          <template v-if="!useUserStore().getUserId">
            <RouterLink :to="{ name: 'login' }"
              class="text-white/40 hover:text-white transition-colors duration-300 text-[11px] font-black uppercase tracking-widest px-4 py-2 cursor-pointer">
              Iniciar sesión
            </RouterLink>

            <RouterLink :to="{ name: 'register' }"
              class="bg-orange-500 text-[#09090b] px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-white transition-all duration-300 active:scale-95 shadow-[0_10px_20px_rgba(249,115,22,0.15)] cursor-pointer">
              Registrarse
            </RouterLink>
          </template>
          <template v-else>
            <RouterLink :to="{ name: 'dashboard' }"
              class="bg-white/5 border border-white/10 text-white px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-orange-500 hover:text-[#09090b] hover:border-orange-500 transition-all duration-300 cursor-pointer flex items-center gap-2">
              <span class="material-symbols-outlined notranslate text-sm">dashboard</span>
              Panel
            </RouterLink>
          </template>
        </div>

        <!-- Hamburger Button (Mobile Only) -->
        <button @click="isMobileMenuOpen = !isMobileMenuOpen"
          class="lg:hidden flex items-center justify-center p-2 text-white/60 hover:text-orange-500 transition-colors z-50 cursor-pointer">
          <span class="material-symbols-outlined notranslate text-[28px]">{{ isMobileMenuOpen ? 'close' : 'menu' }}</span>
        </button>

      </div>

      <!-- Mobile Menu Overlay -->
      <Transition name="fade-slide">
        <div v-if="isMobileMenuOpen"
          class="fixed top-20 left-0 w-full h-[calc(100vh-80px)] bg-[#09090b]/95 backdrop-blur-xl z-40 border-t border-white/5 flex flex-col justify-between p-8 lg:hidden">
          <!-- Links -->
          <div class="flex flex-col space-y-4">
            <RouterLink v-for="link in navLinks" :key="link.name" :to="{ name: link.pathName }"
              @click="isMobileMenuOpen = false" :class="{ 'hidden': !useUserStore().getUserId && link.requiredLogin }"
              class="flex items-center gap-3 text-white/60 hover:text-orange-500 py-3.5 border-b border-white/[0.03] transition-all duration-300">
              <span class="material-symbols-outlined notranslate text-[22px]">{{ link.icon }}</span>
              <span class="text-xs font-black uppercase tracking-widest">{{ link.name }}</span>
            </RouterLink>
          </div>

          <!-- Actions -->
          <div class="flex flex-col gap-4 mt-auto">
            <template v-if="!useUserStore().getUserId">
              <RouterLink :to="{ name: 'login' }" @click="isMobileMenuOpen = false"
                class="w-full flex items-center justify-center border border-white/10 hover:border-white/20 text-white/80 hover:text-white py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-colors duration-300 cursor-pointer">
                Iniciar sesión
              </RouterLink>

              <RouterLink :to="{ name: 'register' }" @click="isMobileMenuOpen = false"
                class="w-full flex items-center justify-center bg-orange-500 hover:bg-orange-600 text-[#09090b] py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all duration-300 active:scale-95 shadow-[0_10px_20px_rgba(249,115,22,0.15)] cursor-pointer">
                Registrarse
              </RouterLink>
            </template>
            <template v-else>
              <RouterLink :to="{ name: 'dashboard' }" @click="isMobileMenuOpen = false"
                class="w-full flex items-center justify-center bg-white/5 border border-white/10 hover:border-orange-500 hover:bg-orange-500 hover:text-[#09090b] text-white py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all duration-300 cursor-pointer gap-2">
                <span class="material-symbols-outlined notranslate text-sm">dashboard</span>
                Panel de Control
              </RouterLink>
            </template>
          </div>
        </div>
      </Transition>
    </nav>

    <main>
      <slot name="main"></slot>
    </main>
    <footer
      class="bg-[#09090b] border-t border-white/5 w-full flex flex-col justify-center items-center gap-8 px-12 py-8 text-slate-500 relative">
      <div class="flex flex-col items-center space-y-2">
        <div class="flex items-center gap-2">
          <span class="material-symbols-outlined notranslate text-white/70 text-[1.2rem]" aria-hidden="true">shield</span>
          <span class="text-xs uppercase tracking-widest">SSL Secure</span>
        </div>
        <span class="font-body text-xs uppercase tracking-widest text-slate-500">©{{ new Date().getFullYear() }}
          ubiqueme.com</span>
        <span class="text-[9px] text-white/15 font-medium tracking-widest uppercase">
          Una marca de <span class="text-orange-400/60 font-semibold">AZIECHRIE PHARMA</span>
        </span>
        <div class="flex items-center mt-2">
          <Transition name="slide-up">
            <div :key="currentDomainIndex"
              class="text-[#dce7ff] font-black text-[17px] sm:text-[22px] lowercase whitespace-nowrap">
              <span>{{ domains[currentDomainIndex]?.split('.com')[0] }}</span><span class="text-orange-500">.com</span>
            </div>
          </Transition>
        </div>
      </div>

      <div class="flex flex-col sm:flex-row gap-4 sm:gap-8 items-center justify-center">
        <RouterLink
          class="flex items-center gap-1 font-body text-xs uppercase tracking-widest text-slate-500 hover:text-orange-500 transition-colors duration-300 cursor-pointer"
          :to="{ name: 'home' }">
          <span class="material-symbols-outlined notranslate text-[1rem]" aria-hidden="true">home</span> Inicio
        </RouterLink>
        <RouterLink
          class="flex items-center gap-1 font-body text-xs uppercase tracking-widest text-slate-500 hover:text-orange-500 transition-colors duration-300 cursor-pointer"
          :to="{ name: 'help' }">
          <span class="material-symbols-outlined notranslate text-[1rem]" aria-hidden="true">help</span> Ayuda
        </RouterLink>
        <RouterLink
          class="flex items-center gap-1 font-body text-xs uppercase tracking-widest text-slate-500 hover:text-orange-500 transition-colors duration-300 cursor-pointer"
          :to="{ name: 'pricing' }">
          <span class="material-symbols-outlined notranslate text-[1rem]" aria-hidden="true">attach_money</span> Precios
        </RouterLink>
        <template v-if="!useUserStore().getUserId">
          <RouterLink
            class="flex items-center gap-1 font-body text-xs uppercase tracking-widest text-slate-500 hover:text-orange-500 transition-colors duration-300 cursor-pointer"
            :to="{ name: 'login' }">
            <span class="material-symbols-outlined notranslate text-[1rem]" aria-hidden="true">login</span> Iniciar sesión
          </RouterLink>
          <RouterLink
            class="flex items-center gap-1 font-body text-xs uppercase tracking-widest text-slate-500 hover:text-orange-500 transition-colors duration-300 cursor-pointer"
            :to="{ name: 'register' }">
            <span class="material-symbols-outlined notranslate text-[1rem]" aria-hidden="true">person_add</span> Registrarse
          </RouterLink>
        </template>
      </div>
      <div class="flex flex-col items-center space-y-2">
        <div class="flex flex-wrap justify-center gap-4 sm:gap-6">
          <RouterLink
            class="flex items-center gap-1 font-body text-xs uppercase tracking-widest text-slate-500 hover:text-orange-500 transition-colors duration-300 cursor-pointer"
            :to="{ name: 'privacy' }">
            <span class="material-symbols-outlined notranslate text-[1rem]" aria-hidden="true">privacy_tip</span> Política de
            Privacidad
          </RouterLink>
          <RouterLink
            class="flex items-center gap-1 font-body text-xs uppercase tracking-widest text-slate-500 hover:text-orange-500 transition-colors duration-300 cursor-pointer"
            :to="{ name: 'terms' }">
            <span class="material-symbols-outlined notranslate text-[1rem]" aria-hidden="true">gavel</span> Términos de Servicio
          </RouterLink>
          <RouterLink
            class="flex items-center gap-1 font-body text-xs uppercase tracking-widest text-slate-500 hover:text-orange-500 transition-colors duration-300 cursor-pointer"
            :to="{ name: 'contact' }">
            <span class="material-symbols-outlined notranslate text-[1rem]" aria-hidden="true">contact_mail</span> Contacto
          </RouterLink>
        </div>
        <div class="flex items-center gap-2 text-xs text-slate-500">
          <span class="material-symbols-outlined notranslate text-[1rem]" aria-hidden="true">public</span>
          <span class="font-body">{{ domains[currentDomainIndex] }}</span>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.material-symbols-outlined {
  font-variation-settings: 'FILL' 1, 'wght' 600, 'GRAD' 0, 'opsz' 24;
}

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

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(-15px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-15px);
}
</style>
