<script lang="ts" setup>
import FeaturesComponent from '@/components/home/Features/FeaturesComponent.vue'
import HowItWorks from '@/components/home/HowItWorks/HowItWorks.vue'
import PricingPlans from '@/components/home/Pricing/PricingPlans.vue'
import StepByStep from '@/components/home/StepByStep/StepByStep.vue'
import VideoGrid from '@/components/home/VideoGrid/VideoGrid.vue'
import HomeLayout from '@/layouts/HomeLayout.vue'
import { useUserStore } from '@/stores/user';
import { onMounted, ref } from 'vue';
import { toast } from 'vue-sonner';
import bag from '@/assets/images/bag-ubq.webp'
import dog from '@/assets/images/dog-ubq.webp'
import electro from '@/assets/images/eletro-ubq.webp'
import house from '@/assets/images/house.jpg'
import car from '@/assets/images/car.webp'
import suitcase from '@/assets/images/suitcase.webp'
import eldery from '@/assets/images/eldery.webp'
import laptop from '@/assets/images/laptop-ubq.webp'
import smartphone from '@/assets/images/smartphone.webp'

import QrcodeVue from 'qrcode.vue'

interface Testimonial {
  id: number;
  initial: string;
  name: string;
  city: string;
  text: string;
  color: string;
}

