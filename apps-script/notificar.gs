/**
 * ClubApp · avisos automáticos por correo (Google Apps Script).
 * Supabase llama a este script cuando se crea o cambia una fila de "solicitudes".
 *  - Nueva solicitud            -> te avisa a ti
 *  - Cliente envía comprobante  -> te avisa a ti
 *  - Pones estado = "entregado" -> le llega el correo al cliente con su enlace
 */
const TOKEN = 'CAMBIA_ESTE_TOKEN';                       // invéntate una clave larga
const DUENO = 'clubappcolombia@gmail.com';
const SITIO = 'https://TU-SITIO.lovable.app';            // enlace público de tu sitio

function fmt(c) { return c && c.length === 10 ? c.slice(0, 5) + '-' + c.slice(5) : (c || ''); }

function doPost(e) {
  if (!e.parameter || e.parameter.token !== TOKEN) {
    return ContentService.createTextOutput('no autorizado');
  }
  const body = JSON.parse(e.postData.contents);
  const r = body.record || {};
  const old = body.old_record || {};

  if (body.type === 'INSERT') {
    MailApp.sendEmail(
      DUENO,
      'Nueva solicitud ClubApp (' + r.plan + ')',
      'Nombre: ' + r.nombre + '\nCorreo: ' + r.correo + '\nWhatsApp: ' + r.whatsapp + '\nPlan: ' + r.plan + '\nCódigo: ' + fmt(r.codigo_acceso)
    );
  }

  if (body.type === 'UPDATE') {
    if (r.comprobante_at && !old.comprobante_at) {
      MailApp.sendEmail(
        DUENO,
        'Comprobante enviado: ' + r.nombre,
        r.nombre + ' dice que ya envió el comprobante del Plan Profesional.\nCorreo: ' + r.correo +
          '\nWhatsApp: ' + r.whatsapp + '\nVerifica el pago antes de cambiar el estado.'
      );
    }
    if (r.estado === 'entregado' && old.estado !== 'entregado' && r.url_documento) {
      MailApp.sendEmail(
        r.correo,
        'Tus documentos de ClubApp están listos',
        'Hola ' + r.nombre + ',\n\nTus documentos ya están listos. Descárgalos aquí:\n' + r.url_documento +
          (SITIO.indexOf('TU-SITIO') === -1
          ? '\n\nTambién puedes consultarlos en ' + SITIO + '/mi-documento con tu correo y tu código de seguimiento: ' + fmt(r.codigo_acceso) + '.'
          : '') +
          '\n\nRecuerda: ClubApp es una herramienta de apoyo documental; revisa los requisitos de tu instituto municipal de deportes.' +
          '\n\nClubApp Colombia',
        { name: 'ClubApp' }
      );
    }
  }
  return ContentService.createTextOutput('ok');
}
