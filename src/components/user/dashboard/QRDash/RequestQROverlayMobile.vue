<script lang="ts" setup>
import { ref, computed, reactive } from 'vue'
import { doc, writeBatch, increment, Timestamp } from 'firebase/firestore'
import { db } from '@/firebase'
import { useUserStore } from '@/stores/user'
import { toast } from 'vue-sonner'
import type { ISubscription } from '@/interfaces/ISubscription'
import type { IMyQR } from '@/interfaces/IMyQR'

const props = defineProps<{
  subscription: ISubscription | null
  qrs: IMyQR[]
  visible: boolean
}>()

const emit = defineEmits<{
  close: []
  confirm: []
}>()

const userStore = useUserStore()

const selectedQRIds = ref<Set<string>>(new Set())
const isSubmitting = ref(false)

const city = ref('')
const postalCode = ref('')
const phone = ref('')
const shippingNotes = ref('')

interface QRCustomization {
  layout: 'compact' | 'detail'
  size: string
  gluePosition: 'frontal' | 'trasero'
}

const defaultCustomization = (): QRCustomization => ({
  layout: 'compact',
  size: 'SM (5cm)',
  gluePosition: 'trasero',
})

const qrCustomizations = reactive<Record<string, QRCustomization>>({})

const getQrCust = (qrId: string): QRCustomization => {
  if (!qrCustomizations[qrId]) {
    qrCustomizations[qrId] = defaultCustomization()
  }
  return qrCustomizations[qrId]
}

const setLayout = (qrId: string, layout: 'compact' | 'detail') => { getQrCust(qrId).layout = layout }
const setSize = (qrId: string, size: string) => { getQrCust(qrId).size = size }
const setGluePosition = (qrId: string, gluePosition: 'frontal' | 'trasero') => { getQrCust(qrId).gluePosition = gluePosition }

const expandedQR = ref<string | null>(null)

const toggleExpanded = (qrId: string, qrStatus?: string) => {
  if (qrStatus && qrStatus !== 'Active') return
  expandedQR.value = expandedQR.value === qrId ? null : qrId
  if (!selectedQRIds.value.has(qrId)) {
    const newSet = new Set(selectedQRIds.value)
    newSet.add(qrId)
    selectedQRIds.value = newSet
  }
}

const sizeOptions = ['XS (3cm)', 'SM (5cm)', 'MD (10cm)', 'LG (15cm)']

const shipmentCost = computed(() => {
  if (!props.subscription) return 0
  if (props.subscription.freeShipmentsUsed < props.subscription.freeShipmentsAllowed) return 0
  return 199
})

const hasFreeShipment = computed(() => shipmentCost.value === 0)

const toggleQRSelection = (qrId: string, qrStatus?: string) => {
  if (qrStatus && qrStatus !== 'Active') return
  const newSet = new Set(selectedQRIds.value)
  if (newSet.has(qrId)) newSet.delete(qrId)
  else newSet.add(qrId)
  selectedQRIds.value = newSet
}

const isSelected = (qrId: string) => selectedQRIds.value.has(qrId)

const selectAll = () => {
  selectedQRIds.value = new Set(props.qrs.filter(qr => qr.status === 'Active').map(qr => qr.id))
}

const deselectAll = () => { selectedQRIds.value = new Set() }

const freeShipmentLabel = computed(() => hasFreeShipment.value ? 'Aún tiene un envío gratuito disponible' : 'Ya usó su envío gratuito')

