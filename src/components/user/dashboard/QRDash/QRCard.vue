<script lang="ts" setup>
import { computed, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import QrcodeVue from 'qrcode.vue'
import { collection, doc, getDoc, increment, onSnapshot, orderBy, query, Timestamp, writeBatch } from 'firebase/firestore'
import { db } from '@/firebase'
import { useUserStore } from '@/stores/user'
import CloudLoader from '@/components/ui/CloudLoader.vue'
import type { IQRCard, TQRStatus } from '@/interfaces/IQRCard'
import type { IQRLog } from '@/interfaces/IPublicQR'
import type { Unsubscribe } from 'firebase/auth'
import QRCardLog from './QRCardLog.vue'
import { toast } from 'vue-sonner'
import { nanoid } from 'nanoid'
import { useQRDownload } from '@/composables/useQRDownload'
import LogoWhite from '@/assets/Ubiqueme_Logo_white.webp'

const emit = defineEmits<{
  (e: 'request-physical', subscriptionId: string): void
}>()

const props = defineProps<IQRCard>()

const propsComputed = computed(() => {
  return {
    ...props,
  }
})

const showMenu = ref(false)
const activePrompt = ref<'cancel' | 'renew' | 'edit' | 'amplify' | 'download' | null>(null)

const qrName = ref(propsComputed.value.name);

const statusConfig = {
  Active: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', dot: 'bg-emerald-400', label: 'Activo' },
  Canceled: { bg: 'bg-rose-500/10', text: 'text-rose-400', dot: 'bg-rose-400', label: 'Cancelado' },
  Process: { bg: 'bg-amber-500/10', text: 'text-amber-400', dot: 'bg-amber-400', label: 'En Proceso' },
  Error: { bg: 'bg-red-500/10', text: 'text-red-400', dot: 'bg-red-400', label: 'Error' },
  Paused: { bg: 'bg-slate-500/10', text: 'text-slate-400', dot: 'bg-slate-400', label: 'Pausado' },
  Inactive: { bg: 'bg-slate-500/10', text: 'text-slate-500', dot: 'bg-slate-500', label: 'Inactivo' },
}

const isInactive = computed(() => propsComputed.value.status === 'Inactive')
const isCanceled = computed(() => propsComputed.value.status === 'Canceled')
const isDisabled = computed(() => isInactive.value || isCanceled.value)

const currentStatus = computed(() => {
  if (propsComputed.value.isBanned) {
    return {
      bg: 'bg-red-500/20',
      text: 'text-red-500',
      dot: 'bg-red-500',
      label: 'Baneado'
    }
  }
  // BUG #5: Bronce QR with 'Active' status but no publicQR doc → "Sin publicar"
  if (propsComputed.value.planType === 'bronce' && !qrStatusLoaded.value && propsComputed.value.status === 'Active') {
    return {
      bg: 'bg-slate-500/10',
      text: 'text-slate-400',
      dot: 'bg-slate-400',
      label: 'Sin publicar'
    }
  }
  return statusConfig[propsComputed.value.status] || {
    bg: 'bg-slate-500/10',
    text: 'text-slate-100',
    dot: 'bg-slate-400',
    label: 'Desconocido'
  }
})

const openPrompt = (type: 'cancel' | 'renew' | 'edit' | 'download') => {
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

const isMexicanPhone = computed(() => {
  const phone = userStore.getUserPhone;
  return !!phone && phone.startsWith('52');
});

const isLoading = ref(false);

const handleEdit = async () => {
  try {
    isLoading.value = true;
    const userQRDoc = doc(db, `users/${userStore.getUserId}/qrs/${props.id}`)
    const publicQrDoc = doc(db, 'publicQR', props.id);
    const batch = writeBatch(db);

    batch.update(userQRDoc, { name: qrName.value })

    const publicSnap = await getDoc(publicQrDoc)
    if (publicSnap.exists()) {
      batch.update(publicQrDoc, { name: qrName.value })
    }

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

    // Check if doc already exists — if so, preserve original createdAt
    const publicSnap = await getDoc(publicQrRef);
    const isNew = !publicSnap.exists();

    const publicQRData: Record<string, unknown> = {
      id: props.id,
      name: props.name,
      docId: props.id,
      status: 'Active',
      isPublic: true,
      isBanned: false,
      banReason: '',
      totalScans: props.scans,
      lastScan: null,
      uid: userStore.getUserId,
      tier: props.subscriptionId,
      category: props.category ?? '',
    }
    // Only set createdAt on first creation (Bug #2: avoid changing createdAt on reactivation)
    if (isNew) {
      publicQRData.createdAt = Timestamp.now();
    }

    const qrDoc = doc(db, `users/${userStore.getUserId}/qrs/${props.id}`)
    batch.update(qrDoc, {
      status: 'Active',
    })

    if (isNew) {
      // Creation: set() with all required fields → hits create rule + isValidPublicQRData
      batch.set(publicQrRef, publicQRData);
    } else {
      // Reactivation: update() with ONLY fields allowed by rules for Paused → Active
      batch.update(publicQrRef, {
        status: 'Active',
        isPublic: true,
      });
    }

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
    const qrDoc = doc(db, `users/${userStore.getUserId}/qrs/${props.id}`)

    // Only update publicQR doc if it exists (bronce may not have one)
    const publicSnap = await getDoc(publicQrRef)
    if (publicSnap.exists()) {
      batch.update(publicQrRef, {
        isPublic: false,
        status: 'Paused',
      });
    }

    batch.update(qrDoc, {
      status: 'Paused',
    })
    await batch.commit();
    qrStatusLoaded.value = false;
    isLoading.value = false;
    toast.success(`QR establecido como privado`);
  } catch (error) {
    isLoading.value = false;
    const e = error as Error;
    toast.error(`Error al hacer privado el QR: ${e.message}`);
  }
}

let unsubscribe: Unsubscribe;



const qrStatusLoaded = ref(false)

const qrStatus = reactive({
  totalScans: 0,
  lastScan: Timestamp.now() ?? 'No se ha escaneado aún',
})

const loadCount = ref(0);


onMounted(() => {
  unsubscribe = onSnapshot(doc(db, 'publicQR', props.id), (docSnapshot) => {
    if (!docSnapshot.exists()) {
      // Doc may not exist if never made public, or was just made private (isPublic: false)
      return;
    }
    qrStatusLoaded.value = true;
    qrStatus.totalScans = docSnapshot.data().totalScans ?? 0;
    qrStatus.lastScan = docSnapshot.data().lastScan ?? 'No se ha escaneado aún';
    // toast.success(`Estado del QR actualizado`); // Silencing this success as it fires frequently

    loadCount.value++;
  }
    , (error) => {
      toast.error(`Error al obtener datos: ${error}`);
      if (unsubscribe) unsubscribe();
    }
  )
})

onUnmounted(() => {
  if (unsubscribe) unsubscribe();
})

const handleCancelQR = async () => {
  try {
    isLoading.value = true;
    const batch = writeBatch(db);
    const userQRDoc = doc(db, `users/${userStore.getUserId}/qrs/${props.id}`);
    const publicQrDoc = doc(db, 'publicQR', props.id);

    batch.update(userQRDoc, { status: 'Canceled' });

    const publicSnap = await getDoc(publicQrDoc)
    if (publicSnap.exists()) {
      batch.update(publicQrDoc, { status: 'Canceled' });
    }

    // Liberar slot en la suscripción
    const subDoc = doc(db, `users/${userStore.getUserId}/subscriptions/${props.subscriptionId}`);
    batch.update(subDoc, { totalQRsCreated: increment(-1) });

    await batch.commit();
    closeAll();
    toast.success(`QR desactivado permanentemente`);
  } catch (error) {
    const e = error as Error;
    toast.error(`Error al desactivar QR: ${e.message}`);
  } finally {
    isLoading.value = false;
  }
}

const handleRenewQR = async () => {
  try {
    isLoading.value = true;
    const newId = nanoid(15);
    const batch = writeBatch(db);

    // 1. Mark old QR as Inactive
    const oldUserQRDoc = doc(db, `users/${userStore.getUserId}/qrs/${props.id}`);
    batch.update(oldUserQRDoc, { status: 'Inactive', isActive: false });

    const oldPublicDoc = doc(db, 'publicQR', props.id);
    const oldPublicSnap = await getDoc(oldPublicDoc);
    if (oldPublicSnap.exists()) {
      batch.update(oldPublicDoc, { status: 'Inactive' });
    }

    // 2. Create new QR with new ID
    const now = Timestamp.now();
    const userQrData = {
      banReason: '',
      category: props.category,
      createdAt: now,
      docId: newId,
      freeShipmentUsed: props.freeShipmentUsed ?? false,
      id: newId,
      img: props.img ?? '',
      isActive: true,
      isBanned: false,
      lastScan: '',
      link: props.link ?? '',
      name: props.name,
      physicalShipped: props.physicalShipped ?? false,
      physicalShippedAt: props.physicalShippedAt ?? '',
      scans: 0,
      shippingNotes: '',
      status: 'Active' as TQRStatus,
      subscriptionId: props.subscriptionId,
      uid: userStore.getUserId,
    };

    const newUserQRDoc = doc(db, `users/${userStore.getUserId}/qrs/${newId}`);
    batch.set(newUserQRDoc, userQrData);

    const newPublicDoc = doc(db, 'publicQR', newId);
    batch.set(newPublicDoc, {
      id: newId,
      name: props.name,
      category: props.category,
      status: 'Active',
      isPublic: true,
      isBanned: false,
      banReason: '',
      totalScans: 0,
      lastScan: null,
      uid: userStore.getUserId,
      tier: props.planType ?? 'free',
      createdAt: now,
      docId: newId,
    });

    await batch.commit();
    closeAll();
    toast.success(`QR reemplazado exitosamente. Nuevo ID: ${newId}`);
  } catch (error) {
    const e = error as Error;
    toast.error(`Error al reemplazar QR: ${e.message}`);
  } finally {
    isLoading.value = false;
  }
}


const canMakePublic = computed(() => propsComputed.value.planType && propsComputed.value.planType !== 'bronce')
// BUG #4: Allow "Hacer Privado" if QR was previously made public, regardless of plan
const canMakePrivate = computed(() => qrStatusLoaded.value || canMakePublic.value)

const menuOptions = [
  { label: 'Descargar QR', icon: 'download', description: 'Descargar imagen PNG o PDF imprimible con los datos de su código QR.', action: () => openPrompt('download') },
  { divider: true },
  { label: 'Editar nombre', icon: 'edit', description: 'Cambiar el nombre de su QR, tenga en cuenta que el nombre es público, no comparta información sensible.', action: () => openPrompt('edit') },
  { label: 'Reemplazar QR', icon: 'autorenew', description: 'Crea un QR completamente nuevo. El anterior dejará de funcionar permanentemente.', action: () => openPrompt('renew') },
  { divider: true },
  { label: 'Pedir QR físico', icon: 'local_shipping', description: 'Solicitar su código QR físico con pegamento para colocarlo en sus pertenencias', action: () => emit('request-physical', props.subscriptionId), locked: !isMexicanPhone.value, lockTooltip: 'Solo disponible para números de México (+52)' },
  { label: 'Activar QR', icon: 'public', description: 'Activa el QR para que cualquiera pueda escanearlo.', action: canMakePublic.value ? _setQrPublic : undefined, locked: !canMakePublic.value, lockTooltip: 'Se requiere plan Plata u Oro para activar esta función' },
  { label: 'Desactivar QR', icon: 'visibility_off', description: 'Pausa el QR. Nadie podrá escanearlo', action: canMakePrivate.value ? _setQrPrivate : undefined, locked: !canMakePrivate.value, lockTooltip: 'Se requiere plan Plata u Oro para activar esta función' },
  { divider: true },
  {
    label: 'Eliminar QR',
    icon: 'block',
    description: 'Desactivar el código permanentemente, NO podrá ser escaneado, tendrá que adquirir uno nuevo y este se inutilizara permanentemente.',
    action: () => openPrompt('cancel'),
    color: 'text-rose-400',
    hoverBg: 'hover:bg-rose-500/10'
  },
]

// ─── Download composable ──────────────────────────────────────
const downloadComposable = useQRDownload(computed(() => ({
  id: propsComputed.value.id,
  name: propsComputed.value.name,
  img: propsComputed.value.img,
  category: propsComputed.value.category,
})))

const {
  downloadStyle,
  downloadSize,
  downloadFormat,
  isDownloading,
  qrHighResUrl,
  qrScanUrl,
  currentSize,
  currentCompactSize,
  textScale,
  logoScale,
  domainTextScale,
  compactDomainTextScale,
  getDownloadLabel,
  generateHighResQR,
  handleDownload,
} = downloadComposable

// Initialize high-res QR on mount and when name changes
onMounted(generateHighResQR)
watch(() => propsComputed.value.name, generateHighResQR)

const qrLogs = ref<IQRLog[]>([]);
const logsLoaded = ref(false);
const isLogsLoading = ref(false);
const showLogs = ref(false);

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
      showLogs.value = true;
      return;
    }

    qrLogs.value = [];
    showLogs.value = true;
    qrLogs.value = querySnapshot.docs.map(doc => ({
      id: doc.id,
      scanDate: doc.data().scanDate,
      scanMetrics: doc.data().scanMetrics,
      interaction: doc.data().interaction,
      img: doc.data().img,
      scannerPhone: doc.data().scannerPhone
    }));
    loadCount.value++;
  }, (error) => {
    isLogsLoading.value = false;
    showLogs.value = false;
    toast.error(`Error al obtener datos de registros: ${error}`);
  });
}

