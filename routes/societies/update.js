const common_auth = require('../common_auth');
const formidable = require('formidable');
const modifSociety = require('./modifSociety');
const commonSocieties = require('./common');

function processSubmitForm(userId, req, callback) {
    const form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        if (err) {
            callback(false);
        }
        else {
            commonSocieties.customersFielsIntoArray(
                fields,
                function (customersParams) {
                    fields.customers = customersParams;
                    if (fields.customers.length) {
                        if (
                            "societyId" in fields && fields.societyId &&
                            "name" in fields && fields.name &&
                            "company" in fields && fields.company &&
                            "rut" in fields && fields.rut
                        ) {
                            modifSociety.uploadProfileImage(
                                files,
                                fields,
                                function (replyUpImg) {
                                    fields.imageToUploadUrl = replyUpImg.url;
                                    modifSociety.updateSociety(
                                        fields,
                                        userId,
                                        function () {
                                            callback(fields.societyId);
                                        }
                                    );
                                }
                            );
                        }
                        else {
                            callback(fields.societyId);
                        }
                    } else {
                        if ("societyId" in fields && fields.societyId)
                            callback(fields.societyId);
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
                function (societyId) {

                    callback('/sociedades/perfil/' + societyId);
                }
            );
        }
    });
};

module.exports = new Common();