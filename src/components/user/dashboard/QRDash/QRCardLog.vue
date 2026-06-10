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

const reasonMap: Record<string, { label: string, icon: string, color: string, isWhatsApp?: boolean }> = {
  emergency: { label: 'EMERGENCIA', icon: 'emergency', color: 'text-rose-500' },
  communication: { label: 'CONTACTO', icon: 'chat', color: 'text-amber-500', isWhatsApp: true },
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
  <li class="group animate-fade-up">
    <!-- Chat message bubble (received-style) -->
    <div class="flex items-start gap-2.5">

      <!-- Avatar column -->
      <div class="shrink-0 pt-1">
        <div class="w-7 h-7 rounded-full bg-orange-500/20 border border-orange-500/20 flex items-center justify-center">
          <span class="material-symbols-outlined text-orange-400 text-[14px]">qr_code_scanner</span>
        </div>
      </div>

      <!-- Bubble -->
      <div class="flex-1 min-w-0 max-w-[85%] sm:max-w-[75%]">
        <div class="bg-[#1c1e22] border border-white/5 rounded-2xl rounded-tl-sm p-3.5 space-y-2.5 shadow-sm">

          <!-- Top row: interaction badge + location -->
          <div class="flex items-start justify-between gap-2">
            <div class="flex items-center gap-1.5 flex-wrap min-w-0">
              <!-- Interaction badge -->
              <div v-if="interactionDetail"
                class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[8px] font-black uppercase tracking-[0.15em]"
                :class="[
                  interactionDetail.color,
                  `${interactionDetail.color.replace('text-', 'bg-')}/10`,
                  `${interactionDetail.color.replace('text-', 'border-')}/20`
                ]">
                <!-- WhatsApp SVG icon for communication reason -->
                <svg v-if="interactionDetail.isWhatsApp" class="w-3 h-3 shrink-0" fill="currentColor"
                  viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                <span v-else class="material-symbols-outlined text-[11px] font-black">{{ interactionDetail.icon
                  }}</span>
                {{ interactionDetail.label }}
              </div>
            </div>

            <!-- Location -->
            <div v-if="scanMetrics.city || scanMetrics.country" class="shrink-0">
              <span class="text-[8px] font-black uppercase tracking-wider text-white/35 whitespace-nowrap">
                {{ scanMetrics.city }}{{ scanMetrics.city && scanMetrics.country ? ', ' : '' }}{{ scanMetrics.country }}
              </span>
            </div>
          </div>

          <!-- Message text (like a WhatsApp quote bubble) -->
          <div v-if="interaction?.message" class="bg-black/20 rounded-xl px-3 py-2.5 border-l-2 border-orange-500/30">
            <p class="text-white/80 text-[11px] leading-relaxed italic font-light tracking-wide">
              "{{ interaction.message }}"
            </p>
          </div>

          <!-- Evidence image -->
          <div v-if="img"
            class="relative rounded-xl overflow-hidden border border-white/5 bg-black/30 group/image cursor-pointer"
            @click="openImage(img)">
            <img :src="img" alt="Log evidence"
              class="w-full h-36 object-cover opacity-80 group-hover/image:opacity-100 group-hover/image:scale-[1.02] transition-all duration-500" />
            <div
              class="absolute top-2 right-2 bg-black/70 px-2 py-0.5 rounded-lg border border-white/10 text-[7px] text-white/40 font-black tracking-widest uppercase">
              Evidencia
            </div>
            <div
              class="absolute inset-0 flex items-center justify-center opacity-0 group-hover/image:opacity-100 transition-opacity duration-300">
              <div class="w-8 h-8 rounded-full bg-black/60 border border-white/10 flex items-center justify-center">
                <span class="material-symbols-outlined text-white/70 text-[16px]">zoom_in</span>
              </div>
            </div>
          </div>

          <!-- Map section -->
          <div v-if="scanMetrics.lat && scanMetrics.lon" class="space-y-1.5">
            <div class="flex items-center justify-between">
              <p class="text-white/25 text-[7px] font-black uppercase tracking-[0.15em] flex items-center gap-1">
                <span class="material-symbols-outlined text-[12px] text-amber-500/50">location_on</span>
                Ubicación aproximada
              </p>
              <button v-if="!isMapActive" @click="activateMap"
                class="text-[7px] font-black text-amber-500/60 uppercase tracking-[0.15em] hover:text-amber-500 transition-colors cursor-pointer">
                Cargar mapa
              </button>
            </div>

            <div class="relative w-full h-[180px] rounded-xl overflow-hidden border border-white/5 bg-black/30">
              <div v-if="!isMapActive" @click="activateMap"
                class="absolute inset-0 flex flex-col items-center justify-center gap-1.5 cursor-pointer group/map hover:bg-white/[0.02] transition-colors">
                <div
                  class="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/20 group-hover/map:scale-110 group-hover/map:bg-amber-500/20 transition-all duration-300">
                  <span class="material-symbols-outlined text-amber-500 text-[16px]">map</span>
                </div>
                <span class="text-[8px] text-white/25 font-black uppercase tracking-[0.1em]">Ver mapa interactivo</span>
              </div>
              <div :id="`map-${id}`" v-show="isMapActive" class="w-full h-full"></div>
            </div>
          </div>

        </div>

        <!-- Timestamp (below bubble, right-aligned like WA) -->
        <div class="text-right pr-1 mt-0.5">
          <span class="text-[9px] font-mono font-bold text-white/20 tracking-tight">
            {{ dateStr }}
          </span>
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
