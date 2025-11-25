/*
 * Serve content over a socket
 */
//const connection = require('../../routes/connection_muylomas');

module.exports = function (socket) {
    socket.on('disconnect', function () {
        //console.log("SocketId: " + socket.id + " disconnected.");
    });
};