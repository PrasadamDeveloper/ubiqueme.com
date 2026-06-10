<script lang="ts" setup>
import type { IQRLog } from '@/interfaces/IPublicQR'
import { useImageStore } from '@/stores/imageStore';
import { useUserStore } from '@/stores/user';
import { computed, onMounted } from 'vue'
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for Leaflet icons in Vite
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;


const props = defineProps<IQRLog>()

const formatDate = (timestamp?: any) => {
  if (!timestamp || typeof timestamp.toDate !== 'function') return '---'
  const d = timestamp.toDate()
  return `${d.getDate().toString().padStart(2, '0')} ${d.toLocaleString('es-MX', { month: 'short' })} ${d.getHours()}:${d.getMinutes().toString().padStart(2, '0')}`
}

const dateStr = computed(() => formatDate(props.scanDate))

const reasonMap: Record<string, { label: string, icon: string, color: string }> = {
  emergency: { label: 'EMERGENCIA', icon: 'emergency', color: 'text-rose-500' },
  communication: { label: 'CONTACTO', icon: 'chat', color: 'text-amber-500' },
  informative: { label: 'INFO', icon: 'info', color: 'text-white/40' },
  other: { label: 'PERSONALIZADO', icon: 'edit_note', color: 'text-white/60' }
}

const interactionDetail = computed(() => {
  if (!props.interaction) return null
  return reasonMap[props.interaction.reason] || { label: 'ESCANEADO', icon: 'chat_bubble', color: 'text-white/40' }
})

const imageStore = useImageStore();

const openImage = (img: string) => {
  imageStore.clearImages();
  imageStore.setImages(img);
  imageStore.showImage();
}

const isMapActive = ref(false);

const activateMap = () => {
  if (isMapActive.value) return;
  isMapActive.value = true;

  // Esperamos a que Vue pinte el div del mapa antes de inicializar Leaflet
  setTimeout(() => {
    if (props.scanMetrics.lat && props.scanMetrics.lon) {
      const lat = parseFloat(props.scanMetrics.lat);
      const lon = parseFloat(props.scanMetrics.lon);

      const map = L.map(`map-${props.id}`).setView([lat, lon], 11);
      map.attributionControl.setPrefix(false);

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 13,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
      }).addTo(map);

      L.circle([lat, lon], {
        color: 'red',
        fillColor: '#f03',
        fillOpacity: 0.5,
        radius: 4500
      }).addTo(map);
    }
  }, 100); // Pequeño delay para asegurar el renderizado del DOM
}

import { ref } from 'vue'
</script>

<template>
  <li
    class="group relative bg-[#0f0f11] border border-white/5 rounded-2xl p-5 transition-all duration-300 hover:bg-black/60 hover:border-white/10 font-google-sans">

    <div class="flex flex-col space-y-4">

      <!-- 1️⃣ HEADER: Tipo de interacción y Ubicación -->
      <div class="flex justify-between items-start">
        <div class="flex flex-col">
          <div v-if="interactionDetail" class="flex items-center gap-1.5 mb-1" :class="interactionDetail.color">
            <span class="material-symbols-outlined text-[16px] font-black">{{ interactionDetail.icon }}</span>
            <span class="text-[10px] font-black uppercase tracking-[0.2em]">{{ interactionDetail.label }}</span>
          </div>
          <p class="text-white/90 text-[12px] font-normal font-poppins">
            <span class="font-bold font-google-sans text-white/40">ZONA:</span> {{ scanMetrics.city }}, {{
              scanMetrics.country }}
          </p>
        </div>
        <div class="text-right">
          <small class="text-white text-[10px] uppercase font-poppins font-bold tracking-wider">{{ new
            Date(props.scanDate.toMillis()).toLocaleString() }}</small>
        </div>
      </div>

      <!-- 2️⃣ IMAGEN DE EVIDENCIA -->
      <div v-if="img" class="w-full h-48 rounded-xl overflow-hidden border border-white/10 bg-black/40 relative">
        <img :src="img" @click="openImage(img)" alt="Log evidence"
          class="w-full h-full object-cover opacity-90 hover:opacity-100 transition-all cursor-pointer" />
        <div
          class="absolute top-2 right-2 bg-black/60 px-2 py-1 rounded-md border border-white/10 text-[9px] text-white/60 font-bold tracking-widest uppercase">
          Evidencia
        </div>
      </div>

      <!-- 3️⃣ MENSAJE -->
      <div v-if="interaction?.message" class="bg-white/5 rounded-xl p-4 border border-white/10">
        <p class="text-white/70 text-[12px] leading-relaxed italic">
          "{{ interaction.message }}"
        </p>
      </div>

      <!-- 4️⃣ SECCIÓN DE MAPA (On-Demand) -->
      <div v-if="scanMetrics.lat && scanMetrics.lon" class="space-y-2">
        <div class="flex items-center justify-between">
          <p class="text-white/40 text-[10px] font-normal flex items-center gap-1 ">
            <span class="material-symbols-outlined text-[16px] font-black">location_on</span>
            Ubicación aproximada
          </p>
          <button v-if="!isMapActive" @click="activateMap"
            class="text-[9px] font-black text-amber-500 uppercase tracking-widest hover:underline transition-all cursor-pointer">
            Ver Mapa de Ubicación
          </button>
        </div>

        <div class="relative w-full h-[280px] rounded-xl overflow-hidden border border-white/10 bg-black/40">
          <!-- Placeholder State -->
          <div v-if="!isMapActive" @click="activateMap"
            class="absolute inset-0 flex flex-col items-center justify-center gap-3 cursor-pointer group/map hover:bg-white/2 transition-colors">
            <div
              class="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/20 group-hover/map:scale-110 group-hover/map:bg-amber-500/20 transition-all">
              <span class="material-symbols-outlined text-amber-500 text-2xl">location_on</span>
            </div>
            <span
              class="text-[9px] text-white/30 font-black uppercase tracking-[0.2em] group-hover/map:text-white/50">Cargar
              Mapa Interactivo</span>
          </div>

          <!-- Leaflet Container -->
          <div :id="`map-${id}`" v-show="isMapActive" class="w-full h-full "></div>
        </div>
      </div>

    </div>
  </li>
</template>

<style scoped>
.material-symbols-outlined {
  font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}

.map-container {
  background: rgba(0, 0, 0, 0.2);
  z-index: 1;
}
</style>
