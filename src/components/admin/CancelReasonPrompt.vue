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
  <Transition name="fade-scale">
    <div v-if="isOpen" class="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4">
      <div class="bg-[#09090b] border border-white/10 w-full max-w-md rounded-xl p-5 relative overflow-hidden">
        <div class="absolute inset-0 opacity-[0.02] pointer-events-none"
          style="background-image:linear-gradient(rgba(255,255,255,.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.5) 1px,transparent 1px);background-size:22px 22px;">
        </div>

        <div class="relative z-10 space-y-5">
          <div class="flex gap-4 items-start">
            <div
              class="w-12 h-12 rounded-2xl border border-red-500/15 bg-red-500/5 flex items-center justify-center shrink-0">
              <span class="material-symbols-outlined notranslate text-red-400">block</span>
            </div>
            <div>
              <h3 class="text-xl font-semibold text-white">Cancelar suscripción</h3>
              <p class="text-xs text-white/40 mt-1">
                Se cancelará el plan <span class="text-white font-semibold capitalize">{{ planType }}</span> de
                <span class="text-white">{{ userName }}</span>
              </p>
            </div>
          </div>

          <div class="space-y-2">
            <label class="text-[10px] uppercase tracking-widest text-white/40">Motivo de cancelación</label>
            <textarea v-model="cancelReasonInput" placeholder="Ej. Solicitud del usuario, impago, cambio de plan..."
              class="w-full h-28 px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder:text-white/20 outline-none focus:border-red-500 resize-none text-sm">
            </textarea>
          </div>

          <div class="grid grid-cols-2 gap-2">
            <button @click="handleCancel"
              class="h-10 rounded-xl border border-white/10 bg-white/5 text-xs uppercase text-white/70 cursor-pointer">
              Volver
            </button>
            <button @click="handleSubmit" :disabled="loading"
              class="h-10 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs uppercase font-semibold cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2">
              <span v-if="loading"
                class="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              <span v-else>Cancelar suscripción</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
/* Transitions.dev — Modal open / close */
.fade-scale-enter-active {
  transition: opacity 250ms cubic-bezier(0.22, 1, 0.36, 1),
    transform 250ms cubic-bezier(0.22, 1, 0.36, 1);
}

.fade-scale-leave-active {
  transition: opacity 150ms cubic-bezier(0.22, 1, 0.36, 1),
    transform 150ms cubic-bezier(0.22, 1, 0.36, 1);
}

.fade-scale-enter-from,
.fade-scale-leave-to {
  opacity: 0;
  transform: scale(0.96);
}

.fade-scale-enter-to,
.fade-scale-leave-from {
  opacity: 1;
  transform: scale(1);
}

.fade-scale-enter-active>div:last-child,
.fade-scale-leave-active>div:last-child,
.fade-scale-enter-active>div:first-child,
.fade-scale-leave-active>div:first-child {
  will-change: transform, opacity;
}

@media (prefers-reduced-motion: reduce) {

  .fade-scale-enter-active,
  .fade-scale-leave-active {
    transition: none;
  }

  .fade-scale-enter-from,
  .fade-scale-leave-to {
    opacity: 0;
    transform: none;
  }
}
</style>
