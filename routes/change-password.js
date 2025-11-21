const express = require('express');
const router = express.Router();
const connection = require('../routes/connection_db');
const sha512 = require('js-sha512');

/* GET page. */
router.get('/', function (req, res, next) {
    res.render('change-password', {});
});

router.post('/', function (req, res, next) {
    if ("body" in req && "email" in req.body && "apassword" in req.body && "npassword" in req.body && "repassword" in req.body) {
        const newPasswordInput = req.body.npassword;
        const lowerCaseLettersMatch = /[a-z]/g;
        const upperCaseLettersMatch = /[A-Z]/g;
        const numbersMatch = /[0-9]/g;

        if (newPasswordInput.match(lowerCaseLettersMatch) &&
            newPasswordInput.match(upperCaseLettersMatch) &&
            newPasswordInput.match(numbersMatch) &&
            newPasswordInput.length >= 8 &&
            req.body.npassword === req.body.repassword) {
            const password = sha512("admin" + req.body.email + req.body.apassword);
            const username = req.body.email.trim();
            connection.query(
                `
                    SELECT username, picture, type 
                    FROM users 
                    WHERE 
                        ( username = ? OR email = ? ) AND 
                        password = ? AND 
                        status = 1 
                    LIMIT 0, 1
                `,
                [
                    username,
                    username,
                    password
                ],
                function (err, results) {
                    if (err) {
                        res.redirect('/logout');
                    }
                    else {
                        if (results.length) {
                            const newPassword = sha512("admin" + req.body.email + req.body.npassword);

                            connection.query(
                                `
                                    UPDATE users SET 
                                        password = ?,
                                        session = ?, 
                                        resetDate = NOW(), 
                                        resetPassword = 0
                                    WHERE 
                                        username = ? OR 
                                        email = ?
                                `,
                                [
                                    newPassword,
                                    req.sessionID,
                                    username,
                                    username
                                ],
                                function () {
                                    res.redirect('/logout');
                                }
                            );
                        }
                        else {
                            res.redirect('/logout');
                        }
                    }
                }
            );
        }
        else {
            res.redirect('/reset-password');
        }
    }
    else
        res.redirect('/reset-password');

});

module.exports = router;