<template>
  <div class="fixed inset-0 z-50 flex items-end justify-center p-0 bg-black/40"
    @click.self="$emit('dismiss')">

    <!-- Sheet -->
    <div class="relative w-full max-w-lg bg-white rounded-3xl rounded-b-none max-h-[90vh] flex flex-col shadow-xl animate-ios-sheet">

      <!-- Handle -->
      <div class="flex justify-center pt-3 pb-1 shrink-0">
        <div class="w-9 h-1 bg-[#C6C6C8] rounded-full"></div>
      </div>

      <!-- Scrollable content -->
      <div class="overflow-y-auto px-6 pb-8 -webkit-overflow-scrolling:touch">

        <!-- ═══════════════════════════════════════════════════════
             STEP 1 — Phone input
             ═══════════════════════════════════════════════════════ -->
        <template v-if="step === 1">
          <!-- Header -->
          <div class="flex items-start gap-3.5 pt-1 pb-5">
            <div class="flex h-11 w-11 items-center justify-center rounded-full bg-orange-100 shrink-0 mt-0.5">
              <svg class="w-5.5 h-5.5 text-orange-500" style="width:22px;height:22px" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
              </svg>
            </div>
            <div class="flex-1 min-w-0">
              <h2 class="text-[17px] font-semibold text-[#1C1C1E] leading-tight">
                ¡Bienvenido a <span class="text-orange-500">Ubiqueme</span>!
              </h2>
              <p class="mt-1 text-[13px] text-[#8E8E93] leading-relaxed">
                Introduzca su número de WhatsApp para recibir notificaciones cuando alguien escanee un código QR.
              </p>
            </div>
          </div>

          <!-- Security note (iOS grouped cell style) -->
          <div class="mb-5 px-3.5 py-3 rounded-xl bg-[#F2F2F7]">
            <div class="flex items-start gap-2.5">
              <div class="flex h-7 w-7 items-center justify-center rounded-full bg-white shrink-0 mt-0.5">
                <span class="material-symbols-outlined notranslate text-[#8E8E93] text-[14px]">verified_user</span>
              </div>
              <div>
                <p class="text-[11px] font-semibold text-[#3A3A3C] uppercase tracking-wider">Verificación de seguridad</p>
                <p class="text-[12px] text-[#8E8E93] leading-relaxed mt-0.5">Le enviaremos un código por WhatsApp para confirmar que es el dueño de este número. Así protegemos su cuenta.</p>
              </div>
            </div>
          </div>

          <!-- Form -->
          <div class="space-y-4">
            <!-- Phone input group -->
            <div>
              <label class="text-[13px] font-medium text-[#3A3A3C] mb-1.5 block">Número de WhatsApp</label>
              <div class="flex gap-2">
                <!-- Country code selector -->
                <div class="relative shrink-0">
                  <input v-model="countryCodeSearch" type="text" inputmode="numeric" placeholder="+52"
                    @input="onCountrySearch" @focus="suggestionsOpen = true" @blur="closeSuggestions"
                    class="w-[100px] h-11 px-3 rounded-2xl bg-[#F2F2F7] text-[#1C1C1E] text-[15px] font-medium text-center outline-none"
                    v-if="!selectedCountry || editingCountry" />

                  <button v-else @click="editCountry" type="button"
                    class="flex items-center gap-1 h-11 px-3 rounded-2xl bg-[#F2F2F7] text-[#1C1C1E] text-[15px] font-medium cursor-pointer transition-all active:bg-[#E5E5EA]">
                    <span class="text-base">{{ selectedCountry.flag }}</span>
                    <span class="font-medium tracking-wider">{{ selectedCountry.prefix }}</span>
                    <span class="text-xs material-symbols-outlined notranslate text-[#8E8E93]">expand_more</span>
                  </button>

                  <div v-if="suggestionsOpen && filteredCountries.length"
                    class="absolute z-50 mt-1 left-0 min-w-[220px] bg-white rounded-2xl shadow-lg border border-[#C6C6C8]/30 overflow-hidden max-h-48 overflow-y-auto">
                    <button v-for="c in filteredCountries" :key="c.code" @mousedown.prevent="selectCountry(c)"
                      class="w-full flex items-center gap-3 px-3.5 py-2.5 hover:bg-[#F2F2F7] transition-colors text-[#1C1C1E] text-[14px] text-left">
                      <span class="text-base shrink-0">{{ c.flag }}</span>
                      <span class="font-medium truncate">{{ c.name }}</span>
                      <span class="ml-auto text-[#8E8E93] shrink-0 text-[13px]">{{ c.prefix }}</span>
                    </button>
                  </div>
                </div>

                <!-- Phone input -->
                <div class="relative flex-1">
                  <input ref="phoneInput" v-model="phoneNumber" type="tel" placeholder="55 1234 5678"
                    @input="onPhoneInput" :disabled="!selectedCountry"
                    class="w-full h-11 px-4 rounded-2xl bg-[#F2F2F7] text-[#1C1C1E] text-[15px] font-medium tracking-wider outline-none placeholder:text-[#8E8E93] disabled:opacity-40 disabled:cursor-not-allowed" />
                </div>
              </div>
              <p v-if="selectedCountry" class="text-[12px] text-[#8E8E93] font-medium mt-1.5 ml-1">
                {{ selectedCountry.flag }} {{ selectedCountry.name }}
              </p>
            </div>

            <!-- Send OTP button -->
            <button @click="handleSendOtp" :disabled="isSendingOtp || !isValid"
              class="w-full h-11 rounded-full bg-orange-500 text-white text-[15px] font-semibold hover:bg-orange-600 active:scale-[0.97] transition-all duration-150 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
              <span v-if="!isSendingOtp" class="flex items-center gap-2">
                <span class="material-symbols-outlined notranslate text-[18px]">send</span>
                Enviar código
              </span>
              <span v-else class="flex items-center gap-2">
                <span class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
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
          <div class="flex items-start gap-3.5 pt-1 pb-5">
            <div class="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-100 shrink-0 mt-0.5">
              <span class="material-symbols-outlined notranslate text-emerald-500 text-[22px]">lock</span>
            </div>
            <div class="flex-1 min-w-0">
              <h2 class="text-[17px] font-semibold text-[#1C1C1E] leading-tight">Verifique su número</h2>
              <p class="mt-1 text-[13px] text-[#8E8E93] leading-relaxed">
                Hemos enviado un código de verificación de 6 dígitos al número
                <strong class="font-semibold text-[#3A3A3C]">{{ selectedCountry.prefix }} {{ phoneNumber }}</strong>
                por WhatsApp.
              </p>
            </div>
          </div>

          <!-- OTP input -->
          <div class="space-y-4">
            <div>
              <label class="text-[13px] font-medium text-[#3A3A3C] mb-1.5 block">Código de verificación</label>
              <input v-model="otpCode" type="text" inputmode="numeric" maxlength="6" placeholder="••••••"
                @input="onOtpInput"
                class="w-full h-11 px-4 rounded-2xl bg-[#F2F2F7] text-[#1C1C1E] text-[20px] font-semibold tracking-[0.4em] text-center outline-none placeholder:text-[#C6C6C8]"
                autofocus />
            </div>

            <!-- Verify button -->
            <button @click="handleVerifyOtp" :disabled="isVerifying || otpCode.length !== 6"
              class="w-full h-11 rounded-full bg-orange-500 text-white text-[15px] font-semibold hover:bg-orange-600 active:scale-[0.97] transition-all duration-150 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
              <span v-if="!isVerifying" class="flex items-center gap-2">
                <span class="material-symbols-outlined notranslate text-[18px]">verified</span>
                Verificar
              </span>
              <span v-else class="flex items-center gap-2">
                <span class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                Verificando...
              </span>
            </button>

            <!-- Resend -->
            <div class="flex flex-col items-center gap-2 pt-1">
              <p class="text-[13px] text-[#8E8E93]">¿No recibió el código?</p>
              <button @click="handleResendOtp" :disabled="isSendingOtp || resendCooldown > 0"
                class="h-9 px-5 rounded-full bg-[#F2F2F7] text-[#1C1C1E] text-[13px] font-semibold hover:bg-[#E5E5EA] active:scale-[0.97] transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer">
                Enviar de nuevo
                <span v-if="resendCooldown > 0" class="ml-1 text-[#8E8E93]">({{ resendCooldown }}s)</span>
              </button>
            </div>

            <!-- Wrong number -->
            <div class="text-center pt-1">
              <button @click="handleCancelOTPValidation" :disabled="isSendingOtp"
                class="text-[13px] font-medium text-orange-500 hover:text-orange-600 active:scale-[0.97] transition-all duration-150 disabled:opacity-30 flex items-center justify-center gap-1 cursor-pointer">
                <span class="material-symbols-outlined notranslate text-[15px]">phone</span>
                <span class="underline">¿Número equivocado?</span>
              </button>
            </div>
          </div>
        </template>

        <!-- Footer -->
        <p class="mt-6 text-[11px] text-[#8E8E93] text-center leading-relaxed">
          Este número solo se usará para enviarle notificaciones de escaneo de sus códigos QR.
        </p>
      </div>
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

