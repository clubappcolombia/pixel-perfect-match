import { createFileRoute } from "@tanstack/react-router";
import { ButtonLink, Card } from "@/components/ui-kit";
import { CONFIG, WA_MESSAGES, whatsappLink } from "@/lib/config";

export const Route = createFileRoute("/ayuda")({
  head: () => ({
    meta: [
      { title: "Centro de ayuda — ClubApp" },
      { name: "description", content: "Respuestas sobre cómo crear y formalizar tu club deportivo en Colombia con ClubApp." },
      { property: "og:title", content: "Centro de ayuda ClubApp" },
      { property: "og:description", content: "Preguntas frecuentes sobre planes, pagos, documentos y tiempos." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Ayuda,
});

const faqs = [
  ["¿Qué es un club deportivo?", "Es una organización sin ánimo de lucro que fomenta la práctica de un deporte y puede obtener Reconocimiento Deportivo ante el ente municipal."],
  ["¿ClubApp garantiza la aprobación?", "No. Preparamos la documentación; la decisión corresponde a la autoridad deportiva."],
  ["¿Cómo pago?", "Coordinamos el pago por WhatsApp (transferencia o Nequi). Al confirmarlo iniciamos tu proceso."],
  ["¿Qué incluye cada plan?", "Kit: un documento Word editable con los 10 formatos y la guía de diligenciamiento en PDF; tú los llenas. Plan Profesional: nosotros diligenciamos los documentos con los datos de tu club. Premium: servicio completo con revisión integral y carpeta organizada para radicar."],
  ["¿Cuánto se demora?", "El Kit se entrega apenas confirmamos tu pago. El Plan Profesional, en máximo 24 horas después de confirmarlo. El Premium depende de la información de tu club."],
  ["¿Qué plan me conviene?", "Haz el diagnóstico gratuito: en un minuto te recomendamos el plan adecuado."],
  ["¿Dónde veo mis documentos?", "En la página “Mi documento”, con el correo que registraste y tu código de seguimiento (te lo mostramos al registrar la solicitud). También te llega un enlace por correo electrónico. Si perdiste el código, escríbenos por WhatsApp."],
];

function Ayuda() {
  return (
    <section className="section">
      <div className="container-page max-w-3xl">
        <span className="eyebrow">Centro de ayuda</span>
        <h1 className="mt-3 text-4xl">¿En qué te ayudamos?</h1>
        <div className="mt-8 space-y-3">
          {faqs.map(([q, a]) => (
            <details key={q} className="rounded-2xl border bg-card p-5 shadow-card">
              <summary className="cursor-pointer font-semibold">{q}</summary>
              <p className="mt-3 text-sm text-muted-foreground">{a}</p>
            </details>
          ))}
        </div>
        <Card className="mt-8 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm">¿No encuentras tu respuesta? Escríbenos o envía un correo a {CONFIG.EMAIL}.</p>
          <ButtonLink variant="whatsapp" href={whatsappLink(WA_MESSAGES.general)} target="_blank" rel="noopener">WhatsApp</ButtonLink>
        </Card>
      </div>
    </section>
  );
}
