<template>
  <UserDashoardLayout>
    <template #main>
      <div class="min-h-screen bg-[#f8f9fa] w-full font-sans">

        <!-- Header -->
        <div class="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-200/60">
          <div class="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div class="flex items-center gap-3">
              <span
                class="w-8 h-8 rounded-lg bg-orange-50 border border-orange-200 flex items-center justify-center text-orange-500 shrink-0">
                <span class="material-symbols-outlined notranslate text-sm">mail</span>
              </span>
              <div class="flex-1">
                <h1 class="text-base font-bold text-gray-900 tracking-tight">Enviar correo</h1>
                <p class="text-[11px] text-gray-400">soporte@ubiqueme.com</p>
              </div>
              <div class="flex items-center gap-2">
                <span
                  class="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 text-green-600 text-[10px] font-semibold">
                  <span class="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                  Resend activo
                </span>
              </div>
            </div>
          </div>
        </div>

        <div class="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <!-- Split layout -->
          <div class="flex flex-col lg:flex-row gap-6">

            <!-- Left: Users list -->
            <div class="w-full lg:w-80 shrink-0">
              <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <!-- Search -->
                <div class="p-3 border-b border-gray-100">
                  <div class="relative">
                    <span
                      class="material-symbols-outlined notranslate absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 text-sm">search</span>
                    <input v-model="searchQuery" type="text" placeholder="Buscar por nombre o email..."
                      class="w-full h-9 pl-9 pr-3 rounded-lg border border-gray-200 bg-gray-50 text-gray-700 text-[12px] outline-none focus:border-orange-300 focus:bg-white focus:ring-2 focus:ring-orange-100 placeholder:text-gray-300 transition-all">
                  </div>
                </div>

                <!-- Loading -->
                <div v-if="loading" class="flex items-center justify-center py-12">
                  <span
                    class="material-symbols-outlined notranslate text-orange-400 text-xl animate-spin">progress_activity</span>
                </div>

                <!-- Empty -->
                <div v-else-if="filteredUsers.length === 0" class="text-center py-12 px-4">
                  <span class="material-symbols-outlined notranslate text-3xl text-gray-200 mb-2">group_off</span>
                  <p class="text-gray-400 text-xs">No se encontraron usuarios</p>
                </div>

                <!-- List -->
                <div v-else class="divide-y divide-gray-50 max-h-[60vh] overflow-y-auto">
                  <button v-for="user in filteredUsers" :key="user.uid" @click="selectUser(user)"
                    class="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-orange-50/50 transition-colors cursor-pointer"
                    :class="selectedUser?.uid === user.uid ? 'bg-orange-50 border-l-2 border-orange-400' : 'border-l-2 border-transparent'">
                    <!-- Avatar -->
                    <div
                      class="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0 bg-orange-50 text-orange-500">
                      {{ (user.name || 'U').charAt(0).toUpperCase() }}
                    </div>
                    <!-- Info -->
                    <div class="flex-1 min-w-0">
                      <div class="text-[13px] font-medium text-gray-800 truncate">{{ user.name || 'Sin nombre' }}</div>
                      <div class="text-[11px] text-gray-400 truncate">{{ user.email || 'Sin email' }}</div>
                      <div class="text-[9px] text-gray-300 font-mono truncate mt-0.5">{{ user.uid?.slice(0, 12) || ''
                      }}…</div>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            <!-- Right: Email form -->
            <div class="flex-1">
              <div class="bg-white rounded-xl border border-gray-200 shadow-sm">
                <!-- Empty state -->
                <div v-if="!selectedUser" class="flex flex-col items-center justify-center py-20 px-6">
                  <div
                    class="w-16 h-16 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center mb-4">
                    <span class="material-symbols-outlined notranslate text-3xl text-gray-300">mail_outline</span>
                  </div>
                  <h3 class="text-sm font-semibold text-gray-700 mb-1">Selecciona un usuario</h3>
                  <p class="text-[12px] text-gray-400 text-center max-w-xs">Elige un usuario de la lista para enviarle
                    un correo desde soporte@ubiqueme.com</p>
                </div>

                <!-- Form -->
                <div v-else class="p-6 sm:p-8">
                  <!-- Selected user badge -->
                  <div class="flex items-center gap-3 mb-6 pb-5 border-b border-gray-100">
                    <div
                      class="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 bg-orange-50 text-orange-500">
                      {{ (selectedUser.name || 'U').charAt(0).toUpperCase() }}
                    </div>
                    <div class="flex-1 min-w-0">
                      <div class="text-sm font-semibold text-gray-800">{{ selectedUser.name }}</div>
                      <div class="text-[12px] text-gray-400">{{ selectedUser.email }}</div>
                    </div>
                    <button @click="selectedUser = null"
                      class="text-gray-300 hover:text-gray-500 transition-colors cursor-pointer">
                      <span class="material-symbols-outlined notranslate text-lg">close</span>
                    </button>
                  </div>

                  <!-- To field (read-only) -->
                  <div class="mb-4">
                    <label
                      class="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Para</label>
                    <div
                      class="flex items-center gap-2 px-3.5 py-2.5 rounded-lg bg-gray-50 border border-gray-200 text-sm text-gray-600">
                      <span class="font-medium text-gray-800">{{ selectedUser.name }}</span>
                      <span class="text-gray-300">{{ '<' + selectedUser.email + '>' }}</span>
                    </div>
                  </div>

                  <!-- Category -->
                  <div class="mb-4">
                    <label
                      class="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Categoría</label>
                    <div class="flex flex-wrap gap-1.5">
                      <button v-for="cat in categories" :key="cat.value" @click="selectedCategory = cat.value"
                        class="px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all cursor-pointer" :class="selectedCategory === cat.value
                          ? 'bg-orange-50 text-orange-600 border border-orange-200 shadow-sm'
                          : 'bg-gray-50 text-gray-500 border border-gray-200 hover:bg-gray-100'">
                        {{ cat.label }}
                      </button>
                    </div>
                  </div>

                  <!-- Subject -->
                  <div class="mb-4">
                    <label
                      class="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Asunto</label>
                    <input v-model="subject" type="text" placeholder="Ej: Respuesta a su solicitud"
                      class="w-full h-10 px-3.5 rounded-lg border border-gray-200 bg-white text-gray-700 text-[13px] outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100 placeholder:text-gray-300 transition-all">
                  </div>

                  <!-- Message -->
                  <div class="mb-5">
                    <label
                      class="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Mensaje</label>
                    <textarea v-model="message" rows="8" placeholder="Escriba su mensaje aquí..."
                      class="w-full px-3.5 py-3 rounded-lg border border-gray-200 bg-white text-gray-700 text-[13px] outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100 placeholder:text-gray-300 transition-all resize-y min-h-[160px]"></textarea>
                  </div>

                  <!-- Send button -->
                  <div class="flex items-center justify-between pt-2 border-t border-gray-100">
                    <div class="flex items-center gap-2 text-[11px] text-gray-400">
                      <span class="material-symbols-outlined notranslate text-sm">info</span>
                      Se enviará como <strong class="text-gray-500">soporte@ubiqueme.com</strong>
                    </div>
                    <button @click="sendEmail" :disabled="sending || !subject.trim() || !message.trim()"
                      class="h-10 px-5 rounded-lg bg-orange-500 hover:bg-orange-600 disabled:bg-orange-200 text-white text-[12px] font-bold transition-all cursor-pointer disabled:cursor-not-allowed flex items-center gap-2 shadow-sm">
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

/* Smooth scroll for user list */
.overflow-y-auto {
  scrollbar-width: thin;
  scrollbar-color: #e5e7eb transparent;
}

.overflow-y-auto::-webkit-scrollbar {
  width: 4px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background-color: #e5e7eb;
  border-radius: 2px;
}
</style>
