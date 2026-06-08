<script lang="ts" setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { collection, doc, getDoc, increment, Timestamp, writeBatch } from 'firebase/firestore'
import { db } from '@/firebase'
import imageCompression from 'browser-image-compression'
import CloudLoader from '@/components/ui/CloudLoader.vue'
import HomeLayout from '@/layouts/HomeLayout.vue'
import type { IPublicQR, IQRScanMetrics } from '@/interfaces/IPublicQR'
import { toast } from 'vue-sonner'

const route = useRoute()
const qrId = route.params.qrId as string

// ========================
// CURRENT FLOW STATE (WhatsApp + Email)
// ========================
const loading = ref(true)
const qrData = ref<IPublicQR | null>(null)
const errorMsg = ref('')
const QRName = computed(() => qrData.value?.name || 'objeto')
const userReason = ref('')
const isSending = ref(false)
const hasSent = ref(false)

// WhatsApp number from .env
const whatsappNumber = '+525652094079'

const scanTime = computed(() => {
  const now = new Date()
  const day = String(now.getDate()).padStart(2, '0')
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const year = now.getFullYear()
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  return `${day}/${month}/${year} ${hours}:${minutes}`
})

const customMessage = computed(() => {
  return `Mensaje: ${userReason.value.trim() || 'Sin mensaje'}`
})

// ========================
// LEGACY FLOW STATE (Reasons + Image)
// ========================
const showContactForm = ref(false)
const selectedReason = ref('')
const legacyMessage = ref('')
const capturedImage = ref<string | null>(null)
const imagePreviewUrl = ref('')
const processingImage = ref(false)
const legacySending = ref(false)
const legacySuccess = ref(false)

const reasons = ref<any[]>([])

const loadQRData = async () => {
  try {
    if (!qrId) throw new Error()
    const docSnap = await getDoc(doc(db, 'publicQR', qrId))
    if (!docSnap.exists()) throw new Error()
    qrData.value = docSnap.data() as IPublicQR
  } catch (e) {
    errorMsg.value = "No se encontró información sobre este QR"
  } finally {
    loading.value = false
  }
}

// ========================
// LEGACY FLOW FUNCTIONS
// ========================

const clearImage = () => {
  if (imagePreviewUrl.value) URL.revokeObjectURL(imagePreviewUrl.value)
  imagePreviewUrl.value = ''
  capturedImage.value = null
}

const handleImageGet = async (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return

  clearImage()
  imagePreviewUrl.value = URL.createObjectURL(file)

  try {
    processingImage.value = true
    const compressed = await imageCompression(file, { maxSizeMB: 0.14, maxWidthOrHeight: 900, useWebWorker: true })
    const reader = new FileReader()
    reader.readAsDataURL(compressed)
    reader.onloadend = () => {
      capturedImage.value = reader.result as string
      processingImage.value = false
    }
  } catch (err) {
    toast.error(`Error procesando la imagen: ${err}`)
    processingImage.value = false
  }
}

const getMetrics = async () => {
  const metrics: IQRScanMetrics = { country: "", city: "", region: "" };
  try {
    const res = await fetch('https://ipapi.co/json/')
    const d = await res.json()

    metrics.country = d.country_name || "";
    metrics.city = d.city || "";
    metrics.region = d.region || "";

    // Default to minimal metrics (epsilon plan fallback)
    return metrics;
  } catch {
    return metrics;
  }
}

const selectPreset = (preset: string) => {
  legacyMessage.value = preset
}

const handleSubmitMessageLegacy = async () => {
  if (!selectedReason.value) {
    toast.error('Selecciona un motivo del mensaje.')
    return
  }
  legacySending.value = true
  try {
    const metricData = await getMetrics()
    const batch = writeBatch(db)
    const QRDoc = doc(db, 'publicQR', qrId)
    const logDoc = doc(collection(db, 'publicQR', qrId, 'logs'), Date.now().toString())

    batch.update(QRDoc, { totalScans: increment(1), lastScan: Timestamp.now() })
    batch.set(logDoc, {
      scanDate: Timestamp.now(),
      scanMetrics: metricData,
      interaction: { reason: selectedReason.value, message: legacyMessage.value, type: 'contact_request' },
      img: capturedImage.value
    })

    await batch.commit()
    legacySuccess.value = true
    if (qrData.value) qrData.value.totalScans = (qrData.value.totalScans || 0) + 1
    toast.success('Mensaje registrado exitosamente. El propietario será notificado.')
  } catch (e) {
    toast.error("Error al enviar el mensaje. Intenta de nuevo.")
  } finally {
    legacySending.value = false
  }
}

