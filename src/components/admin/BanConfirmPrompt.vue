<script lang="ts" setup>
import type { IUser } from '@/interfaces/IUser';
import { ref, watch } from 'vue'
import PlanDeleteConfirm from './PlanDeleteConfirm.vue';

const props = defineProps<{
  isOpen: boolean
  user: IUser
  isCurrentlyBanned: boolean
}>()

const emit = defineEmits<{
  (e: 'submit', banReason: string): void
  (e: 'cancel'): void
}>()

const banReasonInput = ref('')

// Clear input when modal opens
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
const formatDate = (timestamp: any) => {

  if (!timestamp?.seconds) return '—'

  return new Date(
    timestamp.seconds * 1000
  ).toLocaleString('es-MX', { dateStyle: 'full', timeStyle: 'short' })
}

</script>

<template>
  <Transition name="fade-scale">
    <div v-if="isOpen" class="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4">



      <div
        class="relative w-full max-w-6xl rounded-3xl border border-white/10 bg-[#0b0b0d] overflow-hidden font-google-sans">

        <!-- GRID -->
        <div class="absolute inset-0 opacity-[0.03] pointer-events-none" style="
          background-image:
          linear-gradient(rgba(255,255,255,.8) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,.8) 1px, transparent 1px);
          background-size:32px 32px;">
        </div>

        <div class="relative z-10 grid lg:grid-cols-[360px_1fr]">

          <!-- SIDEBAR -->
          <div class="border-b lg:border-b-0 lg:border-r border-white/10 p-8">

            <div class="w-20 h-20 rounded-3xl border flex items-center justify-center mb-6" :class="!isCurrentlyBanned
              ? 'border-red-500/20 bg-red-500/10 text-red-400'
              : 'border-green-500/20 bg-green-500/10 text-green-400'">

              <span class="material-symbols-outlined text-[36px]">
                {{ isCurrentlyBanned ? 'how_to_reg' : 'gavel' }}
              </span>

            </div>

            <span class="text-[10px] uppercase tracking-[0.25em] text-orange-400 font-black">

              User Management

            </span>

            <h2 class="mt-3 text-3xl font-black" :class="!isCurrentlyBanned
              ? 'text-red-400'
              : 'text-green-400'">

              {{ isCurrentlyBanned
                ? 'Reactivar Usuario'
                : 'Suspender Usuario' }}

            </h2>

            <p class="mt-3 text-sm text-white/45 leading-relaxed">

              Está a punto de
              {{ isCurrentlyBanned ? 'reactivar' : 'suspender' }}
              una cuenta activa.

            </p>

            <!-- USER CARD -->
            <div class="mt-8 rounded-2xl border border-white/10 bg-white/[0.02] p-5">

              <div class="flex items-center gap-4">

                <div
                  class="w-14 h-14 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 text-lg font-black">

                  {{ user.name?.charAt(0).toUpperCase() }}

                </div>

                <div>

                  <h3 class="font-bold text-white">

                    {{ user.name }}

                  </h3>

                  <p class="text-xs text-white/40">

                    {{ user.email }}

                  </p>

                </div>

              </div>

              <div class="mt-5 space-y-3 text-xs">

                <div class="flex justify-between">

                  <span class="text-white/40">
                    UID
                  </span>

                  <span class="text-white font-mono">

                    {{ user.uid }}

                  </span>

                </div>

                <div class="flex justify-between">
                  <span class="text-white/40">Suscripciones</span>
                  <span class="text-orange-400">Ver en Detalles</span>
                </div>

              </div>

            </div>

          </div>

          <!-- CONTENT -->
          <div class="p-8">

            <!-- INFO GRID -->
            <div class="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">

              <div class="rounded-2xl border border-white/10 p-5 bg-white/[0.02]">

                <p class="text-[10px] uppercase text-white/35">

                  Cuenta creada

                </p>

                <p class="mt-2 text-sm text-white">

                  {{ formatDate(user.createdAt) }}

                </p>

              </div>

              <div class="rounded-2xl border border-white/10 p-5 bg-white/[0.02]">

                <p class="text-[10px] uppercase text-white/35">

                  Último acceso

                </p>

                <p class="mt-2 text-sm text-white">

                  {{ formatDate(user.lastLoginAt) }}

                </p>

              </div>

              <div class="rounded-2xl border border-white/10 p-5 bg-white/[0.02]">

                <p class="text-[10px] uppercase text-white/35">

                  QR Generados

                </p>

                <p class="mt-2 text-sm text-white">

                  {{ user.totalQRs }}

                </p>

              </div>

              <div class="rounded-2xl border border-white/10 p-5 bg-white/[0.02]">

                <p class="text-[10px] uppercase text-white/35">

                  Trial termina

                </p>

                <p class="mt-2 text-sm text-white">

                  {{ formatDate(user.trialEndsAt) }}

                </p>

              </div>

              <div class="rounded-2xl border border-white/10 p-5 bg-white/[0.02]">

                <p class="text-[10px] uppercase text-white/35">

                  Fin del plan

                </p>

                <p class="mt-2 text-sm text-white">

                  {{ formatDate(user.planEndDate) }}

                </p>

              </div>

              <div class="rounded-2xl border border-white/10 p-5 bg-white/[0.02]">

                <p class="text-[10px] uppercase text-white/35">

                  Rol

                </p>

                <p class="mt-2 text-sm text-orange-400">

                  {{ user.role }}

                </p>

              </div>

            </div>

            <!-- BAN REASON -->
            <div v-if="!isCurrentlyBanned" class="mt-8">

              <label class="text-[10px] uppercase tracking-[0.2em] text-white/45">

                Motivo suspensión (opcional)

              </label>

              <textarea v-model="banReasonInput" placeholder="Ej. uso indebido, spam, actividad sospechosa..."
                class="mt-3 w-full h-32 rounded-2xl border border-white/10 bg-white/[0.02] p-5 text-sm text-white outline-none focus:border-orange-500 resize-none">
            </textarea>

            </div>

            <!-- ACTIONS -->
            <div class="mt-8 flex flex-col sm:flex-row gap-3">

              <button @click="handleCancel"
                class="flex-1 h-14 rounded-2xl border border-white/10 bg-white/[0.03] text-white font-black text-xs uppercase tracking-[0.20em]">

                Cancelar

              </button>

              <button @click="handleSubmit"
                class="flex-1 h-14 rounded-2xl font-black text-xs uppercase tracking-[0.20em]" :class="!isCurrentlyBanned
                  ? 'bg-red-500 text-white'
                  : 'bg-green-500 text-black'">

                {{ isCurrentlyBanned
                  ? 'Reactivar usuario'
                  : 'Suspender usuario' }}

              </button>

            </div>

          </div>

        </div>

      </div>

    </div>
  </Transition>
</template>

<style scoped>
.font-google-sans {
  font-family: 'Google Sans', sans-serif;
}

.material-symbols-outlined {
  font-variation-settings: 'FILL' 1, 'wght' 600, 'GRAD' 0, 'opsz' 24;
}

.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-scale-enter-from,
.fade-scale-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
