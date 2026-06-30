<script lang="ts" setup>
import { useUserStore } from '@/stores/user'
import { doc, getDoc, getFirestore } from 'firebase/firestore'
import { onMounted, ref } from 'vue'
import LineLoader from '@/components/ui/LineLoader.vue'
import { toast } from 'vue-sonner'

const userStore = useUserStore()
const db = getFirestore()
const userData = ref<any>(null)
const loading = ref(true)

onMounted(async () => {
  const userId = userStore.getUserId
  if (!userId) {
    loading.value = false
    return
  }
  try {
    const userDocRef = doc(db, `users/${userId}`)
    const snap = await getDoc(userDocRef)
    if (snap.exists()) userData.value = snap.data()
  } catch (error) {
    toast.error(`Error al obtener datos de usuario: ${error}`)
  } finally {
    loading.value = false
  }
})

const formatDate = (timestamp: any) => {
  if (!timestamp) return '---'
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  return new Intl.DateTimeFormat('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }).format(date)
}
</script>

<template>
  <div class="relative min-h-dvh bg-[#1C1B1F] w-full font-google-sans">
    <div class="px-4 pt-3 pb-32 space-y-4">

      <!-- Header -->
      <div class="space-y-1">
        <p class="text-[10px] font-black tracking-[0.3em] uppercase text-orange-400">Perfil de Usuario</p>
        <h2 class="text-lg font-bold text-[#E6E1E5] tracking-tight">Resumen de Cuenta</h2>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="flex justify-center py-16">
        <LineLoader />
      </div>

      <div v-else-if="userData" class="space-y-3">
        <!-- Active badge -->
        <div v-if="userData?.isActive"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 w-fit">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span class="text-[8px] font-bold uppercase tracking-widest text-emerald-400">Servicio Activo</span>
        </div>

        <!-- Identity Card -->
        <div class="bg-[#2B2930] rounded-xl p-4 border border-[#49454F]/30 space-y-3">
          <div class="flex items-center gap-2 pb-2 border-b border-[#49454F]/30">
            <span class="material-symbols-outlined notranslate text-[#CAC4D0]/40 text-[16px]">fingerprint</span>
            <span class="text-[10px] font-bold uppercase tracking-[0.15em] text-[#CAC4D0]/60">Identidad
              Verificada</span>
          </div>
          <div class="space-y-2.5">
            <div>
              <p class="text-[8px] font-bold uppercase tracking-widest text-[#CAC4D0]/30 mb-0.5">Nombre Completo</p>
              <p class="text-sm font-medium text-[#E6E1E5]">{{ userData.name || '---' }}</p>
            </div>
            <div>
              <p class="text-[8px] font-bold uppercase tracking-widest text-[#CAC4D0]/30 mb-0.5">Correo Electrónico</p>
              <p class="text-sm font-medium text-[#E6E1E5] truncate">{{ userData.email || '---' }}</p>
            </div>
            <div>
              <p class="text-[8px] font-bold uppercase tracking-widest text-[#CAC4D0]/30 mb-0.5">Teléfono</p>
              <p class="text-sm font-medium text-[#E6E1E5]">{{ userData.phone || 'No registrado' }}</p>
            </div>
            <div>
              <p class="text-[8px] font-bold uppercase tracking-widest text-[#CAC4D0]/30 mb-0.5">Nivel de Acceso</p>
              <p class="text-sm font-medium text-[#E6E1E5] capitalize">{{ userData.role || 'User' }}</p>
            </div>
          </div>
          <div class="flex gap-4 pt-2 border-t border-[#49454F]/30">
            <div>
              <p class="text-[7px] font-bold uppercase tracking-widest text-[#CAC4D0]/30 flex items-center gap-1">
                <span class="material-symbols-outlined notranslate text-[10px]">calendar_month</span> Miembro Desde
              </p>
              <p class="text-[11px] text-[#CAC4D0]/60">{{ formatDate(userData.createdAt) }}</p>
            </div>
            <div>
              <p class="text-[7px] font-bold uppercase tracking-widest text-[#CAC4D0]/30 flex items-center gap-1">
                <span class="material-symbols-outlined notranslate text-[10px]">history</span> Último Acceso
              </p>
              <p class="text-[11px] text-[#CAC4D0]/60">{{ formatDate(userData.lastLoginAt) }}</p>
            </div>
          </div>
        </div>

        <!-- Stats card -->
        <div class="bg-orange-500/10 border border-orange-500/20 rounded-xl p-6 flex flex-col items-center text-center">
          <span class="material-symbols-outlined notranslate text-orange-400 text-3xl mb-2">qr_code_2</span>
          <p class="text-4xl font-black text-[#E6E1E5] tracking-tight">{{ userData.totalQRs || 0 }}</p>
          <p class="text-[9px] font-bold uppercase tracking-widest text-orange-400 mt-1">QRs Registrados</p>
        </div>

        <!-- Plan card -->
        <div class="bg-[#2B2930] rounded-xl p-4 border border-[#49454F]/30 space-y-3">
          <div class="flex items-center gap-2 pb-2 border-b border-[#49454F]/30">
            <span class="material-symbols-outlined notranslate text-[#CAC4D0]/40 text-[16px]">workspace_premium</span>
            <span class="text-[10px] font-bold uppercase tracking-[0.15em] text-[#CAC4D0]/60">Suscripción</span>
          </div>
          <div class="flex items-center gap-3">
            <span class="material-symbols-outlined notranslate text-[#E6E1E5] text-2xl">workspace_premium</span>
            <p class="text-xl font-black tracking-tight text-[#E6E1E5] capitalize">{{ userData.plan || 'N/A' }}</p>
          </div>
          <div class="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#1C1B1F] border border-[#49454F]/30 rounded-lg">
            <span class="material-symbols-outlined notranslate text-[10px] text-[#CAC4D0]/40">credit_card</span>
            <p class="text-[8px] uppercase tracking-widest font-bold text-[#CAC4D0]/50">{{ userData.subscriptionStatus
              || 'Unknown' }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.material-symbols-outlined {
  font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}
</style>
