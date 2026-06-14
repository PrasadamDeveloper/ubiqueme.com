<script lang="ts" setup>
import { ref } from 'vue'
import type { INotification } from '@/interfaces/INotification'

const notifications = ref<INotification[]>([
  {
    id: 1,
    type: 'qr_scan',
    title: 'Nuevo escaneo de QR',
    message: 'Un usuario escaneó el código QR de "Macbook" desde iPhone 14 Pro, México.',
    date: 'Hace 5 minutos',
    read: false,
  },
  {
    id: 2,
    type: 'system',
    title: 'Actualización del sistema',
    message: 'Hemos actualizado nuestros servidores para mejorar la velocidad de carga de sus códigos QR.',
    date: 'Hace 2 horas',
    read: false,
  },
  {
    id: 3,
    type: 'billing',
    title: 'Renovación exitosa',
    message: 'Su código QR "Tarjeta Personal" ha sido renovado exitosamente por 1 mes.',
    date: 'Ayer',
    read: true,
  },
  {
    id: 4,
    type: 'qr_scan',
    title: 'Nuevo escaneo de QR',
    message: 'Un usuario escaneó el código QR de "Menú Restaurante" desde Android, Colombia.',
    date: 'Hace 2 días',
    read: true,
  },
])

const getIconColor = (type: string) => {
  switch (type) {
    case 'qr_scan':
      return 'text-green-400 bg-green-500/10 border-green-500/20'
    case 'system':
      return 'text-blue-400 bg-blue-500/10 border-blue-500/20'
    case 'billing':
      return 'text-purple-400 bg-purple-500/10 border-purple-500/20'
    default:
      return 'text-gray-400 bg-gray-500/10 border-gray-500/20'
  }
}
</script>

<template>
  <div class="w-full max-w-7xl mx-auto font-google-sans">
    <div class="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h2 class="text-2xl font-bold text-white mb-1">Notificaciones</h2>
        <p class="text-sm text-gray-400">Manténgase al tanto de la actividad de sus códigos QR.</p>
      </div>
      <button
        class="text-sm px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white transition cursor-pointer border border-white/5 w-full sm:w-auto text-center"
      >
        Marcar todas como leídas
      </button>
    </div>

    <div class="space-y-3">
      <div
        v-for="notif in notifications"
        :key="notif.id"
        :class="[
          'p-4 rounded-xl border transition-all flex gap-4 items-start',
          notif.read
            ? 'bg-[#0f0f11]/50 border-white/5'
            : 'bg-[#0f0f11] border-white/10',
        ]"
      >
        <!-- Icon -->
        <div
          :class="[
            'w-10 h-10 rounded-full flex items-center justify-center shrink-0 border',
            getIconColor(notif.type),
          ]"
        >
          <svg
            v-if="notif.type === 'qr_scan'"
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm14 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
            />
          </svg>
          <svg
            v-else-if="notif.type === 'system'"
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <svg
            v-else-if="notif.type === 'billing'"
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
            />
          </svg>
        </div>

        <!-- Content -->
        <div class="flex-1">
          <div class="flex justify-between items-start mb-1">
            <h4 :class="['text-sm font-semibold', notif.read ? 'text-gray-300' : 'text-white']">
              {{ notif.title }}
            </h4>
            <span class="text-xs text-gray-500 whitespace-nowrap ml-2">{{ notif.date }}</span>
          </div>
          <p
            :class="['text-[13px] leading-relaxed', notif.read ? 'text-gray-500' : 'text-gray-400']"
          >
            {{ notif.message }}
          </p>
        </div>

        <!-- Status indicator (unread dot) -->
        <div v-if="!notif.read" class="flex items-center justify-center shrink-0 w-4 h-4 ml-1">
          <div class="w-2 h-2 rounded-full bg-amber-500"></div>
        </div>
      </div>
    </div>
  </div>
</template>
