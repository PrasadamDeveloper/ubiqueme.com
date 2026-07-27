<script lang="ts" setup>
import type { IQRLog } from '@/interfaces/IPublicQR'
import type { Timestamp } from 'firebase/firestore'
import { useImageStore } from '@/stores/imageStore';
import { computed } from 'vue'
import { ref } from 'vue'
import DisclaimerPopup from '@/components/ui/DisclaimerPopup.vue'
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

const formatDate = (timestamp?: Timestamp) => {
  if (!timestamp || typeof timestamp.toDate !== 'function') return '---'
  const d = timestamp.toDate()
  return `${d.toLocaleString('es-MX', { dateStyle: 'short', 'timeStyle': 'short' })}`
}

const dateStr = computed(() => formatDate(props.scanDate))

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

const scannerPhoneFormated = (scannerPhone: string | undefined) => {
  if (!scannerPhone) return 'Número no disponible';
  const countryCode = scannerPhone.slice(0, 2).padStart(3, '+');

  return countryCode + '****' + scannerPhone.slice(7)
}

const showPhone = ref(false)

const countryFlag = computed(() => {
  const countryMap: Record<string, string> = {
    'México': '🇲🇽', 'Mexico': '🇲🇽',
    'Estados Unidos': '🇺🇸', 'United States': '🇺🇸',
    'Canadá': '🇨🇦', 'Canada': '🇨🇦',
    'Argentina': '🇦🇷', 'Colombia': '🇨🇴', 'Chile': '🇨🇱',
    'Perú': '🇵🇪', 'Peru': '🇵🇪', 'Brasil': '🇧🇷', 'Brazil': '🇧🇷',
    'Ecuador': '🇪🇨', 'Venezuela': '🇻🇪', 'Guatemala': '🇬🇹',
    'Costa Rica': '🇨🇷', 'Panamá': '🇵🇦', 'Panama': '🇵🇦',
    'República Dominicana': '🇩🇴', 'Dominican Republic': '🇩🇴',
    'Puerto Rico': '🇵🇷', 'Honduras': '🇭🇳', 'El Salvador': '🇸🇻',
    'Nicaragua': '🇳🇮', 'Bolivia': '🇧🇴', 'Paraguay': '🇵🇾',
    'Uruguay': '🇺🇾', 'España': '🇪🇸', 'Spain': '🇪🇸'
  }
  if (props.scanMetrics?.country) {
    return countryMap[props.scanMetrics.country] || ''
  }
  // Fallback: try to match by phone country code
  if (props.scannerPhone) {
    const code = props.scannerPhone.slice(0, 2)
    const codeMap: Record<string, string> = {
      '52': '🇲🇽', '1': '🇺🇸', '34': '🇪🇸', '54': '🇦🇷', '57': '🇨🇴',
      '56': '🇨🇱', '51': '🇵🇪', '55': '🇧🇷', '593': '🇪🇨', '58': '🇻🇪',
      '502': '🇬🇹', '506': '🇨🇷', '507': '🇵🇦', '504': '🇭🇳',
      '503': '🇸🇻', '505': '🇳🇮', '591': '🇧🇴', '595': '🇵🇾', '598': '🇺🇾'
    }
    return codeMap[code] || ''
  }
  return ''
})

const fullPhone = computed(() => {
  if (!props.scannerPhone) return ''
  const code = props.scannerPhone.slice(0, 2)
  const rest = props.scannerPhone.slice(2)
  return `+${code} ${rest}`
})

const showDisclaimer = ref(false)
const disclaimerUrl = ref('')

const openDisclaimer = (phone: string) => {
  disclaimerUrl.value = `https://wa.me/${phone}`
  showDisclaimer.value = true
}
</script>

