<script lang="ts" setup>
import type { IUser } from '@/interfaces/IUser';
import { ref, watch } from 'vue'

const props = defineProps<{
  isOpen: boolean
  user: IUser
  isCurrentlyBanned: boolean
  processing?: boolean
}>()

const emit = defineEmits<{
  (e: 'submit', banReason: string): void
  (e: 'cancel'): void
}>()

const banReasonInput = ref('')

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    banReasonInput.value = ''
  }
})

const handleSubmit = () => {
  emit('submit', banReasonInput.value.trim())
}

const handleCancel = () => {
  emit('cancel')
}
const formatDate = (timestamp: { seconds?: number } | null | undefined) => {
  if (!timestamp?.seconds) return '—'
  return new Date(
    timestamp.seconds * 1000
  ).toLocaleString('es-MX', { dateStyle: 'full', timeStyle: 'short' })
}

</script>

<template>
  <Transition name="md3-dialog">
    <div v-if="isOpen" class="fixed inset-0 z-[100] bg-black/40 flex items-center justify-center p-4 backdrop-blur-sm">

      <div
        class="relative w-full max-w-2xl rounded-3xl border border-gray-200/70 bg-white shadow-2xl overflow-hidden">

        <div class="grid md:grid-cols-[1fr_1.2fr]">

          <!-- LEFT: User card + info -->
          <div class="p-6 border-b md:border-b-0 md:border-r border-gray-100 space-y-4 bg-gray-50/60">
            <div class="flex items-center gap-3">
              <div class="w-11 h-11 rounded-2xl flex items-center justify-center text-lg font-black" :class="!isCurrentlyBanned
                ? 'bg-red-50 text-red-500'
                : 'bg-emerald-50 text-emerald-600'">
                <span class="material-symbols-outlined notranslate text-xl">
                  {{ isCurrentlyBanned ? 'how_to_reg' : 'gavel' }}
                </span>
              </div>
              <div>
                <span class="text-[10px] uppercase tracking-[0.2em] font-black"
                  :class="!isCurrentlyBanned ? 'text-red-500' : 'text-emerald-600'">
                  {{ isCurrentlyBanned ? 'Reactivar' : 'Suspender' }}
                </span>
                <h3 class="text-base font-semibold text-gray-900 mt-0.5">{{ user.name }}</h3>
              </div>
            </div>

            <div class="space-y-2 text-xs">
              <div class="flex justify-between gap-4">
                <span class="text-gray-400">Email</span>
                <span class="text-gray-700 font-medium truncate">{{ user.email }}</span>
              </div>
              <div class="flex justify-between gap-4">
                <span class="text-gray-400">UID</span>
                <span class="text-gray-500 font-mono text-[10px] truncate">{{ user.uid }}</span>
              </div>
              <div class="flex justify-between gap-4">
                <span class="text-gray-400">QRs</span>
                <span class="text-gray-700 font-medium">{{ user.totalQRs }}</span>
              </div>
              <div class="flex justify-between gap-4">
                <span class="text-gray-400">Rol</span>
                <span class="text-orange-600 font-medium">{{ user.role }}</span>
              </div>
            </div>

            <div class="text-[11px] text-gray-400 space-y-1">
              <div>Registro: <span class="text-gray-600">{{ formatDate(user.createdAt) }}</span></div>
              <div>Último acceso: <span class="text-gray-600">{{ formatDate(user.lastLoginAt) }}</span></div>
              <div v-if="user.trialEndsAt">Bronce de prueba termina: <span class="text-gray-600">{{ formatDate(user.trialEndsAt)
                  }}</span></div>
            </div>
          </div>

          <!-- RIGHT: Reason + actions -->
          <div class="p-6 space-y-4">
            <div v-if="!isCurrentlyBanned" class="space-y-2">
              <label class="text-[10px] uppercase tracking-widest text-gray-500 font-semibold">Motivo de suspensión</label>
              <textarea v-model="banReasonInput" placeholder="Ej. uso indebido, spam, actividad sospechosa..."
                class="w-full h-28 px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-red-400 focus:bg-white focus:ring-4 focus:ring-red-500/10 resize-none transition-all duration-300">
              </textarea>
            </div>
            <div v-else class="text-sm text-gray-500 leading-relaxed">
              Se reactivará el acceso completo a <span class="text-gray-900 font-semibold">{{ user.name }}</span>.
            </div>

            <div class="flex gap-2.5 pt-1">
              <button @click="handleCancel"
                class="flex-1 h-11 rounded-2xl bg-gray-100 text-gray-700 text-[11px] font-bold uppercase tracking-widest hover:bg-gray-200 transition-all duration-200 active:scale-95 cursor-pointer">
                Cancelar
              </button>
              <button @click="handleSubmit" :disabled="processing"
                class="flex-1 h-11 rounded-2xl font-bold text-[11px] uppercase tracking-widest shadow-lg transition-all duration-200 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 cursor-pointer"
                :class="!isCurrentlyBanned
                  ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/25'
                  : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/25'">
                <span v-if="processing"
                  class="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                <span v-else>
                  {{ isCurrentlyBanned ? 'Reactivar' : 'Suspender' }}
                </span>
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
