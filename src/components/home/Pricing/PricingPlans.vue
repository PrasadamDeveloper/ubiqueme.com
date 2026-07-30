<script lang="ts" setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

const selectedCurrency = ref<'MXN' | 'USD' | 'CLP'>('MXN')

const currencies = [
  { key: 'MXN', label: 'MXN' },
  { key: 'USD', label: 'USD' },
  { key: 'CLP', label: 'CLP' },
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


const plans = [
  {
    id: 'bronce',
    name: 'Bronce',
    tagline: 'Protección básica esencial',
    badge: '',
    recommended: false,

    prices: {
      MXN: {
        price: '499',
        monthly: '42'
      },
      USD: {
        price: '29',
        monthly: '2.4'
      },
      CLP: {
        price: '25000',
        monthly: '2100'
      }
    },

    features: [
      ['Escaneo vía WhatsApp', true],
      ['Alertas instantáneas', true],
      ['Mensaje protegido', true],
      ['1 código QR activo', true],
      ['Contador básico', true],
      ['Historial de escaneos', false],
      ['Notificaciones email', false],
      ['Regeneraciones gratis', false],
    ]
  },


  {
    id: 'plata',
    name: 'Plata',
    tagline: 'Para proteger varios objetos',
    badge: 'Más elegido',
    recommended: true,

    prices: {
      MXN: {
        price: '999',
        monthly: '83'
      },
      USD: {
        price: '59',
        monthly: '4.9'
      },
      CLP: {
        price: '49000',
        monthly: '4100'
      }
    },

    features: [
      ['Escaneo vía WhatsApp', true],
      ['Alertas instantáneas', true],
      ['Mensaje protegido', true],
      ['3 códigos QR activos', true],
      ['Contador en tiempo real', true],
      ['Pausar QR', true],
      ['Historial 30 días', true],
      ['Notificaciones email', true],
      ['3 regeneraciones gratis', true],
    ]
  },


  {
    id: 'oro',
    name: 'Oro',
    tagline: 'Control completo sin límites',
    badge: 'Premium',
    recommended: false,

    prices: {
      MXN: {
        price: '1499',
        monthly: '125'
      },
      USD: {
        price: '89',
        monthly: '7.4'
      },
      CLP: {
        price: '75000',
        monthly: '6300'
      }
    },

    features: [
      ['Escaneo vía WhatsApp', true],
      ['Alertas instantáneas', true],
      ['Mensaje protegido', true],
      ['5 códigos QR activos', true],
      ['Contador en tiempo real', true],
      ['Pausar QR', true],
      ['Historial ilimitado', true],
      ['Email prioritario', true],
      ['5 regeneraciones gratis', true],
    ]
  }
]

</script>


<template>
  <section class="bg-white py-6 sm:py-5">
    <div class="mx-auto max-w-7xl px-5 sm:px-8">

      <!-- Header -->
      <header class="mx-auto mb-12 max-w-2xl text-center sm:mb-16">
        <span
          class="inline-block rounded-full bg-orange-50 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-orange-600">
          Planes
        </span>
        <h2 class="mt-5 text-[28px] font-semibold leading-tight tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
          Elija la protección que necesita
        </h2>
        <p class="mx-auto mt-3 max-w-lg text-[15px] leading-relaxed text-slate-500">
          Todos los planes incluyen privacidad, alertas y protección mediante código QR.
          Seleccione el nivel de control adecuado para usted.
        </p>
      </header>

      <!-- Currency segmented control -->
      <div class="flex justify-center mb-8">
        <div class="inline-flex rounded-full bg-slate-100 p-0.5">
          <button v-for="currency in currencies" :key="currency.key" @click="selectedCurrency = currency.key as any"
            class="px-4 py-2 rounded-full text-[12px] font-semibold transition"
            :class="selectedCurrency === currency.key ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'">
            {{ currency.label }}
          </button>
        </div>
      </div>

      <!-- Plans -->
      <div class="grid gap-4 sm:gap-5 md:grid-cols-3">
        <article v-for="plan in plans" :key="plan.id"
          class="relative flex flex-col rounded-2xl border bg-white p-5 sm:p-6 transition hover:border-orange-300"
          :class="plan.recommended ? 'border-orange-400' : 'border-slate-200'">

          <!-- Badge -->
          <div v-if="plan.badge"
            class="absolute -top-3 left-5 rounded-full bg-orange-500 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white">
            {{ plan.badge }}
          </div>

          <!-- Identity -->
          <div class="mb-5">
            <h3 class="text-xl font-semibold text-slate-900 sm:text-2xl">{{ plan.name }}</h3>
            <p class="mt-1.5 text-[13px] text-slate-500 sm:text-sm">{{ plan.tagline }}</p>
          </div>

          <!-- Price -->
          <div class="border-b border-slate-100 pb-5 mb-5">
            <div class="flex items-end gap-2">
              <span class="text-[32px] font-semibold tracking-tight text-slate-900 sm:text-4xl">
                ${{ plan.prices[selectedCurrency].price }}
              </span>
              <span class="text-[13px] text-slate-500">
                {{ selectedCurrency }}
                <span
                  class="ml-1 rounded-full bg-orange-500 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">AÑO</span>
              </span>
            </div>
            <p class="mt-1.5 text-[12px] text-slate-400">≈ ${{ plan.prices[selectedCurrency].monthly }} / mes</p>
          </div>

          <!-- Features -->
          <ul class="space-y-2.5 flex-1">
            <li v-for="feature in plan.features" :key="feature[0]" class="flex items-start gap-2.5 text-sm">
              <span class="material-symbols-outlined notranslate text-[16px] mt-0.5"
                :class="feature[1] ? 'text-orange-500' : 'text-slate-300'">
                {{ feature[1] ? 'check' : 'remove' }}
              </span>
              <span :class="feature[1] ? 'text-slate-700' : 'text-slate-300 line-through'">
                {{ feature[0] }}
              </span>
            </li>
          </ul>

          <button @click="handlePlanClick(plan.id)"
            class="mt-6 h-11 rounded-full bg-orange-500 text-sm font-semibold text-white transition hover:bg-orange-600 active:scale-[0.97]">
            Activar {{ plan.name }}
          </button>
        </article>
      </div>

      <!-- Shipping – iOS grouped cell -->
      <div class="mt-10 bg-slate-50 rounded-2xl p-5 sm:p-6 text-center">
        <div class="flex justify-center gap-2 items-center text-sm font-semibold text-slate-900">
          <span class="material-symbols-outlined notranslate text-orange-500 text-[18px]">local_shipping</span>
          Envío físico incluido en México
        </div>
        <p class="mt-1.5 text-[13px] text-slate-500">
          Cada plan incluye un primer envío gratuito.
          Los códigos adicionales pueden solicitarse posteriormente.
        </p>
      </div>

    </div>
  </section>
</template>
