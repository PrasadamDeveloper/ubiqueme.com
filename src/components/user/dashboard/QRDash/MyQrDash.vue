<template>
  <div class="font-google-sans text-white  space-y-10 pb-20 relative lg:pl-12 pl-0">
    <!-- Decoración de Fondo (Watermark tipo Home) -->
    <div
      class="absolute top-[5%] right-[-15%] opacity-5 pointer-events-none select-none z-[-1] overflow-hidden rotate-12">
      <span class="material-symbols-outlined text-[400px]">qr_code_2</span>
    </div>

    <!-- component -->
    <viewer :images="images">
      <img v-for="(src, index) in images" :key="index" :src="src">
    </viewer>

    <!-- Header Section -->
    <div
      class="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/10 pb-8 animate-fade-up">
      <div>
        <p class="text-amber-500 font-black tracking-[0.4em] text-[10px] uppercase mb-2">Gestión de Activos</p>
        <h2 class="text-4xl md:text-5xl font-black tracking-tighter leading-none italic">
          Códigos QR
        </h2>
      </div>
      <RouterLink to="/dashboard/request-qr"
        class="w-full  cursor-pointer md:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg font-black text-sm bg-white text-black hover:bg-white/90 transition-colors active:scale-95">
        <span class="material-symbols-outlined text-[18px]">add</span>
        Comprar nuevo QR
      </RouterLink>

      <!-- Botón de admin/test (Crear QR) -->
      <RouterLink to="/admin"
        class="bg-cyan-700 text-white px-6 py-2.5 rounded-lg font-black text-sm active:scale-95 cursor-pointer">
        Ir al panel de admin
      </RouterLink>
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
                Completa los datos para generar tu código
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
              <button @click="createQRForSubscription" class="px-4 py-1.5 text-sm bg-[#F38020] hover:bg-[#E07010]
                     text-white rounded transition-colors cursor-pointer">
                Crear QR
              </button>
            </div>

          </div>
        </div>

        <div v-if="isLoading" key="loading"
          class="flex justify-center items-center  w-full z-10 absolute  left-1/2 -translate-x-1/2 -translate-y-1/2 mt-20">
          <LineLoader />
        </div>


        <!-- Groups Content -->
        <div v-else-if="groupedQRs.length > 0" key="content" class="space-y-12">

          <div v-for="group in groupedQRs" :key="group.subscription.id" class="space-y-6 animate-fade-up">

            <LimitReached :subscriptionName="group.subscription.planType"
              v-if="group.subscription.totalQRsCreated >= group.subscription.totalQRsAllowed && showLimitReached"
              @close="showLimitReached = false" />
            <!-- Subscription Header -->
            <div
              class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/5 border border-white/10 p-5 rounded-2xl backdrop-blur-md">
              <div>
                <div class="flex items-center gap-3 mb-1">
                  <h3 class="text-xl font-bold capitalize text-white">
                    Plan {{ group.subscription.planType }}
                  </h3>
                  <span
                    :class="group.subscription.status === 'active' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'"
                    class="px-2.5 py-0.5 rounded-full border text-[10px] font-black uppercase tracking-widest">
                    {{ group.subscription.status }}
                  </span>
                </div>
                <p class="text-[12px] text-white/40 font-mono">
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
                <button @click="toggleCreateQrModal(group.subscription)"
                  v-tooltip="{ content: `Usted puede crear ${group.subscription.totalQRsAllowed - group.subscription.totalQRsCreated} QRs más en este plan` }"
                  class="mt-2.5 flex items-center bg-[#ca5400] hover:bg-[#E07010] active:scale-95 active:bg-[#c6630d]
         text-white text-sm font-medium font-['Google_Sans']
         px-4 py-2 rounded-md
         transition-colors duration-150 cursor-pointer">
                  <span class="material-symbols-outlined text-sm">add</span>
                  Asignar QR
                  <span class="ml-1.5 text-white/70 text-[10px] ">
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

        <!-- Empty State -->
        <div v-else key="empty" class="flex flex-col items-center justify-center py-20 text-center w-full">
          <span class="material-symbols-outlined text-6xl text-slate-500 mb-4">account_balance_wallet</span>
          <h3 class="text-xl font-semibold text-white mb-2">No tiene suscripciones activas</h3>
          <p class="text-slate-400 mb-6">Adquiera un plan para poder registrar códigos QR.</p>
          <RouterLink to="/pricing"
            class="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-orange-500 text-black font-black text-xs uppercase tracking-widest hover:bg-orange-400 transition-all">
            <span class="material-symbols-outlined text-sm">workspace_premium</span>
            Ver Planes
          </RouterLink>
        </div>
      </div>
    </div>
  </div>

  <!-- Physical QR Request Overlay -->
  <RequestQROverlay :visible="showPhysicalOverlay" :subscription="overlaySubscription" :qrs="overlayQrs"
    @close="closePhysicalOverlay" @confirm="closePhysicalOverlay" />
