import { ref, computed, type Ref } from 'vue'
import QRCode from 'qrcode'
import html2canvas from 'html2canvas'
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

// ─── Size configs for template rendering ────────────────────────
// height = width / aspectRatio to match the physical PDF dimensions
// SM stays as-is. MD and LG have larger templates so QR, name & text scale up.
export const sizeConfig: Record<DownloadSize, { width: number; height: number; qrSize: number }> = {
  sm: { width: 400, height: 173, qrSize: 130 },
  md: { width: 720, height: 500, qrSize: 300 },
  lg: { width: 1080, height: 749, qrSize: 460 },
}

export const compactSizeConfig: Record<DownloadSize, { size: number; qrSize: number }> = {
  sm: { size: 200, qrSize: 130 },
  md: { size: 280, qrSize: 190 },
  lg: { size: 380, qrSize: 260 },
}

// ─── Physical dimensions for PDF (mm) — estilo Normal only ──────
export const PHYSICAL_SIZE_MM: Record<DownloadSize, { widthMm: number; heightMm: number }> = {
  sm: { widthMm: 132, heightMm: 57 },
  md: { widthMm: 170, heightMm: 118 },
  lg: { widthMm: 210, heightMm: 146 },
}

// ─── Physical dimensions for PDF (mm) — Compact (square) ────────
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

  /** Current size config for normal style */
  const currentSize = computed(() => sizeConfig[downloadSize.value])

  /** Current size config for compact style */
  const currentCompactSize = computed(() => compactSizeConfig[downloadSize.value])

  /** Font-size scale factors per size — SM gets 1.2×, MD/LG get 1.5× */
  const textScale = computed(() => {
    const isSm = downloadSize.value === 'sm'
    return {
      name: isSm ? 0.066 : 0.082,
      desc: isSm ? 0.038 : 0.048,
    }
  })

  /** Font-size scale factors for domain texts in normal style */
  const domainTextScale = computed(() => {
    const isSm = downloadSize.value === 'sm'
    return {
      top: isSm ? 0.048 : 0.035, // ubiqueme.com
      bottom: isSm ? 0.035 : 0.025, // localizarme / contactomio
    }
  })

  /** Font-size scale factors for domain texts in compact style based on compactSize */
  const compactDomainTextScale = computed(() => {
    const isSm = downloadSize.value === 'sm'
    return {
      top: isSm ? 0.055 : 0.06, // ubiqueme.com
      bottom: isSm ? 0.038 : 0.048, // localizarme / contactomio
    }
  })

  /** Logo scale factor per size — bigger logo on larger templates */
  const logoScale = computed(() => {
    const size = downloadSize.value
    if (size === 'sm') return 0.1
    if (size === 'md') return 0.097
    if (size === 'lg') return 0.1
    return 0.06
  })

  /** Both styles are available for PNG and PDF */
  const availableStyles = computed<DownloadStyle[]>(() => {
    return ['normal', 'compact']
  })

  /** Generate a DOM element ID for the capture template */
  const getQrCaptureId = (suffix: 'normal' | 'compact'): string => {
    return `qr-capture-${suffix}-${p.value.id}`
  }

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

  // ── Capture helpers ──────────────────────────────────────────

  /** Capture a template element with html2canvas and return the canvas */
  const captureTemplate = async (
    elementId: string,
    bgColor: string,
    scale = 4,
  ): Promise<HTMLCanvasElement | null> => {
    const el = document.getElementById(elementId)
    if (!el) return null
    return html2canvas(el, {
      scale,
      backgroundColor: bgColor,
      useCORS: true,
    })
  }

  // ── Download: PNG (normal style) ─────────────────────────────

  const handleDownloadPNG = async (onClose?: () => void) => {
    const elId = getQrCaptureId('normal')
    const el = document.getElementById(elId)
    if (!el) {
      toast.error('Error al capturar el QR. Intente de nuevo.')
      return
    }

    isDownloading.value = true
    try {
      const canvas = await html2canvas(el, {
        scale: 4,
        backgroundColor: '#0a0401',
        useCORS: true,
      })

      const link = document.createElement('a')
      link.download = `qr-${p.value.id}.png`
      link.href = canvas.toDataURL('image/png')
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

  const handleDownloadCompactPNG = async (onClose?: () => void) => {
    const elId = getQrCaptureId('compact')
    const el = document.getElementById(elId)
    if (!el) {
      toast.error('Error al capturar el QR compacto. Intente de nuevo.')
      return
    }

    isDownloading.value = true
    try {
      const canvas = await html2canvas(el, {
        scale: 4,
        backgroundColor: '#ffffff',
        useCORS: true,
      })

      const link = document.createElement('a')
      link.download = `qr-compact-${p.value.id}.png`
      link.href = canvas.toDataURL('image/png')
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

  const handleDownloadCompactPDF = async (onClose?: () => void) => {
    const elId = getQrCaptureId('compact')
    const el = document.getElementById(elId)
    if (!el) {
      toast.error('Error al capturar el QR compacto. Intente de nuevo.')
      return
    }

    isDownloading.value = true
    try {
      const canvas = await html2canvas(el, {
        scale: 4,
        backgroundColor: '#ffffff',
        useCORS: true,
      })

      const { sizeMm } = PHYSICAL_SIZE_MM_COMPACT[downloadSize.value]

      const { jsPDF } = await import('jspdf')

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [sizeMm, sizeMm],
      })

      const imgData = canvas.toDataURL('image/png')
      pdf.addImage(imgData, 'PNG', 0, 0, sizeMm, sizeMm)

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

  const handleDownloadPDF = async (onClose?: () => void) => {
    const elId = getQrCaptureId('normal')
    const el = document.getElementById(elId)
    if (!el) {
      toast.error('Error al capturar el QR. Intente de nuevo.')
      return
    }

    isDownloading.value = true
    try {
      // 1. Capture the same template with html2canvas
      const canvas = await html2canvas(el, {
        scale: 4,
        backgroundColor: '#0a0401',
        useCORS: true,
      })

      // 2. Get physical dimensions for the selected size
      const { widthMm, heightMm } = PHYSICAL_SIZE_MM[downloadSize.value]

      // 3. Dynamically import jsPDF (code-split, not in main bundle)
      const { jsPDF } = await import('jspdf')

      // 4. Create PDF with exact physical dimensions
      const pdf = new jsPDF({
        orientation: widthMm >= heightMm ? 'landscape' : 'portrait',
        unit: 'mm',
        format: [widthMm, heightMm],
      })

      // 5. Insert the full canvas image scaled to fill the page
      const imgData = canvas.toDataURL('image/png')
      pdf.addImage(imgData, 'PNG', 0, 0, widthMm, heightMm)

      // 6. Save (triggers download)
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

  const handleDownload = (onClose?: () => void) => {
    if (downloadFormat.value === 'pdf') {
      if (downloadStyle.value === 'compact') {
        return handleDownloadCompactPDF(onClose)
      }
      return handleDownloadPDF(onClose)
    }
    if (downloadStyle.value === 'compact') {
      return handleDownloadCompactPNG(onClose)
    }
    return handleDownloadPNG(onClose)
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
    currentSize,
    currentCompactSize,
    textScale,
    logoScale,
    availableStyles,
    getDownloadLabel,

    // Scale factors
    domainTextScale,
    compactDomainTextScale,

    // Methods
    getQrCaptureId,
    generateHighResQR,
    handleDownloadPNG,
    handleDownloadCompactPNG,
    handleDownloadPDF,
    handleDownloadCompactPDF,
    handleDownload,
  }
}
