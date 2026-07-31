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

    <div v-if="isOpen" class="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <PlanDeleteConfirm v-if="showDeleteConfirm" :loading="loading" @confirm="handleCancelPlan"
        @cancel="cancelDeletePlan">
      </PlanDeleteConfirm>

      <div
        class="relative w-full max-w-lg rounded-3xl border border-gray-200/70 bg-white shadow-2xl overflow-hidden">

        <!-- Header -->
        <div class="p-6 pb-4 space-y-1">
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 rounded-2xl bg-orange-50 flex items-center justify-center shrink-0">
              <span class="material-symbols-outlined notranslate text-orange-500 text-base">workspace_premium</span>
            </div>
            <div>
              <h3 class="text-base font-semibold text-gray-900">Agregar plan</h3>
              <p class="text-[12px] text-gray-500">
                para <span class="text-gray-700 font-medium">{{ userName }}</span>
                <span class="text-gray-400">· {{ userEmail }}</span>
              </p>
            </div>
          </div>
        </div>

        <!-- Plan options -->
        <div class="px-6 pb-3 space-y-2.5">
          <div v-for="plan in plans" :key="plan.key" @click="selectedPlan = plan.key" role="button"
            tabindex="0" @keyup.enter="selectedPlan = plan.key"
            class="flex items-center gap-3 p-4 rounded-2xl border cursor-pointer transition-all duration-200 ease-out active:scale-[0.99]" :class="selectedPlan === plan.key
              ? 'border-orange-400 bg-orange-50/60 ring-4 ring-orange-500/10'
              : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'">

            <div class="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors"
              :class="selectedPlan === plan.key
                ? 'border-orange-500'
                : 'border-gray-300'">
              <div v-if="selectedPlan === plan.key" class="w-2.5 h-2.5 rounded-full bg-orange-500"></div>
            </div>

            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2">
                <span class="text-sm font-semibold text-gray-900">{{ plan.label }}</span>
                <span v-if="plan.key === currentPlan"
                  class="px-1.5 py-0.5 rounded-md bg-gray-100 text-[8px] font-black uppercase tracking-widest text-gray-500">Actual</span>
              </div>
              <span class="text-[11px] text-gray-500">{{ plan.price }} · {{ plan.qrs }}</span>
            </div>

            <span v-if="selectedPlan === plan.key"
              class="material-symbols-outlined notranslate text-orange-500 text-lg">check_circle</span>
          </div>
        </div>

        <!-- Info row -->
        <div class="mx-6 mb-4 p-3.5 rounded-2xl bg-orange-50/60 border border-orange-100 flex items-center gap-3">
          <span class="material-symbols-outlined notranslate text-orange-500 text-base">calendar_month</span>
          <div class="text-[11px] text-gray-500">
            <span class="text-gray-700 font-medium">Inicio hoy</span>
            <span class="text-gray-400"> · Renovación {{ renewalDate.toLocaleString('es-MX', { dateStyle: 'full' })
              }}</span>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex gap-2.5 px-6 pb-5">
          <button @click="handleCancel"
            class="flex-1 h-11 rounded-2xl bg-gray-100 text-gray-700 text-[11px] font-bold uppercase tracking-widest hover:bg-gray-200 transition-all duration-200 active:scale-95 cursor-pointer">
            Cancelar
          </button>
          <button @click="handleSubmit" :disabled="selectedPlan === currentPlan || loading"
            class="flex-1 h-11 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white text-[11px] font-bold uppercase tracking-widest shadow-lg shadow-orange-500/25 transition-all duration-200 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 cursor-pointer">
            <span v-if="loading"
              class="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            <span v-else>Guardar</span>
          </button>
        </div>

        <!-- Cancel plan link -->
        <div class="px-6 pb-5 flex justify-center">
          <button @click="handleCancelPlan"
            class="text-[11px] text-red-500 hover:text-red-600 transition-colors cursor-pointer font-medium">
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
