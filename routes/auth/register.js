const express = require('express');
const router = express.Router();
const connection = require('../connection_db');
const common_gral = require('../common_gral');
const common_auth = require('./common');
const sha512 = require('js-sha512');

// Solo para el aviso interno de "Nuevo registro"; los códigos los manda Meta Tapa.
const aws_sms_sender = require('../aws_sms_sender');
const meta_tapa = require('../../helpers/meta-tapa');

// Crear cuenta: nombre, apellido y celular; después el código (POST /registro).
// También se puede crear desde /ingresar con un celular sin cuenta: ahí el
// nombre y el apellido se piden después del código (POST /registro/datos).
router.get('/', function (req, res, next) {
    res.render('auth/register-form', { verification: false, userId: 0 });
});

// Un celular sin cuenta tiene 30 minutos desde que verificó el código para
// completar nombre y apellido.
const NEW_PHONE_VERIFIED_MS = 30 * 60 * 1000;

function verifiedNewPhone(req) {
    const newPhone = req.session.newPhone;
    if (!newPhone || !newPhone.verifiedAt || Date.now() - newPhone.verifiedAt > NEW_PHONE_VERIFIED_MS) {
        return null;
    }
    return newPhone;
}

function loggedIn(req, res, pendingApproval) {
    delete req.session.newPhone;
    delete req.session.redirectTo;
    // Sin aprobar: al llegar al sitio se le explica que todavía no puede
    // ofertar (views/cattle/remate-includes/pending-approval.pug).
    if (pendingApproval) {
        req.session.pendingApprovalNotice = true;
    }
    common_gral.redirectSavingSession(req, res, "/");
}

function cleanName(value) {
    return String(value || "").trim().slice(0, 100);
}

// Nombre y apellido de un celular nuevo, ya verificado con el código.
router.post('/datos', function (req, res, next) {
    const newPhone = verifiedNewPhone(req);
    if (!newPhone) {
        return res.redirect('/ingresar');
    }

    const userName = cleanName(req.body.userName);
    const userSurname = cleanName(req.body.userSurname);
    if (!userName || !userSurname) {
        return res.render('auth/register-form', {
            verification: "datos",
            userName: userName,
            userSurname: userSurname,
            error: "Completá tu nombre y tu apellido.",
        });
    }

    createCustomer(req, res, newPhone, userName, userSurname);
});

// Crea la cuenta de un celular ya verificado con el código y deja la sesión
// iniciada. Si el celular ya tiene cuenta (otra pestaña), entra a esa.
function createCustomer(req, res, newPhone, userName, userSurname) {
    connection.query(
        `
            SELECT id, invitation
            FROM customers
            WHERE
                phoneCountry = ? AND
                phoneNumber = ?
        `,
        [
            newPhone.phoneCountry,
            newPhone.phoneNumber,
        ],
        function (err, results) {
            if (err) {
                console.log(err);
                return res.redirect('/ingresar');
            }

            // Se creó mientras tanto (otra pestaña): el celular ya está
            // verificado, así que entra a esa cuenta.
            if (results.length) {
                const existing = results[0];
                return connection.query(
                    `UPDATE customers SET session = ? WHERE id = ?`,
                    [req.sessionID, existing.id],
                    function (err) {
                        if (err) {
                            console.log(err);
                            return res.redirect('/ingresar');
                        }
                        loggedIn(req, res, existing.invitation != 1);
                    }
                );
            }

            // phonePassword: nadie lo usa, el código lo valida Meta Tapa.
            const phonePassword = sha512("phone" + common_gral.randomStringNumbers(4));
            connection.query(
                `
                    INSERT INTO customers SET
                        name = ?,
                        surname = ?,
                        phoneCountry = ?,
                        phoneNumber = ?,
                        phonePassword = ?,
                        sessionPhone = ?,
                        session = ?,
                        provider = "phone",
                        email = NULL,
                        invitation = 0
                `,
                [
                    userName,
                    userSurname,
                    newPhone.phoneCountry,
                    newPhone.phoneNumber,
                    phonePassword,
                    req.sessionID,
                    req.sessionID,
                ],
                function (err) {
                    if (err) {
                        console.log(err);
                        return res.render('auth/register-form', {
                            verification: "datos",
                            userName: userName,
                            userSurname: userSurname,
                            error: "No pudimos crear tu cuenta. Probá de nuevo.",
                        });
                    }

                    aws_sms_sender.sms_sender(
                        {
                            Message:
                                "Nuevo registro: " + userName + " " + userSurname +
                                ", tel: " + common_auth.phoneCountryCode(newPhone.phoneCountry) + newPhone.phoneNumber +
                                " https://gestion.agrooriental.uy/personas",
                            PhoneNumber: "+59899492041",
                        },
                        function (error) {
                        }
                    );

                    loggedIn(req, res, true);
                }
            );
        }
    );
}

