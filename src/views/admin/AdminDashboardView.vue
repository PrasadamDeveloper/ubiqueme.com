<template>
  <UserDashoardLayout>
    <template #main>
      <div class="relative min-h-screen bg-slate-50 w-full font-google-sans">

        <div class="relative z-10 mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8 pt-24 pb-20">

          <!-- Header -->
          <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-7">
            <div>
              <div class="flex items-center gap-3">
                <span
                  class="w-10 h-10 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-500 shrink-0">
                  <span class="material-symbols-outlined notranslate text-lg">admin_panel_settings</span>
                </span>
                <h1 class="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">Admin</h1>
                <span
                  class="px-2.5 py-1 rounded-full bg-orange-50 border border-orange-100 text-orange-600 text-[9px] font-black uppercase tracking-widest">Beta</span>
              </div>
              <p class="mt-2 text-sm text-gray-500">Gestiona usuarios, suscripciones y comunicaciones</p>
            </div>
            <RouterLink :to="{ name: 'admin-send-email' }"
              class="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-orange-500 px-5 text-sm font-semibold text-white shadow-lg shadow-orange-500/25 transition-all duration-300 ease-out hover:bg-orange-600 hover:shadow-orange-500/35 hover:scale-[1.02] active:scale-95 cursor-pointer shrink-0">
              <span class="material-symbols-outlined notranslate text-base">mail</span>
              Enviar correo
            </RouterLink>
          </div>

          <!-- Stats cards -->
          <div class="grid grid-cols-3 gap-3 sm:gap-4 mb-7">
            <div
              class="rounded-2xl sm:rounded-3xl border border-gray-200/70 bg-white p-3.5 sm:p-5 shadow-sm transition-all duration-300 hover:shadow-md">
              <div class="flex items-center gap-2.5 sm:gap-3">
                <div class="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-orange-50 flex items-center justify-center text-orange-500 shrink-0">
                  <span class="material-symbols-outlined notranslate text-base sm:text-lg">group</span>
                </div>
                <div class="min-w-0">
                  <p class="text-base sm:text-2xl font-bold text-gray-900 leading-none">{{ usersData.length }}</p>
                  <p class="mt-1 text-[9px] sm:text-[11px] font-medium text-gray-500 truncate">Usuarios</p>
                </div>
              </div>
            </div>
            <div
              class="rounded-2xl sm:rounded-3xl border border-gray-200/70 bg-white p-3.5 sm:p-5 shadow-sm transition-all duration-300 hover:shadow-md">
              <div class="flex items-center gap-2.5 sm:gap-3">
                <div class="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-500 shrink-0">
                  <span class="material-symbols-outlined notranslate text-base sm:text-lg">verified_user</span>
                </div>
                <div class="min-w-0">
                  <p class="text-base sm:text-2xl font-bold text-gray-900 leading-none">{{
                    usersData.filter(u => u.isActive && !u.isBanned).length }}</p>
                  <p class="mt-1 text-[9px] sm:text-[11px] font-medium text-gray-500 truncate">Activos</p>
                </div>
              </div>
            </div>
            <div
              class="rounded-2xl sm:rounded-3xl border border-gray-200/70 bg-white p-3.5 sm:p-5 shadow-sm transition-all duration-300 hover:shadow-md">
              <div class="flex items-center gap-2.5 sm:gap-3">
                <div class="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-red-50 flex items-center justify-center text-red-500 shrink-0">
                  <span class="material-symbols-outlined notranslate text-base sm:text-lg">gavel</span>
                </div>
                <div class="min-w-0">
                  <p class="text-base sm:text-2xl font-bold text-gray-900 leading-none">{{
                    usersData.filter(u => u.isBanned).length }}</p>
                  <p class="mt-1 text-[9px] sm:text-[11px] font-medium text-gray-500 truncate">Suspendidos</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Filters row -->
          <div class="flex items-center gap-3 flex-wrap mb-6">
            <div class="relative flex-1 min-w-[200px] max-w-sm">
              <span
                class="material-symbols-outlined notranslate absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-base">search</span>
              <input type="text" v-model="searchQuery" placeholder="Buscar por nombre o email..."
                class="w-full h-11 pl-10 pr-4 rounded-2xl border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 outline-none shadow-sm transition-all duration-300 focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10">
            </div>
            <div class="relative">
              <select v-model="selectedFilter"
                class="h-11 px-4 pr-9 rounded-2xl border border-gray-200 bg-white text-sm text-gray-700 outline-none shadow-sm transition-all duration-300 focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10 cursor-pointer appearance-none min-w-[150px]">
                <option value="all">Todos</option>
                <option value="active">Activos</option>
                <option value="banned">Suspendidos</option>
                <option value="future">Próximos a vencer</option>
                <option value="canceled">Cancelados</option>
                <option value="inactive">Expirados</option>
              </select>
              <span
                class="material-symbols-outlined notranslate absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-base pointer-events-none">expand_more</span>
            </div>
          </div>

          <!-- Loading skeletons -->
          <div v-if="loading" class="space-y-3">
            <div v-for="i in 4" :key="i"
              class="h-[68px] rounded-2xl border border-gray-200/70 bg-white shadow-sm animate-pulse overflow-hidden">
              <div class="flex items-center gap-3 px-4 sm:px-5 h-full">
                <div class="w-10 h-10 rounded-xl bg-gray-100 shrink-0"></div>
                <div class="flex-1 space-y-2">
                  <div class="h-3 w-1/3 rounded-full bg-gray-100"></div>
                  <div class="h-2.5 w-1/2 rounded-full bg-gray-100"></div>
                </div>
                <div class="h-6 w-16 rounded-full bg-gray-100"></div>
              </div>
            </div>
          </div>

          <!-- Empty -->
          <div v-if="!loading && !usersComputed?.length" class="flex flex-col items-center justify-center py-20 text-center">
            <div
              class="w-16 h-16 rounded-3xl bg-white border border-gray-200 shadow-sm flex items-center justify-center mb-4">
              <span class="material-symbols-outlined notranslate text-3xl text-gray-300">group_off</span>
            </div>
            <h3 class="text-sm font-semibold text-gray-900 mb-1">No se encontraron usuarios</h3>
            <p class="text-xs text-gray-500">Prueba ajustando la búsqueda o los filtros</p>
          </div>

          <!-- Users list -->
          <div v-if="!loading && usersComputed?.length" class="space-y-3">
            <div v-for="(user, index) in usersComputed" :key="user.uid"
              class="group/card overflow-hidden rounded-2xl border border-gray-200/70 bg-white shadow-sm transition-all duration-300 hover:shadow-md">

              <!-- Row header — clickable expand -->
              <button @click="toggleExpand(user.uid)" :aria-expanded="expandedUsers.has(user.uid)"
                class="w-full flex items-center gap-3 px-4 sm:px-5 py-4 text-left cursor-pointer transition-colors duration-200 hover:bg-gray-50/70 active:bg-gray-50">

                <!-- Avatar dot -->
                <div class="w-10 h-10 rounded-xl flex items-center justify-center text-[9px] font-black shrink-0 transition-colors" :class="user.isBanned
                  ? 'bg-red-50 text-red-500'
                  : 'bg-orange-50 text-orange-600'">
                  {{ getUserIdUI(user, index) }}
                </div>

                <!-- Name + email -->
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2">
                    <span class="text-sm font-semibold text-gray-900 truncate">{{ user.name }}</span>
                    <span v-if="user.role !== 'user'"
                      class="px-1.5 py-0.5 rounded-md bg-gray-100 text-[8px] uppercase tracking-widest text-gray-500 font-black shrink-0">{{
                        user.role }}</span>
                    <span v-if="user.isBanned"
                      class="px-1.5 py-0.5 rounded-md bg-red-50 text-red-600 text-[8px] font-black uppercase tracking-widest shrink-0">Suspendido</span>
                  </div>
                  <div class="flex items-center gap-2 text-[11px] text-gray-500 mt-0.5">
                    <span class="truncate">{{ user.email }}</span>
                    <span v-if="user.phone" class="hidden sm:inline shrink-0">· {{ user.phone }}</span>
                    <span class="hidden md:inline shrink-0">· {{ user.uid.slice(0, 8) }}…</span>
                  </div>
                </div>

                <!-- Right: QRs + status -->
                <div class="flex items-center gap-3 sm:gap-4 shrink-0">
                  <div class="hidden sm:flex items-center gap-1.5 text-xs text-gray-500">
                    <span class="material-symbols-outlined notranslate text-[14px] text-orange-500">qr_code</span>
                    <span class="font-semibold font-mono text-gray-700">{{ user.totalQRs }}</span>
                  </div>
                  <span
                    class="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full transition-colors"
                    :class="user.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-400'">
                    {{ user.isActive ? 'Activo' : 'Inactivo' }}
                  </span>
                  <!-- Expand indicator -->
                  <span
                    class="material-symbols-outlined notranslate text-gray-400 text-lg transition-transform duration-300 ease-out"
                    :class="expandedUsers.has(user.uid) ? 'rotate-180' : ''">expand_more</span>
                </div>
              </button>

              <!-- Expanded detail panel -->
              <Transition name="expand">
                <div v-if="expandedUsers.has(user.uid)" class="border-t border-gray-100 px-4 sm:px-5 pb-5 pt-4 space-y-4 bg-gray-50/40">

                  <!-- Quick actions row -->
                  <div class="flex items-center gap-2 flex-wrap">
                    <button @click="openPlanModal(user)" :disabled="processingPlanSubmit"
                      class="inline-flex h-8 items-center gap-1.5 rounded-xl bg-orange-50 px-3 text-[10px] font-bold uppercase tracking-widest text-orange-600 transition-all duration-200 ease-out hover:bg-orange-100 active:scale-95 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0">
                      <span v-if="processingPlanSubmit"
                        class="w-2.5 h-2.5 border-2 border-orange-300 border-t-orange-600 rounded-full animate-spin"></span>
                      <span v-else class="material-symbols-outlined notranslate text-[12px]">workspace_premium</span>
                      Plan
                    </button>
                    <button v-if="hasActiveTrial(user.uid)" @click="endFreeTrial(user)"
                      :disabled="processingCancelReason"
                      class="inline-flex h-8 items-center gap-1.5 rounded-xl bg-red-50 px-3 text-[10px] font-bold uppercase tracking-widest text-red-600 transition-all duration-200 ease-out hover:bg-red-100 active:scale-95 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0">
                      <span v-if="processingCancelReason"
                        class="w-2.5 h-2.5 border-2 border-red-300 border-t-red-600 rounded-full animate-spin"></span>
                      <span v-else class="material-symbols-outlined notranslate text-[12px]">cancel</span>
                      Fin Bronce
                    </button>
                    <button v-else @click="addFreeTrial(user)" :disabled="processingAddTrial"
                      class="inline-flex h-8 items-center gap-1.5 rounded-xl bg-orange-50/60 px-3 text-[10px] font-bold uppercase tracking-widest text-orange-500 transition-all duration-200 ease-out hover:bg-orange-100 active:scale-95 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0">
                      <span v-if="processingAddTrial"
                        class="w-2.5 h-2.5 border-2 border-orange-300 border-t-orange-500 rounded-full animate-spin"></span>
                      <span v-else class="material-symbols-outlined notranslate text-[12px]">rocket_launch</span>
                      Bronce Prueba
                    </button>
                    <button @click="openBanModal(user)" :disabled="processingBanSubmit"
                      class="inline-flex h-8 items-center gap-1.5 rounded-xl px-3 text-[10px] font-bold uppercase tracking-widest transition-all duration-200 ease-out active:scale-95 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                      :class="user.isBanned
                        ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                        : 'bg-red-50 text-red-600 hover:bg-red-100'">
                      <span v-if="processingBanSubmit"
                        class="w-2.5 h-2.5 border-2 border-current/30 border-t-current rounded-full animate-spin"></span>
                      <span v-else class="material-symbols-outlined notranslate text-[12px]">{{ user.isBanned ?
                        'how_to_reg' : 'gavel' }}</span>
                      {{ user.isBanned ? 'Restaurar' : 'Suspender' }}
                    </button>
                    <button v-if="user.role !== 'admin' && user.uid !== userStore.getUserId"
                      @click="openDeleteModal(user)" :disabled="processingDeleteUser"
                      class="inline-flex h-8 items-center gap-1.5 rounded-xl bg-red-500 px-3 text-[10px] font-bold uppercase tracking-widest text-white shadow-sm shadow-red-500/25 transition-all duration-200 ease-out hover:bg-red-600 active:scale-95 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0">
                      <span v-if="processingDeleteUser"
                        class="w-2.5 h-2.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      <span v-else class="material-symbols-outlined notranslate text-[12px]">person_off</span>
                      Eliminar
                    </button>
                  </div>

                  <!-- Dates row -->
                  <div class="flex items-center gap-x-4 gap-y-1 text-[10px] text-gray-400 font-mono flex-wrap">
                    <span>Registro: <span class="text-gray-600">{{ formatedDate(user.createdAt) }}</span></span>
                    <span>Último login: <span class="text-gray-600">{{ formatedDate(user.lastLoginAt) }}</span></span>
                    <span v-if="user.isBanned && user.banReason" class="text-red-500">Motivo: {{ user.banReason
                    }}</span>
                  </div>

                  <!-- Subscriptions -->
                  <div v-if="getUserSubscriptions(user.uid).length > 0" class="space-y-2.5">
                    <div
                      class="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 flex items-center gap-1.5">
                      <span class="material-symbols-outlined notranslate text-[12px]">workspace_premium</span>
                      Suscripciones {{ getUserSubscriptions(user.uid).length }}
                    </div>
                    <div class="flex flex-wrap gap-3">
                      <div v-for="sub in getUserSubscriptions(user.uid)" :key="sub.id"
                        class="flex-1 min-w-[260px] rounded-2xl border border-gray-200/70 bg-white p-4 shadow-sm space-y-3">

                        <!-- Plan header -->
                        <div class="flex items-center justify-between">
                          <div class="flex items-center gap-1.5">
                            <span
                              class="material-symbols-outlined notranslate text-[15px] text-orange-500">workspace_premium</span>
                            <span class="font-bold text-orange-600 uppercase text-[10px] tracking-wider">{{
                              planDisplayName(sub.planType)
                              }}</span>
                          </div>
                          <span
                            :class="statusDisplayName(sub.planType, sub.status) === 'Acabado' ? 'bg-amber-50 text-amber-600 border-amber-200' : sub.status === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : sub.status === 'canceled' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-gray-100 text-gray-500 border-gray-200'"
                            class="px-1.5 py-0.5 rounded-md border text-[8px] font-black uppercase tracking-widest">
                            {{ statusDisplayName(sub.planType, sub.status) }}
                          </span>
                        </div>

                        <!-- QR progress bar -->
                        <div>
                          <div class="flex justify-between text-[10px] mb-1.5">
                            <span class="text-gray-400">QRs</span>
                            <span class="text-gray-900 font-mono font-bold">{{ sub.totalQRsCreated }} / {{
                              sub.totalQRsAllowed }}</span>
                          </div>
                          <div class="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div class="h-full rounded-full transition-all duration-500"
                              :class="sub.totalQRsCreated >= sub.totalQRsAllowed ? 'bg-red-500' : 'bg-orange-500'"
                              :style="{ width: `${Math.min((sub.totalQRsCreated / sub.totalQRsAllowed) * 100, 100)}%` }">
                            </div>
                          </div>
                        </div>

                        <!-- Meta row -->
                        <div class="flex items-center justify-between text-[10px] text-gray-400">
                          <span>Envíos: <span class="text-gray-600">{{ sub.freeShipmentsUsed ?? 0 }}/{{
                            sub.freeShipmentsAllowed ?? 1 }}</span></span>
                          <span>ID: <span class="font-mono text-gray-400">{{ sub.id.slice(0, 8) }}…</span></span>
                        </div>

                        <!-- Dates -->
                        <div class="flex items-center gap-3 text-[10px] text-gray-400">
                          <span>Inicio: <span class="text-gray-600 font-mono">{{ formatedDate(sub.purchasedAt)
                          }}</span></span>
                          <span>Ven: <span class="font-mono"
                              :class="sub.status === 'active' && sub.endDate && sub.endDate.toDate() < new Date() ? 'text-red-500' : 'text-gray-600'">{{
                                formatedDate(sub.endDate) }}</span></span>
                        </div>

                        <!-- Cancel info -->
                        <div v-if="sub.canceledByAdmin?.reason" class="bg-red-50/60 rounded-xl p-3 space-y-1">
                          <div class="text-[10px] text-red-600">
                            <strong>Motivo:</strong> {{ sub.canceledByAdmin.reason }}
                          </div>
                          <div class="text-[9px] text-gray-400">
                            {{ sub.canceledByAdmin.name }} · {{ formatedDate(sub.canceledByAdmin.canceledAt) }}
                          </div>
                        </div>

                        <!-- Sub actions -->
                        <div class="flex items-center gap-2 pt-0.5">
                          <button @click="openQRModal(user, sub)"
                            v-if="sub.status === 'active' && sub.totalQRsCreated < sub.totalQRsAllowed"
                            :disabled="processingQRSubmit"
                            class="flex-1 h-8 rounded-xl bg-orange-500 text-white text-[9px] font-bold uppercase tracking-widest shadow-sm shadow-orange-500/25 transition-all duration-200 ease-out hover:bg-orange-600 active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">
                            <span v-if="processingQRSubmit"
                              class="w-2.5 h-2.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                            <span v-else class="material-symbols-outlined notranslate text-[11px]">qr_code</span>
                            QR
                          </button>
                          <button v-if="sub.status === 'active'" @click="cancelSubscription(sub.id, sub.userId)"
                            :disabled="processingCancelReason"
                            class="flex-1 h-8 rounded-xl bg-red-50 text-red-600 text-[9px] font-bold uppercase tracking-widest transition-all duration-200 ease-out hover:bg-red-100 active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">
                            <span v-if="processingCancelReason"
                              class="w-2.5 h-2.5 border-2 border-red-300 border-t-red-600 rounded-full animate-spin"></span>
                            <span v-else class="material-symbols-outlined notranslate text-[11px]">block</span>
                            Cancelar
                          </button>
                          <button v-if="sub.status === 'canceled'" @click="renewSubscription(sub)"
                            :disabled="processingRenew"
                            class="flex-1 h-8 rounded-xl bg-emerald-50 text-emerald-600 text-[9px] font-bold uppercase tracking-widest transition-all duration-200 ease-out hover:bg-emerald-100 active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">
                            <span v-if="processingRenew"
                              class="w-2.5 h-2.5 border-2 border-emerald-300 border-t-emerald-600 rounded-full animate-spin"></span>
                            <span v-else class="material-symbols-outlined notranslate text-[11px]">refresh</span>
                            Renovar
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div v-else>
                    <span class="text-[11px] text-gray-400 italic">Sin suscripciones</span>
                  </div>
                </div>
              </Transition>

            </div>
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

        <DeleteUserConfirm v-if="selectedUserForDelete" :is-open="isDeleteModalOpen" :user="selectedUserForDelete"
          :processing="processingDeleteUser" @submit="handleDeleteUser" @cancel="isDeleteModalOpen = false" />

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
import DeleteUserConfirm from '@/components/admin/DeleteUserConfirm.vue'
import { toast } from 'vue-sonner'
import { collection, doc, increment, onSnapshot, runTransaction, Timestamp, writeBatch, collectionGroup } from 'firebase/firestore'
import { db as firestoreDb, auth } from '@/firebase'
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
const processingMigration = ref(false)