onUnmounted(() => {
  if (unsubscribeLogs) unsubscribeLogs();
})

const hiddeLogsHandle = () => {
  qrLogs.value = [];
  if (unsubscribeLogs) unsubscribeLogs();
  logsLoaded.value = false;
  showLogs.value = false;
}
</script>

<template>

  <div
    class="relative w-full bg-[#0a0401] border border-white/10 rounded-[2rem] transition-all duration-500 font-google-sans group"
    :class="{
      'hover:border-orange-500/40': !isDisabled,
      'opacity-50 grayscale': isDisabled,
      'grayscale-[50%] brightness-75 sepia-[0.3] hue-rotate-[340deg] saturate-[0.5]': isCanceled
    }">

    <!-- Clip wrapper: only the decorative elements need overflow-hidden, not the whole card -->
    <div class="absolute inset-0 z-0 overflow-hidden rounded-[2rem] pointer-events-none">
      <!-- Patrón de Fondo Cuadrícula -->
      <div v-if="!isDisabled" class="absolute inset-0 opacity-[0.04]"
        style="background-image: linear-gradient(rgba(255, 255, 255, 1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 1) 1px, transparent 1px); background-size: 24px 24px;">
      </div>

      <!-- Resplandor Naranja General Sutil -->
      <div v-if="!isDisabled"
        class="absolute top-0 left-0 w-full h-full opacity-20 bg-gradient-to-br from-orange-500/10 via-transparent to-transparent">
      </div>
    </div>

    <section v-if="isLoading" class="absolute inset-0 bg-[#0a0a0a]/95 flex items-center justify-center z-50">
      <CloudLoader></CloudLoader>
    </section>

    <!-- ===== LAYOUT: Info Left + QR Right ===== -->
    <div class="relative z-10 flex flex-col sm:flex-row">

      <!-- ─── Columna Izquierda: Info + Stats + Logs ─── -->
      <div class="flex-1 flex flex-col min-w-0 p-5 md:p-6">

        <!-- Header Row -->
        <div class="flex items-start justify-between gap-2 mb-3">
          <div class="flex items-center gap-2 min-w-0">
            <span class="material-symbols-outlined notranslate text-orange-500 text-[18px] shrink-0">location_on</span>
            <span
              class="text-white font-black tracking-widest text-[10px] uppercase whitespace-nowrap">ubiqueme.com</span>
            <span
              class="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider text-white"
              :class="currentStatus.bg">
              <span :class="['w-1.5 h-1.5 rounded-full text-white!', currentStatus.dot]"></span>
              {{ currentStatus.label }}
            </span>
          </div>
          <!-- Menu button (top right on mobile) -->
          <button data-name="hamMenu" @click="toggleMenu($event)"
            class="sm:hidden text-orange-500/90 hover:text-white transition-colors cursor-pointer w-9 h-9 flex items-center justify-center rounded-xl hover:bg-white/10 active:scale-95 shrink-0">
            <span data-name="hamMenu" class="material-symbols-outlined notranslate text-[22px]">more_horiz</span>
          </button>
        </div>

        <!-- Name + ID -->
        <h3 class="text-xl sm:text-2xl font-black text-white leading-tight mb-1 tracking-tighter truncate">
          {{ propsComputed.name || 'Código QR' }}
        </h3>
        <div class="flex items-center gap-2 mb-3">
          <span class="text-white/30 text-[9px]  tracking-[0.2em] font-black font-mono">
            #{{ propsComputed.id }}
          </span>
        </div>

        <!-- Stats Row -->
        <div class="flex items-center gap-5 mb-3">
          <div class="flex items-center gap-1.5">
            <span class="material-symbols-outlined notranslate text-white/30 text-[14px]">qr_code_scanner</span>
            <span class="text-white/50 text-[10px] uppercase tracking-[0.1em] font-black">Escaneos</span>
            <span class="text-orange-400 font-mono text-sm font-bold">{{ qrStatus.totalScans }}</span>
          </div>
          <div class="flex items-center gap-1.5 sm:hidden">
            <span :class="['w-1.5 h-1.5 rounded-full', currentStatus.dot]"></span>
            <span class="text-white/60 text-[10px] font-bold uppercase tracking-wider">{{ currentStatus.label }}</span>
          </div>
        </div>

        <!-- Description -->
        <p class="text-white/40 text-xs leading-relaxed mb-4 max-w-[400px]">
          Este es su codigo para {{ propsComputed.name || 'este QR' }}. Escanee este código para contactar al
          responsable de forma
          <span class="text-white/70">segura y anónima</span>.
        </p>

        <!-- Divider -->
        <div class="border-t border-white/10 mb-3"></div>

        <!-- Logs Section -->
        <div class="min-h-0 w-full">
          <button v-if="!logsLoaded && !showLogs" @click="loadLogs"
            class="text-xs w-full text-center justify-center text-orange-500 hover:text-orange-400 transition-colors flex items-center bg-amber-900 gap-1.5 cursor-pointer group border-spacing-0.5 border border-orange-500 rounded-md px-2 py-1 mb-2 hover:bg-orange-500/10">
            <span
              class="material-symbols-outlined notranslate text-[16px] group-hover:scale-110 transition-transform">history</span>
            <span class="font-medium text-white">Ver registros de escaneo</span>
            <span v-if="isLogsLoading"
              class="material-symbols-outlined notranslate text-sm animate-spin ml-1">progress_activity</span>
          </button>
          <button v-if="logsLoaded && showLogs" @click="hiddeLogsHandle"
            class="text-xs text-orange-600 hover:text-orange-400 transition-colors flex items-center gap-1.5 cursor-pointer group border-spacing-0.5 border-dotted border-2 border-orange-600 rounded-md px-2 py-1 mb-2 hover:bg-orange-500/10">
            <span
              class="material-symbols-outlined notranslate text-[16px]! group-hover:scale-110 transition-transform">hide</span>
            <span class="font-medium">Ocultar registros</span>
            <span v-if="isLogsLoading"
              class="material-symbols-outlined notranslate text-sm animate-spin ml-1">progress_activity</span>
          </button>

          <div v-if="logsLoaded && isLogsLoading" class="flex items-center gap-2 text-xs text-white/30 py-2">
            <span class="w-3 h-3 border border-orange-400/40 border-t-transparent rounded-full animate-spin"></span>
            Cargando registros...
          </div>

          <div v-if="logsLoaded && !isLogsLoading"
            class="space-y-2 lg:max-h-72 max-h-96 overflow-y-auto pr-1 scrollbar-thin">
            <div v-if="qrLogs.length === 0" class="text-white/20 text-xs py-3 text-center">
              <span class="material-symbols-outlined notranslate text-[20px] block mb-1">history_off</span>
              Sin registros de escaneo aún
            </div>
            <QRCardLog v-for="log in qrLogs" :key="log.id" v-bind="log" />
          </div>
        </div>
      </div>

      <!-- ─── Columna Derecha: QR Code ─── -->
      <div
        class="w-full sm:w-[200px] bg-[#0c0500] border-t sm:border-t-0 sm:border-l md:rounded-r-4xl border-white/5 flex flex-col items-center justify-center p-6 shrink-0 relative">
        <div
          class="w-34 h-34 sm:w-32 sm:h-32 rounded-3xl flex items-center justify-center bg-[#fff7ed] p-2.5 shadow-lg relative border border-[#f7b05c]">
          <template v-if="propsComputed.img">
            <img :src="propsComputed.img" class="w-full h-full object-cover rounded-xl" />
          </template>
          <template v-else>
            <QrcodeVue :value="qrScanUrl" :size="110" render-as="svg" level="H" />
          </template>
        </div>
        <!-- Direct download button (visible on both mobile and desktop) -->
        <button @click="openPrompt('download')" v-tooltip="{ content: 'Descargar QR', placement: 'top' }"
          class="mt-3 flex items-center gap-1.5 px-3 py-1.5 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 hover:text-orange-300 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer active:scale-95 border border-orange-500/20">
          <span class="material-symbols-outlined notranslate text-[16px]">download</span>
          Descargar
        </button>
        <!-- Menu button (desktop only) -->
        <button data-name="hamMenu" @click="toggleMenu($event)"
          class="hidden sm:flex text-orange-400 hover:text-white transition-colors cursor-pointer px-3 py-0.5 items-center justify-center gap-1.5 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 active:scale-95 absolute top-4 right-4 border border-orange-500/20 text-[11px] font-bold ">
          <span class="text-white/80">Menú</span>
          <span data-name="hamMenu" class="material-symbols-outlined notranslate text-[16px]">more_horiz</span>
        </button>
      </div>
      <!-- Desktop Full-Card Menu Overlay -->
      <Transition enter-active-class="transition-all duration-300 ease-out" enter-from-class="opacity-0 scale-95"
        enter-to-class="opacity-100 scale-100" leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="opacity-100 scale-100" leave-to-class="opacity-0 scale-95">
        <div v-if="showMenu"
          class="hidden sm:flex absolute inset-0 z-40 bg-[#0a0401]/95 rounded-[2rem] p-5 md:p-6 flex-col">
          <!-- Back button -->
          <button @click="showMenu = false"
            class="flex items-center gap-2 text-white/50 hover:text-orange-400 transition-colors cursor-pointer w-fit mb-4">
            <span class="material-symbols-outlined notranslate text-[20px]">arrow_back</span>
            <span class="text-xs font-bold ">Volver</span>
          </button>

          <!-- Title -->
          <h3 class="text-lg font-black text-white/90 mb-4">Opciones del QR</h3>

          <!-- Options grid — chocolate bar: 3 cols, no dividers, compact buttons with description -->
          <div class="grid grid-cols-3 gap-1.5 flex-1 content-start overflow-y-auto pr-1">
            <template v-for="(option, index) in menuOptions.filter(o => !o.divider)" :key="index">
              <!-- Locked option -->
              <div v-if="option.locked" v-tooltip="{ content: option.lockTooltip, placement: 'top' }"
                class="flex flex-col items-start gap-0.5 p-1.5 rounded-xl bg-white/[0.02] border border-white/5 text-left cursor-not-allowed opacity-40">
                <span class="material-symbols-outlined notranslate text-[18px] text-white/30">lock</span>
                <div>
                  <p class="text-xs font-medium text-white/40 leading-tight">{{ option.label }}</p>
                  <p class="text-[9px] text-white/20 leading-tight mt-0.5">{{ option.lockTooltip }}</p>
                </div>
              </div>

              <!-- Action option -->
              <button v-else @click="option.action" :class="[
                'flex flex-col items-start gap-0.5 p-1.5 rounded-xl border text-left transition-all cursor-pointer active:scale-[0.97]',
                option.color ? `${option.color} border-${option.color}/20` : 'text-white/80 border-white/5 hover:border-orange-500/30 hover:bg-orange-500/5'
              ]">
                <span
                  :class="[option.color ? option.color : 'text-orange-400', 'material-symbols-outlined notranslate text-[18px]']">{{
                    option.icon }}</span>
                <div>
                  <p class="text-xs font-medium leading-tight">{{ option.label }}</p>
                  <p class="text-[9px] text-white/40 leading-tight mt-0.5">{{ option.description }}</p>
                </div>
              </button>
            </template>
          </div>
        </div>
      </Transition>
    </div>

    <!-- ─── Mobile Bottom Sheet Menu (Teleported to body) ─── -->
    <Teleport to="body">
      <Transition enter-active-class="transition-all duration-300 ease-out" enter-from-class="opacity-0"
        enter-to-class="opacity-100" leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="opacity-100" leave-to-class="opacity-0">
        <div v-if="showMenu" @click="showMenu = false" class="sm:hidden fixed inset-0 bg-black/70 z-40 cursor-default">
        </div>
      </Transition>
      <Transition enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="opacity-0 translate-y-full" enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition-all duration-200 ease-in" leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 translate-y-full">
        <div v-if="showMenu"
          class="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0b0808] border-t border-orange-500/20 rounded-t-2xl p-1 pb-2 max-h-[85vh] overflow-y-auto shadow-[0_-8px_30px_rgba(0,0,0,0.5)]">
          <!-- Handle bar -->
          <div class="w-10 h-1 bg-white/20 rounded-full mx-auto mb-4"></div>
          <!-- Header with back button -->
          <div class="flex items-center justify-center mb-2 relative ml-2">
            <button @click="showMenu = false"
              class="absolute left-0 w-8 h-8 flex items-center justify-center text-white/60 hover:text-white transition-colors cursor-pointer rounded-lg hover:bg-white/5">
              <span class="material-symbols-outlined notranslate text-[22px]">arrow_back</span>
              Atrás
            </button>
            <span class="text-white/60 text-[10px] font-bold uppercase tracking-widest text-center">Opciones del
              QR</span>
          </div>
          <div class="space-y-1">
            <template v-for="(option, index) in menuOptions" :key="index">
              <div v-if="option.divider" class="h-px bg-white/5 my-2 mx-4"></div>
              <div v-else-if="option.locked"
                class="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl bg-transparent text-sm text-left font-medium text-white/30 cursor-not-allowed opacity-60">
                <span class="material-symbols-outlined notranslate text-[22px]">lock</span>
                <div class="flex flex-col">
                  <span class="text-sm font-medium">{{ option.label }}</span>
                  <span class="text-[11px] text-white/20 font-normal leading-tight">{{ option.lockTooltip }}</span>
                </div>
              </div>
              <button v-else @click="option.action" :class="[
                'w-full flex items-center gap-4 cursor-pointer px-4 py-3 rounded-xl bg-transparent text-sm transition-colors text-left font-medium active:scale-[0.98]',
                option.color || 'text-white/80',
                option.hoverBg || 'hover:bg-white/5 active:bg-white/10'
              ]">
                <span
                  :class="[option.color || 'text-orange-400', 'material-symbols-outlined notranslate text-[22px]']">{{
                    option.icon }}</span>
                <div class="flex flex-col">
                  <span>{{ option.label }}</span>
                  <span class="text-[10px] text-white/30 font-normal leading-tight">{{ option.description }}</span>
                </div>
              </button>
            </template>
          </div>
          <!-- Close button -->
          <button @click="showMenu = false"
            class="w-full mt-3 py-3 bg-white/5 text-white/60 rounded-xl text-sm font-medium hover:bg-white/10 hover:text-white/80 transition-colors cursor-pointer active:scale-[0.98]">
            Cerrar
          </button>
        </div>
      </Transition>
    </Teleport>

    <!-- Overlay Prompts -->
    <Transition enter-active-class="transition-all duration-200 ease-out" enter-from-class="opacity-0"
      enter-to-class="opacity-100" leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100" leave-to-class="opacity-0">
      <div v-if="activePrompt"
        class="fixed inset-0 bg-[#0a0a0a]/95 z-[100] p-6 flex flex-col justify-center items-center">

        <button @click="closeAll"
          class="absolute top-4 right-4 w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/50 hover:bg-white/10 hover:text-white transition-all cursor-pointer">
          <span class="material-symbols-outlined notranslate text-[18px]">close</span>
        </button>

        <!-- Cancel Prompt -->
        <Transition enter-active-class="transition-all duration-300 ease-out" enter-from-class="opacity-0 scale-95"
          enter-to-class="opacity-100 scale-100" leave-active-class="transition-all duration-200 ease-in"
          leave-from-class="opacity-100 scale-100" leave-to-class="opacity-0 scale-95">
          <div v-if="activePrompt === 'cancel'" class="w-full text-center max-w-sm">
            <div class="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center mx-auto mb-4">
              <span class="material-symbols-outlined notranslate text-rose-500 text-[24px]">warning</span>
            </div>
            <h3 class="text-white/90 text-lg font-medium mb-1.5">¿Desactivar código?</h3>
            <p class="text-white/50 text-sm leading-relaxed mb-6 px-4">
              Esta acción desactivará el código inmediatamente.
            </p>
            <div class="flex gap-3 w-full">
              <button @click="closeAll"
                class="flex-1 py-2.5 bg-white/5 text-white/70 rounded-lg font-medium text-sm hover:bg-white/10 hover:text-white transition-colors cursor-pointer">Cancelar</button>
              <button @click="handleCancelQR"
                class="flex-1 py-2.5 bg-rose-500 text-white rounded-lg font-medium text-sm hover:bg-rose-600 transition-colors active:scale-[0.98] cursor-pointer">Desactivar</button>
            </div>
          </div>
        </Transition>

        <!-- Renew/Replace Prompt -->
        <Transition enter-active-class="transition-all duration-300 ease-out" enter-from-class="opacity-0 scale-95"
          enter-to-class="opacity-100 scale-100" leave-active-class="transition-all duration-200 ease-in"
          leave-from-class="opacity-100 scale-100" leave-to-class="opacity-0 scale-95">
          <div v-if="activePrompt === 'renew'" class="w-full text-center max-w-sm">
            <div class="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center mx-auto mb-4">
              <span class="material-symbols-outlined notranslate text-rose-500 text-[24px]">warning</span>
            </div>
            <h3 class="text-white/90 text-lg font-medium mb-1.5">¿Reemplazar código QR?</h3>
            <div class="space-y-2 text-left px-4 mb-6">
              <p class="text-white/50 text-sm leading-relaxed">
                Al reemplazar este QR <strong class="text-white/70">se creará uno nuevo con un ID diferente</strong>.
              </p>
              <ul class="text-white/50 text-xs space-y-1.5 list-disc pl-4">
                <li>El <strong class="text-rose-400">código anterior dejará de funcionar permanentemente</strong></li>
                <li>Los <strong class="text-rose-400">QR físicos (stickers) actuales quedarán inservibles</strong></li>
                <li>Deberá solicitar un nuevo QR físico si lo desea</li>
                <li>El historial de escaneos anteriores se conservará</li>
                <li class="text-white/70 font-medium">Esta acción no se puede deshacer</li>
              </ul>
            </div>
            <div class="flex gap-3 w-full">
              <button @click="closeAll"
                class="flex-1 py-2.5 bg-white/5 text-white/70 rounded-lg font-medium text-sm hover:bg-white/10 hover:text-white transition-colors cursor-pointer">Cancelar</button>
              <button @click="handleRenewQR"
                class="flex-1 py-2.5 bg-rose-500 text-white rounded-lg font-medium text-sm hover:bg-rose-600 transition-colors active:scale-[0.98] cursor-pointer flex items-center justify-center gap-1.5">
                <span class="material-symbols-outlined notranslate text-[16px]">autorenew</span>
                Reemplazar
              </button>
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

        <!-- Download Prompt - Desktop version -->
        <Transition enter-active-class="transition-all duration-300 ease-out" enter-from-class="opacity-0 scale-95"
          enter-to-class="opacity-100 scale-100" leave-active-class="transition-all duration-200 ease-in"
          leave-from-class="opacity-100 scale-100" leave-to-class="opacity-0 scale-95">
          <div v-if="activePrompt === 'download'" class="hidden sm:flex w-full max-w-sm flex-col items-center">
            <!-- Close (X) button -->
            <div class="flex items-center justify-between w-full mb-4">
              <h3 class="text-white font-black text-lg tracking-tight">Descargar QR</h3>
              <button @click="closeAll"
                class="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all cursor-pointer">
                <span class="material-symbols-outlined notranslate text-[18px]">close</span>
              </button>
            </div>

            <!-- Preview card with glass effect -->
            <div
              class="w-full mb-5 rounded-2xl bg-gradient-to-br from-[#f97316] to-[#fed7aa] border border-orange-300 p-5 relative overflow-hidden">
              <!-- Subtle grid behind -->
              <div class="absolute inset-0 opacity-[0.03] pointer-events-none"
                style="background-image: linear-gradient(rgba(255,255,255,1)1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1)1px,transparent 1px);background-size:20px 20px;">
              </div>
              <!-- Logo top-right -->
              <div class="absolute top-2 right-2 bg-black/80 rounded-lg p-1.5 z-10 pointer-events-none">
                <img :src="LogoWhite" class="w-[48px] h-auto opacity-90" alt="Ubiqueme" />
              </div>
              <div class="relative z-10 flex flex-col items-center gap-3">
                <template v-if="downloadStyle === 'normal'">
                  <span class="text-white font-black tracking-[0.15em] uppercase"
                    :style="{ fontSize: `${Math.round(currentSize.width * domainTextScale.top)}px` }">ubiqueme.com</span>
                  <div class="flex items-center justify-center w-full gap-2">
                    <div class="shrink-0 bg-white rounded-xl p-1.5">
                      <template v-if="propsComputed.img">
                        <img :src="propsComputed.img" class="w-20 h-20 object-contain" />
                      </template>
                      <template v-else>
                        <QrcodeVue :value="qrScanUrl" :size="80" render-as="canvas" level="H" />
                      </template>
                    </div>
                    <div class="flex flex-col flex-1 min-w-0 gap-0.5">
                      <p class="text-black font-extrabold text-sm leading-tight truncate">{{ propsComputed.name ||
                        'Código QR' }}
                      </p>
                      <p class="text-black/60 font-mono font-bold text-[10px]">#{{ propsComputed.id }}</p>
                      <div class="w-3/4 h-px bg-black/10 my-0.5"></div>
                      <p class="text-black/70 font-semibold text-[10px] leading-tight">Escanee este QR para contactar al
                        responsable.</p>
                    </div>
                  </div>
                  <div class="flex items-center justify-center gap-2 mt-1">
                    <span class="text-white font-bold uppercase tracking-wider" translate="no"
                      :style="{ fontSize: `${Math.round(currentSize.width * domainTextScale.bottom) - 5}px` }">localizarme.com</span>
                    <span class="text-white/50" translate="no"
                      :style="{ fontSize: `${Math.round(currentSize.width * domainTextScale.bottom) - 10}px` }">•</span>
                    <span class="text-white font-bold uppercase tracking-wider" translate="no"
                      :style="{ fontSize: `${Math.round(currentSize.width * domainTextScale.bottom) - 5}px` }">contactoddmio.com</span>
                  </div>
                </template>
                <template v-else>
                  <div class="bg-white rounded-2xl p-3 shadow-lg flex flex-col items-center gap-1.5 w-[160px]">
                    <span class="text-white font-black tracking-widest uppercase"
                      :style="{ fontSize: `${Math.round(currentCompactSize.size * compactDomainTextScale.top)}px` }">ubiqueme.com</span>
                    <div class="mx-1">
                      <template v-if="propsComputed.img">
                        <img :src="propsComputed.img" class="w-16 h-16 object-contain" />
                      </template>
                      <template v-else>
                        <QrcodeVue :value="qrScanUrl" :size="64" render-as="canvas" level="H" />
                      </template>
                    </div>
                    <div class="flex items-center justify-center gap-1">
                      <span class="text-white font-bold uppercase tracking-wider" translate="no"
                        :style="{ fontSize: `${Math.round(currentCompactSize.size * compactDomainTextScale.bottom)}px` }">localizarme.com</span>
                      <span class="text-white/50" translate="no"
                        :style="{ fontSize: `${Math.round(currentCompactSize.size * compactDomainTextScale.bottom)}px` }">•</span>
                      <span class="text-white font-bold uppercase tracking-wider" translate="no"
                        :style="{ fontSize: `${Math.round(currentCompactSize.size * compactDomainTextScale.bottom)}px` }">contactomio.com</span>
                    </div>
                    <p class="text-black font-bold text-center text-[8px]">Escanee QR para contactar al responsable
                    </p>
                  </div>
                </template>
              </div>
            </div>

            <!-- Format toggle: PNG | PDF -->
            <div class="flex w-full gap-2 mb-4">
              <div class="flex gap-1 p-0.5 bg-white/5 rounded-xl flex-1">
                <button @click="downloadFormat = 'png'"
                  class="flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer"
                  :class="downloadFormat === 'png' ? 'bg-orange-500 text-white shadow-sm' : 'text-white/50 hover:text-white/80'">
                  PNG
                </button>
                <button @click="downloadFormat = 'pdf'"
                  class="flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer"
                  :class="downloadFormat === 'pdf' ? 'bg-orange-500 text-white shadow-sm' : 'text-white/50 hover:text-white/80'">
                  PDF
                </button>
              </div>
              <div class="flex gap-1 p-0.5 bg-white/5 rounded-xl flex-1">
                <button @click="downloadStyle = 'normal'"
                  class="flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer"
                  :class="downloadStyle === 'normal' ? 'bg-orange-500 text-white shadow-sm' : 'text-white/50 hover:text-white/80'">
                  Normal
                </button>
                <button @click="downloadStyle = 'compact'"
                  class="flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer"
                  :class="downloadStyle === 'compact' ? 'bg-orange-500 text-white shadow-sm' : 'text-white/50 hover:text-white/80'">
                  Compacto
                </button>
              </div>
              <div class="flex gap-1 p-0.5 bg-white/5 rounded-xl">
                <button @click="downloadSize = 'sm'"
                  class="px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer"
                  :class="downloadSize === 'sm' ? 'bg-orange-500/20 border border-orange-500/50 text-orange-400' : 'text-white/50 hover:text-white/80'">
                  SM
                </button>
                <button @click="downloadSize = 'md'"
                  class="px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer"
                  :class="downloadSize === 'md' ? 'bg-orange-500/20 border border-orange-500/50 text-orange-400' : 'text-white/50 hover:text-white/80'">
                  MD
                </button>
                <button @click="downloadSize = 'lg'"
                  class="px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer"
                  :class="downloadSize === 'lg' ? 'bg-orange-500/20 border border-orange-500/50 text-orange-400' : 'text-white/50 hover:text-white/80'">
                  LG
                </button>
              </div>
            </div>

            <p class="text-white/30 text-[9px] text-center leading-relaxed mb-4">
              <template v-if="downloadFormat === 'pdf'">
                📄 El PDF respeta el tamaño físico exacto al imprimir.
              </template>
              <template v-else>
                💡 Al imprimir, ajuste la <strong class="text-white/50">escala</strong> en opciones de impresión.
              </template>
            </p>

            <button @click="handleDownload(closeAll)" :disabled="isDownloading"
              class="w-full py-3 bg-gradient-to-r from-[#f38020] to-[#e07010] text-white rounded-xl font-bold text-sm hover:brightness-110 transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20">
              <span class="material-symbols-outlined notranslate text-[18px]">download</span>
              {{ getDownloadLabel }}
            </button>
          </div>
        </Transition>

        <!-- Mobile Download Bottom Sheet (Teleported to body) -->
        <Teleport to="body">
          <Transition enter-active-class="transition-all duration-300 ease-out" enter-from-class="opacity-0"
            enter-to-class="opacity-100" leave-active-class="transition-all duration-200 ease-in"
            leave-from-class="opacity-100" leave-to-class="opacity-0">
            <div v-if="activePrompt === 'download'" @click="closeAll"
              class="sm:hidden fixed inset-0 bg-black/70 z-[110] cursor-default"></div>
          </Transition>
          <Transition enter-active-class="transition-all duration-300 ease-out"
            enter-from-class="opacity-0 translate-y-full" enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition-all duration-200 ease-in" leave-from-class="opacity-100 translate-y-0"
            leave-to-class="opacity-0 translate-y-full">
            <div v-if="activePrompt === 'download'"
              class="sm:hidden fixed bottom-0 left-0 right-0 z-[120] bg-[#0b0808] border-t border-orange-500/20 rounded-t-2xl p-4 pb-8 max-h-[85vh] overflow-y-auto shadow-[0_-8px_30px_rgba(0,0,0,0.5)]">
              <!-- Handle bar -->
              <div class="w-10 h-1 bg-white/20 rounded-full mx-auto mb-4"></div>
              <!-- Header with back button -->
              <div class="flex items-center justify-center mb-4 relative">
                <button @click="closeAll"
                  class="absolute left-0 w-8 h-8 flex items-center justify-center text-white/60 hover:text-white transition-colors cursor-pointer rounded-lg hover:bg-white/5">
                  <span class="material-symbols-outlined notranslate text-[22px]">arrow_back</span>
                  Atrás
                </button>
                <span class="text-white/60 text-[10px] font-bold uppercase tracking-widest text-center">Descargar
                  QR</span>
              </div>

              <!-- Preview -->
              <div class="flex justify-center mb-5">
                <div
                  class="rounded-2xl bg-gradient-to-br from-[#f97316] to-[#fed7aa] border border-orange-300 p-5 relative overflow-hidden w-full max-w-[280px]">
                  <div class="absolute inset-0 opacity-[0.03] pointer-events-none"
                    style="background-image:linear-gradient(rgba(255,255,255,1)1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1)1px,transparent 1px);background-size:20px 20px;">
                  </div>
                  <!-- Logo top-right -->
                  <div class="absolute top-2 right-2 bg-black/80 rounded-lg p-1.5 z-10 pointer-events-none">
                    <img :src="LogoWhite" class="w-[16px] md:w-[38px] h-auto opacity-90" alt="Ubiqueme" />
                  </div>
                  <div class="relative z-10 flex flex-col items-center gap-2">
                    <template v-if="downloadStyle === 'normal'">
                      <span class="text-white font-black tracking-[0.15em] uppercase"
                        :style="{ fontSize: `${Math.round(currentSize.width * domainTextScale.top)}px` }">ubiqueme.com</span>
                      <div class="flex items-center justify-center w-full gap-1.5">
                        <div class="shrink-0 bg-white rounded-xl p-1">
                          <template v-if="propsComputed.img">
                            <img :src="propsComputed.img" class="w-16 h-16 object-contain" />
                          </template>
                          <template v-else>
                            <QrcodeVue :value="qrScanUrl" :size="64" render-as="canvas" level="H" />
                          </template>
                        </div>
                        <div class="flex flex-col flex-1 min-w-0 gap-0.5">
                          <p class="text-black font-extrabold text-xs leading-tight truncate">{{ propsComputed.name ||
                            'Código QR' }}
                          </p>
                          <p class="text-black/60 font-mono font-bold text-[8px]">#{{ propsComputed.id }}</p>
                          <div class="w-3/4 h-px bg-black/10 my-0.5"></div>
                          <p class="text-black/70 font-semibold text-[8px] leading-tight">Escanee este QR para contactar
                            al
                            responsable.</p>
                        </div>
                      </div>
                      <div class="flex items-center justify-center gap-2 mt-1">
                        <span class="text-white font-bold uppercase tracking-wider" translate="no"
                          :style="{ fontSize: `${Math.round(currentSize.width * domainTextScale.bottom)}px` }">localizarme.com</span>
                        <span class="text-white/50" translate="no"
                          :style="{ fontSize: `${Math.round(currentSize.width * domainTextScale.bottom)}px` }">•</span>
                        <span class="text-white font-bold uppercase tracking-wider" translate="no"
                          :style="{ fontSize: `${Math.round(currentSize.width * domainTextScale.bottom)}px` }">contactomio.com</span>
                      </div>
                    </template>
                    <template v-else>
                      <div class="bg-white rounded-2xl p-2 shadow-lg flex flex-col items-center gap-1 w-[140px]">
                        <span class="text-white font-black tracking-widest uppercase"
                          :style="{ fontSize: `${Math.round(currentCompactSize.size * compactDomainTextScale.top)}px` }">ubiqueme.com</span>
                        <div class="mx-0.5">
                          <template v-if="propsComputed.img">
                            <img :src="propsComputed.img" class="w-14 h-14 object-contain" />
                          </template>
                          <template v-else>
                            <QrcodeVue :value="qrScanUrl" :size="56" render-as="canvas" level="H" />
                          </template>
                        </div>
                        <div class="flex items-center justify-center gap-1">
                          <span class="text-white font-bold uppercase tracking-wider" translate="no"
                            :style="{ fontSize: `${Math.round(currentCompactSize.size * compactDomainTextScale.bottom)}px` }">localizarme.com</span>
                          <span class="text-white/50" translate="no"
                            :style="{ fontSize: `${Math.round(currentCompactSize.size * compactDomainTextScale.bottom)}px` }">•</span>
                          <span class="text-white font-bold uppercase tracking-wider" translate="no"
                            :style="{ fontSize: `${Math.round(currentCompactSize.size * compactDomainTextScale.bottom)}px` }">contactomio.com</span>
                        </div>
                        <p class="text-black font-bold text-center text-[7px]">Escanee QR para contactar al
                          responsable</p>
                      </div>
                    </template>
                  </div>
                </div>
              </div>

              <!-- Format toggle: PNG | PDF -->
              <div class="flex w-full gap-2 mb-4">
                <div class="flex gap-1 p-0.5 bg-white/5 rounded-xl flex-1">
                  <button @click="downloadFormat = 'png'"
                    class="flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer"
                    :class="downloadFormat === 'png' ? 'bg-orange-500 text-white shadow-sm' : 'text-white/50 hover:text-white/80'">
                    PNG
                  </button>
                  <button @click="downloadFormat = 'pdf'"
                    class="flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer"
                    :class="downloadFormat === 'pdf' ? 'bg-orange-500 text-white shadow-sm' : 'text-white/50 hover:text-white/80'">
                    PDF
                  </button>
                </div>
                <div class="flex gap-1 p-0.5 bg-white/5 rounded-xl flex-1">
                  <button @click="downloadStyle = 'normal'"
                    class="flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer"
                    :class="downloadStyle === 'normal' ? 'bg-orange-500 text-white shadow-sm' : 'text-white/50 hover:text-white/80'">
                    Normal
                  </button>
                  <button @click="downloadStyle = 'compact'"
                    class="flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer"
                    :class="downloadStyle === 'compact' ? 'bg-orange-500 text-white shadow-sm' : 'text-white/50 hover:text-white/80'">
                    Compacto
                  </button>
                </div>
                <div class="flex gap-1 p-0.5 bg-white/5 rounded-xl">
                  <button @click="downloadSize = 'sm'"
                    class="px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer"
                    :class="downloadSize === 'sm' ? 'bg-orange-500/20 border border-orange-500/50 text-orange-400' : 'text-white/50 hover:text-white/80'">
                    SM
                  </button>
                  <button @click="downloadSize = 'md'"
                    class="px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer"
                    :class="downloadSize === 'md' ? 'bg-orange-500/20 border border-orange-500/50 text-orange-400' : 'text-white/50 hover:text-white/80'">
                    MD
                  </button>
                  <button @click="downloadSize = 'lg'"
                    class="px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer"
                    :class="downloadSize === 'lg' ? 'bg-orange-500/20 border border-orange-500/50 text-orange-400' : 'text-white/50 hover:text-white/80'">
                    LG
                  </button>
                </div>
              </div>

              <p class="text-white/30 text-[9px] text-center leading-relaxed mb-4">
                <template v-if="downloadFormat === 'pdf'">
                  📄 El PDF respeta el tamaño físico exacto al imprimir.
                </template>
                <template v-else>
                  💡 Al imprimir, ajuste la <strong class="text-white/50">escala</strong> en opciones de impresión.
                </template>
              </p>

              <button @click="handleDownload(closeAll)" :disabled="isDownloading"
                class="w-full py-3 bg-gradient-to-r from-[#f38020] to-[#e07010] text-white rounded-xl font-bold text-sm hover:brightness-110 transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20">
                <span class="material-symbols-outlined notranslate text-[18px]">download</span>
                {{ getDownloadLabel }}
              </button>

              <!-- Close button -->
              <button @click="closeAll"
                class="w-full mt-3 py-3 bg-white/5 text-white/60 rounded-xl text-sm font-medium hover:bg-white/10 hover:text-white/80 transition-colors cursor-pointer active:scale-[0.98]">
                Cerrar
              </button>
            </div>
          </Transition>
        </Teleport>
      </div>
    </Transition>

    <!-- ═══════════════════════════════════════════════════════════════════════════════ -->
    <!-- ▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸ -->
    <!-- ▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸ -->
    <!-- ▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸ -->
    <!-- ▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸ -->
    <!-- ═══════════════════════════════════════════════════════════════════════════════ -->
    <!-- ▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸ -->
    <!-- ▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸ -->
    <!-- ▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸ -->
    <!-- ═══════════════════════════════════════════════════════════════════════════════ -->
    <!-- ▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸ -->
    <!-- ▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸ -->
    <!-- ▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸ -->
    <!-- ═══════════════════════════════════════════════════════════════════════════════ -->
    <!-- === PLANTILLAS DE DESCARGA (CAPTURA html2canvas) === -->
    <!-- Estas plantillas se renderizan VISIBLEMENTE aquí abajo con el diseño exacto que se usa para generar PNG/PDF. -->
    <!-- Se ocultan visualmente dentro del card mediante overflow:hidden y position:relative en el contenedor padre. -->
    <!-- Para editarlas manualmente, busca "CAPTURE TEMPLATE START" para cada estilo. -->
    <div
      style="margin-top:32px;padding-top:16px;border-top:2px dashed rgba(249,115,22,0.3);width:100%;background:#0a0401;">
      <div
        style="padding:8px 0;font-size:11px;color:rgba(249,115,22,0.6);font-weight:900;letter-spacing:2px;text-transform:uppercase;font-family:monospace;">
        ⬇ PLANTILLAS DE DESCARGA (lo que se captura para PNG/PDF) ⬇
      </div>

      <!-- === NORMAL CAPTURE TEMPLATE START === -->
      <div :id="`qr-capture-normal-${props.id}`"
        :style="`width:${currentSize.width}px;height:${currentSize.height}px;padding:${currentSize.width * 0.02}px;background:linear-gradient(80deg,#f97316,#fcbd74);font-family:'Google Sans',sans-serif;position:relative;overflow:hidden;box-sizing:border-box;margin-bottom:24px;`">
        <!-- Logo top-right -->
        <div
          :style="`position:absolute;top:${currentSize.width * 0.015}px;right:${currentSize.width * 0.015}px;background:rgba(0,0,0,0.8);border-radius:${currentSize.width * 0.015}px;padding:${currentSize.width * 0.008}px;z-index:5;pointer-events:none;`">
          <img :src="LogoWhite"
            :style="`width:${currentSize.width * logoScale}px;height:auto;opacity:0.9;display:block;`" alt="Ubiqueme" />
        </div>
        <!-- Inner layout: column -->
        <div
          style="display:flex;flex-direction:column;align-items:center;justify-content:center;width:100%;height:100%;gap:4px;">
          <!-- ubiqueme.com top center -->
          <span
            :style="`color:#fff;font-weight:900;letter-spacing:0.15em;text-transform:uppercase;font-size:${currentSize.width * domainTextScale.top}px;text-align:center;`">ubiqueme.com</span>
          <!-- Row: QR + info -->
          <div
            style="display:flex;flex-direction:row;align-items:center;justify-content:center;gap:4px;flex:1;width:100%;">
            <div
              :style="`flex-shrink:0;background:#fff;border-radius:${currentSize.width * 0.025}px;padding:5px;display:flex;align-items:center;justify-content:center;`">
              <template v-if="propsComputed.img">
                <img :src="propsComputed.img"
                  :style="`width:${currentSize.qrSize}px;height:${currentSize.qrSize}px;object-fit:contain;display:block;`" />
              </template>
              <template v-else>
                <img :src="qrHighResUrl"
                  :style="`width:${currentSize.qrSize}px;height:${currentSize.qrSize}px;object-fit:contain;display:block;`" />
              </template>
            </div>

            <div
              style="display:flex;flex-direction:column;gap:6px;flex:1;min-width:0;align-self:center; text-align: center;">
              <p
                :style="`color:#171717;font-size:${currentSize.width * textScale.name}px;font-weight:900;margin:0;line-height:1.1;  `">
                {{ propsComputed.name || 'Código QR' }}
              </p>
              <p
                :style="`color:#303030;font-size:${currentSize.width * textScale.desc}px;font-weight:500;margin:0;line-height:1.2;`">
                Escanee este código QR para contactar al responsable.
              </p>
            </div>
          </div>
          <!-- Domains bottom center -->
          <div
            style="display:flex;flex-direction:row;align-items:center;justify-content:center;gap:2px; padding-bottom: 9px;">
            <span translate="no"
              :style="`color:#fff;font-weight:700;text-transform:uppercase;font-size:${currentSize.width * domainTextScale.bottom}px;letter-spacing:1px;`">localizarme.com</span>
            <span
              :style="`color:rgba(255,255,255,0.5);font-size:${currentSize.width * domainTextScale.bottom}px;`">•</span>
            <span translate="no"
              :style="`color:#fff;font-weight:700;text-transform:uppercase;font-size:${currentSize.width * domainTextScale.bottom}px;letter-spacing:1px;`">contactomio.com</span>
          </div>
        </div>
      </div>
      <!-- === NORMAL CAPTURE TEMPLATE END === -->

      <!-- === COMPACT CAPTURE TEMPLATE START === -->
      <div :id="`qr-capture-compact-${props.id}`" style="position: relative;"
        :style="`width:${currentCompactSize.size}px;height:${currentCompactSize.size}px;padding:2px;background:linear-gradient(125deg,#f97316,#fcbd74);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:0;font-family:'Google Sans',sans-serif;position:relative;margin-bottom:24px;`">
        <article style="
      position: absolute;
      right: 0px;
      top: 50%;
      transform: translateY(-50%) rotate(90deg);
      transform-origin: center;
      white-space: nowrap;
    ">
          <p style="margin:0;">Contactomio.com</p>
        </article>
        <span :style="`color:#fff;font-weight:900;letter-spacing:2px;text-transform:uppercase;font-size:${currentCompactSize.size *
          compactDomainTextScale.top}px;text-align:center;`">ubiqueme.com</span>
        <div style="flex:1;display:flex;align-items:center;justify-content:center;width:100%;">
          <div style="display:flex;align-items:center;justify-content:center;">
            <template v-if="propsComputed.img">
              <img :src="propsComputed.img"
                :style="`width:${currentCompactSize.qrSize}px;height:${currentCompactSize.qrSize}px;object-fit:contain;display:block;`" />
            </template>
            <template v-else>
              <div style="padding: 4px; background: #fff; border-radius: 10px;">
                <img :src="qrHighResUrl"
                  :style="`width:${currentCompactSize.qrSize}px;height:${currentCompactSize.qrSize}px;object-fit:contain;display:block;`" />
              </div>
            </template>
          </div>
        </div>
        <div
          style="display:flex;align-items:center;justify-content:center;gap:4px;padding-bottom:10px; text-align: center;">
          <span
            :style="`color:#fff;font-weight:700;text-transform:uppercase;font-size:${currentCompactSize.size * compactDomainTextScale.bottom}px;letter-spacing:1px;`">Escanee
            este QR para contactar al responsable</span>

        </div>
      </div>
      <!-- === COMPACT CAPTURE TEMPLATE END === -->
    </div>
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

/* Scrollbar delgado para logs */
.scrollbar-thin::-webkit-scrollbar {
  width: 4px;
}

.scrollbar-thin::-webkit-scrollbar-track {
  background: transparent;
}

.scrollbar-thin::-webkit-scrollbar-thumb {
  background: rgba(249, 115, 22, 0.2);
  border-radius: 999px;
}

.scrollbar-thin::-webkit-scrollbar-thumb:hover {
  background: rgba(249, 115, 22, 0.4);
}

/* Ya no se necesita — el wrapper off-screen maneja la ocultación */

@media print {
  body * {
    visibility: hidden !important;
  }

  #qr-print-area,
  #qr-print-area * {
    visibility: visible !important;
  }

  #qr-print-area {
    position: fixed !important;
    top: 50% !important;
    left: 50% !important;
    transform: translate(-50%, -50%) !important;
    width: auto !important;
    height: auto !important;
    max-width: 95vw !important;
    max-height: 95vh !important;
    margin: 0 !important;
    padding: 16px !important;
    background: #0a0401 !important;
    border: none !important;
    box-shadow: none !important;
    border-radius: 24px !important;
  }

  @page {
    margin: 0;
  }
}
</style>