const updateReasons = () => {
  if (showContactForm.value) return;
  showContactForm.value = true;
  reasons.value = [
    {
      id: 'emergency',
      label: 'Emergencia',
      icon: 'emergency',
      presets: [
        `¡Atención! He localizado tu "${QRName.value.trim()}" y requiere atención inmediata.`,
        `Situación urgente: tu "${QRName.value.trim()}" se encuentra en un estado que necesita tu intervención.`,
        `Necesito comunicarme contigo de inmediato. Tu "${QRName.value.trim()}" podría estar en riesgo. Por favor responde.`
      ]
    },
    {
      id: 'communication',
      label: 'Comunicación',
      icon: 'chat',
      presets: [
        `Hola, he encontrado tu "${QRName.value.trim()}" y está a salvo. ¿Cómo podemos coordinar su devolución?`,
        `Tu "${QRName.value.trim()}" está en mis manos y en buen estado. Escríbeme o llámame para ponernos de acuerdo.`,
        `Me gustaría devolverle su "${QRName.value.trim()}" .`
      ]
    },
    {
      id: 'informative',
      label: 'Informativo',
      icon: 'info',
      presets: [
        `Solo paso a avisar que tu "${QRName.value.trim()}" está visible y aparentemente en buen estado.`,
        `Escaneo de verificación: todo parece estar en orden con este registro.`,
        `Qué buena idea proteger tus bienes así. ¡Un saludo desde donde me encuentro!`
      ]
    },
    {
      id: 'other',
      label: 'Personalizado',
      icon: 'edit_note',
      presets: []
    }
  ]
}

onMounted(() => {
  loadQRData()
})

onUnmounted(() => {
  clearImage()
})
</script>

