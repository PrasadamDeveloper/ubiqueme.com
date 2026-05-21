<script lang="ts" setup>
import { ref, watch } from 'vue'

const props = defineProps<{
  isOpen: boolean
  userName: string
  currentPlan: string
}>()

const emit = defineEmits<{
  (e: 'submit', newPlan: string): void
  (e: 'cancel'): void
}>()

const selectedPlan = ref('')

// Initialize selected plan when modal opens
watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    selectedPlan.value = props.currentPlan
  }
})

const handleSubmit = () => {
  emit('submit', selectedPlan.value)
}

const handleCancel = () => {
  emit('cancel')
}
const now = new Date();
const renewalDate = new Date();
const currentMonth = now.getMonth();
renewalDate.setMonth(currentMonth + 12)


</script>

<template>
  <Transition name="fade-scale">
    <div v-if="isOpen" class="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4">

      <div
        class="bg-[#01060e] border border-white/10 w-full max-w-5xl rounded-[32px] p-5 md:p-7 relative overflow-hidden shadow-2xl">

        <!-- Pattern -->
        <div class="absolute inset-0 opacity-[0.02] pointer-events-none"
          style="background-image: linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px); background-size:24px 24px;">
        </div>

        <div class="relative z-10 grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-6">

          <!-- LEFT -->
          <section class="space-y-5">

            <!-- Header -->
            <div class="flex items-center gap-4">

              <div
                class="w-14 h-14 rounded-3xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">

                <span class="material-symbols-outlined text-blue-400 text-[28px]">
                  workspace_premium
                </span>

              </div>

              <div>

                <h3 class="text-2xl  tracking-tight text-[#dce7ff] inline-flex overflow-hidden font-jost">
                  Cambiar Plan a <span class="animate-fade-down ml-2" :key="selectedPlan">{{ selectedPlan.toUpperCase()
                  }}</span>
                </h3>

                <p class="text-xs text-white/40 mt-1">
                  Seleccione el nuevo plan para
                  <span class="font-bold text-white">
                    {{ userName }}
                  </span>
                </p>

              </div>

            </div>

            <!-- INFO CARDS -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">

              <!-- Inicio -->
              <article class="rounded-3xl border border-white/10 bg-white/5 p-5 flex gap-4">

                <div
                  class="h-12 w-12 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">

                  <span class="material-symbols-outlined">
                    calendar_month
                  </span>

                </div>

                <div class="min-w-0">

                  <span class="text-[10px] uppercase tracking-[0.2em] text-white/30">

                    Inicio del plan

                  </span>

                  <p class="text-sm text-white mt-2">

                    Plan

                    <span class="font-bold text-blue-400">

                      {{ selectedPlan.toUpperCase() }}

                    </span>

                  </p>

                  <span class="text-xs text-white/50 block mt-1">

                    {{ now.toLocaleString(
                      'es-MX',
                      { dateStyle: 'full' }
                    ) }}

                  </span>

                </div>

              </article>

              <!-- Renovacion -->
              <article class="rounded-3xl border border-white/10 bg-white/5 p-5 flex gap-4">

                <div
                  class="h-12 w-12 rounded-2xl bg-orange-500/10 text-orange-400 flex items-center justify-center shrink-0">

                  <span class="material-symbols-outlined animate-spin animate-duration-8000">
                    autorenew
                  </span>

                </div>

                <div class="min-w-0">

                  <span class="text-[10px] uppercase tracking-[0.2em] text-white/30">

                    Renovación

                  </span>

                  <p class="text-sm text-white mt-2">

                    Próximo ciclo

                  </p>

                  <span class="text-xs text-white/50 block mt-1">

                    {{ renewalDate.toLocaleString(
                      'es-MX',
                      { dateStyle: 'full' }
                    ) }}

                  </span>

                </div>

              </article>

            </div>

            <!-- Mail Notice -->
            <div class="rounded-3xl bg-white/5 border border-white/10 p-4 flex gap-3">

              <div class="h-10 w-10 rounded-2xl bg-white/5 flex items-center justify-center shrink-0">

                <span class="material-symbols-outlined text-white/50">

                  mail

                </span>

              </div>

              <p class="text-[11px] text-white/40 leading-relaxed">

                Se enviará automáticamente un correo notificando el cambio de
                plan a

                <span class="font-semibold text-white/70">

                  {{ userName }}

                </span>

              </p>

            </div>

          </section>

          <!-- RIGHT -->
          <section class="rounded-[28px] border border-white/10 bg-white/[0.03] p-4 space-y-3">

            <!-- Alpha -->
            <button @click="selectedPlan = 'alpha'"
              class="w-full rounded-2xl border p-4 text-left transition-all duration-200" :class="selectedPlan === 'alpha'
                ? 'border-white/30 bg-white/10'
                : 'border-white/10 hover:bg-white/5'">

              <div class="flex items-center justify-between">

                <div>

                  <p class="text-xs uppercase font-bold tracking-widest text-white">

                    Alpha

                  </p>

                  <span class="text-[11px] text-white/40">

                    $50 MXN / mes · Máx 1 QR

                  </span>

                </div>

                <span v-if="selectedPlan === 'alpha'" class="material-symbols-outlined text-white">

                  check_circle

                </span>

              </div>

            </button>

            <!-- Beta -->
            <button @click="selectedPlan = 'beta'"
              class="w-full rounded-2xl border p-4 text-left transition-all duration-200" :class="selectedPlan === 'beta'
                ? 'border-blue-500/30 bg-blue-500/10'
                : 'border-white/10 hover:bg-white/5'">

              <div class="flex items-center justify-between">

                <div>

                  <p class="text-xs uppercase font-bold tracking-widest text-blue-400">

                    Beta

                  </p>

                  <span class="text-[11px] text-white/40">

                    $100 MXN / mes · Máx 3 QR

                  </span>

                </div>

                <span v-if="selectedPlan === 'beta'" class="material-symbols-outlined text-blue-400">

                  check_circle

                </span>

              </div>

            </button>

            <!-- Epsilon -->
            <button @click="selectedPlan = 'epsilon'"
              class="w-full rounded-2xl border p-4 text-left transition-all duration-200" :class="selectedPlan === 'epsilon'
                ? 'border-orange-500/30 bg-orange-500/10'
                : 'border-white/10 hover:bg-white/5'">

              <div class="flex items-center justify-between">

                <div>

                  <p class="text-xs uppercase font-bold tracking-widest text-orange-400">

                    Epsilon

                  </p>

                  <span class="text-[11px] text-white/40">

                    $200 MXN / mes · Máx 5 QR

                  </span>

                </div>

                <span v-if="selectedPlan === 'epsilon'" class="material-symbols-outlined text-orange-400">

                  check_circle

                </span>

              </div>

            </button>

            <!-- Buttons -->
            <div class="grid grid-cols-2 gap-3 pt-3">

              <button @click="handleCancel"
                class="h-12 rounded-2xl bg-white/5 border border-white/10 text-white text-xs uppercase font-black tracking-widest hover:bg-white/10 transition">

                Cancelar

              </button>

              <button @click="handleSubmit" :disabled="selectedPlan === currentPlan"
                class="h-12 rounded-2xl bg-blue-500 hover:bg-blue-600 text-white text-xs uppercase font-black tracking-widest transition disabled:opacity-50 disabled:cursor-not-allowed">

                Guardar

              </button>

            </div>

          </section>

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
