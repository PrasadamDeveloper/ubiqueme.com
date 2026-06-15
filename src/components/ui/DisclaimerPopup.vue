<script lang="ts" setup>
import { ref } from 'vue'

const props = defineProps<{
  whatsappUrl: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const isVisible = ref(true)
const isLeaving = ref(false)

const close = () => {
  isLeaving.value = true
  setTimeout(() => {
    emit('close')
  }, 200)
}

const accept = () => {
  window.open(props.whatsappUrl, '_blank')
  close()
}
</script>

<template>
  <Teleport to="body">
    <Transition enter-active-class="transition-all duration-300 ease-out" enter-from-class="opacity-0"
      enter-to-class="opacity-100" leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100" leave-to-class="opacity-0">
      <div v-show="isVisible && !isLeaving"
        class="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 bg-black/80 " @click.self="close">
        <Transition enter-active-class="transition-all duration-300 ease-out"
          enter-from-class="opacity-0 scale-95 translate-y-4" enter-to-class="opacity-100 scale-100 translate-y-0"
          leave-active-class="transition-all duration-200 ease-in"
          leave-from-class="opacity-100 scale-100 translate-y-0" leave-to-class="opacity-0 scale-95 translate-y-4">
          <div v-show="isVisible && !isLeaving"
            class="relative w-full max-w-md bg-[#0c0500] border border-orange-500/20 rounded-[2rem] p-6 sm:p-8 shadow-[0_20px_60px_rgba(249,115,22,0.15)] overflow-hidden">
            <!-- Grid Pattern Background -->
            <div class="absolute inset-0 z-0 opacity-[0.04] pointer-events-none"
              style="background-image: linear-gradient(rgba(255, 255, 255, 1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 1) 1px, transparent 1px); background-size: 24px 24px;">
            </div>

            <!-- Orange glow -->
            <div
              class="absolute top-0 left-0 w-full h-full z-0 opacity-10 pointer-events-none bg-gradient-to-br from-orange-500/20 via-transparent to-transparent">
            </div>

            <div class="relative z-10 space-y-6">
              <!-- Close button -->
              <button @click="close"
                class="absolute top-4 right-4 w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/50 hover:bg-white/10 hover:text-white transition-all cursor-pointer">
                <span class="material-symbols-outlined text-[18px]">close</span>
              </button>

              <!-- Icon Row: Shield + Warning -->
              <div class="flex items-center justify-center gap-4 pt-2">
                <div
                  class="w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                  <span class="material-symbols-outlined text-amber-500 text-[28px]">warning_amber</span>
                </div>
                <div
                  class="w-14 h-14 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                  <svg class="w-7 h-7 text-green-500" fill="currentColor" viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                </div>
              </div>

              <!-- Title -->
              <div class="text-center space-y-2">
                <h3 class="text-white font-black text-lg sm:text-xl tracking-tight">
                  Aviso de Privacidad
                </h3>
                <p class="text-white/70 text-xs sm:text-sm leading-relaxed max-w-xs mx-auto">
                  Está a punto de contactar al dueño por WhatsApp. A partir del momento en que acepte, deberá proceder
                  con cautela, ya que la otra persona podrá ver su número de teléfono. Contáctelo solo si lo considera
                  necesario.
                </p>
              </div>

              <!-- Divider -->
              <div class="flex items-center gap-3">
                <div class="flex-1 h-px bg-white/5"></div>
                <span class="material-symbols-outlined text-white/10 text-[14px]">gpp_maybe</span>
                <div class="flex-1 h-px bg-white/5"></div>
              </div>

              <!-- Actions -->
              <div class="flex flex-col sm:flex-row gap-3">
                <button @click="close"
                  class="flex-1 py-3 px-4 bg-white/5 border border-white/10 text-white/70 rounded-xl font-medium text-sm hover:bg-white/10 hover:text-white transition-all cursor-pointer">
                  Cancelar
                </button>
                <button @click="accept"
                  class="flex-1 py-3 px-4 bg-[#27b35a] text-white rounded-xl font-bold text-sm  hover:bg-[#20bd5a] transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(37,211,102,0.25)]">
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  Aceptar y Contactar
                </button>
              </div>

              <!-- Footer note -->
              <p class="text-center text-[9px] text-white/20 font-black  tracking-[0.3em]">
                Información de Privacidad Ubiqueme
              </p>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.material-symbols-outlined {
  font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}
</style>
