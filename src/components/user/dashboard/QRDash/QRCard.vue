<script lang="ts" setup>
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'
import QrcodeVue from 'qrcode.vue'
import html2canvas from 'html2canvas'
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
  { label: 'Pedir QR físico', icon: 'local_shipping', description: 'Solicitar su código QR físico con pegamento para colocarlo en sus pertenencias', action: () => emit('request-physical', props.subscriptionId), locked: !isMexicanPhone.value, lockTooltip: 'Solo disponible para números de México (+52)' },
  { label: 'Activar QR', icon: 'public', description: 'Activa el QR para que cualquiera pueda escanearlo.', action: canMakePublic.value ? _setQrPublic : undefined, locked: !canMakePublic.value, lockTooltip: 'Se requiere plan Plata u Oro para activar esta función' },
  { label: 'Desactivar QR', icon: 'visibility_off', description: 'Pausa el QR. Nadie podrá escanearlo', action: canMakePrivate.value ? _setQrPrivate : undefined, locked: !canMakePrivate.value, lockTooltip: 'Se requiere plan Plata u Oro para activar esta función' },
  { divider: true },
  { label: 'Descargar QR', icon: 'download', description: 'Descargar imagen PNG o PDF imprimible con los datos de su código QR.', action: () => openPrompt('download') },
  { divider: true },
  { label: 'Editar nombre', icon: 'edit', description: 'Cambiar el nombre de su QR, tenga en cuenta que el nombre es público, no comparta información sensible.', action: () => openPrompt('edit') },
  { label: 'Reemplazar QR', icon: 'autorenew', description: 'Crea un QR completamente nuevo. El anterior dejará de funcionar permanentemente.', action: () => openPrompt('renew') },
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

// Dynamic QR URL
const qrScanUrl = computed(() => {
  const id = propsComputed.value.id
  const name = propsComputed.value.name || 'Código QR'
  const text = `ID: ${id}\nQR: ${name}\nMensaje: Escaneé su QR *_"${name.trim()}"_* para contactarlo `
  return `https://wa.me/525652094079?text=${encodeURIComponent(text)}`
})

const downloadStyle = ref<'normal' | 'compact'>('normal')
const downloadSize = ref<'sm' | 'md' | 'lg'>('md')
const isDownloading = ref(false)

