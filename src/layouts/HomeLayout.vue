<script lang="ts" setup>
import { useUserStore } from '@/stores/user';
import { RouterLink } from 'vue-router'

import { onMounted, onUnmounted, ref } from 'vue';

const switchLanguage = (lang: string) => {
  document.cookie = `googtrans=/es/${lang}; path=/; max-age=31536000`;
  window.location.reload();
}

const currentLang = ref('es')

const languages = [
  { code: 'es', label: 'Español' },
  { code: 'en', label: 'English' },
  { code: 'pt', label: 'Português' },
]

const openAziechrie = () => window.open('https://www.aziechriepharma.com', '_blank');
const isScrolled = ref(false);

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
const showCompactBadge = ref(false);
let intervalId: ReturnType<typeof setInterval> | undefined;

onMounted(() => {
  // Detect current language from GTranslate cookie
  const match = document.cookie.match(/googtrans=\/es\/(\w+)/)
  if (match?.[1]) currentLang.value = match[1]

  intervalId = setInterval(() => {
    currentDomainIndex.value = (currentDomainIndex.value + 1) % domains.length;
    currentTaglineIndex.value = (currentTaglineIndex.value + 1) % taglines.length;
  }, 5000);

  // Compact SSL badge after 4s
  setTimeout(() => {
    showCompactBadge.value = true;
  }, 4000);

  // Track scroll position for glassmorphism nav
  const handleScroll = () => {
    isScrolled.value = window.scrollY > 20;
  };
  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();
});

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId);
});
</script>

