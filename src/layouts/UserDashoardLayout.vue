<script lang="ts" setup>
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { RouterLink, useRouter } from 'vue-router'
import { useAuth } from '@/handleAuth'
import TrustCarousel from '@/components/ui/TrustCarousel.vue'

const { handleLogout } = useAuth()
const router = useRouter()

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
      { label: 'Beneficios', href: '#benefits', icon: 'verified', description: 'Conoce las características que hacen de Ubiqueme tu mejor aliado' },
      { label: 'Cómo funciona', href: '#how-it-works', icon: 'settings', description: 'Activa, vincula y recibe alertas en solo 3 pasos' },
      { label: 'Paso a paso', href: '#steps', icon: 'format_list_numbered', description: 'Guía visual con videos para configurar tu primer QR' },
      { label: 'Planes y precios', href: '#pricing', icon: 'payments', description: 'Compara planes desde $499 MXN/año con envío gratis' },
      { label: 'Videos de su Uso', href: '#videos', icon: 'play_circle', description: 'Mira cómo otros usuarios protegen sus objetos en la vida real' },
      { label: 'Volver a la página principal', pathName: 'home', icon: 'open_in_new', description: 'Regresar al inicio del sitio' },
    ],
  },
  { name: 'Dashboard', pathName: 'dashboard', icon: 'dashboard_customize', requiredLogin: true },
  {
    name: 'Ayuda', pathName: 'help', icon: 'help', requiredLogin: false,
    description: 'Resuelve tus dudas y obtén soporte personalizado',
    children: [
      { label: 'Preguntas frecuentes', pathName: 'help', icon: 'quiz', description: 'Respuestas a las preguntas más comunes sobre Ubiqueme' },
      { label: 'Contacto', pathName: 'contact', icon: 'contact_mail', description: 'Escríbenos y nuestro equipo te atenderá rápidamente' },
      { label: 'Guía de uso', pathName: 'help', icon: 'menu_book', description: 'Manual completo con todas las funciones disponibles' },
    ],
  },
  {
    name: 'Precios', pathName: 'pricing', icon: 'payments', requiredLogin: false,
    description: 'Planes flexibles desde $499 MXN/año — elige el tuyo',
    children: [
      { label: 'Plan Bronce', pathName: 'checkout', params: { planId: 'bronce' }, icon: 'workspace_premium', description: 'Protección básica — 1 QR activo, contador de escaneos' },
      { label: 'Plan Plata', pathName: 'checkout', params: { planId: 'plata' }, icon: 'workspace_premium', description: 'La opción más equilibrada — 3 QRs, historial 30 días' },
      { label: 'Plan Oro', pathName: 'checkout', params: { planId: 'oro' }, icon: 'workspace_premium', description: 'Control total — 5 QRs, mapa dinámico, ilimitado' },
      { label: 'Ver todos los planes', pathName: 'pricing', icon: 'apps', description: 'Compara todos los planes y elige el que más te convenga' },
    ],
  },
]

const domains = ['ubiqueme.com', 'contactomio.com', 'localizarme.com'];
const currentDomainIndex = ref(0);
const isMobileMenuOpen = ref(false);
const isScrolled = ref(false);
const currentLang = ref('ES');
let intervalId: ReturnType<typeof setInterval> | undefined;

const changeLang = (code: string) => {
  document.cookie = `googtrans=/es/${code}; path=/; max-age=31536000`;
  location.reload();
}

const getCookieLang = (): string => {
  const m = document.cookie.match(/googtrans=.*\/([a-z]{2})/);
  return m?.[1]?.toUpperCase() ?? 'ES';
}

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

// Scroll lock on body when mobile menu is open
watch(isMobileMenuOpen, (open) => {
  document.body.style.overflow = open ? 'hidden' : ''
})

onMounted(() => {
  currentLang.value = getCookieLang();

  intervalId = setInterval(() => {
    currentDomainIndex.value = (currentDomainIndex.value + 1) % domains.length;
  }, 5000);

  const handleScroll = () => {
    isScrolled.value = window.scrollY > 20;
  };
  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();
});

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId);
  document.body.style.overflow = '';
});
</script>

