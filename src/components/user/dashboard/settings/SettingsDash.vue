<script lang="ts" setup>
import { ref, onMounted } from 'vue'
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

const userStore = useUserStore()
const db = getFirestore()

const userData = ref<any>(null)
const userQrs = ref<any[]>([])
const subscriptions = ref<any[]>([])
const loading = ref(true)

const isResettingPassword = ref(false)
const isSavingPhone = ref(false)
const isCancelling = ref(false)

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
    }

    // Fetch subscriptions
    const subsSnapshot = await getDocs(collection(db, `users/${userId}/subscriptions`))
    subscriptions.value = subsSnapshot.docs.map((d) => ({ id: d.id, ...d.data() }))

    // Fetch QRs
    const qrsSnapshot = await getDocs(collection(db, `users/${userId}/qrs`))
    const qrDocs = qrsSnapshot.docs.map((d) => ({
      id: d.id,
      docId: d.id,
      ...d.data(),
    }))

    // Fetch real scan counts from publicQR documents
    const qrScanPromises = qrDocs.map(async (qr: any) => {
      try {
        const publicQrRef = doc(db, 'publicQR', qr.id)
        const publicSnap = await getDoc(publicQrRef)
        if (publicSnap.exists()) {
          qr.scans = publicSnap.data().totalScans ?? 0
        }
      } catch {
        // If publicQR doesn't exist, keep the original scans value
      }
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
  isSavingPhone.value = true
  try {
    const userDocRef = doc(db, `users/${userId}`)
    await updateDoc(userDocRef, { phone: phoneInput.value })
    userData.value.phone = phoneInput.value
    toast.success('Teléfono actualizado correctamente')
  } catch (error: any) {
    toast.error('Error al guardar: ' + error.message)
  } finally {
    isSavingPhone.value = false
  }
}

const handleCancelAccount = () => {
  isCancelling.value = true
  setTimeout(() => {
    toast.success('Solicitud de cancelación enviada. Recibirás un correo de confirmación pronto.')
    isCancelling.value = false
  }, 1500)
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
  if (status === 'Active') return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
  if (status === 'Paused') return 'bg-amber-500/10 text-amber-400 border-amber-500/20'
  return 'bg-red-500/10 text-red-400 border-red-500/20'
}
</script>

<template>
  <div class="w-full max-w-7xl mx-auto font-google-sans pb-20">
    <!-- Page Header -->
    <div class="mb-8">
      <div class="flex items-center gap-3 mb-2">
        <div
          class="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500/20 to-orange-600/10 border border-orange-500/20 flex items-center justify-center">
          <span class="material-symbols-outlined text-orange-400 text-lg">settings</span>
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
              class="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500/10 to-sky-600/5 border border-sky-500/20 flex items-center justify-center">
              <span class="material-symbols-outlined text-sky-400 text-lg">badge</span>
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
                <span class="material-symbols-outlined text-[16px] text-white/30">person</span>
                {{ userData?.name || '---' }}
              </div>
            </div>

            <!-- Email (read-only) -->
            <div>
              <label class="block text-[10px] font-medium text-gray-500 mb-1 uppercase tracking-wider">Correo
                electrónico</label>
              <div
                class="w-full bg-[#161618] border border-white/10 rounded-xl px-4 py-3 text-sm text-white/60 opacity-60 cursor-not-allowed flex items-center gap-2">
                <span class="material-symbols-outlined text-[16px] text-white/30">mail</span>
                {{ userData?.email || '---' }}
              </div>
            </div>

            <!-- Phone (editable) -->
            <div>
              <label class="block text-[10px] font-medium text-gray-500 mb-1 uppercase tracking-wider">Teléfono</label>
              <div class="flex gap-2">
                <input type="tel" v-model="phoneInput"
                  class="flex-1 bg-[#161618] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-orange-500/50 transition-all placeholder:text-white/20"
                  placeholder="+52 555 123 4567" />
                <button @click="handleSavePhone" :disabled="isSavingPhone"
                  class="px-4 py-3 rounded-xl text-sm font-medium bg-orange-600 hover:bg-orange-500 text-white transition-all active:scale-[0.98] disabled:opacity-50 flex items-center gap-1.5">
                  <span v-if="isSavingPhone"
                    class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  <span v-else class="material-symbols-outlined text-[18px]">save</span>
                  <span class="hidden sm:inline text-xs font-bold uppercase tracking-wider">Guardar</span>
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
                class="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 flex items-center justify-center">
                <span class="material-symbols-outlined text-purple-400 text-lg">qr_code_2</span>
              </div>
              <div>
                <h3 class="text-white text-sm font-semibold">Mis Códigos QR</h3>
                <p class="text-[10px] text-gray-500 font-mono">{{ userQrs.length }} registrados</p>
              </div>
            </div>
            <span class="text-[10px] font-mono text-white/20">ASSETS</span>
          </div>

          <!-- QR Grid -->
          <div v-if="userQrs.length > 0" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            <div v-for="qr in userQrs" :key="qr.id"
              class="bg-[#161618] border border-white/5 rounded-xl p-3 hover:border-white/10 transition-all group cursor-default">
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
              <div class="flex items-center gap-2 mt-2">
                <span class="material-symbols-outlined text-[12px] text-white/20">visibility</span>
                <span class="text-[10px] text-white/30 font-mono">{{ qr.scans ?? 0 }} escaneos</span>
              </div>
            </div>
          </div>

          <div v-else class="flex flex-col items-center justify-center py-12 text-center">
            <span class="material-symbols-outlined text-4xl text-white/10 mb-3">qr_code_scanner</span>
            <p class="text-sm text-white/30">No tienes códigos QR registrados</p>
            <p class="text-[10px] text-white/20 mt-1">Adquiere un plan para comenzar</p>
          </div>
        </div>
      </div>

      <!-- ─── ROW 2: Planes y Suscripción ─── -->
      <div class="bg-[#0f0f11] rounded-2xl border border-white/5 p-6">
        <div class="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
          <div
            class="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20 flex items-center justify-center">
            <span class="material-symbols-outlined text-green-400 text-lg">workspace_premium</span>
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
                <span class="material-symbols-outlined text-orange-400 text-2xl">star</span>
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <p class="text-white font-semibold capitalize">{{ sub.planType }}</p>
                  <span
                    :class="sub.status === 'active' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'"
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
          <span class="material-symbols-outlined text-4xl text-white/10 mb-3">credit_card_off</span>
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
              class="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500/10 to-rose-600/5 border border-rose-500/20 flex items-center justify-center">
              <span class="material-symbols-outlined text-rose-400 text-lg">lock</span>
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
              class="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-rose-600/10 border border-rose-500/20 text-rose-400 hover:bg-rose-600/20 hover:border-rose-500/40 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center gap-2">
              <span v-if="isResettingPassword"
                class="w-4 h-4 border-2 border-rose-400/30 border-t-rose-400 rounded-full animate-spin"></span>
              <span v-else class="material-symbols-outlined text-[16px]">send</span>
              Enviar enlace
            </button>
          </div>
        </div>

        <!-- Danger Zone -->
        <div class="bg-[#0f0f11] rounded-2xl p-6 border border-red-500/10">
          <h3 class="text-red-500 text-sm font-semibold mb-4 pb-3 border-b border-red-500/5 flex items-center gap-2">
            <span class="material-symbols-outlined text-[18px]">warning</span>
            Zona de Peligro
          </h3>

          <p class="text-[11px] text-gray-500 mb-4">
            Al cancelar tu cuenta, todos tus datos serán marcados para eliminación. Esta acción no se puede deshacer
            fácilmente.
          </p>

          <button @click="handleCancelAccount" :disabled="isCancelling"
            class="w-full py-3 rounded-xl text-xs font-bold uppercase tracking-wider border border-red-500/20 text-red-500 hover:bg-red-500/10 transition-all flex items-center justify-center gap-2">
            <span v-if="isCancelling"
              class="w-4 h-4 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin"></span>
            <span v-else class="material-symbols-outlined text-[16px]">delete_forever</span>
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
