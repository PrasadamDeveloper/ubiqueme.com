<script lang="ts" setup>
import { computed, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import QrcodeVue, { type ImageSettings } from 'qrcode.vue'
import { collection, doc, getDoc, increment, onSnapshot, orderBy, query, Timestamp, writeBatch } from 'firebase/firestore'
import { db } from '@/firebase'
import { useUserStore } from '@/stores/user'
import CloudLoader from '@/components/ui/CloudLoader.vue'
import type { IQRCard, TQRStatus } from '@/interfaces/IQRCard'
import type { IQRLog } from '@/interfaces/IPublicQR'
import type { Unsubscribe } from 'firebase/auth'
import QRCardLog from './QRCardLog.vue'
import DragPositioner from './DragPositioner.vue'
import { toast } from 'vue-sonner'
import { nanoid } from 'nanoid'
import { useQRDownload } from '@/composables/useQRDownload'
import LogoWhite from '@/assets/Ubiqueme_Logo_white.webp'
import LogoUbiqueme from '@/assets/Logo_Ubiqueme_Small.webp'
import SslIcon from '@/assets/drag-images/social-10.webp'

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
const displayName = computed(() => propsComputed.value.name || 'Código QR');

const statusConfig = {
  Active: { bg: 'bg-emerald-50', text: 'text-emerald-600', dot: 'bg-emerald-500', label: 'Activo' },
  Canceled: { bg: 'bg-rose-50', text: 'text-rose-600', dot: 'bg-rose-500', label: 'Cancelado' },
  Process: { bg: 'bg-amber-50', text: 'text-amber-600', dot: 'bg-amber-500', label: 'En Proceso' },
  Error: { bg: 'bg-red-50', text: 'text-red-600', dot: 'bg-red-500', label: 'Error' },
  Paused: { bg: 'bg-slate-100', text: 'text-slate-500', dot: 'bg-slate-400', label: 'Pausado' },
  Inactive: { bg: 'bg-slate-100', text: 'text-slate-500', dot: 'bg-slate-400', label: 'Inactivo' },
}

const isInactive = computed(() => propsComputed.value.status === 'Inactive')
const isCanceled = computed(() => propsComputed.value.status === 'Canceled')
const isSubCanceled = computed(() => propsComputed.value.subscriptionStatus === 'canceled')
const isSubInactive = computed(() => propsComputed.value.subscriptionStatus === 'inactive')
const isDisabled = computed(() => isInactive.value || isCanceled.value || isSubCanceled.value || isSubInactive.value)

const currentStatus = computed(() => {
  if (propsComputed.value.isBanned) {
    return {
      bg: 'bg-red-50',
      text: 'text-red-600',
      dot: 'bg-red-500',
      label: 'Baneado'
    }
  }
  if (propsComputed.value.planType === 'bronce' && !qrStatusLoaded.value && propsComputed.value.status === 'Active') {
    return {
      bg: 'bg-slate-100',
      text: 'text-slate-500',
      dot: 'bg-slate-400',
      label: 'Sin publicar'
    }
  }
  return statusConfig[propsComputed.value.status] || {
    bg: 'bg-slate-100',
    text: 'text-slate-600',
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

const isEditor = computed(() => userStore.getRole === 'admin' || userStore.getEmail === 'ubiqueme.services@gmail.com')

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
    if (isNew) {
      publicQRData.createdAt = Timestamp.now();
    }

    const qrDoc = doc(db, `users/${userStore.getUserId}/qrs/${props.id}`)
    batch.update(qrDoc, {
      status: 'Active',
    })

    if (isNew) {
      batch.set(publicQrRef, publicQRData);
    } else {
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
      return;
    }
    qrStatusLoaded.value = true;
    qrStatus.totalScans = docSnapshot.data().totalScans ?? 0;
    qrStatus.lastScan = docSnapshot.data().lastScan ?? 'No se ha escaneado aún';

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

    const oldUserQRDoc = doc(db, `users/${userStore.getUserId}/qrs/${props.id}`);
    batch.update(oldUserQRDoc, { status: 'Inactive', isActive: false });

    const oldPublicDoc = doc(db, 'publicQR', props.id);
    const oldPublicSnap = await getDoc(oldPublicDoc);
    if (oldPublicSnap.exists()) {
      batch.update(oldPublicDoc, { status: 'Inactive' });
    }

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
const canMakePrivate = computed(() => qrStatusLoaded.value || canMakePublic.value)

const showDrag = ref(false)

const openDrag = () => {
  showMenu.value = false
  showDrag.value = true
}

const menuOptions = computed(() => {
  if (isEditor.value) {
    return [
      { label: 'Personalizar posición', icon: 'open_with', description: 'Arrastre cada elemento del QR para reposicionarlo a su gusto.', action: openDrag },
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
        hoverBg: 'hover:bg-rose-50'
      },
    ]
  }
  return [
    { label: 'Descargar QR', icon: 'download', description: 'Selecciona tamaño y formato para descargar', action: openDrag },
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
      hoverBg: 'hover:bg-rose-50'
    },
  ]
})

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
  currentPreset,
  currentCompactPreset,
  getDownloadLabel,
  generateHighResQR,
  handleDownload,
} = downloadComposable

const desktopTemplateRef = ref<HTMLElement | null>(null)
const mobileTemplateRef = ref<HTMLElement | null>(null)

const templateRef = computed(() => {
  if (typeof window !== 'undefined' && window.innerWidth >= 640) return desktopTemplateRef.value
  return mobileTemplateRef.value
})

const onDownload = () => handleDownload(templateRef.value, closeAll)

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

const imageSettings = computed<ImageSettings>(() => {
  const logoSize = Math.round(currentPreset.value.qr.size * 1.3)
  return {
    src: LogoUbiqueme,
    excavate: true,
    height: logoSize,
    width: logoSize,
  }
})

const imageSettingsUIOnly: ImageSettings = {
  src: LogoUbiqueme,
  excavate: true,
  height: 55,
  width: 55,
}
</script>

<template>
  <div
    class="relative w-full bg-white border border-slate-200 rounded-[2rem] transition-all duration-500 font-google-sans group"
    :class="{
      'hover:border-orange-300': !isDisabled,
      'opacity-50 grayscale': isDisabled,
      'grayscale-[50%] brightness-75 sepia-[0.3] hue-rotate-[340deg] saturate-[0.5]': isCanceled
    }">

    <div class="absolute inset-0 z-0 overflow-hidden rounded-[2rem] pointer-events-none">
      <div v-if="!isDisabled" class="absolute inset-0 opacity-[0.04]"
        style="background-image: linear-gradient(rgba(0, 0, 0, 0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 0, 0, 0.04) 1px, transparent 1px); background-size: 24px 24px;">
      </div>
      <div v-if="!isDisabled"
        class="absolute top-0 left-0 w-full h-full opacity-20 bg-gradient-to-br from-orange-500/10 via-transparent to-transparent">
      </div>
    </div>

    <section v-if="isLoading" class="absolute inset-0 bg-white/90 flex items-center justify-center z-50">
      <CloudLoader></CloudLoader>
    </section>

    <div v-if="isDisabled"
      class="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-white/90  rounded-[2rem] cursor-default select-none">
      <span class="material-symbols-outlined notranslate text-5xl text-slate-300">block</span>
      <span class="text-slate-700 text-sm font-medium">QR {{ isCanceled ? 'cancelado' : 'inactivo' }} — no
        disponible</span>
    </div>

    <!-- ===== LAYOUT: Info Left + QR Right ===== -->
    <div class="relative z-10 flex flex-col sm:flex-row">

      <!-- ─── Columna Izquierda: Info + Stats + Logs ─── -->
      <div class="flex-1 flex flex-col min-w-0 p-6 md:p-7 lg:p-8">

        <div class="flex items-start justify-between gap-3 mb-4">
          <div class="flex items-center gap-3 min-w-0">
            <span class="material-symbols-outlined notranslate text-orange-500 text-xl shrink-0">location_on</span>
            <span class="text-slate-900 font-black tracking-widest text-xs uppercase whitespace-nowrap">ubiqueme.com</span>
            <span
              class="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-slate-700 shadow-sm"
              :class="[currentStatus.bg, 'border border-slate-200']">
              <span :class="['w-1.5 h-1.5 rounded-full', currentStatus.dot]"></span>
              {{ currentStatus.label }}
            </span>
          </div>
          <button data-name="hamMenu" @click="toggleMenu($event)"
            class="sm:hidden text-orange-500 hover:text-slate-900 transition-colors cursor-pointer w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-100 active:scale-95 shrink-0">
            <span data-name="hamMenu" class="material-symbols-outlined notranslate text-[24px]">more_horiz</span>
          </button>
        </div>

        <h3 class="text-2xl sm:text-3xl font-black text-slate-900 leading-tight mb-2 tracking-tighter truncate">
          {{ propsComputed.name || 'Código QR' }}
        </h3>
        <div class="flex items-center gap-2 mb-4">
          <span class="text-slate-400 text-[10px] tracking-[0.2em] font-black font-mono">
            #{{ propsComputed.id }}
          </span>
        </div>

        <div class="flex items-center gap-4 mb-5">
          <div class="flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5">
            <div class="w-9 h-9 rounded-lg bg-orange-50 flex items-center justify-center">
              <span class="material-symbols-outlined notranslate text-orange-500 text-lg">qr_code_scanner</span>
            </div>
            <div class="flex flex-col">
              <span class="text-slate-400 text-[9px] uppercase tracking-[0.15em] font-black">Escaneos</span>
              <span class="text-orange-500 font-mono text-lg font-bold leading-tight">{{ qrStatus.totalScans }}</span>
            </div>
          </div>
          <div class="flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 sm:hidden">
            <div :class="['w-9 h-9 rounded-lg flex items-center justify-center', currentStatus.bg]">
              <span :class="['w-2 h-2 rounded-full', currentStatus.dot]"></span>
            </div>
            <div class="flex flex-col">
              <span class="text-slate-400 text-[9px] uppercase tracking-[0.15em] font-black">Estado</span>
              <span class="text-slate-700 font-semibold text-sm leading-tight">{{ currentStatus.label }}</span>
            </div>
          </div>
        </div>

        <p class="text-slate-400 text-sm leading-relaxed mb-5 max-w-[480px]">
          Este es el código QR de <strong class="text-slate-700">{{ propsComputed.name || 'este QR' }}</strong>.
          Cuando alguien lo escanee, Ubiqueme le enviará una notificación por WhatsApp.
          <strong class="text-slate-400">La persona que escanee el QR no podrá ver su número de teléfono.</strong>
          Su número permanecerá privado hasta que usted decida responderle con un mensaje.
        </p>

        <div class="border-t border-slate-200 mb-4"></div>

        <small class="text-slate-400 font-poppins text-center text-xs my-1.5">Aquí podrá ver los números que han
          escaneado su QR</small>
        <div class="min-h-0 w-full">
          <button v-if="!logsLoaded && !showLogs" @click="loadLogs"
            class="text-sm w-full text-center justify-center text-orange-500 hover:text-orange-300 transition-colors flex items-center gap-2 cursor-pointer group border border-orange-200 rounded-xl px-3 py-2 mb-3 hover:bg-orange-50">
            <span
              class="material-symbols-outlined notranslate text-lg group-hover:scale-110 transition-transform">history</span>
            <span class="font-semibold text-slate-800">Ver registros de escaneo</span>
            <span v-if="isLogsLoading"
              class="material-symbols-outlined notranslate text-sm animate-spin ml-1">progress_activity</span>
          </button>
          <button v-if="logsLoaded && showLogs" @click="hiddeLogsHandle"
            class="text-sm text-orange-600 hover:text-orange-500 transition-colors flex items-center gap-2 cursor-pointer group border border-dashed border-orange-200 rounded-xl px-3 py-2 mb-3 hover:bg-orange-50">
            <span
              class="material-symbols-outlined notranslate text-lg group-hover:scale-110 transition-transform">hide_source</span>
            <span class="font-semibold">Ocultar registros</span>
            <span v-if="isLogsLoading"
              class="material-symbols-outlined notranslate text-sm animate-spin ml-1">progress_activity</span>
          </button>
          <div v-if="logsLoaded && isLogsLoading" class="flex items-center gap-2 text-sm text-slate-400 py-3">
            <span class="w-4 h-4 border border-orange-400/40 border-t-transparent rounded-full animate-spin"></span>
            Cargando registros...
          </div>
          <div v-if="logsLoaded && !isLogsLoading"
            class="space-y-2 lg:max-h-72 max-h-96 overflow-y-auto pr-1 scrollbar-thin">
            <div v-if="qrLogs.length === 0" class="text-slate-300 text-sm py-4 text-center">
              <span class="material-symbols-outlined notranslate text-2xl block mb-2">history_off</span>
              Sin registros de escaneo aún
            </div>
            <QRCardLog v-for="log in qrLogs" :key="log.id" v-bind="log" />
          </div>
        </div>
      </div>

      <!-- ─── Columna Derecha: QR Code ─── -->
      <div
        class="w-full sm:w-[260px] lg:w-[300px] bg-orange-50 border-t sm:border-t-0 sm:border-l md:rounded-r-4xl border-slate-100 flex flex-col items-center justify-center p-6 lg:p-8 shrink-0 relative">
        <div
          class="w-40 h-40 sm:w-36 sm:h-36 lg:w-44 lg:h-44 rounded-3xl flex items-center justify-center bg-[#fff7ed] p-3 shadow-lg relative border border-orange-300">
          <template v-if="propsComputed.img">
            <img :src="propsComputed.img" class="w-full h-full object-cover rounded-xl" />
          </template>
          <template v-else>
            <QrcodeVue :value="qrScanUrl" :size="140" render-as="svg" level="H" :image-settings="imageSettingsUIOnly" />
          </template>
        </div>
        <button @click="isEditor ? openPrompt('download') : openDrag()"
          class="mt-4 w-full max-w-[180px] flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl text-sm font-bold uppercase tracking-wider transition-all cursor-pointer active:scale-[0.97] shadow-md shadow-orange-500/10 border border-orange-300">
          <span class="material-symbols-outlined notranslate text-lg">download</span>
          Descargar QR
        </button>
        <button data-name="hamMenu" @click="toggleMenu($event)"
          class="hidden sm:flex text-orange-500 hover:text-slate-900 transition-colors cursor-pointer px-4 py-2 items-center justify-center gap-2 rounded-xl bg-slate-50 hover:bg-orange-50 active:scale-95 absolute top-5 right-5 border border-slate-200 hover:border-orange-300 text-xs font-bold uppercase tracking-wider">
          <span data-name="hamMenu" class="material-symbols-outlined notranslate text-lg">more_horiz</span>
          Opciones
        </button>
      </div>
      <!-- Desktop Full-Card Menu Overlay -->
      <Transition enter-active-class="transition-all duration-300 ease-out" enter-from-class="opacity-0 scale-95"
        enter-to-class="opacity-100 scale-100" leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="opacity-100 scale-100" leave-to-class="opacity-0 scale-95">
        <div v-if="showMenu"
          class="hidden sm:flex absolute inset-0 z-40 bg-white/90 rounded-[2rem] p-6 md:p-8 flex-col">
          <button @click="showMenu = false"
            class="flex items-center gap-2 text-slate-500 hover:text-orange-500 transition-colors cursor-pointer w-fit mb-6 group">
            <span
              class="material-symbols-outlined notranslate text-2xl group-hover:-translate-x-1 transition-transform">arrow_back</span>
            <span class="text-sm font-bold uppercase tracking-wider">Volver</span>
          </button>
          <h3 class="text-xl font-black text-slate-900 mb-6">Opciones del QR</h3>
          <div class="grid grid-cols-2 gap-3 flex-1 content-start overflow-y-auto pr-2">
            <template v-for="(option, index) in menuOptions.filter(o => !o.divider)" :key="index">
              <div v-if="option.locked" v-tooltip="{ content: option.lockTooltip, placement: 'top' }"
                class="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 text-left cursor-not-allowed opacity-40">
                <span class="material-symbols-outlined notranslate text-xl text-slate-400 mt-0.5">lock</span>
                <div class="flex flex-col min-w-0">
                  <p class="text-sm font-semibold text-slate-400">{{ option.label }}</p>
                  <p class="text-[11px] text-slate-300 leading-relaxed mt-1">{{ option.lockTooltip }}</p>
                </div>
              </div>
              <button v-else @click="option.action" :class="[
                'flex items-start gap-3 p-3 rounded-xl border text-left transition-all cursor-pointer active:scale-[0.98]',
                option.color ? `${option.color} border-slate-100 hover:border-rose-300 hover:bg-rose-50` : 'text-slate-900 border-slate-100 hover:border-orange-300 hover:bg-orange-50'
              ]">
                <span
                  :class="[option.color ? 'text-rose-400' : 'text-orange-500', 'material-symbols-outlined notranslate text-xl mt-0.5']">{{
                  option.icon }}</span>
                <div class="flex flex-col min-w-0">
                  <p class="text-sm font-semibold leading-tight">{{ option.label }}</p>
                  <p class="text-[11px] text-slate-500 leading-relaxed mt-1">{{ option.description }}</p>
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
        <div v-if="showMenu" @click="showMenu = false" class="sm:hidden fixed inset-0 bg-gray-900/60 z-40 cursor-default">
        </div>
      </Transition>
      <Transition enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="opacity-0 translate-y-full" enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition-all duration-200 ease-in" leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 translate-y-full">
        <div v-if="showMenu"
          class="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-orange-500/20 rounded-t-2xl p-1 pb-2 max-h-[85vh] overflow-y-auto shadow-[0_-2px_12px_rgba(0,0,0,0.06)]">
          <div class="w-9 h-1 bg-slate-300 rounded-full mx-auto my-3"></div>
          <div class="flex items-center justify-center mb-2 relative ml-2">
            <button @click="showMenu = false"
              class="absolute left-0 w-8 h-8 flex items-center justify-center text-slate-500 hover:text-slate-900 transition-colors cursor-pointer rounded-lg hover:bg-slate-100">
              <span class="material-symbols-outlined notranslate text-[22px]">arrow_back</span>
              Atrás
            </button>
            <span class="text-slate-500 text-[10px] font-bold uppercase tracking-widest text-center">Opciones del
              QR</span>
          </div>
          <div class="space-y-1">
            <template v-for="(option, index) in menuOptions" :key="index">
              <div v-if="option.divider" class="h-px bg-slate-100 my-2 mx-4"></div>
              <div v-else-if="option.locked"
                class="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl bg-transparent text-sm text-left font-medium text-slate-400 cursor-not-allowed opacity-60">
                <span class="material-symbols-outlined notranslate text-[22px]">lock</span>
                <div class="flex flex-col">
                  <span class="text-sm font-medium">{{ option.label }}</span>
                  <span class="text-[11px] text-slate-300 font-normal leading-tight">{{ option.lockTooltip }}</span>
                </div>
              </div>
              <button v-else @click="option.action" :class="[
                'w-full flex items-center gap-4 cursor-pointer px-4 py-3 rounded-xl bg-transparent text-sm transition-colors text-left font-medium active:scale-[0.98]',
                option.color || 'text-slate-800', option.hoverBg || 'hover:bg-slate-100 active:bg-slate-100'
              ]">
                <span
                  :class="[option.color || 'text-orange-500', 'material-symbols-outlined notranslate text-[22px]']">{{
                  option.icon }}</span>
                <div class="flex flex-col">
                  <span>{{ option.label }}</span>
                  <span class="text-[10px] text-slate-400 font-normal leading-tight">{{ option.description }}</span>
                </div>
              </button>
            </template>
          </div>
          <button @click="showMenu = false"
            class="w-full mt-3 py-3 bg-slate-100 text-slate-500 rounded-xl text-sm font-medium hover:bg-slate-100 hover:text-slate-800 transition-colors cursor-pointer active:scale-[0.98]">
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
        class="fixed inset-0 bg-white/90 z-[100] p-6 flex flex-col justify-center items-center">
        <button @click="closeAll"
          class="absolute top-4 right-4 w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-200 hover:text-slate-900 transition-all cursor-pointer">
          <span class="material-symbols-outlined notranslate text-[18px]">close</span>
        </button>

        <!-- Cancel Prompt -->
        <Transition enter-active-class="transition-all duration-300 ease-out" enter-from-class="opacity-0 scale-95"
          enter-to-class="opacity-100 scale-100" leave-active-class="transition-all duration-200 ease-in"
          leave-from-class="opacity-100 scale-100" leave-to-class="opacity-0 scale-95">
          <div v-if="activePrompt === 'cancel'" class="w-full text-center max-w-sm">
            <div class="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center mx-auto mb-4">
              <span class="material-symbols-outlined notranslate text-rose-500 text-[24px]">warning</span>
            </div>
            <h3 class="text-slate-900 text-lg font-medium mb-1.5">¿Desactivar código?</h3>
            <p class="text-slate-500 text-sm leading-relaxed mb-6 px-4">Esta acción desactivará el código inmediatamente.
            </p>
            <div class="flex gap-3 w-full">
              <button @click="closeAll"
                class="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-lg font-medium text-sm hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer">Cancelar</button>
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
            <div class="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center mx-auto mb-4">
              <span class="material-symbols-outlined notranslate text-rose-500 text-[24px]">warning</span>
            </div>
            <h3 class="text-slate-900 text-lg font-medium mb-1.5">¿Reemplazar código QR?</h3>
            <div class="space-y-2 text-left px-4 mb-6">
              <p class="text-slate-500 text-sm leading-relaxed">Al reemplazar este QR <strong class="text-slate-700">se
                  creará
                  uno nuevo con un ID diferente</strong>.</p>
              <ul class="text-slate-500 text-xs space-y-1.5 list-disc pl-4">
                <li>El <strong class="text-rose-400">código anterior dejará de funcionar permanentemente</strong></li>
                <li>Los <strong class="text-rose-400">QR físicos (stickers) actuales quedarán inservibles</strong></li>
                <li>Deberá solicitar un nuevo QR físico si lo desea</li>
                <li>El historial de escaneos anteriores se conservará</li>
                <li class="text-slate-700 font-medium">Esta acción no se puede deshacer</li>
              </ul>
            </div>
            <div class="flex gap-3 w-full">
              <button @click="closeAll"
                class="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-lg font-medium text-sm hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer">Cancelar</button>
              <button @click="handleRenewQR"
                class="flex-1 py-2.5 bg-rose-500 text-white rounded-lg font-medium text-sm hover:bg-rose-600 transition-colors active:scale-[0.98] cursor-pointer flex items-center justify-center gap-1.5">
                <span class="material-symbols-outlined notranslate text-[16px]">autorenew</span> Reemplazar
              </button>
            </div>
          </div>
        </Transition>

        <!-- Edit Name Prompt -->
        <Transition enter-active-class="transition-all duration-300 ease-out" enter-from-class="opacity-0 scale-95"
          enter-to-class="opacity-100 scale-100" leave-active-class="transition-all duration-200 ease-in"
          leave-from-class="opacity-100 scale-100" leave-to-class="opacity-0 scale-95">
          <div v-if="activePrompt === 'edit'" class="w-full max-w-sm">
            <h3 class="text-slate-900 text-lg font-medium mb-4 text-center">Editar nombre</h3>
            <div class="mb-6">
              <input @keyup.enter="handleEdit" type="text" v-model="qrName" placeholder="Nuevo nombre"
                class="w-full bg-white border border-slate-200 rounded-lg px-4 py-3 text-slate-900 text-sm transition-all focus:outline-none focus:border-orange-500 placeholder:text-slate-400" />
            </div>
            <div class="flex gap-3 w-full">
              <button @click="closeAll"
                class="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-lg font-medium text-sm hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer">Cancelar</button>
              <button @click="handleEdit"
                class="flex-1 py-2.5 bg-white text-black rounded-lg font-medium text-sm hover:bg-white/90 transition-colors active:scale-[0.98] cursor-pointer">Guardar</button>
            </div>
          </div>
        </Transition>

        <!-- Download Prompt - Desktop version -->
        <Transition enter-active-class="transition-all duration-300 ease-out" enter-from-class="opacity-0 scale-95"
          enter-to-class="opacity-100 scale-100" leave-active-class="transition-all duration-200 ease-in"
          leave-from-class="opacity-100 scale-100" leave-to-class="opacity-0 scale-95">
          <div v-if="activePrompt === 'download'" class="hidden sm:flex w-full max-w-lg flex-col items-center">
            <div class="flex items-center justify-between w-full mb-5">
              <h3 class="text-slate-900 font-black text-lg tracking-tight">Descargar QR</h3>
              <button @click="closeAll"
                class="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-200 transition-all cursor-pointer">
                <span class="material-symbols-outlined notranslate text-[18px]">close</span>
              </button>
            </div>
            <div class="w-full mb-4">
              <label class="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 mb-2 block">Formato de
                descarga</label>
              <div class="grid grid-cols-2 gap-3">
                <button @click="downloadFormat = 'png'"
                  class="flex flex-col items-start gap-1.5 p-3 rounded-xl border text-left transition-all cursor-pointer active:scale-[0.97]"
                  :class="downloadFormat === 'png' ? 'bg-orange-50 border-orange-300 shadow-[0_0_8px_rgba(249,115,22,0.08)]' : 'bg-slate-50 border-slate-200 hover:border-white/20 hover:bg-slate-50'">
                  <div class="flex items-center gap-2 w-full">
                    <span :class="downloadFormat === 'png' ? 'text-orange-500' : 'text-slate-400'"
                      class="material-symbols-outlined notranslate text-[20px]">image</span>
                    <span :class="downloadFormat === 'png' ? 'text-orange-300' : 'text-slate-700'"
                      class="text-sm font-bold">PNG</span>
                  </div>
                  <p :class="downloadFormat === 'png' ? 'text-slate-500' : 'text-slate-400'"
                    class="text-[10px] leading-tight">Imagen digital</p>
                </button>
                <button @click="downloadFormat = 'pdf'"
                  class="flex flex-col items-start gap-1.5 p-3 rounded-xl border text-left transition-all cursor-pointer active:scale-[0.97]"
                  :class="downloadFormat === 'pdf' ? 'bg-orange-50 border-orange-300 shadow-[0_0_8px_rgba(249,115,22,0.08)]' : 'bg-slate-50 border-slate-200 hover:border-white/20 hover:bg-slate-50'">
                  <div class="flex items-center gap-2 w-full">
                    <span :class="downloadFormat === 'pdf' ? 'text-orange-500' : 'text-slate-400'"
                      class="material-symbols-outlined notranslate text-[20px]">picture_as_pdf</span>
                    <span :class="downloadFormat === 'pdf' ? 'text-orange-300' : 'text-slate-700'"
                      class="text-sm font-bold">PDF</span>
                  </div>
                  <p :class="downloadFormat === 'pdf' ? 'text-slate-500' : 'text-slate-400'"
                    class="text-[10px] leading-tight">Documento imprimible a escala real</p>
                </button>
              </div>
            </div>
            <div class="w-full mb-4">
              <label
                class="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 mb-2 block">Personalizar</label>
              <div class="flex flex-col gap-2">
                <div class="flex items-center gap-3">
                  <span class="text-[9px] font-bold uppercase tracking-wider text-slate-400 w-12 shrink-0">Estilo</span>
                  <div class="flex gap-1 p-0.5 bg-slate-100 rounded-xl flex-1">
                    <button @click="downloadStyle = 'normal'"
                      class="flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer"
                      :class="downloadStyle === 'normal' ? 'bg-orange-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'">Normal</button>
                    <button @click="downloadStyle = 'compact'"
                      class="flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer"
                      :class="downloadStyle === 'compact' ? 'bg-orange-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'">Compacto</button>
                  </div>
                </div>
                <div class="flex items-center gap-3">
                  <span class="text-[9px] font-bold uppercase tracking-wider text-slate-400 w-12 shrink-0">Tamaño</span>
                  <div class="flex gap-1 p-0.5 bg-slate-100 rounded-xl">
                    <button @click="downloadSize = 'sm'"
                      class="px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer"
                      :class="downloadSize === 'sm' ? 'bg-orange-500/20 border border-orange-300 text-orange-500' : 'text-slate-500 hover:text-slate-800'">SM</button>
                    <button @click="downloadSize = 'md'"
                      class="px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer"
                      :class="downloadSize === 'md' ? 'bg-orange-500/20 border border-orange-300 text-orange-500' : 'text-slate-500 hover:text-slate-800'">MD</button>
                    <button @click="downloadSize = 'lg'"
                      class="px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer"
                      :class="downloadSize === 'lg' ? 'bg-orange-500/20 border border-orange-300 text-orange-500' : 'text-slate-500 hover:text-slate-800'">LG</button>
                  </div>
                </div>
              </div>
            </div>
            <div class="mb-4 w-full">
              <label class="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 mb-2 block">Vista
                previa
                <span class="text-slate-300 font-mono font-normal normal-case ml-1">({{
                  downloadStyle === 'normal' ? currentPreset.width : currentCompactPreset.size }}×{{
                  downloadStyle === 'normal' ? currentPreset.height : currentCompactPreset.size }}px)</span>
              </label>
              <div
                class="w-full rounded-2xl bg-gradient-to-br from-[#f97316] to-[#fed7aa] border border-orange-300 relative overflow-hidden">
                <div class="absolute inset-0 opacity-[0.03] pointer-events-none"
                  style="background-image:linear-gradient(rgba(255,255,255,1)1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1)1px,transparent 1px);background-size:20px 20px;">
                </div>
                <div class="relative overflow-auto max-h-[280px] p-1">
                  <!-- NORMAL template — single source of truth for preview + capture -->
                  <template v-if="downloadStyle === 'normal'">
                    <div ref="desktopTemplateRef"
                        :style="`width:${currentPreset.width}px;height:${currentPreset.height}px;padding:${currentPreset.spacing.outerPadding}px;font-family:'Google Sans',sans-serif;display:flex;flex-direction:column;gap:${currentPreset.spacing.mainGap}px`"
                      class="relative overflow-hidden">
                      <!-- HEADER -->
                      <div class="flex items-center justify-between shrink-0"
                        :style="{ gap: currentPreset.spacing.headerGap + 'px' }">
                        <div class="flex items-center"
  :style="{ gap: currentPreset.spacing.headerGap + 'px' }">
                                                    <img :src="SslIcon"
                            :style="{ width: currentPreset.sslIcon.w + 'px', height: currentPreset.sslIcon.h + 'px' }"
                            class="object-contain" />
                          <span :style="{ fontSize: currentPreset.fonts.topDomain + 'px' }"
                            class="text-black font-black tracking-widest uppercase leading-none">HTTPS://</span>
                          <span :style="{ fontSize: currentPreset.fonts.topDomain + 'px' }"
                            class="text-white font-black tracking-widest uppercase leading-none">ubiqueme.com</span>
                        </div>
                        <div :style="{
                          padding: currentPreset.logo.containerPadding + 'px',
                          borderRadius: currentPreset.logo.containerRadius + 'px',
                        }" class="bg-black/80 flex items-center justify-center shrink-0">
                          <img :src="LogoWhite" :style="{ width: currentPreset.logo.size + 'px' }"
                            class="h-auto opacity-90 block" />
                        </div>
                      </div>
                      <!-- CONTENT: QR + Info -->
                      <div class="flex items-start flex-1 min-h-0"
                        :style="{ gap: currentPreset.spacing.contentGap + 'px' }">
                        <div :style="{
                          width: (currentPreset.qr.size + currentPreset.qr.containerPadding * 2) + 'px',
                          height: (currentPreset.qr.size + currentPreset.qr.containerPadding * 2) + 'px',
                          borderRadius: currentPreset.qr.containerRadius + 'px',
                          padding: currentPreset.qr.containerPadding + 'px',
                        }" class="shrink-0 self-start bg-white flex items-center justify-center overflow-hidden">
                          <template v-if="propsComputed.img">
                            <img :src="propsComputed.img"
                              :style="{ width: currentPreset.qr.size + 'px', height: currentPreset.qr.size + 'px' }"
                              class="object-contain" />
                          </template>
                          <template v-else>
                            <QrcodeVue :value="qrScanUrl" :size="currentPreset.qr.size * 4" render-as="canvas"
                              level="H" :image-settings="imageSettings"
                              :style="{ width: currentPreset.qr.size + 'px', height: currentPreset.qr.size + 'px', maxWidth: '100%', maxHeight: '100%' }" />
                          </template>
                        </div>
                         <div class="flex flex-col flex-1 min-w-0 text-center overflow-hidden self-stretch"
                           :style="{ gap: currentPreset.spacing.textGap + 'px' }">
                           <p :style="{ fontSize: currentPreset.fonts.name + 'px' }"
                            class="text-[#171717] font-black leading-tight m-0 truncate">
                            {{ displayName }}
                          </p>
                          <p :style="{ fontSize: currentPreset.fonts.desc + 'px' }"
                            class="text-[#303030] font-medium leading-tight m-0 line-clamp-2 max-w-[75%] self-center">
                            Escanee este código QR para contactar al responsable.
                          </p>
                          <p :style="{ fontSize: currentPreset.fonts.footerNote + 'px' }"
                            class="text-black font-medium leading-tight m-0 shrink-0">
                            QR oficial de Ubiqueme.com® — Marca 100% segura y verificada.
                          </p>
                        </div>
                      </div>
                      <!-- FOOTER -->
                      <div class="flex flex-col shrink-0 items-center justify-center"
                        :style="{ gap: currentPreset.spacing.footerGap + 'px' }">
                        <span :style="{ fontSize: currentPreset.fonts.footerEmail + 'px' }"
                          class="text-white font-bold tracking-wider">soporte@ubiqueme.com</span>
                        <div class="flex items-center justify-center"
                          :style="{ gap: currentPreset.spacing.footerGap + 'px' }">
                          <span :style="{ fontSize: currentPreset.fonts.footerDomain + 'px' }"
                            class="text-white font-bold uppercase tracking-wider" translate="no">localizarme.com</span>
                          <span :style="{ fontSize: currentPreset.fonts.footerDomain + 'px' }"
                            class="text-white/50">•</span>
                          <span :style="{ fontSize: currentPreset.fonts.footerDomain + 'px' }"
                            class="text-white font-bold uppercase tracking-wider" translate="no">contactomio.com</span>
                        </div>
                      </div>
                    </div>
                  </template>
                  <!-- COMPACT template -->
                  <template v-else>
                    <div ref="desktopTemplateRef"
                      :style="`width:${currentCompactPreset.size}px;height:${currentCompactPreset.size}px;padding:${currentCompactPreset.spacing.padding}px;background:linear-gradient(125deg,#f97316,#fcbd74);font-family:'Google Sans',sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:${currentCompactPreset.spacing.gap}px`"
                      class="relative overflow-hidden">
                      <span :style="{ fontSize: currentCompactPreset.fonts.top + 'px' }"
                        class="text-white font-black tracking-widest uppercase text-center">ubiqueme.com</span>
                      <div class="flex items-center justify-center flex-1 w-full min-h-0"
                        :style="{ gap: currentCompactPreset.spacing.gap + 'px' }">
                        <span :style="{
                          fontSize: currentCompactPreset.fonts.side + 'px',
                          writingMode: 'vertical-rl',
                        }" class="text-white font-bold uppercase tracking-wider shrink-0"
                          translate="no">contactomio.com</span>
                        <div :style="{
                          width: (currentCompactPreset.qr.size + currentCompactPreset.qr.containerPadding * 2) + 'px',
                          height: (currentCompactPreset.qr.size + currentCompactPreset.qr.containerPadding * 2) + 'px',
                          padding: currentCompactPreset.qr.containerPadding + 'px',
                        }" class="shrink-0 bg-white rounded-lg flex items-center justify-center overflow-hidden">
                          <template v-if="propsComputed.img">
                            <img :src="propsComputed.img"
                              :style="{ width: currentCompactPreset.qr.size + 'px', height: currentCompactPreset.qr.size + 'px' }"
                              class="object-contain" />
                          </template>
                          <template v-else>
                            <img :src="qrHighResUrl"
                              :style="{ width: currentCompactPreset.qr.size + 'px', height: currentCompactPreset.qr.size + 'px' }"
                              class="object-contain" />
                          </template>
                        </div>
                        <span :style="{
                          fontSize: currentCompactPreset.fonts.side + 'px',
                          writingMode: 'vertical-rl',
                        }" class="text-white font-bold uppercase tracking-wider shrink-0"
                          translate="no">localizarme.com</span>
                      </div>
                      <span :style="{ fontSize: currentCompactPreset.fonts.bottom + 'px' }"
                        class="text-white font-semibold text-center">Escanee este QR para contactar al
                        responsable</span>
                    </div>
                  </template>
                </div>
              </div>
            </div>
            <p class="text-slate-400 text-[9px] text-center leading-relaxed mb-4">
              <template v-if="downloadFormat === 'pdf'">El PDF respeta el tamaño físico exacto al imprimir. No requiere
                ajuste de escala.</template>
              <template v-else>Al imprimir, ajuste la <strong class="text-slate-500">escala al 100%</strong> en opciones
                de impresión.</template>
            </p>
            <button @click="onDownload" :disabled="isDownloading"
              class="w-full py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-bold text-sm hover:brightness-110 transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md shadow-orange-500/10">
              <span class="material-symbols-outlined notranslate text-[18px]">download</span>
              Descargar como {{ downloadFormat === 'pdf' ? 'PDF' : 'PNG' }}
              <span class="text-slate-500 text-[10px] font-normal">({{ downloadSize === 'sm' ? 'Pequeño' : downloadSize
                === 'md' ?
                'Mediano' : 'Grande' }})</span>
            </button>
          </div>
        </Transition>

        <!-- Mobile Download Bottom Sheet -->
        <Teleport to="body">
          <Transition enter-active-class="transition-all duration-300 ease-out" enter-from-class="opacity-0"
            enter-to-class="opacity-100" leave-active-class="transition-all duration-200 ease-in"
            leave-from-class="opacity-100" leave-to-class="opacity-0">
            <div v-if="activePrompt === 'download'" @click="closeAll"
              class="sm:hidden fixed inset-0 bg-gray-900/60 z-[110] cursor-default"></div>
          </Transition>
          <Transition enter-active-class="transition-all duration-300 ease-out"
            enter-from-class="opacity-0 translate-y-full" enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition-all duration-200 ease-in" leave-from-class="opacity-100 translate-y-0"
            leave-to-class="opacity-0 translate-y-full">
            <div v-if="activePrompt === 'download'"
              class="sm:hidden fixed bottom-0 left-0 right-0 z-[120] bg-white border-t border-orange-500/20 rounded-t-2xl p-4 pb-8 max-h-[85vh] overflow-y-auto shadow-[0_-2px_12px_rgba(0,0,0,0.06)]">
              <div class="w-9 h-1 bg-slate-300 rounded-full mx-auto my-3"></div>
              <div class="flex items-center justify-center mb-4 relative">
                <button @click="closeAll"
