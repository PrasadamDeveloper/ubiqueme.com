<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import HomeLayout from '@/layouts/HomeLayout.vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const selectedPlan = ref(route.params.planId as string || 'plata')
const isSubmitting = ref(false)
const isSuccess = ref(false)

const formData = ref({
  fullName: userStore.getFullName || '',
  email: userStore.getEmail || 'No registrado',
  phone: '',
  specialNotes: '',
  firebaseUid: userStore.getUserId || ''
})

const plans = [
  {
    id: 'bronce',
    name: 'Bronce',
    price: '$499',
    period: '/año',
    icon: 'shield',
    description: 'Protección básica esencial para comenzar.',
    cta: 'Seleccionar Bronce',
    features: [
      { label: '1 código QR activo', included: true },
      { label: 'Contador de escaneos básico', included: true },
      { label: 'Mensajes predefinidos', included: true },
      { label: 'Pausar o reactivar QR', included: false },
      { label: 'Historial de escaneos', included: false },
      { label: 'Ubicación con mapa', included: false },
      { label: 'Evidencia fotográfica', included: false },
      { label: 'Notificaciones por correo', included: false }
    ]
  },
  {
    id: 'plata',
    name: 'Plata',
    price: '$999',
    period: '/año',
    icon: 'verified_user',
    description: 'La opción más equilibrada con monitoreo avanzado.',
    featured: true,
    cta: 'Seleccionar Plata',
    features: [
      { label: '3 códigos QR activos', included: true },
      { label: 'Contador de escaneos en tiempo real', included: true },
      { label: '3 regeneraciones digitales', included: true },
      { label: 'Pausar o reactivar QR', included: true },
      { label: 'Historial de escaneos (30 días)', included: true },
      { label: 'Ubicación aproximada', included: true },
      { label: 'Evidencia fotográfica', included: true },
      { label: 'Notificaciones por correo', included: true }
    ]
  },
  {
    id: 'oro',
    name: 'Oro',
    price: '$1,499',
    period: '/año',
    icon: 'military_tech',
    description: 'Control total con todas las funciones premium.',
    cta: 'Seleccionar Oro',
    features: [
      { label: '5 códigos QR activos', included: true },
      { label: 'Mapa dinámico de ubicación', included: true },
      { label: 'Ubicación aproximada', included: true },
      { label: '5 regeneraciones digitales', included: true },
      { label: 'Mensajes personalizados', included: true },
      { label: 'Pausar o reactivar QR', included: true },
      { label: 'Historial ilimitado', included: true },
      { label: 'Evidencia fotográfica', included: true },
      { label: 'Notificaciones prioritarias', included: true }
    ]
  }
]

const currentPlan = computed(() => plans.find(p => p.id === selectedPlan.value))

const handleSubmit = async () => {
  isSubmitting.value = true
  await new Promise(resolve => setTimeout(resolve, 2000))
  isSubmitting.value = false
  isSuccess.value = true
}

</script>

