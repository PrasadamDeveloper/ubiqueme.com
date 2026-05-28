<template>
  <UserDashoardLayout>
    <template #main>
      <div class="min-h-screen bg-[#09090b] w-full p-4 md:p-8 font-google-sans text-white pt-28!">

        <!-- Header -->
        <div class="flex flex-col md:flex-row md:items-center justify-between mb-8 space-y-4 md:space-y-0">
          <div class="w-full  flex flex-col items-center">
            <h1 class="text-3xl font-bold  text  text-white font-poppins">Centro de
              <span class="text-[#e6651f]">control</span>
            </h1>
            <p class="text-white/40 text-sm mt-1">Inspección profunda de base de datos de usuarios</p>
          </div>

          <div class="flex items-center gap-4">
            <select class="bg-white/5 border border-white/10 rounded-xl text-white focus:border-orange-500 focus:ring-1
             focus:ring-orange-500 outline-none placeholder:text-white/20 p-2" v-model="selectedFilter">
              <option value="all">Todos los usuarios</option>
              <option value="active">Usarios activos</option>
              <option value="banned">Usuarios suspendidos</option>
              <option value="future">Próximos a vencer</option>
              <option value="canceled">Usuarios que cancelaron</option>
              <option value="inactive">Usuarios expirados</option>
            </select>
            <input type="text" v-model="searchQuery" placeholder="Buscar usuario..."
              class="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none placeholder:text-white/20">
          </div>
        </div>

        <!-- Data Grid: Scroll Horizontal para aguantar mucha densidad de info -->
        <div class="w-full bg-[#09090b] border border-white/10 rounded-2xl overflow-hidden relative">

          <div class="absolute inset-0 opacity-[0.02] pointer-events-none"
            style="background-image: linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px); background-size: 20px 20px;">
          </div>

          <div class="w-full overflow-x-auto relative z-10 custom-scrollbar">
            <!-- La tabla necesita más min-width para acomodar las 5 super-columnas holgadamente -->
            <table class="w-full text-left border-collapse min-w-[1200px]">

              <!-- Header -->
              <thead>
                <tr class="border-b border-white/10 bg-white/2 font-poppins">
                  <th class="p-4 text-[10px] font-black uppercase tracking-widest text-white/40 min-w-[280px]"
                    v-tooltip="'Identidad / Contacto'"><span class="text-orange-500">ID Usuario</span>
                  </th>
                  <th class="p-4 text-[10px] font-black uppercase tracking-widest text-white/40 min-w-[180px]"
                    v-tooltip="'Actividad y QRs'">Actividad y QRs</th>
                  <th class="p-4 text-[10px] font-black uppercase tracking-widest text-white/40 min-w-[220px]"
                    v-tooltip="'Facturación y Planes'">
                    Facturación y Planes</th>
                  <th class="p-4 text-[10px] font-black uppercase tracking-widest text-white/40 min-w-[180px]"
                    v-tooltip="'Estado (Security)'">Estado
                    (Security)</th>
                  <th
                    class="p-4 text-[10px] font-black uppercase tracking-widest text-white/40 text-right min-w-[250px]"
                    v-tooltip="'Acciones de Mando'">
                    Acciones de Mando</th>
                </tr>
              </thead>

              <tbody v-if="!loading && usersComputed?.length">

                <tr v-for="(user, index) in usersComputed" :key="user.uid"
                  class="border-b border-white/5 hover:bg-white/[0.02] transition align-top">

                  <!-- IDENTIDAD -->
                  <td class="p-5">

                    <div class="flex gap-4">

                      <div
                        class="w-16 h-11 rounded-2xl border border-white/10 bg-white/5 flex items-center justify-center shrink-0">

                        <span class=" font-poppins text-xs text-white">

                          {{ getUserIdUI(user, index) }}

                        </span>

                      </div>

                      <div class="min-w-0 space-y-1">

                        <div class="flex items-center gap-2">

                          <h3 class="text-sm font-semibold text-white truncate max-w-[180px]">

                            {{ user.name }}

                          </h3>

                          <span
                            class="px-2 py-0.5 rounded-md border border-white/10 bg-white/5 text-[9px] uppercase tracking-widest text-white/50">

                            {{ user.role }}

                          </span>

                        </div>

                        <div class="text-xs text-white/40 flex gap-1">

                          <span class="material-symbols-outlined text-[12px]">

                            mail

                          </span>

                          {{ user.email }}

                        </div>

                        <div v-if="user.phone" class="text-xs text-white/30 flex gap-1">

                          <span class="material-symbols-outlined text-[12px]">

                            call

                          </span>

                          {{ user.phone }}

                        </div>

                        <!-- UID -->
                        <div class="flex gap-1 pt-2 mt-2 border-t border-white/5 items-center  flex-col">

                          <div class="flex items-center gap-1">

                            <span class="material-symbols-outlined text-[10px] text-white/20">

                              key

                            </span>
                            <span class="text-white/40 font-bold text-xs">UID Database:</span>

                          </div>
                          <span class="text-[9px] font-google-sans text-white/20  ">

                            {{ user.uid }}

                          </span>

                        </div>

                      </div>

                    </div>

                  </td>

                  <!-- ACTIVIDAD -->
                  <td class="p-5">

                    <div class="space-y-3">

                      <div class="flex gap-6">

                        <div>

                          <p class="text-[9px] uppercase tracking-widest text-white/30">

                            Total QR

                          </p>

                          <div class="flex gap-1 items-center text-white">

                            <span class="material-symbols-outlined text-[13px]">

                              qr_code_2

                            </span>

                            {{ user.totalQRs }}

                          </div>

                        </div>

                        <div class="w-px bg-white/10"></div>

                        <div>

                          <p class="text-[9px] uppercase tracking-widest text-white/30">

                            Cuenta

                          </p>

                          <span :class="user.isActive
                            ? 'text-orange-400'
                            : 'text-white/40'" class="text-xs"
                            v-tooltip="user.isActive ? 'Cuenta Activa' : 'Cuenta Inactiva'">

                            {{ user.isActive
                              ? 'Activa'
                              : 'Inactiva' }}

                          </span>

                        </div>

                      </div>

                      <!-- Fechas -->
                      <div class="rounded-xl border border-white/5 bg-black/30 p-3 space-y-2 text-[10px]">

                        <div class="flex justify-between">

                          <span class="text-white/30">

                            Registro

                          </span>

                          <span class="font-google-sans text-white/50">

                            {{ formatedDate(
                              user.createdAt) }}

                          </span>

                        </div>

                        <div class="flex justify-between">

                          <span class="text-white/30">

                            Último login

                          </span>

                          <span class="font-google-sans text-white/50">

                            {{ formatedDate(
                              user.lastLoginAt) }}

                          </span>

                        </div>

                      </div>

                    </div>

                  </td>

                  <!-- PLAN -->
                  <td class="p-5">
                    <div class="space-y-2">
                      <div v-if="getUserSubscriptions(user.uid).length === 0" class="text-xs text-white/30 italic">
                        Sin suscripciones
                      </div>
                      <div v-else class="space-y-1.5 max-w-52 max-h-60 overflow-auto custom-scrollbar">
                        <div v-for="sub in getUserSubscriptions(user.uid)" :key="sub.id"
                          class="p-2 rounded-xl border border-white/5 bg-white/[0.02] text-[11px] space-y-1">
                          <div class="flex items-center justify-between">
                            <span class="font-bold text-orange-400 uppercase text-[9px] tracking-wider">{{ sub.planType
                              }}</span>
                            <span
                              :class="sub.status === 'active' ? 'text-green-400 border-green-500/20 bg-green-500/5' : 'text-white/40 border-white/10 bg-white/5'"
                              class="px-1.5 py-0.2 rounded border text-[8px] uppercase tracking-wider font-bold">
                              {{ sub.status }}
                            </span>
                          </div>
                          <div class="text-[9px] text-white/40 flex justify-between">
                            <span class="wrap-break-word p-1">QRs: <br> {{ sub.totalQRsCreated }} / {{
                              sub.totalQRsAllowed
                              }}</span>
                            <span v-if="sub.endDate" class="font-mono text-white text-[8px]">Exp: {{
                              formatedDate(sub.endDate) }}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </td>

                  <!-- SEGURIDAD -->
                  <td class="p-5">

                    <div class="space-y-3">

                      <div
                        class="inline-flex gap-2 items-center px-3 py-1 rounded-xl border text-[10px] uppercase tracking-widest"
                        :class="user.isBanned
                          ? 'border-red-500/20 bg-red-500/5 text-red-400'
                          : 'border-white/10 bg-white/5 text-white/50'">

                        <span class="material-symbols-outlined text-[12px]">

                          {{ user.isBanned
                            ? 'block'
                            : 'shield' }}

                        </span>

                        {{ user.isBanned
                          ? 'Suspendido'
                          : 'Normal' }}

                      </div>

                      <!-- MOTIVO -->
                      <div v-if="user.isBanned && user.banReason"
                        class="rounded-xl border border-red-500/10 bg-red-500/[0.03] p-3 text-[10px] text-red-300">

                        <strong>

                          Motivo:

                        </strong>

                        {{ user.banReason }}

                      </div>

                    </div>

                  </td>

                  <!-- ACCIONES -->
                  <td class="p-4">

                    <div class="flex flex-col gap-2 min-w-[180px]">

                      <!-- Toolbar -->
                      <div class="grid grid-cols-2 gap-2">

                        <!-- QR -->
                        <button @click="openQRModal(user)" v-tooltip="'Asignar código QR'"
                          class="h-8 px-3 cursor-pointer rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition flex items-center justify-center gap-1.5">

                          <span class="material-symbols-outlined text-[13px] text-white/50">
                            qr_code
                          </span>

                          <span class="text-[9px] uppercase tracking-widest font-semibold text-white/70">
                            Agregar QR
                          </span>

                        </button>

                        <!-- Plan -->
                        <button @click="openPlanModal(user)" v-tooltip="'Gestionar Plan'"
                          class="h-8 px-3 cursor-pointer rounded-lg border border-orange-500/15 bg-orange-500/5 hover:bg-orange-500/10 transition flex items-center justify-center gap-1.5">

                          <span class="material-symbols-outlined text-[13px]">
                            workspace_premium
                          </span>

                          <span class="text-[9px] uppercase tracking-widest font-semibold">
                            Plan
                          </span>

                        </button>

                      </div>

                      <div class="grid grid-cols-2 gap-2">
                        <button @click="addFreeTrial(user)" v-tooltip="'Agregar prueba gratuita de 30 días'"
                          class="h-8 px-3 cursor-pointer rounded-lg border border-orange-500/15 bg-orange-500/5 hover:bg-orange-500/10 transition flex items-center justify-center gap-1.5">
                          <span class="material-symbols-outlined text-[13px] text-orange-400">rocket_launch</span>
                          <span class="text-[9px] uppercase tracking-widest font-semibold text-orange-300">+
                            Trial</span>
                        </button>
                      </div>

                      <!-- Ban -->
                      <button @click="openBanModal(user)" v-tooltip="'Suspender o reactivar acceso del usuario'"
                        class="h-8 px-3 cursor-pointer rounded-lg border transition flex items-center justify-center gap-1.5"
                        :class="user.isBanned
                          ? 'border-white/10 bg-white/5 text-white/50 hover:bg-white/10'
                          : 'border-red-500/15 bg-red-500/5 text-red-400 hover:bg-red-500/10'">

                        <span class="material-symbols-outlined text-[13px]">

                          {{ user.isBanned
                            ? 'how_to_reg'
                            : 'gavel' }}

                        </span>

                        <span class="text-[9px] uppercase tracking-widest font-semibold">

                          {{ user.isBanned
                            ? 'Restaurar'
                            : 'Suspender' }}

                        </span>

                      </button>

                    </div>

                  </td>

                </tr>

              </tbody>
            </table>
          </div>
        </div>

        <!-- Modales Independientes -->
        <QRNamePrompt :is-open="isQRModalOpen" :user-name="selectedUserForQR?.name || ''" @submit="handleQRSubmit"
          @cancel="isQRModalOpen = false" />

        <BanConfirmPrompt v-if="selectedUserForBan" :is-open="isBanModalOpen" :user="selectedUserForBan"
          :is-currently-banned="selectedUserForBan.isBanned || false" @submit="handleBanSubmit"
          @cancel="isBanModalOpen = false" />

        <ChangePlanPrompt :is-open="isPlanModalOpen" :user-name="selectedUserForPlan?.name || ''"
          :user-email="selectedUserForPlan?.email || ''"
          :current-plan="selectedUserForPlan ? getActivePlanType(selectedUserForPlan) : ''" @submit="handlePlanSubmit"
          @cancel="isPlanModalOpen = false" @cancelplan="cancelUserPlan" />

      </div>
    </template>
  </UserDashoardLayout>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue'