class="absolute left-0 w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors cursor-pointer rounded-lg hover:bg-slate-100">
                  <span class="material-symbols-outlined notranslate text-[22px]">arrow_back</span>Atrás
                </button>
                <span class="text-slate-500 text-[10px] font-bold uppercase tracking-widest text-center">Descargar
                  QR</span>
              </div>
              <label class="text-[9px] font-bold uppercase tracking-[0.15em] text-slate-400 mb-2 block">Formato</label>
              <div class="grid grid-cols-2 gap-2 mb-4">
                <button @click="downloadFormat = 'png'"
                  class="flex flex-col items-start gap-1 p-2.5 rounded-xl border text-left transition-all cursor-pointer active:scale-[0.97]"
                  :class="downloadFormat === 'png' ? 'bg-orange-50 border-orange-300' : 'bg-slate-50 border-slate-200'">
                  <div class="flex items-center gap-1.5 w-full">
                    <span :class="downloadFormat === 'png' ? 'text-orange-500' : 'text-slate-400'"
                      class="material-symbols-outlined notranslate text-[18px]">image</span>
                    <span :class="downloadFormat === 'png' ? 'text-orange-300' : 'text-slate-700'"
                      class="text-xs font-bold">PNG</span>
                    <span v-if="downloadFormat === 'png'"
                      class="ml-auto px-1 py-0.5 bg-orange-500/20 rounded text-[7px] font-bold text-orange-500 uppercase">Recomendado</span>
                  </div>
                  <p :class="downloadFormat === 'png' ? 'text-slate-500' : 'text-slate-400'"
                    class="text-[9px] leading-tight">
                    Imagen digital</p>
                  <p class="text-[8px] text-slate-300 font-mono">400×173px</p>
                </button>
                <button @click="downloadFormat = 'pdf'"
                  class="flex flex-col items-start gap-1 p-2.5 rounded-xl border text-left transition-all cursor-pointer active:scale-[0.97]"
                  :class="downloadFormat === 'pdf' ? 'bg-orange-50 border-orange-300' : 'bg-slate-50 border-slate-200'">
                  <div class="flex items-center gap-1.5 w-full">
                    <span :class="downloadFormat === 'pdf' ? 'text-orange-500' : 'text-slate-400'"
                      class="material-symbols-outlined notranslate text-[18px]">picture_as_pdf</span>
                    <span :class="downloadFormat === 'pdf' ? 'text-orange-300' : 'text-slate-700'"
                      class="text-xs font-bold">PDF</span>
                  </div>
                  <p :class="downloadFormat === 'pdf' ? 'text-slate-500' : 'text-slate-400'"
                    class="text-[9px] leading-tight">
                    Documento imprimible</p>
                  <p class="text-[8px] text-slate-300 font-mono">132×57mm</p>
                </button>
              </div>
              <label
                class="text-[9px] font-bold uppercase tracking-[0.15em] text-slate-400 mb-2 block">Personalizar</label>
              <div class="flex items-center gap-3 mb-1">
                <span class="text-[8px] font-bold uppercase tracking-wider text-slate-300 w-10 shrink-0">Estilo</span>
                <div class="flex gap-1 p-0.5 bg-slate-100 rounded-xl flex-1">
                  <button @click="downloadStyle = 'normal'"
                    class="flex-1 py-1.5 text-[9px] font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer"
                    :class="downloadStyle === 'normal' ? 'bg-orange-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'">Normal</button>
                  <button @click="downloadStyle = 'compact'"
                    class="flex-1 py-1.5 text-[9px] font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer"
                    :class="downloadStyle === 'compact' ? 'bg-orange-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'">Compacto</button>
                </div>
              </div>
              <div class="flex items-center gap-3 mb-4">
                <span class="text-[8px] font-bold uppercase tracking-wider text-slate-300 w-10 shrink-0">Tamaño</span>
                <div class="flex gap-1 p-0.5 bg-slate-100 rounded-xl">
                  <button @click="downloadSize = 'sm'"
                    class="px-2.5 py-1.5 text-[8px] font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer"
                    :class="downloadSize === 'sm' ? 'bg-orange-500/20 border border-orange-300 text-orange-500' : 'text-slate-500 hover:text-slate-800'">SM</button>
                  <button @click="downloadSize = 'md'"
                    class="px-2.5 py-1.5 text-[8px] font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer"
                    :class="downloadSize === 'md' ? 'bg-orange-500/20 border border-orange-300 text-orange-500' : 'text-slate-500 hover:text-slate-800'">MD</button>
                  <button @click="downloadSize = 'lg'"
                    class="px-2.5 py-1.5 text-[8px] font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer"
                    :class="downloadSize === 'lg' ? 'bg-orange-500/20 border border-orange-300 text-orange-500' : 'text-slate-500 hover:text-slate-800'">LG</button>
                </div>
              </div>
              <div class="flex justify-center mb-4">
                <div
                  class="rounded-2xl bg-gradient-to-br from-[#f97316] to-[#fed7aa] border border-orange-300 relative overflow-hidden w-full max-w-[300px]">
                  <div class="absolute inset-0 opacity-[0.03] pointer-events-none"
                    style="background-image:linear-gradient(rgba(255,255,255,1)1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1)1px,transparent 1px);background-size:20px 20px;">
                  </div>
                   <div class="relative overflow-auto max-h-[200px] p-1">
                    <template v-if="downloadStyle === 'normal'">
                      <div ref="mobileTemplateRef"
