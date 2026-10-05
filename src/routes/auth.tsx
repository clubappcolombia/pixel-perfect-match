import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button, Card, Field, Input } from "@/components/ui-kit";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Ingresar o crear cuenta | ClubApp" },
      { name: "description", content: "Crea tu cuenta de ClubApp o ingresa para seguir el proceso de tu club deportivo." },
      { property: "og:title", content: "Ingresar o crear cuenta | ClubApp" },
      { property: "og:description", content: "Accede a Mi ClubApp para seguir tu documentación." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [modo, setModo] = useState<"entrar" | "registro" | "olvido">("entrar");
  const [email, setEmail] = useState("");
  const [clave, setClave] = useState("");
  const [nombre, setNombre] = useState("");
  const [club, setClub] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) navigate({ to: "/mi-clubapp", replace: true });
    });
    const { data: sub } = supabase.auth.onAuthStateChange((e, s) => {
      if (e === "SIGNED_IN" && s) navigate({ to: "/mi-clubapp", replace: true });
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  async function enviar(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setAviso(null);
    setCargando(true);
    try {
      if (modo === "entrar") {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: clave });
        if (error) throw new Error("Correo o contraseña incorrectos, o falta confirmar tu correo.");
      } else if (modo === "registro") {
        if (clave.length < 8) throw new Error("La contraseña debe tener al menos 8 caracteres.");
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password: clave,
          options: {
            emailRedirectTo: window.location.origin + "/auth",
            data: { nombre: nombre.trim(), club: club.trim(), whatsapp: whatsapp.trim() },
          },
        });
        if (error) throw new Error(error.message);
        setAviso("Te enviamos un correo. Ábrelo y confirma tu cuenta para poder ingresar.");
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: window.location.origin + "/reset-password",
        });
        if (error) throw new Error(error.message);
        setAviso("Si el correo existe, te llegará un enlace para crear una nueva contraseña.");
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setCargando(false);
    }
  }

  async function google() {
    setError(null);
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/auth" });
    if (r.error) setError("No se pudo ingresar con Google. Intenta de nuevo.");
  }

  return (
    <section className="section">
      <div className="container-page max-w-md">
        <Card>
          <h1 className="font-display text-2xl font-extrabold">
            {modo === "entrar" ? "Ingresa a Mi ClubApp" : modo === "registro" ? "Crea tu cuenta" : "Recupera tu contraseña"}
          </h1>
          <form onSubmit={enviar} className="mt-6 space-y-4">
            {modo === "registro" ? (
              <>
                <Field label="Tu nombre"><Input required value={nombre} onChange={(e) => setNombre(e.target.value)} /></Field>
                <Field label="Nombre del club"><Input value={club} onChange={(e) => setClub(e.target.value)} /></Field>
                <Field label="WhatsApp"><Input inputMode="tel" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} /></Field>
              </>
            ) : null}
            <Field label="Correo"><Input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
            {modo !== "olvido" ? (
              <Field label="Contraseña">
                <Input type="password" required autoComplete={modo === "registro" ? "new-password" : "current-password"} value={clave} onChange={(e) => setClave(e.target.value)} />
              </Field>
            ) : null}
            {error ? <p role="alert" className="text-sm font-medium text-destructive">{error}</p> : null}
            {aviso ? <p className="text-sm font-medium text-primary">{aviso}</p> : null}
            <Button type="submit" disabled={cargando} className="w-full">
              {cargando ? "Un momento..." : modo === "entrar" ? "Ingresar" : modo === "registro" ? "Crear cuenta" : "Enviar enlace"}
            </Button>
          </form>
          {modo !== "olvido" ? (
            <Button type="button" variant="outline" className="mt-3 w-full" onClick={google}>
              Continuar con Google
            </Button>
          ) : null}
          <div className="mt-5 space-y-2 text-center text-sm">
            {modo === "entrar" ? (
              <>
                <button type="button" className="font-semibold text-primary" onClick={() => setModo("registro")}>¿No tienes cuenta? Créala</button>
                <br />
                <button type="button" className="text-muted-foreground" onClick={() => setModo("olvido")}>Olvidé mi contraseña</button>
              </>
            ) : (
              <button type="button" className="font-semibold text-primary" onClick={() => setModo("entrar")}>Ya tengo cuenta, ingresar</button>
            )}
          </div>
        </Card>
      </div>
    </section>
  );
}
