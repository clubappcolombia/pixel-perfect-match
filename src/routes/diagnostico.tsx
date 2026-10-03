import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button, ButtonLink, ButtonRoute, Card } from "@/components/ui-kit";
import { LEGAL_NOTICE, WA_MESSAGES, trackEvent, whatsappLink } from "@/lib/config";

export const Route = createFileRoute("/diagnostico")({
  head: () => ({
    meta: [
      { title: "Diagnóstico gratuito — ClubApp" },
      {
        name: "description",
        content: "Responde 5 preguntas y descubre qué plan necesita tu club deportivo.",
      },
      { property: "og:title", content: "Diagnóstico gratuito de tu club — ClubApp" },
      {
        property: "og:description",
        content: "En un minuto sabrás en qué punto está tu club y cómo avanzar.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Diagnostico,
});

const preguntas = [
  "¿Ya tienes definido el nombre y el deporte del club?",
  "¿Tienes al menos el grupo de fundadores o deportistas?",
  "¿Ya se realizó la asamblea de constitución?",
  "¿Tienes los estatutos redactados?",
  "¿Te sientes cómodo diligenciando documentos legales?",
];

function Diagnostico() {
  const [resp, setResp] = useState<boolean[]>([]);
  const done = resp.length === preguntas.length;
  const score = resp.filter(Boolean).length;
  const plan = score >= 4 ? "Kit" : score >= 2 ? "Profesional" : "Premium";

  return (
    <section className="section">
      <div className="container-page max-w-2xl">
        <span className="eyebrow">Diagnóstico gratuito</span>
        <h1 className="mt-3 text-4xl">¿En qué punto está tu club?</h1>
        <Card className="mt-8">
          {!done ? (
            <>
              <p className="text-sm text-muted-foreground">
                Pregunta {resp.length + 1} de {preguntas.length}
              </p>
              <div className="mt-2 h-2 rounded-full bg-secondary">
                <div
                  className="h-2 rounded-full bg-primary transition-all"
                  style={{ width: `${(resp.length / preguntas.length) * 100}%` }}
                />
              </div>
              <h2 className="mt-6 text-xl">{preguntas[resp.length]}</h2>
              <div className="mt-6 flex gap-3">
                <Button onClick={() => setResp([...resp, true])}>Sí</Button>
                <Button variant="outline" onClick={() => setResp([...resp, false])}>
                  No
                </Button>
                {resp.length > 0 ? (
                  <Button variant="ghost" onClick={() => setResp(resp.slice(0, -1))}>
                    Atrás
                  </Button>
                ) : null}
              </div>
            </>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                Tu resultado: {score} de {preguntas.length} avances
              </p>
              <h2 className="mt-2 text-2xl">
                Te recomendamos el plan <span className="text-primary">{plan}</span>
              </h2>
              <p className="mt-3 text-sm text-muted-foreground">
                {plan === "Kit" &&
                  "Tu club ya está bien encaminado. Con los formatos y la guía puedes completarlo tú."}
                {plan === "Profesional" &&
                  "Tienes una base, pero te conviene revisión y acompañamiento para evitar errores."}
                {plan === "Premium" &&
                  "Estás empezando. Lo mejor es que organicemos y elaboremos toda la documentación por ti."}
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <ButtonRoute to="/planes" onClick={() => trackEvent("Diagnostico", { plan })}>
                  Ver planes
                </ButtonRoute>
                <ButtonLink
                  variant="whatsapp"
                  href={whatsappLink(`${WA_MESSAGES.diagnostico} Me recomendó el plan ${plan}.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Hablar por WhatsApp
                </ButtonLink>
                <Button variant="ghost" onClick={() => setResp([])}>
                  Repetir
                </Button>
              </div>
            </>
          )}
        </Card>
        <p className="mt-6 text-xs text-muted-foreground">{LEGAL_NOTICE}</p>
      </div>
    </section>
  );
}
