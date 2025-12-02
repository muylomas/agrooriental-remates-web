const express = require('express');
const router = express.Router();
const connection = require('../connection_db');
const sha512 = require('js-sha512');
const common_gral = require('../common_gral');

const aws_sms_sender = require('../aws_sms_sender');

/* GET page. */
router.get('/', function (req, res, next) {
    res.render('auth/login', {},);
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
                        customers_complete.phoneCountryCode AS phoneCountryCode
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
                            const __aux_userId = results[0].id;
                            const __aux_enableSMS = results[0].invitation;
                            const __aux_phoneCountryCode = results[0].phoneCountryCode;

                            const phoneCodeNumber = common_gral.randomStringNumbers(4);
                            const phonePassword = sha512("phone" + phoneCodeNumber);

                            connection.query(
                                `
                                    UPDATE customers SET
                                        phonePassword = ?,
                                        phoneAdminCode = ""
                                    WHERE
                                        phoneCountry = ? AND
                                        phoneNumber = ?
                                `,
                                [
                                    phonePassword,
                                    req.body.phoneCountry,
                                    parseInt(req.body.phoneNumber, 10),
                                ],
                                function (err, results) {
                                    if (err) {
                                        console.log(err);
                                        res.redirect('/ingresar');
                                    }
                                    else {
                                        if (__aux_enableSMS == 1) {
                                            aws_sms_sender.sms_sender(
                                                {
                                                    Message: phoneCodeNumber + " es tu código de verificación de Agro Oriental https://equinos.agrooriental.uy",
                                                    PhoneNumber: __aux_phoneCountryCode + parseInt(req.body.phoneNumber, 10),
                                                },
                                                function (error) {
                                                }
                                            );
                                        }

                                        res.render(
                                            'auth/register-form',
                                            {
                                                verification: "phone",
                                                userId: __aux_userId,
                                            }
                                        );
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