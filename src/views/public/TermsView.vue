<script setup lang="ts">
import HomeLayout from '@/layouts/HomeLayout.vue';
</script>

<template>
  <HomeLayout>
    <template #main>
      <div class="legal-page">
        <div class="legal-wrapper">
          <header class="legal-header">
            <h1>Términos de Servicio</h1>
            <p class="subtitle">Marco legal y condiciones de uso</p>
            <div class="meta-info">Última actualización: Mayo 2026</div>
          </header>

          <div class="legal-content">
            <section>
              <h3>Aceptación del Servicio</h3>
              <p>
                Al utilizar los servicios de Ubiqueme, usted acepta quedar vinculado por los términos aquí descritos. Este acuerdo rige el uso de la tecnología de retransmisión y gestión de códigos QR.
              </p>
            </section>

            <section>
              <h3>Naturaleza del Servicio</h3>
              <p>
                Ubiqueme proporciona una plataforma de intermediación tecnológica para facilitar el contacto privado entre propietarios y terceros. El servicio se limita a la retransmisión de notificaciones y no implica responsabilidad sobre los objetos físicos o las acciones de terceros.
              </p>
            </section>

            <section>
              <h3>Uso Responsable</h3>
              <p>El usuario se compromete a:</p>
              <ul>
                <li>Proporcionar información de contacto válida para el funcionamiento de las alertas.</li>
                <li>Utilizar la plataforma exclusivamente para los fines previstos de recuperación y seguridad.</li>
                <li>No utilizar el sistema para comunicaciones no deseadas o actividades que contravengan la ética del servicio.</li>
              </ul>
            </section>

            <section>
              <h3>Propiedad Intelectual</h3>
              <p>
                Todo el software, diseños y marcas asociados a Ubiqueme son propiedad exclusiva de la plataforma. Se concede una licencia de uso personal y no transferible para la gestión de sus códigos QR.
              </p>
            </section>

            <section>
              <h3>Modificaciones del Servicio</h3>
              <p>
                Nos reservamos el derecho de actualizar las funcionalidades y estos términos para mejorar la calidad y seguridad de la retransmisión. Los cambios serán notificados a través de nuestros canales oficiales.
              </p>
            </section>

            <section>
              <h3>Limitación de Responsabilidad</h3>
              <p>
                Ubiqueme actúa como un canal de comunicación. La recuperación efectiva de pertenencias depende de factores externos fuera del control de la plataforma. El servicio se proporciona bajo un modelo de "mejor esfuerzo" técnico.
              </p>
            </section>
          </div>
        </div>
      </div>
    </template>
  </HomeLayout>
</template>

<style scoped>
/* Consistencia total con el diseño de privacidad */
.legal-page {
  background-color: #09090b;
  min-height: 100vh;
  padding: 120px 20px 80px;
}

.legal-wrapper {
  max-width: 700px;
  margin: 0 auto;
}

.legal-header {
  margin-bottom: 64px;
}

h1 {
  font-size: 2.5rem;
  font-weight: 800;
  color: #ffffff;
  letter-spacing: -0.04em;
  margin-bottom: 8px;
}

.subtitle {
  color: #f97316;
  font-size: 0.9rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 16px;
}

.meta-info {
  color: #52525b;
  font-size: 0.8rem;
}

.legal-content {
  color: #a1a1aa;
  font-size: 1rem;
  line-height: 1.7;
}

section {
  margin-bottom: 40px;
}

h3 {
  color: #fafafa;
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 16px;
}

p {
  margin-bottom: 16px;
}

ul {
  list-style: none;
  padding: 0;
}

li {
  position: relative;
  padding-left: 20px;
  margin-bottom: 8px;
}

li::before {
  content: "•";
  color: #f97316;
  position: absolute;
  left: 0;
}

@media (max-width: 768px) {
  h1 { font-size: 2rem; }
  .legal-page { padding-top: 100px; }
}
</style>
