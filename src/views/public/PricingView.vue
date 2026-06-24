<script lang="ts" setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
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
  router.push({ name: 'checkout', query: { planId: id, currency: selectedCurrency.value } })
}
</script>

<template>
  <HomeLayout>
    <template #main>
      <div class="relative min-h-screen bg-[#0a0a0b] font-google-sans overflow-hidden">

        <!-- Cloudflare-style grid overlay -->
        <div class="absolute inset-0 opacity-[0.03] pointer-events-none"
          style="background-image: linear-gradient(rgba(255,255,255,.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.4) 1px, transparent 1px); background-size: 48px 48px;">
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
                class="inline-flex items-center gap-2 px-4 py-1.5 bg-[#ff7900]/10 rounded-full border border-[#ff7900]/20">
                <span class="w-1.5 h-1.5 rounded-full bg-[#ff7900]"></span>
                <span class="text-[10px] font-black uppercase tracking-[0.3em] text-[#ff7900] font-mono">Planes de
                  Protección</span>
              </div>
              <h1 class="text-5xl md:text-7xl font-black text-white tracking-tight">
                Elija su <br>
                <span class="text-[#ff7900]">Plan</span>
              </h1>
              <p class="max-w-xl mx-auto text-white/35 text-sm md:text-base leading-relaxed mt-4">
                Sin complicaciones. Sin contratos forzosos. Solo la protección que usted necesita.
              </p>
            </header>

            <!-- Currency Selector -->
            <div class="flex justify-center mb-12">
              <div class="inline-flex bg-[#121212] rounded-xl border border-white/[0.06] p-1 gap-0.5">
                <button v-for="c in currencies" :key="c.key" @click="selectedCurrency = c.key"
                  class="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all duration-200 cursor-pointer"
                  :class="selectedCurrency === c.key
                    ? 'bg-[#ff7900] text-black shadow-lg shadow-[#ff7900]/20'
                    : 'text-white/40 hover:text-white/70'">
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
                  ? 'bg-[#121212] border-[#ff7900]/30 shadow-[0_0_60px_rgba(255,121,0,0.06)] md:-translate-y-3'
                  : 'bg-[#0d0d0e] border-white/[0.06] hover:border-white/[0.12]'
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
                      <p class="text-[9px] font-black uppercase tracking-[0.3em] text-white/30 font-mono mb-1">Plan</p>
                      <h3 class="text-2xl font-black text-white tracking-tight uppercase">{{ plan.name }}</h3>
                    </div>
                    <div class="w-10 h-10 rounded-xl border flex items-center justify-center shrink-0"
                      :class="plan.featured ? 'border-[#ff7900]/30 bg-[#ff7900]/10' : 'border-white/10 bg-white/[0.04]'">
                      <span class="material-symbols-outlined notranslate text-lg"
                        :class="plan.featured ? 'text-[#ff7900]' : 'text-white/50'">
                        {{ plan.id === 'bronce' ? 'shield' : plan.id === 'plata' ? 'verified_user' : 'military_tech' }}
                      </span>
                    </div>
                  </div>

                  <!-- Description -->
                  <p class="text-sm text-white/50 font-mono mb-6">{{ plan.description }}</p>

                  <!-- Price -->
                  <div class="mb-5 pb-5 border-b border-white/[0.04]">
                    <div class="flex items-baseline gap-2">
                      <span class="text-4xl font-black text-white tracking-tight font-mono">{{
                        plan.prices[selectedCurrency].symbol }}{{ plan.prices[selectedCurrency].price }} </span>
                      <span class="text-[10px] text-white">{{ plan.prices[selectedCurrency].label }}</span>
                      <span
                        class="text-orange-700 rounded-3xl p-1 text-[10px] bg-orange-100 font-google-sans font-black uppercase tracking-widest">{{
                          plan.prices[selectedCurrency].period }}</span>
                      <span class="text-[10px] text-white/50 font-mono">(~&thinsp;${{
                        plan.prices[selectedCurrency].monthly }}
                        /mes)</span>
                    </div>
                    <p class="text-[#ff7900]/60 text-[10px] font-mono font-bold mt-1 uppercase tracking-wider">{{
                      plan.prices[selectedCurrency].note }}</p>
                  </div>

                  <!-- Features -->
                  <ul class="flex-1 space-y-3 mb-8">
                    <li v-for="(feature, idx) in plan.features" :key="idx" class="flex items-start gap-3">
                      <div class="w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5" :class="feature.included
                        ? (plan.featured ? 'bg-[#ff7900]/15 text-[#ff7900]' : 'bg-white/[0.06] text-white/60')
                        : 'bg-white/[0.02] text-white/15'" :style="feature.included && plan.featured
                          ? { borderColor: 'rgba(255,121,0,0.3)' }
                          : !feature.included
                            ? { border: '1px solid rgba(255,255,255,0.04)' }
                            : {}">
                        <span class="material-symbols-outlined notranslate text-[10px]! font-black">{{ feature.included
                          ? 'check' :
                          'remove' }}</span>
                      </div>
                      <span class="text-[13px] font-medium leading-snug font-mono"
                        :class="feature.included ? (plan.featured ? 'text-white/80' : 'text-white/60') : 'text-white/15 line-through decoration-white/5'">
                        {{ feature.label }}
                      </span>
                    </li>
                  </ul>

                  <!-- CTA -->
                  <button @click="handleSelect(plan.id)"
                    class="w-full h-11 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all duration-300 active:scale-[0.97] flex items-center justify-center gap-2 font-mono cursor-pointer"
                    :class="plan.featured
                      ? 'bg-[#ff7900] text-black hover:bg-[#ff7900]/90 shadow-lg shadow-[#ff7900]/15'
                      : 'bg-white/[0.04] text-white/70 hover:bg-white/[0.08] border border-white/[0.06]'">
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
              <div class="relative p-6 rounded-2xl border border-[#ff7900]/10 bg-[#ff7900]/[0.02] overflow-hidden">
                <div class="absolute inset-0 opacity-[0.02] pointer-events-none"
                  style="background-image: linear-gradient(rgba(255,121,0,.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,121,0,.3) 1px, transparent 1px); background-size: 20px 20px;">
                </div>
                <div class="relative z-10 text-center space-y-3">
                  <div
                    class="inline-flex items-center gap-2 text-[#ff7900] font-bold text-[10px] uppercase tracking-wider font-mono">
                    <span class="material-symbols-outlined notranslate text-[14px]">local_shipping</span>
                    Envío Físico — Solo México
                  </div>
                  <p class="text-sm text-white/70 leading-relaxed font-mono">
                    Cada plan incluye <strong class="text-[#ff7900]">1 envío físico gratuito</strong> a cualquier parte
                    de la República Mexicana.
                  </p>
                  <p class="text-[12px] text-white/50 leading-relaxed font-mono">
                    💡 <strong class="text-white">Recomendación:</strong> Solicita todos tus QRs permitidos en el primer
                    envío gratuito. QRs adicionales son gratuitos, con tarifa de envío de <strong
                      class="text-white">$199 MXN</strong> por paquete.
                  </p>
                </div>
              </div>
            </div>

            <!-- Footer note -->
            <p class="text-center text-white/15 text-[9px] font-black uppercase tracking-[0.35em] mt-14 font-mono">
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
