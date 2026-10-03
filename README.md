# ClubApp Colombia

Sitio para vender y entregar documentación de formalización de clubes deportivos (Kit, Plan Profesional y Premium).
Pago y coordinación por WhatsApp; entrega por correo y en `/mi-documento`.

**Stack:** TanStack Start (React 19, SSR) · Tailwind 4 · Supabase (Postgres + RPC) · Google Apps Script (correos) · Lovable.

## Desarrollo

```sh
cp .env.example .env     # completa con las claves públicas de Supabase
npm install
npm run dev              # servidor local
npm run build            # compilación de producción
npx tsc --noEmit         # tipos
npm run lint             # eslint + prettier  (npm run format para autoformatear)
```

## Estructura

| Ruta / archivo                | Qué hace                                                      |
| ----------------------------- | ------------------------------------------------------------- |
| `src/lib/config.ts`           | Precios, WhatsApp, URLs, textos legales y guardado de leads   |
| `src/lib/rpc.ts`              | Llamadas tipadas a las funciones SQL (sin `as any`)           |
| `src/components/solicitud-form.tsx` | Formulario único (validación zod + honeypot)            |
| `src/routes/*`                | Páginas: inicio, planes, kit, plan-profesional, mi-documento… |
| `supabase/migrations/*.sql`   | Esquema, RLS, anti-spam, código de acceso, endurecimiento     |
| `apps-script/notificar.gs`    | Webhook que envía los correos (a ti y al cliente)             |

## Base de datos

Ejecuta las migraciones **en orden** en Supabase → SQL Editor (todas son idempotentes):

1. `20261002000000_solicitudes.sql`
2. `20261003000000_plan_progreso.sql`
3. `20261004000000_antispam.sql`
4. `20261005000000_codigo_acceso.sql`
5. `20261006000000_correcciones.sql`
6. `20261007000000_endurecimiento.sql`

La tabla `solicitudes` no tiene políticas RLS: el público solo accede por las funciones
`crear_solicitud`, `consultar_entrega` y `registrar_progreso`.

## Operación

Ver `PROCESO-PLAN-PROFESIONAL.md` (configuración de correos y rutina diaria) y `CAMBIOS-REVISION.md`.

> Lovable está conectado a este repositorio: no reescribas el historial publicado de `main`.