<template>
  <HomeLayout>
    <template #main>
      <main class="relative min-h-screen bg-[#09090b] overflow-x-hidden font-google-sans text-white">

        <!-- 🎨 BACKGROUND ORNAMENTATION (Blueprint Style) -->
        <div class="fixed inset-0 z-0 pointer-events-none">
          <!-- Circular shapes -->
          <div
            class="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] border border-white/5 rounded-full pointer-events-none">
          </div>
          <div
            class="absolute top-[20%] left-[-5%] w-[300px] h-[300px] border border-orange-500/5 rounded-full pointer-events-none">
          </div>
          <div
            class="absolute bottom-[-10%] right-[5%] w-[500px] h-[500px] border border-white/5 rounded-full pointer-events-none">
          </div>

          <!-- Grid Pattern -->
          <div class="absolute inset-0 z-0 opacity-[0.22]"
            style="background-image: linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px); background-size: 100px 100px;">
          </div>

          <!-- Decorative Icons -->
          <div class="absolute inset-0 opacity-[0.05] select-none">
            <span
              class="material-symbols-outlined absolute top-[15%] left-[5%] text-8xl animate-float-slow">qr_code_2</span>
            <span
              class="material-symbols-outlined absolute top-[40%] right-[8%] text-9xl animate-float-medium text-orange-500">security</span>
            <span
              class="material-symbols-outlined absolute bottom-[20%] left-[10%] text-7xl animate-float-fast">notifications_active</span>
            <span
              class="material-symbols-outlined absolute top-[10%] right-[15%] text-[12rem] animate-float-slow opacity-20">fingerprint</span>
            <span
              class="material-symbols-outlined absolute bottom-[10%] right-[12%] text-8xl animate-float-slow text-orange-500">verified_user</span>
          </div>
        </div>

        <div
          class="relative z-10 flex flex-col items-center pt-24 md:pt-28 pb-10 md:pb-20 px-4 md:px-6 max-w-2xl mx-auto w-full">

          <CloudLoader v-if="loading" />

          <!-- ❌ ERROR STATE -->
          <div v-else-if="errorMsg"
            class="w-full text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div
              class="w-24 h-24 bg-red-500/10 border border-red-500/20 rounded-[2rem] flex items-center justify-center mx-auto">
              <span class="material-symbols-outlined text-red-500 text-5xl">error</span>
            </div>
            <div class="space-y-2">
              <h1 class="text-3xl font-black italic uppercase tracking-tighter">QR Inexistente</h1>
              <p class="text-white/40 text-sm max-w-xs mx-auto">{{ errorMsg }}</p>
            </div>
            <button @click="$router.push('/')"
              class="px-10 py-4 bg-white/5 border border-white/10 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-white/10 transition-all">Volver
              al Inicio</button>
          </div>

          <!-- 🚀 MAIN CONTENT -->
          <div v-else class="w-full space-y-0 md:space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">

            <!-- 🆔 SECURITY DOSSIER CARD -->
            <div
              class="hidden md:block w-full bg-white/5 border border-white/10 rounded-[2.5rem] p-8 space-y-6 relative overflow-hidden group shadow-2xl">
              <div
                class="absolute inset-0 bg-gradient-to-b from-transparent via-white/[0.02] to-transparent h-2 w-full animate-scanline opacity-20 pointer-events-none">
              </div>
              <div class="flex justify-between items-center border-b border-white/10 pb-4">
                <div class="flex items-center gap-2">
                  <div class="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                  <span class="text-[10px] font-black uppercase tracking-[0.3em] text-white/50">Reporte de
                    Seguridad</span>
                </div>
                <span class="text-[9px] font-mono text-orange-500/60 tracking-widest">v4.0.2 // UBIQUEME</span>
              </div>
              <div class="flex flex-col md:flex-row items-center gap-4 md:gap-8 py-2 md:py-4">
                <div class="relative flex-shrink-0">
                  <div
                    class="w-32 h-32 bg-orange-500 rounded-[2rem] flex items-center justify-center border-4 border-[#09090b] shadow-[0_20px_50px_rgba(249,115,22,0.3)] group-hover:scale-105 transition-transform">
                    <span class="material-symbols-outlined text-[#09090b] text-6xl font-black">qr_code_2</span>
                  </div>
                  <div
                    class="absolute -bottom-2 -right-2 bg-green-500 text-[#09090b] px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1 border-2 border-[#09090b] shadow-lg">
                    <span class="material-symbols-outlined text-[10px] font-black">check</span> Activo
                  </div>
                </div>
                <div class="flex-grow grid grid-cols-2 gap-x-8 gap-y-4 w-full text-center md:text-left">
                  <div class="col-span-2 space-y-1">
                    <label class="text-[9px] font-black text-white/30 uppercase tracking-widest">Identificación del
                      Objeto</label>
                    <h2 class="text-3xl font-black tracking-tighter text-[#dce7ff] uppercase italic">{{ QRName }}</h2>
                  </div>
                  <div class="space-y-1">
                    <label class="text-[9px] font-black text-white/30 uppercase tracking-widest">Serial ID</label>
                    <p class="font-mono text-orange-500 text-sm tracking-widest">{{ qrId.substring(0, 10).toUpperCase()
                    }}</p>
                  </div>
                  <div class="space-y-1">
                    <label class="text-[9px] font-black text-white/30 uppercase tracking-widest">Historial</label>
                    <p class="text-white font-black text-sm uppercase italic tracking-tight">{{ qrData?.totalScans || 0
                    }} Escaneos totales</p>
                  </div>
                  <div class="col-span-2 pt-4 border-t border-white/5 flex items-center gap-4">
                    <div class="flex-1 h-[1px] bg-white/5"></div>
                    <span class="text-[8px] font-black text-white/20 uppercase tracking-[0.5em]">Protocolo de Privacidad
                      Cifrado</span>
                    <div class="flex-1 h-[1px] bg-white/5"></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 📝 INTERACTION CARD-->
            <div
              class="bg-transparent md:bg-white/5 border-0 md:border border-white/10 rounded-[2rem] md:rounded-[3rem] p-0 md:p-2 overflow-visible md:overflow-hidden shadow-none md:shadow-2xl relative w-full mt-4 md:mt-0">
              <div
                class="bg-[#09090b] md:bg-[#09090b] rounded-[2rem] md:rounded-[2.8rem] border md:border-none border-white/10  md:p-3 space-y-6 md:space-y-10 relative z-10 w-full shadow-2xl md:shadow-none whatsapp-preview">
                <div class="wa-header">
                  <div class="wa-avatar">
                    {{ QRName?.charAt(0)?.toUpperCase() || 'U' }}
                  </div>

                  <div class="flex flex-col">
                    <span class="wa-name">{{ QRName }}</span>
                    <span class="wa-status">
                      Notificación de Ubiqueme
                    </span>
                  </div>
                </div>

                <Transition name="fade-slide" mode="out-in">

                  <!-- MESSAGE FORM -->
                  <div v-if="!hasSent" class="wa-chat-area">

                    <!-- Message Bubble Preview -->
                    <div class="wa-bubble-row">
                      <div class="wa-bubble">
                        <p class="wa-bubble-text">{{ customMessage }}</p>
                        <div class="wa-bubble-meta">
                          <span class="wa-bubble-time">12:34</span>
                          <svg class="wa-double-check" viewBox="0 0 16 11" width="16" height="11">
                            <path
                              d="M11.071.653a.457.457 0 0 0-.304-.102.493.493 0 0 0-.381.178l-6.19 7.636-2.011-2.095a.463.463 0 0 0-.336-.153.457.457 0 0 0-.337.128.49.49 0 0 0-.137.34.537.537 0 0 0 .149.354l2.358 2.457a.472.472 0 0 0 .348.166.47.47 0 0 0 .33-.148l6.55-8.083a.516.516 0 0 0 .128-.344.485.485 0 0 0-.148-.334"
                              fill="#53bdeb" />
                            <path
                              d="M14.618.653a.457.457 0 0 0-.304-.102.493.493 0 0 0-.381.178l-6.19 7.636-1.004-1.046a.277.277 0 0 0-.1.195.33.33 0 0 0 .049.185l.923 1.074a.472.472 0 0 0 .348.166.47.47 0 0 0 .33-.148l6.55-8.083a.516.516 0 0 0 .128-.344.485.485 0 0 0-.148-.334"
                              fill="#53bdeb" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    <!-- WhatsApp-style Input Bar -->
                    <div class="wa-input-bar-wrapper">
                      <div class="wa-input-bar"
                        :class="{ 'wa-input-bar--empty': !userReason.trim() && !isSending && !hasSent }">
                        <textarea v-model="userReason" :disabled="isSending" class="wa-input"
                          placeholder="Escriba el motivo del contacto..." rows="2"></textarea>
                        <a :href="`https://wa.me/${whatsappNumber}?text=ID:%20${qrId}%0A%0AQR:%20${encodeURIComponent(QRName)}%0AHora:%20${encodeURIComponent(scanTime)}%0A%0A${encodeURIComponent(customMessage)}`"
                          target="_blank">
                          <button :disabled="isSending || !userReason.trim()" class="wa-send-btn">
                            <svg viewBox="0 0 24 24" width="20" height="20">
                              <path
                                d="M1.101 21.757 23.8 12.028 1.101 2.3l.011 7.912 13.623 1.816-13.623 1.817-.011 7.912z"
                                fill="currentColor" />
                            </svg>
                          </button>
                        </a>
                      </div>
                    </div>
                  </div>

                  <!-- SUCCESS STATE -->
                  <div v-else class="wa-success">
                    <div class="wa-success-icon">
                      <svg viewBox="0 0 24 24" width="48" height="48" fill="#25D366">
                        <path
                          d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                      </svg>
                    </div>
                    <div class="wa-success-text">
                      <h3>Mensaje Enviado</h3>
                      <p>El propietario ha sido notificado exitosamente.</p>
                    </div>
                    <button @click="$router.push('/')" class="wa-success-btn">Volver al Inicio</button>
                  </div>

                </Transition>
              </div>

              <!-- External Send Button -->
              <div class="wa-external-send-wrapper">
                <a v-if="userReason.trim()"
                  :href="`https://wa.me/${whatsappNumber}?text=ID:%20${qrId}%0A%0AQR:%20${encodeURIComponent(QRName)}%0AHora:%20${encodeURIComponent(scanTime)}%0A%0A${encodeURIComponent(customMessage)}`"
                  target="_blank" class="wa-external-send-btn">
                  <svg class="wa-external-wa-icon" fill="currentColor" viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  <span class="wa-external-send-text">Enviar mensaje</span>
                  <span class="material-symbols-outlined wa-external-send-arrow">arrow_forward</span>
                </a>
                <button v-else disabled class="wa-external-send-btn wa-external-send-btn--disabled">
                  <svg class="wa-external-wa-icon" fill="currentColor" viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  <span class="wa-external-send-text">Escriba el motivo para poder enviar el mensaje</span>
                </button>
              </div>

            </div>


            <!-- 📸 LEGACY INTERACTION PANEL (Reasons + Image) -->
            <div
              class="bg-transparent md:bg-white/5 border-0 md:border border-white/10 rounded-[2rem] md:rounded-[3rem] p-0 md:p-2 overflow-visible md:overflow-hidden shadow-none md:shadow-2xl relative w-full mt-2">
              <div
                class="bg-[#09090b] md:bg-[#09090b] rounded-[2rem] md:rounded-[2.8rem] border md:border-none border-white/10 p-2! md:p-10 space-y-6 md:space-y-8 relative z-10 w-full shadow-2xl md:shadow-none">

                <Transition name="fade-slide" mode="out-in">

                  <!-- 1. INITIAL STATE -->
                  <div v-if="!showContactForm && !legacySuccess" class="py-8 text-center space-y-8">
                    <div class="space-y-2">
                      <div
                        class="inline-flex items-center gap-1.5 bg-orange-500/10 text-orange-500 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-orange-500/20 mb-4">
                        <span class="material-symbols-outlined text-[12px]">add_a_photo</span>
                        Reporte Digital
                      </div>
                      <h3 class="text-2xl font-black text-white tracking-tight">¿Deseas dejar un reporte al dueño?</h3>
                      <p class="text-white/40 text-sm max-w-xs mx-auto">Selecciona el motivo y adjunta una foto para que
                        el propietario sepa qué sucede con su pertenencia.</p>
                    </div>

                    <button @click="updateReasons"
                      class="group relative w-full max-w-xs h-16 rounded-2xl bg-white text-black font-black text-lg overflow-hidden mx-auto transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer">
                      <div class="relative z-10 flex items-center justify-center gap-3">
                        <span>Contactar Propietario</span>
                        <span
                          class="material-symbols-outlined font-black transition-transform group-hover:translate-x-1">arrow_forward</span>
                      </div>
                    </button>
                  </div>

                  <!-- 2. MESSAGING FLOW -->
                  <div v-else-if="showContactForm && !legacySuccess && !loading && qrData?.name" class="space-y-8">
                    <!-- REASON SELECTION -->
                    <div class="space-y-4">
                      <label class="text-[10px] font-black text-white/50 uppercase tracking-[0.3em] ml-2">Motivo del
                        Mensaje</label>
                      <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <button v-for="reason in reasons" :key="reason.id" @click="selectedReason = reason.id" :class="[
                          'h-14 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-all flex flex-col items-center justify-center gap-1.5 px-2 relative overflow-hidden cursor-pointer',
                          selectedReason === reason.id
                            ? 'bg-orange-500 border-orange-500 text-black'
                            : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10'
                        ]">
                          <span class="material-symbols-outlined text-lg">{{ reason.icon }}</span>
                          {{ reason.label }}
                        </button>
                      </div>
                    </div>

                    <!-- PRESET MESSAGES -->
                    <Transition name="fade-slide">
                      <div v-if="selectedReason && reasons.find((r: any) => r.id === selectedReason)?.presets.length"
                        class="space-y-4">
                        <label class="text-[10px] font-black text-white/50 uppercase tracking-[0.3em] ml-2">Sugerencias
                          Rápidas</label>
                        <div class="flex flex-col gap-2">
                          <button v-for="(preset, index) in reasons.find((r: any) => r.id === selectedReason)?.presets"
                            :key="index" @click="selectPreset(preset)" :class="[
                              'px-4 py-3 rounded-xl border text-[11px] font-bold text-left transition-all cursor-pointer',
                              selectedReason === 'emergency'
                                ? 'bg-red-500/5 border-red-500/20 text-red-100 hover:bg-red-500/10 hover:border-red-500/40'
                                : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:border-white/30'
                            ]">
                            {{ preset }}
                          </button>
                        </div>
                      </div>
                    </Transition>

                    <!-- MANUAL MESSAGE TEXTAREA -->
                    <div class="space-y-4">
                      <label class="text-[10px] font-black text-white/50 uppercase tracking-[0.3em] ml-2">Mensaje
                        Personalizado</label>
                      <textarea v-model="legacyMessage"
                        placeholder="Si el motivo es 'Personalizado', especifica aquí los detalles del mensaje..."
                        class="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-white text-sm focus:outline-none focus:border-orange-500/50 transition-all min-h-[140px] resize-none shadow-inner"></textarea>
                    </div>

                    <!-- 📸 IMAGE CAPTURE AREA -->
                    <div class="space-y-4 relative">
                      <div class="flex items-center justify-between ml-2">
                        <label class="text-[10px] font-black text-white/50 uppercase tracking-[0.3em]">
                          Evidencia Fotográfica (Opcional)
                        </label>
                        <Transition name="fade-slide">
                          <button v-if="imagePreviewUrl" @click="clearImage"
                            class="text-red-500 text-[10px] font-black uppercase tracking-[0.2em] bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg px-3 py-1 transition-all flex items-center gap-1.5 active:scale-95 leading-none cursor-pointer">
                            Eliminar
                            <span class="material-symbols-outlined text-sm!">close</span>
                          </button>
                        </Transition>
                      </div>

                      <div class="relative group/upload min-h-[160px] cursor-pointer group">
                        <input type="file" accept="image/*" @change="handleImageGet" capture="environment"
                          class="absolute inset-0 opacity-0 cursor-pointer z-20" />

                        <!-- PREVIEW STATE -->
                        <div v-if="imagePreviewUrl"
                          class="relative w-full aspect-video rounded-3xl overflow-hidden border-2 border-orange-500/20 group-hover:border-orange-500/40 transition-all duration-500">
                          <img :src="imagePreviewUrl" alt="Preview" class="w-full h-full object-cover" />
                          <div
                            class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6">
                            <div class="flex items-center gap-2">
                              <div class="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></div>
                              <p class="text-[10px] font-black text-white uppercase tracking-[0.2em]">Captura Lista
                              </p>
                            </div>
                            <p class="text-[9px] font-medium text-white/40 uppercase tracking-widest mt-1">Toque para
                              reemplazar la fotografía</p>
                          </div>
                        </div>

                        <!-- UPLOAD PROMPT -->
                        <div v-else
                          class="w-full h-40 border-2 border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center gap-4 group-hover/upload:border-orange-500/30 group-hover/upload:bg-white/2 transition-all duration-300">
                          <div
                            class="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center group-hover/upload:bg-orange-500/10 group-hover/upload:scale-110 transition-all duration-500">
                            <span
                              class="material-symbols-outlined text-white/20 text-3xl group-hover/upload:text-orange-500 transition-colors">add_a_photo</span>
                          </div>
                          <div class="text-center space-y-1">
                            <span
                              class="block text-[11px] font-black text-white/40 uppercase tracking-[0.2em] group-hover/upload:text-white/60 transition-colors">Tocar
                              para capturar</span>
                            <span class="block text-[8px] font-bold text-white/10 uppercase tracking-tight">Formatos:
                              JPG, PNG • Max 5MB</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- ACTIONS FOOTER -->
                    <div class="flex flex-col md:flex-row gap-4 pt-4">
                      <button @click="showContactForm = false"
                        class="flex-1 h-14 rounded-2xl border border-white/10 text-white/40 font-black text-xs uppercase tracking-widest hover:bg-white/5 transition-colors order-2 md:order-1 cursor-pointer">
                        Cancelar
                      </button>
                      <button @click="handleSubmitMessageLegacy"
                        :disabled="!selectedReason || legacySending || processingImage"
                        class="flex-[2] h-14 rounded-2xl bg-orange-500 text-black font-black text-xs uppercase tracking-widest disabled:opacity-30 disabled:grayscale transition-all flex items-center justify-center gap-3 order-1 md:order-2 cursor-pointer">
                        <span v-if="legacySending || processingImage"
                          class="w-5 h-5 border-3 border-black/20 border-t-black rounded-full animate-spin"></span>
                        <span v-else>Enviar Mensaje Directo</span>
                        <span v-if="!legacySending && !processingImage"
                          class="material-symbols-outlined text-lg">send</span>
                      </button>
                    </div>
                  </div>

                  <!-- 3. SUCCESS STATE -->
                  <div v-else-if="legacySuccess" class="py-12 text-center space-y-6">
                    <div class="relative inline-flex mx-auto">
                      <div
                        class="relative w-20 h-20 bg-green-500 rounded-full flex items-center justify-center border border-green-400">
                        <span class="material-symbols-outlined text-black text-4xl font-black">check_circle</span>
                      </div>
                    </div>
                    <div class="space-y-2">
                      <h3 class="text-3xl font-black text-white tracking-tight italic uppercase">Mensaje Enviado</h3>
                      <p class="text-white/50 text-sm max-w-xs mx-auto font-medium">El propietario ha recibido tu
                        notificación de forma segura. Gracias por tu responsabilidad.</p>
                    </div>
                    <button @click="$router.push('/')"
                      class="px-8 py-3 rounded-xl bg-white/5 border border-white/10 text-white/40 font-black text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all cursor-pointer">
                      Finalizar Sesión
                    </button>
                  </div>

                </Transition>
              </div>
            </div>

            <!-- PRIVACY INFO CARD -->
            <div class="relative overflow-hidden bg-white/5 border border-white/10 rounded-[2.5rem] p-8 group">
              <div class="flex items-start gap-6">
                <div
                  class="w-14 h-14 rounded-2xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center shrink-0">
                  <span class="material-symbols-outlined text-orange-500 text-2xl">security</span>
                </div>
                <div class="space-y-2 pt-1">
                  <h4 class="text-white font-black text-lg">Privacidad de Identidad</h4>
                  <p class="text-white/50 text-xs leading-relaxed font-medium">
                    Utilizamos protocolos de comunicación seguros. Tus datos personales nunca serán compartidos sin tu
                    autorización.
                  </p>
                </div>
              </div>
            </div>

            <!-- Footer Trust Info -->
            <div class="text-center space-y-6">
              <div class="flex items-center justify-center gap-8 text-white/10">
                <span class="material-symbols-outlined text-2xl">verified_user</span>
                <span class="material-symbols-outlined text-2xl">lock</span>
                <span class="material-symbols-outlined text-2xl">shield_with_heart</span>
              </div>
              <p class="text-[9px] text-white/20 font-black uppercase tracking-[0.6em]">Secure Protocol Ubiqueme</p>
            </div>

          </div>

        </div>
      </main>
    </template>
  </HomeLayout>
