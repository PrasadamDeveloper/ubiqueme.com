<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#070b14]/80"
    @click.self="$emit('dismiss')">
    <div class="relative w-full max-w-lg bg-[#0c0c0c] border border-white/10 rounded-3xl p-6 sm:p-10 animate-fade-in">

      <!-- ═══════════════════════════════════════════════════════
           STEP 1 — Phone input
           ═══════════════════════════════════════════════════════ -->
      <template v-if="step === 1">
        <!-- Header -->
        <div class="flex items-start gap-4 mb-8">
          <div
            class="flex items-center justify-center w-12 h-12 border shrink-0 bg-orange-500/10 border-orange-500/20 rounded-2xl">
            <svg class="w-6 h-6 text-orange-500" viewBox="0 0 24 24" fill="currentColor">
              <path
                d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
            </svg>
          </div>
          <div class="flex-1 min-w-0">
            <h2 class="text-xl font-black tracking-tight text-white sm:text-2xl">
              ¡Bienvenido a Ubiqueme!
            </h2>
            <p class="mt-1 text-sm font-medium leading-relaxed text-white/50">
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
              <!-- Country code input with suggestions -->
              <div class="relative shrink-0">
                <!-- Input for typing country code -->
                <input v-model="countryCodeSearch" type="text" inputmode="numeric" placeholder="+52"
                  @input="onCountrySearch" @focus="suggestionsOpen = true" @blur="closeSuggestions"
                  class="w-[110px] h-14 px-3 bg-white/5 border border-white/20 hover:border-white/30 rounded-2xl text-white text-sm font-medium text-center focus:border-orange-500 focus:outline-none focus:bg-white/10 transition-all placeholder:text-white/40"
                  v-if="!selectedCountry || editingCountry" />

                <!-- Chip when country is selected -->
                <button v-else @click="editCountry" type="button"
                  class="flex items-center gap-1.5 h-14 px-3 bg-white/5 border border-white/20 hover:border-white/30 rounded-2xl text-white text-sm font-medium cursor-pointer transition-all hover:bg-white/10">
                  <span class="text-lg">{{ selectedCountry.flag }}</span>
                  <span class="font-medium tracking-wider">{{ selectedCountry.prefix }}</span>
                  <span class="text-xs text-white/30 material-symbols-outlined notranslate">expand_more</span>
                </button>

                <!-- Suggestions dropdown -->
                <div v-if="suggestionsOpen && filteredCountries.length"
                  class="absolute z-50 mt-1 left-0 min-w-[240px] bg-[#151515] border border-white/10 rounded-2xl shadow-xl overflow-hidden max-h-48 overflow-y-auto">
                  <button v-for="c in filteredCountries" :key="c.code" @mousedown.prevent="selectCountry(c)"
                    class="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/10 transition-colors text-white text-sm text-left">
                    <span class="text-lg shrink-0">{{ c.flag }}</span>
                    <span class="font-medium truncate">{{ c.name }}</span>
                    <span class="ml-auto text-white/40 shrink-0">{{ c.prefix }}</span>
                  </button>
                </div>
              </div>

              <!-- Phone input -->
              <div class="relative flex-1">
                <input ref="phoneInput" v-model="phoneNumber" type="tel" placeholder="55 1234 5678"
                  @input="onPhoneInput" :disabled="!selectedCountry"
                  class="w-full px-5 text-lg font-medium tracking-wider text-white transition-all border h-14 bg-white/5 border-white/20 hover:border-white/30 rounded-2xl placeholder:text-white/40 focus:border-orange-500 focus:outline-none focus:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed" />
              </div>
            </div>
            <p v-if="selectedCountry" class="text-[11px] text-white/30 font-medium ml-1">
              {{ selectedCountry.flag }} {{ selectedCountry.name }}
            </p>
          </div>

          <!-- Send OTP button -->
          <button @click="handleSendOtp" :disabled="isSendingOtp || !isValid"
            class="group w-full h-14 bg-orange-500 text-[#070b14] rounded-2xl font-black text-xs uppercase tracking-widest transition-all duration-300 hover:bg-white hover:shadow-[0_0_20px_rgba(249,115,22,0.4)] active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed">
            <span class="flex items-center gap-2" v-if="!isSendingOtp">
              <span class="text-lg material-symbols-outlined notranslate">send</span>
              Enviar código
            </span>
            <span v-else class="flex items-center gap-2">
              <span class="w-5 h-5 border-2 rounded-full border-black/20 border-t-black animate-spin"></span>
              Enviando...
            </span>
          </button>
        </div>
      </template>

      <!-- ═══════════════════════════════════════════════════════
           STEP 2 — OTP verification
           ═══════════════════════════════════════════════════════ -->
      <template v-else-if="step === 2">
        <!-- Header -->
        <div class="flex items-start gap-4 mb-8">
          <div
            class="flex items-center justify-center w-12 h-12 border shrink-0 bg-green-500/10 border-green-500/20 rounded-2xl">
            <span class="text-3xl text-green-500 material-symbols-outlined notranslate">lock</span>
          </div>
          <div class="flex-1 min-w-0">
            <h2 class="text-xl font-black tracking-tight text-white sm:text-2xl">
              Verifique su número
            </h2>
            <p class="mt-1 text-sm font-medium leading-relaxed text-white/50">
              Hemos enviado un código de verificación de 6 dígitos al número
              <span class="font-bold text-white/70">{{ selectedCountry.prefix }} {{ phoneNumber }}</span>
              por WhatsApp. Introduzcalo abajo para confirmar.
            </p>
          </div>
        </div>

        <!-- Code input -->
        <div class="space-y-5">
          <div class="space-y-2">
            <label class="text-[10px] font-black text-white/50 uppercase tracking-[0.2em] ml-1">
              Código de verificación
            </label>
            <input v-model="otpCode" type="text" inputmode="numeric" maxlength="6" placeholder="••••••"
              @input="onOtpInput"
              class="w-full h-14 px-5 bg-white/5 border border-white/20 hover:border-white/30 rounded-2xl text-white placeholder:text-white/40 focus:border-orange-500 focus:outline-none focus:bg-white/10 transition-all tracking-[0.5em] text-center text-2xl font-black"
              autofocus />
          </div>

          <!-- Verify button -->
          <button @click="handleVerifyOtp" :disabled="isVerifying || otpCode.length !== 6"
            class="group w-full h-14 bg-orange-500 text-[#070b14] rounded-2xl font-black text-xs uppercase tracking-widest transition-all duration-300 hover:bg-white hover:shadow-[0_0_20px_rgba(249,115,22,0.4)] active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed">
            <span class="flex items-center gap-2" v-if="!isVerifying">
              <span class="text-lg material-symbols-outlined notranslate">verified</span>
              Verificar
            </span>
            <span v-else class="flex items-center gap-2">
              <span class="w-5 h-5 border-2 rounded-full border-black/20 border-t-black animate-spin"></span>
              Verificando...
            </span>
          </button>

          <!-- Resend link -->
          <div class="text-center flex flex-col items-center gap-2.5">
            <small class="text-white/40">
              ¿No recibó el código?
            </small>
            <button @click="handleResendOtp" :disabled="isSendingOtp"
              class="text-xs  transition-colors text-white/40 disabled:opacity-30 group">
              <span
                class="group-hover:text-slate-200 group-hover:ring group-hover:ring-offset-white shadow-white group-hover:shadow-sm transition-shadow duration-400 ease-out  px-1 py-1.5 rounded-lg border border-gray-500 bg-[#0F0F0F]    cursor-pointer font-google-sans font-medium">Enviar
                de
                nuevo</span>
            </button>
            <span v-if="resendCooldown > 0" class="ml-2 text-xs font-medium text-white/20">
              ({{ resendCooldown }}s)
            </span>
          </div>
          <div class="text-center">
            <button @click="handleCancelOTPValidation" :disabled="isSendingOtp"
              class="text-xs font-medium transition-colors text-orange-100/40 italic hover:text-gray-100 disabled:opacity-30 flex items-center justify-center w-full gap-1 cursor-pointer">
              <span class="material-symbols-outlined text-sm! ">phone</span>
              <span class="underline">¿Número equivocado?</span>
            </button>

          </div>
        </div>
      </template>

      <!-- Footer (same in both steps) -->
      <p class="mt-5 text-[10px] text-white/20 font-medium text-center leading-relaxed">
        Este número solo se usará para enviarle notificaciones de escaneo de sus códigos QR.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onUnmounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { toast } from 'vue-sonner'
