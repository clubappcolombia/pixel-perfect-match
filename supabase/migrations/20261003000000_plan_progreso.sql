-- ClubApp · seguimiento del Plan Profesional.
-- El cliente marca "ya llené el formulario" y "ya envié mi comprobante"; queda registrado
-- en la tabla para que veas quién está esperando. NO cambia el campo "estado" (eso lo decides tú).
-- Es seguro ejecutarlo varias veces.

alter table public.solicitudes add column if not exists formulario_at timestamptz;
alter table public.solicitudes add column if not exists comprobante_at timestamptz;

create or replace function public.registrar_progreso(p_correo text, p_whatsapp4 text, p_evento text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  if p_evento not in ('formulario_completado', 'comprobante_enviado') then
    return false;
  end if;

  select s.id into v_id
  from public.solicitudes s
  where lower(s.correo) = lower(trim(p_correo))
    and right(regexp_replace(s.whatsapp, '\D', '', 'g'), 4) = p_whatsapp4
    and s.plan = 'profesional'
  order by s.creado_en desc nulls last
  limit 1;

  if v_id is null then
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
