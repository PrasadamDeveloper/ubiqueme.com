<template>
  <div class="relative min-h-screen bg-[#0a0a0b] w-full font-google-sans overflow-hidden">

    <!-- Grid overlay (estilo admin) -->
    <div class="absolute inset-0 opacity-[0.03] pointer-events-none"
      style="background-image: linear-gradient(rgba(255,255,255,.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.4) 1px, transparent 1px); background-size: 48px 48px;">
    </div>

    <!-- Radial glow (estilo admin) -->
    <div
      class="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[#f15400]/10 rounded-full blur-[120px] pointer-events-none">
    </div>

    <div class="relative z-10 ">

      <!-- Header Section -->
      <div
        class="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/10 pb-8 animate-fade-up">
        <div>
          <p class="text-[#ebf2ff] font-poppins font-medium  text-2xl mb-2">Mis Códigos QR <span
              class="material-symbols-outlined notranslate text-5xl md:text-6xl text-amber-50 align-middle">qr_code</span>
          </p>

          <div class="flex items-center gap-2">
            <h2
              class="text-4xl md:text-5xl font-semibold font-google-sans tracking-tighter leading-none italic text-white animate-fade-up">
              Hola de nuevo,
            </h2>
            <span
              class="text-orange-500 text-4xl md:text-5xl font-semibold tracking-tighter leading-none italic animate-fade-up animate-delay-[.3s]">{{
                useUserStore().getFirstName }}</span><span
              class="text-4xl md:text-5xl font-black tracking-tighter leading-none italic text-white animate-fade-up animate-delay-[.38s]">!</span>
          </div>

        </div>

        <!-- Botón de admin/test (Crear QR) -->
        <RouterLink to="/admin"
          class="hidden bg-orange-600/20 text-orange-400 border border-orange-500/20 px-6 py-2.5 rounded-lg font-black text-sm active:scale-95 cursor-pointer hover:bg-orange-600/30 transition-colors">
          Ir al panel de admin
        </RouterLink>
      </div>

      <!-- Filtro de planes: estilo Cloudflare segmented control -->
      <div class="flex items-center gap-2 animate-fade-up">
        <button v-for="option in filterOptions" :key="option.value" @click="plansView = option.value" :class="[
          plansView === option.value
            ? 'bg-orange-600 text-white border-orange-500 shadow-sm shadow-orange-500/20'
            : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10 hover:text-white/80',
        ]"
          class="px-4 py-2 rounded-lg border text-xs font-semibold transition-all duration-150 cursor-pointer active:scale-95 select-none">
          {{ option.label }}
        </button>
      </div>

      <!-- Search Bar -->
      <div class="relative animate-fade-up">
        <span
          class="material-symbols-outlined notranslate absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-xl pointer-events-none">search</span>
        <input v-model="searchQuery" type="text" placeholder="Buscar QR por nombre, categoría o ID..."
          class="w-full bg-[#1f1f2367] border border-white/5 rounded-xl pl-10 pr-10 py-3 text-sm text-white/80 placeholder:text-white/30 focus:outline-none focus:border-orange-500/30 focus:ring-1 focus:ring-orange-500/10 transition-all" />
        <button v-if="searchQuery" @click="searchQuery = ''"
          class="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors cursor-pointer">
          <span class="material-symbols-outlined notranslate text-lg">close</span>
        </button>
      </div>

      <!-- Content Section -->
      <div class="space-y-10">
        <div class="relative min-h-[300px]">
          <!-- Loading Grid -->

          <!--Create New QR Modal-->
          <div v-if="showCreateQRModal" class="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div class="bg-[#1D1F2C] rounded-lg w-full max-w-md border border-[#3A3D4E]">

              <!-- Header -->
              <div class="px-5 pt-5 pb-3 border-b border-[#3A3D4E]">
                <h3 class="text-base font-medium text-[#E5E7EB] font-['Google_Sans']">
                  Crear nuevo QR
                </h3>
                <p class="text-xs text-[#8A8D9E] mt-0.5">
                  Complete los datos para generar su código
                </p>
              </div>

              <!-- Body -->
              <div class="px-5 py-4 space-y-4">
                <!-- Campo nombre -->
                <div>
                  <label class="block text-xs font-medium text-[#A1A3B5] mb-1.5">
                    Nombre del QR
                  </label>
                  <input type="text" v-model="newQrName" placeholder="Ej: Mi laptop personal" class="w-full px-3 py-2 text-sm bg-[#242634] border border-[#3A3D4E] rounded-md
                 focus:outline-none focus:border-[#F38020] focus:ring-1 focus:ring-[#F38020]/30
                 placeholder:text-[#5E5E6F] text-[#E5E7EB]">
                </div>

                <!-- Campo categoría -->
                <div>
                  <label class="block text-xs font-medium text-[#A1A3B5] mb-1.5">
                    Categoría
                  </label>
                  <select v-model="selectedCategory" class="w-full px-3 py-2 text-sm bg-[#242634] border border-[#3A3D4E] rounded-md
                 focus:outline-none focus:border-[#F38020] focus:ring-1 focus:ring-[#F38020]/30
                 text-[#E5E7EB] appearance-none cursor-pointer">
                    <option value="vehicle" class="bg-[#1D1F2C]">Vehículos</option>
                    <option value="home" class="bg-[#1D1F2C]">Hogares</option>
                    <option value="phone" class="bg-[#1D1F2C]">Celulares</option>
                    <option value="laptop" class="bg-[#1D1F2C]">Laptops</option>
                    <option value="bags" class="bg-[#1D1F2C]">Mochilas / Maletas</option>
                    <option value="keys" class="bg-[#1D1F2C]">Llaves</option>
                    <option value="pets" class="bg-[#1D1F2C]">Mascotas</option>
                    <option value="people" class="bg-[#1D1F2C]">Personas</option>
                    <option value="wallet" class="bg-[#1D1F2C]">Carteras</option>
                    <option value="documents" class="bg-[#1D1F2C]">Documentos</option>
                    <option value="bike" class="bg-[#1D1F2C]">Bicicletas</option>
                    <option value="other" class="bg-[#1D1F2C]">Otro</option>
                  </select>
                </div>
              </div>

              <!-- Footer -->
              <div class="px-5 py-3 border-t border-[#3A3D4E] flex justify-end gap-2">
                <button @click="showCreateQRModal = false" class="px-4 py-1.5 text-sm text-[#A1A3B5] hover:text-[#E5E7EB]
                     transition-colors cursor-pointer bg-transparent rounded">
                  Cancelar
                </button>
                <button @click="createQRForSubscription" :disabled="isCreatingQR"
                  class="px-4 py-1.5 text-sm bg-[#F38020] hover:bg-[#E07010]
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
                class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#1f1f2367] border border-white/5 p-5 rounded-2xl">
                <div>
                  <div class="flex items-center gap-3 mb-1">
                    <h3 class="text-xl font-bold capitalize text-white">
                      Plan {{ group.subscription.planType }}
                    </h3>
                    <span
                      :class="group.subscription.status === 'active' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' : 'bg-white/10 text-white/50 border-white/10'"
                      class="px-2.5 py-0.5 rounded-full border text-[10px] font-black uppercase tracking-widest">
                      {{ group.subscription.status }}
                    </span>
                  </div>
                  <p class="text-[12px] text-white/30 font-mono">
                    ID: {{ group.subscription.id }}
                  </p>
                </div>

                <div class="flex flex-col items-end">
                  <span class="text-sm font-medium text-white/80">
                    Uso: {{ group.subscription.totalQRsCreated }} / {{ group.subscription.totalQRsAllowed }}
                  </span>
                  <div class="w-32 h-1.5 bg-white/10 rounded-full mt-2 overflow-hidden">
                    <div class="h-full bg-orange-500 rounded-full transition-all duration-500"
                      :style="{ width: `${(group.subscription.totalQRsCreated / group.subscription.totalQRsAllowed) * 100}%` }">
                    </div>
                  </div>
                  <button v-if="group.subscription.status == 'active'" @click="toggleCreateQrModal(group.subscription)"
                    v-tooltip="{ content: `Usted puede crear ${group.subscription.totalQRsAllowed - group.subscription.totalQRsCreated} QRs más en este plan` }"
                    class="mt-2.5 flex items-center bg-[#FF8905] hover:bg-orange-500 active:scale-[0.98]
         text-white text-sm font-medium
         px-4 py-2 rounded-xl
         transition-all duration-150 cursor-pointer">
                    <span class="material-symbols-outlined notranslate text-sm">add</span>
                    Asignar QR
                    <span class="ml-1.5 text-white/60 text-[10px]">
                      ({{ group.subscription.totalQRsAllowed - group.subscription.totalQRsCreated }} restantes)
                    </span>
                  </button>

                </div>

              </div>

              <!-- QRs Grid for this Subscription -->
              <div v-if="group.qrs.length > 0"
                class="grid grid-cols-1 xl:grid-cols-2 gap-8 relative z-0 pl-2 sm:pl-6 border-l-2 border-white/5">
                <QRCard v-for="qr in group.qrs" :key="qr.id" :id="qr.id" :name="qr.name" :category="qr.category"
                  :status="qr.status" :scans="qr.scans" :lastScan="qr.lastScan" :docId="qr.docId" :link="qr.link"
                  :isActive="qr.isActive" :isBanned="qr.isBanned" :banReason="qr.banReason" :createdAt="qr.createdAt"
                  :subscriptionId="qr.subscriptionId" :physicalShipped="qr.physicalShipped"
                  :physicalShippedAt="qr.physicalShippedAt" :planType="group.subscription.planType"
                  @request-physical="handleRequestPhysical(group.subscription)" />
              </div>

              <div v-else
                class="pl-2 sm:pl-6 border-l-2 border-white/5 py-4 flex flex-col items-center gap-2 justify-between">

                <p class="text-white/40 text-sm italic">No hay QRs generados en esta suscripción.</p>

              </div>

            </div>

          </div>

          <!-- Empty State — no subscriptions at all -->
          <div v-else-if="groupedQRs.length === 0" key="empty-all"
            class="flex flex-col items-center justify-center py-20 text-center w-full">
            <span
              class="material-symbols-outlined notranslate text-6xl text-slate-500 mb-4">account_balance_wallet</span>
            <h3 class="text-xl font-semibold text-white mb-2">No tiene suscripciones activas</h3>
            <p class="text-slate-400 mb-6">Adquiera un plan para poder registrar códigos QR.</p>
            <RouterLink to="/pricing"
              class="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-orange-500 text-black font-black text-xs uppercase tracking-widest hover:bg-orange-400 transition-all">
              <span class="material-symbols-outlined notranslate text-sm">workspace_premium</span>
              Ver Planes
            </RouterLink>
          </div>

          <!-- Empty State — filtro sin resultados -->
          <div v-else key="empty-filter" class="flex flex-col items-center justify-center py-20 text-center w-full">
            <span class="material-symbols-outlined notranslate text-6xl text-slate-500 mb-4">search_off</span>
            <h3 class="text-xl font-semibold text-white mb-2 capitalize">No hay planes {{ plansView }}</h3>
            <p class="text-slate-400 mb-6">No se encontraron suscripciones con este estado.</p>
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
