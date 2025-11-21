var express = require('express');
var router = express.Router();
var connection = require('./connection_db');

/* GET page. */
router.post('/', function (req, res, next) {
    connection.query(
        `
            UPDATE customers SET
                session = ''
            WHERE 
                session = ?
        `,
        [
            req.sessionID,
        ],
        function (err, results) {
            if (err) {
                console.log(err);
            }
            res.redirect('/');
        }
    );
});

module.exports = router;