</template>

<style scoped>
.font-google-sans {
  font-family: 'Google Sans', sans-serif;
}

.material-symbols-outlined {
  font-variation-settings: 'FILL' 1, 'wght' 600, 'GRAD' 0, 'opsz' 24;
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(30px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-30px);
}

@keyframes float {

  0%,
  100% {
    transform: translateY(0) rotate(0deg);
  }

  50% {
    transform: translateY(-20px) rotate(5deg);
  }
}

.animate-float-slow {
  animation: float 8s ease-in-out infinite;
}

.animate-float-medium {
  animation: float 6s ease-in-out infinite;
  animation-delay: 1s;
}

.animate-float-fast {
  animation: float 4s ease-in-out infinite;
  animation-delay: 0.5s;
}

@keyframes scanline {
  0% {
    top: -100%;
  }

  100% {
    top: 100%;
  }
}

.animate-scanline {
  animation: scanline 4s linear infinite;
}

/* WhatsApp-style wallpaper */
.whatsapp-preview {
  position: relative;
  background: #0b141a;
  border-radius: 2rem;
  overflow: hidden;
}

.whatsapp-preview::before {
  content: "";
  position: absolute;
  inset: 0;
  background-image:
    radial-gradient(circle at 20% 30%, rgba(255, 255, 255, .04) 2px, transparent 2px),
    radial-gradient(circle at 70% 60%, rgba(255, 255, 255, .03) 2px, transparent 2px),
    radial-gradient(circle at 40% 80%, rgba(255, 255, 255, .02) 3px, transparent 3px),
    radial-gradient(circle at 85% 15%, rgba(255, 255, 255, .03) 1px, transparent 1px);
  background-size: 80px 80px, 60px 60px, 100px 100px, 50px 50px;
  background-position: 0 0, 30px 20px, 10px 50px, 60px 10px;
  opacity: 0.4;
  pointer-events: none;
  z-index: 0;
}