const testimonials: Testimonial[] = [
  { id: 1, initial: 'L', name: 'Lucía', city: 'CDMX', text: 'Se lo puse a mi papá que tiene Alzheimer. Desde entonces tengo paz sabiendo que si se pierde, alguien va a poder ayudar.', color: 'amber' },
  { id: 2, initial: 'C', name: 'Carlos', city: 'Guadalajara', text: 'Se me perdió mi perro y en 20 minutos alguien llamó. Llorando de felicidad. Esto debería ser obligatorio.', color: 'emerald' },
  { id: 3, initial: 'M', name: 'Mariana', city: 'Monterrey', text: 'Sin app, sin complicaciones. Mi mamá de 70 años lo usó solita. Eso lo dice todo.', color: 'violet' },
  { id: 4, initial: 'R', name: 'Roberto', city: 'Buenos Aires, Arg.', text: 'Dejé las luces del coche encendidas y me avisaron al instante. Mi batería se salvó gracias al código QR.', color: 'amber' },
  { id: 5, initial: 'A', name: 'Ana', city: 'Bogotá, Col.', text: 'Mi hijo de 5 años se perdió en el centro comercial. Alguien escaneó su pulsera QR y me llamaron en 3 minutos.', color: 'violet' },
  { id: 6, initial: 'J', name: 'José', city: 'Lima, Perú', text: 'Me robaron la bicicleta. La persona que la encontró escaneó el QR y recuperé mi bici en menos de 24 horas.', color: 'emerald' },
  { id: 7, initial: 'S', name: 'Sofía', city: 'Santiago, Chile', text: 'Se me quedó la ventana del coche abajo con la lluvia. Un vecino escaneó mi QR y me avisó. Alcanzé a cubrirlo.', color: 'amber' },
  { id: 8, initial: 'D', name: 'Daniel', city: 'Quito, Ecuador', text: 'En la oficina nadie sabía de quién era esa laptop. Con el QR la devolvieron a su dueño en 10 minutos.', color: 'violet' },
  { id: 9, initial: 'P', name: 'Patricia', city: 'Cancún', text: 'Perdí mi maleta en el aeropuerto. La persona que la encontró escaneó mi QR y me contactó directo.', color: 'emerald' },
  { id: 10, initial: 'F', name: 'Fernando', city: 'La Paz, Bol.', text: 'Iba manejando y vi una ventana abajo en un coche estacionado. Escaneé su QR y le avisé al dueño. Así debería funcionar todo.', color: 'amber' },
  { id: 11, initial: 'G', name: 'Gabriela', city: 'San José, C.R.', text: 'Mi abuelita se salió de la casa sin que nos diéramos cuenta. Su pulsera QR permitió que la ayudaran a regresar.', color: 'violet' },
  { id: 12, initial: 'H', name: 'Héctor', city: 'Asunción, Par.', text: 'Dejé la puerta de mi casa abierta al salir. Un vecino vio mi QR en la entrada y me notificó. Llegué antes de que pasara algo.', color: 'emerald' },
  { id: 13, initial: 'V', name: 'Verónica', city: 'Morelia', text: 'Vi salir humo de la casa de mi vecina. Escaneé su código QR de emergencia y le avisé al instante. Los bomberos llegaron antes de que fuera grave.', color: 'amber' },
  { id: 14, initial: 'T', name: 'Tomás', city: 'Aguascalientes', text: 'Mi perro se escapó por un descuido. La persona que lo encontró escaneó su placa QR y lo devolvió en una hora.', color: 'violet' },
  { id: 15, initial: 'E', name: 'Elena', city: 'Montevideo, Uru.', text: 'Olvidé mi mochila en el camión. Alguien escaneó el QR y me contactó. Increíble cómo funciona.', color: 'emerald' },
  { id: 16, initial: 'I', name: 'Iván', city: 'Chihuahua', text: 'En el taller pusimos códigos QR en todas las herramientas. Ahora cualquiera que encuentre una extraviada sabe a quién devolverla.', color: 'amber' },
  { id: 17, initial: 'N', name: 'Natalia', city: 'Medellín, Col.', text: 'Estaba en el aeropuerto y vi una maleta sola. Escaneé el QR y el dueño apareció en segundos. Todos deberían usar esto.', color: 'violet' },
  { id: 18, initial: 'O', name: 'Óscar', city: 'Mexicali', text: 'Mi cartera tiene un QR. Cuando la perdí, quien la encontró me escribió al WhatsApp. Todo mi dinero y tarjetas a salvo.', color: 'emerald' },
  { id: 19, initial: 'B', name: 'Beatriz', city: 'Cuernavaca', text: 'Mi hija tiene alergias graves. Le puse un QR en su mochila. Un día se perdió en el parque, alguien lo escaneó y me avisaron al instante. Llegué antes de que pasara algo.', color: 'amber' },
  { id: 20, initial: 'L', name: 'Luis', city: 'Durango', text: 'Tengo un taller de bicicletas. Les pongo QR a todas las que reparo. Si alguien las encuentra robadas, me avisan al instante.', color: 'violet' },
  { id: 21, initial: 'K', name: 'Karla', city: 'Saltillo', text: 'Mi gato se subió al techo del vecino. Él escaneó su collar QR y me envió un WhatsApp. Problema resuelto en 5 minutos.', color: 'emerald' },
  { id: 22, initial: 'R', name: 'Raúl', city: 'Zacatecas', text: 'En la obra ponemos QR en cada casco y herramienta. Cuando alguien deja algo tirado, el que lo encuentra sabe de quién es.', color: 'amber' },
  { id: 23, initial: 'D', name: 'Diana', city: 'Pachuca', text: 'Olvidé mi tablet en el avión. La azafata escaneó el QR y me contactó. La recuperé antes de salir de la terminal.', color: 'violet' },
  { id: 24, initial: 'M', name: 'Miguel', city: 'Guatemala City', text: 'Alguien golpeó mi coche estacionado y huyó. Un testigo escaneó mi QR y me mandó fotos de la placa del responsable.', color: 'emerald' },
  { id: 25, initial: 'A', name: 'Alejandra', city: 'Campeche', text: 'Mi papá tiene diabetes y a veces se desorienta. Su pulsera QR ya me ha permitido recibir avisos de quienes lo encuentran. Me da tranquilidad saber que siempre alguien avisará.', color: 'amber' },
  { id: 26, initial: 'E', name: 'Ernesto', city: 'Nogales', text: 'Dejé mi celular en un Uber. El siguiente pasajero escaneó el QR que pegué en la funda y me lo devolvió. Impresionante.', color: 'violet' },
  { id: 27, initial: 'C', name: 'Claudia', city: 'Oaxaca', text: 'Mi hija se perdió en la playa. Un salvavidas escaneó su pulsera QR y en menos de 5 minutos estábamos juntas de nuevo.', color: 'emerald' },
  { id: 28, initial: 'A', name: 'Antonio', city: 'Santo Domingo, R.D.', text: 'Puse un QR en el casco de mi moto. Cuando la grúa se la llevó, el oficial escaneó el código y me contactó. Recuperé mi moto antes de que terminara en el corralón.', color: 'amber' },
  { id: 29, initial: 'S', name: 'Sara', city: 'La Paz', text: 'Mi mochila con la laptop de la chamba se quedó en el parque. Una persona escaneó el QR y me la llevó a mi casa. Todavía existe gente buena.', color: 'violet' },
  { id: 30, initial: 'J', name: 'Jorge', city: 'Panamá City', text: 'Puse QR en las maletas de toda mi familia. En el viaje se confundió una y en 2 minutos ya sabíamos quién la tenía. Game changer.', color: 'emerald' },
  { id: 31, initial: 'L', name: 'Laura', city: 'San Salvador, El Salv.', text: 'Un conductor ebrio chocó mi coche estacionado. El QR me alertó y pude obtener los datos del responsable gracias al testigo que escaneó.', color: 'amber' },
  { id: 32, initial: 'P', name: 'Pedro', city: 'Celaya', text: 'Se me cayó la cartera en el supermercado. Alguien escaneó el QR y me contactó por WhatsApp antes de que saliera del estacionamiento.', color: 'violet' },
];

