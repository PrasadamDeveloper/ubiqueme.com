<template>
  <HomeLayout>
    <template #main>
      <section
        class="relative min-h-screen w-full flex flex-col md:flex-row bg-[#09090b] font-google-sans overflow-hidden py-10">

        <!-- 🎨 BACKGROUND ORNAMENTATION (Blueprint Style) -->
        <div class="absolute inset-0 z-0 pointer-events-none">
          <!-- Circular shapes -->
          <div
            class="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] border border-white/5 rounded-full pointer-events-none">
          </div>
          <div
            class="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] border border-orange-500/5 rounded-full pointer-events-none">
          </div>

          <!-- Grid Pattern -->
          <div class="absolute inset-0 z-0 opacity-[0.22]"
            style="background-image: linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px); background-size: 100px 100px;">
          </div>
        </div>

        <!-- 💠 LEFT SIDE: BRAND NARRATIVE (Desktop) -->
        <div
          class="relative hidden md:flex md:w-1/2 lg:w-3/5 flex-col justify-center p-16 lg:p-24 border-r border-white/5">


          <div class="relative z-10 space-y-8">
            <div class="flex items-center gap-4 group">
              <span
                class="material-symbols-outlined text-orange-500 text-6xl group-hover:rotate-12 transition-transform">location_on</span>
              <div class="flex flex-col">
                <h2 class="text-3xl font-black text-white tracking-tighter uppercase leading-none">Ubiqueme</h2>
                <span class="text-orange-500/60 text-[10px] font-black uppercase tracking-[0.3em]">Security
                  Protocol</span>
              </div>
            </div>

            <div
              class="inline-flex w-fit items-center gap-2 px-3 py-1 bg-orange-500/10 rounded-lg border border-orange-500/20">
              <span class="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></span>
              <span class="text-[9px] font-black uppercase tracking-[0.3em] text-orange-500">Acceso Seguro v4.0</span>
            </div>

            <h1 class="text-6xl lg:text-8xl font-black text-white leading-[0.9] tracking-tighter">
              Inicio de<br />
              <span class="text-orange-500">Sesión.</span>
            </h1>

            <div class="max-w-md space-y-6">
              <p class="text-white/40 text-lg font-medium leading-relaxed">
                Ingrese a su cuenta de Ubiqueme para gestionar sus códigos QR.
              </p>

              <div class="flex gap-4 items-center pt-4">
                <div class="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                  <span class="material-symbols-outlined text-orange-500/50">key</span>
                </div>
                <div class="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                  <span class="material-symbols-outlined text-orange-500/50">shield</span>
                </div>
                <div class="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                  <span class="material-symbols-outlined text-orange-500/50">fingerprint</span>
                </div>
              </div>
            </div>

            <!-- Decorative Floating Icons -->
            <div class="absolute inset-0 pointer-events-none opacity-[0.05] select-none">
              <span
                class="material-symbols-outlined absolute top-[10%] left-[10%] text-9xl animate-float-slow text-orange-500">security</span>
              <span
                class="material-symbols-outlined absolute bottom-[20%] right-[10%] text-8xl animate-float-medium">qr_code_2</span>
            </div>
          </div>


        </div>

        <!-- 🚀 RIGHT SIDE: LOGIN FORM -->
        <div class="relative grow md:w-1/2 lg:w-2/5 flex items-center justify-center p-8 sm:p-16 z-10">
          <div class="w-full max-w-sm space-y-10">

            <div class="md:hidden flex flex-col items-center mb-10 text-center">
              <span class="material-symbols-outlined text-orange-500 text-6xl mb-4">location_on</span>
              <h2 class="text-2xl font-black text-white uppercase tracking-widest leading-none">Ubiqueme</h2>
              <span class="text-orange-500/60 text-[10px] font-black uppercase tracking-[0.3em] mt-1">Security
                Protocol</span>
            </div>

            <template v-if="emailVerified">
              <header class="space-y-2">
                <h2 class="text-3xl font-black text-white tracking-tight">Bienvenido</h2>
                <p class="text-white/40 text-sm font-medium">Credenciales de acceso requeridas.</p>
              </header>

              <form @submit.prevent="handleLogin" class="space-y-6">
                <div class="space-y-2">
                  <label class="text-[10px] font-black text-white/50 uppercase tracking-[0.2em] ml-1">Correo
                    Electrónico</label>
                  <div class="group relative">
                    <input id="email" v-model="form.email" type="email" placeholder="nombre@dominio.com"
                      :disabled="loading"
                      class="w-full px-5 py-4 bg-white/5 border border-white/20 hover:border-white/30 rounded-2xl text-white placeholder:text-white/40 focus:border-primary focus:outline-none focus:bg-white/10 transition-all disabled:opacity-50" />
                  </div>
                </div>

                <div class="space-y-2">
                  <div class="flex justify-between items-center px-1">
                    <label class="text-[10px] font-black text-white/50 uppercase tracking-[0.2em]">Contraseña</label>
                    <a href="#"
                      class="text-[10px] font-black text-orange-500 hover:text-white uppercase tracking-widest transition-colors">¿Olvidó
                      su clave?</a>
                  </div>
                  <div class="group relative">
                    <input id="password" v-model="form.password" :type="showPassword ? 'text' : 'password'"
                      :disabled="loading" placeholder="••••••••"
                      class="w-full px-5 py-4 bg-white/5 border border-white/20 hover:border-white/30 rounded-2xl text-white placeholder:text-white/40 focus:border-orange-500 focus:outline-none focus:bg-white/10 transition-all pr-12 disabled:opacity-50" />
                    <button type="button" @click="showPassword = !showPassword"
                      class="absolute right-5 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-colors">
                      <span class="material-symbols-outlined text-xl">{{ showPassword ? 'visibility' : 'visibility_off'
                        }}</span>
                    </button>
                  </div>
                </div>

                <button type="submit" :disabled="loading"
                  class="group w-full h-16 bg-orange-500 text-[#09090b] rounded-2xl font-black text-xs uppercase tracking-widest transition-all duration-300 hover:bg-white hover:shadow-[0_0_20px_rgba(249,115,22,0.4)] active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50 disabled:grayscale">
                  <span v-if="!loading">Iniciar Sesión</span>
                  <span v-else>Autenticando...</span>
                  <span v-if="!loading"
                    class="material-symbols-outlined text-lg font-black transition-transform group-hover:translate-x-1">arrow_forward</span>
                  <span v-else class="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin"></span>
                </button>
              </form>

              <div class="relative py-4">
                <div class="absolute inset-0 flex items-center">
                  <div class="w-full border-t border-white/5"></div>
                </div>
                <div class="relative flex justify-center">
                  <span class="bg-[#09090b] px-4 text-[9px] font-black text-white/40 uppercase tracking-[0.3em]">O
                    CONECTAR CON</span>
                </div>
              </div>

              <button type="button" @click="handleGoogleAuth"
                class="group w-full flex items-center justify-center gap-3 h-14 bg-white/[0.03] border border-white/10 rounded-2xl hover:bg-white/10 hover:border-white/20 transition-all duration-300 font-bold text-sm text-white shadow-lg shadow-black/20">
                <svg class="w-5 h-5 transition-transform duration-300 group-hover:scale-110" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4" />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853" />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05" />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335" />
                </svg>
                Cuenta de Google
              </button>

              <p class="text-center text-white/30 text-xs font-medium mt-6">
                ¿Sin cuenta todavía?
                <RouterLink to="/register" class="text-orange-500 font-black hover:text-white ml-2 transition-colors">
                  CREAR CUENTA</RouterLink>
              </p>
            </template>

            <template v-else>
              <VerificationBanner :loading="resendLoading" :hasCredentials="!!(form.email && form.password)"
                @resend="resendVerification" />
              <button @click="emailVerified = true"
                class="w-full mt-6 h-14 bg-white/5 border border-white/10 text-white rounded-2xl font-black text-sm transition-all duration-300 hover:bg-white/10 flex items-center justify-center gap-2">
                <span class="material-symbols-outlined text-lg">arrow_back</span>
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
import { ref, reactive } from 'vue'
import HomeLayout from '@/layouts/HomeLayout.vue'
import VerificationBanner from '@/components/auth/VerificationBanner.vue'
import { signInWithEmailAndPassword, signOut, GoogleAuthProvider, signInWithPopup, getAdditionalUserInfo, sendEmailVerification } from 'firebase/auth'
import { doc, getFirestore, Timestamp, updateDoc, writeBatch } from 'firebase/firestore'
import { nanoid } from 'nanoid'
import { auth, db as firestoreDb } from '@/firebase'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { toast } from 'vue-sonner'

