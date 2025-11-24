const connection = require('../connection_db');
const ffmpeg = require('fluent-ffmpeg');
const fs = require("fs");
const modifLot = require('./modifLot');

function getCustomerFarms(userId, callback) {
    let customerFarms = [];
    connection.query(
        `
            SELECT
                clients_farms.farmId AS farmId
            FROM clients_farms
            INNER JOIN clients_customers ON clients_customers.clientId = clients_farms.clientId
            WHERE
                clients_customers.customerId = ?
        `,
        [
            userId,
        ],
        function (err, results) {
            if (err) {
                console.log(err);
            }
            else if (results.length) {
                for (let index in results) {
                    customerFarms.push(results[index].farmId);
                }
            }

            callback(customerFarms);
        }
    );
};

function Common() { }

Common.prototype.getLots = function (userId, latLngArray, cattleTypes, cattleCaracteristics, cattleWintering, cattleSearchText, callback) {
    let lotsIds = [];
    let lots = [];

    getCustomerFarms(
        userId,
        function (customerFarms) {

            let customerFarmsFilterString = "";
            if (customerFarms.length) {
                let customerFarmsFilterArray = [];
                for (let indCustomerFarms in customerFarms) {
                    customerFarmsFilterArray.push("?");
                }

                customerFarmsFilterString = "AND cattle_complete.farmId NOT IN (" + customerFarmsFilterArray.join() + ") ";
            }

            let latLngQueryString = "";
            if (latLngArray.length && latLngArray.length == 4) {
                latLngQueryString =
                    `
                        AND
                            (cattle_complete.addressLatitude BETWEEN ? AND ?) AND
                            (cattle_complete.addressLongitude BETWEEN ? AND ?)
                    `;
            }

            let cattleTypesString = [];
            let cattleTypesQueryString = "";
            let cattleTypesQueryVals = [];
            if (cattleTypes && cattleTypes.length) {
                for (let indCat in cattleTypes) {
                    cattleTypesQueryVals.push(cattleTypes[indCat]);
                    cattleTypesString.push("?");
                }
                cattleTypesQueryString = " AND cattle_complete.typeId IN ( " + cattleTypesString.join() + " ) ";
            }

            let cattleCaracteristicsString = [];
            let cattleCaracteristicsQueryString = "";
            if (cattleCaracteristics && cattleCaracteristics.length) {
                for (let indCc in cattleCaracteristics) {
                    switch (cattleCaracteristics[indCc]) {
                        case '0':
                            cattleCaracteristicsString.push(" cattle_types.femalesFilter = 1 ");
                            break;
                        case '1':
                            cattleCaracteristicsString.push(" cattle_types.malesFilter = 1 ");
                            break;
                        case '2':
                            cattleCaracteristicsString.push(" cattle_types.reproductiveStatus = 1 ");
                            break;
                        case '3':
                            cattleCaracteristicsString.push(" cattle_types.family = 'ovinos' ");
                            break;
                        case '4':
                            cattleCaracteristicsString.push(" ( cattle_types.family = 'bovinos' AND cattle_complete.ratingId > 5 ) ");
                            break;
                        case '5':
                            cattleCaracteristicsString.push(" ( cattle_types.family = 'ovinos' AND cattle_complete.ratingId > 5 ) ");
                            break;
                        default:
                            break;
                    }
                }

                if (cattleCaracteristicsString.length)
                    cattleCaracteristicsQueryString = " AND " + cattleCaracteristicsString.join(" AND ") + " ";
            }

            let cattleWinteringQueryString = "";
            if (["wintering", "breeding"].includes(cattleWintering)) {
                if (cattleWintering == "wintering") {
                    cattleWinteringQueryString = " AND cattle_types.wintering = 1 ";
                }
                else if (cattleWintering == "breeding") {
                    cattleWinteringQueryString = " AND cattle_types.wintering = 0 ";
                }
            }

            let cattleSearchTextString = [];
            let cattleSearchTextQueryString = "";
            if (cattleSearchText) {
                cattleSearchTextQueryString =
                    `   AND CONCAT(
                            COALESCE(cattle_complete.type, ''), " ",
                            COALESCE(cattle_complete.feeding, ''), " ",
                            COALESCE(cattle_complete.reproductiveStatus, ''), " ",
                            COALESCE(cattle_complete.pregnancyDiagnosis, ''), " ",
                            COALESCE(cattle_complete.birthSeason, ''), " ",
                            COALESCE(cattle_complete.weightComment, ''), " ",
                            COALESCE(cattle_complete.paymentTerm, ''), " ",
                            COALESCE(cattle_complete.health, ''), " ",
                            COALESCE(cattle_complete.rating, ''), " ",
                            COALESCE(cattle_complete.explanations, ''), " ",
                            COALESCE(cattle_complete.salesagentName, ''), " ",
                            COALESCE(cattle_complete.salesagentSurname, ''), " ",
                            COALESCE(cattle_complete.farmName, ''), " ",
                            COALESCE(cattle_complete.addressStreet, ''), " ",
                            COALESCE(cattle_complete.addressStateName, ''), " ",
                            COALESCE(cattle_complete.addressLocationName, ''), " ",
                            COALESCE(cattle_breeds.name, ''), " ",
                            COALESCE(cattle_crossBreeds.name, ''), " ",
                            COALESCE(users_desks.name, '')
                        ) LIKE ?
                    `;

                cattleSearchTextString = ["%" + cattleSearchText + "%"];
            }

            console.log(`
                    SELECT 
                        cattle_complete.*,
                        DATE_FORMAT(
                            cattle_complete.weightDate,
                            '%d/%m/%Y'
                        ) AS weightDateFormated,
                        IF(
                            cattle_complete.farmImage IS NULL OR cattle_complete.farmImage = "",
                            "https://mercadoagro-backoffice.s3.amazonaws.com/images/societies/no-profile-img.png",
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
                            "https://mercadoagro-backoffice.s3.amazonaws.com/images/customers/no-profile-img.png",
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
                            "https://mercadoagro-backoffice.s3.amazonaws.com/images/customers/no-profile-img.png",
                            cattle_complete.salesagentImage
                        ) AS salesagentImageSafe,
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
                        cattle_payment_term.name AS paymentTermName,
                        users_desks.name AS salesagentDeskName
                    FROM cattle_complete
                    LEFT JOIN auctions_bids_max ON auctions_bids_max.lotId = cattle_complete.lotId
                    LEFT JOIN auctions_bids ON 
                        auctions_bids.id = auctions_bids_max.auctionBidId AND 
                        auctions_bids.lotId = cattle_complete.lotId
                    LEFT JOIN customers_complete ON customers_complete.customerId = auctions_bids.customerId
                    LEFT JOIN cattle_totals ON cattle_totals.lotId = cattle_complete.lotId
                    INNER JOIN cattle_types ON cattle_types.id = cattle_complete.typeId
                    INNER JOIN cattle_types_avg ON cattle_types_avg.cattleTypeId = cattle_complete.typeId
                    INNER JOIN cattle_payment_term ON cattle_payment_term.id = cattle_complete.paymentTermId
                    LEFT JOIN cattle_lots_breeds ON cattle_lots_breeds.lotId = cattle_complete.lotId
                    LEFT JOIN cattle_breeds ON cattle_breeds.id = cattle_lots_breeds.breedId
                    LEFT JOIN cattle_breeds AS cattle_crossBreeds ON cattle_crossBreeds.id = cattle_lots_breeds.crossBreedId
                    LEFT JOIN users ON users.id = cattle_complete.salesagentId
                    LEFT JOIN users_desks ON users_desks.id = users.deskId
                    WHERE 
                        cattle_complete.customerId != ? AND
                        cattle_complete.statusId = 5 AND
                        (
                            auctions_bids.price IS NULL OR
                            auctions_bids.price < cattle_complete.salePrice 
                        ) AND
                        cattle_complete.auctionStart < NOW() - INTERVAL 3 HOUR AND
                        cattle_complete.auctionEnd > NOW() - INTERVAL 3 HOUR 
                        ` + customerFarmsFilterString + `
                        ` + latLngQueryString + `
                        ` + cattleTypesQueryString + `
                        ` + cattleCaracteristicsQueryString + `
                        ` + cattleWinteringQueryString + `
                        ` + cattleSearchTextQueryString + `
                    GROUP BY cattle_complete.lotId
                    ORDER BY cattle_complete.lotId ASC
                `
            );
            console.log(
                [
                    userId,
                ]
                    .concat(customerFarms)
                    .concat(latLngArray)
                    .concat(cattleTypesQueryVals)
                    .concat(cattleSearchTextString)
            );

            connection.query(
                `
                    SELECT 
                        cattle_complete.*,
                        DATE_FORMAT(
                            cattle_complete.weightDate,
                            '%d/%m/%Y'
                        ) AS weightDateFormated,
                        IF(
                            cattle_complete.farmImage IS NULL OR cattle_complete.farmImage = "",
                            "https://mercadoagro-backoffice.s3.amazonaws.com/images/societies/no-profile-img.png",
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
                            "https://mercadoagro-backoffice.s3.amazonaws.com/images/customers/no-profile-img.png",
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
                            "https://mercadoagro-backoffice.s3.amazonaws.com/images/customers/no-profile-img.png",
                            cattle_complete.salesagentImage
                        ) AS salesagentImageSafe,
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
                        cattle_payment_term.name AS paymentTermName,
                        users_desks.name AS salesagentDeskName
                    FROM cattle_complete
                    LEFT JOIN auctions_bids_max ON auctions_bids_max.lotId = cattle_complete.lotId
                    LEFT JOIN auctions_bids ON 
                        auctions_bids.id = auctions_bids_max.auctionBidId AND 
                        auctions_bids.lotId = cattle_complete.lotId
                    LEFT JOIN customers_complete ON customers_complete.customerId = auctions_bids.customerId
                    LEFT JOIN cattle_totals ON cattle_totals.lotId = cattle_complete.lotId
                    INNER JOIN cattle_types ON cattle_types.id = cattle_complete.typeId
                    INNER JOIN cattle_types_avg ON cattle_types_avg.cattleTypeId = cattle_complete.typeId
                    INNER JOIN cattle_payment_term ON cattle_payment_term.id = cattle_complete.paymentTermId
                    LEFT JOIN cattle_lots_breeds ON cattle_lots_breeds.lotId = cattle_complete.lotId
                    LEFT JOIN cattle_breeds ON cattle_breeds.id = cattle_lots_breeds.breedId
                    LEFT JOIN cattle_breeds AS cattle_crossBreeds ON cattle_crossBreeds.id = cattle_lots_breeds.crossBreedId
                    LEFT JOIN users ON users.id = cattle_complete.salesagentId
                    LEFT JOIN users_desks ON users_desks.id = users.deskId
                    WHERE 
                        cattle_complete.customerId != ? AND
                        cattle_complete.statusId = 5 AND
                        (
                            auctions_bids.price IS NULL OR
                            auctions_bids.price < cattle_complete.salePrice 
                        ) AND
                        cattle_complete.auctionStart < NOW() - INTERVAL 3 HOUR AND
                        cattle_complete.auctionEnd > NOW() - INTERVAL 3 HOUR 
                        ` + customerFarmsFilterString + `
                        ` + latLngQueryString + `
                        ` + cattleTypesQueryString + `
                        ` + cattleCaracteristicsQueryString + `
                        ` + cattleWinteringQueryString + `
                        ` + cattleSearchTextQueryString + `
                    GROUP BY cattle_complete.lotId
                    ORDER BY cattle_complete.lotId ASC
                `,
                [
                    userId,
                ]
                    .concat(customerFarms)
                    .concat(latLngArray)
                    .concat(cattleTypesQueryVals)
                    .concat(cattleSearchTextString),
                function (err, results) {
                    if (err) {
                        console.log(err);
                    }
                    else if (results.length) {

                        console.log("After sql lots length: ", results.length);

                        for (let index in results) {
                            if (!lotsIds.includes(results[index].lotId)) {
                                let __aux_lot = results[index];
                                lotsIds.push(results[index].lotId);
                                __aux_lot.wcc = [
                                    { name: "Destetados", enabled: __aux_lot.typeWeaned, quantity: results[0].weaning, },
                                    { name: "Al pie", enabled: __aux_lot.typeCalves, quantity: results[0].calves, },
                                    { name: "Capados", enabled: __aux_lot.typeCaped, quantity: results[0].caped, },
                                    { name: "Enteros", enabled: __aux_lot.typeCaped, quantity: results[0].entire, },
                                ];

                                __aux_lot.whatsappMessage =
                                    encodeURIComponent(
                                        "Hola " + __aux_lot.salesagentName + ", tengo algunas preguntas sobre el lote Nro. " + __aux_lot.lotId +
                                        " de " + __aux_lot.totalQuantity + " " + __aux_lot.type + " " +
                                        "https://54.183.80.127/#lote-" + __aux_lot.lotId
                                    );

                                __aux_lot.whatsappShare =
                                    encodeURIComponent(
                                        "Te comparto el lote Nro. " + __aux_lot.lotId +
                                        " ubicado en " + __aux_lot.addressLocationName + ", " + __aux_lot.addressStateName +
                                        " de " + __aux_lot.totalQuantity + " " + __aux_lot.type + " " +
                                        " ( peso promedio " + __aux_lot.meanWeight.toFixed(0) + " kg) " +
                                        "https://54.183.80.127/#lote-" + __aux_lot.lotId
                                    );

                                lots.push(__aux_lot);
                            }
                        }
                    }

                    Common.prototype.cattleImages(
                        lotsIds,
                        lots,
                        function (lotsWithImages) {
                            callback(lotsWithImages, lotsIds);
                        }
                    );
                }
            );
        }
    );
};

