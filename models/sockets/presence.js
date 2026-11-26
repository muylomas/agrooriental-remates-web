/*
 * Presencia de clientes conectados por socket.
 *
 * Cada socket abierto de un cliente logueado es una fila en customers_sockets.
 * customers.socketActive se recalcula siempre desde esa tabla (EXISTS), nunca
 * se escribe un 1/0 fijo: así no importa en qué orden el pool de MySQL ejecute
 * las queries de conexión y desconexión, la última en correr deja el valor
 * correcto. Al arrancar el servidor se vacía la tabla, porque los sockets del
 * proceso anterior ya no existen (sus disconnect nunca llegaron a la base).
 *
 * Supone un único proceso Node atendiendo sockets: con varios, el reset de
 * init() borraría los sockets de los demás.
 */
const connection = require('../../routes/connection_db');

let ready = false;
let pending = [];

function whenReady(fn) {
    if (ready) {
        fn();
    }
    else {
        pending.push(fn);
    }
}

function init() {
    connection.query(`DELETE FROM customers_sockets`, function (err) {
        if (err) {
            console.log(err);
        }
        connection.query(
            `UPDATE customers SET socketActive = 0 WHERE socketActive = 1`,
            function (err) {
                if (err) {
                    console.log(err);
                }
                ready = true;
                const callbacks = pending;
                pending = [];
                callbacks.forEach(function (fn) { fn(); });
            }
        );
    });
}

// Recalcula socketActive del cliente a partir de sus sockets abiertos.
function refresh(customerId, socketId) {
    connection.query(
        `
            UPDATE customers SET
                socketId = IFNULL(?, socketId),
                socketActive = EXISTS (
                    SELECT 1 FROM customers_sockets WHERE customerId = ?
                ),
                lastSeenAt = NOW()
            WHERE id = ?;
        `,
        [
            socketId || null,
            customerId,
            customerId,
        ],
        function (err) {
            if (err) {
                console.log(err);
            }
        }
    );
}

function removeSocket(socket) {
    const customerId = socket.data.customerId;
    connection.query(
        `DELETE FROM customers_sockets WHERE socketId = ?`,
        [socket.id],
        function (err) {
            if (err) {
                console.log(err);
            }
            if (customerId) {
                refresh(customerId);
            }
        }
    );
}

// Registra un socket recién conectado del cliente con esa sesión.
function register(socket, session) {
    whenReady(function () {
        if (!socket.connected) {
            return;
        }
        connection.query(
            `SELECT id FROM customers WHERE session = ? LIMIT 1`,
            [session],
            function (err, results) {
                if (err) {
                    console.log(err);
                    return;
                }
                if (!results.length || !socket.connected) {
                    return;
                }
                const customerId = results[0].id;
                connection.query(
                    `
                        INSERT INTO customers_sockets (socketId, customerId)
                        VALUES (?, ?)
                        ON DUPLICATE KEY UPDATE customerId = VALUES(customerId);
                    `,
                    [socket.id, customerId],
                    function (err) {
                        if (err) {
                            console.log(err);
                            return;
                        }
                        socket.data.customerId = customerId;
                        if (socket.connected) {
                            refresh(customerId, socket.id);
                        }
                        else {
                            // Se desconectó mientras se insertaba: su
                            // disconnect pudo correr antes del INSERT.
                            removeSocket(socket);
                        }
                    }
                );
            }
        );
    });
}

function getCustomerBySocket(socketId, callback) {
    connection.query(
        `
            SELECT customers.id AS id, customers.invitation AS invitation
            FROM customers_sockets
            INNER JOIN customers ON customers.id = customers_sockets.customerId
            WHERE customers_sockets.socketId = ?
        `,
        [socketId],
        function (err, results) {
            let userId = 0;
            let invitation = 0;
            if (err) {
                console.log(err);
            }
            else if (results.length) {
                userId = results[0].id;
                invitation = results[0].invitation;
            }
            callback(userId, invitation);
        }
    );
}

module.exports = {
    init: init,
    register: register,
    removeSocket: removeSocket,
    getCustomerBySocket: getCustomerBySocket,
};
