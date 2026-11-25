const connection = require('../connection_db');
const meta_tapa = require('../../helpers/meta-tapa');

// Los códigos para clientes sin aprobar (invitation = 0) se piden desde un
// formulario abierto, así que se limitan por IP para que no se pueda usar el
// registro para mandar WhatsApp/SMS a números ajenos. Meta Tapa ya limita por
// teléfono (1 cada 60 s, 5 por hora); esto limita los números distintos.
const UNAPPROVED_CODES_PER_IP_PER_HOUR = 5;
const unapprovedCodesByIp = new Map();

function allowUnapprovedCode(ip) {
    const now = Date.now();
    const recent = (unapprovedCodesByIp.get(ip) || []).filter((t) => now - t < 3600000);
    if (recent.length >= UNAPPROVED_CODES_PER_IP_PER_HOUR) {
        unapprovedCodesByIp.set(ip, recent);
        return false;
    }
    recent.push(now);
    unapprovedCodesByIp.set(ip, recent);
    return true;
}

setInterval(function () {
    const now = Date.now();
    unapprovedCodesByIp.forEach((times, ip) => {
        if (!times.some((t) => now - t < 3600000)) unapprovedCodesByIp.delete(ip);
    });
}, 600000).unref();

function Common() { }

// Pide a Meta Tapa el código de ingreso y arma los parámetros de la pantalla
// del código (views/auth/register-form.pug).
// customer: { id, invitation, whatsappOptIn, phoneCountryCode, phoneNumber }
// canal: "whatsapp" o "sms".
Common.prototype.sendLoginCode = function (req, customer, canal, callback) {
    const params = {
        verification: "phone",
        userId: customer.id,
        codeSent: true,
        pendingApproval: customer.invitation != 1,
        whatsappOptIn: customer.whatsappOptIn == 1,
    };

    if (customer.invitation != 1 && !allowUnapprovedCode(req.ip)) {
        console.error('Meta Tapa: código no pedido, límite por IP para clientes sin aprobar', req.ip);
        params.error = meta_tapa.mensajeError({ errorCode: 'limite_envios' });
        return callback(params);
    }

    meta_tapa.solicitarCodigo(
        meta_tapa.telefonoE164(customer.phoneCountryCode, customer.phoneNumber),
        "login",
        canal,
        function (reply) {
            if (reply.ok) {
                params.notice = reply.data && reply.data.canal == "whatsapp" ?
                    "Te mandamos el código por WhatsApp." :
                    "Te mandamos el código por SMS.";
            }
            else {
                params.error = meta_tapa.mensajeError(reply);
            }
            callback(params);
        }
    );
};

Common.prototype.verifyPhoneAvailability = function (phoneNumber, callback) {
    let availability = true;
    connection.query(
        `
            SELECT id
            FROM customers 
            WHERE
                phoneNumber = ?
        `,
        [
            parseInt(phoneNumber, 10),
        ],
        function (err, results) {
            if (err) {
                console.log(err);
                availability = false;
            }
            else {
                if (results.length) {
                    availability = false;
                }
            }

            callback(availability);
        }
    );
};


module.exports = new Common();