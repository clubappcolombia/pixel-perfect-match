import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { KitModal } from "@/components/kit-modal";
import { PlanCards } from "@/components/plan-cards";
import { CONFIG, LEGAL_NOTICE, formatCOP } from "@/lib/config";

export const Route = createFileRoute("/planes")({
  head: () => ({
    meta: [
      { title: "Planes — ClubApp" },
      { name: "description", content: `Kit ${formatCOP(CONFIG.PRICE_KIT)}, Profesional ${formatCOP(CONFIG.PRICE_PLAN)} o Premium ${formatCOP(CONFIG.PRICE_PREMIUM)} para formalizar tu club deportivo.` },
      { property: "og:title", content: "Planes de ClubApp" },
      { property: "og:description", content: "Hazlo tú con el Kit o deja que ClubApp diligencie tus documentos." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Planes,
});

function Planes() {
  const [modal, setModal] = useState<"Kit" | "Premium" | null>(null);
  return (
    <section className="section">
      <KitModal
        open={modal !== null}
        producto={modal ?? "Kit"}
        onOpenChange={(v) => {
          if (!v) setModal(null);
        }}
      />
      <div className="container-page">
        <span className="eyebrow">Planes</span>
        <h1 className="mt-3 text-4xl">Elige cómo quieres formalizar tu club</h1>
        <div className="mt-8">
          <PlanCards origen="planes" onElegir={setModal} />
        </div>
        <p className="mt-8 text-xs text-muted-foreground">
          ClubApp prepara la documentación; la decisión final corresponde a la autoridad deportiva. {LEGAL_NOTICE}
        </p>
      </div>
    </section>
  );
}
