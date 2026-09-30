import { Link } from "@tanstack/react-router";
import { CONFIG, LEGAL_NOTICE } from "@/lib/config";

export function SiteFooter() {
  return (
    <footer className="surface-navy mt-auto">
      <div className="container-page grid gap-8 py-12 md:grid-cols-3">
        <div>
          <p className="font-display text-xl font-extrabold">
            CLUB<span className="text-primary">APP</span>
          </p>
          <p className="mt-1 text-sm text-navy-muted">Tu club, en regla.</p>
          <p className="mt-4 text-sm text-navy-muted">Fundación D.C Tumaco · Colombia</p>
          <p className="text-sm text-navy-muted">{CONFIG.EMAIL}</p>
        </div>

        <div className="space-y-2 text-sm">
          <p className="font-display text-sm font-bold uppercase tracking-widest">Navegación</p>
          <Link to="/" className="block text-navy-muted hover:text-primary">
            Inicio
          </Link>
          <Link to="/kit" className="block text-navy-muted hover:text-primary">
            Kit de Formalización
          </Link>
          <Link to="/plan-profesional" className="block text-navy-muted hover:text-primary">
            Plan Profesional
          </Link>
          <Link to="/mi-documento" className="block text-navy-muted hover:text-primary">
            Mi documento
          </Link>
          <Link to="/datos-personales" className="block text-navy-muted hover:text-primary">
            Tratamiento de datos
          </Link>
        </div>

        <div className="rounded-xl border border-navy-muted/20 bg-navy-foreground/5 p-4">
          <p className="font-display text-sm font-bold uppercase tracking-widest">Aviso legal</p>
          <p className="mt-2 text-sm leading-relaxed text-navy-muted">{LEGAL_NOTICE}</p>
          <p className="mt-2 text-sm leading-relaxed text-navy-muted">
            Verifica siempre los requisitos vigentes de tu instituto municipal de deportes.
          </p>
        </div>
      </div>
      <div className="border-t border-navy-muted/15 py-4 text-center text-xs text-navy-muted">
        © {new Date().getFullYear()} ClubApp. Todos los derechos reservados.
      </div>
    </footer>
  );
}
