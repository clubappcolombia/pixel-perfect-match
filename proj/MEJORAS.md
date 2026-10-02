# Mejoras aplicadas (sin Lovable)

## Qué cambió en el código
- `src/lib/config.ts`: ahora **detecta cuando Supabase falla** (antes fallaba en silencio), los mensajes de WhatsApp usan los precios de `CONFIG`, y el mensaje incluye nombre, correo y WhatsApp del cliente. Nuevo campo `GTM_ID` para analítica.
- Precios: títulos SEO, descripciones y preguntas frecuentes ya no tienen precios escritos a mano; todo sale de `CONFIG`.
- `src/routes/__root.tsx`: `lang="es"`, página 404 y de error en español, y carga de Google Tag Manager si pones `GTM_ID`.
- `kit-modal.tsx` y `plan-profesional.tsx`: el botón de WhatsApp envía los datos del cliente.
- `supabase/migrations/20261002000000_solicitudes.sql`: tabla `solicitudes`, seguridad RLS y función `consultar_entrega`.

## Pasos que haces tú
1. **Precios**: abre `src/lib/config.ts` y deja en `PRICE_KIT`, `PRICE_PLAN` y `PRICE_PREMIUM` los valores reales. Con eso se actualiza todo el sitio.
2. **Base de datos**: en Supabase → SQL Editor → pega el contenido del archivo `.sql` → Run.
3. **Probar**: haz una solicitud de prueba en el sitio y revisa Supabase → Table Editor → `solicitudes`.
4. **Entregar un documento**: en Table Editor cambia `estado` a `pago confirmado` y luego a `entregado`, y pega el enlace del archivo en `url_documento`. El cliente lo ve en "Mi documento".
5. **Analítica** (opcional): crea un contenedor en tagmanager.google.com y pon el ID en `GTM_ID` (ej. `"GTM-ABC1234"`). Los eventos `Lead`, `WhatsAppClick` y `SolicitudNoGuardada` ya se envían.

## Subir los cambios
Reemplaza los archivos en tu repositorio de GitHub (puedes editarlos directo en github.com con el lápiz, o subir el zip descomprimido). Lovable sincroniza lo que quede en `main`.
