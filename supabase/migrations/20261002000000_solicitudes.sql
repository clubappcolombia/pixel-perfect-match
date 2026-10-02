-- ClubApp · tabla de solicitudes + seguridad (RLS) + consulta de entrega.
-- Es seguro ejecutarlo varias veces (idempotente).

create table if not exists public.solicitudes (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  nombre        text not null,
  correo        text not null,
  whatsapp      text not null,
  plan          text not null,
  estado        text not null default 'solicitado',
  url_documento text
);

-- Por si la tabla ya existía con menos columnas
alter table public.solicitudes add column if not exists created_at timestamptz not null default now();
alter table public.solicitudes add column if not exists creado_en timestamptz not null default now();
alter table public.solicitudes add column if not exists estado text not null default 'solicitado';
alter table public.solicitudes add column if not exists url_documento text;

-- Si la tabla ya existía con otro valor por defecto, lo unificamos
alter table public.solicitudes alter column estado set default 'solicitado';

-- Validaciones a nivel de base de datos.
-- NOT VALID = se exigen a las filas NUEVAS y no se rechazan las filas viejas que ya existen.
alter table public.solicitudes drop constraint if exists solicitudes_plan_check;
alter table public.solicitudes add constraint solicitudes_plan_check
  check (plan in ('kit', 'profesional', 'premium')) not valid;

alter table public.solicitudes drop constraint if exists solicitudes_estado_check;
alter table public.solicitudes add constraint solicitudes_estado_check
  check (estado in ('solicitado', 'pago confirmado', 'entregado', 'rechazado')) not valid;

alter table public.solicitudes drop constraint if exists solicitudes_largos_check;
alter table public.solicitudes add constraint solicitudes_largos_check
  check (
    char_length(nombre)   between 3 and 100 and
    char_length(correo)   between 5 and 255 and
    char_length(whatsapp) between 7 and 20
  ) not valid;

create index if not exists solicitudes_correo_idx on public.solicitudes (lower(correo));

-- Seguridad: nadie con la clave pública puede LEER ni MODIFICAR la tabla.
alter table public.solicitudes enable row level security;

-- Elimina políticas viejas (por ejemplo una que dejara LEER la tabla a todo el mundo)
do $$
declare r record;
begin
  for r in select policyname from pg_policies where schemaname = 'public' and tablename = 'solicitudes' loop
    execute format('drop policy %I on public.solicitudes', r.policyname);
  end loop;
end $$;

-- (sin políticas de insert/select/update/delete: las solicitudes se crean solo con crear_solicitud()
--  y se gestionan desde el panel de Supabase. La consulta de entrega y sus funciones viven en
--  20261005000000_codigo_acceso.sql y 20261006000000_correcciones.sql; este archivo ya no las toca,
--  así que volver a ejecutarlo NO reabre el insert directo ni reemplaza consultar_entrega.)
