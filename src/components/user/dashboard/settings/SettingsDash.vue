<script lang="ts" setup>
import { ref, onMounted, defineAsyncComponent } from 'vue'
import { parsePhoneNumber } from 'libphonenumber-js'
import { toast } from 'vue-sonner'
import { auth } from '@/firebase'
import { sendPasswordResetEmail } from 'firebase/auth'
import { useUserStore } from '@/stores/user'
import {
  doc,
  getDoc,
  getDocs,
  collection,
  getFirestore,
  updateDoc,
} from 'firebase/firestore'
import MainLoader from '@/components/ui/MainLoader.vue'
import { useComponentsStore } from '@/stores/components'
import PhoneUpdatePrompt from '../QRDash/PhoneUpdatePrompt.vue'

const userStore = useUserStore()
const db = getFirestore()

const userData = ref<any>(null)
const userQrs = ref<any[]>([])
const subscriptions = ref<any[]>([])
const loading = ref(true)

const isResettingPassword = ref(false)
const isSavingPhone = ref(false)
const isCancelling = ref(false)
const showDeletePrompt = ref(false)
const deleteReason = ref('')
const deleteCustomReason = ref('')

const deleteReasons = [
  'Ya no uso la cuenta',
  'Demasiado caro',
  'Encontré otra opción',
  'Otro (especificar)',
]

const isDeleting = ref(false)

const phoneInput = ref('')

onMounted(async () => {
  const userId = userStore.getUserId
  if (!userId) {
    loading.value = false
    return
  }

  try {
    // Fetch user doc
    const userDocRef = doc(db, `users/${userId}`)
    const userSnap = await getDoc(userDocRef)
    if (userSnap.exists()) {
      userData.value = userSnap.data()
      phoneInput.value = userData.value.phone || ''
      if (userData.value.role) userStore.setRole(userData.value.role)
    }

    // Fetch subscriptions
    const subsSnapshot = await getDocs(collection(db, `users/${userId}/subscriptions`))
    subscriptions.value = subsSnapshot.docs.map((d) => ({ id: d.id, ...d.data() }))

    // Fetch QRs
    const qrsSnapshot = await getDocs(collection(db, `users/${userId}/qrs`))
    userQrs.value = qrsSnapshot.docs.map((d) => ({
      id: d.id,
      docId: d.id,
      ...d.data(),
    }))
  } catch (error) {
    toast.error(`Error al cargar datos: ${error}`)
  } finally {
    loading.value = false
  }
})

const handleResetPassword = async () => {
  if (!userData.value?.email) return
  isResettingPassword.value = true
  try {
    await sendPasswordResetEmail(auth, userData.value.email)
    toast.success('Se ha enviado un correo para restablecer tu contraseña')
  } catch (error: any) {
    toast.error('Error al enviar el correo: ' + error.message)
  } finally {
    isResettingPassword.value = false
  }
}

const handleSavePhone = async () => {
  const userId = userStore.getUserId
  if (!userId) return

  // Validate with libphonenumber-js
  const raw = phoneInput.value.trim()
  if (raw.startsWith('+')) {
    // User typed with + prefix — detect country automatically
    try {
      const phone = parsePhoneNumber(raw)
      if (!phone.isValid()) {
        toast.error('Número de teléfono no válido. Verifica el formato.')
        return
      }
      phoneInput.value = phone.format('E.164') // normalize
    } catch {
      toast.error('Número de teléfono no válido. Verifica el formato.')
      return
    }
  } else {
    toast.error('Incluye el código de país (ej. +52 555 123 4567).')
    return
  }

  isSavingPhone.value = true
  try {
    const userDocRef = doc(db, `users/${userId}`)
    const normalized = phoneInput.value.replace('+', '')
    await updateDoc(userDocRef, { phone: normalized })
    userData.value.phone = normalized
    toast.success('Teléfono actualizado correctamente')
  } catch (error: any) {
    toast.error('Error al guardar: ' + error.message)
  } finally {
    isSavingPhone.value = false
  }
}

