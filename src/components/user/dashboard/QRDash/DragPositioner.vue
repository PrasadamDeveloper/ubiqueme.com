<script lang="ts" setup>
import { ref, computed, watch } from 'vue'
import { toast } from 'vue-sonner'
import html2canvas from 'html2canvas'
import LogoWhite from '@/assets/Ubiqueme_Logo_white.webp'
import { useDragPositionStore, type SizeKey } from '@/stores/dragPositionStore'

const props = defineProps<{
  visible: boolean
  qrId: string
  qrName: string
  qrImg?: string
  qrDataUrl: string
  downloadSize: 'sm' | 'md' | 'lg'
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const store = useDragPositionStore()

// ══════════════════════════════════════════════════════════════
//  SIZE CONFIG — matching useQRDownload.ts exactly
// ══════════════════════════════════════════════════════════════
interface SizeCfg {
  width: number
  height: number
  qrSize: number
}

const SIZE_CONFIG: Record<SizeKey, SizeCfg> = {
  sm: { width: 400, height: 173, qrSize: 115 },
  md: { width: 720, height: 500, qrSize: 300 },
  lg: { width: 1080, height: 749, qrSize: 460 },
}

// ══════════════════════════════════════════════════════════════
//  DEFAULT POSITIONS
// ══════════════════════════════════════════════════════════════

function PAD(w: number) { return w * 0.02 }

function logoScale(size: string) { return size === 'sm' ? 0.1 : 0.097 }

// ─── Reactive size ─────────────────────────────────────────────
const activeSize = ref<SizeKey>(props.downloadSize)

const cfg = computed<SizeCfg>(() => SIZE_CONFIG[activeSize.value])

// ─── Offsets for built-in elements ─────────────────────────────
type OffsetMap = {
  logo: { left: number; top: number }
  topDomain: { left: number; top: number }
  qrBox: { left: number; top: number }
  name: { left: number; top: number }
  id: { left: number; top: number }
  desc1: { left: number; top: number }
  desc2: { left: number; top: number }
  bottomDomains: { left: number; top: number }
}

function loadSavedOffsets(size: SizeKey) {
  const saved = store.getSavedElementOffsets(props.qrId, size)
  if (saved) {
    Object.assign(offsets.value, saved)
  } else {
    resetoOffsets()
  }
}

const offsets = ref<OffsetMap>({
  logo: { left: 0, top: 0 },
  topDomain: { left: 0, top: 0 },
  qrBox: { left: 0, top: 0 },
  name: { left: 0, top: 0 },
  id: { left: 0, top: 0 },
  desc1: { left: 0, top: 0 },
  desc2: { left: 0, top: 0 },
  bottomDomains: { left: 0, top: 0 },
})

// Load saved on mount
loadSavedOffsets(activeSize.value)

watch(activeSize, (newSize) => {
  loadSavedOffsets(newSize)
})

function resetoOffsets() {
  const keys = Object.keys(offsets.value) as (keyof OffsetMap)[]
  keys.forEach((k) => {
    offsets.value[k] = { left: 0, top: 0 }
  })
}

// ─── Images from store (size-independent) ─────────────────────
const currentImages = computed(() => store.getImages(props.qrId, activeSize.value))

const fileInput = ref<HTMLInputElement | null>(null)

// Compute next unique image counter from all existing images in the store for this QR
function nextImgCounter(): number {
  let maxId = 0
  for (const size of (['sm', 'md', 'lg'] as const)) {
    const imgs = store.getImages(props.qrId, size)
    for (const img of imgs) {
      const match = img.id.match(/^userImg-(\d+)$/)
      if (match) {
        const num = parseInt(match[1], 10)
        if (num > maxId) maxId = num
      }
    }
  }
  return maxId + 1
}

let imgCounter = nextImgCounter()

const addImage = (e: Event) => {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = async (ev) => {
    const dataUrl = ev.target?.result
    if (!dataUrl || typeof dataUrl !== 'string') return

    const img = new Image()
    img.src = dataUrl
    await new Promise((resolve) => { img.onload = resolve })

    const maxDim = 300
    let w = img.naturalWidth
    let h = img.naturalHeight
    if (w > maxDim || h > maxDim) {
      const ratio = maxDim / Math.max(w, h)
      w = Math.round(w * ratio)
      h = Math.round(h * ratio)
    }

    const id = `userImg-${++imgCounter}`
    store.addImage(props.qrId, activeSize.value, {
      id,
      dataUrl,
      offsets: { left: 0, top: 0 },
      width: w,
      height: h,
    })
  }
  reader.readAsDataURL(file)
  input.value = ''
}

const removeImage = (imgId: string) => {
  store.removeImage(props.qrId, activeSize.value, imgId)
}

const triggerFileInput = () => {
  fileInput.value?.click()
}

// ─── Drag handling (supports both built-in and user images) ────
const dragging = ref<{
  key: string
  startX: number
  startY: number
  origLeft: number
  origTop: number
  isUserImg?: boolean
  isResize?: boolean
  origW?: number
  origH?: number
} | null>(null)

const startDrag = (key: string, e: MouseEvent) => {
  e.preventDefault()

  const userImg = currentImages.value.find((i) => i.id === key)
  if (userImg) {
    dragging.value = {
      key,
      startX: e.clientX,
      startY: e.clientY,
      origLeft: userImg.offsets.left,
      origTop: userImg.offsets.top,
      isUserImg: true,
    }
  } else {
    const o = (offsets.value as Record<string, { left: number; top: number } | undefined>)[key]
    if (!o) return
    dragging.value = {
      key,
      startX: e.clientX,
      startY: e.clientY,
      origLeft: o.left,
      origTop: o.top,
      isUserImg: false,
    }
  }

  const onMove = (ev: MouseEvent) => {
    if (!dragging.value) return
    const dx = ev.clientX - dragging.value.startX
    const dy = ev.clientY - dragging.value.startY
    const k = dragging.value.key
    if (dragging.value.isUserImg) {
      store.updateOffset(
        props.qrId,
        activeSize.value,
        k,
        dragging.value.origLeft + dx,
        dragging.value.origTop + dy,
      )
    } else {
      ; (offsets.value as Record<string, { left: number; top: number }>)[k] = {
        left: dragging.value.origLeft + dx,
        top: dragging.value.origTop + dy,
      }
    }
  }

  const onUp = () => {
    dragging.value = null
    document.removeEventListener('mousemove', onMove)
    document.removeEventListener('mouseup', onUp)
  }

  document.addEventListener('mousemove', onMove)
  document.addEventListener('mouseup', onUp)
}

// ─── Resize handle for user images ────────────────────────────
const startResize = (imgId: string, e: MouseEvent) => {
  e.preventDefault()
  e.stopPropagation()

  const img = currentImages.value.find((i) => i.id === imgId)
  if (!img) return

  dragging.value = {
    key: imgId,
    startX: e.clientX,
    startY: e.clientY,
    origLeft: 0,
    origTop: 0,
    isUserImg: true,
    isResize: true,
    origW: img.width,
    origH: img.height,
  }

  const onMove = (ev: MouseEvent) => {
    if (!dragging.value || !dragging.value.isResize) return
    const dx = ev.clientX - dragging.value.startX
    const dy = ev.clientY - dragging.value.startY
    store.resizeImage(
      props.qrId,
      activeSize.value,
      imgId,
      (dragging.value.origW || 0) + dx,
      (dragging.value.origH || 0) + dy,
    )
  }

  const onUp = () => {
    dragging.value = null
    document.removeEventListener('mousemove', onMove)
    document.removeEventListener('mouseup', onUp)
  }

  document.addEventListener('mousemove', onMove)
  document.addEventListener('mouseup', onUp)
}

// ─── Reset ────────────────────────────────────────────────────
const resetPositions = () => {
  resetoOffsets()
  store.resetSize(props.qrId, activeSize.value)
  toast.success('Posiciones restablecidas')
}

// ─── Save action ──────────────────────────────────────────────
const saveDesign = () => {
  store.saveElementOffsets(props.qrId, activeSize.value, { ...offsets.value })
  toast.success('Diseño guardado correctamente')
}

// ─── Export helpers ──────────────────────────────────────────
const getTemplateEl = () => document.getElementById(`drag-tpl-${props.qrId}`)

/** Render template in a sandboxed iframe (no Tailwind CSS) to bypass oklch() unsupported color issue in html2canvas v1 */
function renderInIframe(el: HTMLElement, bgColor: string): Promise<HTMLCanvasElement> {
  return new Promise((resolve, reject) => {
    const iframe = document.createElement('iframe')
    iframe.style.position = 'fixed'
    iframe.style.top = '-99999px'
    iframe.style.left = '-99999px'
    iframe.style.width = `${el.offsetWidth}px`
    iframe.style.height = `${el.offsetHeight}px`
    iframe.style.border = 'none'
    iframe.sandbox.add('allow-same-origin')
    document.body.appendChild(iframe)

    const doc = iframe.contentDocument!
    // Copy only the template's outerHTML (no Tailwind CSS)
    doc.open()
    doc.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { background: ${bgColor}; }
        </style>
      </head>
      <body>${el.outerHTML}</body>
      </html>
    `)
    doc.close()

    // Wait for images to load inside iframe
    const images = doc.querySelectorAll('img')
    const promises: Promise<void>[] = []
    images.forEach((img) => {
      if (!img.complete) {
        promises.push(new Promise((r) => { img.onload = () => r(); img.onerror = () => r() }))
      }
    })

    Promise.all(promises).then(() => {
      // Small delay to ensure layout
      setTimeout(() => {
        const iframeBody = doc.body.firstElementChild as HTMLElement
        if (!iframeBody) { reject(new Error('No template in iframe')); return }
        html2canvas(iframeBody, {
          scale: 4,
          backgroundColor: bgColor,
          useCORS: true,
        }).then((canvas) => {
          document.body.removeChild(iframe)
          resolve(canvas)
        }).catch(reject)
      }, 100)
    })
  })
}

const captureCanvas = async () => {
  const el = getTemplateEl()
  if (!el) { toast.error('No se encontró la plantilla'); return null }
  try {
    return await renderInIframe(el, '#f97316')
  } catch (e) {
    toast.error(`Error al capturar: ${e}`)
    return null
  }
}

const exportPNG = async () => {
  const canvas = await captureCanvas()
  if (!canvas) return
  const link = document.createElement('a')
  link.download = `qr-${props.qrId}-${activeSize.value}.png`
  link.href = canvas.toDataURL('image/png')
  link.click()
  toast.success('QR descargado como PNG')
}

const exportPDF = async () => {
  const canvas = await captureCanvas()
  if (!canvas) return
  try {
    const { jsPDF } = await import('jspdf')
    const mmW = activeSize.value === 'sm' ? 132 : activeSize.value === 'md' ? 170 : 210
    const mmH = activeSize.value === 'sm' ? 57 : activeSize.value === 'md' ? 118 : 146
    const pdf = new jsPDF({
      orientation: mmW >= mmH ? 'landscape' : 'portrait',
      unit: 'mm',
      format: [mmW, mmH],
    })
    const imgData = canvas.toDataURL('image/png')
    pdf.addImage(imgData, 'PNG', 0, 0, mmW, mmH)
    pdf.save(`qr-${props.qrId}-${activeSize.value}.pdf`)
    toast.success('QR descargado como PDF — tamaño físico exacto')
  } catch (e) {
    toast.error(`Error al exportar PDF: ${e}`)
  }
}

const close = () => emit('close')
</script>

<template>
  <Teleport to="body">
    <Transition name="overlay-fade">
      <div v-if="visible"
        class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
        @click.self="close">
        <Transition name="modal-scale" appear>
          <div v-if="visible"
            class="relative w-full max-w-5xl max-h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col">

            <!-- ─── HEADER ─── -->
            <div class="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white">
              <div>
                <h2 class="text-lg font-bold text-slate-900">Personalizar posición — {{ qrName }}</h2>
                <p class="text-xs text-slate-400">Arrastra cada elemento para reposicionarlo</p>
              </div>
              <button @click="close"
                class="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 transition cursor-pointer">
                <span class="material-symbols-outlined notranslate text-xl">close</span>
              </button>
            </div>

            <!-- ─── SIZE SELECTOR ─── -->
            <div class="flex items-center justify-center gap-2 px-6 pt-4 pb-2 bg-slate-50">
              <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-2">Tamaño:</span>
              <div class="inline-flex rounded-xl bg-white border border-slate-200 p-0.5 shadow-sm">
                <button v-for="size in (['sm', 'md', 'lg'] as const)" :key="size" @click="activeSize = size"
                  class="px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
                  :class="activeSize === size ? 'bg-orange-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'">
                  {{ size === 'sm' ? 'SM' : size === 'md' ? 'MD' : 'LG' }}
                </button>
              </div>
              <span class="text-[10px] text-slate-400 ml-2">{{ cfg.width }}×{{ cfg.height }}px</span>
            </div>

            <!-- ─── CANVAS AREA ─── -->
            <div class="flex-1 overflow-auto bg-slate-50 p-6 flex justify-center items-start">
              <div :id="`drag-tpl-${props.qrId}`"
                :style="`width:${cfg.width}px;height:${cfg.height}px;padding:${PAD(cfg.width)}px;background:linear-gradient(80deg,#f97316,#fcbd74);font-family:'Google Sans',sans-serif;position:relative;overflow:hidden;box-sizing:border-box;flex-shrink:0;`">

                <!-- User images (draggable + resizable) — size-independent per activeSize -->
                <template v-for="img in currentImages" :key="img.id">
                  <div
                    :style="`position:absolute;left:${PAD(cfg.width) + img.offsets.left}px;top:${PAD(cfg.width) + img.offsets.top}px;z-index:20;cursor:grab;border:2px solid transparent;border-radius:4px;overflow:hidden;transition:border-color 0.15s;`"
                    @mouseenter="(e: any) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.8)' }"
                    @mouseleave="(e: any) => { e.currentTarget.style.borderColor = 'transparent' }"
                    @mousedown="startDrag(img.id, $event)">
                    <img :src="img.dataUrl"
                      :style="`width:${img.width}px;height:${img.height}px;display:block;pointer-events:none;object-fit:contain;`" />
                    <!-- Resize handle (bottom-right corner) -->
                    <div @mousedown="startResize(img.id, $event)"
                      style="position:absolute;right:0;bottom:0;width:16px;height:16px;cursor:nwse-resize;background:rgba(255,255,255,0.8);border-top-left-radius:4px;display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity 0.15s;"
                      @mouseenter="(e: any) => { e.stopPropagation(); e.currentTarget.style.opacity = '1' }"
                      @mouseleave="(e: any) => { e.stopPropagation(); e.currentTarget.style.opacity = '0' }">
                      <span class="text-slate-700 text-[10px] font-bold leading-none pointer-events-none">◢</span>
                    </div>
                    <!-- Delete button -->
                    <button @mousedown.stop @click.stop="removeImage(img.id)"
                      class="absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold opacity-0 hover:opacity-100 transition-opacity cursor-pointer shadow-md"
                      style="border:none;line-height:1;" title="Eliminar imagen">✕</button>
                  </div>
                </template>

                <!-- Logo top-right (draggable) -->
                <div
                  :style="`position:absolute;top:${cfg.width * 0.015 + offsets.logo.top}px;right:${cfg.width * 0.015 - offsets.logo.left}px;background:rgba(0,0,0,0.8);border-radius:${cfg.width * 0.015}px;padding:${cfg.width * 0.008}px;z-index:10;cursor:grab;`"
                  @mousedown="startDrag('logo', $event)">
                  <img :src="LogoWhite"
                    :style="`width:${cfg.width * logoScale(activeSize)}px;height:auto;opacity:0.9;display:block;pointer-events:none;`"
                    alt="Ubiqueme" />
                </div>

                <!-- Inner column -->
                <div
                  :style="`position:absolute;left:${PAD(cfg.width) + offsets.qrBox.left}px;top:${PAD(cfg.width) + offsets.qrBox.top}px;width:${cfg.width - PAD(cfg.width) * 2}px;height:${cfg.height - PAD(cfg.width) * 2}px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;`">

                  <!-- "ubiqueme.com" top center -->
                  <span
                    :style="`color:#fff;font-weight:900;letter-spacing:0.15em;text-transform:uppercase;font-size:${cfg.width * 0.035}px;text-align:center;cursor:grab;position:relative;left:${offsets.topDomain.left}px;top:${offsets.topDomain.top}px;`"
                    @mousedown="startDrag('topDomain', $event)">ubiqueme.com</span>

                  <!-- Row: QR + info -->
                  <div
                    style="display:flex;flex-direction:row;align-items:center;justify-content:center;gap:4px;flex:1;width:100%;">

                    <!-- QR box -->
                    <div
                      :style="`flex-shrink:0;width:${cfg.qrSize + 16}px;height:${cfg.qrSize + 16}px;background:#fff;border-radius:${cfg.width * 0.025}px;padding:8px;display:flex;align-items:center;justify-content:center;overflow:hidden;position:relative;left:${offsets.qrBox.left}px;top:${offsets.qrBox.top}px;cursor:grab;`"
                      @mousedown="startDrag('qrBox', $event)">
                      <template v-if="qrDataUrl">
                        <img :src="qrDataUrl"
                          :style="`width:${cfg.qrSize}px;height:${cfg.qrSize}px;display:block;pointer-events:none;`" />
                      </template>
                      <template v-else-if="qrImg">
                        <img :src="qrImg"
                          :style="`width:${cfg.qrSize}px;height:${cfg.qrSize}px;object-fit:contain;display:block;pointer-events:none;`" />
                      </template>
                    </div>

                    <!-- Info texts -->
                    <div style="display:flex;flex-direction:column;gap:6px;flex:1;min-width:0;text-align:center;">
                      <p :style="`color:#171717;font-size:${cfg.width * 0.082}px;font-weight:900;margin:0;line-height:1.1;cursor:grab;position:relative;left:${offsets.name.left}px;top:${offsets.name.top}px;`"
                        @mousedown="startDrag('name', $event)">{{ qrName || 'Código QR' }}</p>
                      <p :style="`color:#444;font-size:${Math.round(cfg.width * 0.02)}px;font-weight:600;margin:0;line-height:1.2;font-family:monospace;cursor:grab;position:relative;left:${offsets.id.left}px;top:${offsets.id.top}px;`"
                        @mousedown="startDrag('id', $event)">#{{ qrId }}</p>
                      <p :style="`color:#303030;font-size:${cfg.width * 0.048}px;font-weight:500;margin:0;line-height:1.2;cursor:grab;position:relative;left:${offsets.desc1.left}px;top:${offsets.desc1.top}px;`"
                        @mousedown="startDrag('desc1', $event)">Escanee este QR para contactar al responsable.</p>
                      <p :style="`color:#000;font-size:${Math.round(cfg.width * 0.022)}px;font-weight:500;margin:3px 0 0;line-height:1.2;cursor:grab;position:relative;left:${offsets.desc2.left}px;top:${offsets.desc2.top}px;`"
                        @mousedown="startDrag('desc2', $event)">QR oficial de Ubiqueme.com® — Marca 100% segura y
                        verificada.</p>
                    </div>
                  </div>

                  <!-- Bottom domains -->
                  <div
                    :style="`display:flex;flex-direction:row;align-items:center;justify-content:center;gap:12px;padding-bottom:9px;cursor:grab;position:relative;left:${offsets.bottomDomains.left}px;top:${offsets.bottomDomains.top}px;`"
                    @mousedown="startDrag('bottomDomains', $event)">
                    <span
                      :style="`color:#fff;font-weight:700;text-transform:uppercase;font-size:${cfg.width * 0.025}px;letter-spacing:1px;pointer-events:none;`"
                      translate="no">localizarme.com</span>
                    <span
                      :style="`color:rgba(255,255,255,0.5);font-size:${cfg.width * 0.025}px;pointer-events:none;`">•</span>
                    <span
                      :style="`color:#fff;font-weight:700;text-transform:uppercase;font-size:${cfg.width * 0.025}px;letter-spacing:1px;pointer-events:none;`"
                      translate="no">contactomio.com</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- ─── BOTTOM TOOLBAR ─── -->
            <div class="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-white">
              <div class="flex items-center gap-2">
                <button @click="resetPositions"
                  class="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 text-sm font-medium hover:bg-slate-200 transition cursor-pointer">
                  <span class="material-symbols-outlined notranslate text-lg align-middle">refresh</span> Restablecer
                </button>
                <button @click="triggerFileInput"
                  class="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 text-sm font-medium hover:bg-slate-200 transition cursor-pointer flex items-center gap-1.5">
                  <span class="material-symbols-outlined notranslate text-lg">add_photo_alternate</span> Imagen
                </button>
                <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="addImage" />
                <span v-if="currentImages.length === 0" class="text-xs text-slate-400">Arrastra los elementos</span>
                <span v-else class="text-xs text-slate-400">{{ currentImages.length }} imagen{{ currentImages.length !==
                  1 ? 'es' :
                  '' }}</span>
              </div>
              <div class="flex items-center gap-3">
                <button @click="saveDesign"
                  class="px-5 py-2.5 rounded-xl bg-emerald-500 text-white text-sm font-bold hover:bg-emerald-600 transition cursor-pointer flex items-center gap-2 shadow-lg shadow-emerald-500/20">
                  <span class="material-symbols-outlined notranslate text-lg">check</span> Guardar
                </button>
                <button @click="close"
                  class="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition cursor-pointer">Cancelar</button>
                <button @click="exportPDF"
                  class="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 transition cursor-pointer flex items-center gap-2">
                  <span class="material-symbols-outlined notranslate text-lg">picture_as_pdf</span> PDF
                </button>
                <button @click="exportPNG"
                  class="px-5 py-2.5 rounded-xl bg-orange-500 text-white text-sm font-bold hover:bg-orange-600 transition cursor-pointer flex items-center gap-2 shadow-lg shadow-orange-500/20">
                  <span class="material-symbols-outlined notranslate text-lg">download</span> PNG
                </button>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.overlay-fade-enter-active,
.overlay-fade-leave-active {
  transition: opacity 0.3s ease;
}

.overlay-fade-enter-from,
.overlay-fade-leave-to {
  opacity: 0;
}

.modal-scale-enter-active {
  transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.modal-scale-leave-active {
  transition: all 0.2s ease;
}

.modal-scale-enter-from {
  opacity: 0;
  transform: scale(0.8) translateY(20px);
}

.modal-scale-leave-to {
  opacity: 0;
  transform: scale(0.9) translateY(10px);
}
</style>
