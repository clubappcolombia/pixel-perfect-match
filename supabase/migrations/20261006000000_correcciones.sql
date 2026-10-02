-- ClubApp · correcciones de la revisión. Es seguro ejecutarlo varias veces.
-- Ejecútalo en Supabase → SQL Editor (después de 20261005000000_codigo_acceso.sql).

-- 1) Nuevo estado "rechazado" (pago no verificado / solicitud cancelada)
alter table public.solicitudes drop constraint if exists solicitudes_estado_check;
alter table public.solicitudes add constraint solicitudes_estado_check
  check (estado in ('solicitado', 'pago confirmado', 'entregado', 'rechazado')) not valid;

-- 2) No se puede marcar "entregado" sin enlace (así el correo al cliente nunca queda sin enviar
--    por haber cambiado el estado antes de pegar el enlace). NOT VALID = no revisa filas viejas.
alter table public.solicitudes drop constraint if exists solicitudes_entregado_url_check;
alter table public.solicitudes add constraint solicitudes_entregado_url_check
  check (estado <> 'entregado' or coalesce(trim(url_documento), '') <> '') not valid;

-- 3) El enlace debe ser https (evita enlaces tipo javascript: o pegados con error)
alter table public.solicitudes drop constraint if exists solicitudes_url_https_check;
alter table public.solicitudes add constraint solicitudes_url_https_check
  check (url_documento is null or url_documento ~* '^https://') not valid;

-- 4) crear_solicitud: valida el correo, lo guarda en minúsculas y deja el WhatsApp solo con dígitos y "+"
create or replace function public.crear_solicitud(p_nombre text, p_correo text, p_whatsapp text, p_plan text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_correo   text := lower(trim(coalesce(p_correo, '')));
  v_whatsapp text := regexp_replace(trim(coalesce(p_whatsapp, '')), '[^0-9+]', '', 'g');
  v_codigo   text;
begin
  if v_correo !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    raise exception 'El correo no es válido.' using errcode = 'P0001';
  end if;

  insert into public.solicitudes (nombre, correo, whatsapp, plan)
  values (trim(p_nombre), v_correo, v_whatsapp, p_plan)
  returning codigo_acceso into v_codigo;
  return v_codigo;
end;
$$;

revoke all on function public.crear_solicitud(text, text, text, text) from public;
grant execute on function public.crear_solicitud(text, text, text, text) to anon, authenticated;

-- 5) consultar_entrega: ahora también devuelve el avance (formulario / comprobante) para mostrarlo en "Mi documento"
drop function if exists public.consultar_entrega(text, text);

create function public.consultar_entrega(p_correo text, p_codigo text)
returns table (estado text, url_documento text, plan text, formulario_at timestamptz, comprobante_at timestamptz)
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
    select s.estado, s.url_documento, s.plan, s.formulario_at, s.comprobante_at
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
