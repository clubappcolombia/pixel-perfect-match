import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Check, ExternalLink } from "lucide-react";
import { CodigoAcceso } from "@/components/codigo-acceso";
import { SolicitudForm, type SolicitudData } from "@/components/solicitud-form";
import { Button, ButtonLink, ButtonRoute, Card } from "@/components/ui-kit";
import {
  CONFIG,
  LEGAL_NOTICE,
  WA_MESSAGES,
  conDatos,
  formUrl,
  formatCOP,
  registrarProgreso,
  trackEvent,
  whatsappLink,
} from "@/lib/config";

export const Route = createFileRoute("/plan-profesional")({
  head: () => ({
    meta: [
      { title: `Plan Profesional ${formatCOP(CONFIG.PRICE_PLAN)} — ClubApp` },
      {
        name: "description",
        content:
          `Nosotros diligenciamos la documentación de tu club deportivo y la entregamos en máximo 24 horas tras confirmar el pago. ${formatCOP(CONFIG.PRICE_PLAN)} COP.`,
      },
      { property: "og:title", content: "Plan Profesional — ClubApp" },
      {
        property: "og:description",
        content: "Entrega en 24 horas: ClubApp diligencia los documentos de tu club. Pago por WhatsApp.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PlanPage,
});

const KEY = "clubapp:plan";
const pasos = ["Tus datos", "Datos del club", "Pago por WhatsApp", "Entrega"];

interface Progreso {
  paso: number;
  datos: SolicitudData | null;
  formAbierto: boolean;
  comprobante: boolean;
}

const inicial: Progreso = { paso: 0, datos: null, formAbierto: false, comprobante: false };

function PlanPage() {
  const [p, setP] = useState<Progreso>(inicial);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setP({ ...inicial, ...JSON.parse(raw) });
    } catch {
      /* ignore */
    }
  }, []);

  function update(next: Partial<Progreso>) {
    setP((prev) => {
      const v = { ...prev, ...next };
      try {
        localStorage.setItem(KEY, JSON.stringify(v));
      } catch {
        /* ignore */
      }
      return v;
    });
  }

  return (
    <>
      <section className="surface-navy">
        <div className="container-page py-12">
          <span className="eyebrow">Nosotros lo hacemos</span>
          <h1 className="mt-4 text-4xl md:text-5xl">
            Plan Profesional · <span className="text-primary">{formatCOP(CONFIG.PRICE_PLAN)}</span>
          </h1>
          <p className="mt-3 max-w-2xl text-lg text-navy-muted">
            Nos das los datos del club y diligenciamos todo. Entrega en máximo 24 horas después de
            confirmar tu pago.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container-page max-w-3xl">
          <ol className="mb-8 grid grid-cols-4 gap-2">
            {pasos.map((label, i) => (
              <li key={label} className="text-center">
                <span
                  className={`mx-auto flex h-9 w-9 items-center justify-center rounded-full font-display text-sm ${
                    i < p.paso
                      ? "bg-success text-success-foreground"
                      : i === p.paso
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {i < p.paso ? <Check className="h-4 w-4" /> : i + 1}
                </span>
                <span className="mt-1 block text-xs font-semibold">{label}</span>
              </li>
            ))}
          </ol>

          <Card>
            {p.paso === 0 && (
              <>
                <h2 className="text-2xl">Paso 1 · Tus datos</h2>
                <p className="mb-4 mt-3 rounded-lg bg-secondary p-3 text-xs text-muted-foreground">
                  {LEGAL_NOTICE}
                </p>
                <SolicitudForm
                  producto="Plan"
                  submitLabel="Continuar"
                  onSuccess={(datos) => {
                    trackEvent("Lead", { producto: "Plan" });
                    update({ datos, paso: 1 });
                  }}
                />
              </>
            )}

            {p.paso === 1 && (
              <>
                <h2 className="text-2xl">Paso 2 · Datos del club</h2>
                <p className="mt-3 text-sm text-muted-foreground">
                  Completa el formulario con la información del club y de sus integrantes (incluye
                  cédulas). Usa el mismo correo: <strong>{p.datos?.correo}</strong>.
                </p>
                {p.datos?.codigo ? (
                  <div className="mt-4">
                    <CodigoAcceso codigo={p.datos.codigo} />
                  </div>
                ) : null}
                <div className="mt-5 flex flex-col gap-3">
                  <ButtonLink
                    href={formUrl(p.datos?.correo)}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="navy"
                    onClick={() => update({ formAbierto: true })}
                  >
                    Abrir formulario del club <ExternalLink className="h-4 w-4" />
                  </ButtonLink>
                  <Button
                    disabled={!p.formAbierto}
                    onClick={() => {
                      if (p.datos) void registrarProgreso(p.datos, "formulario_completado");
                      update({ paso: 2 });
                    }}
                  >
                    Ya llené el formulario
                  </Button>
                </div>
              </>
            )}

            {p.paso === 2 && (
              <>
                <h2 className="text-2xl">Paso 3 · Pago por WhatsApp</h2>
                <p className="mt-3 text-sm text-muted-foreground">
                  Escríbenos por WhatsApp, te indicamos los medios de pago y nos envías el
                  comprobante. Generamos tus documentos solo después de verificar el pago.
                </p>
                <div className="mt-5 flex flex-col gap-3">
                  <ButtonLink
                    href={whatsappLink(p.datos ? conDatos(WA_MESSAGES.planPago, p.datos) : WA_MESSAGES.planPago)}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="whatsapp"
                    size="lg"
                    onClick={() => trackEvent("WhatsAppClick", { origen: "plan_pago" })}
                  >
                    Pagar por WhatsApp
                  </ButtonLink>
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (p.datos) void registrarProgreso(p.datos, "comprobante_enviado");
                      update({ comprobante: true, paso: 3 });
                    }}
                  >
                    Ya envié mi comprobante
                  </Button>
                </div>
              </>
            )}

            {p.paso === 3 && (
              <>
                <h2 className="text-2xl">Paso 4 · Entrega</h2>
                <div className="mt-4 rounded-xl border border-primary/30 bg-accent p-4 text-sm">
                  <p className="font-semibold">Tu pago está en revisión.</p>
                  <p className="mt-1 text-muted-foreground">
                    Cuando confirmemos el pago en la cuenta, recibirás tus documentos en máximo 24
                    horas en <strong>{p.datos?.correo}</strong> y en “Mi documento”.
                  </p>
                </div>
                {p.datos?.codigo ? (
                  <div className="mt-4">
                    <CodigoAcceso codigo={p.datos.codigo} />
                  </div>
                ) : null}
                <ButtonRoute to="/mi-documento" variant="outline" className="mt-5 w-full">
                  Consultar el estado de mi entrega
                </ButtonRoute>
                <button
                  className="mt-5 text-sm font-semibold text-primary underline"
                  onClick={() => update(inicial)}
                >
                  Empezar una nueva solicitud
                </button>
              </>
            )}
          </Card>
        </div>
      </section>
    </>
  );
}
