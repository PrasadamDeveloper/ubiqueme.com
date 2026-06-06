# Consulta sobre WhatsApp Cloud API — Ubiqueme

Hola, soy desarrollador de **Ubiqueme** (una plataforma de códigos QR para negocios).

Ya tenemos la empresa verificada en Meta Business, una app creada con WhatsApp Cloud API, y un worker en Cloudflare que envía los mensajes. El webhook ya responde correctamente y tenemos el `PHONE_NUMBER_ID` y `ACCESS_TOKEN` configurados.

Pero no sabemos si ya podemos usar WhatsApp en **producción** (enviar mensajes a números reales de usuarios) o si falta algo. Mi duda concreta:

1. **¿La app ya está en producción o en desarrollo?** Si está en desarrollo, ¿qué se necesita exactamente para pasar a producción? (¿número empresarial verificado, app review, pago, el token expira?)

2. **¿Podemos enviar mensajes a cualquier número real de WhatsApp?** En desarrollo sé que solo llegan a usuarios de prueba. En producción ¿hay límite diario de mensajes? ¿tiene costo?

3. **¿Podemos enviar mensajes de texto libre (sin template)?** O sí o sí se requiere un template aprobado por Meta para producción. Si se requieren templates, ¿qué categoría aplica para notificaciones de escaneo de QR?

4. **¿Algo más del webhook o del número emisor que debamos configurar?** El número desde el que enviamos es un número normal (no 1-800). El worker usa `graph.facebook.com/v20.0/{PHONE_NUMBER_ID}/messages`.

5. **¿La verificación de empresa en Meta Business es suficiente o hace falta otro paso específico para WhatsApp?**

En resumen: queremos saber si podemos empezar a enviar notificaciones a usuarios reales o si falta alguna configuración, revisión o pago.

De antemano gracias por la orientación.
