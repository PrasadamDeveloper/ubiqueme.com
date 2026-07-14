<template>
  <section class="relative z-10 px-4 sm:px-8 py-16 sm:py-24 mx-auto max-w-5xl">

    <!-- Header -->
    <div class="text-center mb-12 sm:mb-20" data-aos="fade-up">
      <h2 class="text-3xl sm:text-5xl font-black text-gray-900 tracking-tight mb-4">
        Protección en <span class="text-orange-500">3 simples pasos.</span> <span
          class="material-symbols-outlined notranslate text-3xl sm:text-4xl text-amber-500 align-middle">verified_user</span>
      </h2>
      <p class="text-gray-500 text-base sm:text-lg font-medium max-w-2xl mx-auto">
        Nuestro sistema actúa como un puente anónimo entre quien encuentra su pertenencia y usted, sin intermediarios
        físicos ni aplicaciones extra.
      </p>
    </div>

    <!-- Steps Grid -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 relative">
      <!-- Background Connecting Line (Desktop only) -->
      <div
        class="hidden md:block absolute top-[4.5rem] left-[15%] right-[15%] h-[1px] bg-gradient-to-r from-transparent via-gray-200 to-transparent z-0">
      </div>

      <!-- Step 1 -->
      <div class="relative z-10 flex flex-col items-center text-center group" data-aos="fade-up" data-aos-delay="100">
        <div
          class="w-20 h-20 bg-white border border-gray-200 rounded-2xl flex items-center justify-center mb-6 transition-colors duration-300 group-hover:border-primary/50 group-hover:bg-primary/5 shadow-sm">
          <span
            class="material-symbols-outlined notranslate text-4xl text-gray-500 group-hover:text-primary transition-colors">qr_code_2</span>
        </div>
        <div
          class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-gray-500 text-[10px] font-black mb-4">
          1</div>
        <h3 class="text-xl font-bold text-gray-900 mb-3 tracking-tight">Adhiera su Código</h3>
        <p class="text-gray-500 text-sm font-medium leading-relaxed px-4">
          Pegue la etiqueta en su auto, maleta, o ponga la pulsera a su familiar. No necesita configurar dispositivos
          complicados.
        </p>
      </div>

      <!-- Step 2 -->
      <div class="relative z-10 flex flex-col items-center text-center group" data-aos="fade-up" data-aos-delay="200">
        <div
          class="w-20 h-20 bg-white border border-gray-200 rounded-2xl flex items-center justify-center mb-6 transition-colors duration-300 group-hover:border-primary/50 group-hover:bg-primary/5 shadow-sm">
          <span
            class="material-symbols-outlined notranslate text-4xl text-gray-500 group-hover:text-primary transition-colors">document_scanner</span>
        </div>
        <div
          class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-gray-500 text-[10px] font-black mb-4">
          2</div>
        <h3 class="text-xl font-bold text-gray-900 mb-3 tracking-tight">Alguien lo Escanea</h3>
        <p class="text-gray-500 text-sm font-medium leading-relaxed px-4">
          Quien lo encuentre solo necesita abrir la cámara de su celular. No necesita descargar ninguna aplicación
          especial.
        </p>
      </div>

      <!-- Step 3 -->
      <div class="relative z-10 flex flex-col items-center text-center group" data-aos="fade-up" data-aos-delay="300">
        <div
          class="w-20 h-20 bg-white border border-gray-200 rounded-2xl flex items-center justify-center mb-6 transition-colors duration-300 group-hover:border-primary/50 group-hover:bg-primary/5 shadow-sm">
          <span
            class="material-symbols-outlined notranslate text-4xl text-gray-500 group-hover:text-primary transition-colors">mark_email_unread</span>
        </div>
        <div
          class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-gray-500 text-[10px] font-black mb-4">
          3</div>
        <h3 class="text-xl font-bold text-gray-900 mb-3 tracking-tight">Usted Recibe la Alerta</h3>
        <p class="text-gray-500 text-sm font-medium leading-relaxed px-4">
          El sistema le envía una notificación inmediata e intermediada de forma 100% anónima para que pueda actuar.
        </p>
      </div>
    </div>

    <!-- Benefits Summary -->
    <div class="mt-12 sm:mt-24 grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4" data-aos="fade-up"
      data-aos-delay="400">

      <div
        class="bg-white border border-gray-200 rounded-3xl p-6 flex items-start gap-4 hover:shadow-md transition-all duration-300 group">
        <span
          class="material-symbols-outlined notranslate text-primary text-2xl group-hover:scale-110 transition-transform">gpp_good</span>
        <div>
          <h4 class="text-gray-900 font-bold text-sm mb-2">Sin Datos Expuestos</h4>
          <p class="text-gray-500 text-xs font-medium leading-relaxed">
            Su privacidad es nuestra prioridad. En ningún momento se muestra su nombre o número personal; el sistema
            actúa como un puente seguro y anónimo.
          </p>
        </div>
      </div>

      <div
        class="bg-white border border-gray-200 rounded-3xl p-6 flex items-start gap-4 hover:shadow-md transition-all duration-300 group">
        <span
          class="material-symbols-outlined notranslate text-primary text-2xl group-hover:scale-110 transition-transform">bolt</span>
        <div>
          <h4 class="text-gray-900 font-bold text-sm mb-2">Sin Aplicaciones</h4>
          <p class="text-gray-500 text-xs font-medium leading-relaxed">
            Cero fricción. Quien escanea su código no necesita descargar apps, crear cuentas ni iniciar sesión. Todo
            funciona desde cualquier navegador móvil.
          </p>
        </div>
      </div>

      <div
        class="bg-white border border-gray-200 rounded-3xl p-6 flex items-start gap-4 hover:shadow-md transition-all duration-300 group">
        <span
          class="material-symbols-outlined notranslate text-amber-500 text-2xl group-hover:scale-110 transition-transform">chat</span>
        <div>
          <h4 class="text-gray-900 font-bold text-sm mb-2">Contacto Inteligente</h4>
          <p class="text-gray-500 text-xs font-medium leading-relaxed">
            Elija cómo ser contactado (WhatsApp, llamada, SMS o Email) sin mostrar su número. Quien lo encuentre puede
            enviarle un mensaje directo.
          </p>
        </div>
      </div>

      <div
        class="bg-white border border-gray-200 rounded-3xl p-6 flex items-start gap-4 hover:shadow-md transition-all duration-300 group">
        <span
          class="material-symbols-outlined notranslate text-amber-500 text-2xl group-hover:scale-110 transition-transform">public</span>
        <div>
          <h4 class="text-gray-900 font-bold text-sm mb-2">Alcance Global</h4>
          <p class="text-gray-500 text-xs font-medium leading-relaxed">
            Reciba alertas en tiempo real vía WhatsApp y Correo en cualquier parte del mundo. Protección sin fronteras
            para lo que más importa.
          </p>
        </div>
      </div>

    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import AOS from 'aos'
import 'aos/dist/aos.css'

onMounted(() => {
  AOS.init({
    duration: 800,
    once: true,
    offset: 50,
    easing: 'ease-out-cubic'
  })
})
</script>

<style scoped>
.material-symbols-outlined {
  font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}
</style>
