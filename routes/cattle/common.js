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

Common.prototype.getCompleteLot = function (lotId, callback) {
    let outputLot = {
        lotId: false,
    };

    connection.query(
        `
            SELECT 
                cattle_complete.*,
                users_desks.name AS salesagentDeskName,
                DATE_FORMAT(
                    cattle_complete.weightDate,
                    '%d/%m/%Y'
                ) AS weightDateFormated,
                cattle_complete.farmImage AS farmImageFinal,
                DATE_FORMAT(
                    cattle_complete.auctionStart,
                    '%Y-%m-%dT%H:%i:%s'
                ) AS auctionStartString,
                DATE_FORMAT(
                    cattle_complete.auctionEnd,
                    '%Y-%m-%dT%H:%i:%s'
                ) AS auctionEndString,
                DATE_FORMAT(
                    cattle_complete.saleDate,
                    '%d/%m/%Y'
                ) AS saleDateFormated,
                DATE_FORMAT(
                    cattle_complete.expirationDate,
                    '%d/%m/%Y'
                ) AS expirationDateFormated,
                IF(
                    auctions_bids.price IS NULL,
                    cattle_complete.startPrice,
                    IF(
                        cattle_complete.startPrice < auctions_bids.price,
                        auctions_bids.price,
                        cattle_complete.startPrice
                    )
                ) AS lastPrice,
                auctions_bids.price AS lastPriceAuction,
                IF(
                    auctions_bids.customerId IS NULL,
                    0,
                    auctions_bids.customerId
                ) AS auctionBidcustomerId,
                users_auction.id AS auctionUserId,
                users_auction.picture AS auctionUserImage,
                users_auction.name AS auctionUserName,
                users_auction.surname AS auctionUserSurname,
                cattle_bids.price AS cattleBidPrice,
                cattle_bids.paymentTermId AS cattlePaymentTermId,
                customers_complete.customerId AS customerId,
                customers_complete.customerImage AS customerImage,
                customers_complete.customerName AS customerName,
                customers_complete.customerSurname AS customerSurname,
                customers_complete.customerDicose AS customerDicose,
                cattle_types.family AS typeFamily,
                cattle_types.ageUnit AS typeAgeUnit,
                cattle_types.females AS typeFemales,
                cattle_types.reproductiveStatus AS typeReproductiveStatus,
                cattle_types.weaned AS typeWeaned,
                cattle_types.caped AS typeCaped,
                cattle_types.calves AS typeCalves,
                cattle_totals.quantity AS totalQuantity,
                cattle_totals.females AS females,
                cattle_complete.salesagentImage AS salesagentImageSafe,
                cattle_comments.id AS commentId,
                cattle_comments.comment AS comment,
                DATE_FORMAT(cattle_comments.created_at - INTERVAL 3 HOUR, '%d/%m/%Y') AS commentDate,
                DATE_FORMAT(cattle_comments.created_at - INTERVAL 3 HOUR, '%h:%i %p') AS commentHour,
                cattle_comments.userId AS commentUserId,
                users_comment.name AS commentUserName,
                users_comment.surname AS commentUserSurname,
                societies_complete.societyId AS societyId,
                societies_complete.societyCompany AS societyCompany,
                societies_complete.societyRut AS societyRut,
                societies_complete.societyDicose AS societyDicose,
                IF(
                    cattle_complete.auctionPriceType = 2,
                    cattle_types_avg.avgPrice_2,
                    cattle_types_avg.avgPrice_1
                ) AS auctionAvg,
                
                IF(
                    cattle_complete.auctionPriceType = 2,
                    cattle_types_avg.avgPriceOld_2,
                    cattle_types_avg.avgPriceOld_1
                ) AS auctionAvgOld,
                cattle_payment_term.name AS paymentTermName
            FROM cattle_complete
            LEFT JOIN cattle_bids_max ON cattle_bids_max.lotId = cattle_complete.lotId
            LEFT JOIN cattle_bids ON 
                cattle_bids.id = cattle_bids_max.bidId AND 
                cattle_bids.lotId = cattle_complete.lotId
            LEFT JOIN auctions_bids_max ON auctions_bids_max.lotId = cattle_complete.lotId
            LEFT JOIN auctions_bids ON 
                auctions_bids.id = auctions_bids_max.auctionBidId AND 
                auctions_bids.lotId = cattle_complete.lotId
            LEFT JOIN customers_complete ON customers_complete.customerId = auctions_bids.customerId
            LEFT JOIN users AS users_auction ON users_auction.id = auctions_bids.userId
            LEFT JOIN cattle_totals ON cattle_totals.lotId = cattle_complete.lotId
            INNER JOIN cattle_types ON cattle_types.id = cattle_complete.typeId
            LEFT JOIN cattle_comments ON 
                cattle_comments.lotId = cattle_complete.lotId AND
                cattle_comments.userId > 0 AND cattle_comments.userId IS NOT NULL AND
                cattle_comments.customerId = 0 AND
                cattle_comments.public = 0 AND
                cattle_comments.status = 1
            LEFT JOIN users AS users_comment ON users_comment.id = cattle_comments.userId
            LEFT JOIN clients_farms ON clients_farms.societyId = cattle_complete.farmId AND clients_farms.status = 1
            LEFT JOIN clients_societies ON clients_societies.clientId = clients_farms.clientId AND clients_societies.status = 1
            LEFT JOIN societies_complete ON societies_complete.societyId = clients_societies.societyId
            INNER JOIN cattle_types_avg ON cattle_types_avg.cattleTypeId = cattle_complete.typeId
            INNER JOIN cattle_payment_term ON cattle_payment_term.id = cattle_complete.paymentTermId
            INNER JOIN users_desks ON users_desks.id = cattle_complete.salesagentDeskId
            WHERE cattle_complete.lotId = ?
            ORDER BY cattle_comments.created_at DESC
        `,
        [
            lotId,
        ],
        function (err, results) {
            if (err) {
                console.log(err);
            }
            else if (results.length) {
                outputLot = results[0];
                outputLot.comments = [];
                outputLot.docs = {};

                let __aux_comments_ids = [];

                for (let index in results) {
                    if (results[index].comment && !__aux_comments_ids.includes(results[index].commentId)) {
                        __aux_comments_ids.push(results[index].commentId);
                        outputLot.comments.push(
                            {
                                comment: results[index].comment,
                                userId: results[index].commentUserId,
                                name: results[index].commentUserName,
                                surname: results[index].commentUserSurname,
                                date: results[index].commentDate,
                                hour: results[index].commentHour,
                            }
                        );
                    }
                }

                if (!outputLot.farmImageFinal)
                    outputLot.farmImageFinal =
                        "https://mercadoagro-backoffice.s3.amazonaws.com/images/societies/no-profile-img.png";

                if (!outputLot.customerImage)
                    outputLot.customerImage =
                        "https://mercadoagro-backoffice.s3.amazonaws.com/images/customers/no-profile-img.png?ver=2024-04-11";

                if (!outputLot.salesagentImageSafe)
                    outputLot.salesagentImageSafe =
                        "https://mercadoagro-backoffice.s3.amazonaws.com/images/customers/no-profile-img.png?ver=2024-04-11";

                outputLot.wcc = [
                    { name: "Destetados", enabled: outputLot.typeWeaned, quantity: outputLot.weaning, },
                    { name: "Al pie", enabled: outputLot.typeCalves, quantity: outputLot.calves, },
                    { name: "Capados", enabled: outputLot.typeCaped, quantity: outputLot.caped, },
                    { name: "Enteros", enabled: outputLot.typeCaped, quantity: outputLot.entire, },
                ];
            }

            callback(outputLot);
        }
    );
};

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

Common.prototype.getCattleStatus = function (callback) {
    let cattleStatus = {};
    let setFirstActive = true;

    connection.query(
        `
            SELECT *
            FROM cattle_status
            ORDER BY sort ASC
        `,
        function (err, results) {
            if (err) {
                console.log(err);
            }
            else if (results.length) {
                for (let index in results) {
                    if (!(results[index].key in cattleStatus)) {
                        cattleStatus[results[index].key] = {
                            id: results[index].id,
                            name: results[index].keyName,
                            lots: {},
                            active: setFirstActive,
                        };

                        if (setFirstActive) {
                            setFirstActive = false;
                        }
                    }
                }
            }

            callback(cattleStatus);
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
                        "https://mercadoagro-backoffice.s3.amazonaws.com/images/farms/no-profile-img.png",
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