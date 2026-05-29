<script lang="ts" setup>
import ButtonDash from '@/components/user/dashboard/ButtonDash.vue'
import UserDashoardLayout from '@/layouts/UserDashoardLayout.vue'
import MainLoader from '@/components/ui/MainLoader.vue'
import { useAuth } from '@/handleAuth'
import { defineAsyncComponent, ref, shallowRef } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const hoverOnSideBar = ref(false)
let timeout = null as any

const handleSideBarHover = () => {
  if (timeout) clearTimeout(timeout)
  hoverOnSideBar.value = true
}

const handleSideBarLeave = () => {
  if (timeout) clearTimeout(timeout)
  timeout = setTimeout(() => {
    hoverOnSideBar.value = false
  }, 50)
}

const dashButtons = [
  { name: 'Mis QR', icon: 'co-qr-code', iconActive: 'md-qrcodescanner-round' },
  { name: 'Configuración', icon: 'co-settings', iconActive: 'md-settings' },
  { name: 'Soporte', icon: 'bi-question-circle', iconActive: 'md-help-sharp' },
  { name: 'Cerrar Sesión', icon: 'io-log-in', iconActive: 'ri-logout-box-r-line' },
]

const mobileButtons = [
  { name: 'Mis QR', label: 'QRs', icon: 'co-qr-code', iconActive: 'md-qrcodescanner-round' },
  { name: 'Configuración', label: 'Ajustes', icon: 'co-settings', iconActive: 'md-settings' },
  { name: 'Soporte', label: 'Ayuda', icon: 'bi-question-circle', iconActive: 'md-help-sharp' },
]

type ComponentName = 'Mis QR' | 'Configuración' | 'Cerrar Sesión' | 'Soporte'

const withLoader = (viewPath: () => Promise<any>) => {
  return defineAsyncComponent({
    loader: viewPath,
    loadingComponent: MainLoader,
    delay: 200,
  })
}

const componentsMap: Record<string, ReturnType<typeof defineAsyncComponent>> = {
  'Mis QR': withLoader(() => import('../../components/user/dashboard/QRDash/MyQrDash.vue')),
  Configuración: withLoader(() => import('../../components/user/dashboard/settings/SettingsDash.vue')),
  Soporte: defineAsyncComponent(() => import('../../components/user/dashboard/support/SupportDash.vue')),
}

const currentComponent = shallowRef(componentsMap['Mis QR'])
const { handleLogout } = useAuth()

const changeComponent = (component: ComponentName) => {
  if (component == 'Cerrar Sesión') {
    handleLogout()
    return
  }
  currentComponent.value = componentsMap[component] ?? componentsMap['Inicio']
}
</script>

<template>
  <UserDashoardLayout>
    <template #main>
      <div class="flex relative min-h-screen bg-[#09090b] overflow-hidden font-google-sans">


        <!-- 🚀 SIDEBAR (OVERLAY MODE) - Desktop Only -->
        <aside @mouseenter="handleSideBarHover" @mouseleave="handleSideBarLeave"
          :class="{ 'w-[260px]': hoverOnSideBar, 'w-24': !hoverOnSideBar }"
          class="hidden lg:flex absolute left-0 top-0 z-30 pt-20 transition-[width] duration-300 h-screen flex-col items-center py-10 border-r border-white/5 bg-[#09090b] will-change-[width]">

          <div class="mb-12">
            <div class="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-2xl">
              <span class="text-black font-black text-xl">U</span>
            </div>
          </div>

          <div class="flex-1 w-full space-y-2 px-4 overflow-hidden justify-evenly h-full flex flex-col">
            <ButtonDash @click="changeComponent(btn.name as ComponentName)" v-for="(btn, index) in dashButtons"
              :key="btn.name" :name="btn.name" :isHover="hoverOnSideBar" :index="index" :icon="btn.icon"
              :iconActive="btn.iconActive" :active="componentsMap[btn.name] === currentComponent" />
          </div>

          <!-- Request QR Button -->
          <button @click="router.push({ name: 'request-qr' })"
            class="mb-4 w-full flex items-center cursor-pointer transition-all duration-300 rounded-2xl px-3 py-3 gap-3 border border-orange-500/20 bg-orange-500/5 hover:bg-orange-500/15 hover:border-orange-500/40 group overflow-hidden">
            <span class="material-symbols-outlined text-orange-400 text-[22px] flex-shrink-0">add_circle</span>
            <span v-if="hoverOnSideBar"
              class="text-orange-400 text-[11px] font-black uppercase tracking-widest whitespace-nowrap transition-all">Solicitar
              QR</span>
          </button>

          <div class="mt-auto opacity-20 text-[8px] font-black uppercase tracking-[0.3em] font-mono whitespace-nowrap"
            v-if="hoverOnSideBar">
            System Terminal v2.4
          </div>
        </aside>

        <!-- 🚀 MAIN CONTENT AREA (FIXED OFFSET) -->
        <div
          class="relative z-10 flex-1 h-screen overflow-y-auto scrollbar-hide p-4 sm:p-8 lg:p-2 ml-0 lg:ml-24 lg:pt-16 pt-24! pb-28 lg:pb-8">
          <section class="w-full ">
            <component :is="currentComponent"></component>
          </section>
        </div>

        <!-- 📱 FLOATING BOTTOM NAVIGATION BAR - Mobile Only -->
        <nav
          class="lg:hidden fixed bottom-4 left-4 right-4 bg-[#09090b]/90 backdrop-blur-xl border border-white/10 rounded-[24px] h-16 px-4 z-40 flex items-center justify-around shadow-[0_8px_32px_0_rgba(249,115,22,0.15)] transition-all duration-300">
          <button v-for="btn in mobileButtons" :key="btn.name" @click="changeComponent(btn.name as ComponentName)"
            class="flex flex-col items-center justify-center text-center gap-1 cursor-pointer transition-all duration-300 w-12 h-12 rounded-xl active:scale-95"
            :class="componentsMap[btn.name] === currentComponent ? 'text-orange-500 scale-105' : 'text-white/40 hover:text-white/70'">
            <v-icon :name="componentsMap[btn.name] === currentComponent ? btn.iconActive : btn.icon" scale="1.2" />
            <span class="text-[9px] font-bold tracking-tight uppercase">{{ btn.label }}</span>
          </button>
          <!-- Request QR Shortcut (mobile) -->
          <button @click="router.push({ name: 'request-qr' })"
            class="flex flex-col items-center justify-center text-center gap-1 cursor-pointer transition-all duration-300 w-12 h-12 rounded-xl active:scale-95 text-orange-400">
            <span class="material-symbols-outlined text-[22px]">add_circle</span>
            <span class="text-[9px] font-bold tracking-tight uppercase">QR</span>
          </button>
        </nav>

      </div>
    </template>
  </UserDashoardLayout>
</template>

<style scoped>
.font-google-sans {
  font-family: 'Google Sans', sans-serif;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
