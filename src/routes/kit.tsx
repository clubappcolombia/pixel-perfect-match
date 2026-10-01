import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import * as Accordion from "@radix-ui/react-accordion";
import { ChevronDown, Check } from "lucide-react";
import { KitModal } from "@/components/kit-modal";
import { Button, ButtonRoute, Card, Steps } from "@/components/ui-kit";
import { CONFIG, LEGAL_NOTICE, formatCOP, trackEvent } from "@/lib/config";

export const Route = createFileRoute("/kit")({
  head: () => ({
    meta: [
      { title: "Kit de Formalización $40.000 — ClubApp" },
      {
        name: "description",
        content:
          "10 documentos en Word editable, guía de diligenciamiento y lista de chequeo para formalizar tu club deportivo. Pago único de $40.000 COP.",
      },
      { property: "og:title", content: "Kit de Formalización — ClubApp" },
      {
        property: "og:description",
        content:
          "Los 10 documentos que tu club necesita, en Word editable, con guía paso a paso. $40.000 COP, pago único.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: KitPage,
});

const documentos = [
  "Carta de solicitud",
  "Acta de constitución",
  "Estatutos del club",
  "Comisión disciplinaria",
  "Relación de instalaciones",
  "Listado de deportistas",
  "Aceptación de cargos",
  "Normativa antidopaje",
  "Plan de desarrollo deportivo",
  "Lista de chequeo",
];

const faqs = [
  {
    q: "¿El kit constituye legalmente mi club?",
    a: "No. El kit te entrega los documentos organizados y listos para diligenciar. La constitución jurídica y el trámite ante el instituto municipal de deportes los realizas tú.",
  },
  {
    q: "¿Cómo pago?",
    a: "El pago se coordina por WhatsApp. Te indicamos los medios disponibles (transferencia o Nequi), envías el comprobante y al confirmarlo recibes el kit.",
  },
  {
    q: "¿En qué formato llegan los documentos?",
    a: "En Word editable, para que los adaptes al nombre, la sede y los integrantes de tu club.",
  },
  {
    q: "¿Sirve para cualquier municipio?",
    a: "Las plantillas son generales para Colombia. Siempre debes verificar los requisitos específicos de tu instituto municipal de deportes.",
  },
  {
    q: "¿Y si prefiero que ustedes lo diligencien?",
    a: "Para eso está el Plan Profesional de $150.000: tú entregas los datos y nosotros preparamos todo en máximo 24 horas.",
  },
];

function KitPage() {
  const [modal, setModal] = useState(false);

  return (
    <>
      <KitModal open={modal} onOpenChange={setModal} />

      <section className="surface-navy">
        <div className="container-page py-14 md:py-18">
          <span className="eyebrow">Autogestión</span>
          <h1 className="mt-4 max-w-3xl text-4xl md:text-5xl">
            Deja de buscar formatos sueltos en internet
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-navy-muted">
            Reunimos en un solo kit los 10 documentos que piden para el Reconocimiento Deportivo,
            con guía de diligenciamiento y lista de chequeo.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button
              size="lg"
              onClick={() => {
                trackEvent("ClickCTA", { cta: "kit_hero" });
                setModal(true);
              }}
            >
              Comprar mi kit · {formatCOP(CONFIG.PRICE_KIT)}
            </Button>
            <span className="text-sm text-navy-muted">Pago único · Entrega por WhatsApp o correo</span>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container-page grid gap-8 md:grid-cols-2">
          <div>
            <h2 className="text-3xl">El problema</h2>
            <ul className="mt-4 space-y-3 text-muted-foreground">
              <li>No sabes exactamente qué documentos te van a pedir.</li>
              <li>Los formatos que encuentras están incompletos o desactualizados.</li>
              <li>Cada municipio pide los requisitos a su manera.</li>
              <li>Pierdes semanas corrigiendo y volviendo a radicar.</li>
            </ul>
          </div>
          <Card>
            <h2 className="text-2xl">Qué incluye el kit</h2>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {documentos.map((d) => (
                <li key={d} className="flex items-start gap-2 text-sm">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                  <span>{d}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm text-muted-foreground">
              Todos en Word editable, más la guía de diligenciamiento.
            </p>
          </Card>
        </div>
      </section>

      <section className="section bg-secondary">
        <div className="container-page">
          <h2 className="text-3xl">Cómo funciona</h2>
          <Steps
            items={[
              "Pulsas “Comprar mi kit” y dejas tus datos.",
              "Se abre WhatsApp con tu mensaje listo.",
              "Te indicamos los medios de pago y envías el comprobante.",
              "Confirmamos el pago y te entregamos el kit.",
            ]}
          />
        </div>
      </section>

      <section className="section">
        <div className="container-page grid gap-8 md:grid-cols-2">
          <div>
            <h2 className="text-3xl">¿Para quién es?</h2>
            <ul className="mt-4 space-y-3 text-muted-foreground">
              <li>Entrenadores que quieren formalizar su equipo sin gastar de más.</li>
              <li>Profesores de educación física que lideran un club escolar.</li>
              <li>Líderes comunitarios con tiempo para diligenciar ellos mismos.</li>
            </ul>
            <h3 className="mt-8 text-xl">¿Prefieres delegarlo?</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Con el Plan Profesional ({formatCOP(CONFIG.PRICE_PLAN)}) nosotros diligenciamos y
              entregamos en 24 horas tras confirmar el pago.
            </p>
            <ButtonRoute to="/plan-profesional" variant="outline" className="mt-4">
              Ver el Plan Profesional
            </ButtonRoute>
          </div>

          <div>
            <h2 className="text-3xl">Preguntas frecuentes</h2>
            <Accordion.Root type="single" collapsible className="mt-4 divide-y rounded-2xl border bg-card shadow-card">
              {faqs.map((f) => (
                <Accordion.Item key={f.q} value={f.q}>
                  <Accordion.Header>
                    <Accordion.Trigger className="group flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                      {f.q}
                      <ChevronDown className="h-4 w-4 shrink-0 text-primary transition-transform group-data-[state=open]:rotate-180" />
                    </Accordion.Trigger>
                  </Accordion.Header>
                  <Accordion.Content className="px-5 pb-4 text-sm text-muted-foreground">
                    {f.a}
                  </Accordion.Content>
                </Accordion.Item>
              ))}
            </Accordion.Root>
          </div>
        </div>
      </section>

      <section className="surface-navy">
        <div className="container-page flex flex-col items-start gap-5 py-12 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl">Empieza hoy con tu kit</h2>
            <p className="mt-2 max-w-xl text-sm text-navy-muted">{LEGAL_NOTICE}</p>
          </div>
          <Button
            size="lg"
            onClick={() => {
              trackEvent("ClickCTA", { cta: "kit_footer" });
              setModal(true);
            }}
          >
            Comprar mi kit · {formatCOP(CONFIG.PRICE_KIT)}
          </Button>
        </div>
      </section>
    </>
  );
}
