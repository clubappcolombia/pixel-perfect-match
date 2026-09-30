import { z } from "zod";

export const solicitudSchema = z.object({
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
  autorizacion: z.literal(true, {
    errorMap: () => ({ message: "Debes autorizar el tratamiento de datos" }),
  }),
});

export type SolicitudInput = z.infer<typeof solicitudSchema>;