const colorMap: Record<string, string> = {
  amber: 'bg-gradient-to-br from-amber-500/20 to-amber-500/5 border border-amber-500/10 text-amber-400/60',
  emerald: 'bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 border border-emerald-500/10 text-emerald-400/60',
  violet: 'bg-gradient-to-br from-violet-500/20 to-violet-500/5 border border-violet-500/10 text-violet-400/60',
};

const heroVideos = [
  { src: new URL('../../assets/videos/vid04.mp4', import.meta.url).href, id: 'hero-vid-1' },
  { src: new URL('../../assets/videos/vid02.mp4', import.meta.url).href, id: 'hero-vid-2' },
];

const mutedStates = ref(heroVideos.map(() => true));

const toggleSound = (index: number) => {
  if (!heroVideos[index]) return;
  const video = document.getElementById(heroVideos[index].id) as HTMLVideoElement;
  if (!video) return;

  video.muted = !video.muted;
  mutedStates.value[index] = video.muted;

  if (!video.muted) {
    // Mute other hero videos
    heroVideos.forEach((v, i) => {
      if (i !== index) {
        const otherVideo = document.getElementById(v.id) as HTMLVideoElement;
        if (otherVideo) {
          otherVideo.muted = true;
          mutedStates.value[i] = true;
        }
      }
    });
    video.play();
  }

  toast.info(video.muted ? 'Sonido desactivado' : 'Sonido activado');
};




const qrPlaces = [
  {
    name: 'Automóvil',
    image: car,
  },
  {
    name: 'Hogar',
    image: house,
  },
  {
    name: 'Celular',
    image: smartphone,
  },
  {
    name: 'Bolso',
    image: bag,
  },
  {
    name: 'Maleta',
    image: suitcase,
  },
  {
    name: 'Mascota',
    image: dog,
  },
  {
    name: 'Laptop',
    image: laptop,
  },
  {
    name: 'Familiar',
    image: eldery,
  },
  {
    name: 'Electrónico',
    image: electro, // o laptop/smartphone según prefieras
  },
]
const currentPlace = ref<{ name: string, image: string } | undefined>(qrPlaces[0]);
const switchPlaces = () => {
  setInterval(() => {
    const placeIndexRandom = Math.round(Math.random() * qrPlaces.length - 1);
    currentPlace.value = qrPlaces[placeIndexRandom]
  }, 1600);
}

onMounted(() => {
  switchPlaces()
})

//Frase: Por que localizar es seguridad y tranquilidad
</script>

