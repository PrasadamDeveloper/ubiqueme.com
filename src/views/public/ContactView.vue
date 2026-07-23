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
      <div class="min-h-screen bg-gradient-to-b from-white via-orange-50/[0.07] to-white font-google-sans">

        <!-- Hero -->
        <div class="relative overflow-hidden pt-24 pb-12 md:pb-20">
          <!-- Decorative dot grid -->
          <div class="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
            <div class="absolute top-10 right-[10%] w-32 h-32 opacity-[0.04]">
              <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full">
                <rect x="0" y="0" width="8" height="8" rx="1" fill="#ff7900"/>
                <rect x="16" y="0" width="8" height="8" rx="1" fill="#ff7900"/>
                <rect x="40" y="0" width="8" height="8" rx="1" fill="#ff7900"/>
                <rect x="64" y="0" width="8" height="8" rx="1" fill="#ff7900"/>
                <rect x="88" y="0" width="8" height="8" rx="1" fill="#ff7900"/>
                <rect x="104" y="0" width="8" height="8" rx="1" fill="#ff7900"/>
                <rect x="0" y="16" width="8" height="8" rx="1" fill="#ff7900"/>
                <rect x="24" y="16" width="8" height="8" rx="1" fill="#ff7900"/>
                <rect x="56" y="16" width="8" height="8" rx="1" fill="#ff7900"/>
                <rect x="80" y="16" width="8" height="8" rx="1" fill="#ff7900"/>
                <rect x="104" y="16" width="8" height="8" rx="1" fill="#ff7900"/>
                <rect x="8" y="32" width="8" height="8" rx="1" fill="#ff7900"/>
                <rect x="40" y="32" width="8" height="8" rx="1" fill="#ff7900"/>
                <rect x="64" y="32" width="8" height="8" rx="1" fill="#ff7900"/>
                <rect x="96" y="32" width="8" height="8" rx="1" fill="#ff7900"/>
                <rect x="0" y="48" width="8" height="8" rx="1" fill="#ff7900"/>
                <rect x="32" y="48" width="8" height="8" rx="1" fill="#ff7900"/>
                <rect x="72" y="48" width="8" height="8" rx="1" fill="#ff7900"/>
                <rect x="88" y="48" width="8" height="8" rx="1" fill="#ff7900"/>
                <rect x="16" y="64" width="8" height="8" rx="1" fill="#ff7900"/>
                <rect x="48" y="64" width="8" height="8" rx="1" fill="#ff7900"/>
                <rect x="80" y="64" width="8" height="8" rx="1" fill="#ff7900"/>
                <rect x="104" y="64" width="8" height="8" rx="1" fill="#ff7900"/>
                <rect x="0" y="80" width="8" height="8" rx="1" fill="#ff7900"/>
                <rect x="24" y="80" width="8" height="8" rx="1" fill="#ff7900"/>
                <rect x="56" y="80" width="8" height="8" rx="1" fill="#ff7900"/>
                <rect x="96" y="80" width="8" height="8" rx="1" fill="#ff7900"/>
                <rect x="8" y="96" width="8" height="8" rx="1" fill="#ff7900"/>
                <rect x="40" y="96" width="8" height="8" rx="1" fill="#ff7900"/>
                <rect x="64" y="96" width="8" height="8" rx="1" fill="#ff7900"/>
                <rect x="88" y="96" width="8" height="8" rx="1" fill="#ff7900"/>
                <rect x="0" y="112" width="8" height="8" rx="1" fill="#ff7900"/>
                <rect x="24" y="112" width="8" height="8" rx="1" fill="#ff7900"/>
                <rect x="48" y="112" width="8" height="8" rx="1" fill="#ff7900"/>
                <rect x="80" y="112" width="8" height="8" rx="1" fill="#ff7900"/>
                <rect x="104" y="112" width="8" height="8" rx="1" fill="#ff7900"/>
              </svg>
            </div>
            <div class="absolute bottom-10 left-[8%] w-24 h-24 opacity-[0.03] rotate-45">
              <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full">
                <rect x="0" y="0" width="6" height="6" rx="1" fill="#ff7900"/>
                <rect x="12" y="0" width="6" height="6" rx="1" fill="#ff7900"/>
                <rect x="30" y="0" width="6" height="6" rx="1" fill="#ff7900"/>
                <rect x="48" y="0" width="6" height="6" rx="1" fill="#ff7900"/>
                <rect x="64" y="0" width="6" height="6" rx="1" fill="#ff7900"/>
                <rect x="0" y="12" width="6" height="6" rx="1" fill="#ff7900"/>
                <rect x="18" y="12" width="6" height="6" rx="1" fill="#ff7900"/>
                <rect x="42" y="12" width="6" height="6" rx="1" fill="#ff7900"/>
                <rect x="60" y="12" width="6" height="6" rx="1" fill="#ff7900"/>
                <rect x="6" y="24" width="6" height="6" rx="1" fill="#ff7900"/>
                <rect x="30" y="24" width="6" height="6" rx="1" fill="#ff7900"/>
                <rect x="54" y="24" width="6" height="6" rx="1" fill="#ff7900"/>
                <rect x="72" y="24" width="6" height="6" rx="1" fill="#ff7900"/>
                <rect x="0" y="36" width="6" height="6" rx="1" fill="#ff7900"/>
                <rect x="24" y="36" width="6" height="6" rx="1" fill="#ff7900"/>
                <rect x="48" y="36" width="6" height="6" rx="1" fill="#ff7900"/>
                <rect x="66" y="36" width="6" height="6" rx="1" fill="#ff7900"/>
                <rect x="12" y="48" width="6" height="6" rx="1" fill="#ff7900"/>
                <rect x="36" y="48" width="6" height="6" rx="1" fill="#ff7900"/>
                <rect x="60" y="48" width="6" height="6" rx="1" fill="#ff7900"/>
                <rect x="0" y="60" width="6" height="6" rx="1" fill="#ff7900"/>
                <rect x="18" y="60" width="6" height="6" rx="1" fill="#ff7900"/>
                <rect x="42" y="60" width="6" height="6" rx="1" fill="#ff7900"/>
                <rect x="72" y="60" width="6" height="6" rx="1" fill="#ff7900"/>
                <rect x="6" y="72" width="6" height="6" rx="1" fill="#ff7900"/>
                <rect x="30" y="72" width="6" height="6" rx="1" fill="#ff7900"/>
                <rect x="54" y="72" width="6" height="6" rx="1" fill="#ff7900"/>
                <rect x="70" y="72" width="6" height="6" rx="1" fill="#ff7900"/>
              </svg>
            </div>
          </div>

          <!-- Ambient glow -->
          <div class="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-orange-500/5 rounded-full blur-[120px] pointer-events-none" aria-hidden="true"></div>

          <div class="relative max-w-6xl mx-auto px-6 text-center">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-orange-200 bg-orange-50 text-orange-500 text-[10px] font-black uppercase tracking-[0.2em] mb-6">
              <span class="material-symbols-outlined notranslate text-[14px]">contact_mail</span>
              Contacto
            </div>
            <h1 class="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[0.95] mb-5">
              Estamos aquí para <span class="text-orange-500">ayudarle</span>
            </h1>
            <p class="text-slate-500 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
              ¿Tiene dudas, comentarios o necesita asistencia? Envíenos un mensaje y le responderemos a la brevedad.
            </p>
          </div>
        </div>

        <!-- Content -->
        <div class="max-w-5xl mx-auto px-6 pb-32">

          <!-- Success Message -->
          <div v-if="sent" class="max-w-lg mx-auto text-center">
            <div class="p-10 rounded-3xl border border-emerald-200 bg-emerald-50/80">
              <div class="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-5 shadow-sm">
                <span class="material-symbols-outlined notranslate text-[32px]">check</span>
              </div>
              <h2 class="text-2xl font-black text-emerald-900 mb-3">Mensaje enviado</h2>
              <p class="text-emerald-700/70 text-sm leading-relaxed">
                Hemos recibido su mensaje y lo estamos revisando. Le responderemos a la brevedad posible a
                <strong class="text-emerald-800 font-semibold">{{ email }}</strong>.
              </p>
              <button @click="sent = false; name = ''; email = ''; phone = ''; message = ''"
                class="mt-7 inline-flex items-center gap-2 px-6 py-2.5 rounded-xl border border-emerald-200 text-emerald-700 text-sm font-semibold hover:bg-emerald-100 hover:text-emerald-800 transition-all cursor-pointer">
                <span class="material-symbols-outlined notranslate text-[16px]">edit</span>
                Enviar otro mensaje
              </button>
            </div>
          </div>

          <!-- Form + Sidebar -->
          <div v-else class="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-10 lg:gap-14 items-start">

            <!-- Form Column -->
            <div>
              <div class="mb-2">
                <h2 class="text-base font-bold text-slate-900">Formulario de contacto</h2>
                <p class="text-xs text-slate-400 mt-0.5">Todos los campos marcados con * son obligatorios</p>
              </div>

              <form @submit.prevent="handleSubmit" class="mt-6 space-y-5">

                <!-- Autocomplete -->
                <button v-if="userStore.getFullName"
                  type="button"
                  @click="autoComplete"
                  class="group inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-orange-200 bg-orange-50/50 text-orange-600 text-[11px] font-semibold tracking-wide hover:bg-orange-100 hover:text-orange-700 transition-all cursor-pointer">
                  <span class="material-symbols-outlined notranslate text-[15px] group-hover:scale-110 transition-transform">bolt</span>
                  Autocompletar datos
                </button>

                <!-- Name & Email -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500 ml-1 mb-1.5 block">Nombre *</label>
                    <input v-model="name" type="text" placeholder="Ej. Juan Pérez"
                      class="w-full h-12 px-4 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm placeholder:text-slate-400 outline-none transition-all duration-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/15 focus:bg-orange-50/30 shadow-sm" />
                  </div>
                  <div>
                    <label class="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500 ml-1 mb-1.5 block">Correo electrónico *</label>
                    <input v-model="email" type="email" placeholder="ejemplo@correo.com"
                      class="w-full h-12 px-4 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm placeholder:text-slate-400 outline-none transition-all duration-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/15 focus:bg-orange-50/30 shadow-sm" />
                  </div>
                </div>

                <!-- Phone -->
                <div>
                  <label class="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500 ml-1 mb-1.5 block">Teléfono <span class="text-slate-400 font-normal normal-case tracking-normal">(opcional)</span></label>
                  <input v-model="phone" type="tel" placeholder="Ej. 5512345678"
                    class="w-full h-12 px-4 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm placeholder:text-slate-400 outline-none transition-all duration-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/15 focus:bg-orange-50/30 shadow-sm" />
                </div>

                <!-- Message -->
                <div>
                  <label class="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500 ml-1 mb-1.5 block">Mensaje *</label>
                  <textarea v-model="message" rows="5" placeholder="Escriba su mensaje aquí..."
                    class="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm placeholder:text-slate-400 outline-none transition-all duration-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/15 focus:bg-orange-50/30 shadow-sm resize-none"></textarea>
                </div>

                <!-- Submit -->
                <div class="flex items-center justify-end pt-1">
                  <button type="submit" :disabled="isSubmitting"
                    class="inline-flex items-center gap-2.5 h-12 px-7 rounded-xl bg-orange-500 text-white font-bold text-sm uppercase tracking-[0.08em] hover:bg-orange-400 active:bg-orange-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 cursor-pointer">
                    <span v-if="isSubmitting" class="flex items-center gap-2.5">
                      <span class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      Enviando...
                    </span>
                    <span v-else class="flex items-center gap-2.5">
                      Enviar mensaje
                      <span class="material-symbols-outlined notranslate text-[18px]">arrow_forward</span>
                    </span>
                  </button>
                </div>
              </form>
            </div>

            <!-- Sidebar -->
            <div class="space-y-6 lg:sticky lg:top-28">
              <!-- Contact Info Card -->
              <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 class="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 mb-5">Información de contacto</h3>
                <div class="space-y-4">
                  <div class="flex items-start gap-3.5">
                    <div class="w-9 h-9 rounded-lg bg-orange-50 text-orange-500 flex items-center justify-center shrink-0">
                      <span class="material-symbols-outlined notranslate text-[18px]">mail</span>
                    </div>
                    <div class="min-w-0">
                      <p class="text-[9px] font-bold uppercase tracking-[0.15em] text-slate-400 mb-0.5">Correo</p>
                      <p class="text-sm text-slate-900 font-semibold truncate">soporte@ubiqueme.com</p>
                    </div>
                  </div>
                  <div class="w-full h-px bg-slate-100"></div>
                  <div class="flex items-start gap-3.5">
                    <div class="w-9 h-9 rounded-lg bg-orange-50 text-orange-500 flex items-center justify-center shrink-0">
                      <span class="material-symbols-outlined notranslate text-[18px]">schedule</span>
                    </div>
                    <div>
                      <p class="text-[9px] font-bold uppercase tracking-[0.15em] text-slate-400 mb-0.5">Horario</p>
                      <p class="text-sm text-slate-900 font-semibold">Lun - Vie, 9:00 - 18:00</p>
                    </div>
                  </div>
                  <div class="w-full h-px bg-slate-100"></div>
                  <div class="flex items-start gap-3.5">
                    <div class="w-9 h-9 rounded-lg bg-orange-50 text-orange-500 flex items-center justify-center shrink-0">
                      <span class="material-symbols-outlined notranslate text-[18px]">bolt</span>
                    </div>
                    <div>
                      <p class="text-[9px] font-bold uppercase tracking-[0.15em] text-slate-400 mb-0.5">Tiempo de respuesta</p>
                      <p class="text-sm text-slate-900 font-semibold">24 - 48 hrs hábiles</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- QR Code Motif -->
              <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm text-center">
                <div class="w-20 h-20 mx-auto mb-3">
                  <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full">
                    <rect x="0" y="0" width="8" height="8" rx="1" fill="#ff7900" fill-opacity="0.9"/>
                    <rect x="12" y="0" width="8" height="8" rx="1" fill="#ff7900" fill-opacity="0.9"/>
                    <rect x="24" y="0" width="8" height="8" rx="1" fill="#ff7900" fill-opacity="0.9"/>
                    <rect x="48" y="0" width="8" height="8" rx="1" fill="#ff7900" fill-opacity="0.3"/>
                    <rect x="60" y="0" width="8" height="8" rx="1" fill="#ff7900" fill-opacity="0.9"/>
                    <rect x="72" y="0" width="8" height="8" rx="1" fill="#ff7900" fill-opacity="0.9"/>
                    <rect x="0" y="12" width="8" height="8" rx="1" fill="#ff7900" fill-opacity="0.9"/>
                    <rect x="24" y="12" width="8" height="8" rx="1" fill="#ff7900" fill-opacity="0.3"/>
                    <rect x="36" y="12" width="8" height="8" rx="1" fill="#ff7900" fill-opacity="0.9"/>
                    <rect x="48" y="12" width="8" height="8" rx="1" fill="#ff7900" fill-opacity="0.9"/>
                    <rect x="60" y="12" width="8" height="8" rx="1" fill="#ff7900" fill-opacity="0.3"/>
                    <rect x="72" y="12" width="8" height="8" rx="1" fill="#ff7900" fill-opacity="0.9"/>
                    <rect x="0" y="24" width="8" height="8" rx="1" fill="#ff7900" fill-opacity="0.9"/>
                    <rect x="12" y="24" width="8" height="8" rx="1" fill="#ff7900" fill-opacity="0.3"/>
                    <rect x="24" y="24" width="8" height="8" rx="1" fill="#ff7900" fill-opacity="0.9"/>
                    <rect x="36" y="24" width="8" height="8" rx="1" fill="#ff7900" fill-opacity="0.3"/>
                    <rect x="60" y="24" width="8" height="8" rx="1" fill="#ff7900" fill-opacity="0.9"/>
                    <rect x="72" y="24" width="8" height="8" rx="1" fill="#ff7900" fill-opacity="0.3"/>
                    <rect x="0" y="36" width="8" height="8" rx="1" fill="#ff7900" fill-opacity="0.9"/>
                    <rect x="12" y="36" width="8" height="8" rx="1" fill="#ff7900" fill-opacity="0.9"/>
                    <rect x="36" y="36" width="8" height="8" rx="1" fill="#ff7900" fill-opacity="0.9"/>
                    <rect x="48" y="36" width="8" height="8" rx="1" fill="#ff7900" fill-opacity="0.3"/>
                    <rect x="60" y="36" width="8" height="8" rx="1" fill="#ff7900" fill-opacity="0.9"/>
                    <rect x="72" y="36" width="8" height="8" rx="1" fill="#ff7900" fill-opacity="0.9"/>
                    <rect x="12" y="48" width="8" height="8" rx="1" fill="#ff7900" fill-opacity="0.9"/>
                    <rect x="24" y="48" width="8" height="8" rx="1" fill="#ff7900" fill-opacity="0.9"/>
                    <rect x="36" y="48" width="8" height="8" rx="1" fill="#ff7900" fill-opacity="0.3"/>
                    <rect x="48" y="48" width="8" height="8" rx="1" fill="#ff7900" fill-opacity="0.9"/>
                    <rect x="60" y="48" width="8" height="8" rx="1" fill="#ff7900" fill-opacity="0.3"/>
                    <rect x="72" y="48" width="8" height="8" rx="1" fill="#ff7900" fill-opacity="0.9"/>
                    <rect x="0" y="60" width="8" height="8" rx="1" fill="#ff7900" fill-opacity="0.9"/>
                    <rect x="12" y="60" width="8" height="8" rx="1" fill="#ff7900" fill-opacity="0.3"/>
                    <rect x="36" y="60" width="8" height="8" rx="1" fill="#ff7900" fill-opacity="0.9"/>
                    <rect x="48" y="60" width="8" height="8" rx="1" fill="#ff7900" fill-opacity="0.9"/>
                    <rect x="60" y="60" width="8" height="8" rx="1" fill="#ff7900" fill-opacity="0.9"/>
                    <rect x="72" y="60" width="8" height="8" rx="1" fill="#ff7900" fill-opacity="0.3"/>
                    <rect x="0" y="72" width="8" height="8" rx="1" fill="#ff7900" fill-opacity="0.9"/>
                    <rect x="12" y="72" width="8" height="8" rx="1" fill="#ff7900" fill-opacity="0.9"/>
                    <rect x="24" y="72" width="8" height="8" rx="1" fill="#ff7900" fill-opacity="0.3"/>
                    <rect x="36" y="72" width="8" height="8" rx="1" fill="#ff7900" fill-opacity="0.9"/>
                    <rect x="48" y="72" width="8" height="8" rx="1" fill="#ff7900" fill-opacity="0.3"/>
                    <rect x="60" y="72" width="8" height="8" rx="1" fill="#ff7900" fill-opacity="0.9"/>
                  </svg>
                </div>
                <p class="text-[9px] font-medium uppercase tracking-[0.2em] text-slate-400">Escanee para contacto rápido</p>
              </div>
            </div>

          </div>
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
