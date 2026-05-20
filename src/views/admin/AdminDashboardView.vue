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
                  <th class="p-4 text-[10px] font-black uppercase tracking-widest text-white/40 min-w-[280px]">Identidad
                    / Contacto</th>
                  <th class="p-4 text-[10px] font-black uppercase tracking-widest text-white/40 min-w-[180px]">Actividad
                    y QRs</th>
                  <th class="p-4 text-[10px] font-black uppercase tracking-widest text-white/40 min-w-[220px]">
                    Facturación y Planes</th>
                  <th class="p-4 text-[10px] font-black uppercase tracking-widest text-white/40 min-w-[180px]">Estado
                    (Security)</th>
                  <th
                    class="p-4 text-[10px] font-black uppercase tracking-widest text-white/40 text-right min-w-[250px]">
                    Acciones de Mando</th>
                </tr>
              </thead>

              <!-- Body -->
              <tbody v-if="!loading && usersComputed && usersComputed.length > 0">
                <tr class="hidden">
                  <td colspan="5" class="p-10 text-center text-white/40">
                    <span class="material-symbols-outlined animate-spin text-3xl mb-2">settings</span>
                    <p class="text-xs font-bold uppercase tracking-widest">Recopilando Datos de Firestore...</p>
                  </td>
                </tr>

                <tr v-for="user in usersComputed" :key="user.uid"
                  class="border-b border-white/5 hover:bg-white/2 transition-colors group align-top">

                  <!-- 1. IDENTIDAD / CONTACTO -->
                  <td class="p-4">
                    <div class="flex gap-3">
                      <div class="w-10 h-10 rounded-full border flex items-center justify-center shrink-0 mt-1"
                        :class="user.role === 'admin' ? 'bg-orange-500/10 border-orange-500/20 text-orange-500' : 'bg-white/5 border-white/10 text-white'">
                        <span class="font-bold uppercase">{{ user.name.charAt(0) }}</span>
                      </div>
                      <div class="overflow-hidden flex flex-col space-y-1">
                        <div class="flex items-center gap-1.5">
                          <h3 class="text-sm font-bold text-white truncate max-w-[150px] font-poppins">{{ user.name }}
                          </h3>
                          <div v-tooltip="'Rol: ' + user.role"
                            class="px-1.5 py-0.5 rounded border text-[8px] font-black uppercase tracking-widest"
                            :class="user.role === 'admin' ? 'bg-orange-500/10 border-orange-500/20 text-orange-500' : 'bg-white/5 border-white/10 text-white/60'">
                            {{ user.role }}
                          </div>
                        </div>
                        <div class="flex items-center gap-1 text-white/50 text-xs" v-tooltip="'Email Principal'">
                          <span class="material-symbols-outlined text-[12px]">mail</span>
                          <span class="truncate">{{ user.email }}</span>
                        </div>
                        <div v-if="user.phone" class="flex items-center gap-1 text-white/50 text-xs"
                          v-tooltip="'Teléfono'">
                          <span class="material-symbols-outlined text-[12px]">call</span>
                          <span class="font-mono">{{ user.phone }}</span>
                        </div>
                        <!-- UID Oculto/Truncado pero copiable visualmente -->
                        <div class="flex items-center gap-1 mt-1 pt-1 border-t border-white/5">
                          <span class="material-symbols-outlined text-[10px] text-white/20">key</span>
                          <span class="text-[8px] font-mono text-white/20 truncate w-32"
                            v-tooltip="'UID de Firebase: ' + user.uid">{{ user.uid }}</span>
                        </div>
                      </div>
                    </div>
                  </td>

                  <!-- 2. ACTIVIDAD Y QRs -->
                  <td class="p-4">
                    <div class="flex flex-col space-y-2">

                      <!-- QRs e IsActive -->
                      <div class="flex items-center gap-3">
                        <div class="flex flex-col">
                          <span class="text-[9px] font-black uppercase tracking-widest text-white/30">Total QRs</span>
                          <div class="flex items-center gap-1 text-white">
                            <span class="material-symbols-outlined text-[14px]">qr_code_2</span>
                            <span class="text-sm font-mono font-bold">{{ user.totalQRs }}</span>
                          </div>
                        </div>
                        <div class="w-px h-6 bg-white/10"></div>
                        <div class="flex flex-col">
                          <span class="text-[9px] font-black uppercase tracking-widest text-white/30">Cuenta
                            Activa</span>
                          <div class="flex items-center gap-1"
                            :class="user.isActive ? 'text-green-500' : 'text-white/40'">
                            <span class="material-symbols-outlined text-[14px]">{{ user.isActive ? 'verified_user' :
                              'pending' }}</span>
                            <span class="text-[10px] font-bold">{{ user.isActive ? 'Sí' : 'No' }}</span>
                          </div>
                        </div>
                      </div>

                      <!-- Fechas -->
                      <div class="bg-black/40 rounded-lg p-2 border border-white/5 space-y-1.5 mt-2">
                        <div class="flex justify-between items-center text-[9px]">
                          <span class="text-white/40">Registro</span>
                          <span class="font-mono text-white/60">{{ formatedDate(user.createdAt) }}</span>
                        </div>
                        <div class="flex justify-between items-center text-[9px]">
                          <span class="text-white/40">Último Login</span>
                          <span class="font-mono text-white/60">{{ formatedDate(user.lastLoginAt) }}</span>
                        </div>
                      </div>

                    </div>
                  </td>

                  <!-- 3. FACTURACIÓN Y PLANES -->
                  <td class="p-4">
                    <div class="flex flex-col space-y-2">
                      <!-- Plan & Status -->
                      <div class="flex items-center gap-2">
                        <div
                          class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded border text-[9px] font-black uppercase tracking-widest"
                          :class="{
                            'bg-white/5 border-white/10 text-white': user.plan === 'alpha',
                            'bg-blue-500/10 border-blue-500/20 text-blue-400': user.plan === 'beta',
                            'bg-orange-500/10 border-orange-500/20 text-orange-500': user.plan === 'epsilon'
                          }">
                          Plan {{ user.plan }}
                        </div>
                        <div class="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest"
                          :class="user.subscriptionStatus === 'active' ? 'text-green-500' : (user.subscriptionStatus === 'canceled' ? 'text-red-500' : 'text-white/40')">
                          <span class="material-symbols-outlined text-[12px]">
                            {{ user.subscriptionStatus === 'active' ? 'check_circle' : (user.subscriptionStatus ===
                              'canceled' ? 'cancel' : 'radio_button_unchecked') }}
                          </span>
                          {{ user.subscriptionStatus }}
                        </div>
                      </div>

                      <!-- Detalles Extra (Fechas y Provider ID) -->
                      <div class="text-[9px] space-y-1">
                        <div v-if="user.paymentProviderId" class="flex items-center gap-1 text-white/40">
                          <span class="material-symbols-outlined text-[10px]">receipt_long</span>
                          <span class="font-mono">ID: {{ user.paymentProviderId }}</span>
                        </div>
                        <div class="text-white/30 font-mono">
                          Comprado: {{ formatedDate(user.planPurchasedAt) }}
                        </div>
                        <div v-if="user.planEndDate" class="text-white/30 font-mono">
                          Vence: {{ formatedDate(user.planEndDate) }}
                        </div>
                      </div>
                    </div>
                  </td>

                  <!-- 4. ESTADO / SEGURIDAD -->
                  <td class="p-4">
                    <div class="space-y-1.5">
                      <div
                        class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest"
                        :class="user.isBanned ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-green-500/10 border-green-500/20 text-green-500'">
                        <span class="material-symbols-outlined text-[12px]">{{ user.isBanned ? 'block' : 'shield'
                          }}</span>
                        {{ user.isBanned ? 'Baneado / Suspendido' : 'Cuenta Segura' }}
                      </div>

                      <!-- Razón del baneo si existe -->
                      <div v-if="user.isBanned && user.banReason"
                        class="bg-red-500/5 border border-red-500/10 rounded-lg p-2 text-[10px] text-red-400/80 leading-snug">
                        <strong>Motivo:</strong> {{ user.banReason }}
                      </div>
                    </div>
                  </td>

                  <!-- 5. ACCIONES DE MANDO -->
                  <td class="p-4 text-right align-middle">
                    <div class="flex flex-col items-end justify-center gap-2 h-full">

                      <div class="flex gap-2">
                        <!-- Asignar QR -->
                        <button @click="openQRModal(user)" v-tooltip="'Asignar Código QR'"
                          class="inline-flex items-center justify-center h-8 px-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-colors">
                          <span class="material-symbols-outlined text-[14px] mr-1.5 text-white/50">qr_code</span>
                          <span class="text-[9px] font-black uppercase tracking-widest">+ QR</span>
                        </button>

                        <!-- Cambiar Plan -->
                        <button @click="openPlanModal(user)" v-tooltip="'Gestionar Plan'"
                          class="inline-flex items-center justify-center h-8 px-3 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-blue-400 transition-colors">
                          <span class="material-symbols-outlined text-[14px] mr-1.5">payments</span>
                          <span class="text-[9px] font-black uppercase tracking-widest">Plan</span>
                        </button>
                      </div>

                      <!-- Banear -->
                      <button @click="openBanModal(user)"
                        class="inline-flex items-center justify-center h-8 px-3 rounded-lg transition-colors border w-full"
                        :class="user.isBanned ? 'bg-white/5 hover:bg-white/10 border-white/10 text-white/60' : 'bg-red-500/10 hover:bg-red-500/20 border-red-500/20 text-red-500'">
                        <span class="material-symbols-outlined text-[14px] mr-1.5">{{ user.isBanned ? 'how_to_reg' :
                          'gavel' }}</span>
                        <span class="text-[9px] font-black uppercase tracking-widest">
                          {{ user.isBanned ? 'Quitar Restricción' : 'Suspender Acceso' }}</span>
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

        <BanConfirmPrompt :is-open="isBanModalOpen" :user-name="selectedUserForBan?.name || ''"
          :is-currently-banned="selectedUserForBan?.isBanned || false" @submit="handleBanSubmit"
          @cancel="isBanModalOpen = false" />

        <ChangePlanPrompt :is-open="isPlanModalOpen" :user-name="selectedUserForPlan?.name || ''"
          :current-plan="selectedUserForPlan?.plan || ''" @submit="handlePlanSubmit"
          @cancel="isPlanModalOpen = false" />

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
import { collection, doc, increment, onSnapshot, runTransaction, Timestamp, writeBatch } from 'firebase/firestore'
import { db as firestoreDb } from '@/firebase'
import type { IUser } from '@/interfaces/IUser'
import { nanoid } from 'nanoid'

