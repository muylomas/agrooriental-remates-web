const connection = require('../connection_db');
const common_auth = require('../common_auth');

function Common() { }

Common.prototype.getViewParams = function (sessionID, searchTerm, page, length, callback) {
    common_auth.basic(sessionID, function (reply) {
        if (reply.err) {
            callback(
                '/login',
                {},
                "redirect",
            );
        }
        else {
            let indexParams = {
                searchURL: '/ganado/lotes/buscar',
                searchTerm: searchTerm,
                userNameSurname: reply.user.name,
                userImage: reply.user.image,
                userType: reply.user.type,
                userId: reply.user.id,
                lots: [],
                page: parseInt(page),
                length: parseInt(length),
            };

            connection.query(
                `
                    SELECT 
                        cattle_complete.*,
                        cattle_totals.quantity AS totalQuantity,
                        cattle_totals.females AS females
                    FROM cattle_complete
                    LEFT JOIN cattle_totals ON cattle_totals.lotId = cattle_complete.lotId
                    WHERE
                        CONCAT (
                            cattle_complete.type, " ",
                            cattle_complete.explanations, " ",
                            cattle_complete.farmName, " ",
                            cattle_complete.farmDicose, " ",
                            cattle_complete.addressStreet
                        ) LIKE CONCAT("%",?,"%")
                    ORDER BY CONCAT(cattle_complete.lotId) DESC
                    LIMIT ?, ?
                `,
                [
                    searchTerm,
                    (indexParams.page - 1) * indexParams.length < 0 ? 0 : (indexParams.page - 1) * indexParams.length,
                    indexParams.length,
                ],
                function (err, results) {
                    indexParams.cattle = [];
                    if (err) {
                        console.log(err);
                    }
                    else if (results.length) {
                        indexParams.lots = results;
                    }
                    callback(
                        'cattle/list',
                        indexParams,
                        "render",
                    );
                }
            );
        }
    });
};

module.exports = new Common();