Common.prototype.cattleCaracteristics = function () {
    const cattleCaracteristics = [
        {
            icon: 'https://mercadoagro-app.s3.amazonaws.com/images/home/female-icon.png',
        },
        {
            icon: 'https://mercadoagro-app.s3.amazonaws.com/images/home/male-icon.png',
        },
        {
            icon: 'https://mercadoagro-app.s3.amazonaws.com/images/home/cria-icon.png',
        },
        {
            icon: 'https://mercadoagro-app.s3.amazonaws.com/images/home/sheep-icon.png',
        },
        {
            icon: 'https://mercadoagro-app.s3.amazonaws.com/images/home/star-cow-icon.png',
        },
        {
            icon: 'https://mercadoagro-app.s3.amazonaws.com/images/home/star-sheep-icon.png',
        },
    ];

    return cattleCaracteristics;
};

Common.prototype.cattleImages = function (lotsIds, lots, callback) {

    if (lotsIds.length) {
        let __aux_lotsIds_query_string = Array(lotsIds.length).fill("?");
        for (let indexLot in lots) {
            if (!("imagesArray" in lots[indexLot])) {
                lots[indexLot].imagesArray = [];
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
                        for (let indexLot in lots) {
                            if (lots[indexLot].lotId == results[indexRes].lotId) {
                                lots[indexLot].imagesArray.push(results[indexRes].image);
                            }
                        }
                    }
                }

                let testVideoThumb = false;
                // Fill with empty image
                for (let indexLot in lots) {
                    if (!lots[indexLot].imagesArray.length) {
                        lots[indexLot].imagesArray.push("https://mercadoagro-backoffice.s3.amazonaws.com/videos/no-video-img.png?ver=2024-04-11");
                        if (!testVideoThumb) {
                            testVideoThumb = true;
                            Common.prototype.cattleImagesFromVideo(lots[indexLot].video, lots[indexLot].lotId, function () {
                            });
                        }
                    }
                }

                callback(lots);
            }
        );
    }
    else {
        callback([]);
    }
};