const loading = ref(true)

const usersData = ref<IUser[]>([])

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
})

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

  if (!qrName || qrName.trim() === '') return toast.error(`Error al crear código QR no se especifico un nombre`);
  if (!user?.uid) return toast.error(`Error al crear código QR no se encontro el usuario`);

  // Validar límites de QR activos según el plan de usuario
  const userPlan = (user.plan || 'alpha')
  const maxQRs = userPlan === 'epsilon' ? 5 : userPlan === 'beta' ? 3 : 1

  if (user.totalQRs >= maxQRs) {
    toast.error(`Límite alcanzado: El plan del usuario ${user.name}, ${userPlan.toUpperCase()} permite un máximo de ${maxQRs} código(s) QR activos. Por favor, actualice su suscripción en la sección de Precios para registrar más.`)
    return
  }

  try {
    await runTransaction(firestoreDb, async (transaction) => {
      // 1. Generamos el ID
      const newQRId = nanoid(15);

      // 2. Referencias a los documentos (Público y Privado)
      const publicQrRef = doc(firestoreDb, `publicQR/${newQRId}`);
      const userQrRef = doc(firestoreDb, `users/${user.uid}/qrs/${newQRId}`);

      // 3. Verificamos idempotencia (Que no exista en la base de datos pública globalmente)
      const qrDoc = await transaction.get(publicQrRef);
      if (qrDoc.exists()) {
        throw new Error("Colisión de ID. La transacción se cancelará y puede reintentar.");
      }

      // 4. Si no existe, creamos el documento en ambas colecciones atómicamente
      // Colección Pública (Para cuando lo escaneen)
      transaction.set(publicQrRef, {
        id: newQRId,
        name: 'Nuevo QR (Prueba)',
        status: 'Active',
        lastScan: null,
        totalScans: 0,
        isBanned: false,
        banReason: '',
        docId: newQRId,
        uid: user.uid,
        tier: 'free',
        createdAt: Timestamp.now()
      });

      // Subcolección del Usuario (Para su Dashboard)
      transaction.set(userQrRef, {
        id: newQRId,
        uid: user.uid,
        name: qrName ?? 'QR name',
        status: 'Active',
        scans: 0,
        lastScan: "",
        isActive: true,
        isBanned: false,
        banReason: '',
        planEndDate: null,
        planPurchasedAt: null,
        createdAt: Timestamp.now()
      });

      // Incrementamos el contador global de QRs en el documento PRINCIPAL del usuario
      const userRootRef = doc(firestoreDb, `users/${user.uid}`);
      transaction.update(userRootRef, {
        totalQRs: increment(1)
      });

    });

    toast.success(`Se ha creado el nuevo QR con nombre ${qrName} para el usuario ${user.name}`);
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
  if (!selectedUserForPlan.value?.uid) return;
  const now = new Date();
  const nextMonth = new Date(now);
  nextMonth.setMonth(nextMonth.getMonth() + 1);

  const userRef = doc(firestoreDb, 'users', selectedUserForPlan.value.uid);
  const batch = writeBatch(firestoreDb);
  try {
    batch.update(userRef, {
      plan,
      planPurchasedAt: Timestamp.fromDate(now),
      planEndDate: Timestamp.fromDate(nextMonth),
      subscriptionStatus: 'active',
      paymentProviderId: 'admin',
    });
    await batch.commit();
    toast.success('Plan del usuario ' + selectedUserForPlan.value.name + ' actualizado exitosamente');
    isPlanModalOpen.value = false;
    selectedUserForPlan.value = null;
  } catch (error) {
    toast.error('Error al actualizar el plan del usuario: ' + error);
  }
}

const formatedDate = (date: Timestamp | null): string => {
  if (!date) return 'N/A';
  return date.toDate().toLocaleString('es-MX', { dateStyle: 'long', timeStyle: 'short' })
}

const selectedFilter = ref<'all' | 'active' | 'banned' | 'future' | 'canceled' | 'inactive'>('all');

const searchQuery = ref('');

const usersComputed = computed(() => {

  let result = usersData.value;

  if (!selectedFilter.value) return result;

  //FILTRO 2: SELECT (ALL / ACTIVE / BANNED)
  if (selectedFilter.value == 'active') result = result.filter(u => !u.isBanned);

  if (selectedFilter.value == 'banned') result = result.filter(u => u.isBanned);

  if (selectedFilter.value == 'future') result = result.filter(u => u.planEndDate > Timestamp.now());

  if (selectedFilter.value == 'canceled') result = result.filter(u => u.subscriptionStatus === 'canceled');

  if (selectedFilter.value == 'inactive') result = result.filter(u => u.subscriptionStatus === 'inactive');

  if (selectedFilter.value == 'all') result = usersData.value;

  if (searchQuery.value) {
    result = result.filter(u =>
      u.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
  }


  return result;
})


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
