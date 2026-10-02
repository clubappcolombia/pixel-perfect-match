# Proceso del Plan Profesional ($160.000)

## Cómo fluye ahora
1. El cliente deja sus datos → se crea una fila en `solicitudes` (**te llega un correo**).
2. Abre el formulario del club (con su correo ya escrito, si configuras el paso A) y pulsa "Ya llené el formulario" → se guarda `formulario_at`.
3. Te escribe por WhatsApp, paga y pulsa "Ya envié mi comprobante" → se guarda `comprobante_at` (**te llega un correo**).
4. Tú verificas el pago en tu cuenta, generas los documentos (Autocrat), los subes a Drive.
5. En Supabase cambias `estado` a `entregado` y pegas el enlace en `url_documento` → **al cliente le llega el correo con su enlace**.

## Configuración (una sola vez)

### A. Que el formulario llegue con el correo escrito (opcional, 3 minutos)
1. En Google Forms abre tu formulario → menú ⋮ → **Obtener enlace prefijado**.
2. Escribe `prueba@correo.com` en el campo del correo → **Obtener enlace** → **Copiar enlace**.
3. En el enlace busca `entry.` seguido de números (ej. `entry.123456789`). Cópialo.
4. En `src/lib/config.ts` pon: `FORM_EMAIL_ENTRY: "entry.123456789",`

### B. Base de datos
En Supabase → SQL Editor → pega el contenido de `supabase/migrations/20261003000000_plan_progreso.sql` → Run.

### C. Avisos por correo (opcional, 10 minutos)
1. Entra a script.google.com con la cuenta clubappcolombia@gmail.com → **Nuevo proyecto**.
2. Pega el contenido de `apps-script/notificar.gs`. Cambia `TOKEN` por una clave larga inventada por ti y `SITIO` por tu enlace `.lovable.app`.
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
