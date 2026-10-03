import { CONFIG } from "@/lib/config";

const KEY = "clubapp:cookies";

export type Consentimiento = "si" | "no" | null;

type GtagWindow = Window & {
  dataLayer?: unknown[];
  gtag?: (...args: unknown[]) => void;
  [clave: `ga-disable-${string}`]: boolean | undefined;
};

export function getConsent(): Consentimiento {
  try {
    const v = localStorage.getItem(KEY);
    return v === "si" || v === "no" ? v : null;
  } catch {
    return null;
  }
}

let cargado = false;

/** Carga Google Analytics 4. Solo debe llamarse cuando el visitante aceptó las cookies. */
export function loadAnalytics() {
  if (typeof window === "undefined" || cargado) return;
  const id = CONFIG.GA_ID;
  if (!id || !/^G-[A-Z0-9]+$/.test(id)) return;
  cargado = true;

  const w = window as unknown as GtagWindow;
  w[`ga-disable-${id}`] = false;
  w.dataLayer = w.dataLayer ?? [];
  w.gtag = function () {
    // gtag.js espera el objeto "arguments", no un arreglo.
    // eslint-disable-next-line prefer-rest-params
    w.dataLayer?.push(arguments);
  };
  w.gtag("js", new Date());
  w.gtag("config", id);

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
  document.head.appendChild(script);
}

export function setConsent(v: "si" | "no") {
  try {
    localStorage.setItem(KEY, v);
  } catch {
    /* sin almacenamiento: la elección vale solo para esta visita */
  }
  const id = CONFIG.GA_ID;
  if (v === "si") {
    loadAnalytics();
  } else if (id && typeof window !== "undefined") {
    (window as unknown as GtagWindow)[`ga-disable-${id}`] = true;
  }
}
