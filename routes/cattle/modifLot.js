const connection = require('../connection_db');
const common_gral = require('../common_gral');
const fs = require('fs');
const sha512 = require('js-sha512');
const aws_s3_uploader = require('../aws_s3_uploader');
const commonSaveLotData = require('./saveLotData/common');

function savedLotFinishInput(savedLotId, callback) {
    connection.query(
        `
            UPDATE cattle_saved SET
                salesagentReady = 1,
                salesagent = 18,
                userId = 18,
                status = 1
            WHERE 
                cattle_saved.id = ? AND 
                cattle_saved.userId = 0 AND 
                cattle_saved.customerId IS NOT NULL AND cattle_saved.customerId > 0
        `,
        [
            savedLotId,
        ],
        function (err, results) {
            if (err) {
                console.log(err);
            }
            callback();
        }
    );
};

function insertLotBreeds(lotId, fields, callback) {
    let lotBreedQuantityArray = [];
    let lotBreedQuantityQueryString = [];
    for (indField in fields.breedQuantity) {
        if (
            fields.breedQuantity[indField].breedId &&
            fields.breedQuantity[indField].quantity
        ) {
            let __aux_females = 0;
            if (fields.breedQuantity[indField].females) {
                __aux_females = fields.breedQuantity[indField].females;
            }
            lotBreedQuantityArray.push(lotId);
            lotBreedQuantityArray.push(fields.breedQuantity[indField].breedId);
            lotBreedQuantityArray.push(fields.breedQuantity[indField].crossBreedId);
            lotBreedQuantityArray.push(fields.breedQuantity[indField].quantity);
            lotBreedQuantityArray.push(__aux_females);
            lotBreedQuantityQueryString.push("(?, ?, ?, ?, ?, 1)");
        }
    }

    if (lotBreedQuantityArray.length) {
        connection.query(
            `
                UPDATE cattle_lots_breeds SET
                    status = 0
                WHERE
                    lotId = ?
            `,
            [
                lotId,
            ],
            function (err, results) {
                if (err) {
                    console.log(err);
                }

                connection.query(
                    `
                        INSERT INTO cattle_lots_breeds 
                            (lotId, breedId, crossBreedId, quantity, females, status) 
                            VALUES ` + lotBreedQuantityQueryString.join() + `
                    `,
                    lotBreedQuantityArray,
                    function (err, results) {
                        if (err) {
                            console.log(err);
                        }

                        callback(lotId);
                    }
                );
            }
        );
    }
    else {
        callback(lotId)
    }
};

function lotBreedsObject(fields) {
    let lotBreedQuantityArray = [];
    for (indField in fields.breedQuantity) {
        if (
            fields.breedQuantity[indField].breedId &&
            fields.breedQuantity[indField].quantity
        ) {
            let __aux_females = 0;
            if (fields.breedQuantity[indField].females) {
                __aux_females = fields.breedQuantity[indField].females;
            }
            lotBreedQuantityArray.push(
                {
                    breedId: fields.breedQuantity[indField].breedId,
                    crossBreedId: fields.breedQuantity[indField].crossBreedId,
                    quantity: fields.breedQuantity[indField].quantity,
                    females: __aux_females,
                }
            );
        }
    }

    return lotBreedQuantityArray;
};