router.get('/error', function (req, res, next) {
    res.render(
        'auth/register-form-w-errors',
        {
            verification: false,
            userId: 0,
        }
    );
});

/* GET page. */
router.get('/codigo-verificacion', function (req, res, next) {
    connection.query(
        `
          SELECT 
            id AS id,
            invitation AS invitation
          FROM customers 
          WHERE session = ? 
        `,
        [
            req.sessionID
        ],
        function (err, results) {
            if (err) {
                console.log(err);
                res.redirect('/ingresar');
            }
            else {
                if (results.length) {
                    res.render(
                        'auth/register-form',
                        {
                            verification: "verificacion",
                            userId: results[0].id,
                        }
                    );
                }
                else {
                    res.redirect('/ingresar');
                }
            }
        }
    );
});

router.post('/', function (req, res, next) {
    if (
        "body" in req &&
        "registerMethodType" in req.body && req.body.registerMethodType &&
        (
            (
                req.body.registerMethodType == "phone" &&
                "phoneCountry" in req.body && req.body.phoneCountry &&
                "phoneNumber" in req.body && req.body.phoneNumber && parseInt(req.body.phoneNumber, 10) &&
                "userName" in req.body && req.body.userName &&
                "userSurname" in req.body && req.body.userSurname
            ) || (
                req.body.registerMethodType == "email" &&
                "email" in req.body && req.body.email &&
                "password" in req.body && req.body.password
            )
        )
    ) {
        // Nadie recibe este código: el que vale es el que manda Meta Tapa al ingresar.
        const phoneCodeNumber = common_gral.randomStringNumbers(4);
        const phonePassword = sha512("phone" + phoneCodeNumber);

        if (req.body.registerMethodType == "phone") {
            const userName = cleanName(req.body.userName);
            const userSurname = cleanName(req.body.userSurname);
            const phoneCountry = String(req.body.phoneCountry);
            const phoneNumber = parseInt(req.body.phoneNumber, 10);
            const formError = function (error) {
                res.render('auth/register-form', {
                    verification: false,
                    userId: 0,
                    userName: userName,
                    userSurname: userSurname,
                    phoneCountry: phoneCountry,
                    phoneNumber: phoneNumber,
                    error: error,
                });
            };

            if (!userName || !userSurname) {
                return formError("Completá tu nombre y tu apellido.");
            }
            if (!common_auth.phoneCountryCode(phoneCountry)) {
                return formError("Elegí el país de tu celular.");
            }

            return common_auth.findCustomerByPhone(phoneCountry, phoneNumber, function (err, customer) {
                if (err) {
                    return formError("No pudimos crear tu cuenta. Probá de nuevo.");
                }

                // Ya tiene cuenta: se le manda el código para ingresar a esa.
                if (customer) {
                    delete req.session.newPhone;
                    return common_auth.startLogin(req, customer, "whatsapp", function (params) {
                        params.notice = "Ese celular ya tiene una cuenta. " + (params.notice || "");
                        res.render('auth/register-form', params);
                    });
                }

                // La cuenta se crea recién cuando ingresa bien el código
                // (POST /registro/codigo-verificacion): un número mal escrito
                // no deja una cuenta a medias.
                req.session.newPhone = {
                    phoneCountry: phoneCountry,
                    phoneNumber: phoneNumber,
                    userName: userName,
                    userSurname: userSurname,
                };
                common_auth.sendLoginCode(req, common_auth.newPhoneCustomer(req.session.newPhone), "whatsapp", function (params) {
                    res.render('auth/register-form', params);
                });
            });
        }
        else {
            const password = sha512("admin" + req.body.email + req.body.password);
            connection.query(
                `
                    INSERT INTO customers SET
                        email = ?,
                        password = ?,
                        resetDate = NOW() + INTERVAL 4 MONTH,
                        resetPassword = 0,
                        resetPasswordKey = SHA2(UUID(),512),
                        provider = "email",
                        phonePassword = ?,
                        invitation = 0
                `,
                [
                    req.body.email.trim(),
                    password,
                    phonePassword,
                ],
                function (err, results) {
                    if (err) {
                        res.redirect('/registro/error');
                    }
                    else {
                        res.redirect('/registro/codigo-verificacion');
                    }
                }
            );
        }
    }
    else {
        res.redirect('/registro/error');
    }
});

