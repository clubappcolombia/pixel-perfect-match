import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { useState } from "react";
import { CONFIG, LEGAL_NOTICE, WA_MESSAGES, conDatos, formatCOP, trackEvent, whatsappLink } from "@/lib/config";
import { CodigoAcceso } from "./codigo-acceso";
import { SolicitudForm } from "./solicitud-form";
import { ButtonLink } from "./ui-kit";

export function KitModal({
  open,
  onOpenChange,
  producto = "Kit",
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  producto?: "Kit" | "Premium";
}) {
  const [resultado, setResultado] = useState<{
    producto: "Kit" | "Premium";
    nombre: string;
    mensaje: string;
    codigo: string | null;
  } | null>(null);
  // Solo se muestra el resultado del mismo producto; al cerrar el modal NO se borra, así el cliente no pierde su código.
  const enviado = resultado && resultado.producto === producto ? resultado : null;
  const premium = producto === "Premium";
  const titulo = premium
    ? `Solicitar el Plan Premium · ${formatCOP(CONFIG.PRICE_PREMIUM)}`
    : `Solicitar el Kit · ${formatCOP(CONFIG.PRICE_KIT)}`;

  return (
    <Dialog.Root
      open={open}
      onOpenChange={onOpenChange}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-navy/60 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[92vh] w-[min(32rem,92vw)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border bg-card p-6 shadow-lift">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <Dialog.Title className="font-display text-2xl">{titulo}</Dialog.Title>
              <Dialog.Description className="mt-1 text-sm text-muted-foreground">
                Déjanos tus datos y continuamos por WhatsApp para coordinar el pago y la entrega.
              </Dialog.Description>
            </div>
            <Dialog.Close
              aria-label="Cerrar"
              className="rounded-md p-1 text-muted-foreground hover:bg-secondary"
            >
              <X className="h-5 w-5" />
            </Dialog.Close>
          </div>

          {enviado ? (
            <div className="space-y-4">
              <div className="rounded-xl border border-success/30 bg-success/10 p-4 text-sm">
                <p className="font-semibold">¡Listo, {enviado.nombre}!</p>
                <p className="mt-1 text-muted-foreground">
                  Registramos tu solicitud. Continúa por WhatsApp: allí te indicamos los medios de
                  pago y los siguientes pasos.
                </p>
              </div>
              {enviado.codigo ? <CodigoAcceso codigo={enviado.codigo} /> : null}
              <ButtonLink
                variant="whatsapp"
                size="lg"
                className="w-full"
                href={whatsappLink(enviado.mensaje)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent("WhatsAppClick", { origen: premium ? "modal_premium" : "modal_kit" })}
              >
                Abrir WhatsApp
              </ButtonLink>
              <button
                type="button"
                className="w-full text-center text-sm font-semibold text-primary-text underline"
                onClick={() => setResultado(null)}
              >
                Hacer otra solicitud
              </button>
            </div>
          ) : (
            <>
              <p className="mb-4 rounded-lg bg-secondary p-3 text-xs leading-relaxed text-muted-foreground">
                {LEGAL_NOTICE}
              </p>
              <SolicitudForm
                producto={producto}
                submitLabel="Continuar por WhatsApp"
                onSuccess={(data) => {
                  trackEvent("Lead", { producto });
                  setResultado({
                    producto,
                    nombre: data.nombre.split(" ")[0] ?? data.nombre,
                    mensaje: conDatos(premium ? WA_MESSAGES.premium : WA_MESSAGES.kit, data),
                    codigo: data.codigo ?? null,
                  });
                }}
              />
            </>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
