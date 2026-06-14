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
    if (snap.exists()) {
      userData.value = snap.data()
    }
  } catch (error) {
    toast.error(`Error al obtener datos de usuario: ${error}`)
  } finally {
    loading.value = false
  }
})

const formatDate = (timestamp: any) => {
  if (!timestamp) return '---'
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  return new Intl.DateTimeFormat('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date)
}
</script>

<template>
  <div class="font-google-sans text-white space-y-10 pb-20">

    <!-- Header Section -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/10 pb-8">
      <div>
        <p class="text-amber-500 font-black tracking-[0.4em] text-[10px] uppercase mb-2">Perfil de Usuario</p>
        <h2 class="text-4xl md:text-5xl font-black tracking-tighter leading-none italic">
          Resumen de Cuenta
        </h2>
      </div>
      <div v-if="userData?.isActive"
        class="px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full flex items-center gap-2">
        <span class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
        <span class="text-[10px] text-green-400 font-black uppercase tracking-widest">Servicio Activo</span>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center py-32">
      <LineLoader />
    </div>

    <!-- Main Content -->
    <div v-else-if="userData" class="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-up">

      <!-- Identity Card -->
      <div
        class="md:col-span-2 bg-white/5 border border-white/10 rounded-[2rem] p-8 md:p-10 flex flex-col justify-between relative overflow-hidden group hover:border-white/20 transition-all duration-500">
        <!-- Background Decoration -->
        <div
          class="absolute top-[-20%] right-[-10%] opacity-5 group-hover:opacity-10 transition-opacity duration-500 rotate-12">
          <span class="material-symbols-outlined text-[200px]">fingerprint</span>
        </div>

        <div>
          <h3 class="text-2xl font-black tracking-tight mb-8">Identidad Verificada</h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-8 relative z-10">
            <div>
              <p class="text-[9px] text-white/30 font-black uppercase tracking-widest mb-1">Nombre Completo</p>
              <p class="text-lg font-medium text-white/90">{{ userData.name || '---' }}</p>
            </div>
            <div>
              <p class="text-[9px] text-white/30 font-black uppercase tracking-widest mb-1">Correo Electrónico</p>
              <p class="text-lg font-medium text-white/90 truncate">{{ userData.email || '---' }}</p>
            </div>
            <div>
              <p class="text-[9px] text-white/30 font-black uppercase tracking-widest mb-1">Teléfono</p>
              <p class="text-lg font-medium text-white/90">{{ userData.phone || 'No registrado' }}</p>
            </div>
            <div>
              <p class="text-[9px] text-white/30 font-black uppercase tracking-widest mb-1">Nivel de Acceso</p>
              <p class="text-lg font-medium text-white/90 capitalize">{{ userData.role || 'User' }}</p>
            </div>
          </div>
        </div>

        <!-- Dates Footer -->
        <div class="mt-10 pt-6 border-t border-white/10 flex gap-12 relative z-10">
          <div>
            <p class="text-[9px] text-white/30 font-black uppercase tracking-widest mb-1 flex items-center gap-1.5">
              <span class="material-symbols-outlined text-[12px]">calendar_month</span> Miembro Desde
            </p>
            <p class="text-sm text-white/70">{{ formatDate(userData.createdAt) }}</p>
          </div>
          <div>
            <p class="text-[9px] text-white/30 font-black uppercase tracking-widest mb-1 flex items-center gap-1.5">
              <span class="material-symbols-outlined text-[12px]">history</span> Último Acceso
            </p>
            <p class="text-sm text-white/70">{{ formatDate(userData.lastLoginAt) }}</p>
          </div>
        </div>
      </div>

      <!-- Right Column: Stats & Plan -->
      <div class="space-y-6 flex flex-col">
        <!-- Stats Card -->
        <div
          class="bg-amber-500/10 border border-amber-500/20 rounded-[2rem] p-8 flex-1 flex flex-col justify-center items-center text-center relative overflow-hidden group">
          <div
            class="absolute inset-0 bg-gradient-to-t from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
          </div>
          <span class="material-symbols-outlined text-amber-500 text-4xl mb-3 relative z-10">qr_code_2</span>
          <p class="text-6xl font-black text-white tracking-tighter relative z-10">{{ userData.totalQRs || 0 }}</p>
          <p class="text-[10px] text-amber-500 font-black uppercase tracking-widest mt-2 relative z-10">QRs Registrados
          </p>
        </div>

        <!-- Plan Card -->
        <div
          class="bg-white/5 border border-white/10 rounded-[2rem] p-8 flex-1 relative overflow-hidden hover:bg-white/10 transition-colors">
          <h3 class="text-[10px] font-black text-white/40 uppercase tracking-widest mb-4">Suscripción</h3>
          <div class="flex flex-col gap-2">
            <div class="flex items-center gap-3">
              <span class="material-symbols-outlined text-white text-3xl">workspace_premium</span>
              <p class="text-3xl font-black tracking-tight capitalize text-white">{{ userData.plan || 'N/A' }}</p>
            </div>
            <div
              class="inline-flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/10 rounded-lg w-fit mt-2">
              <span class="material-symbols-outlined text-[12px] text-white/60">credit_card</span>
              <p class="text-[9px] text-white/60 uppercase tracking-widest font-black">{{ userData.subscriptionStatus ||
                'Unknown' }}</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>
