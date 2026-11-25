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
    if (!customer.id) {
        // "Corregir el número" vuelve a la pantalla de donde vino.
        params.fixPhoneUrl = req.session.newPhone && req.session.newPhone.userName ? "/registro" : "/ingresar";
    }

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

// Cliente con ese celular, o null. phoneCountry es el id de las opciones de país.
Common.prototype.findCustomerByPhone = function (phoneCountry, phoneNumber, callback) {
    connection.query(
        `
            SELECT
                customers_complete.customerId AS id,
                customers.invitation AS invitation,
                customers.session AS session,
                customers_complete.phoneCountryCode AS phoneCountryCode,
                customers_complete.phoneNumber AS phoneNumber
            FROM customers_complete
            INNER JOIN customers ON customers.id = customers_complete.customerId
            WHERE
                customers_complete.phoneCountry = ? AND
                customers_complete.phoneNumber = ?
        `,
        [
            phoneCountry,
            parseInt(phoneNumber, 10),
        ],
        function (err, results) {
            if (err) console.log(err);
            callback(err, results && results.length ? results[0] : null);
        }
    );
};

// Celular sin cuenta (req.session.newPhone) con la forma que espera sendLoginCode.
Common.prototype.newPhoneCustomer = function (newPhone) {
    return {
        id: 0,
        invitation: 0,
        phoneCountryCode: this.phoneCountryCode(newPhone.phoneCountry),
        phoneNumber: newPhone.phoneNumber,
    };
};

// Ingreso de un cliente que ya tiene cuenta: ata la verificación del código a
// esta sesión (sessionPhone) y le manda el código. El código lo genera y lo
// valida Meta Tapa; no se guarda acá.
Common.prototype.startLogin = function (req, customer, canal, callback) {
    const self = this;
    connection.query(
        `
            UPDATE customers SET
                sessionPhone = ?,
                phoneAdminCode = ""
            WHERE id = ?
        `,
        [
            req.sessionID,
            customer.id,
        ],
        function (err) {
            if (err) {
                console.log(err);
                return callback({ verification: "phone", userId: customer.id, codeSent: false, error: "No pudimos enviarte el código. Probá de nuevo." });
            }
            // También a clientes sin aprobar: entran y navegan, pero no
            // pueden ofertar hasta que Agro Oriental los habilite.
            self.sendLoginCode(req, customer, canal, callback);
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