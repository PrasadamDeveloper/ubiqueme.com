<template>
  <article v-if="plan"
    class="rounded-2xl border border-orange-200 bg-white shadow-[0_16px_40px_-20px_rgba(249,115,22,0.25)] overflow-hidden">

    <!-- Header -->
    <header class="flex items-start justify-between gap-3 bg-white px-5 py-4">
      <div class="min-w-0">
        <p class="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">Plan seleccionado</p>
        <div class="mt-1.5 flex flex-wrap items-center gap-2">
          <h3 class="text-xl font-black tracking-tight text-slate-900">{{ plan.name }}</h3>
          <span v-if="plan.badge"
            class="rounded-full bg-orange-500 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">
            {{ plan.badge }}
          </span>
        </div>
        <p class="mt-1 text-[12px] font-medium text-slate-500">{{ plan.tagline }}</p>
      </div>
      <div class="shrink-0 text-right">
        <p class="text-2xl font-black tracking-tight text-slate-900">${{ plan.prices.MXN.price }}</p>
        <p class="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          MXN <span class="ml-1 rounded-full bg-orange-500 px-2 py-0.5 text-white">AÑO</span>
        </p>
        <p class="mt-1 text-[10px] text-slate-400">≈ ${{ plan.prices.MXN.monthly }} / mes</p>
      </div>
    </header>

    <!-- Features -->
    <div class="border-y border-orange-100 bg-orange-50/40 px-5 py-4">
      <ul class="grid grid-cols-1 gap-1.5 min-[400px]:grid-cols-2">
        <li v-for="(feature, idx) in plan.features" :key="idx" class="flex items-start gap-2">
          <span class="material-symbols-outlined notranslate text-[15px] mt-0.5"
            :class="feature.included ? 'text-orange-500' : 'text-slate-300'">
            {{ feature.included ? 'check' : 'remove' }}
          </span>
          <span class="text-[12px] leading-snug" :class="feature.included ? 'text-slate-700' : 'text-slate-300 line-through'">
            {{ feature.label }}
          </span>
        </li>
      </ul>
    </div>

    <!-- Footer -->
    <footer class="flex items-center gap-2 bg-white px-5 py-3.5">
      <span class="material-symbols-outlined notranslate text-orange-500 text-[17px]">lock</span>
      <p class="text-[12px] font-medium text-slate-500">
        Inicia sesión para continuar con la compra del plan <b class="text-slate-900">{{ plan.name }}</b>.
      </p>
    </footer>
  </article>
</template>

<script setup lang="ts">
import type { Plan } from '@/data/plans'

defineProps<{
  plan: Plan | undefined
}>()
</script>
