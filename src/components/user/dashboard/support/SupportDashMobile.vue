<script lang="ts" setup>
import { ref } from 'vue'

const form = ref({
  subject: '',
  message: '',
})

const isSending = ref(false)
const showSuccess = ref(false)

const submitForm = () => {
  if (!form.value.subject || !form.value.message) return
  isSending.value = true
  setTimeout(() => {
    isSending.value = false
    showSuccess.value = true
    form.value.subject = ''
    form.value.message = ''
    setTimeout(() => { showSuccess.value = false }, 4000)
  }, 1500)
}
</script>

<template>
  <div class="relative min-h-dvh bg-[#1C1B1F] w-full font-google-sans">
    <div class="px-4 pt-3 pb-32 space-y-4">

      <!-- Header -->
      <div class="flex items-center gap-2.5">
        <div
          class="w-9 h-9 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shrink-0">
          <span class="material-symbols-outlined notranslate text-orange-400 text-[18px]">support_agent</span>
        </div>
        <div>
          <h2 class="text-lg font-bold text-[#E6E1E5]">Soporte técnico</h2>
          <p class="text-[#CAC4D0]/50 text-[10px]">Estamos para ayudarle</p>
        </div>
      </div>

      <!-- Hero message -->
      <div class="bg-[#2B2930] rounded-xl p-4 border border-[#49454F]/30 space-y-2">
        <div class="flex items-start gap-3">
          <div
            class="w-9 h-9 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shrink-0">
            <span class="material-symbols-outlined notranslate text-orange-400 text-[16px]">handshake</span>
          </div>
          <div>
            <p class="text-sm text-[#E6E1E5] font-medium leading-relaxed">
              Estamos para ayudarle. Si tiene un problema o alguna duda respecto a su cuenta, siéntase libre de
              contactarnos.
            </p>
            <p class="text-xs text-[#CAC4D0]/50 mt-1">Nuestro equipo le responderá a la brevedad.</p>
          </div>
        </div>
      </div>

      <!-- Contact form -->
      <div class="bg-[#2B2930] rounded-xl p-4 border border-[#49454F]/30 relative overflow-hidden">
        <!-- Success overlay -->
        <div v-if="showSuccess" class="absolute inset-0 bg-[#2B2930] flex flex-col items-center justify-center z-10">
          <div
            class="w-14 h-14 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mb-3">
            <span class="material-symbols-outlined notranslate text-orange-400 text-[28px]">check</span>
          </div>
          <h3 class="text-[#E6E1E5] text-base font-bold mb-1">¡Mensaje enviado!</h3>
          <p class="text-[#CAC4D0]/50 text-xs">Le responderemos a la brevedad.</p>
        </div>

        <form @submit.prevent="submitForm" class="space-y-3 relative">
          <div>
            <label
              class="text-[9px] font-bold uppercase tracking-wider text-[#CAC4D0]/40 ml-1 mb-1 block">Asunto</label>
            <div class="relative">
              <select v-model="form.subject" required
                class="w-full h-10 px-3 rounded-xl border border-[#49454F]/50 bg-[#1C1B1F] text-[#E6E1E5] text-sm outline-none focus:border-orange-500/50 transition-all appearance-none pr-10 cursor-pointer">
                <option value="" disabled selected>Selecciona un tema...</option>
                <option value="billing">Problemas de facturación / Pagos</option>
                <option value="qr_issues">Mi código QR no funciona</option>
                <option value="account">Problemas con mi configuración de cuenta</option>
                <option value="other">Otro asunto</option>
              </select>
              <div class="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-[#CAC4D0]/30">
                <span class="material-symbols-outlined notranslate text-[18px]">expand_more</span>
              </div>
            </div>
          </div>

          <div>
            <label
              class="text-[9px] font-bold uppercase tracking-wider text-[#CAC4D0]/40 ml-1 mb-1 block">Mensaje</label>
            <textarea v-model="form.message" required rows="4"
              class="w-full px-3 py-2.5 rounded-xl border border-[#49454F]/50 bg-[#1C1B1F] text-[#E6E1E5] text-sm placeholder:text-[#CAC4D0]/30 outline-none focus:border-orange-500/50 transition-all resize-none"
              placeholder="Describa su problema con detalle..."></textarea>
          </div>

          <button type="submit" :disabled="isSending"
            class="w-full h-11 rounded-xl bg-orange-500 text-black font-bold text-xs uppercase tracking-wider hover:bg-orange-400 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer">
            <span v-if="isSending"
              class="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin"></span>
            <span v-else class="material-symbols-outlined notranslate text-[16px]">send</span>
            {{ isSending ? 'Enviando...' : 'Enviar mensaje' }}
          </button>
        </form>
      </div>

      <!-- Direct email -->
      <div class="flex items-center justify-center gap-1.5 text-[11px] text-[#CAC4D0]/40">
        <span class="material-symbols-outlined notranslate text-[14px]">mail</span>
        También puede escribirnos a
        <a href="mailto:soporte@ubiqueme.com"
          class="text-orange-400 hover:text-orange-300 transition-colors font-medium">soporte@ubiqueme.com</a>
      </div>
    </div>
  </div>
</template>

<style scoped>
.material-symbols-outlined {
  font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}
</style>
