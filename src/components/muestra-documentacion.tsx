import { MUESTRA_DOC_URL } from "@/lib/oferta";

/** "Así se ve tu documentación". Solo se muestra si hay una muestra anonimizada configurada en oferta.ts. */
export function MuestraDocumentacion() {
  if (!MUESTRA_DOC_URL) return null;
  return (
    <section className="section">
      <div className="container-page">
        <span className="eyebrow">Muestra</span>
        <h2 className="mt-3 max-w-2xl text-3xl md:text-4xl">Así se ve tu documentación</h2>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Ejemplo de un documento real preparado por ClubApp. Ocultamos los datos personales y sensibles.
        </p>
        <img
          src={MUESTRA_DOC_URL}
          alt="Muestra de documentación de un club, con datos personales ocultos"
          loading="lazy"
          className="mt-6 w-full max-w-3xl rounded-2xl border shadow-card"
        />
      </div>
    </section>
  );
}
