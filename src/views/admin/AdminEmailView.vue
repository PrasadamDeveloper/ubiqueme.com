<template>
  <UserDashoardLayout>
    <template #main>
      <div class="min-h-screen bg-[#0a0a0b] w-full font-sans">

        <!-- Header -->
        <div class="sticky top-0 z-20 bg-[#0a0a0b]/80 backdrop-blur-md border-b border-white/[0.06]">
          <div class="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div class="flex items-center gap-3">
              <span
                class="w-8 h-8 rounded-lg bg-[#ff7900]/10 border border-[#ff7900]/20 flex items-center justify-center text-[#ff7900] shrink-0">
                <span class="material-symbols-outlined notranslate text-sm">mail</span>
              </span>
              <div class="flex-1">
                <h1 class="text-base font-bold text-white tracking-tight">Enviar correo</h1>
                <p class="text-[11px] text-white/40">soporte@ubiqueme.com</p>
              </div>
              <div class="flex items-center gap-2">
                <span
                  class="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 text-green-400 text-[10px] font-semibold border border-green-500/20">
                  <span class="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                  Resend activo
                </span>
              </div>
            </div>
          </div>
        </div>

        <div class="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div class="flex flex-col lg:flex-row gap-6">

            <!-- Left: Users list -->
            <div class="w-full lg:w-80 shrink-0">
              <div class="bg-white/[0.02] rounded-xl border border-white/[0.06] overflow-hidden">
                <!-- Search -->
                <div class="p-3 border-b border-white/[0.06]">
                  <div class="relative">
                    <span
                      class="material-symbols-outlined notranslate absolute left-3 top-1/2 -translate-y-1/2 text-white/15 text-sm">search</span>
                    <input v-model="searchQuery" type="text" placeholder="Buscar por nombre o email..."
                      class="w-full h-9 pl-9 pr-3 rounded-lg border border-white/[0.06] bg-white/[0.03] text-white text-[12px] outline-none focus:border-[#ff7900]/30 focus:bg-white/[0.05] placeholder:text-white/20 transition-all">
                  </div>
                </div>

                <!-- Loading -->
                <div v-if="loading" class="flex items-center justify-center py-12">
                  <span
                    class="material-symbols-outlined notranslate text-[#ff7900] text-xl animate-spin">progress_activity</span>
                </div>

                <!-- Empty -->
                <div v-else-if="filteredUsers.length === 0" class="text-center py-12 px-4">
                  <span class="material-symbols-outlined notranslate text-3xl text-white/10 mb-2">group_off</span>
                  <p class="text-white/30 text-xs">No se encontraron usuarios</p>
                </div>

                <!-- List -->
                <div v-else class="divide-y divide-white/[0.04] max-h-[60vh] overflow-y-auto">
                  <button v-for="user in filteredUsers" :key="user.uid" @click="selectUser(user)"
                    class="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[#ff7900]/[0.04] transition-colors cursor-pointer"
                    :class="selectedUser?.uid === user.uid ? 'bg-[#ff7900]/[0.06] border-l-2 border-[#ff7900]' : 'border-l-2 border-transparent'">
                    <div
                      class="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0 bg-[#ff7900]/10 text-[#ff7900]">
                      {{ (user.name || 'U').charAt(0).toUpperCase() }}
                    </div>
                    <div class="flex-1 min-w-0">
                      <div class="text-[13px] font-medium text-white truncate">{{ user.name || 'Sin nombre' }}</div>
                      <div class="text-[11px] text-white/40 truncate">{{ user.email || 'Sin email' }}</div>
                      <div class="text-[9px] text-white/20 font-mono truncate mt-0.5">{{ user.uid?.slice(0, 12) || ''
                        }}…</div>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            <!-- Right: Email form -->
            <div class="flex-1">
              <div class="bg-white/[0.02] rounded-xl border border-white/[0.06]">
                <!-- Empty state -->
                <div v-if="!selectedUser" class="flex flex-col items-center justify-center py-20 px-6">
                  <div
                    class="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-4">
                    <span class="material-symbols-outlined notranslate text-3xl text-white/15">mail_outline</span>
                  </div>
                  <h3 class="text-sm font-semibold text-white/70 mb-1">Selecciona un usuario</h3>
                  <p class="text-[12px] text-white/30 text-center max-w-xs">Elige un usuario de la lista para enviarle
                    un correo desde soporte@ubiqueme.com</p>
                </div>

                <!-- Form -->
                <div v-else class="p-6 sm:p-8">
                  <!-- Selected user badge -->
                  <div class="flex items-center gap-3 mb-6 pb-5 border-b border-white/[0.06]">
                    <div
                      class="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 bg-[#ff7900]/10 text-[#ff7900]">
                      {{ (selectedUser.name || 'U').charAt(0).toUpperCase() }}
                    </div>
                    <div class="flex-1 min-w-0">
                      <div class="text-sm font-semibold text-white">{{ selectedUser.name }}</div>
                      <div class="text-[12px] text-white/40">{{ selectedUser.email }}</div>
                    </div>
                    <button @click="selectedUser = null"
                      class="text-white/20 hover:text-white/50 transition-colors cursor-pointer">
                      <span class="material-symbols-outlined notranslate text-lg">close</span>
                    </button>
                  </div>

                  <!-- To field -->
                  <div class="mb-4">
                    <label
                      class="block text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">Para</label>
                    <div
                      class="flex items-center gap-2 px-3.5 py-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06] text-sm text-white/60">
                      <span class="font-medium text-white">{{ selectedUser.name }}</span>
                      <span class="text-white/30">{{ '<' + selectedUser.email + '>' }}</span>
                    </div>
                  </div>

                  <!-- Category -->
                  <div class="mb-4">
                    <label
                      class="block text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">Categoría</label>
                    <div class="flex flex-wrap gap-1.5">
                      <button v-for="cat in categories" :key="cat.value" @click="selectedCategory = cat.value"
                        class="px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all cursor-pointer" :class="selectedCategory === cat.value
                          ? 'bg-[#ff7900]/10 text-[#ff7900] border border-[#ff7900]/20'
                          : 'bg-white/[0.03] text-white/40 border border-white/[0.06] hover:bg-white/[0.06]'">
                        {{ cat.label }}
                      </button>
                    </div>
                  </div>

                  <!-- Subject -->
                  <div class="mb-4">
                    <label
                      class="block text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">Asunto</label>
                    <input v-model="subject" type="text" placeholder="Ej: Respuesta a su solicitud"
                      class="w-full h-10 px-3.5 rounded-lg border border-white/[0.06] bg-white/[0.03] text-white text-[13px] outline-none focus:border-[#ff7900]/30 focus:bg-white/[0.05] placeholder:text-white/20 transition-all">
                  </div>

                  <!-- Message -->
                  <div class="mb-5">
                    <label
                      class="block text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">Mensaje</label>
                    <textarea v-model="message" rows="8" placeholder="Escriba su mensaje aquí..."
                      class="w-full px-3.5 py-3 rounded-lg border border-white/[0.06] bg-white/[0.03] text-white text-[13px] outline-none focus:border-[#ff7900]/30 focus:bg-white/[0.05] placeholder:text-white/20 transition-all resize-y min-h-[160px]"></textarea>
                  </div>

                  <!-- Send button -->
                  <div class="flex items-center justify-between pt-2 border-t border-white/[0.06]">
                    <div class="flex items-center gap-2 text-[11px] text-white/30">
                      <span class="material-symbols-outlined notranslate text-sm">info</span>
                      Se enviará como <strong class="text-white/50">soporte@ubiqueme.com</strong>
                    </div>
                    <button @click="sendEmail" :disabled="sending || !subject.trim() || !message.trim()"
                      class="h-10 px-5 rounded-lg bg-[#ff7900] hover:bg-[#ff7900]/90 disabled:bg-[#ff7900]/30 text-white text-[12px] font-bold transition-all cursor-pointer disabled:cursor-not-allowed flex items-center gap-2 shadow-sm">
                      <span v-if="sending"
                        class="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      <span v-else class="material-symbols-outlined notranslate text-sm">send</span>
                      {{ sending ? 'Enviando...' : 'Enviar correo' }}
                    </button>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </template>
  </UserDashoardLayout>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import UserDashoardLayout from '@/layouts/UserDashoardLayout.vue'
