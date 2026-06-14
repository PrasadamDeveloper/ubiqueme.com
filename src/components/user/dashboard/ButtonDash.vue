<script lang="ts" setup>
const props = defineProps({
  name: {
    type: String,
    required: true,
  },
  isHover: {
    type: Boolean,
  },
  index: {
    type: Number,
    required: true,
  },
  icon: {
    type: String,
    required: true,
  },
  iconActive: {
    type: String,
    required: true,
  },
  active: {
    type: Boolean,
    required: true,
  },
})
</script>

<template>
  <button :class="[
    'relative flex items-center gap-3 rounded-[10px] transition-all duration-300 overflow-hidden',
    'min-h-[42px] px-3 cursor-pointer',
    active
      ? 'bg-orange-500/10 text-orange-400'
      : 'text-white/50 hover:bg-white/5'
  ]" :style="{ width: isHover ? '184px' : '47px' }">
    <!-- indicador activo -->
    <span v-if="active" class="absolute left-0 top-[20%] bottom-[20%] w-0.5 rounded-full bg-orange-500"></span>

    <!-- ícono -->
    <v-icon :name="active ? iconActive : icon" scale="1.3" :class="active ? 'opacity-100' : 'opacity-75'" />

    <!-- label con fade + colapso de ancho -->
    <span
      class="text-sm font-light tracking-wide whitespace-nowrap pointer-events-none transition-all duration-200 font-google-sans"
      :style="{
        opacity: isHover ? '1' : '0',
        maxWidth: isHover ? '140px' : '0px',
        overflow: 'hidden',
      }">
      {{ name }}
    </span>
  </button>
</template>

<style scoped></style>