<template>
  <div class="font-google-sans">
    <!-- TopNavBar -->
    <nav :class="[
      'fixed top-0 w-full z-50 transition-all duration-500',
      isScrolled
        ? 'bg-white border-b border-gray-200 shadow-[0_4px_40px_rgba(0,0,0,0.08)]'
        : 'bg-white border-b border-gray-200'
    ]">

      <!-- Subtle Orange Top Line -->
      <div
        class="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-orange-600 to-transparent">
      </div>

      <!-- Grain texture overlay -->
      <div class="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-overlay grain-overlay">
      </div>

      <div
        class="relative mx-auto flex h-22 w-full max-w-screen-2xl items-center justify-between px-5 md:px-10 xl:px-14">

        <!-- LEFT -->
        <div class="flex items-center gap-5">

          <TrustCarousel />

          <!-- LOGO + Animated Domain -->
          <RouterLink :to="{ name: 'home' }"
            class="group flex items-center gap-3 rounded-xl transition-all duration-300">



            <!-- MOBILE: compact animated domain -->
            <div class="flex items-center gap-1.5 lg:hidden">
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

            <!-- DESKTOP: animated domain -->
            <div class="hidden min-w-[240px] flex-col justify-center lg:flex">
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
            </div>

          </RouterLink>
        </div>

        <!-- CENTER | Desktop Navigation -->
        <div class="hidden flex-1 items-center justify-center lg:flex">

          <nav
            class="flex items-center gap-1 rounded-full border border-gray-200 bg-white/70 p-1 shadow-sm backdrop-blur-md">

            <template v-for="link in navLinks" :key="link.name">

              <div class="relative" @mouseenter="openMenu(link.name)" @mouseleave="closeMenu()">

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
                  <span class="font-google-sans text-sm font-medium">{{ link.name }}</span>
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
                  <span class="font-google-sans text-sm font-medium">{{ link.name }}</span>
                  <span class="material-symbols-outlined notranslate text-[18px] transition-all duration-300"
                    :class="activeMenu === link.name ? 'rotate-180' : ''">expand_more</span>
                </button>

                <!-- DROPDOWN -->
                <Transition name="dropdown">
                  <div v-if="link.children && activeMenu === link.name"
                    class="absolute left-1/2 top-full z-50 mt-4 w-72 -translate-x-1/2 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl"
                    @mouseenter="cancelClose()" @mouseleave="closeMenu()">

                    <div class="border-b border-gray-100 bg-gradient-to-r from-orange-50 to-white px-5 py-4">
                      <h4 class="font-google-sans text-sm font-semibold text-gray-700">{{ link.name }}</h4>
                      <p v-if="link.description" class="mt-1 text-[11px] leading-snug text-gray-500">{{ link.description
                        }}</p>
                    </div>

                    <div class="p-2">
                      <button v-for="child in link.children" :key="child.label" @click="handleChildClick(child)"
                        class="group flex w-full cursor-pointer items-start gap-3 rounded-xl px-4 py-3 transition-all duration-200 hover:bg-orange-50">
                        <span v-if="child.icon"
                          class="material-symbols-outlined notranslate mt-0.5 text-[20px] text-gray-400 transition-colors duration-300 group-hover:text-orange-500">
                          {{ child.icon }}
                        </span>
                        <div class="flex min-w-0 flex-col items-start">
                          <span
                            class="text-sm font-medium text-gray-700 transition-colors group-hover:text-orange-600">{{
                              child.label }}</span>
                          <span v-if="child.description"
                            class="mt-0.5 text-[11px] leading-snug text-gray-400 text-left">{{ child.description
                            }}</span>
                        </div>
                      </button>
                    </div>

                  </div>
                </Transition>

              </div>

            </template>

          </nav>

        </div>
        <!-- RIGHT | User Actions -->
        <div class="hidden lg:flex items-center gap-3 ml-8">

          <RouterLink v-if="$route.name !== 'dashboard'" :to="{ name: 'dashboard' }"
            class="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition-all duration-300 hover:border-orange-300 hover:bg-orange-50 hover:text-orange-600">
            <span class="material-symbols-outlined notranslate text-[18px]">dashboard</span>
            Panel
          </RouterLink>

          <button @click="handleLogout"
            class="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition-all duration-300 hover:border-orange-300 hover:bg-orange-50 hover:text-orange-600">
            <span class="material-symbols-outlined notranslate text-[18px]">logout</span>
            Cerrar sesión
          </button>

        </div>

        <!-- MOBILE | Hamburger -->
        <div class="flex items-center gap-2 lg:hidden">

          <button @click="isMobileMenuOpen = !isMobileMenuOpen"
            class="group flex items-center gap-2 rounded-2xl border border-orange-100 bg-white px-4 py-2.5 text-gray-700 transition-all duration-300 hover:border-orange-200 hover:bg-orange-50 active:scale-95">
            <span
              class="material-symbols-outlined notranslate text-[24px] text-orange-500 transition-transform duration-300 group-hover:scale-110">
              {{ isMobileMenuOpen ? 'close' : 'menu' }}
            </span>

            <span class="text-sm font-semibold tracking-tight text-gray-800">
              {{ isMobileMenuOpen ? 'Cerrar' : 'Menú' }}
            </span>
          </button>

        </div>

        <!-- MOBILE MENU OVERLAY -->
        <Transition enter-active-class="transition duration-300 ease-out" enter-from-class="opacity-0 -translate-y-4"
          enter-to-class="opacity-100 translate-y-0" leave-active-class="transition duration-200 ease-in"
          leave-from-class="opacity-100 translate-y-0" leave-to-class="opacity-0 -translate-y-4">

          <div v-if="isMobileMenuOpen" class="absolute left-0 right-0 top-full z-[90] mt-3 px-4 lg:hidden">

            <div
              class="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-2xl max-h-[calc(100vh-120px)] overflow-y-auto">

              <!-- USER ACTIONS -->
              <div class="border-b border-gray-100 p-4">

                <RouterLink v-if="$route.name !== 'dashboard'" :to="{ name: 'dashboard' }"
                  @click="isMobileMenuOpen = false"
                  class="mb-3 flex items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 font-medium text-gray-700 transition hover:bg-orange-50 hover:text-orange-600">
                  <span class="material-symbols-outlined notranslate">dashboard</span>
                  Panel
                </RouterLink>

                <button @click="handleLogout(); isMobileMenuOpen = false"
                  class="flex w-full items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 font-medium text-gray-700 transition hover:bg-orange-50 hover:text-orange-600">
                  <span class="material-symbols-outlined notranslate">logout</span>
                  Cerrar sesión
                </button>

                <!-- Language selector -->
                <div class="mt-3 pt-3 border-t border-gray-100">
                  <div class="flex items-center justify-center gap-1">
                    <button @click="changeLang('es'); isMobileMenuOpen = false"
                      class="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-medium transition-colors"
                      :class="currentLang === 'ES' ? 'bg-orange-50 text-orange-600 border border-orange-200' : 'text-slate-500 hover:text-slate-700'">
                      <span class="text-sm">🇲🇽</span> ES
                    </button>
                    <button @click="changeLang('en'); isMobileMenuOpen = false"
                      class="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-medium transition-colors"
                      :class="currentLang === 'EN' ? 'bg-orange-50 text-orange-600 border border-orange-200' : 'text-slate-500 hover:text-slate-700'">
                      <span class="text-sm">🇺🇸</span> EN
                    </button>
                    <button @click="changeLang('pt'); isMobileMenuOpen = false"
                      class="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-medium transition-colors"
                      :class="currentLang === 'PT' ? 'bg-orange-50 text-orange-600 border border-orange-200' : 'text-slate-500 hover:text-slate-700'">
                      <span class="text-sm">🇧🇷</span> PT
                    </button>
                  </div>
                </div>

              </div>

              <!-- NAVIGATION -->
              <div class="p-2">

                <template v-for="link in navLinks" :key="link.name">

                  <!-- LINK -->
                  <RouterLink v-if="!link.children" :to="{ name: link.pathName }" @click="isMobileMenuOpen = false"
                    class="group mb-1 flex items-center gap-3 rounded-2xl px-4 py-3 transition-all duration-200 hover:bg-orange-50">
                    <span class="material-symbols-outlined notranslate text-gray-400 group-hover:text-orange-500">{{
                      link.icon }}</span>
                    <span class="font-medium text-gray-700 group-hover:text-orange-600">{{ link.name }}</span>
                  </RouterLink>

                  <!-- GROUP -->
                  <div v-else class="mb-2 overflow-hidden rounded-2xl border border-gray-100">
                    <div class="flex items-center gap-3 bg-gray-50 px-4 py-3">
                      <span class="material-symbols-outlined notranslate text-gray-400">{{ link.icon }}</span>
                      <span class="font-semibold text-gray-700">{{ link.name }}</span>
                    </div>
                    <button v-for="child in link.children" :key="child.label"
                      @click="handleChildClick(child); isMobileMenuOpen = false"
                      class="flex w-full items-center gap-3 px-5 py-3 text-left transition hover:bg-orange-50">
                      <span v-if="child.icon" class="material-symbols-outlined notranslate text-gray-400">{{ child.icon
                        }}</span>
                      <span class="text-sm text-gray-700">{{ child.label }}</span>
                    </button>
                  </div>

                </template>

              </div>

            </div>

          </div>

        </Transition>

      </div>
    </nav>

    <!-- Main -->
    <main class="scrollbar-hide">
      <slot name="main"></slot>
    </main>

  </div>
</template>

<style scoped>
.grain-overlay {
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
  background-repeat: repeat;
  background-size: 128px 128px;
}

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

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

/* Dropdown transition */
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

@media (prefers-reduced-motion: reduce) {

  .slide-up-enter-active,
  .slide-up-leave-active {
    transition: none;
  }

  nav {
    transition: none;
  }
}
</style>
