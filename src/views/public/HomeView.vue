<script lang="ts" setup>
import FeaturesComponent from '@/components/home/Features/FeaturesComponent.vue'
import HowItWorks from '@/components/home/HowItWorks/HowItWorks.vue'
import PricingPlans from '@/components/home/Pricing/PricingPlans.vue'
import StepByStep from '@/components/home/StepByStep/StepByStep.vue'
import VideoGrid from '@/components/home/VideoGrid/VideoGrid.vue'
import HomeLayout from '@/layouts/HomeLayout.vue'
import { useUserStore } from '@/stores/user';
import { ref } from 'vue';
import { toast } from 'vue-sonner';

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
</script>

<template>
  <HomeLayout>
    <template #main>
      <main class="relative bg-[#09090b] overflow-hidden font-google-sans">

        <!-- 🎨 BACKGROUND ORNAMENTATION (Blueprint Style) -->
        <div class="absolute inset-0 z-0">
          <div
            class="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] border border-white/5 rounded-full pointer-events-none">
          </div>
          <div
            class="absolute top-[-5%] right-[-5%] w-[400px] h-[400px] border border-white/5 rounded-full pointer-events-none">
          </div>
          <div class="absolute inset-0 z-0 opacity-[0.22]"
            style="background-image: linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px); background-size: 100px 100px;">
          </div>
        </div>

        <!-- ✨ DECORATIVE FLOATING ICONS -->
        <div class="absolute inset-0 pointer-events-none overflow-hidden z-[5] select-none">
          <!-- QR Icon Top Left -->
          <span
            class="material-symbols-outlined notranslate absolute top-[15%] left-[5%] text-amber-500/20 text-8xl animate-float-slow">qr_code_2</span>
          <!-- Smartphone Mid Right -->
          <span
            class="material-symbols-outlined notranslate absolute top-[40%] right-[8%] text-red-500/20 text-9xl animate-float-medium">smartphone</span>
          <!-- Alert Bottom Left -->
          <span
            class="material-symbols-outlined notranslate absolute bottom-[20%] left-[10%] text-amber-500/20 text-7xl animate-float-fast">notifications_active</span>
          <!-- Security Top Right -->
          <span
            class="material-symbols-outlined notranslate absolute top-[10%] right-[15%] text-white/10 text-[12rem] animate-float-slow">security</span>
          <!-- Location Mid Left -->
          <span
            class="material-symbols-outlined notranslate absolute top-[60%] left-[15%] text-amber-500/15 text-6xl animate-float-medium">location_on</span>
          <!-- Pets Bottom Right -->
          <span
            class="material-symbols-outlined notranslate absolute bottom-[10%] right-[12%] text-red-500/20 text-8xl animate-float-slow">pets</span>
          <!-- Shopping Bag scattered -->
          <span
            class="material-symbols-outlined notranslate absolute top-[25%] right-[30%] text-white/10 text-5xl animate-float-fast">shopping_bag</span>
          <!-- Emergency scattered -->
          <span
            class="material-symbols-outlined notranslate absolute bottom-[45%] left-[5%] text-amber-500/20 text-[10rem] animate-float-medium">emergency_share</span>
          <!-- Shield Mid Right -->
          <span
            class="material-symbols-outlined notranslate absolute top-[75%] right-[25%] text-white/10 text-7xl animate-float-slow">verified_user</span>
        </div>


        <article class="relative z-10 w-full flex flex-col lg:flex-row pt-24 lg:pt-32 px-6 sm:px-8  gap-12 lg:gap-8">

          <!-- Left Content -->
          <section class="w-full lg:w-1/2 flex flex-col items-center lg:items-start text-center lg:text-left relative">

            <!-- Live QR Tag (Mobile Hidden or Responsive) -->
            <div class="hidden  absolute -left-12 top-0 flex-col items-center gap-3 animate-float-medium z-20">
              <div
                class="bg-white p-3 rounded-2xl shadow-[0_0_50px_rgba(255,255,255,0.1)] border border-white/20 hover:scale-110 transition-transform">
                <QrcodeVue value="https://ubiqueme.com" :size="80" render-as="canvas" />
              </div>
              <span
                class="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 rotate-90 origin-left translate-x-4 mt-8">Escanee
                para probar</span>
            </div>

            <!-- Subtle Badge -->
            <div
              class="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 rounded-full border border-amber-500/20 mb-8 transition-colors hover:bg-amber-500/20 cursor-default">
              <span class="material-symbols-outlined notranslate text-amber-500 text-sm">enhanced_encryption</span>
              <span class="text-[11px] font-black uppercase tracking-[0.2em] text-amber-500">Privacidad Absoluta</span>
            </div>

            <!-- Main Headline -->
            <h1 class="text-4xl sm:text-6xl lg:text-[4rem] font-black text-white tracking-tight mb-6 leading-[1.1]">
              Códigos QR inteligentes para<br />
              <div class="flex justify-center items-center">
                <span class="text-transparent bg-clip-text bg-linear-to-r m-0! p-0! from-white to-white/80">recibir
                  alertas
                  de su familia y
                  pertenencias.</span>
                <article class="p-2 bg-white rounded-xl pb-8 relative">
                  <qrcode-vue value="https://ubiqueme.com" :size="100" render-as="canvas" />
                  <span
                    class="absolute bottom-2 left-1/2 -translate-x-1/2 text-sm text-black/50 leading-tight">ubiqueme.com</span>
                </article>
              </div>
            </h1>

            <!-- Sub-headline -->
            <p class="text-white/50 text-lg sm:text-xl font-medium leading-relaxed max-w-2xl mb-10">
              Etiquetas físicas y pulseras que permiten a cualquiera reportar sus artículos perdidos o asistir a sus
              mascotas, niños y adultos mayores al instante, manteniendo su información de contacto 100% oculta.
            </p>

            <!-- Premium Feature Grid -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full max-w-2xl mb-6">
              <!-- Card 1: Alertas Inmediatas -->
              <div
                class="group relative overflow-hidden rounded-xl bg-white/[0.03] border border-white/[0.06] p-6 transition-all duration-500 hover:scale-[1.02] hover:bg-gradient-to-br hover:from-amber-500/[0.08] hover:to-transparent hover:border-amber-500/40 hover:shadow-[0_0_30px_rgba(245,158,11,0.15)] cursor-default">
                <span
                  class="absolute top-3 right-3 font-mono text-[11px] font-bold text-white/[0.06] select-none pointer-events-none leading-none">01</span>
                <span
                  class="material-symbols-outlined notranslate text-4xl text-amber-400 group-hover:scale-110 group-hover:drop-shadow-[0_0_15px_rgba(245,158,11,0.5)] transition-all duration-500">notifications_active</span>
                <h3 class="text-white font-bold text-base tracking-wide mt-3">Alertas Inmediatas</h3>
                <p class="text-white/60 text-sm leading-relaxed mt-1.5">Se activa al instante cuando alguien escanea su
                  código. Usted recibe la notificación al segundo, sin importar dónde se encuentre.</p>
              </div>
              <!-- Card 2: Privacidad Total -->
              <div
                class="group relative overflow-hidden rounded-xl bg-white/[0.03] border border-white/[0.06] p-6 transition-all duration-500 hover:scale-[1.02] hover:bg-gradient-to-br hover:from-blue-500/[0.08] hover:to-transparent hover:border-blue-500/40 hover:shadow-[0_0_30px_rgba(59,130,246,0.15)] cursor-default">
                <span
                  class="absolute top-3 right-3 font-mono text-[11px] font-bold text-white/[0.06] select-none pointer-events-none leading-none">02</span>
                <span
                  class="material-symbols-outlined notranslate text-4xl text-blue-400 group-hover:scale-110 group-hover:drop-shadow-[0_0_15px_rgba(59,130,246,0.5)] transition-all duration-500">vpn_key</span>
                <h3 class="text-white font-bold text-base tracking-wide mt-3">Privacidad Total</h3>
                <p class="text-white/60 text-sm leading-relaxed mt-1.5">Su información personal nunca queda expuesta.
                  Nosotros actuamos como puente seguro entre usted y quien encuentra sus pertenencias.</p>
              </div>
              <!-- Card 3: Cobertura Global -->
              <div
                class="group relative overflow-hidden rounded-xl bg-white/[0.03] border border-white/[0.06] p-6 transition-all duration-500 hover:scale-[1.02] hover:bg-gradient-to-br hover:from-emerald-500/[0.08] hover:to-transparent hover:border-emerald-500/40 hover:shadow-[0_0_30px_rgba(16,185,129,0.15)] cursor-default">
                <span
                  class="absolute top-3 right-3 font-mono text-[11px] font-bold text-white/[0.06] select-none pointer-events-none leading-none">03</span>
                <span
                  class="material-symbols-outlined notranslate text-4xl text-emerald-400 group-hover:scale-110 group-hover:drop-shadow-[0_0_15px_rgba(16,185,129,0.5)] transition-all duration-500">public</span>
                <h3 class="text-white font-bold text-base tracking-wide mt-3">Cobertura Global</h3>
                <p class="text-white/60 text-sm leading-relaxed mt-1.5">Sin importar dónde esté, si hay señal, su código
                  funciona. Así de simple, en cualquier rincón del mundo.</p>
              </div>
              <!-- Card 4: Sin App. Sin Instalación. -->
              <div
                class="group relative overflow-hidden rounded-xl bg-white/[0.03] border border-white/[0.06] p-6 transition-all duration-500 hover:scale-[1.02] hover:bg-gradient-to-br hover:from-violet-500/[0.08] hover:to-transparent hover:border-violet-500/40 hover:shadow-[0_0_30px_rgba(139,92,246,0.15)] cursor-default">
                <span
                  class="absolute top-3 right-3 font-mono text-[11px] font-bold text-white/[0.06] select-none pointer-events-none leading-none">04</span>
                <span
                  class="material-symbols-outlined notranslate text-4xl text-violet-400 group-hover:scale-110 group-hover:drop-shadow-[0_0_15px_rgba(139,92,246,0.5)] transition-all duration-500">install_mobile</span>
                <h3 class="text-white font-bold text-base tracking-wide mt-3">Sin App. Sin Instalación.</h3>
                <p class="text-white/60 text-sm leading-relaxed mt-1.5">No necesita descargar nada. Todo funciona
                  directo desde su navegador web. Abre, escanea, recibe alertas. Así de simple.</p>
              </div>
            </div>

            <!-- Featured Card: WhatsApp (col-span-2 destacado) -->
            <div
              class="group relative overflow-hidden w-full max-w-2xl mb-10 rounded-xl bg-gradient-to-r from-green-500/[0.04] to-green-500/[0.01] border border-green-500/20 p-6 transition-all duration-500 hover:scale-[1.01] hover:border-green-500/50 hover:shadow-[0_0_40px_rgba(34,197,94,0.12)] cursor-default sm:col-span-2">
              <!-- Glow edge top -->
              <div
                class="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-green-500/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              </div>
              <!-- Featured badge -->
              <div
                class="absolute -top-[1px] right-6 px-3 py-1 bg-green-500/10 border border-green-500/30 rounded-b-lg text-[9px] font-black uppercase tracking-[0.2em] text-green-400">
                ★ Destacado
              </div>
              <div class="flex items-start gap-5">
                <div
                  class="shrink-0 w-14 h-14 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center group-hover:scale-110 group-hover:shadow-[0_0_25px_rgba(34,197,94,0.2)] transition-all duration-500">
                  <v-icon name="bi-whatsapp" class="text-3xl text-green-400 notranslate" />
                </div>
                <div class="flex-1 min-w-0">
                  <h3 class="text-white font-bold text-lg tracking-tight">Notificaciones por WhatsApp</h3>
                  <p class="text-white/60 text-sm leading-relaxed mt-1.5 max-w-xl">Cuando alguien escanea su código,
                    usted recibe una alerta directa por WhatsApp al instante. Sin correos, sin apps adicionales, sin
                    complicaciones.</p>
                </div>
                <div
                  class="hidden sm:flex shrink-0 items-center gap-2 px-4 py-2 rounded-lg bg-green-500/5 border border-green-500/10 text-green-400/60 text-[10px] font-black uppercase tracking-widest">
                  <span class="material-symbols-outlined notranslate text-sm">bolt</span>
                  Tiempo real
                </div>
              </div>
            </div>

            <!-- Free Trial Banner -->
            <div
              class="w-full max-w-2xl mb-8 p-4 rounded-xl bg-gradient-to-r from-amber-500/[0.06] to-amber-500/[0.02] border border-amber-500/20 flex items-center gap-3">
              <span class="material-symbols-outlined notranslate text-2xl text-amber-400 shrink-0">rocket_launch</span>
              <p class="text-white/70 text-sm leading-relaxed">
                <strong class="text-amber-400 font-semibold">30 días gratis, sin tarjeta de crédito.</strong>
                Active su código QR hoy y pruebe todas las funciones sin compromiso.
              </p>
            </div>

            <!-- CTA Buttons -->
            <div class="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto hidden">
              <router-link :to="{ name: 'pricing' }"
                class="w-full max-w-xs flex justify-center items-center gap-2 px-6 py-3 bg-slate-700/50 border border-white/20 text-amber-400 font-semibold rounded-lg hover:bg-amber-400 hover:text-black transition-all duration-300">
                Obtener mi Código QR <span class="material-symbols-outlined notranslate">qr_code_scanner</span>
              </router-link>


              <router-link v-if="!useUserStore().getUserId" :to="{ name: 'login' }"
                class="w-full sm:w-auto px-6 py-3 bg-transparent border border-[#ff9800]/50 text-[#ff9800] font-bold text-sm tracking-wider rounded-lg hover:bg-[#ff9800]/10 hover:border-[#ff9800] transition-all duration-200 text-center">
                INICIAR SESIÓN
              </router-link>
            </div>

          </section>

          <!-- Right Content: Responsive Video Grid -->
          <section class="w-full lg:w-1/2 flex flex-col gap-6 lg:gap-8 items-center">
            <div v-for="(video, index) in heroVideos" :key="index"
              class="relative w-full max-w-md lg:max-w-none rounded-[2rem] overflow-hidden group border border-white/10 bg-[#09090b]">

              <!-- Main video -->
              <video :id="video.id" :src="video.src" autoplay muted loop playsinline
                class="w-full h-auto object-cover drop-shadow-2xl main-video">
              </video>

              <div
                class="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors pointer-events-none z-20">
              </div>

              <!-- Sound Toggle Button -->
              <button @click="toggleSound(index)"
                class="absolute bottom-1 right-1 z-30 p-3 gap-2 flex items-center bg-black/60 backdrop-blur-md border border-white/10 text-white rounded-full hover:bg-amber-500 transition-all hover:scale-[1.01] cursor-pointer shadow-lg">
                <span>Haga click para {{ !mutedStates[index] ? 'apagar' :
                  'encender' }} el sonido</span>
                <span class="material-symbols-outlined notranslate text-xl">{{ mutedStates[index] ? 'volume_off' :
                  'volume_up'
                }}</span>
              </button>
            </div>

            <!-- Testimonios Reales (infinite scroll, 32 casos de uso) -->
            <div class="w-full max-w-md lg:max-w-none">
              <div class="flex items-center gap-2 mb-3">
                <span class="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Lo que dicen nuestros
                  usuarios</span>
                <div class="h-px flex-1 bg-white/5"></div>
              </div>

              <div
                class="testimonials-mask relative w-full h-[340px] lg:h-[460px] overflow-hidden rounded-xl border border-white/[0.04]">

                <!-- Fade edges top/bottom -->
                <div
                  class="absolute top-0 left-0 right-0 h-8 z-10 bg-gradient-to-b from-[#09090b] to-transparent pointer-events-none">
                </div>
                <div
                  class="absolute bottom-0 left-0 right-0 h-8 z-10 bg-gradient-to-t from-[#09090b] to-transparent pointer-events-none">
                </div>

                <!-- Infinite scroll track -->
                <div class="testimonials-track space-y-3 px-3">
                  <div v-for="(t, i) in [...testimonials, ...testimonials]" :key="'t-' + i"
                    class="group rounded-xl bg-white/[0.02] border border-white/[0.06] p-4 transition-all duration-300 hover:bg-white/[0.04] hover:border-white/10 cursor-default">
                    <div class="flex items-start gap-3">
                      <div class="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-black"
                        :class="colorMap[t.color]">
                        {{ t.initial }}
                      </div>
                      <div class="flex-1 min-w-0">
                        <p class="text-white/70 text-sm leading-relaxed">"{{ t.text }}"
                        </p>
                        <div class="flex items-center gap-2 mt-2">
                          <span class="text-white/30 text-[10px] font-medium">— {{ t.name }}, {{ t.city }}</span>
                          <span class="text-amber-400/60 text-[10px]">★★★★★</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

        </article>

        <!-- Lightweight Features Grid (full-width, centered) -->
        <div class="w-full flex justify-center px-6 sm:px-8 mt-24 pt-12 border-t border-white/5">
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-10 sm:gap-16 max-w-3xl w-full">
            <div class="flex flex-col items-center gap-2 text-white/40 group text-center">
              <span
                class="material-symbols-outlined notranslate text-2xl mb-1 text-amber-500 group-hover:scale-110 transition-transform">notifications_active</span>
              <span class="text-xs font-black uppercase tracking-widest text-white/60">Alertas Inmediatas</span>
            </div>
            <div class="flex flex-col items-center gap-2 text-white/40 group text-center">
              <span
                class="material-symbols-outlined notranslate text-2xl mb-1 text-amber-500 group-hover:scale-110 transition-transform">vpn_key</span>
              <span class="text-xs font-black uppercase tracking-widest text-white/60">Cero Datos Expuestos</span>
            </div>
            <div class="flex flex-col items-center gap-2 text-white/40 group text-center">
              <span
                class="material-symbols-outlined notranslate text-2xl mb-1 text-amber-500 group-hover:scale-110 transition-transform">public</span>
              <span class="text-xs font-black uppercase tracking-widest text-white/60">Cobertura Global</span>
            </div>
          </div>
        </div>

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
</style>
