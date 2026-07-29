import { ref, computed, type Ref } from 'vue'
import QRCode from 'qrcode'
import { toPng } from 'html-to-image'
import { jsPDF } from 'jspdf'
import { toast } from 'vue-sonner'

// ─── Types ─────────────────────────────────────────────────────
export type DownloadStyle = 'normal' | 'compact'
export type DownloadSize = 'sm' | 'md' | 'lg'
export type DownloadFormat = 'png' | 'pdf'

export interface QRDownloadProps {
  id: string
  name: string
  img?: string
  category?: string
}

// ─── Layout presets — global scale tokens per size ──────────────
export interface LayoutPreset {
  width: number
  height: number
  qr: { size: number; containerPadding: number; containerRadius: number }
  logo: { size: number; containerPadding: number; containerRadius: number }
  fonts: {
    topDomain: number
    name: number
    desc: number
    footerDomain: number
    footerEmail: number
    footerNote: number
  }
  sslIcon: { w: number; h: number }
  socialIcons: {
    gap: number
    items: Array<{ w: number; h: number }>
  }
  spacing: {
    outerPadding: number
    mainGap: number
    headerGap: number
    contentGap: number
    textGap: number
    footerGap: number
  }
}

export const layoutPresets: Record<DownloadSize, LayoutPreset> = {
  sm: {
    width: 400, height: 173,
    qr: { size: 80, containerPadding: 5, containerRadius: 10 },
    logo: { size: 20, containerPadding: 1, containerRadius: 6 },
    fonts: { topDomain: 19, name: 16, desc: 11, footerDomain: 14, footerEmail: 9, footerNote: 8 },
    sslIcon: { w: 14, h: 10 },
    socialIcons: { gap: 4, items: [{ w: 21, h: 22 }, { w: 20, h: 21 }, { w: 20, h: 19 }, { w: 19, h: 18 }, { w: 18, h: 19 }, { w: 20, h: 20 }] },
    spacing: { outerPadding: 6, mainGap: 3, headerGap: 6, contentGap: 12, textGap: 20, footerGap: 4 },
  },
  md: {
    width: 720, height: 500,
    qr: { size: 275, containerPadding: 8, containerRadius: 18 },
    logo: { size: 70, containerPadding: 6, containerRadius: 11 },
    fonts: { topDomain: 28, name: 54, desc: 22, footerDomain: 20, footerEmail: 20, footerNote: 18 },
    sslIcon: { w: 28, h: 22 },
    socialIcons: { gap: 6, items: [{ w: 39, h: 40 }, { w: 36, h: 38 }, { w: 37, h: 35 }, { w: 35, h: 33 }, { w: 33, h: 34 }, { w: 36, h: 36 }] },
    spacing: { outerPadding: 14, mainGap: 12, headerGap: 8, contentGap: 16, textGap: 34, footerGap: 4 },
  },
  lg: {
    width: 1080, height: 749,
    qr: { size: 430, containerPadding: 8, containerRadius: 26 },
    logo: { size: 108, containerPadding: 9, containerRadius: 16 },
    fonts: { topDomain: 43, name: 84, desc: 34, footerDomain: 30, footerEmail: 30, footerNote: 27 },
    sslIcon: { w: 40, h: 32 },
    socialIcons: { gap: 8, items: [{ w: 59, h: 60 }, { w: 54, h: 57 }, { w: 55, h: 53 }, { w: 53, h: 50 }, { w: 50, h: 52 }, { w: 54, h: 54 }] },
    spacing: { outerPadding: 22, mainGap: 16, headerGap: 10, contentGap: 20, textGap: 44, footerGap: 6 },
  },
}

export interface CompactPreset {
  size: number
  qr: { size: number; containerPadding: number }
  fonts: { top: number; side: number; bottom: number }
  spacing: { padding: number; gap: number }
}

export const compactPresets: Record<DownloadSize, CompactPreset> = {
  sm: { size: 200, qr: { size: 100, containerPadding: 4 }, fonts: { top: 11, side: 9, bottom: 7 }, spacing: { padding: 2, gap: 1 } },
  md: { size: 280, qr: { size: 190, containerPadding: 6 }, fonts: { top: 17, side: 13, bottom: 10 }, spacing: { padding: 3, gap: 2 } },
  lg: { size: 380, qr: { size: 260, containerPadding: 8 }, fonts: { top: 23, side: 18, bottom: 14 }, spacing: { padding: 4, gap: 3 } },
}

