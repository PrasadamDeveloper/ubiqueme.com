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
    <div v-if="isOpen" class="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">

      <div class="w-full max-w-sm rounded-2xl border border-white/[0.08] bg-[#0d0d0e] shadow-2xl overflow-hidden">

        <!-- Header -->
        <div class="p-5 pb-3 space-y-1">
          <div class="flex items-center gap-3">
            <div
              class="w-9 h-9 rounded-xl bg-[#ff7900]/10 border border-[#ff7900]/20 flex items-center justify-center shrink-0">
              <span class="material-symbols-outlined notranslate text-[#ff7900] text-base">qr_code_scanner</span>
            </div>
            <div>
              <h3 class="text-sm font-semibold text-white">Asignar QR</h3>
              <p class="text-[11px] text-white/40">
                para <span class="text-white/60">{{ userName }}</span>
              </p>
            </div>
          </div>
        </div>

        <!-- Form -->
        <div class="px-5 pb-4 space-y-3.5">
          <div class="space-y-1.5">
            <label class="text-[9px] uppercase tracking-widest text-white/35 font-medium">Nombre</label>
            <input v-model="qrNameInput" placeholder="Ej. Llaves del auto" @keyup.enter="handleSubmit"
              class="w-full h-10 px-3.5 rounded-xl border border-white/[0.06] bg-white/[0.03] text-white text-[13px] outline-none focus:border-[#ff7900]/30 placeholder:text-white/20 transition-colors">
          </div>
          <div class="space-y-1.5">
            <label class="text-[9px] uppercase tracking-widest text-white/35 font-medium">Categoría</label>
            <select v-model="qrCategory"
              class="w-full h-10 px-3.5 rounded-xl border border-white/[0.06] bg-white/[0.03] text-white text-[13px] outline-none focus:border-[#ff7900]/30 transition-colors cursor-pointer">
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
          </div>
        </div>

        <!-- Actions -->
        <div class="flex gap-2 px-5 pb-5">
          <button @click="handleCancel"
            class="flex-1 h-10 rounded-xl border border-white/[0.06] bg-white/[0.03] text-white/70 text-[10px] font-semibold uppercase tracking-widest hover:bg-white/[0.06] transition cursor-pointer">
            Cancelar
          </button>
          <button @click="handleSubmit" :disabled="!qrNameInput.trim() || loading"
            class="flex-1 h-10 rounded-xl bg-[#ff7900] hover:bg-[#ff8c1a] text-white text-[10px] font-semibold uppercase tracking-widest transition disabled:opacity-40 cursor-pointer flex items-center justify-center gap-1.5">
            <span v-if="loading"
              class="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
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
