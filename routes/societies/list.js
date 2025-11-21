const connection = require('../connection_db');
const common_auth = require('../common_auth');

function Common() { }

Common.prototype.getViewParams = function (sessionID, searchTerm, page, length, callback) {
    common_auth.basic(sessionID, function (reply) {
        if (reply.err) {
            callback(
                '/login',
                {},
                "redirect"
            );
        }
        else {
            let indexParams = {
                searchURL: '/sociedades/buscar',
                searchTerm: searchTerm,
                userNameSurname: reply.user.name,
                userImage: reply.user.image,
                userType: reply.user.type,
                userId: reply.user.id,
                societies: [],
                page: parseInt(page),
                length: parseInt(length),
            };

            connection.query(
                `
                    SELECT 
                        societies_complete.societyId AS id,
                        societies_complete.societyCompany AS company,
                        societies_complete.societyName AS name,
                        societies_complete.societyRut AS rut,
                        societies_complete.societyImage AS image
                    FROM societies_complete
                    WHERE
                        CONCAT (
                            societies_complete.societyId, " ",
                            societies_complete.societyCompany, " ",
                            societies_complete.societyName, " ",
                            societies_complete.societyRut
                        ) LIKE CONCAT("%",?,"%")
                    ORDER BY CONCAT(societies_complete.societyName, " ", societies_complete.societyCompany) ASC
                    LIMIT ?, ?
                `,
                [
                    searchTerm,
                    (indexParams.page - 1) * indexParams.length < 0 ? 0 : (indexParams.page - 1) * indexParams.length,
                    indexParams.length,
                ],
                function (err, results) {
                    indexParams.societies = [];
                    if (err) {
                        console.log(err);
                    }
                    else if (results.length) {
                        indexParams.societies = results;
                    }
                    callback(
                        'societies/list',
                        indexParams,
                        "render"
                    );
                }
            );
        }
    });
};

module.exports = new Common();