/* WhatsApp Header */
.wa-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  background: #202c33;
  min-height: 64px;
  border-radius: 12px 12px 0 0;
  position: relative;
  z-index: 1;
}

.wa-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #25d366;
  color: #0b141a;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 800;
  flex-shrink: 0;
  text-transform: uppercase;
}

.wa-name {
  font-size: 15px;
  font-weight: 600;
  color: #e9edef;
  line-height: 1.2;
}

.wa-status {
  font-size: 12px;
  color: #8696a0;
  line-height: 1.2;
}

/* Chat Area */
.wa-chat-area {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 8px 16px;
  position: relative;
  z-index: 1;
}

/* Message Bubble */
.wa-bubble-row {
  display: flex;
  justify-content: flex-end;
  width: 100%;
}

.wa-bubble {
  max-width: 85%;
  background: #005c4b;
  border-radius: 8px 0 8px 8px;
  padding: 8px 10px 6px;
  position: relative;
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.15);
}

.wa-bubble-text {
  font-size: 14px;
  line-height: 1.4;
  color: #e9edef;
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
}

.wa-bubble-meta {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
  margin-top: 4px;
}

.wa-bubble-time {
  font-size: 11px;
  color: rgba(233, 237, 239, 0.6);
}

.wa-double-check {
  flex-shrink: 0;
  display: block;
}

