<template>
  <div class="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-sm">

    <section class="w-full max-w-sm rounded-2xl border border-white/[0.08] bg-[#0d0d0e] shadow-2xl overflow-hidden">

      <!-- Header -->
      <div class="p-5 pb-3 space-y-1">
        <div class="flex items-center gap-3">
          <div
            class="w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
            <span class="material-symbols-outlined notranslate text-red-400 text-base">warning</span>
          </div>
          <div>
            <h3 class="text-sm font-semibold text-white">Cancelar plan</h3>
            <p class="text-[11px] text-white/40">Esta acción es irreversible</p>
          </div>
        </div>
      </div>

      <!-- Content -->
      <div class="px-5 pb-3">
        <div class="rounded-xl bg-red-500/[0.04] border border-red-500/10 p-3.5 space-y-2">
          <p class="text-[11px] text-red-300/80 leading-relaxed">
            Se eliminará el plan activo del usuario: fecha de compra, vencimiento y proveedor de pago.
          </p>
          <p class="text-[11px] text-white font-medium">
            El usuario quedará sin plan asignado.
          </p>
        </div>
      </div>

      <!-- Footer -->
      <div class="flex gap-2 px-5 pb-5">
        <button @click="handleCancel"
          class="flex-1 h-10 rounded-xl border border-white/[0.06] bg-white/[0.03] text-white/70 text-[10px] font-semibold uppercase tracking-widest hover:bg-white/[0.06] transition cursor-pointer">
          Cancelar
        </button>
        <button @click="handleConfirm" :disabled="loading"
          class="flex-1 h-10 rounded-xl bg-red-500 hover:bg-red-600 text-white text-[10px] font-semibold uppercase tracking-widest transition disabled:opacity-40 flex items-center justify-center gap-1.5 cursor-pointer">
          <span v-if="loading" class="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
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
