<template>
  <HomeLayout>
    <template #main>
      <div class="relative min-h-screen w-full bg-[#0a0a0b] font-google-sans overflow-hidden">

        <!-- Grid overlay -->
        <div class="absolute inset-0 opacity-[0.03] pointer-events-none"
          style="background-image: linear-gradient(rgba(255,255,255,.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.4) 1px, transparent 1px); background-size: 48px 48px;">
        </div>

        <!-- Radial glow -->
        <div
          class="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[#ff7900]/5 rounded-full blur-[120px] pointer-events-none">
        </div>

        <div class="relative z-10 pt-28 pb-20 px-4 sm:px-6">
          <div class="max-w-4xl mx-auto">

            <!-- Header -->
            <div class="text-center mb-16 space-y-5">
              <div
                class="inline-flex items-center gap-2 px-4 py-1.5 bg-[#ff7900]/10 rounded-full border border-[#ff7900]/20">
                <span class="material-symbols-outlined text-[14px] text-[#ff7900]">help</span>
                <span class="text-[10px] font-black uppercase tracking-[0.3em] text-[#ff7900]">Soporte y Ayuda</span>
              </div>
              <h1 class="text-4xl md:text-6xl font-black text-white tracking-tight leading-[0.9]">
                Preguntas <span class="text-[#ff7900]">Frecuentes.</span>
              </h1>
              <p class="text-white/35 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
                Resuelva sus dudas sobre cómo Ubiqueme protege y gestiona su información mediante códigos QR
                inteligentes.
              </p>
            </div>

            <!-- FAQ Accordion -->
            <div class="w-full space-y-3">
              <div v-for="(faq, index) in faqs" :key="index"
                class="rounded-2xl border border-white/[0.06] bg-[#0d0d0e] overflow-hidden transition-colors hover:border-white/[0.12]">
                <button @click="toggleFaq(index)"
                  class="w-full flex items-center justify-between p-5 md:p-6 text-left focus:outline-none cursor-pointer">
                  <h3 class="text-base md:text-lg font-bold text-white tracking-tight pr-6">
                    {{ faq.question }}
                  </h3>
                  <span class="material-symbols-outlined text-white/30 transition-transform duration-300 shrink-0"
                    :class="{ 'rotate-180 text-[#ff7900]': activeIndex === index }">
                    keyboard_arrow_down
                  </span>
                </button>

                <div class="grid transition-all duration-300 ease-in-out"
                  :class="activeIndex === index ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'">
                  <div class="overflow-hidden">
                    <p class="px-5 md:px-6 pb-5 md:pb-6 text-white/50 leading-relaxed text-sm">
                      {{ faq.answer }}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Contact Prompt -->
            <div
              class="mt-16 relative rounded-2xl border border-[#ff7900]/10 bg-[#ff7900]/[0.02] p-8 md:p-12 text-center overflow-hidden">
              <div class="absolute inset-0 opacity-[0.02] pointer-events-none"
                style="background-image: linear-gradient(rgba(255,121,0,.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,121,0,.3) 1px, transparent 1px); background-size: 20px 20px;">
              </div>
              <div class="relative z-10">
                <h4 class="text-2xl font-black text-white tracking-tight mb-3">¿Aún tiene dudas?</h4>
                <p class="text-white/50 mb-8">Nuestro equipo de soporte está listo para ayudarle con su configuración o
                  resolver problemas específicos.</p>
                <RouterLink :to="{ name: 'contact' }"
                  class="inline-flex h-12 items-center justify-center gap-2 bg-[#ff7900] text-black px-8 rounded-xl font-black text-xs uppercase tracking-widest transition-all duration-300 hover:bg-[#ff7900]/90 shadow-lg shadow-[#ff7900]/15 active:scale-[0.97]">
                  <span class="material-symbols-outlined text-[16px]">mail</span>
                  <span>Contactar Soporte</span>
                </RouterLink>
              </div>
            </div>

          </div>
        </div>
      </div>
    </template>
  </HomeLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import HomeLayout from '@/layouts/HomeLayout.vue';

const activeIndex = ref<number | null>(0);