const handleConfirm = async () => {
  if (!props.subscription) { toast.error('No se encontró la suscripción.'); return }
  if (selectedQRIds.value.size === 0) { toast.error('Seleccione al menos un QR.'); return }
  if (!city.value.trim()) { toast.error('Ingrese la ciudad de entrega.'); return }
  if (!postalCode.value.trim() || postalCode.value.length < 5) { toast.error('Código postal válido requerido.'); return }
  if (!phone.value.trim() || phone.value.length < 10) { toast.error('Teléfono de contacto válido requerido.'); return }

  isSubmitting.value = true
  try {
    const batch = writeBatch(db)
    const userId = userStore.getUserId
    for (const qrId of selectedQRIds.value) {
      const userQrRef = doc(db, `users/${userId}/qrs/${qrId}`)
      const publicQrRef = doc(db, `publicQR/${qrId}`)
      const now = Timestamp.now()
      const cust = getQrCust(qrId)
      batch.update(userQrRef, { physicalShipped: true, physicalShippedAt: now, freeShipmentUsed: hasFreeShipment.value, shippingNotes: '', qrLayout: cust.layout, qrSize: cust.size, gluePosition: cust.gluePosition })
      batch.update(publicQrRef, { physicalShipped: true, physicalShippedAt: now, freeShipmentUsed: hasFreeShipment.value, qrLayout: cust.layout, qrSize: cust.size, gluePosition: cust.gluePosition })
    }
    const subRef = doc(db, `users/${userId}/subscriptions/${props.subscription.id}`)
    batch.update(subRef, { freeShipmentsUsed: increment(1) })
    const orderRef = doc(db, `users/${userId}/shipments/${Timestamp.now().toMillis()}`)
    batch.set(orderRef, { subscriptionId: props.subscription.id, qrIds: Array.from(selectedQRIds.value), city: city.value.trim(), postalCode: postalCode.value.trim(), phone: phone.value.trim(), shippingNotes: shippingNotes.value.trim(), cost: hasFreeShipment.value ? 0 : 199, freeShipmentUsed: hasFreeShipment.value, createdAt: Timestamp.now() })
    await batch.commit()

    const soporteUrl = import.meta.env.VITE_SOPORTE_WORKER_URL
    if (soporteUrl) {
      const selectedQrs = props.qrs.filter(qr => selectedQRIds.value.has(qr.id))
      const qrNames = selectedQrs.map(qr => { const c = getQrCust(qr.id); return `• ${qr.name} (#${qr.id}) — Formato: ${c.layout === 'compact' ? 'Compacto' : 'Detallado'}, Tamaño: ${c.size}, Pegamento: ${c.gluePosition}` })
      fetch(`${soporteUrl}/api/physical-request`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ firebaseUid: userId, email: userStore.getEmail, userName: userStore.getFullName, planType: props.subscription.planType, qrIds: Array.from(selectedQRIds.value).join(', '), cost: hasFreeShipment.value ? 'Gratis' : '$199 MXN', city: city.value.trim(), postalCode: postalCode.value.trim(), phone: phone.value.trim(), shippingNotes: shippingNotes.value.trim() || 'Ninguna', notes: [`Usuario ${userStore.getFullName} solicitó envío físico.`, '', `• ${hasFreeShipment.value ? 'Primer envío GRATIS' : 'Costo: $199 MXN'}`, `• Plan: ${props.subscription.planType}`, `• QRs: ${selectedQRIds.value.size}`, '', '📦 Detalle:', ...qrNames].join('\n') }) }).catch(() => { })
    }

    toast.success(hasFreeShipment.value ? 'Envío gratuito registrado.' : 'Solicitud registrada. $199 MXN.')
    emit('confirm')
  } catch (error) { toast.error(`Error: ${(error as Error).message}`) }
  finally { isSubmitting.value = false }
}

const handleClose = () => {
  if (isSubmitting.value) return
  selectedQRIds.value = new Set()
  expandedQR.value = null
  emit('close')
}
</script>

