<template>
  <HomeLayout>
    <template #main>
      <section
        class="relative min-h-screen w-full flex flex-col md:flex-row bg-[#09090b] font-google-sans overflow-hidden">

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

        <!-- 💠 LEFT SIDE: LOGOS & TABS (Desktop) -->
        <div
          class="relative hidden md:flex md:w-1/2 lg:w-3/5 flex-col justify-center p-16 lg:p-24 border-r border-white/5">


          <div class="relative z-10 space-y-10">
            <div class="flex items-center gap-4 group">
              <span
                class="material-symbols-outlined text-orange-500 text-6xl group-hover:rotate-12 transition-transform">location_on</span>
              <div class="flex flex-col">
                <h2 class="text-3xl font-black text-[#E8EFFE] tracking-tighter uppercase leading-none">Ubiqueme</h2>

              </div>
            </div>

            <div class="space-y-6">
              <h1 class="text-6xl lg:text-8xl font-black text-[#dce7ff] leading-[0.9] tracking-tighter">
                ÚNASE A LA<br />
                <span class="text-orange-500 uppercase">Comunidad.</span>
              </h1>
              <p class="text-white/40 text-lg font-medium leading-relaxed max-w-sm">
                Empiece a proteger sus pertenencias y comunicaciones con el estándar de seguridad de Ubiqueme.
              </p>
            </div>

            <div class="grid grid-cols-2 gap-4 max-w-sm">
              <div class="p-4 bg-white/[0.03] border border-white/10 rounded-2xl">
                <span class="material-symbols-outlined text-orange-500 mb-2">shield_check</span>
                <p class="text-[10px] font-black text-white/50 uppercase tracking-widest">Protección Total</p>
              </div>
              <div class="p-4 bg-white/[0.03] border border-white/10 rounded-2xl">
                <span class="material-symbols-outlined text-orange-500 mb-2">bolt</span>
                <p class="text-[10px] font-black text-white/50 uppercase tracking-widest">Aviso al Instante</p>
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

        <!-- 🚀 RIGHT SIDE: REGISTER FORM -->
        <div class="relative grow md:w-1/2 lg:w-2/5 flex items-center justify-center p-8 sm:p-16 z-10 pt-24!">
          <div class="w-full max-w-md space-y-8">

            <div class="md:hidden flex flex-col items-center mb-10 text-center">
              <span class="material-symbols-outlined text-orange-500 text-6xl mb-4">location_on</span>
              <h2 class="text-2xl font-black text-white uppercase tracking-widest leading-none">Ubiqueme</h2>
              <span class="text-orange-500/60 text-[10px] font-black uppercase tracking-[0.3em] mt-1">Security
                Protocol</span>
            </div>

            <header class="space-y-2">
              <h2 class="text-3xl font-black text-white tracking-tight">Crear su cuenta</h2>
              <p class="text-white/40 text-sm font-medium">Comience a proteger sus pertenencias hoy mismo.</p>
            </header>

            <form @submit.prevent="handleRegister" class="space-y-5">
              <div class="space-y-2">
                <label class="text-[10px] font-black text-white/50 uppercase tracking-[0.2em] ml-1">Nombre
                  Completo</label>
                <input id="name" v-model="form.name" type="text" placeholder="Juan Pérez" :disabled="loading"
                  class="w-full px-5 py-4 bg-white/5 border border-white/20 hover:border-white/30 rounded-2xl text-white placeholder:text-white/40 focus:border-orange-500 focus:outline-none focus:bg-white/10 transition-all disabled:opacity-50" />
              </div>

              <div class="space-y-2">
                <label class="text-[10px] font-black text-white/50 uppercase tracking-[0.2em] ml-1">Correo
                  Electrónico</label>
                <input id="email" v-model="form.email" type="email" placeholder="nombre@dominio.com" :disabled="loading"
                  class="w-full px-5 py-4 bg-white/5 border border-white/20 hover:border-white/30 rounded-2xl text-white placeholder:text-white/40 focus:border-orange-500 focus:outline-none focus:bg-white/10 transition-all disabled:opacity-50" />
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div class="space-y-2">
                  <label class="text-[10px] font-black text-white/50 uppercase tracking-[0.2em] ml-1">Contraseña</label>
                  <input id="password" v-model="form.password" type="password" placeholder="••••••••"
                    :disabled="loading"
                    class="w-full px-5 py-4 bg-white/5 border border-white/20 hover:border-white/30 rounded-2xl text-white placeholder:text-white/40 focus:border-orange-500 focus:outline-none focus:bg-white/10 transition-all disabled:opacity-50" />
                </div>
                <div class="space-y-2">
                  <label class="text-[10px] font-black text-white/50 uppercase tracking-[0.2em] ml-1">Confirmar</label>
                  <input id="confirm" v-model="form.confirmPassword" type="password" placeholder="••••••••"
                    :disabled="loading"
                    class="w-full px-5 py-4 bg-white/5 border border-white/20 hover:border-white/30 rounded-2xl text-white placeholder:text-white/40 focus:border-orange-500 focus:outline-none focus:bg-white/10 transition-all disabled:opacity-50" />
                </div>
              </div>

              <div class="flex items-start gap-3 px-1 py-1">
                <input id="terms" v-model="form.terms" type="checkbox"
                  class="mt-1 w-4 h-4 rounded border-white/20 bg-white/5 accent-orange-500 cursor-pointer focus:ring-orange-500/20 transition-all" />
                <label for="terms" class="text-[10px] font-bold text-white/40 uppercase tracking-wider leading-relaxed">
                  Acepto los <span
                    class="text-white hover:text-orange-500 cursor-pointer transition-colors">Términos</span> y la <span
                    class="text-white hover:text-orange-500 cursor-pointer transition-colors">Política de
                    Privacidad</span>.
                </label>
              </div>

              <button type="submit" :disabled="loading"
                class="group w-full h-16 bg-orange-500 text-[#09090b] rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all duration-300 hover:bg-white hover:shadow-[0_0_20px_rgba(249,115,22,0.4)] active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50 disabled:grayscale">
                <span v-if="!loading">Registrarme</span>
                <span v-else>Procesando...</span>
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

            <p class="text-center text-white/30 text-xs font-medium">
              ¿Ya es parte de la red?
              <RouterLink to="/login" class="text-orange-500 font-black hover:text-white ml-2 transition-colors">
                INICIAR SESIÓN</RouterLink>
            </p>
          </div>
        </div>
      </section>
    </template>
  </HomeLayout>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import HomeLayout from '@/layouts/HomeLayout.vue'
