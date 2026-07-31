<template>
  <UserDashoardLayout>
    <template #main>
      <div class="min-h-screen bg-slate-50 w-full font-google-sans">

        <!-- Header -->
        <div class="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-gray-200/70">
          <div class="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div class="flex items-center gap-3">
              <RouterLink :to="{ name: 'admin' }"
                class="flex items-center gap-1.5 rounded-2xl border border-gray-200 bg-white px-3 h-9 text-gray-600 text-xs font-semibold shadow-sm transition-all duration-300 hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600 active:scale-95 cursor-pointer">
                <span class="material-symbols-outlined notranslate text-sm">arrow_back</span>
                <span class="hidden sm:inline">Admin</span>
              </RouterLink>
              <span
                class="w-9 h-9 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-500 shrink-0">
                <span class="material-symbols-outlined notranslate text-base">mail</span>
              </span>
              <div class="flex-1">
                <h1 class="text-base font-bold text-gray-900 tracking-tight">Enviar correo</h1>
                <p class="text-[11px] text-gray-500">soporte@ubiqueme.com</p>
              </div>
              <span
                class="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-semibold border border-emerald-200">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Resend activo
              </span>
            </div>
          </div>
        </div>

        <div class="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div class="flex flex-col lg:flex-row gap-5 lg:gap-6">

            <!-- Left: Users list -->
            <div class="w-full lg:w-80 shrink-0">
              <div class="bg-white rounded-3xl border border-gray-200/70 shadow-sm overflow-hidden">
                <!-- Search -->
                <div class="p-4 border-b border-gray-100">
                  <div class="relative">
                    <span
                      class="material-symbols-outlined notranslate absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-base">search</span>
                    <input v-model="searchQuery" type="text" placeholder="Buscar por nombre o email..."
                      class="w-full h-11 pl-10 pr-4 rounded-2xl border border-gray-200 bg-gray-50 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition-all duration-300 focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-500/10">
                  </div>
                </div>

                <!-- Loading -->
                <div v-if="loading" class="p-4 space-y-3">
                  <div v-for="i in 5" :key="i" class="flex items-center gap-3 animate-pulse">
                    <div class="w-10 h-10 rounded-xl bg-gray-100 shrink-0"></div>
                    <div class="flex-1 space-y-2">
                      <div class="h-3 w-2/3 rounded-full bg-gray-100"></div>
                      <div class="h-2.5 w-1/2 rounded-full bg-gray-100"></div>
                    </div>
                  </div>
                </div>

                <!-- Empty -->
                <div v-else-if="filteredUsers.length === 0" class="text-center py-12 px-4">
                  <div class="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center mx-auto mb-3">
                    <span class="material-symbols-outlined notranslate text-2xl text-gray-300">group_off</span>
                  </div>
                  <p class="text-gray-500 text-xs">No se encontraron usuarios</p>
                </div>

                <!-- List -->
                <div v-else class="divide-y divide-gray-50 max-h-[60vh] overflow-y-auto py-1.5 px-2">
                  <button v-for="user in filteredUsers" :key="user.uid" @click="selectUser(user)"
                    class="w-full flex items-center gap-3 px-3 py-3 text-left rounded-2xl transition-all duration-200 cursor-pointer active:scale-[0.98]"
                    :class="selectedUser?.uid === user.uid
                      ? 'bg-orange-50/80 ring-1 ring-orange-200'
                      : 'hover:bg-gray-50'">
                    <div
                      class="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 transition-colors"
                      :class="selectedUser?.uid === user.uid
                        ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25'
                        : 'bg-orange-50 text-orange-600'">
                      {{ (user.name || 'U').charAt(0).toUpperCase() }}
                    </div>
                    <div class="flex-1 min-w-0">
                      <div class="text-[13px] font-semibold text-gray-900 truncate">{{ user.name || 'Sin nombre' }}</div>
                      <div class="text-[11px] text-gray-500 truncate">{{ user.email || 'Sin email' }}</div>
                      <div class="text-[9px] text-gray-400 font-mono truncate mt-0.5">{{ user.uid?.slice(0, 12) || ''
                        }}…</div>
                    </div>
                    <span v-if="selectedUser?.uid === user.uid"
                      class="material-symbols-outlined notranslate text-orange-500 text-base shrink-0">check_circle</span>
                  </button>
                </div>
              </div>
            </div>

            <!-- Right: Email form -->
            <div class="flex-1 min-w-0">
              <div class="bg-white rounded-3xl border border-gray-200/70 shadow-sm">
                <!-- Empty state -->
                <div v-if="!selectedUser" class="flex flex-col items-center justify-center py-20 px-6 text-center">
                  <div
                    class="w-16 h-16 rounded-3xl bg-orange-50 border border-orange-100 flex items-center justify-center mb-5">
                    <span class="material-symbols-outlined notranslate text-3xl text-orange-400">mail_outline</span>
                  </div>
                  <h3 class="text-base font-semibold text-gray-900 mb-1.5">Selecciona un usuario</h3>
                  <p class="text-sm text-gray-500 max-w-xs">Elige un usuario de la lista para enviarle
                    un correo desde soporte@ubiqueme.com</p>
                </div>

                <!-- Form -->
                <div v-else class="p-6 sm:p-8">
                  <!-- Selected user badge -->
                  <div class="flex items-center gap-3 mb-6 pb-6 border-b border-gray-100">
                    <div
                      class="w-11 h-11 rounded-2xl flex items-center justify-center text-base font-bold shrink-0 bg-orange-500 text-white shadow-md shadow-orange-500/25">
                      {{ (selectedUser.name || 'U').charAt(0).toUpperCase() }}
                    </div>
                    <div class="flex-1 min-w-0">
                      <div class="text-sm font-semibold text-gray-900 truncate">{{ selectedUser.name }}</div>
                      <div class="text-[12px] text-gray-500 truncate">{{ selectedUser.email }}</div>
                    </div>
                    <button @click="selectedUser = null" aria-label="Quitar usuario seleccionado"
                      class="w-9 h-9 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-all duration-200 active:scale-95 flex items-center justify-center cursor-pointer">
                      <span class="material-symbols-outlined notranslate text-lg">close</span>
                    </button>
                  </div>

                  <!-- To field -->
                  <div class="mb-5">
                    <label class="block text-xs font-semibold text-gray-700 mb-2">Para</label>
                    <div
                      class="flex items-center gap-2 px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-sm text-gray-500">
                      <span class="font-semibold text-gray-900">{{ selectedUser.name }}</span>
                      <span class="text-gray-400">{{ '<' + selectedUser.email + '>' }}</span>
                    </div>
                  </div>

                  <!-- Category -->
                  <div class="mb-5">
                    <label class="block text-xs font-semibold text-gray-700 mb-2">Categoría</label>
                    <div class="flex flex-wrap gap-2">
                      <button v-for="cat in categories" :key="cat.value" @click="selectedCategory = cat.value"
                        class="px-3.5 py-2 rounded-full text-[11px] font-medium transition-all duration-200 ease-out cursor-pointer active:scale-95" :class="selectedCategory === cat.value
                          ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'">
                        {{ cat.label }}
                      </button>
                    </div>
                  </div>

                  <!-- Subject -->
                  <div class="mb-5">
                    <label class="block text-xs font-semibold text-gray-700 mb-2">Asunto</label>
                    <input v-model="subject" type="text" placeholder="Ej: Respuesta a su solicitud"
                      class="w-full h-12 px-4 rounded-2xl border border-gray-200 bg-gray-50 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition-all duration-300 focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-500/10">
                  </div>

                  <!-- Message -->
                  <div class="mb-6">
                    <label class="block text-xs font-semibold text-gray-700 mb-2">Mensaje</label>
                    <textarea v-model="message" rows="8" placeholder="Escriba su mensaje aquí..."
                      class="w-full px-4 py-3.5 rounded-2xl border border-gray-200 bg-gray-50 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition-all duration-300 focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-500/10 resize-y min-h-[160px]"></textarea>
                  </div>

                  <!-- Send button -->
                  <div class="flex flex-col-reverse sm:flex-row items-start sm:items-center justify-between gap-3 pt-5 border-t border-gray-100">
                    <div class="flex items-center gap-2 text-[11px] text-gray-400">
                      <span class="material-symbols-outlined notranslate text-sm">info</span>
                      Se enviará como <strong class="text-gray-600">soporte@ubiqueme.com</strong>
                    </div>
                    <button @click="sendEmail" :disabled="sending || !subject.trim() || !message.trim()"
                      class="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-orange-500 px-6 text-sm font-semibold text-white shadow-lg shadow-orange-500/25 transition-all duration-300 ease-out hover:bg-orange-600 hover:shadow-orange-500/35 hover:scale-[1.02] active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:shadow-none cursor-pointer">
                      <span v-if="sending"
                        class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      <span v-else class="material-symbols-outlined notranslate text-base">send</span>
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
.font-google-sans {
  font-family: 'Google Sans', sans-serif;
}

.material-symbols-outlined {
  font-variation-settings: 'FILL' 0, 'wght' 500, 'GRAD' 0, 'opsz' 24;
}

.overflow-y-auto {
  scrollbar-width: thin;
  scrollbar-color: rgba(156, 163, 175, 0.25) transparent;
}

.overflow-y-auto::-webkit-scrollbar {
  width: 4px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.25);
  border-radius: 2px;
}
</style>
