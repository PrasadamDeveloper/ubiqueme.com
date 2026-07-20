<script lang="ts" setup>
import type { IStep } from '@/interfaces/IStep'

defineProps<{
  steps: IStep
}>()
</script>


<template>

  <article class="group overflow-hidden rounded-2xl bg-white border border-slate-200 transition hover:border-slate-300">

    <!-- Media -->

    <div class="aspect-video overflow-hidden bg-slate-100">

      <video class="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
        v-lazy-video="steps.video" autoplay loop muted playsinline />

    </div>


    <!-- Content -->

    <div class="p-5">

      <div class="flex items-center justify-between mb-5">

        <span class="text-xs font-semibold tracking-widest text-slate-400">
          {{ steps.number }}
        </span>


        <span class="material-symbols-outlined text-orange-600">
          {{ steps.icon }}
        </span>

      </div>


      <h3 class="text-lg font-semibold text-slate-950">
        {{ steps.title }}
      </h3>


      <p class="mt-2 text-sm leading-6 text-slate-600">
        {{ steps.description }}
      </p>


    </div>


  </article>

</template>