<template>
  <HomeLayout>
    <template #main>
      <main class="relative bg-gray-50 overflow-hidden font-google-sans">



        <!-- HERO -->
        <section class="px-6 sm:px-10 lg:px-12 pt-24 lg:pt-32 pb-20 relative z-20 min-h-[600px]"
          :style="{ backgroundImage: `url(${currentPlace?.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }">

          <!-- Gradient overlay -->
          <div aria-hidden="true" class="absolute inset-0 -z-10 bg-gradient-to-b from-slate-200/50 to-white to-90%">
          </div>

          <!-- Badge -->
          <div class="flex justify-center">

            <div class="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-5 py-2">

              <span class="material-symbols-outlined text-amber-600 text-[20px]">
                verified_user
              </span>

              <span class="text-sm font-semibold text-slate-700">
                Notificaciones privadas
              </span>

            </div>

          </div>

          <!-- Title -->

          <div class="mx-auto mt-10 max-w-5xl text-center ">

            <h1
              class="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tight leading-[1] text-slate-800">

              Códigos QR para

              <span
                class="mt-4 block bg-gradient-to-r from-blue-600 via-sky-500 to-emerald-500 bg-clip-text text-transparent">

                cuidar su

              </span>

              <div class="relative h-12 sm:h-14 overflow-hidden flex items-center justify-center mt-4">
                <Transition name="slide-up">
                  <div :key="currentPlace?.name"
                    class="bg-gradient-to-r from-blue-600 via-sky-500 to-emerald-500 bg-clip-text text-transparent text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tight leading-[1]">
                    {{ currentPlace?.name }}
                  </div>
                </Transition>
              </div>

            </h1>

          </div>

          <!-- Description -->

          <div class="mx-auto mt-10 max-w-3xl">

            <p class="text-center text-lg sm:text-xl leading-9 text-slate-600">

              Etiquetas físicas y pulseras inteligentes para recuperar
              objetos perdidos, ayudar a mascotas, niños y adultos mayores,
              manteniendo siempre protegida su información personal.

            </p>

          </div>

          <!-- Buttons -->

          <div class="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">

            <router-link :to="{ name: 'register' }"
              class="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-8 py-4 text-white font-semibold transition hover:bg-slate-800">

              Crear cuenta gratis

              <span class="material-symbols-outlined">
                arrow_forward
              </span>

            </router-link>

            <router-link :to="{ name: 'pricing' }"
              class="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-8 py-4 font-semibold text-slate-700 transition hover:bg-slate-50">

              Ver planes

              <span class="material-symbols-outlined">
                payments
              </span>

            </router-link>

          </div>

          <!-- Trust indicators -->

          <div class="mx-auto mt-16 grid max-w-4xl grid-cols-1 gap-6 border-t border-slate-200 pt-10 sm:grid-cols-3">

            <div class="text-center">

              <div class="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50">

                <span class="material-symbols-outlined text-amber-600">

                  notifications_active

                </span>

              </div>

              <h3 class="font-semibold text-slate-900">

                Alertas inmediatas

              </h3>

              <p class="mt-2 text-sm leading-6 text-slate-600">

                Reciba una notificación en segundos cuando alguien
                escanee su código QR.

              </p>

            </div>

            <div class="text-center">

              <div class="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50">

                <span class="material-symbols-outlined text-blue-600">

                  shield_lock

                </span>

              </div>

              <h3 class="font-semibold text-slate-900">

                Privacidad protegida

              </h3>

              <p class="mt-2 text-sm leading-6 text-slate-600">

                Nunca compartimos su información personal.
                Todo el contacto se realiza de forma segura.

              </p>

            </div>

            <div class="text-center">

              <div class="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50">

                <span class="material-symbols-outlined text-emerald-600">

                  public

                </span>

              </div>

              <h3 class="font-semibold text-slate-900">

                Cobertura mundial

              </h3>

              <p class="mt-2 text-sm leading-6 text-slate-600">

                Funciona desde cualquier lugar utilizando
                únicamente un teléfono con internet.

              </p>

            </div>

          </div>

        </section>

        <!-- PRODUCT PREVIEW -->
        <section class="mx-auto max-w-7xl px-6 sm:px-10 lg:px-12 pb-24">

          <!-- Section header -->

          <div class="mx-auto max-w-2xl text-center">

            <span class="text-sm font-semibold tracking-widest uppercase text-blue-600">

              Vista previa

            </span>

            <h2 class="mt-4 text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">

              Así funciona en segundos

            </h2>

            <p class="mt-5 text-lg leading-8 text-slate-600">

              Escanee el código QR desde cualquier teléfono y contacte al
              propietario sin exponer información personal.

            </p>

          </div>

          <!-- Videos -->

          <div class="mt-14 grid grid-cols-1 gap-8 lg:grid-cols-2">

            <div v-for="(video, index) in heroVideos" :key="index"
              class="overflow-hidden rounded-[28px] border border-slate-200 bg-white">

              <!-- Video -->

              <div class="relative bg-slate-100">

                <video :id="video.id" :src="video.src" autoplay muted loop playsinline
                  class="aspect-[4/5] w-full object-cover">
                </video>

              </div>

              <!-- Footer -->

              <div class="flex items-center justify-between border-t border-slate-200 p-6">

                <div>

                  <p class="text-sm font-semibold text-slate-900">

                    Vista previa del producto

                  </p>

                  <p class="mt-1 text-sm text-slate-500">

                    Experiencia real del usuario

                  </p>

                </div>

                <button @click="toggleSound(index)"
                  class="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50">

                  <span class="material-symbols-outlined text-[20px]">

                    {{ mutedStates[index] ? 'volume_off' : 'volume_up' }}

                  </span>

                  <span class="hidden sm:block">

                    {{ mutedStates[index]
                      ? 'Activar sonido'
                      : 'Silenciar' }}

                  </span>

                </button>

              </div>

            </div>

          </div>

          <!-- Bronze -->

          <div v-if="!useUserStore().getUserId"
            class="mt-20 rounded-[32px] border border-amber-200 bg-amber-50 p-8 lg:p-10">

            <div class="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">

              <!-- Left -->

              <div class="flex gap-5">

                <div class="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-amber-500 text-white">

                  <span class="material-symbols-outlined text-3xl">

                    workspace_premium

                  </span>

                </div>

                <div>

                  <span class="text-sm font-semibold uppercase tracking-wider text-amber-700">

                    Promoción de bienvenida

                  </span>

                  <h3 class="mt-2 text-3xl font-bold text-slate-900">

                    Obtenga 1 año de Plan Bronce sin costo

                  </h3>

                  <p class="mt-4 max-w-2xl leading-7 text-slate-600">

                    Cree su cuenta hoy mismo y active automáticamente
                    un año completo del Plan Bronce. Sin contratos,
                    sin pagos ocultos y sin compromiso.

                  </p>

                </div>

              </div>

              <!-- Button -->

              <router-link :to="{ name: 'register' }"
                class="inline-flex items-center justify-center rounded-2xl bg-amber-500 px-8 py-4 font-semibold text-white transition hover:bg-amber-600">

                Activar beneficio

              </router-link>

            </div>

          </div>

        </section>

        <!-- Lightweight Features Grid (full-width, centered) -->
        <!-- FEATURES -->
        <section class="mx-auto max-w-7xl px-6 sm:px-10 lg:px-12 pb-24">

          <!-- Header -->

          <div class="max-w-3xl">

            <span class="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">

              Beneficios

            </span>

            <h2 class="mt-4 text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">

              Diseñado para proteger lo que más le importa

            </h2>

            <p class="mt-5 text-lg leading-8 text-slate-600">

              Cada código QR conecta a la persona que encuentra un objeto
              con su propietario de forma inmediata, segura y privada.

            </p>

          </div>

          <!-- Grid -->

          <div class="mt-14 grid gap-6 lg:grid-cols-2">

            <!-- Alertas -->

            <div class="rounded-[28px] border border-slate-200 bg-white p-8 transition hover:border-amber-300">

              <div class="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50">

                <span class="material-symbols-outlined text-amber-600 text-3xl">

                  notifications_active

                </span>

              </div>

              <h3 class="mt-8 text-2xl font-semibold text-slate-900">

                Alertas inmediatas

              </h3>

              <p class="mt-4 leading-7 text-slate-600">

                Reciba una notificación apenas alguien escanee
                el código QR. La comunicación es prácticamente
                instantánea.

              </p>

            </div>

            <!-- Privacidad -->

            <div class="rounded-[28px] border border-slate-200 bg-white p-8 transition hover:border-blue-300">

              <div class="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50">

                <span class="material-symbols-outlined text-blue-600 text-3xl">

                  shield_lock

                </span>

              </div>

              <h3 class="mt-8 text-2xl font-semibold text-slate-900">

                Privacidad protegida

              </h3>

              <p class="mt-4 leading-7 text-slate-600">

                La persona que encuentra el objeto nunca ve
                su teléfono, correo electrónico ni dirección.
                Toda la información permanece protegida.

              </p>

            </div>

            <!-- Cobertura -->

            <div class="rounded-[28px] border border-slate-200 bg-white p-8 transition hover:border-emerald-300">

              <div class="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50">

                <span class="material-symbols-outlined text-emerald-600 text-3xl">

                  public

                </span>

              </div>

              <h3 class="mt-8 text-2xl font-semibold text-slate-900">

                Cobertura mundial

              </h3>

              <p class="mt-4 leading-7 text-slate-600">

                Funciona desde cualquier país utilizando
                únicamente un teléfono con acceso a internet.
                No depende de aplicaciones específicas.

              </p>

            </div>

            <!-- Sin App -->

            <div class="rounded-[28px] border border-slate-200 bg-white p-8 transition hover:border-violet-300">

              <div class="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50">

                <span class="material-symbols-outlined text-violet-600 text-3xl">

                  install_mobile

                </span>

              </div>

              <h3 class="mt-8 text-2xl font-semibold text-slate-900">

                Sin aplicaciones

              </h3>

              <p class="mt-4 leading-7 text-slate-600">

                Solo debe escanear el código QR.
                El navegador hace todo el trabajo,
                sin instalaciones ni configuraciones.

              </p>

            </div>

          </div>

          <!-- WhatsApp -->

          <div class="mt-20 rounded-[32px] border border-green-200 bg-green-50">

            <div class="flex flex-col gap-8 p-10 lg:flex-row lg:items-center lg:justify-between">

              <!-- Left -->

              <div class="flex gap-5">

                <div class="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-green-500 text-white">

                  <v-icon name="bi-whatsapp" class="text-3xl notranslate" />

                </div>

                <div>

                  <span class="text-sm font-semibold uppercase tracking-[0.2em] text-green-700">

                    WhatsApp

                  </span>

                  <h3 class="mt-2 text-3xl font-bold text-slate-900">

                    Reciba notificaciones en tiempo real

                  </h3>

                  <p class="mt-4 max-w-2xl leading-7 text-slate-600">

                    Cuando alguien encuentre su objeto,
                    recibirá una alerta directamente en
                    WhatsApp sin necesidad de revisar
                    correos electrónicos o instalar
                    aplicaciones adicionales.

                  </p>

                </div>

              </div>

              <!-- Badge -->

              <div class="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 border border-green-200">

                <span class="h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse">

                </span>

                <span class="font-semibold text-green-700">

                  Tiempo real

                </span>

              </div>

            </div>

          </div>

        </section>
        <HowItWorks />
        <VideoGrid />
        <StepByStep />
        <FeaturesComponent />
        <PricingPlans />
      </main>
    </template>
  </HomeLayout>
</template>

<style scoped>
.cursor-custom {
  cursor: url('../../assets/phone_cursor.png'), auto;
}

.font-google-sans {
  font-family: 'Google Sans', sans-serif;
}

.material-symbols-outlined {
  font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}

button {
  transition: all 0.2s ease;
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

.animate-float-fast {
  animation: float 4s ease-in-out infinite;
  animation-delay: 0.5s;
}

/* Infinite scroll testimonials */
@keyframes scroll-up {
  0% {
    transform: translateY(0);
  }

  100% {
    transform: translateY(-50%);
  }
}

.testimonials-mask {
  mask-image: linear-gradient(to bottom,
      transparent 0%,
      black 12%,
      black 88%,
      transparent 100%);
  -webkit-mask-image: linear-gradient(to bottom,
      transparent 0%,
      black 12%,
      black 88%,
      transparent 100%);
}

.testimonials-track {
  animation: scroll-up 120s linear infinite;
}

.testimonials-track:hover {
  animation-play-state: paused;
}

/* Slide-up transition for place name rotation */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-up-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.slide-up-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>
