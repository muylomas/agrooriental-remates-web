const cookie = require('cookie');
const cookieParser = require('cookie-parser');
const connection = require('../../routes/connection_db');

module.exports = function (socket) {

    if (socket.handshake.headers['sec-fetch-site'] == 'same-origin') {

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
            "mercadoagroApp" in cookieParsed &&
            cookieParsed.mercadoagroApp
        ) {

            const mercadoagroAppParsed = cookieParser.signedCookie(cookieParsed.mercadoagroApp, 'LoktOOtNBvuFajNrBnx4');

            //console.log(socket.id);
            //console.log(socket.handshake);
            //console.log(socket.rooms);
            //console.log(socket.data);

            if (mercadoagroAppParsed) {
                connection.query(
                    `
                        UPDATE customers SET 
                            socketId = ?
                        WHERE 
                            session = ?;
                    `,
                    [
                        socket.id,
                        mercadoagroAppParsed,
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