import { collection, onSnapshot } from 'firebase/firestore'
import { db } from '@/firebase'
import { useUserStore } from '@/stores/user'
import { toast } from 'vue-sonner'
import type { IUser } from '@/interfaces/IUser'

const userStore = useUserStore()

const SOPORTE_WORKER_URL = 'https://soporte-worker.miarrendatario.workers.dev'

const categories = [
  { value: 'general', label: 'General' },
  { value: 'soporte', label: 'Soporte técnico' },
  { value: 'billing', label: 'Facturación / Pagos' },
  { value: 'cancellation', label: 'Cancelación' },
  { value: 'deletion', label: 'Eliminación de datos' },
  { value: 'plan', label: 'Asignación de plan' },
]

const loading = ref(true)
const usersData = ref<IUser[]>([])
const searchQuery = ref('')
const selectedUser = ref<IUser | null>(null)
const selectedCategory = ref('general')
const subject = ref('')
const message = ref('')
const sending = ref(false)

onMounted(() => {
  const usersCollection = collection(db, 'users')
  onSnapshot(usersCollection, (snapshot) => {
    usersData.value = []
    snapshot.forEach((doc) => {
      usersData.value.push(doc.data() as IUser)
    })
    loading.value = false
  })
})

const filteredUsers = computed(() => {
  if (!searchQuery.value) return usersData.value
  const q = searchQuery.value.toLowerCase()
  return usersData.value.filter(
    (u) =>
      (u.name || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q) ||
      (u.uid || '').toLowerCase().includes(q),
  )
})

function selectUser(user: IUser) {
  selectedUser.value = user
  selectedCategory.value = 'general'
  subject.value = ''
  message.value = ''
}

async function sendEmail() {
  if (!selectedUser.value || !subject.value.trim() || !message.value.trim()) return

  const toUid = selectedUser.value.uid || ''
  const toName = selectedUser.value.name || ''
  const toEmail = selectedUser.value.email || ''

  if (!toEmail) {
    toast.error('El usuario seleccionado no tiene correo electrónico')
    return
  }

  sending.value = true

  try {
    const response = await fetch(`${SOPORTE_WORKER_URL}/api/admin-send-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: toEmail,
        toName,
        toUid,
        subject: subject.value.trim(),
        message: message.value.trim(),
        category: selectedCategory.value,
        sentBy: {
          uid: userStore.getUserId || 'unknown',
          name: userStore.getFullName || 'Admin',
          email: userStore.getEmail || 'admin@ubiqueme.com',
        },
      }),
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.error || 'Error al enviar')
    }

    toast.success(`Correo enviado exitosamente a ${toName}`)
    subject.value = ''
    message.value = ''
    selectedCategory.value = 'general'
  } catch (error) {
    toast.error(`Error al enviar: ${error}`)
  } finally {
    sending.value = false
  }
}
</script>

<style scoped>
.material-symbols-outlined {
  font-variation-settings: 'FILL' 0, 'wght' 500, 'GRAD' 0, 'opsz' 24;
}

.overflow-y-auto {
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.06) transparent;
}

.overflow-y-auto::-webkit-scrollbar {
  width: 4px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.06);
  border-radius: 2px;
}
</style>
