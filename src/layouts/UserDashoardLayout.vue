<script lang="ts" setup>
import { RouterLink } from 'vue-router'
import { onMounted, onUnmounted, ref } from 'vue';
import { useAuth } from '@/handleAuth'
import UbiquemeLogo from '@/assets/Ubiqueme_Logo_white.webp';

const { handleLogout } = useAuth()

const openAziechrie = () => window.open('https://www.aziechriepharma.com', '_blank');

const navLinks = [
  { name: 'Inicio', pathName: 'home', icon: 'home' },
  { name: 'Ayuda', pathName: 'help', icon: 'help' },
  { name: 'Precios', pathName: 'pricing', icon: 'payments' },
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
    <nav class="fixed top-0 w-full z-50 bg-[#07070d] border-b border-white/[0.03] transition-all duration-300">

      <!-- Animated Grid Background -->
      <div class="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.03]">
        <div class="absolute inset-0"
          style="background-image: linear-gradient(rgba(255,255,255,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.2) 1px, transparent 1px); background-size: 60px 60px;">
        </div>
      </div>

      <!-- Sweeping Glow Border -->
      <div class="absolute bottom-0 left-0 w-full h-[2px] overflow-hidden">
        <div class="absolute inset-0 bg-gradient-to-r from-transparent via-orange-500/20 to-transparent"></div>
        <div class="absolute inset-0 w-[60%] h-full bg-gradient-to-r from-transparent via-orange-500/70 to-transparent animate-sweep-glow"
          style="filter: blur(1px);"></div>
      </div>

      <div class="flex justify-between items-center h-20 px-6 md:px-16 w-full max-w-screen-2xl mx-auto relative">

        <!-- Logo Section -->
        <div class="flex items-center gap-3 relative">
          <!-- SSL Badge (Cyberpunk Style) -->
          <div
            class="hidden sm:flex items-center gap-1.5 px-0.5 py-1.5 ml-4 rounded-lg border border-orange-500/15 bg-gradient-to-br from-orange-500/[0.04] to-rose-500/[0.04] hover:from-orange-500/[0.1] hover:to-rose-500/[0.1] hover:shadow-[0_0_24px_rgba(255,107,53,0.2)] transition-all duration-500 group relative overflow-hidden">
            <!-- Scanline Effect on hover -->
            <div
              class="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700">
            </div>
            <span class="material-symbols-outlined text-orange-400/80 group-hover:text-orange-300 relative z-10" style="font-size:18px">verified</span>
            <span class="text-[11px] font-black uppercase tracking-[0.2em] text-orange-500/60 group-hover:text-orange-400/80 relative z-10">SECURE</span>
            <span class="w-1.5 h-1.5 rounded-full bg-green-400/60 animate-pulse relative z-10"></span>
          </div>

          <RouterLink :to="{ name: 'home' }" class="flex items-center gap-2 group cursor-pointer z-50">
            <!-- Logo with glow -->
            <div class="relative">
              <div
                class="absolute -inset-2 bg-orange-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-60 transition-opacity duration-500">
              </div>
              <img :src="UbiquemeLogo" alt="Ubiqueme Logo"
                class="w-10 h-10 sm:w-12 sm:h-12 object-contain relative z-10" />
            </div>
            <!-- Desktop: domains side by side -->
            <div class="hidden lg:flex flex-col min-w-[140px] sm:min-w-[200px]">
              <div class="relative h-9 sm:h-10 overflow-hidden flex items-center">
                <Transition name="glitch">
                  <div :key="currentDomainIndex"
                    class="absolute left-0 flex items-baseline text-[#dce7ff] font-black tracking-tighter text-[15px] sm:text-[22px] lowercase leading-none whitespace-nowrap">
                    <span>{{ domains[currentDomainIndex]?.split('.com')[0] }}</span>
                    <span class="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-rose-500">.com</span>
                  </div>
                </Transition>
              </div>
              <div class="relative h-4 sm:h-5 overflow-hidden flex items-center">
                <Transition name="slide-up">
                  <div :key="currentTaglineIndex"
                    class="absolute left-0 text-[9px]! sm:text-[10px] text-white/25 font-medium tracking-wider whitespace-nowrap font-google-sans"
                    style="font-variation-settings: normal">
                    <template v-if="taglines[currentTaglineIndex]!.clickable">
                      por <span @click.stop="openAziechrie"
                        class="font-semibold bg-gradient-to-r from-orange-400/70 to-rose-400/70 bg-clip-text text-transparent hover:from-orange-400 hover:to-rose-400 transition-all duration-300 cursor-pointer">AZIECHRIE
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

        <!-- Mobile: domains centered -->
        <div class="lg:hidden flex-1 flex justify-center min-w-0">
          <RouterLink :to="{ name: 'home' }" class="flex flex-col items-center w-full max-w-fit">
            <div class="relative h-8 w-full overflow-hidden flex items-center justify-center">
              <Transition name="glitch">
                <div :key="currentDomainIndex"
                  class="absolute left-0 right-0 flex justify-center items-baseline text-[#dce7ff] font-black tracking-tighter text-[16px] lowercase leading-none whitespace-nowrap">
                  <span>{{ domains[currentDomainIndex]?.split('.com')[0] }}</span>
                  <span class="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-rose-500">.com</span>
                </div>
              </Transition>
            </div>
            <div class="relative h-3.5 w-full overflow-hidden flex items-center justify-center">
              <Transition name="slide-up">
                <div :key="currentTaglineIndex"
                  class="absolute left-0 right-0 flex justify-center text-[8px] text-white/25 font-medium tracking-wider whitespace-nowrap font-google-sans"
                  style="font-variation-settings: normal">
                  <template v-if="taglines[currentTaglineIndex]!.clickable">
                    por <span @click.stop="openAziechrie"
                      class="font-semibold bg-gradient-to-r from-orange-400/70 to-rose-400/70 bg-clip-text text-transparent hover:from-orange-400 hover:to-rose-400 transition-all duration-300 cursor-pointer">AZIECHRIE
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

        <!-- Nav Menu (Desktop) -->
        <div class="hidden lg:flex items-center space-x-1 tracking-tight">
          <RouterLink v-for="link in navLinks" :key="link.name" :to="{ name: link.pathName }"
            class="group relative flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 overflow-hidden">
            <!-- Glass background -->
            <div
              class="absolute inset-0 bg-white/[0.02] rounded-xl opacity-0 group-hover:opacity-100 active-glass transition-opacity duration-300 border border-white/[0.03] group-hover:border-orange-500/20 active-border">
            </div>
            <!-- Glow on hover -->
            <div
              class="absolute -inset-2 bg-gradient-to-r from-orange-500/10 to-rose-500/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            </div>
            <!-- Content -->
            <span
              class="material-symbols-outlined text-[20px] relative z-10 text-white/30 group-hover:text-orange-400 active-icon transition-all duration-300">
              {{ link.icon }}
            </span>
            <span
              class="text-[11px] font-black uppercase tracking-widest relative z-10 text-white/30 group-hover:text-white/80 active-text transition-colors duration-300">
              {{ link.name }}
            </span>
          </RouterLink>
        </div>

        <!-- Opciones de Usuario Autenticado (Desktop) -->
        <div class="hidden lg:flex items-center space-x-4 z-50">
          <RouterLink v-if="$route.name !== 'dashboard'" :to="{ name: 'dashboard' }"
            class="relative bg-white/[0.03] border border-white/[0.06] text-white px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-gradient-to-r hover:from-orange-500/20 hover:to-rose-500/20 hover:border-orange-500/30 transition-all duration-300 cursor-pointer flex items-center gap-2 group overflow-hidden">
            <div
              class="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700">
            </div>
            <span class="material-symbols-outlined text-sm relative z-10">dashboard</span>
            <span class="relative z-10">Dashboard</span>
          </RouterLink>

          <button @click="handleLogout"
            class="relative bg-gradient-to-r from-rose-600 to-red-600 text-white px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest hover:from-rose-500 hover:to-red-500 transition-all duration-300 active:scale-95 cursor-pointer overflow-hidden group shadow-[0_10px_30px_rgba(225,29,72,0.15)]">
            <!-- Shine effect -->
            <div
              class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700">
            </div>
            <!-- Outer glow -->
            <div
              class="absolute -inset-1 bg-gradient-to-r from-rose-500/30 to-red-500/30 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            </div>
            <span class="material-symbols-outlined text-sm relative z-10">logout</span>
            <span class="relative z-10">Salir</span>
          </button>
        </div>

        <!-- Hamburger Button (Mobile) -->
        <button @click="isMobileMenuOpen = !isMobileMenuOpen"
          class="lg:hidden flex items-center justify-center p-2 text-white/50 hover:text-orange-400 transition-colors z-50 cursor-pointer group">
          <span class="material-symbols-outlined text-[28px] transition-transform duration-300"
            :class="{ 'rotate-90': isMobileMenuOpen }">
            {{ isMobileMenuOpen ? 'close' : 'menu' }}
          </span>
        </button>

      </div>

      <!-- Mobile Menu Overlay (Cyberpunk Glass) -->
      <Transition name="fade-slide">
        <div v-if="isMobileMenuOpen"
          class="fixed top-20 left-0 w-full h-[calc(100vh-80px)] bg-gradient-to-b from-[#07070d]/98 to-[#0a0a16]/98 backdrop-blur-2xl z-40 border-t border-white/[0.03] flex flex-col justify-between p-8 lg:hidden relative overflow-hidden">
          <!-- Grid background -->
          <div class="absolute inset-0 pointer-events-none opacity-[0.02]"
            style="background-image: linear-gradient(rgba(255,255,255,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.2) 1px, transparent 1px); background-size: 40px 40px;">
          </div>
          <!-- Gradient overlay -->
          <div class="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-500/30 to-transparent">
          </div>

          <!-- Links -->
          <div class="flex flex-col space-y-3 relative z-10">
            <RouterLink v-for="link in navLinks" :key="link.name" :to="{ name: link.pathName }"
              @click="isMobileMenuOpen = false"
              class="group flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 bg-white/[0.02] hover:bg-gradient-to-r hover:from-orange-500/[0.08] hover:to-rose-500/[0.08] border border-white/[0.03] hover:border-orange-500/20">
              <span
                class="material-symbols-outlined text-[22px] text-white/30 group-hover:text-orange-400 transition-colors duration-300">{{ link.icon }}</span>
              <span class="text-xs font-black uppercase tracking-widest text-white/50 group-hover:text-white/90 transition-colors duration-300">{{ link.name }}</span>
              <span class="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span class="material-symbols-outlined text-orange-400/50 text-sm">chevron_right</span>
              </span>
            </RouterLink>
          </div>

          <!-- Actions -->
          <div class="flex flex-col gap-4 mt-auto relative z-10">
            <RouterLink v-if="$route.name !== 'dashboard'" :to="{ name: 'dashboard' }"
              @click="isMobileMenuOpen = false"
              class="w-full flex items-center justify-center bg-white/[0.03] border border-white/[0.06] hover:border-orange-500/30 hover:bg-gradient-to-r hover:from-orange-500/20 hover:to-rose-500/20 text-white py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all duration-300 cursor-pointer gap-2 relative overflow-hidden group">
              <div
                class="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700">
              </div>
              <span class="material-symbols-outlined text-sm relative z-10">dashboard</span>
              <span class="relative z-10">Ir al Dashboard</span>
            </RouterLink>

            <button @click="handleLogout; isMobileMenuOpen = false"
              class="w-full flex items-center justify-center bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all duration-300 active:scale-[0.98] cursor-pointer relative overflow-hidden group shadow-[0_10px_30px_rgba(225,29,72,0.15)]">
              <div
                class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700">
              </div>
              <span class="material-symbols-outlined text-sm relative z-10">logout</span>
              <span class="relative z-10">Cerrar sesión</span>
            </button>
          </div>
        </div>
      </Transition>
    </nav>

    <!-- Main -->
    <main class="scrollbar-hide">
      <slot name="main"></slot>
    </main>

  </div>
</template>

<style scoped>
.material-symbols-outlined {
  font-variation-settings: 'FILL' 1, 'wght' 600, 'GRAD' 0, 'opsz' 24;
}

/* ── Sweeping Glow Animation ── */
@keyframes sweep-glow {
  0% { transform: translateX(-100%); }
  50% { transform: translateX(100%); }
  100% { transform: translateX(200%); }
}
.animate-sweep-glow {
  animation: sweep-glow 4s ease-in-out infinite;
}

/* ── Slide Up Transitions (Tagline) ── */
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

/* ── Glitch Transition (Domain) ── */
.glitch-enter-active {
  animation: glitch-in 0.45s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
.glitch-leave-active {
  animation: glitch-out 0.3s cubic-bezier(0.55, 0, 1, 0.45) forwards;
}
@keyframes glitch-in {
  0% {
    opacity: 0;
    clip-path: inset(40% 0 60% 0);
    transform: translateX(-10px) skewX(-5deg);
  }
  20% {
    clip-path: inset(20% 0 80% 0);
    transform: translateX(5px) skewX(3deg);
  }
  40% {
    clip-path: inset(60% 0 40% 0);
    transform: translateX(-3px) skewX(-2deg);
  }
  60% {
    clip-path: inset(10% 0 30% 0);
    transform: translateX(2px) skewX(1deg);
  }
  100% {
    opacity: 1;
    clip-path: inset(0 0 0 0);
    transform: translateX(0) skewX(0);
  }
}
@keyframes glitch-out {
  0% {
    opacity: 1;
    clip-path: inset(0 0 0 0);
    transform: translateX(0) skewX(0);
  }
  100% {
    opacity: 0;
    clip-path: inset(80% 0 20% 0);
    transform: translateX(10px) skewX(5deg);
  }
}

/* ── Router Link Active States ── */
:deep(.router-link-active) .active-glass {
  opacity: 1 !important;
}
:deep(.router-link-active) .active-border {
  border-color: rgba(249, 115, 22, 0.2) !important;
}
:deep(.router-link-active) .active-icon {
  color: rgb(251, 146, 60) !important;
}
:deep(.router-link-active) .active-text {
  color: rgba(255, 255, 255, 0.8) !important;
}

/* ── Fade Slide (Mobile Menu) ── */
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

/* ── Scrollbar Hide ── */
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
