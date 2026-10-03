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

---

# Segunda revisión (análisis y mejoras)

## Corregido
- `analytics.ts`: 2 errores de TypeScript (`tsc --noEmit` ahora pasa limpio).
- ~240 errores de formato (Prettier) en todo `src/`; `npm run lint` queda sin errores propios.
- `.env.example` no existía aunque esta guía lo decía: creado.
- «Mi documento»: el error del código aparecía bajo el campo del correo; ahora tiene su propio mensaje.
- Se quitaron los `as any` de las llamadas RPC con `src/lib/rpc.ts` (tipado sin tocar `types.ts`, que genera Lovable).
- Pie de página: faltaban enlaces a Planes, Diagnóstico y Ayuda. Diagnóstico: botón «Atrás».

## Seguridad (ejecutar `20261007000000_endurecimiento.sql`)
- `crear_solicitud` valida plan, largos, WhatsApp y rechaza nombres con enlaces/correos (evita usar tu Gmail para enviar phishing con el nombre como gancho).
- Tope de 5 solicitudes por correo por hora; índice para el tope general.
- `generar_codigo()` ya no es invocable desde la API pública.
- Apps Script: se niega a funcionar con el token de ejemplo (antes cualquiera que conociera la URL podía enviar correos desde tu cuenta), captura errores, limpia el nombre y exige enlace https en la entrega.

## Sigue pendiente (no se pudo resolver solo con código)
- Captcha en servidor: el honeypot y la validación del cliente se saltan llamando a la API directamente.
- Tope general de 60/hora: un atacante puede agotarlo y bloquear solicitudes legítimas durante una hora.
- Bloqueo por correo en «Mi documento»: alguien puede bloquear 15 min a un cliente conocido enviando intentos fallidos con su correo.
- `previewAuthStorage.ts` tiene 1 error de lint (`prefer-const`) pero es archivo generado por Lovable.
- Dependencias sin usar (muchos `@radix-ui/*`, `recharts`, `react-day-picker`…): revisar antes de quitarlas.
