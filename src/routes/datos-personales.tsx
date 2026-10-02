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
        <h2 className="text-2xl text-foreground">Responsable del tratamiento</h2>
        <p>
          ClubApp Colombia. Contacto para consultas y reclamos: {CONFIG.EMAIL} o por WhatsApp.
        </p>
        <h2 className="text-2xl text-foreground">Datos que recolectamos</h2>
        <p>Nombre, WhatsApp, correo y, para el Plan Profesional y el Premium, datos del club y de sus integrantes (incluidas cédulas).</p>
        <h2 className="text-2xl text-foreground">Datos de menores de edad</h2>
        <p>
          Si entre los integrantes del club hay menores de edad, quien nos entrega sus datos declara contar con la autorización de sus
          representantes legales. Tratamos esos datos únicamente para elaborar los documentos del club y respetamos el interés superior del menor.
        </p>
        <h2 className="text-2xl text-foreground">Finalidad</h2>
        <p>Únicamente elaborar y entregar los documentos solicitados y comunicarnos contigo sobre tu solicitud. No vendemos tus datos.</p>
        <h2 className="text-2xl text-foreground">Proveedores y transmisión de datos</h2>
        <p>
          Para operar el servicio usamos proveedores tecnológicos (como Google y Supabase) que almacenan la información por encargo nuestro y
          pueden hacerlo en servidores ubicados fuera de Colombia.
        </p>
        <h2 className="text-2xl text-foreground">Conservación</h2>
        <p>
          Conservamos los datos solo el tiempo necesario para entregar el servicio y atender reclamos. Puedes pedirnos en cualquier momento
          que los eliminemos.
        </p>
        <h2 className="text-2xl text-foreground">Tus derechos</h2>
        <p>Puedes conocer, actualizar, rectificar y solicitar la supresión de tus datos, así como revocar la autorización.</p>
        <h2 className="text-2xl text-foreground">Consultas y reclamos</h2>
        <p>
          Atendemos las consultas en máximo 10 días hábiles y los reclamos en máximo 15 días hábiles, contados desde su recibo. Escríbenos a{" "}
          {CONFIG.EMAIL} indicando tu nombre y qué necesitas.
        </p>
        <p className="text-sm">Última actualización: 2 de octubre de 2026.</p>
      </div>
    </section>
  );
}
