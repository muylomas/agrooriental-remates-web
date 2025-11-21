const connection = require('../connection_db');
const common_auth = require('../common_auth');
const common_societies = require('./common');

function Common() { }

Common.prototype.getViewParams = function (sessionID, societyId, callback) {
    common_auth.basic(sessionID, function (reply) {
        if (reply.err) {
            callback(
                '/login',
                {},
                "redirect"
            );
        }
        else {
            common_societies.getViewParamsTemplate(
                reply.user,
                function (returnIndexParams) {
                    let indexParams = returnIndexParams;
                    connection.query(
                        `
                            SELECT 
                                societies_complete.*,
                                customers.id AS customerId,
                                customers.name AS customerName,
                                customers.surname AS customerSurname,
                                IF(
                                    customers.image IS NULL OR customers.image = "",
                                    "https://mercadoagro-backoffice.s3.amazonaws.com/images/customers/no-profile-img.png",
                                    customers.image
                                ) AS customerImage,
                                customers_types.name AS customerType
                            FROM societies_complete
                            INNER JOIN clients_societies ON clients_societies.societyId = societies_complete.societyId AND clients_societies.status = 1
                            INNER JOIN clients_customers ON clients_customers.clientId = clients_societies.clientId AND clients_customers.status = 1
                            INNER JOIN customers ON customers.id = clients_customers.customerId
                            INNER JOIN customers_types ON customers_types.id = customers.type
                            WHERE societies_complete.societyId = ?
                        `,
                        [
                            societyId,
                        ],
                        function (err, results) {
                            indexParams.society = {};
                            if (err) {
                                console.log(err);
                            }
                            else if (results.length) {
                                indexParams.society = results[0];
                                indexParams.society.customers = [];
                                for (let index in results) {
                                    indexParams.society.customers.push(
                                        {
                                            id: results[index].customerId,
                                            name: results[index].customerName,
                                            surname: results[index].customerSurname,
                                            image: results[index].customerImage,
                                            type: results[index].customerType
                                        }
                                    );
                                }
                            }

                            if (indexParams.society.societyId) {
                                callback(
                                    'societies/profile',
                                    indexParams,
                                    "render"
                                );
                            }
                            else {
                                callback(
                                    '/sociedades',
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