import UserDashoardLayout from '@/layouts/UserDashoardLayout.vue'
import QRNamePrompt from '@/components/admin/QRNamePrompt.vue'
import BanConfirmPrompt from '@/components/admin/BanConfirmPrompt.vue'
import ChangePlanPrompt from '@/components/admin/ChangePlanPrompt.vue'
import { toast } from 'vue-sonner'
import { collection, doc, increment, onSnapshot, runTransaction, Timestamp, writeBatch, collectionGroup } from 'firebase/firestore'
import { db as firestoreDb } from '@/firebase'
import type { IUser } from '@/interfaces/IUser'
import type { ISubscription } from '@/interfaces/ISubscription'
import { nanoid } from 'nanoid'

const loading = ref(true)

const usersData = ref<IUser[]>([])
const subscriptionsData = ref<ISubscription[]>([])

onMounted(() => {
  const db = firestoreDb;
  const usersCollection = collection(db, `users`);
  onSnapshot((usersCollection), (snapshot) => {
    usersData.value = []
    snapshot.forEach((doc) => {
      usersData.value.push(doc.data() as IUser)
    })
    loading.value = false
  })

  const subsCollectionGroup = collectionGroup(db, 'subscriptions')
  onSnapshot(subsCollectionGroup, (snapshot) => {
    subscriptionsData.value = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as ISubscription[]
  })
})

