const connection = require('../connection_db');
const common_auth = require('../common_auth');
const common_cattle = require('../cattle/common');
const common_accounts = require('./common');
const common_customers = require('../customers/common');

function breedsArray(lotId, callback) {
    let __aux_total_quantity = 0;
    let __aux_total_females = 0;
    let __aux_breedsArray = [];
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
                cattle_lots_breeds.lotId = ? AND cattle_lots_breeds.status = 1
            ORDER BY cattle_lots_breeds.quantity DESC
        `,
        [
            lotId,
        ],
        function (err, results) {
            if (err) {
                console.log(err);
            }
            else if (results.length) {
                for (let index in results) {
                    __aux_total_quantity += results[index].quantity;
                    __aux_total_females += results[index].females;
                }

                __aux_breedsArray = results;
            }

            callback(__aux_breedsArray, __aux_total_quantity, __aux_total_females);
        }
    );
}

function ageArray(lotId, callback) {
    let __aux_ageArray = [];
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
                cattle_lots_ages.lotId = ? AND cattle_lots_ages.status = 1
            ORDER BY cattle_types.ageUnit ASC, cattle_lots_ages.quantity DESC
        `,
        [
            lotId,
        ],
        function (err, results) {
            if (err) {
                console.log(err);
            }
            else if (results.length) {
                __aux_ageArray = results;
            }

            callback(__aux_ageArray);
        }
    );
}

function cattleImages(lotId, callback) {
    connection.query(
        `
            SELECT cattle_images.image
            FROM cattle_images
            WHERE
                cattle_images.lotId = ? AND cattle_images.status = 1
            ORDER BY sort ASC
        `,
        [
            lotId,
        ],
        function (err, results) {
            images = [];
            if (err) {
                console.log(err);
            }
            else if (results.length) {
                for (let index in results) {
                    images.push(results[index].image);
                }
            }

            callback(images);
        }
    );
}

function Common() { }

