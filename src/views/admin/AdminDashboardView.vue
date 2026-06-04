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

                <!-- Actions with loading states -->
                <div class="flex flex-wrap items-start gap-2 shrink-0 min-w-[140px]">
                  <button @click="openPlanModal(user)" v-tooltip="'Gestionar Plan'" :disabled="processingPlanSubmit"
                    class="h-9 px-3 rounded-xl border border-[#ff7900]/15 bg-[#ff7900]/5 text-[#ff7900]/80 hover:bg-[#ff7900]/10 transition flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">
                    <span v-if="processingPlanSubmit"
                      class="w-3 h-3 border-2 border-[#ff7900]/30 border-t-[#ff7900] rounded-full animate-spin"></span>
                    <span v-else class="material-symbols-outlined text-[14px]">workspace_premium</span>
                    Asignar Plan
                  </button>
                  <button v-if="hasActiveTrial(user.uid)" @click="endFreeTrial(user)"
                    v-tooltip="'Finalizar prueba gratuita antes de tiempo'" :disabled="processingCancelReason"
                    class="h-9 px-3 rounded-xl border border-red-500/15 bg-red-500/5 text-red-400/80 hover:bg-red-500/10 transition flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">
                    <span v-if="processingCancelReason"
                      class="w-3 h-3 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin"></span>
                    <span v-else class="material-symbols-outlined text-[14px]">cancel</span>
                    Terminar Trial
                  </button>
                  <button v-else @click="addFreeTrial(user)" v-tooltip="'Agregar prueba gratuita de 30 días'"
                    :disabled="processingAddTrial"
                    class="h-9 px-3 rounded-xl border border-[#ff7900]/15 bg-[#ff7900]/5 text-[#ff7900]/60 hover:bg-[#ff7900]/10 transition flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">
                    <span v-if="processingAddTrial"
                      class="w-3 h-3 border-2 border-[#ff7900]/30 border-t-[#ff7900] rounded-full animate-spin"></span>
                    <span v-else class="material-symbols-outlined text-[14px]">rocket_launch</span>
                    Asignar Trial
                  </button>
                  <button @click="openBanModal(user)" v-tooltip="'Suspender o reactivar acceso'"
                    :disabled="processingBanSubmit"
                    class="h-9 px-3 rounded-xl border transition flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    :class="user.isBanned
                      ? 'border-white/10 bg-white/5 text-white/50 hover:bg-white/10'
                      : 'border-red-500/15 bg-red-500/5 text-red-400 hover:bg-red-500/10'">
                    <span v-if="processingBanSubmit"
                      class="w-3 h-3 border-2 border-current/30 border-t-current rounded-full animate-spin"></span>
                    <span v-else class="material-symbols-outlined text-[14px]">{{ user.isBanned ? 'how_to_reg' : 'gavel'
                    }}</span>
                    {{ user.isBanned ? 'Restaurar cuenta' : 'Suspender cuenta' }}
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
                      <div v-if="sub.canceledByAdmin?.reason" class="pt-2 mt-2 border-t border-white/[0.04] space-y-1">
                        <div class="flex justify-between">
                          <span class="text-white/30">Motivo cancelación</span>
                          <span class="text-red-300/70 font-mono text-right max-w-[130px]">{{ sub.canceledByAdmin.reason
                            }}</span>
                        </div>
                        <div class="flex justify-between">
                          <span class="text-white/30">Cancelado por</span>
                          <span class="text-white/50 font-mono text-right">{{ sub.canceledByAdmin.name }}</span>
                        </div>
                        <div class="flex justify-between">
                          <span class="text-white/30">Fecha cancelación</span>
                          <span class="text-white/50 font-mono text-right">{{
                            formatedDate(sub.canceledByAdmin.canceledAt) }}</span>
                        </div>
                      </div>
                    </div>

                    <!-- Proveedor de pago -->
                    <div class="text-[9px] text-white/20 font-mono">
                      Proveedor: {{ sub.paymentProviderId ?? 'N/A' }}
                    </div>

                    <!-- Actions per subscription with loading -->
                    <div class="flex items-center gap-2 pt-1">
                      <button @click="openQRModal(user, sub)"
                        v-if="sub.status === 'active' && sub.totalQRsCreated < sub.totalQRsAllowed"
                        v-tooltip="'Asignar QR a este plan'" :disabled="processingQRSubmit"
                        class="flex-1 h-8 rounded-xl border border-[#ff7900]/15 bg-[#ff7900]/5 text-[#ff7900]/80 hover:bg-[#ff7900]/10 transition flex items-center justify-center gap-1 text-[8px] font-black uppercase tracking-widest cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">
                        <span v-if="processingQRSubmit"
                          class="w-3 h-3 border-2 border-[#ff7900]/30 border-t-[#ff7900] rounded-full animate-spin"></span>
                        <span v-else class="material-symbols-outlined text-[12px]">qr_code</span>
                        Asignar QR
                      </button>
                      <button v-if="sub.status === 'active'" @click="cancelSubscription(sub.id, sub.userId)"
                        :disabled="processingCancelReason"
                        class="flex-1 h-8 rounded-xl border border-red-500/15 bg-red-500/5 text-red-400/80 hover:bg-red-500/10 transition flex items-center justify-center gap-1 text-[8px] font-black uppercase tracking-widest cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">
                        <span v-if="processingCancelReason"
                          class="w-3 h-3 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin"></span>
                        <span v-else class="material-symbols-outlined text-[12px]">block</span>
                        Cancelar
                      </button>
                      <button v-if="sub.status === 'canceled'" @click="renewSubscription(sub)"
                        :disabled="processingRenew"
                        class="flex-1 h-8 rounded-xl border border-green-500/15 bg-green-500/5 text-green-400/80 hover:bg-green-500/10 transition flex items-center justify-center gap-1 text-[8px] font-black uppercase tracking-widest cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">
                        <span v-if="processingRenew"
                          class="w-3 h-3 border-2 border-green-400/30 border-t-green-400 rounded-full animate-spin"></span>
                        <span v-else class="material-symbols-outlined text-[12px]">refresh</span>
                        Renovar
                      </button>
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
        <QRNamePrompt :is-open="isQRModalOpen" :user-name="selectedQRContext?.user.name || ''"
          :loading="processingQRSubmit" @submit="handleQRSubmit" @cancel="isQRModalOpen = false" />

        <BanConfirmPrompt v-if="selectedUserForBan" :is-open="isBanModalOpen" :user="selectedUserForBan"
          :is-currently-banned="selectedUserForBan.isBanned || false" :processing="processingBanSubmit"
          @submit="handleBanSubmit" @cancel="isBanModalOpen = false" />

        <ChangePlanPrompt :is-open="isPlanModalOpen" :user-name="selectedUserForPlan?.name || ''"
          :user-email="selectedUserForPlan?.email || ''"
          :current-plan="selectedUserForPlan ? getActivePlanType(selectedUserForPlan) : ''"
          :loading="processingPlanSubmit" @submit="handlePlanSubmit" @cancel="isPlanModalOpen = false"
          @cancelplan="openCancelReasonForPlan" />

        <CancelReasonPrompt :is-open="isCancelReasonOpen" :plan-type="cancelReasonPlanType"
          :user-name="cancelReasonUserName" :loading="processingCancelReason" @submit="handleCancelReasonConfirm"
          @cancel="isCancelReasonOpen = false" />

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
import CancelReasonPrompt from '@/components/admin/CancelReasonPrompt.vue'
import { toast } from 'vue-sonner'
import { collection, doc, increment, onSnapshot, runTransaction, Timestamp, writeBatch, collectionGroup } from 'firebase/firestore'
import { db as firestoreDb } from '@/firebase'
import { useUserStore } from '@/stores/user'
import type { IUser } from '@/interfaces/IUser'
import type { ISubscription } from '@/interfaces/ISubscription'
import { nanoid } from 'nanoid'

