import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button, Card, Field, Input } from "@/components/ui-kit";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Nueva contraseña | ClubApp" },
      { name: "description", content: "Crea una nueva contraseña para tu cuenta de ClubApp." },
      { property: "og:title", content: "Nueva contraseña | ClubApp" },
      { property: "og:description", content: "Crea una nueva contraseña para tu cuenta de ClubApp." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ResetPage,
});

function ResetPage() {
  const navigate = useNavigate();
  const [clave, setClave] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  async function enviar(e: FormEvent) {
    e.preventDefault();
    if (clave.length < 8) return setError("Debe tener al menos 8 caracteres.");
    setCargando(true);
    const { error } = await supabase.auth.updateUser({ password: clave });
    setCargando(false);
    if (error) return setError("El enlace venció o no es válido. Pide uno nuevo.");
    navigate({ to: "/mi-clubapp", replace: true });
  }

  return (
    <section className="section">
      <div className="container-page max-w-md">
        <Card>
          <h1 className="font-display text-2xl font-extrabold">Crea tu nueva contraseña</h1>
          <form onSubmit={enviar} className="mt-6 space-y-4">
            <Field label="Nueva contraseña" error={error ?? undefined}>
              <Input type="password" autoComplete="new-password" required value={clave} onChange={(e) => setClave(e.target.value)} />
            </Field>
            <Button type="submit" disabled={cargando} className="w-full">Guardar contraseña</Button>
          </form>
        </Card>
      </div>
    </section>
  );
}
