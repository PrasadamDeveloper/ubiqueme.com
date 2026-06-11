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
// Dynamic QR URL based on subscription plan
const qrScanUrl = computed(() => {
  const id = propsComputed.value.id
  const name = propsComputed.value.name || 'Código QR'
  const text = `ID: ${id}\nQR: ${name}\nMensaje: Lo contacto porque...`
  return `https://wa.me/525652094079?text=${encodeURIComponent(text)}`
})

const qrDownloadUrl = computed(() => qrScanUrl.value)

const downloadStyle = ref<'normal' | 'compact'>('normal')
const downloadSize = ref<'sm' | 'md' | 'lg'>('md')

const sizeDimensions = {
  sm: { normalW: 480, normalH: 280, compact: 280 },
  md: { normalW: 600, normalH: 400, compact: 420 },
  lg: { normalW: 800, normalH: 520, compact: 560 },
} as const

// Preview scaling classes based on selected size
const previewScale = computed(() => {
  const s = downloadSize.value
  if (s === 'sm') return 0.55
  if (s === 'md') return 0.75
  return 1 // lg = full
})

// Normal style preview computed sizes
const qrPreviewInnerSize = computed(() => Math.round(100 * previewScale.value))
const qrPreviewSizeStyle = computed(() => {
  const s = Math.round(120 * previewScale.value)
  return { width: `${s}px`, height: `${s}px` }
})
const titleFontSize = computed(() => `${Math.round(18 * previewScale.value)}px`)
const idFontSize = computed(() => `${Math.round(10 * previewScale.value)}px`)
const ctaFontSize = computed(() => `${Math.round(11 * previewScale.value)}px`)
const pinFontSize = computed(() => `${Math.round(14 * previewScale.value)}px`)
const brandFontSize = computed(() => `${Math.round(11 * previewScale.value)}px`)
const previewAspectStyle = computed(() => {
  const dims = sizeDimensions[downloadSize.value]
  return { aspectRatio: `${dims.normalW} / ${dims.normalH}` }
})

// Compact style preview computed sizes
const qrCompactInnerSize = computed(() => Math.round(80 * previewScale.value))
const qrCompactSizeStyle = computed(() => {
  const s = Math.round(100 * previewScale.value)
  return { width: `${s}px`, height: `${s}px` }
})
const compactCtaFontSize = computed(() => `${Math.round(10 * previewScale.value)}px`)

const handleDownloadPNG = async () => {
  const dims = sizeDimensions[downloadSize.value]
  const w = dims.normalW
  const h = dims.normalH
  try {
    const qrValue = qrScanUrl.value
    const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrValue)}`

    const qrImg = new Image()
    qrImg.crossOrigin = 'anonymous'
    qrImg.src = qrImageUrl
    await qrImg.decode()

    const canvas = document.createElement('canvas')
    canvas.width = w * 4
    canvas.height = h * 4
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      toast.error('Error al generar la imagen')
      return
    }
    ctx.scale(4, 4)

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

    // ─── Left side: QR Code (centered vertically) ───
    const qrBoxSize = Math.min(160, Math.round(h * 0.55))
    const qrBoxX = Math.round(w * 0.06)
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
    // Top of the info column aligns with top of QR box
    const infoTopY = qrBoxY

    // Title: QR name (bold, large)
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 28px "Google Sans", sans-serif'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'top'
    ctx.fillText(propsComputed.value.name || 'Código QR', infoX, infoTopY)

    // ID
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 13px monospace'
    ctx.fillText(`#${propsComputed.value.id}`, infoX, infoTopY + 34)

    // Divider line
    const dividerY = infoTopY + 64
    ctx.strokeStyle = 'rgba(255,255,255,0.12)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(infoX, dividerY)
    ctx.lineTo(w - 28, dividerY)
    ctx.stroke()

    // CTA text (2 lines)
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 16px "Google Sans", sans-serif'
    ctx.textBaseline = 'top'
    ctx.fillText('Escanee este QR para contactar', infoX, dividerY + 16)
    ctx.fillText('al dueño de forma segura.', infoX, dividerY + 38)

    // GPS pin icon + brand
    const pinY = dividerY + 70
    ctx.fillStyle = '#f38020'
    ctx.textBaseline = 'top'
    // GPS pin circle
    ctx.beginPath()
    ctx.arc(infoX + 8, pinY + 7, 5, 0, Math.PI * 2)
    ctx.fill()
    // GPS pin triangle below
    ctx.beginPath()
    ctx.moveTo(infoX + 3, pinY + 10)
    ctx.lineTo(infoX + 13, pinY + 10)
    ctx.lineTo(infoX + 8, pinY + 19)
    ctx.closePath()
    ctx.fill()

    ctx.font = 'bold 20px "Google Sans", sans-serif'
    ctx.fillText('ubiqueme.com', infoX + 22, pinY + 2)

    // Bottom: instruction line
    const bottomY = pinY + 38
    ctx.fillStyle = 'rgba(255,255,255,0.5)'
    ctx.font = 'bold 11px "Google Sans", sans-serif'
    ctx.fillText('Escanee y ayude a devolver esta pertenencia', infoX, bottomY)

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