const userStore = useUserStore()

const loading = ref(true)
const processingQRSubmit = ref(false)
const processingBanSubmit = ref(false)
const processingPlanSubmit = ref(false)
const processingAddTrial = ref(false)
const processingCancelReason = ref(false)
const processingRenew = ref(false)

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

interface QRModalContext {
  user: IUser
  sub: ISubscription
}

//ADD QR
const isQRModalOpen = ref(false)
const selectedQRContext = ref<QRModalContext | null>(null)

const openQRModal = (user: IUser, sub: ISubscription) => {
  selectedQRContext.value = { user, sub };
  isQRModalOpen.value = true;
}

const handleQRSubmit = async (qrName: string, category: string) => {
  const context = selectedQRContext.value
  if (!context) return
  const { user, sub } = context

  if (!qrName || qrName.trim() === '') return toast.error(`Error al crear código QR: no se especificó un nombre`);
  if (!user?.uid) return toast.error(`Error al crear código QR: no se encontró el usuario`);

  if (sub.totalQRsCreated >= sub.totalQRsAllowed) {
    toast.error('La suscripción seleccionada ya no tiene capacidad.');
    return;
  }

  const subId = sub.id;
  processingQRSubmit.value = true;

  try {
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

    toast.success(`QR "${qrName}" creado y asignado al plan ${sub.planType} de ${user.name}`);
    isQRModalOpen.value = false;
    selectedQRContext.value = null;
  } catch (error) {
    toast.error(`Fallo al crear el QR: ${error}`);
  } finally {
    processingQRSubmit.value = false;
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
  processingBanSubmit.value = true;
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
  } finally {
    processingBanSubmit.value = false;
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
  processingPlanSubmit.value = true;
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
  } finally {
    processingPlanSubmit.value = false;
  }
}

