import { z } from "zod";

export const solicitudSchema = z
  .object({
    nombre: z
      .string()
      .trim()
      .min(3, { message: "Escribe tu nombre completo" })
      .max(100, { message: "Máximo 100 caracteres" }),
    whatsapp: z
      .string()
      .trim()
      .regex(/^[0-9+\s-]+$/, { message: "Solo números" })
      .refine((v) => v.replace(/\D/g, "").length >= 7, {
        message: "Ingresa un WhatsApp válido (mínimo 7 dígitos)",
      })
      .refine((v) => v.replace(/\D/g, "").length <= 15, { message: "Número demasiado largo" }),
    correo: z
      .string()
      .trim()
      .email({ message: "Correo no válido" })
      .max(255, { message: "Máximo 255 caracteres" }),
    confirmarCorreo: z.string().trim(),
    autorizacion: z.literal(true, {
      errorMap: () => ({ message: "Debes autorizar el tratamiento de datos" }),
    }),
  })
  // Un error de tipeo mandaría los documentos (con cédulas) a otra persona: se pide el correo dos veces.
  .refine((d) => d.correo.toLowerCase() === d.confirmarCorreo.toLowerCase(), {
    message: "Los correos no coinciden",
    path: ["confirmarCorreo"],
  });

export type SolicitudInput = z.infer<typeof solicitudSchema>;

/** Formulario de la guía gratuita: sin confirmación de correo, porque la guía se descarga en pantalla. */
export const guiaSchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(3, { message: "Escribe tu nombre completo" })
    .max(100, { message: "Máximo 100 caracteres" }),
  correo: z
    .string()
    .trim()
    .email({ message: "Correo no válido" })
    .max(255, { message: "Máximo 255 caracteres" }),
  whatsapp: z
    .string()
    .trim()
    .regex(/^[0-9+\s-]+$/, { message: "Solo números" })
    .refine((v) => v.replace(/\D/g, "").length >= 7, {
      message: "Ingresa un WhatsApp válido (mínimo 7 dígitos)",
    })
    .refine((v) => v.replace(/\D/g, "").length <= 15, { message: "Número demasiado largo" }),
  autorizacion: z.literal(true, {
    errorMap: () => ({ message: "Debes autorizar el tratamiento de datos" }),
  }),
});

export type GuiaInput = z.infer<typeof guiaSchema>;
