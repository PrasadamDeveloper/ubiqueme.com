<script lang="ts" setup>
import { ref, watch, computed } from 'vue'
import PlanDeleteConfirm from './PlanDeleteConfirm.vue';
import { planById } from '@/data/plans';

const props = defineProps<{
  isOpen: boolean
  userName: string
  userEmail: string
  currentPlan: string
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'submit', newPlan: string): void
  (e: 'cancel'): void
  (e: 'cancelplan'): void
}>()

const selectedPlan = ref<string>(props.currentPlan)

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
const renewalDate = computed(() => {
  const date = new Date();
  date.setMonth(date.getMonth() + 12);
  return date;
});
const handleCancelPlan = () => {
  emit('cancelplan')
  showDeleteConfirm.value = false
}

const showDeleteConfirm = ref(false)
const cancelDeletePlan = () => {
  showDeleteConfirm.value = false
}

const plans = [
  { key: 'bronce', label: 'Bronce', price: `$${planById('bronce')?.prices.MXN.price} MXN / año`, qrs: `${planById('bronce')?.maxQrs} QR` },
  { key: 'plata', label: 'Plata', price: `$${planById('plata')?.prices.MXN.price} MXN / año`, qrs: `${planById('plata')?.maxQrs} QR` },
  { key: 'oro', label: 'Oro', price: `$${planById('oro')?.prices.MXN.price} MXN / año`, qrs: `${planById('oro')?.maxQrs} QR` },
]
</script>

<template>
  <Transition name="md3-dialog">

    <div v-if="isOpen" class="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <PlanDeleteConfirm v-if="showDeleteConfirm" :loading="loading" @confirm="handleCancelPlan"
        @cancel="cancelDeletePlan">
      </PlanDeleteConfirm>

      <div
        class="relative w-full max-w-lg rounded-2xl border border-white/[0.08] bg-[#0d0d0e] shadow-2xl overflow-hidden">

        <!-- Header -->
        <div class="p-5 pb-3 space-y-1">
          <div class="flex items-center gap-3">
            <div
              class="w-9 h-9 rounded-xl bg-[#ff7900]/10 border border-[#ff7900]/20 flex items-center justify-center shrink-0">
              <span class="material-symbols-outlined notranslate text-[#ff7900] text-base">workspace_premium</span>
            </div>
            <div>
              <h3 class="text-sm font-semibold text-white">Agregar plan</h3>
              <p class="text-[11px] text-white/40">
                para <span class="text-white/60">{{ userName }}</span>
                <span class="text-white/30">· {{ userEmail }}</span>
              </p>
            </div>
          </div>
        </div>

        <!-- Plan options -->
        <div class="px-5 pb-3 space-y-2">
          <div v-for="plan in plans" :key="plan.key" @click="selectedPlan = plan.key"
            class="flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all duration-200" :class="selectedPlan === plan.key
              ? 'border-[#ff7900]/30 bg-[#ff7900]/5'
              : 'border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]'">

            <div class="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors"
              :class="selectedPlan === plan.key
                ? 'border-[#ff7900]'
                : 'border-white/20'">
              <div v-if="selectedPlan === plan.key" class="w-2.5 h-2.5 rounded-full bg-[#ff7900]"></div>
            </div>

            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2">
                <span class="text-sm font-medium text-white">{{ plan.label }}</span>
                <span v-if="plan.key === currentPlan"
                  class="px-1.5 py-0.5 rounded bg-white/[0.06] text-[8px] font-black uppercase tracking-widest text-white/40">Actual</span>
              </div>
              <span class="text-[10px] text-white/35">{{ plan.price }} · {{ plan.qrs }}</span>
            </div>

            <span v-if="selectedPlan === plan.key"
              class="material-symbols-outlined notranslate text-[#ff7900] text-base">check_circle</span>
          </div>
        </div>

        <!-- Info row -->
        <div class="mx-5 mb-3 p-3 rounded-xl bg-orange-500/[0.04] border border-orange-500/10 flex items-center gap-3">
          <span class="material-symbols-outlined notranslate text-[#ff7900] text-base">calendar_month</span>
          <div class="text-[10px] text-white/40">
            <span class="text-white/60">Inicio hoy</span>
            <span class="text-white/30"> · Renovación {{ renewalDate.toLocaleString('es-MX', { dateStyle: 'full' })
              }}</span>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex gap-2 px-5 pb-5">
          <button @click="handleCancel"
            class="flex-1 h-10 rounded-xl border border-white/[0.06] bg-white/[0.03] text-white/70 text-[10px] font-semibold uppercase tracking-widest hover:bg-white/[0.06] transition cursor-pointer">
            Cancelar
          </button>
          <button @click="handleSubmit" :disabled="selectedPlan === currentPlan || loading"
            class="flex-1 h-10 rounded-xl bg-[#ff7900] hover:bg-[#ff8c1a] text-white text-[10px] font-semibold uppercase tracking-widest transition disabled:opacity-40 flex items-center justify-center gap-1.5 cursor-pointer">
            <span v-if="loading"
              class="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            <span v-else>Guardar</span>
          </button>
        </div>

        <!-- Cancel plan link -->
        <div class="px-5 pb-4 flex justify-center">
          <button @click="handleCancelPlan"
            class="text-[10px] text-red-400/60 hover:text-red-400 transition cursor-pointer font-medium">
            Cancelar suscripción activa
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
