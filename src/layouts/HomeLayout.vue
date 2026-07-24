<script lang="ts" setup>
import { useUserStore } from '@/stores/user';
import { RouterLink } from 'vue-router'

import { onMounted, onUnmounted, ref } from 'vue';
import { useRouter } from 'vue-router';

import UbiquemeLogo from '@/assets/Ubiqueme_Logo_white.webp';
import FacebookLogo from '@/assets/logos/facebook-com-logo.png';
import InstagramLogo from '@/assets/logos/instagram-com-logo.png';
import MastercardLogo from '@/assets/logos/mastercard-logo.png';
import MercadoLibreLogo from '@/assets/logos/mercadolibre-logo.png';
import MercadoPagoLogo from '@/assets/logos/mercadopago-logo.png';
import MetaLogo from '@/assets/logos/meta-com-logo.png';
import PayPalLogo from '@/assets/logos/paypal-logo.png';
import TikTokLogo from '@/assets/logos/tiktok-com-logo.png';
import VisaLogo from '@/assets/logos/visa-com-logo.png';
import XLogo from '@/assets/logos/x-com-logo.png';
import YoutubeLogo from '@/assets/logos/youtube-com-logo.png';
import TrustCarousel from '@/components/ui/TrustCarousel.vue';
import SatIcon from '@/assets/images/formal/sat.webp'
import YearsIcon from '@/assets/images/formal/15YearsExp.webp'
import SafeIcon from '@/assets/images/formal/safeSite.webp'
const trustIcons = [SatIcon, YearsIcon, SafeIcon];

const router = useRouter();
const openAziechrie = () => window.open('https://www.aziechriepharma.com', '_blank');
const isScrolled = ref(false);

interface NavChild {
  label: string
  href?: string
  pathName?: string
  params?: Record<string, string>
  icon?: string
  description?: string
}

interface NavLink {
  name: string
  pathName: string
  icon: string
  requiredLogin: boolean
  children?: NavChild[]
  description?: string
}