const getUserSubscriptions = (userId: string) => {
  return subscriptionsData.value.filter(sub => sub.userId === userId)
}

const getActivePlanType = (user: IUser): string => {
  const subs = getUserSubscriptions(user.uid)
  const activeSub = subs.find(s => s.status === 'active')
  return activeSub ? activeSub.planType : 'withoutPlan'
}

//===============================
//Values for dynamics componenrs (Ban, Plan, AddQR)
//===============================

//ADD QR
const isQRModalOpen = ref(false)
const selectedUserForQR = ref<IUser | null>(null)
const openQRModal = (user: IUser) => {
  selectedUserForQR.value = user;
  isQRModalOpen.value = true;
}
const handleQRSubmit = async (qrName: string) => {
  const user = selectedUserForQR.value

  if (!qrName || qrName.trim() === '') return toast.error(`Error al crear código QR: no se especificó un nombre`);
  if (!user?.uid) return toast.error(`Error al crear código QR: no se encontró el usuario`);

  try {
    // 1. Buscar suscripción activa con capacidad disponible
    const { getDocs, collection: col } = await import('firebase/firestore');
    const subsSnapshot = await getDocs(col(firestoreDb, `users/${user.uid}/subscriptions`));
    const activeSubDoc = subsSnapshot.docs.find(d => {
      const data = d.data();
      return data.status === 'active' && data.totalQRsCreated < data.totalQRsAllowed;
    });

    if (!activeSubDoc) {
      toast.error(`El usuario ${user.name} no tiene suscripciones activas con capacidad disponible.`);
      return;
    }

    const subId = activeSubDoc.id;

    await runTransaction(firestoreDb, async (transaction) => {
      // Re-leer la suscripción dentro de la transacción para consistencia
      const subRef = doc(firestoreDb, `users/${user.uid}/subscriptions/${subId}`);
      const subDocTx = await transaction.get(subRef);
      if (!subDocTx.exists()) throw new Error('Suscripción no encontrada.');
      const subData = subDocTx.data();
      if (subData.totalQRsCreated >= subData.totalQRsAllowed) {
        throw new Error('La suscripción seleccionada ya no tiene capacidad.');
      }

      const newQRId = nanoid(15);
      const publicQrRef = doc(firestoreDb, `publicQR/${newQRId}`);
      const userQrRef = doc(firestoreDb, `users/${user.uid}/qrs/${newQRId}`);

      // Verificar idempotencia
      const qrDoc = await transaction.get(publicQrRef);
      if (qrDoc.exists()) {
        throw new Error('Colisión de ID. La transacción se cancelará y puede reintentar.');
      }

      // Colección Pública (para escaneos)
      transaction.set(publicQrRef, {
        id: newQRId,
        name: qrName,
        status: 'Active',
        lastScan: null,
        totalScans: 0,
        isBanned: false,
        banReason: '',
        docId: newQRId,
        uid: user.uid,
        tier: subData.planType ?? 'free',
        createdAt: Timestamp.now()
      });

      // Subcolección del usuario
      transaction.set(userQrRef, {
        id: newQRId,
        uid: user.uid,
        name: qrName,
        status: 'Active',
        scans: 0,
        lastScan: '',
        isActive: true,
        isBanned: false,
        banReason: '',
        subscriptionId: subId,
        createdAt: Timestamp.now()
      });

      // Incrementar contadores
      const userRootRef = doc(firestoreDb, `users/${user.uid}`);
      transaction.update(userRootRef, { totalQRs: increment(1) });
      transaction.update(subRef, { totalQRsCreated: increment(1) });
    });

    toast.success(`QR "${qrName}" creado y asignado al plan ${activeSubDoc.data().planType} de ${user.name}`);
    isQRModalOpen.value = false;
    selectedUserForQR.value = null;
  } catch (error) {
    toast.error(`Fallo al crear el QR: ${error}`);
  }
}

