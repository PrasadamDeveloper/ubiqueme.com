<script lang="ts" setup>
import { useRouter } from 'vue-router'
import HomeLayout from '@/layouts/HomeLayout.vue'

const router = useRouter()

const plans = [
  {
    id: 'bronce',
    name: 'Bronce',
    price: '499',
    currency: 'MXN',
    period: '/ año',
    priceNote: '1er envío físico gratis',
    description: 'Protección básica esencial',
    icon: 'shield',
    color: '#ffffff',
    cta: 'Activar Bronce',
    features: [
      { label: 'Hasta 1 código QR activo', included: true },
      { label: 'Contador de escaneos básico', included: true },
      { label: 'Página pública de contacto', included: true },
      { label: 'Mensajes predefinidos de contacto', included: true },
      { label: 'Pausar o reactivar QR', included: false },
      { label: 'Historial de escaneos', included: false },
      { label: 'Ubicación con Mapa dinámico', included: false },
      { label: 'Evidencia fotográfica adjunta', included: false },
      { label: 'Notificaciones por correo', included: false }
    ]
  },
  {
    id: 'plata',
    name: 'Plata',
    price: '999',
    currency: 'MXN',
    period: '/ año',
    priceNote: '1er envío físico gratis',
    description: 'Para quienes toman en serio sus bienes',
    icon: 'verified_user',
    color: '#7bd0ff',
    featured: true,
    cta: 'Activar Plata',
    features: [
      { label: 'Hasta 3 códigos QR activos', included: true },
      { label: 'Contador de escaneos en tiempo real', included: true },
      { label: 'Página pública de contacto', included: true },
      { label: '3 Regeneraciones digitales sin costo', included: true },
      { label: 'Pausar o reactivar QR', included: true },
      { label: 'Historial de escaneos (últimos 30 días)', included: true },
      { label: 'Ubicación aproximada del escaneo', included: true },
      { label: 'Evidencia fotográfica adjunta', included: true },
      { label: 'Notificaciones por correo', included: true }
    ]
  },
  {
    id: 'oro',
    name: 'Oro',
    price: '1499',
    currency: 'MXN',
    period: '/ año',
    priceNote: '1er envío físico gratis',
    description: 'Control total. Sin compromisos.',
    icon: 'military_tech',
    color: '#ffd264',
    cta: 'Seleccionar Oro',
    features: [
      { label: 'Hasta 5 códigos QR activos', included: true },
      { label: 'Ubicación con Mapa dinámico incluido', included: true },
      { label: 'Ubicación aproximada del escaneo', included: true },
      { label: '5 Regeneraciones digitales sin costo', included: true },
      { label: 'Mensajes predefinidos y personalizados', included: true },
      { label: 'Pausar o reactivar QR', included: true },
      { label: 'Historial de escaneos ilimitado', included: true },
      { label: 'Evidencia fotográfica adjunta', included: true },
      { label: 'Notificaciones por correo prioritarias', included: true }
    ]
  }
]

const handleSelect = (id: string) => {
  router.push({ name: 'checkout', params: { planId: id } })
}
</script>

