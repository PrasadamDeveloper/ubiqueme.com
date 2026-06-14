<template>
  <div class="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
    <div class="bg-[#1D1F2C] rounded-lg w-full max-w-sm border border-[#3A3D4E]">

      <!-- Icono de advertencia -->
      <div class="flex justify-center pt-6 pb-2">
        <div class="w-12 h-12 rounded-full bg-[#F38020]/10 flex items-center justify-center">
          <svg class="w-6 h-6 text-[#F38020]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
      </div>

      <!-- Header -->
      <div class="px-5 pt-2 pb-2 text-center">
        <h3 class="text-base font-medium text-[#E5E7EB] font-['Google_Sans']">
          Límite alcanzado
        </h3>
        <p class="text-sm text-[#A1A3B5] mt-2 leading-relaxed">
          Ya no puede crear más QR en su plan {{ subscriptionName ?? 'actual' }}.
        </p>
      </div>

      <!-- Body -->
      <div class="px-5 py-3 text-center">
        <div class="bg-[#242634] rounded-md px-3 py-2 border border-[#3A3D4E]">
          <p class="text-xs text-[#8A8D9E]">
            Le recomendamos
            <span class="text-[#F38020] font-medium">adquirir un nuevo plan</span>
            para seguir creando códigos QR ilimitados.
          </p>
        </div>
      </div>

      <!-- Footer -->
      <div class="px-5 py-4 border-t border-[#3A3D4E] flex justify-center gap-3">
        <button @click="emits('close')" class="px-4 py-1.5 text-sm text-[#A1A3B5] hover:text-[#E5E7EB]
                     transition-colors cursor-pointer bg-transparent rounded">
          Cerrar
        </button>
        <RouterLink :to="{ name: 'pricing' }" class="px-5 py-1.5 text-sm bg-[#F38020] hover:bg-[#E07010]
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
