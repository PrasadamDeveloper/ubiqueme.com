<template>
  <HomeLayout>
    <template #main>
      <section
        class="relative min-h-screen w-full flex flex-col md:flex-row bg-gray-50 font-google-sans overflow-hidden py-10">

        <!-- 🎨 BACKGROUND ORNAMENTATION (Blueprint Style) -->
        <div class="absolute inset-0 z-0 pointer-events-none">
          <!-- Circular shapes -->
          <div
            class="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] border border-gray-200/50 rounded-full pointer-events-none">
          </div>
          <div
            class="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] border border-orange-500/10 rounded-full pointer-events-none">
          </div>

          <!-- Dots Pattern -->
          <div class="absolute inset-0 z-0 opacity-[0.35]"
            style="background-image: radial-gradient(rgba(0,0,0,0.60) 1px, transparent 1px); background-size: 20px 20px;">
          </div>

          <!-- Grid Pattern -->
          <div class="absolute inset-0 z-0 opacity-[0.08]"
            style="background-image: linear-gradient(rgba(0,0,0,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.08) 1px, transparent 1px); background-size: 100px 100px;">
          </div>
        </div>

        <!-- 💠 LEFT SIDE: BRAND NARRATIVE (Desktop) -->
        <div
          class="relative hidden md:flex md:w-1/2 lg:w-3/5 flex-col justify-center p-14 lg:p-16 border-r border-gray-200 bg-white/50">


          <div class="relative z-10 space-y-3">
            <div class="flex items-center gap-4 group">
              <span
                class="material-symbols-outlined notranslate text-orange-500 text-6xl group-hover:rotate-12 transition-transform">location_on</span>
              <div class="flex flex-col">
                <h2 class="text-3xl font-black text-gray-900 tracking-tighter uppercase leading-none">Ubiqueme</h2>
                <span class="text-orange-500/60 text-[10px] font-black uppercase tracking-[0.3em]">Inicio de
                  Sesión</span>
              </div>
            </div>



            <h1 class="text-6xl lg:text-8xl font-black text-gray-900 leading-[0.9] tracking-tighter">
              Inicio de<br />
              <span class="text-orange-500">Sesión.</span>
            </h1>

            <div class="max-w-md space-y-1">
              <p class="text-gray-500 text-lg font-medium leading-relaxed">
                Ingrese a su cuenta de Ubiqueme para gestionar sus códigos QR.
              </p>

              <div class="flex gap-4 items-center pt-4 hidden">
                <div class="w-12 h-12 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center">
                  <span class="material-symbols-outlined notranslate text-orange-500/70">key</span>
                </div>
                <div class="w-12 h-12 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center">
                  <span class="material-symbols-outlined notranslate text-orange-500/70">shield</span>
                </div>
                <div class="w-12 h-12 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center">
                  <span class="material-symbols-outlined notranslate text-orange-500/70">fingerprint</span>
                </div>
              </div>
            </div>

            <!-- Decorative Floating Icons -->
            <div class="absolute inset-0 pointer-events-none opacity-[0.04] select-none">
              <span
                class="material-symbols-outlined notranslate absolute top-[10%] left-[10%] text-9xl animate-float-slow text-orange-500">security</span>
              <span
                class="material-symbols-outlined notranslate absolute bottom-[20%] right-[10%] text-8xl animate-float-medium">qr_code_2</span>
            </div>

            <!-- Plan detail (desktop) -->
            <div v-if="selectedPlan" class="max-w-lg">
              <PlanPurchaseCard :plan="selectedPlan" />
            </div>
          </div>


        </div>

        <!-- 🚀 RIGHT SIDE: LOGIN FORM -->
        <div class="relative grow md:w-1/2 lg:w-2/5 flex items-center justify-center p-11 sm:p-16 z-10">
          <div class="w-full max-w-sm space-y-10">

            <div class="md:hidden flex flex-col items-center mb-10 text-center mt-2">
              <span class="material-symbols-outlined notranslate text-orange-500 text-6xl mb-4">location_on</span>
              <h2 class="text-2xl font-black text-gray-900 uppercase tracking-widest leading-none">Ubiqueme</h2>
              <span class="text-orange-500/60 text-[10px] font-black uppercase tracking-[0.3em] mt-1">Inicio de
                sesión</span>
            </div>

            <!-- Plan detail (mobile) -->
            <div v-if="selectedPlan" class="md:hidden -mt-6">
              <PlanPurchaseCard :plan="selectedPlan" />
            </div>

            <template v-if="emailVerified">
              <header class="space-y-2">
                <h2 class="text-3xl font-black text-orange-500 tracking-tight">Bienvenido</h2>
                <p class="text-gray-500 text-sm font-medium">Credenciales de acceso requeridas.</p>
              </header>

              <form @submit.prevent="handleLogin" class="space-y-6">
                <div class="space-y-2">
                  <label class="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">Correo
                    Electrónico</label>
                  <div class="group relative">
                    <input id="email" v-model="form.email" type="email" placeholder="nombre@dominio.com"
                      :disabled="loading"
                      class="w-full px-5 py-4 bg-white border border-gray-300 hover:border-gray-400 rounded-2xl text-gray-900 placeholder:text-gray-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all disabled:opacity-50" />
                  </div>
                </div>

                <div class="space-y-2">
                  <label class="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">Contraseña</label>
                  <div class="group relative">
                    <input id="password" v-model="form.password" :type="showPassword ? 'text' : 'password'"
                      :disabled="loading" placeholder="••••••••"
                      class="w-full px-5 py-4 bg-white border border-gray-300 hover:border-gray-400 rounded-2xl text-gray-900 placeholder:text-gray-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all pr-12 disabled:opacity-50" />
                    <button type="button" @click="showPassword = !showPassword"
                      class="absolute right-5 inset-y-0 my-auto flex items-center text-gray-400 hover:text-gray-600 transition-colors">
                      <span class="material-symbols-outlined notranslate text-xl">{{ showPassword ? 'visibility' :
                        'visibility_off'
                      }}</span>
                    </button>
                  </div>
                </div>

                <button type="submit" :disabled="loading"
                  class="group w-full h-16 bg-orange-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all duration-300 hover:bg-orange-600 hover:shadow-[0_0_20px_rgba(249,115,22,0.4)] active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50 disabled:grayscale">
                  <span v-if="!loading">Iniciar Sesión</span>
                  <span v-else>Autenticando...</span>
                  <span v-if="!loading"
                    class="material-symbols-outlined notranslate text-lg font-black transition-transform group-hover:translate-x-1">arrow_forward</span>
                  <span v-else class="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin"></span>
                </button>
                <div class="flex justify-between items-center px-1">
                  <button type="button" @click="handleForgotPassword" :disabled="isResettingPassword"
                    class="text-[10px] font-black text-orange-500 hover:text-orange-700 uppercase tracking-widest transition-colors cursor-pointer">¿Olvidó
                    su contraseña?</button>
                </div>
              </form>


              <p class="text-center text-gray-400 text-xs font-medium mt-6">
                ¿Sin cuenta todavía?
                <RouterLink to="/register"
                  class="text-orange-500 font-black hover:text-orange-700 ml-2 transition-colors">
                  CREAR CUENTA</RouterLink>
              </p>
            </template>

            <template v-else>
              <VerificationBanner :loading="resendLoading" :hasCredentials="!!(form.email && form.password)"
                @resend="resendVerification" />
              <button @click="emailVerified = true"
                class="w-full mt-6 h-14 bg-gray-100 border border-gray-200 text-gray-700 rounded-2xl font-black text-sm transition-all duration-300 hover:bg-gray-200 flex items-center justify-center gap-2">
                <span class="material-symbols-outlined notranslate text-lg">arrow_back</span>
                <span>Volver al Login</span>
              </button>
            </template>

          </div>
        </div>
      </section>
    </template>
  </HomeLayout>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import HomeLayout from '@/layouts/HomeLayout.vue'
