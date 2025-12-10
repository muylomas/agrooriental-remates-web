const connection = require('../connection_db');
const common_auth = require('../common_auth');
const common_customer = require('./common');
function Common() { }

Common.prototype.getViewParams = function (sessionID, callback) {
    common_auth.basic(sessionID, function (reply) {
        if (reply.err) {
            callback(
                '/login',
                {},
                "redirect"
            );
        }
        else {
            let customerId = reply.user.id;
            let indexParams = {
                customersNidTypes: [],
            };

            common_customer.getCustomersNidTypes(
                function (customersNidTypes) {
                    indexParams.customersNidTypes = customersNidTypes;
                    connection.query(
                        `
                            SELECT 
                                customers_complete.*,
                                farms_complete.farmId AS farmId,
                                farms_complete.farmName AS farmName,
                                IF( 
                                    farms_complete.farmImage IS NULL OR farms_complete.farmImage = "",
                                    "https://agro-oriental-remates.s3.us-west-1.amazonaws.com/images/farms/no-profile-img.png",
                                    farms_complete.farmImage 
                                ) AS farmImage,
                                farms_complete.addressLocationName AS farmAddressLocationName,
                                farms_complete.addressStateName AS farmAddressStateName,
                                societies_complete.societyId AS societyId,
                                societies_complete.societyName AS societyName,
                                IF(
                                    societies_complete.societyImage IS NULL OR societies_complete.societyImage = "",
                                    "https://agro-oriental-remates.s3.us-west-1.amazonaws.com/images/societies/no-profile-img.png",
                                    societies_complete.societyImage
                                ) AS societyImage,
                                societies_complete.addressLocationName AS societyAddressLocationName,
                                societies_complete.addressStateName AS societyAddressStateName
                            FROM customers_complete
                            LEFT JOIN clients_customers ON clients_customers.customerId = customers_complete.customerId AND clients_customers.status = 1
                            LEFT JOIN clients_societies ON clients_societies.clientId = clients_customers.clientId AND clients_societies.status = 1
                            LEFT JOIN clients_farms ON clients_farms.clientId = clients_customers.clientId AND clients_farms.status = 1
                            LEFT JOIN societies_complete ON societies_complete.societyId = clients_societies.societyId
                            LEFT JOIN farms_complete ON farms_complete.farmId = clients_farms.farmId
                            WHERE customers_complete.customerId = ?
                            GROUP BY CONCAT(farms_complete.farmId, "-", societies_complete.societyId)
                        `,
                        [
                            customerId,
                        ],
                        function (err, results) {
                            indexParams.customer = {};
                            if (err) {
                                console.log(err);
                            }
                            else if (results.length) {
                                indexParams.customer = results[0];
                                let __aux_societiesLength = 0;
                                let __aux_societies = {};
                                for (let index in results) {
                                    if (results[index].societyId && !(results[index].societyId in __aux_societies)) {
                                        ++__aux_societiesLength;
                                        __aux_societies[results[index].societyId] = {
                                            id: results[index].societyId,
                                            name: results[index].societyName,
                                            image: results[index].societyImage,
                                            location: results[index].societyAddressLocationName,
                                            state: results[index].societyAddressStateName,
                                            farms: {},
                                        };
                                    }

                                    if (results[index].farmId && !(results[index].farmId in __aux_societies[results[index].societyId].farms)) {
                                        __aux_societies[results[index].societyId].farms[results[index].farmId] = {
                                            id: results[index].farmId,
                                            name: results[index].farmName,
                                            image: results[index].farmImage,
                                            location: results[index].farmAddressLocationName,
                                            state: results[index].farmAddressStateName,
                                        };
                                    }
                                }

                                indexParams.customer.societiesLength = __aux_societiesLength;
                                indexParams.customer.societies = __aux_societies;
                            }

                            if (indexParams.customer.customerId) {
                                callback(
                                    'customers/profile',
                                    indexParams,
                                    "render"
                                );
                            }
                            else {
                                callback(
                                    '/',
                                    {},
                                    "redirect"
                                );
                            }
                        }
                    );
                }
            );
        }
    });
};

module.exports = new Common();