function insertLotAges(lotId, fields, callback) {
    let lotAgesQuantityArray = [];
    let lotAgesQuantityQueryString = [];
    if (fields.typeId) {
        if ("teethQuantity" in fields && fields.teethQuantity.length) {
            for (indField in fields.teethQuantity) {
                if (
                    fields.teethQuantity[indField].id &&
                    fields.teethQuantity[indField].quantity
                ) {
                    lotAgesQuantityArray.push(lotId);
                    lotAgesQuantityArray.push(fields.typeId);
                    lotAgesQuantityArray.push(fields.teethQuantity[indField].quantity);
                    lotAgesQuantityArray.push(fields.teethQuantity[indField].id);
                    lotAgesQuantityQueryString.push("(?, ?, ?, ?, 1)");
                }
            }
        }
        else if ("ageQuantity" in fields && fields.ageQuantity.length) {
            for (indField in fields.ageQuantity) {
                if (
                    fields.ageQuantity[indField].id &&
                    fields.ageQuantity[indField].quantity
                ) {
                    lotAgesQuantityArray.push(lotId);
                    lotAgesQuantityArray.push(fields.typeId);
                    lotAgesQuantityArray.push(fields.ageQuantity[indField].quantity);
                    lotAgesQuantityArray.push(fields.ageQuantity[indField].id);
                    lotAgesQuantityQueryString.push("(?, ?, ?, ?, 1)");
                }
            }
        }

        if (lotAgesQuantityArray.length) {
            connection.query(
                `
                    UPDATE cattle_lots_ages SET
                        status = 0
                    WHERE
                        lotId = ?
                `,
                [
                    lotId,
                ],
                function (err, results) {
                    if (err) {
                        console.log(err);
                    }
                    connection.query(
                        `
                            INSERT INTO cattle_lots_ages 
                                (lotId, typeId, quantity, teethId, status) 
                                VALUES ` + lotAgesQuantityQueryString.join() + `
                        `,
                        lotAgesQuantityArray,
                        function (err, results) {
                            if (err) {
                                console.log(err);
                            }

                            callback(lotId);
                        }
                    );
                }
            );
        }
        else {
            callback(lotId)
        }
    }
    else {
        callback(lotId)
    }
};

function lotAgesObject(fields) {
    let lotAgesQuantityArray = [];

    if (fields.typeId) {
        if ("teethQuantity" in fields && fields.teethQuantity.length) {
            for (indField in fields.teethQuantity) {
                if (
                    fields.teethQuantity[indField].id &&
                    fields.teethQuantity[indField].quantity
                ) {
                    lotAgesQuantityArray.push(
                        {
                            typeId: fields.typeId,
                            quantity: fields.teethQuantity[indField].quantity,
                            teethId: fields.teethQuantity[indField].id,
                        }
                    );
                }
            }
        }
        else if ("ageQuantity" in fields && fields.ageQuantity.length) {
            for (indField in fields.ageQuantity) {
                if (
                    fields.ageQuantity[indField].id &&
                    fields.ageQuantity[indField].quantity
                ) {
                    lotAgesQuantityArray.push(
                        {
                            typeId: fields.typeId,
                            quantity: fields.ageQuantity[indField].quantity,
                            teethId: fields.ageQuantity[indField].id,
                        }
                    );
                }
            }
        }

    }

    return lotAgesQuantityArray;
};

function publishLotForAuction(fields, customerId, savedLotId, callback) {
    Common.prototype.createlot(
        fields,
        customerId,
        function (params) {
            savedLotFinishInput(
                savedLotId,
                function () {
                    callback();
                }
            );
        }
    );
};

function Common() { }

Common.prototype.insertLotImages = function (lotId, lotImagesArray, customerId, callback) {
    if (lotImagesArray.length) {
        let lotImagesQueryString = [];
        for (indImage in lotImagesArray) {
            lotImagesQueryString.push("(" + lotId + ",?," + customerId + "," + (parseInt(indImage) + 1) + ",1)");
        }

        connection.query(
            `
                UPDATE cattle_images SET
                    status = 0
                WHERE
                    lotId = ?
            `,
            [
                lotId,
            ],
            function (err, results) {
                if (err) {
                    console.log(err);
                }
                connection.query(
                    `
                        INSERT INTO cattle_images 
                            (lotId, image, customerId, sort, status) 
                            VALUES ` + lotImagesQueryString.join() + `
                    `,
                    lotImagesArray,
                    function (err, results) {
                        if (err) {
                            console.log(err);
                        }

                        callback(lotId);
                    }
                );
            }
        );
    }
    else {
        callback(lotId)
    }
};

