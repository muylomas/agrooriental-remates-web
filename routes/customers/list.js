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
                searchURL: '/personas/buscar',
                searchTerm: searchTerm,
                userNameSurname: reply.user.name,
                userImage: reply.user.image,
                userType: reply.user.type,
                userId: reply.user.id,
                customers: [],
                page: parseInt(page),
                length: parseInt(length),
            };

            connection.query(
                `
                    SELECT 
                        customers_complete.customerId AS id,
                        customers_complete.customerEmail AS email,
                        customers_complete.customerName AS name,
                        customers_complete.customerSurname AS surname,
                        customers_complete.customerImage AS image,
                        customers_types.name AS type
                    FROM customers_complete
                    INNER JOIN customers_types ON customers_types.id = customers_complete.customerType
                    WHERE
                        CONCAT (
                            customers_complete.customerId, " ",
                            customers_complete.customerEmail, " ",
                            customers_complete.customerName, " ",
                            customers_complete.customerSurname, " ",
                            customers_types.name
                        ) LIKE CONCAT("%",?,"%") 
                    ORDER BY CONCAT(customers_complete.customerName, " ", customers_complete.customerSurname) ASC
                    LIMIT ?, ?
                `,
                [
                    searchTerm,
                    (indexParams.page - 1) * indexParams.length < 0 ? 0 : (indexParams.page - 1) * indexParams.length,
                    indexParams.length,
                ],
                function (err, results) {
                    indexParams.customers = [];
                    if (err) {
                        console.log(err);
                    }
                    else if (results.length) {
                        indexParams.customers = results;
                    }
                    callback(
                        'customers/list',
                        indexParams,
                        "render"
                    );
                }
            );
        }
    });
};

module.exports = new Common();