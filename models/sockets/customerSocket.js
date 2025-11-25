const cookie = require('cookie');
const cookieParser = require('cookie-parser');
const connection = require('../../routes/connection_db');

module.exports = function (socket) {

    console.log("=================== customerSocket ===================");
    console.log(socket.handshake.headers);
    console.log(socket);
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

        console.log(cookieParsed);

        if (
            "agroOrientaApp" in cookieParsed &&
            cookieParsed.agroOrientaApp
        ) {

            const agroOrientaAppParsed = cookieParser.signedCookie(cookieParsed.agroOrientaApp, 'LoktOOtNBvuFajNrBnx4');

            console.log(socket.id);
            console.log(socket.handshake);
            console.log(socket.rooms);
            console.log(socket.data);

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