<template>
  <HomeLayout>
    <template #main>
      <div class="bg-[#070b14] font-google-sans pt-32 pb-20 px-6 min-h-screen">
        <div class="max-w-6xl mx-auto">

          <!-- Hero Section -->
          <header class="text-center mb-24 space-y-4">
            <div class="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-lg border border-primary/20">
              <span class="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
              <span class="text-[9px] font-black uppercase tracking-[0.4em] text-primary">Planes de Protección</span>
            </div>
            <h1 class="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase leading-none">
              Elegir <span class="text-primary italic">Plan</span>
            </h1>
            <p class="max-w-xl mx-auto text-white/40 text-sm md:text-base font-medium leading-relaxed mt-4">
              Elija el nivel de blindaje que mejor se adapte a sus necesidades. Sin contratos forzosos ni complicaciones.
            </p>
          </header>

          <!-- Pricing Grid -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 items-stretch">
            <div v-for="plan in plans" :key="plan.id" :class="[
              'relative flex flex-col p-8 rounded-[2rem] border transition-all duration-300',
              plan.featured 
                ? 'bg-[#0f1524] border-primary/30 md:-translate-y-4 md:scale-[1.02] shadow-[0_0_40px_rgba(123,208,255,0.05)]' 
                : 'bg-white/[0.02] border-white/10 hover:border-white/20 hover:bg-white/[0.04]'
            ]">
              
              <!-- Badge -->
              <div v-if="plan.featured" class="absolute -top-4 left-1/2 -translate-x-1/2">
                <div class="px-5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.3em] bg-primary text-[#070b14] whitespace-nowrap">
                  Más Popular
                </div>
              </div>

              <!-- Header -->
              <div class="flex items-center justify-between mb-8">
                <div>
                  <p class="text-[10px] font-black uppercase tracking-[0.4em] mb-1" :style="{ color: plan.featured ? '#7bd0ff' : 'rgba(255,255,255,0.4)' }">
                    Plan
                  </p>
                  <h3 class="text-3xl font-black text-white tracking-tight leading-none uppercase">{{ plan.name }}</h3>
                </div>
                <div class="w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0"
                  :style="plan.featured ? { borderColor: 'rgba(123,208,255,0.3)', background: 'rgba(123,208,255,0.1)' } : { borderColor: 'rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)' }">
                  <span class="material-symbols-outlined text-xl" :style="{ color: plan.color }">
                    {{ plan.icon }}
                  </span>
                </div>
              </div>

              <!-- Price -->
              <div class="mb-8 pb-8 border-b border-white/[0.06]">
                <div class="flex items-baseline gap-2">
                  <span class="text-5xl font-black text-white tracking-tighter">{{ plan.currency ? `$${plan.price}` : plan.price }}</span>
                  <span v-if="plan.period" class="text-white/20 text-xs font-black uppercase tracking-widest">{{ plan.period }}</span>
                </div>
                <p class="text-white/40 text-[10px] font-bold mt-2 h-4 uppercase tracking-widest">{{ plan.priceNote }}</p>
                <p class="text-white/60 text-sm font-medium mt-4 min-h-[2.5rem]">{{ plan.description }}</p>
              </div>

              <!-- Features -->
              <ul class="flex-1 space-y-4 mb-10">
                <li v-for="(feature, idx) in plan.features" :key="idx" class="flex items-start gap-3">
                  <div class="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5" 
                    :style="feature.included 
                      ? (plan.featured ? { background: 'rgba(123,208,255,0.15)', color: '#7bd0ff' } : { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.8)' })
                      : { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.2)' }">
                    <span class="material-symbols-outlined text-[12px]! font-black">{{ feature.included ? 'check' : 'remove' }}</span>
                  </div>
                  <span class="text-sm font-medium leading-snug" 
                    :class="feature.included 
                      ? (plan.featured ? 'text-white/90' : 'text-white/80') 
                      : 'text-white/20 line-through decoration-white/10'">
                    {{ feature.label }}
                  </span>
                </li>
              </ul>

              <!-- CTA -->
              <button @click="handleSelect(plan.id)" class="w-full h-14 rounded-2xl font-black text-xs uppercase tracking-widest transition-all duration-300 active:scale-[0.97] border flex items-center justify-center gap-2"
                :class="plan.featured ? 'bg-primary text-[#070b14] border-primary hover:bg-primary/90' : 'bg-white/5 border-white/10 text-white hover:bg-white/10'">
                {{ plan.cta }}
                <span v-if="plan.featured" class="material-symbols-outlined text-[16px] font-black">arrow_forward</span>
              </button>
            </div>
          </div>

          <!-- Shipping Info Card -->
          <div class="mt-16 max-w-3xl mx-auto p-6 rounded-[2rem] border border-primary/20 bg-primary/5 text-center space-y-3">
            <div class="inline-flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
              <span class="material-symbols-outlined text-[16px]">local_shipping</span>
              Información de Envío Física (Sólo México)
            </div>
            <p class="text-sm text-white/80 leading-relaxed">
              Cada plan incluye <strong class="text-primary">1 envío físico gratuito</strong> a cualquier parte de la República Mexicana.
            </p>
            <p class="text-xs text-white/60 leading-relaxed">
              💡 <strong class="text-white">Recomendación importante:</strong> Le sugerimos solicitar todos los códigos QR permitidos en su plan (1 en Bronce, 3 en Plata, 5 en Oro) en su primer envío gratuito. Los QRs adicionales o solicitados posteriormente siguen siendo completamente gratuitos, pero se cobrará una tarifa de de envío de <strong class="text-white">$199 MXN</strong> por paquete.
            </p>
          </div>

        </div>
      </div>
    </template>
  </HomeLayout>
</template>

<style scoped>
.font-google-sans {
  font-family: 'Google Sans', 'Inter', sans-serif;
}

.material-symbols-outlined {
  font-variation-settings: 'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 24;
}
</style>
