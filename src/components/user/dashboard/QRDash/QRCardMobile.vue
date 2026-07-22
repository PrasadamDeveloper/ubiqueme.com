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
import { toast } from 'vue-sonner'
import { nanoid } from 'nanoid'
import { useQRDownload } from '@/composables/useQRDownload'
import LogoWhite from '@/assets/Ubiqueme_Logo_white.webp'
import LogoUbiqueme from '@/assets/Logo_Ubiqueme_Small.webp'

const emit = defineEmits<{
  (e: 'request-physical', subscriptionId: string): void
}>()

const props = defineProps<IQRCard>()

const propsComputed = computed(() => ({ ...props }))

const showMenu = ref(false)
const activePrompt = ref<'cancel' | 'renew' | 'edit' | 'download' | null>(null)

const qrName = ref(propsComputed.value.name)

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
const isSubCanceled = computed(() => propsComputed.value.subscriptionStatus === 'canceled')
const isSubInactive = computed(() => propsComputed.value.subscriptionStatus === 'inactive')
const isDisabled = computed(() => isInactive.value || isCanceled.value || isSubCanceled.value || isSubInactive.value)

const currentStatus = computed(() => {
  if (propsComputed.value.isBanned) {
    return { bg: 'bg-red-500/20', text: 'text-red-500', dot: 'bg-red-500', label: 'Baneado' }
  }
  if (propsComputed.value.planType === 'bronce' && !qrStatusLoaded.value && propsComputed.value.status === 'Active') {
    return { bg: 'bg-slate-500/10', text: 'text-slate-400', dot: 'bg-slate-400', label: 'Sin publicar' }
  }
  return statusConfig[propsComputed.value.status] || { bg: 'bg-slate-500/10', text: 'text-slate-100', dot: 'bg-slate-400', label: 'Desconocido' }
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

const userStore = useUserStore()

const isMexicanPhone = computed(() => {
  const phone = userStore.getUserPhone
  return !!phone && phone.startsWith('52')
})

const isLoading = ref(false)

const handleEdit = async () => {
  try {
    isLoading.value = true
    const userQRDoc = doc(db, `users/${userStore.getUserId}/qrs/${props.id}`)
    const publicQrDoc = doc(db, 'publicQR', props.id)
    const batch = writeBatch(db)
    batch.update(userQRDoc, { name: qrName.value })
    const publicSnap = await getDoc(publicQrDoc)
    if (publicSnap.exists()) {
      batch.update(publicQrDoc, { name: qrName.value })
    }
    await batch.commit()
    closeAll()
    toast.success(`Nombre de QR actualizado`)
    isLoading.value = false
  } catch (error) {
    isLoading.value = false
    const e = error as Error
    toast.error(`Error al editar el nombre del QR: ${e.message}`)
  }
}

const _setQrPublic = async () => {
  showMenu.value = false
  try {
    isLoading.value = true
    const batch = writeBatch(db)
    const publicQrRef = doc(db, 'publicQR', props.id)
    const publicSnap = await getDoc(publicQrRef)
    const isNew = !publicSnap.exists()
    const publicQRData: Record<string, unknown> = {
      id: props.id, name: props.name, docId: props.id, status: 'Active',
      isPublic: true, isBanned: false, banReason: '', totalScans: props.scans,
      lastScan: null, uid: userStore.getUserId, tier: props.subscriptionId,
      category: props.category ?? '',
    }
    if (isNew) publicQRData.createdAt = Timestamp.now()
    const qrDoc = doc(db, `users/${userStore.getUserId}/qrs/${props.id}`)
    batch.update(qrDoc, { status: 'Active' })
    if (isNew) {
      batch.set(publicQrRef, publicQRData)
    } else {
      batch.update(publicQrRef, { status: 'Active', isPublic: true })
    }
    await batch.commit()
    isLoading.value = false
    toast.success(`QR establecido como público`)
  } catch (error) {
    isLoading.value = false
    const e = error as Error
    toast.error(`Error al hacer público el QR: ${e.message}`)
  }
}

const _setQrPrivate = async () => {
  showMenu.value = false
  try {
    isLoading.value = true
    const batch = writeBatch(db)
    const publicQrRef = doc(db, 'publicQR', props.id)
    const qrDoc = doc(db, `users/${userStore.getUserId}/qrs/${props.id}`)
    const publicSnap = await getDoc(publicQrRef)
    if (publicSnap.exists()) {
      batch.update(publicQrRef, { isPublic: false, status: 'Paused' })
    }
    batch.update(qrDoc, { status: 'Paused' })
    await batch.commit()
    qrStatusLoaded.value = false
    isLoading.value = false
    toast.success(`QR establecido como privado`)
  } catch (error) {
    isLoading.value = false
    const e = error as Error
    toast.error(`Error al hacer privado el QR: ${e.message}`)
  }
}

let unsubscribe: Unsubscribe

const qrStatusLoaded = ref(false)
const qrStatus = reactive({ totalScans: 0, lastScan: Timestamp.now() ?? 'No se ha escaneado aún' })
const loadCount = ref(0)

onMounted(() => {
  unsubscribe = onSnapshot(doc(db, 'publicQR', props.id), (docSnapshot) => {
    if (!docSnapshot.exists()) return
    qrStatusLoaded.value = true
    qrStatus.totalScans = docSnapshot.data().totalScans ?? 0
    qrStatus.lastScan = docSnapshot.data().lastScan ?? 'No se ha escaneado aún'
    loadCount.value++
  }, (error) => {
    toast.error(`Error al obtener datos: ${error}`)
    if (unsubscribe) unsubscribe()
  })
})

onUnmounted(() => {
  if (unsubscribe) unsubscribe()
})

const handleCancelQR = async () => {
  try {
    isLoading.value = true
    const batch = writeBatch(db)
    const userQRDoc = doc(db, `users/${userStore.getUserId}/qrs/${props.id}`)
    const publicQrDoc = doc(db, 'publicQR', props.id)
    batch.update(userQRDoc, { status: 'Canceled' })
    const publicSnap = await getDoc(publicQrDoc)
    if (publicSnap.exists()) batch.update(publicQrDoc, { status: 'Canceled' })
    const subDoc = doc(db, `users/${userStore.getUserId}/subscriptions/${props.subscriptionId}`)
    batch.update(subDoc, { totalQRsCreated: increment(-1) })
    await batch.commit()
    closeAll()
    toast.success(`QR desactivado permanentemente`)
  } catch (error) {
    const e = error as Error
    toast.error(`Error al desactivar QR: ${e.message}`)
  } finally {
    isLoading.value = false
  }
}

const handleRenewQR = async () => {
  try {
    isLoading.value = true
    const newId = nanoid(15)
    const batch = writeBatch(db)
    const oldUserQRDoc = doc(db, `users/${userStore.getUserId}/qrs/${props.id}`)
    batch.update(oldUserQRDoc, { status: 'Inactive', isActive: false })
    const oldPublicDoc = doc(db, 'publicQR', props.id)
    const oldPublicSnap = await getDoc(oldPublicDoc)
    if (oldPublicSnap.exists()) batch.update(oldPublicDoc, { status: 'Inactive' })
    const now = Timestamp.now()
    const userQrData = {
      banReason: '', category: props.category, createdAt: now, docId: newId,
      freeShipmentUsed: props.freeShipmentUsed ?? false, id: newId, img: props.img ?? '',
      isActive: true, isBanned: false, lastScan: '', link: props.link ?? '',
      name: props.name, physicalShipped: props.physicalShipped ?? false,
      physicalShippedAt: props.physicalShippedAt ?? '', scans: 0, shippingNotes: '',
      status: 'Active' as TQRStatus, subscriptionId: props.subscriptionId, uid: userStore.getUserId,
    }
    const newUserQRDoc = doc(db, `users/${userStore.getUserId}/qrs/${newId}`)
    batch.set(newUserQRDoc, userQrData)
    const newPublicDoc = doc(db, 'publicQR', newId)
    batch.set(newPublicDoc, {
      id: newId, name: props.name, category: props.category, status: 'Active',
      isPublic: true, isBanned: false, banReason: '', totalScans: 0,
      lastScan: null, uid: userStore.getUserId, tier: props.planType ?? 'free',
      createdAt: now, docId: newId,
    })
    await batch.commit()
    closeAll()
    toast.success(`QR reemplazado exitosamente. Nuevo ID: ${newId}`)
  } catch (error) {
    const e = error as Error
    toast.error(`Error al reemplazar QR: ${e.message}`)
  } finally {
    isLoading.value = false
  }
}

const canMakePublic = computed(() => propsComputed.value.planType && propsComputed.value.planType !== 'bronce')
const canMakePrivate = computed(() => qrStatusLoaded.value || canMakePublic.value)

const menuOptions = [
  { label: 'Descargar QR', icon: 'download', description: 'Descargar imagen PNG o PDF imprimible', action: () => openPrompt('download') },
  { divider: true },
  { label: 'Editar nombre', icon: 'edit', description: 'Cambiar el nombre de su QR', action: () => openPrompt('edit') },
  { label: 'Reemplazar QR', icon: 'autorenew', description: 'Crea un QR completamente nuevo', action: () => openPrompt('renew') },
  { divider: true },
  { label: 'Pedir QR físico', icon: 'local_shipping', description: 'Solicitar su código QR físico', action: () => { closeAll(); emit('request-physical', props.subscriptionId) }, locked: !isMexicanPhone.value, lockTooltip: 'Solo disponible para México (+52)' },
  { label: 'Activar QR', icon: 'public', description: 'Activa el QR para escaneo público', action: canMakePublic.value ? _setQrPublic : undefined, locked: !canMakePublic.value, lockTooltip: 'Plan Plata u Oro requerido' },
  { label: 'Desactivar QR', icon: 'visibility_off', description: 'Pausa el QR temporalmente', action: canMakePrivate.value ? _setQrPrivate : undefined, locked: !canMakePrivate.value, lockTooltip: 'Plan Plata u Oro requerido' },
  { divider: true },
  { label: 'Eliminar QR', icon: 'block', description: 'Desactivar permanentemente', action: () => openPrompt('cancel'), color: 'text-rose-400', hoverBg: 'hover:bg-rose-500/10' },
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

// Rotate wrapper dimensions for compact side domains
const compactSideWrapStyle = computed(() => {
  const fontSize = currentCompactSize.value.size * compactDomainTextScale.value.bottom
  const wrapWidth = Math.round(fontSize * 2.5)
  const wrapHeight = Math.round(fontSize * 0.62 * 15)
  return {
    width: `${wrapWidth}px`,
    height: `${wrapHeight}px`,
  }
})

const compactSideTextStyle = computed(() => {
  const fontSize = currentCompactSize.value.size * compactDomainTextScale.value.bottom
  return {
    fontSize: `${Math.round(fontSize)}px`,
  }
})

onMounted(generateHighResQR)
watch(() => propsComputed.value.name, generateHighResQR)

const qrLogs = ref<IQRLog[]>([])
const logsLoaded = ref(false)
const isLogsLoading = ref(false)
const showLogs = ref(false)

let unsubscribeLogs: Unsubscribe

const loadLogs = () => {
  if (logsLoaded.value) return
  isLogsLoading.value = true
  const qrsLogsRef = collection(db, `publicQR/${props.id}/logs`)
  const queryLogs = query(qrsLogsRef, orderBy("scanDate", "desc"))
  unsubscribeLogs = onSnapshot(queryLogs, (querySnapshot) => {
    isLogsLoading.value = false
    logsLoaded.value = true
    if (querySnapshot.empty) {
      qrLogs.value = []
      showLogs.value = true
      return
    }
    qrLogs.value = []
    showLogs.value = true
    qrLogs.value = querySnapshot.docs.map(doc => ({
      id: doc.id, scanDate: doc.data().scanDate, scanMetrics: doc.data().scanMetrics,
      interaction: doc.data().interaction, img: doc.data().img, scannerPhone: doc.data().scannerPhone
    }))
    loadCount.value++
  }, (error) => {
    isLogsLoading.value = false
    showLogs.value = false
    toast.error(`Error al obtener datos de registros: ${error}`)
  })
}

onUnmounted(() => { if (unsubscribeLogs) unsubscribeLogs() })

const imageSettings = computed<ImageSettings>(() => {
  const logoSize = Math.round(currentSize.value.qrSize * 1.3)
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

const hiddeLogsHandle = () => {
  qrLogs.value = []
  if (unsubscribeLogs) unsubscribeLogs()
  logsLoaded.value = false
  showLogs.value = false
}
</script>

<template>
  <!-- Android M3 Card -->
  <div
    class="relative w-full bg-[#18171a] rounded-2xl overflow-hidden font-google-sans shadow-sm border border-double  border-[#491e0a]"
    :class="{ 'opacity-50 grayscale': isDisabled, 'grayscale-[50%] brightness-75': isCanceled }">

    <!-- Loading overlay -->
    <section v-if="isLoading" class="absolute inset-0 bg-[#1C1B1F]/95 flex items-center justify-center z-50">
      <CloudLoader />
    </section>

    <!-- ─── Overlay bloqueador para QR cancelado/inactivo ─── -->
    <div v-if="isDisabled"
      class="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-[#1C1B1F]/80 backdrop-blur-[2px] rounded-2xl cursor-default select-none">
      <span class="material-symbols-outlined notranslate text-4xl text-white/15">block</span>
      <span class="text-white/30 text-xs font-medium">QR {{ isCanceled ? 'cancelado' : 'inactivo' }} — no
        disponible</span>
    </div>

    <!-- Main layout: vertical stack (QR top, info bottom) -->
    <div class="relative z-10 flex flex-col">

      <!-- QR Code Section - Hero area -->
      <div class="flex items-center justify-center pt-6 pb-4 px-4 relative">
        <!-- Subtle glow behind QR -->
        <div
          class="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 bg-orange-500/10 rounded-full blur-[60px] pointer-events-none">
        </div>
        <div
          class="w-36 h-36 rounded-2xl flex items-center justify-center bg-[#fff7ed] p-2.5 shadow-lg relative border border-[#f7b05c]/50">
          <template v-if="propsComputed.img">
            <img :src="propsComputed.img" class="w-full h-full object-cover rounded-xl" />
          </template>
          <template v-else>
            <QrcodeVue :value="qrScanUrl" :size="130" render-as="svg" level="H" :image-settings="imageSettingsUIOnly" />
          </template>
        </div>
      </div>

      <!-- Info section -->
      <div class="px-4 pb-4 space-y-2.5">
        <!-- Header row: name + menu + status -->
        <div class="flex items-start justify-between gap-2">
          <div class="flex-1 min-w-0">
            <h3 class="text-base font-bold text-[#E6E1E5] leading-tight truncate">{{ propsComputed.name || 'Código QR'
              }}</h3>
            <div class="flex items-center gap-2 mt-0.5">
              <span class="text-[#CAC4D0]/40 text-[8px] tracking-[0.15em] font-mono font-bold">#{{ propsComputed.id
                }}</span>
              <span
                :class="['inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider', currentStatus.bg]">
                <span :class="['w-1.5 h-1.5 rounded-full', currentStatus.dot]"></span>
                <span :class="currentStatus.text">{{ currentStatus.label }}</span>
              </span>
            </div>
          </div>
          <!-- Menu trigger button -->
          <button @click="toggleMenu($event)"
            class="shrink-0 w-9 h-9 flex items-center justify-center rounded-xl text-[#CAC4D0]/60 hover:text-white hover:bg-white/10 active:scale-95 transition-all cursor-pointer">
            <span class="material-symbols-outlined notranslate text-[22px]">more_vert</span>
          </button>
        </div>

        <!-- Stats row -->
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-1.5">
            <span class="material-symbols-outlined notranslate text-[#CAC4D0]/40 text-[14px]">qr_code_scanner</span>
            <span class="text-[#CAC4D0]/50 text-[9px] uppercase tracking-[0.1em] font-bold">Escaneos</span>
            <span class="text-orange-400 font-mono text-sm font-bold">{{ qrStatus.totalScans }}</span>
          </div>
          <button @click="openPrompt('download')"
            class="ml-auto flex items-center gap-1 px-3 py-1.5 bg-orange-500/10 text-orange-400 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all active:scale-95 border border-orange-500/20 cursor-pointer">
            <span class="material-symbols-outlined notranslate text-[14px]">download</span>
            Descargar
          </button>
        </div>

        <!-- Logs toggle -->
        <div class="pt-1">
          <button v-if="!logsLoaded && !showLogs" @click="loadLogs"
            class="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg border border-dashed border-[#49454F]/50 text-[#CAC4D0]/60 text-[10px] font-medium hover:border-orange-500/30 hover:text-orange-400 transition-all cursor-pointer">
            <span class="material-symbols-outlined notranslate text-[14px]">history</span>
            Ver registros de escaneo
            <span v-if="isLogsLoading"
              class="material-symbols-outlined notranslate text-sm animate-spin">progress_activity</span>
          </button>
          <button v-if="logsLoaded && showLogs" @click="hiddeLogsHandle"
            class="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg border border-dashed border-[#49454F]/50 text-[#CAC4D0]/40 text-[10px] font-medium hover:text-orange-400 transition-all cursor-pointer">
            <span class="material-symbols-outlined notranslate text-[14px]">hide</span>
            Ocultar registros
          </button>

          <div v-if="logsLoaded && isLogsLoading" class="flex items-center gap-2 text-xs text-white/30 py-2">
            <span class="w-3 h-3 border border-orange-400/40 border-t-transparent rounded-full animate-spin"></span>
            Cargando registros...
          </div>

          <div v-if="logsLoaded && !isLogsLoading" class="space-y-2 max-h-48 overflow-y-auto pr-1 scrollbar-thin mt-2">
            <div v-if="qrLogs.length === 0" class="text-[#CAC4D0]/30 text-[10px] py-2 text-center">
              Sin registros de escaneo aún
            </div>
            <QRCardLog v-for="log in qrLogs" :key="log.id" v-bind="log" />
          </div>
        </div>
      </div>
    </div>

    <!-- ─── Mobile Bottom Sheet Menu ─── -->
    <Teleport to="body">
      <Transition enter-active-class="transition-all duration-300 ease-out" enter-from-class="opacity-0"
        enter-to-class="opacity-100" leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="opacity-100" leave-to-class="opacity-0">
        <div v-if="showMenu" @click="showMenu = false" class="fixed inset-0 bg-black/40 z-40 cursor-default"></div>
      </Transition>
      <Transition enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="opacity-0 translate-y-full" enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition-all duration-200 ease-in" leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 translate-y-full">
        <div v-if="showMenu"
          class="fixed bottom-0 left-0 right-0 z-50 bg-[#2B2930] rounded-t-2xl pb-[env(safe-area-inset-bottom,16px)] max-h-[80vh] overflow-y-auto shadow-[0_-8px_30px_rgba(0,0,0,0.5)]">
          <!-- Handle bar -->
          <div class="w-10 h-1 bg-[#CAC4D0]/20 rounded-full mx-auto my-3"></div>

          <!-- Title + Close button -->
          <div class="flex items-center justify-between px-4 mb-2">
            <span class="text-[#CAC4D0]/50 text-[10px] font-bold uppercase tracking-widest">Opciones del QR</span>
            <button @click="showMenu = false"
              class="w-8 h-8 flex items-center justify-center rounded-lg text-[#CAC4D0]/60 hover:text-white hover:bg-white/10 transition-all cursor-pointer">
              <span class="material-symbols-outlined notranslate text-[18px]">close</span>
            </button>
          </div>

          <div class="px-2 pb-2 space-y-0.5">
            <template v-for="(option, index) in menuOptions" :key="index">
              <div v-if="option.divider" class="h-px bg-[#49454F]/30 my-1 mx-4"></div>

              <!-- Locked option -->
              <div v-else-if="option.locked"
                class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-[#CAC4D0]/30 cursor-not-allowed opacity-60">
                <span class="material-symbols-outlined notranslate text-[20px] text-[#CAC4D0]/20">lock</span>
                <div>
                  <span class="text-sm font-medium text-[#CAC4D0]/50">{{ option.label }}</span>
                  <span class="text-[10px] text-[#CAC4D0]/20 font-normal block leading-tight">{{ option.lockTooltip
                    }}</span>
                </div>
              </div>

              <!-- Action option -->
              <button v-else @click="option.action" :class="['w-full flex items-center gap-3 cursor-pointer px-4 py-3 rounded-xl bg-transparent text-sm transition-colors text-left font-medium active:scale-[0.98]',
                option.color || 'text-[#E6E1E5]', option.hoverBg || 'hover:bg-white/5 active:bg-white/10']">
                <span
                  :class="[option.color || 'text-orange-400', 'material-symbols-outlined notranslate text-[20px]']">{{
                    option.icon }}</span>
                <div>
                  <span>{{ option.label }}</span>
                  <span class="text-[10px] text-[#CAC4D0]/30 font-normal block leading-tight">{{ option.description
                    }}</span>
                </div>
              </button>
            </template>
          </div>

        </div>
      </Transition>
    </Teleport>

    <!-- ─── Overlay Prompts (M3 Alert Dialog style) ─── -->
    <!-- Cancel Prompt -->
    <Transition enter-active-class="transition-all duration-200 ease-out" enter-from-class="opacity-0"
      enter-to-class="opacity-100" leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100" leave-to-class="opacity-0">
      <div v-if="activePrompt" class="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-6">
        <div v-if="activePrompt === 'cancel'"
          class="w-full max-w-xs bg-[#2B2930] rounded-2xl p-6 shadow-2xl border border-[#49454F]/30 space-y-4">
          <div class="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center mx-auto">
            <span class="material-symbols-outlined notranslate text-rose-500 text-[24px]">warning</span>
          </div>
          <div class="text-center">
            <h3 class="text-[#E6E1E5] text-base font-medium">¿Desactivar código?</h3>
            <p class="text-[#CAC4D0]/60 text-sm mt-1 leading-relaxed">Esta acción desactivará el código inmediatamente.
            </p>
          </div>
          <div class="flex gap-3">
            <button @click="closeAll"
              class="flex-1 py-2.5 bg-[#49454F]/30 text-[#E6E1E5] rounded-xl text-sm font-medium hover:bg-[#49454F]/50 transition-colors cursor-pointer">Cancelar</button>
            <button @click="handleCancelQR"
              class="flex-1 py-2.5 bg-rose-500 text-white rounded-xl text-sm font-medium hover:bg-rose-600 transition-colors active:scale-[0.98] cursor-pointer">Desactivar</button>
          </div>
        </div>

        <!-- Renew Prompt -->
        <div v-else-if="activePrompt === 'renew'"
          class="w-full max-w-xs bg-[#2B2930] rounded-2xl p-6 shadow-2xl border border-[#49454F]/30 space-y-4">
          <div class="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center mx-auto">
            <span class="material-symbols-outlined notranslate text-rose-500 text-[24px]">warning</span>
          </div>
          <div class="text-center">
            <h3 class="text-[#E6E1E5] text-base font-medium">¿Reemplazar QR?</h3>
            <p class="text-[#CAC4D0]/60 text-xs mt-1 leading-relaxed">El código anterior dejará de funcionar. Se creará
              uno
              nuevo con ID diferente. Los stickers físicos quedarán inservibles.</p>
          </div>
          <div class="flex gap-3">
            <button @click="closeAll"
              class="flex-1 py-2.5 bg-[#49454F]/30 text-[#E6E1E5] rounded-xl text-sm font-medium hover:bg-[#49454F]/50 transition-colors cursor-pointer">Cancelar</button>
            <button @click="handleRenewQR"
              class="flex-1 py-2.5 bg-rose-500 text-white rounded-xl text-sm font-medium hover:bg-rose-600 transition-colors active:scale-[0.98] cursor-pointer flex items-center justify-center gap-1.5">
              <span class="material-symbols-outlined notranslate text-[16px]">autorenew</span>
              Reemplazar
            </button>
          </div>
        </div>

        <!-- Edit Prompt -->
        <div v-else-if="activePrompt === 'edit'"
          class="w-full max-w-xs bg-[#2B2930] rounded-2xl p-6 shadow-2xl border border-[#49454F]/30 space-y-4">
          <h3 class="text-[#E6E1E5] text-base font-medium text-center">Editar nombre</h3>
          <input @keyup.enter="handleEdit" type="text" v-model="qrName" placeholder="Nuevo nombre"
            class="w-full bg-[#1C1B1F] border border-[#49454F]/50 rounded-xl px-4 py-3 text-[#E6E1E5] text-sm transition-all focus:outline-none focus:border-orange-500/50 placeholder:text-[#CAC4D0]/30" />
          <div class="flex gap-3">
            <button @click="closeAll"
              class="flex-1 py-2.5 bg-[#49454F]/30 text-[#E6E1E5] rounded-xl text-sm font-medium hover:bg-[#49454F]/50 transition-colors cursor-pointer">Cancelar</button>
            <button @click="handleEdit"
              class="flex-1 py-2.5 bg-orange-500 text-black rounded-xl text-sm font-bold hover:bg-orange-400 transition-colors active:scale-[0.98] cursor-pointer">Guardar</button>
          </div>
        </div>

        <!-- Download Bottom Sheet (mobile - within activePrompt) -->
        <div v-else-if="activePrompt === 'download'" class="fixed inset-0 flex items-end z-[120] bottom-16">
          <div @click="closeAll" class="absolute inset-0 bg-black/60 cursor-default"></div>
          <div
            class="relative w-full bg-[#2B2930] rounded-t-2xl pb-[env(safe-area-inset-bottom,16px)] max-h-[85vh] overflow-y-auto shadow-[0_-8px_30px_rgba(0,0,0,0.5)]">
            <!-- Handle bar -->
            <div class="w-10 h-1 bg-[#CAC4D0]/20 rounded-full mx-auto my-3"></div>
            <div class="px-5 pb-6">
              <div class="flex items-center justify-between mb-4 px-1">
                <h3 class="text-[#E6E1E5] font-bold text-base">Descargar QR</h3>
                <button @click="closeAll"
                  class="w-8 h-8 flex items-center justify-center rounded-lg text-[#CAC4D0]/60 hover:text-white hover:bg-white/10 transition-all cursor-pointer">
                  <span class="material-symbols-outlined notranslate text-[18px]">close</span>
                </button>
              </div>

              <!-- Preview -->
              <div class="flex justify-center mb-4">
                <div
                  class="rounded-2xl bg-gradient-to-br from-[#f97316] to-[#fed7aa] border border-orange-300 p-4 w-full max-w-[260px]">
                  <!-- Logo top-right -->

                  <template v-if="downloadStyle === 'normal'">
                    <span class="block text-center text-white font-black tracking-[0.15em] uppercase mb-2"
                      :style="{ fontSize: `${Math.round(currentSize.width * domainTextScale.top) - 5}px` }">ubiqueme.com</span>
                    <div class="flex items-center justify-center gap-1.5">
                      <div class="shrink-0 bg-white rounded-xl p-1">
                        <QrcodeVue :value="qrScanUrl" :size="64" render-as="canvas" level="H" />
                      </div>
                      <div class="flex flex-col flex-1 min-w-0 gap-0.5">
                        <p class="text-black font-extrabold text-xs leading-tight truncate">{{ propsComputed.name ||
                          'Código QR' }}</p>
                        <p class="text-black/60 font-mono font-bold text-[8px]">#{{ propsComputed.id }}</p>
                        <p class="text-black/70 font-semibold text-[8px] leading-tight">Escanee QR para contactar al
                          responsable.</p>
                        <p class="text-black font-semibold text-[5px] leading-tight text-center mt-1">QR oficial de
                          Ubiqueme.com® — Marca 100% segura y verificada.</p>
                      </div>
                    </div>
                    <div class="flex items-center justify-center gap-2 mt-1.5">
                      <span class="text-white font-bold uppercase tracking-wider"
                        :style="{ fontSize: `${Math.round(currentSize.width * domainTextScale.bottom) - 9}px` }">localizarme.com</span>
                      <span class="text-white/50"
                        :style="{ fontSize: `${Math.round(currentSize.width * domainTextScale.bottom)}px` }">•</span>
                      <span class="text-white font-bold uppercase tracking-wider"
                        :style="{ fontSize: `${Math.round(currentSize.width * domainTextScale.bottom) - 9}px` }">contactomio.com</span>
                    </div>
                  </template>
                  <template v-else>
                    <!-- Compact static preview (mobile, square 150×150) -->
                    <div class="relative z-10 flex flex-col items-center justify-center gap-0.5 mx-auto"
                      style="width:150px;height:150px;">
                      <span
                        class="text-white font-black tracking-[0.15em] uppercase text-[6px] scale-250">ubiqueme.com</span>
                      <div class="relative flex items-center justify-center mx-auto flex-1 w-full"
                        style="min-height:0;">
                        <span
                          class="absolute -left-13 text-white font-bold uppercase tracking-[0.15em] text-[4px] whitespace-nowrap origin-center -rotate-90 scale-200"
                          translate="no">contactomio.com</span>
                        <div class="bg-white rounded-lg p-1">
                          <template v-if="propsComputed.img">
                            <img :src="propsComputed.img" class="w-full h-full object-contain" />
                          </template>
                          <template v-else>
                            <QrcodeVue :value="qrScanUrl" :size="96" render-as="canvas" level="H" />
                          </template>
                        </div>
                        <span
                          class="absolute -right-13 text-white font-bold uppercase tracking-[0.15em] text-[4px] whitespace-nowrap origin-center rotate-90 scale-200"
                          translate="no">localizarme.com</span>
                      </div>
                      <p class="text-white/80 text-[5px] text-center font-semibold scale-200">Escanee este QR para
                        contactar
                        al
                        responsable.
                      </p>
                    </div>
                  </template>
                </div>
              </div>

              <!-- Style + Size toggles -->
              <div class="flex gap-2 mb-4 ">
                <div class="flex gap-1 p-0.5 bg-[#1C1B1F] rounded-xl flex-1">
                  <button @click="downloadStyle = 'normal'"
                    class="flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer"
                    :class="downloadStyle === 'normal' ? 'bg-orange-500 text-white' : 'text-[#CAC4D0]/50 hover:text-white'">Normal</button>
                  <button @click="downloadStyle = 'compact'"
                    class="flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer"
                    :class="downloadStyle === 'compact' ? 'bg-orange-500 text-white' : 'text-[#CAC4D0]/50 hover:text-white'">Compacto</button>
                </div>
                <div class="flex gap-1 p-0.5 bg-[#1C1B1F] rounded-xl">
                  <button @click="downloadSize = 'sm'"
                    class="px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer"
                    :class="downloadSize === 'sm' ? 'bg-orange-500/20 border border-orange-500/50 text-orange-400' : 'text-[#CAC4D0]/50 hover:text-white'">SM</button>
                  <button @click="downloadSize = 'md'"
                    class="px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer"
                    :class="downloadSize === 'md' ? 'bg-orange-500/20 border border-orange-500/50 text-orange-400' : 'text-[#CAC4D0]/50 hover:text-white'">MD</button>
                  <button @click="downloadSize = 'lg'"
                    class="px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer"
                    :class="downloadSize === 'lg' ? 'bg-orange-500/20 border border-orange-500/50 text-orange-400' : 'text-[#CAC4D0]/50 hover:text-white'">LG</button>
                </div>
              </div>

              <!-- Format toggle: PNG | PDF -->
              <div class="flex gap-2 mb-4">
                <div class="flex gap-1 p-0.5 bg-[#1C1B1F] rounded-xl flex-1">
                  <button @click="downloadFormat = 'png'"
                    class="flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer"
                    :class="downloadFormat === 'png' ? 'bg-orange-500 text-white' : 'text-[#CAC4D0]/50 hover:text-white'">PNG</button>
                  <button @click="downloadFormat = 'pdf'"
                    class="flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer"
                    :class="downloadFormat === 'pdf' ? 'bg-orange-500 text-white' : 'text-[#CAC4D0]/50 hover:text-white'">PDF</button>
                </div>
                <div class="flex gap-1 p-0.5 bg-[#1C1B1F] rounded-xl flex-1 hidden">
                  <button @click="downloadStyle = 'normal'"
                    class="flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer"
                    :class="downloadStyle === 'normal' ? 'bg-orange-500 text-white' : 'text-[#CAC4D0]/50 hover:text-white'">Normal</button>
                  <button @click="downloadStyle = 'compact'"
                    class="flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer"
                    :class="downloadStyle === 'compact' ? 'bg-orange-500 text-white' : 'text-[#CAC4D0]/50 hover:text-white'">Compacto</button>
                </div>
                <div class="flex gap-1 p-0.5 bg-[#1C1B1F] rounded-xl">
                  <button @click="downloadSize = 'sm'"
                    class="px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer"
                    :class="downloadSize === 'sm' ? 'bg-orange-500/20 border border-orange-500/50 text-orange-400' : 'text-[#CAC4D0]/50 hover:text-white'">SM</button>
                  <button @click="downloadSize = 'md'"
                    class="px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer"
                    :class="downloadSize === 'md' ? 'bg-orange-500/20 border border-orange-500/50 text-orange-400' : 'text-[#CAC4D0]/50 hover:text-white'">MD</button>
                  <button @click="downloadSize = 'lg'"
                    class="px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer"
                    :class="downloadSize === 'lg' ? 'bg-orange-500/20 border border-orange-500/50 text-orange-400' : 'text-[#CAC4D0]/50 hover:text-white'">LG</button>
                </div>
              </div>

              <button @click="handleDownload(closeAll)" :disabled="isDownloading"
                class="w-full py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-bold text-sm hover:brightness-110 transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20">
                <span class="material-symbols-outlined notranslate text-[18px]">download</span>
                {{ getDownloadLabel }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- === PLANTILLAS DE DESCARGA (CAPTURA html2canvas) === -->
    <div style="position:absolute;left:-9999px;top:0;">

      <!-- === NORMAL CAPTURE TEMPLATE START === -->
      <div :id="`qr-capture-normal-${props.id}`"
        :style="`width:${currentSize.width}px;height:${currentSize.height}px;padding:${currentSize.width * 0.06}px;background:linear-gradient(135deg,#f97316,#fed7aa);font-family:'Google Sans',sans-serif;position:relative;overflow:hidden;box-sizing:border-box;margin-bottom:24px;`">
        <!-- Logo top-right -->
        <div
          :style="`position:absolute;top:${currentSize.width * 0.015}px;right:${currentSize.width * 0.015}px;background:rgba(0,0,0,0.8);border-radius:${currentSize.width * 0.015}px;padding:${currentSize.width * 0.008}px;z-index:5;pointer-events:none;`">
          <img :src="LogoWhite"
            :style="`width:${currentSize.width * logoScale}px;height:auto;opacity:0.9;display:block;`" alt="Ubiqueme" />
        </div>
        <!-- Inner layout: column -->
        <div
          style="display:flex;flex-direction:column;align-items:center;justify-content:center;width:100%;height:100%;gap:8px;">
          <!-- ubiqueme.com top center -->
          <span
            :style="`color:#fff;font-weight:900;letter-spacing:0.15em;text-transform:uppercase;font-size:${currentSize.width * domainTextScale.top}px;text-align:center;`">ubiqueme.com</span>
          <!-- Row: QR + info -->
          <div
            style="display:flex;flex-direction:row;align-items:center;justify-content:center;gap:8px;flex:1;width:100%;">
            <div
              :style="`flex-shrink:0;width:${currentSize.qrSize + 8}px;height:${currentSize.qrSize + 8}px;background:#fff;border-radius:${currentSize.width * 0.025}px;padding:4px;display:flex;align-items:center;justify-content:center;overflow:hidden;`">
              <template v-if="propsComputed.img">
                <img :src="propsComputed.img"
                  :style="`width:${currentSize.qrSize}px;height:${currentSize.qrSize}px;object-fit:contain;display:block;`" />
              </template>
              <template v-else>
                <QrcodeVue :value="qrScanUrl" :size="currentSize.qrSize * 4" render-as="canvas" level="H"
                  :image-settings="imageSettings"
                  :style="`width:${currentSize.qrSize}px;height:${currentSize.qrSize}px;max-width:100%;max-height:100%;display:block;`" />
              </template>
            </div>
            <div style="display:flex;flex-direction:column;gap:6px;flex:1;min-width:0;align-self:center;">
              <p
                :style="`color:#000;font-size:${currentSize.width * textScale.name}px;font-weight:900;margin:0;line-height:1.1;`">
                {{ propsComputed.name || 'Código QR' }}
              </p>
              <p
                :style="`color:rgba(0,0,0,0.7);font-size:${currentSize.width * textScale.desc}px;font-weight:500;margin:0;line-height:1.2;`">
                Escanee este código QR para contactar al responsable por whatsapp.
              </p>
              <p
                :style="`color:#000;font-size:${Math.round(currentSize.width * 0.022)}px;font-weight:500;margin:3px 0 0;line-height:1.2;text-align:center;`">
                QR oficial de Ubiqueme.com® — Marca 100% segura y verificada.
              </p>
            </div>
          </div>
          <!-- Domains bottom center -->
          <div style="display:flex;flex-direction:row;align-items:center;justify-content:center;gap:6px;">
            <span
              :style="`color:#fff;font-weight:700;text-transform:uppercase;font-size:${currentSize.width * domainTextScale.bottom}px;letter-spacing:1px;`">localizarme.com</span>
            <span
              :style="`color:rgba(255,255,255,0.5);font-size:${currentSize.width * domainTextScale.bottom}px;`">•</span>
            <span
              :style="`color:#fff;font-weight:700;text-transform:uppercase;font-size:${currentSize.width * domainTextScale.bottom}px;letter-spacing:1px;`">contactomio.com</span>
          </div>
        </div>
      </div>
      <!-- === NORMAL CAPTURE TEMPLATE END === -->

      <!-- === COMPACT CAPTURE TEMPLATE START === -->
      <div :id="`qr-capture-compact-${props.id}`" class="compact-wrap">
        <span class="compact-top">ubiqueme.com</span>
        <div class="compact-row">
          <div class="compact-side-wrap" :style="compactSideWrapStyle">
            <span class="compact-side-text" translate="no" :style="compactSideTextStyle">contactomio.com</span>
          </div>
          <div class="compact-qr-holder">
            <template v-if="propsComputed.img">
              <img :src="propsComputed.img" class="compact-qr" />
            </template>
            <template v-else>
              <img :src="qrHighResUrl" class="compact-qr" />
            </template>
          </div>
          <div class="compact-side-wrap" :style="compactSideWrapStyle">
            <span class="compact-side-text" translate="no" :style="compactSideTextStyle">localizarme.com</span>
          </div>
        </div>
        <span class="compact-bottom">Escanee este QR para contactar al responsable</span>
      </div>
      <!-- === COMPACT CAPTURE TEMPLATE END === -->
    </div>
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
  background: rgba(249, 115, 22, 0.2);
  border-radius: 999px;
}

.scrollbar-thin::-webkit-scrollbar-thumb:hover {
  background: rgba(249, 115, 22, 0.4);
}

/* Compact template */
.compact-wrap {
  padding: 6px;
  background: linear-gradient(125deg, #f97316, #fcbd74);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0;
  font-family: 'Google Sans', sans-serif;
  margin-bottom: 24px;
  box-sizing: border-box;
  width: v-bind('currentCompactSize.size + "px"');
  height: v-bind('currentCompactSize.size + "px"');
}

.compact-top {
  color: #fff;
  font-weight: 900;
  letter-spacing: 2px;
  text-transform: uppercase;
  text-align: center;
  padding-bottom: 2px;
  font-size: v-bind('Math.round(currentCompactSize.size * compactDomainTextScale.top) + "px"');
}

.compact-row {
  flex: 1;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  width: 100%;
  gap: 4px;
}

.compact-side-wrap {
  position: relative;
  flex-shrink: 0;
  overflow: visible;
}

.compact-side-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(90deg);
  transform-origin: center;
  white-space: nowrap;
  color: #fff;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 4px;
}

.compact-qr-holder {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
}

.compact-qr {
  object-fit: contain;
  display: block;
  width: v-bind('currentCompactSize.qrSize + "px"');
  height: v-bind('currentCompactSize.qrSize + "px"');
}

.compact-bottom {
  color: #fff;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  text-align: center;
  padding-bottom: 6px;
  font-size: v-bind('Math.round(currentCompactSize.size * compactDomainTextScale.bottom) + "px"');
}
</style>
