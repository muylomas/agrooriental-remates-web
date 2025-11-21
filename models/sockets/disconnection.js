/*
 * Serve content over a socket
 */
//var connection = require('../../routes/connection_muylomas');

module.exports = function (socket) {
    socket.on('disconnect', function () {
        //console.log("SocketId: " + socket.id + " disconnected.");
    });
};