/* External Send Button */
.wa-external-send-wrapper {
  display: flex;
  width: 100%;
  margin-top: 16px;
  position: relative;
  z-index: 1;
}

.wa-external-send-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  height: 52px;
  background: #25d366;
  color: #0b141a;
  font-size: 14px;
  font-weight: 700;
  border-radius: 26px;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 20px rgba(37, 211, 102, 0.25);
  font-family: inherit;
  padding: 0 24px;
}

.wa-external-send-btn:not(.wa-external-send-btn--disabled):hover {
  background: #20bd5a;
  transform: scale(1.02);
  box-shadow: 0 6px 28px rgba(37, 211, 102, 0.35);
}

.wa-external-send-btn:not(.wa-external-send-btn--disabled):active {
  transform: scale(0.98);
}

.wa-external-send-btn--disabled {
  background: #374045;
  color: #8696a0;
  cursor: not-allowed;
  box-shadow: none;
  pointer-events: none;
}

.wa-external-wa-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.wa-external-send-text {
  flex: 1;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.wa-external-send-arrow {
  font-size: 20px;
  flex-shrink: 0;
  font-variation-settings: 'FILL' 1, 'wght' 600, 'GRAD' 0, 'opsz' 24;
}

/* Input Bar */
.wa-input-bar-wrapper {
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 100%;
}

.wa-input-hint {
  padding: 0 4px;
}

.wa-input-prefix {
  color: #8696a0;
  font-size: 12px;
  line-height: 1.3;
  user-select: none;
}

.wa-input-bar {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  background: #202c33;
  border-radius: 8px;
  padding: 6px 8px;
  position: relative;
  z-index: 1;
}

.wa-input-bar--empty {
  animation: wa-pulse-border 2s ease-in-out infinite;
}

@keyframes wa-pulse-border {

  0%,
  100% {
    box-shadow: inset 0 0 0 1px rgba(37, 211, 102, 0);
  }

  50% {
    box-shadow: inset 0 0 0 1.5px rgba(37, 211, 102, 0.5);
  }
}

.wa-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: #e9edef;
  font-size: 14px;
  line-height: 1.4;
  padding: 6px 4px;
  resize: none;
  font-family: inherit;
  min-height: 50px;
  max-height: 120px;
}

.wa-input::placeholder {
  color: #8696a0;
}

.wa-send-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: transparent;
  color: #8696a0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;
  flex-shrink: 0;
}

.wa-send-btn:not(:disabled):hover {
  color: #e9edef;
}

.wa-send-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* Success State */
.wa-success {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 48px 24px;
  position: relative;
  z-index: 1;
}

.wa-success-icon {
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.wa-success-text {
  text-align: center;
}

.wa-success-text h3 {
  font-size: 20px;
  font-weight: 700;
  color: #e9edef;
  margin: 0 0 4px;
}

.wa-success-text p {
  font-size: 14px;
  color: #8696a0;
  margin: 0;
}

.wa-success-btn {
  padding: 10px 32px;
  background: transparent;
  border: 1px solid rgba(233, 237, 239, 0.2);
  border-radius: 24px;
  color: #e9edef;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.wa-success-btn:hover {
  background: rgba(233, 237, 239, 0.08);
  border-color: rgba(233, 237, 239, 0.3);
}
</style>
