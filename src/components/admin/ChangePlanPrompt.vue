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

      <!-- Prompt Card -->
      <div
        class="bg-[#01060e] border border-white/10 w-full max-w-sm rounded-3xl p-6 md:p-8 flex flex-col space-y-6 relative overflow-hidden">

        <!-- Subtle Pattern -->
        <div class="absolute inset-0 opacity-[0.02] pointer-events-none"
          style="background-image: linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px); background-size: 20px 20px;">
        </div>

        <div class="relative z-10 space-y-2 text-center">
          <div
            class="w-12 h-12 bg-blue-500/10 border border-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span class="material-symbols-outlined text-blue-500 text-[24px]">workspace_premium</span>
          </div>
          <h3 class="text-xl font-black italic uppercase tracking-tighter text-[#dce7ff]">Cambiar Plan</h3>
          <p class="text-white/40 text-xs">Seleccione el nuevo plan para <span class="font-bold text-white">{{ userName
          }}</span>.</p>

          <div
            class="w-full rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden font-poppins shadow-lg">

            <!-- Inicio -->
            <article class="flex items-start gap-3 p-4 border-b border-white/10">

              <div class="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-500/15 text-blue-400 shrink-0">
                <span class="material-symbols-outlined text-[20px]">
                  calendar_month
                </span>
              </div>

              <div class="flex flex-col">
                <p class="text-[11px] uppercase tracking-widest text-white/40">
                  Inicio del plan
                </p>

                <p class="text-sm text-white mt-1">
                  El plan
                  <span class="font-semibold text-blue-400">
                    {{ selectedPlan.toUpperCase() }}
                  </span>
                  inicia el
                </p>

                <span class="text-xs text-white/70 mt-1">
                  {{ now.toLocaleString('es-MX', { dateStyle: 'full' }) }}
                </span>
              </div>

            </article>

            <!-- Renovación -->
            <article class="flex items-start gap-3 p-4">

              <div
                class="flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-500/15 text-orange-400 shrink-0">
                <span class="material-symbols-outlined text-[20px]">
                  autorenew
                </span>
              </div>

              <div class="flex flex-col">
                <p class="text-[11px] uppercase tracking-widest text-white/40">
                  Próxima renovación
                </p>

                <p class="text-sm text-white">
                  Se renueva el
                </p>

                <span class="text-xs text-white/70 mt-1">
                  {{ renewalDate.toLocaleString('es-MX', { dateStyle: 'full' }) }}
                </span>
              </div>

            </article>

          </div>

          <p class="text-[11px] text-slate-50/30">Se enviará un correo electrónico a <span
              class="font-bold text-slate-50/40">{{
                userName
              }}</span> con la información del cambio de plan.</p>
        </div>

        <div class="relative z-10 space-y-3">
          <!-- Opciones de Plan limpias como botones radiales visuales -->

          <button @click="selectedPlan = 'alpha'"
            class="w-full flex items-center justify-between p-4 rounded-2xl border transition-colors text-left"
            :class="selectedPlan === 'alpha' ? 'bg-white/10 border-white/30' : 'bg-transparent border-white/10 hover:border-white/20'">
            <div class="flex flex-col">
              <span class="text-xs font-bold uppercase tracking-widest text-white/80">Alpha</span>
              <span class="text-[10px] text-white/40">Plan básico ($50 MXN/mes - Máx 1 QR)</span>
            </div>
            <span v-if="selectedPlan === 'alpha'"
              class="material-symbols-outlined text-white text-[18px]">check_circle</span>
          </button>

          <button @click="selectedPlan = 'beta'"
            class="w-full flex items-center justify-between p-4 rounded-2xl border transition-colors text-left"
            :class="selectedPlan === 'beta' ? 'bg-blue-500/10 border-blue-500/30' : 'bg-transparent border-white/10 hover:border-white/20'">
            <div class="flex flex-col">
              <span class="text-xs font-bold uppercase tracking-widest text-blue-400">Beta</span>
              <span class="text-[10px] text-white/40">Plan intermedio ($100 MXN/mes - Máx 3 QRs)</span>
            </div>
            <span v-if="selectedPlan === 'beta'"
              class="material-symbols-outlined text-blue-400 text-[18px]">check_circle</span>
          </button>

          <button @click="selectedPlan = 'epsilon'"
            class="w-full flex items-center justify-between p-4 rounded-2xl border transition-colors text-left"
            :class="selectedPlan === 'epsilon' ? 'bg-orange-500/10 border-orange-500/30' : 'bg-transparent border-white/10 hover:border-white/20'">
            <div class="flex flex-col">
              <span class="text-xs font-bold uppercase tracking-widest text-orange-500">Epsilon</span>
              <span class="text-[10px] text-white/40">Plan premium ($200 MXN/mes - Máx 5 QRs)</span>
            </div>
            <span v-if="selectedPlan === 'epsilon'"
              class="material-symbols-outlined text-orange-500 text-[18px]">check_circle</span>
          </button>

          <div class="flex gap-3 pt-4">
            <button @click="handleCancel"
              class="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors">
              Cancelar
            </button>
            <button @click="handleSubmit" :disabled="selectedPlan === currentPlan"
              class="flex-1 px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              Guardar Cambios
            </button>
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
