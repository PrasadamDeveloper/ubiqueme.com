n
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
    <div v-if="isOpen" class="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center p-4 backdrop-blur-sm">

      <div
        class="relative w-full max-w-2xl rounded-2xl border border-white/[0.08] bg-[#0d0d0e] shadow-2xl overflow-hidden">

        <div class="grid md:grid-cols-[1fr_1.2fr]">

          <!-- LEFT: User card + info -->
          <div class="p-5 border-b md:border-b-0 md:border-r border-white/[0.06] space-y-4 bg-white/[0.01]">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl flex items-center justify-center text-base font-black" :class="!isCurrentlyBanned
                ? 'bg-red-500/10 text-red-400'
                : 'bg-green-500/10 text-green-400'">
                <span class="material-symbols-outlined notranslate text-xl">
                  {{ isCurrentlyBanned ? 'how_to_reg' : 'gavel' }}
                </span>
              </div>
              <div>
                <span class="text-[9px] uppercase tracking-[0.2em] font-black"
                  :class="!isCurrentlyBanned ? 'text-red-400' : 'text-green-400'">
                  {{ isCurrentlyBanned ? 'Reactivar' : 'Suspender' }}
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
              <div v-if="user.trialEndsAt">Bronce de prueba termina: <span class="text-white/50">{{ formatDate(user.trialEndsAt)
                  }}</span></div>
            </div>
          </div>

          <!-- RIGHT: Reason + actions -->
          <div class="p-5 space-y-4">
            <div v-if="!isCurrentlyBanned" class="space-y-2">
              <label class="text-[9px] uppercase tracking-widest text-white/35 font-medium">Motivo de suspensión</label>
              <textarea v-model="banReasonInput" placeholder="Ej. uso indebido, spam, actividad sospechosa..."
                class="w-full h-28 px-3.5 py-3 rounded-xl border border-white/[0.06] bg-white/[0.03] text-white text-[12px] outline-none focus:border-red-500/30 placeholder:text-white/20 resize-none transition-colors">
              </textarea>
            </div>
            <div v-else class="text-sm text-white/50 leading-relaxed">
              Se reactivará el acceso completo a <span class="text-white font-medium">{{ user.name }}</span>.
            </div>

            <div class="flex gap-2 pt-1">
              <button @click="handleCancel"
                class="flex-1 h-10 rounded-xl border border-white/[0.06] bg-white/[0.03] text-white/70 text-[10px] font-semibold uppercase tracking-widest hover:bg-white/[0.06] transition cursor-pointer">
                Cancelar
              </button>
              <button @click="handleSubmit" :disabled="processing"
                class="flex-1 h-10 rounded-xl font-semibold text-[10px] uppercase tracking-widest transition disabled:opacity-40 flex items-center justify-center gap-1.5 cursor-pointer"
                :class="!isCurrentlyBanned
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-green-500 hover:bg-green-600 text-white'">
                <span v-if="processing"
                  class="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
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
