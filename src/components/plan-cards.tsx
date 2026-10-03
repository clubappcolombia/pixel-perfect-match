import { Check } from "lucide-react";
import { Button, ButtonRoute, Card } from "@/components/ui-kit";
import { CONFIG, formatCOP, trackEvent } from "@/lib/config";

const kit = [
  "Un solo documento Word editable con 10 documentos",
  "Guía de diligenciamiento en PDF",
  "Tú llenas los documentos a tu ritmo",
  "Entrega apenas confirmamos tu pago",
];
const profesional = [
  "Tú nos das la información de tu club y de sus integrantes",
  "ClubApp prepara y diligencia tus documentos",
  "ClubApp revisa y organiza la documentación",
  "Recibes tus documentos por correo y en “Mi documento”",
  "Entrega en máximo 24 horas tras confirmar el pago",
];
const premium = [
  "Todo lo del Plan Profesional",
  "Organización de la información",
  "Elaboración de la documentación",
  "Revisión integral y carpeta organizada",
  "Documentación organizada para radicar",
  "Tiempo de entrega según la información de tu club",
];

function List({ items }: { items: string[] }) {
  return (
    <ul className="mt-5 flex-1 space-y-2 text-sm">
      {items.map((i) => (
        <li key={i} className="flex gap-2">
          <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
          {i}
        </li>
      ))}
    </ul>
  );
}

/** Los tres planes, cada uno con su botón directo. */
export function PlanCards({ origen, onElegir }: { origen: string; onElegir: (producto: "Kit" | "Premium") => void }) {
  return (
    <div id="planes" className="grid gap-5 pt-3 md:grid-cols-3">
      <Card className="flex flex-col">
        <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Kit de Formalización</p>
        <p className="mt-2 font-display text-4xl">{formatCOP(CONFIG.PRICE_KIT)}</p>
        <p className="text-sm text-muted-foreground">Autoservicio: lo diligencias tú</p>
        <List items={kit} />
        <Button
          className="mt-6"
          onClick={() => {
            trackEvent("ClickCTA", { cta: `${origen}_kit` });
            onElegir("Kit");
          }}
        >
          Elegir Kit
        </Button>
      </Card>

      <Card className="relative flex flex-col border-primary/40 ring-2 ring-primary/30">
        <span className="absolute -top-3 left-6 rounded-full bg-primary px-3 py-1 text-xs font-bold uppercase text-primary-foreground">
          Recomendado
        </span>
        <p className="text-sm font-bold uppercase tracking-widest text-primary-text">Plan Profesional</p>
        <p className="mt-2 font-display text-4xl">{formatCOP(CONFIG.PRICE_PLAN)}</p>
        <p className="text-sm text-muted-foreground">Servicio personalizado: nosotros lo hacemos por ti</p>
        <List items={profesional} />
        <ButtonRoute
          to="/plan-profesional"
          className="mt-6"
          onClick={() => trackEvent("ClickCTA", { cta: `${origen}_profesional` })}
        >
          Elegir Profesional
        </ButtonRoute>
      </Card>

      <Card className="flex flex-col">
        <p className="text-sm font-bold uppercase tracking-widest text-primary-text">Plan Premium</p>
        <p className="mt-2 font-display text-4xl">{formatCOP(CONFIG.PRICE_PREMIUM)}</p>
        <p className="text-sm text-muted-foreground">Servicio completo, carpeta organizada para radicar</p>
        <List items={premium} />
        <Button
          className="mt-6"
          onClick={() => {
            trackEvent("ClickCTA", { cta: `${origen}_premium` });
            onElegir("Premium");
          }}
        >
          Elegir Premium
        </Button>
      </Card>
    </div>
  );
}
