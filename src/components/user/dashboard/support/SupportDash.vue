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

  // Simulando el envío a la base de datos o API
  setTimeout(() => {
    isSending.value = false
    showSuccess.value = true
    form.value.subject = ''
    form.value.message = ''

    setTimeout(() => {
      showSuccess.value = false
    }, 4000)
  }, 1500)
}
</script>

<template>
  <div class="w-full max-w-7xl mx-auto font-google-sans pb-20">
    <!-- Page Header -->
    <div class="mb-8">
      <div class="flex items-center gap-3 mb-2">
        <div
          class="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500/20 to-orange-600/10 border border-orange-500/20 flex items-center justify-center">
          <span class="material-symbols-outlined notranslate text-orange-400 text-lg">support_agent</span>
        </div>
        <div>
          <h2 class="text-3xl font-bold text-white">Soporte técnico</h2>
          <p class="text-gray-500 text-sm">Estamos para ayudarle</p>
        </div>
      </div>
    </div>

    <!-- Hero message -->
    <div class="bg-[#0f0f11] rounded-2xl border border-white/5 p-6 mb-6">
      <div class="flex items-start gap-4">
        <div
          class="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500/10 to-orange-600/5 border border-orange-500/20 flex items-center justify-center shrink-0">
          <span class="material-symbols-outlined notranslate text-orange-400 text-lg">handshake</span>
        </div>
        <div>
          <p class="text-white text-sm font-medium leading-relaxed">
            Estamos para ayudarle. Si tiene un problema o alguna duda respecto a su cuenta, siéntase libre de
            contactarnos.
          </p>
          <p class="text-gray-500 text-xs mt-2">
            Estamos para servirle — nuestro equipo le responderá a la brevedad.
          </p>
        </div>
      </div>
    </div>

    <!-- Contact Form -->
    <div class="bg-[#0f0f11] rounded-2xl p-6 border border-white/5 relative overflow-hidden">
      <!-- Overlay de éxito -->
      <div v-if="showSuccess" class="absolute inset-0 bg-[#161618] flex flex-col items-center justify-center z-10">
        <div
          class="w-16 h-16 bg-orange-500/20 text-orange-400 border border-orange-500/20 rounded-full flex items-center justify-center mb-4">
          <span class="material-symbols-outlined notranslate text-3xl">check</span>
        </div>
        <h3 class="text-white text-lg font-semibold mb-1">¡Mensaje enviado exitosamente!</h3>
        <p class="text-gray-500 text-sm">Nuestro equipo le responderá a su correo en breve.</p>
      </div>

      <form @submit.prevent="submitForm" class="space-y-5 relative">
        <div>
          <label class="block text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-2">Asunto</label>
          <div class="relative">
            <select v-model="form.subject" required
              class="w-full bg-[#161618] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-orange-500/50 transition-all appearance-none pr-10">
              <option value="" disabled selected>Selecciona un tema...</option>
              <option value="billing">Problemas de facturación / Pagos</option>
              <option value="qr_issues">Mi código QR no funciona</option>
              <option value="account">Problemas con mi configuración de cuenta</option>
              <option value="other">Otro asunto</option>
            </select>
            <!-- Dropdown Icon -->
            <div class="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-white/30">
              <span class="material-symbols-outlined notranslate text-[18px]">expand_more</span>
            </div>
          </div>
        </div>

        <div>
          <label class="block text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-2">Mensaje</label>
          <textarea v-model="form.message" required rows="5"
            class="w-full bg-[#161618] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-orange-500/50 transition-all resize-none placeholder:text-white/20"
            placeholder="Describa su problema con detalle para que podamos ayudarle de la mejor manera..."></textarea>
        </div>

        <button type="submit" :disabled="isSending"
          class="w-full py-3 rounded-xl text-xs font-bold uppercase tracking-wider bg-orange-600 hover:bg-orange-500 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-all active:scale-[0.98] flex items-center justify-center gap-2">
          <span v-if="isSending"
            class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
          <span v-else class="material-symbols-outlined notranslate text-[18px]">send</span>
          {{ isSending ? 'Enviando mensaje...' : 'Enviar mensaje al soporte' }}
        </button>
      </form>
    </div>

    <!-- Direct email -->
    <div class="mt-6 flex items-center justify-center gap-2 text-xs text-gray-500 text-center">
      <span class="material-symbols-outlined notranslate text-[14px] text-white/20">mail</span>
      También puede escribirnos directamente a:
      <a href="mailto:soporte@ubiqueme.com"
        class="text-orange-400 hover:text-orange-300 transition-colors font-medium">soporte@ubiqueme.com</a>
    </div>
  </div>
</template>

<style scoped></style>
