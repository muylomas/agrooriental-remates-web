// Aviso por WhatsApp (Meta Tapa, evento account.approved) cuando Agro Oriental
// aprueba una cuenta desde gestión (customers.invitation pasa a 1).
//
// Gestión es otro sistema, pero escribe en esta misma base: cada minuto se
// buscan los clientes aprobados que todavía no se avisaron
// (approvalNotified = 0, ver scripts/sql/2026-11-25-approval-notified.sql).
//
// - Solo se manda a quien aceptó recibir WhatsApp (whatsappOptIn = 1). Al resto
//   se lo marca como avisado igual, para no revisarlo cada minuto.
// - Si Meta Tapa lo registra (o ya lo tenía: misma idempotencyKey), se marca.
// - Si Meta Tapa lo rechaza por datos (4xx), se marca y queda en el log: un
//   reintento daría el mismo error.
// - Si no hay conexión o Meta Tapa falla (5xx), se reintenta en el minuto siguiente.

const connection = require('../routes/connection_db');
const meta_tapa = require('../helpers/meta-tapa');

const BATCH = 20;
let running = false;

function markNotified(customerId) {
    connection.query(
        `UPDATE customers SET approvalNotified = 1 WHERE id = ?`,
        [customerId],
        function (err) {
            if (err) console.log('account-approved-notifications:', err);
        }
    );
}

function run() {
    if (running) return;
    running = true;

    connection.query(
        `
            SELECT
                customers.id AS id,
                customers.whatsappOptIn AS whatsappOptIn,
                customers_complete.customerName AS name,
                customers_complete.phoneCountryCode AS phoneCountryCode,
                customers_complete.phoneNumber AS phoneNumber
            FROM customers
            LEFT JOIN customers_complete ON customers_complete.customerId = customers.id
            WHERE
                customers.invitation = 1 AND
                customers.approvalNotified = 0
            LIMIT ?
        `,
        [
            BATCH,
        ],
        function (err, results) {
            if (err) {
                console.log('account-approved-notifications:', err);
                running = false;
                return;
            }

            let pending = results.length;
            if (!pending) {
                running = false;
                return;
            }
            const done = function () {
                if (--pending == 0) running = false;
            };

            results.forEach(function (customer) {
                const telefono = meta_tapa.telefonoE164(customer.phoneCountryCode, customer.phoneNumber);
                if (customer.whatsappOptIn != 1 || !telefono) {
                    markNotified(customer.id);
                    return done();
                }

                meta_tapa.enviarEvento(
                    "account.approved",
                    "cuenta-" + customer.id + "-aprobada",
                    { telefono: telefono, nombre: customer.name || "", idExterno: String(customer.id) },
                    {},
                    function (reply) {
                        if (reply.ok || (reply.status >= 400 && reply.status < 500 && reply.status != 401 && reply.status != 429)) {
                            markNotified(customer.id);
                        }
                        done();
                    }
                );
            });
        }
    );
}

module.exports = { run };