function insertLotImagesFromInput(lotId, fields, customerId, callback) {
    let lotImagesArray = [];
    let lotImagesQueryString = [];
    for (indField in fields.imageToUploadUrl) {
        lotImagesArray.push(fields.imageToUploadUrl[indField]);
        lotImagesQueryString.push("(" + lotId + ",?," + customerId + "," + (parseInt(indField) + 1) + ",1)");
    }

    if (lotImagesArray.length) {
        Common.prototype.insertLotImages(
            lotId,
            lotImagesArray,
            customerId,
            function (returnLotId) {
                callback(returnLotId);
            }
        );
    }
    else {
        callback(lotId)
    }
};

function lotMediaObject(fields) {
    let lotImagesArray = [];
    for (indField in fields.imageToUploadUrl) {
        lotImagesArray.push(
            {
                image: fields.imageToUploadUrl[indField],
                sort: parseInt(indField) + 1,
            }
        );
    }

    return lotImagesArray;
};

Common.prototype.createlot = function (fields, customerId, callback) {
    const __aux_checkboxes = [
        { id: "tick", empty: 0 }, { id: "mio", empty: 0 }, { id: "typeId", empty: 0 },
        { id: "feedingId", empty: 0 }, { id: "ration", empty: 0 }, { id: "calves", empty: 0 }, { id: "weaning", empty: 0 },
        { id: "caped", empty: 0 }, { id: "entire", empty: 0 }, { id: "mochos", empty: 0 }, { id: "astados", empty: 0 },
        { id: "mochados", empty: 0 }, { id: "tocos", empty: 0 },
        { id: "birthSeason", empty: "" },
        { id: "weightedPercentage", empty: 0 }, { id: "weightMean", empty: 0 }, { id: "weightMin", empty: 0 }, { id: "weightMax", empty: 0 },
        { id: "weightConfinement", empty: 0 }, { id: "weightDate", empty: 0 }, { id: "weightComment", empty: "" },
        { id: "weightDestare", empty: 0 }, { id: "weightCalvesMean", empty: 0 },
        { id: "currencyId", empty: 1 }, { id: "salePrice", empty: 0 }, { id: "startPrice", empty: 0 }, { id: "stepPrice", empty: 0 },
        { id: "auctionPriceType", empty: 0 },
        { id: "paymentTermId", empty: 0 }, { id: "bodyStatus", empty: 0 }, { id: "health", empty: "" }, { id: "certified", empty: 0 },
        { id: "explanations", empty: "" }, { id: "consignee", empty: 0 },
    ];

    let __aux_insertString = [
        "video = ? ",
        "farmId = ? ",
        "customerId = ? ",
        "salesagent = 18 ",
        "userId = 18 ",
        "weighed = 1 ",
        "reproductiveStatusId = 100 ",
        "pregnancyDiagnosisId = 100 ",
        "rating = 100 ",
        "auctionStart = NOW() - INTERVAL 3 HOUR ",
        "auctionEnd = NOW() + INTERVAL 2 DAY - INTERVAL 3 HOUR ",
    ];
    let __aux_insertArray = [
        fields.videoToUploadUrl,
        fields.farms[0].id,
        customerId,
    ];

    for (let index in __aux_checkboxes) {
        if (!fields[__aux_checkboxes[index].id]) {
            fields[__aux_checkboxes[index].id] = __aux_checkboxes[index].empty;
        }

        __aux_insertString.push(__aux_checkboxes[index].id + " = ? ");
        __aux_insertArray.push(fields[__aux_checkboxes[index].id]);
    }

    connection.query(
        "INSERT INTO cattle SET status = 5, " + __aux_insertString.join(),
        __aux_insertArray,
        function (err, results) {
            if (err) {
                console.log(err);
                let __aux_error = err.toString();
                callback({
                    error: __aux_error,
                    lotId: false,
                });
            }
            else if (results.insertId) {
                insertLotImagesFromInput(
                    results.insertId,
                    fields,
                    customerId,
                    function (lotId) {
                        insertLotBreeds(
                            lotId,
                            fields,
                            function (lotId) {
                                insertLotAges(
                                    lotId,
                                    fields,
                                    function (lotId) {
                                        callback({
                                            error: false,
                                            lotId: lotId,
                                        });
                                    }
                                );
                            }
                        );
                    }
                );
            }
            else {
                callback({
                    error: "No se pudieron procesar los datos del lote.",
                    lotId: false,
                });
            }
        }
    );
};

