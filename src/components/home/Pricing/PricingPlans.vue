<script lang="ts" setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { plans } from '@/data/plans'
const router = useRouter()
const userStore = useUserStore()

const selectedCurrency = ref<'MXN' | 'USD' | 'CLP'>('MXN')

const currencies = [
  { key: 'MXN', label: 'MXN' },
  { key: 'USD', label: 'USD' },
  { key: 'CLP', label: 'CLP' },
]

const planIcons: Record<string, string> = {
  bronce: 'shield',
  plata: 'verified_user',
  oro: 'workspace_premium',
}

const summaryItems = [
  { icon: 'notifications_active', title: 'Alerta inmediata', desc: 'Notificación por WhatsApp en cuanto escanean su código.' },
  { icon: 'lock', title: 'Su número protegido', desc: 'La persona que escanee sólo ve la cuenta oficial de Ubiqueme.' },
  { icon: 'contact_phone', title: 'Datos de quien escanea', desc: 'Recibe su número, mensaje y foto si la comparte.' },
  { icon: 'monitoring', title: 'Registro de escaneos', desc: 'Contador e historial de cada escaneo en su dashboard.' },
]

const howItWorks = [
  'Alguien escanea su QR y se abre el chat oficial de Ubiqueme en WhatsApp, con un mensaje prellenado que incluye el ID y el nombre de su código.',
  'Su número y su identidad nunca se muestran: la persona que escaneó su QR solo ve la cuenta oficial de Ubiqueme.',
  'Usted recibe la notificación al instante en su WhatsApp con los datos de quien escaneó: su número, su mensaje y su foto si la envió.',
  'Su dashboard guarda el registro y el contador de cada escaneo para que usted tenga control total.',
]


const handlePlanClick = (planId: string) => {
  if (userStore.isAuthenticated) {
    router.push({
      name: 'checkout',
      params: { planId }
    })
  } else {
    router.push({
      name: 'login',
      query: {
        redirect: `/checkout/${planId}`
      }
    })
  }
}

</script>


