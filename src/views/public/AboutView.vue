<script lang="ts" setup>
import HomeLayout from '@/layouts/HomeLayout.vue'
import { RouterLink } from 'vue-router'

const stats = [
  { value: '15+', label: 'Años de experiencia' },
  { value: 'MX', label: 'Hecho en México' },
  { value: 'SAT + RPPYC', label: 'Empresa formal' },
  { value: '256-bit', label: 'Cifrado SSL' },
]

const protection = [
  {
    icon: 'qr_code_2',
    title: 'Escanean su QR',
    desc: 'Se abre el chat oficial de Ubiqueme en WhatsApp con un mensaje prellenado.',
  },
  {
    icon: 'lock',
    title: 'Su número permanece oculto',
    desc: 'El escáner solo ve la cuenta oficial. Nunca su teléfono ni su identidad.',
  },
  {
    icon: 'notifications_active',
    title: 'Usted recibe la alerta',
    desc: 'Le llega el número, el mensaje y la foto de quien escaneó.',
  },
  {
    icon: 'monitoring',
    title: 'Registro en su dashboard',
    desc: 'Cada escaneo queda guardado con contador e historial.',
  },
]

const values = [
  { icon: 'lock', title: 'Privacidad', desc: 'Sus datos nunca se comparten.' },
  { icon: 'security', title: 'Seguridad', desc: 'Cifrado SSL 256-bit y HTTPS.' },
  { icon: 'volunteer_activism', title: 'Confianza', desc: 'Empresa formal, 15+ años.' },
  { icon: 'bolt', title: 'Inmediatez', desc: 'Alertas en tiempo real por WhatsApp.' },
]
</script>