import { parsePhoneNumber, getCountries, getCountryCallingCode } from 'libphonenumber-js'
import type { CountryCode } from 'libphonenumber-js'

const emit = defineEmits<{
  saved: []
  dismiss: []
}>()

const userStore = useUserStore()
const WORKER_URL = import.meta.env.VITE_WHATSAPP_WORKER_URL as string ?? ''

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
const countryCodeSearch = ref('')
const editingCountry = ref(false)
const suggestionsOpen = ref(false)
const phoneInput = ref<HTMLInputElement | null>(null)
const phoneNumber = ref('')
const otpCode = ref('')
const step = ref<1 | 2 | 3>(1)
const isSendingOtp = ref(false)
const isVerifying = ref(false)
const resendCooldown = ref(0)
let cooldownTimer: ReturnType<typeof setInterval> | null = null

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

const filteredCountries = computed(() => {
  const q = countryCodeSearch.value.replace(/\D/g, '')
  if (!q) return countries
  return countries.filter((c) => c.prefix.replace('+', '').startsWith(q))
})

const onCountrySearch = () => {
  // Strip non-digits
  countryCodeSearch.value = countryCodeSearch.value.replace(/\D/g, '')
  suggestionsOpen.value = true
  // Auto-select if exactly one country matches the typed prefix
  if (filteredCountries.value.length === 1) {
    selectCountry(filteredCountries.value[0]!)
  }
}

