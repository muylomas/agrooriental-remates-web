const connection = require('../connection_db');
const common_cattle = require('./common');
const common_cattle_home = require('./common_home');
const common_customers = require('../customers/common');

function breedsArray(lotsIds, indexParams, callback) {
    let __aux_lotsIds_query_string = Array(lotsIds.length).fill("?");
    for (let indexLot in indexParams.lots) {
        if (!("breedsArray" in indexParams.lots[indexLot])) {
            indexParams.lots[indexLot].breedsArray = [];
        }
        if (!("quantity" in indexParams.lots[indexLot])) {
            indexParams.lots[indexLot].quantity = 0;
        }
        if (!("females" in indexParams.lots[indexLot])) {
            indexParams.lots[indexLot].females = 0;
        }
    }

    if (lotsIds.length) {
        connection.query(
            `
                SELECT 
                    cattle_lots_breeds.*,
                    cattle_breeds.shortName AS breedName,
                    cattle_cross_breeds.shortName AS crossBreedName
                FROM cattle_lots_breeds
                INNER JOIN cattle_breeds ON cattle_breeds.id = cattle_lots_breeds.breedId
                LEFT JOIN cattle_breeds AS cattle_cross_breeds ON cattle_cross_breeds.id = cattle_lots_breeds.crossBreedId
                WHERE
                    cattle_lots_breeds.lotId IN (` + __aux_lotsIds_query_string.join() + `) AND cattle_lots_breeds.status = 1
                ORDER BY cattle_lots_breeds.quantity DESC
            `,
            lotsIds,
            function (err, results) {
                if (err) {
                    console.log(err);
                }
                else if (results.length) {
                    for (let indexRes in results) {
                        for (let indexLot in indexParams.lots) {
                            if (indexParams.lots[indexLot].lotId == results[indexRes].lotId) {
                                indexParams.lots[indexLot].breedsArray.push(results[indexRes]);
                                indexParams.lots[indexLot].quantity += results[indexRes].quantity;
                                indexParams.lots[indexLot].females += results[indexRes].females
                            }
                        }
                    }
                }

                callback(indexParams);
            }
        );
    }
    else {
        callback(indexParams);
    }
}

function ageArray(lotsIds, indexParams, callback) {

    let __aux_lotsIds_query_string = Array(lotsIds.length).fill("?");
    for (let indexLot in indexParams.lots) {
        if (!("ageArray" in indexParams.lots[indexLot])) {
            indexParams.lots[indexLot].ageArray = [];
        }
    }

    if (lotsIds.length) {

        connection.query(
            `
                SELECT 
                    cattle_lots_ages.*,
                    cattle_teeths.name AS teethName,
                    cattle_types.ageUnit AS ageUnit,
                    cattle_age_units.name AS ageUnitName
                FROM cattle_lots_ages
                INNER JOIN cattle_types ON cattle_types.id = cattle_lots_ages.typeId
                LEFT JOIN cattle_teeths ON cattle_teeths.id = cattle_lots_ages.teethId
                INNER JOIN cattle_age_units ON cattle_age_units.id = cattle_types.ageUnit
                WHERE
                    cattle_lots_ages.lotId IN (` + __aux_lotsIds_query_string.join() + `) AND cattle_lots_ages.status = 1
                ORDER BY cattle_types.ageUnit ASC, cattle_lots_ages.quantity DESC
            `,
            lotsIds,
            function (err, results) {
                if (err) {
                    console.log(err);
                }
                else if (results.length) {
                    for (let indexRes in results) {
                        for (let indexLot in indexParams.lots) {
                            if (indexParams.lots[indexLot].lotId == results[indexRes].lotId) {
                                indexParams.lots[indexLot].ageArray.push(results[indexRes]);
                            }
                        }
                    }
                }

                callback(indexParams);
            }
        );
    }
    else {
        callback(indexParams);
    }
}

function cattleImages(lotsIds, indexParams, callback) {


    if (lotsIds.length) {

        let __aux_lotsIds_query_string = Array(lotsIds.length).fill("?");
        for (let indexLot in indexParams.lots) {
            if (!("imagesArray" in indexParams.lots[indexLot])) {
                indexParams.lots[indexLot].imagesArray = [];
            }
        }

        connection.query(
            `
                SELECT 
                    cattle_images.lotId,
                    cattle_images.image
                FROM cattle_images
                WHERE
                    cattle_images.lotId IN (` + __aux_lotsIds_query_string.join() + `) AND cattle_images.status = 1
                ORDER BY sort ASC
            `,
            lotsIds,
            function (err, results) {
                images = [];
                if (err) {
                    console.log(err);
                }
                else if (results.length) {
                    for (let indexRes in results) {
                        for (let indexLot in indexParams.lots) {
                            if (indexParams.lots[indexLot].lotId == results[indexRes].lotId) {
                                indexParams.lots[indexLot].imagesArray.push(results[indexRes].image);
                            }
                        }
                    }
                }

                callback(indexParams);
            }
        );
    }
    else {
        callback(indexParams);
    }
};

