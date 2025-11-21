const connection = require('../../connection_db');
const common_auth = require('../../common_auth');

function Common() { }

Common.prototype.getByCustomerId = function (sessionID, customerId, callback) {
    common_auth.basic(sessionID, function (reply) {
        if (reply.err) {
            callback([]);
        }
        else {
            let farms = [];

            connection.query(
                `
                    SELECT 
                        farms_complete.*,
                        IF( 
                            farms_complete.farmImage IS NULL OR farms_complete.farmImage = "",
                            "https://mercadoagro-backoffice.s3.amazonaws.com/images/farms/no-profile-img.png",
                            farms_complete.farmImage 
                        ) AS farmImageNotNull
                    FROM farms_complete 
                    INNER JOIN clients_farms ON clients_farms.farmId = farms_complete.farmId AND clients_farms.status = 1
                    INNER JOIN clients_customers ON clients_customers.clientId = clients_farms.clientId AND clients_customers.status = 1
                    INNER JOIN customers_complete ON customers_complete.customerId = clients_customers.customerId 
                    WHERE 
                        customers_complete.customerId = ? 
                    GROUP BY farms_complete.farmId
                `,
                [
                    customerId,
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