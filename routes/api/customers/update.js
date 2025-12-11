const connection = require('../../connection_db');
const common_auth = require('../../common_auth');

function Common() { }

Common.prototype.profile = function (sessionID, params, callback) {
    common_auth.basic(sessionID, function (reply) {
        if (reply.err) {
            callback();
        }
        else {
            let validateParams = false;
            if (
                "name" in params && params.name &&
                "surname" in params && params.surname
            ) {
                validateParams = true;
            }

            if (validateParams) {
                connection.query(
                    `
                        UPDATE customers SET
                            name = ?,
                            surname = ?,
                            nidTypeId = ?,
                            nid = ?,
                            companyName = ?
                        WHERE 
                            id = ?
                    `,
                    [
                        params.name,
                        params.surname,
                        params.nidTypeId,
                        params.nid,
                        params.companyName,
                        reply.user.id,
                    ],
                    function (err, results) {
                        if (err) {
                            console.log(err);
                        }

                        callback();
                    }
                );
            }
        }
    });
};

module.exports = new Common();