</template>

<script lang="ts" setup>
import { useUserStore } from '@/stores/user'
import QRCard from './QRCard.vue'
import RequestQROverlay from './RequestQROverlay.vue'
import { onMounted, onUnmounted, ref, computed } from 'vue'
import { collection, getFirestore, onSnapshot, Timestamp, doc, increment, writeBatch } from 'firebase/firestore'
import { useImageStore } from '@/stores/imageStore'

import type { IMyQR } from '@/interfaces/IMyQR'
import type { IQRCard } from '@/interfaces/IQRCard.ts'
import type { ISubscription } from '@/interfaces/ISubscription'
import { nanoid } from 'nanoid'
import LineLoader from '@/components/ui/LineLoader.vue'
import { toast } from 'vue-sonner'
import LimitReached from './LimitReached.vue'

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

// Agrupar QRs por suscripción
// Alternativa simple: por cada suscripción, filtrar los QRs que le pertenecen
const groupedQRs = computed(() => {
  return userSubscriptions.value.map((sub) => ({
    subscription: sub,
    qrs: userQRs.value.filter((qr) => qr.subscriptionId === sub.id),
  }))
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

//Limit Reached
const showLimitReached = ref(false);
//Show QR creation modal function and variable
const showCreateQRModal = ref(false);
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
  if (
    (groupedQRs.value.find(
      g => g.subscription.id === selectedSubscription.value?.id
    )?.qrs.length ?? 0) >=
    (selectedSubscription.value?.totalQRsAllowed ?? 0)
  ) {
    toast.error(
      'La suscripción seleccionada ya ha alcanzado su límite de QRs. Por favor, seleccione otra suscripción o actualice su plan.'
    );
    showLimitReached.value = true;
    showCreateQRModal.value = false;
    newQrName.value = '';
    return;
  }


  try {
    const randomId = nanoid(15);
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

    const userDocRef = doc(db, `users/${userStore.getUserId}/qrs/${randomId}`);
    const userSubRef = doc(db, `users/${userStore.getUserId}/subscriptions/${selectedSubscription.value.id}`);
    const publicDocRef = doc(db, `publicQR/${randomId}`);

    const batch = writeBatch(db);

    batch.set(userDocRef, {
      ...qrData
    })
    batch.update(userSubRef, {
      totalQRsCreated: increment(1)
    })
    batch.set(publicDocRef, {
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
      createdAt: qrData.createdAt
    })

    await batch.commit();
    toast.success('QR creado y asignado a la suscripción exitosamente.');
    showCreateQRModal.value = false;
    newQrName.value = '';
  }
  catch (error) {
    toast.error(`Fallo al crear el QR: ${error}`);
    console.log(error);
  }
}

// Listeners
let unsubQRs: any;
let unsubSubs: any;

onMounted(() => {
  // Listener de Suscripciones
  unsubSubs = onSnapshot(subscriptionsCollection, (snapshot) => {
    userSubscriptions.value = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as ISubscription[];
  }, (error) => {
    toast.error(`Error obteniendo suscripciones: ${error}`);
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
    (error) => {
      toast.error(`Error obteniendo QRs: ${error}`);
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

const imageStore = useImageStore();
const images = imageStore.getImages;

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
