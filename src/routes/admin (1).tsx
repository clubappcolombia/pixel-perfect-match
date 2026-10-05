import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Card, Field, Input } from "@/components/ui-kit";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { name: "robots", content: "noindex, nofollow" },
      { title: "Panel · ClubApp" },
    ],
  }),
  component: Admin,
});

type Fila = {
  id: string;
  nombre: string;
  correo: string;
  whatsapp: string;
  plan: string;
  estado: "solicitado" | "pago confirmado" | "entregado" | "rechazado";
  url_documento: string | null;
  codigo_acceso: string | null;
  creado_en: string | null;
  formulario_at: string | null;
  comprobante_at: string | null;
};

type Filtro = "cobrar" | "entregar" | "entregados" | "todos";

type Lead = {
  id: string;
  created_at: string;
  nombre: string;
  correo: string;
  whatsapp: string;
  fuente: string;
};

// El cliente de Supabase aún no conoce las funciones nuevas, por eso se usa "any".
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

function fecha(v: string | null) {
  if (!v) return "";
  return new Date(v).toLocaleString("es-CO", {
    timeZone: "America/Bogota",
    dateStyle: "short",
    timeStyle: "short",
  });
}

function enlaceWhatsApp(f: Fila) {
  let tel = (f.whatsapp || "").replace(/\D/g, "");
  if (tel.length === 10) tel = "57" + tel;
  const msg = `Hola ${f.nombre}, te escribimos de ClubApp sobre tu solicitud.`;
  return `https://wa.me/${tel}?text=${encodeURIComponent(msg)}`;
}

function enlaceWhatsAppLead(l: Lead) {
  let tel = (l.whatsapp || "").replace(/\D/g, "");
  if (tel.length === 10) tel = "57" + tel;
  const msg = `Hola ${l.nombre}, te escribimos de ClubApp. Vimos que descargaste nuestra guía gratis. ¿Te ayudamos con la documentación de tu club?`;
  return `https://wa.me/${tel}?text=${encodeURIComponent(msg)}`;
}

