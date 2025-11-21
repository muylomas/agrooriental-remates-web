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
                searchURL: '/establecimientos/buscar',
                searchTerm: searchTerm,
                userNameSurname: reply.user.name,
                userImage: reply.user.image,
                userType: reply.user.type,
                userId: reply.user.id,
                farms: [],
                page: parseInt(page),
                length: parseInt(length),
            };

            connection.query(
                `
                    SELECT 
                        farms_complete.farmId AS id,
                        farms_complete.farmName AS name,
                        farms_complete.farmImage AS image,
                        IF(
                            farms_types.name IS NULL,
                            "-",
                            farms_types.name
                        ) AS type,
                        IF(
                            farms_exploitations.name IS NULL,
                            "-",
                            farms_exploitations.name
                        ) AS exploitation
                    FROM farms_complete
                    LEFT JOIN farms_types ON farms_types.id = farms_complete.farmType
                    LEFT JOIN farms_exploitations ON farms_exploitations.id = farms_complete.farmType
                    WHERE
                        CONCAT (
                            farms_complete.farmId, " ",
                            farms_complete.farmName, " ",
                            farms_types.name, " ",
                            farms_exploitations.name
                        ) LIKE CONCAT("%",?,"%")
                    ORDER BY CONCAT(farms_complete.farmName) ASC
                    LIMIT ?, ?
                `,
                [
                    searchTerm,
                    (indexParams.page - 1) * indexParams.length < 0 ? 0 : (indexParams.page - 1) * indexParams.length,
                    indexParams.length,
                ],
                function (err, results) {
                    indexParams.farms = [];
                    if (err) {
                        console.log(err);
                    }
                    else if (results.length) {
                        indexParams.farms = results;
                    }
                    callback(
                        'farms/list',
                        indexParams,
                        "render"
                    );
                }
            );
        }
    });
};

module.exports = new Common();