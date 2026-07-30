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
  <div class="min-h-dvh bg-slate-50 w-full font-google-sans">
    <div class="px-5 pt-4 pb-32 space-y-5">

      <!-- Header -->
      <div class="flex items-center gap-3">
        <div
          class="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
          <span class="material-symbols-outlined notranslate text-orange-500 text-[18px]">support_agent</span>
        </div>
        <div class="pt-0.5">
          <h2 class="text-lg font-semibold text-slate-900">Soporte</h2>
          <p class="text-slate-400 text-[11px] font-medium mt-px">Estamos para ayudarte</p>
        </div>
      </div>

      <!-- Hero message -->
      <div class="bg-white rounded-2xl p-5 border border-slate-100 space-y-3">
        <div class="flex items-start gap-3.5">
          <div
            class="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
            <span class="material-symbols-outlined notranslate text-orange-500 text-[16px]">handshake</span>
          </div>
          <div class="pt-0.5">
            <p class="text-sm text-slate-700 font-medium leading-relaxed">
              Estamos para ayudarte. Si tienes un problema o alguna duda respecto a tu cuenta,
              siéntete libre de contactarnos.
            </p>
            <p class="text-xs text-slate-400 mt-1.5 font-medium">Nuestro equipo te responderá a la brevedad.</p>
          </div>
        </div>
      </div>

      <!-- Contact form -->
      <div class="bg-white rounded-2xl p-5 border border-slate-100 relative overflow-hidden">
        <!-- Success overlay -->
        <div v-if="showSuccess" class="absolute inset-0 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center z-10 rounded-2xl">
          <div
            class="w-14 h-14 rounded-full bg-orange-100 flex items-center justify-center mb-3">
            <span class="material-symbols-outlined notranslate text-orange-500 text-[28px]">check</span>
          </div>
          <h3 class="text-slate-900 text-base font-semibold mb-1">¡Mensaje enviado!</h3>
          <p class="text-slate-400 text-xs font-medium">Te responderemos a la brevedad.</p>
        </div>

        <form @submit.prevent="submitForm" class="space-y-4 relative">
          <div class="space-y-1.5">
            <label
              class="text-[10px] font-semibold uppercase tracking-wider text-slate-500 ml-1">Asunto</label>
            <div class="relative">
              <select v-model="form.subject" required
                class="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm outline-none focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/10 transition-all appearance-none pr-10 cursor-pointer">
                <option value="" disabled selected>Selecciona un tema...</option>
                <option value="billing">Problemas de facturación / Pagos</option>
                <option value="qr_issues">Mi código QR no funciona</option>
                <option value="account">Problemas con mi configuración de cuenta</option>
                <option value="other">Otro asunto</option>
              </select>
              <div class="absolute inset-y-0 right-0 flex items-center px-3.5 pointer-events-none text-slate-400">
                <span class="material-symbols-outlined notranslate text-[18px]">expand_more</span>
              </div>
            </div>
          </div>

          <div class="space-y-1.5">
            <label
              class="text-[10px] font-semibold uppercase tracking-wider text-slate-500 ml-1">Mensaje</label>
            <textarea v-model="form.message" required rows="4"
              class="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm placeholder:text-slate-400 outline-none focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/10 transition-all resize-none"
              placeholder="Describe tu problema con detalle..."></textarea>
          </div>

          <button type="submit" :disabled="isSending"
            class="w-full h-12 rounded-full bg-orange-500 text-white font-semibold text-xs uppercase tracking-wider hover:bg-orange-400 transition-all active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer shadow-sm">
            <span v-if="isSending"
              class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            <span v-else class="material-symbols-outlined notranslate text-[16px]">send</span>
            {{ isSending ? 'Enviando...' : 'Enviar mensaje' }}
          </button>
        </form>
      </div>

      <!-- Direct email -->
      <div class="flex items-center justify-center gap-1.5 text-[12px] text-slate-400 pt-1">
        <span class="material-symbols-outlined notranslate text-[14px]">mail</span>
        <span>También puedes escribirnos a</span>
        <a href="mailto:soporte@ubiqueme.com"
          class="text-orange-500 font-semibold hover:text-orange-400 transition-colors">soporte@ubiqueme.com</a>
      </div>
    </div>
  </div>
</template>

<style scoped>
.material-symbols-outlined {
  font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}
</style>
