<script lang="ts" setup>
import { ref, computed, watch } from 'vue'
import { toast } from 'vue-sonner'
import { toCanvas } from 'html-to-image'
import { jsPDF } from 'jspdf'
import LogoWhite from '@/assets/Ubiqueme_Logo_white.webp'
import Social4 from '@/assets/drag-images/social-4.webp'
import Social5 from '@/assets/drag-images/social-5.webp'
import Social6 from '@/assets/drag-images/social-6.webp'
import Social7 from '@/assets/drag-images/social-7.webp'
import Social8 from '@/assets/drag-images/social-8.webp'
import Social9 from '@/assets/drag-images/social-9.webp'
import { DEFAULT_USER_IMAGES } from '@/config/dragDefaults'

const socialIconImages = [Social4, Social5, Social6, Social7, Social8, Social9]

const props = defineProps<{
  visible: boolean
  qrId: string
  qrName: string
  qrImg?: string
  qrDataUrl: string
  downloadSize: 'sm' | 'md' | 'lg'
  readonly?: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

// ══════════════════════════════════════════════════════════════
//  SIZE CONFIG — from shared layoutPresets
// ══════════════════════════════════════════════════════════════
import { layoutPresets } from '@/composables/useQRDownload'

const tplRef = ref<HTMLElement | null>(null)

// ─── Reactive size ─────────────────────────────────────────────
const activeSize = ref<string>(props.downloadSize)

const cfg = computed(() => layoutPresets[activeSize.value as keyof typeof layoutPresets] ?? layoutPresets.md)

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

// ─── Overlay IDs to exclude on md/lg (social icons + SSL icon) ─
const excludedOverlayIds = computed(() => {
  if (activeSize.value === 'sm') return new Set<string>()
  return new Set(['userImg-10', 'userImg-4', 'userImg-5', 'userImg-6', 'userImg-7', 'userImg-8', 'userImg-9'])
})

// ─── Drag handling (user images overlay only) ─────────────────
const dragging = ref<{
  id: string
  startX: number
  startY: number
  origLeft: number
  origTop: number
} | null>(null)

const startDrag = (id: string, e: MouseEvent) => {
  if (props.readonly) return
  e.preventDefault()
  const img = currentImages.value.find((i) => i.id === id)
  if (!img) return
  dragging.value = { id, startX: e.clientX, startY: e.clientY, origLeft: img.offsets.left, origTop: img.offsets.top }
  const onMove = (ev: MouseEvent) => {
    if (!dragging.value) return
    const dx = ev.clientX - dragging.value.startX
    const dy = ev.clientY - dragging.value.startY
    img.offsets.left = dragging.value.origLeft + dx
    img.offsets.top = dragging.value.origTop + dy
  }
  const onUp = () => {
    dragging.value = null
    document.removeEventListener('mousemove', onMove)
    document.removeEventListener('mouseup', onUp)
  }
  document.addEventListener('mousemove', onMove)
  document.addEventListener('mouseup', onUp)
}

// ─── Export helpers ──────────────────────────────────────────

/** Capture the template directly with html-to-image */
const captureCanvas = async () => {
  const el = tplRef.value
  if (!el) { toast.error('No se encontró la plantilla'); return null }
  try {
    return await toCanvas(el, {
      pixelRatio: 4,
      backgroundColor: '#f97316',
      skipFonts: true,
      cacheBust: true,
    })
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
                <h2 class="text-lg font-bold text-slate-900">{{ readonly ? `Descargar QR — ${qrName}` : `Personalizar posición — ${qrName}` }}</h2>
                <p class="text-xs text-slate-400">{{ readonly ? 'Selecciona el tamaño y formato para descargar' : 'Arrastra cada elemento para reposicionarlo' }}</p>
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
            <div class="flex-1 overflow-auto bg-slate-50 p-6 flex justify-center items-start" :class="{ 'pointer-events-none': readonly }">
              <div :id="`drag-tpl-${props.qrId}`" ref="tplRef"
                :style="`width:${cfg.width}px;height:${cfg.height}px;padding:${cfg.spacing.outerPadding}px;background:linear-gradient(80deg,#f97316,#fcbd74);font-family:'Google Sans',sans-serif;display:flex;flex-direction:column;gap:${cfg.spacing.mainGap}px`"
                class="relative overflow-hidden shrink-0">

                <!-- User images overlay (draggable, absolute positioning for superpositions) -->
                <template v-for="img in currentImages" :key="img.id">
                  <div v-if="!excludedOverlayIds.has(img.id)"
                    :style="`position:absolute;left:${cfg.spacing.outerPadding + img.offsets.left}px;top:${cfg.spacing.outerPadding + img.offsets.top}px;z-index:20`"
                    class="cursor-grab border-2 border-transparent rounded overflow-hidden transition-colors duration-150 hover:border-white/80"
                    @mousedown="startDrag(img.id, $event)">
                    <img :src="img.src" :style="`width:${img.width}px;height:${img.height}px`"
                      class="block pointer-events-none object-contain" />
                  </div>
                </template>

                <!-- HEADER: SSL + HTTPS// + Dominio | Logo -->
                <template v-if="activeSize === 'sm'">
                  <div class="flex items-center justify-between shrink-0"
                    :style="{ gap: cfg.spacing.headerGap + 'px' }">
                    <div class="flex items-center" :style="{ gap: cfg.spacing.headerGap + 'px' }">
                      <img src="/src/assets/drag-images/social-10.webp"
                        :style="{ width: cfg.sslIcon.w + 'px', height: cfg.sslIcon.h + 'px' }"
                        class="object-contain" />
                      <span :style="{ fontSize: cfg.fonts.topDomain + 'px' }"
                        class="text-black font-black tracking-widest uppercase leading-none">HTTPS://</span>
                      <span :style="{ fontSize: cfg.fonts.topDomain + 'px' }"
                        class="text-white font-black tracking-widest uppercase leading-none">ubiqueme.com</span>
                    </div>
                    <div :style="{
                      padding: cfg.logo.containerPadding + 'px',
                      borderRadius: cfg.logo.containerRadius + 'px',
                    }" class="bg-black/80 flex items-center justify-center shrink-0">
                      <img :src="LogoWhite" :style="{ width: cfg.logo.size + 'px' }"
                        class="h-auto opacity-90 block" />
                    </div>
                  </div>
                </template>
                <template v-else>
                  <div class="flex items-center justify-center shrink-0"
                    :style="{ gap: cfg.spacing.headerGap + 'px' }">
                    <img src="/src/assets/drag-images/social-10.webp"
                      :style="{ width: cfg.sslIcon.w + 'px', height: cfg.sslIcon.h + 'px' }"
                      class="object-contain" />
                    <span :style="{ fontSize: cfg.fonts.topDomain + 'px' }"
                      class="text-black font-black tracking-widest uppercase leading-none">HTTPS://</span>
                    <span :style="{ fontSize: cfg.fonts.topDomain + 'px' }"
                      class="text-black font-black tracking-widest uppercase leading-none">ubiqueme.com</span>
                    <div :style="{
                      padding: cfg.logo.containerPadding + 'px',
                      borderRadius: cfg.logo.containerRadius + 'px',
                    }" class="bg-black/80 flex items-center justify-center shrink-0">
                      <img :src="LogoWhite" :style="{ width: cfg.logo.size + 'px' }"
                        class="h-auto opacity-90 block" />
                    </div>
                  </div>
                </template>

                <!-- CONTENT: QR + Info -->
                <div class="flex items-start flex-1 min-h-0"
                  :style="{ gap: cfg.spacing.contentGap + 'px' }">
                  <div :style="{
                    width: (cfg.qr.size + cfg.qr.containerPadding * 2) + 'px',
                    height: (cfg.qr.size + cfg.qr.containerPadding * 2) + 'px',
                    borderRadius: cfg.qr.containerRadius + 'px',
                    padding: cfg.qr.containerPadding + 'px',
                  }" class="shrink-0 self-start bg-white flex items-center justify-center overflow-hidden">
                    <template v-if="qrDataUrl">
                      <img :src="qrDataUrl"
                        :style="{ width: cfg.qr.size + 'px', height: cfg.qr.size + 'px' }"
                        class="object-contain" />
                    </template>
                    <template v-else-if="qrImg">
                      <img :src="qrImg"
                        :style="{ width: cfg.qr.size + 'px', height: cfg.qr.size + 'px' }"
                        class="object-contain" />
                    </template>
                  </div>
                  <div class="flex flex-col flex-1 min-w-0 text-center overflow-hidden self-stretch"
                    :style="{ gap: cfg.spacing.textGap + 'px' }">
                    <p :style="{ fontSize: cfg.fonts.name + 'px' }"
                      class="text-[#171717] font-black leading-tight m-0 truncate">
                      {{ qrName || 'QR Name' }}
                    </p>
                    <p :style="{ fontSize: cfg.fonts.desc + 'px' }"
                      :class="activeSize === 'sm' ? 'max-w-[75%] self-center' : ''"
                      class="text-[#303030] font-medium leading-tight m-0 line-clamp-2">
                      Escanee este QR para contactar al responsable.
                    </p>
                    <p :style="{ fontSize: cfg.fonts.footerNote + 'px' }"
                      class="text-black font-medium leading-tight m-0 shrink-0">
                      QR oficial de Ubiqueme.com® — Marca 100% segura y verificada.
                    </p>
                  </div>
                </div>

                <!-- FOOTER -->
                <template v-if="activeSize === 'sm'">
                  <div class="flex flex-col shrink-0 items-center justify-center"
                    :style="{ gap: cfg.spacing.footerGap + 'px' }">
                    <span :style="{ fontSize: cfg.fonts.footerEmail + 'px' }"
                      class="text-white font-bold tracking-wider">soporte@ubiqueme.com</span>
                    <div class="flex items-center justify-center"
                      :style="{ gap: cfg.spacing.footerGap + 'px' }">
                      <span :style="{ fontSize: cfg.fonts.footerDomain + 'px' }"
                        class="text-white font-bold uppercase tracking-wider" translate="no">localizarme.com</span>
                      <span :style="{ fontSize: cfg.fonts.footerDomain + 'px' }"
                        class="text-white/50">•</span>
                      <span :style="{ fontSize: cfg.fonts.footerDomain + 'px' }"
                        class="text-white font-bold uppercase tracking-wider" translate="no">contactomio.com</span>
                    </div>
                  </div>
                </template>
                <template v-else>
                  <div class="flex shrink-0 justify-between items-center"
                    :style="{ gap: cfg.spacing.mainGap + 'px' }">
                    <div class="flex flex-col items-start"
                      :style="{ gap: cfg.spacing.footerGap + 'px' }">
                      <span :style="{ fontSize: cfg.fonts.footerEmail + 'px' }"
                        class="text-black font-bold tracking-wider">soporte@ubiqueme.com</span>
                      <div class="flex items-center"
                        :style="{ gap: cfg.spacing.footerGap + 'px' }">
                        <span :style="{ fontSize: cfg.fonts.footerDomain + 'px' }"
                          class="text-black font-bold uppercase tracking-wider" translate="no">localizarme.com</span>
                        <span :style="{ fontSize: cfg.fonts.footerDomain + 'px' }"
                          class="text-black/50">•</span>
                        <span :style="{ fontSize: cfg.fonts.footerDomain + 'px' }"
                          class="text-black font-bold uppercase tracking-wider" translate="no">contactomio.com</span>
                      </div>
                    </div>
                    <div class="flex items-center"
                      :style="{ gap: cfg.socialIcons.gap + 'px' }">
                      <template v-for="(icon, idx) in cfg.socialIcons.items" :key="idx">
                        <img :src="socialIconImages[idx]"
                          :style="{ width: icon.w + 'px', height: icon.h + 'px' }"
                          class="object-contain block" />
                      </template>
                    </div>
                  </div>
                </template>
              </div>
            </div>

            <!-- ─── BOTTOM TOOLBAR ─── -->
            <div class="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-white">
              <div v-if="!readonly" class="flex items-center gap-2">
                <span class="text-xs text-slate-400">Arrastra tus imágenes para superponer</span>
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