const selectCountry = async (country: Country) => {
  selectedCountry.value = country
  countryCodeSearch.value = ''
  editingCountry.value = false
  suggestionsOpen.value = false
  // Focus the phone input after selection
  await nextTick()
  phoneInput.value?.focus()
}

const editCountry = () => {
  editingCountry.value = true
  suggestionsOpen.value = true
  countryCodeSearch.value = selectedCountry.value.prefix.replace('+', '')
}

const closeSuggestions = () => {
  // Delay so click on suggestion registers first
  setTimeout(() => {
    suggestionsOpen.value = false
  }, 150)
}

const onOtpInput = () => {
  // Strip non-digits, max 6
  otpCode.value = otpCode.value.replace(/\D/g, '').slice(0, 6)
}

/**
 * Formats to E.164 without the +.
 * Example: +52 5512345678 → 525512345678
 */
const formatForWhatsApp = (): string => {
  try {
    const phone = parsePhoneNumber(phoneNumber.value, selectedCountry.value.code)
    return phone.format('E.164').replace('+', '')
  } catch {
    const rawPrefix = selectedCountry.value.prefix.replace('+', '')
    return `${rawPrefix}${phoneNumber.value}`
  }
}

const handleSendOtp = async () => {
  if (!isValid.value) {
    toast.error('El número no es válido para el país seleccionado.')
    return
  }

  const userId = userStore.getUserId
  if (!userId) {
    toast.error('Error de autenticación. Intente de nuevo.')
    return
  }

  isSendingOtp.value = true
  try {
    const phone = formatForWhatsApp()
    const response = await fetch(`${WORKER_URL}/api/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uid: userId, phone }),
    })

    const data = await response.json()
    if (!response.ok) {
      toast.error(data.error || 'Error al enviar el código')
      return
    }

    // Move to step 2
    step.value = 2
    startResendCooldown()
    toast.success('Código de verificación enviado a tu WhatsApp.')
  } catch (error: unknown) {
    const err = error as { message?: string }
    toast.error(`Error de conexión: ${err.message || 'Desconocido'}`)
  } finally {
    isSendingOtp.value = false
  }
}

const handleVerifyOtp = async () => {
  if (otpCode.value.length !== 6) {
    toast.error('El código debe tener 6 dígitos.')
    return
  }

  const userId = userStore.getUserId
  if (!userId) {
    toast.error('Error de autenticación. Intente de nuevo.')
    return
  }

  isVerifying.value = true
  try {
    const response = await fetch(`${WORKER_URL}/api/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uid: userId, code: otpCode.value }),
    })

    const data = await response.json()
    if (!response.ok) {
      if (data.error === 'Code expired') {
        toast.error('El código ha expirado. Solicita uno nuevo.')
      } else if (data.error === 'Invalid code') {
        toast.error('Código incorrecto. Intenta de nuevo.')
      } else if (data.error === 'Too many attempts, request a new code') {
        toast.error('Demasiados intentos fallidos. Solicita un nuevo código.')
      } else {
        toast.error(data.error || 'Error al verificar el código')
      }
      return
    }

    // Success — phone verified
    const phone = formatForWhatsApp()
    userStore.setUserPhone(phone)
    toast.success('Número verificado exitosamente. Ya puede recibir notificaciones.')
    emit('saved')
  } catch (error: unknown) {
    const err = error as { message?: string }
    toast.error(`Error de conexión: ${err.message || 'Desconocido'}`)
  } finally {
    isVerifying.value = false
  }
}

const handleResendOtp = async () => {
  if (resendCooldown.value > 0) return
  await handleSendOtp()
}

const startResendCooldown = () => {
  resendCooldown.value = 30
  if (cooldownTimer) clearInterval(cooldownTimer)
  cooldownTimer = setInterval(() => {
    resendCooldown.value--
    if (resendCooldown.value <= 0) {
      resendCooldown.value = 0
      if (cooldownTimer) clearInterval(cooldownTimer)
    }
  }, 1000)
}

const handleCancelOTPValidation = async () => {
  try {
    const userId = userStore.getUserId;
    const response = await fetch(`${WORKER_URL}/api/cancel-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uid: userId }),
    });

    const data = await response.json()
    console.log(data)
    if (!response.ok) {
      throw new Error(`Error al cancelar`)
    }
    if (response.ok) {
      toast.info('Codigo OTP cancelado')
      step.value = 1;
      phoneNumber.value = ''
    }
  } catch (error) {
    toast.error(`Error al intentar cancelar la verificación OTP: ${error}`)
  }
}

onUnmounted(() => {
  if (cooldownTimer) clearInterval(cooldownTimer)
})
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

/* Scrollbar for suggestions */
.overflow-y-auto::-webkit-scrollbar {
  width: 4px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}
</style>
