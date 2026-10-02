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
  check (estado in ('solicitado', 'pago confirmado', 'entregado')) not valid;

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

create policy "Cualquiera puede crear una solicitud"
  on public.solicitudes
  for insert
  to anon, authenticated
  with check (estado = 'solicitado' and url_documento is null);

-- (sin políticas de select/update/delete: solo tú, desde el panel de Supabase, las gestionas)

-- Consulta pública de entrega: requiere correo + últimos 4 dígitos del WhatsApp.
create or replace function public.consultar_entrega(p_correo text, p_whatsapp4 text)
returns table (estado text, url_documento text)
language sql
security definer
set search_path = public
as $$
  select s.estado, s.url_documento
  from public.solicitudes s
  where lower(s.correo) = lower(trim(p_correo))
    and right(regexp_replace(s.whatsapp, '\D', '', 'g'), 4) = p_whatsapp4
  order by coalesce(s.creado_en, s.created_at) desc
  limit 1;
$$;

revoke all on function public.consultar_entrega(text, text) from public;
grant execute on function public.consultar_entrega(text, text) to anon, authenticated;
