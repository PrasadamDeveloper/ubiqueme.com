<script lang="ts" setup>
import { ref, computed, watch } from 'vue'
import QRCode from 'qrcode'
import { toast } from 'vue-sonner'
import html2canvas from 'html2canvas'

const props = defineProps<{
  placeName: string
  placeImage?: string
}>()

// ── QR Generation ──
const qrDataUrl = ref('')
const demoId = ref(`demo-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`)

const qrText = computed(() => {
  const name = props.placeName || 'Código QR'
  const text = `ID: ${demoId.value}\nQR: ${name}\nMensaje: Escaneé su QR *_"${name.trim()}"_* para contactarlo `
  return `https://wa.me/525652094079?text=${encodeURIComponent(text)}`
})

const generateQR = async () => {
  try {
    qrDataUrl.value = await QRCode.toDataURL(qrText.value, {
      width: 400,
      margin: 2,
      color: { dark: '#000000', light: '#ffffff' },
      errorCorrectionLevel: 'H',
    })
  } catch (err) {
    console.error('[QRDemoCard] Error generating QR:', err)
  }
}

watch(() => props.placeName, () => { generateQR() }, { immediate: true })

// ── Download ──
const isDownloading = ref(false)

const handleDownloadPNG = async () => {
  const el = document.getElementById('qrdemo-capture')
  if (!el) return
  isDownloading.value = true
  try {
    const canvas = await html2canvas(el, {
      scale: 4,
      backgroundColor: '#ffffff',
      useCORS: true,
    })
    const link = document.createElement('a')
    link.download = `qr-${props.placeName.toLowerCase()}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
    toast.success('QR descargado como PNG')
  } catch (err) {
    toast.error(`Error al descargar: ${err}`)
  } finally {
    isDownloading.value = false
  }
}

const handleDownloadPDF = async () => {
  const el = document.getElementById('qrdemo-capture')
  if (!el) return
  isDownloading.value = true
  try {
    const canvas = await html2canvas(el, {
      scale: 4,
      backgroundColor: '#ffffff',
      useCORS: true,
    })
    const { jsPDF } = await import('jspdf')
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: [132, 57],
    })
    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, 132, 57)
    pdf.save(`qr-${props.placeName.toLowerCase()}.pdf`)
    toast.success('QR descargado como PDF')
  } catch (err) {
    toast.error(`Error al descargar PDF: ${err}`)
  } finally {
    isDownloading.value = false
  }
}

// ── Category helper ──
const categoryIcon = computed(() => {
  const map: Record<string, string> = {
    'Automóvil': 'directions_car',
    'Hogar': 'home',
    'Celular': 'smartphone',
    'Bolso': 'bag',
    'Maleta': 'luggage',
    'Mascota': 'pets',
    'Laptop': 'laptop',
    'Familiar': 'family_history',
    'Electrónico': 'devices',
  }
  return map[props.placeName] || 'qr_code'
})
</script>

<template>
  <section class="mx-auto max-w-7xl px-6 sm:px-10 lg:px-12 pb-24">
    <!-- Section header -->
    <div class="mx-auto max-w-2xl text-center">
      <span class="text-sm font-semibold tracking-widest uppercase text-blue-600">
        Demo interactiva
      </span>
      <h2 class="mt-4 text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
        Su QR en tiempo real
      </h2>
      <p class="mt-5 text-lg leading-8 text-slate-600">
        El código QR se genera automáticamente con el nombre del lugar que aparece arriba.
        Así se vería su etiqueta física.
      </p>
    </div>

    <!-- Card: QR left + Info right (desktop), stacked (mobile) -->
    <div class="mt-14 flex flex-col lg:flex-row gap-8 lg:gap-12 items-center">

      <!-- QR Preview (left) -->
      <div class="w-full lg:w-1/2 flex justify-center">
        <div id="qrdemo-capture"
          class="relative overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-lg"
          style="width: 400px; height: 173px;">
          <!-- QR + Name row -->
          <div class="flex items-center h-full px-4 py-3 gap-4">
            <!-- QR -->
            <div class="shrink-0">
              <img v-if="qrDataUrl" :src="qrDataUrl" alt="QR Code" class="w-[100px] h-[100px]" />
              <div v-else class="w-[100px] h-[100px] bg-slate-100 rounded-lg flex items-center justify-center">
                <span class="material-symbols-outlined text-slate-300 text-4xl">qr_code</span>
              </div>
            </div>
            <!-- Info -->
            <div class="flex flex-col justify-center min-w-0">
              <span class="text-lg font-bold text-slate-900 truncate">
                {{ placeName }}
              </span>
              <div class="flex items-center gap-1.5 mt-1">
                <span class="material-symbols-outlined text-[16px] text-blue-500">{{ categoryIcon }}</span>
                <span class="text-xs text-slate-500 font-medium">{{ placeName }}</span>
              </div>
              <div class="mt-2 flex items-center gap-1.5">
                <span class="material-symbols-outlined text-[14px] text-emerald-500">check_circle</span>
                <span class="text-[11px] text-slate-400">ubiqueme.com</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Info & Actions (right) -->
      <div class="w-full lg:w-1/2 space-y-6">
        <!-- Stats -->
        <div class="grid grid-cols-2 gap-4">
          <div class="rounded-2xl border border-slate-200 bg-white p-5">
            <span class="material-symbols-outlined text-blue-500 text-2xl">qr_code_scanner</span>
            <p class="mt-2 text-2xl font-bold text-slate-900">1</p>
            <p class="text-sm text-slate-500">Código QR activo</p>
          </div>
          <div class="rounded-2xl border border-slate-200 bg-white p-5">
            <span class="material-symbols-outlined text-emerald-500 text-2xl">sync</span>
            <p class="mt-2 text-2xl font-bold text-slate-900">Tiempo real</p>
            <p class="text-sm text-slate-500">Cambia con el nombre</p>
          </div>
        </div>

        <!-- Download buttons -->
        <div class="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
          <h3 class="font-semibold text-slate-900">Descargar ejemplo</h3>
          <p class="text-sm text-slate-500">
            Obtenga una vista previa descargable de su QR personalizado.
          </p>
          <div class="flex flex-col sm:flex-row gap-3">
            <button @click="handleDownloadPNG" :disabled="isDownloading"
              class="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed">
              <span class="material-symbols-outlined text-[18px]">image</span>
              {{ isDownloading ? 'Descargando...' : 'PNG' }}
            </button>
            <button @click="handleDownloadPDF" :disabled="isDownloading"
              class="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed">
              <span class="material-symbols-outlined text-[18px]">picture_as_pdf</span>
              PDF
            </button>
          </div>
        </div>
      </div>

    </div>
  </section>
</template>

<style scoped>
.material-symbols-outlined {
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}
</style>
