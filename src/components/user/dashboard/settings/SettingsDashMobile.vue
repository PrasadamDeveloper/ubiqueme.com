<script lang="ts" setup>
import { ref, onMounted, defineAsyncComponent } from 'vue'
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
    const userDocRef = doc(db, `users/${userId}`)
    const userSnap = await getDoc(userDocRef)
    if (userSnap.exists()) {
      userData.value = userSnap.data()
      phoneInput.value = userData.value.phone || ''
      if (userData.value.role) userStore.setRole(userData.value.role)
    }

    const subsSnapshot = await getDocs(collection(db, `users/${userId}/subscriptions`))
    subscriptions.value = subsSnapshot.docs.map((d) => ({ id: d.id, ...d.data() }))

    const qrsSnapshot = await getDocs(collection(db, `users/${userId}/qrs`))
    const qrDocs = qrsSnapshot.docs.map((d) => ({
      id: d.id,
      docId: d.id,
      ...d.data(),
    }))

    const qrScanPromises = qrDocs.map(async (qr: any) => {
      try {
        const publicQrRef = doc(db, 'publicQR', qr.id)
        const publicSnap = await getDoc(publicQrRef)
        if (publicSnap.exists()) {
          qr.scans = publicSnap.data().totalScans ?? 0
        }
      } catch { /* publicQR may not exist */ }
      return qr
    })
    userQrs.value = await Promise.all(qrScanPromises)
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
  const raw = phoneInput.value.trim()
  if (!raw.startsWith('+')) {
    toast.error('Incluye el código de país (ej. +52 555 123 4567).')
    return
  }
  isSavingPhone.value = true
  try {
    const userDocRef = doc(db, `users/${userId}`)
    const normalized = raw.replace('+', '')
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
    if (!res.ok) throw new Error(data.error || 'Error al enviar la solicitud')
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
  return new Intl.DateTimeFormat('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }).format(date)
}

const qrStatusColor = (status: string) => {
  if (status === 'Active') return 'bg-orange-500/10 text-orange-400 border-orange-500/20'
  if (status === 'Paused') return 'bg-white/10 text-white/50 border-white/10'
  return 'bg-white/5 text-white/30 border-white/10'
}

const componentsStore = useComponentsStore()

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

const goToMYQR = () => { componentsStore.changeComponent('Mis QR') }

const isUpdateModal = ref(false)
const showUpdateModal = (mode: boolean) => { isUpdateModal.value = mode }
</script>

<template>
  <div class="relative min-h-dvh bg-[#1C1B1F] w-full font-google-sans">
    <div class="px-4 pt-3 pb-32 space-y-4">

      <!-- Header -->
      <div class="flex items-center gap-2.5">
        <div
          class="w-9 h-9 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shrink-0">
          <span class="material-symbols-outlined notranslate text-orange-400 text-[18px]">settings</span>
        </div>
        <div>
          <h2 class="text-lg font-bold text-[#E6E1E5]">Cuenta y Configuración</h2>
          <p class="text-[#CAC4D0]/50 text-[10px]">Administra tu perfil y suscripción</p>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="flex items-center justify-center py-20">
        <div class="flex flex-col items-center gap-2">
          <div class="w-7 h-7 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin"></div>
          <p class="text-xs text-[#CAC4D0]/40 font-mono">Cargando datos...</p>
        </div>
      </div>

      <div v-else class="space-y-3">

        <!-- Identity Card (M3 surface container) -->
        <div class="bg-[#2B2930] rounded-xl p-4 border border-[#49454F]/30 space-y-3">
          <div class="flex items-center gap-2 pb-2 border-b border-[#49454F]/30">
            <span class="material-symbols-outlined notranslate text-[#CAC4D0]/40 text-[16px]">badge</span>
            <span class="text-[10px] font-bold uppercase tracking-[0.15em] text-[#CAC4D0]/60">Identidad</span>
          </div>
          <div class="space-y-2.5">
            <div>
              <label class="text-[9px] font-bold uppercase tracking-wider text-[#CAC4D0]/40 ml-1 mb-0.5 block">Nombre
                completo</label>
              <div
                class="w-full h-10 px-3 rounded-xl bg-[#1C1B1F] border border-[#49454F]/50 text-[#E6E1E5] text-sm flex items-center gap-2 opacity-60">
                <span class="material-symbols-outlined notranslate text-[16px] text-[#CAC4D0]/30">person</span>
                {{ userData?.name || '---' }}
              </div>
            </div>
            <div>
              <label class="text-[9px] font-bold uppercase tracking-wider text-[#CAC4D0]/40 ml-1 mb-0.5 block">Correo
                electrónico</label>
              <div
                class="w-full h-10 px-3 rounded-xl bg-[#1C1B1F] border border-[#49454F]/50 text-[#E6E1E5] text-sm flex items-center gap-2 opacity-60">
                <span class="material-symbols-outlined notranslate text-[16px] text-[#CAC4D0]/30">mail</span>
                {{ userData?.email || '---' }}
              </div>
            </div>
            <div>
              <label
                class="text-[9px] font-bold uppercase tracking-wider text-[#CAC4D0]/40 ml-1 mb-0.5 block">Teléfono</label>
              <div class="flex gap-2">
                <input type="tel" :value="userStore.getUserPhone"
                  class="flex-1 h-10 px-3 rounded-xl bg-[#1C1B1F] border border-[#49454F]/50 text-[#E6E1E5] text-sm placeholder:text-[#CAC4D0]/30 outline-none focus:border-orange-500/50 transition-all"
                  disabled />
                <button @click="showUpdateModal(true)"
                  class="h-10 px-3 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 text-[10px] font-bold uppercase tracking-wider transition-all active:scale-95 flex items-center gap-1 cursor-pointer">
                  <span class="material-symbols-outlined notranslate text-[16px]">autorenew</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- QR Codes (M3 surface container) -->
        <div class="bg-[#2B2930] rounded-xl p-4 border border-[#49454F]/30 space-y-3">
          <div class="flex items-center justify-between pb-2 border-b border-[#49454F]/30">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined notranslate text-[#CAC4D0]/40 text-[16px]">qr_code_2</span>
              <span class="text-[10px] font-bold uppercase tracking-[0.15em] text-[#CAC4D0]/60">Mis QRs</span>
            </div>
            <span class="text-[9px] text-[#CAC4D0]/30 font-mono">{{ userQrs.length }} registrados</span>
          </div>

          <div v-if="userQrs.filter(q => q.status === 'Active').length > 0" class="grid grid-cols-2 gap-2">
            <button @click="goToMYQR" v-for="qr in userQrs.filter(q => q.status === 'Active')" :key="qr.id"
              class="bg-[#1C1B1F] border border-[#49454F]/30 rounded-xl p-3 hover:border-orange-500/30 transition-all text-left cursor-pointer active:scale-[0.98]">
              <div class="flex items-center justify-between mb-1">
                <span class="text-[8px] font-mono text-[#CAC4D0]/30 truncate max-w-[70px]">{{ qr.id?.slice(0, 8)
                  }}..</span>
                <span :class="qrStatusColor(qr.status)"
                  class="px-1 py-0.5 rounded-full text-[7px] font-bold uppercase tracking-widest border">{{ qr.status
                  }}</span>
              </div>
              <p class="text-sm font-bold text-[#E6E1E5] truncate">{{ qr.name }}</p>
              <div class="flex items-center gap-1 mt-1">
                <span class="material-symbols-outlined notranslate text-[10px] text-[#CAC4D0]/30">visibility</span>
                <span class="text-[9px] text-[#CAC4D0]/40 font-mono">{{ qr.scans ?? 0 }}</span>
              </div>
            </button>
          </div>

          <div v-else class="flex flex-col items-center justify-center py-8 text-center">
            <span class="material-symbols-outlined notranslate text-3xl text-[#CAC4D0]/10 mb-2">qr_code_scanner</span>
            <p class="text-xs text-[#CAC4D0]/40">No tiene códigos QR registrados</p>
          </div>
        </div>

        <!-- Subscriptions -->
        <div class="bg-[#2B2930] rounded-xl p-4 border border-[#49454F]/30 space-y-3">
          <div class="flex items-center gap-2 pb-2 border-b border-[#49454F]/30">
            <span class="material-symbols-outlined notranslate text-[#CAC4D0]/40 text-[16px]">workspace_premium</span>
            <span class="text-[10px] font-bold uppercase tracking-[0.15em] text-[#CAC4D0]/60">Suscripciones</span>
          </div>

          <div v-if="subscriptions.length > 0" class="space-y-2">
            <div v-for="sub in subscriptions" :key="sub.id"
              class="bg-[#1C1B1F] rounded-xl p-3 border border-[#49454F]/30">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span class="material-symbols-outlined notranslate text-orange-400 text-[16px]">star</span>
                  <span class="text-sm font-bold text-[#E6E1E5] capitalize">{{ sub.planType }}</span>
                  <span
                    :class="sub.status === 'active' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' : 'bg-white/10 text-[#CAC4D0]/50 border-white/10'"
                    class="px-1.5 py-0.5 rounded-full border text-[7px] font-bold uppercase tracking-widest">{{
                    sub.status }}</span>
                </div>
                <div class="text-right">
                  <p class="text-[10px] font-medium text-[#E6E1E5]">{{ sub.totalQRsCreated ?? 0 }}/{{
                    sub.totalQRsAllowed ?? 0 }}</p>
                  <div class="w-20 h-1 bg-[#49454F]/30 rounded-full mt-1 overflow-hidden ml-auto">
                    <div class="h-full bg-orange-500 rounded-full transition-all"
                      :style="{ width: `${Math.min((sub.totalQRsCreated / sub.totalQRsAllowed) * 100, 100)}%` }"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="flex flex-col items-center justify-center py-6 text-center">
            <span class="material-symbols-outlined notranslate text-3xl text-[#CAC4D0]/10 mb-2">credit_card_off</span>
            <p class="text-xs text-[#CAC4D0]/40">No tienes suscripciones activas</p>
          </div>
        </div>

        <!-- Security -->
        <div class="bg-[#2B2930] rounded-xl p-4 border border-[#49454F]/30 space-y-3">
          <div class="flex items-center gap-2 pb-2 border-b border-[#49454F]/30">
            <span class="material-symbols-outlined notranslate text-[#CAC4D0]/40 text-[16px]">lock</span>
            <span class="text-[10px] font-bold uppercase tracking-[0.15em] text-[#CAC4D0]/60">Seguridad</span>
          </div>
          <div class="flex items-center justify-between bg-[#1C1B1F] rounded-xl p-3 border border-[#49454F]/30">
            <div>
              <p class="text-xs font-bold text-[#E6E1E5]">Restablecer Contraseña</p>
              <p class="text-[9px] text-[#CAC4D0]/40 mt-0.5">Recibirás un enlace por correo</p>
            </div>
            <button @click="handleResetPassword" :disabled="isResettingPassword"
              class="shrink-0 h-9 px-3 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 text-[9px] font-bold uppercase tracking-wider transition-all active:scale-95 disabled:opacity-50 flex items-center gap-1 cursor-pointer">
              <span v-if="isResettingPassword"
                class="w-3 h-3 border-2 border-orange-400/30 border-t-orange-400 rounded-full animate-spin"></span>
              <span v-else class="material-symbols-outlined notranslate text-[14px]">send</span>
              Enviar
            </button>
          </div>
        </div>

        <!-- Danger Zone -->
        <div class="bg-[#2B2930] rounded-xl p-4 border border-rose-500/20 space-y-3">
          <div class="flex items-center gap-2 pb-2 border-b border-rose-500/10">
            <span class="material-symbols-outlined notranslate text-rose-400 text-[16px]">warning</span>
            <span class="text-[10px] font-bold uppercase tracking-[0.15em] text-rose-400">Zona de Peligro</span>
          </div>
          <button @click="showDeletePrompt = true"
            class="w-full h-10 rounded-xl border border-rose-500/20 text-rose-400 text-[9px] font-bold uppercase tracking-wider hover:bg-rose-500/10 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.98]">
            <span class="material-symbols-outlined notranslate text-[14px]">delete_forever</span>
            Cancelar mi cuenta
          </button>
        </div>
      </div>
    </div>

    <!-- Delete Prompt (M3 Alert Dialog) -->
    <Teleport to="body">
      <Transition enter-active-class="transition-all duration-200 ease-out" enter-from-class="opacity-0"
        enter-to-class="opacity-100" leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="opacity-100" leave-to-class="opacity-0">
        <div v-if="showDeletePrompt" @click.self="showDeletePrompt = false"
          class="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-6">
          <div class="w-full max-w-xs bg-[#2B2930] rounded-2xl p-6 border border-[#49454F]/30 space-y-4 shadow-2xl">
            <div class="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center mx-auto">
              <span class="material-symbols-outlined notranslate text-rose-500 text-[24px]">delete_forever</span>
            </div>
            <div class="text-center">
              <h3 class="text-[#E6E1E5] text-base font-medium">Cancelar cuenta</h3>
              <p class="text-[#CAC4D0]/60 text-[11px] mt-1 leading-relaxed">Esta acción solicitará la eliminación de tu
                cuenta. Cuéntanos el motivo.</p>
            </div>
            <div class="space-y-1.5">
              <button v-for="r in deleteReasons" :key="r" @click="deleteReason = r"
                class="w-full text-left px-3 py-2 rounded-xl border text-[11px] font-medium transition-all cursor-pointer active:scale-[0.98]"
                :class="deleteReason === r ? 'border-rose-500/40 bg-rose-500/10 text-rose-400' : 'border-[#49454F]/30 bg-[#1C1B1F] text-[#CAC4D0]/60 hover:border-white/20'">{{
                r }}</button>
            </div>
            <div v-if="deleteReason === 'Otro (especificar)'">
              <textarea v-model="deleteCustomReason" rows="2" placeholder="Describe el motivo..."
                class="w-full px-3 py-2 rounded-xl border border-[#49454F]/50 bg-[#1C1B1F] text-[#E6E1E5] text-sm placeholder:text-[#CAC4D0]/30 outline-none focus:border-orange-500/50 transition-all resize-none"></textarea>
            </div>
            <div class="flex gap-3">
              <button @click="showDeletePrompt = false"
                class="flex-1 py-2.5 bg-[#49454F]/30 text-[#E6E1E5] rounded-xl text-sm font-medium hover:bg-[#49454F]/50 transition-colors cursor-pointer">Cancelar</button>
              <button @click="handleCancelAccount" :disabled="isDeleting || !deleteReason"
                class="flex-1 py-2.5 bg-rose-500 text-white rounded-xl text-sm font-medium hover:bg-rose-600 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 cursor-pointer">
                <span v-if="isDeleting"
                  class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                {{ isDeleting ? 'Enviando...' : 'Solicitar' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Phone Update Modal -->
    <PhoneUpdatePrompt v-if="isUpdateModal" @dismiss="showUpdateModal(false)" />
  </div>
</template>

<style scoped>
.material-symbols-outlined {
  font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}
</style>
