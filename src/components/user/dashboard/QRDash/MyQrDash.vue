<script lang="ts" setup>
import { useUserStore } from '@/stores/user'
import QRCard from './QRCard.vue'
import { onMounted, onUnmounted, ref } from 'vue'
import { collection, getFirestore, onSnapshot, Timestamp, doc, runTransaction, increment } from 'firebase/firestore'
import QRCardSkeleton from '@/components/ui/user/dashboard/QRCardSkeleton.vue'
import { useImageStore } from '@/stores/imageStore'

import type { IMyQR } from '@/interfaces/IMyQR'
import { nanoid } from 'nanoid'
import LineLoader from '@/components/ui/LineLoader.vue'
import { toast } from 'vue-sonner'

const userQRs = ref<IMyQR[]>([])
const userStore = useUserStore()
const isLoading = ref(true);
const noQRsFound = ref(false);
//Firebase data
const db = getFirestore();
const userId = userStore.getUserId ?? '';
const userQrsCollection = collection(db, `users/${userId}/qrs`);

//Add QR doc to user ATENTION THIS MUST BE ONLY FOR ADMIN ITS CREATED HERE FOR TEST PURPOUSE ONLY
const createQR = async () => {
  try {
    // 1. Fetch available subscriptions first (before transaction for simplicity)
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
      // Re-read subscription to ensure consistency inside transaction
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
        createdAt: Timestamp.now()
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
        createdAt: Timestamp.now()
      });

      // Update totalQRs on user root
      const userRootRef = doc(db, `users/${userId}`);
      transaction.update(userRootRef, {
        totalQRs: increment(1)
      });

      // Update totalQRsCreated on the chosen subscription
      transaction.update(subRef, {
        totalQRsCreated: increment(1)
      });

    });

    toast.success("¡QR creado con éxito atómicamente y asignado a la suscripción!");
  } catch (error) {
    toast.error(`Fallo al crear el QR: ${error}`);
  }
}




//listener to user QRs
let unsub: any;

onMounted(() => {

  unsub = onSnapshot(userQrsCollection, (snapshot) => {
    if (snapshot.empty) {
      toast.info('No Qrs were found');
      noQRsFound.value = true;
      isLoading.value = false;
      return;
    }
    userQRs.value = [];
    snapshot.docs.forEach(doc => {
      console.log(`QR info: `, doc.data());

      userQRs.value.push({
        docId: doc.id,
        ...doc.data()
      } as IMyQR);
    })
    noQRsFound.value = false;
    setTimeout(() => {
      isLoading.value = false;
    }, 600);
  },
    (error) => {
      toast.error(`Error while getting data: ${error}`);
      isLoading.value = false;
    }
  )

})

onUnmounted(() => {
  if (unsub) unsub();
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

      <RouterLink to="/admin"
        class="bg-cyan-700 text-white px-6 py-2.5 rounded-lg font-black text-sm active:scale-95 cursor-pointer">
        Administrar
        Usuarios
      </RouterLink> <!-- Only for admin -->
    </div>

    <!-- Content Section -->
    <div class="space-y-6">

      <div class="relative">
        <!-- Loading Grid -->
        <div v-if="isLoading" key="loading"
          class="flex justify-center items-center  w-full z-10 absolute  left-1/2 -translate-x-1/2 -translate-y-1/2">
          <LineLoader />
        </div>

        <!-- Content Grid -->
        <div v-show="userQRs.length > 0" key="content"
          class="grid grid-cols-1 xl:grid-cols-2 gap-8 relative z-0 animate-fade-up">
          <QRCard v-for="qr in userQRs" :key="qr.id" v-memo="[qr.status, qr.name, qr.scans, qr.lastScan]" :id="qr.id"
            :name="qr.name" :status="qr.status" :scans="qr.scans" :lastScan="qr.lastScan" :docId="qr.docId"
            :link="qr.link" :isActive="qr.isActive" :isBanned="qr.isBanned" :banReason="qr.banReason"
            :planPurchasedAt="qr.planPurchasedAt" :planEndDate="qr.planEndDate" :createdAt="qr.createdAt" />
        </div>

        <!-- Empty State -->
        <div v-show="!isLoading && noQRsFound" key="empty"
          class="flex flex-col items-center justify-center py-20 text-center w-full">
          <span class="material-symbols-outlined text-6xl text-slate-500 mb-4">qr_code_2</span>
          <h3 class="text-xl font-semibold text-white mb-2">Aún no tiene códigos QR registrados</h3>
          <p class="text-slate-400">¡Cree su primer código QR para empezar!</p>
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
