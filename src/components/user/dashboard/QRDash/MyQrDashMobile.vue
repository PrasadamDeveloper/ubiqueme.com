<template>
  <div class="min-h-dvh bg-white font-google-sans">
    <!-- Pattern overlay -->
    <div class="fixed inset-0 opacity-[0.05] pointer-events-none bg-pattern-diamond"></div>

    <!-- Floating icons -->
    <div class="fixed inset-0 overflow-hidden pointer-events-none select-none" aria-hidden="true">
      <span class="material-symbols-outlined notranslate absolute top-[12%] right-[3%] text-4xl text-orange-500 opacity-[0.02] animate-float-slow">qr_code</span>
      <span class="material-symbols-outlined notranslate absolute bottom-[18%] left-[2%] text-3xl text-orange-500 opacity-[0.02] animate-float-medium">verified</span>
    </div>

    <!-- Ambient glow -->
    <div class="fixed top-0 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-orange-500/5 rounded-full blur-[100px] pointer-events-none"></div>

    <div class="px-4 pt-2 pb-32 space-y-6">

      <!-- Header -->
      <div class="pt-1">
        <h1 class="text-[30px] font-semibold text-[#1C1C1E] tracking-tight leading-tight">
          Hola de nuevo, <span class="text-orange-500">{{ useUserStore().getFirstName }}</span>!
        </h1>
        <p class="text-[14px] text-[#8E8E93] font-medium mt-0.5">Mis Códigos QR</p>
      </div>

      <!-- Segmented Control (iOS style) -->
      <div class="bg-[#E5E5EA] rounded-xl p-0.5 flex">
        <button v-for="option in filterOptions" :key="option.value" @click="plansView = option.value"
          class="flex-1 py-2 text-[13px] font-semibold rounded-lg transition-all duration-150 cursor-pointer select-none"
          :class="plansView === option.value
            ? 'bg-white text-[#1C1C1E] shadow-sm'
            : 'text-[#8E8E93] hover:text-[#3A3A3C]'">
          {{ option.label }}
        </button>
      </div>

      <!-- Search bar (iOS Settings style) -->
      <div class="relative">
        <span
          class="material-symbols-outlined notranslate absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8E8E93] text-[17px] pointer-events-none">search</span>
        <input v-model="searchQuery" type="text" placeholder="Buscar QR por nombre, categoría o ID"
          class="w-full bg-[#E5E5EA] rounded-2xl pl-10 pr-10 py-3 text-[15px] text-[#1C1C1E] placeholder:text-[#8E8E93] outline-none" />
        <button v-if="searchQuery" @click="searchQuery = ''"
          class="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8E8E93] hover:text-[#3A3A3C] transition-colors cursor-pointer">
          <span class="material-symbols-outlined notranslate text-lg">close</span>
        </button>
      </div>

      <!-- Quick Stats (iOS Wallet style) -->
      <div v-if="userSubscriptions.length > 0" class="flex gap-3">
        <div class="flex-1 bg-white rounded-2xl px-3.5 py-3 min-w-0">
          <div class="flex items-center gap-3">
            <div class="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 shrink-0">
              <span class="material-symbols-outlined notranslate text-orange-500 text-[17px]">workspace_premium</span>
            </div>
            <div class="min-w-0">
              <p class="text-[11px] text-[#8E8E93] font-medium leading-tight">Plan</p>
              <p class="text-[14px] font-semibold text-[#1C1C1E] truncate capitalize leading-tight mt-0.5">{{ userSubscriptions[0]?.planType || '—' }}</p>
            </div>
          </div>
        </div>
        <div class="flex-1 bg-white rounded-2xl px-3.5 py-3 min-w-0">
          <div class="flex items-center gap-3">
            <div class="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 shrink-0">
              <span class="material-symbols-outlined notranslate text-orange-500 text-[17px]">qr_code</span>
            </div>
            <div class="min-w-0">
              <p class="text-[11px] text-[#8E8E93] font-medium leading-tight">QRs</p>
              <p class="text-[14px] font-semibold text-[#1C1C1E] truncate leading-tight mt-0.5">{{ activeQRs.length }}</p>
            </div>
          </div>
        </div>
        <div class="flex-1 bg-white rounded-2xl px-3.5 py-3 min-w-0">
          <div class="flex items-center gap-3">
            <div class="flex h-8 w-8 items-center justify-center rounded-full shrink-0"
              :class="userSubscriptions.some(s => s.status === 'active') ? 'bg-emerald-100' : 'bg-slate-200'">
              <span class="material-symbols-outlined notranslate text-[17px]"
                :class="userSubscriptions.some(s => s.status === 'active') ? 'text-emerald-600' : 'text-slate-500'">schedule</span>
            </div>
            <div class="min-w-0">
              <p class="text-[11px] text-[#8E8E93] font-medium leading-tight">Estado</p>
              <p class="text-[14px] font-semibold truncate leading-tight mt-0.5"
                :class="userSubscriptions.some(s => s.status === 'active') ? 'text-emerald-600' : 'text-[#8E8E93]'">
                {{ userSubscriptions.some(s => s.status === 'active') ? 'Activo' : 'Inactivo' }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Content -->
      <div class="space-y-6">
        <!-- Loading -->
        <div v-if="isLoading" class="flex justify-center py-20">
          <div class="w-8 h-8 border-2.5 border-[#E5E5EA] border-t-orange-500 rounded-full animate-spin"></div>
        </div>

        <!-- Groups -->
        <div v-else-if="filteredGroups.length > 0" class="space-y-6">
          <div v-for="group in filteredGroups" :key="group.subscription.id" class="space-y-3">
            <!-- Subscription card -->
            <div class="bg-white rounded-2xl overflow-hidden">

              <!-- Header cell -->
              <div class="px-4 pt-4 pb-3">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2 min-w-0 flex-1">
                    <h3 class="text-[15px] font-semibold text-[#1C1C1E] capitalize truncate">
                      Plan {{ group.subscription.planType === 'trial' ? 'Bronce de prueba' : group.subscription.planType }}
                    </h3>
                    <span
                      :class="group.subscription.planType === 'trial' && group.subscription.status === 'inactive' ? 'bg-amber-50 text-amber-600' : group.subscription.status === 'active' ? 'bg-orange-50 text-orange-500' : 'bg-slate-100 text-[#8E8E93]'"
                      class="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-semibold">
                      {{ group.subscription.planType === 'trial' && group.subscription.status === 'inactive' ? 'Acabado' : group.subscription.status === 'active' ? 'Activo' : group.subscription.status === 'canceled' ? 'Cancelado' : 'Inactivo' }}
                    </span>
                  </div>
                  <div class="text-right shrink-0 ml-3">
                    <span class="text-[13px] font-medium text-[#3A3A3C]">{{ group.subscription.totalQRsCreated }} / {{ group.subscription.totalQRsAllowed }}</span>
                  </div>
                </div>
                <p class="text-[11px] text-[#8E8E93] font-mono mt-1">ID: {{ group.subscription.id.slice(0, 8) }}..</p>
              </div>

              <!-- Progress cell with separator -->
              <div class="px-4 pb-2 border-b border-[#C6C6C8]/20">
                <div class="h-[3px] bg-[#F2F2F7] rounded-full overflow-hidden">
                  <div class="h-full bg-orange-500 rounded-full transition-all duration-500"
                    :style="{ width: `${Math.min((group.subscription.totalQRsCreated / group.subscription.totalQRsAllowed) * 100, 100)}%` }">
                  </div>
                </div>
              </div>

              <!-- Info banner (conditional) with separator -->
              <template v-if="group.subscription.planType === 'trial' && group.subscription.status === 'active'">
                <div class="border-b border-[#C6C6C8]/20">
                  <div class="px-4 py-3">
                    <div class="flex items-start gap-2.5">
                      <div class="flex h-7 w-7 items-center justify-center rounded-full bg-orange-100 shrink-0 mt-0.5">
                        <span class="material-symbols-outlined notranslate text-[14px] text-orange-500">info</span>
                      </div>
                      <p class="text-[13px] leading-relaxed text-[#3A3A3C]">
                        Este es un <strong class="font-semibold text-orange-500">plan gratuito de prueba</strong> con duración de 1 año. Termina el <strong class="font-semibold text-[#1C1C1E]">{{ formatEndDate(group.subscription.endDate) }}</strong>.
                      </p>
                    </div>
                  </div>
                </div>
              </template>

              <template v-else-if="(group.subscription.planType === 'trial' && group.subscription.status === 'canceled') || group.subscription.status === 'canceled'">
                <div class="border-b border-[#C6C6C8]/20">
                  <div class="px-4 py-3">
                    <div class="flex items-start gap-2.5">
                      <div class="flex h-7 w-7 items-center justify-center rounded-full bg-red-50 shrink-0 mt-0.5">
                        <span class="material-symbols-outlined notranslate text-[14px] text-red-400">cancel</span>
                      </div>
                      <p class="text-[13px] leading-relaxed text-red-600">
                        Plan <strong class="font-semibold">{{ group.subscription.planType === 'trial' ? 'de prueba' : group.subscription.planType }}</strong> cancelado — QRs no disponibles
                      </p>
                    </div>
                  </div>
                </div>
              </template>

              <template v-else-if="group.subscription.planType === 'trial' && group.subscription.status === 'inactive'">
                <div class="border-b border-[#C6C6C8]/20">
                  <div class="px-4 py-3">
                    <div class="flex items-start gap-2.5">
                      <div class="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 shrink-0 mt-0.5">
                        <span class="material-symbols-outlined notranslate text-[14px] text-[#8E8E93]">schedule</span>
                      </div>
                      <p class="text-[13px] leading-relaxed text-[#8E8E93]">Plan de prueba finalizado — reactiva tus QRs</p>
                    </div>
                  </div>
                </div>
              </template>

              <template v-else-if="group.subscription.status === 'active'">
                <div class="border-b border-[#C6C6C8]/20">
                  <div class="px-4 py-3">
                    <div class="flex items-start gap-2.5">
                      <div class="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-50 shrink-0 mt-0.5">
                        <span class="material-symbols-outlined notranslate text-[14px] text-emerald-500">check_circle</span>
                      </div>
                      <p class="text-[13px] leading-relaxed text-emerald-700">
                        Plan <strong class="font-semibold text-emerald-600 capitalize">{{ group.subscription.planType }}</strong> activo
                        <span v-if="group.subscription.endDate"> — termina {{ formatEndDate(group.subscription.endDate) }}</span>
                        <span v-else> — sin vencimiento</span>
                        · {{ group.subscription.totalQRsAllowed - group.subscription.totalQRsCreated }}/{{ group.subscription.totalQRsAllowed }} QRs
                      </p>
                    </div>
                  </div>
                </div>
              </template>

              <template v-else>
                <div class="border-b border-[#C6C6C8]/20">
                  <div class="px-4 py-3">
                    <div class="flex items-start gap-2.5">
                      <div class="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 shrink-0 mt-0.5">
                        <span class="material-symbols-outlined notranslate text-[14px] text-[#8E8E93]">remove_circle</span>
                      </div>
                      <p class="text-[13px] leading-relaxed text-[#8E8E93]">Plan <strong class="font-semibold text-[#3A3A3C] capitalize">{{ group.subscription.planType }}</strong> inactivo</p>
                    </div>
                  </div>
                </div>
              </template>

              <!-- Assign QR button cell -->
              <div v-if="group.subscription.status === 'active'" class="px-4 py-3">
                <button @click="() => toggleCreateQrModal(group.subscription)"
                  class="w-full h-10 rounded-full bg-orange-500 text-white text-[13px] font-semibold hover:bg-orange-600 transition-all duration-150 active:scale-[0.97] flex items-center justify-center gap-1.5 cursor-pointer">
                  <span class="material-symbols-outlined notranslate text-[16px]">add</span>
                  Asignar QR
                </button>
              </div>
            </div>

            <!-- QR section label -->
            <div v-if="group.qrs.length > 0" class="flex items-center gap-2 px-1 pt-1">
              <span class="text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider">Códigos QR</span>
              <div class="flex-1 h-px bg-[#C6C6C8]/20"></div>
            </div>

            <!-- QRs list -->
            <div v-if="group.qrs.length > 0" class="space-y-2">
              <QRCardMobile v-for="qr in group.qrs" :key="qr.id" :id="qr.id" :name="qr.name" :category="qr.category"
                :status="qr.status" :scans="qr.scans" :lastScan="qr.lastScan" :docId="qr.docId" :link="qr.link"
                :subscriptionStatus="group.subscription.status" :isActive="qr.isActive" :isBanned="qr.isBanned"
                :banReason="qr.banReason" :createdAt="qr.createdAt" :subscriptionId="qr.subscriptionId"
                :physicalShipped="qr.physicalShipped" :physicalShippedAt="qr.physicalShippedAt"
                :planType="group.subscription.planType" @request-physical="handleRequestPhysical(group.subscription)" />
            </div>

            <div v-else class="py-6 flex flex-col items-center gap-2">
              <div class="flex h-10 w-10 items-center justify-center rounded-full bg-[#F2F2F7]">
                <span class="material-symbols-outlined notranslate text-[#8E8E93] text-[20px]">qr_code</span>
              </div>
              <p class="text-[13px] text-[#8E8E93] font-medium">No hay QRs en esta suscripción</p>
            </div>
          </div>
        </div>

        <!-- Empty: no subscriptions -->
        <div v-else-if="groupedQRs.length === 0"
          class="flex flex-col items-center justify-center py-24 text-center px-8">
          <div class="flex h-16 w-16 items-center justify-center rounded-full bg-orange-50 mb-5">
            <span class="material-symbols-outlined notranslate text-[28px] text-orange-500">account_balance_wallet</span>
          </div>
          <h3 class="text-[18px] font-semibold text-[#1C1C1E] mb-1.5">No tienes suscripciones activas</h3>
          <p class="text-[14px] text-[#8E8E93] mb-7 max-w-[280px] leading-relaxed">Adquiere un plan para registrar códigos QR y comenzar a proteger tus pertenencias.</p>
          <RouterLink to="/pricing"
            class="inline-flex items-center gap-2 h-12 px-8 rounded-full bg-orange-500 text-white text-[15px] font-semibold hover:bg-orange-600 active:scale-[0.97] transition-all duration-150 shadow-sm">
            <span class="material-symbols-outlined notranslate text-[18px]">workspace_premium</span>
            Ver Planes
          </RouterLink>
        </div>

        <!-- Empty: filter no results -->
        <div v-else class="flex flex-col items-center justify-center py-24 text-center px-8">
          <div class="flex h-14 w-14 items-center justify-center rounded-full bg-[#F2F2F7] mb-4">
            <span class="material-symbols-outlined notranslate text-[24px] text-[#8E8E93]">search_off</span>
          </div>
          <h3 class="text-[18px] font-semibold text-[#1C1C1E] mb-1.5 capitalize">No hay planes {{ plansView }}</h3>
          <p class="text-[14px] text-[#8E8E93]">No se encontraron suscripciones con este estado.</p>
        </div>
      </div>
    </div>

    <!-- Create QR Modal (iOS Form Sheet) -->
    <Teleport to="body">
      <Transition enter-active-class="transition-all duration-300 ease-out" enter-from-class="opacity-0"
        enter-to-class="opacity-100" leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="opacity-100" leave-to-class="opacity-0">
        <div v-if="showCreateQRModal" @click.self="showCreateQRModal = false"
          class="fixed inset-0 bg-black/40 z-50 flex items-end justify-center p-0">
          <div class="w-full max-w-lg bg-white rounded-3xl rounded-b-none overflow-hidden shadow-xl"
            enter-active-class="transition-all duration-300 ease-out" enter-from-class="translate-y-full"
            enter-to-class="translate-y-0" leave-active-class="transition-all duration-200 ease-in"
            leave-from-class="translate-y-0" leave-to-class="translate-y-full">
            <!-- Handle -->
            <div class="flex justify-center pt-3 pb-1">
              <div class="w-9 h-1 bg-[#C6C6C8] rounded-full"></div>
            </div>
            <!-- Header -->
            <div class="px-6 pt-2 pb-5">
              <h3 class="text-[17px] font-semibold text-[#1C1C1E]">Crear QR</h3>
              <p class="text-[13px] text-[#8E8E93] mt-0.5">Complete los datos para generar su código</p>
            </div>
            <!-- Form fields -->
            <div class="px-6 pb-2 space-y-4">
              <div>
                <label class="text-[13px] font-medium text-[#3A3A3C] mb-1.5 block">Nombre</label>
                <input v-model="newQrName" type="text" placeholder="Ej: Mi laptop personal"
                  class="w-full h-11 px-4 rounded-2xl bg-[#F2F2F7] text-[#1C1C1E] text-[15px] placeholder:text-[#8E8E93] outline-none" />
              </div>
              <div>
                <label class="text-[13px] font-medium text-[#3A3A3C] mb-1.5 block">Categoría</label>
                <select v-model="selectedCategory"
                  class="w-full h-11 px-4 rounded-2xl bg-[#F2F2F7] text-[#1C1C1E] text-[15px] outline-none appearance-none cursor-pointer">
                  <option value="vehicle">Vehículos</option>
                  <option value="home">Hogares</option>
                  <option value="phone">Celulares</option>
                  <option value="laptop">Laptops</option>
                  <option value="bags">Mochilas / Maletas</option>
                  <option value="keys">Llaves</option>
                  <option value="pets">Mascotas</option>
                  <option value="documents">Documentos</option>
                  <option value="other">Otro</option>
                </select>
              </div>
            </div>
            <!-- Actions -->
            <div class="px-6 pt-4 pb-8 space-y-2.5">
              <button @click="createQRForSubscription" :disabled="isCreatingQR"
                class="w-full h-11 rounded-full bg-orange-500 text-white text-[15px] font-semibold hover:bg-orange-600 transition-all duration-150 active:scale-[0.97] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                <span v-if="isCreatingQR" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                {{ isCreatingQR ? 'Creando...' : 'Crear QR' }}
              </button>
              <button @click="showCreateQRModal = false"
                class="w-full h-11 rounded-full bg-[#F2F2F7] text-[#8E8E93] text-[15px] font-semibold hover:bg-[#E5E5EA] transition-all duration-150 active:scale-[0.97] cursor-pointer">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Limit Reached Dialog -->
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

const activeQRs = computed(() => {
  const activeIds = new Set(userSubscriptions.value.filter(s => s.status === 'active').map(s => s.id))
  return userQRs.value.filter(qr => activeIds.has(qr.subscriptionId))
})

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

// ─── Helpers ────────────────────────────────────────────────────
function formatEndDate(date: Timestamp | null): string {
  if (!date) return 'fecha no disponible'
  const d = date.toDate()
  return d.toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
</script>

<style scoped>
.material-symbols-outlined {
  font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}
</style>
