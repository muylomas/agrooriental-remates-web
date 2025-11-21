const connection = require('../connection_db');
const common_auth = require('../common_auth');
const common_customers = require('../customers/common');
const commonCattle = require('./common');

function getSavedLotDataByCustomer(customerId, callback) {
    let savedLots = [];
    connection.query(
        `
            SELECT 
                cattle_saved_complete.*
            FROM cattle_saved_complete
            WHERE
                cattle_saved_complete.customerId = ? 
            ORDER BY cattle_saved_complete.lotId DESC
        `,
        [
            customerId,
        ],
        function (err, results) {
            if (err) {
                console.log(err);
            }
            else if (results.length) {
                savedLots = results;
                for (let index in savedLots) {
                    if ("breeds" in savedLots[index] && savedLots[index].breeds) {
                        const breedsArray = JSON.parse(savedLots[index].breeds);
                        savedLots[index].totalQuantity = 0;
                        savedLots[index].totalFemalesQuantity = 0;
                        for (let indexBreed in breedsArray) {
                            if (breedsArray[indexBreed].quantity) {
                                savedLots[index].totalQuantity += breedsArray[indexBreed].quantity;
                                savedLots[index].totalFemalesQuantity += breedsArray[indexBreed].females;
                            }
                        }
                    }
                }
            }

            callback(savedLots);
        }
    );
};

function getSellingLotsDataByCustomer(customerId, callback) {
    let sellingLots = [];
    connection.query(
        `
            SELECT 
                cattle_complete.*,
                auctions_bids.price AS lastPriceAuction,
                IF(
                    auctions_bids.customerId IS NULL,
                    0,
                    auctions_bids.customerId
                ) AS auctionBidcustomerId,
                cattle_totals.quantity AS totalQuantity,
                cattle_totals.females AS females
            FROM cattle_complete
            LEFT JOIN auctions_bids_max ON auctions_bids_max.lotId = cattle_complete.lotId
            LEFT JOIN auctions_bids ON 
                auctions_bids.id = auctions_bids_max.auctionBidId AND 
                auctions_bids.lotId = cattle_complete.lotId
            LEFT JOIN cattle_totals ON cattle_totals.lotId = cattle_complete.lotId
            WHERE
                cattle_complete.customerId = ? AND
                cattle_complete.statusId < 10 
            ORDER BY cattle_complete.lotId DESC
        `,
        [
            customerId,
        ],
        function (err, results) {
            if (err) {
                console.log(err);
            }
            else if (results.length) {
                let __aux_output = [];
                for (index in results) {
                    // Set auctions closed with offers as sold.
                    if (
                        results[index].statusKey == "approved" &&
                        results[index].lastPriceAuction && results[index].customerId &&
                        !results[index].active
                    ) {
                        results[index].statusName = "Vendido";
                        results[index].statusKey = "sold";
                    }
                    else {
                        __aux_output.push(results[index]);
                    }
                }

                sellingLots = __aux_output;
            }

            callback(sellingLots);
        }
    );
};

function getSavedLotDataById(lotId, callback) {
    let savedLot = {};
    connection.query(
        `
            SELECT 
                cattle_saved_complete.*,
                cattle_saved_complete.video AS videoToUploadUrl
            FROM cattle_saved_complete
            WHERE
                cattle_saved_complete.lotId = ?
            ORDER BY cattle_saved_complete.lotId DESC
        `,
        [
            lotId,
        ],
        function (err, results) {
            if (err) {
                console.log(err);
            }
            else if (results.length) {
                savedLot = results[0];
                if ("breeds" in savedLot && savedLot.breeds) {
                    const breedsArray = JSON.parse(savedLot.breeds);
                    savedLot.totalQuantity = 0;
                    savedLot.totalFemalesQuantity = 0;
                    for (let index in breedsArray) {
                        if (breedsArray[index].quantity) {
                            savedLot.totalQuantity += breedsArray[index].quantity;
                            savedLot.totalFemalesQuantity += breedsArray[index].females;
                        }
                    }
                }
            }

            callback(savedLot);
        }
    );
}

function Common() { }

Common.prototype.getViewParams = function (sessionID, callback) {
    common_auth.basic(sessionID, function (reply) {
        if (reply.err) {
            callback(
                '/login',
                {},
                "redirect",
            );
        }
        else {
            common_customers.getCustomerById(
                reply.user.id,
                function (returnCustomer) {
                    getSavedLotDataByCustomer(
                        reply.user.id,
                        function (savedLots) {
                            getSellingLotsDataByCustomer(
                                reply.user.id,
                                function (sellingLots) {
                                    if (savedLots.length || sellingLots.length) {
                                        callback(
                                            'cattle/sell',
                                            {
                                                customer: returnCustomer,
                                                savedLots: savedLots,
                                                sellingLots: sellingLots,
                                            },
                                            "render",
                                        );
                                    }
                                    else {
                                        callback(
                                            '/ganado/lote/nuevo',
                                            {},
                                            "redirect",
                                        );
                                    }
                                }
                            );
                        }
                    );
                }
            );
        }
    });
};

Common.prototype.getSavedViewParams = function (sessionID, savedLotId, callback) {
    common_auth.basic(sessionID, function (reply) {
        if (reply.err) {
            callback(
                '/login',
                {},
                "redirect"
            );
        }
        else {
            commonCattle.getViewParamsTemplate(
                reply.user,
                function (returnIndexParams) {
                    common_customers.getCustomerById(
                        reply.user.id,
                        function (returnCustomer) {
                            returnIndexParams.customer = returnCustomer;
                            getSavedLotDataById(
                                savedLotId,
                                function (savedLotData) {
                                    returnIndexParams.lot = savedLotData;
                                    returnIndexParams.savedLotId = savedLotId;
                                    callback(
                                        'cattle/new',
                                        returnIndexParams,
                                        "render"
                                    );
                                }
                            );
                        }
                    );
                }
            );
        }
    });
};

module.exports = new Common();