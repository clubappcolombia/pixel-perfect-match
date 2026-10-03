// Textos de la oferta que se repiten en varias páginas. Cámbialos aquí y se actualizan en todo el sitio.

export const MEDIOS_PAGO = "Nequi o transferencia bancaria";

/** Lo que el cliente debe tener a la mano antes de empezar. */
export const INFO_PREVIA = [
  "Nombre completo del club deportivo y ciudad o municipio donde funcionará.",
  "Datos de las personas que integran el club, incluidas sus cédulas.",
  "Un correo electrónico al que tengas acceso: allí te avisamos cuando tu entrega esté lista.",
  `El comprobante de tu pago (${MEDIOS_PAGO}) cuando lo hagas.`,
];

/** Definición corta de cada producto, usada en tarjetas, ayuda y páginas de venta. */
export const DEF_KIT = "Autoservicio: recibes los 10 documentos en un Word editable y la guía de diligenciamiento, y haces el proceso por tu cuenta.";
export const DEF_PLAN =
  "Servicio personalizado: tú nos das la información de tu club y ClubApp prepara, diligencia, revisa y organiza tu documentación.";

/** Frase corta que define cada plan. Se usa en tarjetas y en la comparación. */
export const FRASE_KIT = "Tú haces el proceso con nuestros documentos y guía.";
export const FRASE_PROFESIONAL = "Te ayudamos a diligenciar, revisar y organizar la documentación.";
export const FRASE_PREMIUM =
  "Nos encargamos de preparar y organizar tu carpeta documental para entregártela lista para presentar.";

/**
 * Muestra anonimizada de un documento real para la sección "Así se ve tu documentación".
 * Mientras sea null, la sección NO aparece en el sitio.
 * Para activarla: sube la imagen (con datos personales tapados) a la carpeta `public/` del repositorio
 * y escribe aquí su ruta, por ejemplo "/muestra-documentacion.png".
 */
export const MUESTRA_DOC_URL: string | null = null;