const usersData = ref<IUser[]>([])
const subscriptionsData = ref<ISubscription[]>([])

// Expand/collapse state
const expandedUsers = ref(new Set<string>())
const toggleExpand = (uid: string) => {
  const next = new Set(expandedUsers.value)
  if (next.has(uid)) next.delete(uid)
  else next.add(uid)
  expandedUsers.value = next
}

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
        isPublic: true,
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

//DELETE USER
const isDeleteModalOpen = ref(false)
const selectedUserForDelete = ref<IUser | null>(null)
const processingDeleteUser = ref(false)

const openDeleteModal = (user: IUser) => {
  selectedUserForDelete.value = user;
  isDeleteModalOpen.value = true;
}

const handleDeleteUser = async () => {
  const target = selectedUserForDelete.value;
  if (!target?.uid) return;
  processingDeleteUser.value = true;
  try {
    const idToken = await auth.currentUser?.getIdToken();
    if (!idToken) throw new Error('No se pudo autenticar la sesión de administrador');

    const soporteUrl = import.meta.env.VITE_SOPORTE_WORKER_URL;
    const res = await fetch(`${soporteUrl}/api/admin-delete-user`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetUid: target.uid, adminIdToken: idToken }),
    });
    let data: { error?: string; authDeleted?: boolean } = {};
    try {
      data = await res.json();
    } catch {
      data = {};
    }
    if (!res.ok) throw new Error(data.error || 'Error al eliminar el usuario');

    if (data.authDeleted === false) {
      toast.warning(`Datos de ${target.name} eliminados, pero el acceso de su cuenta quedó pendiente de eliminar`);
    } else {
      toast.success(`Usuario ${target.name} eliminado permanentemente`);
    }
    isDeleteModalOpen.value = false;
    selectedUserForDelete.value = null;
  } catch (error) {
    toast.error(`Error al eliminar usuario: ${error}`);
  } finally {
    processingDeleteUser.value = false;
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
  const nextYear = new Date(now);
  nextYear.setFullYear(nextYear.getFullYear() + 1);

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
        endDate: Timestamp.fromDate(nextYear),
        paymentProviderId: 'admin',
        totalQRsAllowed: 1,
        totalQRsCreated: 0,
        freeShipmentsAllowed: 1,
        freeShipmentsUsed: 0
      });
    });

    toast.success('Bronce de prueba agregado exitosamente al usuario ' + user.name);
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