//BAN USER
const isBanModalOpen = ref(false)
const openBanModal = (user: IUser) => {
  selectedUserForBan.value = user;
  isBanModalOpen.value = true;
}
const selectedUserForBan = ref<IUser | null>(null)
const handleBanSubmit = async (reason: string) => {
  if (!selectedUserForBan.value?.uid) return;
  const userRef = doc(firestoreDb, 'users', selectedUserForBan.value.uid);
  const batch = writeBatch(firestoreDb);
  try {
    batch.update(userRef, {
      isBanned: !selectedUserForBan.value.isBanned,
      banReason: reason ?? 'No se especificó un motivo para la suspensión'
    });
    await batch.commit();
    toast.success('Usuario ' + selectedUserForBan.value.name + ' suspendido exitosamente');
    isBanModalOpen.value = false;
    selectedUserForBan.value = null;
  } catch (error) {
    toast.error('Error al suspender usuario: ' + error);
  }
}

//MANAGE USER PLAN
const isPlanModalOpen = ref(false)
const selectedUserForPlan = ref<IUser | null>(null)
const openPlanModal = (user: IUser) => {
  selectedUserForPlan.value = user;
  isPlanModalOpen.value = true;
}

const handlePlanSubmit = async (plan: string) => {
  const user = selectedUserForPlan.value;
  if (!user?.uid) return;
  const now = new Date();
  const nextYear = new Date(now);
  nextYear.setFullYear(nextYear.getFullYear() + 1);

  const newSubId = nanoid(15);
  const newSubRef = doc(firestoreDb, `users/${user.uid}/subscriptions/${newSubId}`);

  try {
    await runTransaction(firestoreDb, async (transaction) => {
      // Crear nueva suscripción activa sin desactivar las previas
      transaction.set(newSubRef, {
        id: newSubId,
        userId: user.uid,
        planType: plan,
        status: 'active',
        purchasedAt: Timestamp.fromDate(now),
        endDate: Timestamp.fromDate(nextYear),
        paymentProviderId: 'admin',
        totalQRsAllowed: plan === 'oro' ? 5 : plan === 'plata' ? 3 : 1,
        totalQRsCreated: 0,
        freeShipmentsAllowed: 1, // 1 envío gratuito incluido por plan
        freeShipmentsUsed: 0
      });
    });

    toast.success('Nueva suscripción agregada al usuario ' + user.name);
    isPlanModalOpen.value = false;
    selectedUserForPlan.value = null;
  } catch (error) {
    toast.error('Error al agregar suscripción al usuario: ' + error);
  }
}