import VerificationBanner from '@/components/auth/VerificationBanner.vue'
import PlanPurchaseCard from '@/components/auth/PlanPurchaseCard.vue'
import { planById } from '@/data/plans'
import { signInWithEmailAndPassword, signOut, sendEmailVerification, sendPasswordResetEmail } from 'firebase/auth'
import type { AuthError } from 'firebase/auth'
import { doc, Timestamp, updateDoc } from 'firebase/firestore'
import { auth, db as firestoreDb } from '@/firebase'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { toast } from 'vue-sonner'

const router = useRouter()
const route = useRoute()
const showPassword = ref(false)
const emailVerified = ref(true)
const resendLoading = ref(false)
const selectedPlan = computed(() => {
  const redirect = route.query.redirect as string | undefined
  if (!redirect) return undefined
  const match = redirect.match(/\/checkout\/(\w+)/)
  if (!match) return undefined
  return planById(match[1])
})
const form = reactive({
  email: '',
  password: '',
})

const userStore = useUserStore()
const loading = ref(false)
const isResettingPassword = ref(false)

const db = firestoreDb

const handleForgotPassword = async () => {
  if (!form.email) {
    toast.error('Por favor, ingrese su correo electrónico primero.')
    return
  }
  isResettingPassword.value = true
  try {
    await sendPasswordResetEmail(auth, form.email)
    toast.success('Se ha enviado un correo para restablecer su contraseña. Revise su bandeja de entrada.')
  } catch (error) {
    const authError = error as AuthError;
    if (authError.code === 'auth/user-not-found') {
      toast.error('No encontramos una cuenta con ese correo electrónico.')
    } else if (authError.code === 'auth/invalid-email') {
      toast.error('El correo electrónico no es válido.')
    } else {
      toast.error('Error al enviar el correo: ' + (authError.message || 'Desconocido'))
    }
  } finally {
    isResettingPassword.value = false
  }
}

