<script lang="ts" setup>
import { ref, watch } from 'vue'
import PlanDeleteConfirm from './PlanDeleteConfirm.vue';

const props = defineProps<{
  isOpen: boolean
  userName: string
  userEmail: string
  currentPlan: string
}>()

const emit = defineEmits<{
  (e: 'submit', newPlan: string): void
  (e: 'cancel'): void
  (e: 'cancelplan'): void
}>()

const selectedPlan = ref<string>(props.currentPlan)

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


const handleCancelPlan = () => {
  emit('cancelplan')
  showDeleteConfirm.value = false
}

const showDeleteConfirm = ref(true)
const cancelDeletePlan = () => {
  showDeleteConfirm.value = false
}

</script>

<template>
  <Transition name="fade-scale">


    <div v-if="isOpen" class="fixed inset-0 z-[100] flex items-center justify-center bg-black/85  p-4">
      <PlanDeleteConfirm v-if="showDeleteConfirm" @confirm="handleCancelPlan" @cancel="cancelDeletePlan">
      </PlanDeleteConfirm>

      <div
        class="relative w-full max-w-6xl overflow-hidden rounded-[32px] border border-white/10 bg-[#0a0a0b] shadow-2xl font-google-sans">

        <!-- Pattern -->
        <div class="absolute inset-0 opacity-[0.03] pointer-events-none"
          style="background-image: linear-gradient(rgba(255,255,255,.7) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.7) 1px, transparent 1px); background-size:28px 28px;">
        </div>



        <div class="relative z-10 grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr]">

          <!-- LEFT -->
          <section class="p-6 md:p-8 lg:p-10 border-b lg:border-b-0 lg:border-r border-white/10 space-y-8">

            <!-- Header -->
            <div class="flex gap-5 items-start">

              <div
                class="w-16 h-16 rounded-3xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shrink-0">
                <span class="material-symbols-outlined text-orange-400 text-[30px]">
                  workspace_premium
                </span>
              </div>

              <div>

                <span class="text-[10px] uppercase tracking-[0.30em] text-orange-400 font-black">
                  Subscription Management
                </span>

                <h3 class="text-3xl md:text-4xl font-black tracking-tight text-white mt-2 flex flex-wrap">

                  Cambiar Plan a

                  <span class="ml-3 text-orange-400 animate-fade-down" :key="selectedPlan">
                    {{ selectedPlan.toUpperCase() }}
                  </span>

                </h3>

                <p class="text-sm text-white/45 mt-3">

                  Seleccione el nuevo plan para

                  <span class="font-semibold text-white">

                    {{ userName }}

                  </span>

                </p>

              </div>

            </div>

            <!-- INFO -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">

              <!-- Inicio -->
              <article class="rounded-[28px] border border-white/10 bg-white/[0.03] p-5">

                <div class="flex gap-4">

                  <div
                    class="h-14 w-14 rounded-2xl bg-orange-500/10 text-orange-400 flex items-center justify-center shrink-0">
                    <span class="material-symbols-outlined">
                      calendar_month
                    </span>
                  </div>

                  <div>

                    <span class="text-[10px] uppercase tracking-[0.25em] text-white/35">

                      Inicio del plan

                    </span>

                    <p class="mt-3 text-white">

                      Plan

                      <span class="font-bold text-orange-400">

                        {{ selectedPlan.toUpperCase() }}

                      </span>

                    </p>

                    <span class="text-xs text-white/50 mt-2 block">

                      {{ now.toLocaleString(
                        'es-MX',
                        { dateStyle: 'full' }
                      ) }}

                    </span>

                  </div>

                </div>

              </article>

              <!-- Renovacion -->
              <article class="rounded-[28px] border border-white/10 bg-white/[0.03] p-5">

                <div class="flex gap-4">

                  <div
                    class="h-14 w-14 rounded-2xl bg-orange-500/10 text-orange-400 flex items-center justify-center shrink-0">
                    <span class="material-symbols-outlined animate-spin animate-duration-8000">
                      autorenew
                    </span>
                  </div>

                  <div>

                    <span class="text-[10px] uppercase tracking-[0.25em] text-white/35">

                      Renovación

                    </span>

                    <p class="mt-3 text-white">

                      Próximo ciclo

                    </p>

                    <span class="text-xs text-white/50 mt-2 block">

                      {{ renewalDate.toLocaleString(
                        'es-MX',
                        { dateStyle: 'full' }
                      ) }}

                    </span>

                  </div>

                </div>

              </article>

            </div>

            <!-- Notice -->
            <div class="rounded-[28px] border border-orange-500/10 bg-orange-500/[0.03] p-5 flex gap-4">

              <div class="h-12 w-12 rounded-2xl bg-orange-500/10 flex items-center justify-center shrink-0">
                <span class="material-symbols-outlined text-orange-400">
                  mail
                </span>
              </div>

              <p class="text-[12px] leading-relaxed text-white/50">

                Se enviará automáticamente un correo notificando el cambio de plan de

                <span class="text-white font-medium">

                  {{ userName }}

                </span>

                a

                <span class="text-white/80">

                  {{ userEmail }}

                </span>

              </p>

            </div>

          </section>

          <!-- RIGHT -->
          <section class="p-6 md:p-8 bg-white/[0.02]">

            <div class="space-y-4">

              <!-- Alpha -->
              <button @click="selectedPlan = 'alpha'"
                class="w-full rounded-[24px] border p-5 text-left transition-all duration-300" :class="selectedPlan === 'alpha'
                  ? 'border-orange-500/30 bg-orange-500/10 shadow-lg shadow-orange-500/10'
                  : 'border-white/10 hover:bg-white/[0.04]'">

                <div class="flex justify-between items-center">

                  <div>

                    <p class="text-xs uppercase tracking-[0.25em] font-black text-white">
                      Alpha
                    </p>

                    <span class="text-[11px] text-white/40">
                      $50 MXN / mes · Máx 1 QR
                    </span>

                  </div>

                  <span v-if="selectedPlan === 'alpha'" class="material-symbols-outlined text-orange-400">
                    check_circle
                  </span>

                </div>

              </button>

              <!-- Beta -->
              <button @click="selectedPlan = 'beta'"
                class="w-full rounded-[24px] border p-5 text-left transition-all duration-300" :class="selectedPlan === 'beta'
                  ? 'border-orange-500/30 bg-orange-500/10 shadow-lg shadow-orange-500/10'
                  : 'border-white/10 hover:bg-white/[0.04]'">

                <div class="flex justify-between items-center">

                  <div>

                    <p class="text-xs uppercase tracking-[0.25em] font-black text-white">
                      Beta
                    </p>

                    <span class="text-[11px] text-white/40">
                      $100 MXN / mes · Máx 3 QR
                    </span>

                  </div>

                  <span v-if="selectedPlan === 'beta'" class="material-symbols-outlined text-orange-400">
                    check_circle
                  </span>

                </div>

              </button>

              <!-- Epsilon -->
              <button @click="selectedPlan = 'epsilon'"
                class="w-full rounded-[24px] border p-5 text-left transition-all duration-300" :class="selectedPlan === 'epsilon'
                  ? 'border-orange-500/30 bg-orange-500/10 shadow-lg shadow-orange-500/10'
                  : 'border-white/10 hover:bg-white/[0.04]'">

                <div class="flex justify-between items-center">

                  <div>

                    <p class="text-xs uppercase tracking-[0.25em] font-black text-white">
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

              <!-- Cancel Subscription -->
              <button @click="showDeleteConfirm = true"
                class="w-full rounded-[24px] border border-red-500/15 bg-red-500/[0.04] p-5 text-left transition-all duration-300 hover:bg-red-500/[0.08] hover:border-red-500/25">

                <div class="flex justify-between items-center">

                  <div>

                    <p class="text-xs uppercase tracking-[0.25em] font-black text-red-400">

                      Cancelar plan

                    </p>

                    <span class="text-[11px] text-white/40">

                      Finaliza la suscripción activa y deshabilita futuras renovaciones

                    </span>

                  </div>

                  <span class="material-symbols-outlined text-red-400">

                    cancel

                  </span>

                </div>

              </button>

              <!-- Buttons -->
              <div class="grid grid-cols-2 gap-3 pt-5">

                <button @click="handleCancel"
                  class="h-14 rounded-[20px] border border-white/10 bg-white/[0.03] text-white text-xs uppercase font-black tracking-[0.20em] hover:bg-white/[0.06] transition">
                  Cancelar
                </button>

                <button @click="handleSubmit" :disabled="selectedPlan === currentPlan"
                  class="h-14 rounded-[20px] bg-orange-500 hover:bg-orange-600 text-white text-xs uppercase font-black tracking-[0.20em] transition disabled:opacity-50 disabled:cursor-not-allowed">
                  Guardar
                </button>

              </div>

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
