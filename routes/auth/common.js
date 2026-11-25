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

// Prefijos de las opciones de país de views/auth/login.pug (customers.phoneCountry).
// Se usan para mandar el código a un celular que todavía no tiene cuenta.
const PHONE_COUNTRY_CODES = {
    "1": "+598",
    "2": "+54",
    "3": "+56",
    "4": "+1",
    "5": "+595",
    "6": "+55",
    "7": "+49",
};

function Common() { }

Common.prototype.phoneCountryCode = function (phoneCountry) {
    return PHONE_COUNTRY_CODES[String(phoneCountry)] || "";
};

// Pide a Meta Tapa el código de ingreso y arma los parámetros de la pantalla
// del código (views/auth/register-form.pug).
// customer: { id, invitation, phoneCountryCode, phoneNumber }. id = 0 es un
// celular sin cuenta: después del código se le piden nombre y apellido.
// canal: "whatsapp" o "sms".
Common.prototype.sendLoginCode = function (req, customer, canal, callback) {
    const params = {
        verification: "phone",
        userId: customer.id || 0,
        newCustomer: !customer.id,
        phoneDisplay: (customer.phoneCountryCode || "") + " " + parseInt(customer.phoneNumber, 10),
        codeSent: true,
        pendingApproval: !!customer.id && customer.invitation != 1,
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