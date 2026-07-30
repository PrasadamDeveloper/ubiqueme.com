<template>
  <div class="relative min-h-screen bg-gray-50 w-full font-google-sans overflow-hidden">

    <!-- Grid overlay -->
    <div class="absolute inset-0 opacity-[0.02] pointer-events-none"
      style="background-image: linear-gradient(rgba(0,0,0,.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,.03) 1px, transparent 1px); background-size: 48px 48px;">
    </div>

    <!-- Radial glow -->
    <div
      class="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-orange-500/5 rounded-full blur-[120px] pointer-events-none">
    </div>

    <!-- Dot pattern overlay -->
    <div class="absolute inset-0 opacity-[0.12] pointer-events-none bg-pattern-dots"></div>

    <!-- Decorative floating icons -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none select-none" aria-hidden="true">
      <span
        class="material-symbols-outlined notranslate absolute top-[15%] right-[5%] text-7xl text-orange-500 opacity-[0.03] animate-float-slow max-md:text-5xl max-md:top-[10%] max-md:right-[2%]">qr_code</span>
      <span
        class="material-symbols-outlined notranslate absolute bottom-[20%] left-[3%] text-6xl text-orange-500 opacity-[0.03] animate-float-medium max-md:text-4xl max-md:bottom-[15%] max-md:left-[1%]">verified</span>
      <span
        class="material-symbols-outlined notranslate absolute top-[55%] left-[8%] text-5xl text-orange-500 opacity-[0.025] animate-float-slow max-md:text-3xl max-md:top-[50%] max-md:hidden">shield</span>
    </div>

    <!-- Decorative circle -->
    <div
      class="absolute top-[-5%] right-[5%] w-[350px] h-[350px] border border-orange-500/10 rounded-full pointer-events-none max-md:hidden"
      aria-hidden="true"></div>

    <div class="relative z-10 px-4 sm:px-6 lg:px-8 pt-5 pb-20  mx-auto space-y-10">

      <!-- Header Section -->
      <div
        class="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-slate-200 pb-8 animate-fade-up">
        <div>
          <p class="text-slate-700 font-poppins font-medium  text-2xl mb-2">Mis Códigos QR <span
              class="material-symbols-outlined notranslate text-5xl md:text-6xl text-orange-500 align-middle">qr_code</span>
          </p>

          <div class="flex items-center gap-2">
            <h2
              class="text-4xl md:text-5xl font-semibold font-google-sans tracking-tighter leading-none italic text-slate-900 animate-fade-up">
              Hola de nuevo,
            </h2>
            <span
              class="text-orange-500 text-4xl md:text-5xl font-semibold tracking-tighter leading-none italic animate-fade-up animate-delay-[.3s]">{{
                useUserStore().getFirstName }}</span><span
              class="text-4xl md:text-5xl font-black tracking-tighter leading-none italic text-slate-900 animate-fade-up animate-delay-[.38s]">!</span>
          </div>

        </div>

        <!-- Botón de admin (solo visible para usuarios con role admin) -->
        <RouterLink v-if="userStore.getRole === 'admin'" to="/admin"
          class="inline-flex items-center gap-2 bg-gradient-to-r from-orange-50 to-orange-100/80 text-orange-600 border border-orange-200 px-5 py-2.5 rounded-xl font-medium text-sm active:scale-95 cursor-pointer hover:from-orange-100 hover:to-orange-200 hover:border-orange-300 transition-all shadow-sm">
          <span class="material-symbols-outlined notranslate text-lg">admin_panel_settings</span>
          Ir al panel de admin
        </RouterLink>
      </div>

      <!-- Filtro de planes: estilo Cloudflare segmented control -->
      <div class="flex items-center gap-2 animate-fade-up">
        <button v-for="option in filterOptions" :key="option.value" @click="plansView = option.value" :class="[
          plansView === option.value
            ? 'bg-orange-500 text-white border-orange-500 shadow-sm shadow-orange-500/20'
            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900',
        ]"
          class="px-4 py-2 rounded-lg border text-xs font-semibold transition-all duration-150 cursor-pointer active:scale-95 select-none">
          {{ option.label }}
        </button>
      </div>

      <!-- Search Bar -->
      <div class="relative animate-fade-up">
        <span
          class="material-symbols-outlined notranslate absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl pointer-events-none">search</span>
        <input v-model="searchQuery" type="text" placeholder="Buscar QR por nombre, categoría o ID..."
          class="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-10 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/10 transition-all" />
        <button v-if="searchQuery" @click="searchQuery = ''"
          class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">
          <span class="material-symbols-outlined notranslate text-lg">close</span>
        </button>
      </div>

      <!-- Quick Stats Row -->
      <div v-if="userSubscriptions.length > 0" class="flex flex-wrap gap-3 animate-fade-up">
        <!-- Plan -->
        <div
          class="flex items-center gap-3 flex-1 min-w-0 rounded-2xl bg-slate-50/90 px-4 py-3 border border-slate-100">
          <div class="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100">
            <span class="material-symbols-outlined notranslate text-orange-500 text-[20px]">
              workspace_premium
            </span>
          </div>

          <div class="min-w-0">
            <p class="text-[11px] text-slate-400 font-medium">
              Plan
            </p>

            <p class="truncate text-sm font-semibold text-slate-800 capitalize">
              {{ userSubscriptions.length > 0 ? userSubscriptions[0].planType : '—' }}
            </p>
          </div>
        </div>

        <!-- QRs -->
        <div
          class="flex items-center gap-3 flex-1 min-w-0 rounded-2xl bg-slate-50/90 px-4 py-3 border border-slate-100">
          <div class="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100">
            <span class="material-symbols-outlined notranslate text-orange-500 text-[20px]">
              qr_code
            </span>
          </div>

          <div class="min-w-0">
            <p class="text-[11px] text-slate-400 font-medium">
              QRs
            </p>

            <p class="truncate text-sm font-semibold text-slate-800">
              {{ activeQRs.length }} activos
            </p>
          </div>
        </div>

        <!-- Estado -->
        <div
          class="flex items-center gap-3 flex-1 min-w-0 rounded-2xl bg-slate-50/90 px-4 py-3 border border-slate-100">
          <div class="flex h-10 w-10 items-center justify-center rounded-full" :class="userSubscriptions.some(s => s.status === 'active')
            ? 'bg-emerald-100'
            : 'bg-slate-200'">
            <span class="material-symbols-outlined notranslate text-[20px]" :class="userSubscriptions.some(s => s.status === 'active')
              ? 'text-emerald-600'
              : 'text-slate-500'">
              schedule
            </span>
          </div>

          <div class="min-w-0">
            <p class="text-[11px] text-slate-400 font-medium">
              Estado
            </p>

            <p class="truncate text-sm font-semibold" :class="userSubscriptions.some(s => s.status === 'active')
              ? 'text-emerald-600'
              : 'text-slate-500'">
              {{userSubscriptions.some(s => s.status === 'active') ? 'Activo' : 'Inactivo'}}
            </p>
          </div>
        </div>
      </div>


      <!-- Content Section -->
      <div class="space-y-10">
        <div class="relative min-h-[300px]">
          <!-- Loading Grid -->

          <!--Create New QR Modal-->
          <div v-if="showCreateQRModal" class="fixed inset-0 bg-gray-900/60 flex items-center justify-center z-50">
            <div class="bg-white rounded-lg w-full max-w-md border border-slate-200">

              <!-- Header -->
              <div class="px-5 pt-5 pb-3 border-b border-slate-200">
                <h3 class="text-base font-medium text-slate-900 font-['Google_Sans']">
                  Crear nuevo QR
                </h3>
                <p class="text-xs text-slate-500 mt-0.5">
                  Complete los datos para generar su código
                </p>
              </div>

              <!-- Body -->
              <div class="px-5 py-4 space-y-4">
                <!-- Campo nombre -->
                <div>
                  <label class="block text-xs font-medium text-slate-500 mb-1.5">
                    Nombre del QR
                  </label>
                  <input type="text" v-model="newQrName" placeholder="Ej: Mi laptop personal" class="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-md
                 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30
                 placeholder:text-slate-400 text-slate-900">
                </div>

                <!-- Campo categoría -->
                <div>
                  <label class="block text-xs font-medium text-slate-500 mb-1.5">
                    Categoría
                  </label>
                  <select v-model="selectedCategory" class="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-md
                 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30
                 text-slate-900 appearance-none cursor-pointer">
                    <option value="vehicle" class="bg-white">Vehículos</option>
                    <option value="home" class="bg-white">Hogares</option>
                    <option value="phone" class="bg-white">Celulares</option>
                    <option value="laptop" class="bg-white">Laptops</option>
                    <option value="bags" class="bg-white">Mochilas / Maletas</option>
                    <option value="keys" class="bg-white">Llaves</option>
                    <option value="pets" class="bg-white">Mascotas</option>
                    <option value="people" class="bg-white">Personas</option>
                    <option value="wallet" class="bg-white">Carteras</option>
                    <option value="documents" class="bg-white">Documentos</option>
                    <option value="bike" class="bg-white">Bicicletas</option>
                    <option value="other" class="bg-white">Otro</option>
                  </select>
                </div>
              </div>

              <!-- Footer -->
              <div class="px-5 py-3 border-t border-slate-200 flex justify-end gap-2">
                <button @click="showCreateQRModal = false" class="px-4 py-1.5 text-sm text-slate-500 hover:text-slate-700
                     transition-colors cursor-pointer bg-transparent rounded">
                  Cancelar
                </button>
                <button @click="createQRForSubscription" :disabled="isCreatingQR"
                  class="px-4 py-1.5 text-sm bg-orange-500 hover:bg-orange-600
                     text-white rounded transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2">
                  <span v-if="isCreatingQR"
                    class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  {{ isCreatingQR ? 'Creando...' : 'Crear QR' }}
                </button>
              </div>

            </div>
          </div>

          <div v-if="isLoading" key="loading"
            class="flex justify-center items-center  w-full z-10 absolute  left-1/2 -translate-x-1/2 -translate-y-1/2 mt-20">
            <LineLoader />
          </div>


          <!-- Groups Content -->
          <div v-else-if="filteredGroups.length > 0" key="content" class="space-y-12">

            <div v-for="group in filteredGroups" :key="group.subscription.id" class="space-y-6 animate-fade-up">

              <LimitReached :subscriptionName="group.subscription.planType"
                v-if="group.subscription.totalQRsCreated >= group.subscription.totalQRsAllowed && showLimitReached"
                @close="showLimitReached = false" />
              <!-- Subscription Header -->
              <div
                class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-slate-200 p-5 rounded-2xl">
                <div>
                  <div class="flex items-center gap-3 mb-1">
                    <h3 class="text-xl font-bold capitalize text-slate-900">
                      Plan {{ group.subscription.planType === 'trial' ? 'Bronce de prueba' : group.subscription.planType
                      }}
                    </h3>
                    <span
                      :class="group.subscription.planType === 'trial' && group.subscription.status === 'inactive' ? 'bg-amber-50 text-amber-600 border-amber-200' : group.subscription.status === 'active' ? 'bg-orange-50 text-orange-600 border-orange-200' : 'bg-slate-100 text-slate-500 border-slate-200'"
                      class="px-2.5 py-0.5 rounded-full border text-[10px] font-black uppercase tracking-widest">
                      {{ group.subscription.planType === 'trial' && group.subscription.status === 'inactive' ? 'Acabado'
                        : group.subscription.status === 'active' ? 'Activo' : group.subscription.status === 'canceled' ?
                          'Cancelado' : 'Inactivo' }}
                    </span>
                  </div>
                  <p class="text-[12px] text-slate-400 font-mono">
                    ID: {{ group.subscription.id }}
                  </p>

                  <!-- Info explicativa del plan -->
                  <div class="mt-3 pt-3 border-t border-slate-200 space-y-1">
                    <p class="text-xs text-slate-500 flex items-center gap-1.5 leading-relaxed">
                      <span class="material-symbols-outlined notranslate text-sm mt-0.5 shrink-0">info</span>
                      <template
                        v-if="group.subscription.planType === 'trial' && group.subscription.status === 'active'">
                        Este es un <strong class="text-slate-700">plan gratuito de prueba</strong> con duración de 1 año
                        incluido en su cuenta.
                        Termina el <strong class="text-slate-700">{{ formatEndDate(group.subscription.endDate)
                          }}</strong>.
                        Después de esa fecha si decide continuar con el plan podrá renovarlo.
                      </template>
                      <template
                        v-else-if="group.subscription.planType === 'trial' && group.subscription.status === 'canceled'">
                        Este <strong class="text-slate-700">plan gratuito de prueba</strong> fue
                        <strong class="text-slate-700">cancelado</strong>.
                        Los QRs asociados ya no están disponibles. Revisa los planes disponibles para activarlos.
                      </template>
                      <template
                        v-else-if="group.subscription.planType === 'trial' && group.subscription.status === 'inactive'">
                        Este <strong class="text-slate-700">plan gratuito de prueba</strong> ha
                        <strong class="text-slate-700">finalizado</strong>.
                        Terminó el {{ formatEndDate(group.subscription.endDate) }}. Adquiera un plan para reactivar sus
                        QRs.
                      </template>
                      <template v-else-if="group.subscription.status === 'active'">
                        Plan <strong class="text-slate-700 capitalize">{{ group.subscription.planType }}</strong> —
                        <span v-if="group.subscription.endDate">
                          termina el <strong class="text-slate-700">{{ formatEndDate(group.subscription.endDate)
                            }}</strong>.
                        </span>
                        <span v-else>
                          <strong class="text-slate-700">sin fecha de vencimiento</strong>.
                        </span>
                        Tienes <strong class="text-slate-700">{{ group.subscription.totalQRsAllowed -
                          group.subscription.totalQRsCreated }}</strong> de
                        <strong class="text-slate-700">{{ group.subscription.totalQRsAllowed }}</strong> QRs
                        disponibles.
                      </template>
                      <template v-else-if="group.subscription.status === 'canceled'">
                        Plan <strong class="text-slate-700 capitalize">{{ group.subscription.planType }}</strong>
                        <strong class="text-slate-700">cancelado</strong>.
                        Los QRs asociados ya no están disponibles.
                      </template>
                      <template v-else>
                        Plan <strong class="text-slate-700 capitalize">{{ group.subscription.planType }}</strong>
                        inactivo.
                        Adquiere o reactiva un plan para usar tus QRs.
                      </template>
                    </p>
                  </div>
                </div>

                <div class="flex flex-col items-end">
                  <span class="text-sm font-medium text-slate-700">
                    Uso: {{ group.subscription.totalQRsCreated }} / {{ group.subscription.totalQRsAllowed }}
                  </span>
                  <div class="w-32 h-1.5 bg-slate-200 rounded-full mt-2 overflow-hidden">
                    <div class="h-full bg-orange-500 rounded-full transition-all duration-500"
                      :style="{ width: `${(group.subscription.totalQRsCreated / group.subscription.totalQRsAllowed) * 100}%` }">
                    </div>
                  </div>
                  <button v-if="group.subscription.status === 'active'" @click="toggleCreateQrModal(group.subscription)"
                    v-tooltip="{ content: `Usted puede crear ${group.subscription.totalQRsAllowed - group.subscription.totalQRsCreated} QRs más en este plan` }"
                    class="mt-2.5 flex items-center bg-orange-500 hover:bg-orange-600 active:scale-[0.98]
         text-white text-sm font-medium
         px-4 py-2 rounded-xl
         transition-all duration-150 cursor-pointer">
                    <span class="material-symbols-outlined notranslate text-sm">add</span>
                    Asignar QR
                    <span class="ml-1.5 text-white/70 text-[10px]">
                      ({{ group.subscription.totalQRsAllowed - group.subscription.totalQRsCreated }} restantes)
                    </span>
                  </button>

                </div>

              </div>

              <!-- QRs Grid for this Subscription -->
              <div v-if="group.qrs.length > 0"
                class="grid grid-cols-1 xl:grid-cols-2 gap-8 relative z-0 pl-2 sm:pl-6 border-l-2 border-slate-200">
                <QRCard v-for="qr in group.qrs" :key="qr.id" :id="qr.id" :name="qr.name" :category="qr.category"
                  :status="qr.status" :scans="qr.scans" :lastScan="qr.lastScan" :docId="qr.docId" :link="qr.link"
                  :subscriptionStatus="group.subscription.status" :isActive="qr.isActive" :isBanned="qr.isBanned"
                  :banReason="qr.banReason" :createdAt="qr.createdAt" :subscriptionId="qr.subscriptionId"
                  :physicalShipped="qr.physicalShipped" :physicalShippedAt="qr.physicalShippedAt"
                  :planType="group.subscription.planType"
                  @request-physical="handleRequestPhysical(group.subscription)" />
              </div>

              <div v-else
                class="pl-2 sm:pl-6 border-l-2 border-slate-200 py-4 flex flex-col items-center gap-2 justify-between">

                <p class="text-slate-400 text-sm italic">No hay QRs generados en esta suscripción.</p>

              </div>

            </div>

          </div>

          <!-- Empty State — no subscriptions at all -->
          <div v-else-if="groupedQRs.length === 0" key="empty-all"
            class="relative flex flex-col items-center justify-center py-20 sm:py-24 text-center w-full overflow-hidden">
            <div class="absolute inset-0 opacity-[0.04] pointer-events-none bg-pattern-diamond"></div>
            <div
              class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-orange-500/5 rounded-full blur-[100px] pointer-events-none">
            </div>
            <div class="relative z-10">
              <div
                class="w-16 sm:w-20 h-16 sm:h-20 rounded-2xl sm:rounded-3xl bg-orange-50 border border-orange-200 flex items-center justify-center mx-auto mb-5 sm:mb-6 shadow-sm">
                <span
                  class="material-symbols-outlined notranslate text-3xl sm:text-4xl text-orange-500">account_balance_wallet</span>
              </div>
              <h3 class="text-xl sm:text-2xl font-black text-slate-900 mb-2">No tiene suscripciones activas</h3>
              <p class="text-sm sm:text-base text-slate-500 max-w-md mx-auto mb-6 sm:mb-8 px-4">Adquiera un plan para
                poder registrar códigos QR y comenzar a proteger sus pertenencias.</p>
              <RouterLink to="/pricing"
                class="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-orange-500 text-white font-black text-[10px] sm:text-xs uppercase tracking-widest hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20">
                <span class="material-symbols-outlined notranslate text-sm">workspace_premium</span>
                Ver Planes
              </RouterLink>
            </div>
          </div>

          <!-- Empty State — filtro sin resultados -->
          <div v-else key="empty-filter"
            class="relative flex flex-col items-center justify-center py-20 text-center w-full overflow-hidden">
            <div class="absolute inset-0 opacity-[0.04] pointer-events-none bg-pattern-diamond"></div>
            <div
              class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[250px] sm:w-[400px] h-[250px] sm:h-[400px] bg-orange-500/5 rounded-full blur-[80px] pointer-events-none">
            </div>
            <div class="relative z-10">
              <span
                class="material-symbols-outlined notranslate text-5xl sm:text-6xl text-slate-300 mb-4">search_off</span>
              <h3 class="text-lg sm:text-xl font-bold text-slate-900 mb-2 capitalize">No hay planes {{ plansView }}</h3>
              <p class="text-sm sm:text-base text-slate-400 mb-6">No se encontraron suscripciones con este estado.</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Physical QR Request Overlay -->
      <RequestQROverlay :visible="showPhysicalOverlay" :subscription="overlaySubscription" :qrs="overlayQrs"
        @close="closePhysicalOverlay" @confirm="closePhysicalOverlay" />
    </div>

    <!-- WhatsApp Phone Prompt (persistent until user saves their number) -->
    <PhonePrompt v-if="showPhonePrompt" @saved="showPhonePrompt = false" @dismiss="showPhonePrompt = false" />
  </div>
