const connection = require('../../connection_db');
const common_auth = require('../../common_auth');

function Common() { }

Common.prototype.initialList = function (sessionID, lotId, callback) {
    let comments = [];

    common_auth.basic(sessionID, function (reply) {
        if (reply.err) {
            callback(comments);
        }
        else {
            connection.query(
                `
                    SELECT 
                        customers_complete.customerName AS name,
                        customers_complete.customerSurname AS surname,
                        cattle_comments.id AS id,
                        cattle_comments.comment AS comment,
                        DATE_FORMAT(cattle_comments.created_at - INTERVAL 3 HOUR, '%d/%m/%Y') AS date,
                        DATE_FORMAT(cattle_comments.created_at - INTERVAL 3 HOUR, '%h:%i %p') AS hour,
                        IF(cattle_comments.customerId = ?, TRUE, FALSE) AS owner
                    FROM cattle_comments
                    INNER JOIN customers_complete ON customers_complete.customerId = cattle_comments.customerId
                    WHERE 
                        cattle_comments.status = 1 AND
                        cattle_comments.customerId IS NOT NULL AND
                        cattle_comments.customerId > 0 AND
                        cattle_comments.public = 1 AND
                        cattle_comments.lotId = ? 
                    ORDER BY cattle_comments.created_at ASC
                `,
                [
                    reply.user.id,
                    lotId,
                ],
                function (err, results) {
                    if (err) {
                        console.log(err);
                    }
                    else if (results.length) {
                        comments = results;
                    }

                    callback(comments);
                }
            );
        }
    });
};

module.exports = new Common();