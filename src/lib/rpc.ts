// Llamadas tipadas a las funciones SQL de Supabase.
// `types.ts` lo genera Lovable y hoy no incluye las funciones (por eso antes había `as any`).
// Este archivo describe su contrato en un solo lugar; si regeneras los tipos, puedes borrarlo.
import { supabase } from "@/integrations/supabase/client";

export type PlanDb = "kit" | "profesional" | "premium";

export interface EntregaFila {
  estado: "solicitado" | "pago confirmado" | "entregado" | "rechazado";
  url_documento: string | null;
  plan: PlanDb;
  formulario_at: string | null;
  comprobante_at: string | null;
}

interface RpcError {
  code?: string;
  message: string;
}

type RpcResult<T> = Promise<{ data: T | null; error: RpcError | null }>;

interface RpcContrato {
  crear_solicitud: {
    args: { p_nombre: string; p_correo: string; p_whatsapp: string; p_plan: PlanDb };
    returns: string;
  };
  registrar_progreso: {
    args: {
      p_correo: string;
      p_codigo: string;
      p_evento: "formulario_completado" | "comprobante_enviado";
    };
    returns: boolean;
  };
  consultar_entrega: {
    args: { p_correo: string; p_codigo: string };
    returns: EntregaFila[];
  };
}

export function rpc<K extends keyof RpcContrato>(
  nombre: K,
  args: RpcContrato[K]["args"],
): RpcResult<RpcContrato[K]["returns"]> {
  // El cliente generado no conoce estas funciones: el cast vive solo aquí.
  const cliente = supabase as unknown as {
    rpc: (n: string, a: unknown) => RpcResult<RpcContrato[K]["returns"]>;
  };
  return cliente.rpc(nombre, args);
}
