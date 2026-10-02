import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Check, FileText, ShieldCheck, Clock, X } from "lucide-react";
import hero from "@/assets/hero-coach.jpg";
import { KitModal } from "@/components/kit-modal";
import { Button, ButtonRoute, Card } from "@/components/ui-kit";
import { CONFIG, LEGAL_NOTICE, formatCOP, trackEvent } from "@/lib/config";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ClubApp — Documentación para formalizar tu club deportivo en Colombia" },
      {
        name: "description",
        content:
          `Kit de Formalización por ${formatCOP(CONFIG.PRICE_KIT)} o Plan Profesional por ${formatCOP(CONFIG.PRICE_PLAN)}: los documentos que tu club deportivo necesita para avanzar hacia el Reconocimiento Deportivo.`,
      },
      { property: "og:title", content: "ClubApp — Tu club, en regla" },
      {
        property: "og:description",
        content:
          "Documentos listos para formalizar tu club deportivo en Colombia. Kit de autogestión o Plan Profesional con entrega en 24 horas.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const comparacion = [
  { label: "10 documentos en Word editable", kit: true, plan: true },
  { label: "Guía de diligenciamiento y lista de chequeo", kit: true, plan: true },
  { label: "Tú diligencias los documentos", kit: true, plan: false },
  { label: "ClubApp diligencia por ti", kit: false, plan: true },
  { label: "Entrega en 24 h tras confirmar el pago", kit: false, plan: true },
  { label: "Acompañamiento por WhatsApp", kit: true, plan: true },
];

