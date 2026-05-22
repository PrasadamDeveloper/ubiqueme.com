<script lang="ts" setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import UserDashoardLayout from '@/layouts/UserDashoardLayout.vue'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

const qrNameInput = ref('')
const qrCategory = ref('vehicle')
const qrLayout = ref<'compact' | 'detail'>('compact')
const qrSize = ref('SM (5cm)')
const gluePosition = ref<'frontal' | 'trasero'>('trasero')

const handleSubmit = () => {
  if (!qrNameInput.value.trim()) {
    toast.error('Por favor, ingrese un nombre para su QR.')
    return
  }

  // Lógica principal
  console.log('mensaje enviado')
  
  toast.success('¡Solicitud enviada correctamente!', {
    description: `Hemos recibido su solicitud para el QR "${qrNameInput.value}".`
  })

  // Limpiar formulario
  qrNameInput.value = ''
  qrCategory.value = 'vehicle'
  qrLayout.value = 'compact'
  qrSize.value = 'SM (5cm)'
  gluePosition.value = 'trasero'
}
</script>

<template>
  <UserDashoardLayout>
    <template #main>
      <div class="min-h-screen bg-[#050505] pt-24 pb-8 px-4 md:px-6 font-google-sans relative overflow-hidden">
        
        <!-- Background Ornaments (Cloudflare Style) -->
        <div class="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-orange-500/5 blur-[120px] pointer-events-none"></div>
        <div class="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-500/5 blur-[100px] pointer-events-none"></div>
        <div class="absolute inset-0 opacity-[0.015] pointer-events-none"
          style="background-image:linear-gradient(rgba(255,255,255,.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.5) 1px,transparent 1px);background-size:32px 32px;">
        </div>

        <div class="max-w-6xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 items-start">
          
          <!-- LEFT SECTION: FORM -->
          <div class="space-y-8">
            
            <header class="mb-5">
              <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-orange-500/20 bg-orange-500/10 text-orange-400 text-[10px] font-black uppercase tracking-[0.2em] mb-3">
                <span class="material-symbols-outlined text-[14px]">local_shipping</span>
                Pedidos Físicos
              </div>
              <h1 class="text-3xl md:text-4xl font-black text-white tracking-tight leading-tight">
                Solicite su Código QR.
              </h1>
              <p class="text-white/40 mt-2 text-sm max-w-xl leading-relaxed">
                Personalice y pida sus etiquetas físicas de alta durabilidad. Configuraremos su código, lo asociaremos a su cuenta (<strong class="text-white/70">{{ userStore.getEmail }}</strong>) y lo enviaremos directo a su domicilio.
              </p>
            </header>

            <div class="rounded-[24px] border border-white/10 bg-white/[0.02] backdrop-blur-md p-5 md:p-6 space-y-6 shadow-2xl">
              
              <!-- 1. NAME & CATEGORY -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Name -->
                <div class="space-y-3">
                  <label class="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 ml-1">
                    Nombre del QR
                  </label>
                  <input v-model="qrNameInput" placeholder="Ej. Llantas de refacción, Llaves del coche..."
                    class="w-full h-11 px-4 rounded-xl border border-white/10 bg-black/40 text-sm text-white placeholder:text-white/20 outline-none focus:border-orange-500 focus:bg-white/[0.05] transition-all">
                </div>
                <!-- Category -->
                <div class="space-y-3">
                  <label class="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 ml-1">
                    Categoría
                  </label>
                  <select v-model="qrCategory"
                    class="w-full h-11 px-4 rounded-xl border border-white/10 bg-black/40 text-sm text-white outline-none focus:border-orange-500 cursor-pointer appearance-none transition-all">
                    <option value="vehicle">Vehículos</option>
                    <option value="home">Hogares</option>
                    <option value="phone">Celulares</option>
                    <option value="laptop">Laptops</option>
                    <option value="bags">Mochilas / Maletas</option>
                    <option value="keys">Llaves</option>
                    <option value="pets">Mascotas</option>
                    <option value="documents">Documentos</option>
                    <option value="other">Otro</option>
                  </select>
                </div>
              </div>

              <hr class="border-white/5">

              <!-- 2. LAYOUT FORMAT -->
              <div class="space-y-4">
                <label class="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 ml-1">
                  Formato de Impresión
                </label>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <!-- Compact -->
                  <button @click="qrLayout = 'compact'" class="relative rounded-2xl border p-5 text-left transition-all duration-300 overflow-hidden cursor-pointer"
                    :class="qrLayout === 'compact' ? 'border-orange-500/40 bg-orange-500/10 shadow-[0_0_30px_rgba(249,115,22,0.1)]' : 'border-white/10 bg-black/40 hover:bg-white/[0.04]'">
                    <div class="relative z-10 flex justify-between items-start">
                      <div>
                        <p class="text-sm font-bold text-white mb-1">Diseño Compacto</p>
                        <p class="text-xs text-white/40">Solo incluye el recuadro del código QR.</p>
                      </div>
                      <span class="material-symbols-outlined text-2xl" :class="qrLayout === 'compact' ? 'text-orange-400' : 'text-white/20'">qr_code_2</span>
                    </div>
                  </button>
                  <!-- Detail -->
                  <button @click="qrLayout = 'detail'" class="relative rounded-2xl border p-5 text-left transition-all duration-300 overflow-hidden cursor-pointer"
                    :class="qrLayout === 'detail' ? 'border-orange-500/40 bg-orange-500/10 shadow-[0_0_30px_rgba(249,115,22,0.1)]' : 'border-white/10 bg-black/40 hover:bg-white/[0.04]'">
                    <div class="relative z-10 flex justify-between items-start">
                      <div>
                        <p class="text-sm font-bold text-white mb-1">Diseño Detallado</p>
                        <p class="text-xs text-white/40">Incluye su nombre, descripción y el QR.</p>
                      </div>
                      <span class="material-symbols-outlined text-2xl" :class="qrLayout === 'detail' ? 'text-orange-400' : 'text-white/20'">article</span>
                    </div>
                  </button>
                </div>
              </div>

              <hr class="border-white/5">

              <!-- 3. GLUE POSITION (NEW) -->
              <div class="space-y-4">
                <label class="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/40 ml-1">
                  Posición del Pegamento
                  <span class="material-symbols-outlined text-[14px] text-blue-400" v-tooltip="'Elige de qué lado quieres que el QR tenga adhesivo.'">info</span>
                </label>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <!-- Frontal -->
                  <button @click="gluePosition = 'frontal'" class="relative rounded-2xl border p-5 text-left transition-all duration-300 overflow-hidden cursor-pointer group"
                    :class="gluePosition === 'frontal' ? 'border-blue-500/40 bg-blue-500/10 shadow-[0_0_30px_rgba(59,130,246,0.1)]' : 'border-white/10 bg-black/40 hover:bg-white/[0.04]'">
                    <div class="relative z-10 flex justify-between items-start">
                      <div>
                        <p class="text-sm font-bold text-white mb-1">Pegamento Frontal</p>
                        <p class="text-xs text-white/40 leading-relaxed pr-4">Ideal para pegar <strong>por dentro de cristales</strong> (ej. parabrisas del coche, ventanas). El QR se escanea desde el exterior.</p>
                      </div>
                      <span class="material-symbols-outlined text-3xl transition-transform group-hover:scale-110" :class="gluePosition === 'frontal' ? 'text-blue-400' : 'text-white/20'">flip_to_front</span>
                    </div>
                  </button>
                  <!-- Trasero -->
                  <button @click="gluePosition = 'trasero'" class="relative rounded-2xl border p-5 text-left transition-all duration-300 overflow-hidden cursor-pointer group"
                    :class="gluePosition === 'trasero' ? 'border-blue-500/40 bg-blue-500/10 shadow-[0_0_30px_rgba(59,130,246,0.1)]' : 'border-white/10 bg-black/40 hover:bg-white/[0.04]'">
                    <div class="relative z-10 flex justify-between items-start">
                      <div>
                        <p class="text-sm font-bold text-white mb-1">Pegamento Trasero</p>
                        <p class="text-xs text-white/40 leading-relaxed pr-4">Etiqueta tradicional. Ideal para pegar sobre <strong>superficies opacas</strong> (ej. laptops, llaves, maletas).</p>
                      </div>
                      <span class="material-symbols-outlined text-3xl transition-transform group-hover:scale-110" :class="gluePosition === 'trasero' ? 'text-blue-400' : 'text-white/20'">flip_to_back</span>
                    </div>
                  </button>
                </div>
              </div>

              <hr class="border-white/5">

              <!-- 4. SIZE -->
              <div class="space-y-4">
                <label class="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 ml-1">
                  Tamaño de Impresión
                </label>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <button v-for="size in ['XS (3cm)', 'SM (5cm)', 'MD (10cm)', 'LG (15cm)']" :key="size"
                    @click="qrSize = size" class="h-12 rounded-xl border text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer"
                    :class="qrSize === size ? 'border-orange-500/40 bg-orange-500/10 text-orange-400 shadow-[0_0_20px_rgba(249,115,22,0.15)]' : 'border-white/10 bg-black/40 text-white/50 hover:border-white/30'">
                    {{ size }}
                  </button>
                </div>
              </div>

            </div>

          </div>

          <!-- RIGHT SECTION: SUMMARY & PREVIEW -->
          <div class="sticky top-28 space-y-6">
            
            <div class="rounded-[24px] border border-white/10 bg-white/[0.02] backdrop-blur-md overflow-hidden">
              <!-- Summary Header -->
              <div class="bg-white/[0.03] p-5 border-b border-white/10">
                <h3 class="text-base font-black text-white">Resumen del Pedido</h3>
                <p class="text-xs text-white/40 mt-1">Revise cómo quedará su código</p>
              </div>
              
              <!-- Summary Content -->
              <div class="p-5 space-y-5">
                <!-- Data display -->
                <div class="space-y-4">
                  <div class="flex justify-between items-center text-sm">
                    <span class="text-white/40">Nombre</span>
                    <span class="text-white font-medium text-right max-w-[150px] truncate">{{ qrNameInput || 'Sin definir' }}</span>
                  </div>
                  <div class="flex justify-between items-center text-sm">
                    <span class="text-white/40">Categoría</span>
                    <span class="text-white font-medium capitalize">{{ qrCategory }}</span>
                  </div>
                  <div class="flex justify-between items-center text-sm">
                    <span class="text-white/40">Formato</span>
                    <span class="text-white font-medium capitalize">{{ qrLayout }}</span>
                  </div>
                  <div class="flex justify-between items-center text-sm">
                    <span class="text-white/40">Tamaño</span>
                    <span class="text-white font-medium">{{ qrSize }}</span>
                  </div>
                  <div class="flex justify-between items-center text-sm">
                    <span class="text-white/40">Pegamento</span>
                    <span class="text-blue-400 font-medium capitalize">{{ gluePosition }}</span>
                  </div>
                </div>

                <!-- Fake visual Preview -->
                <div class="w-full h-40 rounded-2xl bg-black/50 border border-white/5 relative flex items-center justify-center overflow-hidden">
                   <!-- Grid bg for preview -->
                   <div class="absolute inset-0 opacity-10 pointer-events-none" style="background-image:linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px);background-size:10px 10px;"></div>
                   
                   <!-- COMPACT -->
                   <div v-if="qrLayout === 'compact'" class="relative z-10 w-20 h-20 bg-white rounded-lg flex items-center justify-center shadow-2xl transition-all duration-500"
                        :class="{'opacity-80 rotate-3': gluePosition === 'frontal'}">
                      <span class="material-symbols-outlined text-black text-[52px]">qr_code_2</span>
                   </div>

                   <!-- DETAIL -->
                   <div v-else class="relative z-10 w-[160px] bg-white rounded-xl shadow-2xl overflow-hidden transition-all duration-500"
                        :class="{'opacity-80 -rotate-1': gluePosition === 'frontal'}">
                     <!-- Card header -->
                     <div class="flex items-center gap-2 px-3 py-2 border-b border-gray-100">
                       <div class="w-5 h-5 rounded bg-orange-500 flex items-center justify-center flex-shrink-0">
                         <span class="material-symbols-outlined text-white" style="font-size:11px">location_on</span>
                       </div>
                       <div class="flex-1 overflow-hidden">
                         <div class="w-3/4 h-1.5 bg-gray-200 rounded mb-1"></div>
                         <div class="w-1/2 h-1 bg-gray-100 rounded"></div>
                       </div>
                     </div>
                     <!-- QR area -->
                     <div class="p-2">
                       <div class="w-full aspect-square bg-gray-50 rounded-lg flex items-center justify-center border border-gray-200">
                         <span class="material-symbols-outlined text-gray-300" style="font-size:52px">qr_code_2</span>
                       </div>
                     </div>
                   </div>
                   
                   <!-- Glue badge overlay -->
                   <div class="absolute top-3 right-3 z-20">
                     <span class="px-2 py-1 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[9px] font-bold uppercase tracking-wider backdrop-blur">
                       Pegamento {{ gluePosition }}
                     </span>
                   </div>
                </div>

                <!-- Submit Action -->
                <button @click="handleSubmit" class="w-full h-14 rounded-2xl bg-white text-black font-black uppercase tracking-[0.15em] text-sm hover:bg-orange-500 hover:text-white transition-all duration-300 shadow-[0_10px_30px_rgba(255,255,255,0.1)] hover:shadow-[0_10px_40px_rgba(249,115,22,0.3)] hover:-translate-y-1 active:translate-y-0 cursor-pointer">
                  Confirmar Pedido
                </button>

                <p class="text-center text-[10px] text-white/30 px-4">
                  Al confirmar su pedido, acepta los términos de producción y envío.
                </p>

              </div>
            </div>

          </div>

        </div>
      </div>
    </template>
  </UserDashoardLayout>
</template>

<style scoped>
.font-google-sans {
  font-family: 'Google Sans', sans-serif;
}
.material-symbols-outlined {
  font-variation-settings: 'FILL' 1, 'wght' 600, 'GRAD' 0, 'opsz' 24;
}
</style>