</template>

<script lang="ts" setup>
import { useUserStore } from '@/stores/user'
import QRCard from './QRCard.vue'
import RequestQROverlay from './RequestQROverlay.vue'
import { onMounted, onUnmounted, ref, computed } from 'vue'
import { collection, getFirestore, onSnapshot, Timestamp, doc, increment, writeBatch, getDoc, FirestoreError } from 'firebase/firestore'
import { useImageStore } from '@/stores/imageStore'

import type { IMyQR } from '@/interfaces/IMyQR'
import type { IQRCard } from '@/interfaces/IQRCard.ts'
import type { ISubscription } from '@/interfaces/ISubscription'
import { nanoid } from 'nanoid'
import LineLoader from '@/components/ui/LineLoader.vue'
import { toast } from 'vue-sonner'
import LimitReached from './LimitReached.vue'
import PhonePrompt from './PhonePrompt.vue'

const userQRs = ref<IMyQR[]>([])
const userSubscriptions = ref<ISubscription[]>([])
const userStore = useUserStore()
const isLoading = ref(true);
const noQRsFound = ref(false);
//Firebase data
const db = getFirestore();
const userId = userStore.getUserId ?? '';
const userQrsCollection = collection(db, `users/${userId}/qrs`);
const subscriptionsCollection = collection(db, `users/${userId}/subscriptions`);