function processImages(images, index, results, callback) {
    modifLot.uploadImage(
        images[index].path,
        images[index].name,
        function (urlResult) {
            if (urlResult) {
                results.push(urlResult);
                fs.unlink(images[index].path, (err) => {
                    if (err) {
                        console.log("No se pudo eliminar la imagen: ", images[index].path);
                        console.log(err);
                    }
                });
            }

            if ((index + 1) < images.length) {
                processImages(images, index + 1, results, callback);
            }
            else {
                callback(results);
            }
        }
    );
};

Common.prototype.cattleImagesFromVideo = function (lotVideo, lotId, callback) {
    ffmpeg(lotVideo)
        .on('end', function () {
            images = [
                {
                    path: './routes/cattle/uploads/' + 'thumbnail-lot' + lotId + '-1.png',
                    name: 'thumbnail-lot' + lotId + '-1.png',
                }, {
                    path: './routes/cattle/uploads/' + 'thumbnail-lot' + lotId + '-2.png',
                    name: 'thumbnail-lot' + lotId + '-2.png',
                }, {
                    path: './routes/cattle/uploads/' + 'thumbnail-lot' + lotId + '-3.png',
                    name: 'thumbnail-lot' + lotId + '-3.png',
                },
            ];
            processImages(images, 0, [], function (lotImagesArrayS3) {
                modifLot.insertLotImages(lotId, lotImagesArrayS3, 0, function () {
                    callback();
                });
            });
        })
        .screenshots(
            {
                count: 3,
                filename: 'thumbnail-lot' + lotId + '-%i.png',
                folder: './routes/cattle/uploads'
            }
        );
};


module.exports = new Common();