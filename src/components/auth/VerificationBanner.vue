<template>
  <div class="w-full bg-primary/5 border border-primary/20 rounded-3xl p-8 flex flex-col items-center text-center space-y-5 animate-fade-in">
    <div class="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 shadow-[0_0_30px_rgba(123,208,255,0.15)]">
      <span class="material-symbols-outlined text-primary text-3xl">mark_email_unread</span>
    </div>

    <div class="space-y-2">
      <h3 class="text-white font-black text-2xl tracking-tight">Sólo un paso más</h3>
      <p class="text-white/60 text-sm font-medium leading-relaxed px-2">
        Por favor verifique su cuenta haciendo clic en el enlace que enviamos a su correo. Si no lo encuentra, recuerde revisar su carpeta de spam.
      </p>
    </div>

    <!-- Resend Button -->
    <div class="w-full pt-2 border-t border-white/5 flex flex-col items-center gap-3">
      <button
        @click="handleResend"
        :disabled="loading || cooldown > 0"
        class="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 border"
        :class="cooldown > 0
          ? 'bg-white/[0.02] border-white/5 text-white/20 cursor-not-allowed'
          : 'bg-primary/10 border-primary/20 text-primary hover:bg-primary/20 active:scale-95'"
      >
        <!-- Spinner while loading -->
        <span v-if="loading" class="w-3.5 h-3.5 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></span>
        <!-- Email icon when idle -->
        <span v-else class="material-symbols-outlined text-[16px]">forward_to_inbox</span>

        <span v-if="loading">Enviando...</span>
        <span v-else-if="cooldown > 0">Reenviar en {{ cooldown }}s</span>
        <span v-else>¿No lo recibió? Enviar link nuevamente</span>
      </button>

      <p v-if="cooldown > 0" class="text-[10px] text-white/20 font-medium">
        Revisa tu bandeja de entrada y carpeta de spam.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from 'vue'

const emit = defineEmits<{
  resend: []
}>()

const props = defineProps<{
  loading: boolean
}>()

// Cooldown para evitar spam: 60 segundos entre reenvíos
const cooldown = ref(0)
let cooldownInterval: ReturnType<typeof setInterval> | null = null

const startCooldown = () => {
  cooldown.value = 60
  cooldownInterval = setInterval(() => {
    cooldown.value--
    if (cooldown.value <= 0) {
      clearInterval(cooldownInterval!)
      cooldownInterval = null
    }
  }, 1000)
}

const handleResend = () => {
  if (props.loading || cooldown.value > 0) return
  startCooldown()
  emit('resend')
}

onUnmounted(() => {
  if (cooldownInterval) clearInterval(cooldownInterval)
})
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.4s ease-out forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.material-symbols-outlined {
  font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}
</style>
