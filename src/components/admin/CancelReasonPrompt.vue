<script lang="ts" setup>
import { ref, watch } from 'vue'

const props = defineProps<{
  isOpen: boolean
  planType: string
  userName: string
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'submit', reason: string): void
  (e: 'cancel'): void
}>()

const cancelReasonInput = ref('')

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    cancelReasonInput.value = ''
  }
})

const handleSubmit = () => {
  emit('submit', cancelReasonInput.value.trim())
}

const handleCancel = () => {
  emit('cancel')
}
</script>

<template>
  <Transition name="md3-dialog">
    <div v-if="isOpen" class="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">

      <div class="w-full max-w-sm rounded-3xl border border-gray-200/70 bg-white shadow-2xl overflow-hidden">

        <!-- Header -->
        <div class="p-6 pb-4 space-y-1">
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 rounded-2xl bg-red-50 flex items-center justify-center shrink-0">
              <span class="material-symbols-outlined notranslate text-red-500 text-base">block</span>
            </div>
            <div>
              <h3 class="text-base font-semibold text-gray-900">Cancelar suscripción</h3>
              <p class="text-[12px] text-gray-500">
                Plan <span class="text-gray-700 font-medium capitalize">{{ planType }}</span> de
                <span class="text-gray-700 font-medium">{{ userName }}</span>
              </p>
            </div>
          </div>
        </div>

        <!-- Form -->
        <div class="px-6 pb-5 space-y-2">
          <label class="text-[10px] uppercase tracking-widest text-gray-500 font-semibold">Motivo</label>
          <textarea v-model="cancelReasonInput" placeholder="Ej. Solicitud del usuario, impago, cambio de plan..."
            class="w-full h-24 px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-red-400 focus:bg-white focus:ring-4 focus:ring-red-500/10 resize-none transition-all duration-300">
          </textarea>
        </div>

        <!-- Actions -->
        <div class="flex gap-2.5 px-6 pb-6">
          <button @click="handleCancel"
            class="flex-1 h-11 rounded-2xl bg-gray-100 text-gray-700 text-[11px] font-bold uppercase tracking-widest hover:bg-gray-200 transition-all duration-200 active:scale-95 cursor-pointer">
            Volver
          </button>
          <button @click="handleSubmit" :disabled="loading"
            class="flex-1 h-11 rounded-2xl bg-red-500 hover:bg-red-600 text-white text-[11px] font-bold uppercase tracking-widest shadow-lg shadow-red-500/25 transition-all duration-200 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 cursor-pointer">
            <span v-if="loading"
              class="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            <span v-else>Cancelar</span>
          </button>
        </div>

      </div>

    </div>
  </Transition>
</template>

<style scoped>
.material-symbols-outlined {
  font-variation-settings: 'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 24;
}

.md3-dialog-enter-active {
  transition: opacity 200ms cubic-bezier(0.2, 0, 0, 1), transform 200ms cubic-bezier(0.2, 0, 0, 1);
}

.md3-dialog-leave-active {
  transition: opacity 150ms cubic-bezier(0.4, 0, 1, 1), transform 150ms cubic-bezier(0.4, 0, 1, 1);
}

.md3-dialog-enter-from,
.md3-dialog-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(8px);
}

.md3-dialog-enter-to,
.md3-dialog-leave-from {
  opacity: 1;
  transform: scale(1) translateY(0);
}

@media (prefers-reduced-motion: reduce) {

  .md3-dialog-enter-active,
  .md3-dialog-leave-active {
    transition: none;
  }

  .md3-dialog-enter-from,
  .md3-dialog-leave-to {
    opacity: 1;
    transform: none;
  }
}
</style>