import { auth as authFirebase } from '@/firebase'
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  getAdditionalUserInfo
} from 'firebase/auth'
import { doc, getFirestore, Timestamp, writeBatch } from 'firebase/firestore'
import { useRouter } from 'vue-router'
import { nanoid } from 'nanoid'
import { toast } from 'vue-sonner'
import { useUserStore } from '@/stores/user'

const form = reactive({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  terms: false,
})

const auth = authFirebase
const router = useRouter()
const db = getFirestore()
const userStore = useUserStore()
const generateRandomId = () => nanoid(15);
const loading = ref(false)

const handleRegister = async () => {
  if (form.name === '' || form.email === '' || form.password === '' || form.password !== form.confirmPassword || !form.terms) {
    toast.error('Verifique los campos obligatorios y términos.')
    return
  }

  try {
    loading.value = true
    const credentials = await createUserWithEmailAndPassword(auth, form.email, form.password);
    const user = credentials.user;
    await updateProfile(user, { displayName: form.name.trim() });
    await sendEmailVerification(user);

    const batch = writeBatch(db);
    batch.set(doc(db, `users/${user.uid}`), {
      uid: user.uid,
      name: form.name.trim(),
      email: form.email.trim(),
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
      trialActive: true, trialStartsAt: Timestamp.now(), trialEndsAt: Timestamp.fromDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)), isTrialUsed: false,
    });

    const subId = generateRandomId();
    batch.set(doc(db, `users/${user.uid}/subscriptions/${subId}`), {
      id: subId,
      userId: user.uid,
      planType: 'trial',
      status: 'active',
      purchasedAt: Timestamp.now(),
      endDate: Timestamp.fromDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
      paymentProviderId: '',
      totalQRsAllowed: 1,
      totalQRsCreated: 0,
      freeShipmentsAllowed: 0,
      freeShipmentsUsed: 0
    });

    await batch.commit()
    toast.success('Registro completado con éxito. Por favor verifique su correo.')
    router.push({ name: 'login' })
  } catch (error) {
    console.error(error)
    toast.error(`Error al registrarse: ${error}`)
  } finally {
    loading.value = false
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
        trialActive: true, trialStartsAt: Timestamp.now(), trialEndsAt: Timestamp.fromDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)), isTrialUsed: false,
      })

      const subId = generateRandomId();
      batch.set(doc(db, `users/${user.uid}/subscriptions/${subId}`), {
        id: subId,
        userId: user.uid,
        planType: 'trial',
        status: 'active',
        purchasedAt: Timestamp.now(),
        endDate: Timestamp.fromDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
        paymentProviderId: '',
        totalQRsAllowed: 1,
        totalQRsCreated: 0,
        freeShipmentsAllowed: 0,
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
