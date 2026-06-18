<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#070b14]/80"
    @click.self="$emit('dismiss')">
    <div class="relative w-full max-w-lg bg-[#0c0c0c] border border-white/10 rounded-3xl p-6 sm:p-10 animate-fade-in">
      <!-- Header -->
      <div class="flex items-start gap-4 mb-8">
        <div
          class="w-12 h-12 shrink-0 bg-orange-500/10 border border-orange-500/20 rounded-2xl flex items-center justify-center">
          <svg class="w-6 h-6 text-orange-500" viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
          </svg>
        </div>
        <div class="flex-1 min-w-0">
          <h2 class="text-xl sm:text-2xl font-black text-white tracking-tight">
            ¡Bienvenido a Ubiqueme!
          </h2>
          <p class="text-white/50 text-sm font-medium mt-1 leading-relaxed">
            Introduzca el número de WhatsApp donde podrá recibir notificaciones cuando alguien
            escanee un código QR.
          </p>
        </div>
      </div>

      <!-- Form -->
      <div class="space-y-5">
        <!-- Country Code + Phone -->
        <div class="space-y-2">
          <label class="text-[10px] font-black text-white/50 uppercase tracking-[0.2em] ml-1">
            Número de WhatsApp
          </label>
          <div class="flex gap-2">
            <!-- Country selector -->
            <div class="relative shrink-0">
              <select v-model="selectedCountry"
                class="appearance-none w-[100px] h-14 bg-white/5 border border-white/20 hover:border-white/30 rounded-2xl text-white text-sm font-medium text-center focus:border-orange-500 focus:outline-none focus:bg-white/10 transition-all cursor-pointer">
                <option v-for="c in countries" :key="c.code" :value="c" class="bg-[#0c0c0c] text-white">
                  {{ c.flag }} {{ c.prefix }}
                </option>
              </select>
              <span class="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none text-xs">
                &#9660;
              </span>
            </div>

            <!-- Phone input -->
            <div class="relative flex-1">
              <input v-model="phoneNumber" type="tel" placeholder="55 1234 5678" @input="onPhoneInput"
                class="w-full h-14 px-5 bg-white/5 border border-white/20 hover:border-white/30 rounded-2xl text-white placeholder:text-white/40 focus:border-orange-500 focus:outline-none focus:bg-white/10 transition-all tracking-wider text-lg font-medium" />
            </div>
          </div>
          <p class="text-[11px] text-white/30 font-medium ml-1">
            {{ selectedCountry.flag }} {{ selectedCountry.name }}
          </p>
        </div>

        <!-- Save button -->
        <button @click="handleSave" :disabled="isSaving || !isValid"
          class="group w-full h-14 bg-orange-500 text-[#070b14] rounded-2xl font-black text-xs uppercase tracking-widest transition-all duration-300 hover:bg-white hover:shadow-[0_0_20px_rgba(249,115,22,0.4)] active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed">
          <span class="flex items-center gap-2" v-if="!isSaving">
            <span class="material-symbols-outlined notranslate text-lg">save</span>
            Guardar
          </span>
          <span v-else class="flex items-center gap-2">
            <span class="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin"></span>
            Guardando...
          </span>
        </button>
      </div>

      <!-- Footer -->
      <p class="mt-5 text-[10px] text-white/20 font-medium text-center leading-relaxed">
        Este número solo se usará para enviarle notificaciones de escaneo de sus códigos QR.
        No compartiremos su número con terceros.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { doc, updateDoc, getFirestore } from 'firebase/firestore'
import { useUserStore } from '@/stores/user'
import { toast } from 'vue-sonner'
import { parsePhoneNumber, getCountries, getCountryCallingCode } from 'libphonenumber-js'
import type { CountryCode } from 'libphonenumber-js'

const emit = defineEmits<{
  saved: []
  dismiss: []
}>()

const db = getFirestore()
const userStore = useUserStore()

interface Country {
  code: CountryCode
  flag: string
  name: string
  prefix: string
}

/**
 * Convert an ISO country code to a flag emoji.
 * Example: 'CL' → '🇨🇱'
 */
const getFlagEmoji = (countryCode: string): string => {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map((char) => 0x1f1e6 + char.charCodeAt(0) - 0x41)
  return String.fromCodePoint(...codePoints)
}