<template>
  <HomeLayout>
    <template #main>
      <main class="bg-white font-google-sans">

        <!-- Hero + stats -->
        <section class="pt-14 sm:pt-20 pb-12 mt-10">
          <div class="mx-auto max-w-3xl px-5 sm:px-8">
            <header class="text-center">
              <span
                class="inline-block rounded-full bg-orange-50 px-3.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-orange-600">
                Sobre nosotros
              </span>
              <h1 class="mt-4 text-[26px] font-semibold leading-tight tracking-tight text-slate-900 sm:text-4xl">
                Quiénes somos
              </h1>
              <p class="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-slate-500">
                Empresa mexicana con más de 15 años de experiencia. Conectamos personas, objetos y mascotas
                con su dueño mediante un código QR privado y alertas por WhatsApp. Sin aplicaciones.
              </p>
              <div class="mt-6 flex flex-col items-center justify-center gap-2.5 sm:flex-row">
                <RouterLink :to="{ name: 'pricing' }"
                  class="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-orange-500 px-5 text-sm font-bold tracking-wide text-white transition-all duration-300 hover:bg-orange-600 active:scale-[0.98]">
                  Ver planes
                  <span class="material-symbols-outlined notranslate text-[16px]">arrow_forward</span>
                </RouterLink>
                <RouterLink :to="{ name: 'contact' }"
                  class="inline-flex h-10 items-center justify-center rounded-xl bg-slate-100 px-5 text-sm font-bold tracking-wide text-slate-700 border border-slate-200 transition-all duration-300 hover:bg-slate-200 active:scale-[0.98]">
                  Contactar
                </RouterLink>
              </div>
            </header>


          </div>
        </section>

        <!-- Historia + Misión / Visión -->
        <section class="bg-slate-50 py-12">
          <div class="mx-auto max-w-3xl px-5 sm:px-8">
            <div class="grid gap-8 lg:grid-cols-2">
              <div>
                <span class="text-[10px] font-semibold uppercase tracking-[0.18em] text-orange-600">Nuestra
                  historia</span>
                <div class="mt-3 space-y-3 text-sm leading-relaxed text-slate-600">
                  <p>
                    Ubiqueme nace de más de 15 años trabajando con empresas y personas que necesitan
                    soluciones confiables. Creamos una plataforma donde la privacidad es la base.
                  </p>
                  <p>
                    Respaldados por <strong class="font-semibold text-slate-900">AZIECHRIE PHARMA</strong>,
                    empresa mexicana legalmente constituida ante el SAT y el RPPYC.
                  </p>
                </div>
              </div>

              <div class="space-y-2">
                <div class="rounded-xl bg-white border border-slate-200 p-3.5">
                  <p class="text-[10px] font-semibold uppercase tracking-[0.18em] text-orange-600">Misión</p>
                  <p class="mt-1.5 text-[13px] leading-relaxed text-slate-600">
                    Mantener alertadas a las personas sobre lo que aman, con conexiones seguras y privadas.
                  </p>
                </div>
                <div class="rounded-xl bg-white border border-slate-200 p-3.5">
                  <p class="text-[10px] font-semibold uppercase tracking-[0.18em] text-orange-600">Visión</p>
                  <p class="mt-1.5 text-[13px] leading-relaxed text-slate-600">
                    Ser la plataforma de notificaciones QR más confiable, con cobertura mundial.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Protección: iOS grouped list -->
        <section class="py-12">
          <div class="mx-auto max-w-3xl px-5 sm:px-8">
            <span class="block text-center text-[10px] font-semibold uppercase tracking-[0.18em] text-orange-600">
              Protección en acción
            </span>
            <h2 class="mt-2 text-center text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
              ¿Cómo le avisamos cuando escanean su QR?
            </h2>

            <div class="mt-6 rounded-2xl bg-slate-50 overflow-hidden">
              <div v-for="(item, index) in protection" :key="item.title" class="flex items-start gap-3 px-4 py-3"
                :class="index < protection.length - 1 ? 'border-b border-slate-200/70' : ''">
                <div class="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-100">
                  <span class="material-symbols-outlined notranslate text-[14px] text-orange-500">{{ item.icon }}</span>
                </div>
                <div class="min-w-0">
                  <p class="text-[14px] font-medium text-slate-900">{{ item.title }}</p>
                  <p class="text-[12px] leading-relaxed text-slate-500">{{ item.desc }}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Valores -->
        <section class="bg-slate-50 py-12">
          <div class="mx-auto max-w-3xl px-5 sm:px-8">
            <span class="block text-center text-[10px] font-semibold uppercase tracking-[0.18em] text-orange-600">
              Nuestros valores
            </span>
            <h2 class="mt-2 text-center text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
              Diseñado alrededor de confianza
            </h2>

            <div class="mt-6 grid grid-cols-2 gap-2 lg:grid-cols-4">
              <div v-for="value in values" :key="value.title" class="rounded-xl bg-white border border-slate-200 p-3">
                <div class="flex items-center gap-1.5">
                  <span class="material-symbols-outlined notranslate text-[16px] text-orange-500">{{ value.icon
                    }}</span>
                  <h3 class="text-[13px] font-semibold text-slate-900">{{ value.title }}</h3>
                </div>
                <p class="mt-1 text-[11px] leading-snug text-slate-500">{{ value.desc }}</p>
              </div>
            </div>
          </div>
        </section>

        <!-- CTA -->
        <section class="py-12 sm:py-16">
          <div class="mx-auto max-w-3xl px-5 sm:px-8">
            <div class="rounded-2xl border border-orange-200 bg-orange-50/40 px-6 py-7 text-center sm:px-8">
              <h2 class="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">Protege lo que importa</h2>
              <p class="mx-auto mt-2 max-w-md text-[13px] leading-relaxed text-slate-600">
                Activa tu código QR y recibe alertas directamente en WhatsApp.
              </p>
              <RouterLink :to="{ name: 'pricing' }"
                class="mt-5 inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-orange-500 px-5 text-sm font-bold tracking-wide text-white transition-all duration-300 hover:bg-orange-600 active:scale-[0.98]">
                Ver planes
                <span class="material-symbols-outlined notranslate text-[16px]">arrow_forward</span>
              </RouterLink>
            </div>
          </div>
        </section>

      </main>
    </template>
  </HomeLayout>
</template>

<style scoped>
.font-google-sans {
  font-family: 'Google Sans', 'Inter', sans-serif;
}

.material-symbols-outlined {
  font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}
</style>
