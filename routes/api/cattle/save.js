const connection = require('../../connection_db');
const common_auth = require('../../common_auth');

function Common() { }

Common.prototype.delete = function (sessionID, lotId, callback) {
    common_auth.basic(sessionID, function (reply) {
        if (reply.err) {
            callback();
        }
        else {
            connection.query(
                `
                    UPDATE cattle_saved SET
                        status = 0
                    WHERE 
                        customerId = ? AND
                        id = ?
                `,
                [
                    reply.user.id,
                    lotId,
                ],
                function (err, results) {
                    if (err) {
                        console.log(err);
                    }

                    callback();
                }
            );
        }
    });
};

module.exports = new Common();