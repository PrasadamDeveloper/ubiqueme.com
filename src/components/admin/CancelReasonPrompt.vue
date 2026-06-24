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
    <div v-if="isOpen" class="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">

      <div class="w-full max-w-sm rounded-2xl border border-white/[0.08] bg-[#0d0d0e] shadow-2xl overflow-hidden">

        <!-- Header -->
        <div class="p-5 pb-3 space-y-1">
          <div class="flex items-center gap-3">
            <div
              class="w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
              <span class="material-symbols-outlined notranslate text-red-400 text-base">block</span>
            </div>
            <div>
              <h3 class="text-sm font-semibold text-white">Cancelar suscripción</h3>
              <p class="text-[11px] text-white/40">
                Plan <span class="text-white/60 capitalize">{{ planType }}</span> de
                <span class="text-white/60">{{ userName }}</span>
              </p>
            </div>
          </div>
        </div>

        <!-- Form -->
        <div class="px-5 pb-4 space-y-2">
          <label class="text-[9px] uppercase tracking-widest text-white/35 font-medium">Motivo</label>
          <textarea v-model="cancelReasonInput" placeholder="Ej. Solicitud del usuario, impago, cambio de plan..."
            class="w-full h-24 px-3.5 py-3 rounded-xl border border-white/[0.06] bg-white/[0.03] text-white text-[12px] outline-none focus:border-red-500/30 placeholder:text-white/20 resize-none transition-colors">
          </textarea>
        </div>

        <!-- Actions -->
        <div class="flex gap-2 px-5 pb-5">
          <button @click="handleCancel"
            class="flex-1 h-10 rounded-xl border border-white/[0.06] bg-white/[0.03] text-white/70 text-[10px] font-semibold uppercase tracking-widest hover:bg-white/[0.06] transition cursor-pointer">
            Volver
          </button>
          <button @click="handleSubmit" :disabled="loading"
            class="flex-1 h-10 rounded-xl bg-red-500 hover:bg-red-600 text-white text-[10px] font-semibold uppercase tracking-widest transition disabled:opacity-40 flex items-center justify-center gap-1.5 cursor-pointer">
            <span v-if="loading"
              class="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
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
  transform: scale(0.95);
}

.md3-dialog-enter-to,
.md3-dialog-leave-from {
  opacity: 1;
  transform: scale(1);
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
