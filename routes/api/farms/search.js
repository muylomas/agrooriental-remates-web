const connection = require('../../connection_db');
const common_auth = require('../../common_auth');

function Common() { }

Common.prototype.byString = function (sessionID, farmString, callback) {
    common_auth.basic(sessionID, function (reply) {
        if (reply.err) {
            callback([]);
        }
        else {
            let farms = [];

            connection.query(
                `
                    SELECT 
                        farms_complete.farmId AS id,
                        farms_complete.farmName AS name,
                        farms_complete.farmDicose AS dicose,
                        farms_types.name AS type, 
                        farms_exploitations.name AS exploitation, 
                        societies_complete.societyId AS societyId,
                        societies_complete.societyCompany AS societyCompany,
                        societies_complete.societyName AS societyName,
                        societies_complete.societyRut AS societyRut,
                        IF( 
                            societies_complete.societyImage IS NULL OR societies_complete.societyImage = "",
                            "https://mercadoagro-backoffice.s3.amazonaws.com/images/societies/no-profile-img.png",
                            societies_complete.societyImage 
                        ) AS image 
                    FROM farms_complete 
                    INNER JOIN farms_types ON farms_types.id = farms_complete.farmType 
                    INNER JOIN farms_exploitations ON farms_exploitations.id = farms_complete.farmExploitation 
                    LEFT JOIN clients_farms ON clients_farms.farmId = farms_complete.farmId AND clients_farms.status = 1
                    LEFT JOIN clients_societies ON clients_societies.clientId = clients_farms.clientId AND clients_societies.status = 1
                    LEFT JOIN societies_complete ON societies_complete.societyId = clients_societies.societyId
                    WHERE 
                        CONCAT ( 
                            farms_complete.farmId, " ",
                            farms_complete.farmName, " ",
                            farms_complete.farmDicose, " ",
                            farms_types.name, " ",
                            farms_exploitations.name,
                            societies_complete.societyId, " ",
                            societies_complete.societyCompany, " ",
                            societies_complete.societyName, " ",
                            societies_complete.societyRut
                        ) LIKE CONCAT("%",?,"%") 
                    GROUP BY CONCAT(farms_complete.farmId, societies_complete.societyId)
                    LIMIT 0,10
                `,
                [
                    farmString,
                ],
                function (err, results) {
                    if (err) {
                        console.log(err);
                    }
                    else {
                        farms = results;
                    }

                    callback(farms)
                }
            );
        }
    });
};

module.exports = new Common();