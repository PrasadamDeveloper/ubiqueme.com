<template>
  <HomeLayout>
    <template #main>
      <section
        class="relative min-h-screen w-full flex pt-20 flex-col items-center justify-center bg-[#070b14] font-google-sans overflow-hidden py-10 px-4">

        <!-- 📐 BACKGROUND DOT MATRIX (Lightweight) -->
        <div class="absolute inset-0 z-0 opacity-[0.05]"
          style="background-image: radial-gradient(#fff 1px, transparent 1px); background-size: 24px 24px;">
        </div>

        <div
          class="relative z-10 w-full max-w-md bg-white/5 border border-white/10 rounded-3xl p-8 sm:p-12 text-center flex flex-col items-center">

          <div
            class="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center mb-8 shadow-[0_0_30px_rgba(249,115,22,0.3)]">
            <span class="text-black font-black text-3xl">U</span>
          </div>

          <h1 class="text-3xl font-black text-white tracking-tight mb-2">
            Verificación
          </h1>

          <div v-if="!oobCode" class="flex flex-col items-center mt-6 space-y-6 w-full">
            <div
              class="w-16 h-16 bg-orange-500/10 border border-orange-500/20 rounded-2xl flex items-center justify-center">
              <span class="material-symbols-outlined notranslate text-orange-500 text-3xl">mail</span>
            </div>
            <p class="text-white/70 text-base font-medium leading-relaxed">
              Le hemos enviado un correo de verificación a su bandeja de entrada. Por favor revise su correo
              electrónico y haga clic en el enlace para activar su cuenta.
            </p>
            <p class="text-white/40 text-sm font-medium">
              ¿No recibió el correo? Verifique su carpeta de spam o solicite un nuevo enlace desde el inicio de sesión.
            </p>
            <RouterLink to="/login"
              class="w-full mt-4 h-14 bg-orange-500 text-black rounded-2xl font-black text-sm transition-all duration-300 hover:bg-white hover:shadow-[0_0_20px_rgba(249,115,22,0.4)] flex items-center justify-center gap-2">
              <span>Ir al Login</span>
              <span class="material-symbols-outlined notranslate font-black text-xl">arrow_forward</span>
            </RouterLink>
          </div>

          <div v-else-if="status === 'loading'" class="flex flex-col items-center mt-6 w-full">
            <!-- Reset Password Form -->
            <template v-if="action === 'resetPassword'">
              <div class="w-full space-y-6">
                <p class="text-white/50 text-sm font-medium leading-relaxed">
                  Ingrese su nueva contraseña para restablecer el acceso a su cuenta.
                </p>

                <div class="space-y-2">
                  <label class="text-[10px] font-black text-white/50 uppercase tracking-[0.2em] ml-1">Nueva
                    Contraseña</label>
                  <div class="relative">
                    <input v-model="resetForm.newPassword" :type="showNewPassword ? 'text' : 'password'"
                      placeholder="••••••••" :disabled="isResetting"
                      class="w-full px-5 py-4 bg-white/5 border border-white/20 hover:border-white/30 rounded-2xl text-white placeholder:text-white/40 focus:border-orange-500 focus:outline-none focus:bg-white/10 transition-all pr-12 disabled:opacity-50" />
                    <button type="button" @click="showNewPassword = !showNewPassword"
                      class="absolute right-5 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-colors">
                      <span class="material-symbols-outlined notranslate text-xl">{{ showNewPassword ? 'visibility' :
                        'visibility_off'
                        }}</span>
                    </button>
                  </div>
                </div>

                <div class="space-y-2">
                  <label class="text-[10px] font-black text-white/50 uppercase tracking-[0.2em] ml-1">Confirmar
                    Contraseña</label>
                  <div class="relative">
                    <input v-model="resetForm.confirmPassword" :type="showConfirmPassword ? 'text' : 'password'"
                      placeholder="••••••••" :disabled="isResetting"
                      class="w-full px-5 py-4 bg-white/5 border border-white/20 hover:border-white/30 rounded-2xl text-white placeholder:text-white/40 focus:border-orange-500 focus:outline-none focus:bg-white/10 transition-all pr-12 disabled:opacity-50" />
                    <button type="button" @click="showConfirmPassword = !showConfirmPassword"
                      class="absolute right-5 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-colors">
                      <span class="material-symbols-outlined notranslate text-xl">{{ showConfirmPassword ? 'visibility'
                        :
                        'visibility_off'
                        }}</span>
                    </button>
                  </div>
                </div>

                <button @click="handleResetPassword" :disabled="isResetting"
                  class="group w-full h-14 bg-orange-500 text-[#070b14] rounded-2xl font-black text-xs uppercase tracking-widest transition-all duration-300 hover:bg-white hover:shadow-[0_0_20px_rgba(249,115,22,0.4)] active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50 disabled:grayscale">
                  <span v-if="!isResetting">Restablecer Contraseña</span>
                  <span v-else class="flex items-center gap-2">
                    <span class="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin"></span>
                    Procesando...
                  </span>
                </button>
              </div>
            </template>

            <!-- Spinner for verifyEmail -->
            <template v-else>
              <div class="flex flex-col items-center space-y-4">
                <div class="w-12 h-12 border-4 border-white/10 border-t-orange-500 rounded-full animate-spin"></div>
                <p class="text-white/50 text-sm font-medium tracking-widest uppercase mt-4">Validando credenciales...
                </p>
              </div>
            </template>
          </div>

          <div v-else-if="status === 'success'" class="flex flex-col items-center mt-6 space-y-6 w-full">
            <div
              class="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center">
              <span class="material-symbols-outlined notranslate text-green-500 text-3xl">check_circle</span>
            </div>
            <p class="text-white/70 text-base font-medium">
              Su cuenta ha sido verificada exitosamente. Le damos la bienvenida a ubiqueme.com, ahora podra crear y
              gestionar sus QRs con total libertad.
            </p>
            <RouterLink to="/login"
              class="w-full mt-4 h-14 bg-white text-black rounded-2xl font-black text-base transition-all duration-300 hover:bg-orange-500 hover:shadow-[0_0_20px_rgba(249,115,22,0.4)] flex items-center justify-center gap-2">
              <span>Ir al Login</span>
              <span class="material-symbols-outlined notranslate font-black text-xl">arrow_forward</span>
            </RouterLink>
          </div>

          <div v-else-if="status === 'error'" class="flex flex-col items-center mt-6 space-y-6 w-full">
            <div class="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
              <span class="material-symbols-outlined notranslate text-red-500 text-3xl">error</span>
            </div>
            <p class="text-white/70 text-base font-medium">
              El enlace de verificación es inválido o ha expirado. Por favor, solicite uno nuevo.
            </p>
            <RouterLink to="/login"
              class="w-full mt-4 h-14 bg-white/10 text-white border border-white/20 rounded-2xl font-black text-base transition-all duration-300 hover:bg-white/20 flex items-center justify-center gap-2">
              <span>Volver al Login</span>
            </RouterLink>
          </div>

        </div>
      </section>
    </template>
  </HomeLayout>