<template>
  <!-- Full-screen M3 Bottom Sheet -->
  <Teleport to="body">
    <Transition enter-active-class="transition-all duration-300 ease-out" enter-from-class="opacity-0"
      leave-active-class="transition-all duration-200 ease-in" leave-to-class="opacity-0">
      <div v-if="visible" @click="handleClose" class="fixed inset-0 bg-black/60 z-40 cursor-default"></div>
    </Transition>
    <Transition enter-active-class="transition-all duration-300 ease-out" enter-from-class="opacity-0 translate-y-full"
      leave-active-class="transition-all duration-200 ease-in" leave-to-class="opacity-0 translate-y-full">
      <div v-if="visible" v-auto-height
        class="fixed bottom-0 left-0 right-0 z-50 bg-[#2B2930] rounded-t-2xl pb-[env(safe-area-inset-bottom,24px)] max-h-[92vh] overflow-y-auto shadow-[0_-8px_30px_rgba(0,0,0,0.5)] font-google-sans">

        <!-- Handle bar -->
        <div class="w-10 h-1 bg-[#CAC4D0]/20 rounded-full mx-auto my-3"></div>

        <div class="px-4 pb-4">
          <!-- Header -->
          <div class="flex items-center gap-3 mb-4">
            <div class="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center shrink-0">
              <span class="material-symbols-outlined notranslate text-orange-400 text-[20px]">local_shipping</span>
            </div>
            <div>
              <h2 class="text-[#E6E1E5] text-base font-bold">Pedir QR físico</h2>
              <p class="text-[#CAC4D0]/50 text-[10px] leading-tight">Personalice y solicite sus códigos QR</p>
            </div>
            <button @click="handleClose"
              class="ml-auto w-8 h-8 flex items-center justify-center rounded-lg text-[#CAC4D0]/60 hover:text-white hover:bg-white/10 transition-all cursor-pointer">
              <span class="material-symbols-outlined notranslate text-[18px]">close</span>
            </button>
          </div>

          <!-- Pricing Banner -->
          <div class="mb-4 p-3 rounded-xl border"
            :class="hasFreeShipment ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-amber-500/20 bg-amber-500/5'">
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                :class="hasFreeShipment ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'">
                <span class="material-symbols-outlined notranslate text-[18px]">{{ hasFreeShipment ? 'redeem' :
                  'payments' }}</span>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-xs font-bold" :class="hasFreeShipment ? 'text-emerald-400' : 'text-amber-400'">{{
                  hasFreeShipment ? 'Envío GRATIS incluido' : 'Costo: $199 MXN' }}</p>
                <p class="text-[10px] text-[#CAC4D0]/50 mt-0.5">{{ freeShipmentLabel }}</p>
              </div>
              <span class="text-sm font-black shrink-0"
                :class="hasFreeShipment ? 'text-emerald-400' : 'text-amber-400'">{{ hasFreeShipment ? 'GRATIS' : '$199'
                }}</span>
            </div>
          </div>

          <!-- Address Section (accordion style) -->
          <details class="mb-4 rounded-xl border border-[#49454F]/30 overflow-hidden" open>
            <summary class="flex items-center gap-2 p-3 bg-[#1C1B1F]/50 cursor-pointer list-none">
              <span class="material-symbols-outlined notranslate text-[#CAC4D0]/40 text-[16px]">location_on</span>
              <span class="text-[10px] font-bold uppercase tracking-[0.15em] text-[#CAC4D0]/60">Dirección de
                entrega</span>
              <span
                class="ml-auto material-symbols-outlined notranslate text-[#CAC4D0]/30 text-[16px]">expand_more</span>
            </summary>
            <div class="p-3 space-y-2.5 border-t border-[#49454F]/20">
              <div>
                <label class="text-[9px] font-bold uppercase tracking-wider text-[#CAC4D0]/40 ml-1 mb-1 block">Ciudad
                  *</label>
                <input v-model="city" type="text" placeholder="Ej. Ciudad de México"
                  class="w-full h-10 px-3 rounded-xl border border-[#49454F]/50 bg-[#1C1B1F] text-[#E6E1E5] text-sm placeholder:text-[#CAC4D0]/30 outline-none focus:border-orange-500/50 focus:bg-orange-500/5 transition-all" />
              </div>
              <div>
                <label class="text-[9px] font-bold uppercase tracking-wider text-[#CAC4D0]/40 ml-1 mb-1 block">Código
                  Postal *</label>
                <input v-model="postalCode" type="text" placeholder="Ej. 06600" maxlength="5"
                  class="w-full h-10 px-3 rounded-xl border border-[#49454F]/50 bg-[#1C1B1F] text-[#E6E1E5] text-sm placeholder:text-[#CAC4D0]/30 outline-none focus:border-orange-500/50 focus:bg-orange-500/5 transition-all" />
              </div>
              <div>
                <label class="text-[9px] font-bold uppercase tracking-wider text-[#CAC4D0]/40 ml-1 mb-1 block">Teléfono
                  *</label>
                <input v-model="phone" type="tel" placeholder="5512345678"
                  class="w-full h-10 px-3 rounded-xl border border-[#49454F]/50 bg-[#1C1B1F] text-[#E6E1E5] text-sm placeholder:text-[#CAC4D0]/30 outline-none focus:border-orange-500/50 focus:bg-orange-500/5 transition-all" />
              </div>
              <div>
                <label class="text-[9px] font-bold uppercase tracking-wider text-[#CAC4D0]/40 ml-1 mb-1 block">Notas
                  <span class="normal-case text-[#CAC4D0]/30">(opcional)</span></label>
                <textarea v-model="shippingNotes" rows="2" placeholder="Referencias, etc."
                  class="w-full px-3 py-2.5 rounded-xl border border-[#49454F]/50 bg-[#1C1B1F] text-[#E6E1E5] text-sm placeholder:text-[#CAC4D0]/30 outline-none focus:border-orange-500/50 focus:bg-orange-500/5 transition-all resize-none"></textarea>
              </div>
            </div>
          </details>

          <!-- QR Selection -->
          <details class="mb-4 rounded-xl border border-[#49454F]/30 overflow-hidden" open>
            <summary class="flex items-center gap-2 p-3 bg-[#1C1B1F]/50 cursor-pointer list-none">
              <span class="material-symbols-outlined notranslate text-[#CAC4D0]/40 text-[16px]">qr_code</span>
              <span class="text-[10px] font-bold uppercase tracking-[0.15em] text-[#CAC4D0]/60">QRs para enviar <span
                  class="text-[#CAC4D0]/30">({{ selectedQRIds.size }} sel.)</span></span>
              <span
                class="ml-auto material-symbols-outlined notranslate text-[#CAC4D0]/30 text-[16px]">expand_more</span>
            </summary>
            <div class="p-3 border-t border-[#49454F]/20">
              <!-- Quick select buttons -->
              <div class="flex gap-2 mb-3">
                <button @click="selectAll"
                  class="flex-1 py-1.5 rounded-lg border border-[#49454F]/30 text-[9px] font-bold uppercase tracking-wider text-[#CAC4D0]/60 hover:text-white hover:border-white/20 transition-all cursor-pointer">Todos</button>
                <button @click="deselectAll"
                  class="flex-1 py-1.5 rounded-lg border border-[#49454F]/30 text-[9px] font-bold uppercase tracking-wider text-[#CAC4D0]/60 hover:text-white hover:border-white/20 transition-all cursor-pointer">Limpiar</button>
              </div>

              <div class="space-y-2">
                <div v-for="qr in qrs" :key="qr.id"
                  class="rounded-xl border transition-all duration-200 overflow-hidden"
                  :class="[isSelected(qr.id) ? 'border-orange-500/30 bg-orange-500/5' : 'border-[#49454F]/30 bg-[#1C1B1F]/50']">
                  <div class="flex items-center gap-2.5 p-2.5 cursor-pointer"
                    :class="qr.status !== 'Active' ? 'opacity-50' : ''"
                    @click="qr.status === 'Active' && toggleExpanded(qr.id, qr.status)">
                    <div @click.stop="toggleQRSelection(qr.id, qr.status)"
                      class="w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all"
                      :class="[isSelected(qr.id) ? 'bg-orange-500 border-orange-500' : 'border-[#49454F]/50', qr.status !== 'Active' ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer']">
                      <span v-if="isSelected(qr.id)"
                        class="material-symbols-outlined notranslate text-black text-[14px]">check</span>
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-xs font-bold text-[#E6E1E5] truncate leading-tight">{{ qr.name }}</p>
                      <div class="flex items-center gap-2 mt-0.5">
                        <span class="text-[9px] text-[#CAC4D0]/40 font-mono">#{{ qr.id.slice(0, 6) }}..</span>
                        <span v-if="qr.status !== 'Active'"
                          class="px-1 py-0.5 rounded bg-red-500/10 text-red-400 text-[7px] font-bold uppercase">{{
                            qr.status }}</span>
                      </div>
                    </div>
                    <span
                      class="material-symbols-outlined notranslate text-[#CAC4D0]/30 text-[16px] transition-transform"
                      :class="expandedQR === qr.id ? 'rotate-180' : ''">expand_more</span>
                  </div>

                  <!-- Customization panel -->
                  <div v-if="expandedQR === qr.id" class="border-t border-[#49454F]/20 px-3 py-3 space-y-3">
                    <div class="space-y-1.5">
                      <label
                        class="text-[8px] font-black uppercase tracking-[0.15em] text-[#CAC4D0]/30 ml-1">Formato</label>
                      <div class="grid grid-cols-2 gap-2">
                        <button @click="setLayout(qr.id, 'compact')"
                          class="rounded-xl border p-2.5 text-left transition-all cursor-pointer"
                          :class="getQrCust(qr.id).layout === 'compact' ? 'border-orange-500/40 bg-orange-500/10' : 'border-[#49454F]/30 bg-[#1C1B1F]/80 hover:border-white/20'">
                          <p class="text-xs font-bold text-white">Compacto</p>
                          <p class="text-[8px] text-[#CAC4D0]/40 mt-0.5">Solo QR</p>
                        </button>
                        <button @click="setLayout(qr.id, 'detail')"
                          class="rounded-xl border p-2.5 text-left transition-all cursor-pointer"
                          :class="getQrCust(qr.id).layout === 'detail' ? 'border-orange-500/40 bg-orange-500/10' : 'border-[#49454F]/30 bg-[#1C1B1F]/80 hover:border-white/20'">
                          <p class="text-xs font-bold text-white">Detallado</p>
                          <p class="text-[8px] text-[#CAC4D0]/40 mt-0.5">Nombre + QR</p>
                        </button>
                      </div>
                    </div>
                    <div class="space-y-1.5">
                      <label
                        class="text-[8px] font-black uppercase tracking-[0.15em] text-[#CAC4D0]/30 ml-1">Tamaño</label>
                      <div class="grid grid-cols-4 gap-1.5">
                        <button v-for="size in sizeOptions" :key="size" @click="setSize(qr.id, size)"
                          class="h-8 rounded-lg border text-[8px] font-bold uppercase tracking-wider transition-all cursor-pointer"
                          :class="getQrCust(qr.id).size === size ? 'border-orange-500/40 bg-orange-500/10 text-orange-400' : 'border-[#49454F]/30 bg-[#1C1B1F]/80 text-[#CAC4D0]/50 hover:border-white/30'">{{
                            size }}</button>
                      </div>
                    </div>
                    <div class="space-y-1.5">
                      <label
                        class="text-[8px] font-black uppercase tracking-[0.15em] text-[#CAC4D0]/30 ml-1">Pegamento</label>
                      <div class="grid grid-cols-2 gap-2">
                        <button @click="setGluePosition(qr.id, 'frontal')"
                          class="rounded-xl border p-2.5 text-left transition-all cursor-pointer"
                          :class="getQrCust(qr.id).gluePosition === 'frontal' ? 'border-blue-500/40 bg-blue-500/10' : 'border-[#49454F]/30 bg-[#1C1B1F]/80 hover:border-white/20'">
                          <p class="text-xs font-bold text-white">Frontal</p>
                          <p class="text-[8px] text-[#CAC4D0]/40">Para cristales</p>
                        </button>
                        <button @click="setGluePosition(qr.id, 'trasero')"
                          class="rounded-xl border p-2.5 text-left transition-all cursor-pointer"
                          :class="getQrCust(qr.id).gluePosition === 'trasero' ? 'border-blue-500/40 bg-blue-500/10' : 'border-[#49454F]/30 bg-[#1C1B1F]/80 hover:border-white/20'">
                          <p class="text-xs font-bold text-white">Trasero</p>
                          <p class="text-[8px] text-[#CAC4D0]/40">Tradicional</p>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                <div v-if="qrs.length === 0" class="text-center py-6 text-[#CAC4D0]/30 text-xs">No hay QRs en este plan.
                </div>
              </div>
            </div>
          </details>

          <!-- Submit button -->
          <button @click="handleConfirm" :disabled="isSubmitting || selectedQRIds.size === 0"
            class="w-full h-12 rounded-xl font-bold text-sm uppercase tracking-[0.08em] transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            :class="hasFreeShipment ? 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-[0_4px_20px_rgba(16,185,129,0.3)]' : 'bg-amber-500 text-black hover:bg-amber-400 shadow-[0_4px_20px_rgba(245,158,11,0.3)]'">
            <span v-if="isSubmitting" class="flex items-center gap-2">
              <span class="w-4 h-4 border-2 border-white/30 border-t-transparent rounded-full animate-spin"></span>
              Procesando...
            </span>
            <span v-else>
              <span class="material-symbols-outlined notranslate text-[18px]">{{ hasFreeShipment ? 'redeem' : 'payments'
                }}</span>
              {{ hasFreeShipment ? 'Solicitar Envío Gratis' : 'Pagar $199 MXN' }}
            </span>
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.material-symbols-outlined {
  font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}

details>summary::-webkit-details-marker {
  display: none;
}
</style>
