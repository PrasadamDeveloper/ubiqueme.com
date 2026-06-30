<script lang="ts" setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

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
      MXN: { price: '499', symbol: '$', label: 'MXN', period: '/año', monthly: '42' },
      USD: { price: '29', symbol: '$', label: 'USD', period: '/año', monthly: '2.4' },
      CLP: { price: '25000', symbol: '$', label: 'CLP', period: '/año', monthly: '2100' },
    },
    features: [
      { label: 'Hasta 1 código QR activo', included: true },
      { label: 'Contador de escaneos básico', included: true },
      { label: 'Mensajes predefinidos de contacto', included: true },
      { label: 'Pausar o reactivar QR', included: false },
      { label: 'Historial de escaneos', included: false },
      { label: 'Ubicación con Mapa dinámico', included: false },
      { label: 'Evidencia fotográfica adjunta', included: false },
      { label: 'Notificaciones por correo', included: false },
    ],
  },
  {
    id: 'plata',
    name: 'Plata',
    description: 'Para quienes toman en serio sus bienes',
    featured: true,
    cta: 'Activar Plata',
    prices: {
      MXN: { price: '999', symbol: '$', label: 'MXN', period: '/año', monthly: '83' },
      USD: { price: '59', symbol: '$', label: 'USD', period: '/año', monthly: '4.9' },
      CLP: { price: '49000', symbol: '$', label: 'CLP', period: '/año', monthly: '4100' },
    },
    features: [
      { label: 'Hasta 3 códigos QR activos', included: true },
      { label: 'Contador de escaneos en tiempo real', included: true },
      { label: '3 Regeneraciones digitales sin costo', included: true },
      { label: 'Pausar o reactivar QR', included: true },
      { label: 'Historial de escaneos (últimos 30 días)', included: true },
      { label: 'Ubicación aproximada del escaneo', included: true },
      { label: 'Evidencia fotográfica adjunta', included: true },
      { label: 'Notificaciones por correo', included: true },
    ],
  },
  {
    id: 'oro',
    name: 'Oro',
    description: 'Control total. Sin compromisos.',
    cta: 'Seleccionar Oro',
    prices: {
      MXN: { price: '1499', symbol: '$', label: 'MXN', period: '/año', monthly: '125' },
      USD: { price: '89', symbol: '$', label: 'USD', period: '/año', monthly: '7.4' },
      CLP: { price: '75000', symbol: '$', label: 'CLP', period: '/año', monthly: '6300' },
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
      { label: 'Notificaciones por correo prioritarias', included: true },
    ],
  },
]

const handleSelect = (id: string) => {
  router.push({ name: 'checkout', params: { planId: id } })
}
</script>

