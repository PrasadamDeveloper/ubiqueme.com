<script lang="ts" setup>
import { ref, watch } from 'vue'

const props = defineProps<{
  isOpen: boolean
  userName: string
}>()

const emit = defineEmits<{
  (e: 'submit', qrName: string): void
  (e: 'cancel'): void
}>()

const qrNameInput = ref('')

// Focus and clear input when modal opens
watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    qrNameInput.value = ''
  }
})

const handleSubmit = () => {
  if (!qrNameInput.value.trim()) return
  emit('submit', qrNameInput.value.trim())
}

const handleCancel = () => {
  emit('cancel')
}
const qrCategory = ref('other')

const qrLayout = ref<'compact' | 'detail'>('compact') // compact | detail

const qrSize = ref('SM')
</script>

<template>
  <Transition name="fade-scale">

    <div v-if="isOpen" class="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4">

      <div class="bg-[#09090b] border border-white/10 w-full max-w-5xl rounded-xl p-5 md:p-5 relative overflow-hidden">

        <!-- Grid Pattern -->
        <div class="absolute inset-0 opacity-[0.02] pointer-events-none"
          style="background-image:linear-gradient(rgba(255,255,255,.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.5) 1px,transparent 1px);background-size:22px 22px;">
        </div>

        <div class="relative z-10 grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">

          <!-- LEFT -->
          <section class="space-y-5">

            <!-- Header -->
            <div class="flex gap-4">

              <div
                class="w-12 h-12 rounded-2xl border border-orange-500/15 bg-orange-500/5 flex items-center justify-center">

                <span class="material-symbols-outlined text-orange-400">

                  qr_code_scanner

                </span>

              </div>

              <div>

                <h3 class="text-xl font-semibold text-white">

                  Asignar QR

                </h3>

                <p class="text-xs text-white/40">

                  Crear nuevo QR para

                  <span class="text-white">

                    {{ userName }}

                  </span>

                </p>

              </div>

            </div>

            <!-- FORM -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">

              <!-- NAME -->
              <div class="space-y-2">

                <label class="text-[10px] uppercase tracking-widest text-white/40">

                  Nombre

                </label>

                <input v-model="qrNameInput" placeholder="Ej. Llaves del auto" @keyup.enter="handleSubmit"
                  class="w-full h-11 px-4 rounded-xl border border-white/10 bg-white/5 text-white placeholder:text-white/20 outline-none focus:border-orange-500">

              </div>

              <!-- CATEGORY -->
              <div class="space-y-2">

                <label class="text-[10px] uppercase tracking-widest text-white/40">

                  Categoría

                </label>

                <select v-model="qrCategory"
                  class="w-full h-11 px-4 rounded-xl border border-white/10 bg-white/5 text-white outline-none">

                  <option value="vehicle">

                    Vehículos

                  </option>

                  <option value="home">

                    Hogares

                  </option>

                  <option value="phone">

                    Celulares

                  </option>

                  <option value="laptop">

                    Laptops

                  </option>

                  <option value="bags">

                    Mochilas / Maletas

                  </option>

                  <option value="keys">

                    Llaves

                  </option>

                  <option value="pets">

                    Mascotas

                  </option>

                  <option value="people">

                    Personas

                  </option>

                  <option value="wallet">

                    Carteras

                  </option>

                  <option value="documents">

                    Documentos

                  </option>

                  <option value="bike">

                    Bicicletas

                  </option>

                  <option value="other">

                    Otro

                  </option>

                </select>

              </div>

            </div>

            <!-- QR TYPE -->
            <div class="space-y-3">

              <label class="text-[10px] uppercase tracking-widest text-white/40">

                Formato QR

              </label>

              <div class="grid grid-cols-2 gap-3">

                <!-- Compact -->
                <button @click="qrLayout = 'compact'" class="rounded-xl border p-4 text-left transition" :class="qrLayout === 'compact'
                  ? 'border-orange-500/20 bg-orange-500/5'
                  : 'border-white/10 bg-white/5'">

                  <div class="flex justify-between items-start">

                    <div>

                      <p class="text-white">

                        Compact

                      </p>

                      <span class="text-[10px] text-white/40">

                        Solo QR

                      </span>

                    </div>

                    <span class="material-symbols-outlined text-white/30">

                      qr_code_2

                    </span>

                  </div>

                </button>

                <!-- Detail -->
                <button @click="qrLayout = 'detail'" class="rounded-xl border p-4 text-left transition" :class="qrLayout === 'detail'
                  ? 'border-orange-500/20 bg-orange-500/5'
                  : 'border-white/10 bg-white/5'">

                  <div class="flex justify-between items-start">

                    <div>

                      <p class="text-white">

                        Detail

                      </p>

                      <span class="text-[10px] text-white/40">

                        QR + descripción

                      </span>

                    </div>

                    <span class="material-symbols-outlined text-white/30">

                      article

                    </span>

                  </div>

                </button>

              </div>

            </div>

            <!-- SIZE -->
            <div class="space-y-3">

              <label class="text-[10px] uppercase tracking-widest text-white/40">

                Tamaño

              </label>

              <div class="grid grid-cols-6 gap-2">

                <button v-for="size in ['XS', 'SM', 'MD', 'LG', 'XL', 'XXL']" :key="size" @click="qrSize = size"
                  class="h-10 rounded-lg border text-[10px] uppercase transition" :class="qrSize === size
                    ? 'border-orange-500/20 bg-orange-500/5 text-orange-400'
                    : 'border-white/10 bg-white/5 text-white/50'">

                  {{ size }}

                </button>

              </div>

            </div>

          </section>

          <!-- RIGHT -->
          <section class="rounded-2xl border border-white/10 bg-white/[0.03] p-5 space-y-4">

            <p class="text-[10px] uppercase tracking-widest text-white/30">

              Vista previa

            </p>

            <!-- PREVIEW -->
            <div
              class="rounded-2xl border border-white/10 bg-black/30 p-5 min-h-[280px] flex items-center justify-center">

              <!-- COMPACT -->
              <div v-if="qrLayout === 'compact'"
                class="aspect-square w-40 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center">

                <span class="material-symbols-outlined text-9xl! text-white/20">

                  qr_code_2

                </span>

              </div>

              <!-- DETAIL -->
              <div v-else class="w-full max-w-[320px] rounded-2xl border border-white/10 bg-white/5 overflow-hidden">

                <!-- Header -->
                <div class="border-b border-white/10 px-4 py-3 flex items-center gap-3">

                  <div
                    class="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/15 flex items-center justify-center">

                    <span class="material-symbols-outlined text-orange-400 text-[18px]">

                      sell

                    </span>

                  </div>

                  <div class="flex-1 min-w-0">

                    <div class="h-3 w-28 rounded bg-white/10 mb-1">

                    </div>

                    <div class="h-2 w-40 rounded bg-white/5">

                    </div>

                  </div>

                </div>

                <!-- Body -->
                <div class="grid grid-cols-[1fr_110px] gap-4 p-2 items-center">

                  <!-- INFO -->
                  <div class="space-y-2">

                    <div>

                      <span class="text-[9px] uppercase tracking-widest text-white/30">

                        Nombre

                      </span>

                      <div class="h-3 w-24 rounded bg-white/10 mt-2">

                      </div>

                    </div>

                    <div>

                      <span class="text-[9px] uppercase tracking-widest text-white/30">

                        Categoría

                      </span>

                      <div class="h-3 w-20 rounded bg-white/5 mt-2">

                      </div>

                    </div>

                  </div>

                  <!-- QR -->
                  <div
                    class="aspect-square rounded-xl border border-white/10 bg-black/20 flex items-center justify-center">

                    <span class="material-symbols-outlined text-7xl! text-white/20">

                      qr_code_2

                    </span>

                  </div>

                </div>

              </div>

            </div>

            <!-- ACTIONS -->
            <div class="grid grid-cols-2 gap-2">

              <button @click="handleCancel"
                class="h-10 rounded-xl border border-white/10 bg-white/5 text-xs uppercase text-white/70">

                Cancelar

              </button>

              <button @click="handleSubmit" :disabled="!qrNameInput.trim()"
                class="h-10 rounded-xl bg-orange-500 hover:bg-orange-600 text-black text-xs uppercase font-semibold disabled:opacity-50">

                Crear QR

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
