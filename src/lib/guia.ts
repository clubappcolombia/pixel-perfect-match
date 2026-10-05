// Lógica de la guía gratuita: ruta del PDF, origen del visitante y guardado del lead.
import { rpc } from "@/lib/rpc";
import { trackEvent } from "@/lib/config";

/** El PDF vive en la carpeta `public/`. Para cambiarlo, sube otro con este mismo nombre. */
export const GUIA_PDF_URL = "/guia-clubapp.pdf";

/** Acepta solo letras, números, guion y guion bajo (máx. 30). Lo demás cuenta como "directo". */
export function limpiarFuente(valor: unknown): string {
  if (typeof valor !== "string") return "directo";
  const v = valor.trim().toLowerCase();
  return /^[a-z0-9_-]{1,30}$/.test(v) ? v : "directo";
}

export interface LeadGuiaInput {
  nombre: string;
  correo: string;
  whatsapp: string;
  fuente: string;
}

export interface LeadGuiaResultado {
  /** Mensaje para la persona si el servidor rechazó el registro a propósito (datos inválidos o demasiados intentos). */
  bloqueo: string | null;
}

/**
 * Guarda el lead en Supabase. Si falla por un problema nuestro (red, servidor), NO bloquea:
 * la persona recibe la guía igual. Solo se bloquea cuando el servidor rechaza a propósito (P0001).
 */
export async function guardarLeadGuia(d: LeadGuiaInput): Promise<LeadGuiaResultado> {
  try {
    const { error } = await rpc("crear_lead_guia", {
      p_nombre: d.nombre,
      p_correo: d.correo,
      p_whatsapp: d.whatsapp,
      p_fuente: d.fuente,
    });
    if (error) throw error;
    return { bloqueo: null };
  } catch (err) {
    const { code, message } = (err ?? {}) as { code?: string; message?: string };
    if (code === "P0001" && message) return { bloqueo: message };
    console.error("[ClubApp] No se pudo guardar el lead de la guía:", err);
    trackEvent("LeadGuiaNoGuardado", { fuente: d.fuente });
    return { bloqueo: null };
  }
}
