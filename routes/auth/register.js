const express = require('express');
const router = express.Router();
const connection = require('../connection_db');
const common_gral = require('../common_gral');
const common_auth = require('./common');
const sha512 = require('js-sha512');

// Solo para el aviso interno de "Nuevo registro"; los códigos los manda Meta Tapa.
const aws_sms_sender = require('../aws_sms_sender');
const meta_tapa = require('../../helpers/meta-tapa');

// Recién registrado (invitation = 0): se le manda el código para que entre
// y navegue; para ofertar tiene que habilitarlo Agro Oriental.
function sendCodeToNewCustomer(req, res, customerId) {
    connection.query(
        `
            SELECT
                customers.id AS id,
                customers.invitation AS invitation,
                customers.whatsappOptIn AS whatsappOptIn,
                customers_complete.phoneCountryCode AS phoneCountryCode,
                customers_complete.phoneNumber AS phoneNumber
            FROM customers
            INNER JOIN customers_complete ON customers_complete.customerId = customers.id
            WHERE customers.id = ?
        `,
        [
            customerId,
        ],
        function (err, results) {
            if (err || !results.length) {
                if (err) console.log(err);
                return res.render('auth/register-form', { verification: "phone", userId: customerId });
            }
            common_auth.sendLoginCode(req, results[0], "whatsapp", function (params) {
                res.render('auth/register-form', params);
            });
        }
    );
}

/* GET page. */
router.get('/', function (req, res, next) {
    res.render(
        'auth/register-form',
        {
            verification: false,
            userId: 0,
        }
    );
});

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
        const whatsappOptIn = req.body.whatsappOptIn == "1" ? 1 : 0;

        if (req.body.registerMethodType == "phone") {
            common_auth.verifyPhoneAvailability(
                req.body.phoneNumber,
                function (availability) {
                    if (availability) {
                        connection.query(
                            `
                                INSERT INTO customers SET
                                    name = ?,
                                    surname = ?,
                                    phoneCountry = ?,
                                    phoneNumber = ?,
                                    phonePassword = ?,
                                    sessionPhone = ?,
                                    provider = "phone",
                                    email = NULL,
                                    invitation = 0,
                                    whatsappOptIn = ?,
                                    whatsappOptInDate = IF(? = 1, NOW(), NULL)
                            `,
                            [
                                req.body.userName,
                                req.body.userSurname,
                                req.body.phoneCountry,
                                parseInt(req.body.phoneNumber, 10),
                                phonePassword,
                                req.sessionID,
                                whatsappOptIn,
                                whatsappOptIn,
                            ],
                            function (err, results) {
                                if (err) {
                                    console.log(err);
                                    res.redirect('/registro/error');
                                }
                                else {
                                    aws_sms_sender.sms_sender(
                                        {
                                            Message:
                                                "Nuevo registro: " + req.body.userName + " " + req.body.userSurname +
                                                ", tel: " + req.body.phoneCountry + parseInt(req.body.phoneNumber, 10) +
                                                " https://gestion.agrooriental.uy/personas",
                                            PhoneNumber: "+59899492041",
                                        },
                                        function (error) {
                                        }
                                    );

                                    sendCodeToNewCustomer(req, res, results.insertId);
                                }
                            }
                        );
                    }
                    else {
                        res.redirect('/registro/error');
                    }
                }
            );
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
    // La casilla solo cuenta si estaba en el formulario (whatsappOptInShown).
    const whatsappOptIn = req.body.whatsappOptInShown == "1" ? (req.body.whatsappOptIn == "1" ? 1 : 0) : null;

    const showError = function (error) {
        res.render(
            'auth/register-form',
            {
                verification: "phone",
                userId: userId,
                codeSent: true,
                whatsappOptIn: whatsappOptIn == 1,
                error: error,
            }
        );
    };

    if (!/^[0-9]{4}$/.test(code) || !userId) {
        return showError("Ingresá los 4 números del código.");
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
                        return showError(meta_tapa.mensajeError(reply));
                    }

                    connection.query(
                        `
                            UPDATE customers SET
                                session = ?,
                                -- MySQL asigna en orden: la fecha va antes de cambiar whatsappOptIn.
                                whatsappOptInDate = IF(? IS NULL OR ? = whatsappOptIn, whatsappOptInDate, NOW()),
                                whatsappOptIn = IF(? IS NULL, whatsappOptIn, ?)
                            WHERE id = ?
                        `,
                        [
                            req.sessionID,
                            whatsappOptIn, whatsappOptIn,
                            whatsappOptIn, whatsappOptIn,
                            userId,
                        ],
                        function (err) {
                            if (err) {
                                console.log(err);
                                return showError("No pudimos iniciar tu sesión. Probá de nuevo.");
                            }
                            delete req.session.redirectTo;
                            // Sin aprobar: al llegar al sitio se le explica que todavía no puede
                            // ofertar (views/cattle/remate-includes/pending-approval.pug).
                            if (pendingApproval) {
                                req.session.pendingApprovalNotice = true;
                            }
                            common_gral.redirectSavingSession(req, res, "/");
                        }
                    );
                }
            );
        }
    );
});

module.exports = router;
