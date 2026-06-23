<script lang="ts" setup>
import ButtonDash from '@/components/user/dashboard/ButtonDash.vue'
import UserDashoardLayout from '@/layouts/UserDashoardLayout.vue'
import MainLoader from '@/components/ui/MainLoader.vue'
import { useAuth } from '@/handleAuth'
import { computed, defineAsyncComponent, ref } from 'vue'
import { useUserStore } from '@/stores/user.ts'
import { useComponentsStore } from '@/stores/components.ts'

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
  'Configuración': withLoader(() => import('../../components/user/dashboard/settings/SettingsDash.vue')),
  'Soporte': defineAsyncComponent(() => import('../../components/user/dashboard/support/SupportDash.vue')),
  'Planes': defineAsyncComponent(() => import('../../components/user/dashboard/pricing/PricingDash.vue')),
}

const currentComponent = computed(() => {
  const name = componentsStore.getCurrentComponent
  return componentsMap[name] ?? componentsMap['Mis QR']
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
      <div class="flex relative min-h-screen bg-[#09090b] overflow-hidden font-google-sans">


        <!-- 🚀 SIDEBAR (OVERLAY MODE) - Desktop Only -->
        <aside @mouseenter="handleSideBarHover" @mouseleave="handleSideBarLeave"
          :class="{ 'w-65  bg-[#0D0D0F]': hoverOnSideBar, 'w-24  bg-[#0D0D0F]': !hoverOnSideBar }"
          class="hidden lg:flex absolute left-0 top-0 z-30 pt-24 transition-[width] duration-300 h-screen flex-col items-center py-10 border-r border-white/5 will-change-[width]">

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


          <div class="mt-auto opacity-20 text-[8px] font-black uppercase tracking-[0.3em] font-mono whitespace-nowrap"
            v-if="hoverOnSideBar">
            System Terminal v2.4
          </div>
        </aside>

        <!-- 🚀 MAIN CONTENT AREA (FIXED OFFSET) -->
        <div
          class="relative z-10 w-full h-screen overflow-y-auto scrollbar-hide p-4 sm:p-8 lg:p-2 ml-0 lg:pl-24! lg:pt-15 pt-20! pb-28 lg:pb-8 bg-[#0e0e0e]  flex-1!">
          <section class="w-full  ">
            <component :is="currentComponent"></component>
          </section>
        </div>

        <!-- 📱 FLOATING BOTTOM NAVIGATION BAR - Mobile Only -->
        <nav
          class="lg:hidden fixed bottom-4 left-4 right-4 bg-[#09090b]/90 backdrop-blur-xl border border-white/10 rounded-[24px] h-16 px-4 z-40 flex items-center justify-around shadow-[0_8px_32px_0_rgba(249,115,22,0.15)] transition-all duration-300">
          <button v-for="btn in mobileButtons" :key="btn.name" @click="changeComponent(btn.name as ComponentName)"
            class="flex flex-col items-center justify-center text-center gap-1 cursor-pointer transition-all duration-300 w-12 h-12 rounded-xl active:scale-95"
            :class="componentsStore.getCurrentComponent === btn.name ? 'text-orange-800 scale-105' : 'text-white/40 hover:text-white/70'">
            <v-icon :name="componentsStore.getCurrentComponent === btn.name ? btn.iconActive : btn.icon" scale="1.2" />
            <span class="text-[9px] font-bold tracking-tight uppercase">{{ btn.label }}</span>
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
