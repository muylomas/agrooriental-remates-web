const connection = require('../connection_db');

const noFarmId = 16;

const auctionPriceType = [
    {
        id: 1,
        name: "Precio al kilo",
    },
    {
        id: 2,
        name: "Precio al bulto",
    }
];

const seasons = [
    {
        id: "verano",
        name: "verano",
    },
    {
        id: "otoño",
        name: "otoño",
    },
    {
        id: "invierno",
        name: "invierno",
    },
    {
        id: "primavera",
        name: "primavera",
    },
];

function Common() { }

Common.prototype.getCattleBreeds = function (callback) {
    cattleBreeds = [];

    connection.query(
        `
            SELECT cattle_breeds.*
            FROM cattle_breeds
            WHERE cattle_breeds.id < 1000
            ORDER BY name ASC
        `,
        function (err, results) {
            if (err) {
                console.log(err);
            }
            else {
                cattleBreeds = results;
            }

            callback(cattleBreeds);
        }
    );
};

Common.prototype.getCattleTypes = function (callback) {
    cattleTypes = [];

    connection.query(
        `
            SELECT *
            FROM cattle_types
            ORDER BY sort ASC
        `,
        function (err, results) {
            if (err) {
                console.log(err);
            }
            else {
                cattleTypes = results;
            }

            callback(cattleTypes);
        }
    );
};

Common.prototype.getCattleFeeding = function (callback) {
    cattleTypes = [];

    connection.query(
        `
            SELECT *
            FROM cattle_feeding
        `,
        function (err, results) {
            if (err) {
                console.log(err);
            }
            else {
                cattleTypes = results;
            }

            callback(cattleTypes);
        }
    );
};

Common.prototype.getCattleTeeths = function (callback) {
    cattleTeeths = [];

    connection.query(
        `
            SELECT *
            FROM cattle_teeths
        `,
        function (err, results) {
            if (err) {
                console.log(err);
            }
            else {
                cattleTeeths = results;
            }

            callback(cattleTeeths);
        }
    );
};

Common.prototype.getCattlePaymentTerms = function (callback) {
    cattleTypes = [];

    connection.query(
        `
            SELECT *
            FROM cattle_payment_term
        `,
        function (err, results) {
            if (err) {
                console.log(err);
            }
            else {
                cattleTypes = results;
            }

            callback(cattleTypes);
        }
    );
};

Common.prototype.getCattleAgeUnits = function (callback) {
    cattleAgeUnits = [];

    connection.query(
        `
            SELECT *
            FROM cattle_age_units
        `,
        function (err, results) {
            if (err) {
                console.log(err);
            }
            else {
                cattleAgeUnits = results;
            }

            callback(cattleAgeUnits);
        }
    );
};

Common.prototype.getCattleReproductiveStatus = function (callback) {
    cattleReproductiveStatus = [];

    connection.query(
        `
            SELECT *
            FROM cattle_reproductive_status
        `,
        function (err, results) {
            if (err) {
                console.log(err);
            }
            else {
                cattleReproductiveStatus = results;
            }

            callback(cattleReproductiveStatus);
        }
    );
};

Common.prototype.getCattlePregnancyDiagnosis = function (callback) {
    cattlePregnancyDiagnosis = [];

    connection.query(
        `
            SELECT *
            FROM cattle_pregnancy_diagnosis
        `,
        function (err, results) {
            if (err) {
                console.log(err);
            }
            else {
                cattlePregnancyDiagnosis = results;
            }

            callback(cattlePregnancyDiagnosis);
        }
    );
};

Common.prototype.getCattleRatings = function (callback) {
    cattleRatings = [];

    connection.query(
        `
            SELECT *
            FROM cattle_ratings
            ORDER BY id DESC
        `,
        function (err, results) {
            if (err) {
                console.log(err);
            }
            else {
                cattleRatings = results;
            }

            callback(cattleRatings);
        }
    );
};

Common.prototype.getCattleStatusArray = function (callback) {
    let cattleStatus = [];

    connection.query(
        `
            SELECT *
            FROM cattle_status
            ORDER BY sort ASC, id ASC
        `,
        function (err, results) {
            if (err) {
                console.log(err);
            }
            else if (results.length) {
                cattleStatus = results;
            }

            callback(cattleStatus);
        }
    );
};