const handleDownloadCompactPNG = async () => {
  const dims = sizeDimensions[downloadSize.value]
  const size = dims.compact
  const fontSize = Math.round(size * 0.048)
  const smallFontSize = Math.round(size * 0.036)

  // Layout: white rounded rect with padding, everything inside
  const outerPad = Math.round(size * 0.07)
  const innerW = size - outerPad * 2
  const qrW = Math.round(innerW * 0.55)
  const textSpacing = Math.round(qrW * 0.06)

  try {
    const qrValue = qrScanUrl.value
    const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${qrW}x${qrW}&data=${encodeURIComponent(qrValue)}`

    const qrImg = new Image()
    qrImg.crossOrigin = 'anonymous'
    qrImg.src = qrImageUrl
    await qrImg.decode()

    const canvas = document.createElement('canvas')
    canvas.width = size * 4
    canvas.height = size * 4
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      toast.error('Error al generar la imagen')
      return
    }
    ctx.scale(4, 4)

    // White background
    ctx.fillStyle = '#ffffff'
    ctx.beginPath()
    const r = Math.round(size * 0.06)
    ctx.moveTo(r, 0)
    ctx.lineTo(size - r, 0)
    ctx.quadraticCurveTo(size, 0, size, r)
    ctx.lineTo(size, size - r)
    ctx.quadraticCurveTo(size, size, size - r, size)
    ctx.lineTo(r, size)
    ctx.quadraticCurveTo(0, size, 0, size - r)
    ctx.lineTo(0, r)
    ctx.quadraticCurveTo(0, 0, r, 0)
    ctx.closePath()
    ctx.fill()

    // "Frente": ubiqueme.com (top, centered)
    ctx.fillStyle = '#f38020'
    ctx.font = `bold ${fontSize}px "Google Sans", sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'bottom'
    const frenteY = outerPad + textSpacing + fontSize
    ctx.fillText('ubiqueme.com', size / 2, frenteY)

    // QR code area: centered below "ubiqueme.com", above CTA
    const availableH = size - outerPad * 2 - textSpacing * 2 - fontSize - smallFontSize
    const qrMaxSize = Math.min(qrW, availableH)
    const qrX = (size - qrMaxSize) / 2
    const qrY = outerPad + textSpacing + fontSize + textSpacing
    ctx.drawImage(qrImg, qrX, qrY, qrMaxSize, qrMaxSize)

    // Left domain (rotated -90°)
    ctx.save()
    ctx.translate(qrX - textSpacing, qrY + qrMaxSize / 2)
    ctx.rotate(-Math.PI / 2)
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.font = `bold ${smallFontSize}px "Google Sans", sans-serif`
    ctx.fillStyle = '#f38020'
    ctx.fillText('localizarme.com', 0, 0)
    ctx.restore()

    // Right domain (rotated 90°)
    ctx.save()
    ctx.translate(qrX + qrMaxSize + textSpacing, qrY + qrMaxSize / 2)
    ctx.rotate(Math.PI / 2)
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.font = `bold ${smallFontSize}px "Google Sans", sans-serif`
    ctx.fillStyle = '#f38020'
    ctx.fillText('contactomio.com', 0, 0)
    ctx.restore()

    // "Barba": CTA text (bottom, centered)
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    ctx.font = `bold ${smallFontSize}px "Google Sans", sans-serif`
    ctx.fillStyle = '#f38020'
    const barbaY = qrY + qrMaxSize + textSpacing
    ctx.fillText('Escanee QR para contactar al dueño', size / 2, barbaY)

    // Download
    const link = document.createElement('a')
    link.download = `qr-compact-${propsComputed.value.id}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()

    toast.success('QR compacto descargado como PNG')
    closeAll()
  } catch (error) {
    toast.error(`Error al descargar QR compacto: ${error}`)
  }
}

const handlePrint = () => {
  window.print()
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
      img: doc.data().img
    }));
    // toast.success(`Registros del QR actualizados`) // Silencing this as it fires on load
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

type ImageSettings = {
  src: string            // URL of the logo image
  x?: number             // Horizontal offset (centers by default)
  y?: number             // Vertical offset (centers by default)
  height: number         // Height of the image in pixels
  width: number          // Width of the image in pixels
  excavate?: boolean     // Remove modules behind the image
  borderRadius?: number  // Border radius of the image
}

import logoText from '@/assets/image33.png'
const imageSettings: ImageSettings = {
  src: logoText,
  height: 60,
  width: 840,
  excavate: false,
  borderRadius: 30,
}

const hiddeLogsHandle = () => {
  qrLogs.value = [];
  if (unsubscribeLogs) unsubscribeLogs();
  logsLoaded.value = false;
  showLogs.value = false;
}

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
              class="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider text-white"
              :class="currentStatus.bg">
              <span :class="['w-1.5 h-1.5 rounded-full text-white!', currentStatus.dot]"></span>
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
          <span class="text-white/30 text-[9px]  tracking-[0.2em] font-black font-mono">
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
          <button v-if="!logsLoaded && !showLogs" @click="loadLogs"
            class="text-xs text-orange-500 hover:text-orange-400 transition-colors flex items-center gap-1.5 cursor-pointer group border-spacing-0.5 border-dotted border-2 border-orange-500 rounded-md px-2 py-1 mb-2 hover:bg-orange-500/10">
            <span
              class="material-symbols-outlined text-[16px] group-hover:scale-110 transition-transform">history</span>
            <span class="font-medium">Ver registros de escaneo</span>
            <span v-if="isLogsLoading"
              class="material-symbols-outlined text-sm animate-spin ml-1">progress_activity</span>
          </button>
          <button v-if="logsLoaded && showLogs" @click="hiddeLogsHandle"
            class="text-xs text-orange-600 hover:text-orange-400 transition-colors flex items-center gap-1.5 cursor-pointer group border-spacing-0.5 border-dotted border-2 border-orange-600 rounded-md px-2 py-1 mb-2 hover:bg-orange-500/10">
            <span class="material-symbols-outlined text-[16px]! group-hover:scale-110 transition-transform">hide</span>
            <span class="font-medium">Ocultar registros</span>
            <span v-if="isLogsLoading"
              class="material-symbols-outlined text-sm animate-spin ml-1">progress_activity</span>
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
        <div
          class="w-34 h-34 sm:w-32 sm:h-32 rounded-3xl flex items-center justify-center bg-[#fff7ed] p-2.5 shadow-lg relative border border-[#f7b05c]">
          <template v-if="propsComputed.img">
            <img :src="propsComputed.img" class="w-full h-full object-cover rounded-xl" />
          </template>
          <template v-else>
            <QrcodeVue :value="qrScanUrl" :size="110" render-as="svg" level="H" />
          </template>
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

              <!-- Preview Card (Normal) -->
              <div v-if="downloadStyle === 'normal'" id="qr-print-area"
                class="bg-[#0a0401] rounded-xl px-3 py-3 w-full flex flex-row items-center gap-3 mb-4 border border-white/10 relative overflow-hidden max-h-[180px]"
                :style="previewAspectStyle">
                <!-- Grid pattern -->
                <div class="absolute inset-0 opacity-[0.04] pointer-events-none"
                  style="background-image: linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px);background-size:24px 24px;">
                </div>
                <!-- Orange glow -->
                <div
                  class="absolute top-0 left-0 w-full h-full pointer-events-none bg-gradient-to-br from-orange-500/10 via-transparent to-transparent">
                </div>
                <!-- QR Code (left) -->
                <div class="shrink-0 flex items-center justify-center bg-white p-1.5 rounded-xl shadow-lg z-10"
                  :style="qrPreviewSizeStyle">
                  <template v-if="propsComputed.img">
                    <img :src="propsComputed.img" ref="downloadImgRef"
                      class="w-full h-full object-contain rounded-lg" />
                  </template>
                  <template v-else>
                    <QrcodeVue ref="downloadQrRef" :value="qrDownloadUrl" :size="qrPreviewInnerSize"
                      render-as="canvas" />
                  </template>
                </div>
                <!-- Info (right) -->
                <div class="flex flex-col min-w-0 gap-0.5 z-10 flex-1">
                  <p class="text-white font-extrabold leading-tight truncate" :style="{ fontSize: titleFontSize }">{{
                    propsComputed.name
                    || 'Código QR' }}</p>
                  <p class="text-white font-bold font-mono" :style="{ fontSize: idFontSize }">
                    #{{ propsComputed.id }}
                  </p>
                  <div class="w-full h-px bg-white/10 my-0.5"></div>
                  <p class="text-white font-bold leading-tight" :style="{ fontSize: ctaFontSize }">
                    Escanee este QR para contactar al dueño de forma segura.
                  </p>
                  <div class="flex items-center gap-1">
                    <span class="material-symbols-outlined text-[#f38020]"
                      :style="{ fontSize: pinFontSize }">location_on</span>
                    <span class="text-[#f38020] font-black tracking-widest uppercase"
                      :style="{ fontSize: brandFontSize }">ubiqueme.com</span>
                  </div>
                </div>
              </div>

              <!-- Preview Card (Compacto) -->
              <div v-else id="qr-print-area"
                class="bg-white rounded-xl px-3 py-3 w-full flex flex-col items-center justify-center gap-2 mb-4 border border-white/10 relative aspect-square max-h-[200px] max-w-[200px] mx-auto">
                <!-- Ubiqueme.com top -->
                <span class="text-[#f38020] font-black tracking-widest uppercase"
                  :style="{ fontSize: brandFontSize }">ubiqueme.com</span>
                <!-- QR code centered -->
                <div class="shrink-0 flex items-center justify-center bg-white p-1 rounded-lg shadow-none z-10"
                  :style="qrCompactSizeStyle">
                  <template v-if="propsComputed.img">
                    <img :src="propsComputed.img" ref="downloadImgRef"
                      class="w-full h-full object-contain rounded-lg" />
                  </template>
                  <template v-else>
                    <QrcodeVue ref="downloadQrRef" :value="qrDownloadUrl" :size="qrCompactInnerSize"
                      render-as="canvas" />
                  </template>
                </div>
                <!-- Dominios laterales verticales -->
                <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span class="text-[#f38020] text-[8px] font-bold tracking-wider absolute"
                    style="left: 4px; top: 50%; transform: translateY(-50%) rotate(180deg); writing-mode: vertical-lr; text-orientation: mixed;">localizarme.com</span>
                  <span class="text-[#f38020] text-[8px] font-bold tracking-wider absolute"
                    style="right: 4px; top: 50%; transform: translateY(-50%); writing-mode: vertical-lr; text-orientation: mixed;">contactomio.com</span>
                </div>
                <!-- CTA -->
                <p class="text-[#f38020] font-bold text-center" :style="{ fontSize: compactCtaFontSize }">
                  Escanee QR para contactar al dueño
                </p>
              </div>

              <!-- Print tip -->
              <p class="text-white/40 text-[10px] text-center leading-relaxed mb-4">
                💡 Al imprimir, ajuste la <strong class="text-white/60">escala</strong> en las opciones de impresión
                para
                evitar que la imagen se agrande o recorte.
              </p>

              <!-- Action Buttons -->
              <div class="flex w-full gap-2">
                <button @click="downloadStyle === 'normal' ? handleDownloadPNG() : handleDownloadCompactPNG()"
                  class="flex-1 py-2.5 bg-[#f38020] text-white rounded-lg font-medium text-sm hover:bg-[#e07010] transition-colors active:scale-[0.98] cursor-pointer flex items-center justify-center gap-1.5">
                  <span class="material-symbols-outlined text-[16px]">download</span>
                  Descargar
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