const handleCancelAccount = async () => {
  if (!deleteReason.value) {
    toast.error('Selecciona un motivo para cancelar tu cuenta.')
    return
  }

  const soporteUrl = import.meta.env.VITE_SOPORTE_WORKER_URL
  isDeleting.value = true

  try {
    const res = await fetch(`${soporteUrl}/api/account-deletion`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firebaseUid: userStore.getUserId || 'N/A',
        email: userData.value?.email || userStore.getEmail || 'N/A',
        userName: userData.value?.name || userStore.getFullName || 'N/A',
        reason: deleteReason.value,
        customReason: deleteReason.value === 'Otro (especificar)' ? deleteCustomReason.value || 'N/A' : 'N/A',
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      throw new Error(data.error || 'Error al enviar la solicitud')
    }

    toast.success('Solicitud de cancelación enviada. Nuestro equipo la revisará y te contactará pronto.')
    showDeletePrompt.value = false
    deleteReason.value = ''
    deleteCustomReason.value = ''
  } catch (error) {
    const e = error as Error
    toast.error(`Error al enviar: ${e.message}`)
  } finally {
    isDeleting.value = false
  }
}

const formatDate = (timestamp: any) => {
  if (!timestamp) return '---'
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  return new Intl.DateTimeFormat('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

const qrStatusColor = (status: string) => {
  if (status === 'Active') return 'bg-orange-500/10 text-orange-400 border-orange-500/20'
  if (status === 'Paused') return 'bg-white/10 text-white/50 border-white/10'
  return 'bg-white/5 text-white/30 border-white/10'
}

const componentsStore = useComponentsStore();

const withLoader = (viewPath: () => Promise<any>) => {
  return defineAsyncComponent({
    loader: viewPath,
    loadingComponent: MainLoader,
    delay: 200,
  })
}


const componentsMap: Record<string, ReturnType<typeof defineAsyncComponent>> = {
  'Mis QR': withLoader(() => import('@/components/user/dashboard/QRDash/MyQrDash.vue')),
  'Configuración': withLoader(() => import('@/components/user/dashboard/settings/SettingsDash.vue')),
  'Soporte': defineAsyncComponent(() => import('@/components/user/dashboard/support/SupportDash.vue')),
}

const goToMYQR = () => {
  componentsStore.changeComponent('Mis QR');
}

const isUpdateModal = ref(false);

const showUpdateModal = (mode: boolean) => {
  mode ? isUpdateModal.value = true : isUpdateModal.value = false;
}
</script>

<template>
  <div class="w-full max-w-7xl mx-auto font-google-sans pb-20 p-3">
    <PhoneUpdatePrompt v-if="isUpdateModal" @dismiss="showUpdateModal(false)"></PhoneUpdatePrompt>
    <!-- Page Header -->
    <div class="mb-8">
      <div class="flex items-center gap-3 mb-2">
        <div
          class="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500/20 to-orange-600/10 border border-orange-500/20 flex items-center justify-center">
          <span class="material-symbols-outlined notranslate text-orange-400 text-lg">settings</span>
        </div>
        <div>
          <h2 class="text-3xl font-bold text-white">Cuenta y Configuración</h2>
          <p class="text-gray-500 text-sm">Administra tu perfil, códigos QR y suscripción</p>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center py-32">
      <div class="flex flex-col items-center gap-3">
        <div class="w-8 h-8 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin"></div>
        <p class="text-xs text-white/40 font-mono">Cargando datos...</p>
      </div>
    </div>

    <div v-else class="space-y-6">

      <!-- ─── ROW 1: Identity + QR Grid ─── -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <!-- Identity Card -->
        <div class="lg:col-span-1 bg-[#0f0f11] rounded-2xl border border-white/5 p-6">
          <div class="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
            <div
              class="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500/10 to-orange-600/5 border border-orange-500/20 flex items-center justify-center">
              <span class="material-symbols-outlined notranslate text-orange-400 text-lg">badge</span>
            </div>
            <div>
              <h3 class="text-white text-sm font-semibold">Identidad</h3>
              <p class="text-[10px] text-gray-500 font-mono">Información de la cuenta</p>
            </div>
          </div>

          <div class="space-y-4">
            <!-- Name (read-only) -->
            <div>
              <label class="block text-[10px] font-medium text-gray-500 mb-1 uppercase tracking-wider">Nombre
                completo</label>
              <div
                class="w-full bg-[#161618] border border-white/10 rounded-xl px-4 py-3 text-sm text-white/60 opacity-60 cursor-not-allowed flex items-center gap-2">
                <span class="material-symbols-outlined notranslate text-[16px] text-white/30">person</span>
                {{ userData?.name || '---' }}
              </div>
            </div>

            <!-- Email (read-only) -->
            <div>
              <label class="block text-[10px] font-medium text-gray-500 mb-1 uppercase tracking-wider">Correo
                electrónico</label>
              <div
                class="w-full bg-[#161618] border border-white/10 rounded-xl px-4 py-3 text-sm text-white/60 opacity-60 cursor-not-allowed flex items-center gap-2">
                <span class="material-symbols-outlined notranslate text-[16px] text-white/30">mail</span>
                {{ userData?.email || '---' }}
              </div>
            </div>

            <!-- Phone (editable) -->
            <div>
              <label class="block text-[10px] font-medium text-gray-500 mb-1 uppercase tracking-wider">Teléfono</label>
              <div class="flex gap-2">
                <input type="tel" v-model="userStore.getUserPhone"
                  class="flex-1 bg-[#161618] border border-white/10 rounded-xl px-4 py-3 text-sm text-white/30 focus:outline-none focus:border-orange-500/50 transition-all placeholder:text-white/20"
                  placeholder="+52 555 123 4567" disabled />

                <button @click="showUpdateModal(true)" :disabled="isSavingPhone"
                  class="px-2 rounded-xl text-sm font-medium bg-orange-700 hover:bg-orange-500 text-white transition-all active:scale-[0.98] disabled:opacity-50 flex items-center gap-1">
                  <span v-if="isSavingPhone"
                    class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  <span v-else class="material-symbols-outlined notranslate text-[18px]">autorenew</span>
                  <span class="hidden sm:inline text-xs font-bold uppercase tracking-wider">Cambiar</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- QR Codes Grid -->
        <div class="lg:col-span-2 bg-[#0f0f11] rounded-2xl border border-white/5 p-6">
          <div class="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
            <div class="flex items-center gap-3">
              <div
                class="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500/10 to-orange-600/5 border border-orange-500/20 flex items-center justify-center">
                <span class="material-symbols-outlined notranslate text-orange-400 text-lg">qr_code_2</span>
              </div>
              <div>
                <h3 class="text-white text-sm font-semibold">Mis Códigos QR</h3>
                <p class="text-[10px] text-gray-500 font-mono">{{ userQrs.length }} registrados</p>
              </div>
            </div>
            <span class="text-[10px] font-mono text-white/20">ASSETS</span>
          </div>

          <!-- QR Grid -->
          <div v-if="userQrs.filter(q => q.status === 'Active').length > 0"
            class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            <button @click="goToMYQR" v-for="qr in userQrs.filter(q => q.status === 'Active')" :key="qr.id"
              :to="{ name: 'dashboard' }"
              class="bg-[#161618] border border-white/5 rounded-xl p-3 hover:border-orange-500/20 transition-all group cursor-pointer block">
              <div class="flex items-center justify-between mb-2">
                <span class="text-[10px] font-mono text-white/20 truncate max-w-[80px]">{{ qr.id?.slice(0, 8)
                  }}...</span>
                <span :class="qrStatusColor(qr.status)"
                  class="px-1.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border">
                  {{ qr.status }}
                </span>
              </div>
              <p class="text-sm font-medium text-white/80 truncate group-hover:text-white transition-colors">{{ qr.name
                }}</p>
              <div class="flex items-center justify-between mt-2">
                <div class="flex items-center gap-2">
                  <span class="material-symbols-outlined notranslate text-[12px] text-white/20">visibility</span>
                  <span class="text-[10px] text-white/30 font-mono">{{ qr.scans ?? 0 }} escaneos</span>
                </div>

              </div>
            </button>
          </div>

          <div v-else class="flex flex-col items-center justify-center py-12 text-center">
            <span class="material-symbols-outlined notranslate text-4xl text-white/10 mb-3">qr_code_scanner</span>
            <p class="text-sm text-white/30">No tiene códigos QR registrados</p>
            <p class="text-[10px] text-white/20 mt-1">Adquiera un plan para comenzar</p>
          </div>
        </div>
      </div>

      <!-- ─── ROW 2: Planes y Suscripción ─── -->
      <div class="bg-[#0f0f11] rounded-2xl border border-white/5 p-6">
        <div class="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
          <div
            class="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500/10 to-orange-600/5 border border-orange-500/20 flex items-center justify-center">
            <span class="material-symbols-outlined notranslate text-orange-400 text-lg">workspace_premium</span>
          </div>
          <div>
            <h3 class="text-white text-sm font-semibold">Planes y Suscripción</h3>
            <p class="text-[10px] text-gray-500 font-mono">{{ subscriptions.length }} suscripción(es)</p>
          </div>
        </div>

        <div v-if="subscriptions.length > 0" class="space-y-4">
          <div v-for="sub in subscriptions" :key="sub.id"
            class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-[#161618] rounded-xl border border-white/5">
            <div class="flex items-center gap-4">
              <div
                class="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500/10 to-orange-600/5 border border-orange-500/20 flex items-center justify-center">
                <span class="material-symbols-outlined notranslate text-orange-400 text-2xl">star</span>
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <p class="text-white font-semibold capitalize">{{ sub.planType }}</p>
                  <span
                    :class="sub.status === 'active' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' : 'bg-white/10 text-white/50 border-white/10'"
                    class="px-2 py-0.5 rounded-full border text-[9px] font-black uppercase tracking-widest">
                    {{ sub.status }}
                  </span>
                </div>
                <p class="text-[11px] text-gray-500 font-mono mt-0.5">ID: {{ sub.id?.slice(0, 12) }}...</p>
              </div>
            </div>
            <div class="flex flex-wrap items-center gap-4 text-sm">
              <div class="text-right">
                <p class="text-[10px] text-gray-500 uppercase tracking-wider">QRs</p>
                <p class="text-white font-mono">{{ sub.totalQRsCreated ?? 0 }} / {{ sub.totalQRsAllowed ?? 0 }}</p>
              </div>
              <div class="text-right">
                <p class="text-[10px] text-gray-500 uppercase tracking-wider">Finaliza</p>
                <p class="text-white font-mono text-xs">{{ sub.endDate ? formatDate(sub.endDate) : 'Ilimitado' }}</p>
              </div>
              <div class="w-20 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div class="h-full bg-orange-500 rounded-full transition-all duration-500"
                  :style="{ width: `${Math.min((sub.totalQRsCreated / sub.totalQRsAllowed) * 100, 100)}%` }"></div>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="flex flex-col items-center justify-center py-10 text-center">
          <span class="material-symbols-outlined notranslate text-4xl text-white/10 mb-3">credit_card_off</span>
          <p class="text-sm text-white/30">No tienes suscripciones activas</p>
          <p class="text-[10px] text-white/20 mt-1">Adquiere un plan para activar tu cuenta</p>
        </div>
      </div>

      <!-- ─── ROW 3: Seguridad (solo restablecer contraseña) ─── -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Security / Password Reset -->
        <div class="lg:col-span-2 bg-[#0f0f11] rounded-2xl border border-white/5 p-6">
          <div class="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
            <div
              class="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500/10 to-orange-600/5 border border-orange-500/20 flex items-center justify-center">
              <span class="material-symbols-outlined notranslate text-orange-400 text-lg">lock</span>
            </div>
            <div>
              <h3 class="text-white text-sm font-semibold">Seguridad</h3>
              <p class="text-[10px] text-gray-500 font-mono">Gestión de acceso a la cuenta</p>
            </div>
          </div>

          <div class="p-4 bg-[#161618] rounded-xl border border-white/5 flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-white">Restablecer Contraseña</p>
              <p class="text-[11px] text-gray-500 mt-0.5">Se enviará un enlace a tu correo electrónico</p>
            </div>
            <button @click="handleResetPassword" :disabled="isResettingPassword"
              class="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-orange-600/10 border border-orange-500/20 text-orange-400 hover:bg-orange-600/20 hover:border-orange-500/40 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center gap-2">
              <span v-if="isResettingPassword"
                class="w-4 h-4 border-2 border-orange-400/30 border-t-orange-400 rounded-full animate-spin"></span>
              <span v-else class="material-symbols-outlined notranslate text-[16px]">send</span>
              Enviar enlace
            </button>
          </div>
        </div>

        <!-- Danger Zone with Delete Prompt -->
        <div class="bg-[#0f0f11] rounded-2xl p-6 border border-red-500/10">
          <h3 class="text-red-500 text-sm font-semibold mb-4 pb-3 border-b border-red-500/5 flex items-center gap-2">
            <span class="material-symbols-outlined notranslate text-[18px]">warning</span>
            Zona de Peligro
          </h3>

          <p class="text-[11px] text-gray-500 mb-4">
            Al cancelar tu cuenta, todos tus datos serán marcados para eliminación. Esta acción no se puede deshacer
            fácilmente.
          </p>

          <!-- Delete Prompt Modal -->
          <Teleport to="body">
            <Transition name="fade">
              <div v-if="showDeletePrompt"
                class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <div @click.stop
                  class="w-full max-w-md bg-[#0f0f11] border border-red-500/20 rounded-3xl p-6 shadow-2xl space-y-5">
                  <div class="flex items-center justify-between">
                    <h4 class="text-white font-bold text-sm flex items-center gap-2">
                      <span class="material-symbols-outlined notranslate text-red-500 text-[18px]">delete_forever</span>
                      Cancelar cuenta
                    </h4>
                    <button @click="showDeletePrompt = false"
                      class="text-white/30 hover:text-white transition-colors cursor-pointer">
                      <span class="material-symbols-outlined notranslate text-[20px]">close</span>
                    </button>
                  </div>

                  <p class="text-xs text-gray-500 leading-relaxed">
                    Esta acción solicitará la eliminación de tu cuenta y todos tus datos. Cuéntanos el motivo para
                    ayudarnos a mejorar.
                  </p>

                  <!-- Reason options -->
                  <div class="space-y-2">
                    <label class="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 ml-1">Motivo</label>
                    <div class="space-y-1.5">
                      <button v-for="r in deleteReasons" :key="r" @click="deleteReason = r"
                        class="w-full text-left px-4 py-2.5 rounded-xl border text-xs font-medium transition-all cursor-pointer"
                        :class="deleteReason === r
                          ? 'border-red-500/40 bg-red-500/10 text-red-400'
                          : 'border-white/10 bg-black/40 text-white/60 hover:border-white/20'">
                        {{ r }}
                      </button>
                    </div>
                  </div>

                  <!-- Custom reason textarea -->
                  <div v-if="deleteReason === 'Otro (especificar)'">
                    <label
                      class="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 ml-1 mb-1.5 block">Especifica
                      el motivo</label>
                    <textarea v-model="deleteCustomReason" rows="3" placeholder="Describe el motivo..."
                      class="w-full px-4 py-3 rounded-xl border border-white/10 bg-black/40 text-white text-sm placeholder:text-white/20 outline-none focus:border-red-500/40 transition-all resize-none"></textarea>
                  </div>

                  <!-- Actions -->
                  <div class="flex gap-3 pt-2">
                    <button @click="showDeletePrompt = false"
                      class="flex-1 py-3 rounded-xl border border-white/10 text-white/60 text-xs font-bold uppercase tracking-wider hover:bg-white/5 transition-all cursor-pointer">
                      Cancelar
                    </button>
                    <button @click="handleCancelAccount" :disabled="isDeleting || !deleteReason"
                      class="flex-1 py-3 rounded-xl bg-red-600 text-white text-xs font-bold uppercase tracking-wider hover:bg-red-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer">
                      <span v-if="isDeleting"
                        class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      <span v-else class="material-symbols-outlined notranslate text-[16px]">delete_forever</span>
                      {{ isDeleting ? 'Enviando...' : 'Solicitar cancelación' }}
                    </button>
                  </div>
                </div>
              </div>
            </Transition>
          </Teleport>

          <button @click="showDeletePrompt = true" :disabled="isCancelling"
            class="w-full py-3 rounded-xl text-xs font-bold uppercase tracking-wider border border-red-500/20 text-red-500 hover:bg-red-500/10 transition-all flex items-center justify-center gap-2 cursor-pointer">
            <span v-if="isCancelling"
              class="w-4 h-4 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin"></span>
            <span v-else class="material-symbols-outlined notranslate text-[16px]">delete_forever</span>
            {{ isCancelling ? 'Procesando...' : 'Cancelar mi cuenta' }}
          </button>
          <p class="text-[9px] text-center text-gray-600 mt-3">
            Se enviará una solicitud de cancelación a nuestro equipo.
          </p>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