const router = useRouter();
const showPassword = ref(false)
const emailVerified = ref(true)
const resendLoading = ref(false)
const form = reactive({
  email: '',
  password: '',
})

const userStore = useUserStore()
const loading = ref(false)


const db = firestoreDb
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
      emailVerified.value = false;
      await signOut(auth); // Sign them out so they must verify first
      return;
    }

    if (!user.user.displayName && !user.user.metadata.creationTime) {
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
    router.push({ name: 'dashboard' });
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
  } catch (error: any) {
    // Si las credenciales ya no son válidas o expiró la sesión
    toast.error('No pudimos reenviar el correo. Verifica tus credenciales e inténtalo de nuevo.')
    console.error(error)
  } finally {
    resendLoading.value = false
  }
}

const handleGoogleAuth = async () => {
  try {
    loading.value = true
    const provider = new GoogleAuthProvider()
    const result = await signInWithPopup(auth, provider)
    const user = result.user
    const additionalInfo = getAdditionalUserInfo(result)

    if (additionalInfo?.isNewUser) {
      const db = getFirestore()
      const batch = writeBatch(db)
      batch.set(doc(db, `users/${user.uid}`), {
        uid: user.uid,
        name: user.displayName || '',
        email: user.email || '',
        phone: '',
        role: 'user',
        isActive: true,
        isBanned: false,
        banReason: '',
        totalQRs: 0,
        preferences: {
          emailNotifications: false,
          smsNotifications: false,
          whatsappNotifications: false
        },
        lastLoginAt: Timestamp.now(),
        createdAt: Timestamp.now(),
      })

      const subId = nanoid(15)
      batch.set(doc(db, `users/${user.uid}/subscriptions/${subId}`), {
        id: subId,
        userId: user.uid,
        planType: 'bronce',
        status: 'active',
        purchasedAt: Timestamp.now(),
        endDate: null,
        paymentProviderId: '',
        totalQRsAllowed: 1,
        totalQRsCreated: 0,
        freeShipmentsAllowed: 1,
        freeShipmentsUsed: 0
      })

      await batch.commit()
    }

    userStore.setFullName(user.displayName || '')
    userStore.setCreationDate(user.metadata?.creationTime || '')
    userStore.setUserId(user.uid)
    userStore.setEmail(user.email || '')
    router.push({ name: 'dashboard' })
  } catch (error: any) {
    console.error(error)
    if (error.code !== 'auth/popup-closed-by-user') {
      toast.error('Error al autenticar con Google.')
    }
  } finally {
    loading.value = false
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
