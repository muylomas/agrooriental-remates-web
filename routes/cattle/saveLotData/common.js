const connection = require('../../connection_db');
const common_auth = require('../../common_auth');

function savedLotReadyForAgent(savedLotId, callback) {
    connection.query(
        `
            UPDATE cattle_saved SET
                salesagentReady = 1
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

function Common() { }

Common.prototype.getSavedLotData = function (userId, savedLotId, internalLot, callback) {
    let outputLot = internalLot;

    if (savedLotId) {
        connection.query(
            `
                SELECT 
                    cattle_saved.*,
                    DATE_FORMAT(
                        cattle_saved.weightDate,
                        '%Y-%m-%d'
                    ) AS weightDate,
                    DATE_FORMAT(
                        cattle_saved.auctionStart,
                        '%Y-%m-%dT%H:%i:%s'
                    ) AS auctionStart,
                    DATE_FORMAT(
                        cattle_saved.auctionEnd,
                        '%Y-%m-%dT%H:%i:%s'
                    ) AS auctionEnd,
                    DATE_FORMAT(
                        cattle_saved.saleDate,
                        '%Y-%m-%dT%H:%i:%s'
                    ) AS saleDate
                FROM cattle_saved
                WHERE cattle_saved.id = ? AND cattle_saved.userId = ?
            `,
            [
                savedLotId,
                userId,
            ],
            function (err, results) {
                if (err) {
                    console.log(err);
                }
                else if (results.length) {
                    const dateRelatedFields = ["weightDate", "auctionStart", "auctionEnd", "saleDate"];
                    for (let index in results[0]) {
                        outputLot[index] = results[0][index];

                        if (index == "video") {
                            outputLot.videoToUploadUrl = results[0][index];
                        }

                        if (index == "images") {
                            const __aux_imageToUploadUrl = JSON.parse(results[0][index]);
                            for (let indImage in __aux_imageToUploadUrl) {
                                outputLot["imageToUploadUrl_" + __aux_imageToUploadUrl[indImage].sort] = __aux_imageToUploadUrl[indImage].image;

                            }
                        }

                        if (dateRelatedFields.includes(index) && results[0][index] && results[0][index].indexOf("0000-00-00") != -1)
                            outputLot[index] = "";

                        if (index == "breeds" && results[0][index]) {
                            outputLot["breedQuantity"] = JSON.parse(results[0][index]);
                        }

                        if (index == "ages" && results[0][index]) {
                            outputLot.teethQuantity = JSON.parse(results[0][index]);
                            for (let indTeeth in outputLot.teethQuantity) {
                                if (outputLot.teethQuantity[indTeeth])
                                    outputLot.teethQuantity[indTeeth].id = outputLot.teethQuantity[indTeeth].teethId;
                            }
                        }

                    }
                }

                callback(outputLot, savedLotId);
            }
        );
    }
    else {
        callback(outputLot, "");
    }
};

Common.prototype.deleteSavedLotDataByIdAndUserId = function (savedLotId, userId, callback) {

    connection.query(
        `
            UPDATE cattle_saved SET
                status = 0
            WHERE cattle_saved.id = ? AND cattle_saved.userId = ?
        `,
        [
            savedLotId,
            userId,
        ],
        function (err, results) {
            if (err) {
                console.log(err);
            }
            callback();
        }
    );
};

Common.prototype.deleteSavedLotData = function (sessionID, req, callback) {
    common_auth.basic(sessionID, function (reply) {
        if (reply.err) {
            callback('/login');
        }
        else {
            if (
                "body" in req &&
                "savedLotId" in req.body && req.body.savedLotId &&
                reply.user.id
            ) {
                Common.prototype.deleteSavedLotDataByIdAndUserId(
                    req.body.savedLotId,
                    reply.user.id,
                    function () {
                        callback('/ganado');
                    }
                )
            }
            else {
                callback('/ganado');
            }
        }

    });
};

Common.prototype.verifyContentByTab = function (fields, customerId, savedLotId, callback) {
    let verificationOutput = {
        "tab0": false,
        "tab1": false,
        "tab2": false,
        "tab3": false,
        "tab4": false,
        "tab5": false,
        lot: fields,
    };

    //--------------------------------------------------------------------------------
    // Tab0 verif.
    if (
        "farms" in fields && fields.farms.length &&
        "tick" in fields &&
        "mio" in fields
    ) {
        verificationOutput.tab0 = true;
    }
    //--------------------------------------------------------------------------------

    //--------------------------------------------------------------------------------
    // Tab1 verif.
    verificationOutput.tab1 = true;
    if (!("totalLotQuantity" in fields) || !parseInt(fields.totalLotQuantity)) {
        verificationOutput.tab1 = false;
    }
    //--------------------------------------------------------------------------------

    //--------------------------------------------------------------------------------
    // Tab2 verif.
    // fields allready in select and radios
    verificationOutput.tab2 = true;
    //--------------------------------------------------------------------------------

    //--------------------------------------------------------------------------------
    // Tab3 verif.
    if ("weightMean" in fields && fields.weightMean && parseInt(fields.weightMean) > 1) {
        verificationOutput.tab3 = true;
    }
    //--------------------------------------------------------------------------------

    //--------------------------------------------------------------------------------
    // Tab4 verif.
    if (
        "startPrice" in fields && fields.startPrice && parseInt(fields.startPrice) > 0 &&
        "salePrice" in fields && fields.salePrice && parseInt(fields.salePrice) > 0 &&
        "paymentTermId" in fields && fields.paymentTermId
    ) {
        verificationOutput.tab4 = true;
    }
    //--------------------------------------------------------------------------------

    //--------------------------------------------------------------------------------
    // Tab5 verif.
    if (fields.videoToUploadUrl) {
        verificationOutput.tab5 = true;
    }
    //--------------------------------------------------------------------------------

    /*if (
        verificationOutput.tab0 &&
        verificationOutput.tab1 &&
        verificationOutput.tab3 &&
        verificationOutput.tab4 &&
        verificationOutput.tab5
    ) {
        savedLotReadyForAgent(
            fields,
            customerId,
            savedLotId,
            function () {
                callback(verificationOutput);
            }
        );
    }
    else {
        callback(verificationOutput);
    }*/

    callback(verificationOutput);
};

module.exports = new Common();