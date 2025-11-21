const connection = require('../connection_db');
const common_auth = require('../common_auth');
const formidable = require('formidable');
const modifLot = require('./modifLot');
const commonCattle = require('./common');

function processSubmitForm(userId, req, callback) {
    const form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        if (err) {
            callback(false);
        }
        else {
            commonCattle.societiesFielsIntoArray(
                fields,
                function (societiesParams) {
                    fields.societies = societiesParams;
                    if (fields.societies.length) {
                        if (
                            "name" in fields && fields.name &&
                            "typeId" in fields && fields.typeId &&
                            "exploitationId" in fields && fields.exploitationId
                        ) {
                            modifLot.uploadProfileImage(
                                files,
                                fields,
                                function (replyUpImg) {
                                    fields.imageToUploadUrl = replyUpImg.url;
                                    modifLot.updatelot(
                                        fields,
                                        userId,
                                        function () {
                                            callback(fields.lotId);
                                        }
                                    );
                                }
                            );
                        }
                        else {
                            callback(fields.lotId);
                        }
                    } else {
                        if ("lotId" in fields && fields.lotId)
                            callback(fields.lotId);
                        else
                            callback(false);
                    }
                }
            );
        }
    });
};

function Common() { }

Common.prototype.submit = function (sessionID, req, callback) {
    common_auth.basic(sessionID, function (reply) {
        if (reply.err) {
            callback(
                '/login',
                {},
                "redirect"
            );
        }
        else {
            processSubmitForm(
                reply.user.id,
                req,
                function (lotId) {

                    callback('/ganado/perfil/' + lotId);
                }
            );
        }
    });
};

Common.prototype.updateAuctionEnd = function (sessionID, req, callback) {

    common_auth.basic(sessionID, function (reply) {
        if (reply.err) {
            callback(
                '/login',
                {},
                "redirect"
            );
        }
        else {
            if (
                "body" in req &&
                "lotId" in req.body && req.body.lotId &&
                "endAuction" in req.body && req.body.endAuction
            ) {
                let sqlUpdate = "";
                switch (req.body.endAuction) {
                    case '30mins':
                        sqlUpdate =
                            `
                                UPDATE cattle SET
                                auctionEnd = auctionEnd + INTERVAL 30 MINUTE
                                WHERE id = ?
                            `;
                        break;
                    case '5mins':
                        sqlUpdate =
                            `
                                UPDATE cattle SET
                                auctionEnd = auctionEnd + INTERVAL 5 MINUTE
                                WHERE id = ?
                            `;
                        break;
                    case 'end':
                        sqlUpdate =
                            `
                                UPDATE cattle SET
                                auctionEnd = NOW() - INTERVAL 3 HOUR
                                WHERE id = ?
                            `;
                        break;
                    case 'start12h':
                        sqlUpdate =
                            `
                                UPDATE cattle SET
                                auctionEnd = NOW() - INTERVAL 3 HOUR + INTERVAL 12 HOUR
                                WHERE id = ?
                            `;
                        break;
                    case 'start1d':
                        sqlUpdate =
                            `
                                UPDATE cattle SET
                                auctionEnd = NOW() - INTERVAL 3 HOUR + INTERVAL 1 DAY
                                WHERE id = ?
                            `;
                        break;
                }

                if (sqlUpdate) {
                    connection.query(
                        sqlUpdate,
                        [
                            req.body.lotId,
                        ],
                        function (err, results) {
                            if (err) {
                                console.log(err);
                            }

                            callback(req.body.lotId);
                        }
                    );
                }
                else {
                    callback(req.body.lotId);
                }
            }
            else if ("body" in req && req.body.lotId) {
                callback(req.body.lotId);
            }
            else {
                callback(false);
            }
        }
    });
};

module.exports = new Common();