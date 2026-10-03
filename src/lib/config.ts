// Configuración central de ClubApp.
// Cambia estos valores en un solo lugar; todo el sitio los usa.

export const CONFIG = {
  /** Número de WhatsApp en formato internacional sin "+" (Colombia = 57...). */
  WHATSAPP_NUMBER: "573152803830",
  /** Formulario del club (Google Forms) usado en el paso 2 del Plan. */
  FORM_URL:
    "https://docs.google.com/forms/d/e/1FAIpQLSfWG5aEpYMIDKafHs392dmv8P0ssLrKaTaHPsIJ2rrDKrGnaA/viewform",
  PRICE_KIT: 50000,
  PRICE_PLAN: 160000,
  PRICE_PREMIUM: 300000,
  EMAIL: "clubappcolombia@gmail.com",
  /** Enlace público del sitio, sin "/" al final (ej. "https://tu-sitio.lovable.app"). Sirve para la imagen al compartir el enlace. null = sin imagen. */
  SITE_URL: "https://pixel-perfect-render-0992.lovable.app" as string | null,
  /** Campo del correo en Google Forms (ej. "entry.123456789") para que el formulario llegue con el correo ya escrito. null = sin autocompletar. */
  FORM_EMAIL_ENTRY: null as string | null,
  /** ID de medición de Google Analytics 4 (empieza por "G-"). Solo se carga si el visitante acepta las cookies. null = sin analítica. */
  GA_ID: "G-N24HZ4DV1E" as string | null,
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

export type SolicitudProducto = "Kit" | "Plan" | "Premium";

export interface Solicitud {
  fecha: string;
  producto: SolicitudProducto;
  nombre: string;
  whatsapp: string;
  correo: string;
  estado: "solicitado" | "pago confirmado" | "entregado" | "rechazado";
  /** Código de seguimiento que genera el servidor; null si no se pudo guardar. */
  codigo: string | null;
  /** Mensaje para el cliente si el servidor rechazó la solicitud a propósito (anti-spam, correo inválido). null = sin bloqueo. */
  bloqueo: string | null;
}

/** Guarda la solicitud en Supabase. Si falla, el flujo sigue por WhatsApp con los datos en el mensaje. */
export async function guardarSolicitud(
  data: Omit<Solicitud, "fecha" | "estado" | "codigo" | "bloqueo">,
): Promise<Solicitud> {
  const solicitud: Solicitud = {
    ...data,
    fecha: new Date().toISOString(),
    estado: "solicitado",
    codigo: null,
    bloqueo: null,
  };

  try {
    const { rpc } = await import("@/lib/rpc");
    const { data: codigo, error } = await rpc("crear_solicitud", {
      p_nombre: solicitud.nombre,
      p_correo: solicitud.correo,
      p_whatsapp: solicitud.whatsapp,
      p_plan:
        solicitud.producto === "Kit"
          ? "kit"
          : solicitud.producto === "Premium"
            ? "premium"
            : "profesional",
    });
    // supabase-js NO lanza excepción cuando falla: devuelve { error }.
    if (error) throw error;
    solicitud.codigo = typeof codigo === "string" ? codigo : null;
  } catch (err) {
    const { code, message } = (err ?? {}) as { code?: string; message?: string };
    if (code === "P0001" && message) {
      // Rechazo intencional del servidor (anti-spam, correo inválido): se le explica al cliente
      // en vez de dejarlo avanzar sin código y sin saber por qué.
      solicitud.bloqueo = message;
    }
    // En cualquier otro fallo el flujo continúa por WhatsApp (el mensaje lleva los datos del cliente).
    console.error("[ClubApp] No se pudo guardar la solicitud en Supabase:", err);
    trackEvent("SolicitudNoGuardada", { producto: solicitud.producto });
  }

  return solicitud;
}

/** Avisa a Supabase en qué paso va el cliente del Plan Profesional (no cambia el estado: eso lo decides tú). */
export async function registrarProgreso(
  d: { correo: string; codigo?: string | null },
  evento: "formulario_completado" | "comprobante_enviado",
) {
  // Sin código (solicitud guardada antes de esta versión o con fallo de guardado) no hay seguimiento.
  if (!d.codigo) return;
  try {
    const { rpc } = await import("@/lib/rpc");
    const { error } = await rpc("registrar_progreso", {
      p_correo: d.correo,
      p_codigo: d.codigo,
      p_evento: evento,
    });
    if (error) throw error;
  } catch (err) {
    console.error("[ClubApp] No se pudo registrar el progreso:", err);
  }
}

/** Muestra el código con guion para leerlo fácil: 3F9A0C7B21 -> 3F9A0-C7B21 */
export function formatCodigo(codigo: string) {
  return codigo.length === 10 ? `${codigo.slice(0, 5)}-${codigo.slice(5)}` : codigo;
}

export function trackEvent(name: string, payload?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  const w = window as unknown as { dataLayer?: unknown[]; gtag?: (...args: unknown[]) => void };
  // Tag Manager (solo si se configura GTM_ID).
  if (CONFIG.GTM_ID) {
    w.dataLayer = w.dataLayer ?? [];
    w.dataLayer.push({ event: name, ...payload });
  }
  // Google Analytics 4: window.gtag solo existe si el visitante aceptó las cookies de analítica.
  w.gtag?.("event", name, payload ?? {});
}
