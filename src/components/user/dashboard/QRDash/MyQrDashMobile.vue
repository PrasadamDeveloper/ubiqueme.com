<template>
  <div class="relative min-h-dvh bg-[#1C1B1F] w-full font-google-sans">
    <div class="px-4 pt-3 pb-32 space-y-4">

      <!-- Header: Compact greeting -->
      <div class="space-y-1">
        <div class="flex items-center gap-1.5">
          <h1 class="text-lg font-bold text-[#E6E1E5] tracking-tight leading-none">Hola de nuevo,</h1>
          <span class="text-orange-500 text-lg font-bold tracking-tight leading-none">{{ useUserStore().getFirstName
          }}</span>
          <span class="text-lg font-black tracking-tighter leading-none text-[#E6E1E5]">!</span>
        </div>
        <p class="text-[#CAC4D0]/50 text-[11px] font-medium">Mis Códigos QR</p>
      </div>

      <!-- Filter tabs (M3 Segmented Control) -->
      <div class="flex bg-[#2B2930] rounded-xl p-0.5">
        <button v-for="option in filterOptions" :key="option.value" @click="plansView = option.value"
          class="flex-1 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all duration-150 cursor-pointer active:scale-[0.98] select-none"
          :class="plansView === option.value
            ? 'bg-orange-500 text-white shadow-sm'
            : 'text-[#CAC4D0]/50 hover:text-[#E6E1E5]'">
          {{ option.label }}
        </button>
      </div>

      <!-- Search bar (M3) -->
      <div class="relative">
        <span
          class="material-symbols-outlined notranslate absolute left-3 top-1/2 -translate-y-1/2 text-[#CAC4D0]/30 text-lg pointer-events-none">search</span>
        <input v-model="searchQuery" type="text" placeholder="Buscar QR por nombre, categoría o ID"
          class="w-full bg-[#2B2930] border border-[#49454F]/30 rounded-xl pl-10 pr-10 py-2.5 text-sm text-[#E6E1E5] placeholder:text-[#CAC4D0]/30 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/10 transition-all" />
        <button v-if="searchQuery" @click="searchQuery = ''"
          class="absolute right-3 top-1/2 -translate-y-1/2 text-[#CAC4D0]/30 hover:text-[#E6E1E5] transition-colors cursor-pointer">
          <span class="material-symbols-outlined notranslate text-lg">close</span>
        </button>
      </div>

      <!-- Content -->
      <div class="space-y-4">
        <!-- Loading -->
        <div v-if="isLoading" class="flex justify-center py-16">
          <LineLoader />
        </div>

        <!-- Groups -->
        <div v-else-if="filteredGroups.length > 0" class="space-y-4">
          <div v-for="group in filteredGroups" :key="group.subscription.id" class="space-y-3">
            <!-- Subscription header card (M3 surface container) -->
            <div class="bg-[#2B2930] rounded-xl p-3 border border-[#49454F]/30">
              <div class="flex items-center justify-between">
                <div>
                  <div class="flex items-center gap-2">
                    <h3 class="text-sm font-bold text-[#E6E1E5] capitalize">Plan {{ group.subscription.planType }}</h3>
                    <span :class="group.subscription.status === 'active'
                      ? 'bg-orange-500/10 text-orange-400 border-orange-500/20'
                      : 'bg-white/10 text-[#CAC4D0]/50 border-white/10'"
                      class="px-2 py-0.5 rounded-full border text-[8px] font-black uppercase tracking-widest">
                      {{ group.subscription.status }}
                    </span>
                  </div>
                  <p class="text-[#CAC4D0]/30 text-[9px] font-mono mt-0.5">ID: {{ group.subscription.id.slice(0, 8) }}..
                  </p>
                </div>
                <div class="text-right">
                  <span class="text-[11px] font-medium text-[#E6E1E5]">{{ group.subscription.totalQRsCreated }} / {{
                    group.subscription.totalQRsAllowed }}</span>
                  <div class="w-24 h-1 bg-[#49454F]/30 rounded-full mt-1 overflow-hidden ml-auto">
                    <div class="h-full bg-orange-500 rounded-full transition-all duration-500"
                      :style="{ width: `${Math.min((group.subscription.totalQRsCreated / group.subscription.totalQRsAllowed) * 100, 100)}%` }">
                    </div>
                  </div>
                </div>
              </div>
              <button v-if="group.subscription.status === 'active'"
                @click="() => toggleCreateQrModal(group.subscription)"
                class="mt-2.5 w-full h-9 rounded-xl bg-orange-500 text-black text-[9px] font-bold uppercase tracking-wider hover:bg-orange-400 transition-all active:scale-[0.98] flex items-center justify-center gap-1 cursor-pointer">
                <span class="material-symbols-outlined notranslate text-[14px]">add</span>
                Asignar QR
              </button>
            </div>

            <!-- QRs list -->
            <div v-if="group.qrs.length > 0" class="space-y-2">
              <QRCardMobile v-for="qr in group.qrs" :key="qr.id" :id="qr.id" :name="qr.name" :category="qr.category"
                :status="qr.status" :scans="qr.scans" :lastScan="qr.lastScan" :docId="qr.docId" :link="qr.link"
                :isActive="qr.isActive" :isBanned="qr.isBanned" :banReason="qr.banReason" :createdAt="qr.createdAt"
                :subscriptionId="qr.subscriptionId" :physicalShipped="qr.physicalShipped"
                :physicalShippedAt="qr.physicalShippedAt" :planType="group.subscription.planType"
                @request-physical="handleRequestPhysical(group.subscription)" />
            </div>

            <div v-else class="py-4 flex flex-col items-center gap-1">
              <span class="material-symbols-outlined notranslate text-[#CAC4D0]/20 text-3xl">qr_code</span>
              <p class="text-[#CAC4D0]/40 text-xs italic">No hay QRs en esta suscripción</p>
            </div>
          </div>
        </div>

        <!-- Empty: no subscriptions -->
        <div v-else-if="groupedQRs.length === 0" class="flex flex-col items-center justify-center py-16 text-center">
          <span
            class="material-symbols-outlined notranslate text-5xl text-[#CAC4D0]/20 mb-3">account_balance_wallet</span>
          <h3 class="text-base font-semibold text-[#E6E1E5] mb-1">No tiene suscripciones activas</h3>
          <p class="text-[#CAC4D0]/50 text-xs mb-4">Adquiera un plan para registrar códigos QR.</p>
          <RouterLink to="/pricing"
            class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-500 text-black font-black text-xs uppercase tracking-widest hover:bg-orange-400 transition-all">
            <span class="material-symbols-outlined notranslate text-sm">workspace_premium</span>
            Ver Planes
          </RouterLink>
        </div>

        <!-- Empty: filter no results -->
        <div v-else class="flex flex-col items-center justify-center py-16 text-center">
          <span class="material-symbols-outlined notranslate text-5xl text-[#CAC4D0]/20 mb-3">search_off</span>
          <h3 class="text-base font-semibold text-[#E6E1E5] mb-1 capitalize">No hay planes {{ plansView }}</h3>
          <p class="text-[#CAC4D0]/50 text-xs">No se encontraron suscripciones con este estado.</p>
        </div>
      </div>
    </div>

    <!-- FAB: Create QR -->
    <button @click="toggleCreateQrModal"
      class="fixed right-5 bottom-28 z-30 w-14 h-14 rounded-full bg-orange-500 text-black shadow-lg shadow-orange-500/30 flex items-center justify-center active:scale-90 transition-all cursor-pointer">
      <span class="material-symbols-outlined notranslate text-[28px]">add</span>
    </button>

    <!-- Create QR Modal (M3 Dialog) -->
    <Teleport to="body">
      <Transition enter-active-class="transition-all duration-200 ease-out" enter-from-class="opacity-0"
        enter-to-class="opacity-100" leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="opacity-100" leave-to-class="opacity-0">
        <div v-if="showCreateQRModal" @click.self="showCreateQRModal = false"
          class="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-6">
          <div class="w-full max-w-sm bg-[#2B2930] rounded-2xl border border-[#49454F]/30 overflow-hidden shadow-2xl">
            <div class="p-4 border-b border-[#49454F]/30">
              <h3 class="text-base font-bold text-[#E6E1E5]">Crear QR</h3>
              <p class="text-[#CAC4D0]/50 text-[11px] mt-0.5">Complete los datos para generar su código</p>
            </div>
            <div class="p-4 space-y-3">
              <div>
                <label
                  class="text-[9px] font-bold uppercase tracking-wider text-[#CAC4D0]/50 ml-1 mb-1 block">Nombre</label>
                <input v-model="newQrName" type="text" placeholder="Ej: Mi laptop personal"
                  class="w-full h-10 px-3 rounded-xl border border-[#49454F]/50 bg-[#1C1B1F] text-[#E6E1E5] text-sm placeholder:text-[#CAC4D0]/30 outline-none focus:border-orange-500/50 transition-all" />
              </div>
              <div>
                <label
                  class="text-[9px] font-bold uppercase tracking-wider text-[#CAC4D0]/50 ml-1 mb-1 block">Categoría</label>
                <select v-model="selectedCategory"
                  class="w-full h-10 px-3 rounded-xl border border-[#49454F]/50 bg-[#1C1B1F] text-[#E6E1E5] text-sm outline-none focus:border-orange-500/50 cursor-pointer appearance-none transition-all">
                  <option value="vehicle" class="bg-[#2B2930]">Vehículos</option>
                  <option value="home" class="bg-[#2B2930]">Hogares</option>
                  <option value="phone" class="bg-[#2B2930]">Celulares</option>
                  <option value="laptop" class="bg-[#2B2930]">Laptops</option>
                  <option value="bags" class="bg-[#2B2930]">Mochilas / Maletas</option>
                  <option value="keys" class="bg-[#2B2930]">Llaves</option>
                  <option value="pets" class="bg-[#2B2930]">Mascotas</option>
                  <option value="documents" class="bg-[#2B2930]">Documentos</option>
                  <option value="other" class="bg-[#2B2930]">Otro</option>
                </select>
              </div>
            </div>
            <div class="p-4 border-t border-[#49454F]/30 flex gap-2">
              <button @click="showCreateQRModal = false"
                class="flex-1 h-10 rounded-xl border border-[#49454F]/30 text-[#CAC4D0]/70 text-xs font-bold hover:bg-white/5 transition-all cursor-pointer">Cancelar</button>
              <button @click="createQRForSubscription" :disabled="isCreatingQR"
                class="flex-1 h-10 rounded-xl bg-orange-500 text-black text-xs font-bold hover:bg-orange-400 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5">
                <span v-if="isCreatingQR"
                  class="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin"></span>
                {{ isCreatingQR ? 'Creando...' : 'Crear QR' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Limit Reached Dialog (M3 Alert Dialog) -->
    <LimitReached :subscriptionName="selectedSubscription?.planType ?? ''" v-if="showLimitReached"
      @close="showLimitReached = false" />

    <!-- Physical QR Overlay -->
    <RequestQROverlayMobile :visible="showPhysicalOverlay" :subscription="overlaySubscription" :qrs="overlayQrs"
      @close="closePhysicalOverlay" @confirm="closePhysicalOverlay" />

    <!-- Phone Prompt -->
    <PhonePrompt v-if="showPhonePrompt" @saved="showPhonePrompt = false" @dismiss="showPhonePrompt = false" />
  </div>
</template>

<script lang="ts" setup>
import { useUserStore } from '@/stores/user'
import QRCardMobile from './QRCardMobile.vue'
import RequestQROverlayMobile from './RequestQROverlayMobile.vue'
import { onMounted, onUnmounted, ref, computed } from 'vue'
import { collection, getFirestore, onSnapshot, Timestamp, doc, increment, writeBatch, getDoc, FirestoreError } from 'firebase/firestore'
import { useImageStore } from '@/stores/imageStore'
import type { IMyQR } from '@/interfaces/IMyQR'
import type { IQRCard } from '@/interfaces/IQRCard'
import type { ISubscription } from '@/interfaces/ISubscription'
import { nanoid } from 'nanoid'
import LineLoader from '@/components/ui/LineLoader.vue'
import { toast } from 'vue-sonner'
import PhonePrompt from './PhonePrompt.vue'
import LimitReached from './LimitReached.vue'

const userQRs = ref<IMyQR[]>([])
const userSubscriptions = ref<ISubscription[]>([])
const userStore = useUserStore()
const isLoading = ref(true)
const noQRsFound = ref(false)
const db = getFirestore()
const userId = userStore.getUserId ?? ''
const userQrsCollection = collection(db, `users/${userId}/qrs`)
const subscriptionsCollection = collection(db, `users/${userId}/subscriptions`)

const searchQuery = ref('')
const plansView = ref<'active' | 'inactive' | 'canceled'>('active')

const filterOptions = [
  { value: 'active', label: 'Activos' },
  { value: 'inactive', label: 'Inactivos' },
  { value: 'canceled', label: 'Cancelados' },
] as const

const groupedQRs = computed(() => {
  return userSubscriptions.value.map((sub) => ({
    subscription: sub,
    qrs: userQRs.value.filter((qr) => qr.subscriptionId === sub.id),
  }))
})

const filteredGroups = computed(() => {
  const statusFiltered = groupedQRs.value.filter((group) => group.subscription.status === plansView.value)
  if (!searchQuery.value.trim()) return statusFiltered
  const query = searchQuery.value.toLowerCase().trim()
  return statusFiltered
    .map((group) => ({
      ...group,
      qrs: group.qrs.filter((qr) =>
        qr.name.toLowerCase().includes(query) ||
        qr.category.toLowerCase().includes(query) ||
        qr.id.toLowerCase().includes(query)
      ),
    }))
    .filter((group) => group.qrs.length > 0)
})

const showPhysicalOverlay = ref(false)
const overlaySubscription = ref<ISubscription | null>(null)

const handleRequestPhysical = (subscription: ISubscription) => {
  overlaySubscription.value = subscription
  showPhysicalOverlay.value = true
}

const closePhysicalOverlay = () => {
  showPhysicalOverlay.value = false
  overlaySubscription.value = null
}

const overlayQrs = computed(() => {
  if (!overlaySubscription.value) return []
  const group = groupedQRs.value.find(g => g.subscription.id === overlaySubscription.value?.id)
  return group?.qrs ?? []
})

const imageStore = useImageStore()
const showPhonePrompt = ref(false)
const showCreateQRModal = ref(false)
const isCreatingQR = ref(false)
const newQrName = ref('')
const selectedCategory = ref('other')

const selectedSubscription = ref<ISubscription | null>(null)
const showLimitReached = ref(false)

const toggleCreateQrModal = (sub?: ISubscription) => {
  if (sub) {
    selectedSubscription.value = sub
    if (sub.totalQRsCreated >= sub.totalQRsAllowed) {
      showLimitReached.value = true
      return
    }
  } else {
    const activeSub = userSubscriptions.value.find(s => s.status === 'active' && s.totalQRsCreated < s.totalQRsAllowed)
    if (!activeSub) {
      toast.error('No tiene suscripciones activas con capacidad disponible')
      return
    }
    selectedSubscription.value = activeSub
  }
  showCreateQRModal.value = !showCreateQRModal.value
}

const createQRForSubscription = async () => {
  const activeSub = userSubscriptions.value.find(s => s.status === 'active' && s.totalQRsCreated < s.totalQRsAllowed)
  if (!activeSub) {
    toast.error('No hay suscripción activa con capacidad disponible')
    return
  }

  isCreatingQR.value = true
  try {
    const randomId = nanoid(15)
    const qrData: IQRCard = {
      banReason: '', createdAt: Timestamp.now(), id: randomId, isActive: true,
      isBanned: false, lastScan: '', name: newQrName.value || 'QR sin nombre',
      scans: 0, status: 'Active', docId: '', subscriptionId: activeSub.id || 'Not Defined',
      freeShipmentUsed: false, physicalShipped: false, physicalShippedAt: '',
      shippingNotes: '', img: '', link: '', category: selectedCategory.value,
    }

    const userDocRef = doc(db, `users/${userId}/qrs/${randomId}`)
    const userRef = doc(db, `users/${userId}`)
    const userSubRef = doc(db, `users/${userId}/subscriptions/${activeSub.id}`)
    const publicDocRef = doc(db, `publicQR/${randomId}`)

    const batch = writeBatch(db)
    batch.set(userDocRef, { ...qrData, uid: userId })
    batch.update(userRef, { totalQRs: increment(1) })
    batch.update(userSubRef, { totalQRsCreated: increment(1) })
    batch.set(publicDocRef, {
      id: randomId, name: qrData.name, category: qrData.category, status: qrData.status,
      lastScan: qrData.lastScan, totalScans: qrData.scans, isBanned: qrData.isBanned,
      banReason: qrData.banReason, uid: userId, tier: activeSub.planType ?? 'free',
      createdAt: qrData.createdAt, docId: randomId, isPublic: true,
    })

    await batch.commit()
    toast.success('QR creado exitosamente')
    showCreateQRModal.value = false
    newQrName.value = ''
  } catch (error) {
    toast.error(`Fallo al crear el QR: ${error}`)
  } finally {
    isCreatingQR.value = false
  }
}

let unsubQRs: (() => void) | undefined
let unsubSubs: (() => void) | undefined

onMounted(async () => {
  if (userId) {
    try {
      const userSnap = await getDoc(doc(db, 'users', userId))
      if (userSnap.exists()) {
        const userData = userSnap.data()
        const phone = userData?.phone ?? ''
        userStore.setUserPhone(phone)
        showPhonePrompt.value = !phone
      }
    } catch (e) {
      console.error('[PhonePrompt] Error fetching user phone:', e)
    }
  }

  unsubSubs = onSnapshot(subscriptionsCollection, (snapshot) => {
    userSubscriptions.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as ISubscription[]
  }, (error: FirestoreError) => {
    if (error.code !== 'permission-denied') toast.error(`Error obteniendo suscripciones: ${error}`)
  })

  unsubQRs = onSnapshot(userQrsCollection, (snapshot) => {
    if (snapshot.empty) {
      noQRsFound.value = true
      isLoading.value = false
      userQRs.value = []
      return
    }
    userQRs.value = []
    snapshot.docs.forEach(doc => {
      userQRs.value.push({ docId: doc.id, ...doc.data() } as IMyQR)
    })
    noQRsFound.value = false
    setTimeout(() => { isLoading.value = false }, 600)
  }, (error: FirestoreError) => {
    if (error.code !== 'permission-denied') toast.error(`Error obteniendo QRs: ${error}`)
    isLoading.value = false
  })
})

onUnmounted(() => {
  if (unsubQRs) unsubQRs()
  if (unsubSubs) unsubSubs()
  isLoading.value = true
  imageStore.clearImages()
})
</script>

<style scoped>
.material-symbols-outlined {
  font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}
</style>
