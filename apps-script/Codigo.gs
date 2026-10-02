// ClubApp: registro de solicitudes y consulta de entrega.
// Pégalo en Extensiones > Apps Script, dentro de tu hoja de Google.

const HOJA = "Solicitudes";
const ENCABEZADOS = ["Fecha", "Producto", "Nombre", "WhatsApp", "Correo", "Estado", "Enlace de entrega"];
const AVISO_A = "clubappcolombia@gmail.com";

function hoja_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let h = ss.getSheetByName(HOJA);
  if (!h) {
    h = ss.insertSheet(HOJA);
    h.appendRow(ENCABEZADOS);
    h.setFrozenRows(1);
  }
  return h;
}

// Evita que un texto que empieza con = + - @ se ejecute como fórmula.
function limpio_(v) {
  const s = String(v == null ? "" : v).trim().slice(0, 255);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

// Recibe una solicitud nueva desde la web.
function doPost(e) {
  try {
    const d = JSON.parse(e.postData.contents);
    const producto = limpio_(d.producto);
    const nombre = limpio_(d.nombre);
    const whatsapp = limpio_(d.whatsapp);
    const correo = limpio_(d.correo);
    hoja_().appendRow([new Date(), producto, nombre, whatsapp, correo, "solicitado", ""]);
    MailApp.sendEmail(
      AVISO_A,
      "Nueva solicitud: " + producto,
      "Nombre: " + nombre + "\nWhatsApp: " + whatsapp + "\nCorreo: " + correo + "\nProducto: " + producto
    );
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false });
  }
}

// Consulta de "Mi documento": correo + últimos 4 dígitos del WhatsApp.
function doGet(e) {
  const p = e.parameter || {};
  const correo = String(p.correo || "").trim().toLowerCase();
  const tel = String(p.tel || "").replace(/\D/g, "").slice(-4);
  if (!correo || tel.length < 4) return json_({ estado: "sin" });

  const filas = hoja_().getDataRange().getValues();
  let encontrado = false;
  for (let i = filas.length - 1; i > 0; i--) { // de la más reciente a la más antigua
    const f = filas[i];
    const mismoCorreo = String(f[4]).trim().toLowerCase() === correo;
    const mismoTel = String(f[3]).replace(/\D/g, "").slice(-4) === tel;
    if (!mismoCorreo || !mismoTel) continue;
    encontrado = true;
    const estado = String(f[5]).trim().toLowerCase();
    const url = String(f[6]).trim();
    if (estado === "entregado" && url) return json_({ estado: "entregado", url: url });
  }
  return json_({ estado: encontrado ? "pendiente" : "sin" });
}
