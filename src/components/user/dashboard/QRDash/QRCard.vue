<script lang="ts" setup>
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'
import QrcodeVue from 'qrcode.vue'
import { collection, doc, onSnapshot, orderBy, query, Timestamp, updateDoc, writeBatch } from 'firebase/firestore'
import { db } from '@/firebase'
import { useUserStore } from '@/stores/user'
import CloudLoader from '@/components/ui/CloudLoader.vue'
import { nanoid } from 'nanoid'
import type { IQRCard } from '@/interfaces/IQRCard'
import type { IPublicQR, IQRLog } from '@/interfaces/IPublicQR'
import type { Unsubscribe } from 'firebase/auth'
import QRCardLog from './QRCardLog.vue'
import QRCardLogSkeleton from '@/components/ui/user/dashboard/QRCardLogSkeleton.vue'
import { toast } from 'vue-sonner'

const props = defineProps<IQRCard>()

const propsComputed = computed(() => {
  return {
    ...props,
  }
})

const showMenu = ref(false)
const activePrompt = ref<'cancel' | 'renew' | 'edit' | 'amplify' | null>(null)

const qrName = ref(propsComputed.value.name);

const statusConfig = {
  Active: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', dot: 'bg-emerald-400', label: 'Activo' },
  Canceled: { bg: 'bg-rose-500/10', text: 'text-rose-400', dot: 'bg-rose-400', label: 'Cancelado' },
  Process: { bg: 'bg-amber-500/10', text: 'text-amber-400', dot: 'bg-amber-400', label: 'En Proceso' },
  Error: { bg: 'bg-red-500/10', text: 'text-red-400', dot: 'bg-red-400', label: 'Error' },
  Paused: { bg: 'bg-slate-500/10', text: 'text-slate-400', dot: 'bg-slate-400', label: 'Pausado' },
}

const currentStatus = computed(() => {
  if (propsComputed.value.isBanned) {
    return {
      bg: 'bg-red-500/20',
      text: 'text-red-500',
      dot: 'bg-red-500',
      label: 'Baneado'
    }
  }
  return statusConfig[propsComputed.value.status] || {
    bg: 'bg-slate-500/10',
    text: 'text-slate-400',
    dot: 'bg-slate-400',
    label: 'Desconocido'
  }

})

const openPrompt = (type: 'cancel' | 'renew' | 'edit') => {
  showMenu.value = false
  activePrompt.value = type
}

const closeAll = () => {
  showMenu.value = false
  activePrompt.value = null
}

const toggleMenu = (event: Event) => {
  event.stopPropagation()
  showMenu.value = !showMenu.value
}

const userStore = useUserStore();

const isLoading = ref(false);

const handleEdit = async () => {
  try {
    isLoading.value = true;
    const userQRDoc = doc(db, `users/${userStore.getUserId}/qrs/${props.docId}`)
    const publicQrDoc = doc(db, 'publicQR', props.docId);

    const batch = writeBatch(db);
    batch.update(userQRDoc, {
      name: qrName.value
    })
    batch.update(publicQrDoc, {
      name: qrName.value
    })
    await batch.commit();
    closeAll();
    toast.success(`Nombre de QR actualizado`);
    isLoading.value = false;
  } catch (error) {
    isLoading.value = false;
    const e = error as Error;
    toast.error(`Error al editar el nombre del QR: ${e.message}`);
  }
}

const _setQrPublic = async () => {
  showMenu.value = false;
  try {
    isLoading.value = true;
    const batch = writeBatch(db);
    const publicQrRef = doc(db, 'publicQR', props.id);
    const publicQRData: IPublicQR = {
      id: props.id,
      name: props.name,
      status: 'Active',
      isBanned: false,
      banReason: '',
      totalScans: props.scans,
      lastScan: null,
      uid: userStore.getUserId,
      tier: props.subscriptionId,
    }
    const qrDoc = doc(db, `users/${userStore.getUserId}/qrs/${props.docId}`)
    batch.update(qrDoc, {
      status: 'Active',
    })
    batch.set(publicQrRef, publicQRData);
    await batch.commit();
    isLoading.value = false;
    toast.success(`QR establecido como público`);
  } catch (error) {
    isLoading.value = false;
    const e = error as Error;
    toast.error(`Error al hacer público el QR: ${e.message}`);
  }
}

