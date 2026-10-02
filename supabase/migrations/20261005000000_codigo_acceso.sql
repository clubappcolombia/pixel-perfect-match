-- ClubApp · código de acceso por solicitud + límite de intentos.
-- Reemplaza "correo + 4 últimos dígitos del WhatsApp" (solo 10.000 combinaciones)
-- por un código aleatorio de 10 caracteres que se le muestra al cliente al registrarse.
-- Es seguro ejecutarlo varias veces.
--
-- IMPORTANTE: este archivo quita la política de INSERT directo de la tabla "solicitudes".
-- Si algún día vuelves a ejecutar la migración 20261002000000_solicitudes.sql, esa política
-- se recrea; en ese caso ejecuta de nuevo la última línea de este archivo (drop policy).

-- 1) Generador de códigos (10 caracteres hexadecimales en mayúscula, ej. 3F9A0C7B21)
create or replace function public.generar_codigo()
returns text
language sql
volatile
as $$
  select upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10));
$$;

alter table public.solicitudes add column if not exists codigo_acceso text;

-- Las solicitudes que ya existen reciben su código (búscalo en Table Editor para dárselo a clientes anteriores)
update public.solicitudes set codigo_acceso = public.generar_codigo() where codigo_acceso is null;

create unique index if not exists solicitudes_codigo_acceso_idx on public.solicitudes (codigo_acceso);

-- Toda fila nueva recibe un código generado por el servidor (nadie puede elegir el suyo)
create or replace function public.asignar_codigo()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.codigo_acceso := public.generar_codigo();
  return new;
end;
$$;

revoke all on function public.asignar_codigo() from public, anon, authenticated;

drop trigger if exists asignar_codigo on public.solicitudes;
create trigger asignar_codigo
  before insert on public.solicitudes
  for each row execute function public.asignar_codigo();

-- 2) Registro de intentos fallidos (para frenar a quien pruebe códigos al azar)
create table if not exists public.intentos_acceso (
  id         bigint generated always as identity primary key,
  correo     text not null,
  created_at timestamptz not null default now()
);
create index if not exists intentos_acceso_idx on public.intentos_acceso (correo, created_at);
alter table public.intentos_acceso enable row level security;  -- sin políticas: solo las funciones internas la usan

create or replace function public.frenar_intentos(p_correo text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.intentos_acceso where created_at < now() - interval '1 day';
  if (select count(*) from public.intentos_acceso
      where correo = p_correo and created_at > now() - interval '15 minutes') >= 8 then
    raise exception 'Demasiados intentos. Espera 15 minutos o escríbenos por WhatsApp.' using errcode = 'P0001';
  end if;
end;
$$;

revoke all on function public.frenar_intentos(text) from public, anon, authenticated;

-- 3) Crear solicitud: devuelve el código para mostrárselo al cliente
drop function if exists public.crear_solicitud(text, text, text, text);

create function public.crear_solicitud(p_nombre text, p_correo text, p_whatsapp text, p_plan text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_codigo text;
begin
  insert into public.solicitudes (nombre, correo, whatsapp, plan)
  values (trim(p_nombre), trim(p_correo), trim(p_whatsapp), p_plan)
  returning codigo_acceso into v_codigo;
  return v_codigo;
end;
$$;

revoke all on function public.crear_solicitud(text, text, text, text) from public;
grant execute on function public.crear_solicitud(text, text, text, text) to anon, authenticated;

-- 4) Consulta de entrega con correo + código (reemplaza la versión con 4 dígitos)
drop function if exists public.consultar_entrega(text, text);

create function public.consultar_entrega(p_correo text, p_codigo text)
returns table (estado text, url_documento text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_correo text := lower(trim(p_correo));
  v_codigo text := upper(regexp_replace(coalesce(p_codigo, ''), '[^A-Za-z0-9]', '', 'g'));
begin
  perform public.frenar_intentos(v_correo);

  return query
    select s.estado, s.url_documento
    from public.solicitudes s
    where lower(s.correo) = v_correo
      and s.codigo_acceso = v_codigo
    order by s.created_at desc
    limit 1;

  if not found then
    insert into public.intentos_acceso (correo) values (v_correo);
  end if;
end;
$$;

revoke all on function public.consultar_entrega(text, text) from public;
grant execute on function public.consultar_entrega(text, text) to anon, authenticated;

-- 5) Seguimiento del Plan Profesional, ahora también con código
drop function if exists public.registrar_progreso(text, text, text);

create function public.registrar_progreso(p_correo text, p_codigo text, p_evento text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_correo text := lower(trim(p_correo));
  v_codigo text := upper(regexp_replace(coalesce(p_codigo, ''), '[^A-Za-z0-9]', '', 'g'));
  v_id uuid;
begin
  if p_evento not in ('formulario_completado', 'comprobante_enviado') then
    return false;
  end if;

  perform public.frenar_intentos(v_correo);

  select s.id into v_id
  from public.solicitudes s
  where lower(s.correo) = v_correo
    and s.codigo_acceso = v_codigo
    and s.plan = 'profesional'
  order by s.created_at desc
  limit 1;

  if v_id is null then
    insert into public.intentos_acceso (correo) values (v_correo);
    return false;
  end if;

  if p_evento = 'formulario_completado' then
    update public.solicitudes set formulario_at = coalesce(formulario_at, now()) where id = v_id;
  else
    update public.solicitudes set comprobante_at = coalesce(comprobante_at, now()) where id = v_id;
  end if;

  return true;
end;
$$;

revoke all on function public.registrar_progreso(text, text, text) from public;
grant execute on function public.registrar_progreso(text, text, text) to anon, authenticated;

-- 6) Ya no se permite insertar directo en la tabla: todo pasa por crear_solicitud
--    (así un robot no puede saltarse la validación ni el freno anti-spam).
drop policy if exists "Cualquiera puede crear una solicitud" on public.solicitudes;
