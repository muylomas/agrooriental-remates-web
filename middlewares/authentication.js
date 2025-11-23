const connection = require('../routes/connection_db');

exports.authProcc = function (req, res, next) {
  console.log("================ authProcc ================");
  if (!("session" in req)) {
    req.session = {
      userid: false,
      redirectTo: "",
    };
  }

  if (!("sessionID" in req)) {
    req.sessionID = "undefined";
  }

  console.log(`
      SELECT 
        id AS id,
        invitation AS invitation
      FROM customers 
      WHERE session = 
    `, req.sessionID);
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
        console.log("results.length: ", results.length);
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
            if (results[0].invitation || req.url.startsWith('/registro/codigo-verificacion'))
              next();
            else
              res.redirect('/registro/codigo-verificacion');
          }
        }
        else {
          const exclude_urls = [
            "?", "/?",
            "/login", "/ingresar",
            "/registro", "/registro/codigo-verificacion",
            "/reset-password",
            "/auth/",
            "/ganado/lote/publicacion/",
          ];

          let exclude_urls_status = false;
          for (let index in exclude_urls) {
            if (req.url.startsWith(exclude_urls[index]))
              exclude_urls_status = true;
          }

          if (req.url == "" || req.url == "/")
            exclude_urls_status = true;

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