const connection = require('../../connection_db');
const common_auth = require('../../common_auth');

function Common() { }

Common.prototype.byString = function (sessionID, customerString, callback) {
    common_auth.basic(sessionID, function (reply) {
        if (reply.err) {
            callback([]);
        }
        else {
            let customers = [];
            connection.query(
                `
                    SELECT 
                        customers_complete.customerId AS id,
                        customers_complete.customerName AS name,
                        customers_complete.customerSurname AS surname,
                        IF(
                            customers_complete.customerImage IS NULL OR customers_complete.customerImage = "",
                            "https://agro-oriental-remates.s3.us-west-1.amazonaws.com/images/customers/no-profile-img.png",
                            customers_complete.customerImage
                        ) AS image,
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
                    LIMIT 0,10
                `,
                [
                    customerString,
                ],
                function (err, results) {
                    if (err) {
                        console.log(err);
                    }
                    else {
                        customers = results;
                    }

                    callback(customers)
                }
            );
        }
    });
};

module.exports = new Common();