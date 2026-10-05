import { ButtonRoute } from "@/components/ui-kit";
import { trackEvent } from "@/lib/config";

/** Franja "Recurso gratuito" del inicio: lleva a /guia-gratis. */
export function GuiaBanner() {
  return (
    <div className="mt-8 flex flex-col gap-4 rounded-2xl border-2 border-dashed border-navy/30 bg-card p-5 text-foreground md:flex-row md:items-center md:justify-between">
      <div>
        <span className="text-xs font-bold uppercase tracking-widest text-primary-text">Recurso gratuito</span>
        <p className="mt-1 font-display text-xl">Guía de diligenciamiento y lista de chequeo</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Descárgala gratis y conoce qué documentos necesita tu club, sin compromiso de compra.
        </p>
      </div>
      <ButtonRoute
        to="/guia-gratis"
        variant="navy"
        size="lg"
        className="shrink-0"
        onClick={() => trackEvent("ClickCTA", { cta: "inicio_guia_gratis" })}
      >
        Obtener guía gratis
      </ButtonRoute>
    </div>
  );
}
