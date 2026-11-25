-- Marca qué clientes ya fueron avisados de que Agro Oriental aprobó su cuenta
-- (evento account.approved de Meta Tapa, crons/account-approved-notifications.js).
-- Correr ANTES de desplegar el código que lo usa.
--
-- Los clientes ya aprobados se marcan como avisados: el aviso es solo para
-- los que se aprueben de ahora en adelante.

ALTER TABLE customers
    ADD COLUMN approvalNotified TINYINT(1) NOT NULL DEFAULT 0;

UPDATE customers SET approvalNotified = 1 WHERE invitation = 1;
