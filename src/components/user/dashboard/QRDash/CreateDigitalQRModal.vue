<script lang="ts" setup>
import { ref, watch } from 'vue'
import { doc, runTransaction, increment, Timestamp } from 'firebase/firestore'
import { db as firestoreDb } from '@/firebase'
import { nanoid } from 'nanoid'
import { toast } from 'vue-sonner'
import type { ISubscription } from '@/interfaces/ISubscription'

const props = defineProps<{
  isOpen: boolean
  userId: string
  qrsRemaining: number
  activeSubscriptions: ISubscription[]
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'success'): void
}>()

const qrName = ref('')
const qrCategory = ref('vehicle')
const isSubmitting = ref(false)

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    qrName.value = ''
    qrCategory.value = 'vehicle'
  }
})

const handleCreate = async () => {
  if (!qrName.value.trim()) {
    toast.error('Por favor, ingrese un nombre para su QR.')
    return
  }
  if (props.qrsRemaining <= 0) {
    toast.error('Límite de QRs alcanzado o no cuenta con suscripción activa.')
    return
  }

  isSubmitting.value = true
  try {
    const activeSub = props.activeSubscriptions.find(sub => sub.totalQRsCreated < sub.totalQRsAllowed)
    if (!activeSub) {
      toast.error('No se encontró una suscripción con capacidad disponible.')
      isSubmitting.value = false
      return
    }

    const newQRId = nanoid(15)
    const publicQrRef = doc(firestoreDb, `publicQR/${newQRId}`)
    const userQrRef = doc(firestoreDb, `users/${props.userId}/qrs/${newQRId}`)
    const subRef = doc(firestoreDb, `users/${props.userId}/subscriptions/${activeSub.id}`)
    const userRef = doc(firestoreDb, `users/${props.userId}`)

    await runTransaction(firestoreDb, async (transaction) => {
      const docSnap = await transaction.get(publicQrRef)
      if (docSnap.exists()) {
        throw new Error('Colisión de ID. Reintente de nuevo.')
      }

      transaction.set(publicQrRef, {
        id: newQRId,
        name: qrName.value.trim(),
        status: 'Active',
        lastScan: null,
        totalScans: 0,
        isBanned: false,
        banReason: '',
        docId: newQRId,
        uid: props.userId,
        tier: activeSub.planType,
        isPublic: true,
        category: qrCategory.value,
        createdAt: Timestamp.now(),
        freeShipmentUsed: false
      })

      transaction.set(userQrRef, {
        id: newQRId,
        uid: props.userId,
        name: qrName.value.trim(),
        status: 'Active',
        scans: 0,
        lastScan: '',
        isActive: true,
        isBanned: false,
        banReason: '',
        subscriptionId: activeSub.id,
        createdAt: Timestamp.now(),
        physicalShipped: false,
        physicalShippedAt: null,
        shippingNotes: '',
        freeShipmentUsed: false,
        requestType: 'digital',
        qrLayout: 'compact',
        qrSize: 'SM (5cm)',
        gluePosition: 'trasero',
        category: qrCategory.value
      })

      transaction.update(userRef, { totalQRs: increment(1) })
      transaction.update(subRef, { totalQRsCreated: increment(1) })
    })

    toast.success(`Código QR "${qrName.value}" creado digitalmente.`)
    emit('success')
    emit('close')
  } catch (error) {
    toast.error(`Error al crear QR: ${error}`)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <Transition name="fade">
    <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div
        class="relative w-full max-w-md rounded-3xl border border-white/10 bg-[#0b0b0d] p-6 shadow-2xl space-y-6 font-google-sans">

        <!-- Background Ornament -->
        <div class="absolute inset-0 opacity-[0.02] pointer-events-none"
          style="background-image: linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px); background-size: 20px 20px;">
        </div>

        <div class="relative z-10 space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-xl font-black text-white flex items-center gap-2">
              <span class="material-symbols-outlined notranslate text-orange-400">qr_code</span>
              Crear QR Digital
            </h3>
            <button @click="emit('close')" class="text-white/40 hover:text-white transition-colors cursor-pointer">
              <span class="material-symbols-outlined notranslate">close</span>
            </button>
          </div>

          <p class="text-xs text-white/50 leading-relaxed">
            Se generará un nuevo código digital de forma inmediata para que pueda descargarlo e imprimirlo.
          </p>

          <div class="space-y-4">
            <!-- Name -->
            <div class="space-y-2">
              <label class="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 ml-1">
                Nombre del QR
              </label>
              <input v-model="qrName" placeholder="Ej. Mochila, Llaves de casa..."
                class="w-full h-11 px-4 rounded-xl border border-white/10 bg-black/40 text-sm text-white placeholder:text-white/20 outline-none focus:border-orange-500 transition-all">
            </div>

            <!-- Category -->
            <div class="space-y-2">
              <label class="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 ml-1">
                Categoría
              </label>
              <select v-model="qrCategory"
                class="w-full h-11 px-4 rounded-xl border border-white/10 bg-black/40 text-sm text-white outline-none focus:border-orange-500 cursor-pointer appearance-none transition-all">
                <option value="vehicle">Vehículos</option>
                <option value="home">Hogares</option>
                <option value="phone">Celulares</option>
                <option value="laptop">Laptops</option>
                <option value="bags">Mochilas / Maletas</option>
                <option value="keys">Llaves</option>
                <option value="pets">Mascotas</option>
                <option value="documents">Documentos</option>
                <option value="other">Otro</option>
              </select>
            </div>
          </div>

          <div class="flex gap-3 pt-2">
            <button @click="emit('close')"
              class="flex-1 h-11 rounded-xl border border-white/10 bg-white/[0.02] text-xs font-bold text-white hover:bg-white/[0.05] transition-all cursor-pointer">
              Cancelar
            </button>
            <button @click="handleCreate" :disabled="isSubmitting || qrsRemaining <= 0"
              class="flex-1 h-11 rounded-xl bg-orange-500 text-white text-xs font-bold hover:bg-orange-600 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
              {{ isSubmitting ? 'Creando...' : 'Crear Digital' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
