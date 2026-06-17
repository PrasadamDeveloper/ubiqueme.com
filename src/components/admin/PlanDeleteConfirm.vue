<template>
  <div class="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">

    <section
      class="w-full max-w-lg rounded-[28px] border border-white/10 bg-[#0b0b0d] overflow-hidden font-google-sans">

      <!-- Header -->
      <div class="border-b border-white/10 p-8">

        <div class="flex items-start gap-5">

          <div
            class="w-16 h-16 rounded-2xl border border-red-500/20 bg-red-500/10 flex items-center justify-center flex-shrink-0">

            <span class="material-symbols-outlined notranslate text-red-400 text-[30px]">

              warning

            </span>

          </div>

          <div>

            <span class="text-[10px] uppercase tracking-[0.25em] font-black text-orange-400">

              Subscription Management

            </span>

            <h2 class="mt-3 text-3xl font-black tracking-tight text-white">

              Cancelar plan

            </h2>

          </div>

        </div>

      </div>

      <!-- Content -->
      <div class="p-8">

        <div class="rounded-[22px] border border-red-500/15 bg-red-500/[0.04] p-5">

          <div class="flex gap-4">

            <span class="material-symbols-outlined notranslate text-red-400 mt-1">

              cancel

            </span>

            <div>

              <p class="text-xs uppercase tracking-[0.20em] font-black text-red-400">

                Acción importante

              </p>

              <p class="mt-3 text-sm leading-relaxed text-white/60">

                Esta acción eliminará el plan activo del usuario, la fecha de
                vencimiento de la suscripción, la fecha de compra del plan y la
                información del proveedor de pago.

              </p>

              <p class="mt-3 text-sm font-medium text-white">

                El usuario quedará sin un plan asignado.

              </p>

            </div>

          </div>

        </div>

      </div>

      <!-- Footer -->
      <div class="border-t border-white/10 p-6 grid grid-cols-2 gap-3">

        <button @click="handleCancel"
          class="h-14 rounded-[20px] border border-white/10 bg-white/[0.03] text-white text-xs uppercase tracking-[0.20em] font-black hover:bg-white/[0.05] transition">

          Cancelar

        </button>

        <button @click="handleConfirm" :disabled="loading"
          class="h-14 rounded-[20px] bg-red-500 hover:bg-red-600 text-white text-xs uppercase tracking-[0.20em] font-black transition disabled:opacity-50 flex items-center justify-center gap-2">
          <span v-if="loading" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
          <span v-else>Confirmar</span>
        </button>

      </div>

    </section>

  </div>
</template>

<script lang="ts" setup>
defineProps<{
  loading?: boolean
}>()

const emit = defineEmits(['cancel', 'confirm']);


const handleCancel = () => {
  emit('cancel')
}

const handleConfirm = () => {
  emit('confirm')
}
</script>

<style scoped></style>
