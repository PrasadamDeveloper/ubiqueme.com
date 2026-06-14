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

// ─── Datos de entrega ──────────────────────────────────────────
const city = ref('')
const postalCode = ref('')
const phone = ref('')
const shippingNotes = ref('')

// Per-QR customization: map of qrId -> { layout, size, gluePosition }
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

const setLayout = (qrId: string, layout: 'compact' | 'detail') => {
  getQrCust(qrId).layout = layout
}
const setSize = (qrId: string, size: string) => {
  getQrCust(qrId).size = size
}
const setGluePosition = (qrId: string, gluePosition: 'frontal' | 'trasero') => {
  getQrCust(qrId).gluePosition = gluePosition
}

const expandedQR = ref<string | null>(null)

const toggleExpanded = (qrId: string) => {
  if (expandedQR.value === qrId) {
    expandedQR.value = null
  } else {
    expandedQR.value = qrId
    // Auto-select if not already selected
    if (!selectedQRIds.value.has(qrId)) {
      const newSet = new Set(selectedQRIds.value)
      newSet.add(qrId)
      selectedQRIds.value = newSet
    }
  }
}

const sizeOptions = ['XS (3cm)', 'SM (5cm)', 'MD (10cm)', 'LG (15cm)']

// Si nunca ha usado envío gratuito, el primer pedido es gratis
const shipmentCost = computed(() => {
  if (!props.subscription) return 0
  if (props.subscription.freeShipmentsUsed < props.subscription.freeShipmentsAllowed) {
    return 0
  }
  return 199
})

const hasFreeShipment = computed(() => shipmentCost.value === 0)

const toggleQRSelection = (qrId: string) => {
  const newSet = new Set(selectedQRIds.value)
  if (newSet.has(qrId)) {
    newSet.delete(qrId)
  } else {
    newSet.add(qrId)
  }
  selectedQRIds.value = newSet
}

const isSelected = (qrId: string) => selectedQRIds.value.has(qrId)

const selectAll = () => {
  const allIds = props.qrs.filter(qr => qr.status === 'Active').map(qr => qr.id)
  selectedQRIds.value = new Set(allIds)
}

const deselectAll = () => {
  selectedQRIds.value = new Set()
}

