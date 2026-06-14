<script setup lang="ts">
import HomeLayout from '@/layouts/HomeLayout.vue';
</script>

<template>
  <HomeLayout>
    <template #main>
      <div class="legal-page">
        <div class="legal-wrapper">
          <header class="legal-header">
            <h1>Eliminación de Datos</h1>
            <p class="subtitle">Instrucciones para la supresión de información</p>
          </header>

          <div class="legal-content">
            <section>
              <h3>Solicitud de Eliminación</h3>
              <p>
                En cumplimiento con las normativas de protección de datos, Ubiqueme facilita a sus usuarios la eliminación total de su información personal de nuestros sistemas.
              </p>
            </section>

            <section>
              <h3>Pasos para eliminar su cuenta</h3>
              <p>
                Para eliminar su cuenta y todos los datos asociados, siga estos pasos:
              </p>
              <ul>
                <li>Inicie sesión en su panel de administración.</li>
                <li>Diríjase a la sección de "Configuración" o "Perfil".</li>
                <li>Seleccione la opción "Eliminar Cuenta".</li>
                <li>Confirme la acción. Todos sus datos, incluyendo QRs registrados y registros de actividad, serán borrados permanentemente.</li>
              </ul>
            </section>

            <section>
              <h3>Contacto de Soporte</h3>
              <p>
                Si tiene dificultades para acceder a su cuenta o prefiere que realicemos el proceso manualmente, envíe un correo electrónico a <strong>soporte@ubiqueme.com</strong> con el asunto "Solicitud de eliminación de datos" desde la dirección de correo asociada a su cuenta.
              </p>
            </section>
          </div>
        </div>
      </div>
    </template>
  </HomeLayout>
</template>

<style scoped>
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
</style>