const _setQrPrivate = async () => {
  showMenu.value = false;
  try {
    isLoading.value = true;
    const batch = writeBatch(db);
    const publicQrRef = doc(db, 'publicQR', props.id);
    batch.delete(publicQrRef);
    const qrDoc = doc(db, `users/${userStore.getUserId}/qrs/${props.docId}`)
    batch.update(qrDoc, {
      status: 'Paused',
    })
    await batch.commit();
    isLoading.value = false;
    toast.success(`QR establecido como privado`);
  } catch (error) {
    isLoading.value = false;
    const e = error as Error;
    toast.error(`Error al hacer privado el QR: ${e.message}`);
  }
}

let unsubscribe: Unsubscribe;



const qrStatus = reactive({
  totalScans: 0,
  lastScan: Timestamp.now() ?? 'No se ha escaneado aún',
})

const loadCount = ref(0);


onMounted(() => {
  unsubscribe = onSnapshot(doc(db, 'publicQR', props.id), (docSnapshot) => {
    if (!docSnapshot.exists()) {
      toast.error(`QR no encontrado`);
      //errorMsg.value = "No se encontro informacion sobre este QR";
      //loading.value = false;
      return;
    }
    qrStatus.totalScans = docSnapshot.data().totalScans ?? 0;
    qrStatus.lastScan = docSnapshot.data().lastScan ?? 'No se ha escaneado aún';
    // toast.success(`Estado del QR actualizado`); // Silencing this success as it fires frequently

    loadCount.value++;
  }
    , (error) => {
      toast.error(`Error al obtener datos: ${error}`);
    }
  )
})

onUnmounted(() => {
  if (unsubscribe) unsubscribe();
})

const timestampToDate = (): string => {
  try {
    if (qrStatus.lastScan instanceof Timestamp) {
      return qrStatus.lastScan.toDate().toLocaleString('es-MX');
    }
    return 'No se ha escaneado aún';
  } catch (error) {
    toast.error(`Error al convertir la fecha: ${error}`);
    return 'No se ha escaneado aún';
  }
}

const menuOptions = [
  { label: 'Hacer Público', icon: 'public', description: 'Activa el QR para que cualquiera pueda escanearlo.', action: _setQrPublic },
  { label: 'Hacer Privado', icon: 'visibility_off', description: 'Pausa el QR. Nadie podrá escanearlo', action: _setQrPrivate },
  { divider: true },
  { label: 'Editar nombre', icon: 'edit', description: 'Cambiar el nombre de su QR, tenga en cuenta que el nombre es público, no comparta información sensible.', action: () => openPrompt('edit') },
  { label: 'Renovar QR', icon: 'autorenew', description: 'Inicia el proceso para renovar este código.', action: () => openPrompt('renew') },
  { divider: true },
  {
    label: 'Desactivar',
    icon: 'block',
    description: 'Desactivar el código permanentemente, NO podrá ser escaneado, tendrá que adquirir uno nuevo y este se inutilizara permanentemente.',
    action: () => openPrompt('cancel'),
    color: 'text-rose-400',
    hoverBg: 'hover:bg-rose-500/10'
  },
]

const qrLogs = ref<IQRLog[]>([]);
const logsLoaded = ref(false);
const isLogsLoading = ref(false);

let unsubscribeLogs: Unsubscribe;

