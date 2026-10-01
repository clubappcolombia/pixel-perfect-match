// Configuración central de ClubApp.
// Cambia estos valores en un solo lugar; todo el sitio los usa.

export const CONFIG = {
  /** Número de WhatsApp en formato internacional sin "+" (Colombia = 57...). */
  WHATSAPP_NUMBER: "573152803830",
  /** Formulario del club (Google Forms) usado en el paso 2 del Plan. */
  FORM_URL:
    "https://docs.google.com/forms/d/e/1FAIpQLSfWG5aEpYMIDKafHs392dmv8P0ssLrKaTaHPsIJ2rrDKrGnaA/viewform",
  /** Endpoint de Apps Script que registra solicitudes en la hoja. null = solo local. */
  FORM_ENDPOINT: null as string | null,
  /** Endpoint que consulta el estado de entrega por correo. null = solo local. */
  DOWNLOAD_ENDPOINT: null as string | null,
  PRICE_KIT: 40000,
  PRICE_PLAN: 150000,
  EMAIL: "clubappcolombia@gmail.com",
} as const;

export const LEGAL_NOTICE =
  "ClubApp es una herramienta de apoyo documental. No constituye jurídicamente el club, no realiza el trámite ante el instituto municipal de deportes y no garantiza el Reconocimiento Deportivo.";

export function formatCOP(value: number) {
  return "$" + value.toLocaleString("es-CO");
}

export function whatsappLink(message: string) {
  return `https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export const WA_MESSAGES = {
  kit: "Hola, quiero el Kit de Formalización ($40.000).",
  plan: "Hola, quiero el Plan Profesional ($150.000).",
  planPago: "Hola, quiero pagar el Plan Profesional ($150.000). ¿Cuáles son los medios de pago?",
  planComprobante: "Hola, ya envié mi comprobante de pago del Plan Profesional.",
  general: "Hola, tengo una pregunta sobre ClubApp.",
} as const;

export type SolicitudProducto = "Kit" | "Plan";

export interface Solicitud {
  fecha: string;
  producto: SolicitudProducto;
  nombre: string;
  whatsapp: string;
  correo: string;
  estado: "solicitado" | "pago confirmado" | "entregado";
}

/** Guarda la solicitud localmente y, si hay endpoint, también en la hoja. */
export async function guardarSolicitud(
  data: Omit<Solicitud, "fecha" | "estado">,
): Promise<Solicitud> {
  const solicitud: Solicitud = { ...data, fecha: new Date().toISOString(), estado: "solicitado" };

  try {
    const key = "clubapp:solicitudes";
    const prev = JSON.parse(localStorage.getItem(key) ?? "[]") as Solicitud[];
    localStorage.setItem(key, JSON.stringify([...prev, solicitud]));
    localStorage.setItem("clubapp:correo", solicitud.correo);
  } catch {
    /* almacenamiento no disponible */
  }

  if (CONFIG.FORM_ENDPOINT) {
    try {
      await fetch(CONFIG.FORM_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(solicitud),
      });
    } catch {
      /* el flujo continúa por WhatsApp */
    }
  }

  return solicitud;
}

export function trackEvent(name: string, payload?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  const w = window as unknown as { dataLayer?: unknown[] };
  w.dataLayer = w.dataLayer ?? [];
  w.dataLayer.push({ event: name, ...payload });
}