function Index() {
  const [modal, setModal] = useState(false);

  return (
    <>
      <KitModal open={modal} onOpenChange={setModal} />

      <section className="surface-navy overflow-hidden">
        <div className="container-page grid items-center gap-10 py-14 md:grid-cols-2 md:py-20">
          <div>
            <span className="eyebrow">Tu club, en regla</span>
            <h1 className="mt-4 text-4xl md:text-5xl">
              Crea y formaliza tu club deportivo <span className="text-primary">sin perder tiempo</span>
            </h1>
            <p className="mt-4 max-w-xl text-lg text-navy-muted">
              Organiza la información de tu club, completa tu documentación y recibe acompañamiento
              durante el proceso.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <ButtonRoute
                to="/diagnostico"
                size="lg"
                onClick={() => trackEvent("ClickCTA", { cta: "hero_crear" })}
              >
                Crear mi club
              </ButtonRoute>
              <ButtonRoute
                to="/planes"
                variant="outline"
                size="lg"
                className="bg-transparent text-navy-foreground hover:bg-navy-foreground/10"
                onClick={() => trackEvent("ClickCTA", { cta: "hero_plan" })}
              >
                Ver planes
              </ButtonRoute>
            </div>
            <p className="mt-5 text-xs leading-relaxed text-navy-muted">{LEGAL_NOTICE}</p>
          </div>

          <img
            src={hero}
            alt="Entrenador deportivo con la carpeta de documentos de su club"
            width={1408}
            height={1008}
            className="w-full rounded-2xl object-cover shadow-lift"
          />
        </div>
      </section>

      <section className="section pb-0">
        <div className="container-page">
          <span className="eyebrow">Más que formatos</span>
          <h2 className="mt-3 max-w-2xl text-3xl md:text-4xl">Te acompañamos en todo el camino</h2>
          <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-6">
            {["Organización", "Documentación", "Automatización", "Acompañamiento", "Asesoría", "Seguimiento"].map((t) => (
              <div key={t} className="rounded-xl border bg-card px-3 py-4 text-center text-sm font-semibold shadow-card">
                {t}
              </div>
            ))}
          </div>
        </div>
      </section>

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
              title: "Formato aceptado",
              text: "Plantillas en Word editable, con guía paso a paso y lista de chequeo.",
            },
            {
              icon: Clock,
              title: "Sin demoras",
              text: "Con el Plan Profesional entregamos en máximo 24 horas tras confirmar el pago.",
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
          <div className="max-w-2xl">
            <span className="eyebrow">Elige tu camino</span>
            <h2 className="mt-3 text-3xl md:text-4xl">Kit de Formalización o Plan Profesional</h2>
            <p className="mt-2 text-sm">
              ¿Prefieres que hagamos todo?{" "}
              <Link to="/planes" className="font-semibold text-primary underline">Mira el Plan Premium</Link>.
            </p>
            <p className="mt-3 text-muted-foreground">
              Ambos incluyen los mismos documentos. La diferencia está en quién los diligencia.
            </p>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-2">
            <Card className="flex flex-col">
              <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
                Kit de Formalización
              </p>
              <p className="mt-2 font-display text-4xl">{formatCOP(CONFIG.PRICE_KIT)}</p>
              <p className="text-sm text-muted-foreground">Pago único · Autogestión</p>
              <p className="mt-4 flex-1 text-sm text-muted-foreground">
                Recibes los 10 documentos en Word, la guía de diligenciamiento y la lista de
                chequeo. Tú los completas a tu ritmo.
              </p>
              <div className="mt-6 flex flex-col gap-2">
                <Button
                  onClick={() => {
                    trackEvent("ClickCTA", { cta: "comparacion_kit" });
                    setModal(true);
                  }}
                >
                  Comprar mi kit
                </Button>
                <Link to="/kit" className="text-center text-sm font-semibold text-primary underline">
                  Ver qué incluye
                </Link>
              </div>
            </Card>

            <Card className="flex flex-col border-primary/40 ring-2 ring-primary/20">
              <p className="text-sm font-bold uppercase tracking-widest text-primary">
                Plan Profesional
              </p>
              <p className="mt-2 font-display text-4xl">{formatCOP(CONFIG.PRICE_PLAN)}</p>
              <p className="text-sm text-muted-foreground">Pago único · Nosotros lo hacemos</p>
              <p className="mt-4 flex-1 text-sm text-muted-foreground">
                Nos entregas los datos del club y nosotros diligenciamos todo. Entrega en máximo 24
                horas después de confirmar el pago.
              </p>
              <div className="mt-6">
                <ButtonRoute
                  to="/plan-profesional"
                  className="w-full"
                  onClick={() => trackEvent("ClickCTA", { cta: "comparacion_plan" })}
                >
                  Solicitar el Plan
                </ButtonRoute>
              </div>
            </Card>
          </div>

          <div className="mt-8 overflow-hidden rounded-2xl border bg-card shadow-card">
            <table className="w-full text-left text-sm">
              <thead className="surface-navy">
                <tr>
                  <th className="px-4 py-3 font-display text-xs uppercase tracking-widest">
                    Incluye
                  </th>
                  <th className="w-20 px-4 py-3 text-center font-display text-xs uppercase">Kit</th>
                  <th className="w-20 px-4 py-3 text-center font-display text-xs uppercase">Plan</th>
                </tr>
              </thead>
              <tbody>
                {comparacion.map((row) => (
                  <tr key={row.label} className="border-t">
                    <td className="px-4 py-3">{row.label}</td>
                    <td className="px-4 py-3 text-center">
                      <Mark on={row.kit} />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Mark on={row.plan} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container-page">
          <h2 className="text-3xl">¿Cómo funciona?</h2>
          <ol className="mt-6 grid gap-5 md:grid-cols-4">
            {[
              "Eliges Kit o Plan y dejas tus datos.",
              "Coordinamos el pago por WhatsApp (transferencia o Nequi).",
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

function Mark({ on }: { on: boolean }) {
  return on ? (
    <Check className="mx-auto h-5 w-5 text-success" aria-label="Sí" />
  ) : (
    <X className="mx-auto h-5 w-5 text-muted-foreground" aria-label="No" />
  );
}
