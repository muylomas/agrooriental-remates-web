-- Consentimiento para recibir avisos por WhatsApp (Meta Tapa).
-- Correr ANTES de desplegar el código que lo usa: el registro y el ingreso
-- leen y escriben estas columnas.
-- Los clientes existentes quedan sin aceptar (0) hasta que marquen la casilla
-- en la pantalla del código al ingresar.

ALTER TABLE customers
    ADD COLUMN whatsappOptIn TINYINT(1) NOT NULL DEFAULT 0,
    ADD COLUMN whatsappOptInDate DATETIME NULL;