// Search
const searchQuery = ref('')

// Filtro de planes por estado
const plansView = ref<'active' | 'inactive' | 'canceled'>('active')

const filterOptions = [
  { value: 'active', label: 'Activos' },
  { value: 'inactive', label: 'Inactivos' },
  { value: 'canceled', label: 'Cancelados' },
] as const

// QRs solo de suscripciones activas
const activeQRs = computed(() => {
  const activeIds = new Set(userSubscriptions.value.filter(s => s.status === 'active').map(s => s.id))
  return userQRs.value.filter(qr => activeIds.has(qr.subscriptionId))
})

// Agrupar QRs por suscripción
// Alternativa simple: por cada suscripción, filtrar los QRs que le pertenecen
const groupedQRs = computed(() => {
  return userSubscriptions.value.map((sub) => ({
    subscription: sub,
    qrs: userQRs.value.filter((qr) => qr.subscriptionId === sub.id),
  }))
})

// Filtrar grupos según el estado seleccionado y búsqueda
const filteredGroups = computed(() => {
  const statusFiltered = groupedQRs.value.filter((group) => group.subscription.status === plansView.value)

  if (!searchQuery.value.trim()) {
    return statusFiltered
  }

  const query = searchQuery.value.toLowerCase().trim()

  return statusFiltered
    .map((group) => ({
      ...group,
      qrs: group.qrs.filter(
        (qr) =>
          qr.name.toLowerCase().includes(query) ||
          qr.category.toLowerCase().includes(query) ||
          qr.id.toLowerCase().includes(query)
      ),
    }))
    .filter((group) => group.qrs.length > 0)
})

