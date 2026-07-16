<script lang="ts" setup>
import { useUserStore } from '@/stores/user';
import { RouterLink } from 'vue-router'

import { onMounted, onUnmounted, ref } from 'vue';
import { useRouter } from 'vue-router';

import UbiquemeLogo from '@/assets/Ubiqueme_Logo_white.webp';

const router = useRouter();
const openAziechrie = () => window.open('https://www.aziechriepharma.com', '_blank');
const isScrolled = ref(false);

interface NavChild {
  label: string
  href?: string
  pathName?: string
  params?: Record<string, string>
  icon?: string
}

interface NavLink {
  name: string
  pathName: string
  icon: string
  requiredLogin: boolean
  children?: NavChild[]
}

const navLinks: NavLink[] = [
  {
    name: 'Inicio', pathName: 'home', icon: 'home', requiredLogin: false,
    children: [
      { label: 'Beneficios', href: '#features', icon: 'verified' },
      { label: 'Cómo funciona', href: '#how-it-works', icon: 'settings' },
      { label: 'Paso a paso', href: '#steps', icon: 'format_list_numbered' },
      { label: 'Planes y precios', href: '#pricing', icon: 'payments' },
      { label: 'Videos de su Uso', href: '#videos', icon: 'play_circle' },
      { label: 'Ver página completa', pathName: 'home', icon: 'open_in_new' },
    ],
  },
  { name: 'Dashboard', pathName: 'dashboard', icon: 'dashboard_customize', requiredLogin: true },
  {
    name: 'Ayuda', pathName: 'help', icon: 'help', requiredLogin: false,
    children: [
      { label: 'Preguntas frecuentes', pathName: 'help', icon: 'quiz' },
      { label: 'Contacto', pathName: 'contact', icon: 'contact_mail' },
      { label: 'Guía de uso', pathName: 'help', icon: 'menu_book' },
    ],
  },
  {
    name: 'Precios', pathName: 'pricing', icon: 'payments', requiredLogin: false,
    children: [
      { label: 'Plan Bronce', pathName: 'checkout', params: { planId: 'bronce' }, icon: 'workspace_premium' },
      { label: 'Plan Plata', pathName: 'checkout', params: { planId: 'plata' }, icon: 'workspace_premium' },
      { label: 'Plan Oro', pathName: 'checkout', params: { planId: 'oro' }, icon: 'workspace_premium' },
      { label: 'Ver todos los planes', pathName: 'pricing', icon: 'apps' },
    ],
  },
]

const activeMenu = ref<string | null>(null)
let menuTimeout: ReturnType<typeof setTimeout> | null = null

const openMenu = (name: string) => {
  if (menuTimeout) clearTimeout(menuTimeout)
  activeMenu.value = name
}

const closeMenu = () => {
  if (menuTimeout) clearTimeout(menuTimeout)
  menuTimeout = setTimeout(() => {
    activeMenu.value = null
  }, 200)
}

const cancelClose = () => {
  if (menuTimeout) {
    clearTimeout(menuTimeout)
    menuTimeout = null
  }
}

const scrollToSection = (href: string) => {
  const id = href.replace('#', '')
  const el = document.getElementById(id)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
  activeMenu.value = null
}

