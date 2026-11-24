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