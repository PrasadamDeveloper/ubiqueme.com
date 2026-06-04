<script lang="ts" setup>
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'
import QrcodeVue from 'qrcode.vue'
import { collection, doc, onSnapshot, orderBy, query, Timestamp, writeBatch } from 'firebase/firestore'
import { db } from '@/firebase'
import { useUserStore } from '@/stores/user'
import CloudLoader from '@/components/ui/CloudLoader.vue'
import type { IQRCard } from '@/interfaces/IQRCard'
import type { IQRLog } from '@/interfaces/IPublicQR'
import type { Unsubscribe } from 'firebase/auth'
import QRCardLog from './QRCardLog.vue'
import { toast } from 'vue-sonner'

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

const isLoading = ref(false);

const handleEdit = async () => {
  try {
    isLoading.value = true;
    const userQRDoc = doc(db, `users/${userStore.getUserId}/qrs/${props.id}`)
    const publicQrDoc = doc(db, 'publicQR', props.id);

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
    const publicQRData: Record<string, unknown> = {
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
    if (props.category) {
      publicQRData.category = props.category
    }
    const qrDoc = doc(db, `users/${userStore.getUserId}/qrs/${props.id}`)
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
    const qrDoc = doc(db, `users/${userStore.getUserId}/qrs/${props.id}`)
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

const handleCancelQR = async () => {
  try {
    isLoading.value = true;
    const batch = writeBatch(db);
    const userQRDoc = doc(db, `users/${userStore.getUserId}/qrs/${props.docId}`);
    const publicQrDoc = doc(db, 'publicQR', props.id);

    batch.update(userQRDoc, { status: 'Canceled' });
    batch.update(publicQrDoc, { status: 'Canceled' });
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
    const batch = writeBatch(db);
    const userQRDoc = doc(db, `users/${userStore.getUserId}/qrs/${props.id}`);
    const publicQrDoc = doc(db, 'publicQR', props.id);

    batch.update(userQRDoc, {
      status: 'Active',
      scans: 0,
      lastScan: null,
    });
    batch.update(publicQrDoc, {
      status: 'Active',
      totalScans: 0,
      lastScan: null,
    });
    await batch.commit();
    closeAll();
    toast.success(`QR renovado exitosamente`);
  } catch (error) {
    const e = error as Error;
    toast.error(`Error al renovar QR: ${e.message}`);
  } finally {
    isLoading.value = false;
  }
}


const canMakePublic = computed(() => propsComputed.value.planType && propsComputed.value.planType !== 'bronce')

const menuOptions = [
  { label: 'Pedir QR físico', icon: 'local_shipping', description: 'Solicitar su código QR físico con pegamento para colocarlo en sus pertenencias', action: () => emit('request-physical', props.subscriptionId) },
  { label: 'Hacer Público', icon: 'public', description: 'Activa el QR para que cualquiera pueda escanearlo.', action: canMakePublic.value ? _setQrPublic : undefined, locked: !canMakePublic.value, lockTooltip: 'Se requiere plan Plata u Oro para activar esta función' },
  { label: 'Hacer Privado', icon: 'visibility_off', description: 'Pausa el QR. Nadie podrá escanearlo', action: canMakePublic.value ? _setQrPrivate : undefined, locked: !canMakePublic.value, lockTooltip: 'Se requiere plan Plata u Oro para activar esta función' },
  { divider: true },
  { label: 'Descargar QR', icon: 'download', description: 'Descargar imagen PNG o PDF imprimible con los datos de su código QR.', action: () => openPrompt('download') },
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

// Download refs
const downloadQrRef = ref<InstanceType<typeof QrcodeVue> | null>(null)
const downloadImgRef = ref<HTMLImageElement | null>(null)
const qrDownloadUrl = computed(() => `${window.location.origin}/qr/${propsComputed.value.id}`)

const handleDownloadPNG = async () => {
  try {
    // Load QR image from qrserver.com API (reliable, avoids $el canvas issues)
    const qrValue = `${window.location.origin}/qr/${propsComputed.value.id}`
    const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrValue)}`

    const qrImg = new Image()
    qrImg.crossOrigin = 'anonymous'
    qrImg.src = qrImageUrl
    await qrImg.decode()

    // Create horizontal canvas (wider, card/badge format)
    const w = 600
    const h = 300
    const canvas = document.createElement('canvas')
    canvas.width = w * 2
    canvas.height = h * 2
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      toast.error('Error al generar la imagen')
      return
    }
    ctx.scale(2, 2)

    // Dark background matching dashboard cards
    ctx.fillStyle = '#0a0401'
    ctx.fillRect(0, 0, w, h)

    // Subtle grid pattern
    ctx.strokeStyle = 'rgba(255,255,255,0.04)'
    ctx.lineWidth = 1
    for (let x = 0; x < w; x += 24) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, h)
      ctx.stroke()
    }
    for (let y = 0; y < h; y += 24) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(w, y)
      ctx.stroke()
    }

    // Orange glow gradient (top-left)
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, w)
    gradient.addColorStop(0, 'rgba(249,115,22,0.10)')
    gradient.addColorStop(1, 'rgba(249,115,22,0)')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, w, h)

    // ─── Left side: QR Code ───
    const qrBoxSize = 160
    const qrBoxX = 36
    const qrBoxY = (h - qrBoxSize) / 2
    const radius = 16
    ctx.fillStyle = '#ffffff'
    ctx.beginPath()
    ctx.moveTo(qrBoxX + radius, qrBoxY)
    ctx.lineTo(qrBoxX + qrBoxSize - radius, qrBoxY)
    ctx.quadraticCurveTo(qrBoxX + qrBoxSize, qrBoxY, qrBoxX + qrBoxSize, qrBoxY + radius)
    ctx.lineTo(qrBoxX + qrBoxSize, qrBoxY + qrBoxSize - radius)
    ctx.quadraticCurveTo(qrBoxX + qrBoxSize, qrBoxY + qrBoxSize, qrBoxX + qrBoxSize - radius, qrBoxY + qrBoxSize)
    ctx.lineTo(qrBoxX + radius, qrBoxY + qrBoxSize)
    ctx.quadraticCurveTo(qrBoxX, qrBoxY + qrBoxSize, qrBoxX, qrBoxY + qrBoxSize - radius)
    ctx.lineTo(qrBoxX, qrBoxY + radius)
    ctx.quadraticCurveTo(qrBoxX, qrBoxY, qrBoxX + radius, qrBoxY)
    ctx.closePath()
    ctx.fill()

    // Draw QR inside
    ctx.drawImage(qrImg, qrBoxX + 14, qrBoxY + 14, qrBoxSize - 28, qrBoxSize - 28)

    // ─── Right side: Info ───
    const infoX = qrBoxX + qrBoxSize + 28

    // Title: QR name (bold, large)
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 28px "Google Sans", sans-serif'
    ctx.textAlign = 'left'
    ctx.fillText(propsComputed.value.name || 'Código QR', infoX, qrBoxY + 16)

    // ID
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 13px monospace'
    ctx.fillText(`#${propsComputed.value.id}`, infoX, qrBoxY + 46)

    // Divider line
    ctx.strokeStyle = 'rgba(255,255,255,0.12)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(infoX, qrBoxY + 80)
    ctx.lineTo(w - 28, qrBoxY + 80)
    ctx.stroke()

    // CTA text (multi-line for wrapping)
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 16px "Google Sans", sans-serif'
    const ctaLine1 = 'Escanee este QR para'
    const ctaLine2 = 'contactar al dueño de'
    const ctaLine3 = 'esta pertenencia de'
    const ctaLine4 = 'forma segura.'
    ctx.fillText(ctaLine1, infoX, qrBoxY + 108)
    ctx.fillText(ctaLine2, infoX, qrBoxY + 130)
    ctx.fillText(ctaLine3, infoX, qrBoxY + 152)
    ctx.fillText(ctaLine4, infoX, qrBoxY + 174)

    // GPS pin icon + brand (big)
    const pinX = infoX
    const pinY = qrBoxY + 200
    ctx.fillStyle = '#f38020'
    // GPS pin circle
    ctx.beginPath()
    ctx.arc(pinX + 8, pinY - 1, 5, 0, Math.PI * 2)
    ctx.fill()
    // GPS pin triangle below
    ctx.beginPath()
    ctx.moveTo(pinX + 3, pinY + 2)
    ctx.lineTo(pinX + 13, pinY + 2)
    ctx.lineTo(pinX + 8, pinY + 11)
    ctx.closePath()
    ctx.fill()

    ctx.font = 'bold 20px "Google Sans", sans-serif'
    ctx.fillText('ubiqueme.com', infoX + 22, qrBoxY + 208)

    // Bottom: instruction line
    ctx.fillStyle = 'rgba(255,255,255,0.5)'
    ctx.font = 'bold 11px "Google Sans", sans-serif'
    ctx.fillText('Escanee y ayude a devolver esta pertenencia', infoX, qrBoxY + 240)

    // Download
    const link = document.createElement('a')
    link.download = `qr-${propsComputed.value.id}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()

    toast.success('QR descargado como PNG')
    closeAll()
  } catch (error) {
    toast.error(`Error al descargar PNG: ${error}`)
  }
}

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
    class="relative w-full bg-[#0a0401] border border-white/10 rounded-[2rem] hover:border-orange-500/40 transition-all duration-500 overflow-hidden font-google-sans group">

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

    <!-- ===== LAYOUT: Info Left + QR Right (original order) ===== -->
    <div class="relative z-10 flex flex-col sm:flex-row">

      <!-- ─── Columna Izquierda: Info + Stats + Logs ─── -->
      <div class="flex-1 flex flex-col min-w-0 p-5 md:p-6">

        <!-- Header Row -->
        <div class="flex items-start justify-between gap-2 mb-3">
          <div class="flex items-center gap-2 min-w-0">
            <span class="material-symbols-outlined text-orange-500 text-[18px] shrink-0">location_on</span>
            <span
              class="text-white font-black tracking-widest text-[10px] uppercase whitespace-nowrap">ubiqueme.com</span>
            <span
              class="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider"
              :class="currentStatus.bg">
              <span :class="['w-1.5 h-1.5 rounded-full', currentStatus.dot]"></span>
              {{ currentStatus.label }}
            </span>
          </div>
          <!-- Menu button (top right on mobile, moved to right column on desktop) -->
          <button data-name="hamMenu" @click="toggleMenu($event)"
            class="sm:hidden text-orange-500/90 hover:text-white transition-colors cursor-pointer w-9 h-9 flex items-center justify-center rounded-xl hover:bg-white/10 active:scale-95 shrink-0">
            <span data-name="hamMenu" class="material-symbols-outlined text-[22px]">more_horiz</span>
          </button>
        </div>

        <!-- Name + ID -->
        <h3 class="text-xl sm:text-2xl font-black text-white leading-tight mb-1 tracking-tighter truncate">
          {{ propsComputed.name || 'Código QR' }}
        </h3>
        <div class="flex items-center gap-2 mb-3">
          <span class="text-white/30 text-[9px] uppercase tracking-[0.2em] font-black font-mono">
            #{{ propsComputed.id }}
          </span>
        </div>

        <!-- Stats Row -->
        <div class="flex items-center gap-5 mb-3">
          <div class="flex items-center gap-1.5">
            <span class="material-symbols-outlined text-white/30 text-[14px]">qr_code_scanner</span>
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
          Escanee este código para contactar al propietario de forma
          <span class="text-white/70">segura y anónima</span>.
        </p>

        <!-- Divider -->
        <div class="border-t border-white/10 mb-3"></div>

        <!-- Logs Section (scrollable, max-h fijo) -->
        <div class="flex-1 min-h-0">
          <button v-if="!logsLoaded" @click="loadLogs"
            class="text-xs text-orange-400/60 hover:text-orange-400 transition-colors flex items-center gap-1.5 cursor-pointer group">
            <span
              class="material-symbols-outlined text-[16px] group-hover:scale-110 transition-transform">history</span>
            <span class="font-medium">Ver registros de escaneo</span>
            <span v-if="isLogsLoading"
              class="w-3 h-3 border border-orange-400/40 border-t-transparent rounded-full animate-spin ml-1"></span>
          </button>

          <div v-if="logsLoaded && isLogsLoading" class="flex items-center gap-2 text-xs text-white/30 py-2">
            <span class="w-3 h-3 border border-orange-400/40 border-t-transparent rounded-full animate-spin"></span>
            Cargando registros...
          </div>

          <div v-if="logsLoaded && !isLogsLoading" class="space-y-2 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
            <div v-if="qrLogs.length === 0" class="text-white/20 text-xs py-3 text-center">
              <span class="material-symbols-outlined text-[20px] block mb-1">history_off</span>
              Sin registros de escaneo aún
            </div>
            <QRCardLog v-for="log in qrLogs" :key="log.id" v-bind="log" />
          </div>
        </div>
      </div>

      <!-- ─── Columna Derecha: QR Code ─── -->
      <div
        class="w-full sm:w-[200px] bg-[#0c0500] border-t sm:border-t-0 sm:border-l border-white/5 flex flex-col items-center justify-center p-6 shrink-0 relative">

        <div class="flex flex-col items-center gap-3">
          <!-- QR Container -->
          <div class="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl flex items-center justify-center bg-white p-2.5 shadow-lg">
            <template v-if="propsComputed.img">
              <img :src="propsComputed.img" class="w-full h-full object-cover rounded-xl" />
            </template>
            <template v-else>
              <QrcodeVue :value="`http://192.168.100.15:5173/qr/${propsComputed.id}`" :size="110" class="w-full h-full"
                render-as="canvas" />
            </template>
          </div>
          <p class="text-white/40 text-[8px] uppercase tracking-[0.3em] font-black text-center">
            www.ubiqueme.com
          </p>
        </div>

        <!-- Menu button (desktop only, inside QR column) -->
        <button data-name="hamMenu" @click="toggleMenu($event)"
          class="hidden sm:flex text-orange-500/90 hover:text-white transition-colors cursor-pointer w-9 h-9 items-center justify-center rounded-xl hover:bg-white/10 active:scale-95 absolute top-4 right-4">
          <span data-name="hamMenu" class="material-symbols-outlined text-[22px]">more_horiz</span>
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
                <span class="material-symbols-outlined text-[18px]">lock</span>
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
                <span class="material-symbols-outlined text-[18px]">{{ option.icon }}</span>
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
      <!-- Overlay para cerrar menú (dentro del stacking context del contenido) -->
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
              <button @click="handleCancelQR"
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
              <button @click="handleRenewQR"
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

        <!-- Download Prompt -->
        <Transition enter-active-class="transition-all duration-300 ease-out" enter-from-class="opacity-0 scale-95"
          enter-to-class="opacity-100 scale-100" leave-active-class="transition-all duration-200 ease-in"
          leave-from-class="opacity-100 scale-100" leave-to-class="opacity-0 scale-95">
          <div v-if="activePrompt === 'download'" class="w-full max-w-xs sm:max-w-sm">
            <div class="flex flex-col items-center">
              <h3 class="text-white/90 text-lg font-medium mb-4">Descargar QR</h3>

              <!-- Preview Card (horizontal, bold white text) -->
              <div id="qr-print-area"
                class="bg-[#0a0401] rounded-xl p-4 w-full flex flex-row items-center gap-4 mb-5 border border-white/10 relative overflow-hidden min-h-[170px]">
                <!-- Grid pattern -->
                <div class="absolute inset-0 opacity-[0.04] pointer-events-none"
                  style="background-image: linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px);background-size:24px 24px;">
                </div>
                <!-- Orange glow -->
                <div
                  class="absolute top-0 left-0 w-full h-full pointer-events-none bg-gradient-to-br from-orange-500/10 via-transparent to-transparent">
                </div>
                <!-- QR Code (left) -->
                <div
                  class="w-[120px] h-[120px] shrink-0 flex items-center justify-center bg-white p-2.5 rounded-2xl shadow-lg z-10">
                  <template v-if="propsComputed.img">
                    <img :src="propsComputed.img" ref="downloadImgRef"
                      class="w-full h-full object-contain rounded-xl" />
                  </template>
                  <template v-else>
                    <QrcodeVue ref="downloadQrRef" :value="qrDownloadUrl" :size="100" render-as="canvas" />
                  </template>
                </div>
                <!-- Info (right) -->
                <div class="flex flex-col min-w-0 gap-1 z-10 flex-1">
                  <p class="text-white font-extrabold text-lg leading-tight">{{ propsComputed.name || 'Código QR' }}</p>
                  <p class="text-white font-bold text-[10px] font-mono">
                    #{{ propsComputed.id }}
                  </p>
                  <div class="w-full h-px bg-white/10 my-1"></div>
                  <p class="text-white font-bold text-[11px] leading-tight">
                    Escanee este QR para contactar al dueño de esta pertenencia de forma segura.
                  </p>
                  <div class="flex items-center gap-1 mt-1">
                    <span class="material-symbols-outlined text-[#f38020] text-[14px]">location_on</span>
                    <span class="text-[#f38020] text-[11px] font-black tracking-widest uppercase">ubiqueme.com</span>
                  </div>
                </div>
              </div>

              <!-- Action Buttons -->
              <button @click="handleDownloadPNG"
                class="w-full py-2.5 bg-[#f38020] text-white rounded-lg font-medium text-sm hover:bg-[#e07010] transition-colors active:scale-[0.98] cursor-pointer flex items-center justify-center gap-1.5">
                <span class="material-symbols-outlined text-[16px]">download</span>
                Descargar
              </button>
              <button @click="closeAll"
                class="mt-3 w-full py-2 bg-white/5 text-white/50 rounded-lg text-xs hover:bg-white/10 hover:text-white/70 transition-colors cursor-pointer">
                Cerrar
              </button>
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
</style>
