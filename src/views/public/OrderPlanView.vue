<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import HomeLayout from '@/layouts/HomeLayout.vue'
import { toast } from 'vue-sonner'
import { plans } from '@/data/plans'

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

const currentPlan = computed(() => plans.find(p => p.id === selectedPlan.value))

const planIcon = (id: string) => id === 'bronce' ? 'shield' : id === 'plata' ? 'verified_user' : 'military_tech'

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
      <div class="min-h-screen bg-gradient-to-b from-white via-orange-50/20 to-white font-google-sans">
        <div class="pt-24 pb-20 px-4 sm:px-6">
          <div class="max-w-5xl mx-auto">

            <!-- Back + Header -->
            <div class="mb-10 md:mb-12">
              <button @click="router.back()"
                class="inline-flex items-center gap-1.5 text-slate-400 hover:text-slate-700 transition-colors text-[9px] font-bold uppercase tracking-[0.2em] mb-5 cursor-pointer">
                <span class="material-symbols-outlined notranslate text-[13px]">arrow_back</span>
                Volver
              </button>
              <div>
                <div
                  class="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-orange-200 bg-orange-50/70 mb-4">
                  <span class="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                  <span class="text-[8px] font-bold uppercase tracking-[0.25em] text-orange-500">Contratación</span>
                </div>
                <h1 class="text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-[1.1]">
                  Complete su <span class="text-orange-500">suscripción</span>
                </h1>
                <p class="text-slate-500 text-sm md:text-base mt-2 max-w-xl">
                  Revise los detalles del plan elegido y proporcione sus datos para continuar con el proceso.
                </p>
              </div>
            </div>

            <!-- Success State -->
            <div v-if="isSuccess" class="max-w-md mx-auto py-16 text-center">
              <div
                class="w-20 h-20 rounded-2xl bg-orange-50 border border-orange-200 flex items-center justify-center mx-auto shadow-sm">
                <span class="material-symbols-outlined notranslate text-4xl text-orange-500">check_circle</span>
              </div>
              <div class="mt-6 space-y-3">
                <h2 class="text-2xl font-black text-slate-900 tracking-tight">Suscripción en proceso</h2>
                <p class="text-sm text-slate-500 leading-relaxed">
                  Hemos recibido su solicitud. Recibirá una confirmación en <strong
                    class="text-slate-700 font-semibold">{{ formData.email }}</strong>.
                </p>
              </div>
              <button @click="router.push('/')"
                class="mt-8 h-10 px-6 rounded-lg border border-slate-200 bg-white text-slate-600 text-[9px] font-bold uppercase tracking-[0.2em] hover:bg-slate-50 hover:text-slate-800 shadow-sm transition-all cursor-pointer">
                Ir al inicio
              </button>
            </div>

            <!-- Main Content -->
            <div v-else class="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-10 lg:gap-14 items-start">

              <!-- Left Column: Plan Summary -->
              <div class="lg:sticky lg:top-28 space-y-6">

                <!-- Plan card -->
                <div v-if="currentPlan" class="relative rounded-xl border bg-white p-6"
                  :class="currentPlan.featured ? 'border-orange-200 shadow-lg shadow-orange-500/5' : 'border-slate-200 shadow-sm'">

                  <!-- Featured badge -->
                  <div v-if="currentPlan.featured"
                    class="absolute -top-[1px] left-5 right-5 h-[3px] bg-orange-500 rounded-full">
                  </div>

                  <div class="flex items-start justify-between mb-4">
                    <div>
                      <p class="text-[8px] font-bold uppercase tracking-[0.25em] text-slate-400 mb-0.5">Plan
                        seleccionado</p>
                      <h3 class="text-xl font-black text-slate-900">{{ currentPlan.name }}</h3>
                    </div>
                    <span class="material-symbols-outlined notranslate text-xl text-orange-500">{{ planIcon(currentPlan.id)
                      }}</span>
                  </div>

                  <div class="flex items-baseline gap-1.5 mb-2">
                    <span class="text-2xl font-black text-slate-900">{{ currentPlan.prices.MXN.symbol }}{{ currentPlan.prices.MXN.price }}</span>
                    <span
                      class="px-2.5 py-0.5 rounded-md bg-orange-500 text-white text-[10px] font-black uppercase tracking-[0.15em] shadow-sm shadow-orange-500/20">{{
                      currentPlan.prices.MXN.period }}</span>
                  </div>
                  <p class="text-[12px] text-slate-500 mb-5">{{ currentPlan.description }}</p>

                  <!-- Summary features -->
                  <div class="border-t border-slate-100 pt-4">
                    <p class="text-[8px] font-bold uppercase tracking-[0.25em] text-slate-400 mb-3">Lo que incluye</p>
                    <div class="space-y-2">
                      <div v-for="feature in currentPlan.features" :key="feature.label"
                        class="flex items-center gap-2.5" :class="feature.included ? '' : 'opacity-40'">
                        <div class="w-3.5 h-3.5 rounded flex items-center justify-center shrink-0"
                          :class="feature.included ? 'bg-orange-50 text-orange-500' : 'bg-slate-100 text-slate-300'">
                          <span class="material-symbols-outlined notranslate text-[8px] font-bold">{{ feature.included ?
                            'check' : 'remove' }}</span>
                        </div>
                        <span class="text-[11px]"
                          :class="feature.included ? 'text-slate-700 font-medium' : 'text-slate-400 line-through'">
                          {{ feature.label }}
                        </span>
                      </div>
                    </div>
                  </div>

                  <!-- Inherited benefits -->
                  <div v-if="selectedPlan === 'plata' || selectedPlan === 'oro'"
                    class="mt-4 pt-4 border-t border-slate-100">
                    <p class="text-[8px] font-bold uppercase tracking-[0.25em] text-slate-400 mb-2">Beneficios heredados
                    </p>
                    <div class="flex flex-wrap gap-1.5">
                      <div
                        v-for="(f, i) in (selectedPlan === 'plata' ? (plans[0]?.features ?? []).filter(f => f.included) : [...(plans[0]?.features ?? []), ...(plans[1]?.features ?? [])].filter(f => f.included))"
                        :key="(f?.label ?? '') + i"
                        class="px-2 py-1 rounded-md bg-slate-50 border border-slate-200 flex items-center gap-1">
                        <span class="material-symbols-outlined notranslate text-[8px] text-slate-400">add</span>
                        <span class="text-[9px] text-slate-500 font-medium">{{ f?.label }}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Shipping Info -->
                <div class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div class="flex items-start gap-3">
                    <div
                      class="w-8 h-8 rounded-lg bg-orange-50 text-orange-500 flex items-center justify-center shrink-0">
                      <span class="material-symbols-outlined notranslate text-[16px]">local_shipping</span>
                    </div>
                    <div>
                      <h4 class="text-[11px] font-bold text-slate-900">Envío físico — Solo México</h4>
                      <p class="text-[10px] text-slate-500 leading-relaxed mt-0.5">
                        Incluye <strong class="text-orange-600 font-semibold">1 envío gratis</strong>.
                        Solicitudes posteriores: <strong class="text-slate-700 font-semibold">$199 MXN</strong> por
                        paquete.
                      </p>
                    </div>
                  </div>
                </div>

              </div>

              <!-- Right Column: Form -->
              <div>
                <div class="rounded-xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
                  <div class="mb-6">
                    <h2 class="text-base font-bold text-slate-900">Datos de contacto</h2>
                    <p class="text-xs text-slate-400 mt-0.5">Completa la información para continuar con la suscripción
                    </p>
                  </div>

                  <form @submit.prevent="handleSubmit" class="space-y-5">

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div class="space-y-1.5">
                        <label class="text-[9px] font-bold uppercase tracking-[0.15em] text-slate-500">Nombre
                          completo</label>
                        <input v-model="formData.fullName" readonly
                          class="w-full h-11 px-3.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-400 text-sm outline-none cursor-not-allowed" />
                      </div>
                      <div class="space-y-1.5">
                        <label class="text-[9px] font-bold uppercase tracking-[0.15em] text-slate-500">Correo
                          electrónico</label>
                        <input v-model="formData.email" readonly
                          class="w-full h-11 px-3.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-400 text-sm outline-none cursor-not-allowed" />
                      </div>
                    </div>

                    <div class="space-y-1.5">
                      <label class="text-[9px] font-bold uppercase tracking-[0.15em] text-slate-500">Teléfono WhatsApp
                        <span class="text-orange-500">*</span></label>
                      <input v-model="formData.phone" required type="tel" placeholder="+52 555 555 5555"
                        class="w-full h-11 px-3.5 rounded-lg border border-slate-200 bg-white text-slate-900 text-sm outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/15 shadow-sm" />
                    </div>

                    <div class="space-y-1.5">
                      <label class="text-[9px] font-bold uppercase tracking-[0.15em] text-slate-500">Notas adicionales
                        <span class="text-slate-400 font-normal normal-case tracking-normal">(opcional)</span></label>
                      <textarea v-model="formData.specialNotes" rows="3"
                        placeholder="Alguna nota o instrucción especial..."
                        class="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-900 text-sm outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/15 shadow-sm resize-none"></textarea>
                    </div>

                    <div class="flex items-center justify-between pt-2">
                      <p class="text-[9px] text-slate-400">Los campos marcados con <span
                          class="text-orange-500 font-bold">*</span> son obligatorios</p>
                      <button type="submit" :disabled="isSubmitting"
                        class="inline-flex items-center gap-2 h-11 px-6 rounded-lg bg-orange-500 text-white text-[10px] font-bold uppercase tracking-wider hover:bg-orange-400 active:scale-[0.97] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-orange-500/20 cursor-pointer">
                        <span v-if="isSubmitting" class="flex items-center gap-2">
                          <span
                            class="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                          Procesando...
                        </span>
                        <span v-else class="flex items-center gap-1.5">
                          Confirmar suscripción
                          <span class="material-symbols-outlined notranslate text-[15px]">arrow_forward</span>
                        </span>
                      </button>
                    </div>

                  </form>
                </div>
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
  font-family: 'Google Sans', 'Inter', sans-serif;
}

.material-symbols-outlined {
  font-variation-settings: 'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 24;
}
</style>
