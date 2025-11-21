const common_auth = require('../common_auth');
const commonFarms = require('./common');
const formidable = require('formidable');
const modifFarm = require('./modifFarm');

function processSubmitForm(viewParams, req, callback) {
    const form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        if (err) {
            callback({
                error: "Error al procesar los datos del cliente.",
                farm: 0,
                params: viewParams,
            });
        }
        else {
            modifFarm.uploadProfileImage(
                files,
                fields,
                function (replyUpImg) {
                    fields.imageToUploadUrl = replyUpImg.url;
                    commonFarms.societiesFielsIntoArray(
                        fields,
                        function (societiesParams) {
                            fields.societies = societiesParams;
                            viewParams.farm = fields;
                            if (viewParams.farm.societies.length) {
                                if (
                                    "name" in fields && fields.name &&
                                    "typeId" in fields && fields.typeId &&
                                    "exploitationId" in fields && fields.exploitationId
                                ) {

                                    if (replyUpImg.error) {
                                        callback({
                                            error: replyUpImg.error,
                                            farm: 0,
                                            params: viewParams,
                                        });
                                    }
                                    else {
                                        modifFarm.createfarm(
                                            fields,
                                            viewParams.userId,
                                            function (replyCreation) {
                                                callback({
                                                    error: replyCreation.error,
                                                    farm: replyCreation.farmId,
                                                    params: viewParams,
                                                });
                                            }
                                        );
                                    }
                                }
                                else {
                                    callback({
                                        error: "Falta completar al menos uno de estos datos: razón social, nombre fantasía y/o RUT/CUIT de la sociedad.",
                                        farm: 0,
                                        params: viewParams,
                                    });
                                }
                            } else {
                                callback({
                                    error: "Falta incluír al menos una persona como parte de la sociedad.",
                                    farm: 0,
                                    params: viewParams,
                                });
                            }
                        }
                    );
                }
            );
        }
    });
};

function Common() { }

Common.prototype.getViewParams = function (sessionID, callback) {
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
                    callback(
                        'farms/new',
                        indexParams,
                        "render"
                    );
                }
            );
        }
    });
};

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
            commonFarms.getViewParamsTemplate(
                reply.user,
                function (returnIndexParams) {
                    let indexParams = returnIndexParams;

                    processSubmitForm(
                        indexParams,
                        req,
                        function (returnAfterSubmit) {
                            indexParams = returnAfterSubmit.params;
                            if (returnAfterSubmit.error) {
                                indexParams.error = {
                                    msj: returnAfterSubmit.error,
                                    type: "error",
                                    farm: 0,
                                };
                            }
                            else {
                                indexParams.error = {
                                    msj: "Cliente creado correctamente!!",
                                    type: "success",
                                    farm: returnAfterSubmit.farm,
                                };
                                indexParams.farm = {
                                    societies: [],
                                };
                            }

                            callback(
                                'farms/new',
                                indexParams,
                                "render"
                            );
                        }
                    );
                }
            );
        }
    });
};

module.exports = new Common();