// ─── Physical dimensions for PDF (mm) — estilo Normal only ──────
// === NORMAL PHYSICAL SIZE CONFIG (PDF) START ===
export const PHYSICAL_SIZE_MM: Record<DownloadSize, { widthMm: number; heightMm: number }> = {
  sm: { widthMm: 132, heightMm: 57 },
  md: { widthMm: 170, heightMm: 118 },
  lg: { widthMm: 210, heightMm: 146 },
}

// ─── Physical dimensions for PDF (mm) — Compact (square) ────────
// === COMPACT PHYSICAL SIZE CONFIG (PDF) START ===
export const PHYSICAL_SIZE_MM_COMPACT: Record<DownloadSize, { sizeMm: number }> = {
  sm: { sizeMm: 55 },
  md: { sizeMm: 85 },
  lg: { sizeMm: 148 },
}

// ─── Composable ─────────────────────────────────────────────────
export function useQRDownload(props: Ref<QRDownloadProps> | QRDownloadProps) {
  // Resolve props (support both reactive Ref and plain object)
  const p = computed(() => ('value' in props ? (props as Ref<QRDownloadProps>).value : props))

  // ── State ─────────────────────────────────────────────────────
  const downloadStyle = ref<DownloadStyle>('normal')
  const downloadSize = ref<DownloadSize>('md')
  const downloadFormat = ref<DownloadFormat>('png')
  const isDownloading = ref(false)
  const qrHighResUrl = ref('')

  // ── Computed ─────────────────────────────────────────────────

  /** Generate the WhatsApp URL that will be encoded in the QR */
  const qrScanUrl = computed(() => {
    const id = p.value.id
    const name = p.value.name || 'Código QR'
    const text = `ID: ${id}\nQR: ${name}\nMensaje: Escaneé su QR *_"${name.trim()}"_* para contactarlo `
    return `https://wa.me/525652094079?text=${encodeURIComponent(text)}`
  })

  /** Current layout preset for normal style */
  const currentPreset = computed(() => layoutPresets[downloadSize.value])

  /** Current layout preset for compact style */
  const currentCompactPreset = computed(() => compactPresets[downloadSize.value])

  /** Both styles are available for PNG and PDF */
  const availableStyles = computed<DownloadStyle[]>(() => {
    return ['normal', 'compact']
  })

  // ── QR Generation ────────────────────────────────────────────

  /** Generate a high-resolution QR as a DataURL (Base64 PNG) */
  const generateHighResQR = async () => {
    const text = `https://wa.me/525652094079?text=${encodeURIComponent(
      `ID: ${p.value.id}\nQR: ${p.value.name || 'Código QR'}\nMensaje: Escaneé su QR *_"${(p.value.name || 'Código QR').trim()}"_* para contactarlo `,
    )}`
    try {
      const url = await QRCode.toDataURL(text, {
        width: 1200, // Increased from 600 to cover scale 4 at all sizes
        margin: 1,
        color: { dark: '#000000', light: '#ffffff' },
        errorCorrectionLevel: 'H',
      })
      qrHighResUrl.value = url
    } catch (error) {
      console.error('[useQRDownload] Error generating high-res QR:', error)
    }
  }

  // ── Capture helpers ─────────────────────────────────────────

  const doCapture = async (el: HTMLElement, pixelRatio = 4): Promise<string | null> => {
    try {
      return await toPng(el, { pixelRatio, skipFonts: true, cacheBust: true })
    } catch {
      return null
    }
  }

  // ── Download: PNG (normal style) ─────────────────────────────
  const handleDownloadPNG = async (el: HTMLElement | null, onClose?: () => void) => {
    if (!el) { toast.error('Error al capturar el QR. Intente de nuevo.'); return }
    isDownloading.value = true
    try {
      const dataUrl = await doCapture(el)
      if (!dataUrl) throw new Error('Capture returned null')
      const link = document.createElement('a')
      link.download = `qr-${p.value.id}.png`
      link.href = dataUrl
      link.click()
      toast.success('QR descargado como PNG')
      onClose?.()
    } catch (error) {
      toast.error(`Error al descargar PNG: ${error}`)
    } finally {
      isDownloading.value = false
    }
  }

  // ── Download: PNG (compact style) ────────────────────────────
  const handleDownloadCompactPNG = async (el: HTMLElement | null, onClose?: () => void) => {
    if (!el) { toast.error('Error al capturar el QR compacto. Intente de nuevo.'); return }
    isDownloading.value = true
    try {
      const dataUrl = await doCapture(el)
      if (!dataUrl) throw new Error('Capture returned null')
      const link = document.createElement('a')
      link.download = `qr-compact-${p.value.id}.png`
      link.href = dataUrl
      link.click()
      toast.success('QR compacto descargado como PNG')
      onClose?.()
    } catch (error) {
      toast.error(`Error al descargar QR compacto: ${error}`)
    } finally {
      isDownloading.value = false
    }
  }

  // ── Download: PDF (from compact style canvas) ────────────────
  const handleDownloadCompactPDF = async (el: HTMLElement | null, onClose?: () => void) => {
    if (!el) { toast.error('Error al capturar el QR compacto. Intente de nuevo.'); return }
    isDownloading.value = true
    try {
      const dataUrl = await doCapture(el)
      if (!dataUrl) throw new Error('Capture returned null')
      const { sizeMm } = PHYSICAL_SIZE_MM_COMPACT[downloadSize.value]
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: [sizeMm, sizeMm] })
      pdf.addImage(dataUrl, 'PNG', 0, 0, sizeMm, sizeMm)
      pdf.save(`qr-compact-${p.value.id}.pdf`)
      toast.success('QR compacto descargado como PDF — tamaño físico exacto para impresión')
      onClose?.()
    } catch (error) {
      toast.error(`Error al descargar PDF compacto: ${error}`)
    } finally {
      isDownloading.value = false
    }
  }

  // ── Download: PDF (from normal style canvas) ─────────────────
  const handleDownloadPDF = async (el: HTMLElement | null, onClose?: () => void) => {
    if (!el) { toast.error('Error al capturar el QR. Intente de nuevo.'); return }
    isDownloading.value = true
    try {
      const dataUrl = await doCapture(el)
      if (!dataUrl) throw new Error('Capture returned null')
      const { widthMm, heightMm } = PHYSICAL_SIZE_MM[downloadSize.value]
      const pdf = new jsPDF({
        orientation: widthMm >= heightMm ? 'landscape' : 'portrait',
        unit: 'mm',
        format: [widthMm, heightMm],
      })
      pdf.addImage(dataUrl, 'PNG', 0, 0, widthMm, heightMm)
      pdf.save(`qr-${p.value.id}.pdf`)
      toast.success('QR descargado como PDF — tamaño físico exacto para impresión')
      onClose?.()
    } catch (error) {
      toast.error(`Error al descargar PDF: ${error}`)
    } finally {
      isDownloading.value = false
    }
  }

  // ── Unified download dispatcher ──────────────────────────────

  const handleDownload = (el: HTMLElement | null, onClose?: () => void) => {
    if (downloadFormat.value === 'pdf') {
      if (downloadStyle.value === 'compact') return handleDownloadCompactPDF(el, onClose)
      return handleDownloadPDF(el, onClose)
    }
    if (downloadStyle.value === 'compact') return handleDownloadCompactPNG(el, onClose)
    return handleDownloadPNG(el, onClose)
  }

  const getDownloadLabel = computed(() => {
    if (isDownloading.value) return 'Descargando...'
    if (downloadFormat.value === 'pdf') return 'Descargar PDF'
    return 'Descargar QR'
  })

  // ── Public API ───────────────────────────────────────────────

  return {
    // State
    downloadStyle,
    downloadSize,
    downloadFormat,
    isDownloading,
    qrHighResUrl,

    // Computed
    qrScanUrl,
    currentPreset,
    currentCompactPreset,
    availableStyles,
    getDownloadLabel,

    // Methods
    generateHighResQR,
    handleDownloadPNG,
    handleDownloadCompactPNG,
    handleDownloadPDF,
    handleDownloadCompactPDF,
    handleDownload,
  }
}
