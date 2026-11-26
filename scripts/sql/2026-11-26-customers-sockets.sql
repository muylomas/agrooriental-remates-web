-- Presencia de clientes conectados (models/sockets/presence.js).
-- Correr ANTES de desplegar el código que lo usa.
--
-- Antes había un único flag customers.socketActive + customers.socketId por
-- cliente, que quedaba en 1 si el servidor se reiniciaba (el disconnect nunca
-- llegaba), si los UPDATE de conexión/desconexión se ejecutaban en desorden
-- (pool de MySQL), o si el cliente tenía más de una pestaña/dispositivo.
--
-- Ahora cada socket abierto es una fila en customers_sockets; un cliente está
-- online si tiene al menos una. customers.socketActive se sigue manteniendo
-- (derivado de esta tabla) para el backoffice, y customers.lastSeenAt guarda
-- la última vez que se conectó o desconectó.

CREATE TABLE customers_sockets (
    socketId VARCHAR(64) NOT NULL,
    customerId INT NOT NULL,
    connectedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (socketId),
    KEY idx_customers_sockets_customer (customerId)
);

ALTER TABLE customers
    ADD COLUMN lastSeenAt DATETIME NULL DEFAULT NULL;

-- Limpia los flags que quedaron colgados.
UPDATE customers SET socketActive = 0 WHERE socketActive = 1;
