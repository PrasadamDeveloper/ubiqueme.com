<template>
  <UserDashoardLayout>
    <template #main>
      <div class="relative min-h-screen bg-[#0a0a0b] w-full font-google-sans overflow-hidden">

        <!-- Grid overlay -->
        <div class="absolute inset-0 opacity-[0.03] pointer-events-none"
          style="background-image: linear-gradient(rgba(255,255,255,.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.4) 1px, transparent 1px); background-size: 48px 48px;">
        </div>

        <!-- Radial glow -->
        <div
          class="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[#ff7900]/5 rounded-full blur-[120px] pointer-events-none">
        </div>

        <div class="relative z-10 pt-28 pb-20 px-4 sm:px-6 lg:px-8">

          <!-- Header -->
          <div class="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div>
              <div
                class="inline-flex items-center gap-2 px-3 py-1 bg-[#ff7900]/10 rounded-full border border-[#ff7900]/20 mb-3">
                <span class="w-1.5 h-1.5 rounded-full bg-[#ff7900]"></span>
                <span class="text-[9px] font-black uppercase tracking-[0.3em] text-[#ff7900]">Administración</span>
              </div>
              <h1 class="text-3xl font-black text-white tracking-tight">
                Centro de <span class="text-[#ff7900]">control</span>
              </h1>
              <p class="text-white/35 text-sm mt-1">Inspección de base de datos de usuarios</p>
            </div>

            <div class="flex items-center gap-3 flex-wrap">
              <select v-model="selectedFilter"
                class="h-10 px-3 rounded-xl border border-white/[0.06] bg-[#0d0d0e] text-white text-[11px] outline-none focus:border-[#ff7900]/40 cursor-pointer appearance-none">
                <option value="all">Todos</option>
                <option value="active">Activos</option>
                <option value="banned">Suspendidos</option>
                <option value="future">Próximos a vencer</option>
                <option value="canceled">Cancelados</option>
                <option value="inactive">Expirados</option>
              </select>
              <input type="text" v-model="searchQuery" placeholder="Buscar usuario..."
                class="h-10 px-4 rounded-xl border border-white/[0.06] bg-[#0d0d0e] text-white text-sm outline-none focus:border-[#ff7900]/40 placeholder:text-white/20 w-48">
            </div>
          </div>

          <!-- Users Grid -->
          <div v-if="!loading && usersComputed?.length" class="space-y-4">
            <div v-for="(user, index) in usersComputed" :key="user.uid"
              class="rounded-2xl border border-white/[0.06] bg-[#0d0d0e] overflow-hidden hover:border-white/[0.12] transition-all">

              <!-- User Header - clickable row info -->
              <div class="p-5 flex flex-col lg:flex-row lg:items-start gap-5">

                <!-- Identity -->
                <div class="flex items-start gap-4 flex-1 min-w-0">
                  <div
                    class="w-12 h-12 rounded-xl bg-[#ff7900]/10 border border-[#ff7900]/20 flex items-center justify-center shrink-0">
                    <span class="text-[#ff7900] font-black text-xs">{{ getUserIdUI(user, index) }}</span>
                  </div>
                  <div class="min-w-0 space-y-1.5 flex-1">
                    <div class="flex items-center gap-2 flex-wrap">
                      <h3 class="text-base font-bold text-white ">{{ user.name }}</h3>
                      <span
                        class="px-2 py-0.5 rounded-md border border-white/10 bg-white/[0.04] text-[8px] uppercase tracking-widest text-white/40 font-black">{{
                          user.role }}</span>
                    </div>
                    <div class="flex items-center gap-3 text-xs text-white/40 flex-wrap">
                      <span class="flex items-center gap-1">
                        <span class="material-symbols-outlined text-[12px]">mail</span>
                        {{ user.email }}
                      </span>
                      <span v-if="user.phone" class="flex items-center gap-1">
                        <span class="material-symbols-outlined text-[12px]">call</span>
                        {{ user.phone }}
                      </span>
                    </div>
                    <div class="pt-2 mt-2 border-t border-white/[0.04] flex items-center gap-2">
                      <span class="text-[9px] text-white/20 font-mono">{{ user.uid }}</span>
                    </div>
                  </div>
                </div>

                <!-- Activity -->
                <div class="flex items-center gap-6 shrink-0">
                  <div class="text-center">
                    <p class="text-[9px] uppercase tracking-widest text-white/30 font-black mb-1">QRs</p>
                    <div class="flex items-center gap-1 text-white text-sm font-bold">
                      <span class="material-symbols-outlined text-[14px] text-[#ff7900]">qr_code_2</span>
                      {{ user.totalQRs }}
                    </div>
                  </div>
                  <div class="text-center">
                    <p class="text-[9px] uppercase tracking-widest text-white/30 font-black mb-1">Cuenta</p>
                    <span class="text-xs font-bold" :class="user.isActive ? 'text-[#ff7900]' : 'text-white/30'">
                      {{ user.isActive ? 'Activa' : 'Inactiva' }}
                    </span>
                  </div>
                </div>

                <!-- Dates compact -->
                <div class="text-[10px] space-y-1 shrink-0 min-w-[160px]">
                  <div class="flex justify-between gap-4">
                    <span class="text-white/30">Registro</span>
                    <span class="text-white/50 font-mono">{{ formatedDate(user.createdAt) }}</span>
                  </div>
                  <div class="flex justify-between gap-4">
                    <span class="text-white/30">Último login</span>
                    <span class="text-white/50 font-mono">{{ formatedDate(user.lastLoginAt) }}</span>
                  </div>
                </div>

                <!-- Status badge -->
                <div class="shrink-0">
                  <div
                    class="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl border text-[9px] uppercase tracking-widest font-black"
                    :class="user.isBanned
                      ? 'border-red-500/20 bg-red-500/5 text-red-400'
                      : 'border-white/10 bg-white/[0.03] text-white/40'">
                    <span class="material-symbols-outlined text-[11px]">{{ user.isBanned ? 'block' : 'shield' }}</span>
                    {{ user.isBanned ? 'Suspendido' : 'Normal' }}
                  </div>
                  <div v-if="user.isBanned && user.banReason"
                    class="mt-2 text-[10px] text-red-300/70 max-w-[160px] leading-relaxed">
                    <strong>Motivo:</strong> {{ user.banReason }}
                  </div>
                </div>

                <!-- Actions -->
                <div class="flex flex-wrap items-start gap-2 shrink-0 min-w-[140px]">
                  <button @click="openQRModal(user)" v-tooltip="'Asignar código QR'"
                    class="h-9 px-3 rounded-xl border border-white/[0.06] bg-white/[0.03] hover:bg-[#ff7900]/10 hover:border-[#ff7900]/20 text-white/60 hover:text-[#ff7900] transition flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest cursor-pointer">
                    <span class="material-symbols-outlined text-[14px]">qr_code</span>
                    QR
                  </button>
                  <button @click="openPlanModal(user)" v-tooltip="'Gestionar Plan'"
                    class="h-9 px-3 rounded-xl border border-[#ff7900]/15 bg-[#ff7900]/5 text-[#ff7900]/80 hover:bg-[#ff7900]/10 transition flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest cursor-pointer">
                    <span class="material-symbols-outlined text-[14px]">workspace_premium</span>
                    Plan
                  </button>
                  <button @click="addFreeTrial(user)" v-tooltip="'Agregar prueba gratuita de 30 días'"
                    class="h-9 px-3 rounded-xl border border-[#ff7900]/15 bg-[#ff7900]/5 text-[#ff7900]/60 hover:bg-[#ff7900]/10 transition flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest cursor-pointer">
                    <span class="material-symbols-outlined text-[14px]">rocket_launch</span>
                    Trial
                  </button>
                  <button @click="openBanModal(user)" v-tooltip="'Suspender o reactivar acceso'"
                    class="h-9 px-3 rounded-xl border transition flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest cursor-pointer"
                    :class="user.isBanned
                      ? 'border-white/10 bg-white/5 text-white/50 hover:bg-white/10'
                      : 'border-red-500/15 bg-red-500/5 text-red-400 hover:bg-red-500/10'">
                    <span class="material-symbols-outlined text-[14px]">{{ user.isBanned ? 'how_to_reg' : 'gavel'
                    }}</span>
                    {{ user.isBanned ? 'Restaurar' : 'Suspender' }}
                  </button>
                </div>

              </div>

              <!-- Subscriptions section -->
              <div v-if="getUserSubscriptions(user.uid).length > 0"
                class="border-t border-white/[0.04] px-5 py-4 bg-white/[0.01] space-y-3">
                <div class="flex items-center gap-2">
                  <span class="material-symbols-outlined text-[13px] text-white/25">workspace_premium</span>
                  <span class="text-[9px] font-black uppercase tracking-[0.25em] text-white/25">Suscripciones ({{
                    getUserSubscriptions(user.uid).length }})</span>
                </div>
                <div class="flex flex-wrap gap-3">
                  <div v-for="sub in getUserSubscriptions(user.uid)" :key="sub.id"
                    class="flex-1 min-w-[220px] max-w-sm p-4 rounded-xl border border-white/[0.06] bg-white/[0.02] space-y-3">

                    <!-- Header: Plan + Status -->
                    <div class="flex items-center justify-between">
                      <div class="flex items-center gap-2">
                        <span class="material-symbols-outlined text-[16px] text-[#ff7900]">workspace_premium</span>
                        <span class="font-black text-[#ff7900] uppercase text-[11px] tracking-wider">{{ sub.planType
                          }}</span>
                      </div>
                      <span
                        :class="sub.status === 'active' ? 'bg-green-500/10 text-green-400 border-green-500/20' : sub.status === 'canceled' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-white/5 text-white/40 border-white/10'"
                        class="px-2 py-0.5 rounded-full border text-[8px] font-black uppercase tracking-widest">
                        {{ sub.status === 'active' ? 'Activo' : sub.status === 'canceled' ? 'Cancelado' : 'Inactivo' }}
                      </span>
                    </div>

                    <!-- ID -->
                    <div class="text-[9px] text-white/20 font-mono truncate" :title="'ID: ' + sub.id">
                      ID: {{ sub.id }}
                    </div>

                    <!-- QR usage with progress -->
                    <div>
                      <div class="flex justify-between text-[10px] mb-1">
                        <span class="text-white/40">Códigos QR</span>
                        <span class="text-white font-mono font-bold">{{ sub.totalQRsCreated }} / {{ sub.totalQRsAllowed
                          }}</span>
                      </div>
                      <div class="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div class="h-full rounded-full transition-all duration-500"
                          :class="sub.totalQRsCreated >= sub.totalQRsAllowed ? 'bg-red-500' : 'bg-[#ff7900]'"
                          :style="{ width: `${Math.min((sub.totalQRsCreated / sub.totalQRsAllowed) * 100, 100)}%` }">
                        </div>
                      </div>
                    </div>

                    <!-- Envíos -->
                    <div class="flex justify-between text-[10px]">
                      <span class="text-white/40">Envíos gratuitos usados</span>
                      <span class="text-white font-mono font-bold">{{ sub.freeShipmentsUsed ?? 0 }} / {{
                        sub.freeShipmentsAllowed ?? 1 }}</span>
                    </div>

                    <!-- Fechas -->
                    <div class="space-y-1 text-[10px] pt-1 border-t border-white/[0.04]">
                      <div class="flex justify-between">
                        <span class="text-white/30">Inicio</span>
                        <span class="text-white/50 font-mono">{{ formatedDate(sub.purchasedAt) }}</span>
                      </div>
                      <div class="flex justify-between">
                        <span class="text-white/30">Vencimiento</span>
                        <span class="text-white/50 font-mono"
                          :class="sub.status === 'active' && sub.endDate && sub.endDate.toDate() < new Date() ? 'text-red-400' : ''">
                          {{ formatedDate(sub.endDate) }}
                        </span>
                      </div>
                      <div v-if="sub.cancelReason" class="flex justify-between">
                        <span class="text-white/30">Motivo cancelación</span>
                        <span class="text-red-300/60 font-mono text-right max-w-[120px]">{{ sub.cancelReason }}</span>
                      </div>
                    </div>

                    <!-- Proveedor de pago -->
                    <div class="text-[9px] text-white/20 font-mono">
                      Proveedor: {{ sub.paymentProviderId ?? 'N/A' }}
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="border-t border-white/[0.04] px-5 py-3 bg-white/[0.01]">
                <span class="text-[11px] text-white/25 italic">Sin suscripciones</span>
              </div>

            </div>
          </div>

          <!-- Loading -->
          <div v-if="loading" class="text-center py-20">
            <div class="w-6 h-6 border-2 border-[#ff7900]/30 border-t-[#ff7900] rounded-full animate-spin mx-auto">
            </div>
          </div>

          <!-- Empty -->
          <div v-if="!loading && !usersComputed?.length" class="text-center py-20">
            <span class="material-symbols-outlined text-5xl text-white/10 mb-4">folder_off</span>
            <p class="text-white/30">No se encontraron usuarios</p>
          </div>
        </div>

        <!-- Modales -->
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