const planDisplayName = (planType: string): string => {
  return planType === 'trial' ? 'Bronce de prueba' : planType.charAt(0).toUpperCase() + planType.slice(1);
};

const statusDisplayName = (planType: string, status: string): string => {
  if (status === 'inactive' && planType === 'trial') return 'Acabado';
  if (status === 'active') return 'Activo';
  if (status === 'canceled') return 'Cancelado';
  return 'Inactivo';
};

const migrateTrialsTo1Year = async () => {
  if (!confirm('¿Migrar todos los trials activos a 1 año desde su registro?')) return;
  processingMigration.value = true;
  try {
    const batches = [];
    const activeTrials = subscriptionsData.value.filter(
      s => s.planType === 'trial' && s.status === 'active'
    );
    for (let i = 0; i < activeTrials.length; i += 500) {
      const batch = writeBatch(firestoreDb);
      const chunk = activeTrials.slice(i, i + 500);
      for (const sub of chunk) {
        const purchasedDate = sub.purchasedAt?.toDate ? sub.purchasedAt.toDate() : new Date();
        const newEndDate = new Date(purchasedDate);
        newEndDate.setFullYear(newEndDate.getFullYear() + 1);
        // Si la fecha calculada ya pasó, usar now + 1 año como fallback
        if (newEndDate < new Date()) {
          newEndDate.setTime(Date.now() + 365 * 86400000);
        }
        const newEnd = Timestamp.fromDate(newEndDate);
        const subRef = doc(firestoreDb, `users/${sub.userId}/subscriptions/${sub.id}`);
        batch.update(subRef, { endDate: newEnd });
        const userRef = doc(firestoreDb, `users/${sub.userId}`);
        batch.update(userRef, { trialEndsAt: newEnd });
      }
      batches.push(batch.commit());
    }
    await Promise.all(batches);
    toast.success(`Migrados ${activeTrials.length} trials activos a 1 año desde su registro`);
  } catch (error) {
    toast.error(`Error migrando trials: ${error}`);
  } finally {
    processingMigration.value = false;
  }
};

