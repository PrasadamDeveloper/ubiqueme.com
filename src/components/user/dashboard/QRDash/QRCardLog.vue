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
  informative: { label: 'INFO', icon: 'info', color: 'text-sky-400' },
  other: { label: 'PERSONALIZADO', icon: 'edit_note', color: 'text-orange-400' }
}

const interactionDetail = computed(() => {
  if (!props.interaction) return null
  return reasonMap[props.interaction.reason] || { label: 'ESCANEADO', icon: 'chat_bubble', color: 'text-white/60' }
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
    class="group relative bg-[#151414] border border-white/10 rounded-[1.5rem] hover:border-orange-500/40 transition-all duration-500 overflow-hidden font-google-sans">

    <!-- Grid Pattern Background -->
    <div class="absolute inset-0 z-0 opacity-[0.04] pointer-events-none hidden"
      style="background-image: linear-gradient(rgba(255, 255, 255, 1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 1) 1px, transparent 1px); background-size: 24px 24px;">
    </div>

    <!-- Orange Glow -->
    <div
      class="absolute top-0 left-0 w-full h-full z-0 opacity-10 pointer-events-none bg-gradient-to-br from-orange-500/10 via-transparent to-transparent">
    </div>

    <!-- Content -->
    <div class="relative z-10 p-5 space-y-4">

      <!-- 1️⃣ HEADER ROW: Interaction type badge + Location + Date -->
      <div class="flex items-start justify-between gap-3">
        <div class="flex items-center gap-2 flex-wrap min-w-0">
          <!-- Interaction Badge -->
          <div v-if="interactionDetail"
            class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[9px] font-black uppercase tracking-[0.2em]"
            :class="[interactionDetail.color, `${interactionDetail.color.replace('text-', 'bg-')}/10`, `${interactionDetail.color.replace('text-', 'border-')}/20`]">
            <span class="material-symbols-outlined text-[14px] font-black">{{ interactionDetail.icon }}</span>
            {{ interactionDetail.label }}
          </div>

          <!-- Location Badge -->
          <div v-if="scanMetrics.city || scanMetrics.country"
            class="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-wider text-white/50">
            <span class="material-symbols-outlined text-[12px] text-orange-500/60">location_on</span>
            <span>{{ scanMetrics.city }}{{ scanMetrics.city && scanMetrics.country ? ', ' : '' }}{{ scanMetrics.country
              }}</span>
          </div>
        </div>

        <!-- Date -->
        <div class="shrink-0 text-right">
          <span class="text-[10px] font-mono font-bold text-white/30 tracking-tight whitespace-nowrap">
            {{ dateStr }}
          </span>
        </div>
      </div>

      <!-- 2️⃣ EVIDENCE IMAGE -->
      <div v-if="img"
        class="relative rounded-xl overflow-hidden border border-white/10 bg-black/40 group/image cursor-pointer"
        @click="openImage(img)">
        <img :src="img" alt="Log evidence"
          class="w-full h-48 object-cover opacity-80 group-hover/image:opacity-100 group-hover/image:scale-[1.02] transition-all duration-500" />
        <div
          class="absolute top-3 right-3 bg-black/70 px-2.5 py-1 rounded-lg border border-white/10 text-[8px] text-white/50 font-black tracking-widest uppercase">
          Evidencia
        </div>
        <!-- Zoom icon overlay -->
        <div
          class="absolute inset-0 flex items-center justify-center opacity-0 group-hover/image:opacity-100 transition-opacity duration-300">
          <div
            class="w-10 h-10 rounded-full bg-black/60 border border-white/10 flex items-center justify-center backdrop-blur-none">
            <span class="material-symbols-outlined text-white/70 text-lg">zoom_in</span>
          </div>
        </div>
      </div>

      <!-- 3️⃣ MESSAGE -->
      <div v-if="interaction?.message"
        class="bg-[#0c0500] rounded-xl p-4 border-l-2 border-orange-500/30 border border-white/5">
        <p class="text-white/70 text-[12px] leading-relaxed italic tracking-wide">
          "{{ interaction.message }}"
        </p>
      </div>

      <!-- 4️⃣ MAP SECTION (On-Demand) -->
      <div v-if="scanMetrics.lat && scanMetrics.lon" class="space-y-2">
        <div class="flex items-center justify-between">
          <p class="text-white/30 text-[9px] font-black uppercase tracking-[0.2em] flex items-center gap-1">
            <span class="material-symbols-outlined text-[14px] text-amber-500/60">location_on</span>
            Ubicación aproximada
          </p>
          <button v-if="!isMapActive" @click="activateMap"
            class="text-[9px] font-black text-amber-500/70 uppercase tracking-[0.2em] hover:text-amber-500 transition-colors cursor-pointer">
            Cargar mapa
          </button>
        </div>

        <div class="relative w-full h-[260px] rounded-xl overflow-hidden border border-white/10 bg-black/40">
          <!-- Placeholder -->
          <div v-if="!isMapActive" @click="activateMap"
            class="absolute inset-0 flex flex-col items-center justify-center gap-2.5 cursor-pointer group/map hover:bg-white/[0.02] transition-colors">
            <div
              class="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/20 group-hover/map:scale-110 group-hover/map:bg-amber-500/20 transition-all duration-300">
              <span class="material-symbols-outlined text-amber-500 text-xl">map</span>
            </div>
            <span class="text-[9px] text-white/30 font-black uppercase tracking-[0.15em]">Ver mapa interactivo</span>
          </div>

          <!-- Leaflet Container -->
          <div :id="`map-${id}`" v-show="isMapActive" class="w-full h-full"></div>
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