</template>

<script lang="ts" setup>
import { auth } from '@/firebase';
import HomeLayout from '@/layouts/HomeLayout.vue';
import { applyActionCode, confirmPasswordReset } from 'firebase/auth';
import { onMounted, ref, reactive } from 'vue';
import { useRoute } from 'vue-router';
import { toast } from 'vue-sonner';

const route = useRoute();
const query = route.query;

const oobCode = query.oobCode as string ?? '';
const action = query.mode as string ?? '';

const status = ref<'loading' | 'success' | 'error'>('loading');

// ─── Reset Password state ────────────────────────────────────────
const resetForm = reactive({
  newPassword: '',
  confirmPassword: '',
});
const showNewPassword = ref(false);
const showConfirmPassword = ref(false);
const isResetting = ref(false);

const handleValidateEmail = async () => {
  try {
    status.value = 'loading';
    await applyActionCode(auth, oobCode);
    status.value = 'success';
    toast.success('Email validated successfully');
  } catch (error) {
    status.value = 'error';
    toast.error(`Error while validating email: ${error}`);
  }
}

const handleResetPassword = async () => {
  if (!resetForm.newPassword || !resetForm.confirmPassword) {
    toast.error('Por favor complete ambos campos de contraseña.');
    return;
  }

  if (resetForm.newPassword.length < 6) {
    toast.error('La contraseña debe tener al menos 6 caracteres.');
    return;
  }

  if (resetForm.newPassword !== resetForm.confirmPassword) {
    toast.error('Las contraseñas no coinciden.');
    return;
  }

  try {
    isResetting.value = true;
    await confirmPasswordReset(auth, oobCode, resetForm.newPassword);
    status.value = 'success';
    toast.success('Contraseña restablecida exitosamente.');
  } catch (error: unknown) {
    status.value = 'error';
    const fbError = error as { code?: string; message?: string };
    if (fbError.code === 'auth/expired-action-code') {
      toast.error('El enlace de recuperación ha expirado. Solicite uno nuevo.');
    } else if (fbError.code === 'auth/invalid-action-code') {
      toast.error('El enlace de recuperación no es válido. Solicite uno nuevo.');
    } else if (fbError.code === 'auth/weak-password') {
      toast.error('La contraseña es demasiado débil. Use al menos 6 caracteres.');
    } else {
      toast.error(`Error al restablecer la contraseña: ${fbError.message}`);
    }
  } finally {
    isResetting.value = false;
  }
};

const handleActivateAccount = async (action: string) => {
  switch (action) {
    case 'resetPassword':
      // Show the password reset form (no API call yet)
      status.value = 'loading';
      break;
    case 'verifyEmail':
      await handleValidateEmail();
      break;
    default:
      status.value = 'error';
      toast.error('Invalid action');
  }
}

onMounted(() => {
  if (!oobCode || !action) {
    // No oobCode means user was just redirected after registering — show info state
    return;
  }
  handleActivateAccount(action as string);
});
</script>

<style scoped>
.font-google-sans {
  font-family: 'Google Sans', sans-serif;
}

.material-symbols-outlined {
  font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}
</style>
