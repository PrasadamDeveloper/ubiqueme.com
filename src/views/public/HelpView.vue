<template>
  <HomeLayout>
    <template #main>
      <section
        class="relative min-h-screen w-full flex flex-col items-center bg-[#070b14] font-google-sans overflow-hidden py-24 px-4 sm:px-6">

        <!-- 📐 BACKGROUND DOT MATRIX (Lightweight) -->
        <div class="absolute inset-0 z-0 opacity-[0.05]"
          style="background-image: radial-gradient(#fff 1px, transparent 1px); background-size: 24px 24px;">
        </div>

        <div class="relative z-10 w-full max-w-4xl mx-auto flex flex-col items-center">

          <!-- Header Section -->
          <div class="text-center mb-16 space-y-4">
            <div
              class="inline-flex w-fit items-center gap-2 px-3 py-1 bg-primary/10 rounded-lg border border-primary/20 mb-4">
              <span class="material-symbols-outlined text-[14px] text-primary">help</span>
              <span class="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Soporte y Ayuda</span>
            </div>

            <h1 class="text-4xl md:text-6xl font-black text-white leading-tight tracking-tighter">
              Preguntas <span class="text-primary">Frecuentes.</span>
            </h1>
            <p class="text-white/40 text-base md:text-lg font-medium max-w-2xl mx-auto leading-relaxed">
              Resuelva sus dudas sobre cómo Ubiqueme protege y gestiona su información mediante códigos QR inteligentes.
            </p>
          </div>

          <!-- FAQ Accordion -->
          <div class="w-full space-y-4">
            <div v-for="(faq, index) in faqs" :key="index"
              class="group bg-white/5 border border-white/10 rounded-3xl overflow-hidden transition-colors hover:bg-white/[0.07] hover:border-white/20">
              <button @click="toggleFaq(index)"
                class="w-full flex items-center justify-between p-6 md:p-8 text-left focus:outline-none">
                <h3 class="text-lg md:text-xl font-bold text-white tracking-tight pr-8">
                  {{ faq.question }}
                </h3>
                <span class="material-symbols-outlined text-white/40 transition-transform duration-300"
                  :class="{ 'rotate-180 text-primary': activeIndex === index }">
                  keyboard_arrow_down
                </span>
              </button>

              <div class="grid transition-all duration-300 ease-in-out"
                :class="activeIndex === index ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'">
                <div class="overflow-hidden">
                  <p class="px-6 md:px-8 pb-6 md:pb-8 text-white/60 font-medium leading-relaxed text-sm md:text-base">
                    {{ faq.answer }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Contact Prompt -->
          <div class="mt-16 text-center bg-primary/5 border border-primary/10 rounded-3xl p-8 md:p-12 w-full">
            <h4 class="text-2xl font-black text-white tracking-tight mb-3">¿Aún tiene dudas?</h4>
            <p class="text-white/50 mb-8 font-medium">Nuestro equipo de soporte está listo para ayudarle con su
              configuración o resolver problemas específicos.</p>
            <a href="mailto:soporte@ubiqueme.com"
              class="inline-flex h-14 items-center justify-center gap-3 bg-white text-black px-8 rounded-2xl font-black text-base transition-all duration-300 hover:bg-primary hover:shadow-[0_0_20px_rgba(123,208,255,0.4)] active:scale-[0.98]">
              <span class="material-symbols-outlined">mail</span>
              <span>Contactar Soporte</span>
            </a>
          </div>

        </div>
      </section>
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
