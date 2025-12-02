const connection = require('../connection_db');
const common_auth = require('../common_auth');
const common_gral = require('../common_gral');
const fs = require('fs');
const sha512 = require('js-sha512');
const aws_s3_uploader = require('../aws_s3_uploader');

function Common() { }

function newPhone(customerId, fields, userId, callback) {
    if (
        "phoneCountry" in fields && fields.phoneCountry &&
        (
            fields.phoneCountry == 1 ||
            "phoneAreacode" in fields && fields.phoneAreacode
        ) &&
        "phoneNumber" in fields && fields.phoneNumber
    ) {
        connection.query(
            `
                INSERT INTO customers_phones SET 
                    customerId = ?,
                    country = ?,
                    area_code = ?,
                    number = ?,
                    intern = ?,
                    userId = ?,
                    status = 1
            `,
            [
                customerId,
                fields.phoneCountry,
                fields.phoneAreacode,
                fields.phoneNumber,
                fields.phoneIntern,
                userId,
            ],
            function (err, results) {
                if (err) {
                    console.log(err);
                }

                callback(customerId);
            }
        );
    }
    else {
        callback(customerId);
    }
};

function newAddress(customerId, fields, userId, callback) {
    if (
        "addressStreet" in fields && fields.typeId ||
        "locationId" in fields && fields.locationId ||
        "stateId" in fields && fields.stateId ||
        "addressCountry" in fields && fields.addressCountry
    ) {
        connection.query(
            `
                INSERT INTO customers_addresses SET 
                    customerId = ?,
                    street = ?,
                    location = ?,
                    state = ?,
                    country = ?,
                    userId = ?,
                    status = 1
            `,
            [
                customerId,
                fields.addressStreet.trim(),
                fields.locationId,
                fields.stateId,
                fields.addressCountry,
                userId,
            ],
            function (err, results) {
                if (err) {
                    console.log(err);
                }

                callback(customerId);
            }
        );
    }
    else {
        callback(customerId);
    }
};

Common.prototype.createCustomer = function (fields, userId, callback) {

    const __aux_email = fields.email.toLowerCase().trim();

    if (common_auth.verifyEmail(__aux_email)) {
        connection.query(
            `
                INSERT INTO customers SET 
                    image = ?,
                    email = ?,
                    dicose = ?,
                    type = ?,
                    name = ?,
                    surname = ?,
                    userId = ?,
                    status = 1
            `,
            [
                fields.imageToUploadUrl,
                fields.email,
                fields.dicose,
                fields.typeId,
                fields.name,
                fields.surname,
                userId,
            ],
            function (err, results) {
                if (err) {
                    console.log(err);
                    let __aux_error = err;
                    if (err.toLowerCase().indexOf("Duplicate entry") != -1) {
                        __aux_error = "Email duplicado, ya existe un usuario con ese email";
                    }
                    callback({
                        error: __aux_error,
                        customerId: false,
                    });
                }
                else if (results.insertId) {
                    newAddress(
                        results.insertId,
                        fields,
                        userId,
                        function (customerId) {
                            newPhone(
                                customerId,
                                fields,
                                userId,
                                function (customerId) {
                                    callback({
                                        error: false,
                                        customerId: customerId,
                                    });
                                }
                            );
                        }
                    );
                }
                else {
                    callback({
                        error: "No se pudo registrar al usuario",
                        customerId: false,
                    });
                }
            }
        );
    }
    else {
        callback({
            error: "Email incorrecto",
            customerId: false,
        });
    }
};

Common.prototype.uploadProfileImage = function (files, fields, callback) {
    if ("imageToUploadUrl" in fields && fields.imageToUploadUrl) {
        callback({
            error: false,
            url: fields.imageToUploadUrl,
        });
    }
    else if ("imageToUpload" in files && "path" in files.imageToUpload && files.imageToUpload.path &&
        "fileName" in fields && fields.fileName
    ) {
        const fileContent = fs.readFileSync(files.imageToUpload.path);
        const fileNameExtMime = common_gral.fileNameExt(fields.fileName);
        const timestamp_seconds = new Date().getTime() / 1000;
        const __aux_filename =
            sha512(
                common_gral.randomString(12) +
                timestamp_seconds + "-" +
                (10000 + Math.floor(Math.random() * 1000)).toString()
            ) + "." + fileNameExtMime.extension;
        const __aux_filen_relative_path = 'images/customers/profile-images/' + __aux_filename;

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
                        error: "No se pudo guardar la foto",
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

Common.prototype.updateCustomer = function (fields, userId, callback) {

    const __aux_email = fields.email.toLowerCase().trim();

    if (common_auth.verifyEmail(__aux_email)) {
        connection.query(
            `
                UPDATE customers SET 
                    image = ?,
                    email = ?,
                    dicose = ?,
                    type = ?,
                    name = ?,
                    surname = ?,
                    userId = ?,
                    status = 1
                WHERE
                    id = ?
            `,
            [
                fields.imageToUploadUrl,
                fields.email,
                fields.dicose,
                fields.typeId,
                fields.name,
                fields.surname,
                userId,
                fields.customerId,
            ],
            function (err, results) {
                if (err) {
                    console.log(err);
                    callback();
                }
                else {
                    newAddress(
                        fields.customerId,
                        fields,
                        userId,
                        function (customerId) {
                            newPhone(
                                fields.customerId,
                                fields,
                                userId,
                                function (customerId) {
                                    callback();
                                }
                            );
                        }
                    );
                }
            }
        );
    }
    else {
        callback();
    }
};

module.exports = new Common();