const addFreeTrial = async (user: IUser) => {
  if (!user.uid) return;
  processingAddTrial.value = true;
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
  } finally {
    processingAddTrial.value = false;
  }
}

type CancelActionType = 'subscription' | 'userPlan' | 'trial'

const isCancelReasonOpen = ref(false)
const cancelReasonPlanType = ref('')
const cancelReasonUserName = ref('')
const cancelActionType = ref<CancelActionType>('subscription')
const cancelPendingSubId = ref('')
const cancelPendingUserId = ref('')
const cancelPendingUser = ref<IUser | null>(null)

const openCancelReason = (actionType: CancelActionType, planType: string, userName: string, subId?: string, userId?: string, user?: IUser) => {
  cancelActionType.value = actionType
  cancelReasonPlanType.value = planType
  cancelReasonUserName.value = userName
  if (subId) cancelPendingSubId.value = subId
  if (userId) cancelPendingUserId.value = userId
  if (user) cancelPendingUser.value = user
  isCancelReasonOpen.value = true
}

const openCancelReasonForPlan = () => {
  const user = selectedUserForPlan.value
  if (!user?.uid) return
  const subs = getUserSubscriptions(user.uid)
  const activeSub = subs.find(s => s.status === 'active')
  if (!activeSub) {
    toast.error('El usuario no tiene una suscripción activa para cancelar.')
    return
  }
  openCancelReason('userPlan', activeSub.planType, user.name)
}

