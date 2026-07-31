<script lang="ts" setup>
import { ref, watch } from 'vue'

const props = defineProps<{
  isOpen: boolean
  userName: string
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'submit', qrName: string, category: string): void
  (e: 'cancel'): void
}>()

const qrNameInput = ref('')

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    qrNameInput.value = ''
  }
})

const handleSubmit = () => {
  if (!qrNameInput.value.trim()) return
  emit('submit', qrNameInput.value.trim(), qrCategory.value)
}

const handleCancel = () => {
  emit('cancel')
}
const qrCategory = ref('other')
</script>

<template>
  <Transition name="md3-dialog">
    <div v-if="isOpen" class="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">

      <div class="w-full max-w-sm rounded-3xl border border-gray-200/70 bg-white shadow-2xl overflow-hidden">

        <!-- Header -->
        <div class="p-6 pb-4 space-y-1">
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 rounded-2xl bg-orange-50 flex items-center justify-center shrink-0">
              <span class="material-symbols-outlined notranslate text-orange-500 text-base">qr_code_scanner</span>
            </div>
            <div>
              <h3 class="text-base font-semibold text-gray-900">Asignar QR</h3>
              <p class="text-[12px] text-gray-500">
                para <span class="text-gray-700 font-medium">{{ userName }}</span>
              </p>
            </div>
          </div>
        </div>

        <!-- Form -->
        <div class="px-6 pb-5 space-y-4">
          <div class="space-y-1.5">
            <label class="text-[10px] uppercase tracking-widest text-gray-500 font-semibold">Nombre</label>
            <input v-model="qrNameInput" placeholder="Ej. Llaves del auto" @keyup.enter="handleSubmit"
              class="w-full h-11 px-4 rounded-2xl border border-gray-200 bg-gray-50 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition-all duration-300 focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-500/10">
          </div>
          <div class="space-y-1.5">
            <label class="text-[10px] uppercase tracking-widest text-gray-500 font-semibold">Categoría</label>
            <div class="relative">
              <select v-model="qrCategory"
                class="w-full h-11 px-4 pr-9 rounded-2xl border border-gray-200 bg-gray-50 text-sm text-gray-900 outline-none transition-all duration-300 focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-500/10 cursor-pointer appearance-none">
                <option value="vehicle">Vehículos</option>
                <option value="home">Hogares</option>
                <option value="phone">Celulares</option>
                <option value="laptop">Laptops</option>
                <option value="bags">Mochilas / Maletas</option>
                <option value="keys">Llaves</option>
                <option value="pets">Mascotas</option>
                <option value="people">Personas</option>
                <option value="wallet">Carteras</option>
                <option value="documents">Documentos</option>
                <option value="bike">Bicicletas</option>
                <option value="other">Otro</option>
              </select>
              <span
                class="material-symbols-outlined notranslate absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-base pointer-events-none">expand_more</span>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex gap-2.5 px-6 pb-6">
          <button @click="handleCancel"
            class="flex-1 h-11 rounded-2xl bg-gray-100 text-gray-700 text-[11px] font-bold uppercase tracking-widest hover:bg-gray-200 transition-all duration-200 active:scale-95 cursor-pointer">
            Cancelar
          </button>
          <button @click="handleSubmit" :disabled="!qrNameInput.trim() || loading"
            class="flex-1 h-11 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white text-[11px] font-bold uppercase tracking-widest shadow-lg shadow-orange-500/25 transition-all duration-200 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-1.5">
            <span v-if="loading"
              class="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            <span v-else>Crear QR</span>
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

/* MD3 Dialog transition */
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
