const common_auth = require('../common_auth');
const commonSocieties = require('./common');
const formidable = require('formidable');
const modifSociety = require('./modifSociety');

function processSubmitForm(viewParams, req, callback) {
    const form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        if (err) {
            callback({
                error: "Error al procesar los datos del cliente.",
                society: 0,
                params: viewParams,
            });
        }
        else {

            modifSociety.uploadProfileImage(
                files,
                fields,
                function (replyUpImg) {
                    fields.imageToUploadUrl = replyUpImg.url;
                    commonSocieties.customersFielsIntoArray(
                        fields,
                        function (customersParams) {
                            fields.customers = customersParams;
                            viewParams.society = fields;
                            if (viewParams.society.customers.length) {
                                if (
                                    "name" in fields && fields.name &&
                                    "company" in fields && fields.company &&
                                    "rut" in fields && fields.rut &&
                                    "dicose" in fields && fields.dicose
                                ) {

                                    if (replyUpImg.error) {
                                        callback({
                                            error: replyUpImg.error,
                                            society: 0,
                                            params: viewParams,
                                        });
                                    }
                                    else {
                                        modifSociety.createSociety(
                                            fields,
                                            viewParams.userId,
                                            function (replyCreation) {
                                                callback({
                                                    error: replyCreation.error,
                                                    society: replyCreation.societyId,
                                                    params: viewParams,
                                                });
                                            }
                                        );
                                    }
                                }
                                else {
                                    callback({
                                        error: "Falta completar al menos uno de estos datos: razón social, nombre fantasía y/o RUT/CUIT de la sociedad.",
                                        society: 0,
                                        params: viewParams,
                                    });
                                }
                            } else {
                                callback({
                                    error: "Falta incluír al menos una persona como parte de la sociedad.",
                                    society: 0,
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
            commonSocieties.getViewParamsTemplate(
                reply.user,
                function (returnIndexParams) {
                    let indexParams = returnIndexParams;
                    callback(
                        'societies/new',
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
            commonSocieties.getViewParamsTemplate(
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
                                    society: 0,
                                };
                            }
                            else {
                                indexParams.error = {
                                    msj: "Cliente creado correctamente!!",
                                    type: "success",
                                    society: returnAfterSubmit.society,
                                };
                                indexParams.society = {
                                    customers: [],
                                };
                            }

                            callback(
                                'societies/new',
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