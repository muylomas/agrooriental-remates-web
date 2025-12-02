const connection = require('../connection_db');
const common_auth = require('../common_auth');
const formidable = require('formidable');
const modifFarm = require('./modifFarm');
const commonFarms = require('./common');

function processSubmitForm(userId, req, callback) {
    const form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        if (err) {
            callback(false);
        }
        else {
            commonFarms.societiesFielsIntoArray(
                fields,
                function (societiesParams) {
                    fields.societies = societiesParams;
                    if (fields.societies.length) {
                        if (
                            "name" in fields && fields.name &&
                            "typeId" in fields && fields.typeId &&
                            "exploitationId" in fields && fields.exploitationId
                        ) {
                            modifFarm.uploadProfileImage(
                                files,
                                fields,
                                function (replyUpImg) {
                                    fields.imageToUploadUrl = replyUpImg.url;
                                    modifFarm.updatefarm(
                                        fields,
                                        userId,
                                        function () {
                                            callback(fields.farmId);
                                        }
                                    );
                                }
                            );
                        }
                        else {
                            callback(fields.farmId);
                        }
                    } else {
                        if ("farmId" in fields && fields.farmId)
                            callback(fields.farmId);
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
                function (farmId) {

                    callback('/establecimientos/perfil/' + farmId);
                }
            );
        }
    });
};

Common.prototype.getViewParams = function (sessionID, farmId, callback) {
    common_auth.basic(sessionID, function (reply) {
        if (reply.err) {
            callback(
                '/login',
                {},
                "redirect"
            );
        }
        else {
            commonFarms.getViewParamsTemplate(
                reply.user,
                function (returnIndexParams) {
                    let indexParams = returnIndexParams;
                    connection.query(
                        `
                            SELECT 
                                farms_complete.*,
                                societies.id AS societyId,
                                societies.name AS societyName,
                                societies.company AS societyCompany,
                                societies.rut AS societyRut,
                                IF(
                                    societies.image IS NULL OR societies.image = "",
                                    "https://agro-oriental-remates.s3.us-west-1.amazonaws.com/images/societies/no-profile-img.png",
                                    societies.image
                                ) AS societyImage
                            FROM farms_complete
                            INNER JOIN clients_farms ON clients_farms.societyId = farms_complete.farmId AND clients_farms.status = 1
                            INNER JOIN clients_societies ON clients_societies.clientId = clients_farms.clientId AND clients_societies.status = 1
                            INNER JOIN societies ON societies.id = clients_societies.societyId
                            WHERE farms_complete.farmId = ?
                        `,
                        [
                            farmId,
                        ],
                        function (err, results) {
                            indexParams.farm = {};
                            if (err) {
                                console.log(err);
                            }
                            else if (results.length) {
                                indexParams.farm = results[0];
                                indexParams.farm.societies = [];
                                for (let index in results) {
                                    indexParams.farm.societies.push(
                                        {
                                            id: results[index].societyId,
                                            name: results[index].societyName,
                                            company: results[index].societyCompany,
                                            image: results[index].societyImage,
                                            rut: results[index].societyRut
                                        }
                                    );
                                }
                            }

                            if (indexParams.farm.farmId) {
                                callback(
                                    'farms/update',
                                    indexParams,
                                    "render"
                                );
                            }
                            else {
                                callback(
                                    '/establecimientos',
                                    {},
                                    "redirect"
                                );
                            }
                        }
                    );
                }
            );
        }
    });
};

module.exports = new Common();