:style="`width:${currentPreset.width}px;height:${currentPreset.height}px;padding:${currentPreset.spacing.outerPadding}px;font-family:'Google Sans',sans-serif;display:flex;flex-direction:column;gap:${currentPreset.spacing.mainGap}px`"
                        class="relative overflow-hidden">
                        <div class="flex items-center justify-between shrink-0"
                          :style="{ gap: currentPreset.spacing.headerGap + 'px' }">
                          <div class="flex items-center"
  :style="{ gap: currentPreset.spacing.headerGap + 'px' }">
                                                      <img :src="SslIcon"
                              :style="{ width: currentPreset.sslIcon.w + 'px', height: currentPreset.sslIcon.h + 'px' }"
                              class="object-contain" />
                            <span :style="{ fontSize: currentPreset.fonts.topDomain + 'px' }"
                              class="text-black font-black tracking-widest uppercase leading-none">HTTPS://</span>
                            <span :style="{ fontSize: currentPreset.fonts.topDomain + 'px' }"
                              class="text-white font-black tracking-widest uppercase leading-none">ubiqueme.com</span>
                          </div>
                          <div :style="{
                            padding: currentPreset.logo.containerPadding + 'px',
                            borderRadius: currentPreset.logo.containerRadius + 'px',
                          }" class="bg-black/80 flex items-center justify-center shrink-0">
                            <img :src="LogoWhite" :style="{ width: currentPreset.logo.size + 'px' }"
                              class="h-auto opacity-90 block" />
                          </div>
                        </div>
                        <div class="flex items-start flex-1 min-h-0"
                          :style="{ gap: currentPreset.spacing.contentGap + 'px' }">
                          <div :style="{
                            width: (currentPreset.qr.size + currentPreset.qr.containerPadding * 2) + 'px',
                            height: (currentPreset.qr.size + currentPreset.qr.containerPadding * 2) + 'px',
                            borderRadius: currentPreset.qr.containerRadius + 'px',
                            padding: currentPreset.qr.containerPadding + 'px',
                          }" class="shrink-0 self-start bg-white flex items-center justify-center overflow-hidden">
                            <template v-if="propsComputed.img">
                              <img :src="propsComputed.img"
                                :style="{ width: currentPreset.qr.size + 'px', height: currentPreset.qr.size + 'px' }"
                                class="object-contain" />
                            </template>
                            <template v-else>
                              <QrcodeVue :value="qrScanUrl" :size="currentPreset.qr.size * 4" render-as="canvas"
                                level="H" :image-settings="imageSettings"
                                :style="{ width: currentPreset.qr.size + 'px', height: currentPreset.qr.size + 'px', maxWidth: '100%', maxHeight: '100%' }" />
                            </template>
                          </div>
                          <div class="flex flex-col flex-1 min-w-0 text-center overflow-hidden self-stretch"
                            :style="{ gap: currentPreset.spacing.textGap + 'px' }">
                            <p :style="{ fontSize: currentPreset.fonts.name + 'px' }"
                              class="text-[#171717] font-black leading-tight m-0 truncate">
                              {{ displayName }}
                            </p>
                            <p :style="{ fontSize: currentPreset.fonts.desc + 'px' }"
                              class="text-[#303030] font-medium leading-tight m-0 line-clamp-2 max-w-[75%] self-center">
                              Escanee este QR para contactar al responsable.
                            </p>
                            <p :style="{ fontSize: currentPreset.fonts.footerNote + 'px' }"
                              class="text-black font-medium leading-tight m-0 shrink-0">
                              QR oficial de Ubiqueme.com® — Marca 100% segura y verificada.
                            </p>
                          </div>
                        </div>
                        <div class="flex flex-col shrink-0 items-center justify-center"
                          :style="{ gap: currentPreset.spacing.footerGap + 'px' }">
                          <span :style="{ fontSize: currentPreset.fonts.footerEmail + 'px' }"
                            class="text-white font-bold tracking-wider">soporte@ubiqueme.com</span>
                          <div class="flex items-center justify-center"
                            :style="{ gap: currentPreset.spacing.footerGap + 'px' }">
                            <span :style="{ fontSize: currentPreset.fonts.footerDomain + 'px' }"
                              class="text-white font-bold uppercase tracking-wider" translate="no">localizarme.com</span>
                            <span :style="{ fontSize: currentPreset.fonts.footerDomain + 'px' }"
                              class="text-white/50">•</span>
                            <span :style="{ fontSize: currentPreset.fonts.footerDomain + 'px' }"
                              class="text-white font-bold uppercase tracking-wider" translate="no">contactomio.com</span>
                          </div>
                        </div>
                      </div>
                    </template>
                    <template v-else>
                      <div ref="mobileTemplateRef"
                        :style="`width:${currentCompactPreset.size}px;height:${currentCompactPreset.size}px;padding:${currentCompactPreset.spacing.padding}px;background:linear-gradient(125deg,#f97316,#fcbd74);font-family:'Google Sans',sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:${currentCompactPreset.spacing.gap}px`"
                        class="relative overflow-hidden">
                        <span :style="{ fontSize: currentCompactPreset.fonts.top + 'px' }"
                          class="text-white font-black tracking-widest uppercase text-center">ubiqueme.com</span>
                        <div class="flex items-center justify-center flex-1 w-full min-h-0"
                          :style="{ gap: currentCompactPreset.spacing.gap + 'px' }">
                          <span :style="{
                            fontSize: currentCompactPreset.fonts.side + 'px',
                            writingMode: 'vertical-rl',
                          }" class="text-white font-bold uppercase tracking-wider shrink-0"
                            translate="no">contactomio.com</span>
                          <div :style="{
                            width: (currentCompactPreset.qr.size + currentCompactPreset.qr.containerPadding * 2) + 'px',
                            height: (currentCompactPreset.qr.size + currentCompactPreset.qr.containerPadding * 2) + 'px',
                            padding: currentCompactPreset.qr.containerPadding + 'px',
                          }" class="shrink-0 bg-white rounded-lg flex items-center justify-center overflow-hidden">
                            <template v-if="propsComputed.img">
                              <img :src="propsComputed.img"
                                :style="{ width: currentCompactPreset.qr.size + 'px', height: currentCompactPreset.qr.size + 'px' }"
                                class="object-contain" />
                            </template>
                            <template v-else>
                              <img :src="qrHighResUrl"
                                :style="{ width: currentCompactPreset.qr.size + 'px', height: currentCompactPreset.qr.size + 'px' }"
                                class="object-contain" />
                            </template>
                          </div>
                          <span :style="{
                            fontSize: currentCompactPreset.fonts.side + 'px',
                            writingMode: 'vertical-rl',
                          }" class="text-white font-bold uppercase tracking-wider shrink-0"
                            translate="no">localizarme.com</span>
                        </div>
                        <span :style="{ fontSize: currentCompactPreset.fonts.bottom + 'px' }"
                          class="text-white font-semibold text-center">Escanee este QR para contactar al
                          responsable</span>
                      </div>
                    </template>
                  </div>
                </div>
              </div>
              <button @click="onDownload" :disabled="isDownloading"
                class="w-full py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-bold text-sm hover:brightness-110 transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md shadow-orange-500/10">
                <span class="material-symbols-outlined notranslate text-[18px]">download</span>
                Descargar como {{ downloadFormat === 'pdf' ? 'PDF' : 'PNG' }}
                <span class="text-slate-500 text-[10px] font-normal">({{ downloadSize === 'sm' ? 'Pequeño' : downloadSize
                  === 'md'
                  ? 'Mediano' : 'Grande' }})</span>
              </button>
              <button @click="closeAll"
                class="w-full mt-3 py-3 bg-slate-100 text-slate-500 rounded-xl text-sm font-medium hover:bg-slate-100 hover:text-slate-800 transition-colors cursor-pointer active:scale-[0.98]">Cerrar</button>
            </div>
          </Transition>
        </Teleport>
      </div>
    </Transition>

    <!-- Drag Positioner Modal -->
    <DragPositioner :visible="showDrag" :qr-id="props.id" :qr-name="props.name" :qr-img="props.img"
      :qr-data-url="qrHighResUrl" :download-size="downloadSize" :readonly="!isEditor" @close="showDrag = false" />
  </div>
</template>

<style scoped>
.material-symbols-outlined {
  font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}

.scrollbar-thin::-webkit-scrollbar {
  width: 4px;
}

.scrollbar-thin::-webkit-scrollbar-track {
  background: transparent;
}

.scrollbar-thin::-webkit-scrollbar-thumb {
  background: rgba(249, 115, 22, 0.15);
  border-radius: 999px;
}

.scrollbar-thin::-webkit-scrollbar-thumb:hover {
  background: rgba(249, 115, 22, 0.3);
}
</style>