const handleConfirm = async () => {
  if (!props.subscription) {
    toast.error('No se encontró la suscripción. Intente de nuevo.')
    return
  }

  if (selectedQRIds.value.size === 0) {
    toast.error('Seleccione al menos un código QR para solicitar.')
    return
  }

  // Validar dirección de entrega
  if (!city.value.trim()) {
    toast.error('Ingrese la ciudad de entrega.')
    return
  }
  if (!postalCode.value.trim() || postalCode.value.length < 5) {
    toast.error('Ingrese un código postal válido (5 dígitos).')
    return
  }
  if (!phone.value.trim() || phone.value.length < 10) {
    toast.error('Ingrese un teléfono de contacto válido (10 dígitos).')
    return
  }

  isSubmitting.value = true
  try {
    const batch = writeBatch(db)
    const userId = userStore.getUserId

    for (const qrId of selectedQRIds.value) {
      const userQrRef = doc(db, `users/${userId}/qrs/${qrId}`)
      const publicQrRef = doc(db, `publicQR/${qrId}`)
      const now = Timestamp.now()
      const cust = getQrCust(qrId)

      batch.update(userQrRef, {
        physicalShipped: true,
        physicalShippedAt: now,
        freeShipmentUsed: hasFreeShipment.value,
        shippingNotes: '',
        // Per-QR customization
        qrLayout: cust.layout,
        qrSize: cust.size,
        gluePosition: cust.gluePosition,
      })

      batch.update(publicQrRef, {
        physicalShipped: true,
        physicalShippedAt: now,
        freeShipmentUsed: hasFreeShipment.value,
        qrLayout: cust.layout,
        qrSize: cust.size,
        gluePosition: cust.gluePosition,
      })
    }

    const subRef = doc(db, `users/${userId}/subscriptions/${props.subscription.id}`)
    batch.update(subRef, {
      freeShipmentsUsed: increment(1)
    })

    // Guardar dirección de entrega en un documento del pedido
    const orderRef = doc(db, `users/${userId}/shipments/${Timestamp.now().toMillis()}`)
    batch.set(orderRef, {
      subscriptionId: props.subscription.id,
      qrIds: Array.from(selectedQRIds.value),
      city: city.value.trim(),
      postalCode: postalCode.value.trim(),
      phone: phone.value.trim(),
      shippingNotes: shippingNotes.value.trim(),
      cost: hasFreeShipment.value ? 0 : 199,
      freeShipmentUsed: hasFreeShipment.value,
      createdAt: Timestamp.now(),
    })

    await batch.commit()

    // ── Notificar al worker de soporte ──────────────────────
    const soporteUrl = import.meta.env.VITE_SOPORTE_WORKER_URL
    if (soporteUrl) {
      const selectedQrs = props.qrs.filter(qr => selectedQRIds.value.has(qr.id))
      const qrNames = selectedQrs.map(qr => {
        const cust = getQrCust(qr.id)
        return `• ${qr.name} (#${qr.id}) — Formato: ${cust.layout === 'compact' ? 'Compacto' : 'Detallado'}, Tamaño: ${cust.size}, Pegamento: ${cust.gluePosition === 'frontal' ? 'Frontal (para cristales)' : 'Trasero (tradicional)'}`
      })
      const costLine = hasFreeShipment.value
        ? '• Este es el PRIMER ENVÍO del usuario → no tiene costo'
        : '• Costo de envío: $199 MXN'

      fetch(`${soporteUrl}/api/physical-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firebaseUid: userId,
          email: userStore.getEmail,
          userName: userStore.getFullName,
          planType: props.subscription.planType,
          qrIds: Array.from(selectedQRIds.value).join(', '),
          cost: hasFreeShipment.value ? 'Gratis (primer envío)' : '$199 MXN',
          city: city.value.trim(),
          postalCode: postalCode.value.trim(),
          phone: phone.value.trim(),
          shippingNotes: shippingNotes.value.trim() || 'Ninguna',
          notes: [
            `El usuario ${userStore.getFullName} (${userStore.getEmail}) ha solicitado un envío físico de código(s) QR.`,
            '',
            costLine,
            `• Plan del usuario: ${props.subscription.planType}`,
            `• Códigos QR solicitados: ${selectedQRIds.value.size}`,
            '',
            '📦 Detalle de cada QR:',
            ...qrNames,
            '',
            'Puede verificar el estado del usuario en:',
            'https://www.ubiqueme.com/admin',
          ].join('\n'),
        }),
      }).catch(err => console.error('Error notificando al worker:', err))
    }

    toast.success(
      hasFreeShipment.value
        ? 'Solicitud de envío gratuita registrada exitosamente.'
        : `Solicitud de envío registrada. Se realizará un cobro de $199 MXN.`
    )
    emit('confirm')
  } catch (error) {
    const e = error as Error
    toast.error(`Error al solicitar envío físico: ${e.message}`)
  } finally {
    isSubmitting.value = false
  }
}

const handleClose = () => {
  if (isSubmitting.value) return
  selectedQRIds.value = new Set()
  expandedQR.value = null
  emit('close')
}
</script>

<template>
  <div v-if="visible" class="fixed inset-0 bg-black/80 flex items-center justify-center z-100 p-4"
    @click.self="handleClose">
    <div v-if="visible && subscription"
      class="relative w-full max-w-5xl bg-[#0a0808] border border-white/10 rounded-3xl overflow-hidden font-google-sans">

      <!-- Background grid -->
      <div class="absolute inset-0 z-0 opacity-[0.03] pointer-events-none"
        style="background-image:linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px);background-size:32px 32px;">
      </div>

      <!-- Close button -->
      <button @click="handleClose"
        class="absolute top-4 right-4 z-20 w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-white/50 hover:bg-white/10 hover:text-white transition-all cursor-pointer">
        <span class="material-symbols-outlined text-[20px]">close</span>
      </button>

      <div class="relative z-10 p-6 md:p-8 max-h-[85vh] overflow-y-auto">

        <!-- Header -->
        <div class="mb-6">
          <div
            class="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-orange-500/20 bg-orange-500/10 text-orange-400 text-[10px] font-black uppercase tracking-[0.2em] mb-3">
            <span class="material-symbols-outlined text-[14px]">local_shipping</span>
            Solicitar Envío Físico
          </div>
          <h2 class="text-2xl md:text-3xl font-black text-white tracking-tight leading-tight">
            Pedir código QR físico
          </h2>
          <p class="text-white/40 mt-1 text-sm max-w-xl leading-relaxed">
            Seleccione los códigos QR que desea recibir físicamente y personalice cada uno. Puede solicitar
            nuevamente un QR ya enviado anteriormente si necesita un reemplazo.
          </p>
        </div>

        <!-- Pricing Banner -->
        <div class="mb-6 p-4 rounded-2xl border"
          :class="hasFreeShipment ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-amber-500/20 bg-amber-500/5'">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center"
              :class="hasFreeShipment ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'">
              <span class="material-symbols-outlined text-[22px]">
                {{ hasFreeShipment ? 'redeem' : 'payments' }}
              </span>
            </div>
            <div class="flex-1">
              <p class="text-sm font-bold" :class="hasFreeShipment ? 'text-emerald-400' : 'text-amber-400'">
                {{ hasFreeShipment ? 'Envío GRATIS incluido en su plan' : 'Costo de envío: $199 MXN' }}
              </p>
              <p class="text-xs text-white/50 mt-0.5">
                <template v-if="hasFreeShipment">
                  Aún tiene un envío gratuito disponible en su plan {{ subscription?.planType }}.
                  <strong>¡Aproveche para pedir todos los que necesite!</strong>
                </template>
                <template v-else>
                  Ya utilizó su envío gratuito. Los pedidos posteriores tienen un costo de $199 MXN
                  (envío solo dentro de México).
                </template>
              </p>
            </div>
            <div class="text-right shrink-0">
              <span class="text-lg font-black" :class="hasFreeShipment ? 'text-emerald-400' : 'text-amber-400'">
                {{ hasFreeShipment ? 'GRATIS' : '$199' }}
              </span>
            </div>
          </div>
        </div>

        <!-- Subscription Info -->
        <div class="mb-6 p-4 rounded-2xl border border-white/10 bg-white/[0.02]">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <span class="material-symbols-outlined text-[20px]">workspace_premium</span>
            </div>
            <div>
              <p class="text-sm font-bold text-white capitalize">
                Plan {{ subscription?.planType }}
              </p>
              <p class="text-[11px] text-white/40 font-mono">
                ID: {{ subscription?.id }}
              </p>
            </div>
            <div class="ml-auto text-right">
              <p class="text-xs text-white/50">Envíos usados</p>
              <p class="text-sm font-bold text-white">
                {{ subscription?.freeShipmentsUsed }} / {{ subscription?.freeShipmentsAllowed }}
              </p>
            </div>
          </div>
        </div>

        <!-- Address Section -->
        <div class="mb-6 p-4 rounded-2xl border border-white/10 bg-white/[0.02]">
          <div class="flex items-center gap-2 mb-4">
            <span class="material-symbols-outlined text-[16px] text-white/50">location_on</span>
            <label class="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Dirección de entrega</label>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
            <div class="md:col-span-2">
              <label class="text-[9px] font-bold uppercase tracking-wider text-white/30 ml-1 mb-1 block">Ciudad
                *</label>
              <input v-model="city" type="text" placeholder="Ej. Ciudad de México"
                class="w-full h-10 px-3 rounded-xl border border-white/10 bg-black/30 text-white text-sm placeholder:text-white/20 outline-none focus:border-orange-500/40 focus:bg-orange-500/5 transition-all" />
            </div>
            <div>
              <label class="text-[9px] font-bold uppercase tracking-wider text-white/30 ml-1 mb-1 block">Código Postal
                *</label>
              <input v-model="postalCode" type="text" placeholder="Ej. 06600" maxlength="5"
                class="w-full h-10 px-3 rounded-xl border border-white/10 bg-black/30 text-white text-sm placeholder:text-white/20 outline-none focus:border-orange-500/40 focus:bg-orange-500/5 transition-all" />
            </div>
          </div>
          <div class="mb-3">
            <label class="text-[9px] font-bold uppercase tracking-wider text-white/30 ml-1 mb-1 block">Teléfono de
              contacto
              *</label>
            <input v-model="phone" type="tel" placeholder="Ej. 5512345678"
              class="w-full h-10 px-3 rounded-xl border border-white/10 bg-black/30 text-white text-sm placeholder:text-white/20 outline-none focus:border-orange-500/40 focus:bg-orange-500/5 transition-all" />
          </div>
          <div>
            <label class="text-[9px] font-bold uppercase tracking-wider text-white/30 ml-1 mb-1 block">Notas adicionales
              <span class="text-white/20 normal-case">(opcional)</span></label>
            <textarea v-model="shippingNotes" rows="2" placeholder="Ej. Entregar con vecino, referencias, etc."
              class="w-full px-3 py-2.5 rounded-xl border border-white/10 bg-black/30 text-white text-sm placeholder:text-white/20 outline-none focus:border-orange-500/40 focus:bg-orange-500/5 transition-all resize-none"></textarea>
          </div>
        </div>

        <!-- QR Selection Section -->
        <div class="mb-6">
          <div class="flex items-center justify-between mb-3">
            <label class="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
              Seleccionar códigos QR para envío
              <span class="text-white/20 ml-2">({{ selectedQRIds.size }} seleccionados)</span>
            </label>
            <div class="flex gap-2">
              <button @click="selectAll"
                class="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-lg border border-white/10 text-white/50 hover:text-white hover:border-white/30 transition-all cursor-pointer">
                Seleccionar todos
              </button>
              <button @click="deselectAll"
                class="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-lg border border-white/10 text-white/50 hover:text-white hover:border-white/30 transition-all cursor-pointer">
                Limpiar
              </button>
            </div>
          </div>

          <!-- QR List -->
          <div class="space-y-3 pr-1 scrollbar-thin">
            <div v-for="qr in qrs" :key="qr.id" class="rounded-xl border transition-all duration-200 overflow-hidden"
              :class="[
                isSelected(qr.id)
                  ? 'border-orange-500/30 bg-orange-500/5'
                  : 'border-white/10 bg-black/40 hover:bg-white/[0.04]',
                ''
              ]">

              <!-- Header row (click to select / expand) -->
              <div class="flex items-center gap-3 p-3 cursor-pointer" @click="toggleExpanded(qr.id)">
                <!-- Checkbox -->
                <div @click.stop="toggleQRSelection(qr.id)"
                  class="w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all cursor-pointer"
                  :class="isSelected(qr.id)
                    ? 'bg-orange-500 border-orange-500'
                    : 'border-white/20 bg-transparent'">
                  <span v-if="isSelected(qr.id)" class="material-symbols-outlined text-black text-[14px]">check</span>
                </div>

                <!-- QR Info -->
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2">
                    <span class="text-sm font-bold text-white truncate">{{ qr.name }}</span>
                    <span v-if="qr.physicalShipped"
                      class="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[8px] font-bold uppercase tracking-wider shrink-0">
                      Ya enviado
                    </span>
                  </div>
                  <div class="flex items-center gap-3 mt-0.5">
                    <span class="text-[10px] text-white/40 font-mono">#{{ qr.id }}</span>
                    <span class="text-[10px] text-white/30 capitalize">{{ qr.category || 'general' }}</span>
                    <span v-if="qr.status !== 'Active'"
                      class="px-1.5 py-0.5 rounded-full bg-red-500/10 text-red-400 text-[8px] font-bold uppercase">
                      {{ qr.status }}
                    </span>
                  </div>
                </div>

                <!-- Expand / collapse arrow -->
                <span
                  class="material-symbols-outlined text-white/30 text-[18px] transition-transform duration-200 shrink-0"
                  :class="expandedQR === qr.id ? 'rotate-180' : ''">
                  expand_more
                </span>
              </div>

              <!-- Expanded customization panel -->
              <div v-if="expandedQR === qr.id" class="border-t border-white/5 px-3 py-4 space-y-4">
                <!-- Formato -->
                <div class="space-y-2">
                  <label class="text-[9px] font-black uppercase tracking-[0.2em] text-white/30 ml-1">
                    Formato de Impresión
                  </label>
                  <div class="grid grid-cols-2 gap-2">
                    <button @click="setLayout(qr.id, 'compact')"
                      class="relative rounded-xl border p-3 text-left transition-all cursor-pointer" :class="getQrCust(qr.id).layout === 'compact'
                        ? 'border-orange-500/40 bg-orange-500/10 shadow-[0_0_15px_rgba(249,115,22,0.1)]'
                        : 'border-white/10 bg-black/30 hover:bg-white/[0.04]'">
                      <div class="flex items-center justify-between">
                        <p class="text-xs font-bold text-white">Compacto</p>
                        <span class="material-symbols-outlined text-[16px]"
                          :class="getQrCust(qr.id).layout === 'compact' ? 'text-orange-400' : 'text-white/20'">qr_code_2</span>
                      </div>
                      <p class="text-[9px] text-white/40 mt-0.5">Solo el código QR</p>
                    </button>
                    <button @click="setLayout(qr.id, 'detail')"
                      class="relative rounded-xl border p-3 text-left transition-all cursor-pointer" :class="getQrCust(qr.id).layout === 'detail'
                        ? 'border-orange-500/40 bg-orange-500/10 shadow-[0_0_15px_rgba(249,115,22,0.1)]'
                        : 'border-white/10 bg-black/30 hover:bg-white/[0.04]'">
                      <div class="flex items-center justify-between">
                        <p class="text-xs font-bold text-white">Detallado</p>
                        <span class="material-symbols-outlined text-[16px]"
                          :class="getQrCust(qr.id).layout === 'detail' ? 'text-orange-400' : 'text-white/20'">article</span>
                      </div>
                      <p class="text-[9px] text-white/40 mt-0.5">Nombre + QR</p>
                    </button>
                  </div>
                </div>

                <!-- Tamaño -->
                <div class="space-y-2">
                  <label class="text-[9px] font-black uppercase tracking-[0.2em] text-white/30 ml-1">
                    Tamaño de Impresión
                  </label>
                  <div class="grid grid-cols-4 gap-2">
                    <button v-for="size in sizeOptions" :key="size" @click="setSize(qr.id, size)"
                      class="h-9 rounded-lg border text-[9px] font-bold uppercase tracking-wider transition-all cursor-pointer"
                      :class="getQrCust(qr.id).size === size
                        ? 'border-orange-500/40 bg-orange-500/10 text-orange-400 shadow-[0_0_12px_rgba(249,115,22,0.12)]'
                        : 'border-white/10 bg-black/30 text-white/50 hover:border-white/30'">
                      {{ size }}
                    </button>
                  </div>
                </div>

                <!-- Pegamento -->
                <div class="space-y-2">
                  <label class="text-[9px] font-black uppercase tracking-[0.2em] text-white/30 ml-1">
                    Posición del Pegamento
                  </label>
                  <div class="grid grid-cols-2 gap-2">
                    <button @click="setGluePosition(qr.id, 'frontal')"
                      class="relative rounded-xl border p-3 text-left transition-all cursor-pointer" :class="getQrCust(qr.id).gluePosition === 'frontal'
                        ? 'border-blue-500/40 bg-blue-500/10 shadow-[0_0_15px_rgba(59,130,246,0.1)]'
                        : 'border-white/10 bg-black/30 hover:bg-white/[0.04]'">
                      <div class="flex items-center justify-between">
                        <p class="text-xs font-bold text-white">Frontal</p>
                        <span class="material-symbols-outlined text-[16px]"
                          :class="getQrCust(qr.id).gluePosition === 'frontal' ? 'text-blue-400' : 'text-white/20'">flip_to_front</span>
                      </div>
                      <p class="text-[9px] text-white/40">Para pegar por dentro de cristales</p>
                    </button>
                    <button @click="setGluePosition(qr.id, 'trasero')"
                      class="relative rounded-xl border p-3 text-left transition-all cursor-pointer" :class="getQrCust(qr.id).gluePosition === 'trasero'
                        ? 'border-blue-500/40 bg-blue-500/10 shadow-[0_0_15px_rgba(59,130,246,0.1)]'
                        : 'border-white/10 bg-black/30 hover:bg-white/[0.04]'">
                      <div class="flex items-center justify-between">
                        <p class="text-xs font-bold text-white">Trasero</p>
                        <span class="material-symbols-outlined text-[16px]"
                          :class="getQrCust(qr.id).gluePosition === 'trasero' ? 'text-blue-400' : 'text-white/20'">flip_to_back</span>
                      </div>
                      <p class="text-[9px] text-white/40">Etiqueta tradicional</p>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="qrs.length === 0" class="text-center py-8 text-white/30 text-sm">
              No hay códigos QR en este plan.
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div
          class="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between pt-4 border-t border-white/10">
          <div class="text-xs text-white/40">
            <span class="font-bold text-white/60">{{ selectedQRIds.size }}</span> código(s) seleccionado(s)
            <span v-if="selectedQRIds.size > 0 && !hasFreeShipment" class="text-amber-400">
              — Total: $199 MXN
            </span>
          </div>
          <div class="flex gap-3">
            <button @click="handleClose"
              class="px-6 py-2.5 rounded-xl border border-white/10 text-white/70 text-sm font-medium hover:bg-white/5 hover:text-white transition-all cursor-pointer">
              Cancelar
            </button>
            <button @click="handleConfirm" :disabled="isSubmitting || selectedQRIds.size === 0"
              class="px-6 py-2.5 rounded-xl font-black text-sm uppercase tracking-[0.1em] transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              :class="hasFreeShipment
                ? 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-[0_4px_20px_rgba(16,185,129,0.3)]'
                : 'bg-amber-500 text-black hover:bg-amber-400 shadow-[0_4px_20px_rgba(245,158,11,0.3)]'">
              <span v-if="isSubmitting" class="flex items-center gap-2">
                <span class="w-4 h-4 border-2 border-white/30 border-t-transparent rounded-full animate-spin"></span>
                Procesando...
              </span>
              <span v-else>
                {{ hasFreeShipment ? 'Solicitar Envío Gratis' : 'Pagar $199 MXN' }}
              </span>
            </button>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<style scoped>
.font-google-sans {
  font-family: 'Google Sans', sans-serif;
}

.material-symbols-outlined {
  font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}

.scrollbar-thin::-webkit-scrollbar {
  width: 4px;
}

.scrollbar-thin::-webkit-scrollbar-track {
  background: transparent;
}

.scrollbar-thin::-webkit-scrollbar-thumb {
  background: rgba(249, 115, 22, 0.2);
  border-radius: 999px;
}

.scrollbar-thin::-webkit-scrollbar-thumb:hover {
  background: rgba(249, 115, 22, 0.4);
}
</style>
