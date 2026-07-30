<template>
  <div class="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg w-full max-w-sm border border-slate-200">

      <!-- Icono de advertencia -->
      <div class="flex justify-center pt-6 pb-2">
        <div class="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
          <svg class="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
      </div>

      <!-- Header -->
      <div class="px-5 pt-2 pb-2 text-center">
        <h3 class="text-base font-medium text-slate-900 font-['Google_Sans']">
          Límite alcanzado
        </h3>
        <p class="text-sm text-slate-500 mt-2 leading-relaxed">
          Ya no puede crear más QR en su plan {{ subscriptionName ?? 'actual' }}.
        </p>
      </div>

      <!-- Body -->
      <div class="px-5 py-3 text-center">
        <div class="bg-orange-50 rounded-md px-3 py-2 border border-orange-200">
          <p class="text-xs text-slate-600">
            Le recomendamos
            <span class="text-orange-500 font-medium">adquirir un nuevo plan</span>
            para seguir creando códigos QR ilimitados.
          </p>
        </div>
      </div>

      <!-- Footer -->
      <div class="px-5 py-4 border-t border-slate-200 flex justify-center gap-3">
        <button @click="emits('close')" class="px-4 py-1.5 text-sm text-slate-500 hover:text-slate-700
                     transition-colors cursor-pointer bg-transparent rounded">
          Cerrar
        </button>
        <RouterLink :to="{ name: 'pricing' }" class="px-5 py-1.5 text-sm bg-orange-500 hover:bg-orange-600
                     text-white rounded transition-colors cursor-pointer
                     font-medium">
          Ver planes
        </RouterLink>
      </div>

    </div>
  </div>
</template>

<script lang="ts" setup>
const props = defineProps({
  subscriptionName: {
    type: String,
    default: null
  }
})

const emits = defineEmits(['close']);
</script>

<style scoped></style>
