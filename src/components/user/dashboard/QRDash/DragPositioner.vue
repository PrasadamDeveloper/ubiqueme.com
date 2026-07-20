<script lang="ts" setup>
import { ref, computed, watch } from 'vue'
import { toast } from 'vue-sonner'
import html2canvas from 'html2canvas'
import LogoWhite from '@/assets/Ubiqueme_Logo_white.webp'

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
//  DEFAULT POSITIONS —  values for each element per size
//  These are the "factory defaults". If core styles change,
//  update only these numbers.
// ══════════════════════════════════════════════════════════════

/** Padding = width * 0.02 — same for all sizes relative to width */
function PAD(w: number) { return w * 0.02 }

/** Logo scale: 0.1 for SM, 0.097 for MD/LG */
function logoScale(size: string) { return size === 'sm' ? 0.1 : 0.097 }

/*
 ┌─────────────────────────────────────────────────────────┐
 │ DEFAULT VALUES PER SIZE                                 │
 │                                                         │
 │ logo      → top=W*0.015, right=W*0.015, bg W*0.008     │
 │ topDomain → fontSize=W*0.035, color=#fff                │
 │ qrBox     → w/h=qrSize+16, radius=W*0.025              │
 │ name      → fontSize=W*0.082                            │
 │ id        → fontSize=Math.round(W*0.02)                 │
 │ desc1     → fontSize=W*0.048                            │
 │ desc2     → fontSize=Math.round(W*0.022)                │
 │ bottomDom → fontSize=W*0.025, gap=12px                  │
 └─────────────────────────────────────────────────────────┘
*/

// ─── Reactive size ─────────────────────────────────────────────
const activeSize = ref<'sm' | 'md' | 'lg'>(props.downloadSize)

const cfg = computed<SizeCfg>(() => SIZE_CONFIG[activeSize.value] ?? SIZE_CONFIG.md)

// ─── Offsets — each element can be dragged from its default ────
const offsets = ref<Record<string, { left: number; top: number }>>({
  logo: { left: 0, top: 0 },
  topDomain: { left: 0, top: 0 },
  qrBox: { left: 0, top: 0 },
  name: { left: 0, top: 0 },
  id: { left: 0, top: 0 },
  desc1: { left: 0, top: 0 },
  desc2: { left: 0, top: 0 },
  bottomDomains: { left: 0, top: 0 },
})

// Reset offsets when size changes (starts fresh)
watch(activeSize, () => {
  resetoOffsets()
})

const resetoOffsets = () => {
  Object.keys(offsets.value).forEach((k) => {
    offsets.value[k] = { left: 0, top: 0 }
  })
}

// ─── Drag handling ────────────────────────────────────────────
const dragging = ref<{ key: string; startX: number; startY: number; origLeft: number; origTop: number } | null>(null)

const startDrag = (key: string, e: MouseEvent) => {
  e.preventDefault()
  const o = offsets.value[key]
  dragging.value = { key, startX: e.clientX, startY: e.clientY, origLeft: o.left, origTop: o.top }

  const onMove = (ev: MouseEvent) => {
    if (!dragging.value) return
    const dx = ev.clientX - dragging.value.startX
    const dy = ev.clientY - dragging.value.startY
    offsets.value[key] = {
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

// ─── Reset to factory defaults ────────────────────────────────
const resetPositions = () => {
  resetoOffsets()
  toast.success('Posiciones restablecidas')
}

// ─── Export helpers ──────────────────────────────────────────
const getTemplateEl = () => document.getElementById(`drag-tpl-${props.qrId}`)

const captureCanvas = async () => {
  const el = getTemplateEl()
  if (!el) { toast.error('No se encontró la plantilla'); return null }
  try {
    return await html2canvas(el, { scale: 4, backgroundColor: '#f97316', useCORS: true })
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
    // Physical dimensions for PDF — same ratios as useQRDownload PHYSICAL_SIZE_MM
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

                <!-- Logo top-right (draggable) — default: top=W*0.015, right=W*0.015, bg=W*0.008 pad, radius=W*0.015 -->
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

                  <!-- "ubiqueme.com" top center (draggable) — default: fontSize=W*0.035 -->
                  <span
                    :style="`color:#fff;font-weight:900;letter-spacing:0.15em;text-transform:uppercase;font-size:${cfg.width * 0.035}px;text-align:center;cursor:grab;position:relative;left:${offsets.topDomain.left}px;top:${offsets.topDomain.top}px;`"
                    @mousedown="startDrag('topDomain', $event)">ubiqueme.com</span>

                  <!-- Row: QR + info -->
                  <div
                    style="display:flex;flex-direction:row;align-items:center;justify-content:center;gap:4px;flex:1;width:100%;">

                    <!-- QR box (draggable) — default: w/h=qrSize+16, radius=W*0.025 -->
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

                    <!-- Info texts (right side) -->
                    <div style="display:flex;flex-direction:column;gap:6px;flex:1;min-width:0;text-align:center;">
                      <!-- Name (draggable) — default: fontSize=W*0.082 -->
                      <p :style="`color:#171717;font-size:${cfg.width * 0.082}px;font-weight:900;margin:0;line-height:1.1;cursor:grab;position:relative;left:${offsets.name.left}px;top:${offsets.name.top}px;`"
                        @mousedown="startDrag('name', $event)">{{ qrName || 'Código QR' }}</p>
                      <!-- ID (draggable) — default: fontSize=Math.round(W*0.02) -->
                      <p :style="`color:#444;font-size:${Math.round(cfg.width * 0.02)}px;font-weight:600;margin:0;line-height:1.2;font-family:monospace;cursor:grab;position:relative;left:${offsets.id.left}px;top:${offsets.id.top}px;`"
                        @mousedown="startDrag('id', $event)">#{{ qrId }}</p>
                      <!-- Desc 1 (draggable) — default: fontSize=W*0.048 -->
                      <p :style="`color:#303030;font-size:${cfg.width * 0.048}px;font-weight:500;margin:0;line-height:1.2;cursor:grab;position:relative;left:${offsets.desc1.left}px;top:${offsets.desc1.top}px;`"
                        @mousedown="startDrag('desc1', $event)">Escanee este QR para contactar al responsable.</p>
                      <!-- Desc 2 (draggable) — default: fontSize=Math.round(W*0.022) -->
                      <p :style="`color:#000;font-size:${Math.round(cfg.width * 0.022)}px;font-weight:500;margin:3px 0 0;line-height:1.2;cursor:grab;position:relative;left:${offsets.desc2.left}px;top:${offsets.desc2.top}px;`"
                        @mousedown="startDrag('desc2', $event)">QR oficial de Ubiqueme.com® — Marca 100% segura y
                        verificada.</p>
                    </div>
                  </div>

                  <!-- Bottom domains (draggable) — default: fontSize=W*0.025, gap=12px -->
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
