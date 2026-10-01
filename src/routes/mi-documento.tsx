import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { Button, ButtonRoute, Card, Field, Input } from "@/components/ui-kit";
import { CONFIG, type Solicitud } from "@/lib/config";

export const Route = createFileRoute("/mi-documento")({
  head: () => ({
    meta: [
      { title: "Mi documento — Consulta tu entrega · ClubApp" },
      { name: "description", content: "Consulta con tu correo el estado de entrega de tus documentos ClubApp." },
      { property: "og:title", content: "Mi documento — ClubApp" },
      { property: "og:description", content: "Revisa si tus documentos ya están listos para descargar." },
    ],
  }),
  component: MiDocumento,
});

type Estado = { tipo: "pendiente" } | { tipo: "listo"; url: string } | { tipo: "sin" } | null;

function MiDocumento() {
  const [correo, setCorreo] = useState("");
  const [error, setError] = useState<string>();
  const [estado, setEstado] = useState<Estado>(null);
  const [loading, setLoading] = useState(false);

  async function consultar(e: React.FormEvent) {
    e.preventDefault();
    const r = z.string().trim().email().max(255).safeParse(correo);
    if (!r.success) return setError("Correo no válido");
    setError(undefined);
    setLoading(true);
    try {
      if (CONFIG.DOWNLOAD_ENDPOINT) {
        const res = await fetch(`${CONFIG.DOWNLOAD_ENDPOINT}?correo=${encodeURIComponent(r.data)}`);
        const data = (await res.json()) as { estado: string; url?: string };
        setEstado(
          data.estado === "entregado" && data.url
            ? { tipo: "listo", url: data.url }
            : data.estado === "sin"
              ? { tipo: "sin" }
              : { tipo: "pendiente" },
        );
      } else {
        const list = JSON.parse(localStorage.getItem("clubapp:solicitudes") ?? "[]") as Solicitud[];
        setEstado(list.some((s) => s.correo.toLowerCase() === r.data.toLowerCase()) ? { tipo: "pendiente" } : { tipo: "sin" });
      }
    } catch {
      setEstado({ tipo: "pendiente" });
    }
    setLoading(false);
  }

  return (
    <section className="section">
      <div className="container-page max-w-xl">
        <span className="eyebrow">Mi documento</span>
        <h1 className="mt-4 text-4xl">Consulta tu entrega</h1>
        <p className="mt-3 text-muted-foreground">Escribe el correo que usaste en tu solicitud.</p>
        <Card className="mt-6">
          <form onSubmit={consultar} noValidate className="space-y-4">
            <Field label="Correo electrónico" error={error}>
              <Input type="email" value={correo} maxLength={255} onChange={(e) => setCorreo(e.target.value)} />
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
          {estado?.tipo === "sin" && (
            <div className="mt-5 space-y-3 rounded-xl bg-secondary p-4 text-sm">
              <p>No encontramos una solicitud con ese correo.</p>
              <ButtonRoute to="/plan-profesional" size="sm">Solicitar el Plan Profesional</ButtonRoute>
            </div>
          )}
        </Card>
      </div>
    </section>
  );
}
