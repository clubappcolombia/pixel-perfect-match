import { CONFIG, formatCOP } from "@/lib/config";
import { MEDIOS_PAGO } from "@/lib/oferta";

const filas: { tema: string; kit: string; plan: string }[] = [
  {
    tema: "Tipo de producto",
    kit: "Autoservicio: tú haces el proceso por tu cuenta.",
    plan: "Servicio personalizado: ClubApp trabaja con la información de tu club.",
  },
  {
    tema: "Quién diligencia los documentos",
    kit: "Tú.",
    plan: "ClubApp, a partir de la información que tú das.",
  },
  {
    tema: "Qué recibes",
    kit: "Un solo documento Word editable con 10 documentos, más la guía de diligenciamiento en PDF.",
    plan: "Tu documentación preparada, diligenciada, revisada y organizada por ClubApp.",
  },
  {
    tema: "Qué haces tú",
    kit: "Llenar los documentos con ayuda de la guía.",
    plan: "Llenar el formulario con la información de tu club y de sus integrantes.",
  },
  {
    tema: "Entrega",
    kit: "Apenas confirmamos tu pago.",
    plan: "En máximo 24 horas después de confirmar tu pago.",
  },
  { tema: "Medios de pago", kit: MEDIOS_PAGO, plan: MEDIOS_PAGO },
  {
    tema: "Precio",
    kit: `${formatCOP(CONFIG.PRICE_KIT)} · pago único`,
    plan: formatCOP(CONFIG.PRICE_PLAN),
  },
];

/** Comparación sencilla Kit vs Plan Profesional. En celular cada fila se apila. */
export function ComparacionKitPlan() {
  return (
    <div className="overflow-hidden rounded-2xl border bg-card shadow-card">
      <div className="hidden grid-cols-[1.2fr_2fr_2fr] gap-4 bg-navy p-4 font-display text-navy-foreground md:grid">
        <span />
        <span>Kit de Formalización</span>
        <span>Plan Profesional</span>
      </div>
      {filas.map((f, i) => (
        <div
          key={f.tema}
          className={`grid gap-1 p-4 md:grid-cols-[1.2fr_2fr_2fr] md:gap-4 ${i > 0 ? "border-t" : ""}`}
        >
          <p className="font-semibold">{f.tema}</p>
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground md:hidden">Kit: </span>
            {f.kit}
          </p>
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground md:hidden">Plan Profesional: </span>
            {f.plan}
          </p>
        </div>
      ))}
    </div>
  );
}
