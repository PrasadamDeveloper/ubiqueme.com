<script lang="ts" setup>
import HomeLayout from '@/layouts/HomeLayout.vue'
</script>

<template>
  <HomeLayout>
    <template #main>
      <main class="relative min-h-screen bg-[#070b14] overflow-hidden flex flex-col items-center justify-center font-google-sans">
        
        <!-- 📐 BACKGROUND ORNAMENTATION (Glitch Style) -->
        <div class="absolute inset-x-20 inset-y-0 z-0 opacity-[0.03]" 
             style="background-image: repeating-linear-gradient(0deg, #fff 0, #fff 1px, transparent 1px, transparent 2px); background-size: 100% 4px;">
        </div>
        
        <!-- 💠 CONTENT -->
        <div class="relative z-10 text-center space-y-10 px-6">
           <div class="inline-flex items-center gap-2 px-3 py-1 bg-red-500/10 rounded-lg border border-red-500/20">
              <span class="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
              <span class="text-[9px] font-black uppercase tracking-[0.4em] text-red-500">Error: Protocol 404</span>
           </div>

           <div class="space-y-4">
              <h1 class="text-[12rem] md:text-[20rem] font-black text-white leading-none tracking-tighter opacity-10 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none">
                404
              </h1>
              <h2 class="text-6xl md:text-8xl font-black text-white uppercase tracking-tighter relative">
                LOST IN<br />
                <span class="text-primary italic">TRANSIT.</span>
              </h2>
           </div>

           <div class="max-w-xs mx-auto space-y-8">
              <p class="text-white/40 text-sm font-medium leading-relaxed">
                El nodo solicitado no ha sido localizado en nuestra infraestructura. Verifique la ruta de acceso.
              </p>
              
              <RouterLink to="/" class="group flex items-center justify-center gap-4 w-full h-16 bg-white text-black rounded-2xl font-black text-sm uppercase tracking-widest transition-all hover:bg-primary active:scale-95 shadow-2xl">
                REDIRECCIONAR AL NODO 0
                <span class="material-symbols-outlined font-black transition-transform group-hover:-translate-x-1">home</span>
              </RouterLink>
           </div>
        </div>

        <!-- FOOTER BRANDING -->
        <div class="absolute bottom-16 left-1/2 -translate-x-1/2 flex items-center gap-4 opacity-10">
           <span class="text-[10px] font-black uppercase tracking-[0.6em] text-white">Security Infrastructure</span>
        </div>
      </main>
    </template>
  </HomeLayout>
</template>

<style scoped>
.font-google-sans {
  font-family: 'Google Sans', sans-serif;
}

.material-symbols-outlined {
  font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}

</style>
