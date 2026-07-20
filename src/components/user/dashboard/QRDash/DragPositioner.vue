<script lang="ts" setup>
import { ref } from 'vue'
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

// ─── Size config (same as useQRDownload.ts) ──────────────────────
const sizeConfig: Record<string, { width: number; height: number; qrSize: number }> = {
  sm: { width: 400, height: 173, qrSize: 115 },
  md: { width: 720, height: 500, qrSize: 300 },
  lg: { width: 1080, height: 749, qrSize: 460 },
}

const cfg = sizeConfig[props.downloadSize] || sizeConfig.md
const PAD = cfg.width * 0.02
const logoScale = props.downloadSize === 'sm' ? 0.1 : 0.097

// ─── Elements state: { left, top } in px within the template ─────
// We leave the flex layout as-is. The wrapper is the capture container.
// For drag we will add position:relative on wrapper and position:absolute
// on each element, then override left/top with these offsets.

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

// ─── Reset ───────────────────────────────────────────────────────
const resetPositions = () => {
  Object.keys(offsets.value).forEach((k) => {
    offsets.value[k] = { left: 0, top: 0 }
  })
}

// ─── Export to PNG ───────────────────────────────────────────────
const exportPNG = async () => {
  const el = document.getElementById(`drag-tpl-${props.qrId}`)
  if (!el) return toast.error('No se encontró la plantilla')

  try {
    const canvas = await html2canvas(el, { scale: 4, backgroundColor: '#f97316', useCORS: true })
    const link = document.createElement('a')
    link.download = `qr-${props.qrId}-custom.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
    toast.success('QR personalizado descargado')
  } catch (e) {
    toast.error(`Error: ${e}`)
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
            <!-- Header -->
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

            <!-- Canvas area: scrollable -->
            <div class="flex-1 overflow-auto bg-slate-50 p-6 flex justify-center items-start">
              <!-- ═══ EXACT TEMPLATE (clone of normal capture) with drag handles ═══ -->
              <div :id="`drag-tpl-${props.qrId}`"
                :style="`width:${cfg.width}px;height:${cfg.height}px;padding:${PAD}px;background:linear-gradient(80deg,#f97316,#fcbd74);font-family:'Google Sans',sans-serif;position:relative;overflow:hidden;box-sizing:border-box;flex-shrink:0;`">

                <!-- Logo top-right (draggable) -->
                <div
                  :style="`position:absolute;top:${cfg.width * 0.015 + offsets.logo.top}px;right:${cfg.width * 0.015 - offsets.logo.left}px;background:rgba(0,0,0,0.8);border-radius:${cfg.width * 0.015}px;padding:${cfg.width * 0.008}px;z-index:10;cursor:grab;`"
                  @mousedown="startDrag('logo', $event)">
                  <img :src="LogoWhite"
                    :style="`width:${cfg.width * logoScale}px;height:auto;opacity:0.9;display:block;pointer-events:none;`"
                    alt="Ubiqueme" />
                </div>

                <!-- Inner column (the rest moves together as one block via position:absolute on container) -->
                <div
                  :style="`position:absolute;left:${PAD + offsets.qrBox.left}px;top:${PAD + offsets.qrBox.top}px;width:${cfg.width - PAD * 2}px;height:${cfg.height - PAD * 2}px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;`">

                  <!-- "ubiqueme.com" top center (draggable individually) -->
                  <span
                    :style="`color:#fff;font-weight:900;letter-spacing:0.15em;text-transform:uppercase;font-size:${cfg.width * 0.035}px;text-align:center;cursor:grab;position:relative;left:${offsets.topDomain.left}px;top:${offsets.topDomain.top}px;`"
                    @mousedown="startDrag('topDomain', $event)">ubiqueme.com</span>

                  <!-- Row: QR + info -->
                  <div
                    style="display:flex;flex-direction:row;align-items:center;justify-content:center;gap:4px;flex:1;width:100%;">
                    <!-- QR box (draggable) -->
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
                      <!-- Name (draggable) -->
                      <p :style="`color:#171717;font-size:${cfg.width * 0.082}px;font-weight:900;margin:0;line-height:1.1;cursor:grab;position:relative;left:${offsets.name.left}px;top:${offsets.name.top}px;`"
                        @mousedown="startDrag('name', $event)">{{ qrName || 'Código QR' }}</p>
                      <!-- ID (draggable) -->
                      <p :style="`color:#444;font-size:${Math.round(cfg.width * 0.02)}px;font-weight:600;margin:0;line-height:1.2;font-family:monospace;cursor:grab;position:relative;left:${offsets.id.left}px;top:${offsets.id.top}px;`"
                        @mousedown="startDrag('id', $event)">#{{ qrId }}</p>
                      <!-- Desc 1 (draggable) -->
                      <p :style="`color:#303030;font-size:${cfg.width * 0.048}px;font-weight:500;margin:0;line-height:1.2;cursor:grab;position:relative;left:${offsets.desc1.left}px;top:${offsets.desc1.top}px;`"
                        @mousedown="startDrag('desc1', $event)">Escanee este QR para contactar al responsable.</p>
                      <!-- Desc 2 (draggable) -->
                      <p :style="`color:#000;font-size:${Math.round(cfg.width * 0.022)}px;font-weight:500;margin:3px 0 0;line-height:1.2;cursor:grab;position:relative;left:${offsets.desc2.left}px;top:${offsets.desc2.top}px;`"
                        @mousedown="startDrag('desc2', $event)">QR oficial de Ubiqueme.com® — Marca 100% segura y
                        verificada.</p>
                    </div>
                  </div>

                  <!-- Bottom domains (draggable) -->
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

            <!-- Bottom toolbar -->
            <div class="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-white">
              <div class="flex items-center gap-2">
                <button @click="resetPositions"
                  class="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 text-sm font-medium hover:bg-slate-200 transition cursor-pointer">
                  <span class="material-symbols-outlined notranslate text-lg align-middle">refresh</span> Restablecer
                </button>
                <span class="text-xs text-slate-400">Arrastra los elementos para reposicionarlos</span>
              </div>
              <div class="flex items-center gap-3">
                <button @click="close"
                  class="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition cursor-pointer">Cancelar</button>
                <button @click="exportPNG"
                  class="px-5 py-2.5 rounded-xl bg-orange-500 text-white text-sm font-bold hover:bg-orange-600 transition cursor-pointer flex items-center gap-2 shadow-lg shadow-orange-500/20">
                  <span class="material-symbols-outlined notranslate text-lg">download</span> Exportar PNG
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
