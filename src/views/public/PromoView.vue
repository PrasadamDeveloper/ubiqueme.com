<script lang="ts" setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import HomeLayout from '@/layouts/HomeLayout.vue'
import UbiquemeLogo from '@/assets/Ubiqueme_Logo_white.webp'

const route = useRoute()
const promoCode = computed(() => (route.query.code as string) || 'UBQ')

const registerTarget = computed(() => ({
  name: 'register',
  query: route.query.code ? { code: route.query.code } : undefined,
}))

const benefits = [
  { icon: 'workspace_premium', title: '1 año del plan Bronce', desc: 'Activo desde el día que creas tu cuenta, sin costo.' },
  { icon: 'qr_code_2', title: 'Tu primer código QR', desc: 'Protege un objeto, mascota o familiar de inmediato.' },
  { icon: 'notifications_active', title: 'Alertas en tiempo real', desc: 'Recibe avisos por WhatsApp al escanear tu QR.' },
  { icon: 'shield_lock', title: 'Tu información segura', desc: 'Tu contacto nunca se expone a quien escanea.' },
]

const steps = [
  { icon: 'person_add', title: 'Crea tu cuenta', desc: 'Solo tu nombre, correo y una contraseña.' },
  { icon: 'card_giftcard', title: 'Activa tu beneficio', desc: 'Tu año gratis queda asociado automáticamente.' },
  { icon: 'qr_code_2', title: 'Protege lo tuyo', desc: 'Genera tu QR y pégalo a lo que quieras cuidar.' },
]
</script>