function getCattleTypesAverages(callback) {
    cattleAverages = [];

    connection.query(
        `
            SELECT 
                cattle_types_avg.*,
                cattle_types.name AS name,
                cattle_types.family AS family,
                cattle_types.wintering AS wintering
            FROM cattle_types_avg
            INNER JOIN cattle_types ON cattle_types.id = cattle_types_avg.cattleTypeId
            ORDER BY cattle_types.sort ASC
        `,
        function (err, results) {
            images = [];
            if (err) {
                console.log(err);
            }
            else if (results.length) {
                cattleAverages = results;
            }

            callback(cattleAverages);
        }
    );
};

function getCustomerActiveBids(customerId, callback) {
    let activeAuctionBids = [];

    connection.query(
        `
            SELECT 
                IF(
                    auctions_bids.customerId = auctions_bidsMAXForCustomer.customerId,
                    1,
                    0
                ) AS isWinning,
                auctions_bidsMAXForCustomer.price,
                auctions_bidsMAXForCustomer.lotId
            FROM cattle_complete
            INNER JOIN auctions_bids_max ON auctions_bids_max.lotId = cattle_complete.lotId
            INNER JOIN auctions_bids ON 
                auctions_bids.id = auctions_bids_max.auctionBidId AND 
                auctions_bids.lotId = cattle_complete.lotId
            INNER JOIN (
            	SELECT 
            		MAX(auctions_bids.id) AS auctionBidId, 
            		auctions_bids.lotId AS lotId
            	FROM auctions_bids
                WHERE customerId = ?
            	GROUP BY auctions_bids.lotId
            	) AS auctions_bidsMaxIdForCustomer ON auctions_bidsMaxIdForCustomer.lotId = cattle_complete.lotId
             INNER JOIN auctions_bids AS auctions_bidsMAXForCustomer ON auctions_bidsMAXForCustomer.id = auctions_bidsMaxIdForCustomer.auctionBidId
            
            WHERE 
                cattle_complete.statusId = 5 AND
                auctions_bids.price < cattle_complete.salePrice AND
                cattle_complete.auctionStart < NOW() - INTERVAL 3 HOUR AND
                cattle_complete.auctionEnd > NOW() - INTERVAL 3 HOUR 
        `,
        [
            customerId,
        ],
        function (err, results) {
            if (err) {
                console.log(err);
            }
            else {
                activeAuctionBids = results;
            }

            callback(activeAuctionBids)
        }
    );
};

function Common() { }

Common.prototype.getViewParams = function (user, callback) {
    common_cattle.getViewParamsTemplate(
        user,
        function (returnIndexParams) {
            let indexParams = returnIndexParams;

            common_cattle_home.getLots(
                user.id,
                [],
                [],
                [],
                "",
                "",
                function (returnLots, returnLotsIds) {
                    indexParams.lotsIds = returnLotsIds;
                    indexParams.lots = returnLots;
                    indexParams.activeAuctionBids = [];
                    indexParams.cattleCaracteristics = common_cattle_home.cattleCaracteristics();

                    common_customers.getCustomerById(
                        user.id,
                        function (returnCustomer) {
                            indexParams.customer = returnCustomer;
                            getCustomerActiveBids(
                                user.id,
                                function (returnActiveAuctionBids) {
                                    indexParams.activeAuctionBids = returnActiveAuctionBids;
                                    breedsArray(
                                        indexParams.lotsIds,
                                        indexParams,
                                        function (returnIndexParamsBreeds) {
                                            indexParams = returnIndexParamsBreeds;
                                            ageArray(
                                                indexParams.lotsIds,
                                                indexParams,
                                                function (returnIndexParamsAges) {
                                                    indexParams = returnIndexParamsAges;
                                                    cattleImages(
                                                        indexParams.lotsIds,
                                                        indexParams,
                                                        function (returnIndexParamsImages) {
                                                            indexParams = returnIndexParamsImages;
                                                            getCattleTypesAverages(
                                                                function (replyCattleTypesAverages) {
                                                                    indexParams.cattleTypesAverages = replyCattleTypesAverages;
                                                                    callback(
                                                                        //'cattle/home-feed',
                                                                        'cattle/remate',
                                                                        indexParams,
                                                                        "render"
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

Common.prototype.getLotsForMap = function (userId, params, callback) {
    let indexParams = {
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

    common_cattle_home.getLots(
        userId,
        [
            parseFloat(params.latMin),
            parseFloat(params.latMax),
            parseFloat(params.lngMin),
            parseFloat(params.lngMax),
        ],
        params.cattleTypes,
        params.cattleCaracteristics,
        params.cattleWintering,
        params.cattleSearchText,
        function (returnLots, returnLotsIds) {
            indexParams.lotsIds = returnLotsIds;
            indexParams.lots = returnLots;
            indexParams.activeAuctionBids = [];
            indexParams.cattleCaracteristics = common_cattle_home.cattleCaracteristics();
            breedsArray(
                indexParams.lotsIds,
                indexParams,
                function (returnIndexParamsBreeds) {
                    indexParams = returnIndexParamsBreeds;
                    ageArray(
                        indexParams.lotsIds,
                        indexParams,
                        function (returnIndexParamsAges) {
                            indexParams = returnIndexParamsAges;
                            cattleImages(
                                indexParams.lotsIds,
                                indexParams,
                                function (returnIndexParamsImages) {
                                    indexParams = returnIndexParamsImages;
                                    getCattleTypesAverages(
                                        function (replyCattleTypesAverages) {
                                            indexParams.cattleTypesAverages = replyCattleTypesAverages;
                                            callback(indexParams.lots);
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

module.exports = new Common();