function TarjetaLead({ l, onEliminar, ocupado }: { l: Lead; onEliminar: (l: Lead) => void; ocupado: boolean }) {
  return (
    <Card className="space-y-3 p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-lg font-bold">{l.nombre}</p>
          <p className="break-all text-sm text-muted-foreground">
            {l.correo} · {l.whatsapp}
          </p>
          <p className="text-xs text-muted-foreground">Descargó la guía el {fecha(l.created_at)}</p>
        </div>
        <span className="rounded-full bg-accent px-3 py-1 text-xs font-bold uppercase tracking-wide">{l.fuente}</span>
      </div>
      <div className="flex flex-wrap gap-2">
        <a
          href={enlaceWhatsAppLead(l)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-9 items-center rounded-lg bg-success px-3 text-sm font-semibold text-success-foreground"
        >
          Escribir por WhatsApp
        </a>
        <Button size="sm" variant="ghost" disabled={ocupado} onClick={() => onEliminar(l)}>
          Eliminar
        </Button>
      </div>
    </Card>
  );
}

function Paso({ hecho, texto, detalle }: { hecho: boolean; texto: string; detalle?: string }) {
  return (
    <li className={hecho ? "text-foreground" : "text-muted-foreground"}>
      <span className="mr-1.5 font-bold">{hecho ? "✔" : "○"}</span>
      {texto}
      {hecho && detalle ? <span className="text-muted-foreground"> · {detalle}</span> : null}
    </li>
  );
}

function Tarjeta({
  f,
  onCambiar,
  onEliminar,
  ocupado,
}: {
  f: Fila;
  onCambiar: (id: string, estado: Fila["estado"], url?: string) => void;
  onEliminar: (f: Fila) => void;
  ocupado: boolean;
}) {
  const [url, setUrl] = useState(f.url_documento ?? "");
  const [errUrl, setErrUrl] = useState<string>();
  const esPlan = f.plan === "profesional";

  function entregar() {
    if (!/^https:\/\//i.test(url.trim())) {
      setErrUrl("El enlace debe empezar por https://");
      return;
    }
    setErrUrl(undefined);
    onCambiar(f.id, "entregado", url.trim());
  }

  return (
    <Card className="space-y-4 p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-lg font-bold">{f.nombre}</p>
          <p className="text-sm text-muted-foreground">
            {f.correo} · {f.whatsapp}
          </p>
          <p className="text-xs text-muted-foreground">
            Solicitó el {fecha(f.creado_en)}
            {f.codigo_acceso ? ` · Código ${f.codigo_acceso}` : ""}
          </p>
        </div>
        <span className="rounded-full bg-accent px-3 py-1 text-xs font-bold uppercase tracking-wide">{f.plan}</span>
      </div>

      <ul className="space-y-1 text-sm">
        {esPlan && <Paso hecho={!!f.formulario_at} texto="Llenó el formulario" detalle={fecha(f.formulario_at)} />}
        <Paso
          hecho={!!f.comprobante_at || f.estado === "pago confirmado" || f.estado === "entregado"}
          texto="Avisó el comprobante"
          detalle={fecha(f.comprobante_at)}
        />
        <Paso hecho={f.estado === "pago confirmado" || f.estado === "entregado"} texto="Pago confirmado por ti" />
        <Paso hecho={f.estado === "entregado"} texto="Documentos entregados" />
        {f.estado === "rechazado" && <li className="font-semibold text-destructive">✖ Pago rechazado</li>}
      </ul>

      <div className="flex flex-wrap gap-2">
        <a
          href={enlaceWhatsApp(f)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-9 items-center rounded-lg bg-success px-3 text-sm font-semibold text-success-foreground"
        >
          Escribir por WhatsApp
        </a>
        {f.estado === "solicitado" && (
          <>
            <Button size="sm" disabled={ocupado} onClick={() => onCambiar(f.id, "pago confirmado")}>
              Confirmar pago
            </Button>
            <Button size="sm" variant="outline" disabled={ocupado} onClick={() => onCambiar(f.id, "rechazado")}>
              Rechazar
            </Button>
          </>
        )}
        {f.estado === "rechazado" && (
          <Button size="sm" variant="outline" disabled={ocupado} onClick={() => onCambiar(f.id, "solicitado")}>
            Reabrir
          </Button>
        )}
        <Button size="sm" variant="ghost" disabled={ocupado} onClick={() => onEliminar(f)}>
          Eliminar
        </Button>
      </div>

      {f.estado === "pago confirmado" && (
        <div className="space-y-2 rounded-xl bg-secondary p-4">
          <Field
            label="Enlace de los documentos (Drive)"
            error={errUrl}
            hint="Al entregar, el cliente recibe el correo con este enlace."
          >
            <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://drive.google.com/…" />
          </Field>
          <Button size="sm" variant="navy" disabled={ocupado} onClick={entregar}>
            Entregar al cliente
          </Button>
        </div>
      )}

      {f.estado === "entregado" && f.url_documento && (
        <a
          href={f.url_documento}
          target="_blank"
          rel="noopener noreferrer"
          className="block break-all text-sm font-semibold text-primary underline"
        >
          Ver documentos entregados
        </a>
      )}
    </Card>
  );
}

function Admin() {
  const [sesion, setSesion] = useState<"cargando" | "fuera" | "dentro">("cargando");
  const [email, setEmail] = useState("");
  const [clave, setClave] = useState("");
  const [errLogin, setErrLogin] = useState<string>();
  const [entrando, setEntrando] = useState(false);

  const [filas, setFilas] = useState<Fila[]>([]);
  const [cargando, setCargando] = useState(false);
  const [errorLista, setErrorLista] = useState<string>();
  const [aviso, setAviso] = useState<string>();
  const [ocupado, setOcupado] = useState(false);
  const [filtro, setFiltro] = useState<Filtro>("cobrar");

  const [vista, setVista] = useState<"solicitudes" | "guia">("solicitudes");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [errorLeads, setErrorLeads] = useState<string>();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSesion(data.session ? "dentro" : "fuera"));
    const { data: sub } = supabase.auth.onAuthStateChange((_evento, s) => setSesion(s ? "dentro" : "fuera"));
    return () => sub.subscription.unsubscribe();
  }, []);

  const cargar = useCallback(async () => {
    setCargando(true);
    setErrorLista(undefined);
    const { data, error } = await db.rpc("admin_listar");
    if (error) {
      const msg = String(error.message ?? "");
      setErrorLista(
        msg.includes("No autorizado")
          ? "Tu usuario no tiene permiso de administrador."
          : "No se pudo cargar la lista. Intenta de nuevo.",
      );
      setFilas([]);
    } else {
      setFilas((data ?? []) as Fila[]);
    }
    setCargando(false);
  }, []);

  const cargarLeads = useCallback(async () => {
    setErrorLeads(undefined);
    const { data, error } = await db.rpc("admin_listar_leads");
    if (error) {
      const msg = String(error.message ?? "");
      setErrorLeads(
        msg.includes("No autorizado")
          ? "Tu usuario no tiene permiso de administrador."
          : "No se pudo cargar la lista de la guía. ¿Ejecutaste la migración 20261010000000_admin_leads_guia.sql?",
      );
      setLeads([]);
    } else {
      setLeads((data ?? []) as Lead[]);
    }
  }, []);

  useEffect(() => {
    if (sesion === "dentro") {
      void cargar();
      void cargarLeads();
    }
  }, [sesion, cargar, cargarLeads]);

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    setEntrando(true);
    setErrLogin(undefined);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: clave });
    if (error) setErrLogin("Correo o contraseña incorrectos.");
    setClave("");
    setEntrando(false);
  }

  async function salir() {
    await supabase.auth.signOut();
    setFilas([]);
    setLeads([]);
  }

  async function cambiar(id: string, estado: Fila["estado"], url?: string) {
    setOcupado(true);
    setAviso(undefined);
    const { error } = await db.rpc("admin_actualizar", { p_id: id, p_estado: estado, p_url: url ?? null });
    if (error) {
      setAviso("No se pudo guardar: " + String(error.message ?? "error"));
    } else {
      setAviso(estado === "entregado" ? "Entregado. El cliente recibirá el correo." : "Guardado.");
      await cargar();
    }
    setOcupado(false);
  }

  async function eliminar(f: Fila) {
    if (!window.confirm(`¿Eliminar la solicitud de ${f.nombre}? Esto no se puede deshacer.`)) return;
    setOcupado(true);
    setAviso(undefined);
    const { error } = await db.rpc("admin_eliminar", { p_id: f.id });
    if (error) setAviso("No se pudo eliminar: " + String(error.message ?? "error"));
    else {
      setAviso("Solicitud eliminada.");
      await cargar();
    }
    setOcupado(false);
  }

  async function eliminarLead(l: Lead) {
    if (!window.confirm(`¿Eliminar el registro de ${l.nombre}? Esto no se puede deshacer.`)) return;
    setOcupado(true);
    setAviso(undefined);
    const { error } = await db.rpc("admin_eliminar_lead", { p_id: l.id });
    if (error) setAviso("No se pudo eliminar: " + String(error.message ?? "error"));
    else {
      setAviso("Registro eliminado.");
      await cargarLeads();
    }
    setOcupado(false);
  }

  // Cuántos leads llegaron desde cada red (para saber qué publicación funciona).
  const porFuente = useMemo(() => {
    const m = new Map<string, number>();
    for (const l of leads) m.set(l.fuente, (m.get(l.fuente) ?? 0) + 1);
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  }, [leads]);

  const cuenta = useMemo(
    () => ({
      cobrar: filas.filter((f) => f.estado === "solicitado").length,
      entregar: filas.filter((f) => f.estado === "pago confirmado").length,
      entregados: filas.filter((f) => f.estado === "entregado").length,
      todos: filas.length,
    }),
    [filas],
  );

  const visibles = useMemo(() => {
    if (filtro === "cobrar") return filas.filter((f) => f.estado === "solicitado");
    if (filtro === "entregar") return filas.filter((f) => f.estado === "pago confirmado");
    if (filtro === "entregados") return filas.filter((f) => f.estado === "entregado");
    return filas;
  }, [filas, filtro]);

  const pestañas: { id: Filtro; label: string }[] = [
    { id: "cobrar", label: `Por cobrar (${cuenta.cobrar})` },
    { id: "entregar", label: `Por entregar (${cuenta.entregar})` },
    { id: "entregados", label: `Entregados (${cuenta.entregados})` },
    { id: "todos", label: `Todos (${cuenta.todos})` },
  ];

  if (sesion === "cargando") {
    return (
      <section className="section">
        <div className="container-page max-w-xl">
          <p className="text-muted-foreground">Cargando…</p>
        </div>
      </section>
    );
  }

  if (sesion === "fuera") {
    return (
      <section className="section">
        <div className="container-page max-w-md">
          <h1 className="text-3xl">Panel ClubApp</h1>
          <Card className="mt-6">
            <form onSubmit={entrar} className="space-y-4">
              <Field label="Correo" error={errLogin}>
                <Input type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} />
              </Field>
              <Field label="Contraseña">
                <Input
                  type="password"
                  autoComplete="current-password"
                  value={clave}
                  onChange={(e) => setClave(e.target.value)}
                />
              </Field>
              <Button type="submit" className="w-full" disabled={entrando}>
                {entrando ? "Entrando…" : "Entrar"}
              </Button>
            </form>
          </Card>
        </div>
      </section>
    );
  }

  return (
    <section className="section">
      <div className="container-page max-w-3xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-3xl">Panel ClubApp</h1>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                void cargar();
                void cargarLeads();
              }}
              disabled={cargando}
            >
              {cargando ? "Actualizando…" : "Actualizar"}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => void salir()}>
              Salir
            </Button>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <Button size="sm" variant={vista === "solicitudes" ? "navy" : "outline"} onClick={() => setVista("solicitudes")}>
            Solicitudes
          </Button>
          <Button size="sm" variant={vista === "guia" ? "navy" : "outline"} onClick={() => setVista("guia")}>
            {`Guía gratis (${leads.length})`}
          </Button>
        </div>

        {vista === "solicitudes" && (
        <div className="mt-4 flex flex-wrap gap-2">
          {pestañas.map((p) => (
            <Button key={p.id} size="sm" variant={filtro === p.id ? "navy" : "outline"} onClick={() => setFiltro(p.id)}>
              {p.label}
            </Button>
          ))}
        </div>
        )}

        {aviso && <p className="mt-4 rounded-lg bg-accent p-3 text-sm font-semibold">{aviso}</p>}
        {vista === "solicitudes" && errorLista && (
          <p className="mt-4 rounded-lg bg-destructive/10 p-3 text-sm font-semibold">{errorLista}</p>
        )}

        {vista === "solicitudes" && (
          <div className="mt-5 space-y-4">
            {!cargando && !errorLista && visibles.length === 0 && (
              <p className="text-muted-foreground">No hay solicitudes en esta lista.</p>
            )}
            {visibles.map((f) => (
              <Tarjeta key={f.id + f.estado} f={f} onCambiar={cambiar} onEliminar={eliminar} ocupado={ocupado} />
            ))}
          </div>
        )}

        {vista === "guia" && (
          <div className="mt-5 space-y-4">
            {errorLeads && <p className="rounded-lg bg-destructive/10 p-3 text-sm font-semibold">{errorLeads}</p>}
            {porFuente.length > 0 && (
              <p className="text-sm text-muted-foreground">
                Por origen:{" "}
                {porFuente.map(([fuente, n]) => `${fuente} ${n}`).join(" · ")}
              </p>
            )}
            {!cargando && !errorLeads && leads.length === 0 && (
              <p className="text-muted-foreground">Todavía no hay registros de la guía.</p>
            )}
            {leads.map((l) => (
              <TarjetaLead key={l.id} l={l} onEliminar={eliminarLead} ocupado={ocupado} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