const executeCancelWithReason = async (reason: string) => {
  const adminName = userStore.getFullName || 'Admin'
  const adminUid = userStore.getUserId || 'unknown'
  const canceledByAdmin = {
    name: adminName,
    uid: adminUid,
    reason: reason || 'No se especificó motivo',
    canceledAt: Timestamp.now()
  }

  if (cancelActionType.value === 'subscription') {
    const subId = cancelPendingSubId.value
    const userId = cancelPendingUserId.value
    if (!subId || !userId) return

    const subRef = doc(firestoreDb, `users/${userId}/subscriptions/${subId}`)
    const userRef = doc(firestoreDb, `users/${userId}`)
    await runTransaction(firestoreDb, async (transaction) => {
      const subDoc = await transaction.get(subRef)
      if (!subDoc.exists()) throw new Error('Suscripción no encontrada')
      const subData = subDoc.data()

      transaction.update(subRef, {
        status: 'canceled',
        cancelReason: reason || 'No se especificó motivo',
        canceledByAdmin
      })

      if (subData.totalQRsCreated > 0) {
        transaction.update(userRef, {
          totalQRs: increment(-subData.totalQRsCreated)
        })
      }
    })
    toast.success('Suscripción cancelada exitosamente')
  }

  if (cancelActionType.value === 'userPlan') {
    const user = selectedUserForPlan.value
    if (!user?.uid) return
    const subs = getUserSubscriptions(user.uid)
    const activeSub = subs.find(s => s.status === 'active')
    if (!activeSub) {
      toast.error('El usuario no tiene una suscripción activa para cancelar.')
      return
    }

    const subRef = doc(firestoreDb, `users/${user.uid}/subscriptions/${activeSub.id}`)
    const userRef = doc(firestoreDb, `users/${user.uid}`)
    await runTransaction(firestoreDb, async (transaction) => {
      const subDoc = await transaction.get(subRef)
      if (!subDoc.exists()) throw new Error('Suscripción no encontrada')
      const subData = subDoc.data()

      transaction.update(subRef, {
        status: 'canceled',
        cancelReason: reason || 'No se especificó motivo',
        canceledByAdmin
      })

      if (subData.totalQRsCreated > 0) {
        transaction.update(userRef, {
          totalQRs: increment(-subData.totalQRsCreated)
        })
      }
    })
    toast.success(`Suscripción ${activeSub.planType} cancelada para ${user.name}`)
    isPlanModalOpen.value = false
    selectedUserForPlan.value = null
  }

  if (cancelActionType.value === 'trial') {
    const user = cancelPendingUser.value
    if (!user?.uid) return

    const subs = getUserSubscriptions(user.uid)
    const activeTrial = subs.find(s => s.planType === 'trial' && s.status === 'active')
    if (!activeTrial) {
      toast.error('El usuario no tiene un trial activo para terminar.')
      return
    }

    const subRef = doc(firestoreDb, `users/${user.uid}/subscriptions/${activeTrial.id}`)
    const userRef = doc(firestoreDb, `users/${user.uid}`)
    await runTransaction(firestoreDb, async (transaction) => {
      const subDoc = await transaction.get(subRef)
      if (!subDoc.exists()) throw new Error('Suscripción no encontrada')
      const subData = subDoc.data()

      transaction.update(subRef, {
        status: 'canceled',
        cancelReason: reason || 'No se especificó motivo',
        canceledByAdmin
      })

      if (subData.totalQRsCreated > 0) {
        transaction.update(userRef, {
          totalQRs: increment(-subData.totalQRsCreated)
        })
      }
    })
    toast.success(`Trial finalizado para ${user.name}`)
  }
}

const handleCancelReasonConfirm = async (reason: string) => {
  processingCancelReason.value = true
  try {
    await executeCancelWithReason(reason)
    isCancelReasonOpen.value = false
  } catch (error) {
    toast.error(`Error al cancelar: ${error}`)
  } finally {
    processingCancelReason.value = false
  }
}

const hasActiveTrial = (userId: string): boolean => {
  const subs = getUserSubscriptions(userId)
  return subs.some(s => s.planType === 'trial' && s.status === 'active')
}

const endFreeTrial = (user: IUser) => {
  openCancelReason('trial', 'trial', user.name, undefined, undefined, user)
}

const cancelSubscription = (subId: string, userId: string) => {
  const sub = subscriptionsData.value.find(s => s.id === subId)
  const planType = sub?.planType || 'desconocido'
  const user = usersData.value.find(u => u.uid === userId)
  openCancelReason('subscription', planType, user?.name || 'Usuario', subId, userId)
}

const renewSubscription = async (sub: ISubscription) => {
  processingRenew.value = true
  try {
    const now = new Date()

    const purchasedAt = sub.purchasedAt?.toDate ? sub.purchasedAt.toDate() : new Date()
    const originalEnd = sub.endDate?.toDate ? sub.endDate.toDate() : new Date()
    const durationMs = originalEnd.getTime() - purchasedAt.getTime()
    const newEndDate = new Date(now.getTime() + durationMs)

    const newSubId = nanoid(15)
    const newSubRef = doc(firestoreDb, `users/${sub.userId}/subscriptions/${newSubId}`)

    await runTransaction(firestoreDb, async (transaction) => {
      transaction.set(newSubRef, {
        id: newSubId,
        userId: sub.userId,
        planType: sub.planType,
        status: 'active',
        purchasedAt: Timestamp.fromDate(now),
        endDate: Timestamp.fromDate(newEndDate),
        paymentProviderId: 'admin',
        totalQRsAllowed: sub.totalQRsAllowed,
        totalQRsCreated: 0,
        freeShipmentsAllowed: 1,
        freeShipmentsUsed: 0
      })
    })

    toast.success(`Suscripción ${sub.planType} renovada exitosamente`)
  } catch (error) {
    toast.error(`Error al renovar suscripción: ${error}`)
  } finally {
    processingRenew.value = false
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
      if (!u.isActive) return false;
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
