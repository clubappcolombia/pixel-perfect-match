import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Check } from "lucide-react";
import { KitModal } from "@/components/kit-modal";
import { Button, ButtonLink, ButtonRoute, Card } from "@/components/ui-kit";
import { CONFIG, LEGAL_NOTICE, WA_MESSAGES, formatCOP, trackEvent, whatsappLink } from "@/lib/config";

export const Route = createFileRoute("/planes")({
  head: () => ({
    meta: [
      { title: "Planes — ClubApp" },
      { name: "description", content: `Básico ${formatCOP(CONFIG.PRICE_KIT)}, Profesional ${formatCOP(CONFIG.PRICE_PLAN)} o Premium ${formatCOP(CONFIG.PRICE_PREMIUM)} para formalizar tu club deportivo.` },
      { property: "og:title", content: "Planes de ClubApp" },
      { property: "og:description", content: "Hazlo tú, hazlo acompañado o déjanos hacerlo por ti." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Planes,
});

const basico = ["Formatos editables", "Guía paso a paso", "Checklist", "Formulario de información", "Documentación base"];
const profesional = ["Todo lo del plan básico", "Asesoría personalizada", "Revisión de información y documentos", "Corrección de errores", "Acompañamiento durante el proceso"];
const premium = ["Todo lo del plan profesional", "Organización de la información", "Elaboración de la documentación", "Revisión integral y carpeta organizada", "Documentación lista para radicar"];

function List({ items }: { items: string[] }) {
  return (
    <ul className="mt-5 flex-1 space-y-2 text-sm">
      {items.map((i) => (
        <li key={i} className="flex gap-2"><Check className="h-4 w-4 shrink-0 text-success" />{i}</li>
      ))}
    </ul>
  );
}

function Planes() {
  const [modal, setModal] = useState(false);
  return (
    <section className="section">
      <KitModal open={modal} onOpenChange={setModal} />
      <div className="container-page">
        <span className="eyebrow">Planes</span>
        <h1 className="mt-3 text-4xl">Elige cómo quieres formalizar tu club</h1>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          <Card className="flex flex-col">
            <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Básico</p>
            <p className="mt-2 font-display text-4xl">{formatCOP(CONFIG.PRICE_KIT)}</p>
            <p className="text-sm text-muted-foreground">Hazlo tú con ClubApp</p>
            <List items={basico} />
            <Button className="mt-6" onClick={() => { trackEvent("ClickCTA", { cta: "planes_basico" }); setModal(true); }}>Elegir Básico</Button>
          </Card>
          <Card className="relative flex flex-col border-primary/40 ring-2 ring-primary/30">
            <span className="absolute -top-3 left-6 rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground">RECOMENDADO</span>
            <p className="text-sm font-bold uppercase tracking-widest text-primary">Profesional</p>
            <p className="mt-2 font-display text-4xl">{formatCOP(CONFIG.PRICE_PLAN)}</p>
            <p className="text-sm text-muted-foreground">Hazlo acompañado por ClubApp</p>
            <List items={profesional} />
            <ButtonRoute to="/plan-profesional" className="mt-6" onClick={() => trackEvent("ClickCTA", { cta: "planes_pro" })}>Elegir Profesional</ButtonRoute>
          </Card>
          <Card className="flex flex-col surface-navy">
            <p className="text-sm font-bold uppercase tracking-widest text-primary">Premium</p>
            <p className="mt-2 font-display text-4xl">{formatCOP(CONFIG.PRICE_PREMIUM)}</p>
            <p className="text-sm text-navy-muted">Nosotros lo hacemos por ti</p>
            <List items={premium} />
            <ButtonLink href={whatsappLink(WA_MESSAGES.premium)} target="_blank" rel="noopener" className="mt-6" onClick={() => trackEvent("ClickCTA", { cta: "planes_premium" })}>Elegir Premium</ButtonLink>
          </Card>
        </div>
        <p className="mt-8 text-xs text-muted-foreground">
          ClubApp prepara la documentación; la decisión final corresponde a la autoridad deportiva. {LEGAL_NOTICE}
        </p>
      </div>
    </section>
  );
}
