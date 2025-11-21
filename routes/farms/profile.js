const connection = require('../connection_db');
const common_auth = require('../common_auth');
const common_farms = require('./common');
const { fillColor } = require('pdfkit');

function getCattle(farmId, callback) {
    let __aux_farms = [];
    connection.query(
        `
            SELECT 
                cattle_complete.*,
                cattle_totals.quantity AS totalQuantity,
                cattle_totals.females AS females
            FROM cattle_complete
            LEFT JOIN cattle_totals ON cattle_totals.lotId = cattle_complete.lotId
            WHERE cattle_complete.farmId = ?
            ORDER BY CONCAT(cattle_complete.lotId) DESC
        `,
        [
            farmId,
        ],
        function (err, results) {
            if (err) {
                console.log(err);
            }
            else if (results.length) {
                __aux_farms = results;
            }
            callback(__aux_farms);
        }
    );
};

function Common() { }

Common.prototype.getViewParams = function (sessionID, farmId, callback) {
    common_auth.basic(sessionID, function (reply) {
        if (reply.err) {
            callback(
                '/login',
                {},
                "redirect"
            );
        }
        else {
            common_farms.getViewParamsTemplate(
                reply.user,
                function (returnIndexParams) {
                    let indexParams = returnIndexParams;
                    connection.query(
                        `
                            SELECT 
                                farms_complete.*,
                                societies.id AS societyId,
                                societies.name AS societyName,
                                societies.company AS societyCompany,
                                societies.rut AS societyRut,
                                IF(
                                    societies.image IS NULL OR societies.image = "",
                                    "https://mercadoagro-backoffice.s3.amazonaws.com/images/societies/no-profile-img.png",
                                    societies.image
                                ) AS societyImage,
                                customers_complete.customerId AS customerId,
                                customers_complete.customerName AS customerName,
                                customers_complete.customerSurname AS customerSurname,
                                IF(
                                    customers_complete.customerImage IS NULL OR customers_complete.customerImage = "",
                                    "https://mercadoagro-backoffice.s3.amazonaws.com/images/customers/no-profile-img.png",
                                    customers_complete.customerImage
                                ) AS customerImage,
                                customers_complete.customerType AS customerType
                            FROM farms_complete
                            LEFT JOIN clients_farms ON clients_farms.farmId = farms_complete.farmId AND clients_farms.status = 1
                            LEFT JOIN clients_societies ON clients_societies.clientId = clients_customers.clientId AND clients_societies.status = 1
                            LEFT JOIN clients_customers ON clients_customers.clientId = clients_customers.clientId AND clients_customers.status = 1
                            LEFT JOIN societies_complete ON societies_complete.societyId = clients_societies.societyId
                            LEFT JOIN customers_complete ON customers_complete.customerId = clients_customers.customerId
                            WHERE farms_complete.farmId = ?
                        `,
                        [
                            farmId,
                        ],
                        function (err, results) {
                            indexParams.farm = {};
                            if (err) {
                                console.log(err);
                            }
                            else if (results.length) {
                                indexParams.farm = results[0];
                                indexParams.farm.societies = {};
                                indexParams.farm.societiesId = [];
                                for (let index in results) {
                                    if (!indexParams.farm.societiesId.includes(results[index].societyId)) {
                                        indexParams.farm.societiesId.push(results[index].societyId);
                                        indexParams.farm.societies[results[index].societyId] =
                                        {
                                            id: results[index].societyId,
                                            name: results[index].societyName,
                                            company: results[index].societyCompany,
                                            image: results[index].societyImage,
                                            rut: results[index].societyRut,
                                            customers: [],
                                            customersIds: [],
                                        };
                                    }

                                    if (!indexParams.farm.societies[results[index].societyId].customersIds.includes(results[index].customerId)) {
                                        indexParams.farm.societies[results[index].societyId].customersIds.push(results[index].customerId);
                                        indexParams.farm.societies[results[index].societyId].customers.push(
                                            {
                                                id: results[index].customerId,
                                                name: results[index].customerName,
                                                surname: results[index].customerSurname,
                                                image: results[index].customerImage,
                                                type: results[index].customerType,
                                            }
                                        );
                                    }
                                }
                            }

                            getCattle(
                                farmId,
                                function (resultCattle) {
                                    indexParams.farm.lots = resultCattle;

                                    if (indexParams.farm.farmId) {
                                        callback(
                                            'farms/profile',
                                            indexParams,
                                            "render"
                                        );
                                    }
                                    else {
                                        callback(
                                            '/establecimientos',
                                            {},
                                            "redirect"
                                        );
                                    }
                                });
                        }
                    );
                }
            );
        }
    });
};

module.exports = new Common();