<template>
  <HomeLayout>
    <template #main>
      <div class="relative min-h-screen bg-[#0a0a0b] font-google-sans overflow-hidden">

        <!-- Grid overlay -->
        <div class="absolute inset-0 opacity-[0.03] pointer-events-none"
          style="background-image: linear-gradient(rgba(255,255,255,.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.4) 1px, transparent 1px); background-size: 48px 48px;">
        </div>

        <!-- Radial glow -->
        <div
          class="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[#ff7900]/5 rounded-full blur-[120px] pointer-events-none">
        </div>

        <div class="relative z-10 pt-24 pb-20 px-4 sm:px-6">
          <div class="max-w-5xl mx-auto">

            <!-- Back + Header -->
            <div class="mb-14 space-y-6">
              <button @click="router.back()"
                class="inline-flex items-center gap-1.5 text-white/30 hover:text-white transition-colors text-[10px] font-black uppercase tracking-[0.25em] cursor-pointer">
                <span class="material-symbols-outlined text-[14px]">arrow_back</span>
                Volver
              </button>
              <div>
                <div
                  class="inline-flex items-center gap-2 px-3 py-1 bg-[#ff7900]/10 rounded-full border border-[#ff7900]/20 mb-4">
                  <span class="w-1.5 h-1.5 rounded-full bg-[#ff7900]"></span>
                  <span class="text-[9px] font-black uppercase tracking-[0.3em] text-[#ff7900]">Contratación</span>
                </div>
                <h1 class="text-4xl md:text-5xl font-black text-white tracking-tight leading-[1.1]">
                  Complete su <span class="text-[#ff7900]">suscripción</span>
                </h1>
                <p class="text-white/40 text-sm md:text-base mt-3 max-w-xl">
                  Revise los detalles del plan elegido y proporcione sus datos para continuar con el proceso.
                </p>
              </div>
            </div>

            <div v-if="!isSuccess" class="space-y-14">

              <!-- Plan selector row -->
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button v-for="plan in plans" :key="plan.id" @click="selectedPlan = plan.id"
                  class="relative p-5 rounded-2xl border text-left transition-all duration-300 cursor-pointer" :class="selectedPlan === plan.id
                    ? 'border-[#ff7900]/40 bg-[#ff7900]/[0.04] shadow-[0_0_30px_rgba(255,121,0,0.04)]'
                    : 'border-white/[0.06] bg-[#0d0d0e] hover:border-white/[0.15]'">

                  <div v-if="plan.featured"
                    class="absolute -top-2.5 right-4 px-3 py-0.5 rounded-full text-[8px] font-black uppercase tracking-[0.25em] bg-[#ff7900] text-black">
                    Más popular
                  </div>

                  <div class="flex items-start justify-between mb-3">
                    <div>
                      <p class="text-[9px] font-black uppercase tracking-[0.25em] text-white/30 mb-0.5">Plan</p>
                      <h3 class="text-xl font-black text-white">{{ plan.name }}</h3>
                    </div>
                    <span class="material-symbols-outlined text-xl"
                      :class="selectedPlan === plan.id ? 'text-[#ff7900]' : 'text-white/30'">
                      {{ plan.icon }}
                    </span>
                  </div>

                  <div class="flex items-baseline gap-1 mb-1">
                    <span class="text-2xl font-black text-white">{{ plan.price }}</span>
                    <span class="text-white/20 text-[9px] font-black uppercase">{{ plan.period }}</span>
                  </div>
                  <p class="text-white/40 text-[11px]">{{ plan.description }}</p>

                  <div v-if="selectedPlan === plan.id"
                    class="absolute bottom-0 left-4 right-4 h-[2px] bg-gradient-to-r from-transparent via-[#ff7900]/50 to-transparent rounded-full">
                  </div>
                </button>
              </div>

              <!-- Plan comparison - visual benefits -->
              <div v-if="currentPlan">
                <div class="flex items-center gap-4 mb-6">
                  <span class="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] whitespace-nowrap">Lo que
                    incluye</span>
                  <div class="h-px w-full bg-white/[0.04]"></div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div v-for="feature in currentPlan.features" :key="feature.label"
                    class="flex items-center gap-3 p-4 rounded-xl border"
                    :class="feature.included ? 'border-white/[0.06] bg-white/[0.02]' : 'border-white/[0.03] bg-white/[0.01] opacity-40'">
                    <div class="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                      :class="feature.included ? 'bg-[#ff7900]/10 text-[#ff7900]' : 'bg-white/[0.03] text-white/20'">
                      <span class="material-symbols-outlined text-[14px] font-black">{{ feature.included ? 'check' :
                        'close' }}</span>
                    </div>
                    <span class="text-sm font-medium"
                      :class="feature.included ? 'text-white/80' : 'text-white/20 line-through'">
                      {{ feature.label }}
                    </span>
                  </div>
                </div>

                <!-- Inherited benefits note -->
                <div v-if="selectedPlan === 'plata' || selectedPlan === 'oro'" class="mt-4 flex flex-wrap gap-2">
                  <div
                    v-for="(f, i) in (selectedPlan === 'plata' ? (plans[0]?.features ?? []) : [...(plans[0]?.features ?? []), ...(plans[1]?.features ?? [])])"
                    :key="(f?.label ?? '') + i"
                    class="px-3 py-1.5 rounded-lg border border-white/[0.04] bg-white/[0.01] flex items-center gap-1.5">
                    <span class="material-symbols-outlined text-[10px] text-white/20">add</span>
                    <span class="text-[10px] text-white/30 font-medium">{{ f?.label }}</span>
                  </div>
                </div>
              </div>

              <!-- Shipping info -->
              <div class="relative p-5 rounded-2xl border border-[#ff7900]/10 bg-[#ff7900]/[0.02] overflow-hidden">
                <div class="absolute inset-0 opacity-[0.02] pointer-events-none"
                  style="background-image: linear-gradient(rgba(255,121,0,.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,121,0,.3) 1px, transparent 1px); background-size: 20px 20px;">
                </div>
                <div class="relative z-10 flex items-start gap-3">
                  <span class="material-symbols-outlined text-[#ff7900] text-xl shrink-0 mt-0.5">local_shipping</span>
                  <div class="space-y-1">
                    <h4 class="text-xs font-bold text-white uppercase tracking-wider">Envío físico — Solo México</h4>
                    <p class="text-[12px] text-white/50 leading-relaxed">
                      Cada suscripción incluye <strong class="text-[#ff7900]">1 envío gratis</strong>. Le recomendamos
                      solicitar todos los códigos QR de su plan en el primer envío. Solicitudes posteriores tienen un
                      costo de <strong class="text-white">$199 MXN</strong> por paquete.
                    </p>
                  </div>
                </div>
              </div>

              <!-- Form -->
              <div class="border-t border-white/[0.04] pt-10">
                <form @submit.prevent="handleSubmit" class="space-y-8 max-w-3xl mx-auto">

                  <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div class="space-y-1.5">
                      <label class="text-[9px] font-black uppercase tracking-[0.25em] text-white/30">Nombre
                        completo</label>
                      <input v-model="formData.fullName" readonly
                        class="w-full h-12 px-4 rounded-xl border border-white/[0.06] bg-white/[0.02] text-white/60 text-sm outline-none cursor-not-allowed" />
                    </div>
                    <div class="space-y-1.5">
                      <label class="text-[9px] font-black uppercase tracking-[0.25em] text-white/30">Correo
                        electrónico</label>
                      <input v-model="formData.email" readonly
                        class="w-full h-12 px-4 rounded-xl border border-white/[0.06] bg-white/[0.02] text-white/60 text-sm outline-none cursor-not-allowed" />
                    </div>
                  </div>

                  <div class="space-y-1.5">
                    <label class="text-[9px] font-black uppercase tracking-[0.25em] text-white/30">Teléfono WhatsApp
                      <span class="text-[#ff7900]">*</span></label>
                    <input v-model="formData.phone" required type="tel" placeholder="+52 555 555 5555"
                      class="w-full h-12 px-4 rounded-xl border border-white/[0.06] bg-[#0d0d0e] text-white text-sm outline-none focus:border-[#ff7900]/40 focus:ring-1 focus:ring-[#ff7900]/20 transition-all placeholder:text-white/15" />
                  </div>

                  <div class="flex flex-col sm:flex-row items-center gap-4 pt-4">
                    <button type="submit" :disabled="isSubmitting"
                      class="w-full sm:w-auto h-12 px-10 rounded-xl bg-[#ff7900] text-black font-black text-xs uppercase tracking-[0.2em] hover:bg-[#ff7900]/90 transition-all duration-300 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer">
                      <span v-if="isSubmitting"
                        class="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin"></span>
                      <span v-else>Confirmar y pagar</span>
                    </button>
                    <p class="text-[8px] text-white/20 uppercase tracking-[0.3em]">Pago seguro vía Stripe</p>
                  </div>

                </form>
              </div>

            </div>

            <!-- Success -->
            <div v-else class="max-w-lg mx-auto py-24 text-center space-y-8">
              <div
                class="w-20 h-20 rounded-2xl bg-[#ff7900]/10 border border-[#ff7900]/20 flex items-center justify-center mx-auto">
                <span class="material-symbols-outlined text-4xl text-[#ff7900]">check_circle</span>
              </div>
              <div class="space-y-3">
                <h2 class="text-3xl font-black text-white tracking-tight">Suscripción en proceso</h2>
                <p class="text-white/40 text-sm leading-relaxed max-w-xs mx-auto">
                  Hemos recibido su solicitud. Recibirá una confirmación en <strong class="text-white">{{ formData.email
                    }}</strong>.
                </p>
              </div>
              <button @click="router.push('/')"
                class="h-11 px-8 rounded-xl border border-white/[0.06] bg-[#0d0d0e] text-white/70 text-[10px] font-black uppercase tracking-[0.25em] hover:bg-white/[0.04] transition cursor-pointer">
                Ir al inicio
              </button>
            </div>

          </div>
        </div>
      </div>
    </template>
  </HomeLayout>
</template>

<style scoped>
.font-google-sans {
  font-family: 'Google Sans', 'Inter', sans-serif;
}

.material-symbols-outlined {
  font-variation-settings: 'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 24;
}
</style>
