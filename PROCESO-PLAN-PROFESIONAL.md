# Proceso del Plan Profesional ($160.000)

## Cómo fluye ahora
1. El cliente deja sus datos → se crea una fila en `solicitudes` (**te llega un correo**).
2. Abre el formulario del club (con su correo ya escrito, si configuras el paso A) y pulsa "Ya llené el formulario" → se guarda `formulario_at`.
3. Te escribe por WhatsApp, paga y pulsa "Ya envié mi comprobante" → se guarda `comprobante_at` (**te llega un correo**).
4. Tú verificas el pago en tu cuenta, generas los documentos (Autocrat), los subes a Drive.
5. En Supabase pega **primero** el enlace en `url_documento` y **después** cambia `estado` a `entregado` → **al cliente le llega el correo con su enlace** (solo sale si el enlace ya está escrito).

## Configuración (una sola vez)

### A. Que el formulario llegue con el correo escrito (opcional, 3 minutos)
1. En Google Forms abre tu formulario → menú ⋮ → **Obtener enlace prefijado**.
2. Escribe `prueba@correo.com` en el campo del correo → **Obtener enlace** → **Copiar enlace**.
3. En el enlace busca `entry.` seguido de números (ej. `entry.123456789`). Cópialo.
4. En `src/lib/config.ts` pon: `FORM_EMAIL_ENTRY: "entry.123456789",`

### B. Base de datos
En Supabase → SQL Editor, ejecuta en orden (cada una con Run): `20261003000000_plan_progreso.sql`, `20261004000000_antispam.sql`, `20261005000000_codigo_acceso.sql` y `20261006000000_correcciones.sql` (nuevo: estado `rechazado`, no permite `entregado` sin enlace https, valida el correo y devuelve el avance en «Mi documento»).

Si un cliente perdió su código: Table Editor → `solicitudes` → busca por correo → copia `codigo_acceso` y envíaselo por WhatsApp.

### C. Avisos por correo (opcional, 10 minutos)
1. Entra a script.google.com con la cuenta clubappcolombia@gmail.com → **Nuevo proyecto**.
2. Pega el contenido de `apps-script/notificar.gs` (ahora también le envía al cliente su código por correo y reserva cuota para las entregas). Cambia `TOKEN` por una clave larga inventada por ti y `SITIO` por tu enlace `.lovable.app`.
3. **Implementar** → **Nueva implementación** → tipo **Aplicación web** → Ejecutar como: **Yo** → Acceso: **Cualquier persona** → **Implementar**. Autoriza los permisos y copia la URL.
4. En Supabase → **Integrations** → busca **Database Webhooks** → **Install** (solo la primera vez) → pestaña **Webhooks** → **Create a new hook**: tabla `solicitudes`, eventos **Insert** y **Update**, tipo **HTTP Request**, método **POST**, URL = la URL de Apps Script + `?token=TU_TOKEN`.

## Rutina diaria (2 consultas en SQL Editor)

Comprobantes por verificar:
```sql
select nombre, correo, whatsapp, comprobante_at
from public.solicitudes
where plan = 'profesional' and comprobante_at is not null and estado <> 'entregado'
order by comprobante_at;
```

Formulario listo pero sin pago:
```sql
select nombre, correo, whatsapp, formulario_at
from public.solicitudes
where plan = 'profesional' and formulario_at is not null
  and comprobante_at is null and estado <> 'entregado'
order by formulario_at;
```
Estas últimas personas son buenos candidatos para un recordatorio por WhatsApp.

## Checklist de entrega (Kit, Plan Profesional y Premium)
1. Verifica en tu Nequi o cuenta que el pago llegó y coincide con el valor del plan.
2. Prepara los documentos y súbelos a Drive (acceso: "cualquier persona con el enlace").
3. En Supabase → **Table Editor** → `solicitudes`, busca la fila por el correo del cliente.
4. Pega el enlace en `url_documento` y pulsa Enter.
5. Cambia `estado` a `entregado` (si quieres, antes a `pago confirmado`). Si el pago no se pudo verificar, usa `rechazado`. La base ya no deja marcar `entregado` sin enlace.
6. Comprueba que al cliente le llegó el correo (revisa Spam) o avísale por WhatsApp.
7. Verifica en `/mi-documento` con su correo y su código de seguimiento (columna `codigo_acceso` en `solicitudes`).
