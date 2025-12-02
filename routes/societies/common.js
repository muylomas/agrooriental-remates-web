const connection = require('../connection_db');
const addresses = require('../addresses');

function Common() { }

function getViewStaticData(viewParams, callback) {
    addresses.getCountries(
        function (returnCountries) {
            viewParams.countries = returnCountries;
            callback(viewParams);
        }
    );
};

Common.prototype.getViewParamsTemplate = function (user, callback) {
    let indexParams = {
        userNameSurname: user.name,
        userImage: user.image,
        userType: user.type,
        userId: user.id,
        searchURL: '/sociedades/buscar',
        error: {
            msj: false,
            type: "success",
            customer: 0,
        },
        society: {
            customers: [],
        },
        countries: [],
    };

    getViewStaticData(
        indexParams,
        function (returnIndexParams) {
            indexParams = returnIndexParams;
            callback(
                indexParams,
            );
        }
    );

};

Common.prototype.customersFielsIntoArray = function (fields, callback) {
    let customers = [];
    let customersId = [];
    let customersIdString = [];
    for (let index in fields) {
        if (index.indexOf("customers_") != -1) {
            customersId.push(fields[index]);
            customersIdString.push("?");
        }
    }
    if (customersId.length) {
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
            WHERE customers_complete.customerId IN (` + customersIdString.join() + `)
        `,
            customersId,
            function (err, results) {
                if (err) {
                    console.log(err);
                }
                else if (results.length) {
                    customers = results;
                }

                callback(customers);
            }
        );
    }
    else
        callback(customers);
};

module.exports = new Common();