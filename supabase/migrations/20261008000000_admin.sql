-- Panel de administración: tabla de administradores y funciones admin_*.
-- Esta migración documenta lo que ya existe en producción (copiado de pg_get_functiondef).
-- Es seguro ejecutarla de nuevo: no borra datos ni cambia el comportamiento actual.

-- 1. Quién es administrador. Solo aparecen aquí los usuarios que tú agregues a mano.
create table if not exists public.administradores (
  user_id uuid primary key references auth.users(id) on delete cascade
);

-- RLS activado y sin políticas: nadie la lee ni la edita desde la API pública.
-- Solo la usa es_admin(), que es SECURITY DEFINER.
alter table public.administradores enable row level security;

-- 2. ¿El usuario que llama es administrador?
create or replace function public.es_admin()
 returns boolean
 language sql
 stable security definer
 set search_path to 'public'
as $function$
  select exists (select 1 from public.administradores a where a.user_id = auth.uid());
$function$;

-- 3. Listar solicitudes (máximo 300, las más recientes primero).
create or replace function public.admin_listar()
 returns table(id uuid, nombre text, correo text, whatsapp text, plan text, estado text, url_documento text, codigo_acceso text, creado_en timestamp with time zone, formulario_at timestamp with time zone, comprobante_at timestamp with time zone)
 language plpgsql
 stable security definer
 set search_path to 'public'
as $function$
begin
  if not public.es_admin() then
    raise exception 'No autorizado' using errcode = '42501';
  end if;
  return query
    select s.id, s.nombre, s.correo, s.whatsapp, s.plan, s.estado, s.url_documento,
           s.codigo_acceso, s.creado_en, s.formulario_at, s.comprobante_at
    from public.solicitudes s
    order by s.creado_en desc nulls last
    limit 300;
end;
$function$;

-- 4. Cambiar estado y/o enlace de entrega. No deja marcar "entregado" sin enlace https.
create or replace function public.admin_actualizar(p_id uuid, p_estado text, p_url text default null::text)
 returns boolean
 language plpgsql
 security definer
 set search_path to 'public'
as $function$
declare
  v_url text := nullif(trim(coalesce(p_url, '')), '');
begin
  if not public.es_admin() then
    raise exception 'No autorizado' using errcode = '42501';
  end if;
  if p_estado not in ('solicitado', 'pago confirmado', 'entregado', 'rechazado') then
    raise exception 'Estado no válido';
  end if;
  if p_estado = 'entregado' and (v_url is null or v_url !~* '^https://') then
    raise exception 'Para entregar necesitas un enlace que empiece por https://';
  end if;
  update public.solicitudes
     set estado = p_estado,
         url_documento = coalesce(v_url, url_documento)
   where id = p_id;
  return found;
end;
$function$;

-- 5. Eliminar una solicitud (definitivo).
create or replace function public.admin_eliminar(p_id uuid)
 returns boolean
 language plpgsql
 security definer
 set search_path to 'public'
as $function$
begin
  if not public.es_admin() then
    raise exception 'No autorizado' using errcode = '42501';
  end if;
  delete from public.solicitudes where id = p_id;
  return found;
end;
$function$;

-- 6. Permisos: sin sesión (anon) y público NO pueden ejecutarlas; solo usuarios con sesión.
-- Igual que hoy en producción (postgres, authenticated, service_role).
revoke all on function public.es_admin() from public, anon;
revoke all on function public.admin_listar() from public, anon;
revoke all on function public.admin_actualizar(uuid, text, text) from public, anon;
revoke all on function public.admin_eliminar(uuid) from public, anon;

grant execute on function public.es_admin() to authenticated, service_role;
grant execute on function public.admin_listar() to authenticated, service_role;
grant execute on function public.admin_actualizar(uuid, text, text) to authenticated, service_role;
grant execute on function public.admin_eliminar(uuid) to authenticated, service_role;

-- Para agregar un administrador (ejecútalo a mano, con el id de tu usuario en Authentication > Users):
-- insert into public.administradores (user_id) values ('PEGA-AQUI-EL-UUID-DEL-USUARIO');
