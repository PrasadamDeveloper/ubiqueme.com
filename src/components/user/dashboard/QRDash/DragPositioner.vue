<script lang="ts" setup>
import { ref, computed, watch } from 'vue'
import { toast } from 'vue-sonner'
import html2canvas from 'html2canvas'
import LogoWhite from '@/assets/Ubiqueme_Logo_white.webp'
import { DEFAULT_ELEMENT_OFFSETS, DEFAULT_USER_IMAGES } from '@/config/dragDefaults'

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

// ══════════════════════════════════════════════════════════════
//  SIZE CONFIG — matching useQRDownload.ts exactly
// ══════════════════════════════════════════════════════════════
interface SizeCfg {
  width: number
  height: number
  qrSize: number
}

const SIZE_CONFIG: Record<string, SizeCfg> = {
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
const activeSize = ref<string>(props.downloadSize)

const cfg = computed<SizeCfg>(() => SIZE_CONFIG[activeSize.value] ?? SIZE_CONFIG.md!)

// ─── Offsets for built-in elements ─────────────────────────────
type OffsetKey = keyof typeof DEFAULT_ELEMENT_OFFSETS.md

function buildOffsets(size: string) {
  return JSON.parse(JSON.stringify(DEFAULT_ELEMENT_OFFSETS[size as keyof typeof DEFAULT_ELEMENT_OFFSETS]))
}

const offsets = ref<Record<OffsetKey, { left: number; top: number }>>(buildOffsets(activeSize.value))

watch(activeSize, (newSize) => {
  offsets.value = buildOffsets(newSize)
})

function resetOffsets() {
  offsets.value = buildOffsets(activeSize.value)
}

// ─── Images — hardcoded from config ────────────────────────────
interface DragImage {
  id: string
  src: string
  offsets: { left: number; top: number }
  width: number
  height: number
}

const defaultImages = DEFAULT_USER_IMAGES

const currentImages = computed<DragImage[]>(() => {
  const imgs = defaultImages[activeSize.value as keyof typeof defaultImages] ?? []
  return imgs.map((img) => ({
    id: img.id,
    src: img.asset.replace('@/', '/src/'),
    offsets: { ...img.offsets },
    width: img.width,
    height: img.height,
  }))
})

// ─── Drag handling (supports both built-in and user images) ────
const dragging = ref<{
  key: string
  startX: number
  startY: number
  origLeft: number
  origTop: number
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
    }
    // local mutation for drag preview
    const onMove = (ev: MouseEvent) => {
      if (!dragging.value) return
      const dx = ev.clientX - dragging.value.startX
      const dy = ev.clientY - dragging.value.startY
      userImg.offsets.left = dragging.value.origLeft + dx
      userImg.offsets.top = dragging.value.origTop + dy
    }
    const onUp = () => {
      dragging.value = null
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
    }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
    return
  }

  const o = offsets.value[key as OffsetKey]
  if (!o) return
  dragging.value = {
    key,
    startX: e.clientX,
    startY: e.clientY,
    origLeft: o.left,
    origTop: o.top,
  }

  const onMove = (ev: MouseEvent) => {
    if (!dragging.value) return
    const dx = ev.clientX - dragging.value.startX
    const dy = ev.clientY - dragging.value.startY
    const k = dragging.value.key
    offsets.value[k as OffsetKey] = {
      left: dragging.value.origLeft + dx,
      top: dragging.value.origTop + dy,
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

// ─── Reset ────────────────────────────────────────────────────
const resetPositions = () => {
  resetOffsets()
  toast.success('Posiciones restablecidas')
}

// ─── Copy positions to clipboard ──────────────────────────────
const copyPositions = () => {
  const size = activeSize.value

  // built-in element offsets
  const offsetLines = Object.entries(offsets.value)
    .map(([key, val]) => `    ${key}: { left: ${val.left}, top: ${val.top} }`)
    .join(',\n')
  const builtInBlock = `// ${size} — element offsets
DEFAULT_ELEMENT_OFFSETS.${size} = {\n${offsetLines},\n}`

  // user image offsets
  const userImgLines = currentImages.value
    .map((img) => `// ${img.id} → { left: ${img.offsets.left}, top: ${img.offsets.top} }`)
    .join('\n')
  const userImgBlock = `// ${size} — user image offsets\n${userImgLines}`

  const output = `${builtInBlock}\n\n${userImgBlock}`

  navigator.clipboard.writeText(output)
  toast.success('Posiciones copiadas al portapapeles')
}

// ─── Export helpers ──────────────────────────────────────────
const getTemplateEl = () => document.getElementById(`drag-tpl-${props.qrId}`)

/** Render template in a sandboxed iframe (no Tailwind CSS) to bypass oklch() unsupported color issue in html2canvas v1 */
function renderInIframe(el: HTMLElement, bgColor: string): Promise<HTMLCanvasElement> {
  return new Promise((resolve, reject) => {
    const exactW = cfg.value.width
    const exactH = cfg.value.height

    const iframe = document.createElement('iframe')
    iframe.style.position = 'fixed'
    iframe.style.top = '-99999px'
    iframe.style.left = '-99999px'
    iframe.style.width = `${exactW}px`
    iframe.style.height = `${exactH}px`
    iframe.style.border = 'none'
    iframe.sandbox.add('allow-same-origin')
    document.body.appendChild(iframe)

    const doc = iframe.contentDocument!

    const clone = el.cloneNode(true) as HTMLElement
    clone.style.width = `${exactW}px`
    clone.style.height = `${exactH}px`
    clone.style.position = 'relative'
    clone.style.top = '0'
    clone.style.left = '0'
    clone.style.margin = '0'
    clone.querySelectorAll('[style*="cursor:nwse-resize"]').forEach((el) => el.remove())
    clone.querySelectorAll('[title="Eliminar imagen"]').forEach((el) => el.remove())
    clone.querySelectorAll('[style*="cursor:grab"]').forEach((grabEl) => {
      const s = (grabEl as HTMLElement).style
      if (s.borderColor === 'transparent' || s.border?.includes('transparent')) {
        s.border = 'none'
      }
    })

    doc.open()
    doc.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { background: ${bgColor}; font-family: 'Google Sans', Arial, Helvetica, sans-serif; }
          p, span { word-spacing: 0.02em; }
        </style>
      </head>
      <body>${clone.outerHTML}</body>
      </html>
    `)
    doc.close()

    const images = doc.querySelectorAll('img')
    const promises: Promise<void>[] = []
    images.forEach((img) => {
      if (!img.complete) {
        promises.push(new Promise((r) => { img.onload = () => r(); img.onerror = () => r() }))
      }
    })

    Promise.all(promises).then(() => {
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

                <!-- User images (draggable) — from hardcoded defaults -->
                <template v-for="img in currentImages" :key="img.id">
                  <div
                    :style="`position:absolute;left:${PAD(cfg.width) + img.offsets.left}px;top:${PAD(cfg.width) + img.offsets.top}px;z-index:20;cursor:grab;border:2px solid transparent;border-radius:4px;overflow:hidden;transition:border-color 0.15s;`"
                    @mouseenter="(e: any) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.8)' }"
                    @mouseleave="(e: any) => { e.currentTarget.style.borderColor = 'transparent' }"
                    @mousedown="startDrag(img.id, $event)">
                    <img :src="img.src"
                      :style="`width:${img.width}px;height:${img.height}px;display:block;pointer-events:none;object-fit:contain;`" />
                  </div>
                </template>

                <!-- Logo top-right (draggable) -->
                <div
                  :style="`position:absolute;top:${cfg.width * 0.015 + offsets.logo.top}px;right:${cfg.width * 0.015 - offsets.logo.left}px;background:rgba(0,0,0,0.8);border-radius:${cfg.width * 0.015}px;padding:${cfg.width * 0.0001}px;z-index:10;cursor:grab;`"
                  @mousedown="startDrag('logo', $event)">
                  <img :src="LogoWhite"
                    :style="`width:${cfg.width * logoScale(activeSize)}px;height:auto;opacity:0.9;display:block;pointer-events:none;`"
                    alt="Ubiqueme" />
                </div>

                <!-- Inner column -->
                <div
                  :style="`position:absolute;left:${PAD(cfg.width) + offsets.qrBox.left}px;top:${PAD(cfg.width) + offsets.qrBox.top}px;width:${cfg.width - PAD(cfg.width) * 2}px;height:${cfg.height - PAD(cfg.width) * 2}px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;`">

                  <!-- SM: 🔒 HTTPS:// ubiqueme.com inline (single draggable group) -->
                  <div v-if="activeSize === 'sm'"
                    :style="`display:flex;flex-direction:row;align-items:center;justify-content:center;gap:2px;cursor:grab;position:relative;left:${offsets.topDomain.left}px;top:${offsets.topDomain.top}px;`"
                    @mousedown="startDrag('topDomain', $event)">
                    <img src="/src/assets/drag-images/social-10.webp"
                      style="width:16px;height:13px;display:block;pointer-events:none;object-fit:contain;" />
                    <span
                      :style="`color:black;font-weight:900;letter-spacing:0.15em;text-transform:uppercase;font-size:${cfg.width * 0.035}px;white-space:nowrap;pointer-events:none;`">HTTPS://</span>
                    <span
                      :style="`color:black;font-weight:900;letter-spacing:0.15em;text-transform:uppercase;font-size:${cfg.width * 0.055}px;white-space:nowrap;pointer-events:none;`">ubiqueme.com</span>
                  </div>

                  <!-- MD/LG: HTTPS separate + ubiqueme.com separate -->
                  <template v-if="activeSize !== 'sm'">
                    <div
                      :style="`display:flex;flex-direction:column;align-items:center;justify-content:center;gap:0;cursor:grab;position:relative;left:${offsets.httpsLabel.left}px;top:${offsets.httpsLabel.top}px;`"
                      @mousedown="startDrag('httpsLabel', $event)">
                      <span
                        :style="`color:black;font-weight:900;letter-spacing:0.15em;text-transform:uppercase;font-size:${cfg.width * 0.035}px;text-align:center;white-space:nowrap;pointer-events:none;`">HTTPS://</span>
                    </div>
                    <span
                      :style="`color:black;font-weight:900;letter-spacing:0.15em;text-transform:uppercase;font-size:${cfg.width * 0.055}px;text-align:center;cursor:grab;position:relative;left:${offsets.topDomain.left}px;top:${offsets.topDomain.top}px; padding: 1px 51px; border-radius:20px;`"
                      @mousedown="startDrag('topDomain', $event)">ubiqueme.com</span>
                  </template>

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
                    <div
                      style="display:flex;flex-direction:column;gap:4px;justify-content:center;flex:0 1 auto;text-align:center;">
                      <p :style="`color:#171717;font-size:${cfg.width * 0.082}px;font-weight:900;margin:0;line-height:1.1;cursor:grab;position:relative;left:${offsets.name.left}px;top:${offsets.name.top}px;`"
                        @mousedown="startDrag('name', $event)">{{ qrName == 'walaco' || 'Gutemberg 128' }}</p>
                      <p :style="`color:#444;font-size:${Math.round(cfg.width * 0.02)}px;font-weight:600;margin:0;line-height:1.2;font-family:monospace;cursor:grab;position:relative;left:${offsets.id.left}px;top:${offsets.id.top}px;`"
                        @mousedown="startDrag('id', $event)">ID:#{{ qrId }}</p>
                      <p :style="`color:#303030;font-size:${cfg.width * 0.048}px;font-weight:500;margin:0;line-height:1.05;cursor:grab;position:relative;left:${offsets.desc1.left}px;top:${offsets.desc1.top}px;`"
                        @mousedown="startDrag('desc1', $event)">Escanee este QR<br />para contactar<br />al responsable
                        .
                      </p>
                      <p :style="`color:#000;font-size:${Math.round(cfg.width * 0.022)}px;font-weight:500;margin:3px 0 0;line-height:1.2;cursor:grab;position:relative;left:${offsets.desc2.left}px;top:${offsets.desc2.top}px;`"
                        @mousedown="startDrag('desc2', $event)">QR oficial <span style="margin-left: 2px;">
                          de Ubiqueme .com®
                        </span><br>
                        Marca 100% segura y
                        verificada .</p>
                    </div>
                  </div>
                  <div
                    :style="`display:flex;flex-direction:row;align-items:center;justify-content:center;gap:12px;padding-bottom:9px;cursor:grab;position:relative;left:${offsets.bottomEmail.left}px;top:${offsets.bottomEmail.top}px;`"
                    @mousedown="startDrag('bottomEmail', $event)">
                    <span
                      :style="`color:black;font-weight:700;text-transform:uppercase;font-size:${cfg.width * 0.025}px;letter-spacing:1px;pointer-events:none;`">soporte@ubiqueme.com</span>
                  </div>

                  <!-- Bottom domains -->
                  <div
                    :style="`display:flex;flex-direction:row;align-items:center;justify-content:center;gap:12px;padding-bottom:9px;cursor:grab;position:relative;left:${offsets.bottomDomains.left}px;top:${offsets.bottomDomains.top}px;`"
                    @mousedown="startDrag('bottomDomains', $event)">
                    <span
                      :style="`color:black;font-weight:700;text-transform:uppercase;font-size:${cfg.width * 0.025}px;letter-spacing:1px;pointer-events:none;`"
                      translate="no">localizarme.com</span>
                    <span
                      :style="`color:rgba(255,255,255,0.5);font-size:${cfg.width * 0.025}px;pointer-events:none;`">•</span>
                    <span
                      :style="`color:black;font-weight:700;text-transform:uppercase;font-size:${cfg.width * 0.025}px;letter-spacing:1px;pointer-events:none;`"
                      translate="no">contactomio.com</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- ─── BOTTOM TOOLBAR ─── -->
            <div class="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-white">
              <div class="flex items-center gap-2">
                <button @click="copyPositions"
                  class="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 text-sm font-medium hover:bg-slate-200 transition cursor-pointer">
                  <span class="material-symbols-outlined notranslate text-lg align-middle">content_copy</span> Copiar
                  posiciones
                </button>
                <button @click="resetPositions"
                  class="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 text-sm font-medium hover:bg-slate-200 transition cursor-pointer">
                  <span class="material-symbols-outlined notranslate text-lg align-middle">refresh</span> Restablecer
                </button>
                <span class="text-xs text-slate-400">Arrastra los elementos</span>
              </div>
              <div class="flex items-center gap-3">
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
