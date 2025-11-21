const connection = require('../../connection_db');
const common_auth = require('../../common_auth');

function duplicateCheck(lotId, callback) {
    connection.query(
        `
            SELECT *
            FROM payments_in_advance 
            WHERE lotId = ?;
        `,
        [
            lotId,
        ],
        function (err, results) {
            if (err) {
                console.log(err);
                callback(true, "1.0");
            }
            else if (results.length) {
                callback(true, "1.1");
            }
            else {
                callback(false, 0);
            }
        }
    );
}

function Common() { }

Common.prototype.requestFor = function (sessionID, lotId, amount, callback) {
    common_auth.basic(sessionID, function (reply) {
        if (reply.err) {
            callback(true, 0);
        }
        else {
            duplicateCheck(
                lotId,
                function (alreadyExists, err) {
                    if (!alreadyExists) {
                        connection.query(
                            `
                                INSERT INTO payments_in_advance SET 
                                    lotId = ?,
                                    amount = ?,
                                    customerId = ?,
                                    status = 1;
                            `,
                            [
                                lotId,
                                amount,
                                reply.user.id,
                            ],
                            function (err, results) {
                                if (err) {
                                    console.log(err);
                                    callback("2.0", 0);
                                }
                                else {
                                    callback(false, results.insertId);
                                }
                            }
                        );
                    }
                    else {
                        callback(err, 0);
                    }
                }
            );
        }
    });
};

module.exports = new Common();