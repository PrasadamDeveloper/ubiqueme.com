<script setup lang="ts">
import HomeLayout from '@/layouts/HomeLayout.vue';
</script>

<template>
  <HomeLayout>
    <template #main>
      <div class="legal-page">
        <div class="legal-wrapper">
          <header class="legal-header">
            <h1>Política de Privacidad</h1>
            <p class="subtitle">Transparencia y protección de datos en Ubiqueme</p>
            <div class="meta-info">Última actualización: Mayo 2026</div>
          </header>

          <div class="legal-content">
            <section>
              <h3>Alcance del Servicio</h3>
              <p>
                Ubiqueme es una plataforma operada por <strong>AZIECHRIE PHARMA</strong>, empresa legalmente constituida
                en México, responsable del tratamiento de datos personales. El presente documento describe cómo se
                gestiona la información recabada a través de nuestra plataforma de retransmisión de notificaciones
                privadas entre escáneres y propietarios de códigos.
              </p>
            </section>

            <section>
              <h3>Información que Recopilamos</h3>
              <p>
                La plataforma gestiona únicamente los datos estrictamente necesarios para habilitar la comunicación
                entre las partes, clasificados de la siguiente forma:
              </p>
              <ul>
                <li>
                  <strong>Datos del propietario:</strong> nombre, correo electrónico y número telefónico
                  proporcionados voluntariamente al registrar un código. Estos datos son necesarios para recibir
                  notificaciones cuando alguien escanea su código.
                </li>
                <li>
                  <strong>Datos del escáner:</strong> mensaje de texto enviado voluntariamente, fotografía
                  opcional y ubicación aproximada (país, ciudad y región) recabada únicamente al momento del
                  escaneo para fines de registro.
                </li>
                <li>
                  <strong>Datos de operación:</strong> identificadores únicos asociados a cada código, registro
                  de fecha y hora de escaneo, y métricas anónimas de uso del servicio.
                </li>
              </ul>
            </section>

            <section>
              <h3>Protocolo "Privacy Relay"</h3>
              <p>
                Nuestro sistema garantiza que la identidad y los datos de contacto del propietario permanezcan
                protegidos en todo momento. La plataforma actúa como un intermediario cifrado que facilita la
                comunicación entre el escáner y el propietario, sin exponer información personal de ninguna de las
                partes durante el proceso. Ni el escáner tiene acceso a los datos del propietario, ni el propietario
                tiene acceso a los datos del escáner más allá de lo que este último decida compartir voluntariamente en
                su mensaje.
              </p>
            </section>

            <section>
              <h3>Seguridad y Resguardo</h3>
              <p>
                La plataforma opera sobre infraestructura respaldada por proveedores tecnológicos de clase mundial,
                implementando cifrado en tránsito y en reposo, monitoreo continuo de accesos y protocolos de respuesta
                ante incidentes. El acceso a la información está restringido exclusivamente a las funciones necesarias
                para la operación del servicio y el cumplimiento de requerimientos legales aplicables.
              </p>
            </section>

            <section>
              <h3>Derechos del Titular</h3>
              <p>
                Usted mantiene el control sobre su información. En cualquier momento puede consultar, modificar o
                eliminar sus datos de contacto a través de las herramientas dispuestas en su panel de administración.
                Para ejercer cualquiera de estos derechos, puede hacerlo directamente desde la plataforma o mediante
                solicitud al correo de contacto indicado abajo.
              </p>
            </section>

            <section>
              <h3>Contacto</h3>
              <p>
                Para cualquier consulta relacionada con el tratamiento de su información o para ejercer sus derechos de
                privacidad, puede dirigirse a nuestro departamento de gestión de datos a través del correo electrónico:
                <strong>soporte@ubiqueme.com</strong>
              </p>
              <p>
                <strong>AZIECHRIE PHARMA</strong> — Ubiqueme es una marca operada por AZIECHRIE PHARMA. Para
                comunicaciones formales, puede contactar a nuestra oficina legal respondiendo a este correo o a través
                de los canales de atención al cliente dispuestos en nuestro sitio web.
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
  max-width: 900px;
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
  h1 {
    font-size: 2rem;
  }

  .legal-page {
    padding-top: 100px;
  }
}
</style>