function getViewStaticData(viewParams, callback) {
    Common.prototype.getCattleTypes(
        function (returnCattleTypes) {
            viewParams.cattleTypes = returnCattleTypes;
            Common.prototype.getCattleBreeds(
                function (returnCattleBreed) {
                    viewParams.cattleBreeds = returnCattleBreed;
                    Common.prototype.getCattleTeeths(
                        function (returnCattleTeeths) {
                            viewParams.cattleTeeths = returnCattleTeeths;
                            Common.prototype.getCattleFeeding(
                                function (returnCattleFeeding) {
                                    viewParams.cattleFeeding = returnCattleFeeding;
                                    Common.prototype.getCattlePaymentTerms(
                                        function (returnCattlePaymentTerms) {
                                            viewParams.cattlePaymentTerms = returnCattlePaymentTerms;
                                            Common.prototype.getCattleAgeUnits(
                                                function (returnCattleAgeUnits) {
                                                    viewParams.cattleAgeUnits = returnCattleAgeUnits;
                                                    Common.prototype.getCattleReproductiveStatus(
                                                        function (returnCattleReproductiveStatus) {
                                                            viewParams.cattleReproductiveStatus = returnCattleReproductiveStatus;
                                                            Common.prototype.getCattlePregnancyDiagnosis(
                                                                function (returnCattlePregnancyDiagnosis) {
                                                                    viewParams.cattlePregnancyDiagnosis = returnCattlePregnancyDiagnosis;
                                                                    Common.prototype.getCattleRatings(
                                                                        function (returnCattleRatings) {
                                                                            viewParams.cattleRatings = returnCattleRatings;
                                                                            Common.prototype.getCattleStatusArray(
                                                                                function (returnCattleStatus) {
                                                                                    viewParams.cattleStatus = returnCattleStatus;
                                                                                    viewParams.seasons = seasons;
                                                                                    viewParams.auctionPriceType = auctionPriceType;
                                                                                    callback(viewParams);
                                                                                }
                                                                            );
                                                                        }
                                                                    );
                                                                }
                                                            );
                                                        }
                                                    );
                                                }
                                            );
                                        }
                                    );
                                }
                            );
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
        userDeskId: user.deskId,
        searchURL: '/ganado/buscar',
        error: {
            msj: false,
            type: "success",
            farm: 0,
        },
        lot: {
            farms: [],
            salesagents: [],
        },
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

Common.prototype.farmsFielsIntoArray = function (fields, callback) {
    let farms = [];
    let societiesId = [0];
    let societiesIdString = ["?"];
    let farmsId = [];
    let farmsIdString = [];

    if ("customerFarmSelect" in fields && fields.customerFarmSelect && parseInt(fields.customerFarmSelect)) {
        farmsId.push(fields.customerFarmSelect);
        farmsIdString.push("?");
    }
    else {
        for (let index in fields) {
            if (index.indexOf("farms_") != -1) {
                if (fields[index.replace("farms_", "society_")]) {
                    societiesId.push(fields[index.replace("farms_", "society_")]);
                    societiesIdString.push("?");
                }

                farmsId.push(fields[index]);
                farmsIdString.push("?");
            }
        }
    }

    if (!farmsId.length) {
        farmsId.push(noFarmId);
        farmsIdString.push("?");
    }

    if (farmsId.length) {
        connection.query(
            `
                SELECT 
                    farms_complete.farmId AS id,
                    farms_complete.farmName AS name,
                    IF(
                        farms_complete.farmImage IS NULL OR farms_complete.farmImage = "",
                        "https://agro-oriental-remates.s3.us-west-1.amazonaws.com/images/farms/no-profile-img.png",
                        farms_complete.farmImage
                    ) AS image,
                    societies_complete.societyId AS societyId,
                    societies_complete.societyName AS societyName,
                    societies_complete.societyCompany AS societyCompany
                FROM farms_complete 
                LEFT JOIN societies_complete ON societies_complete.societyId IN (` + societiesIdString.join() + `)
                WHERE farms_complete.farmId IN (` + farmsIdString.join() + `)
            `,
            societiesId.concat(farmsId),
            function (err, results) {
                if (err) {
                    console.log(err);
                }
                else if (results.length) {
                    farms = results;
                }

                callback(farms);
            }
        );
    }
    else
        callback(farms);

};

Common.prototype.breedQuantityIntoArray = function (fields) {
    let breedQuantity = [];
    for (let index in fields) {
        if (index.indexOf("breedId_") != -1) {
            let indexIntoNumber = index.replace("breedId_", "");
            if (("breedQuantity_" + indexIntoNumber) in fields && fields["breedQuantity_" + indexIntoNumber]) {
                breedQuantity.push({
                    breedId: fields["breedId_" + indexIntoNumber],
                    crossBreedId: fields["breedId_cross_" + indexIntoNumber],
                    quantity: parseInt(fields["breedQuantity_" + indexIntoNumber]),
                    females: parseInt(fields["breedFemales_" + indexIntoNumber]),
                });
            }
        }
    }

    return breedQuantity;
};

Common.prototype.teethQuantityIntoArray = function (fields) {
    let teethQuantity = [];
    for (let index in fields) {
        if (index.indexOf("teethId_") != -1) {
            let indexIntoNumber = index.replace("teethId_", "");
            if (("teethQuantity_" + indexIntoNumber) in fields && fields["teethQuantity_" + indexIntoNumber]) {
                teethQuantity.push({
                    id: fields["teethId_" + indexIntoNumber],
                    quantity: parseInt(fields["teethQuantity_" + indexIntoNumber]),
                });
            }
        }
    }

    return teethQuantity;
};

Common.prototype.ageQuantityIntoArray = function (fields) {
    let ageQuantity = [];
    for (let index in fields) {
        if (index.indexOf("ageId_") != -1) {
            let indexIntoNumber = index.replace("ageId_", "");
            if (("ageQuantity_" + indexIntoNumber) in fields && fields["ageQuantity_" + indexIntoNumber]) {
                ageQuantity.push({
                    id: fields["ageId_" + indexIntoNumber],
                    quantity: parseInt(fields["ageQuantity_" + indexIntoNumber]),
                });
            }
        }
    }

    return ageQuantity;
};

Common.prototype.salesagentsFielsIntoArray = function (fields) {
    let salesagents = [];
    for (let index in fields) {
        if (index.indexOf("salesagents_") != -1 && fields[index] && !salesagents.includes(fields[index])) {
            salesagents.push(fields[index]);
        }
    }

    return salesagents;
};

module.exports = new Common();