const navLinks: NavLink[] = [
  {
    name: 'Inicio', pathName: 'home', icon: 'home', requiredLogin: false,
    description: 'Protege a tus seres queridos y pertenencias con tecnología QR inteligente',
    children: [
      {
        label: 'Beneficios', href: '#benefits', icon: 'verified',
        description: 'Conoce las características que hacen de Ubiqueme tu mejor aliado'
      },
      {
        label: 'Cómo funciona', href: '#how-it-works', icon: 'settings',
        description: 'Activa, vincula y recibe alertas en solo 3 pasos'
      },
      {
        label: 'Paso a paso', href: '#steps', icon: 'format_list_numbered',
        description: 'Guía visual con videos para configurar tu primer QR'
      },
      {
        label: 'Planes y precios', href: '#pricing', icon: 'payments',
        description: 'Compara planes desde $499 MXN/año con envío gratis'
      },
      {
        label: 'Videos de su Uso', href: '#videos', icon: 'play_circle',
        description: 'Mira cómo otros usuarios protegen sus objetos en la vida real'
      },
      {
        label: 'Volver a la página principal', pathName: 'home', icon: 'open_in_new',
        description: 'Regresar al inicio del sitio'
      },
    ],
  },
  { name: 'Dashboard', pathName: 'dashboard', icon: 'dashboard_customize', requiredLogin: true },
  {
    name: 'Ayuda', pathName: 'help', icon: 'help', requiredLogin: false,
    description: 'Resuelve tus dudas y obtén soporte personalizado',
    children: [
      {
        label: 'Preguntas frecuentes', pathName: 'help', icon: 'quiz',
        description: 'Respuestas a las preguntas más comunes sobre Ubiqueme'
      },
      {
        label: 'Contacto', pathName: 'contact', icon: 'contact_mail',
        description: 'Escríbenos y nuestro equipo te atenderá rápidamente'
      },
      {
        label: 'Guía de uso', pathName: 'help', icon: 'menu_book',
        description: 'Manual completo con todas las funciones disponibles'
      },
    ],
  },
  {
    name: 'Precios', pathName: 'pricing', icon: 'payments', requiredLogin: false,
    description: 'Planes flexibles desde $499 MXN/año — elige el tuyo',
    children: [
      {
        label: 'Plan Bronce', pathName: 'checkout', params: { planId: 'bronce' }, icon: 'workspace_premium',
        description: 'Protección básica — 1 QR activo, contador de escaneos'
      },
      {
        label: 'Plan Plata', pathName: 'checkout', params: { planId: 'plata' }, icon: 'workspace_premium',
        description: 'La opción más equilibrada — 3 QRs, historial 30 días'
      },
      {
        label: 'Plan Oro', pathName: 'checkout', params: { planId: 'oro' }, icon: 'workspace_premium',
        description: 'Control total — 5 QRs, mapa dinámico, ilimitado'
      },
      {
        label: 'Ver todos los planes', pathName: 'pricing', icon: 'apps',
        description: 'Compara todos los planes y elige el que más te convenga'
      },
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
    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
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
const trustItems = ['Registrados SAT', '15 Años Exp.', 'Sitio Seguro'];
const currentTrustIndex = ref(0);
const isMobileMenuOpen = ref(false);
const showCompactBadge = ref(false);
let intervalId: ReturnType<typeof setInterval> | undefined;

let trustIntervalId: ReturnType<typeof setInterval> | undefined;

onMounted(() => {
  intervalId = setInterval(() => {
    currentDomainIndex.value = (currentDomainIndex.value + 1) % domains.length;
    currentTaglineIndex.value = (currentTaglineIndex.value + 1) % taglines.length;
  }, 5000);

  trustIntervalId = setInterval(() => {
    currentTrustIndex.value = (currentTrustIndex.value + 1) % trustItems.length;
  }, 4000);

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
  if (trustIntervalId) clearInterval(trustIntervalId);
});
</script>

<template>
  <div class="font-google-sans">
    <!-- Skip to main content (accessibility) -->
    <a href="#main-content"
      class="fixed -top-10 left-4 z-[100] bg-orange-500 text-white px-4 py-2 text-[11px] font-google-sans rounded-b-lg transition-all duration-300 focus-visible:top-0 focus-visible:outline-none">
      Saltar al contenido
    </a>

    <!-- TopNavBar -->
    <nav :class="[
      'fixed top-0 w-full z-50 transition-all duration-500',
      isScrolled
        ? 'bg-white border-b text-white! border-gray-200 shadow-[0_4px_40px_rgba(0,0,0,0.08)]'
        : 'bg-[#f6fcff] border-b border-gray-200'
    ]">

      <!-- Subtle Orange Top Line -->
      <div
        class="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-orange-600 to-transparent">
      </div>

      <!-- Grain texture overlay -->
      <div class="absolute hidedn inset-0 pointer-events-none opacity-[0.03] mix-blend-overlay grain-overlay">
      </div>

      <div
        class="relative mx-auto flex h-22 w-full max-w-screen-2xl items-center justify-between px-5 md:px-10 xl:px-14">

        <!-- LEFT -->
        <div class="flex items-center gap-5">

          <TrustCarousel />

          <!-- LOGO + Mobile domain -->
          <RouterLink :to="{ name: 'home' }"
            class="group flex items-center gap-3 rounded-xl transition-all duration-300">

            <img :src="UbiquemeLogo" alt="Ubiqueme Logo"
              class="hidden sm:block h-11 w-11 rounded-xl bg-black object-contain transition-transform duration-300 group-hover:scale-105" />

            <!-- MOBILE: Logo + rotating trust badge + animated domain -->
            <div class="flex items-center gap-1.5 lg:hidden">

              <img :src="UbiquemeLogo" alt="Ubiqueme Logo"
                class="h-7 w-7 rounded-lg bg-black object-contain shrink-0" />

              <div
                class="flex items-center gap-1.5 rounded-md border border-slate-200 bg-white/90 px-2 py-1 shadow-xs min-w-0">
                <img :src="trustIcons[currentTrustIndex]" alt="" class="h-5 w-5 object-contain shrink-0" />
                <Transition name="slide-up" mode="out-in">
                  <span :key="currentTrustIndex" class="text-[10px] font-medium text-slate-600 whitespace-nowrap">
                    {{ trustItems[currentTrustIndex] }}
                  </span>
                </Transition>
              </div>

              <div class="relative h-6 min-w-[130px] shrink-0 overflow-hidden">
                <Transition name="slide-up" mode="out-in">
                  <div :key="currentDomainIndex"
                    class="absolute inset-0 flex items-center font-black tracking-tight text-sm leading-none">
                    <span translate="no" class="text-gray-900!">{{ domains[currentDomainIndex]?.split('.com')[0]
                      }}</span>
                    <span class="text-orange-500!">.com</span>
                  </div>
                </Transition>
              </div>

            </div>

            <div class="hidden min-w-[240px] flex-col justify-center lg:flex">

              <!-- Dominio (desktop) -->
              <div class="relative h-8 overflow-hidden">
                <Transition name="slide-up">
                  <div :key="currentDomainIndex"
                    class="absolute inset-0 flex items-end font-black tracking-tight text-2xl leading-none font-inter-tight">
                    <span translate="no" class="text-orange-500">{{ domains[currentDomainIndex]?.split('.com')[0]
                      }}</span>
                    <span class="text-slate-900">.com</span>
                  </div>
                </Transition>
              </div>

              <!-- Tagline -->
              <div class="relative mt-1 h-5 overflow-hidden">
                <Transition name="slide-up">
                  <div :key="currentTaglineIndex"
                    class="absolute inset-0 flex items-center text-[11px] tracking-wide text-gray-400">
                    <template v-if="taglines[currentTaglineIndex]!.clickable">
                      <span class="mr-1">por</span>
                      <span @click.stop="openAziechrie"
                        class="cursor-pointer font-semibold text-orange-400 transition-colors hover:text-orange-500">AZIECHRIE
                        PHARMA</span>
                    </template>
                    <template v-else>{{ taglines[currentTaglineIndex]!.text }}</template>
                  </div>
                </Transition>
              </div>

            </div>

          </RouterLink>
        </div>

        <!-- CENTER | Desktop Navigation -->
        <div class="hidden flex-1 items-center justify-center lg:flex">

          <nav
            class="flex items-center gap-1 rounded-full border border-gray-200 bg-white/70 p-1 shadow-sm backdrop-blur-md">

            <template v-for="link in navLinks" :key="link.name">

              <template v-if="!useUserStore().getUserId && link.requiredLogin">
              </template>

              <div v-else class="relative" @mouseenter="openMenu(link.name)" @mouseleave="closeMenu()">

                <!-- NORMAL LINK -->
                <RouterLink v-if="!link.children" :to="{ name: link.pathName }"
                  class="group flex items-center gap-2 rounded-full px-4 py-2.5 transition-all duration-300" :class="[
                    $route.name === link.pathName
                      ? 'bg-orange-500 text-white shadow-lg shadow-orange-200'
                      : 'text-gray-600 hover:bg-orange-50 hover:text-orange-500'
                  ]">

                  <span
                    class="material-symbols-outlined notranslate text-[20px] transition-transform duration-300 group-hover:-translate-y-0.5">

                    {{ link.icon }}

                  </span>

                  <span class="font-google-sans text-sm font-medium">

                    {{ link.name }}

                  </span>

                </RouterLink>

                <!-- LINK WITH DROPDOWN -->
                <button v-else
                  class="group flex cursor-pointer items-center gap-2 rounded-full px-4 py-2.5 transition-all duration-300"
                  :class="[
                    activeMenu === link.name
                      ? 'bg-orange-500 text-white shadow-lg shadow-orange-200'
                      : 'text-gray-600 hover:bg-orange-50 hover:text-orange-500'
                  ]">

                  <span
                    class="material-symbols-outlined notranslate text-[20px] transition-transform duration-300 group-hover:-translate-y-0.5">

                    {{ link.icon }}

                  </span>

                  <span class="font-google-sans text-sm font-medium">

                    {{ link.name }}

                  </span>

                  <span class="material-symbols-outlined notranslate text-[18px] transition-all duration-300"
                    :class="activeMenu === link.name ? 'rotate-180' : ''">

                    expand_more

                  </span>

                </button>

                <!-- DROPDOWN -->
                <Transition name="dropdown">

                  <div v-if="link.children && activeMenu === link.name"
                    class="absolute left-1/2 top-full z-50 mt-4 w-72 -translate-x-1/2 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl"
                    @mouseenter="cancelClose()" @mouseleave="closeMenu()">

                    <!-- Header -->
                    <div class="border-b border-gray-100 bg-gradient-to-r from-orange-50 to-white px-5 py-4">

                      <h4 class="font-google-sans text-sm font-semibold text-gray-700">

                        {{ link.name }}

                      </h4>

                      <p v-if="link.description" class="mt-1 text-[11px] leading-snug text-gray-500">

                        {{ link.description }}

                      </p>

                    </div>

                    <!-- ITEMS -->
                    <div class="p-2">

                      <button v-for="child in link.children" :key="child.label" @click="handleChildClick(child)"
                        class="group flex w-full cursor-pointer items-start gap-3 rounded-xl px-4 py-3 transition-all duration-200 hover:bg-orange-50">

                        <span v-if="child.icon"
                          class="material-symbols-outlined notranslate mt-0.5 text-[20px] text-gray-400 transition-colors duration-300 group-hover:text-orange-500">

                          {{ child.icon }}

                        </span>

                        <div class="flex min-w-0 flex-col items-start">

                          <span class="text-sm font-medium text-gray-700 transition-colors group-hover:text-orange-600">

                            {{ child.label }}

                          </span>

                          <span v-if="child.description"
                            class="mt-0.5 text-[11px] leading-snug text-gray-400 text-left">

                            {{ child.description }}

                          </span>

                        </div>

                      </button>

                    </div>

                  </div>

                </Transition>

              </div>

            </template>

          </nav>

        </div>
        <!-- RIGHT | Actions -->
        <div class="hidden lg:flex items-center gap-3 ml-8">

          <template v-if="!useUserStore().getUserId">

            <RouterLink :to="{ name: 'login' }"
              class="rounded-full px-5 py-2.5 text-sm font-medium text-gray-600 transition-all duration-300 hover:bg-gray-100 hover:text-gray-900">

              Iniciar sesión

            </RouterLink>

            <RouterLink :to="{ name: 'register' }"
              class="flex items-center gap-2 rounded-full bg-orange-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-200 transition-all duration-300 hover:-translate-y-0.5 hover:bg-orange-600 hover:shadow-orange-300 active:scale-95">

              <span class="material-symbols-outlined notranslate text-[18px]">

                person_add

              </span>

              Registrarse

            </RouterLink>

          </template>

          <template v-else>

            <RouterLink :to="{ name: 'dashboard' }"
              class="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition-all duration-300 hover:border-orange-300 hover:bg-orange-50 hover:text-orange-600">

              <span class="material-symbols-outlined notranslate text-[18px]">

                dashboard

              </span>

              Panel

            </RouterLink>

          </template>

        </div>

        <!-- MOBILE -->
        <div class="flex items-center lg:hidden">

          <button @click="isMobileMenuOpen = !isMobileMenuOpen"
            class="flex items-center gap-2 rounded-2xl bg-orange-500 px-4 py-2.5 text-white shadow-lg shadow-orange-200 transition-all duration-300 hover:bg-orange-600 active:scale-95">

            <span class="material-symbols-outlined notranslate text-[24px]">

              {{ isMobileMenuOpen ? 'close' : 'menu' }}

            </span>

            <span class="text-sm font-medium">

              {{ isMobileMenuOpen ? 'Cerrar' : 'Menú' }}

            </span>

          </button>

        </div>

        <!-- MOBILE MENU -->
        <Transition enter-active-class="transition duration-300 ease-out" enter-from-class="opacity-0 -translate-y-4"
          enter-to-class="opacity-100 translate-y-0" leave-active-class="transition duration-200 ease-in"
          leave-from-class="opacity-100 translate-y-0" leave-to-class="opacity-0 -translate-y-4">

          <div v-if="isMobileMenuOpen" class="absolute left-0 right-0 top-full z-[90] mt-3 px-4 lg:hidden">

            <div class="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-2xl">

              <!-- USER ACTIONS -->
              <div class="border-b border-gray-100 p-4">

                <template v-if="!useUserStore().getUserId">

                  <RouterLink :to="{ name: 'login' }" @click="isMobileMenuOpen = false"
                    class="mb-3 flex items-center justify-center rounded-2xl border border-gray-200 px-4 py-3 font-medium text-gray-700 transition hover:border-orange-300 hover:text-orange-500">

                    Iniciar sesión

                  </RouterLink>

                  <RouterLink :to="{ name: 'register' }" @click="isMobileMenuOpen = false"
                    class="flex items-center justify-center gap-2 rounded-2xl bg-orange-500 px-4 py-3 font-semibold text-white shadow-lg shadow-orange-200 transition hover:bg-orange-600">

                    <span class="material-symbols-outlined notranslate">

                      person_add

                    </span>

                    Registrarse

                  </RouterLink>

                </template>

                <template v-else>

                  <RouterLink :to="{ name: 'dashboard' }" @click="isMobileMenuOpen = false"
                    class="flex items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 font-medium text-gray-700 transition hover:bg-orange-50 hover:text-orange-600">

                    <span class="material-symbols-outlined notranslate">

                      dashboard

                    </span>

                    Panel

                  </RouterLink>

                </template>

              </div>

              <!-- NAVIGATION -->
              <div class="p-2">

                <template v-for="link in navLinks" :key="link.name">

                  <template v-if="!useUserStore().getUserId && link.requiredLogin">
                  </template>

                  <!-- LINK -->
                  <RouterLink v-if="!link.children" :to="{ name: link.pathName }" @click="isMobileMenuOpen = false"
                    class="group mb-1 flex items-center gap-3 rounded-2xl px-4 py-3 transition-all duration-200 hover:bg-orange-50">

                    <span class="material-symbols-outlined notranslate text-gray-400 group-hover:text-orange-500">

                      {{ link.icon }}

                    </span>

                    <span class="font-medium text-gray-700 group-hover:text-orange-600">

                      {{ link.name }}

                    </span>

                  </RouterLink>

                  <!-- GROUP -->
                  <div v-else class="mb-2 overflow-hidden rounded-2xl border border-gray-100">

                    <div class="flex items-center gap-3 bg-gray-50 px-4 py-3">

                      <span class="material-symbols-outlined notranslate text-gray-400">

                        {{ link.icon }}

                      </span>

                      <span class="font-semibold text-gray-700">

                        {{ link.name }}

                      </span>

                    </div>

                    <button v-for="child in link.children" :key="child.label" @click="
                      handleChildClick(child);
                    isMobileMenuOpen = false;
                    " class="flex w-full items-center gap-3 px-5 py-3 text-left transition hover:bg-orange-50">

                      <span v-if="child.icon" class="material-symbols-outlined notranslate text-gray-400">

                        {{ child.icon }}

                      </span>

                      <span class="text-sm text-gray-700">

                        {{ child.label }}

                      </span>

                    </button>

                  </div>

                </template>

              </div>

            </div>

          </div>

        </Transition>
      </div>
    </nav>

    <main id="main-content">
      <slot name="main"></slot>
    </main>
    <footer class="relative overflow-hidden border-t border-slate-200 bg-gradient-to-b from-white to-slate-50">
      <div class="absolute left-1/2 top-0 h-64 w-64 -translate-x-1/2 rounded-full bg-orange-500/5 blur-3xl"></div>
      <div class="relative mx-auto max-w-7xl px-6 py-10 sm:px-8 lg:px-12">
        <div class="grid gap-10 lg:grid-cols-3">
          <!-- Marca -->
          <div class="flex flex-col items-center lg:items-start text-center lg:text-left">
            <div class="mb-5 flex flex-wrap items-center justify-center gap-2 lg:justify-start">
              <div class="flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5">
                <span class="material-symbols-outlined notranslate text-slate-600 text-[14px]">lock</span>
                <span class="text-[10px] uppercase tracking-[0.2em] text-slate-700">SSL</span>
              </div>
              <div class="flex items-center gap-1.5 rounded-full border border-slate-200/30 bg-slate-50/70 px-3 py-1.5">
                <span class="material-symbols-outlined notranslate text-slate-600 text-[14px]">verified</span>
                <span class="text-[10px] uppercase tracking-[0.2em] text-slate-700">Empresa Formalmente
                  Registrada</span>
              </div>
            </div>
            <Transition name="slide-up">
              <div :key="currentDomainIndex" class="mb-3 text-3xl font-black lowercase tracking-tight">
                <span class="text-slate-900">{{ domains[currentDomainIndex]?.split('.com')[0] }}</span>
                <span class="text-orange-500">.com</span>
              </div>
            </Transition>
            <p class="text-sm text-slate-500">© {{ new Date().getFullYear() }} ubiqueme.com</p>
            <p class="mt-1 text-[10px] uppercase tracking-[0.25em] text-slate-400">
              Una marca de
              <span class="font-semibold text-orange-500">AZIECHRIE PHARMA</span>
            </p>
          </div>
          <!-- Navegación -->
          <div class="flex flex-col items-center">
            <h3 class="mb-5 text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Navegación</h3>
            <div class="grid grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-3">
              <RouterLink :to="{ name: 'home' }"
                class="group flex items-center gap-2 text-sm text-slate-500 transition hover:text-orange-500">
                <span class="material-symbols-outlined text-[18px]">home</span> Inicio
              </RouterLink>
              <RouterLink :to="{ name: 'help' }"
                class="group flex items-center gap-2 text-sm text-slate-500 transition hover:text-orange-500">
                <span class="material-symbols-outlined text-[18px]">help</span> Ayuda
              </RouterLink>
              <RouterLink :to="{ name: 'pricing' }"
                class="group flex items-center gap-2 text-sm text-slate-500 transition hover:text-orange-500">
                <span class="material-symbols-outlined text-[18px]">attach_money</span> Precios
              </RouterLink>
              <template v-if="!useUserStore().getUserId">
                <RouterLink :to="{ name: 'login' }"
                  class="group flex items-center gap-2 text-sm text-slate-500 transition hover:text-orange-500">
                  <span class="material-symbols-outlined text-[18px]">login</span> Iniciar sesión
                </RouterLink>
                <RouterLink :to="{ name: 'register' }"
                  class="group flex items-center gap-2 text-sm text-slate-500 transition hover:text-orange-500">
                  <span class="material-symbols-outlined text-[18px]">person_add</span> Registrarse
                </RouterLink>
              </template>
            </div>
          </div>
          <!-- Legal -->
          <div class="flex flex-col items-center lg:items-end text-center lg:text-right">
            <h3 class="mb-5 text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Información</h3>
            <div class="space-y-4">
              <RouterLink :to="{ name: 'privacy' }"
                class="flex items-center justify-center gap-2 text-sm text-slate-500 transition hover:text-orange-500 lg:justify-end">
                <span class="material-symbols-outlined text-[18px]">privacy_tip</span> Política de Privacidad
              </RouterLink>
              <RouterLink :to="{ name: 'terms' }"
                class="flex items-center justify-center gap-2 text-sm text-slate-500 transition hover:text-orange-500 lg:justify-end">
                <span class="material-symbols-outlined text-[18px]">gavel</span> Términos de Servicio
              </RouterLink>
              <RouterLink :to="{ name: 'contact' }"
                class="flex items-center justify-center gap-2 text-sm text-slate-500 transition hover:text-orange-500 lg:justify-end">
                <span class="material-symbols-outlined text-[18px]">contact_mail</span> Contacto
              </RouterLink>
            </div>
            <div
              class="mt-8 flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs text-slate-500 shadow-sm">
              <span class="material-symbols-outlined text-[18px]">public</span>
              <span translate="no">{{ domains[currentDomainIndex] }}</span>
            </div>
          </div>
        </div>
      </div>
      <!-- Logos trust marquee -->
      <div class="border-t border-slate-200 pt-10 pb-6">
        <p class="text-center text-xs uppercase tracking-[0.3em] text-slate-400 mb-6">
          Medios de pago y confianza
        </p>
        <div class="trust-marquee-mask overflow-hidden">
          <div class="trust-marquee-track flex gap-12 items-center">
            <img :src="PayPalLogo" alt="PayPal"
              class="h-8 w-auto shrink-0 opacity-50 hover:opacity-100 transition-opacity" />
            <img :src="MercadoPagoLogo" alt="Mercado Pago"
              class="h-8 w-auto shrink-0 opacity-50 hover:opacity-100 transition-opacity" />
            <img :src="MercadoLibreLogo" alt="Mercado Libre"
              class="h-8 w-auto shrink-0 opacity-50 hover:opacity-100 transition-opacity" />
            <img :src="MastercardLogo" alt="Mastercard"
              class="h-8 w-auto shrink-0 opacity-50 hover:opacity-100 transition-opacity" />
            <img :src="VisaLogo" alt="Visa"
              class="h-8 w-auto shrink-0 opacity-50 hover:opacity-100 transition-opacity" />
            <img :src="MetaLogo" alt="Meta"
              class="h-8 w-auto shrink-0 opacity-50 hover:opacity-100 transition-opacity" />
            <img :src="FacebookLogo" alt="Facebook"
              class="h-8 w-auto shrink-0 opacity-50 hover:opacity-100 transition-opacity" />
            <img :src="InstagramLogo" alt="Instagram"
              class="h-8 w-auto shrink-0 opacity-50 hover:opacity-100 transition-opacity" />
            <img :src="TikTokLogo" alt="TikTok"
              class="h-8 w-auto shrink-0 opacity-50 hover:opacity-100 transition-opacity" />
            <img :src="XLogo" alt="X" class="h-8 w-auto shrink-0 opacity-50 hover:opacity-100 transition-opacity" />
            <img :src="YoutubeLogo" alt="YouTube"
              class="h-8 w-auto shrink-0 opacity-50 hover:opacity-100 transition-opacity" />
            <!-- Duplicate for seamless scroll -->
            <img :src="PayPalLogo" alt="PayPal"
              class="h-8 w-auto shrink-0 opacity-50 hover:opacity-100 transition-opacity" />
            <img :src="MercadoPagoLogo" alt="Mercado Pago"
              class="h-8 w-auto shrink-0 opacity-50 hover:opacity-100 transition-opacity" />
            <img :src="MercadoLibreLogo" alt="Mercado Libre"
              class="h-8 w-auto shrink-0 opacity-50 hover:opacity-100 transition-opacity" />
            <img :src="MastercardLogo" alt="Mastercard"
              class="h-8 w-auto shrink-0 opacity-50 hover:opacity-100 transition-opacity" />
            <img :src="VisaLogo" alt="Visa"
              class="h-8 w-auto shrink-0 opacity-50 hover:opacity-100 transition-opacity" />
            <img :src="MetaLogo" alt="Meta"
              class="h-8 w-auto shrink-0 opacity-50 hover:opacity-100 transition-opacity" />
            <img :src="FacebookLogo" alt="Facebook"
              class="h-8 w-auto shrink-0 opacity-50 hover:opacity-100 transition-opacity" />
            <img :src="InstagramLogo" alt="Instagram"
              class="h-8 w-auto shrink-0 opacity-50 hover:opacity-100 transition-opacity" />
            <img :src="TikTokLogo" alt="TikTok"
              class="h-8 w-auto shrink-0 opacity-50 hover:opacity-100 transition-opacity" />
            <img :src="XLogo" alt="X" class="h-8 w-auto shrink-0 opacity-50 hover:opacity-100 transition-opacity" />
            <img :src="YoutubeLogo" alt="YouTube"
              class="h-8 w-auto shrink-0 opacity-50 hover:opacity-100 transition-opacity" />
          </div>
        </div>
      </div>
      <!-- PACA Credit -->
      <div class="group/credit relative flex justify-center pb-4 pt-2">
        <span class="text-[10px] tracking-[0.25em] text-slate-300 cursor-default">
          © Created by
          <span class="relative inline-block">
            <span class="font-semibold text-slate-400 hover:text-slate-600 transition-colors duration-300">PACA</span>
            <div
              class="absolute -top-2 left-1/2 -translate-x-1/2 translate-y-[-100%] opacity-0 group-hover/credit:opacity-100 transition-opacity duration-300 delay-[0s] group-hover/credit:delay-[3000ms] pointer-events-none z-50 w-max max-w-[280px]">
              <div class="bg-white border border-slate-200 rounded-xl px-4 py-2.5 shadow-2xl">
                <p class="text-[11px] leading-relaxed text-slate-700 whitespace-nowrap">Pablo Alejandro Carbajal Aburto
                </p>
              </div>
              <div
                class="absolute -bottom-[5px] left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-white border-r border-b border-slate-200 rotate-45">
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
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.dropdown-leave-active {
  transition: all 0.15s cubic-bezier(0.4, 0, 1, 1);
}

.dropdown-enter-from {
  opacity: 0;
  transform: translateY(-8px) scale(0.97);
}

.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px) scale(0.97);
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
