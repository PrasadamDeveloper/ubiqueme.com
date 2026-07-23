<script lang="ts" setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import HomeLayout from '@/layouts/HomeLayout.vue'

const router = useRouter()

const currencies = [
  { key: 'MXN' as const, label: 'MXN', flag: '🇲🇽' },
  { key: 'USD' as const, label: 'USD', flag: '🇺🇸' },
  { key: 'CLP' as const, label: 'CLP', flag: '🇨🇱' },
]
const selectedCurrency = ref<'MXN' | 'USD' | 'CLP'>('MXN')

const plans = [
  {
    id: 'bronce',
    name: 'Bronce',
    description: 'Protección básica esencial',
    cta: 'Activar Bronce',
    prices: {
      MXN: { price: '499', symbol: '$', label: 'MXN', period: '/año', note: '1er envío físico gratis', monthly: '42' },
      USD: { price: '29', symbol: '$', label: 'USD', period: '/año', note: '1er envío físico gratis', monthly: '2.4' },
      CLP: { price: '25000', symbol: '$', label: 'CLP', period: '/año', note: '1er envío físico gratis', monthly: '2100' },
    },
    features: [
      { label: 'Hasta 1 código QR activo', included: true },
      { label: 'Contador de escaneos básico', included: true },
      { label: 'Mensajes predefinidos de contacto', included: true },
      { label: 'Pausar o reactivar QR', included: false },
      { label: 'Historial de escaneos', included: false },
      { label: 'Ubicación con Mapa dinámico', included: false },
      { label: 'Evidencia fotográfica adjunta', included: false },
      { label: 'Notificaciones por correo', included: false }
    ]
  },
  {
    id: 'plata',
    name: 'Plata',
    description: 'Para quienes toman en serio sus bienes',
    featured: true,
    cta: 'Activar Plata',
    prices: {
      MXN: { price: '999', symbol: '$', label: 'MXN', period: '/año', note: '1er envío físico gratis', monthly: '83' },
      USD: { price: '59', symbol: '$', label: 'USD', period: '/año', note: '1er envío físico gratis', monthly: '4.9' },
      CLP: { price: '49000', symbol: '$', label: 'CLP', period: '/año', note: '1er envío físico gratis', monthly: '4100' },
    },
    features: [
      { label: 'Hasta 3 códigos QR activos', included: true },
      { label: 'Contador de escaneos en tiempo real', included: true },
      { label: '3 Regeneraciones digitales sin costo', included: true },
      { label: 'Pausar o reactivar QR', included: true },
      { label: 'Historial de escaneos (últimos 30 días)', included: true },
      { label: 'Ubicación aproximada del escaneo', included: true },
      { label: 'Evidencia fotográfica adjunta', included: true },
      { label: 'Notificaciones por correo', included: true }
    ]
  },
  {
    id: 'oro',
    name: 'Oro',
    description: 'Control total. Sin compromisos.',
    cta: 'Seleccionar Oro',
    prices: {
      MXN: { price: '1499', symbol: '$', label: 'MXN', period: '/año', note: '1er envío físico gratis', monthly: '125' },
      USD: { price: '89', symbol: '$', label: 'USD', period: '/año', note: '1er envío físico gratis', monthly: '7.4' },
      CLP: { price: '75000', symbol: '$', label: 'CLP', period: '/año', note: '1er envío físico gratis', monthly: '6300' },
    },
    features: [
      { label: 'Hasta 5 códigos QR activos', included: true },
      { label: 'Ubicación con Mapa dinámico incluido', included: true },
      { label: 'Ubicación aproximada del escaneo', included: true },
      { label: '5 Regeneraciones digitales sin costo', included: true },
      { label: 'Mensajes predefinidos y personalizados', included: true },
      { label: 'Pausar o reactivar QR', included: true },
      { label: 'Historial de escaneos ilimitado', included: true },
      { label: 'Evidencia fotográfica adjunta', included: true },
      { label: 'Notificaciones por correo prioritarias', included: true }
    ]
  }
]

const handleSelect = (id: string) => {
  router.push({ name: 'checkout', params: { planId: id } })
}
</script>

