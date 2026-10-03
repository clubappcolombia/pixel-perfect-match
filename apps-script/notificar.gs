/**
 * ClubApp · avisos automáticos por correo (Google Apps Script).
 * Supabase llama a este script cuando se crea o cambia una fila de "solicitudes".
 *  - Nueva solicitud            -> te avisa a ti  + le envía al cliente su código de seguimiento
 *  - Cliente envía comprobante  -> te avisa a ti
 *  - Pones estado = "entregado" -> le llega el correo al cliente con su enlace
 *
 * Cuota: una cuenta Gmail normal envía ~100 destinatarios por día. Para que un abuso del formulario
 * no te deje sin poder entregar documentos, los avisos "para ti" se omiten cuando queda poca cuota
 * y la entrega al cliente siempre tiene prioridad.
 */
const TOKEN = "CAMBIA_ESTE_TOKEN"; // invéntate una clave larga
const DUENO = "clubappcolombia@gmail.com";
const SITIO = "https://TU-SITIO.lovable.app"; // enlace público de tu sitio
const CUOTA_MIN_AVISOS = 30; // por debajo de esto no se mandan avisos para ti

function fmt(c) {
  return c && c.length === 10 ? c.slice(0, 5) + "-" + c.slice(5) : c || "";
}
function haySitio() {
  return SITIO.indexOf("TU-SITIO") === -1;
}
function cuota() {
  return MailApp.getRemainingDailyQuota();
}

function avisarDueno(asunto, cuerpo) {
  if (cuota() > CUOTA_MIN_AVISOS) MailApp.sendEmail(DUENO, asunto, cuerpo);
}

// Deja pasar solo texto corto y de una línea (el nombre lo escribe el visitante y se pega en correos).
function limpio(t, max) {
  return String(t || "")
    .replace(/[\r\n\t]+/g, " ")
    .trim()
    .slice(0, max || 100);
}

// Solo enlaces https (el cliente recibe este enlace por correo).
function esHttps(u) {
  return /^https:\/\/\S+$/i.test(String(u || ""));
}

function respuesta(t) {
  return ContentService.createTextOutput(t);
}

function doPost(e) {
  // Si dejas el token de ejemplo, CUALQUIERA podría usar este script para enviar correos desde tu cuenta.
  if (TOKEN === "CAMBIA_ESTE_TOKEN" || TOKEN.length < 16) {
    console.error("Configura un TOKEN propio de al menos 16 caracteres.");
    return respuesta("configuracion incompleta");
  }
  if (!e || !e.parameter || e.parameter.token !== TOKEN || !e.postData) {
    return respuesta("no autorizado");
  }
  try {
    return procesar(JSON.parse(e.postData.contents));
  } catch (err) {
    // Sin esto, un error devuelve HTML y Supabase lo reintenta/pierde sin que te enteres.
    console.error("Error procesando el webhook: " + err);
    return respuesta("error");
  }
}

function procesar(body) {
  const r = body.record || {};
  const old = body.old_record || {};
  const nombre = limpio(r.nombre, 100);

  if (body.type === "INSERT") {
    avisarDueno(
      "Nueva solicitud ClubApp (" + r.plan + ")",
      "Nombre: " +
        nombre +
        "\nCorreo: " +
        r.correo +
        "\nWhatsApp: " +
        r.whatsapp +
        "\nPlan: " +
        r.plan +
        "\nCódigo: " +
        fmt(r.codigo_acceso),
    );

    // Confirmación al cliente con su código (así no lo pierde si cierra la ventana).
    if (r.correo && r.codigo_acceso && cuota() > 5) {
      MailApp.sendEmail(
        r.correo,
        "Recibimos tu solicitud en ClubApp",
        "Hola " +
          nombre +
          ",\n\nRecibimos tu solicitud. Guarda tu código de seguimiento: " +
          fmt(r.codigo_acceso) +
          "\n" +
          (haySitio()
            ? "\nCon tu correo y este código puedes consultar tu entrega en " +
              SITIO +
              "/mi-documento\n"
            : "") +
          "\nSi no fuiste tú quien hizo esta solicitud, ignora este mensaje." +
          "\n\nClubApp Colombia",
        { name: "ClubApp" },
      );
    }
  }

  if (body.type === "UPDATE") {
    if (r.comprobante_at && !old.comprobante_at) {
      avisarDueno(
        "Comprobante enviado: " + nombre,
        nombre +
          " dice que ya envió el comprobante del Plan Profesional.\nCorreo: " +
          r.correo +
          "\nWhatsApp: " +
          r.whatsapp +
          "\nVerifica el pago antes de cambiar el estado.",
      );
    }
    if (r.estado === "entregado" && old.estado !== "entregado" && esHttps(r.url_documento)) {
      // La entrega al cliente NO depende de la cuota reservada para avisos.
      MailApp.sendEmail(
        r.correo,
        "Tus documentos de ClubApp están listos",
        "Hola " +
          nombre +
          ",\n\nTus documentos ya están listos. Descárgalos aquí:\n" +
          r.url_documento +
          (haySitio()
            ? "\n\nTambién puedes consultarlos en " +
              SITIO +
              "/mi-documento con tu correo y tu código de seguimiento: " +
              fmt(r.codigo_acceso) +
              "."
            : "") +
          "\n\nRecuerda: ClubApp es una herramienta de apoyo documental; revisa los requisitos de tu instituto municipal de deportes." +
          "\n\nClubApp Colombia",
        { name: "ClubApp" },
      );
    }
  }
  return respuesta("ok");
}
