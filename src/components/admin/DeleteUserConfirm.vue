<script lang="ts" setup>
import type { IUser } from '@/interfaces/IUser';
import { ref, watch, computed } from 'vue'

const props = defineProps<{
  isOpen: boolean
  user: IUser
  processing?: boolean
}>()

const emit = defineEmits<{
  (e: 'submit'): void
  (e: 'cancel'): void
}>()

const CONFIRM_STRING = 'confirmar'
const confirmInput = ref('')

watch(
  () => props.isOpen,
  (newVal) => {
    if (newVal) confirmInput.value = ''
  },
)

const isConfirmed = computed(() => confirmInput.value.trim() === CONFIRM_STRING)

const handleSubmit = () => {
  if (!isConfirmed.value || props.processing) return
  emit('submit')
}

const handleCancel = () => {
  emit('cancel')
}

const formatDate = (timestamp: { seconds?: number } | null | undefined) => {
  if (!timestamp?.seconds) return '—'
  return new Date(timestamp.seconds * 1000).toLocaleString('es-MX', {
    dateStyle: 'full',
    timeStyle: 'short',
  })
}
</script>

<template>
  <Transition name="md3-dialog">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center p-4 backdrop-blur-sm">

      <div
        class="relative w-full max-w-2xl rounded-2xl border border-white/[0.08] bg-[#0d0d0e] shadow-2xl overflow-hidden">

        <div class="grid md:grid-cols-[1fr_1.2fr]">

          <!-- LEFT: User card + info -->
          <div class="p-5 border-b md:border-b-0 md:border-r border-white/[0.06] space-y-4 bg-white/[0.01]">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl flex items-center justify-center text-base font-black bg-red-500/10 text-red-400">
                <span class="material-symbols-outlined notranslate text-xl">person_off</span>
              </div>
              <div>
                <span class="text-[9px] uppercase tracking-[0.2em] font-black text-red-400">
                  Eliminar usuario
                </span>
                <h3 class="text-sm font-semibold text-white mt-0.5">{{ user.name }}</h3>
              </div>
            </div>

            <div class="space-y-2 text-[11px]">
              <div class="flex justify-between">
                <span class="text-white/35">Email</span>
                <span class="text-white/70">{{ user.email }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-white/35">UID</span>
                <span class="text-white/50 font-mono text-[9px]">{{ user.uid }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-white/35">QRs</span>
                <span class="text-white/70">{{ user.totalQRs }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-white/35">Rol</span>
                <span class="text-[#ff7900] font-medium">{{ user.role }}</span>
              </div>
            </div>

            <div class="text-[10px] text-white/30 space-y-1">
              <div>Registro: <span class="text-white/50">{{ formatDate(user.createdAt) }}</span></div>
              <div>Último acceso: <span class="text-white/50">{{ formatDate(user.lastLoginAt) }}</span></div>
            </div>
          </div>

          <!-- RIGHT: Warning + typed confirmation + actions -->
          <div class="p-5 space-y-4">
            <div class="rounded-xl border border-red-500/20 bg-red-500/5 p-3.5 space-y-2">
              <div class="flex items-start gap-2 text-[11px] text-red-300/90 leading-relaxed">
                <span class="material-symbols-outlined notranslate text-[16px] shrink-0">warning</span>
                <span>
                  Esta acción eliminará permanentemente la cuenta de
                  <strong class="text-white">{{ user.name }}</strong>, sus códigos QR, suscripciones,
                  registros de actividad y el acceso a su cuenta. <strong>No se puede deshacer.</strong>
                </span>
              </div>
              <div class="text-[10px] text-white/30">
                Se conservará únicamente un registro anónimo (fecha y plan) con fines estadísticos.
              </div>
            </div>

            <div class="space-y-1.5">
              <label class="text-[9px] uppercase tracking-widest text-white/35 font-medium">
                Escribe <span class="text-red-400 font-black">"confirmar"</span> para autorizar
              </label>
              <input
                v-model="confirmInput"
                type="text"
                autocomplete="off"
                placeholder="confirmar"
                class="w-full h-11 px-3.5 rounded-xl border border-white/[0.06] bg-white/[0.03] text-white text-[13px] outline-none focus:border-red-500/40 placeholder:text-white/20 transition-colors font-mono"
                :class="confirmInput && !isConfirmed ? 'border-red-500/40' : ''" />
              <div
                v-if="confirmInput && !isConfirmed"
                class="text-[9px] text-red-400/80">
                El texto no coincide. Debe escribir exactamente "confirmar".
              </div>
            </div>

            <div class="flex gap-2 pt-1">
              <button
                @click="handleCancel"
                class="flex-1 h-10 rounded-xl border border-white/[0.06] bg-white/[0.03] text-white/70 text-[10px] font-semibold uppercase tracking-widest hover:bg-white/[0.06] transition cursor-pointer">
                Cancelar
              </button>
              <button
                @click="handleSubmit"
                :disabled="!isConfirmed || processing"
                class="flex-1 h-10 rounded-xl font-semibold text-[10px] uppercase tracking-widest transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 cursor-pointer bg-red-500 hover:bg-red-600 text-white">
                <span
                  v-if="processing"
                  class="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                <span v-else class="material-symbols-outlined notranslate text-[13px]">delete_forever</span>
                Eliminar definitivamente
              </button>
            </div>
          </div>

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
