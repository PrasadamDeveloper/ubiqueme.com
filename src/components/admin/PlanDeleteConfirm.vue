<template>
  <div class="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 backdrop-blur-sm">

    <section class="w-full max-w-sm rounded-3xl border border-gray-200/70 bg-white shadow-2xl overflow-hidden">

      <!-- Header -->
      <div class="p-6 pb-4 space-y-1">
        <div class="flex items-center gap-3">
          <div
            class="w-10 h-10 rounded-2xl bg-red-50 flex items-center justify-center shrink-0">
            <span class="material-symbols-outlined notranslate text-red-500 text-base">warning</span>
          </div>
          <div>
            <h3 class="text-base font-semibold text-gray-900">Cancelar plan</h3>
            <p class="text-[12px] text-gray-500">Esta acción es irreversible</p>
          </div>
        </div>
      </div>

      <!-- Content -->
      <div class="px-6 pb-4">
        <div class="rounded-2xl bg-red-50/60 border border-red-100 p-4 space-y-2">
          <p class="text-xs text-red-600 leading-relaxed">
            Se eliminará el plan activo del usuario: fecha de compra, vencimiento y proveedor de pago.
          </p>
          <p class="text-xs text-gray-900 font-semibold">
            El usuario quedará sin plan asignado.
          </p>
        </div>
      </div>

      <!-- Footer -->
      <div class="flex gap-2.5 px-6 pb-6">
        <button @click="handleCancel"
          class="flex-1 h-11 rounded-2xl bg-gray-100 text-gray-700 text-[11px] font-bold uppercase tracking-widest hover:bg-gray-200 transition-all duration-200 active:scale-95 cursor-pointer">
          Cancelar
        </button>
        <button @click="handleConfirm" :disabled="loading"
          class="flex-1 h-11 rounded-2xl bg-red-500 hover:bg-red-600 text-white text-[11px] font-bold uppercase tracking-widest shadow-lg shadow-red-500/25 transition-all duration-200 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 cursor-pointer">
          <span v-if="loading" class="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
          <span v-else>Confirmar</span>
        </button>
      </div>

    </section>

  </div>
</template>

<script lang="ts" setup>
defineProps<{
  loading?: boolean
}>()

const emit = defineEmits(['cancel', 'confirm']);

const handleCancel = () => {
  emit('cancel')
}

const handleConfirm = () => {
  emit('confirm')
}
</script>

<style scoped>
.material-symbols-outlined {
  font-variation-settings: 'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 24;
}
</style>
