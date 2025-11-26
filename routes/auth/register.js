const express = require('express');
const router = express.Router();
const connection = require('../connection_db');
const common_gral = require('../common_gral');
const sha512 = require('js-sha512');

const aws_sms_sender = require('../aws_sms_sender');

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
        const phoneCodeNumber = common_gral.randomStringNumbers(4);
        const phonePassword = sha512("phone" + phoneCodeNumber);

        if (req.body.registerMethodType == "phone") {
            connection.query(
                `
                    INSERT INTO customers SET
                        name = ?,
                        surname = ?,
                        phoneCountry = ?,
                        phoneNumber = ?,
                        phonePassword = ?,
                        provider = "phone",
                        invitation = 0
                `,
                [
                    req.body.userName,
                    req.body.userSurname,
                    req.body.phoneCountry,
                    parseInt(req.body.phoneNumber, 10),
                    phonePassword,
                ],
                function (err, results) {
                    if (err) {
                        console.log(err);
                        res.redirect('/registro');
                    }
                    else {
                        /*
                        aws_sms_sender.sms_sender(
                            {
                                Message: phoneCodeNumber + " es tu código de verificación de Agro Oriental.",
                                PhoneNumber: "+598" + parseInt(req.body.phoneNumber, 10),
                            },
                            function () {
                            }
                        );*/

                        res.render(
                            'auth/register-form',
                            {
                                verification: "phone",
                                userId: results.insertId,
                            }
                        );
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
                        res.render(
                            'auth/register-form',
                            {
                                verification: false,
                                userId: 0,
                            }
                        );
                    }
                    else {
                        res.render(
                            'auth/register-form',
                            {
                                verification: "email",
                                userId: results.insertId,
                            }
                        );
                    }
                }
            );
        }
    }
    else {
        res.render(
            'auth/register-form',
            {
                verification: false,
                userId: 0,
            }
        );
    }
});

router.post('/codigo-verificacion', function (req, res, next) {
    if (
        "body" in req &&
        "code1" in req.body &&
        "code2" in req.body &&
        "code3" in req.body &&
        "code4" in req.body &&
        "userId" in req.body && req.body.userId
    ) {
        const phonePassword = sha512(
            "phone" +
            req.body.code1 +
            req.body.code2 +
            req.body.code3 +
            req.body.code4
        );

        connection.query(
            `
                    UPDATE customers SET
                        invitation = 1,
                        session = ?
                    WHERE id = ? AND phonePassword = ?
                `,
            [
                req.sessionID,
                req.body.userId,
                phonePassword,
            ],
            function (err, results) {
                if (err) {
                    console.log(err);
                    res.render(
                        'auth/register-form',
                        {
                            verification: "verificacion",
                            userId: req.body.userId,
                        }
                    );
                }
                else {
                    const redirectTo = req.session.redirectTo || '/';
                    delete req.session.redirectTo;
                    common_gral.redirectSavingSession(req, res, redirectTo);
                }
            }
        );
    }
    else {
        res.render(
            'auth/register-form',
            {
                verification: false,
                userId: 0,
            }
        );
    }

});

module.exports = router;