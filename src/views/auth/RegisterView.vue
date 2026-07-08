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
                class="material-symbols-outlined notranslate text-orange-500 text-6xl group-hover:rotate-12 transition-transform">location_on</span>
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
                Empiece a proteger sus pertenencias y comunicaciones con Ubiqueme.
              </p>
            </div>

            <!-- Promo Banner Desktop -->
            <div
              class="p-5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-orange-500/15 to-amber-500/15 border border-orange-500/30 shadow-[0_0_30px_rgba(249,115,22,0.1)] relative overflow-hidden">
              <div
                class="absolute -top-10 -right-10 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl pointer-events-none">
              </div>
              <div
                class="absolute -bottom-10 -left-10 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none">
              </div>
              <div class="relative z-10 flex items-center gap-4">
                <div
                  class="shrink-0 w-12 h-12 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center">
                  <span class="material-symbols-outlined notranslate text-2xl text-orange-400">card_giftcard</span>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-white font-bold text-sm leading-tight">
                    Cree su cuenta gratuita y obtenga 1 año plan Bronce completamente gratis
                  </p>
                </div>
              </div>
              <!-- Badge OFERTA -->
              <div
                class="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-orange-500/20 border border-orange-500/30 text-[8px] font-black uppercase tracking-[0.2em] text-orange-400">
                OFERTA
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4 max-w-sm">
              <div class="p-4 bg-white/[0.03] border border-white/10 rounded-2xl">
                <span class="material-symbols-outlined notranslate text-orange-500 mb-2">shield_check</span>
                <p class="text-[10px] font-black text-white/50 uppercase tracking-widest">Protección Total</p>
              </div>
              <div class="p-4 bg-white/[0.03] border border-white/10 rounded-2xl">
                <span class="material-symbols-outlined notranslate text-orange-500 mb-2">bolt</span>
                <p class="text-[10px] font-black text-white/50 uppercase tracking-widest">Aviso al Instante</p>
              </div>
            </div>

            <!-- Decorative Floating Icons -->
            <div class="absolute inset-0 pointer-events-none opacity-[0.05] select-none">
              <span
                class="material-symbols-outlined notranslate absolute top-[10%] left-[10%] text-9xl animate-float-slow text-orange-500">security</span>
              <span
                class="material-symbols-outlined notranslate absolute bottom-[20%] right-[10%] text-8xl animate-float-medium">qr_code_2</span>
            </div>
          </div>
        </div>

        <!-- 🚀 RIGHT SIDE: REGISTER FORM -->
        <div class="relative grow md:w-1/2 lg:w-2/5 flex items-center justify-center p-8 sm:p-16 z-10 pt-24!">
          <div class="w-full max-w-md space-y-8">

            <div class="md:hidden flex flex-col items-center mb-6 text-center">
              <span class="material-symbols-outlined notranslate text-orange-500 text-6xl mb-4">location_on</span>
              <h2 class="text-2xl font-black text-white uppercase tracking-widest leading-none">Ubiqueme</h2>
              <span class="text-orange-500/60 text-[10px] font-black uppercase tracking-[0.3em] mt-1">Security
                Protocol</span>
            </div>

            <!-- Promo Banner Mobile -->
            <div
              class="md:hidden p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-orange-500/15 to-amber-500/15 border border-orange-500/30 shadow-[0_0_20px_rgba(249,115,22,0.08)] relative overflow-hidden mb-8">
              <div
                class="absolute -top-8 -right-8 w-24 h-24 bg-orange-500/10 rounded-full blur-3xl pointer-events-none">
              </div>
              <div
                class="absolute -bottom-8 -left-8 w-24 h-24 bg-amber-500/10 rounded-full blur-3xl pointer-events-none">
              </div>
              <div class="relative z-10 flex items-center gap-3">
                <div
                  class="shrink-0 w-10 h-10 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center">
                  <span class="material-symbols-outlined notranslate text-xl text-orange-400">card_giftcard</span>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-white font-bold text-xs leading-tight">
                    Cree su cuenta gratuita y obtenga 1 año plan Bronce completamente gratis
                  </p>
                </div>
              </div>
              <div
                class="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-orange-500/20 border border-orange-500/30 text-[7px] font-black uppercase tracking-[0.2em] text-orange-400">
                OFERTA
              </div>
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
              <div
                class="flex items-start gap-4 rounded-xl border border-orange-500/20 bg-zinc-900/80 p-4 backdrop-blur-sm transition-all hover:border-orange-500/40">

                <input id="terms" v-model="form.terms" type="checkbox"
                  class="mt-1 h-5 w-5 cursor-pointer rounded border-zinc-600 bg-zinc-800 accent-orange-500 focus:ring-2 focus:ring-orange-500 focus:ring-offset-0 transition-all" />

                <label for="terms" class="text-sm leading-6 text-zinc-300 select-none cursor-pointer">
                  Acepto los
                  <RouterLink to="/terms"
                    class="font-semibold text-orange-400 transition-colors duration-200 hover:text-orange-300 hover:underline"
                    @click.stop>
                    Términos y Condiciones
                  </RouterLink>
                  y la
                  <RouterLink to="/privacy"
                    class="font-semibold text-orange-400 transition-colors duration-200 hover:text-orange-300 hover:underline"
                    @click.stop>
                    Política de Privacidad
                  </RouterLink>.
                </label>

              </div>

              <button type="submit" :disabled="loading"
                class="group w-full h-16 bg-orange-500 text-[#09090b] rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all duration-300 hover:bg-white hover:shadow-[0_0_20px_rgba(249,115,22,0.4)] active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50 disabled:grayscale">
                <span v-if="!loading">Registrarme</span>
                <span v-else>Procesando...</span>
                <span v-if="!loading"
                  class="material-symbols-outlined notranslate text-lg font-black transition-transform group-hover:translate-x-1">arrow_forward</span>
                <span v-else class="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin"></span>
              </button>
            </form>


            <p class="text-center text-white/30 text-xs font-medium">
              ¿Ya es parte de ubiqueme?
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
  signOut,
} from 'firebase/auth'
import { doc, getFirestore, Timestamp, writeBatch } from 'firebase/firestore'
import { useRouter } from 'vue-router'
import { nanoid } from 'nanoid'
import { toast } from 'vue-sonner'
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
      trialActive: true, trialStartsAt: Timestamp.now(), trialEndsAt: Timestamp.fromDate(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)), isTrialUsed: false,
    });

    const subId = generateRandomId();
    batch.set(doc(db, `users/${user.uid}/subscriptions/${subId}`), {
      id: subId,
      userId: user.uid,
      planType: 'trial',
      status: 'active',
      purchasedAt: Timestamp.now(),
      endDate: Timestamp.fromDate(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)),
      paymentProviderId: '',
      totalQRsAllowed: 1,
      totalQRsCreated: 0,
      freeShipmentsAllowed: 0,
      freeShipmentsUsed: 0
    });

    await batch.commit()
    await signOut(auth)
    toast.success('Registro completado con éxito. Por favor verifique su correo.')
    router.push({ name: 'verify' })
  } catch (error) {
    console.error(error)
    toast.error(`Error al registrarse: ${error}`)
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
