<script lang="ts" setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()
const hoveredPlan = ref<string | null>(null)

const currencies = [
  { key: 'MXN' as const, label: 'MXN', flag: '🇲🇽' },
  { key: 'USD' as const, label: 'USD', flag: '🇺🇸' },
  { key: 'CLP' as const, label: 'CLP', flag: '🇨🇱' },
]
const selectedCurrency = ref<'MXN' | 'USD' | 'CLP'>('MXN')

const handlePlanClick = (planId: string) => {
  if (userStore.isAuthenticated) {
    router.push({ name: 'checkout', params: { planId } })
  } else {
    router.push({ name: 'login', query: { redirect: `/checkout/${planId}` } })
  }
}

const plans = [
  {
    id: 'bronce',
    name: 'Bronce',
    tagline: 'Protección básica esencial',
    accent: 'rgba(255,255,255,0.15)',
    accentBorder: 'rgba(255,255,255,0.1)',
    accentText: '#ffffff',
    badge: 'Básico',
    cta: 'Activar Bronce',
    prices: {
      MXN: { price: '499', symbol: '$', label: 'MXN', period: '/año', note: '1er Envío Físico Gratis', monthly: '42' },
      USD: { price: '29', symbol: '$', label: 'USD', period: '/año', note: '1er Envío Físico Gratis', monthly: '2.4' },
      CLP: { price: '25000', symbol: '$', label: 'CLP', period: '/año', note: '1er Envío Físico Gratis', monthly: '2100' },
    },
    features: [
      { label: 'Escaneo vía WhatsApp directo', included: true },
      { label: 'Notificación instantánea al dueño', included: true },
      { label: 'Mensaje de contacto vía WhatsApp', included: true },
      { label: 'Hasta 1 código QR activo', included: true },
      { label: 'Contador de escaneos básico', included: true },
      { label: 'Pausar o reactivar QR', included: false },
      { label: 'Historial de escaneos', included: false },
      { label: 'Notificaciones por correo', included: false },
      { label: 'Regeneraciones digitales sin costo', included: false },
    ]
  },
  {
    id: 'plata',
    name: 'Plata',
    tagline: 'Para quienes toman en serio sus bienes',
    accent: 'rgba(249,115,22,0.12)',
    accentBorder: 'rgba(249,115,22,0.35)',
    accentText: '#f97316',
    badge: 'Más Popular',
    cta: 'Activar Plata',
    prices: {
      MXN: { price: '999', symbol: '$', label: 'MXN', period: '/año', note: '1er Envío Físico Gratis', monthly: '83' },
      USD: { price: '59', symbol: '$', label: 'USD', period: '/año', note: '1er Envío Físico Gratis', monthly: '4.9' },
      CLP: { price: '49000', symbol: '$', label: 'CLP', period: '/año', note: '1er Envío Físico Gratis', monthly: '4100' },
    },
    features: [
      { label: 'Escaneo vía WhatsApp directo', included: true },
      { label: 'Notificación instantánea al dueño', included: true },
      { label: 'Mensaje de contacto vía WhatsApp', included: true },
      { label: 'Hasta 3 códigos QR activos', included: true },
      { label: 'Contador de escaneos en tiempo real', included: true },
      { label: 'Pausar o reactivar QR', included: true },
      { label: 'Historial de escaneos (últimos 30 días)', included: true },
      { label: 'Notificaciones por correo', included: true },
      { label: '3 Regeneraciones digitales sin costo', included: true },
    ]
  },
  {
    id: 'oro',
    name: 'Oro',
    tagline: 'Control total. Sin compromisos.',
    accent: 'rgba(255,210,100,0.08)',
    accentBorder: 'rgba(255,210,100,0.3)',
    accentText: '#ffd264',
    badge: 'Premium',
    cta: 'Activar Oro',
    prices: {
      MXN: { price: '1499', symbol: '$', label: 'MXN', period: '/año', note: '1er Envío Físico Gratis', monthly: '125' },
      USD: { price: '89', symbol: '$', label: 'USD', period: '/año', note: '1er Envío Físico Gratis', monthly: '7.4' },
      CLP: { price: '75000', symbol: '$', label: 'CLP', period: '/año', note: '1er Envío Físico Gratis', monthly: '6300' },
    },
    features: [
      { label: 'Escaneo vía WhatsApp directo', included: true },
      { label: 'Notificación instantánea al dueño', included: true },
      { label: 'Mensaje de contacto vía WhatsApp', included: true },
      { label: 'Hasta 5 códigos QR activos', included: true },
      { label: 'Contador de escaneos en tiempo real', included: true },
      { label: 'Pausar o reactivar QR', included: true },
      { label: 'Historial de escaneos ilimitado', included: true },
      { label: 'Notificaciones por correo prioritarias', included: true },
      { label: '5 Regeneraciones digitales sin costo', included: true },
    ]
  }
]
</script>