const addFreeTrial = async (user: IUser) => {
  if (!user.uid) return;
  const now = new Date();
  const nextMonth = new Date(now);
  nextMonth.setMonth(nextMonth.getMonth() + 1);

  const subId = nanoid(15);
  const subRef = doc(firestoreDb, `users/${user.uid}/subscriptions/${subId}`);

  try {
    await runTransaction(firestoreDb, async (transaction) => {
      // Agregar trial activo sin desactivar las previas
      transaction.set(subRef, {
        id: subId,
        userId: user.uid,
        planType: 'trial',
        status: 'active',
        purchasedAt: Timestamp.fromDate(now),
        endDate: Timestamp.fromDate(nextMonth),
        paymentProviderId: 'admin',
        totalQRsAllowed: 1,
        totalQRsCreated: 0,
        freeShipmentsAllowed: 1, // 1 envío gratuito incluido por plan
        freeShipmentsUsed: 0
      });
    });

    toast.success('Suscripción Trial agregada exitosamente al usuario ' + user.name);
  } catch (error) {
    toast.error('Error al agregar trial al usuario: ' + error);
  }
}

const removeFreeTrial = async (_user: IUser) => {
  toast.info('Para remover un trial, cancele la suscripción.');
}

const cancelUserPlan = async () => {
  const user = selectedUserForPlan.value;
  if (!user?.uid) return;

  const subs = getUserSubscriptions(user.uid);
  const activeSub = subs.find(s => s.status === 'active');
  if (!activeSub) {
    toast.error('El usuario no tiene una suscripción activa para cancelar.');
    return;
  }

  try {
    const subRef = doc(firestoreDb, `users/${user.uid}/subscriptions/${activeSub.id}`);
    await runTransaction(firestoreDb, async (transaction) => {
      transaction.update(subRef, {
        status: 'canceled',
        cancelReason: 'Cancelado por el Administrador'
      });
    });
    toast.success(`Suscripción ${activeSub.planType} cancelada para ${user.name}`);
    isPlanModalOpen.value = false;
    selectedUserForPlan.value = null;
  } catch (error) {
    toast.error(`Error al cancelar suscripción: ${error}`);
  }
}

