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
  PRICE_KIT: 50000,
  PRICE_PLAN: 160000,
  PRICE_PREMIUM: 300000,
  EMAIL: "clubappcolombia@gmail.com",
  /** Campo del correo en Google Forms (ej. "entry.123456789") para que el formulario llegue con el correo ya escrito. null = sin autocompletar. */
  FORM_EMAIL_ENTRY: null as string | null,
  /** ID de Google Tag Manager (ej. "GTM-ABC1234"). null = sin analítica. */
  GTM_ID: null as string | null,
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
  kit: `Hola, quiero el Kit de Formalización (${formatCOP(CONFIG.PRICE_KIT)}).`,
  plan: `Hola, quiero el Plan Profesional (${formatCOP(CONFIG.PRICE_PLAN)}).`,
  planPago: `Hola, quiero pagar el Plan Profesional (${formatCOP(CONFIG.PRICE_PLAN)}). ¿Cuáles son los medios de pago?`,
  planComprobante: "Hola, ya envié mi comprobante de pago del Plan Profesional.",
  premium: `Hola, quiero el Plan Premium (${formatCOP(CONFIG.PRICE_PREMIUM)}): que ClubApp haga todo por mí.`,
  diagnostico: "Hola, hice el diagnóstico en ClubApp y quiero asesoría.",
  general: "Hola, tengo una pregunta sobre ClubApp.",
} as const;

/** Enlace del formulario del club; si FORM_EMAIL_ENTRY está definido, abre con el correo del cliente ya escrito. */
export function formUrl(correo?: string) {
  const entry = CONFIG.FORM_EMAIL_ENTRY;
  if (!entry || !/^entry\.\d+$/.test(entry) || !correo) return CONFIG.FORM_URL;
  const sep = CONFIG.FORM_URL.includes("?") ? "&" : "?";
  return `${CONFIG.FORM_URL}${sep}usp=pp_url&${entry}=${encodeURIComponent(correo)}`;
}

/** Agrega los datos del cliente al mensaje de WhatsApp para no perder el contacto si falla el guardado. */
export function conDatos(base: string, d: { nombre: string; correo: string; whatsapp: string }) {
  return `${base} Mis datos: ${d.nombre}, ${d.correo}, ${d.whatsapp}.`;
}

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

  try {
    const { supabase } = await import("@/integrations/supabase/client");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from("solicitudes").insert({
      nombre: solicitud.nombre,
      correo: solicitud.correo,
      whatsapp: solicitud.whatsapp,
      plan: solicitud.producto === "Kit" ? "kit" : "profesional",
    });
    // supabase-js NO lanza excepción cuando falla: devuelve { error }.
    if (error) throw error;
  } catch (err) {
    // El flujo continúa por WhatsApp (el mensaje lleva los datos del cliente).
    console.error("[ClubApp] No se pudo guardar la solicitud en Supabase:", err);
    trackEvent("SolicitudNoGuardada", { producto: solicitud.producto });
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

/** Avisa a Supabase en qué paso va el cliente del Plan Profesional (no cambia el estado: eso lo decides tú). */
export async function registrarProgreso(
  d: { correo: string; whatsapp: string },
  evento: "formulario_completado" | "comprobante_enviado",
) {
  try {
    const { supabase } = await import("@/integrations/supabase/client");
    const whatsapp4 = d.whatsapp.replace(/\D/g, "").slice(-4);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).rpc("registrar_progreso", {
      p_correo: d.correo,
      p_whatsapp4: whatsapp4,
      p_evento: evento,
    });
    if (error) throw error;
  } catch (err) {
    console.error("[ClubApp] No se pudo registrar el progreso:", err);
  }
}

export function trackEvent(name: string, payload?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  const w = window as unknown as { dataLayer?: unknown[] };
  w.dataLayer = w.dataLayer ?? [];
  w.dataLayer.push({ event: name, ...payload });
}
