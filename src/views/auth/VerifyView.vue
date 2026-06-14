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

          <div v-if="status === 'loading'" class="flex flex-col items-center mt-6 space-y-4">
            <div class="w-12 h-12 border-4 border-white/10 border-t-orange-500 rounded-full animate-spin"></div>
            <p class="text-white/50 text-sm font-medium tracking-widest uppercase mt-4">Validando credenciales...</p>
          </div>

          <div v-else-if="status === 'success'" class="flex flex-col items-center mt-6 space-y-6 w-full">
            <div
              class="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center">
              <span class="material-symbols-outlined text-green-500 text-3xl">check_circle</span>
            </div>
            <p class="text-white/70 text-base font-medium">
              Su cuenta ha sido verificada exitosamente. Le damos la bienvenida a ubiqueme.com, ahora podra crear y
              gestionar sus QRs con total libertad.
            </p>
            <RouterLink to="/login"
              class="w-full mt-4 h-14 bg-white text-black rounded-2xl font-black text-base transition-all duration-300 hover:bg-orange-500 hover:shadow-[0_0_20px_rgba(249,115,22,0.4)] flex items-center justify-center gap-2">
              <span>Ir al Login</span>
              <span class="material-symbols-outlined font-black text-xl">arrow_forward</span>
            </RouterLink>
          </div>

          <div v-else-if="status === 'error'" class="flex flex-col items-center mt-6 space-y-6 w-full">
            <div class="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
              <span class="material-symbols-outlined text-red-500 text-3xl">error</span>
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
import { applyActionCode } from 'firebase/auth';
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { toast } from 'vue-sonner';

const route = useRoute();
const query = route.query;

const oobCode = query.oobCode as string ?? '';
const action = query.mode as string ?? '';

const status = ref<'loading' | 'success' | 'error'>('loading');

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

const handleActivateAccount = async (action: string) => {
  switch (action) {
    case 'resetPassword':
      toast.info('Action: Reset Password');
      status.value = 'error'; // To be implemented later if needed
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
    status.value = 'error';
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