const getUserIdUI = (userPayload: IUser, index: number) => {
  const initial = userPayload.name?.charAt(0).toUpperCase() ?? 'U';
  const planType = getActivePlanType(userPayload);
  const prefixMap: Record<string, string> = {
    withoutPlan: 'N',
    trial: 'BP',
    bronce: 'B',
    plata: 'P',
    oro: 'O',
  };
  const prefix = prefixMap[planType] ?? 'U';
  return `${prefix}${String(index).padStart(3, '0')}${initial}`;
}

</script>

<style scoped>
.font-google-sans {
  font-family: 'Google Sans', sans-serif;
}

.material-symbols-outlined {
  font-variation-settings: 'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 24;
}

/* Expand transition */
.expand-enter-active {
  transition: all 250ms cubic-bezier(0.22, 1, 0.36, 1);
  overflow: hidden;
}

.expand-leave-active {
  transition: all 150ms cubic-bezier(0.22, 1, 0.36, 1);
  overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  max-height: 0;
  padding-top: 0;
  padding-bottom: 0;
}

.expand-enter-to,
.expand-leave-from {
  opacity: 1;
  max-height: 2000px;
}

@media (prefers-reduced-motion: reduce) {

  .expand-enter-active,
  .expand-leave-active {
    transition: none;
  }

  .expand-enter-from,
  .expand-leave-to {
    opacity: 1;
    max-height: none;
  }
}
</style>
