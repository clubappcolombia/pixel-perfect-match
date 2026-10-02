# Cambios de la revisión

## Base de datos (ejecutar `20261006000000_correcciones.sql`)
- Estado nuevo `rechazado`; no se puede poner `entregado` sin enlace; el enlace debe ser https.
- `crear_solicitud` valida el correo, lo guarda en minúsculas y limpia el WhatsApp.
- `consultar_entrega` devuelve también el avance (formulario / comprobante).
- La migración 1 ya no recrea el INSERT directo ni la consulta antigua: re-ejecutarla es seguro.

## Sitio
- Correo con confirmación (doble campo) para evitar enviar documentos a un correo mal escrito.
- Si el servidor rechaza la solicitud (repetida, correo inválido) el cliente ve el motivo en vez de quedarse sin código.
- El código ya no se borra al cerrar el modal de Kit/Premium.
- Plan Profesional guarda el avance en `sessionStorage` (no queda en equipos compartidos).
- Diagnóstico: «Básico» pasa a «Kit».
- «Mi documento»: mensaje según el avance real, enlace solo si es https, `noindex`.
- Textos sin promesas de garantía («lista para radicar» → «organizada para radicar»; «Formato aceptado» → «Formatos organizados»).
- Política de datos ampliada (responsable, menores, proveedores/transmisión, conservación, plazos de consultas y reclamos).
- `sitemap.xml` y línea `Sitemap` en `robots.txt`; `.env` fuera del repositorio y `.env.example`.

## Apps Script
- Envía al cliente su código al registrarse y reserva cuota de correo para las entregas.

## Pendiente (requiere decisiones o servicios externos)
- Captcha verificado en servidor (Turnstile/hCaptcha) y límite por IP.
- Enlaces de entrega con acceso restringido o vencimiento (hoy Drive «cualquiera con el enlace»).
- Responsable legal completo (razón social/NIT) y revisión por un abogado.
- Pasarela de pago y panel de administración.
- Regenerar tipos de Supabase (quitar los `as any`) y limpiar dependencias/componentes sin uso.
- Cambiar `SITE_URL` y el sitemap cuando tengas dominio propio.
