/*
 * Serve content over a socket
 */
const presence = require('./presence');

module.exports = function (socket) {
    socket.on('disconnect', function () {
        //console.log("SocketId: " + socket.id + " disconnected.");
        presence.removeSocket(socket);
    });
};
