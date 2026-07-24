<script lang="ts" setup>
import type { IFeature } from '@/interfaces/IFeature'
import { computed } from 'vue'

const props = defineProps<{
  feature: IFeature
}>()

const cardId = computed(() => 'feature-card-' + props.feature.title.toLowerCase().replace(/\s+/g, '-'))
</script>

<template>
  <article :data-od-id="cardId" class="group rounded-2xl border border-gray-100 bg-white p-6 motion-safe:transition-all motion-safe:duration-300 hover:border-orange-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2">
    <div class="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 ring-1 ring-orange-200 motion-safe:transition-all motion-safe:duration-300 motion-safe:ease-out group-hover:bg-orange-100 group-hover:ring-orange-300">
      <span class="material-symbols-outlined text-2xl text-orange-500 motion-safe:transition-all motion-safe:duration-300 motion-safe:ease-out group-hover:scale-110 group-hover:text-orange-600">
        {{ feature.icon }}
      </span>
    </div>
    <h3 class="text-lg font-semibold text-gray-900">
      {{ feature.title }}
    </h3>
    <p class="mt-2 text-sm leading-6 text-gray-500">
      {{ feature.description }}
    </p>
  </article>
</template>
