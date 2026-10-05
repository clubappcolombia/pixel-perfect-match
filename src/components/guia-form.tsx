import { useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { trackEvent } from "@/lib/config";
import { guardarLeadGuia } from "@/lib/guia";
import { guiaSchema } from "@/lib/validation";
import { Button, Field, Input } from "./ui-kit";

type Errors = Partial<Record<"nombre" | "whatsapp" | "correo" | "autorizacion" | "general", string>>;

export function GuiaForm({ fuente, onSuccess }: { fuente: string; onSuccess: (nombre: string) => void }) {
  const [values, setValues] = useState({ nombre: "", whatsapp: "", correo: "" });
  const [autorizacion, setAutorizacion] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);
  const [trampa, setTrampa] = useState(""); // campo oculto: los robots lo llenan, las personas no
  const iniciado = useRef(false);

  function marcarInicio() {
    if (iniciado.current) return;
    iniciado.current = true;
    trackEvent("GuiaFormIniciado", { fuente });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = guiaSchema.safeParse({ ...values, autorizacion });
    if (!result.success) {
      const next: Errors = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof Errors;
        if (key && !next[key]) next[key] = issue.message;
      }
      setErrors(next);
      return;
    }
    setErrors({});
    setLoading(true);
    const clean = {
      nombre: result.data.nombre,
      correo: result.data.correo,
      whatsapp: result.data.whatsapp.replace(/[^\d+]/g, ""),
      fuente,
    };
    // Si un robot llenó el campo oculto, se simula el éxito sin guardar nada.
    const guardado = trampa ? { bloqueo: null } : await guardarLeadGuia(clean);
    setLoading(false);
    if (guardado.bloqueo) {
      setErrors({ general: guardado.bloqueo });
      return;
    }
    trackEvent("GuiaFormCompletado", { fuente });
    onSuccess(clean.nombre.split(" ")[0] ?? clean.nombre);
  }

  return (
    <form onSubmit={handleSubmit} onFocus={marcarInicio} noValidate className="relative space-y-4">
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          No rellenar este campo
          <input tabIndex={-1} autoComplete="off" value={trampa} onChange={(e) => setTrampa(e.target.value)} />
        </label>
      </div>
      <Field label="Nombre completo" error={errors.nombre}>
        <Input
          value={values.nombre}
          maxLength={100}
          autoComplete="name"
          placeholder="Ej. Juan Pérez"
          onChange={(e) => setValues((v) => ({ ...v, nombre: e.target.value }))}
        />
      </Field>
      <Field label="Correo electrónico" error={errors.correo}>
        <Input
          value={values.correo}
          type="email"
          maxLength={255}
          autoComplete="email"
          placeholder="tucorreo@ejemplo.com"
          onChange={(e) => setValues((v) => ({ ...v, correo: e.target.value }))}
        />
      </Field>
      <Field label="WhatsApp" error={errors.whatsapp} hint="Incluye el indicativo si es del exterior">
        <Input
          value={values.whatsapp}
          inputMode="tel"
          maxLength={20}
          autoComplete="tel"
          placeholder="3001234567"
          onChange={(e) => setValues((v) => ({ ...v, whatsapp: e.target.value }))}
        />
      </Field>

      <div className="space-y-1.5">
        <label className="flex items-start gap-3 text-sm">
          <input
            type="checkbox"
            checked={autorizacion}
            onChange={(e) => setAutorizacion(e.target.checked)}
            className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--primary)]"
          />
          <span className="text-muted-foreground">
            Autorizo el tratamiento de mis datos para recibir la guía y que ClubApp me oriente sobre sus servicios, según la{" "}
            <Link to="/datos-personales" className="font-semibold text-primary-text underline">
              política de tratamiento de datos
            </Link>{" "}
            (Ley 1581 de 2012).
          </span>
        </label>
        {errors.autorizacion ? (
          <p role="alert" className="text-xs font-medium text-destructive">
            {errors.autorizacion}
          </p>
        ) : null}
      </div>

      {errors.general ? (
        <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm font-medium text-destructive">
          {errors.general}
        </p>
      ) : null}

      <Button type="submit" size="lg" className="w-full" disabled={loading}>
        {loading ? "Enviando…" : "Obtener guía gratis"}
      </Button>
    </form>
  );
}