Common.prototype.savelot = function (fields, customerId, callback) {

    const __aux_checkboxes = [
        { id: "tick", empty: 0 }, { id: "mio", empty: 0 }, { id: "typeFamily", empty: 0 }, { id: "typeId", empty: 0 },
        { id: "feedingId", empty: 0 }, { id: "ration", empty: 0 }, { id: "calves", empty: 0 }, { id: "weaning", empty: 0 },
        { id: "caped", empty: 0 }, { id: "entire", empty: 0 }, { id: "mochos", empty: 0 }, { id: "astados", empty: 0 },
        { id: "mochados", empty: 0 }, { id: "tocos", empty: 0 }, { id: "reproductiveStatusId", empty: 1 },
        { id: "pregnancyDiagnosisId", empty: 0 }, { id: "birthSeason", empty: "" }, { id: "weighed", empty: 0 },
        { id: "weightedPercentage", empty: 0 }, { id: "weightMean", empty: 0 }, { id: "weightMin", empty: 0 }, { id: "weightMax", empty: 0 },
        { id: "weightConfinement", empty: 0 }, { id: "weightDate", empty: 0 }, { id: "weightComment", empty: "" },
        { id: "weightDestare", empty: 0 }, { id: "weightCalvesMean", empty: 0 },
        { id: "currencyId", empty: 1 }, { id: "salePrice", empty: 0 }, { id: "startPrice", empty: 0 }, { id: "stepPrice", empty: 0 },
        { id: "auctionPriceType", empty: 1 }, { id: "auctionStart", empty: 0 }, { id: "auctionEnd", empty: 0 },
        { id: "paymentTermId", empty: 0 }, { id: "bodyStatus", empty: 0 }, { id: "health", empty: "" }, { id: "certified", empty: 0 },
        { id: "rating", empty: "" }, { id: "explanations", empty: "" }, { id: "consignee", empty: 0 },
    ];
    let __aux_insertString = [
        "video = ? ",
        "farmId = ? ",
        "societyId = ? ",
        "customerId = ? ",
        "salesagent = ? ",
    ];
    let __aux_insertArray = [
        fields.videoToUploadUrl ? fields.videoToUploadUrl : "",
        fields.farms[0].id,
        fields.farms[0].societyId ? fields.farms[0].societyId : 0,
        customerId,
        fields.salesagents[0] ? fields.salesagents[0] : 0,
    ];

    for (let index in __aux_checkboxes) {
        if (!fields[__aux_checkboxes[index].id]) {
            fields[__aux_checkboxes[index].id] = __aux_checkboxes[index].empty;
        }

        if (__aux_checkboxes[index].id == "auctionEnd") {
            __aux_insertString.push(__aux_checkboxes[index].id + " = IF( ? < ? + INTERVAL 2 HOUR, ? + INTERVAL 2 HOUR, IF( ? > ? + INTERVAL 3 DAY, ? + INTERVAL 3 DAY, ?)) ");
            __aux_insertArray.push(fields["auctionEnd"]);
            __aux_insertArray.push(fields["auctionStart"]);
            __aux_insertArray.push(fields["auctionStart"]);
            __aux_insertArray.push(fields["auctionEnd"]);
            __aux_insertArray.push(fields["auctionStart"]);
            __aux_insertArray.push(fields["auctionStart"]);
            __aux_insertArray.push(fields["auctionEnd"]);
        }
        else {
            __aux_insertString.push(__aux_checkboxes[index].id + " = ? ");
            __aux_insertArray.push(fields[__aux_checkboxes[index].id]);
        }
    }

    __aux_insertString.push("images = ? ");
    __aux_insertArray.push(JSON.stringify(lotMediaObject(fields)));

    __aux_insertString.push("breeds = ? ");
    __aux_insertArray.push(JSON.stringify(lotBreedsObject(fields)));

    __aux_insertString.push("ages = ? ");
    __aux_insertArray.push(JSON.stringify(lotAgesObject(fields)));

    let __aux_insertUpdate_query = "INSERT INTO cattle_saved SET status = 1, " + __aux_insertString.join();
    if (fields["savedLotId"]) {
        __aux_insertUpdate_query =
            "UPDATE cattle_saved SET status = 1, " + __aux_insertString.join() + " WHERE id = ? ";
        __aux_insertArray.push(fields["savedLotId"]);
    }

    connection.query(
        __aux_insertUpdate_query,
        __aux_insertArray,
        function (err, results) {
            let __aux_error = false;
            let __aux_savedLotId = false;

            if (err) {
                console.log(err);
                __aux_error = err.toString();
                __aux_savedLotId = fields["savedLotId"];
            }
            else {
                if (fields["savedLotId"]) {
                    __aux_savedLotId = fields["savedLotId"];
                }
                else if (results.insertId) {
                    __aux_savedLotId = results.insertId;
                }
                else {
                    __aux_error = "No se pudieron procesar los datos del lote.";
                }
            }

            commonSaveLotData.verifyContentByTab(
                fields,
                customerId,
                __aux_savedLotId,
                function (verifyContentByTabReply) {

                    if (
                        verifyContentByTabReply.tab0 &&
                        verifyContentByTabReply.tab1 &&
                        verifyContentByTabReply.tab3 &&
                        verifyContentByTabReply.tab4 &&
                        verifyContentByTabReply.tab5
                    ) {
                        publishLotForAuction(
                            fields,
                            customerId,
                            __aux_savedLotId,
                            function () {
                                callback({
                                    error: __aux_error,
                                    lotId: __aux_savedLotId,
                                    tabStatuses: verifyContentByTabReply,
                                });
                            }
                        );
                    }
                    else {
                        callback({
                            error: __aux_error,
                            lotId: __aux_savedLotId,
                            tabStatuses: verifyContentByTabReply,
                        });
                    }
                }
            );
        }
    );
};