const formatedDate = (date: Timestamp | null): string => {
  if (!date) return 'N/A';
  return date.toDate().toLocaleString('es-MX', { dateStyle: 'full', timeStyle: 'short' })
}

const selectedFilter = ref<'all' | 'active' | 'banned' | 'future' | 'canceled' | 'inactive'>('all');

const searchQuery = ref('');

const usersComputed = computed(() => {
  let result = usersData.value;

  if (!selectedFilter.value || selectedFilter.value === 'all') {
    // No filtrar, devolver todos
  } else if (selectedFilter.value === 'active') {
    result = result.filter(u => !u.isBanned && u.isActive);
  } else if (selectedFilter.value === 'banned') {
    result = result.filter(u => u.isBanned);
  } else if (selectedFilter.value === 'future') {
    result = result.filter(u => {
      const subs = getUserSubscriptions(u.uid);
      const activeSub = subs.find(s => s.status === 'active');
      return activeSub && activeSub.endDate != null && activeSub.endDate.toDate() > new Date();
    });
  } else if (selectedFilter.value === 'canceled') {
    result = result.filter(u => {
      const subs = getUserSubscriptions(u.uid);
      return subs.some(s => s.status === 'canceled');
    });
  } else if (selectedFilter.value === 'inactive') {
    result = result.filter(u => {
      const subs = getUserSubscriptions(u.uid);
      return subs.some(s => s.status === 'inactive') || subs.length === 0;
    });
  }

  if (searchQuery.value) {
    result = result.filter(u =>
      u.name?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
  }

  return result;
})

const getUserIdUI = (userPayload: IUser, index: number) => {
  const initial = userPayload.name?.charAt(0).toUpperCase() ?? 'U';
  const planType = getActivePlanType(userPayload);
  const prefixMap: Record<string, string> = {
    withoutPlan: 'N',
    trial: 'T',
    bronce: 'B',
    plata: 'P',
    oro: 'O',
  };
  const prefix = prefixMap[planType] ?? 'U';
  return `${prefix}${String(index).padStart(5, '0')}${initial}`;
}

</script>

<style scoped>
.font-google-sans {
  font-family: 'Google Sans', sans-serif;
}

.font-poppins {
  font-family: 'Poppins', sans-serif;
}

.material-symbols-outlined {
  font-variation-settings: 'FILL' 1, 'wght' 600, 'GRAD' 0, 'opsz' 24;
}

/* Scrollbar estilizada */
.custom-scrollbar::-webkit-scrollbar {
  height: 8px;
  width: 8px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 136, 0, 0.2);
  /* Naranja sutil */
  border-radius: 10px;
  border: 2px solid #09090b;
  /* Padding hack */
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 136, 0, 0.5);
}
</style>
