<script lang="ts" setup>
import { useUserStore } from '@/stores/user'
import QRCard from './QRCard.vue'
import { onMounted, onUnmounted, ref, computed } from 'vue'
import { collection, getFirestore, onSnapshot, Timestamp, doc, runTransaction, increment } from 'firebase/firestore'
import QRCardSkeleton from '@/components/ui/user/dashboard/QRCardSkeleton.vue'
import { useImageStore } from '@/stores/imageStore'

import type { IMyQR } from '@/interfaces/IMyQR'
import type { ISubscription } from '@/interfaces/ISubscription'
import { nanoid } from 'nanoid'
import LineLoader from '@/components/ui/LineLoader.vue'
import { toast } from 'vue-sonner'

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
const groupedQRs = computed(() => {
  const groups: Record<string, { subscription: ISubscription; qrs: IMyQR[] }> = {};

  // Inicializar grupos basados en suscripciones activas/inactivas
  userSubscriptions.value.forEach(sub => {
    groups[sub.id] = { subscription: sub, qrs: [] };
  });

  // Distribuir QRs en sus respectivos grupos
  userQRs.value.forEach(qr => {
    if (qr.subscriptionId && groups[qr.subscriptionId]) {
      groups[qr.subscriptionId].qrs.push(qr);
    }
  });

  return Object.values(groups);
});

//Add QR doc to user ATENTION THIS MUST BE ONLY FOR ADMIN ITS CREATED HERE FOR TEST PURPOUSE ONLY
const createQR = async () => {
  try {
    const { getDocs, collection } = await import('firebase/firestore');
    const subsSnapshot = await getDocs(collection(db, `users/${userId}/subscriptions`));
    const activeSubDoc = subsSnapshot.docs.find(d => {
      const data = d.data();
      return data.status === 'active' && data.totalQRsCreated < data.totalQRsAllowed;
    });

    if (!activeSubDoc) {
      toast.error('Límite alcanzado o sin suscripción activa. Por favor, adquiera o actualice un plan para registrar más QRs.');
      return;
    }

    const subId = activeSubDoc.id;

    await runTransaction(db, async (transaction) => {
      const subRef = doc(db, `users/${userId}/subscriptions/${subId}`);
      const subDocTx = await transaction.get(subRef);
      if (!subDocTx.exists()) throw new Error("Subscription not found.");
      const subData = subDocTx.data();
      if (subData.totalQRsCreated >= subData.totalQRsAllowed) {
        throw new Error("La suscripción seleccionada ya no tiene capacidad.");
      }

      const newQRId = nanoid(15);
      const publicQrRef = doc(db, `publicQR/${newQRId}`);
      const userQrRef = doc(db, `users/${userId}/qrs/${newQRId}`);

      const qrDoc = await transaction.get(publicQrRef);
      if (qrDoc.exists()) {
        throw new Error("Colisión de ID. La transacción se cancelará y puede reintentar.");
      }

      transaction.set(publicQrRef, {
        id: newQRId,
        name: 'Nuevo QR (Prueba)',
        status: 'Active',
        lastScan: null,
        totalScans: 0,
        isBanned: false,
        banReason: '',
        docId: newQRId,
        uid: userId,
        tier: 'free',
        createdAt: Timestamp.now(),
        freeShipmentUsed: false // Al crear, usa el envío gratuito si está disponible

      });

      transaction.set(userQrRef, {
        id: newQRId,
        uid: userId,
        name: 'Nuevo QR (Prueba)',
        status: 'Active',
        scans: 0,
        lastScan: "",
        isActive: true,
        isBanned: false,
        banReason: '',
        subscriptionId: subId,
        createdAt: Timestamp.now(),
        physicalShipped: false,
        physicalShippedAt: null,
        shippingNotes: '',
        freeShipmentUsed: false
      });

      const userRootRef = doc(db, `users/${userId}`);
      transaction.update(userRootRef, {
        totalQRs: increment(1)
      });

      transaction.update(subRef, {
        totalQRsCreated: increment(1)
      });

    });

    toast.success("¡QR creado con éxito atómicamente y asignado a la suscripción!");
  } catch (error) {
    toast.error(`Fallo al crear el QR: ${error}`);
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
})

const imageStore = useImageStore();
const images = imageStore.getImages;

</script>

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
      <button @click="createQR"
        class="bg-cyan-700 text-white px-6 py-2.5 rounded-lg font-black text-sm active:scale-95 cursor-pointer">
        Test Admin: Crear QR
      </button>
    </div>

    <!-- Content Section -->
    <div class="space-y-10">
      <div class="relative min-h-[300px]">
        <!-- Loading Grid -->
        <div v-if="isLoading" key="loading"
          class="flex justify-center items-center  w-full z-10 absolute  left-1/2 -translate-x-1/2 -translate-y-1/2 mt-20">
          <LineLoader />
        </div>

        <!-- Groups Content -->
        <div v-else-if="groupedQRs.length > 0" key="content" class="space-y-12">

          <div v-for="group in groupedQRs" :key="group.subscription.id" class="space-y-6 animate-fade-up">

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
              </div>
            </div>

            <!-- QRs Grid for this Subscription -->
            <div v-if="group.qrs.length > 0"
              class="grid grid-cols-1 xl:grid-cols-2 gap-8 relative z-0 pl-2 sm:pl-6 border-l-2 border-white/5">
              <QRCard v-for="qr in group.qrs" :key="qr.id" :id="qr.id" :name="qr.name" :status="qr.status"
                :scans="qr.scans" :lastScan="qr.lastScan" :docId="qr.docId" :link="qr.link" :isActive="qr.isActive"
                :isBanned="qr.isBanned" :banReason="qr.banReason" :createdAt="qr.createdAt"
                :subscriptionId="qr.subscriptionId" :physicalShipped="qr.physicalShipped"
                :physicalShippedAt="qr.physicalShippedAt" />
            </div>

            <div v-else class="pl-2 sm:pl-6 border-l-2 border-white/5 py-4">
              <p class="text-white/40 text-sm italic">No hay QRs generados en esta suscripción.</p>
            </div>

          </div>

        </div>

        <!-- Empty State -->
        <div v-else key="empty" class="flex flex-col items-center justify-center py-20 text-center w-full">
          <span class="material-symbols-outlined text-6xl text-slate-500 mb-4">account_balance_wallet</span>
          <h3 class="text-xl font-semibold text-white mb-2">No tiene suscripciones activas</h3>
          <p class="text-slate-400">Adquiera un plan para poder registrar códigos QR.</p>
        </div>
      </div>
    </div>
  </div>
</template>

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
