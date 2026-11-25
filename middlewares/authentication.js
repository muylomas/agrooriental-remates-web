const connection = require('../routes/connection_db');

// Páginas legales (routes/legal.js): las puede leer cualquiera, incluso quien
// se está registrando y todavía no verificó el celular.
const legal_urls = [
  "/terminos-y-condiciones",
  "/politica-de-privacidad",
  "/politica-de-cookies",
];

function isLegalUrl(url) {
  return legal_urls.some(function (legalUrl) {
    return url.startsWith(legalUrl);
  });
}

// Lo que se puede ver sin sesión. También es lo único que ve un cliente que
// todavía no aprobó Agro Oriental (invitation = 0).
const public_urls = [
  "?", "/?",
  "/login", "/ingresar",
  "/registro", "/registro/codigo-verificacion",
  "/reset-password",
  "/auth/",
  "/ganado/lote/publicacion/",
  "/.well-known/acme-challenge",
  "/api/cattle/lot/auction/bids",
  "/criollosparaganar",
  // Cada remate se puede ver sin sesión, igual que la home: lotes,
  // precios, catálogo. Ofertar y ver los piques piden login desde
  // la página (loginSwal en /remate/scripts.js).
  "/remate/",
  // Actualización del carrusel de Destacados de esas páginas.
  "/api/cattle/lots/refresh"
];

function isPublicUrl(url) {
  if (url == "" || url == "/" || isLegalUrl(url)) return true;
  return public_urls.some(function (publicUrl) {
    return url.startsWith(publicUrl);
  });
}

exports.authProcc = function (req, res, next) {
  if (!("session" in req)) {
    req.session = {
      userid: false,
      redirectTo: "",
    };
  }

  if (!("sessionID" in req)) {
    req.sessionID = "undefined";
  }

  connection.query(
    `
      SELECT 
        id AS id,
        invitation AS invitation
      FROM customers 
      WHERE session = ? 
    `,
    [
      req.sessionID
    ],
    function (err, results) {
      if (err) {
        console.log(err);
        if (req.url != "/ingresar") {
          if (!req.session.userid) {
            if (req.originalUrl && req.originalUrl !== undefined) {
              if (req.originalUrl.indexOf("/ingresar") == -1)
                req.session.redirectTo = req.originalUrl;
            } else
              req.session.redirectTo = "/";
            res.redirect('/ingresar');
          }
          else
            next();
        }
        else
          next();
      }
      else {
        if (results.length) {
          if (results.length > 1) {
            connection.query(
              `
                  UPDATE customers SET
                      session = ''
                  WHERE 
                      session = ?
              `,
              [
                req.sessionID,
              ],
              function (err, results) {
                if (err) {
                  console.log(err);
                }
                res.redirect('/ingresar');
              }
            );
          }
          else {
            if (results[0].invitation)
              next();
            // Sin aprobar: navega lo público (y puede cerrar sesión); en lo demás
            // se lo devuelve a la home con el aviso de cuenta pendiente.
            else if (isPublicUrl(req.url) || req.url.startsWith('/logout'))
              next();
            else {
              req.session.pendingApprovalNotice = true;
              res.redirect('/');
            }
          }
        }
        else {
          const exclude_urls_status = isPublicUrl(req.url);

          if (!exclude_urls_status) {
            if (req.originalUrl && req.originalUrl !== undefined) {
              req.session.redirectTo = req.originalUrl;
            }
            else
              req.session.redirectTo = "/";

            res.redirect('/ingresar');
          }
          else {
            next();
          }
        }
      }
    }
  );
};