const connection = require('../../connection_db');
const common_auth = require('../../common_auth');

function Common() { }

Common.prototype.byString = function (sessionID, societyString, callback) {
    common_auth.basic(sessionID, function (reply) {
        if (reply.err) {
            callback([]);
        }
        else {
            let societies = [];

            connection.query(
                `
                    SELECT 
                        societies_complete.societyId AS id,
                        societies_complete.societyName AS name,
                        societies_complete.societyCompany AS company,
                        societies_complete.societyRut AS rut,
                        IF(
                            societies_complete.societyImage IS NULL OR societies_complete.societyImage = "",
                            "https://agro-oriental-remates.s3.us-west-1.amazonaws.com/images/societies/no-profile-img.png",
                            societies_complete.societyImage
                        ) AS image
                    FROM societies_complete 
                    WHERE 
                        CONCAT (
                            societies_complete.societyId, " ",
                            societies_complete.societyName, " ",
                            societies_complete.societyCompany, " ",
                            societies_complete.societyRut
                        ) LIKE CONCAT("%",?,"%")
                    LIMIT 0,10
                `,
                [
                    societyString,
                ],
                function (err, results) {
                    if (err) {
                        console.log(err);
                    }
                    else {
                        societies = results;
                    }

                    callback(societies)
                }
            );
        }
    });
};

module.exports = new Common();