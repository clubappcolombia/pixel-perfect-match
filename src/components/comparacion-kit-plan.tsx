import { CONFIG, formatCOP } from "@/lib/config";
import { FRASE_KIT, FRASE_PREMIUM, FRASE_PROFESIONAL, MEDIOS_PAGO } from "@/lib/oferta";

const filas: { tema: string; kit: string; plan: string; premium: string }[] = [
  {
    tema: "En pocas palabras",
    kit: FRASE_KIT,
    plan: FRASE_PROFESIONAL,
    premium: FRASE_PREMIUM,
  },
  {
    tema: "Quién diligencia los documentos",
    kit: "Tú.",
    plan: "ClubApp, a partir de la información que tú das.",
    premium: "ClubApp, a partir de la información que tú das.",
  },
  {
    tema: "Qué recibes",
    kit: "Un solo documento Word editable con 10 documentos, más la guía de diligenciamiento en PDF.",
    plan: "Tu documentación preparada, diligenciada, revisada y organizada por ClubApp.",
    premium: "Tu carpeta documental organizada, lista para presentar.",
  },
  {
    tema: "Qué haces tú",
    kit: "Llenar los documentos con ayuda de la guía.",
    plan: "Dar la información de tu club y de sus integrantes.",
    premium: "Dar la información de tu club y de sus integrantes, y realizar la radicación.",
  },
  {
    tema: "Entrega",
    kit: "Apenas confirmamos tu pago.",
    plan: "En máximo 24 horas después de confirmar tu pago.",
    premium: "Según la información de tu club.",
  },
  { tema: "Medios de pago", kit: MEDIOS_PAGO, plan: MEDIOS_PAGO, premium: MEDIOS_PAGO },
  {
    tema: "Precio",
    kit: `${formatCOP(CONFIG.PRICE_KIT)} · pago único`,
    plan: formatCOP(CONFIG.PRICE_PLAN),
    premium: formatCOP(CONFIG.PRICE_PREMIUM),
  },
];

const cols = "md:grid-cols-[1fr_1.4fr_1.4fr_1.4fr]";

/** Comparación Kit, Profesional y Premium. En celular cada fila se apila. */
export function ComparacionKitPlan() {
  return (
    <div className="overflow-hidden rounded-2xl border bg-card shadow-card">
      <div className={`hidden gap-4 bg-navy p-4 font-display text-navy-foreground md:grid ${cols}`}>
        <span />
        <span>Kit de Formalización</span>
        <span>Plan Profesional</span>
        <span>Plan Premium</span>
      </div>
      {filas.map((f, i) => (
        <div key={f.tema} className={`grid gap-1 p-4 md:gap-4 ${cols} ${i > 0 ? "border-t" : ""}`}>
          <p className="font-semibold">{f.tema}</p>
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground md:hidden">Kit: </span>
            {f.kit}
          </p>
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground md:hidden">Plan Profesional: </span>
            {f.plan}
          </p>
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground md:hidden">Plan Premium: </span>
            {f.premium}
          </p>
        </div>
      ))}
    </div>
  );
}
