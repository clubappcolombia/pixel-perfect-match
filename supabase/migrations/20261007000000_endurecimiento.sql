-- ClubApp · endurecimiento de seguridad y validación. Es seguro ejecutarlo varias veces.
-- Ejecútalo en Supabase → SQL Editor (después de 20261006000000_correcciones.sql).

-- 1) Índice para el tope general por hora (evita recorrer toda la tabla en cada insert).
create index if not exists solicitudes_created_at_idx on public.solicitudes (created_at);

-- 2) Freno anti-spam más justo:
--    - por correo: 1 solicitud cada 2 min por plan y máximo 5 por hora en total;
--    - general: 60 por hora en todo el sitio (se mantiene).
create or replace function public.limitar_solicitudes()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if exists (
    select 1 from public.solicitudes s
    where lower(s.correo) = lower(new.correo)
      and s.plan = new.plan
      and s.created_at > now() - interval '2 minutes'
  ) then
    raise exception 'Ya recibimos tu solicitud. Espera un par de minutos.' using errcode = 'P0001';
  end if;

  if (select count(*) from public.solicitudes s
      where lower(s.correo) = lower(new.correo)
        and s.created_at > now() - interval '1 hour') >= 5 then
    raise exception 'Ya hay varias solicitudes con este correo. Escríbenos por WhatsApp.' using errcode = 'P0001';
  end if;

  if (select count(*) from public.solicitudes s where s.created_at > now() - interval '1 hour') >= 60 then
    raise exception 'Hay muchas solicitudes ahora mismo. Intenta de nuevo en un rato.' using errcode = 'P0001';
  end if;

  return new;
end;
$$;

revoke all on function public.limitar_solicitudes() from public, anon, authenticated;

-- 3) crear_solicitud: valida plan, largos y nombre ANTES de insertar, con mensajes claros.
--    Un nombre con enlaces se rechaza: el correo de confirmación sale desde tu Gmail y un nombre
--    como "Gana premio http://..." convertiría el formulario en un canal para enviar phishing.
create or replace function public.crear_solicitud(p_nombre text, p_correo text, p_whatsapp text, p_plan text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_nombre   text := regexp_replace(trim(coalesce(p_nombre, '')), '\s+', ' ', 'g');
  v_correo   text := lower(trim(coalesce(p_correo, '')));
  v_whatsapp text := regexp_replace(trim(coalesce(p_whatsapp, '')), '[^0-9+]', '', 'g');
  v_codigo   text;
begin
  if p_plan is null or p_plan not in ('kit', 'profesional', 'premium') then
    raise exception 'El plan no es válido.' using errcode = 'P0001';
  end if;
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

  insert into public.solicitudes (nombre, correo, whatsapp, plan)
  values (v_nombre, v_correo, v_whatsapp, p_plan)
  returning codigo_acceso into v_codigo;
  return v_codigo;
end;
$$;

revoke all on function public.crear_solicitud(text, text, text, text) from public;
grant execute on function public.crear_solicitud(text, text, text, text) to anon, authenticated;

-- 4) generar_codigo() es interno: no tiene por qué poder llamarse desde la API pública.
--    (Los triggers la usan con permisos del dueño, así que sigue funcionando.)
revoke all on function public.generar_codigo() from public, anon, authenticated;
