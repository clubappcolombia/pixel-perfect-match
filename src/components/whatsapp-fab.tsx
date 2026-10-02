import { MessageCircle } from "lucide-react";
import { WA_MESSAGES, whatsappLink, trackEvent } from "@/lib/config";

export function WhatsAppFab() {
  return (
    <a
      href={whatsappLink(WA_MESSAGES.general)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escribir por WhatsApp"
      onClick={() => trackEvent("WhatsAppClick", { origen: "flotante" })}
      className="fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-5 z-50 inline-flex h-14 w-14 items-center justify-center rounded-full bg-success text-success-foreground shadow-lift transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <MessageCircle className="h-7 w-7" />
    </a>
  );
}
