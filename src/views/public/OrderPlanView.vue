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
    price: '$499 MXN',
    icon: 'shield',
    color: '#ffffff',
    description: 'Esencial para protección individual y doméstica.',
    features: [
      { t: 'Capacidad', v: 'Hasta 1 QR', d: 'Límite de códigos activos vinculados.', i: 'inventory_2', c: '#ffffff' },
      { t: 'Métricas', v: 'Contador Escaneos', d: 'Estadísticas básicas de acceso.', i: 'analytics', c: '#ffffff' },
      { t: 'Privacidad', v: 'Registro Básico', d: 'Protocolo estándar de protección.', i: 'vpn_lock', c: '#ffffff' }
    ]
  },
  {
    id: 'plata',
    name: 'Plata',
    price: '$999 MXN',
    icon: 'verified_user',
    color: '#7bd0ff',
    description: 'Seguridad profesional con alertas y logs avanzados.',
    features: [
      { t: 'Capacidad', v: 'Hasta 3 QRs', d: 'Límite de códigos activos vinculados.', i: 'inventory_2', c: '#7bd0ff' },
      { t: 'Historial', v: '30 Días de Log', d: 'Registro detallado de actividad.', i: 'history', c: '#7bd0ff' },
      { t: 'Evidencia', v: 'Foto del escaneo', d: 'Se permite al usuario subir una foto al momento de reportar el QR.', i: 'photo_camera', c: '#7bd0ff' },
      { t: 'Alertas', v: 'Email Instantáneo', d: 'Notificaciones en tiempo real.', i: 'notifications_active', c: '#7bd0ff' }
    ]
  },
  {
    id: 'oro',
    name: 'Oro',
    price: '$1499 MXN',
    icon: 'military_tech',
    color: '#ffd264',
    description: 'Control absoluto con todas las características de protección avanzada y soporte prioritario.',
    features: [
      { t: 'Capacidad', v: 'Hasta 5 QRs', d: 'Límite de códigos activos vinculados.', i: 'inventory_2', c: '#ffd264' },
      { t: 'Tracking', v: 'Mapa / ScanLoc', d: 'Rastreo geográfico interactivo.', i: 'map', c: '#ffd264' },
      { t: 'Soporte', v: 'Prioritario', d: 'Atención técnica especializada y prioritaria.', i: 'support_agent', c: '#ffd264' },
      { t: 'Logs', v: 'Historial Ilimitado', d: 'Almacenamiento sin caducidad.', i: 'database', c: '#ffd264' }
    ]
  }
]

const currentPlanFeatures = computed(() => {
  const plan = plans.find(p => p.id.toLowerCase() === selectedPlan.value.toLowerCase())
  return plan ? plan.features : []
})

