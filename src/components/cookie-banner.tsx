import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { getConsent, loadAnalytics, setConsent } from "@/lib/analytics";
import { Button } from "./ui-kit";

/** Aviso de cookies: Google Analytics solo se carga si el visitante pulsa "Aceptar". */
export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const c = getConsent();
    if (c === "si") loadAnalytics();
    if (c === null) setVisible(true);
  }, []);

  if (!visible) return null;

  function elegir(v: "si" | "no") {
    setConsent(v);
    setVisible(false);
  }

  return (
    <div
      role="dialog"
      aria-label="Aviso de cookies"
      className="fixed inset-x-3 bottom-3 z-[60] mx-auto max-w-2xl rounded-2xl border bg-card p-4 shadow-lift md:p-5"
    >
      <p className="text-sm text-muted-foreground">
        Usamos cookies de analítica (Google Analytics) para saber cómo se usa el sitio y mejorarlo. No las activamos si las
        rechazas. Más información en la{" "}
        <Link to="/datos-personales" className="font-semibold text-primary-text underline">
          política de tratamiento de datos
        </Link>
        .
      </p>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:justify-end">
        <Button variant="outline" size="sm" onClick={() => elegir("no")}>
          Rechazar
        </Button>
        <Button size="sm" onClick={() => elegir("si")}>
          Aceptar
        </Button>
      </div>
    </div>
  );
}
