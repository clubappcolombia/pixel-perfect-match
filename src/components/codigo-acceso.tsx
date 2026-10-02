import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { formatCodigo } from "@/lib/config";

/** Muestra el código de seguimiento del cliente, con botón para copiarlo. */
export function CodigoAcceso({ codigo }: { codigo: string }) {
  const [copiado, setCopiado] = useState(false);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(formatCodigo(codigo));
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      /* el cliente puede copiarlo a mano */
    }
  }

  return (
    <div className="rounded-xl border border-primary/30 bg-accent p-4 text-sm">
      <p className="font-semibold">Tu código de seguimiento</p>
      <div className="mt-2 flex items-center justify-between gap-3">
        <span className="font-display text-2xl tracking-widest">{formatCodigo(codigo)}</span>
        <button
          type="button"
          onClick={copiar}
          className="inline-flex items-center gap-1 rounded-md border bg-card px-3 py-1.5 text-xs font-semibold hover:bg-secondary"
        >
          {copiado ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copiado ? "Copiado" : "Copiar"}
        </button>
      </div>
      <p className="mt-2 text-muted-foreground">
        Guárdalo: lo necesitas, junto con tu correo, para consultar tus documentos en “Mi documento”.
      </p>
    </div>
  );
}
