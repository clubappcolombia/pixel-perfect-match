import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { useState } from "react";
import { CONFIG, LEGAL_NOTICE, WA_MESSAGES, conDatos, formatCOP, trackEvent, whatsappLink } from "@/lib/config";
import { SolicitudForm } from "./solicitud-form";
import { ButtonLink } from "./ui-kit";

export function KitModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [enviado, setEnviado] = useState<{ nombre: string; mensaje: string } | null>(null);

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v);
        if (!v) setEnviado(null);
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-navy/60 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[92vh] w-[min(32rem,92vw)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border bg-card p-6 shadow-lift">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <Dialog.Title className="font-display text-2xl">
                Solicitar el Kit · {formatCOP(CONFIG.PRICE_KIT)}
              </Dialog.Title>
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
                  pago y, al confirmar tu comprobante, te enviamos el kit.
                </p>
              </div>
              <ButtonLink
                variant="whatsapp"
                size="lg"
                className="w-full"
                href={whatsappLink(enviado.mensaje)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent("WhatsAppClick", { origen: "modal_kit" })}
              >
                Abrir WhatsApp
              </ButtonLink>
            </div>
          ) : (
            <>
              <p className="mb-4 rounded-lg bg-secondary p-3 text-xs leading-relaxed text-muted-foreground">
                {LEGAL_NOTICE}
              </p>
              <SolicitudForm
                producto="Kit"
                submitLabel="Continuar por WhatsApp"
                onSuccess={(data) => {
                  trackEvent("Lead", { producto: "Kit" });
                  setEnviado({
                    nombre: data.nombre.split(" ")[0] ?? data.nombre,
                    mensaje: conDatos(WA_MESSAGES.kit, data),
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