/** Full country name map (will fallback to code if not found) */
const countryNames: Record<string, string> = {
  MX: 'México', AR: 'Argentina', BO: 'Bolivia', CL: 'Chile',
  CO: 'Colombia', CR: 'Costa Rica', CU: 'Cuba', DO: 'Rep. Dominicana',
  EC: 'Ecuador', SV: 'El Salvador', GT: 'Guatemala', HN: 'Honduras',
  NI: 'Nicaragua', PA: 'Panamá', PY: 'Paraguay', PE: 'Perú',
  UY: 'Uruguay', VE: 'Venezuela', US: 'Estados Unidos', CA: 'Canadá',
  ES: 'España', FR: 'Francia', IT: 'Italia', DE: 'Alemania',
  GB: 'Reino Unido', PT: 'Portugal', NL: 'Países Bajos',
  BR: 'Brasil', JP: 'Japón', CN: 'China', IN: 'India',
  AU: 'Australia', NZ: 'Nueva Zelanda', ZA: 'Sudáfrica',
  RU: 'Rusia', KR: 'Corea del Sur', SE: 'Suecia', NO: 'Noruega',
  DK: 'Dinamarca', FI: 'Finlandia', IE: 'Irlanda', CH: 'Suiza',
  AT: 'Austria', BE: 'Bélgica', PL: 'Polonia', CZ: 'Rep. Checa',
  GR: 'Grecia', HU: 'Hungría', RO: 'Rumanía', UA: 'Ucrania',
  IL: 'Israel', AE: 'Emiratos Árabes', SA: 'Arabia Saudita',
  TR: 'Turquía', EG: 'Egipto', NG: 'Nigeria', KE: 'Kenia',
  PH: 'Filipinas', ID: 'Indonesia', MY: 'Malasia', SG: 'Singapur',
  TH: 'Tailandia', VN: 'Vietnam', TW: 'Taiwán', HK: 'Hong Kong',
}

const countries: Country[] = getCountries()
  .map((code) => ({
    code,
    flag: getFlagEmoji(code),
    name: countryNames[code] || code,
    prefix: `+${getCountryCallingCode(code)}`,
  }))
  .sort((a, b) => a.name.localeCompare(b.name))

const selectedCountry = ref<Country>(countries.find((c) => c.code === 'MX') || countries[0]!)
const phoneNumber = ref('')
const isSaving = ref(false)

const isValid = computed(() => {
  const raw = phoneNumber.value
  if (!raw || !/^\d{4,}$/.test(raw)) return false
  try {
    const phone = parsePhoneNumber(raw, selectedCountry.value.code)
    return phone.isValid()
  } catch {
    return false
  }
})

const onPhoneInput = () => {
  // Strip non-digits
  phoneNumber.value = phoneNumber.value.replace(/\D/g, '')
}

/**
 * Formats to WhatsApp-friendly format (E.164 without the +).
 * Example: +52 5512345678 → 525512345678
 * Example: +54 11 1234 5678 → 549112345678 (includes Argentina "9")
 */
const formatForWhatsApp = (): string => {
  try {
    const phone = parsePhoneNumber(phoneNumber.value, selectedCountry.value.code)
    return phone.format('E.164').replace('+', '')
  } catch {
    // Fallback: just concatenate (shouldn't happen since we validate first)
    const rawPrefix = selectedCountry.value.prefix.replace('+', '')
    return `${rawPrefix}${phoneNumber.value}`
  }
}

const handleSave = async () => {
  if (!isValid.value) {
    toast.error('El número no es válido para el país seleccionado.')
    return
  }

  const userId = userStore.getUserId
  if (!userId) {
    toast.error('Error de autenticación. Intente de nuevo.')
    return
  }

  isSaving.value = true
  try {
    const phone = formatForWhatsApp()
    const userRef = doc(db, 'users', userId)
    await updateDoc(userRef, { phone })

    userStore.setUserPhone(phone)
    toast.success('Número guardado exitosamente. Ya puede recibir notificaciones.')
    emit('saved')
  } catch (error: unknown) {
    const err = error as { message?: string }
    toast.error(`Error al guardar: ${err.message || 'Desconocido'}`)
  } finally {
    isSaving.value = false
  }
}
</script>

<style scoped>
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px) scale(0.98);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.animate-fade-in {
  animation: fadeIn 0.35s ease-out forwards;
}

/* Remove default select arrow in IE */
select::-ms-expand {
  display: none;
}
</style>
