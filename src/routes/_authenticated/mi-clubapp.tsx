import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button, ButtonRoute, Card, Field, Input } from "@/components/ui-kit";

export const Route = createFileRoute("/_authenticated/mi-clubapp")({
  head: () => ({
    meta: [
      { title: "Mi ClubApp | Tu cuenta" },
      { name: "description", content: "Tu espacio en ClubApp: datos de tu club y próximos pasos." },
      { property: "og:title", content: "Mi ClubApp" },
      { property: "og:description", content: "Tu espacio en ClubApp." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: MiClubApp,
});

function MiClubApp() {
  const { user } = Route.useRouteContext();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [nombre, setNombre] = useState("");
  const [club, setClub] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    supabase.from("profiles").select("nombre, club, whatsapp").eq("id", user.id).maybeSingle().then(({ data }) => {
      if (!data) return;
      setNombre(data.nombre ?? "");
      setClub(data.club ?? "");
      setWhatsapp(data.whatsapp ?? "");
    });
  }, [user.id]);

  async function guardar(e: FormEvent) {
    e.preventDefault();
    const { error } = await supabase.from("profiles").upsert({ id: user.id, nombre, club, whatsapp, updated_at: new Date().toISOString() });
    setMsg(error ? "No se pudo guardar. Intenta de nuevo." : "Datos guardados.");
  }

  async function salir() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <section className="section">
      <div className="container-page max-w-2xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="eyebrow">Mi ClubApp</p>
            <h1 className="font-display text-3xl font-extrabold">Hola{nombre ? `, ${nombre}` : ""}</h1>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
          <Button variant="outline" size="sm" onClick={salir}>Cerrar sesión</Button>
        </div>
        <Card>
          <h2 className="font-display text-xl font-bold">Datos de tu club</h2>
          <form onSubmit={guardar} className="mt-4 space-y-4">
            <Field label="Tu nombre"><Input value={nombre} onChange={(e) => setNombre(e.target.value)} /></Field>
            <Field label="Nombre del club"><Input value={club} onChange={(e) => setClub(e.target.value)} /></Field>
            <Field label="WhatsApp"><Input inputMode="tel" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} /></Field>
            {msg ? <p className="text-sm font-medium text-primary">{msg}</p> : null}
            <Button type="submit">Guardar</Button>
          </form>
        </Card>
        <Card>
          <h2 className="font-display text-xl font-bold">Siguiente paso</h2>
          <p className="mt-2 text-sm text-muted-foreground">Elige el plan que necesita tu club para empezar tu documentación.</p>
          <ButtonRoute to="/planes" className="mt-4">Ver planes</ButtonRoute>
        </Card>
      </div>
    </section>
  );
}
