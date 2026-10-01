import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import logo from "@/assets/clubapp-logo.asset.json";
import { WA_MESSAGES, whatsappLink, trackEvent } from "@/lib/config";
import { ButtonLink } from "./ui-kit";

const links = [
  { to: "/", label: "Inicio" },
  { to: "/kit", label: "Kit" },
  { to: "/plan-profesional", label: "Plan Profesional" },
  { to: "/mi-documento", label: "Mi documento" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b bg-card/95 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
          <img src={logo.url} alt="ClubApp" className="h-10 w-10 rounded-md object-contain" />
          <span className="font-display text-lg font-extrabold tracking-tight">
            CLUB<span className="text-primary">APP</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              activeOptions={{ exact: l.to === "/" }}
              activeProps={{ className: "text-primary" }}
              className="rounded-md px-3 py-2 text-sm font-semibold text-foreground transition-colors hover:text-primary"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ButtonLink
            href={whatsappLink(WA_MESSAGES.general)}
            target="_blank"
            rel="noopener noreferrer"
            variant="primary"
            size="sm"
            className="hidden sm:inline-flex"
            onClick={() => trackEvent("WhatsAppClick", { origen: "header" })}
          >
            Escríbenos
          </ButtonLink>
          <button
            type="button"
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border md:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open ? (
        <nav className="border-t bg-card md:hidden">
          <div className="container-page flex flex-col py-2">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                activeOptions={{ exact: l.to === "/" }}
                activeProps={{ className: "text-primary" }}
                onClick={() => setOpen(false)}
                className="rounded-md px-1 py-3 text-base font-semibold"
              >
                {l.label}
              </Link>
            ))}
            <ButtonLink
              href={whatsappLink(WA_MESSAGES.general)}
              target="_blank"
              rel="noopener noreferrer"
              variant="primary"
              className="my-3"
              onClick={() => trackEvent("WhatsAppClick", { origen: "header_movil" })}
            >
              Escríbenos por WhatsApp
            </ButtonLink>
          </div>
        </nav>
      ) : null}
    </header>
  );
}
