<script lang="ts" setup>
import { ref } from 'vue'
import { useUserStore } from '@/stores/user'
import { toast } from 'vue-sonner'
import HomeLayout from '@/layouts/HomeLayout.vue'

const userStore = useUserStore()

const name = ref('')
const email = ref('')
const phone = ref('')
const message = ref('')
const isSubmitting = ref(false)
const sent = ref(false)

const handleSubmit = async () => {
  if (!name.value.trim()) {
    toast.error('Ingrese su nombre.')
    return
  }
  if (!email.value.trim() || !email.value.includes('@')) {
    toast.error('Ingrese un correo electrónico válido.')
    return
  }
  if (!message.value.trim() || message.value.length < 10) {
    toast.error('El mensaje debe tener al menos 10 caracteres.')
    return
  }

  isSubmitting.value = true
  const soporteUrl = import.meta.env.VITE_SOPORTE_WORKER_URL

  try {
    const res = await fetch(`${soporteUrl}/api/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: name.value.trim(),
        email: email.value.trim(),
        phone: phone.value.trim(),
        message: message.value.trim(),
        firebaseUid: userStore.getUserId || 'N/A',
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      throw new Error(data.error || 'Error al enviar el mensaje')
    }

    sent.value = true
    toast.success('Mensaje enviado correctamente. Le responderemos pronto.')
  } catch (error) {
    const e = error as Error
    toast.error(`Error al enviar: ${e.message}`)
  } finally {
    isSubmitting.value = false
  }
}


const autoComplete = () => {
  if (!userStore.getFullName || !userStore.getEmail) {
    toast.error('No hay información de usuario disponible para autocompletar, inicié sesión o complete manualmente los campos.')
    return
  }
  name.value = userStore.getFullName
  email.value = userStore.getEmail
  //pending phone
}
</script>

<template>
  <HomeLayout>
    <template #main>
      <div class="min-h-screen bg-[#09090b] font-google-sans pt-20">
        <!-- Hero -->
        <div class="relative overflow-hidden">
          <div class="absolute inset-0 opacity-[0.02] pointer-events-none"
            style="background-image:linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px);background-size:40px 40px;">
          </div>
          <div
            class="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-orange-500/5 rounded-full blur-[120px] pointer-events-none">
          </div>

          <div class="relative max-w-4xl mx-auto px-6 pt-24 pb-16 text-center">
            <div
              class="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-orange-500/20 bg-orange-500/10 text-orange-400 text-[10px] font-black uppercase tracking-[0.2em] mb-5">
              <span class="material-symbols-outlined text-[14px]">contact_mail</span>
              Contacto
            </div>
            <h1 class="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight mb-4">
              Estamos aquí para ayudarle
            </h1>
            <p class="text-white/40 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
              ¿Tiene dudas, comentarios o necesita asistencia? Envíenos un mensaje y le responderemos a la brevedad.
            </p>
          </div>
        </div>

        <!-- Content -->
        <div class="max-w-3xl mx-auto px-6 pb-32">
          <!-- Success Message -->
          <div v-if="sent"
            class="p-8 rounded-3xl border border-emerald-500/20 bg-emerald-500/5 text-center max-w-md mx-auto">
            <div
              class="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto mb-4">
              <span class="material-symbols-outlined text-[32px]">check</span>
            </div>
            <h2 class="text-xl font-black text-white mb-2">Mensaje enviado</h2>
            <p class="text-white/50 text-sm leading-relaxed">
              Hemos recibido su mensaje y lo estamos revisando. Le responderemos a la brevedad posible a
              <strong class="text-white/80">{{ email }}</strong>.
            </p>
            <button @click="sent = false; name = ''; email = ''; phone = ''; message = ''"
              class="mt-6 px-6 py-2.5 rounded-xl border border-white/10 text-white/70 text-sm font-medium hover:bg-white/5 hover:text-white transition-all cursor-pointer">
              Enviar otro mensaje
            </button>
          </div>

          <!-- Form -->
          <form v-else @submit.prevent="handleSubmit" class="space-y-6">
            <!-- Info cards row -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div class="p-4 rounded-2xl border border-white/10 bg-white/[0.02] text-center">
                <div
                  class="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center mx-auto mb-3">
                  <span class="material-symbols-outlined text-[20px]">mail</span>
                </div>
                <p class="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-1">Correo</p>
                <p class="text-sm text-white font-medium">soporte@ubiqueme.com</p>
              </div>
              <div class="p-4 rounded-2xl border border-white/10 bg-white/[0.02] text-center">
                <div
                  class="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center mx-auto mb-3">
                  <span class="material-symbols-outlined text-[20px]">schedule</span>
                </div>
                <p class="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-1">Horario</p>
                <p class="text-sm text-white font-medium">Lun - Vie, 9:00 - 18:00</p>
              </div>
              <div class="p-4 rounded-2xl border border-white/10 bg-white/[0.02] text-center">
                <div
                  class="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center mx-auto mb-3">
                  <span class="material-symbols-outlined text-[20px]">bolt</span>
                </div>
                <p class="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-1">Respuesta</p>
                <p class="text-sm text-white font-medium">24 - 48 hrs hábiles</p>
              </div>
            </div>


            <div class="relative">
              <button v-if="userStore.getFullName"
                v-tooltip:="{ content: 'Como ya inicio sesión, puede autocompletar los campos', placement: 'right' }"
                type="button"
                class="  top-0 h-12 px-4 rounded-2xl border border-white/10 bg-black/30 text-white text-sm placeholder:text-white/20 outline-none focus:border-orange-500/40 focus:bg-orange-500/5 focus:shadow-[0_0_20px_rgba(249,115,22,0.06)] transition-all"
                @click="autoComplete">
                Autocompletar Nombre y Correo
              </button>
            </div>

            <!-- Name & Email -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 relative">

              <div>
                <label class="text-[9px] font-black uppercase tracking-[0.2em] text-white/30 ml-1 mb-1.5 block">Nombre
                  *</label>
                <input v-model="name" type="text" placeholder="Ej. Juan Pérez"
                  class="w-full h-12 px-4 rounded-2xl border border-white/10 bg-black/30 text-white text-sm placeholder:text-white/20 outline-none focus:border-orange-500/40 focus:bg-orange-500/5 focus:shadow-[0_0_20px_rgba(249,115,22,0.06)] transition-all" />
              </div>
              <div>
                <label class="text-[9px] font-black uppercase tracking-[0.2em] text-white/30 ml-1 mb-1.5 block">Correo
                  electrónico *</label>
                <input v-model="email" type="email" placeholder="ejemplo@correo.com"
                  class="w-full h-12 px-4 rounded-2xl border border-white/10 bg-black/30 text-white text-sm placeholder:text-white/20 outline-none focus:border-orange-500/40 focus:bg-orange-500/5 focus:shadow-[0_0_20px_rgba(249,115,22,0.06)] transition-all" />
              </div>
            </div>

            <!-- Phone -->
            <div>
              <label class="text-[9px] font-black uppercase tracking-[0.2em] text-white/30 ml-1 mb-1.5 block">Teléfono
                <span class="text-white/20 normal-case tracking-normal">(opcional)</span></label>
              <input v-model="phone" type="tel" placeholder="Ej. 5512345678"
                class="w-full h-12 px-4 rounded-2xl border border-white/10 bg-black/30 text-white text-sm placeholder:text-white/20 outline-none focus:border-orange-500/40 focus:bg-orange-500/5 focus:shadow-[0_0_20px_rgba(249,115,22,0.06)] transition-all" />
            </div>

            <!-- Message -->
            <div>
              <label class="text-[9px] font-black uppercase tracking-[0.2em] text-white/30 ml-1 mb-1.5 block">Mensaje
                *</label>
              <textarea v-model="message" rows="5" placeholder="Escriba su mensaje aquí..."
                class="w-full px-4 py-3 rounded-2xl border border-white/10 bg-black/30 text-white text-sm placeholder:text-white/20 outline-none focus:border-orange-500/40 focus:bg-orange-500/5 focus:shadow-[0_0_20px_rgba(249,115,22,0.06)] transition-all resize-none"></textarea>
            </div>

            <!-- Submit -->
            <div class="flex items-center justify-between pt-2">
              <p class="text-[10px] text-white/30">
                Los campos marcados con <span class="text-white/50">*</span> son obligatorios.
              </p>
              <button type="submit" :disabled="isSubmitting"
                class="px-8 py-3 rounded-2xl bg-orange-500 text-black font-black text-sm uppercase tracking-[0.1em] hover:bg-orange-400 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_20px_rgba(249,115,22,0.25)] cursor-pointer">
                <span v-if="isSubmitting" class="flex items-center gap-2">
                  <span class="w-4 h-4 border-2 border-black/30 border-t-transparent rounded-full animate-spin"></span>
                  Enviando...
                </span>
                <span v-else>Enviar mensaje</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </template>
  </HomeLayout>
</template>

<style scoped>
.font-google-sans {
  font-family: 'Google Sans', sans-serif;
}

.material-symbols-outlined {
  font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}
</style>