<template>
  <HomeLayout>
    <template #main>
      <main class="relative overflow-hidden bg-white font-google-sans">

        <!-- ORNAMENTATION -->
        <div class="pointer-events-none absolute inset-0 z-0">
          <div
            class="absolute -top-24 right-[-10%] h-[520px] w-[520px] rounded-full border border-orange-500/15">
          </div>
          <div
            class="absolute bottom-[-15%] left-[-8%] h-[420px] w-[420px] rounded-full border border-gray-200/60">
          </div>
          <div
            class="absolute left-1/2 top-[-20%] h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-gradient-to-b from-orange-50 to-transparent blur-2xl">
          </div>
          <div class="absolute inset-0 opacity-[0.04]"
            style="background-image: radial-gradient(rgba(0,0,0,0.35) 1px, transparent 1px); background-size: 22px 22px;">
          </div>
        </div>

        <section
          class="relative z-10 mx-auto flex max-w-5xl flex-col items-center px-5 pb-16 pt-28 sm:px-10 md:pt-32">

          <!-- Confetti dots -->
          <div class="pointer-events-none absolute left-1/2 top-24 -translate-x-1/2 opacity-70">
            <span
              class="material-symbols-outlined notranslate absolute -left-10 top-0 text-2xl text-orange-300">stars</span>
            <span
              class="material-symbols-outlined notranslate absolute left-14 top-6 text-lg text-amber-300">celebration</span>
            <span
              class="material-symbols-outlined notranslate absolute -left-4 top-10 text-xl text-orange-400">auto_awesome</span>
          </div>

          <!-- Unlocked badge -->
          <div
            class="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50/80 px-4 py-1.5 shadow-sm">
            <span class="material-symbols-outlined notranslate text-[16px] text-orange-500">verified</span>
            <span class="text-[10px] font-bold uppercase tracking-[0.22em] text-orange-600">Beneficio desbloqueado</span>
          </div>

          <!-- Hero copy -->
          <h1 class="mt-6 max-w-2xl text-center text-4xl font-black leading-[1.05] tracking-tight text-slate-900 sm:text-5xl md:text-6xl">
            Desbloqueaste<br />
            <span class="bg-gradient-to-r from-orange-500 via-orange-600 to-amber-400 bg-clip-text text-transparent">1 año
              GRATIS</span>
          </h1>

          <p class="mt-5 max-w-xl text-center text-base leading-7 text-slate-500 sm:text-lg">
            Bienvenido a <strong class="font-semibold text-slate-700">ubiqueme.com</strong>. Gracias a la promoción
            exclusiva del evento, tu cuenta incluye un año completo del plan Bronce, sin costo alguno.
          </p>

          <!-- Promo code chip -->
          <div
            class="mt-7 inline-flex items-center gap-3 rounded-2xl border border-orange-200 bg-white px-5 py-3 shadow-sm">
            <span class="material-symbols-outlined notranslate text-[18px] text-orange-500">local_activity</span>
            <div class="text-left">
              <p class="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">Tu código de promoción</p>
              <p class="font-mono text-base font-black tracking-[0.2em] text-slate-900">{{ promoCode }}</p>
            </div>
          </div>

          <!-- Primary CTA -->
          <RouterLink :to="registerTarget"
            class="group mt-9 inline-flex h-14 w-full max-w-sm items-center justify-center gap-3 rounded-2xl bg-orange-500 text-white shadow-lg shadow-orange-200 transition-all duration-300 hover:-translate-y-0.5 hover:bg-orange-600 hover:shadow-orange-300 active:scale-[0.98]">
            <span class="material-symbols-outlined notranslate text-[20px]">person_add</span>
            <span class="text-sm font-bold uppercase tracking-widest">Crear mi cuenta y activar</span>
            <span
              class="material-symbols-outlined notranslate text-[18px] transition-transform duration-300 group-hover:translate-x-1">arrow_forward</span>
          </RouterLink>

          <p class="mt-3 text-xs text-slate-400">
            Sin tarjeta de crédito · Solo unos segundos · Sin permanencia
          </p>

          <!-- How it works -->
          <div class="mt-14 w-full">
            <h2 class="text-center text-[12px] font-bold uppercase tracking-[0.22em] text-slate-400">
              Cómo activar tu beneficio
            </h2>
            <div class="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div v-for="(step, i) in steps" :key="step.title"
                class="relative rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                <div
                  class="absolute -top-3 left-5 flex h-7 w-7 items-center justify-center rounded-full bg-orange-500 text-xs font-black text-white shadow-md shadow-orange-200">
                  {{ i + 1 }}
                </div>
                <div class="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50">
                  <span class="material-symbols-outlined notranslate text-[22px] text-orange-500">{{ step.icon }}</span>
                </div>
                <h3 class="mt-4 text-[15px] font-bold text-slate-900">{{ step.title }}</h3>
                <p class="mt-1 text-[13px] leading-5 text-slate-500">{{ step.desc }}</p>
              </div>
            </div>
          </div>

          <!-- Benefits -->
          <div class="mt-16 w-full">
            <div class="flex flex-col items-center gap-6 md:flex-row md:items-start md:gap-8">
              <!-- Logo / card visual -->
              <div
                class="hidden shrink-0 md:flex md:flex-col md:items-center md:gap-4 md:pt-4">
                <div
                  class="flex h-24 w-24 items-center justify-center rounded-3xl bg-black shadow-lg">
                  <img :src="UbiquemeLogo" alt="Ubiqueme Logo" class="h-14 w-14 object-contain" />
                </div>
                <p class="text-center text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                  Plan Bronce
                </p>
              </div>

              <div class="w-full">
                <h2 class="text-center text-[12px] font-bold uppercase tracking-[0.22em] text-slate-400 md:text-left">
                  Todo lo que incluye tu año gratis
                </h2>
                <div class="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div v-for="benefit in benefits" :key="benefit.title"
                    class="flex items-start gap-3 rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                    <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-orange-50">
                      <span class="material-symbols-outlined notranslate text-[18px] text-orange-500">{{ benefit.icon }}</span>
                    </div>
                    <div class="min-w-0">
                      <h3 class="text-[14px] font-bold text-slate-900">{{ benefit.title }}</h3>
                      <p class="mt-0.5 text-[12px] leading-5 text-slate-500">{{ benefit.desc }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Secondary CTA -->
          <RouterLink :to="registerTarget"
            class="mt-14 inline-flex h-14 w-full max-w-sm items-center justify-center gap-3 rounded-2xl bg-slate-900 text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-800 active:scale-[0.98]">
            <span class="material-symbols-outlined notranslate text-[20px]">card_giftcard</span>
            <span class="text-sm font-bold uppercase tracking-widest">Quiero mi año gratis</span>
          </RouterLink>

          <p class="mt-8 flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.15em] text-slate-300">
            <span class="material-symbols-outlined notranslate text-[12px]">lock</span>
            Sitio seguro · Ubiqueme · AZIECHRIE PHARMA
          </p>
        </section>
      </main>
    </template>
  </HomeLayout>
</template>

<style scoped>
.font-google-sans {
  font-family: 'Google Sans', 'Inter', sans-serif;
}

.material-symbols-outlined {
  font-variation-settings: 'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 24;
}
</style>
