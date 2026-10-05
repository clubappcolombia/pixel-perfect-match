import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2, Download, ListChecks, FileText } from "lucide-react";
import { ComparacionKitPlan } from "@/components/comparacion-kit-plan";
import { GuiaForm } from "@/components/guia-form";
import { KitModal } from "@/components/kit-modal";
import { PlanCards } from "@/components/plan-cards";
import { ButtonLink, Card } from "@/components/ui-kit";
import { LEGAL_NOTICE, WA_MESSAGES, trackEvent, whatsappLink } from "@/lib/config";
import { GUIA_PDF_URL, limpiarFuente } from "@/lib/guia";

export const Route = createFileRoute("/guia-gratis")({
  validateSearch: (search: Record<string, unknown>): { fuente?: string } => {
    const f = limpiarFuente(search["fuente"]);
    return f === "directo" ? {} : { fuente: f };
  },
  head: () => ({
    meta: [
      { title: "Guía gratis para formalizar tu club deportivo — ClubApp" },
      {
        name: "description",
        content:
          "Descarga gratis la guía de diligenciamiento y lista de chequeo de ClubApp para avanzar con la documentación de tu club deportivo.",
      },
      { property: "og:title", content: "Guía gratis para tu club deportivo — ClubApp" },
      {
        property: "og:description",
        content: "Guía de diligenciamiento y lista de chequeo, gratis. Déjanos tus datos y descárgala al instante.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: GuiaGratis,
});

const CONTENIDO = [
  { icon: FileText, title: "Cómo diligenciar tus documentos", text: "Orientación para completar la documentación de tu club paso a paso." },
  { icon: ListChecks, title: "Lista de chequeo", text: "Revisa qué tienes y qué te falta antes de presentar tu documentación." },
];

function GuiaGratis() {
  const { fuente } = Route.useSearch();
  const origen = fuente ?? "directo";
  const [nombre, setNombre] = useState<string | null>(null);
  const [modal, setModal] = useState<"Kit" | "Premium" | null>(null);

  return (
    <>
      <KitModal
        open={modal !== null}
        producto={modal ?? "Kit"}
        onOpenChange={(v) => {
          if (!v) setModal(null);
        }}
      />

      <section className="surface-navy">
        <div className="container-page py-10 md:py-14">
          <span className="eyebrow">Recurso gratuito</span>
          <h1 className="mt-4 max-w-3xl text-4xl md:text-5xl">
            Guía gratis para avanzar con la documentación de tu <span className="text-primary">club deportivo</span>
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-navy-muted">
            Déjanos tus datos y descarga al instante la guía de diligenciamiento y lista de chequeo.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container-page grid gap-8 md:grid-cols-2">
          <div>
            <h2 className="text-3xl">¿Qué encontrarás?</h2>
            <div className="mt-5 space-y-4">
              {CONTENIDO.map((c) => (
                <Card key={c.title} className="flex gap-4">
                  <c.icon className="h-8 w-8 shrink-0 text-primary" />
                  <div>
                    <h3 className="text-lg">{c.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{c.text}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          <Card id="formulario" className="self-start">
            {nombre ? (
              <div className="space-y-4">
                <div className="rounded-xl border border-success/30 bg-success/10 p-4">
                  <p className="flex items-center gap-2 font-semibold">
                    <CheckCircle2 className="h-5 w-5 text-success" />
                    ¡Listo! Tu guía está preparada.
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">Gracias, {nombre}. Descárgala con el botón de abajo.</p>
                </div>
                <ButtonLink
                  size="lg"
                  className="w-full"
                  href={GUIA_PDF_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackEvent("GuiaDescargada", { fuente: origen })}
                >
                  <Download className="h-5 w-5" />
                  Descargar guía
                </ButtonLink>
              </div>
            ) : (
              <>
                <h2 className="font-display text-2xl">Recibe la guía gratis</h2>
                <p className="mb-4 mt-1 text-sm text-muted-foreground">Completa tus datos y la descargas al instante.</p>
                <GuiaForm fuente={origen} onSuccess={setNombre} />
              </>
            )}
          </Card>
        </div>
      </section>

      <section className="section bg-secondary">
        <div className="container-page">
          <span className="eyebrow">Kit, Profesional o Premium</span>
          <h2 className="mt-3 max-w-2xl text-3xl md:text-4xl">¿Quieres que te ayudemos con tu documentación?</h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            La guía es gratis. Si prefieres hacerlo con nuestros documentos o que ClubApp los prepare por ti, estos son los planes.
          </p>
          <div className="mt-4">
            <PlanCards origen="guia" onElegir={setModal} />
          </div>
          <h3 className="mt-12 text-2xl">¿Cuál te conviene?</h3>
          <div className="mt-4">
            <ComparacionKitPlan />
          </div>
          <div className="mt-8">
            <ButtonLink
              variant="whatsapp"
              size="lg"
              href={whatsappLink(WA_MESSAGES.general)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent("WhatsAppClick", { origen: "guia" })}
            >
              Escríbenos por WhatsApp
            </ButtonLink>
          </div>
          <p className="mt-6 text-xs leading-relaxed text-muted-foreground">{LEGAL_NOTICE}</p>
        </div>
      </section>
    </>
  );
}