const toggleFaq = (index: number) => {
  activeIndex.value = activeIndex.value === index ? null : index;
};

const faqs = [
  {
    question: '¿Cómo funciona el envío de mis códigos QR físicos y qué costos tiene?',
    answer: 'Al contratar cualquier plan (Bronce, Plata u Oro), usted obtiene 1 envío físico totalmente gratuito a cualquier parte de la República Mexicana. Le recomendamos encarecidamente solicitar todos los códigos QR que permite su plan (1 en Bronce, 3 en Plata, 5 en Oro) en este primer envío de su suscripción. Si después decide pedirlos por separado, las etiquetas y códigos siguen siendo gratis, pero se cobrará una tarifa de $199 MXN por envío de paquete adicional. Los envíos físicos se realizan exclusivamente dentro de México.'
  },
  {
    question: '¿En qué formatos puedo obtener mi código QR?',
    answer: 'Nuestros códigos QR se entregan impresos físicamente. Pueden adquirirse en formato de tarjeta o como etiquetas adhesivas (con pegamento frontal o trasero) con tres medidas a escoger, diseñadas específicamente para adaptarse a distintas superficies como parabrisas de vehículos, laptops, maletas o paredes.'
  },
  {
    question: '¿Qué sucede cuando alguien escanea mi código QR?',
    answer: 'Al ser escaneado, nuestro sistema le enviará una notificación inmediata. Según la preferencia que usted elija al momento de la contratación, podrá recibir estas alertas de escaneo a través de WhatsApp, Correo Electrónico o mensaje SMS.'
  },
  {
    question: '¿La persona que escanea verá mi información personal?',
    answer: 'No, su privacidad es absoluta. En ningún momento se comparten datos personales como su nombre o número de teléfono. Toda la interacción es completamente anónima entre ambas partes; nuestro sistema interno se encarga de intermediar la comunicación sin exponer su identidad, garantizando un proceso 100% seguro.'
  },
  {
    question: '¿La persona que encuentra mi código necesita descargar alguna aplicación?',
    answer: 'No. La persona que escanea el código no necesita descargar ninguna aplicación, ni crear una cuenta, ni iniciar sesión. Todo el proceso se maneja de forma automática y rápida directamente a través de una página web en su navegador.'
  },
  {
    question: 'Si alguien escanea mi QR, ¿cómo puedo contactar a esa persona de vuelta?',
    answer: 'Cuando alguien escanea su código, nuestra plataforma le ofrece a esa persona la opción de dejar un método de contacto (como un correo electrónico o teléfono) de manera completamente voluntaria. Si la persona decide compartirlo, usted recibirá estos datos junto con la alerta para poder comunicarse de vuelta.'
  },
  {
    question: '¿El servicio es de pago único o requiere suscripción?',
    answer: 'El código QR físico se paga solamente una vez. Sin embargo, para mantener en funcionamiento el sistema de alertas y notificaciones automatizadas, se requiere de una suscripción anual.'
  },
  {
    question: '¿Puedo usar mi código QR y recibir notificaciones si viajo a otro país?',
    answer: 'Sí. El sistema de alertas vía WhatsApp y Correo Electrónico está habilitado y funciona en cualquier parte del mundo. Sin embargo, el servicio de notificaciones por SMS está disponible de manera exclusiva dentro de México.'
  },
  {
    question: '¿Puedo administrar varios códigos QR desde una misma cuenta?',
    answer: 'Totalmente. Si usted desea tener un código QR para su vehículo, otro para su mascota y otro para su equipaje o algún familiar, puede gestionar y configurar todos ellos de forma sencilla desde su mismo panel de control (Dashboard).'
  },
  {
    question: '¿Qué debo hacer si pierdo mi código QR físico?',
    answer: 'Si pierde su tarjeta o etiqueta adhesiva, deberá tramitar una renovación de su código QR. Este proceso lo puede realizar directamente desde la sección de compras de la plataforma, cubriendo únicamente el costo correspondiente a la reposición física de la etiqueta.'
  }
];
</script>

<style scoped>
.font-google-sans {
  font-family: 'Google Sans', sans-serif;
}

.material-symbols-outlined {
  font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}
</style>