const selectedSubscription = ref<ISubscription | null>(null);

// Physical QR Overlay state
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

const imageStore = useImageStore();

// ─── Phone Prompt ───────────────────────────────────────────────
const showPhonePrompt = ref(false)

// ─── Limit Reached ──────────────────────────────────────────────
const showLimitReached = ref(false);
//Show QR creation modal function and variable
const showCreateQRModal = ref(false);
const isCreatingQR = ref(false);
const newQrName = ref('');
const selectedCategory = ref('other');
const toggleCreateQrModal = async (e: ISubscription) => {
  showLimitReached.value = false;
  showCreateQRModal.value = !showCreateQRModal.value;
  if (!e.id) {
    toast.error('Suscripción no válida para asignar QR. Por favor, intente nuevamente.');
    return
  }
  selectedSubscription.value = e;
  if (e.totalQRsCreated >= e.totalQRsAllowed) {
    toast.error('La suscripción seleccionada ya ha alcanzado su límite de QRs. Por favor, seleccione otra suscripción o actualice su plan.');
    showLimitReached.value = true;
    showCreateQRModal.value = false;
    return;
  }

};
const createQRForSubscription = async () => {
  if (!selectedSubscription.value) {
    toast.error('No se ha seleccionado una suscripción válida. Por favor, intente nuevamente.');
    return;
  }
  if ((selectedSubscription.value?.totalQRsCreated ?? 0) >= (selectedSubscription.value?.totalQRsAllowed ?? 0)) {
    toast.error(
      'La suscripción seleccionada ya ha alcanzado su límite de QRs. Por favor, seleccione otra suscripción o actualice su plan.'
    );
    showLimitReached.value = true;
    showCreateQRModal.value = false;
    newQrName.value = '';
    return;
  }


  isCreatingQR.value = true;
  try {
    const randomId = nanoid(15);
    console.log('[createQR] selectedSubscription:', JSON.parse(JSON.stringify(selectedSubscription.value)));
    console.log('[createQR] newQrName:', newQrName.value, 'selectedCategory:', selectedCategory.value);
    console.log('[createQR] userStore.getUserId:', userStore.getUserId);

    const qrData: IQRCard = {
      banReason: '',
      createdAt: Timestamp.now(),
      id: randomId,
      isActive: true,
      isBanned: false,
      lastScan: '',
      name: newQrName.value || 'QR sin nombre',
      scans: 0,
      status: 'Active',
      docId: '',
      subscriptionId: selectedSubscription.value.id || 'Not Defined',
      freeShipmentUsed: false,
      physicalShipped: false,
      physicalShippedAt: '',
      shippingNotes: '',
      img: '',
      link: '',
      category: selectedCategory.value
    }
    console.log('[createQR] qrData:', JSON.parse(JSON.stringify(qrData)));

    const userDocRef = doc(db, `users/${userStore.getUserId}/qrs/${randomId}`);
    const userRef = doc(db, `users/${userStore.getUserId}`);
    const userSubRef = doc(db, `users/${userStore.getUserId}/subscriptions/${selectedSubscription.value.id}`);
    const publicDocRef = doc(db, `publicQR/${randomId}`);
    console.log('[createQR] refs:', {
      userDocRef: userDocRef.path,
      userRef: userRef.path,
      userSubRef: userSubRef.path,
      publicDocRef: publicDocRef.path
    });

    const batch = writeBatch(db);

    const userQrData = {
      ...qrData,
      uid: userStore.getUserId
    };
    console.log('[createQR] userDoc batch.set data:', JSON.parse(JSON.stringify(userQrData)));

    batch.set(userDocRef, userQrData)

    console.log('[createQR] userRef batch.update: totalQRs increment(1)');
    batch.update(userRef, {
      totalQRs: increment(1)
    })

    console.log('[createQR] userSubRef batch.update: totalQRsCreated increment(1)');
    batch.update(userSubRef, {
      totalQRsCreated: increment(1)
    })

    const publicQrData = {
      id: randomId,
      name: qrData.name,
      category: qrData.category,
      status: qrData.status,
      lastScan: qrData.lastScan,
      totalScans: qrData.scans,
      isBanned: qrData.isBanned,
      banReason: qrData.banReason,
      uid: userStore.getUserId,
      tier: selectedSubscription.value.planType ?? 'free',
      createdAt: qrData.createdAt,
      docId: randomId,
      isPublic: true
    };
    console.log('[createQR] publicDoc batch.set data:', JSON.parse(JSON.stringify(publicQrData)));

    batch.set(publicDocRef, publicQrData)

    console.log('[createQR] calling batch.commit()...');
    await batch.commit();
    console.log('[createQR] batch.commit() SUCCESS');
    toast.success('QR creado y asignado a la suscripción exitosamente.');
    showCreateQRModal.value = false;
    newQrName.value = '';
  }
  catch (error) {
    console.log('[createQR] ERROR:', error);
    toast.error(`Fallo al crear el QR: ${error}`);
  } finally {
    isCreatingQR.value = false;
    console.log('[createQR] FINALLY - isCreatingQR set to false');
  }
}

