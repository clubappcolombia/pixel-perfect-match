import { createFileRoute } from "@tanstack/react-router";
import { CONFIG } from "@/lib/config";

export const Route = createFileRoute("/datos-personales")({
  head: () => ({
    meta: [
      { title: "Política de tratamiento de datos — ClubApp" },
      { name: "description", content: "Cómo ClubApp recolecta, usa y protege tus datos personales según la Ley 1581 de 2012." },
      { property: "og:title", content: "Tratamiento de datos personales — ClubApp" },
      { property: "og:description", content: "Política de tratamiento de datos personales de ClubApp (Ley 1581 de 2012)." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Datos,
});

function Datos() {
  return (
    <section className="section">
      <div className="container-page max-w-3xl space-y-5 text-muted-foreground">
        <h1 className="text-4xl text-foreground">Política de tratamiento de datos personales</h1>
        <p>
          En cumplimiento de la Ley 1581 de 2012 y el Decreto 1377 de 2013, ClubApp informa cómo
          trata los datos personales que recibe.
        </p>
        <h2 className="text-2xl text-foreground">Datos que recolectamos</h2>
        <p>Nombre, WhatsApp, correo y, para el Plan Profesional, datos del club y de sus integrantes (incluidas cédulas).</p>
        <h2 className="text-2xl text-foreground">Finalidad</h2>
        <p>Únicamente elaborar y entregar los documentos solicitados y comunicarnos contigo sobre tu solicitud. No vendemos tus datos. Para operar el servicio usamos proveedores tecnológicos (como Google y Supabase) que almacenan la información por encargo nuestro.</p>
        <h2 className="text-2xl text-foreground">Tus derechos</h2>
        <p>Puedes conocer, actualizar, rectificar y solicitar la supresión de tus datos, así como revocar la autorización.</p>
        <h2 className="text-2xl text-foreground">Contacto</h2>
        <p>Escríbenos a {CONFIG.EMAIL} o por WhatsApp.</p>
      </div>
    </section>
  );
}
