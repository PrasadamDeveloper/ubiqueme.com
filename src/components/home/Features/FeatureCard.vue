<script lang="ts" setup>
import type { IFeature } from '@/interfaces/IFeature'

defineProps<{
  feature: IFeature
}>()
</script>


<template>

  <article class="
group
rounded-2xl
bg-white
p-6
border
border-slate-200
transition
hover:border-slate-300
hover:shadow-sm
">


    <div class="
flex
h-10
w-10
items-center
justify-center
rounded-xl
bg-slate-100
mb-5
">

      <span class="
material-symbols-outlined
text-xl
text-slate-700
transition-colors
group-hover:text-orange-600
">
        {{ feature.icon }}
      </span>

    </div>



    <h3 class="text-lg font-semibold text-slate-950">
      {{ feature.title }}
    </h3>



    <p class="mt-2 text-sm leading-6 text-slate-600">
      {{ feature.description }}
    </p>


  </article>

</template>