//ADD QR
const isQRModalOpen = ref(false)
const selectedUserForQR = ref<IUser | null>(null)
const openQRModal = (user: IUser) => {
  selectedUserForQR.value = user;
  isQRModalOpen.value = true;
}
const handleQRSubmit = async (qrName: string, category: string) => {
  const user = selectedUserForQR.value

  if (!qrName || qrName.trim() === '') return toast.error(`Error al crear código QR: no se especificó un nombre`);
  if (!user?.uid) return toast.error(`Error al crear código QR: no se encontró el usuario`);

  try {
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

      const qrDoc = await transaction.get(publicQrRef);
      if (qrDoc.exists()) {
        throw new Error('Colisión de ID. La transacción se cancelará y puede reintentar.');
      }

      transaction.set(publicQrRef, {
        id: newQRId,
        name: qrName,
        category,
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

      transaction.set(userQrRef, {
        id: newQRId,
        uid: user.uid,
        name: qrName,
        category,
        status: 'Active',
        scans: 0,
        lastScan: '',
        isActive: true,
        isBanned: false,
        banReason: '',
        subscriptionId: subId,
        createdAt: Timestamp.now()
      });

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
        freeShipmentsAllowed: 1,
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
        freeShipmentsAllowed: 1,
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

.material-symbols-outlined {
  font-variation-settings: 'FILL' 1, 'wght' 600, 'GRAD' 0, 'opsz' 24;
}
</style>
