-- ClubApp · Fase 1 "Guía gratis": tabla de leads + función para guardarlos.
-- Es seguro ejecutarlo varias veces. Ejecútalo en Supabase → SQL Editor → Run.

create table if not exists public.leads_guia (
  id         uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  nombre     text not null,
  correo     text not null,
  whatsapp   text not null,
  fuente     text not null default 'directo',
  constraint leads_guia_largos_check check (
    char_length(nombre)   between 3 and 100 and
    char_length(correo)   between 5 and 255 and
    char_length(whatsapp) between 7 and 20  and
    char_length(fuente)   between 1 and 30
  )
);

create index if not exists leads_guia_created_at_idx on public.leads_guia (created_at);
create index if not exists leads_guia_correo_idx on public.leads_guia (lower(correo));

-- Seguridad: con la clave pública nadie puede leer ni modificar la tabla.
-- Los leads se crean solo con crear_lead_guia() y los ves en el panel de Supabase.
alter table public.leads_guia enable row level security;

do $$
declare r record;
begin
  for r in select policyname from pg_policies where schemaname = 'public' and tablename = 'leads_guia' loop
    execute format('drop policy %I on public.leads_guia', r.policyname);
  end loop;
end $$;

-- Freno anti-spam: 1 registro cada 2 min por correo, 5 por hora por correo y 100 por hora en todo el sitio.
create or replace function public.limitar_leads_guia()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if exists (
    select 1 from public.leads_guia l
    where lower(l.correo) = lower(new.correo)
      and l.created_at > now() - interval '2 minutes'
  ) then
    raise exception 'Ya recibimos tus datos. Espera un par de minutos.' using errcode = 'P0001';
  end if;

  if (select count(*) from public.leads_guia l
      where lower(l.correo) = lower(new.correo)
        and l.created_at > now() - interval '1 hour') >= 5 then
    raise exception 'Ya hay varios registros con este correo. Escríbenos por WhatsApp.' using errcode = 'P0001';
  end if;

  if (select count(*) from public.leads_guia l where l.created_at > now() - interval '1 hour') >= 100 then
    raise exception 'Hay muchas solicitudes ahora mismo. Intenta de nuevo en un rato.' using errcode = 'P0001';
  end if;

  return new;
end;
$$;

revoke all on function public.limitar_leads_guia() from public, anon, authenticated;

drop trigger if exists limitar_leads_guia on public.leads_guia;
create trigger limitar_leads_guia
  before insert on public.leads_guia
  for each row execute function public.limitar_leads_guia();

-- Guardar un lead: valida ANTES de insertar, con mensajes claros (igual que crear_solicitud).
create or replace function public.crear_lead_guia(p_nombre text, p_correo text, p_whatsapp text, p_fuente text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_nombre   text := regexp_replace(trim(coalesce(p_nombre, '')), '\s+', ' ', 'g');
  v_correo   text := lower(trim(coalesce(p_correo, '')));
  v_whatsapp text := regexp_replace(trim(coalesce(p_whatsapp, '')), '[^0-9+]', '', 'g');
  v_fuente   text := lower(trim(coalesce(p_fuente, '')));
begin
  if char_length(v_nombre) not between 3 and 100 then
    raise exception 'El nombre debe tener entre 3 y 100 caracteres.' using errcode = 'P0001';
  end if;
  if v_nombre ~* '(https?:|www\.|\.com|\.co\b|@)' then
    raise exception 'El nombre no puede contener enlaces ni correos.' using errcode = 'P0001';
  end if;
  if char_length(v_correo) not between 5 and 255
     or v_correo !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    raise exception 'El correo no es válido.' using errcode = 'P0001';
  end if;
  if char_length(regexp_replace(v_whatsapp, '\D', '', 'g')) not between 7 and 15 then
    raise exception 'El WhatsApp no es válido.' using errcode = 'P0001';
  end if;
  if v_fuente !~ '^[a-z0-9_-]{1,30}$' then
    v_fuente := 'directo';
  end if;

  insert into public.leads_guia (nombre, correo, whatsapp, fuente)
  values (v_nombre, v_correo, v_whatsapp, v_fuente);
  return true;
end;
$$;

revoke all on function public.crear_lead_guia(text, text, text, text) from public;
grant execute on function public.crear_lead_guia(text, text, text, text) to anon, authenticated;
