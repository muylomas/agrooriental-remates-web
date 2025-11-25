const cookie = require('cookie');
const cookieParser = require('cookie-parser');
const connection = require('../../routes/connection_db');

module.exports = function (socket) {

    if (
        socket.handshake.headers['sec-fetch-site'] == 'same-origin' ||
        socket.handshake.headers.host == '54.183.80.127'
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
                connection.query(
                    `
                        UPDATE customers SET 
                            socketId = ?
                        WHERE 
                            session = ?;
                    `,
                    [
                        socket.id,
                        agroOrientaAppParsed,
                    ],
                    function (err, results) {
                        if (err) {
                            console.log(err);
                        }
                    }
                );
            }
        }
    }
};