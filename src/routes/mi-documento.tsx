import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { Button, ButtonLink, Card, Field, Input } from "@/components/ui-kit";
import { WA_MESSAGES, whatsappLink } from "@/lib/config";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/mi-documento")({
  head: () => ({
    meta: [
      { name: "robots", content: "noindex, nofollow" },
      { title: "Mi documento — Consulta tu entrega · ClubApp" },
      { name: "description", content: "Consulta con tu correo el estado de entrega de tus documentos ClubApp." },
      { property: "og:title", content: "Mi documento — ClubApp" },
      { property: "og:description", content: "Revisa si tus documentos ya están listos para descargar." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MiDocumento,
});

type Estado = { tipo: "pendiente"; titulo: string; texto: string } | { tipo: "listo"; url: string } | { tipo: "sin" } | { tipo: "error" } | { tipo: "bloqueado" } | null;

/** Texto según el avance real de la solicitud (los campos nuevos solo existen tras aplicar la migración 20261006). */
function detallePendiente(fila: { estado?: string; comprobante_at?: string | null; formulario_at?: string | null }) {
  if (fila.estado === "rechazado") {
    return {
      titulo: "No pudimos confirmar tu pago.",
      texto: "Escríbenos por WhatsApp para revisar tu caso y continuar.",
    };
  }
  if (fila.estado === "pago confirmado") {
    return {
      titulo: "Pago confirmado: estamos preparando tus documentos.",
      texto: "Te avisaremos por correo y WhatsApp apenas estén listos.",
    };
  }
  if (fila.comprobante_at) {
    return {
      titulo: "Recibimos tu aviso de comprobante.",
      texto: "Estamos verificando el pago en la cuenta. Te avisaremos por correo y WhatsApp.",
    };
  }
  return {
    titulo: "Tu solicitud está en proceso.",
    texto: "Te entregamos tus documentos apenas confirmemos el pago. Te avisaremos por correo y WhatsApp.",
  };
}

function MiDocumento() {
  const [correo, setCorreo] = useState("");
  const [codigo, setCodigo] = useState("");
  const [error, setError] = useState<string>();
  const [estado, setEstado] = useState<Estado>(null);
  const [loading, setLoading] = useState(false);

  async function consultar(e: React.FormEvent) {
    e.preventDefault();
    const r = z.string().trim().email().max(255).safeParse(correo);
    if (!r.success) return setError("Correo no válido");
    setError(undefined);
    setLoading(true);
    const codigoLimpio = codigo.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
    if (codigoLimpio.length !== 10) {
      setLoading(false);
      return setError("Escribe tu código de seguimiento (10 caracteres)");
    }
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error: err } = await (supabase as any).rpc("consultar_entrega", {
        p_correo: r.data,
        p_codigo: codigoLimpio,
      });
      if (err) throw err;
      const fila = Array.isArray(data) ? data[0] : data;
      setEstado(
        !fila
          ? { tipo: "sin" }
          : fila.estado === "entregado" && typeof fila.url_documento === "string" && /^https:\/\//i.test(fila.url_documento)
            ? { tipo: "listo", url: fila.url_documento }
            : { tipo: "pendiente", ...detallePendiente(fila) },
      );
    } catch (err) {
      const msg = String((err as { message?: string })?.message ?? "");
      if (msg.includes("Demasiados intentos")) {
        setEstado({ tipo: "bloqueado" });
        setLoading(false);
        return;
      }
      // Antes un fallo se mostraba como "en proceso" y ocultaba el problema real.
      console.error("[ClubApp] Error al consultar la entrega:", err);
      setEstado({ tipo: "error" });
    }
    setLoading(false);
  }

  return (
    <section className="section">
      <div className="container-page max-w-xl">
        <span className="eyebrow">Mi documento</span>
        <h1 className="mt-4 text-4xl">Consulta tu entrega</h1>
        <p className="mt-3 text-muted-foreground">Escribe el correo y el código de seguimiento que te mostramos al registrar tu solicitud.</p>
        <Card className="mt-6">
          <form onSubmit={consultar} noValidate className="space-y-4">
            <Field label="Correo electrónico" error={error}>
              <Input type="email" value={correo} maxLength={255} onChange={(e) => setCorreo(e.target.value)} />
            </Field>
            <Field label="Código de seguimiento" hint="Ej. 3F9A0-C7B21">
              <Input autoCapitalize="characters" autoComplete="off" maxLength={11} value={codigo} onChange={(e) => setCodigo(e.target.value.toUpperCase())} />
            </Field>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Consultando…" : "Consultar"}
            </Button>
          </form>

          {estado?.tipo === "pendiente" && (
            <div className="mt-5 rounded-xl border border-primary/30 bg-accent p-4 text-sm">
              <p className="font-semibold">{estado.titulo}</p>
              <p className="mt-1 text-muted-foreground">{estado.texto}</p>
            </div>
          )}
          {estado?.tipo === "listo" && (
            <a href={estado.url} target="_blank" rel="noopener noreferrer" className="mt-5 block rounded-xl border border-success/30 bg-success/10 p-4 text-sm font-semibold">
              ¡Tus documentos están listos! Descargar
            </a>
          )}
          {estado?.tipo === "error" && (
            <div className="mt-5 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm">
              <p className="font-semibold">No pudimos consultar tu entrega en este momento.</p>
              <p className="mt-1 text-muted-foreground">
                Intenta de nuevo en unos minutos o escríbenos por WhatsApp.
              </p>
            </div>
          )}
          {estado?.tipo === "bloqueado" && (
            <div className="mt-5 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm">
              <p className="font-semibold">Demasiados intentos.</p>
              <p className="mt-1 text-muted-foreground">
                Espera 15 minutos e intenta de nuevo, o escríbenos por WhatsApp y te ayudamos.
              </p>
            </div>
          )}
          {estado?.tipo === "sin" && (
            <div className="mt-5 space-y-3 rounded-xl bg-secondary p-4 text-sm">
              <p>No encontramos una solicitud con esos datos. Revisa el correo y el código, o escríbenos si no lo tienes.</p>
              <ButtonLink href={whatsappLink(WA_MESSAGES.general)} target="_blank" rel="noopener noreferrer" variant="whatsapp" size="sm">
                Escribir por WhatsApp
              </ButtonLink>
            </div>
          )}
        </Card>
      </div>
    </section>
  );
}