const loadLogs = () => {
  if (logsLoaded.value) return;

  isLogsLoading.value = true;
  const qrsLogsRef = collection(db, `publicQR/${props.id}/logs`);
  const queryLogs = query(qrsLogsRef, orderBy("scanDate", "desc"));

  unsubscribeLogs = onSnapshot(queryLogs, (querySnapshot) => {
    isLogsLoading.value = false;
    logsLoaded.value = true;

    if (querySnapshot.empty) {
      toast.info(`Registros del QR vacíos`);
      qrLogs.value = [];
      return;
    }

    qrLogs.value = [];
    qrLogs.value = querySnapshot.docs.map(doc => ({
      id: doc.id,
      scanDate: doc.data().scanDate,
      scanMetrics: doc.data().scanMetrics,
      interaction: doc.data().interaction,
      img: doc.data().img
    }));
    // toast.success(`Registros del QR actualizados`) // Silencing this as it fires on load
    loadCount.value++;
  }, (error) => {
    isLogsLoading.value = false;
    toast.error(`Error al obtener datos de registros: ${error}`);
  });
}

onUnmounted(() => {
  if (unsubscribeLogs) unsubscribeLogs();
})


</script>

<template>
  <div
    class="relative w-full bg-[#0a0401] border border-white/10 rounded-[2rem] flex flex-col sm:flex-row hover:border-orange-500/40 transition-all duration-500 overflow-hidden font-google-sans group">

    <!-- Patrón de Fondo Cuadrícula -->
    <div class="absolute inset-0 z-0 opacity-[0.04] pointer-events-none"
      style="background-image: linear-gradient(rgba(255, 255, 255, 1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 1) 1px, transparent 1px); background-size: 24px 24px;">

    </div>

    <!-- Resplandor Naranja General Sutil -->
    <div
      class="absolute top-0 left-0 w-full h-full z-0 opacity-20 pointer-events-none bg-gradient-to-br from-orange-500/10 via-transparent to-transparent">
    </div>

    <section v-if="isLoading" class="absolute inset-0 bg-[#0a0a0a]/95 flex items-center justify-center z-50">
      <CloudLoader></CloudLoader>
    </section>

    <!-- Contenido Izquierdo -->
    <div class="flex-1 p-6 sm:p-8 flex flex-col justify-between relative z-10">

      <!-- Header -->
      <div class="flex justify-between items-start w-full">
        <div class="flex items-center gap-2">
          <span class="material-symbols-outlined text-orange-500 text-[20px]">location_on</span>
          <span class="text-white font-black tracking-widest text-[11px] uppercase">ubiqueme.com</span>
        </div>


      </div>

      <!-- Texto Principal -->
      <div class="my-6 sm:my-8">
        <h3 class="text-2xl sm:text-3xl font-black text-white leading-tight mb-3 tracking-tighter">
          {{ propsComputed.name || 'Código QR' }}
        </h3>
        <p class="text-white/50 text-xs sm:text-sm max-w-[280px] leading-relaxed font-medium">
          Escanee este código para contactar al propietario de forma <span class="text-white/80">segura y
            anónima</span>.
        </p>
      </div>

      <!-- Footer / Stats -->
      <div class="flex flex-wrap items-end justify-between border-t border-white/10 pt-5 mt-auto gap-4">
        <div class="flex flex-col gap-1">
          <span class="text-white/30 text-[9px] uppercase tracking-[0.2em] font-black flex items-center gap-1.5">
            <span class="material-symbols-outlined text-[12px]">tag</span> ID
          </span>
          <span class="text-white/80 font-mono text-xs tracking-wider">{{ propsComputed.id }}</span>
        </div>

        <div class="flex gap-6">
          <div class="flex flex-col items-end gap-1">
            <span class="text-white/30 text-[9px] uppercase tracking-[0.2em] font-black flex items-center gap-1.5">
              <span class="material-symbols-outlined text-[12px]">qr_code_scanner</span> Escaneos
            </span>
            <span class="text-white/90 font-mono text-xs font-bold">{{ qrStatus.totalScans }}</span>
          </div>
          <div class="flex flex-col items-end gap-1">
            <span class="text-white/30 text-[9px] uppercase tracking-[0.2em] font-black flex items-center gap-1.5">
              <span class="material-symbols-outlined text-[12px]">info</span> Estado
            </span>
            <div class="flex items-center gap-1.5">
              <span :class="['w-1.5 h-1.5 rounded-full shadow-lg', currentStatus.dot]"></span>
              <span class="text-white/90 text-[10px] font-bold uppercase tracking-wider">{{ currentStatus.label
              }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Código QR (Derecho) -->
    <!-- Fondo oscuro naranja casi café/negro -->
    <div
      class="w-full sm:w-[220px] bg-[#0c0500] border-t sm:border-t-0 sm:border-l border-white/5 flex flex-col items-center justify-center p-6 shrink-0 relative z-10">

      <!-- Menú de Acciones -->
      <button data-name="hamMenu" @click="toggleMenu($event)"
        class="text-orange-500/90 hover:text-white transition-colors cursor-pointer w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white/10  active:scale-95 absolute top-4 right-4">
        <span data-name="hamMenu" class="material-symbols-outlined text-[24px] hamMenu">more_horiz</span>
      </button>

      <!-- Dropdown Menu -->
      <Transition enter-active-class="transition-all duration-200 ease-out"
        enter-from-class="opacity-0 -translate-y-2 scale-95" enter-to-class="opacity-100 translate-y-0 scale-100"
        leave-active-class="transition-all duration-200 ease-in" leave-from-class="opacity-100 translate-y-0 scale-100"
        leave-to-class="opacity-0 -translate-y-2 scale-95" class="z-30!">

        <div v-if="showMenu"
          class="absolute top-12 right-4 w-[200px] bg-[#050505  ] border border-orange-500/20 rounded-xl p-1.5 shadow-[0_8px_30px_rgb(249,115,22,0.1)] z-50!">
          <template v-for="(option, index) in menuOptions" :key="index">
            <div v-if="option.divider" class="h-px bg-orange-500/10 my-1 mx-2 z-50!"></div>
            <button v-else @click="option.action" v-tooltip="{ content: option.description, placement: 'top' }" :class="[
              'w-full flex items-center gap-3 cursor-pointer px-3 py-2 rounded-lg bg-transparent text-sm transition-colors text-left font-medium',
              option.color || 'text-white/70',
              option.hoverBg || 'hover:bg-orange-500/10 hover:text-orange-400'
            ]">
              <span class="material-symbols-outlined text-[16px]">{{ option.icon }}</span>
              {{ option.label }}
            </button>
          </template>
        </div>
      </Transition>



      <!-- Contenedor del QR con bordes muy redondeados y centrado -->
      <div class="w-32 h-32 sm:w-36 sm:h-36 rounded-3xl flex items-center justify-center relative z-10 bg-white p-3!">
        <template v-if="propsComputed.img">
          <img :src="propsComputed.img" class="w-full h-full object-cover rounded-xl" />
        </template>
        <template v-else>
          <QrcodeVue :value="`http://192.168.100.15:5173/qr/${propsComputed.id}`" :size="125" class="w-full h-full"
            render-as="canvas" />
        </template>
      </div>

      <!-- Etiqueta decorativa debajo del QR -->
      <p class="mt-4 text-white text-[9px] uppercase tracking-[0.3em] font-black z-10 text-center">www.ubiqueme.com</p>
    </div>

    <!-- Overlay invisible para cerrar el menú al hacer clic afuera -->
    <div v-if="showMenu" @click="showMenu = false" class="fixed inset-0 z-10 cursor-default pointer-events-none"></div>

    <!-- Overlay Prompts -->
    <Transition enter-active-class="transition-all duration-200 ease-out" enter-from-class="opacity-0"
      enter-to-class="opacity-100" leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100" leave-to-class="opacity-0">
      <div v-if="activePrompt"
        class="absolute inset-0 bg-[#0a0a0a]/95 z-40 p-6 flex flex-col justify-center items-center">

        <button @click="closeAll"
          class="absolute top-4 right-4 w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/50 hover:bg-white/10 hover:text-white transition-all cursor-pointer">
          <span class="material-symbols-outlined text-[18px]">close</span>
        </button>

        <!-- Cancel Prompt -->
        <Transition enter-active-class="transition-all duration-300 ease-out" enter-from-class="opacity-0 scale-95"
          enter-to-class="opacity-100 scale-100" leave-active-class="transition-all duration-200 ease-in"
          leave-from-class="opacity-100 scale-100" leave-to-class="opacity-0 scale-95">
          <div v-if="activePrompt === 'cancel'" class="w-full text-center max-w-sm">
            <div class="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center mx-auto mb-4">
              <span class="material-symbols-outlined text-rose-500 text-[24px]">warning</span>
            </div>
            <h3 class="text-white/90 text-lg font-medium mb-1.5">¿Desactivar código?</h3>
            <p class="text-white/50 text-sm leading-relaxed mb-6 px-4">
              Esta acción desactivará el código inmediatamente.
            </p>
            <div class="flex gap-3 w-full">
              <button @click="closeAll"
                class="flex-1 py-2.5 bg-white/5 text-white/70 rounded-lg font-medium text-sm hover:bg-white/10 hover:text-white transition-colors cursor-pointer">Cancelar</button>
              <button
                class="flex-1 py-2.5 bg-rose-500 text-white rounded-lg font-medium text-sm hover:bg-rose-600 transition-colors active:scale-[0.98] cursor-pointer">Desactivar</button>
            </div>
          </div>
        </Transition>

        <!-- Renew Prompt -->
        <Transition enter-active-class="transition-all duration-300 ease-out" enter-from-class="opacity-0 scale-95"
          enter-to-class="opacity-100 scale-100" leave-active-class="transition-all duration-200 ease-in"
          leave-from-class="opacity-100 scale-100" leave-to-class="opacity-0 scale-95">
          <div v-if="activePrompt === 'renew'" class="w-full text-center max-w-sm">
            <div class="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
              <span class="material-symbols-outlined text-amber-500 text-[24px]">autorenew</span>
            </div>
            <h3 class="text-white/90 text-lg font-medium mb-1.5">Renovar código</h3>
            <p class="text-white/50 text-sm leading-relaxed mb-6 px-4">
              Se iniciará el proceso de renovación.
            </p>
            <div class="flex gap-3 w-full">
              <button @click="closeAll"
                class="flex-1 py-2.5 bg-white/5 text-white/70 rounded-lg font-medium text-sm hover:bg-white/10 hover:text-white transition-colors cursor-pointer">Cancelar</button>
              <button
                class="flex-1 py-2.5 bg-white text-black rounded-lg font-medium text-sm hover:bg-white/90 transition-colors active:scale-[0.98] cursor-pointer">Renovar</button>
            </div>
          </div>
        </Transition>

        <!-- Edit Name Prompt -->
        <Transition enter-active-class="transition-all duration-300 ease-out" enter-from-class="opacity-0 scale-95"
          enter-to-class="opacity-100 scale-100" leave-active-class="transition-all duration-200 ease-in"
          leave-from-class="opacity-100 scale-100" leave-to-class="opacity-0 scale-95">
          <div v-if="activePrompt === 'edit'" class="w-full max-w-sm">
            <h3 class="text-white/90 text-lg font-medium mb-4 text-center">Editar nombre</h3>
            <div class="mb-6">
              <input @keyup.enter="handleEdit" type="text" v-model="qrName" placeholder="Nuevo nombre"
                class="w-full bg-[#161619] border border-white/10 rounded-lg px-4 py-3 text-white text-sm transition-all focus:outline-none focus:border-white/30 placeholder:text-white/30" />
            </div>
            <div class="flex gap-3 w-full">
              <button @click="closeAll"
                class="flex-1 py-2.5 bg-white/5 text-white/70 rounded-lg font-medium text-sm hover:bg-white/10 hover:text-white transition-colors cursor-pointer">Cancelar</button>
              <button @click="handleEdit"
                class="flex-1 py-2.5 bg-white text-black rounded-lg font-medium text-sm hover:bg-white/90 transition-colors active:scale-[0.98] cursor-pointer">Guardar</button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.material-symbols-outlined {
  font-variation-settings:
    'FILL' 1,
    'wght' 400,
    'GRAD' 0,
    'opsz' 24;
}
</style>