<template>
  <li class="group animate-fade-up mb-10">
    <!-- Chat message bubble (received-style) -->
    <div class="flex items-start gap-2.5 ">

      <!-- Avatar column -->
      <div class="shrink-0 pt-1">
        <div class="w-8 h-8 rounded-xl p-1 bg-green-100 border border-green-200 flex items-center justify-center">
          <v-icon name="bi-whatsapp" class="text-green-600" />
        </div>
      </div>

      <!-- Bubble -->
      <div class="flex-1 min-w-0 max-w-[85%] sm:max-w-[75%] ">

        <div class="log-card border border-slate-200 rounded-2xl rounded-tl-sm p-2.5 space-y-2.5 shadow-sm">

          <div class="flex gap-2 items-center">
            <span class="material-symbols-outlined notranslate text-green-600">contact_page</span>
            <div class="flex items-center gap-1">
              <small
                class="text-xs font-google-sans font-bold text-green-800 bg-green-100 border border-green-200 p-1 rounded-2xl flex items-center gap-0.5">
                <span v-if="countryFlag" class="text-sm leading-none">{{ countryFlag }}</span>
                <span class="leading-none">{{ showPhone && fullPhone ? fullPhone : scannerPhoneFormated(scannerPhone)
                  }}</span>
              </small>
              <button v-if="scannerPhone" @click="showPhone = !showPhone"
                class="p-1 rounded-lg hover:bg-green-100 transition-colors cursor-pointer border border-green-200 flex items-center justify-center"
                :title="showPhone ? 'Ocultar número' : 'Mostrar número completo'">
                <span class="material-symbols-outlined notranslate text-[12px] text-green-600/70">{{ showPhone ? 'visibility_off' :
                  'visibility' }}</span>
              </button>
            </div>
          </div>

          <!-- Message text (like a WhatsApp quote bubble) -->
          <div v-if="interaction?.message" class="bg-slate-100 rounded-xl px-3 py-2.5 relative">
            <p class="text-slate-700 text-[11px] leading-relaxed italic  font-poppins tracking-wide mb-3">
              {{ interaction.message }}
            </p>
            <span class="text-[9px] font-poppins font-bold text-slate-400 tracking-tight absolute bottom-1 right-2 ">
              {{ dateStr }}
            </span>
          </div>

          <!-- Evidence image -->
          <div v-if="img"
            class="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-100 group/image cursor-pointer"
            @click="openImage(img)">
            <img :src="img" alt="Log evidence"
              class="w-full h-36 object-cover opacity-80 group-hover/image:opacity-100 group-hover/image:scale-[1.02] transition-all duration-500" />
            <div
              class="absolute top-2 right-2 bg-white/90 px-2 py-0.5 rounded-lg border border-slate-200 text-[7px] text-slate-500 font-black tracking-widest uppercase">
              Evidencia
            </div>
            <div
              class="absolute inset-0 flex items-center justify-center opacity-0 group-hover/image:opacity-100 transition-opacity duration-300">
              <div class="w-8 h-8 rounded-full bg-white/80 border border-slate-200 flex items-center justify-center">
                <span class="material-symbols-outlined notranslate text-slate-600 text-[16px]">zoom_in</span>
              </div>
            </div>
          </div>

          <!-- Map section -->
          <div v-if="scanMetrics.lat && scanMetrics.lon" class="space-y-1.5">
            <div class="flex items-center justify-between">
              <p class="text-slate-400 text-[7px] font-black uppercase tracking-[0.15em] flex items-center gap-1">
                <span class="material-symbols-outlined notranslate text-[12px] text-amber-600/70">location_on</span>
                Ubicación aproximada
              </p>
              <button v-if="!isMapActive" @click="activateMap"
                class="text-[7px] font-black text-amber-600/70 uppercase tracking-[0.15em] hover:text-amber-600 transition-colors cursor-pointer">
                Cargar mapa
              </button>
            </div>

            <div class="relative w-full h-[180px] rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
              <div v-if="!isMapActive" @click="activateMap"
                class="absolute inset-0 flex flex-col items-center justify-center gap-1.5 cursor-pointer group/map hover:bg-slate-50 transition-colors">
                <div
                  class="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center border border-amber-200 group-hover/map:scale-110 group-hover/map:bg-amber-200 transition-all duration-300">
                  <span class="material-symbols-outlined notranslate text-amber-600 text-[16px]">map</span>
                </div>
                <span class="text-[8px] text-slate-400 font-black uppercase tracking-[0.1em]">Ver mapa interactivo</span>
              </div>
              <div :id="`map-${id}`" v-show="isMapActive" class="w-full h-full"></div>
            </div>
          </div>
          <div class="flex items-center justify-end gap-2">
            <button v-if="scannerPhone" @click="openDisclaimer(scannerPhone)"
              class="bg-transparent border border-green-600/60 text-green-700 text-[9px] font-bold rounded-lg px-3 py-1 hover:bg-green-50 transition-colors inline-flex items-center cursor-pointer">
              Contactar a {{ scannerPhoneFormated(scannerPhone) }}
            </button>
            <span v-else
              class="bg-transparent border border-green-400/50 text-slate-500 text-[9px] font-bold rounded-lg px-3 py-1 hover:bg-green-50 transition-colors inline-flex items-center">
              Contacto no disponible
            </span>
          </div>


        </div>



      </div>

    </div>
  </li>

  <DisclaimerPopup v-if="showDisclaimer" :whatsapp-url="disclaimerUrl" @close="showDisclaimer = false" />
</template>

<style scoped>
.material-symbols-outlined {
  font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}

.map-container {
  background: rgba(0, 0, 0, 0.2);
  z-index: 1;
}

.log-card {

  background-color: #ffffff;
  background-image: url("data:image/svg+xml,%3Csvg width='20' height='12' viewBox='0 0 20 12' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M6 12c0-.622-.095-1.221-.27-1.785A5.982 5.982 0 0 0 10 12c1.67 0 3.182-.683 4.27-1.785A5.998 5.998 0 0 0 14 12h2a4 4 0 0 1 4-4V6c-1.67 0-3.182.683-4.27 1.785C15.905 7.22 16 6.622 16 6c0-.622-.095-1.221-.27-1.785A5.982 5.982 0 0 0 20 6V4a4 4 0 0 1-4-4h-2c0 .622.095 1.221.27 1.785A5.982 5.982 0 0 0 10 0C8.33 0 6.818.683 5.73 1.785 5.905 1.22 6 .622 6 0H4a4 4 0 0 1-4 4v2c1.67 0 3.182.683 4.27 1.785A5.998 5.998 0 0 1 4 6c0-.622.095-1.221.27-1.785A5.982 5.982 0 0 1 0 6v2a4 4 0 0 1 4 4h2zm-4 0a2 2 0 0 0-2-2v2h2zm16 0a2 2 0 0 1 2-2v2h-2zM0 2a2 2 0 0 0 2-2H0v2zm20 0a2 2 0 0 1-2-2h2v2zm-10 8a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm0-2a2 2 0 1 0 0-4 2 2 0 0 0 0 4z' fill='%23e2e8f0' fill-opacity='0.6' fill-rule='evenodd'/%3E%3C/svg%3E");
}
</style>
