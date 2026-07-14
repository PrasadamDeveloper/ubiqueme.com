<script lang="ts" setup>
import type { IFeature } from '@/interfaces/IFeature'

const props = defineProps<{
  feature: IFeature
}>()
</script>

<template>
  <div class="bg-white p-10 rounded-4xl border border-orange-200 hover:border-orange-500/30 transition-all group">
    <span
      class="material-symbols-outlined notranslate text-gray-400 mb-6 text-3xl group-hover:text-amber-500 transition-colors"
      :data-icon="props.feature.icon">
      {{ props.feature.icon }}
    </span>
    <h4 class="font-headline text-xl font-bold mb-4 text-gray-900">{{ props.feature.title }}</h4>
    <p class="text-gray-600 leading-relaxed">{{ props.feature.description }}</p>
  </div>
</template>

<style scoped></style>