Common.prototype.getViewParams = function (sessionID, lotId, callback) {
    common_auth.basic(sessionID, function (reply) {
        if (reply.err) {
            callback(
                '/login',
                {},
                "redirect"
            );
        }
        else {
            common_cattle.getViewParamsTemplate(
                reply.user,
                function (returnIndexParams) {
                    let indexParams = returnIndexParams;
                    indexParams.accountTabs = common_accounts.accountTabs();

                    common_customers.getCustomerById(
                        reply.user.id,
                        function (customer) {
                            const socsFarmsFilter = common_accounts.socsFarmsFilter(customer);

                            let socsFarmsFilterQueryString = [
                                " auctions_bids.customerId = ? ",
                                " cattle_complete.customerId = ? ",
                            ];
                            if (socsFarmsFilter.societiesQueryVals.length) {
                                socsFarmsFilterQueryString.push(
                                    " societies_complete.societyId IN (" + socsFarmsFilter.societiesQueryString.join() + ") "
                                );
                            }
                            if (socsFarmsFilter.framsQueryVals.length) {
                                socsFarmsFilterQueryString.push(
                                    " cattle_complete.farmId IN (" + socsFarmsFilter.framsQueryString.join() + ") "
                                );
                            }

                            connection.query(
                                `
                                    SELECT 
                                        cattle_complete.*,
                                        cattle_complete.customerId AS cattleCustomerId,
                                        DATE_FORMAT(
                                            cattle_complete.weightDate,
                                            '%d/%m/%Y'
                                        ) AS weightDateFormated,
                                        IF(
                                            cattle_complete.farmImage IS NULL OR cattle_complete.farmImage = "",
                                            "https://agro-oriental-remates.s3.us-west-1.amazonaws.com/images/societies/no-profile-img.png",
                                            cattle_complete.farmImage
                                        ) AS farmImageFinal,
                                        DATE_FORMAT(
                                            cattle_complete.auctionStart,
                                            '%Y-%m-%dT%H:%i:%s'
                                        ) AS auctionStartString,
                                        DATE_FORMAT(
                                            cattle_complete.auctionEnd,
                                            '%Y-%m-%dT%H:%i:%s'
                                        ) AS auctionEndString,
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
                                        customers_complete.customerId AS customerId,
                                        IF(
                                            customers_complete.customerImage IS NULL OR customers_complete.customerImage = "",
                                            "https://agro-oriental-remates.s3.us-west-1.amazonaws.com/images/customers/no-profile-img.png",
                                            customers_complete.customerImage
                                        ) AS customerImage,
                                        customers_complete.customerName AS customerName,
                                        customers_complete.customerSurname AS customerSurname,
                                        cattle_types.family AS typeFamily,
                                        cattle_types.ageUnit AS typeAgeUnit,
                                        cattle_types.females AS typeFemales,
                                        cattle_types.reproductiveStatus AS typeReproductiveStatus,
                                        cattle_types.weaned AS typeWeaned,
                                        cattle_types.caped AS typeCaped,
                                        cattle_types.calves AS typeCalves,
                                        cattle_totals.quantity AS totalQuantity,
                                        cattle_totals.females AS females,
                                        IF(
                                            cattle_complete.salesagentImage IS NULL OR cattle_complete.salesagentImage = "",
                                            "https://agro-oriental-remates.s3.us-west-1.amazonaws.com/images/customers/no-profile-img.png",
                                            cattle_complete.salesagentImage
                                        ) AS salesagentImageSafe,
                                        IF (
                                            auctions_bids.id IS NULL,
                                            "--/--/----",
                                            DATE_FORMAT(
                                                auctions_bids.created_at,
                                                '%d/%m/%Y'
                                            ) 
                                        ) AS totalDate,
                                        IF (
                                            auctions_bids.id IS NULL,
                                            0,
                                            IF(
                                                cattle_complete.auctionPriceType = 1,
                                                cattle_totals.quantity * cattle_complete.meanWeight * auctions_bids.price,
                                                cattle_totals.quantity * auctions_bids.price
                                            )
                                        ) AS total,
                                        IF (
                                            cattle_complete.saleDate IS NULL,
                                            "--/--/----",
                                            DATE_FORMAT(
                                                cattle_complete.saleDate,
                                                '%d/%m/%Y'
                                            ) 
                                        ) AS saleDateFormated,
                                        currencies.name AS currencyName,
                                        IF( 
                                            payments_in_advance.id IS NOT NULL,
                                            payments_in_advance.id,
                                            FALSE
                                        ) AS paymentsInAdvanceId,
                                        payments_in_advance.amount AS paymentsInAdvanceAmount
                                    FROM cattle_complete
                                    LEFT JOIN currencies ON currencies.id = cattle_complete.currencyId
                                    LEFT JOIN auctions_bids_max ON auctions_bids_max.lotId = cattle_complete.lotId
                                    LEFT JOIN auctions_bids ON 
                                        auctions_bids.id = auctions_bids_max.auctionBidId AND 
                                        auctions_bids.lotId = cattle_complete.lotId
                                    LEFT JOIN clients_farms ON clients_farms.farmId = cattle_complete.farmId AND clients_farms.status = 1
                                    LEFT JOIN clients_societies ON clients_societies.clientId = clients_farms.clientId AND clients_societies.status = 1
                                    LEFT JOIN societies_complete ON societies_complete.societyId = clients_societies.societyId
                                    LEFT JOIN customers_complete ON customers_complete.customerId = auctions_bids.customerId
                                    LEFT JOIN cattle_totals ON cattle_totals.lotId = cattle_complete.lotId
                                    INNER JOIN cattle_types ON cattle_types.id = cattle_complete.typeId
                                    LEFT JOIN payments_in_advance ON payments_in_advance.lotId = cattle_complete.lotId
                                    WHERE 
                                        cattle_complete.lotId = ? AND
                                        (
                                            ` + socsFarmsFilterQueryString.join(" OR ") + `
                                        )
                                `,
                                [
                                    lotId,
                                    customer.customerId,
                                    customer.customerId,
                                ].concat(socsFarmsFilter.societiesQueryVals)
                                    .concat(socsFarmsFilter.framsQueryVals),
                                function (err, results) {
                                    indexParams.lot = {};
                                    if (err) {
                                        console.log(err);
                                        callback(
                                            '/cuentas',
                                            {},
                                            "redirect"
                                        );
                                    }
                                    else if (results.length) {
                                        if (
                                            results[0].statusKey == "approved" &&
                                            results[0].lastPrice && results[0].customerId &&
                                            !results[0].active
                                        ) {
                                            results[0].statusName = "Vendido";
                                            results[0].statusKey = "sold";
                                        }

                                        indexParams.lot = results[0];

                                        if (
                                            socsFarmsFilter.framsQueryVals.includes(indexParams.lot.farmId) ||
                                            indexParams.lot.cattleCustomerId == customer.customerId
                                        ) {
                                            indexParams.lot.transactionKey = "sales";
                                        }
                                        else {
                                            indexParams.lot.transactionKey = "purchases";
                                        }

                                        indexParams.lot.wcc = [
                                            { name: "Destetados", enabled: indexParams.lot.typeWeaned, quantity: results[0].weaning, },
                                            { name: "Al pie", enabled: indexParams.lot.typeCalves, quantity: results[0].calves, },
                                            { name: "Capados", enabled: indexParams.lot.typeCaped, quantity: results[0].caped, },
                                            { name: "Enteros", enabled: indexParams.lot.typeCaped, quantity: results[0].entire, },
                                        ];

                                        breedsArray(
                                            lotId,
                                            function (replyBreedsArray, replyTotalQuantity, replyTotalFemales) {
                                                indexParams.lot.breedsArray = replyBreedsArray;
                                                ageArray(
                                                    lotId,
                                                    function (replyAgeArray) {
                                                        indexParams.lot.ageArray = replyAgeArray;
                                                        cattleImages(
                                                            lotId,
                                                            function (replyImagesArray) {
                                                                indexParams.lot.imagesArray = replyImagesArray;
                                                                if (indexParams.lot.lotId) {
                                                                    callback(
                                                                        'accounts/transaction',
                                                                        indexParams,
                                                                        "render"
                                                                    );
                                                                }
                                                                else {
                                                                    callback(
                                                                        '/cuentas',
                                                                        {},
                                                                        "redirect"
                                                                    );
                                                                }
                                                            }
                                                        );
                                                    }
                                                );
                                            }
                                        );
                                    }
                                    else {
                                        callback(
                                            '/cuentas',
                                            {},
                                            "redirect"
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

module.exports = new Common();