const navigateAfterAuth = () => {
  const redirect = route.query.redirect as string | undefined
  if (redirect) {
    router.push(redirect)
  } else {
    router.push({ name: 'dashboard' })
  }
}

const handleLogin = async () => {
  if (!form.email || !form.password) {
    toast.error('Por favor, complete todos los campos.')
    return
  }

  try {
    loading.value = true
    const user = await signInWithEmailAndPassword(auth, form.email, form.password)

    // Check if email is verified
    if (!user.user.emailVerified) {
      loading.value = false;
      emailVerified.value = false;
      await signOut(auth); // Sign them out so they must verify first
      return;
    }

    if (!user.user.displayName && !user.user.metadata.creationTime) {
      loading.value = false;
      toast.error('El usuario no tiene nombre para mostrar')
      return
    }
    const userDoc = doc(db, 'users', user.user.uid)

    await updateDoc(userDoc, {
      lastLoginAt: Timestamp.now()
    })

    userStore.setFullName(user.user.displayName || '')
    userStore.setCreationDate(user.user.metadata?.creationTime || '')
    userStore.setUserId(user.user.uid)
    userStore.setEmail(user.user.email || '')
    navigateAfterAuth()
  } catch (error) {
    console.error(error)
    toast.error('Error al iniciar sesión. Verifique sus credenciales.')
  } finally {
    loading.value = false
  }
}

// Re-autentica brevemente al usuario usando las credenciales del form,
// envía el email de verificación y cierra sesión de inmediato.
const resendVerification = async () => {
  if (!form.email || !form.password) {
    toast.error('Por favor, regresa al login e ingresa tus credenciales primero.')
    return
  }
  try {
    resendLoading.value = true
    // Iniciamos sesión momentáneamente para obtener el objeto User
    const credential = await signInWithEmailAndPassword(auth, form.email, form.password)
    // Enviamos el correo de verificación
    await sendEmailVerification(credential.user)
    // Volvemos a cerrar sesión de inmediato
    await signOut(auth)
    toast.success('¡Listo! Revisae su bandeja de entrada, le enviamos un nuevo enlace de verificación.')
  } catch (error) {
    // Si las credenciales ya no son válidas o expiró la sesión
    toast.error('No pudimos reenviar el correo. Verifica tus credenciales e inténtalo de nuevo.')
    console.error(error)
  } finally {
    resendLoading.value = false
  }
}

</script>

<style scoped>
.font-google-sans {
  font-family: 'Google Sans', sans-serif;
}

.material-symbols-outlined {
  font-variation-settings: 'FILL' 1, 'wght' 600, 'GRAD' 0, 'opsz' 24;
}

@keyframes float {

  0%,
  100% {
    transform: translateY(0) rotate(0deg);
  }

  50% {
    transform: translateY(-20px) rotate(5deg);
  }
}

.animate-float-slow {
  animation: float 8s ease-in-out infinite;
}

.animate-float-medium {
  animation: float 6s ease-in-out infinite;
  animation-delay: 1s;
}

/* Custom smooth easing for interactions */
button {
  transition: all 0.2s ease;
}
</style>