// ─── html2canvas downloads ───
const handleDownloadPNG = async () => {
  const el = document.getElementById('qr-capture-normal')
  if (!el) return
  isDownloading.value = true
  try {
    const canvas = await html2canvas(el, {
      scale: 4,
      backgroundColor: '#0a0401',
      useCORS: true,
    })
    const link = document.createElement('a')
    link.download = `qr-${propsComputed.value.id}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
    toast.success('QR descargado como PNG')
    closeAll()
  } catch (error) {
    toast.error(`Error al descargar PNG: ${error}`)
  } finally {
    isDownloading.value = false
  }
}

const handleDownloadCompactPNG = async () => {
  const el = document.getElementById('qr-capture-compact')
  if (!el) return
  isDownloading.value = true
  try {
    const canvas = await html2canvas(el, {
      scale: 4,
      backgroundColor: '#ffffff',
      useCORS: true,
    })
    const link = document.createElement('a')
    link.download = `qr-compact-${propsComputed.value.id}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
    toast.success('QR compacto descargado como PNG')
    closeAll()
  } catch (error) {
    toast.error(`Error al descargar QR compacto: ${error}`)
  } finally {
    isDownloading.value = false
  }
}

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
    class="relative w-full bg-[#0a0401] border border-white/10 rounded-[2rem] transition-all duration-500 overflow-hidden font-google-sans group"
    :class="{
      'hover:border-orange-500/40': !isDisabled,
      'opacity-50 grayscale': isDisabled,
      'grayscale-[50%] brightness-75 sepia-[0.3] hue-rotate-[340deg] saturate-[0.5]': isCanceled
    }">

    <!-- Patrón de Fondo Cuadrícula -->
    <div v-if="!isDisabled" class="absolute inset-0 z-0 opacity-[0.04] pointer-events-none"
      style="background-image: linear-gradient(rgba(255, 255, 255, 1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 1) 1px, transparent 1px); background-size: 24px 24px;">
    </div>

    <!-- Resplandor Naranja General Sutil -->
    <div v-if="!isDisabled"
      class="absolute top-0 left-0 w-full h-full z-0 opacity-20 pointer-events-none bg-gradient-to-br from-orange-500/10 via-transparent to-transparent">
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
        class="w-full sm:w-[200px] bg-[#0c0500] border-t sm:border-t-0 sm:border-l border-white/5 flex flex-col items-center justify-center p-6 shrink-0 relative">
        <div
          class="w-34 h-34 sm:w-32 sm:h-32 rounded-3xl flex items-center justify-center bg-[#fff7ed] p-2.5 shadow-lg relative border border-[#f7b05c]">
          <template v-if="propsComputed.img">
            <img :src="propsComputed.img" class="w-full h-full object-cover rounded-xl" />
          </template>
          <template v-else>
            <QrcodeVue :value="qrScanUrl" :size="110" render-as="svg" level="H" />
          </template>
        </div>
        <!-- Menu button (desktop only) -->
        <button data-name="hamMenu" @click="toggleMenu($event)"
          class="hidden sm:flex text-orange-500/90 hover:text-white transition-colors cursor-pointer w-9 h-9 items-center justify-center rounded-xl hover:bg-white/10 active:scale-95 absolute top-4 right-4">
          <span data-name="hamMenu" class="material-symbols-outlined notranslate text-[22px]">more_horiz</span>
        </button>
        <!-- Menu Popover -->
        <Transition enter-active-class="transition-all duration-200 ease-out"
          enter-from-class="opacity-0 -translate-y-2 scale-95" enter-to-class="opacity-100 translate-y-0 scale-100"
          leave-active-class="transition-all duration-200 ease-in"
          leave-from-class="opacity-100 translate-y-0 scale-100" leave-to-class="opacity-0 -translate-y-2 scale-95">
          <div v-if="showMenu"
            class="absolute top-14 right-4 w-[260px] bg-[#0b0808] border border-orange-500/20 rounded-xl p-2 shadow-[0_8px_30px_rgb(249,115,22,0.15)] z-50 max-h-[200px] overflow-y-auto">
            <template v-for="(option, index) in menuOptions" :key="index">
              <div v-if="option.divider" class="h-px bg-orange-500/10 my-1 mx-2"></div>
              <div v-else-if="option.locked" v-tooltip="{ content: option.lockTooltip, placement: 'top' }"
                class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-transparent text-sm text-left font-medium text-white/30 cursor-not-allowed">
                <span class="material-symbols-outlined notranslate text-[18px]">lock</span>
                <span class="flex flex-col">
                  <span>{{ option.label }}</span>
                  <span class="text-[10px] text-white/20 font-normal leading-tight truncate max-w-[180px]">{{
                    option.description }}</span>
                </span>
              </div>
              <button v-else @click="option.action" v-tooltip="{ content: option.description, placement: 'top' }"
                :class="[
                  'w-full flex items-center gap-3 cursor-pointer px-3 py-2.5 rounded-lg bg-transparent text-sm transition-colors text-left font-medium',
                  option.color || 'text-white/70',
                  option.hoverBg || 'hover:bg-orange-500/10 hover:text-orange-400'
                ]">
                <span class="material-symbols-outlined notranslate text-[18px]">{{ option.icon }}</span>
                <span class="flex flex-col">
                  <span>{{ option.label }}</span>
                  <span class="text-[10px] text-white/30 font-normal leading-tight truncate max-w-[180px]">{{
                    option.description }}</span>
                </span>
              </button>
            </template>
          </div>
        </Transition>
      </div>
      <!-- Overlay para cerrar menú -->
      <div v-if="showMenu" @click="showMenu = false" class="fixed inset-0 z-30 cursor-default"></div>
    </div>

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

        <!-- Download Prompt -->
        <Transition enter-active-class="transition-all duration-300 ease-out" enter-from-class="opacity-0 scale-95"
          enter-to-class="opacity-100 scale-100" leave-active-class="transition-all duration-200 ease-in"
          leave-from-class="opacity-100 scale-100" leave-to-class="opacity-0 scale-95">
          <div v-if="activePrompt === 'download'" class="w-full max-w-xs sm:max-w-sm">
            <div class="flex flex-col items-center">
              <h3 class="text-white/90 text-lg font-medium mb-3">Descargar QR</h3>

              <!-- Style selector tabs -->
              <div class="flex w-full gap-1 mb-4 p-1 bg-white/5 rounded-xl">
                <button @click="downloadStyle = 'normal'"
                  class="flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer"
                  :class="downloadStyle === 'normal' ? 'bg-orange-500 text-white' : 'text-white/50 hover:text-white/80'">
                  Normal
                </button>
                <button @click="downloadStyle = 'compact'"
                  class="flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer"
                  :class="downloadStyle === 'compact' ? 'bg-orange-500 text-white' : 'text-white/50 hover:text-white/80'">
                  Compacto
                </button>
              </div>

              <!-- Size selector -->
              <div class="flex w-full gap-2 mb-4">
                <button @click="downloadSize = 'sm'"
                  class="flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg border transition-all cursor-pointer"
                  :class="downloadSize === 'sm' ? 'bg-orange-500/20 border-orange-500 text-orange-400' : 'border-white/10 text-white/50 hover:border-white/30'">
                  SM
                </button>
                <button @click="downloadSize = 'md'"
                  class="flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg border transition-all cursor-pointer"
                  :class="downloadSize === 'md' ? 'bg-orange-500/20 border-orange-500 text-orange-400' : 'border-white/10 text-white/50 hover:border-white/30'">
                  MD
                </button>
                <button @click="downloadSize = 'lg'"
                  class="flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg border transition-all cursor-pointer"
                  :class="downloadSize === 'lg' ? 'bg-orange-500/20 border-orange-500 text-orange-400' : 'border-white/10 text-white/50 hover:border-white/30'">
                  LG
                </button>
              </div>

              <!-- Preview Normal -->
              <div v-if="downloadStyle === 'normal'" class="w-full mb-4">
                <div class="bg-[#0a0401] rounded-xl p-4 border border-white/10">
                  <div class="flex flex-row items-center gap-4">
                    <div class="shrink-0">
                      <template v-if="propsComputed.img">
                        <img :src="propsComputed.img" class="w-24 h-24 object-contain" />
                      </template>
                      <template v-else>
                        <QrcodeVue :value="qrScanUrl" :size="96" render-as="canvas" level="H" />
                      </template>
                    </div>
                    <div class="flex flex-col min-w-0 gap-0.5 flex-1">
                      <p class="text-white font-extrabold leading-tight truncate text-base">
                        {{ propsComputed.name || 'Código QR' }}
                      </p>
                      <p class="text-white font-bold font-mono text-xs">#{{ propsComputed.id }}</p>
                      <div class="w-full h-px bg-white/10 my-0.5"></div>
                      <p class="text-white font-bold leading-tight text-xs">
                        Escanee este código QR para contactar al responsable de forma segura.
                      </p>
                      <div class="flex items-center gap-1">
                        <span class="material-symbols-outlined notranslate text-[#f38020] text-sm">location_on</span>
                        <span class="text-[#f38020] font-black tracking-widest uppercase text-xs">ubiqueme.com</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Preview Compacto -->
              <div v-else class="w-full mb-4 flex justify-center">
                <div class="bg-white rounded-xl p-3 border border-gray-200 w-[180px]">
                  <div class="flex flex-col items-center gap-2">
                    <span class="text-[#f38020] font-black tracking-widest uppercase text-xs">ubiqueme.com</span>
                    <div class="shrink-0">
                      <template v-if="propsComputed.img">
                        <img :src="propsComputed.img" class="w-20 h-20 object-contain" />
                      </template>
                      <template v-else>
                        <QrcodeVue :value="qrScanUrl" :size="80" render-as="canvas" level="H" />
                      </template>
                    </div>
                    <p class="text-[#f38020] font-bold text-center text-[10px]">
                      Escanee QR para contactar al responsable
                    </p>
                  </div>
                </div>
              </div>

              <!-- Print tip -->
              <p class="text-white/40 text-[10px] text-center leading-relaxed mb-4">
                💡 Al imprimir, ajuste la <strong class="text-white/60">escala</strong> en las opciones de impresión
                para evitar que la imagen se agrande o recorte.
              </p>

              <!-- Action Button -->
              <div class="flex w-full gap-2">
                <button @click="downloadStyle === 'normal' ? handleDownloadPNG() : handleDownloadCompactPNG()"
                  :disabled="isDownloading"
                  class="flex-1 py-2.5 bg-[#f38020] text-white rounded-lg font-medium text-sm hover:bg-[#e07010] transition-colors active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5">
                  <span class="material-symbols-outlined notranslate text-[16px]">download</span>
                  {{ isDownloading ? 'Descargando...' : 'Descargar' }}
                </button>
              </div>
              <button @click="closeAll"
                class="mt-3 w-full py-2 bg-white/5 text-white/50 rounded-lg text-xs hover:bg-white/10 hover:text-white/70 transition-colors cursor-pointer">
                Cerrar
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>

    <!-- ─── Templates ocultos para captura con html2canvas ─── -->
    <!-- Normal capture template -->
    <div id="qr-capture-normal" class="capture-template"
      style="width:600px; padding:24px; background:#0a0401; font-family:'Google Sans',sans-serif;">
      <!-- Grid pattern -->
      <div class="absolute inset-0 opacity-[0.04] pointer-events-none"
        style="background-image:linear-gradient(rgba(255,255,255,1)1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1)1px,transparent 1px);background-size:24px 24px;top:0;left:0;right:0;bottom:0;position:absolute;">
      </div>
      <!-- Orange glow -->
      <div
        class="absolute top-0 left-0 w-full h-full pointer-events-none bg-gradient-to-br from-orange-500/10 via-transparent to-transparent">
      </div>
      <div style="display:flex;flex-direction:row;align-items:center;gap:24px;position:relative;z-index:1;">
        <div
          style="background:#fff;border-radius:16px;padding:12px;display:flex;align-items:center;justify-content:center;">
          <template v-if="propsComputed.img">
            <img :src="propsComputed.img" style="width:120px;height:120px;object-fit:contain;" />
          </template>
          <template v-else>
            <QrcodeVue :value="qrScanUrl" :size="120" render-as="canvas" level="H" />
          </template>
        </div>
        <div style="display:flex;flex-direction:column;flex:1;min-width:0;">
          <p
            style="color:#fff;font-size:22px;font-weight:900;margin:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
            {{ propsComputed.name || 'Código QR' }}
          </p>
          <p style="color:#fff;font-size:12px;font-weight:700;font-family:monospace;margin:4px 0 0 0;">
            #{{ propsComputed.id }}
          </p>
          <div style="width:100%;height:1px;background:rgba(255,255,255,0.1);margin:6px 0;"></div>
          <p style="color:#fff;font-size:14px;font-weight:700;margin:0;">
            Escanee este código QR para contactar al responsable de forma segura.
          </p>
          <div style="display:flex;align-items:center;gap:4px;margin-top:2px;">
            <span style="color:#f38020;font-size:16px;">📍</span>
            <span
              style="color:#f38020;font-weight:900;letter-spacing:1px;text-transform:uppercase;font-size:14px;">ubiqueme.com</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Compact capture template -->
    <div id="qr-capture-compact" class="capture-template"
      style="width:280px;padding:16px;background:#fff;border-radius:16px;display:flex;flex-direction:column;align-items:center;gap:8px;font-family:'Google Sans',sans-serif;">
      <span
        style="color:#f38020;font-weight:900;letter-spacing:2px;text-transform:uppercase;font-size:12px;">ubiqueme.com</span>
      <div style="display:flex;align-items:center;justify-content:center;">
        <template v-if="propsComputed.img">
          <img :src="propsComputed.img" style="width:100px;height:100px;object-fit:contain;" />
        </template>
        <template v-else>
          <QrcodeVue :value="qrScanUrl" :size="100" render-as="canvas" level="H" />
        </template>
      </div>
      <p style="color:#f38020;font-weight:700;text-align:center;font-size:10px;margin:0;">
        Escanee QR para contactar al responsable
      </p>
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

/* Ocultar templates de captura */
.capture-template {
  display: none !important;
}

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
