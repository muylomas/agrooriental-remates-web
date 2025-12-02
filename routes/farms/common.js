const connection = require('../connection_db');
const addresses = require('../addresses');

function Common() { }

Common.prototype.getFarmsExploitations = function (callback) {
    farmsExploitations = [];

    connection.query(
        `
            SELECT *
            FROM farms_exploitations
        `,
        function (err, results) {
            if (err) {
                console.log(err);
            }
            else {
                farmsExploitations = results;
            }

            callback(farmsExploitations);
        }
    );
};

Common.prototype.getFarmsTypes = function (callback) {
    farmsTypes = [];

    connection.query(
        `
            SELECT *
            FROM farms_types
        `,
        function (err, results) {
            if (err) {
                console.log(err);
            }
            else {
                farmsTypes = results;
            }

            callback(farmsTypes);
        }
    );
};

function getViewStaticData(viewParams, callback) {
    addresses.getCountries(
        function (returnCountries) {
            viewParams.countries = returnCountries;
            Common.prototype.getFarmsTypes(
                function (returnFarmsTypes) {
                    viewParams.farmsTypes = returnFarmsTypes;
                    Common.prototype.getFarmsExploitations(
                        function (returnFarmsExploitations) {
                            viewParams.farmsExploitations = returnFarmsExploitations;
                            callback(viewParams);
                        }
                    );
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
        searchURL: '/establecimientos/buscar',
        error: {
            msj: false,
            type: "success",
            society: 0,
        },
        farm: {
            societies: [],
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

Common.prototype.societiesFielsIntoArray = function (fields, callback) {
    let societies = [];
    let societiesId = [];
    let societiesIdString = [];
    for (let index in fields) {
        if (index.indexOf("societies_") != -1) {
            societiesId.push(fields[index]);
            societiesIdString.push("?");
        }
    }
    if (societiesId.length) {
        connection.query(
            `
            SELECT 
                societies_complete.societyId AS id,
                societies_complete.societyName AS name,
                societies_complete.societyCompany AS company,
                societies_complete.societyRut AS rut,
                IF(
                    societies_complete.societyImage IS NULL OR societies_complete.societyImage = "",
                    "https://agro-oriental-remates.s3.us-west-1.amazonaws.com/images/societies/no-profile-img.png",
                    societies_complete.societyImage
                ) AS image
            FROM societies_complete 
            WHERE societies_complete.societyId IN (` + societiesIdString.join() + `)
        `,
            societiesId,
            function (err, results) {
                if (err) {
                    console.log(err);
                }
                else if (results.length) {
                    societies = results;
                }

                callback(societies);
            }
        );
    }
    else
        callback(societies);
};

module.exports = new Common();