const handleChildClick = (child: NavChild) => {
  activeMenu.value = null
  if (child.href) {
    if (router.currentRoute.value.name === 'home') {
      scrollToSection(child.href!)
    } else {
      router.push({ name: 'home' }).then(() => {
        setTimeout(() => scrollToSection(child.href!), 300)
      })
    }
  } else if (child.pathName) {
    router.push({ name: child.pathName, params: child.params ?? {} })
  }
}

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
  intervalId = setInterval(() => {
    currentDomainIndex.value = (currentDomainIndex.value + 1) % domains.length;
    currentTaglineIndex.value = (currentTaglineIndex.value + 1) % taglines.length;
  }, 5000);

  setTimeout(() => {
    showCompactBadge.value = true;
  }, 4000);

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
      class="fixed -top-10 left-4 z-[100] bg-orange-500 text-white px-4 py-2 text-[11px] font-black uppercase tracking-widest rounded-b-lg transition-all duration-300 focus-visible:top-0 focus-visible:outline-none">
      Saltar al contenido
    </a>

    <!-- TopNavBar -->
    <nav :class="[
      'fixed top-0 w-full z-50 transition-all duration-500',
      isScrolled
        ? 'bg-orange-50 border-b text-white! border-gray-200 shadow-[0_4px_40px_rgba(0,0,0,0.08)]'
        : 'bg-white border-b border-gray-200'
    ]">

      <!-- Subtle Orange Top Line -->
      <div
        class="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-orange-600 to-transparent">
      </div>

      <!-- Grain texture overlay -->
      <div class="absolute hidedn inset-0 pointer-events-none opacity-[0.03] mix-blend-overlay grain-overlay">
      </div>

      <div class="flex justify-between items-center h-20 px-6 md:px-16 w-full max-w-screen-2xl mx-auto relative">

        <!-- Logo -->
        <div class="flex items-center gap-3 relative">
          <!-- SSL Badge -->
          <div
            class="group/badge relative flex items-center gap-1.5 ml-4 rounded-lg border border-orange-500/20 bg-orange-500/[0.06] active:scale-[0.97] cursor-default"
            :class="showCompactBadge ? 'px-2 py-1' : 'px-2.5 py-1.5'"
            :style="{ transition: 'all 0.45s cubic-bezier(0.4, 0, 0.2, 1)' }">
            <Transition name="fade">
              <span v-if="!showCompactBadge"
                class="absolute inset-0 rounded-lg animate-pulse-ring-orange pointer-events-none"></span>
            </Transition>

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

            <div
              class="absolute -bottom-2 left-1/2 -translate-x-1/2 translate-y-full opacity-0 group-hover/badge:opacity-100 pointer-events-none transition-all duration-300 z-50 w-max max-w-[220px]">
              <div class="bg-white border border-gray-200 rounded-xl px-3 py-2 shadow-lg">
                <p class="text-[10px] leading-relaxed text-gray-600">
                  <span class="text-orange-500 font-bold">🔒 SSL 256-bit</span><br>
                  Tu información viaja cifrada y protegida.
                </p>
              </div>
            </div>
          </div>
          <RouterLink :to="{ name: 'home' }"
            class="flex items-center gap-2 group cursor-pointer z-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white rounded-lg">
            <img :src="UbiquemeLogo" alt="Ubiqueme Logo"
              class="hidden sm:block w-10 h-10 sm:w-12 sm:h-12 object-contain bg-black rounded-xl" />
            <div class="hidden lg:flex flex-col min-w-[140px] sm:min-w-[200px]">
              <div class="relative h-9 sm:h-10 overflow-hidden flex items-center">
                <Transition name="slide-up">
                  <div :key="currentDomainIndex"
                    class="absolute left-0 flex items-baseline text-gray-900 font-black tracking-tighter text-[15px] sm:text-[22px] lowercase leading-none whitespace-nowrap">
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

        <!-- Mobile -->
        <div v-show="showCompactBadge"
          class="lg:hidden flex-1 flex justify-start mx-auto md:justify-center min-w-0 absolute top-1/2 translate-x-1/2 translate-y-1/2 bottom-1/2 right-1/2 sm:fixed animate-fade">
          <RouterLink :to="{ name: 'home' }" class="flex items-center gap-2 group cursor-pointer z-50">
            <span
              class="material-symbols-outlined notranslate text-orange-500 text-[2rem] group-hover:rotate-12 transition-transform">location_on</span>
            <div class="flex flex-col justify-center h-8 overflow-hidden relative min-w-[130px]">
              <Transition name="slide-up">
                <div :key="currentDomainIndex"
                  class="absolute left-0 flex items-baseline text-gray-900 font-black tracking-tighter text-[16px] lowercase leading-none whitespace-nowrap">
                  <span translate="no">{{ domains[currentDomainIndex]?.split('.com')[0] }}</span>
                  <span class="text-orange-500">.com</span>
                </div>
              </Transition>
            </div>
          </RouterLink>
        </div>

        <!-- Menu -->
        <div class="hidden lg:flex items-center space-x-2 tracking-tight">
          <template v-for="link in navLinks" :key="link.name">
            <div v-if="!useUserStore().getUserId && link.requiredLogin" class="hidden"></div>
            <div v-else class="relative" @mouseenter="openMenu(link.name)" @mouseleave="closeMenu()">
              <RouterLink v-if="!link.children" :to="{ name: link.pathName }"
                class="flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 group relative"
                :style="{ color: $route.name === link.pathName ? '#f97316' : 'rgba(107,114,128,1)' }"
                @mouseenter="($event.target as HTMLElement).style.color = '#f97316'"
                @mouseleave="($event.target as HTMLElement).style.color = $route.name === link.pathName ? '#f97316' : 'rgba(107,114,128,1)'">
                <span
                  class="material-symbols-outlined notranslate text-[20px] group-hover:scale-110 transition-transform">{{
                    link.icon }}</span>
                <span class="text-[11px] font-black uppercase tracking-widest">{{ link.name }}</span>
                <div :class="[
                  'absolute bottom-0 left-4 right-4 h-[2px] bg-orange-500 transition-transform origin-center duration-300',
                  $route.name === link.pathName ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                ]"></div>
              </RouterLink>

              <button v-if="link.children"
                class="flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 group relative cursor-pointer"
                :class="{ 'text-orange-500': $route.name === link.pathName, 'text-gray-500': $route.name !== link.pathName }"
                :style="{ color: $route.name === link.pathName ? '#f97316' : 'rgba(107,114,128,1)' }">
                <span
                  class="material-symbols-outlined notranslate text-[20px] group-hover:scale-110 transition-transform">{{
                    link.icon }}</span>
                <span class="text-[11px] font-black uppercase tracking-widest">{{ link.name }}</span>
                <span class="material-symbols-outlined notranslate text-[14px] transition-transform duration-200"
                  :class="activeMenu === link.name ? 'rotate-180' : ''">expand_more</span>
                <div :class="[
                  'absolute bottom-0 left-4 right-4 h-[2px] bg-orange-500 transition-transform origin-center duration-300',
                  activeMenu === link.name ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                ]"></div>
              </button>

              <Transition name="dropdown">
                <div v-if="link.children && activeMenu === link.name"
                  class="absolute top-full left-0 mt-2 w-64 bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden z-50"
                  @mouseenter="cancelClose()" @mouseleave="closeMenu()">
                  <div class="px-4 py-3 border-b border-gray-100">
                    <span class="text-[10px] font-black uppercase tracking-widest text-gray-400">{{ link.name }}</span>
                  </div>
                  <div class="py-2">
                    <button v-for="child in link.children" :key="child.label" @click="handleChildClick(child)"
                      class="flex items-center gap-3 w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors duration-150 cursor-pointer">
                      <span v-if="child.icon"
                        class="material-symbols-outlined notranslate text-[18px] text-gray-400 shrink-0">{{ child.icon
                        }}</span>
                      <span class="font-medium">{{ child.label }}</span>
                    </button>
                  </div>
                </div>
              </Transition>
            </div>
          </template>
        </div>

        <!-- Buttons -->
        <div class="hidden lg:flex items-center space-x-4 z-50">
          <template v-if="!useUserStore().getUserId">
            <RouterLink :to="{ name: 'login' }"
              class="text-gray-500 hover:text-gray-900 transition-colors duration-300 text-[11px] font-black uppercase tracking-widest px-4 py-2 cursor-pointer">
              Iniciar sesión
            </RouterLink>
            <RouterLink :to="{ name: 'register' }"
              class="bg-orange-500 text-white px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-orange-600 transition-all duration-300 active:scale-95 shadow-[0_10px_20px_rgba(249,115,22,0.15)] cursor-pointer">
              Registrarse
            </RouterLink>
          </template>
          <template v-else>
            <RouterLink :to="{ name: 'dashboard' }"
              class="bg-gray-100 border border-gray-200 text-gray-700 px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-orange-500 hover:text-white hover:border-orange-500 transition-all duration-300 cursor-pointer flex items-center gap-2">
              <span class="material-symbols-outlined notranslate text-sm">dashboard</span>
              Panel
            </RouterLink>
          </template>
        </div>

        <!-- Hamburger -->
        <button @click="isMobileMenuOpen = !isMobileMenuOpen"
          class="lg:hidden flex items-center justify-center p-2 bg-[#dd5c00] text-white/60 font-bold hover:text-white transition-colors z-50 cursor-pointer rounded-xl">
          <span class="material-symbols-outlined notranslate text-[28px]">{{ isMobileMenuOpen ? 'close' : 'menu'
          }}</span>
          <span>{{ isMobileMenuOpen ? 'Cerrar' : 'Menú' }}</span>
        </button>

      </div>

      <!-- Mobile Menu -->
      <Transition name="mobile-menu">
        <div v-if="isMobileMenuOpen"
          class="fixed top-20 left-0 w-full h-[calc(100dvh-80px)] bg-[#1C1B1F] z-40 border-t border-[#49454F]/30 flex flex-col lg:hidden overflow-y-auto">
          <div class="flex items-center gap-3 px-6 pt-6 pb-4">
            <span class="material-symbols-outlined notranslate text-[#E6E1E5] text-[28px]">menu</span>
            <span class="text-[#E6E1E5] text-lg font-bold">Menú</span>
          </div>

          <template v-if="!useUserStore().getUserId">
            <div class="px-4 space-y-2 pb-4">
              <RouterLink :to="{ name: 'register' }" @click="isMobileMenuOpen = false"
                class="flex items-center justify-center gap-2 w-full bg-orange-500 text-black py-4 rounded-2xl text-[13px] font-black uppercase tracking-widest transition-all duration-200 active:scale-[0.98] shadow-[0_10px_20px_rgba(249,115,22,0.15)] cursor-pointer">
                <span class="material-symbols-outlined notranslate text-[18px]">person_add</span>
                Registrarse
              </RouterLink>
              <RouterLink :to="{ name: 'login' }" @click="isMobileMenuOpen = false"
                class="flex items-center justify-center gap-2 w-full py-4 rounded-2xl text-[13px] font-black uppercase tracking-widest transition-all duration-200 active:scale-[0.98] text-[#CAC4D0] hover:text-[#E6E1E5] hover:bg-[#2B2930] cursor-pointer">
                <span class="material-symbols-outlined notranslate text-[18px]">login</span>
                Iniciar sesión
              </RouterLink>
            </div>
            <div class="mx-6 border-t border-[#49454F]/30 mb-2"></div>
          </template>

          <div class="flex-1 px-4 space-y-1">
            <RouterLink v-for="(link, index) in navLinks" :key="link.name" :to="{ name: link.pathName }"
              @click="isMobileMenuOpen = false" :style="{ transitionDelay: `${index * 60}ms` }" :class="[
                { 'hidden': !useUserStore().getUserId && link.requiredLogin },
                'flex items-center gap-3 px-4 py-4 rounded-2xl transition-all duration-200 active:scale-[0.98] cursor-pointer min-h-[50px]',
                $route.name === link.pathName
                  ? 'text-orange-500 bg-[#2B2930] border border-orange-500/10'
                  : 'text-[#E6E1E5] hover:bg-[#2B2930] border border-transparent'
              ]">
              <span class="material-symbols-outlined notranslate text-[22px]">{{ link.icon }}</span>
              <span class="text-[13px] font-bold tracking-wider">{{ link.name }}</span>
              <div v-if="$route.name === link.pathName" class="ml-auto w-1.5 h-1.5 rounded-full bg-orange-500"></div>
            </RouterLink>
          </div>

          <div v-if="useUserStore().getUserId" class="px-4 pt-2 pb-8">
            <RouterLink :to="{ name: 'dashboard' }" @click="isMobileMenuOpen = false"
              class="flex items-center justify-center gap-2 w-full py-4 rounded-2xl text-[13px] font-black uppercase tracking-widest transition-all duration-200 active:scale-[0.98] bg-[#2B2930] border border-[#49454F]/30 text-[#E6E1E5] hover:bg-orange-500 hover:text-black hover:border-orange-500 cursor-pointer">
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
      <div class="absolute left-1/2 top-0 h-64 w-64 -translate-x-1/2 rounded-full bg-orange-500/5 blur-3xl"></div>
      <div class="relative mx-auto max-w-7xl px-6 py-10 sm:px-8 lg:px-12">
        <div class="grid gap-10 lg:grid-cols-3">
          <!-- Marca -->
          <div class="flex flex-col items-center lg:items-start text-center lg:text-left">
            <div
              class="mb-5 flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/5 px-4 py-2">
              <span class="material-symbols-outlined notranslate text-orange-400">shield</span>
              <span class="text-xs uppercase tracking-[0.25em] text-zinc-300">SSL</span>
            </div>
            <Transition name="slide-up">
              <div :key="currentDomainIndex" class="mb-3 text-3xl font-black lowercase tracking-tight">
                <span class="text-white">{{ domains[currentDomainIndex]?.split('.com')[0] }}</span>
                <span class="text-orange-500">.com</span>
              </div>
            </Transition>
            <p class="text-sm text-zinc-500">© {{ new Date().getFullYear() }} ubiqueme.com</p>
            <p class="mt-1 text-[10px] uppercase tracking-[0.25em] text-zinc-600">
              Una marca de
              <span class="font-semibold text-orange-400">AZIECHRIE PHARMA</span>
            </p>
          </div>
          <!-- Navegación -->
          <div class="flex flex-col items-center">
            <h3 class="mb-5 text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">Navegación</h3>
            <div class="grid grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-3">
              <RouterLink :to="{ name: 'home' }"
                class="group flex items-center gap-2 text-sm text-zinc-400 transition hover:text-orange-400">
                <span class="material-symbols-outlined text-[18px]">home</span> Inicio
              </RouterLink>
              <RouterLink :to="{ name: 'help' }"
                class="group flex items-center gap-2 text-sm text-zinc-400 transition hover:text-orange-400">
                <span class="material-symbols-outlined text-[18px]">help</span> Ayuda
              </RouterLink>
              <RouterLink :to="{ name: 'pricing' }"
                class="group flex items-center gap-2 text-sm text-zinc-400 transition hover:text-orange-400">
                <span class="material-symbols-outlined text-[18px]">attach_money</span> Precios
              </RouterLink>
              <template v-if="!useUserStore().getUserId">
                <RouterLink :to="{ name: 'login' }"
                  class="group flex items-center gap-2 text-sm text-zinc-400 transition hover:text-orange-400">
                  <span class="material-symbols-outlined text-[18px]">login</span> Iniciar sesión
                </RouterLink>
                <RouterLink :to="{ name: 'register' }"
                  class="group flex items-center gap-2 text-sm text-zinc-400 transition hover:text-orange-400">
                  <span class="material-symbols-outlined text-[18px]">person_add</span> Registrarse
                </RouterLink>
              </template>
            </div>
          </div>
          <!-- Legal -->
          <div class="flex flex-col items-center lg:items-end text-center lg:text-right">
            <h3 class="mb-5 text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">Información</h3>
            <div class="space-y-4">
              <RouterLink :to="{ name: 'privacy' }"
                class="flex items-center justify-center gap-2 text-sm text-zinc-400 transition hover:text-orange-400 lg:justify-end">
                <span class="material-symbols-outlined text-[18px]">privacy_tip</span> Política de Privacidad
              </RouterLink>
              <RouterLink :to="{ name: 'terms' }"
                class="flex items-center justify-center gap-2 text-sm text-zinc-400 transition hover:text-orange-400 lg:justify-end">
                <span class="material-symbols-outlined text-[18px]">gavel</span> Términos de Servicio
              </RouterLink>
              <RouterLink :to="{ name: 'contact' }"
                class="flex items-center justify-center gap-2 text-sm text-zinc-400 transition hover:text-orange-400 lg:justify-end">
                <span class="material-symbols-outlined text-[18px]">contact_mail</span> Contacto
              </RouterLink>
            </div>
            <div
              class="mt-8 flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/70 px-4 py-2 text-xs text-zinc-500">
              <span class="material-symbols-outlined text-[18px]">public</span>
              <span translate="no">{{ domains[currentDomainIndex] }}</span>
            </div>
          </div>
        </div>
      </div>
      <!-- Trust badges marquee -->
      <div class="border-t border-zinc-800 pt-10 pb-6">
        <p class="text-center text-xs uppercase tracking-[0.3em] text-zinc-500 mb-6">
          Medios de pago y confianza
        </p>
        <div class="trust-marquee-mask overflow-hidden">
          <div class="trust-marquee-track flex gap-16 items-center">
            <!-- SSL -->
            <div
              class="flex items-center gap-2 shrink-0 px-4 py-2 rounded-lg border border-orange-500/20 bg-orange-500/5">
              <span class="material-symbols-outlined notranslate text-orange-400" style="font-size:20px">shield</span>
              <span class="text-xs font-semibold text-zinc-300 tracking-wider">SSL 256-bit</span>
            </div>
            <!-- PayPal -->
            <div class="flex items-center gap-2 shrink-0 px-4 py-2">
              <svg viewBox="0 0 36 36" class="w-8 h-8 shrink-0">
                <rect width="36" height="36" rx="6" fill="#003087" />
                <text x="18" y="23" text-anchor="middle" fill="white" font-size="10" font-weight="bold"
                  font-family="Arial">Pay</text>
              </svg>
              <span class="text-xs font-semibold tracking-wide">
                <span style="color:#0079C1">Pay</span><span style="color:#27346A">Pal</span>
              </span>
            </div>
            <!-- Mercado Pago -->
            <div class="flex items-center gap-2 shrink-0 px-4 py-2">
              <svg viewBox="0 0 36 36" class="w-8 h-8 shrink-0">
                <rect width="36" height="36" rx="6" fill="#00B5E2" />
                <text x="18" y="23" text-anchor="middle" fill="white" font-size="7" font-weight="bold"
                  font-family="Arial">M
                  P</text>
              </svg>
              <span class="text-xs font-semibold text-zinc-300 tracking-tight">Mercado Pago</span>
            </div>
            <!-- Mercado Libre -->
            <div class="flex items-center gap-2 shrink-0 px-4 py-2">
              <svg viewBox="0 0 36 36" class="w-8 h-8 shrink-0">
                <rect width="36" height="36" rx="6" fill="#FFE600" />
                <text x="18" y="23" text-anchor="middle" fill="#333" font-size="6" font-weight="bold"
                  font-family="Arial">M
                  L</text>
              </svg>
              <span class="text-xs font-semibold tracking-tight">
                <span style="color:#FFE600">Mercado</span> <span style="color:#333">Libre</span>
              </span>
            </div>
            <!-- Dúplica para scroll seamless -->
            <div
              class="flex items-center gap-2 shrink-0 px-4 py-2 rounded-lg border border-orange-500/20 bg-orange-500/5">
              <span class="material-symbols-outlined notranslate text-orange-400" style="font-size:20px">shield</span>
              <span class="text-xs font-semibold text-zinc-300 tracking-wider">SSL 256-bit</span>
            </div>
            <div class="flex items-center gap-2 shrink-0 px-4 py-2">
              <svg viewBox="0 0 36 36" class="w-8 h-8 shrink-0">
                <rect width="36" height="36" rx="6" fill="#003087" />
                <text x="18" y="23" text-anchor="middle" fill="white" font-size="10" font-weight="bold"
                  font-family="Arial">Pay</text>
              </svg>
              <span class="text-xs font-semibold tracking-wide">
                <span style="color:#0079C1">Pay</span><span style="color:#27346A">Pal</span>
              </span>
            </div>
            <div class="flex items-center gap-2 shrink-0 px-4 py-2">
              <svg viewBox="0 0 36 36" class="w-8 h-8 shrink-0">
                <rect width="36" height="36" rx="6" fill="#00B5E2" />
                <text x="18" y="23" text-anchor="middle" fill="white" font-size="7" font-weight="bold"
                  font-family="Arial">M
                  P</text>
              </svg>
              <span class="text-xs font-semibold text-zinc-300 tracking-tight">Mercado Pago</span>
            </div>
            <div class="flex items-center gap-2 shrink-0 px-4 py-2">
              <svg viewBox="0 0 36 36" class="w-8 h-8 shrink-0">
                <rect width="36" height="36" rx="6" fill="#FFE600" />
                <text x="18" y="23" text-anchor="middle" fill="#333" font-size="6" font-weight="bold"
                  font-family="Arial">M
                  L</text>
              </svg>
              <span class="text-xs font-semibold tracking-tight">
                <span style="color:#FFE600">Mercado</span> <span style="color:#333">Libre</span>
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
            <div
              class="absolute -top-2 left-1/2 -translate-x-1/2 translate-y-[-100%] opacity-0 group-hover/credit:opacity-100 transition-opacity duration-300 delay-[0s] group-hover/credit:delay-[3000ms] pointer-events-none z-50 w-max max-w-[280px]">
              <div class="bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-2.5 shadow-2xl">
                <p class="text-[11px] leading-relaxed text-white/70 whitespace-nowrap">Pablo Alejandro Carbajal Aburto
                </p>
              </div>
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
.grain-overlay {
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
  background-repeat: repeat;
  background-size: 128px 128px;
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

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.dropdown-enter-active {
  transition: all 0.15s ease-out;
}

.dropdown-leave-active {
  transition: all 0.1s ease-in;
}

.dropdown-enter-from {
  opacity: 0;
  transform: translateY(-4px);
}

.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-2px);
}

/* Trust marquee horizontal infinite scroll */
@keyframes trust-marquee {
  0% {
    transform: translateX(0);
  }

  100% {
    transform: translateX(-50%);
  }
}

.trust-marquee-mask {
  mask-image: linear-gradient(to right,
      transparent 0%,
      black 5%,
      black 95%,
      transparent 100%);
  -webkit-mask-image: linear-gradient(to right,
      transparent 0%,
      black 5%,
      black 95%,
      transparent 100%);
}

.trust-marquee-track {
  animation: trust-marquee 30s linear infinite;
  will-change: transform;
}

.trust-marquee-track:hover {
  animation-play-state: paused;
}

html {
  scroll-behavior: smooth;
}

@media (prefers-reduced-motion: reduce) {
  .trust-marquee-track {
    animation: none;
  }

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
