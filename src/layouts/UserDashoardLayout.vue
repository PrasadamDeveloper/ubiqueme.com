<script lang="ts" setup>
import { onMounted, onUnmounted, ref } from 'vue';
import { RouterLink } from 'vue-router'
import { useAuth } from '@/handleAuth'

const { handleLogout } = useAuth()

const navLinks = [
  { name: 'Inicio', pathName: 'home', icon: 'home' },
  { name: 'Ayuda', pathName: 'help', icon: 'help' },
  { name: 'Precios', pathName: 'pricing', icon: 'payments' },
]

const domains = ['ubiqueme.com', 'contactomio.com', 'localizarme.com'];
const currentDomainIndex = ref(0);
const isMobileMenuOpen = ref(false);
const showCompactBadge = ref(false);
let intervalId: any;

onMounted(() => {
  // Compact SSL badge after 4s
  setTimeout(() => {
    showCompactBadge.value = true;
  }, 4000);

  intervalId = setInterval(() => {
    currentDomainIndex.value = (currentDomainIndex.value + 1) % domains.length;
  }, 5000);
});

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId);
});
</script>

<template>
  <div class="font-google-sans">
    <!-- TopNavBar -->
    <nav class="fixed top-0 w-full z-50 bg-white border-b border-gray-200 shadow-[0_4px_40px_rgba(0,0,0,0.08)] transition-all duration-300">

      <!-- Subtle Orange Top Line -->
      <div
        class="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-orange-500/40 to-transparent">
      </div>

      <div class="flex justify-between items-center h-20 px-6 md:px-16 w-full max-w-screen-2xl mx-auto">

        <!-- Logo con animación (Match Home) -->
        <div class="flex items-center gap-3">
          <!-- SSL Badge (animated: expandido -> compacto tras 4s) -->
          <div
            class="group/badge relative flex items-center gap-1.5 rounded-lg border border-orange-500/20 bg-orange-500/[0.06] active:scale-[0.97] transition-all duration-300 cursor-default"
            :class="showCompactBadge ? 'px-2 py-1' : 'px-2.5 py-1.5'">
            <!-- Pulse ring (solo mientras expandido) -->
            <Transition name="fade">
              <span v-if="!showCompactBadge"
                class="absolute inset-0 rounded-lg animate-pulse-ring-orange pointer-events-none"></span>
            </Transition>

            <!-- Icono: lock mientras expandido, shield en compacto -->
            <Transition name="fade" mode="out-in">
              <span :key="showCompactBadge ? 'shield' : 'lock'"
                class="material-symbols-outlined notranslate relative z-[1]"
                :class="showCompactBadge ? 'text-orange-500/50' : 'text-orange-400'" style="font-size:16px">{{
                  showCompactBadge ? 'shield' : 'lock' }}</span>
            </Transition>

            <!-- Texto: "Conexión segura" expandido, "SSL" compacto -->
            <Transition name="fade" mode="out-in">
              <span :key="showCompactBadge ? 'ssl' : 'conexion'"
                class="relative z-[1] font-black   transition-colors duration-300"
                :class="showCompactBadge ? 'text-[9px]  text-orange-500/40' : 'text-[10px] sm:text-[11px]  text-orange-500/80'">{{
                  showCompactBadge ? 'SSL' : 'Conexión segura' }}</span>
            </Transition>

            <!-- Tooltip (hover en cualquier estado) -->
            <div
              class="absolute -bottom-2 left-1/2 -translate-x-1/2 translate-y-full opacity-0 group-hover/badge:opacity-100 pointer-events-none transition-all duration-300 z-50 w-max max-w-[220px]">
              <div class="bg-[#1a1a1a] border border-white/10 rounded-xl px-3 py-2 shadow-2xl">
                <p class="text-[10px] leading-relaxed text-white/70">
                  <span class="text-orange-400 font-bold">🔒 SSL 256-bit</span><br>
                  Su información viaja cifrada y protegida.
                </p>
              </div>
            </div>
          </div>
          <RouterLink :to="{ name: 'home' }" class="flex items-center gap-2 group cursor-pointer z-50">
            <span
              class="material-symbols-outlined notranslate text-orange-500 text-[2.5rem] group-hover:rotate-12 transition-transform">location_on</span>
            <div class="flex flex-col justify-center h-10 overflow-hidden relative min-w-[155px] sm:min-w-[220px]">
              <Transition name="slide-up">
                <div :key="currentDomainIndex"
                  class="absolute left-0 flex items-baseline text-slate-900 font-black tracking-tighter text-[17px] sm:text-[22px] lowercase leading-none whitespace-nowrap">
                  <span translate="no">{{ domains[currentDomainIndex]?.split('.com')[0] }}</span>
                  <span class="text-orange-500">.com</span>
                </div>
              </Transition>
            </div>
          </RouterLink>
        </div>

        <!-- Menu -->
        <div class="hidden lg:flex items-center space-x-2 tracking-tight">
          <RouterLink v-for="link in navLinks" :key="link.name" :to="{ name: link.pathName }"
            class="flex items-center gap-2 text-gray-600 hover:bg-orange-50 hover:text-orange-500 px-4 py-2 rounded-xl transition-all duration-300 group relative">
            <span
              class="material-symbols-outlined notranslate text-[20px] group-hover:scale-110 transition-transform">{{
                link.icon
              }}</span>
            <span class="text-[11px] font-black uppercase tracking-widest">{{ link.name }}</span>

            <!-- Indicator Line -->
            <div
              class="absolute bottom-0 left-4 right-4 h-[2px] bg-orange-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-center">
            </div>
          </RouterLink>
        </div>

        <!-- Opciones de Usuario Autenticado (Desktop Only) -->
        <div class="hidden lg:flex items-center space-x-4 z-50">
          <RouterLink v-if="$route.name !== 'dashboard'" :to="{ name: 'dashboard' }"
            class="border border-gray-200 bg-white text-gray-700 px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest hover:border-orange-300 hover:bg-orange-50 hover:text-orange-600 transition-all duration-300 cursor-pointer flex items-center gap-2">
            <span class="material-symbols-outlined notranslate text-sm">dashboard</span>
            Ir al Dashboard del usuario
          </RouterLink>
          <button @click="handleLogout"
            class="border border-gray-200 bg-white text-gray-700 px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest hover:border-orange-300 hover:bg-orange-50 hover:text-orange-600 transition-all duration-300 cursor-pointer flex items-center gap-2">
            <span class="material-symbols-outlined notranslate text-sm">logout</span>
            Cerrar sesión
          </button>
        </div>

        <!-- Hamburger Button (Mobile Only) -->
        <button @click="isMobileMenuOpen = !isMobileMenuOpen"
          class="lg:hidden flex items-center justify-center p-2 text-gray-600 hover:text-orange-500 transition-colors z-50 cursor-pointer">
          <span class="material-symbols-outlined notranslate text-[28px]">{{ isMobileMenuOpen ? 'close' : 'menu'
          }}</span>
        </button>

      </div>

      <!-- Mobile Menu Overlay -->
      <Transition name="fade-slide">
        <div v-if="isMobileMenuOpen"
          class="fixed top-20 left-0 w-full h-[calc(100vh-80px)] bg-white border-t border-gray-200 z-40 flex flex-col justify-between p-8 lg:hidden">
          <!-- Links -->
          <div class="flex flex-col space-y-4">
            <RouterLink v-for="link in navLinks" :key="link.name" :to="{ name: link.pathName }"
              @click="isMobileMenuOpen = false"
              class="flex items-center gap-3 text-gray-600 hover:text-orange-500 py-3.5 border-b border-gray-100 transition-all duration-300">
              <span class="material-symbols-outlined notranslate text-[22px]">{{ link.icon }}</span>
              <span class="text-xs font-black uppercase tracking-widest">{{ link.name }}</span>
            </RouterLink>
          </div>

          <!-- Actions -->
          <div class="flex flex-col gap-4 mt-auto">
            <button @click="handleLogout; isMobileMenuOpen = false"
              class="w-full flex items-center justify-center border border-gray-200 bg-gray-50 text-gray-700 hover:border-orange-300 hover:bg-orange-50 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all duration-300 cursor-pointer gap-2">
              <span class="material-symbols-outlined notranslate text-sm">logout</span>
              Salir del Panel
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
.font-google-sans {
  font-family: 'Google Sans', sans-serif;
}

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

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

/* Pulse ring animation for SSL badge */
@keyframes pulse-ring-orange {
  0% {
    box-shadow: 0 0 0 0 rgba(249, 115, 22, 0.4);
  }

  70% {
    box-shadow: 0 0 0 8px rgba(249, 115, 22, 0);
  }

  100% {
    box-shadow: 0 0 0 0 rgba(249, 115, 22, 0);
  }
}

.animate-pulse-ring-orange {
  animation: pulse-ring-orange 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* Fade transition for badge state change */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .animate-pulse-ring-orange {
    animation: none;
  }
}
</style>
