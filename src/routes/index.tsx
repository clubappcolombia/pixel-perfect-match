import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { FileText, ShieldCheck, Clock } from "lucide-react";
import hero from "@/assets/hero-coach.jpg";
import { KitModal } from "@/components/kit-modal";
import { ComparacionKitPlan } from "@/components/comparacion-kit-plan";
import { MuestraDocumentacion } from "@/components/muestra-documentacion";
import { PlanCards } from "@/components/plan-cards";
import { Card } from "@/components/ui-kit";
import { CONFIG, LEGAL_NOTICE, formatCOP, trackEvent } from "@/lib/config";
import { MEDIOS_PAGO } from "@/lib/oferta";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ClubApp — Documentación para formalizar tu club deportivo en Colombia" },
      {
        name: "description",
        content: `Kit de Formalización por ${formatCOP(CONFIG.PRICE_KIT)}, Plan Profesional por ${formatCOP(CONFIG.PRICE_PLAN)} o Premium por ${formatCOP(CONFIG.PRICE_PREMIUM)}: los documentos que tu club deportivo necesita para avanzar hacia el Reconocimiento Deportivo.`,
      },
      { property: "og:title", content: "ClubApp — Tu club, en regla" },
      {
        property: "og:description",
        content:
          "Documentos para formalizar tu club deportivo en Colombia. Hazlo tú con el Kit o deja que ClubApp prepare tu documentación.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
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

      <section className="surface-navy overflow-hidden">
        <div className="container-page py-10 md:py-14">
          <div className="grid items-center gap-8 md:grid-cols-2">
            <div>
              <span className="eyebrow">Tu club, en regla</span>
              <h1 className="mt-4 text-4xl md:text-5xl">
                Crea y formaliza tu club deportivo <span className="text-primary">sin perder tiempo</span>
              </h1>
              <p className="mt-4 max-w-xl text-lg text-navy-muted">
                Hazlo tú con el Kit de Formalización o deja que ClubApp prepare, diligencie, revise y
                organice tu documentación con la información de tu club.
              </p>
            </div>

            <img
              src={hero}
              alt="Entrenador deportivo con la carpeta de documentos de su club"
              width={1408}
              height={1008}
              fetchPriority="high"
              className="max-h-72 w-full rounded-2xl object-cover shadow-lift md:max-h-80"
            />
          </div>

          <div className="mt-10">
            <h2 className="text-2xl md:text-3xl">Elige tu plan y empieza hoy</h2>
            <p className="mt-2 text-navy-muted">Tres formas de formalizar tu club. Escoge la tuya.</p>
            <div className="mt-4">
              <PlanCards origen="inicio" onElegir={setModal} />
            </div>
            <p className="mt-5 text-sm text-navy-muted">
              ¿No sabes cuál elegir?{" "}
              <Link
                to="/diagnostico"
                className="font-semibold text-navy-foreground underline"
                onClick={() => trackEvent("ClickCTA", { cta: "hero_diagnostico" })}
              >
                Haz el diagnóstico gratis
              </Link>{" "}
              (toma un minuto).
            </p>
            <p className="mt-4 text-xs leading-relaxed text-navy-muted">{LEGAL_NOTICE}</p>
          </div>
        </div>
      </section>

      <section className="section pb-0">
        <div className="container-page">
          <span className="eyebrow">Kit, Profesional o Premium</span>
          <h2 className="mt-3 max-w-2xl text-3xl md:text-4xl">Tres formas distintas de hacerlo</h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            El Kit es para quien quiere hacer el proceso por su cuenta. El Profesional, para quien prefiere
            darnos la información y que lo ayudemos a diligenciar, revisar y organizar. El Premium, para quien
            quiere recibir su carpeta documental organizada y lista para presentar.
          </p>
          <div className="mt-6">
            <ComparacionKitPlan />
          </div>
        </div>
      </section>

      <MuestraDocumentacion />

      <section className="section">
        <div className="container-page grid gap-5 md:grid-cols-3">
          {[
            {
              icon: FileText,
              title: "10 documentos esenciales",
              text: "Acta de constitución, estatutos, comisión disciplinaria, listado de deportistas y más.",
            },
            {
              icon: ShieldCheck,
              title: "Formatos organizados",
              text: "En el Kit: un solo documento Word editable con los 10 documentos, más la guía de diligenciamiento en PDF.",
            },
            {
              icon: Clock,
              title: "Sin demoras",
              text: "Coordinamos todo por WhatsApp. El Kit llega apenas confirmamos tu pago; el Plan Profesional, en máximo 24 horas después de confirmarlo; el Premium, según la información de tu club.",
            },
          ].map((f) => (
            <Card key={f.title}>
              <f.icon className="h-8 w-8 text-primary" />
              <h3 className="mt-4 text-lg">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.text}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="section bg-secondary">
        <div className="container-page">
          <h2 className="text-3xl">¿Cómo funciona?</h2>
          <ol className="mt-6 grid gap-5 md:grid-cols-4">
            {[
              "Eliges tu plan y dejas tus datos.",
              `Coordinamos el pago por WhatsApp (${MEDIOS_PAGO}).`,
              "Confirmamos tu comprobante en la cuenta.",
              "Recibes tus documentos por correo y en “Mi documento”.",
            ].map((step, i) => (
              <li key={step} className="rounded-2xl border bg-card p-5 shadow-card">
                <span className="font-display text-3xl text-primary">{i + 1}</span>
                <p className="mt-2 text-sm text-muted-foreground">{step}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </>
  );
}