// Verifica con Meta Tapa el código que se pidió al ingresar (routes/auth/login.js).
router.post('/codigo-verificacion', function (req, res, next) {
    const code = ["code1", "code2", "code3", "code4"].map((k) => String(req.body[k] || "")).join("");
    const userId = parseInt(req.body.userId, 10) || 0;
    const newPhone = userId ? null : req.session.newPhone;

    if (!userId && !newPhone) {
        return res.redirect('/ingresar');
    }

    const showError = function (error) {
        const params = {
            verification: "phone",
            userId: userId,
            codeSent: true,
            error: error,
        };
        if (newPhone) {
            params.newCustomer = true;
            params.phoneDisplay = common_auth.phoneCountryCode(newPhone.phoneCountry) + " " + newPhone.phoneNumber;
            params.fixPhoneUrl = newPhone.userName ? "/registro" : "/ingresar";
        }
        res.render('auth/register-form', params);
    };

    if (!/^[0-9]{4}$/.test(code)) {
        return showError("Ingresá los 4 números del código.");
    }

    // Celular sin cuenta: con el código bien, se le piden nombre y apellido.
    if (newPhone) {
        return meta_tapa.verificarCodigo(
            meta_tapa.telefonoE164(common_auth.phoneCountryCode(newPhone.phoneCountry), newPhone.phoneNumber),
            "login",
            code,
            function (reply) {
                if (!reply.ok) {
                    // Formulario enviado dos veces: el primer envío ya usó el código y
                    // Meta Tapa responde "vencido" al segundo. Si esta sesión ya quedó
                    // verificada, se sigue a los datos en vez de mostrar el error.
                    return req.session.reload(function (err) {
                        if (!err && req.session.newPhone && req.session.newPhone.verifiedAt) {
                            return res.render('auth/register-form', { verification: "datos" });
                        }
                        // Venía de /registro y el primer envío ya creó la cuenta.
                        common_auth.findCustomerByPhone(newPhone.phoneCountry, newPhone.phoneNumber, function (err, customer) {
                            if (!err && customer && customer.session == req.sessionID) {
                                return loggedIn(req, res, customer.invitation != 1);
                            }
                            showError(meta_tapa.mensajeError(reply));
                        });
                    });
                }
                // Vino de "Crear cuenta": ya tiene nombre y apellido.
                if (newPhone.userName && newPhone.userSurname) {
                    return createCustomer(req, res, newPhone, newPhone.userName, newPhone.userSurname);
                }
                newPhone.verifiedAt = Date.now();
                req.session.save(function () {
                    res.render('auth/register-form', { verification: "datos" });
                });
            }
        );
    }

    connection.query(
        `
            SELECT 
                customers.id AS id,
                customers.invitation AS invitation,
                customers_complete.phoneCountryCode AS phoneCountryCode,
                customers_complete.phoneNumber AS phoneNumber
            FROM customers
            INNER JOIN customers_complete ON customers_complete.customerId = customers.id
            WHERE 
                customers.id = ? AND
                customers.sessionPhone = ?
        `,
        [
            userId,
            req.sessionID,
        ],
        function (err, results) {
            if (err || !results.length) {
                if (err) console.log(err);
                return res.redirect('/ingresar');
            }
            const pendingApproval = results[0].invitation != 1;

            meta_tapa.verificarCodigo(
                meta_tapa.telefonoE164(results[0].phoneCountryCode, results[0].phoneNumber),
                "login",
                code,
                function (reply) {
                    if (!reply.ok) {
                        // Formulario enviado dos veces: si el primer envío ya inició
                        // la sesión con este código, se entra en vez de mostrar
                        // "El código venció".
                        return connection.query(
                            `SELECT id FROM customers WHERE id = ? AND session = ?`,
                            [userId, req.sessionID],
                            function (err, logged) {
                                if (!err && logged.length) {
                                    return loggedIn(req, res, pendingApproval);
                                }
                                showError(meta_tapa.mensajeError(reply));
                            }
                        );
                    }

                    connection.query(
                        `
                            UPDATE customers SET
                                session = ?
                            WHERE id = ?
                        `,
                        [
                            req.sessionID,
                            userId,
                        ],
                        function (err) {
                            if (err) {
                                console.log(err);
                                return showError("No pudimos iniciar tu sesión. Probá de nuevo.");
                            }
                            loggedIn(req, res, pendingApproval);
                        }
                    );
                }
            );
        }
    );
});

module.exports = router;
