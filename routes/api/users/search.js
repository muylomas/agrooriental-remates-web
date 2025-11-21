const connection = require('../../connection_db');
const common_auth = require('../../common_auth');

function Common() { }

Common.prototype.byString = function (sessionID, userString, userType, callback) {
    common_auth.basic(sessionID, function (reply) {
        if (reply.err) {
            callback([]);
        }
        else {
            let users = [];
            let queryParams = [];
            let userTypeFilterString = "";
            if (userType == "salesagents") {
                userTypeFilterString = " users.salesAgent = 1 AND ";
            }

            queryParams.push(userString);

            connection.query(
                `
                    SELECT 
                        users.id as id,
                        users.phone as phone,
                        users.username AS username,
                        users.name AS name,
                        users.surname AS surname,
                        IF(
                            users.picture IS NULL OR users.picture = "",
                            "https://mercadoagro-backoffice.s3.amazonaws.com/images/customers/no-profile-img.png",
                            users.picture
                        ) AS image
                    FROM users 
                    WHERE 
                        users.status = 1 AND ` + userTypeFilterString + `
                        CONCAT (
                            users.phone, " ",
                            users.email, " ",
                            users.name, " ",
                            users.surname, " ",
                            users.username
                        ) LIKE CONCAT("%",?,"%")
                    LIMIT 0,10
                `,
                queryParams,
                function (err, results) {
                    if (err) {
                        console.log(err);
                    }
                    else {
                        users = results;
                    }

                    callback(users)
                }
            );
        }
    });
};

module.exports = new Common();