<template>
  <HomeLayout>
    <template #main>
      <div class="min-h-screen bg-gradient-to-b from-white via-orange-50/20 to-white font-google-sans">
        <div class="pt-28 pb-20 px-6">
          <div class="max-w-6xl mx-auto">

            <!-- Hero -->
            <header class="text-center mb-14 md:mb-16">
              <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-orange-200 bg-orange-50/70 mb-6">
                <span class="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                <span class="text-[9px] font-bold uppercase tracking-[0.25em] text-orange-500">Planes de Protección</span>
              </div>
              <h1 class="text-4xl md:text-6xl lg:text-7xl font-black text-slate-900 tracking-tight leading-[0.92]">
                Elija su<br><span class="text-orange-500">Plan</span>
              </h1>
              <p class="mt-5 text-slate-500 text-base md:text-lg max-w-lg mx-auto leading-relaxed">
                Sin complicaciones. Sin contratos forzosos. Solo la protección que usted necesita.
              </p>
            </header>

            <!-- Promo Banner -->
            <div v-if="!useUserStore().getUserId" class="mb-10">
              <div class="relative rounded-xl border border-orange-200/60 bg-gradient-to-r from-orange-50/80 via-white to-orange-50/80 p-5 sm:p-6">
                <div class="absolute inset-0 rounded-xl bg-[radial-gradient(ellipse_at_top_right,rgba(255,121,0,0.06)_0%,transparent_60%)] pointer-events-none"></div>
                <div class="relative flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                  <div class="flex-1 text-center sm:text-left">
                    <p class="text-sm sm:text-base font-bold text-slate-900">1 año plan Bronce gratis — únase hoy</p>
                    <p class="text-xs text-slate-500 mt-0.5">Sin compromisos. Actívelo hoy.</p>
                  </div>
                  <router-link :to="{ name: 'register' }"
                    class="shrink-0 inline-flex items-center gap-2 h-10 px-5 rounded-lg bg-orange-500 text-white text-[10px] font-bold uppercase tracking-wider hover:bg-orange-400 active:scale-[0.97] transition-all duration-200 shadow-sm shadow-orange-500/20">
                    Obtenga su año gratis
                    <span class="material-symbols-outlined notranslate text-[15px]">arrow_forward</span>
                  </router-link>
                </div>
              </div>
            </div>

            <!-- Currency Selector -->
            <div class="flex justify-center mb-10">
              <div class="inline-flex bg-white rounded-lg border border-slate-200 p-0.5 shadow-sm">
                <button v-for="c in currencies" :key="c.key" @click="selectedCurrency = c.key"
                  class="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer"
                  :class="selectedCurrency === c.key
                    ? 'bg-orange-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-700'">
                  <span class="text-sm leading-none">{{ c.flag }}</span>
                  {{ c.label }}
                </button>
              </div>
            </div>

            <!-- Pricing Grid -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6 items-stretch">

              <div v-for="plan in plans" :key="plan.id"
                class="relative flex flex-col rounded-xl border bg-white transition-all duration-300"
                :class="plan.featured
                  ? 'border-orange-200 shadow-lg shadow-orange-500/5 md:scale-105 md:-translate-y-2'
                  : 'border-slate-200 hover:border-slate-300 shadow-sm'">

                <!-- Featured indicator -->
                <div v-if="plan.featured"
                  class="absolute -top-[1px] left-6 right-6 h-[3px] bg-orange-500 rounded-full">
                </div>

                <!-- Badge -->
                <div v-if="plan.featured" class="absolute -top-3 right-5 z-10">
                  <div class="px-3 py-0.5 rounded-md bg-orange-500 text-white text-[8px] font-bold uppercase tracking-[0.2em] shadow-sm">
                    Más Popular
                  </div>
                </div>

                <!-- Body -->
                <div class="p-6 lg:p-7 flex flex-col h-full">

                  <!-- Plan Identity -->
                  <div class="mb-5">
                    <p class="text-[8px] font-bold uppercase tracking-[0.25em] text-slate-400 mb-1">Plan</p>
                    <div class="flex items-center justify-between">
                      <h3 class="text-xl lg:text-2xl font-black text-slate-900">{{ plan.name }}</h3>
                      <span class="material-symbols-outlined notranslate text-lg"
                        :class="plan.featured ? 'text-orange-500' : 'text-slate-300'">
                        {{ plan.id === 'bronce' ? 'shield' : plan.id === 'plata' ? 'verified_user' : 'military_tech' }}
                      </span>
                    </div>
                    <p class="text-sm text-slate-500 mt-1">{{ plan.description }}</p>
                  </div>

                  <!-- Price -->
                  <div class="mb-5 pb-5 border-b border-slate-100">
                    <div class="flex items-baseline gap-2 flex-wrap">
                      <span class="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
                        {{ plan.prices[selectedCurrency].symbol }}{{ plan.prices[selectedCurrency].price }}
                      </span>
                      <span class="text-[9px] font-semibold text-slate-400 uppercase">{{ plan.prices[selectedCurrency].label }}</span>
                      <span class="px-2 py-0.5 rounded-md bg-orange-50 text-orange-600 text-[9px] font-bold uppercase tracking-wider">{{ plan.prices[selectedCurrency].period }}</span>
                    </div>
                    <div class="flex items-center justify-between mt-1.5">
                      <p class="text-[11px] text-slate-400">~{{ plan.prices[selectedCurrency].symbol }}{{ plan.prices[selectedCurrency].monthly }}/mes</p>
                      <p class="text-[10px] text-orange-600/70 font-semibold">{{ plan.prices[selectedCurrency].note }}</p>
                    </div>
                  </div>

                  <!-- Features -->
                  <ul class="flex-1 space-y-2.5 mb-7">
                    <li v-for="(feature, idx) in plan.features" :key="idx" class="flex items-start gap-2.5">
                      <div class="w-4 h-4 rounded flex items-center justify-center shrink-0 mt-0.5"
                        :class="feature.included ? 'bg-orange-50 text-orange-500' : 'bg-slate-100 text-slate-300'">
                        <span class="material-symbols-outlined notranslate text-[10px] font-bold">{{ feature.included ? 'check' : 'remove' }}</span>
                      </div>
                      <span class="text-[12px] leading-snug"
                        :class="feature.included ? 'text-slate-700 font-medium' : 'text-slate-300 line-through'">
                        {{ feature.label }}
                      </span>
                    </li>
                  </ul>

                  <!-- CTA -->
                  <button @click="handleSelect(plan.id)"
                    class="w-full h-10 rounded-lg font-bold text-[10px] uppercase tracking-wider transition-all duration-200 active:scale-[0.97] flex items-center justify-center gap-1.5 cursor-pointer"
                    :class="plan.featured
                      ? 'bg-orange-500 text-white hover:bg-orange-400 shadow-sm shadow-orange-500/20'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-800 border border-slate-200'">
                    {{ plan.cta }}
                    <span v-if="plan.featured" class="material-symbols-outlined notranslate text-[13px]">arrow_forward</span>
                  </button>

                </div>
              </div>

            </div>

            <!-- Shipping Info -->
            <div class="mt-14 max-w-2xl mx-auto">
              <div class="relative p-5 sm:p-6 rounded-xl border border-slate-200 bg-white shadow-sm">
                <div class="flex items-start gap-4">
                  <div class="w-9 h-9 rounded-lg bg-orange-50 text-orange-500 flex items-center justify-center shrink-0">
                    <span class="material-symbols-outlined notranslate text-lg">local_shipping</span>
                  </div>
                  <div class="space-y-1.5">
                    <h4 class="text-xs font-bold text-slate-900">Envío físico — Solo México</h4>
                    <p class="text-[12px] text-slate-500 leading-relaxed">
                      Cada plan incluye <strong class="text-orange-600 font-semibold">1 envío físico gratuito</strong>
                      a cualquier parte de la República Mexicana.
                    </p>
                    <p class="text-[11px] text-slate-400 leading-relaxed">
                      💡 <strong class="text-slate-700 font-semibold">Recomendación:</strong> Solicita todos tus QRs
                      permitidos en el primer envío gratuito. QRs adicionales son gratuitos, con tarifa de envío de
                      <strong class="text-slate-700 font-semibold">$199 MXN</strong> por paquete.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Footer note -->
            <p class="text-center text-slate-300 text-[8px] font-bold uppercase tracking-[0.35em] mt-10">
              Encriptación de extremo a extremo · Sin contratos forzosos · Cancela cuando quieras
            </p>

          </div>
        </div>
      </div>
    </template>
  </HomeLayout>
</template>

<style scoped>
.font-google-sans {
  font-family: 'Google Sans', 'Inter', sans-serif;
}

.material-symbols-outlined {
  font-variation-settings: 'FILL' 1, 'wght' 600, 'GRAD' 0, 'opsz' 24;
}
</style>