<template>
  <section class="bg-slate-50 py-16 sm:py-20 overflow-hidden">
    <div class="mx-auto max-w-7xl px-5 sm:px-8">

      <!-- Header -->
      <header class="mx-auto mb-10 max-w-2xl text-center sm:mb-14">
        <span
          class="inline-block rounded-full bg-white border border-slate-200 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          Planes
        </span>
        <h2 class="mt-5 text-[28px] font-semibold leading-tight tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
          Elija la protección que necesita
        </h2>
        <p class="mx-auto mt-3 max-w-lg text-[15px] leading-relaxed text-slate-500">
          Todos los planes incluyen la misma protección por WhatsApp: alertas al instante,
          su número oculto y el registro de cada escaneo. Solo cambia cuántos códigos QR protege.
        </p>
      </header>

      <!-- Resumen: lo que incluye cada plan -->
      <div class="mx-auto mb-12 max-w-4xl">
        <div class="ios-shadow rounded-3xl bg-white border border-slate-100 p-5 sm:p-8">
          <div class="mb-6 flex items-center gap-2.5">
            <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100">
              <span class="material-symbols-outlined notranslate text-[18px] text-slate-500">layers</span>
            </div>
            <div>
              <h3 class="text-[16px] font-semibold text-slate-900">Cada plan incluye</h3>
              <p class="text-[12px] text-slate-400">Elija según cuántos códigos QR necesita proteger.</p>
            </div>
          </div>
          <div class="grid gap-3 sm:grid-cols-2">
            <div v-for="item in summaryItems" :key="item.title"
              class="flex items-start gap-3 rounded-2xl bg-slate-50 p-3.5">
              <div
                class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white border border-slate-200">
                <span class="material-symbols-outlined notranslate text-[19px] text-slate-500">{{ item.icon }}</span>
              </div>
              <div class="min-w-0">
                <p class="text-[14px] font-semibold text-slate-900">{{ item.title }}</p>
                <p class="mt-0.5 text-[12px] leading-relaxed text-slate-500">{{ item.desc }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Currency segmented control -->
      <div class="flex justify-center mb-10">
        <div class="inline-flex rounded-full bg-white border border-slate-200 p-1 shadow-sm">
          <button v-for="currency in currencies" :key="currency.key" @click="selectedCurrency = currency.key as any"
            class="px-4 py-1.5 rounded-full text-[12px] font-semibold transition"
            :class="selectedCurrency === currency.key ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'">
            {{ currency.label }}
          </button>
        </div>
      </div>

      <!-- Planes -->
      <div class="grid items-stretch gap-5 sm:gap-6 md:grid-cols-3">
        <article v-for="plan in plans" :key="plan.id"
          class="ios-shadow relative flex flex-col rounded-3xl bg-white p-6 sm:p-7 transition-all duration-300" :class="plan.recommended
            ? 'border border-orange-200 ring-1 ring-orange-100 md:-translate-y-2'
            : 'border border-slate-100 hover:-translate-y-1 hover:border-slate-200'">

          <!-- Badge -->
          <div v-if="plan.badge"
            class="absolute -top-3 left-6 rounded-full bg-orange-500 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white shadow-sm">
            {{ plan.badge }}
          </div>

          <!-- Identity: icono slate + título + resumen -->
          <div class="flex items-start gap-3.5">
            <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-100"
              :class="plan.recommended ? 'bg-orange-50' : ''">
              <span class="material-symbols-outlined notranslate text-[24px]"
                :class="plan.recommended ? 'text-orange-500' : 'text-slate-500'">{{ planIcons[plan.id] }}</span>
            </div>
            <div class="min-w-0 pt-0.5">
              <h3 class="text-lg font-semibold tracking-tight text-slate-900 sm:text-xl">{{ plan.name }}</h3>
              <p class="mt-1 text-[12px] leading-relaxed text-slate-500 sm:text-[13px]">{{ plan.tagline }}</p>
            </div>
          </div>

          <!-- Price -->
          <div class="mt-6 border-b border-slate-100 pb-5">
            <div class="flex items-end gap-1.5">
              <span class="text-[34px] font-bold tracking-tight text-slate-900 sm:text-[40px]">
                {{ plan.prices[selectedCurrency].symbol }}{{ plan.prices[selectedCurrency].price }}
              </span>
              <span class="text-[13px] font-medium text-slate-400">{{ selectedCurrency }}</span>
              <span
                class="ml-auto rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Año</span>
            </div>
            <p class="mt-1.5 text-[12px] text-slate-400">≈ ${{ plan.prices[selectedCurrency].monthly }} / mes</p>
          </div>

          <!-- Features -->
          <ul class="mt-5 flex-1 space-y-2.5">
            <li v-for="(feature, idx) in plan.features" :key="idx" class="flex items-start gap-2.5">
              <span class="material-symbols-outlined notranslate mt-0.5 text-[16px]"
                :class="feature.included ? 'text-slate-400' : 'text-slate-200'">
                {{ feature.included ? 'check_circle' : 'cancel' }}
              </span>
              <span class="text-[13px] leading-snug"
                :class="feature.included ? 'text-slate-700' : 'text-slate-300 line-through'">
                {{ feature.label }}
              </span>
            </li>
          </ul>

          <!-- CTA -->
          <button @click="handlePlanClick(plan.id)"
            class="mt-6 h-12 rounded-full text-sm font-semibold transition active:scale-[0.97]" :class="plan.recommended
              ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/25 hover:bg-orange-600'
              : 'bg-slate-900 text-white hover:bg-slate-700'">
            Activar {{ plan.name }}
          </button>
        </article>
      </div>

      <!-- Cómo le avisamos -->
      <div class="mx-auto mt-10 max-w-3xl">
        <div class="ios-shadow rounded-3xl bg-white border border-slate-100 p-5 sm:p-7">
          <div class="flex items-center gap-2.5">
            <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-100">
              <v-icon name="bi-whatsapp" class="text-green-600 text-[18px] notranslate" />
            </div>
            <h3 class="text-[15px] font-semibold text-slate-900">¿Cómo le avisamos cuando escanean su QR?</h3>
          </div>
          <ol class="mt-4 space-y-2.5">
            <li v-for="(step, i) in howItWorks" :key="i"
              class="flex items-start gap-2.5 text-[13px] leading-relaxed text-slate-600">
              <span
                class="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-500">{{
                  i + 1 }}</span>
              <span>{{ step }}</span>
            </li>
          </ol>
        </div>
      </div>

      <!-- Shipping – iOS grouped cell -->
      <div class="mx-auto mt-8 max-w-3xl">
        <div class="ios-shadow rounded-3xl bg-white border border-slate-100 p-5 sm:p-6">
          <div class="flex flex-col items-center gap-2 text-center">
            <div class="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
              <span class="material-symbols-outlined notranslate text-orange-500 text-[20px]">local_shipping</span>
            </div>
            <p class="text-[15px] font-semibold text-slate-900">Envío físico incluido en México</p>
            <p class="max-w-md text-[13px] leading-relaxed text-slate-500">
              Cada plan incluye un primer envío gratuito. Los códigos adicionales pueden solicitarse posteriormente.
            </p>
          </div>
        </div>
      </div>

    </div>
  </section>
</template>

<style scoped>
.ios-shadow {
  box-shadow:
    0 20px 40px -20px rgba(15, 23, 42, 0.12),
    0 0 0 1px rgba(15, 23, 42, 0.03);
}

.material-symbols-outlined {
  font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}
</style>
