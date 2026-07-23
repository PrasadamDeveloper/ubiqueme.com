<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import HomeLayout from '@/layouts/HomeLayout.vue'
import { toast } from 'vue-sonner'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const selectedPlan = ref(route.params.planId as string || 'plata')

onMounted(() => {
  if (!userStore.isAuthenticated) {
    const planId = route.params.planId || 'plata'
    router.replace({ name: 'login', query: { redirect: `/checkout/${planId}` } })
  }
})
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

const WORKER_URL = import.meta.env.VITE_WORKER_URL || 'http://localhost:8787'

const handleSubmit = async () => {
  isSubmitting.value = true
  try {
    const res = await fetch(`${WORKER_URL}/api/purchase-request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        plan: selectedPlan.value,
        fullName: formData.value.fullName,
        email: formData.value.email,
        phone: formData.value.phone,
        firebaseUid: formData.value.firebaseUid,
        notes: formData.value.specialNotes,
      }),
    })
    if (!res.ok) throw new Error('Error al enviar la solicitud')
    toast.success('Solicitud enviada correctamente')
    isSuccess.value = true
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Error de conexión'
    toast.error(msg)
  } finally {
    isSubmitting.value = false
  }
}

</script>

<template>
  <HomeLayout>
    <template #main>
      <div class="relative min-h-screen bg-gradient-to-b from-white to-slate-50 font-google-sans overflow-hidden">

        <!-- Grid overlay -->
        <div class="absolute inset-0 opacity-[0.03] pointer-events-none"
          style="background-image: linear-gradient(rgba(0,0,0,.06) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,.06) 1px, transparent 1px); background-size: 48px 48px;">
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
                class="inline-flex items-center gap-1.5 text-slate-400 hover:text-slate-900 transition-colors text-[10px] font-black uppercase tracking-[0.25em] cursor-pointer">
                <span class="material-symbols-outlined notranslate text-[14px]">arrow_back</span>
                Volver
              </button>
              <div>
                <div
                  class="inline-flex items-center gap-2 px-3 py-1 bg-orange-50 rounded-full border border-orange-200 mb-4">
                  <span class="w-1.5 h-1.5 rounded-full bg-[#ff7900]"></span>
                  <span class="text-[9px] font-black uppercase tracking-[0.3em] text-orange-500">Contratación</span>
                </div>
                <h1 class="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-[1.1]">
                  Complete su <span class="text-orange-500">suscripción</span>
                </h1>
                <p class="text-slate-500 text-sm md:text-base mt-3 max-w-xl">
                  Revise los detalles del plan elegido y proporcione sus datos para continuar con el proceso.
                </p>
              </div>
            </div>

            <div v-if="!isSuccess" class="space-y-14">

              <!-- Selected plan summary card -->
              <div v-if="currentPlan"
                class="relative p-6 rounded-2xl border border-orange-200 bg-orange-50/50 shadow-sm">

                <div v-if="currentPlan.featured"
                  class="absolute -top-2.5 right-4 px-3 py-0.5 rounded-full text-[8px] font-black uppercase tracking-[0.25em] bg-[#ff7900] text-black">
                  Más popular
                </div>

                <div class="flex items-start justify-between mb-4">
                  <div>
                    <p class="text-[9px] font-black uppercase tracking-[0.25em] text-slate-400 mb-0.5">Plan seleccionado
                    </p>
                    <h3 class="text-2xl font-black text-slate-900">{{ currentPlan.name }}</h3>
                  </div>
                  <span class="material-symbols-outlined notranslate text-2xl text-orange-500">{{ currentPlan.icon }}</span>
                </div>

                <div class="flex items-baseline gap-1 mb-3">
                  <span class="text-3xl font-black text-slate-900">{{ currentPlan.price }}</span>
                  <span class="text-slate-400 text-[10px] font-black uppercase">{{ currentPlan.period }}</span>
                </div>
                <p class="text-slate-500 text-sm mb-6">{{ currentPlan.description }}</p>

                <div class="flex items-center gap-4 mb-5">
                  <span class="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] whitespace-nowrap">Lo que
                    incluye</span>
                  <div class="h-px w-full bg-slate-200"></div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div v-for="feature in currentPlan.features" :key="feature.label"
                    class="flex items-center gap-3 p-4 rounded-xl border"
                    :class="feature.included ? 'border-slate-200 bg-white shadow-sm' : 'border-slate-100 bg-slate-50 opacity-50'">
                    <div class="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                      :class="feature.included ? 'bg-orange-50 text-orange-500' : 'bg-slate-100 text-slate-300'">
                      <span class="material-symbols-outlined notranslate text-[14px] font-black">{{ feature.included ? 'check' :
                        'close' }}</span>
                    </div>
                    <span class="text-sm font-medium"
                      :class="feature.included ? 'text-slate-700' : 'text-slate-300 line-through'">
                      {{ feature.label }}
                    </span>
                  </div>
                </div>

                <!-- Inherited benefits note -->
                <div v-if="selectedPlan === 'plata' || selectedPlan === 'oro'" class="mt-4 flex flex-wrap gap-2">
                  <div
                    v-for="(f, i) in (selectedPlan === 'plata' ? (plans[0]?.features ?? []) : [...(plans[0]?.features ?? []), ...(plans[1]?.features ?? [])])"
                    :key="(f?.label ?? '') + i"
                    class="px-3 py-1.5 rounded-lg border border-slate-200 bg-white shadow-sm flex items-center gap-1.5">
                    <span class="material-symbols-outlined notranslate text-[10px] text-slate-400">add</span>
                    <span class="text-[10px] text-slate-500 font-medium">{{ f?.label }}</span>
                  </div>
                </div>
              </div>

              <!-- Shipping info -->
              <div class="relative p-5 rounded-2xl border border-orange-200 bg-orange-50 overflow-hidden">
                <div class="absolute inset-0 opacity-[0.02] pointer-events-none"
                  style="background-image: linear-gradient(rgba(234,88,12,.12) 1px, transparent 1px), linear-gradient(90deg, rgba(234,88,12,.12) 1px, transparent 1px); background-size: 20px 20px;">
                </div>
                <div class="relative z-10 flex items-start gap-3">
                  <span class="material-symbols-outlined notranslate text-orange-500 text-xl shrink-0 mt-0.5">local_shipping</span>
                  <div class="space-y-1">
                    <h4 class="text-xs font-bold text-slate-900 uppercase tracking-wider">Envío físico — Solo México</h4>
                    <p class="text-xs text-slate-500 leading-relaxed">
                      Cada suscripción incluye <strong class="text-orange-500">1 envío gratis</strong>. Le recomendamos
                      solicitar todos los códigos QR de su plan en el primer envío. Solicitudes posteriores tienen un
                      costo de <strong class="text-slate-900">$199 MXN</strong> por paquete.
                    </p>
                  </div>
                </div>
              </div>

              <!-- Form -->
              <div class="border-t border-slate-200 pt-10">
                <form @submit.prevent="handleSubmit" class="space-y-8 max-w-3xl mx-auto">

                  <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div class="space-y-1.5">
                      <label class="text-[9px] font-black uppercase tracking-[0.25em] text-slate-500">Nombre
                        completo</label>
                      <input v-model="formData.fullName" readonly
                        class="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-400 text-sm outline-none cursor-not-allowed" />
                    </div>
                    <div class="space-y-1.5">
                      <label class="text-[9px] font-black uppercase tracking-[0.25em] text-slate-500">Correo
                        electrónico</label>
                      <input v-model="formData.email" readonly
                        class="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-400 text-sm outline-none cursor-not-allowed" />
                    </div>
                  </div>

                  <div class="space-y-1.5">
                    <label class="text-[9px] font-black uppercase tracking-[0.25em] text-slate-500">Teléfono WhatsApp
                      <span class="text-orange-500">*</span></label>
                    <input v-model="formData.phone" required type="tel" placeholder="+52 555 555 5555"
                      class="w-full h-12 px-4 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/15 transition-all placeholder:text-slate-400 shadow-sm" />
                  </div>

                  <div class="flex flex-col sm:flex-row items-center gap-4 pt-4">
                    <button type="submit" :disabled="isSubmitting"
                      class="w-full sm:w-auto h-12 px-10 rounded-xl bg-[#ff7900] text-black font-black text-xs uppercase tracking-[0.2em] hover:bg-[#ff7900]/90 transition-all duration-300 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer">
                      <span v-if="isSubmitting"
                        class="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin"></span>
                      <span v-else>Confirmar</span>
                    </button>
                  </div>

                </form>
              </div>

            </div>

            <!-- Success -->
            <div v-else class="max-w-lg mx-auto py-24 text-center space-y-8">
              <div
                class="w-20 h-20 rounded-2xl bg-orange-50 border border-orange-200 flex items-center justify-center mx-auto shadow-sm">
                <span class="material-symbols-outlined notranslate text-4xl text-orange-500">check_circle</span>
              </div>
              <div class="space-y-3">
                <h2 class="text-3xl font-black text-slate-900 tracking-tight">Suscripción en proceso</h2>
                <p class="text-slate-500 text-sm leading-relaxed max-w-xs mx-auto">
                  Hemos recibido su solicitud. Recibirá una confirmación en <strong class="text-slate-900">{{ formData.email
                  }}</strong>.
                </p>
              </div>
              <button @click="router.push('/')"
                class="h-11 px-8 rounded-xl border border-slate-200 bg-white text-slate-600 text-[10px] font-black uppercase tracking-[0.25em] hover:bg-slate-50 hover:text-slate-800 shadow-sm transition cursor-pointer">
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