const inheritedFeatures = computed(() => {
  const currentPlanId = selectedPlan.value.toLowerCase()
  if (currentPlanId === 'bronce') return []
  if (currentPlanId === 'plata') return plans[0]?.features || []
  if (currentPlanId === 'oro') return [...(plans[0]?.features || []), ...(plans[1]?.features || [])]
  return []
})

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
      <main class="relative min-h-screen bg-[#050505] pt-12 pb-24 overflow-hidden font-geist text-white">

        <!-- Vercel-style Background Halo -->
        <div class="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[1000px] pointer-events-none">
          <div class="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-primary/5 rounded-full ">
          </div>
          <div class="absolute top-[20%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 rounded-full"></div>
        </div>

        <div class="relative z-10 max-w-6xl mx-auto px-6">

          <!-- Minimal Header (Vercel Style) -->
          <div class="mb-20 space-y-6 pt-12">
            <button @click="router.back()"
              class="inline-flex items-center gap-2 text-white/30 hover:text-white transition-all text-[10px] font-medium tracking-widest group">
              <span
                class="material-symbols-outlined text-[14px] transition-transform group-hover:-translate-x-1">west</span>
              ATRÁS
            </button>
            <div class="space-y-2">
              <h1 class="text-5xl md:text-6xl font-medium tracking-tight leading-none text-white">
                Seleccione su <span
                  class="bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">Plan</span>
              </h1>
              <p class="text-lg text-white/40 font-light max-w-2xl">
                Selecciona la infraestructura de protección que mejor se adapte a tus QRs. Escalable en cualquier
                momento.
              </p>
            </div>
          </div>

          <div v-if="!isSuccess" class="space-y-16">

            <!-- Plan Cards (Claude Style) -->
            <section class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <button v-for="plan in plans" :key="plan.id" type="button" @click="selectedPlan = plan.id" :class="[
                'relative group text-left rounded-[2rem] border transition-all duration-500 overflow-hidden outline-none',
                selectedPlan === plan.id
                  ? 'bg-black border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.5)]'
                  : 'bg-black/20 opacity-40 border-white/5 hover:border-white/10 hover:opacity-100'
              ]">

                <div class="p-8 h-full flex flex-col gap-8">
                  <div class="flex items-center justify-between">
                    <div
                      class="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center transition-transform group-hover:scale-110">
                      <span class="material-symbols-outlined text-2xl" :style="{ color: plan.color }">{{ plan.icon
                        }}</span>
                    </div>
                    <div v-if="selectedPlan === plan.id"
                      class="px-3 py-1 bg-white/10 rounded-full text-[9px] font-black uppercase tracking-widest text-primary border border-primary/20">
                      Seleccionado</div>
                  </div>

                  <div class="space-y-1.5">
                    <h3 class="text-xl font-medium tracking-tight text-white">{{ plan.name }}</h3>
                    <p class="text-xs text-white/40 leading-relaxed font-light">{{ plan.description }}</p>
                  </div>

                  <div class="mt-auto pt-6 border-t border-white/5 flex items-baseline gap-2">
                    <span class="text-3xl font-medium tracking-tighter"
                      :style="{ color: selectedPlan === plan.id ? plan.color : 'white' }">{{ plan.price }}</span>
                    <span class="text-[10px] font-medium text-white/20 uppercase tracking-widest leading-none">/
                      Licencia</span>
                  </div>
                </div>

                <!-- Gradient Border Highlight -->
                <div v-if="selectedPlan === plan.id"
                  class="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50">
                </div>
              </button>
            </section>

            <!-- Horizontal Benefits Panel (Vercel Style) -->
            <section class="relative">
              <!-- Label -->
              <div class="flex items-center gap-4 mb-8">
                <span
                  class="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] whitespace-nowrap">BENEFICIOS
                  PREMIUM</span>
                <div class="h-px w-full bg-white/5"></div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div v-for="feat in currentPlanFeatures" :key="feat.t"
                  class="group flex flex-col gap-4 p-6 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all hover:-translate-y-1 relative overflow-hidden">

                  <div
                    class="absolute -right-4 -top-4 w-20 h-20 bg-primary/5  rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  </div>

                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                      <span class="material-symbols-outlined text-[16px]" :style="{ color: feat.c }">{{ feat.i }}</span>
                    </div>
                    <span class="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">{{ feat.t }}</span>
                  </div>

                  <div class="space-y-1">
                    <h4 class="text-sm font-medium tracking-tight text-white">{{ feat.v }}</h4>
                    <p class="text-[10px] text-white/30 font-light leading-relaxed">{{ feat.d }}</p>
                  </div>
                </div>
              </div>

              <!-- Inherited Benefits (Subtle) -->
              <div v-if="inheritedFeatures.length > 0" class="mt-8 flex flex-wrap gap-3">
                <div v-for="feat in inheritedFeatures" :key="feat.t"
                  class="px-4 py-2 bg-white/[0.01] border border-white/5 rounded-full flex items-center gap-2">
                  <span class="material-symbols-outlined text-[10px] text-white/20">check</span>
                  <span class="text-[10px] text-white/40 font-medium uppercase tracking-widest">{{ feat.t }}: {{ feat.v
                    }}</span>
                </div>
              </div>
            </section>

            <!-- Shipping Info Note -->
            <div class="p-6 rounded-3xl border border-primary/20 bg-primary/5 flex items-start gap-4">
              <span class="material-symbols-outlined text-primary text-2xl shrink-0 mt-1">local_shipping</span>
              <div class="space-y-1">
                <h4 class="text-sm font-bold text-white uppercase tracking-wider">Políticas de Envío (Sólo dentro de México)</h4>
                <p class="text-xs text-white/70 leading-relaxed">
                  Cada suscripción incluye <strong class="text-primary">1 envío gratis</strong>. Te recomendamos solicitar todos tus códigos QR del plan en el primer envío. 
                  Si realizas solicitudes posteriores, las etiquetas QR siguen siendo gratuitas, pero se cobrará el costo de envío de <strong class="text-primary">$199 MXN</strong> por paquete.
                </p>
              </div>
            </div>

            <!-- Combined Footer Action (Google Style) -->
            <div class="pt-12 border-t border-white/5">
              <form @submit.prevent="handleSubmit"
                class="flex flex-col lg:flex-row items-center justify-between gap-12 max-w-5xl mx-auto">

                <div class="flex flex-col md:flex-row items-center gap-4 flex-1 w-full">
                  <div class="flex-1 w-full space-y-1.5">
                    <label class="text-[10px] font-medium text-white/30 uppercase tracking-widest ml-1">TELÉFONO
                      WHATSAPP</label>
                    <input v-model="formData.phone" required type="tel" placeholder="+52 555 555 5555"
                      class="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-white/10 font-light" />
                  </div>
                  <div class="flex-1 w-full space-y-1.5 opacity-50">
                    <label class="text-[10px] font-medium text-white/30 uppercase tracking-widest ml-1">USUARIO
                      ACTUAL</label>
                    <div
                      class="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 text-sm text-white/60 font-light truncate">
                      {{ formData.fullName }} ({{ formData.email }})
                    </div>
                  </div>
                </div>

                <div class="flex flex-col items-center gap-4 min-w-[280px]">
                  <button type="submit" :disabled="isSubmitting"
                    class="w-full h-16 bg-white text-black font-medium tracking-tight text-sm rounded-2xl overflow-hidden hover:bg-white/90 active:scale-[0.98] transition-all flex items-center justify-center gap-3">
                    <span v-if="isSubmitting"
                      class="w-5 h-5 border-2 border-black/20 border-t-black rounded-full "></span>
                    <span v-else>Confirmar Plan {{ selectedPlan }}</span>
                    <span v-if="!isSubmitting" class="material-symbols-outlined text-sm">arrow_forward</span>
                  </button>
                  <p class="text-[9px] text-white/20 font-light uppercase tracking-[0.3em]">REDIRECCIÓN A PAGO SEGURO
                  </p>
                </div>

              </form>
            </div>

          </div>

          <!-- SUCCESS STATE (Vercel Style) -->
          <div v-else class="max-w-xl mx-auto py-32 text-center space-y-12 ">
            <div class="relative inline-flex mb-8">
              <div class="absolute inset-0 bg-primary/20  rounded-full"></div>
              <div
                class="relative w-24 h-24 bg-[#050505] border border-white/20 rounded-[2.5rem] flex items-center justify-center shadow-2xl">
                <span class="material-symbols-outlined text-primary text-4xl font-light">verified</span>
              </div>
            </div>
            <div class="space-y-4">
              <h2 class="text-5xl font-medium tracking-tight text-white leading-tight">Configuración en Curso</h2>
              <p class="text-white/40 text-lg font-light leading-relaxed max-w-sm mx-auto">
                Tu solicitud ha sido encriptada y enviada a <span class="text-white font-medium">{{ formData.email
                  }}</span>.
              </p>
            </div>
            <div class="pt-10">
              <button @click="router.push('/')"
                class="px-10 py-4 bg-white/5 border border-white/10 text-white font-medium tracking-tight text-xs rounded-2xl hover:bg-white/10 transition-all">
                Ir al Panel Principal
              </button>
            </div>
          </div>

        </div>

      </main>
    </template>
  </HomeLayout>
</template>

<style scoped>
@import url('https://rsms.me/inter/inter.css');

.font-geist {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

.material-symbols-outlined {
  font-variation-settings: 'FILL' 1, 'wght' 300, 'GRAD' 0, 'opsz' 20;
}

.animate-in {
  animation-duration: 0.8s;
  animation-fill-mode: both;
}

@keyframes fade-in {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

@keyframes zoom-in {
  from {
    transform: scale(0.95);
    opacity: 0;
  }

  to {
    transform: scale(1);
    opacity: 1;
  }
}

/* Scrollbar Hide */
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

input::placeholder {
  font-weight: 300;
  opacity: 0.2;
}
</style>
