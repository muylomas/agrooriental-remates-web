const common_auth = require('../common_auth');
const formidable = require('formidable');
const modifCustomer = require('./modifCustomer');

function processSubmitForm(userId, req, callback) {
    const form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        if (err) {
            callback(false);
        }
        else {
            if (
                "customerId" in fields && fields.customerId &&
                "name" in fields && fields.name &&
                "surname" in fields && fields.surname &&
                "email" in fields && fields.email &&
                "typeId" in fields && fields.typeId
            ) {
                modifCustomer.uploadProfileImage(
                    files,
                    fields,
                    function (replyUpImg) {

                        fields.imageToUploadUrl = replyUpImg.url;

                        if (replyUpImg.error) {
                            callback(fields.customerId);
                        }
                        else {
                            modifCustomer.updateCustomer(
                                fields,
                                userId,
                                function () {
                                    callback(fields.customerId);
                                }
                            );
                        }
                    }
                );
            }
            else {
                callback(fields.customerId);
            }
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
                function (customerId) {

                    callback('/personas/perfil/' + customerId);
                }
            );
        }
    });
};

module.exports = new Common();