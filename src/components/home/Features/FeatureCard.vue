<script lang="ts" setup>
import type { IFeature } from '@/interfaces/IFeature'

const props = defineProps<{
  feature: IFeature
}>()
</script>

<template>
  <div
    class="bg-surface-container-lowest p-10 rounded-4xl border border-orange-950 hover:border-orange-500/30 transition-all group"
  >
    <span
      class="material-symbols-outlined text-on-surface-variant mb-6 text-3xl group-hover:text-amber-500 transition-colors"
      :data-icon="props.feature.icon"
    >
      {{ props.feature.icon }}
    </span>
    <h4 class="font-headline text-xl font-bold mb-4 text-slate-100">{{ props.feature.title }}</h4>
    <p class="text-on-surface-variant leading-relaxed">{{ props.feature.description }}</p>
  </div>
</template>

<style scoped></style>
