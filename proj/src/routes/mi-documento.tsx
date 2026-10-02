import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { Button, ButtonRoute, Card, Field, Input } from "@/components/ui-kit";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/mi-documento")({
  head: () => ({
    meta: [
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

type Estado = { tipo: "pendiente" } | { tipo: "listo"; url: string } | { tipo: "sin" } | { tipo: "error" } | null;

function MiDocumento() {
  const [correo, setCorreo] = useState("");
  const [tel4, setTel4] = useState("");
  const [error, setError] = useState<string>();
  const [estado, setEstado] = useState<Estado>(null);
  const [loading, setLoading] = useState(false);

  async function consultar(e: React.FormEvent) {
    e.preventDefault();
    const r = z.string().trim().email().max(255).safeParse(correo);
    if (!r.success) return setError("Correo no válido");
    setError(undefined);
    setLoading(true);
    if (!/^\d{4}$/.test(tel4)) {
      setLoading(false);
      return setError("Escribe los 4 últimos dígitos de tu WhatsApp");
    }
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error: err } = await (supabase as any).rpc("consultar_entrega", {
        p_correo: r.data,
        p_whatsapp4: tel4,
      });
      if (err) throw err;
      const fila = Array.isArray(data) ? data[0] : data;
      setEstado(
        !fila
          ? { tipo: "sin" }
          : fila.estado === "entregado" && fila.url_documento
            ? { tipo: "listo", url: fila.url_documento }
            : { tipo: "pendiente" },
      );
    } catch (err) {
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
        <p className="mt-3 text-muted-foreground">Escribe el correo y los 4 últimos dígitos del WhatsApp de tu solicitud.</p>
        <Card className="mt-6">
          <form onSubmit={consultar} noValidate className="space-y-4">
            <Field label="Correo electrónico" error={error}>
              <Input type="email" value={correo} maxLength={255} onChange={(e) => setCorreo(e.target.value)} />
            </Field>
            <Field label="Últimos 4 dígitos de tu WhatsApp">
              <Input inputMode="numeric" maxLength={4} value={tel4} onChange={(e) => setTel4(e.target.value.replace(/\D/g, ""))} />
            </Field>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Consultando…" : "Consultar"}
            </Button>
          </form>

          {estado?.tipo === "pendiente" && (
            <div className="mt-5 rounded-xl border border-primary/30 bg-accent p-4 text-sm">
              <p className="font-semibold">Tu solicitud está en proceso.</p>
              <p className="mt-1 text-muted-foreground">
                Entregamos en máximo 24 horas después de confirmar el pago. Te avisaremos por correo y WhatsApp.
              </p>
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
          {estado?.tipo === "sin" && (
            <div className="mt-5 space-y-3 rounded-xl bg-secondary p-4 text-sm">
              <p>No encontramos una solicitud con esos datos.</p>
              <ButtonRoute to="/plan-profesional" size="sm">Solicitar el Plan Profesional</ButtonRoute>
            </div>
          )}
        </Card>
      </div>
    </section>
  );
}
