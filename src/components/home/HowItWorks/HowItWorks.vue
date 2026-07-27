<template>
  <section class=" px-5 sm:px-8 lg:px-10 py-2 sm:py-4 bg-linear from-neutral-100 via-neutral-50 from-neutral-200">

    <!-- Header + Ads -->
    <div class="flex flex-row items-start justify-between gap-8 mb-10 sm:mb-14">

      <section class="max-w-2xl">
        <span class="text-xs font-semibold uppercase tracking-[0.18em] text-orange-600">
          Cómo funciona
        </span>
        <h2 class="mt-3 text-3xl sm:text-4xl font-semibold tracking-tight text-slate-950">
          Protección en
          <span class="text-orange-500">3 simples pasos</span>
        </h2>
        <p class="mt-4 text-base sm:text-lg leading-7 text-slate-600">
          Un sistema diseñado para conectar a quien encuentra
          su pertenencia con usted de forma segura, rápida y privada.
        </p>
      </section>

      <!-- Publicidad -->
      <aside class="hidden lg:block flex-1  rounded-xl border border-slate-200 bg-slate-50/60 p-4">
        <span class="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
          Publicidad
        </span>
        <div class="mt-3 space-y-3">
          <a href="https://cuentahackeada.com" target="_blank" rel="noopener noreferrer"
            class="block rounded-lg border border-slate-200 bg-white p-3 transition hover:border-slate-300 hover:shadow-xs">
            <span class="text-xs font-semibold text-slate-700">cuentahackeada.com</span>
            <p class="mt-0.5 text-[11px] leading-4 text-slate-500">
              Prevenga ser hackeado con herramientas de seguridad para sus cuentas.
            </p>
          </a>
          <a href="https://losestafadores.com" target="_blank" rel="noopener noreferrer"
            class="block rounded-lg border border-slate-200 bg-white p-3 transition hover:border-slate-300 hover:shadow-xs">
            <span class="text-xs font-semibold text-slate-700">losestafadores.com</span>
            <p class="mt-0.5 text-[11px] leading-4 text-slate-500">
              Comparta experiencias y prevenga a otros usuarios para no caer en estafas.
            </p>
          </a>
        </div>
      </aside>

    </div>



    <!-- Steps -->

    <div class="grid gap-8 md:grid-cols-3">

      <!-- Step -->

      <article class="relative flex gap-4 md:block">

        <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700 md:mb-5">
          <span class="material-symbols-outlined text-2xl">
            qr_code_2
          </span>
        </div>

        <div>

          <span class="text-xs font-semibold text-slate-400">
            PASO 01
          </span>

          <h3 class="mt-1 text-lg font-semibold text-slate-950">
            Adhiera su código
          </h3>

          <p class="mt-2 text-sm leading-6 text-slate-600">
            Coloque la etiqueta en su objeto, vehículo o accesorio.
            Sin configuraciones complicadas.
          </p>

        </div>

      </article>



      <article class="relative flex gap-4 md:block">

        <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700 md:mb-5">
          <span class="material-symbols-outlined text-2xl">
            document_scanner
          </span>
        </div>

        <div>

          <span class="text-xs font-semibold text-slate-400">
            PASO 02
          </span>

          <h3 class="mt-1 text-lg font-semibold text-slate-950">
            Alguien lo escanea
          </h3>

          <p class="mt-2 text-sm leading-6 text-slate-600">
            Solo necesita abrir la cámara del teléfono.
            No requiere instalar aplicaciones.
          </p>

        </div>

      </article>



      <article class="relative flex gap-4 md:block">

        <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700 md:mb-5">

          <span class="material-symbols-outlined text-2xl">
            mark_email_unread
          </span>

        </div>

        <div>

          <span class="text-xs font-semibold text-slate-400">
            PASO 03
          </span>

          <h3 class="mt-1 text-lg font-semibold text-slate-950">
            Recibe la alerta
          </h3>

          <p class="mt-2 text-sm leading-6 text-slate-600">
            El sistema le notifica manteniendo su información
            protegida mediante comunicación anónima.
          </p>

        </div>

      </article>


    </div>



    <!-- Trust Features -->

    <div class="mt-12 border-t border-slate-200 pt-8">

      <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">


        <div class="flex gap-3">

          <span class="material-symbols-outlined text-slate-700">
            gpp_good
          </span>

          <div>
            <h4 class="text-sm font-semibold text-slate-950">
              Datos protegidos
            </h4>

            <p class="mt-1 text-xs leading-5 text-slate-600">
              Su información personal nunca queda expuesta.
            </p>
          </div>

        </div>



        <div class="flex gap-3">

          <span class="material-symbols-outlined text-slate-700">
            bolt
          </span>

          <div>
            <h4 class="text-sm font-semibold text-slate-950">
              Sin aplicaciones
            </h4>

            <p class="mt-1 text-xs leading-5 text-slate-600">
              Funciona directamente desde cualquier navegador.
            </p>
          </div>

        </div>



        <div class="flex gap-3">

          <span class="material-symbols-outlined text-slate-700">
            chat
          </span>

          <div>
            <h4 class="text-sm font-semibold text-slate-950">
              Contacto flexible
            </h4>

            <p class="mt-1 text-xs leading-5 text-slate-600">
              WhatsApp, llamada, SMS o correo sin revelar datos.
            </p>
          </div>

        </div>



        <div class="flex gap-3">

          <span class="material-symbols-outlined text-slate-700">
            public
          </span>

          <div>
            <h4 class="text-sm font-semibold text-slate-950">
              Alcance global
            </h4>

            <p class="mt-1 text-xs leading-5 text-slate-600">
              Protección disponible desde cualquier lugar.
            </p>
          </div>

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