Common.prototype.uploadVideo = function (files, fields, callback) {
    if ("videoToUploadUrl" in fields && fields.videoToUploadUrl) {
        callback({
            error: false,
            url: fields.videoToUploadUrl,
        });
    }
    else if ("videoToUpload" in files && "path" in files.videoToUpload && files.videoToUpload.path &&
        "videoFileName" in fields && fields.videoFileName
    ) {
        const fileContent = fs.readFileSync(files.videoToUpload.path);
        const fileNameExtMime = common_gral.fileNameExt(fields.videoFileName);
        const timestamp_seconds = new Date().getTime() / 1000;
        const __aux_filename =
            sha512(
                common_gral.randomString(12) +
                timestamp_seconds + "-" +
                (10000 + Math.floor(Math.random() * 1000)).toString()
            ) + "." + fileNameExtMime.extension;
        const __aux_filen_relative_path = 'videos/cattle/' + __aux_filename;

        aws_s3_uploader.uploadFile(
            'agro-oriental-remates',
            __aux_filen_relative_path,
            fileContent,
            'base64',
            fileNameExtMime.mimeType,
            'public-read',
            function (error) {
                if (error) {
                    console.log(error);
                    callback({
                        error: "No se pudo guardar el video",
                        url: "",
                    });
                }
                else {
                    callback({
                        error: false,
                        url:
                            "https://agro-oriental-remates.s3.us-west-1.amazonaws.com/" +
                            __aux_filen_relative_path,
                    });
                }
            }
        );
    }
    else {
        callback({
            error: false,
            url: "",
        });
    }
};

