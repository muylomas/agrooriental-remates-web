/*
 * Serve content over a socket
 */
const connection = require('../../routes/connection_db');

module.exports = function (socket) {
    socket.on('disconnect', function () {
        //console.log("SocketId: " + socket.id + " disconnected.");
        connection.query(
            `
                UPDATE customers SET 
                    socketActive = 0
                WHERE 
                    socketId = ?;
            `,
            [
                socket.id,
            ],
            function (err, results) {
                if (err) {
                    console.log(err);
                }
            }
        );
    });
};