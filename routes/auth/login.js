const express = require('express');
const router = express.Router();
const connection = require('../connection_db');
const sha512 = require('js-sha512');
const common_gral = require('../common_gral');

const common_auth = require('./common');

/* GET page. */
router.get('/', function (req, res, next) {
    res.render('auth/login', {},);
});

// "¿No te llegó? Mandarlo por SMS" en la pantalla del código.
router.post('/reenviar-sms', function (req, res, next) {
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
            WHERE
                customers.id = ? AND
                customers.sessionPhone = ?
        `,
        [
            parseInt(req.body.userId, 10) || 0,
            req.sessionID,
        ],
        function (err, results) {
            if (err || !results.length) {
                if (err) console.log(err);
                return res.redirect('/ingresar');
            }
            common_auth.sendLoginCode(req, results[0], "sms", function (params) {
                res.render('auth/register-form', params);
            });
        }
    );
});

router.post('/', function (req, res, next) {
    if (
        "body" in req &&
        "loginMethodType" in req.body && req.body.loginMethodType &&
        (
            (
                req.body.loginMethodType == "phone" &&
                "phoneCountry" in req.body && req.body.phoneCountry &&
                "phoneNumber" in req.body && req.body.phoneNumber && parseInt(req.body.phoneNumber)
            ) || (
                req.body.loginMethodType == "email" &&
                "user" in req.body && req.body.email &&
                "password" in req.body && req.body.password
            )
        )
    ) {
        if (req.body.loginMethodType == "phone") {
            connection.query(
                `
                    SELECT 
                        customers_complete.customerId AS id, 
                        customers.invitation AS invitation, 
                        customers.whatsappOptIn AS whatsappOptIn,
                        customers_complete.phoneCountryCode AS phoneCountryCode,
                        customers_complete.phoneNumber AS phoneNumber
                    FROM customers_complete
                    INNER JOIN customers ON customers.id = customers_complete.customerId
                    WHERE
                        customers_complete.phoneCountry = ? AND 
                        customers_complete.phoneNumber = ?
                `,
                [
                    req.body.phoneCountry,
                    parseInt(req.body.phoneNumber),
                ],
                function (err, results) {
                    if (err) {
                        res.redirect('/ingresar');
                    }
                    else {
                        if (results.length) {
                            const customer = results[0];

                            // sessionPhone ata la verificación del código a esta sesión.
                            // El código lo genera y lo valida Meta Tapa; ya no se guarda acá.
                            connection.query(
                                `
                                    UPDATE customers SET
                                        sessionPhone = ?,
                                        phoneAdminCode = ""
                                    WHERE
                                        phoneCountry = ? AND
                                        phoneNumber = ?
                                `,
                                [
                                    req.sessionID,
                                    req.body.phoneCountry,
                                    parseInt(req.body.phoneNumber, 10),
                                ],
                                function (err, results) {
                                    if (err) {
                                        console.log(err);
                                        res.redirect('/ingresar');
                                    }
                                    else {
                                        // También a clientes sin aprobar: entran y navegan, pero no
                                        // pueden ofertar hasta que Agro Oriental los habilite.
                                        common_auth.sendLoginCode(req, customer, "whatsapp", function (params) {
                                            res.render('auth/register-form', params);
                                        });
                                    }
                                }
                            );

                        }
                        else {
                            res.redirect('/ingresar');
                        }
                    }
                }
            );
        }
        else {
            const password = sha512("admin" + req.body.user + req.body.password);
            const username = req.body.user.trim();
            connection.query(
                `
                    SELECT 
                        username, 
                        image, 
                        type, 
                        IF((resetDate < NOW() - INTERVAL 1 MONTH) OR (resetPassword = 1), 1, 0) AS lastReset 
                    FROM customers 
                    WHERE 
                        (
                            username = ? OR 
                            email = ? 
                        ) AND 
                        password = ? AND status = 1 
                    LIMIT 0, 1;
                `,
                [
                    username,
                    username,
                    password
                ],
                function (err, results) {
                    if (err) {
                        res.redirect('/ingresar');
                    }
                    else {
                        if (results.length) {
                            if (results[0].lastReset == 1) {
                                res.redirect(303, '/reset-password');
                            }
                            else {
                                connection.query(
                                    `
                                        UPDATE customers SET 
                                            session = ? 
                                        WHERE 
                                            username = ? OR 
                                            email = ?
                                    `,
                                    [
                                        req.sessionID,
                                        username,
                                        username
                                    ],
                                    function (err, results) {
                                        if (err) {
                                            res.redirect('/ingresar');
                                        }
                                        else {
                                            const redirectTo = req.session.redirectTo || '/';
                                            delete req.session.redirectTo;
                                            common_gral.redirectSavingSession(req, res, redirectTo);
                                        }
                                    });
                            }
                        }
                        else {
                            res.redirect('/ingresar');
                        }
                    }
                }
            );
        }
    }
    else
        res.redirect('/ingresar');

});

module.exports = router;