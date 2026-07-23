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
      <div class="relative min-h-screen bg-gradient-to-b from-white to-slate-50 font-google-sans overflow-hidden">

        <!-- Cloudflare-style grid overlay -->
        <div class="absolute inset-0 opacity-[0.03] pointer-events-none"
          style="background-image: linear-gradient(rgba(0,0,0,.06) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,.06) 1px, transparent 1px); background-size: 48px 48px;">
        </div>

        <!-- Radial glow top -->
        <div
          class="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[#ff7900]/5 rounded-full blur-[120px] pointer-events-none">
        </div>

        <div class="relative z-10 pt-28 pb-20 px-6">
          <div class="max-w-6xl mx-auto">

            <!-- Header -->
            <header class="text-center mb-16 space-y-5">
              <div
                class="inline-flex items-center gap-2 px-4 py-1.5 bg-orange-50 rounded-full border border-orange-200">
                <span class="w-1.5 h-1.5 rounded-full bg-[#ff7900]"></span>
                <span class="text-[10px] font-black uppercase tracking-[0.3em] text-orange-500 font-mono">Planes de
                  Protección</span>
              </div>
              <h1 class="text-5xl md:text-7xl font-black text-slate-900 tracking-tight">
                Elija su <br>
                <span class="text-orange-500">Plan</span>
              </h1>
              <p class="max-w-xl mx-auto text-slate-500 text-sm md:text-base leading-relaxed mt-4">
                Sin complicaciones. Sin contratos forzosos. Solo la protección que usted necesita.
              </p>
            </header>

            <!-- Promo Banner: 1 año de Bronce gratis (solo no logueados) -->
            <div v-if="!useUserStore().getUserId"
              class="mb-8 p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-amber-500/15 via-orange-500/15 to-amber-500/15 border border-orange-500/30 shadow-[0_0_40px_rgba(249,115,22,0.1)] relative overflow-hidden">
              <div
                class="absolute -top-10 -right-10 w-40 h-40 bg-orange-500/10 rounded-full blur-3xl pointer-events-none">
              </div>
              <div
                class="absolute -bottom-10 -left-10 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none">
              </div>
              <div class="relative z-10 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                <div class="flex-1">
                  <h3 class="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                    1 año plan Bronce gratis — únase hoy
                  </h3>
                  <p class="text-slate-500 text-sm font-medium mt-1">
                    Sin compromisos. Actívelo hoy.
                  </p>
                </div>
                <router-link :to="{ name: 'register' }"
                  class="shrink-0 inline-flex items-center gap-2 px-6 py-3 bg-orange-500 text-black rounded-xl font-black text-xs uppercase tracking-widest transition-all duration-300 hover:bg-white hover:shadow-[0_0_30px_rgba(249,115,22,0.3)] active:scale-[0.97]">
                  Obtenga su año gratis
                  <span class="material-symbols-outlined notranslate text-lg">arrow_forward</span>
                </router-link>
              </div>
            </div>

            <!-- Currency Selector -->
            <div class="flex justify-center mb-10">
              <div class="inline-flex bg-white rounded-xl border border-slate-200 p-1 gap-0.5 shadow-sm">
                <button v-for="c in currencies" :key="c.key" @click="selectedCurrency = c.key"
                  class="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all duration-200 cursor-pointer"
                  :class="selectedCurrency === c.key
                    ? 'bg-[#ff7900] text-black shadow-lg shadow-[#ff7900]/20'
                    : 'text-slate-400 hover:text-orange-500'">
                  <span class="text-sm">{{ c.flag }}</span>
                  {{ c.label }}
                </button>
              </div>
            </div>

            <!-- Pricing Grid -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6 items-stretch">

              <div v-for="plan in plans" :key="plan.id" :class="[
                'relative flex flex-col rounded-2xl border transition-all duration-300',
                plan.featured
                  ? 'bg-gradient-to-b from-orange-50/60 to-white border-orange-200 shadow-lg shadow-orange-500/5 md:-translate-y-3'
                  : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
              ]">

                <!-- Featured ray -->
                <div v-if="plan.featured"
                  class="absolute inset-0 rounded-2xl border border-[#ff7900]/5 pointer-events-none"></div>

                <!-- Badge -->
                <div v-if="plan.featured" class="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
                  <div
                    class="px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.25em] bg-[#ff7900] text-black whitespace-nowrap font-mono shadow-lg shadow-[#ff7900]/20">
                    Más Popular
                  </div>
                </div>

                <!-- Body -->
                <div class="relative z-10 p-7 flex flex-col h-full">

                  <!-- Plan Identity -->
                  <div class="flex items-center justify-between mb-6">
                    <div>
                      <p class="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 font-mono mb-1">Plan</p>
                      <h3 class="text-2xl font-black text-slate-900 tracking-tight uppercase">{{ plan.name }}</h3>
                    </div>
                    <div class="w-10 h-10 rounded-xl border flex items-center justify-center shrink-0"
                      :class="plan.featured ? 'border-orange-200 bg-orange-50' : 'border-slate-200 bg-slate-50'">
                      <span class="material-symbols-outlined notranslate text-lg"
                        :class="plan.featured ? 'text-orange-500' : 'text-slate-400'">
                        {{ plan.id === 'bronce' ? 'shield' : plan.id === 'plata' ? 'verified_user' : 'military_tech' }}
                      </span>
                    </div>
                  </div>

                  <!-- Description -->
                  <p class="text-sm text-slate-500 font-mono mb-6">{{ plan.description }}</p>

                  <!-- Price -->
                  <div class="mb-5 pb-5 border-b border-slate-100">
                    <div class="flex items-baseline gap-2">
                      <span class="text-4xl font-black text-slate-900 tracking-tight font-mono">{{
                        plan.prices[selectedCurrency].symbol }}{{ plan.prices[selectedCurrency].price }} </span>
                      <span class="text-[10px] text-slate-500">{{ plan.prices[selectedCurrency].label }}</span>
                      <span
                        class="text-orange-700 rounded-3xl p-1 text-[10px] bg-orange-100 font-google-sans font-black uppercase tracking-widest">{{
                          plan.prices[selectedCurrency].period }}</span>
                      <span class="text-[10px] text-slate-400 font-mono">(~&thinsp;${{
                        plan.prices[selectedCurrency].monthly }}
                        /mes)</span>
                    </div>
                    <p class="text-orange-600/80 text-[10px] font-mono font-bold mt-1 uppercase tracking-wider">{{
                      plan.prices[selectedCurrency].note }}</p>
                  </div>

                  <!-- Features -->
                  <ul class="flex-1 space-y-3 mb-8">
                    <li v-for="(feature, idx) in plan.features" :key="idx" class="flex items-start gap-3">
                      <div class="w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5" :class="feature.included
                        ? (plan.featured ? 'bg-orange-100 text-orange-600' : 'bg-orange-50 text-orange-500')
                        : 'bg-slate-100 text-slate-300'" :style="feature.included && plan.featured
                          ? { borderColor: 'rgba(255,121,0,0.3)' }
                          : !feature.included
                            ? { border: '1px solid rgba(0,0,0,0.06)' }
                            : {}">
                        <span class="material-symbols-outlined notranslate text-[10px]! font-black">{{ feature.included
                          ? 'check' :
                          'remove' }}</span>
                      </div>
                      <span class="text-[13px] font-medium leading-snug font-mono"
                        :class="feature.included ? (plan.featured ? 'text-slate-800' : 'text-slate-600') : 'text-slate-300 line-through decoration-slate-200'">
                        {{ feature.label }}
                      </span>
                    </li>
                  </ul>

                  <!-- CTA -->
                  <button @click="handleSelect(plan.id)"
                    class="w-full h-11 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all duration-300 active:scale-[0.97] flex items-center justify-center gap-2 font-mono cursor-pointer"
                    :class="plan.featured
                      ? 'bg-[#ff7900] text-black hover:bg-[#ff7900]/90 shadow-lg shadow-[#ff7900]/15'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-800 border border-slate-200'">
                    {{ plan.cta }}
                    <span v-if="plan.featured"
                      class="material-symbols-outlined notranslate text-[14px] font-black">arrow_forward</span>
                  </button>

                </div>

                <!-- Bottom accent line -->
                <div v-if="plan.featured"
                  class="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#ff7900]/40 to-transparent rounded-b-2xl">
                </div>

              </div>

            </div>

            <!-- Shipping Info -->
            <div class="mt-16 max-w-3xl mx-auto">
              <div class="relative p-6 rounded-2xl border border-orange-200 bg-orange-50 overflow-hidden">
                <div class="absolute inset-0 opacity-[0.02] pointer-events-none"
                  style="background-image: linear-gradient(rgba(234,88,12,.12) 1px, transparent 1px), linear-gradient(90deg, rgba(234,88,12,.12) 1px, transparent 1px); background-size: 20px 20px;">
                </div>
                <div class="relative z-10 text-center space-y-3">
                  <div
                    class="inline-flex items-center gap-2 text-orange-500 font-bold text-[10px] uppercase tracking-wider font-mono">
                    <span class="material-symbols-outlined notranslate text-[14px]">local_shipping</span>
                    Envío Físico — Solo México
                  </div>
                  <p class="text-sm text-slate-600 leading-relaxed">
                    Cada plan incluye <strong class="text-orange-500">1 envío físico gratuito</strong> a cualquier parte
                    de la República Mexicana.
                  </p>
                  <p class="text-xs text-slate-500 leading-relaxed">
                    💡 <strong class="text-slate-900">Recomendación:</strong> Solicita todos tus QRs permitidos en el primer
                    envío gratuito. QRs adicionales son gratuitos, con tarifa de envío de <strong
                      class="text-slate-900">$199 MXN</strong> por paquete.
                  </p>
                </div>
              </div>
            </div>

            <!-- Disclaimer (solo no logueados) -->
            <div v-if="!useUserStore().getUserId" class="text-center mb-6">
              <p class="text-[10px] text-slate-500/30 font-medium">
                Solo cree su cuenta gratis y obtendrá el beneficio
              </p>
            </div>

            <!-- Footer note -->
            <p class="text-center text-slate-300 text-[9px] font-black uppercase tracking-[0.35em] mt-8 font-mono">
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