Common.prototype.uploadImage = function (filePath, fileName, callback) {
    const fileContent = fs.readFileSync(filePath);
    const fileNameExtMime = common_gral.fileNameExt(fileName);
    const timestamp_seconds = new Date().getTime() / 1000;
    const __aux_filename =
        sha512(
            common_gral.randomString(12) +
            timestamp_seconds + "-" +
            (10000 + Math.floor(Math.random() * 1000)).toString()
        ) + "." + fileNameExtMime.extension;
    const __aux_filen_relative_path = 'images/cattle/images/' + __aux_filename;

    aws_s3_uploader.uploadFile(
        'agro-oriental-remates',
        __aux_filen_relative_path,
        fileContent,
        'base64',
        fileNameExtMime.mimeType,
        'public-read',
        function (error) {
            if (error) {
                console.log(error);
                callback(false);
            }
            else {
                callback(
                    "https://agro-oriental-remates.s3.us-west-1.amazonaws.com/" +
                    __aux_filen_relative_path,
                );
            }
        }
    );
};

function processImages(files, fields, index, imagesIndexes, results, callback) {
    const _aux_iindex = imagesIndexes[index];
    if ("imageToUploadUrl_" + _aux_iindex in fields && fields["imageToUploadUrl_" + _aux_iindex]) {
        callback(fields["imageToUploadUrl_" + _aux_iindex]);
    }
    else if (
        ("imageToUpload_" + _aux_iindex) in files &&
        "path" in files["imageToUpload_" + _aux_iindex] && files["imageToUpload_" + _aux_iindex].path &&
        ("fileName_" + _aux_iindex) in fields && fields["fileName_" + _aux_iindex]
    ) {
        Common.prototype.uploadImage(
            files["imageToUpload_" + _aux_iindex].path,
            fields["fileName_" + _aux_iindex],
            function (urlResult) {
                if (urlResult) {
                    results.push(urlResult);
                }

                if ((index + 1) < imagesIndexes.length) {
                    processImages(files, fields, index + 1, imagesIndexes, results, callback);
                }
                else {
                    callback(results);
                }
            }
        );
    }
    else {
        callback(results);
    }
};

Common.prototype.uploadImagesSet = function (files, fields, callback) {
    let imagesIndexes = [];
    for (let index in fields) {
        if (index.indexOf("imageToUploadUrl_") != -1) {
            imagesIndexes.push(parseInt(index.replace("imageToUploadUrl_", "")));
        }
        else if (index.indexOf("imageToUpload_") != -1) {
            imagesIndexes.push(parseInt(index.replace("imageToUpload_", "")));
        }
    }

    if (imagesIndexes.length) {
        processImages(
            files,
            fields,
            0,
            imagesIndexes,
            [],
            function (imageUrlArray) {
                callback(imageUrlArray);
            }
        );
    }
    else {
        callback([]);
    }

};

Common.prototype.updatelot = function (fields, customerId, callback) {
    if (fields.lotOwner != "1") {
        fields.lotOwner = 0;
    }

    if (fields.lotRented != "1") {
        fields.lotRented = 0;
    }

    if (!fields.surface) {
        fields.surface = 0;
    }

    connection.query(
        `
            UPDATE cattle SET 
                video = ?,
                farmId = ?,
                tick = ?,
                mio = ?,
                type = ?,
                exploitation = ?,
                owner = ?,
                rented = ?,
                customerId = ?,
                status = 1
            WHERE
                id = ?
        `,
        [
            fields.imageToUploadUrl,
            fields.name.toUpperCase().trim(),
            fields.tick,
            fields.mio,
            fields.typeId,
            fields.exploitationId,
            fields.lotOwner,
            fields.lotRented,
            customerId,
            fields.lotId,
        ],
        function (err, results) {
            if (err) {
                console.log(err);
                callback();
            }
            else {
                insertLotImagesFromInput(
                    fields.lotId,
                    fields,
                    customerId,
                    function (lotId) {
                        insertLotBreeds(
                            lotId,
                            fields,
                            function (lotId) {
                                insertLotAges(
                                    lotId,
                                    fields,
                                    function (lotId) {
                                        callback();
                                    }
                                );
                            }
                        );
                    }
                );
            }
        }
    );
};

module.exports = new Common();