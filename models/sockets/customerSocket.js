const cookie = require('cookie');
const cookieParser = require('cookie-parser');
const presence = require('./presence');

const WEB_HOSTNAMES = ['equinos.agrooriental.uy', 'www.equinos.agrooriental.uy'];

// Solo cuentan como cliente conectado los sockets abiertos desde una página de
// la web. El backoffice (gestion.agrooriental.uy) también se conecta a este
// servidor para recibir las ofertas en vivo, y el navegador le manda la cookie
// de la web (mismo sitio: agrooriental.uy): sin este filtro, quien tuviera el
// backoffice abierto figuraba online como el cliente con el que está logueado
// en la web.
function isFromWebPage(socket) {
    const origin = socket.handshake.headers.origin;
    if (!origin) {
        // Polling same-origin: el navegador no manda Origin.
        return true;
    }
    let originHostname;
    try {
        originHostname = new URL(origin).hostname;
    }
    catch (e) {
        return false;
    }
    const hostHostname = String(socket.handshake.headers.host || '').split(':')[0];
    return originHostname === hostHostname || WEB_HOSTNAMES.includes(originHostname);
}

module.exports = function (socket) {

    if (
        isFromWebPage(socket) &&
        (
            socket.handshake.headers['sec-fetch-site'] == 'same-origin' ||
            socket.handshake.headers.host == 'equinos.agrooriental.uy'
        )
    ) {

        let cookieParsed = {};
        if (
            "handshake" in socket &&
            "headers" in socket.handshake &&
            "cookie" in socket.handshake.headers &&
            socket.handshake.headers.cookie
        ) {
            cookieParsed = cookie.parse(socket.handshake.headers.cookie);
        }

        if (
            "agroOrientaApp" in cookieParsed &&
            cookieParsed.agroOrientaApp
        ) {

            const agroOrientaAppParsed = cookieParser.signedCookie(cookieParsed.agroOrientaApp, 'LoktOOtNBvuFajNrBnx4');

            if (agroOrientaAppParsed) {
                presence.register(socket, agroOrientaAppParsed);
            }
        }
    }
};