// Listeners
let unsubQRs: (() => void) | undefined;
let unsubSubs: (() => void) | undefined;

onMounted(async () => {
  // Check if user has a phone number registered
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

  // Listener de Suscripciones
  unsubSubs = onSnapshot(subscriptionsCollection, (snapshot) => {
    userSubscriptions.value = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as ISubscription[];
  }, (error: FirestoreError) => {
    // Silenciar error esperado al cerrar sesión
    if (error.code !== 'permission-denied') {
      toast.error(`Error obteniendo suscripciones: ${error}`);
    }
  });

  // Listener de QRs
  unsubQRs = onSnapshot(userQrsCollection, (snapshot) => {
    if (snapshot.empty) {
      noQRsFound.value = true;
      isLoading.value = false;
      userQRs.value = [];
      return;
    }
    userQRs.value = [];
    snapshot.docs.forEach(doc => {
      userQRs.value.push({
        docId: doc.id,
        ...doc.data()
      } as IMyQR);
    });
    noQRsFound.value = false;
    setTimeout(() => {
      isLoading.value = false;
    }, 600);
  },
    (error: FirestoreError) => {
      // Silenciar error esperado al cerrar sesión
      if (error.code !== 'permission-denied') {
        toast.error(`Error obteniendo QRs: ${error}`);
      }
      isLoading.value = false;
    }
  );
})

onUnmounted(() => {
  if (unsubQRs) unsubQRs();
  if (unsubSubs) unsubSubs();
  isLoading.value = true;
  imageStore.clearImages();
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
.fade-enter-active,
.fade-leave-active {
  transition: opacity .4s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