<template>
  <div class="relative min-h-dvh bg-[#1C1B1F] w-full font-google-sans">
    <div class="px-4 pt-3 pb-32 space-y-4">

      <!-- Header -->
      <div class="text-center space-y-1">
        <h1 class="text-xl font-black text-[#E6E1E5] tracking-tight">
          Elija su <span class="text-orange-500">Plan</span>
        </h1>
        <p class="text-xs text-[#CAC4D0]/50">Sin complicaciones. Sin contratos forzosos.</p>
      </div>

      <!-- Currency Selector (M3 Segmented Control) -->
      <div class="flex bg-[#2B2930] rounded-xl p-0.5">
        <button v-for="c in currencies" :key="c.key" @click="selectedCurrency = c.key"
          class="flex-1 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all duration-150 cursor-pointer active:scale-[0.98] select-none flex items-center justify-center gap-1"
          :class="selectedCurrency === c.key
            ? 'bg-orange-500 text-black shadow-sm'
            : 'text-[#CAC4D0]/50 hover:text-[#E6E1E5]'">
          <span class="text-sm">{{ c.flag }}</span>
          {{ c.label }}
        </button>
      </div>

      <!-- Pricing List -->
      <div class="space-y-4">
        <div v-for="plan in plans" :key="plan.id"
          class="bg-[#2B2930] rounded-xl border overflow-hidden transition-all duration-300"
          :class="plan.featured ? 'border-orange-500/30' : 'border-[#49454F]/30'">

          <!-- Featured badge -->
          <div v-if="plan.featured"
            class="bg-orange-500 py-1.5 text-center text-[8px] font-black uppercase tracking-[0.25em] text-black font-mono">
            Más Popular
          </div>

          <div class="p-4 space-y-3">
            <!-- Plan header -->
            <div class="flex items-center justify-between">
              <div>
                <p class="text-[8px] font-bold uppercase tracking-[0.2em] text-[#CAC4D0]/40 font-mono">Plan</p>
                <h3 class="text-xl font-black text-[#E6E1E5] tracking-tight uppercase">{{ plan.name }}</h3>
              </div>
              <div class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                :class="plan.featured ? 'bg-orange-500/10 border border-orange-500/20' : 'bg-[#1C1B1F] border border-[#49454F]/30'">
                <span class="material-symbols-outlined notranslate text-lg"
                  :class="plan.featured ? 'text-orange-400' : 'text-[#CAC4D0]/40'">
                  {{ plan.id === 'bronce' ? 'shield' : plan.id === 'plata' ? 'verified_user' : 'military_tech' }}
                </span>
              </div>
            </div>

            <p class="text-xs text-[#CAC4D0]/50 font-mono">{{ plan.description }}</p>

            <!-- Price -->
            <div class="pb-3 border-b border-[#49454F]/30">
              <div class="flex items-baseline gap-1.5">
                <span class="text-3xl font-black text-[#E6E1E5] tracking-tight font-mono">{{
                  plan.prices[selectedCurrency].symbol }}{{ plan.prices[selectedCurrency].price }}</span>
                <span class="text-[9px] text-[#CAC4D0]/60">{{ plan.prices[selectedCurrency].label }}</span>
                <span
                  class="text-[8px] font-black uppercase tracking-widest text-orange-400 bg-orange-500/10 px-1.5 py-0.5 rounded">{{
                    plan.prices[selectedCurrency].period }}</span>
              </div>
              <p class="text-[9px] text-[#CAC4D0]/40 font-mono mt-0.5">~${{ plan.prices[selectedCurrency].monthly }}/mes
              </p>
            </div>

            <!-- Features -->
            <ul class="space-y-2">
              <li v-for="(feature, idx) in plan.features" :key="idx" class="flex items-start gap-2">
                <div class="w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5" :class="feature.included
                  ? (plan.featured ? 'bg-orange-500/15 text-orange-400' : 'bg-[#1C1B1F] text-[#CAC4D0]/40')
                  : 'bg-[#1C1B1F] text-[#CAC4D0]/15'">
                  <span class="material-symbols-outlined notranslate text-[9px] font-bold">{{ feature.included ? 'check'
                    : 'remove' }}</span>
                </div>
                <span class="text-[11px] font-medium leading-snug"
                  :class="feature.included ? 'text-[#E6E1E5]' : 'text-[#CAC4D0]/30 line-through'">
                  {{ feature.label }}
                </span>
              </li>
            </ul>

            <!-- CTA -->
            <button @click="handleSelect(plan.id)"
              class="w-full h-11 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all duration-300 active:scale-[0.97] flex items-center justify-center gap-2 cursor-pointer mt-1"
              :class="plan.featured
                ? 'bg-orange-500 text-black hover:bg-orange-400 shadow-lg shadow-orange-500/15'
                : 'bg-[#1C1B1F] text-[#E6E1E5] border border-[#49454F]/30 hover:border-orange-500/30'">
              {{ plan.cta }}
              <span v-if="plan.featured"
                class="material-symbols-outlined notranslate text-[14px] font-bold">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Shipping info -->
      <div class="bg-[#2B2930] rounded-xl p-4 border border-orange-500/10 space-y-2">
        <div class="flex items-center gap-2 text-orange-400 text-[9px] font-bold uppercase tracking-wider">
          <span class="material-symbols-outlined notranslate text-[14px]">local_shipping</span>
          Envío Físico — Solo México
        </div>
        <p class="text-xs text-[#CAC4D0]/60 leading-relaxed">
          Cada plan incluye <strong class="text-orange-400">1 envío físico gratuito</strong> a cualquier parte de la
          República Mexicana.
        </p>
        <p class="text-[10px] text-[#CAC4D0]/40 leading-relaxed">
          💡 Solicita todos tus QRs permitidos en el primer envío gratuito.
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.material-symbols-outlined {
  font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}
</style>