const getFlagEmoji = (countryCode: string): string => {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map((char) => 0x1f1e6 + char.charCodeAt(0) - 0x41)
  return String.fromCodePoint(...codePoints)
}

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
  phoneNumber.value = phoneNumber.value.replace(/\D/g, '')
}

const filteredCountries = computed(() => {
  const q = countryCodeSearch.value.replace(/\D/g, '')
  if (!q) return countries
  return countries.filter((c) => c.prefix.replace('+', '').startsWith(q))
})

const onCountrySearch = () => {
  countryCodeSearch.value = countryCodeSearch.value.replace(/\D/g, '')
  suggestionsOpen.value = true
  if (filteredCountries.value.length === 1) {
    selectCountry(filteredCountries.value[0]!)
  }
}

const selectCountry = async (country: Country) => {
  selectedCountry.value = country
  countryCodeSearch.value = ''
  editingCountry.value = false
  suggestionsOpen.value = false
  await nextTick()
  phoneInput.value?.focus()
}

const editCountry = () => {
  editingCountry.value = true
  suggestionsOpen.value = true
  countryCodeSearch.value = selectedCountry.value.prefix.replace('+', '')
}

const closeSuggestions = () => {
  setTimeout(() => {
    suggestionsOpen.value = false
  }, 150)
}

const onOtpInput = () => {
  otpCode.value = otpCode.value.replace(/\D/g, '').slice(0, 6)
}

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
@keyframes iosSheet {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

.animate-ios-sheet {
  animation: iosSheet 0.35s cubic-bezier(0.32, 0.72, 0, 1) forwards;
}

.overflow-y-auto::-webkit-scrollbar {
  width: 4px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
}
</style>
