-- ClubApp · freno anti-spam para nuevas solicitudes. Es seguro ejecutarlo varias veces.
-- Evita que alguien llene la tabla (y tu correo) con solicitudes falsas.

create or replace function public.limitar_solicitudes()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- La misma persona y el mismo plan: máximo una solicitud cada 2 minutos.
  if exists (
    select 1 from public.solicitudes s
    where lower(s.correo) = lower(new.correo)
      and s.plan = new.plan
      and s.created_at > now() - interval '2 minutes'
  ) then
    raise exception 'Ya recibimos tu solicitud. Espera un par de minutos.' using errcode = 'P0001';
  end if;

  -- Tope general: 60 solicitudes por hora en todo el sitio.
  if (select count(*) from public.solicitudes s where s.created_at > now() - interval '1 hour') >= 60 then
    raise exception 'Hay muchas solicitudes ahora mismo. Intenta de nuevo en un rato.' using errcode = 'P0001';
  end if;

  return new;
end;
$$;

revoke all on function public.limitar_solicitudes() from public, anon, authenticated;

drop trigger if exists limitar_solicitudes on public.solicitudes;
create trigger limitar_solicitudes
  before insert on public.solicitudes
  for each row execute function public.limitar_solicitudes();
