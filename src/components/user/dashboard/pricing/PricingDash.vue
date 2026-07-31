<script lang="ts" setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { plans } from '@/data/plans'

const router = useRouter()

const currencies = [
  { key: 'MXN' as const, label: 'MXN', flag: '🇲🇽' },
  { key: 'USD' as const, label: 'USD', flag: '🇺🇸' },
  { key: 'CLP' as const, label: 'CLP', flag: '🇨🇱' },
]
const selectedCurrency = ref<'MXN' | 'USD' | 'CLP'>('MXN')

const handleSelect = (id: string) => {
  router.push({ name: 'checkout', params: { planId: id } })
}
</script>

<template>
  <div class="relative min-h-screen bg-gray-50 font-google-sans overflow-hidden">

    <!-- Subtle grid overlay -->
    <div class="absolute inset-0 pointer-events-none"
      style="background-image: linear-gradient(rgba(0,0,0,.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,.05) 1px, transparent 1px); background-size: 48px 48px;">
    </div>

    <!-- Radial glow top -->
    <div
      class="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[#ff7900]/3 rounded-full blur-[120px] pointer-events-none">
    </div>

    <div class="relative z-10 pt-10 pb-20 px-4 sm:px-6">
      <div class="max-w-6xl mx-auto">

        <!-- Header -->
        <header class="text-center mb-12 space-y-5">
          <div
            class="inline-flex items-center gap-2 px-4 py-1.5 bg-[#ff7900]/10 rounded-full border border-[#ff7900]/20">
            <span class="w-1.5 h-1.5 rounded-full bg-[#ff7900]"></span>
            <span class="text-[10px] font-black uppercase tracking-[0.3em] text-[#ff7900] font-mono">Planes de
              Protección</span>
          </div>
          <h1 class="text-4xl md:text-6xl font-black text-gray-900 tracking-tight">
            Elija su <br>
            <span class="text-[#ff7900]">Plan</span>
          </h1>
          <p class="max-w-xl mx-auto text-gray-500 text-sm md:text-base leading-relaxed">
            Sin complicaciones. Sin contratos forzosos. Solo la protección que usted necesita.
          </p>
        </header>

        <!-- Currency Selector -->
        <div class="flex justify-center mb-10">
          <div class="inline-flex bg-white rounded-xl border border-gray-200 p-1 gap-0.5">
            <button v-for="c in currencies" :key="c.key" @click="selectedCurrency = c.key"
              class="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all duration-200 cursor-pointer"
              :class="selectedCurrency === c.key
                ? 'bg-[#ff7900] text-black shadow-lg shadow-[#ff7900]/20'
                : 'text-gray-400 hover:text-gray-700'">
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
              ? 'bg-white border-[#ff7900]/30 shadow-[0_0_60px_rgba(255,121,0,0.06)] md:-translate-y-3 shadow-sm'
              : 'bg-white border-gray-200 hover:border-gray-300 shadow-sm'
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
                  <p class="text-[9px] font-black uppercase tracking-[0.3em] text-gray-400 font-mono mb-1">Plan</p>
                  <h3 class="text-2xl font-black text-gray-900 tracking-tight uppercase">{{ plan.name }}</h3>
                </div>
                <div class="w-10 h-10 rounded-xl border flex items-center justify-center shrink-0"
                  :class="plan.featured ? 'border-orange-200 bg-orange-50' : 'border-gray-200 bg-gray-100'">
                  <span class="material-symbols-outlined notranslate text-lg"
                    :class="plan.featured ? 'text-orange-500' : 'text-gray-500'">
                    {{ plan.id === 'bronce' ? 'shield' : plan.id === 'plata' ? 'verified_user' : 'military_tech' }}
                  </span>
                </div>
              </div>

              <!-- Description -->
              <p class="text-sm text-gray-500 font-mono mb-6">{{ plan.description }}</p>

              <!-- Price -->
              <div class="mb-5 pb-5 border-b border-gray-100">
                <div class="flex items-baseline gap-2">
                  <span class="text-4xl font-black text-gray-900 tracking-tight font-mono">{{
                    plan.prices[selectedCurrency].symbol }}{{ plan.prices[selectedCurrency].price }} </span>
                  <span class="text-[10px] text-gray-600">{{ plan.prices[selectedCurrency].label }}</span>
                  <span
                    class="text-orange-700 rounded-3xl p-1 text-[10px] bg-orange-100 font-google-sans font-black uppercase tracking-widest">{{
                      plan.prices[selectedCurrency].period }}</span>
                  <span class="text-[10px] text-gray-500 font-mono">(~&thinsp;${{
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
                    ? (plan.featured ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-600')
                    : 'bg-gray-50 text-gray-300'" :style="feature.included && plan.featured
                      ? { borderColor: 'rgba(255,121,0,0.3)' }
                      : !feature.included
                        ? { border: '1px solid rgba(0,0,0,0.06)' }
                        : {}">
                    <span class="material-symbols-outlined notranslate text-[10px]! font-black">{{ feature.included ?
                      'check' :
                      'remove' }}</span>
                  </div>
                  <span class="text-[13px] font-medium leading-snug font-mono"
                    :class="feature.included ? (plan.featured ? 'text-gray-800' : 'text-gray-600') : 'text-gray-300 line-through decoration-gray-200'">
                    {{ feature.label }}
                  </span>
                </li>
              </ul>

              <!-- CTA -->
              <button @click="handleSelect(plan.id)"
                class="w-full h-11 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all duration-300 active:scale-[0.97] flex items-center justify-center gap-2 font-mono cursor-pointer"
                :class="plan.featured
                  ? 'bg-[#ff7900] text-black hover:bg-[#ff7900]/90 shadow-lg shadow-[#ff7900]/15'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'">
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
        <div class="mt-12 max-w-3xl mx-auto">
          <div class="relative p-6 rounded-2xl border border-orange-200 bg-orange-50 overflow-hidden">
            <div class="absolute inset-0 pointer-events-none"
              style="background-image: linear-gradient(rgba(255,121,0,.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,121,0,.15) 1px, transparent 1px); background-size: 20px 20px;">
            </div>
            <div class="relative z-10 text-center space-y-3">
              <div
                class="inline-flex items-center gap-2 text-orange-600 font-bold text-[10px] uppercase tracking-wider font-mono">
                <span class="material-symbols-outlined notranslate text-[14px]">local_shipping</span>
                Envío Físico — Solo México
              </div>
              <p class="text-sm text-gray-600 leading-relaxed font-mono">
                Cada plan incluye <strong class="text-orange-600">1 envío físico gratuito</strong> a cualquier parte
                de la República Mexicana.
              </p>
              <p class="text-[12px] text-gray-500 leading-relaxed font-mono">
                💡 <strong class="text-white">Recomendación:</strong> Solicita todos tus QRs permitidos en el primer
                envío gratuito. QRs adicionales son gratuitos, con tarifa de envío de <strong class="text-white">$199
                  MXN</strong> por paquete.
              </p>
            </div>
          </div>
        </div>

        <!-- Footer note -->
        <p class="text-center text-gray-400 text-[9px] font-black uppercase tracking-[0.35em] mt-12 font-mono">
          Encriptación de extremo a extremo · Sin contratos forzosos · Cancela cuando quieras
        </p>

      </div>
    </div>
  </div>
</template>

<style scoped>
.font-google-sans {
  font-family: 'Google Sans', 'Inter', sans-serif;
}

.material-symbols-outlined {
  font-variation-settings: 'FILL' 1, 'wght' 600, 'GRAD' 0, 'opsz' 24;
}
</style>
