<script lang="ts" setup>
import ButtonDash from '@/components/user/dashboard/ButtonDash.vue'
import UserDashoardLayout from '@/layouts/UserDashoardLayout.vue'
import MainLoader from '@/components/ui/MainLoader.vue'
import { useAuth } from '@/handleAuth'
import { computed, defineAsyncComponent, ref, onMounted, onUnmounted } from 'vue'
import { useUserStore } from '@/stores/user.ts'
import { useComponentsStore } from '@/stores/components.ts'

const hoverOnSideBar = ref(false)
let timeout = null as any

// ─── Mobile detection ──────────────────────────────────────────
const isMobile = ref(window.innerWidth < 768)
const onResize = () => { isMobile.value = window.innerWidth < 768 }
onMounted(() => window.addEventListener('resize', onResize))
onUnmounted(() => window.removeEventListener('resize', onResize))

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
  { name: 'Planes', icon: 'ri-medal-line', iconActive: 'ri-medal-fill' },
  { name: 'Configuración', icon: 'co-settings', iconActive: 'md-settings' },
  { name: 'Soporte', icon: 'bi-question-circle', iconActive: 'md-help-sharp' },
  { name: 'Cerrar Sesión', icon: 'io-log-in', iconActive: 'ri-logout-box-r-line' },

]

const mobileButtons = [
  { name: 'Mis QR', label: 'QRs', icon: 'co-qr-code', iconActive: 'md-qrcodescanner-round' },
  { name: 'Planes', label: 'Planes', icon: 'ri-medal-line', iconActive: 'ri-medal-fill' },
  { name: 'Configuración', label: 'Ajustes', icon: 'co-settings', iconActive: 'md-settings' },
  { name: 'Soporte', label: 'Ayuda', icon: 'bi-question-circle', iconActive: 'md-help-sharp' },
]

type ComponentName = 'Mis QR' | 'Configuración' | 'Cerrar Sesión' | 'Soporte' | 'Planes'

const withLoader = (viewPath: () => Promise<any>) => {
  return defineAsyncComponent({
    loader: viewPath,
    loadingComponent: MainLoader,
    delay: 200,
  })
}
const componentsStore = useComponentsStore();

const componentsMap: Record<string, ReturnType<typeof defineAsyncComponent>> = {
  'Mis QR': withLoader(() => import('../../components/user/dashboard/QRDash/MyQrDash.vue')),
  'Mis QR Mobile': withLoader(() => import('../../components/user/dashboard/QRDash/MyQrDashMobile.vue')),
  'Configuración': withLoader(() => import('../../components/user/dashboard/settings/SettingsDash.vue')),
  'Configuración Mobile': withLoader(() => import('../../components/user/dashboard/settings/SettingsDashMobile.vue')),
  'Soporte': defineAsyncComponent(() => import('../../components/user/dashboard/support/SupportDash.vue')),
  'Soporte Mobile': defineAsyncComponent(() => import('../../components/user/dashboard/support/SupportDashMobile.vue')),
  'Planes': defineAsyncComponent(() => import('../../components/user/dashboard/pricing/PricingDash.vue')),
  'Planes Mobile': defineAsyncComponent(() => import('../../components/user/dashboard/pricing/PricingDashMobile.vue')),
}

const currentComponent = computed(() => {
  const name = componentsStore.getCurrentComponent
  if (!isMobile.value) {
    return componentsMap[name] ?? componentsMap['Mis QR']
  }
  // Mobile routing
  const mobileKey = name === 'Mis QR' ? 'Mis QR Mobile'
    : name === 'Configuración' ? 'Configuración Mobile'
      : name === 'Soporte' ? 'Soporte Mobile'
        : name === 'Planes' ? 'Planes Mobile'
          : name
  return componentsMap[mobileKey] ?? componentsMap[name] ?? componentsMap['Mis QR']
})

const { handleLogout } = useAuth()

const changeComponent = (component: ComponentName) => {
  if (component == 'Cerrar Sesión') {
    handleLogout()
    return
  }


  componentsStore.changeComponent(component)
}

</script>

<template>
  <UserDashoardLayout>
    <template #main>
      <div class="flex relative min-h-screen bg-white overflow-hidden font-google-sans">


        <!-- 🚀 SIDEBAR (OVERLAY MODE) - Desktop Only -->
        <aside @mouseenter="handleSideBarHover" @mouseleave="handleSideBarLeave"
          :class="{ 'w-65  bg-white': hoverOnSideBar, 'w-24  bg-slate-50': !hoverOnSideBar }"
          class="hidden lg:flex absolute left-0 top-0 z-30 pt-24 transition-[width] duration-300 h-screen flex-col items-center py-10 border-r border-slate-200 will-change-[width] shadow-sm">

          <div class="mb-12 hidden">
            <div
              class="w-18 h-12 bg-[#090300] rounded-xl flex items-center justify-center shadow-2xl overflow-hidden absolute left-0">
              <span v-if="!hoverOnSideBar" class="text-orange-100 text-xs font-google-sans font-medium">{{
                'Hola'
                }}</span>
              <span v-else class="text-white text-xs font-google-sans animate-fade-right">{{ useUserStore().getFirstName
                }}</span>
            </div>
          </div>

          <div class="flex-1 w-full space-y-1 px-4 overflow-hidden justify-evenly h-full flex flex-col ">
            <ButtonDash @click="changeComponent(btn.name as ComponentName)" v-for="(btn, index) in dashButtons"
              :key="btn.name" :name="btn.name" :isHover="hoverOnSideBar" :index="index" :icon="btn.icon"
              :iconActive="btn.iconActive" :active="componentsStore.getCurrentComponent === btn.name" />
          </div>


          <div
            class="mt-auto text-slate-400 text-[8px] font-black uppercase tracking-[0.3em] font-mono whitespace-nowrap"
            v-if="hoverOnSideBar">
            System Terminal v2.4
          </div>
        </aside>

        <!-- 🚀 MAIN CONTENT AREA (FIXED OFFSET) -->
        <div
          class="relative z-10 w-full h-screen overflow-y-auto scrollbar-hide p-4 sm:p-8 lg:p-2 ml-0 lg:pl-24! lg:pt-15 pt-20! pb-28 lg:pb-8 bg-[#f2f1f1]  flex-1!">
          <section class="w-full  ">
            <component :is="currentComponent"></component>
          </section>
        </div>

        <!-- 📱 FLOATING BOTTOM NAVIGATION BAR - Mobile Only -->
        <nav
          class="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]"
          style="padding-bottom:env(safe-area-inset-bottom,0px)">
          <div class="flex items-center justify-around h-16">
            <button v-for="btn in mobileButtons" :key="btn.name" @click="changeComponent(btn.name as ComponentName)"
              class="flex flex-col items-center justify-center text-center gap-0.5 cursor-pointer transition-all duration-150 w-16 h-full rounded-xl active:scale-95 relative"
              :class="componentsStore.getCurrentComponent === btn.name ? 'text-orange-500' : 'text-slate-500 hover:text-slate-700'">
              <!-- Active indicator line -->
              <div v-if="componentsStore.getCurrentComponent === btn.name"
                class="absolute top-0 w-8 h-0.5 rounded-full bg-orange-500"></div>
              <v-icon :name="componentsStore.getCurrentComponent === btn.name ? btn.iconActive : btn.icon"
                scale="1.1" />
              <span class="text-[9px] font-bold tracking-tight uppercase">{{ btn.label }}</span>
            </button>
          </div>
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