<template>
  <div class="font-google-sans">
    <!-- Skip to main content (accessibility) -->
    <a href="#main-content"
      class="fixed -top-10 left-4 z-[100] bg-orange-500 text-[#09090b] px-4 py-2 text-[11px] font-black uppercase tracking-widest rounded-b-lg transition-all duration-300 focus-visible:top-0 focus-visible:outline-none">
      Saltar al contenido
    </a>

    <!-- TopNavBar -->
    <nav :class="[
      'fixed top-0 w-full z-50 transition-all duration-500',
      isScrolled
        ? 'bg-[#09090b]/95 border-b border-white/5 shadow-[0_4px_40px_rgba(0,0,0,0.3)]'
        : 'bg-[#09090b] border-b border-white/5'
    ]">

      <!-- Subtle Orange Top Line -->
      <div
        class="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-orange-500/40 to-transparent">
      </div>

      <div class="flex justify-between items-center h-20 px-6 md:px-16 w-full max-w-screen-2xl mx-auto relative">

        <!-- Logo -->
        <div class="flex items-center gap-3 relative">
          <!-- SSL Badge (animated: expandido -> compacto tras 4s) -->
          <div
            class="group/badge relative flex items-center gap-1.5 ml-4 rounded-lg border border-orange-500/20 bg-orange-500/[0.06] active:scale-[0.97] cursor-default"
            :class="showCompactBadge ? 'px-2 py-1' : 'px-2.5 py-1.5'"
            :style="{ transition: 'all 0.45s cubic-bezier(0.4, 0, 0.2, 1)' }">
            <!-- Pulse ring (solo mientras expandido) -->
            <Transition name="fade">
              <span v-if="!showCompactBadge"
                class="absolute inset-0 rounded-lg animate-pulse-ring-orange pointer-events-none"></span>
            </Transition>

            <!-- Icono: cross-fade lock -> shield -->
            <div class="relative w-4 h-4 flex items-center justify-center shrink-0">
              <Transition name="fade">
                <span v-if="!showCompactBadge" key="lock"
                  class="material-symbols-outlined notranslate absolute inset-0 flex items-center justify-center text-orange-400 z-[1]"
                  style="font-size:16px">lock</span>
              </Transition>
              <Transition name="fade">
                <span v-if="showCompactBadge" key="shield"
                  class="material-symbols-outlined notranslate absolute inset-0 flex items-center justify-center text-orange-500/50 z-[1]"
                  style="font-size:16px">shield</span>
              </Transition>
            </div>

            <!-- Texto: cross-fade "Conexión segura" -> "SSL" -->
            <div class="relative flex items-center"
              :style="{ minWidth: showCompactBadge ? '20px' : '105px', transition: 'min-width 0.45s cubic-bezier(0.4, 0, 0.2, 1)' }">
              <Transition name="fade">
                <span v-if="!showCompactBadge" key="conexion"
                  class="absolute left-0 font-black whitespace-nowrap text-[10px] sm:text-[11px] text-orange-500/80 z-[1]">Conexión
                  segura</span>
              </Transition>
              <Transition name="fade">
                <span v-if="showCompactBadge" key="ssl"
                  class="absolute left-0 font-black whitespace-nowrap text-[9px] tracking-[0.15em] text-orange-500/40 z-[1]">SSL</span>
              </Transition>
            </div>

            <!-- Tooltip (hover en cualquier estado) -->
            <div
              class="absolute -bottom-2 left-1/2 -translate-x-1/2 translate-y-full opacity-0 group-hover/badge:opacity-100 pointer-events-none transition-all duration-300 z-50 w-max max-w-[220px]">
              <div class="bg-[#1a1a1a] border border-white/10 rounded-xl px-3 py-2 shadow-lg">
                <p class="text-[10px] leading-relaxed text-white/70">
                  <span class="text-orange-400 font-bold">🔒 SSL 256-bit</span><br>
                  Tu información viaja cifrada y protegida.
                </p>
              </div>
            </div>
          </div>
          <RouterLink :to="{ name: 'home' }"
            class="flex items-center gap-2 group cursor-pointer z-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white rounded-lg">
            <span
              class="material-symbols-outlined notranslate text-orange-500 text-[2rem] sm:text-[2.5rem] group-hover:rotate-12 transition-transform hidden sm:block">location_on</span>
            <!-- Desktop: domains side by side -->
            <div class="hidden lg:flex flex-col min-w-[140px] sm:min-w-[200px]">
              <div class="relative h-9 sm:h-10 overflow-hidden flex items-center">
                <Transition name="slide-up">
                  <div :key="currentDomainIndex"
                    class="absolute left-0 flex items-baseline text-[#dce7ff] font-black tracking-tighter text-[15px] sm:text-[22px] lowercase leading-none whitespace-nowrap">
                    <span translate="no">{{ domains[currentDomainIndex]?.split('.com')[0] }}</span>
                    <span class="text-orange-500">.com</span>
                  </div>
                </Transition>
              </div>
              <div class="relative h-4 sm:h-5 overflow-hidden flex items-center">
                <Transition name="slide-up">
                  <div :key="currentTaglineIndex"
                    class="absolute left-0 text-[9px]! sm:text-[10px] text-gray-400 font-medium tracking-wider whitespace-nowrap font-google-sans"
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

        <!-- Mobile: domains like dashboard (no logo, no tagline) -->
        <div v-show="showCompactBadge"
          class="lg:hidden flex-1 flex justify-start mx-auto  md:justify-center min-w-0 absolute top-1/2 translate-x-1/2 translate-y-1/2 bottom-1/2 right-1/2 sm:fixed animate-fade">
          <RouterLink :to="{ name: 'home' }" class="flex items-center gap-2 group cursor-pointer z-50">
            <span
              class="material-symbols-outlined notranslate text-orange-500 text-[2rem] group-hover:rotate-12 transition-transform">location_on</span>
            <div class="flex flex-col justify-center h-8 overflow-hidden relative min-w-[130px]">
              <Transition name="slide-up">
                <div :key="currentDomainIndex"
                  class="absolute left-0 flex items-baseline text-[#dce7ff] font-black tracking-tighter text-[16px] lowercase leading-none whitespace-nowrap">
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
            :class="{ 'hidden': !useUserStore().getUserId && link.requiredLogin }"
            class="flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 group relative"
            :style="{ color: $route.name === link.pathName ? '#f97316' : 'rgba(107,114,128,1)' }"
            @mouseenter="($event.target as HTMLElement).style.color = '#f97316'"
            @mouseleave="($event.target as HTMLElement).style.color = $route.name === link.pathName ? '#f97316' : 'rgba(107,114,128,1)'">
            <span
              class="material-symbols-outlined notranslate text-[20px] group-hover:scale-110 transition-transform">{{
                link.icon
              }}</span>
            <span class="text-[11px] font-black uppercase tracking-widest">{{ link.name }}</span>

            <!-- Indicator Line (always visible on active route) -->
            <div :class="[
              'absolute bottom-0 left-4 right-4 h-[2px] bg-orange-500 transition-transform origin-center duration-300',
              $route.name === link.pathName ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
            ]">
            </div>
          </RouterLink>
        </div>

        <!-- Buttons (Desktop Only) -->
        <div class="hidden lg:flex items-center space-x-4 z-50">
          <template v-if="!useUserStore().getUserId">
            <RouterLink :to="{ name: 'login' }"
              class="text-white/60 hover:text-orange-400 transition-colors duration-300 text-[11px] font-black uppercase tracking-widest px-4 py-2 cursor-pointer">
              Iniciar sesión
            </RouterLink>

            <RouterLink :to="{ name: 'register' }"
              class="bg-orange-500 text-white px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-orange-600 transition-all duration-300 active:scale-95 shadow-[0_10px_20px_rgba(249,115,22,0.15)] cursor-pointer">
              Registrarse
            </RouterLink>
          </template>
          <template v-else>
            <RouterLink :to="{ name: 'dashboard' }"
              class="bg-white/5 border border-white/10 text-white/80 px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-orange-500 hover:text-black hover:border-orange-500 transition-all duration-300 cursor-pointer flex items-center gap-2">
              <span class="material-symbols-outlined notranslate text-sm">dashboard</span>
              Panel
            </RouterLink>
          </template>
        </div>

        <!-- Hamburger Button (Mobile Only) -->
        <button @click="isMobileMenuOpen = !isMobileMenuOpen"
          class="lg:hidden flex items-center justify-center p-2 bg-orange-500 text-white font-bold hover:bg-orange-600 transition-colors z-50 cursor-pointer rounded-xl">
          <span class="material-symbols-outlined notranslate text-[28px]">{{ isMobileMenuOpen ? 'close' : 'menu'
          }}</span>
          <span>{{ isMobileMenuOpen ? 'Cerrar' : 'Menú' }}</span>
        </button>

      </div>

      <!-- Mobile Menu Overlay (Dark) -->
      <Transition name="mobile-menu">
        <div v-if="isMobileMenuOpen"
          class="fixed top-20 left-0 w-full h-[calc(100dvh-80px)] bg-[#09090b]/95 backdrop-blur-xl z-40 border-t border-white/5 flex flex-col lg:hidden overflow-y-auto">
          <!-- Header -->
          <div class="flex items-center gap-3 px-6 pt-6 pb-4">
            <span class="material-symbols-outlined notranslate text-white/60 text-[28px]">menu</span>
            <span class="text-white text-lg font-bold">Menú</span>
          </div>

          <!-- Auth section (non-logged-in) -->
          <template v-if="!useUserStore().getUserId">
            <div class="px-4 space-y-2 pb-4">
              <!-- Registrarse: prominent CTA -->
              <RouterLink :to="{ name: 'register' }" @click="isMobileMenuOpen = false"
                class="flex items-center justify-center gap-2 w-full bg-orange-500 text-black py-4 rounded-2xl text-[13px] font-black uppercase tracking-widest transition-all duration-200 active:scale-[0.98] shadow-[0_10px_20px_rgba(249,115,22,0.15)] cursor-pointer">
                <span class="material-symbols-outlined notranslate text-[18px]">person_add</span>
                Registrarse
              </RouterLink>
              <!-- Iniciar sesión -->
              <RouterLink :to="{ name: 'login' }" @click="isMobileMenuOpen = false"
                class="flex items-center justify-center gap-2 w-full py-4 rounded-2xl text-[13px] font-black uppercase tracking-widest transition-all duration-200 active:scale-[0.98] text-white/50 hover:text-white hover:bg-white/10 cursor-pointer">
                <span class="material-symbols-outlined notranslate text-[18px]">login</span>
                Iniciar sesión
              </RouterLink>
            </div>
            <!-- Divider -->
            <div class="mx-6 border-t border-white/5 mb-2"></div>
          </template>

          <!-- Language selector (inline, dark) -->
          <div class="px-4 mb-2 mt-4">
            <div class="flex items-center gap-3 px-4 py-3 rounded-2xl border border-white/5 bg-white/[0.03]">
              <span class="material-symbols-outlined notranslate text-[22px] text-white/40">language</span>
              <span class="text-[13px] font-bold tracking-wider text-white/60">Idioma</span>
              <div class="ml-auto flex items-center gap-1">
                <button v-for="lang in languages" :key="lang.code" @click="switchLanguage(lang.code)"
                  class="px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all"
                  :class="currentLang === lang.code ? 'bg-orange-500 text-white' : 'text-white/40 hover:text-white/70 hover:bg-white/10'">
                  {{ lang.code }}
                </button>
              </div>
            </div>
          </div>

          <!-- Nav links -->
          <div class="flex-1 px-4 space-y-1">
            <RouterLink v-for="(link, index) in navLinks" :key="link.name" :to="{ name: link.pathName }"
              @click="isMobileMenuOpen = false" :style="{ transitionDelay: `${index * 60}ms` }" :class="[
                { 'hidden': !useUserStore().getUserId && link.requiredLogin },
                'flex items-center gap-3 px-4 py-4 rounded-2xl transition-all duration-200 active:scale-[0.98] cursor-pointer min-h-[50px]',
                $route.name === link.pathName
                  ? 'text-orange-500 bg-orange-500/10 border border-orange-500/20'
                  : 'text-white/60 hover:text-orange-400 hover:bg-white/5 border border-transparent'
              ]">
              <span class="material-symbols-outlined notranslate text-[22px]">{{ link.icon }}</span>
              <span class="text-[13px] font-bold tracking-wider">{{ link.name }}</span>
              <!-- Active indicator -->
              <div v-if="$route.name === link.pathName" class="ml-auto w-1.5 h-1.5 rounded-full bg-orange-500">
              </div>
            </RouterLink>
          </div>

          <!-- Dashboard button (logged-in only) -->
          <div v-if="useUserStore().getUserId" class="px-4 pt-2 pb-8">
            <RouterLink :to="{ name: 'dashboard' }" @click="isMobileMenuOpen = false"
              class="flex items-center justify-center gap-2 w-full py-4 rounded-2xl text-[13px] font-black uppercase tracking-widest transition-all duration-200 active:scale-[0.98] bg-white/5 border border-white/10 text-white/80 hover:bg-orange-500 hover:text-black hover:border-orange-500 cursor-pointer">
              <span class="material-symbols-outlined notranslate text-[18px]">dashboard</span>
              Mis Códigos QR
            </RouterLink>
          </div>
        </div>
      </Transition>
    </nav>

    <main id="main-content">
      <slot name="main"></slot>
    </main>
    <footer class="relative overflow-hidden border-t border-zinc-800 bg-gradient-to-b from-[#0b0b0d] to-black">

      <!-- Glow -->
      <div class="absolute left-1/2 top-0 h-64 w-64 -translate-x-1/2 rounded-full bg-orange-500/5 blur-3xl">
      </div>

      <div class="relative mx-auto max-w-7xl px-6 py-10 sm:px-8 lg:px-12">

        <div class="grid gap-10 lg:grid-cols-3">

          <!-- Marca -->
          <div class="flex flex-col items-center lg:items-start text-center lg:text-left">

            <div
              class="mb-5 flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/5 px-4 py-2">

              <span class="material-symbols-outlined notranslate text-orange-400">
                shield
              </span>

              <span class="text-xs uppercase tracking-[0.25em] text-zinc-300">
                SSL
              </span>

            </div>

            <Transition name="slide-up">
              <div :key="currentDomainIndex" class="mb-3 text-3xl font-black lowercase tracking-tight">

                <span class="text-white">
                  {{ domains[currentDomainIndex]?.split('.com')[0] }}
                </span>

                <span class="text-orange-500">
                  .com
                </span>

              </div>
            </Transition>

            <p class="text-sm text-zinc-500">
              © {{ new Date().getFullYear() }} ubiqueme.com
            </p>

            <p class="mt-1 text-[10px] uppercase tracking-[0.25em] text-zinc-600">

              Una marca de

              <span class="font-semibold text-orange-400">
                AZIECHRIE PHARMA
              </span>

            </p>

          </div>

          <!-- Navegación -->
          <div class="flex flex-col items-center">

            <h3 class="mb-5 text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">

              Navegación

            </h3>

            <div class="grid grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-3">

              <RouterLink :to="{ name: 'home' }"
                class="group flex items-center gap-2 text-sm text-zinc-400 transition hover:text-orange-400">

                <span class="material-symbols-outlined text-[18px]">
                  home
                </span>

                Inicio

              </RouterLink>

              <RouterLink :to="{ name: 'help' }"
                class="group flex items-center gap-2 text-sm text-zinc-400 transition hover:text-orange-400">

                <span class="material-symbols-outlined text-[18px]">
                  help
                </span>

                Ayuda

              </RouterLink>

              <RouterLink :to="{ name: 'pricing' }"
                class="group flex items-center gap-2 text-sm text-zinc-400 transition hover:text-orange-400">

                <span class="material-symbols-outlined text-[18px]">
                  attach_money
                </span>

                Precios

              </RouterLink>

              <template v-if="!useUserStore().getUserId">

                <RouterLink :to="{ name: 'login' }"
                  class="group flex items-center gap-2 text-sm text-zinc-400 transition hover:text-orange-400">

                  <span class="material-symbols-outlined text-[18px]">
                    login
                  </span>

                  Iniciar sesión

                </RouterLink>

                <RouterLink :to="{ name: 'register' }"
                  class="group flex items-center gap-2 text-sm text-zinc-400 transition hover:text-orange-400">

                  <span class="material-symbols-outlined text-[18px]">
                    person_add
                  </span>

                  Registrarse

                </RouterLink>

              </template>

            </div>

          </div>

          <!-- Legal -->
          <div class="flex flex-col items-center lg:items-end text-center lg:text-right">

            <h3 class="mb-5 text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">

              Información

            </h3>

            <div class="space-y-4">

              <RouterLink :to="{ name: 'privacy' }"
                class="flex items-center justify-center gap-2 text-sm text-zinc-400 transition hover:text-orange-400 lg:justify-end">

                <span class="material-symbols-outlined text-[18px]">
                  privacy_tip
                </span>

                Política de Privacidad

              </RouterLink>

              <RouterLink :to="{ name: 'terms' }"
                class="flex items-center justify-center gap-2 text-sm text-zinc-400 transition hover:text-orange-400 lg:justify-end">

                <span class="material-symbols-outlined text-[18px]">
                  gavel
                </span>

                Términos de Servicio

              </RouterLink>

              <RouterLink :to="{ name: 'contact' }"
                class="flex items-center justify-center gap-2 text-sm text-zinc-400 transition hover:text-orange-400 lg:justify-end">

                <span class="material-symbols-outlined text-[18px]">
                  contact_mail
                </span>

                Contacto

              </RouterLink>

            </div>

            <div
              class="mt-8 flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/70 px-4 py-2 text-xs text-zinc-500">

              <span class="material-symbols-outlined text-[18px]">
                public
              </span>

              <span translate="no">
                {{ domains[currentDomainIndex] }}
              </span>

            </div>

          </div>

        </div>

      </div>

      <!-- PACA Credit -->
      <div class="group/credit relative flex justify-center pb-4 pt-2">
        <span class="text-[10px] tracking-[0.25em] text-zinc-700/50 cursor-default">
          © Created by
          <span class="relative inline-block">
            <span
              class="font-semibold text-zinc-600/40 hover:text-zinc-500/60 transition-colors duration-300">PACA</span>
            <!-- Tooltip with 3s hover delay -->
            <div
              class="absolute -top-2 left-1/2 -translate-x-1/2 translate-y-[-100%] opacity-0 group-hover/credit:opacity-100 transition-opacity duration-300 delay-[0s] group-hover/credit:delay-[3000ms] pointer-events-none z-50 w-max max-w-[280px]">
              <div class="bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-2.5 shadow-2xl">
                <p class="text-[11px] leading-relaxed text-white/70 whitespace-nowrap">
                  Pablo Alejandro Carbajal Aburto
                </p>
              </div>
              <!-- Arrow -->
              <div
                class="absolute -bottom-[5px] left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-[#1a1a1a] border-r border-b border-white/10 rotate-45">
              </div>
            </div>
          </span>
        </span>
      </div>

    </footer>
  </div>
</template>

<style scoped>
.material-symbols-outlined {
  font-variation-settings: 'FILL' 1, 'wght' 600, 'GRAD' 0, 'opsz' 24;
}

/* Slide-up transition for domain/tagline rotation */
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

/* Mobile menu transition */
.mobile-menu-enter-active {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.mobile-menu-leave-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.mobile-menu-enter-from {
  opacity: 0;
  transform: translateY(-15px);
}

.mobile-menu-leave-to {
  opacity: 0;
  transform: translateY(-15px);
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

/* Smooth scrolling for anchor links */
html {
  scroll-behavior: smooth;
}

@media (prefers-reduced-motion: reduce) {
  .animate-pulse-ring-orange {
    animation: none;
  }

  .slide-up-enter-active,
  .slide-up-leave-active,
  .mobile-menu-enter-active,
  .mobile-menu-leave-active {
    transition: none;
  }

  nav {
    transition: none;
  }
}
</style>
