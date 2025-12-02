const connection = require('../connection_db');
const addresses = require('../addresses');

function Common() { }

Common.prototype.getCustomersTypes = function (callback) {
    customersTypes = [];

    connection.query(
        `
            SELECT *
            FROM customers_types
        `,
        function (err, results) {
            if (err) {
                console.log(err);
            }
            else {
                customersTypes = results;
            }

            callback(customersTypes);
        }
    );
};

function getViewStaticData(viewParams, callback) {
    addresses.getCountries(
        function (returnCountries) {
            viewParams.countries = returnCountries;
            Common.prototype.getCustomersTypes(
                function (returnCustomersTypes) {
                    viewParams.customersTypes = returnCustomersTypes;
                    callback(viewParams);
                }
            );
        }
    );
};

Common.prototype.getViewParamsTemplate = function (user, callback) {
    let indexParams = {
        userNameSurname: user.name,
        userImage: user.image,
        userType: user.type,
        userId: user.id,
        searchURL: '/personas/buscar',
        error: {
            msj: false,
            type: "success",
            customer: 0,
        },
        customer: {},
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

Common.prototype.getCustomerById = function (customerId, callback) {
    let customer = {
        societies: [],
        farms: [],
    };

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
                farms_complete.addressLatitude AS farmAddressLatitude,
                farms_complete.addressLongitude AS farmAddressLongitude,
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
            if (err) {
                console.log(err);
            }
            else if (results.length) {
                customer = results[0];
                customer.societies = [];
                customer.farms = [];

                var __aux_societies_ids = [];
                var __aux_societies = [];
                var __aux_farms_ids = [];
                var __aux_farms = [];
                for (let index in results) {
                    if (results[index].societyId && !__aux_societies_ids.includes(results[index].societyId)) {
                        __aux_societies_ids.push(results[index].societyId);
                        __aux_societies.push({
                            id: results[index].societyId,
                            name: results[index].societyName,
                            image: results[index].societyImage,
                            location: results[index].societyAddressLocationName,
                            state: results[index].societyAddressStateName,
                        });
                    }
                    if (results[index].farmId && !__aux_farms_ids.includes(results[index].farmId)) {
                        __aux_farms_ids.push(results[index].farmId);
                        __aux_farms.push({
                            id: results[index].farmId,
                            name: results[index].farmName,
                            image: results[index].farmImage,
                            location: results[index].farmAddressLocationName,
                            state: results[index].farmAddressStateName,
                            latitude: results[index].farmAddressLatitude,
                            longitude: results[index].farmAddressLongitude,
                        });
                    }
                }

                customer.societies = __aux_societies;
                customer.farms = __aux_farms;
            }

            callback(customer);
        }
    );
};

module.exports = new Common();