<template>
  <section class="relative z-10 px-6 md:px-24 py-28 mx-auto max-w-7xl">

    <!-- Section Header -->
    <div class="text-center space-y-6 mb-14">
      <div class="inline-flex items-center gap-2 px-3 py-1 bg-orange-500/10 rounded-lg border border-orange-500/20">
        <span class="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></span>
        <span class="text-[9px] font-black uppercase tracking-[0.4em] text-orange-500">Planes de Protección</span>
      </div>
      <h2 class="text-5xl md:text-7xl font-black text-white leading-[0.9] tracking-tighter uppercase">
        Elegir <br /><span class="text-orange-500">Plan</span> <span
          class="material-symbols-outlined notranslate text-5xl md:text-7xl text-amber-500 align-middle">shopping_bag</span>
      </h2>
      <p class="text-white/40 text-lg max-w-xl mx-auto font-medium leading-relaxed">
        Desde protección básica hasta control total de tus bienes. Sin contratos, sin complicaciones.
      </p>
    </div>

    <!-- Currency Selector -->
    <div class="flex justify-center mb-12">
      <div class="inline-flex bg-black/40 rounded-2xl border border-white/[0.08] p-1 gap-0.5">
        <button v-for="c in currencies" :key="c.key" @click="selectedCurrency = c.key"
          class="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all duration-200 cursor-pointer"
          :class="selectedCurrency === c.key
            ? 'bg-orange-500 text-black shadow-lg shadow-orange-500/20'
            : 'text-white/40 hover:text-white/70'">
          <span class="text-sm">{{ c.flag }}</span>
          {{ c.label }}
        </button>
      </div>
    </div>

    <!-- Plans Grid -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
      <div v-for="plan in plans" :key="plan.id" @mouseenter="hoveredPlan = plan.id" @mouseleave="hoveredPlan = null"
        :class="[
          'relative flex flex-col rounded-[2.5rem] border p-8 transition-all duration-500 cursor-default',
          plan.id === 'plata' ? 'md:-translate-y-4 md:scale-[1.03]' : '',
          hoveredPlan === plan.id ? 'shadow-2xl' : ''
        ]" :style="{
          background: plan.accent,
          borderColor: plan.accentBorder,
          boxShadow: hoveredPlan === plan.id ? `0 0 60px ${plan.accentBorder}` : 'none'
        }">

        <!-- Badge -->
        <div v-if="plan.badge" class="absolute -top-4 left-1/2 -translate-x-1/2">
          <div
            class="px-5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.3em] border whitespace-nowrap"
            :style="{ color: plan.accentText, borderColor: plan.accentBorder, background: '#09090b' }">
            {{ plan.badge }}
          </div>
        </div>

        <!-- Plan Identity -->
        <div class="space-y-2 mb-8">
          <div class="flex items-start justify-between">
            <div>
              <p class="text-[10px] font-black uppercase tracking-[0.4em] mb-1" :style="{ color: plan.accentText }">
                Plan
              </p>
              <h3 class="text-4xl font-black text-white tracking-tight leading-none">{{ plan.name }}</h3>
            </div>
            <div class="w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0"
              :style="{ borderColor: plan.accentBorder, background: plan.accent }">
              <span class="material-symbols-outlined notranslate text-xl" :style="{ color: plan.accentText }">
                {{ plan.id === 'bronce' ? 'shield' : plan.id === 'plata' ? 'verified_user' : 'military_tech' }}
              </span>
            </div>
          </div>
          <p class="text-white/40 text-sm font-medium">{{ plan.tagline }}</p>
        </div>

        <!-- Price -->
        <div class="mb-8 pb-8 border-b border-white/[0.06]">
          <!-- ANNUAL badge -->
          <div
            class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-orange-500/30 bg-orange-500/15 text-orange-400 text-[10px] font-black uppercase tracking-[0.25em] mb-3 shadow-[0_0_15px_rgba(249,115,22,0.1)]">
            <span class="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></span>
            ANUAL
          </div>
          <div class="flex items-baseline gap-2">
            <span class="text-5xl font-black text-white tracking-tighter">{{ plan.prices[selectedCurrency].symbol }}{{
              plan.prices[selectedCurrency].price }}</span>
            <span class="text-orange-400/70 text-sm font-black uppercase tracking-widest">{{
              plan.prices[selectedCurrency].label }} / año</span>
          </div>
          <p class="text-white/30 text-[10px] font-bold uppercase tracking-widest mt-2">~&thinsp;${{
            plan.prices[selectedCurrency].monthly }} /mes · {{
              plan.prices[selectedCurrency].note }}</p>
        </div>

        <!-- Features -->
        <ul class="flex-1 space-y-4 mb-10">
          <li v-for="(feat, i) in plan.features" :key="i" class="flex items-start gap-3">
            <div class="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5" :style="feat.included
              ? { background: plan.accentBorder, boxShadow: `0 0 10px ${plan.accentBorder}` }
              : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }">
              <span class="material-symbols-outlined notranslate text-[12px]! font-black"
                :style="feat.included ? { color: plan.accentText } : { color: 'rgba(255,255,255,0.15)' }">
                {{ feat.included ? 'check' : 'remove' }}
              </span>
            </div>
            <span class="text-sm font-medium leading-snug"
              :class="feat.included ? 'text-white/80' : 'text-white/20 line-through decoration-white/10'">
              {{ feat.label }}
            </span>
          </li>
        </ul>

        <!-- CTA Button -->
        <button @click="handlePlanClick(plan.id)"
          class="w-full h-14 rounded-2xl font-black text-xs uppercase tracking-widest transition-all duration-300 active:scale-[0.97] border cursor-pointer"
          :style="plan.id === 'bronce'
            ? { background: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.15)', color: '#ffffff' }
            : { background: plan.accentText, borderColor: plan.accentText, color: '#09090b' }">
          {{ plan.cta }}
        </button>

      </div>
    </div>

    <!-- Shipping Info Card -->
    <div
      class="mt-16 max-w-3xl mx-auto p-6 rounded-[2rem] border border-orange-500/10 bg-orange-500/5 text-center space-y-3">
      <div class="inline-flex items-center gap-2 text-orange-400 font-bold text-xs uppercase tracking-wider">
        <span class="material-symbols-outlined notranslate text-[16px]">local_shipping</span>
        Información de Envío Física (Sólo México)
      </div>
      <p class="text-sm text-white/80 leading-relaxed">
        Cada plan incluye <strong class="text-orange-400">1 envío físico gratuito</strong> a cualquier parte de la
        República Mexicana.
      </p>
      <p class="text-xs text-white/60 leading-relaxed">
        💡 <strong class="text-white">Recomendación importante:</strong> Le sugerimos solicitar todos los códigos QR
        permitidos en su plan (1 en Bronce, 3 en Plata, 5 en Oro) en su primer envío gratuito. Los QRs adicionales o
        solicitados posteriormente siguen siendo completamente gratuitos, pero se cobrará una tarifa de de envío de
        <strong class="text-white">$199 MXN</strong> por paquete.
      </p>
    </div>

    <!-- Bottom Note -->
    <p class="text-center text-white/20 text-[10px] font-black uppercase tracking-[0.3em] mt-12">
      Todos los planes incluyen encriptación de extremo a extremo · Sin contratos forzosos · Cancela cuando quieras
    </p>

  </section>
</template>

<style scoped>
.material-symbols-outlined {
  font-variation-settings: 'FILL' 1, 'wght' 700, 'GRAD' 0, 'opsz' 20;
}
</style>
