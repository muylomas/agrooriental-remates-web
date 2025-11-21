const common_auth = require('../common_auth');
const common_customer = require('./common');
const formidable = require('formidable');
const modifCustomer = require('./modifCustomer');

function processSubmitForm(viewParams, req, callback) {
    const form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        if (err) {
            callback({
                error: "Error al procesar los datos del cliente.",
                customer: 0,
                params: viewParams,
            });
        }
        else {
            modifCustomer.uploadProfileImage(
                files,
                fields,
                function (replyUpImg) {

                    fields.imageToUploadUrl = replyUpImg.url;
                    viewParams.customer = fields;
                    if (
                        "name" in fields && fields.name &&
                        "surname" in fields && fields.surname &&
                        "email" in fields && fields.email &&
                        "dicose" in fields && fields.dicose &&
                        "typeId" in fields && fields.typeId
                    ) {

                        if (replyUpImg.error) {
                            callback({
                                error: replyUpImg.error,
                                customer: 0,
                                params: viewParams,
                            });
                        }
                        else {
                            modifCustomer.createCustomer(
                                fields,
                                viewParams.userId,
                                function (replyCreation) {
                                    callback({
                                        error: replyCreation.error,
                                        customer: replyCreation.customerId,
                                        params: viewParams,
                                    });
                                }
                            );
                        }
                    }
                    else {
                        callback({
                            error: "Falta completar al menos uno de estos datos: nombre, apellido, DICOSE, email y/o tipo del cliente.",
                            customer: 0,
                            params: viewParams,
                        });
                    }
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
            common_customer.getViewParamsTemplate(
                reply.user,
                function (returnIndexParams) {
                    let indexParams = returnIndexParams;
                    callback(
                        'customers/new',
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
            common_customer.getViewParamsTemplate(
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
                                    customer: 0,
                                };
                            }
                            else {
                                indexParams.error = {
                                    msj: "Cliente creado correctamente!!",
                                    type: "success",
                                    customer: returnAfterSubmit.customer,
                                };
                                indexParams.customer = {};
                            }

                            callback(
                                'customers/new',
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