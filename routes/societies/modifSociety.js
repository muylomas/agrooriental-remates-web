const connection = require('../connection_db');
const common_gral = require('../common_gral');
const fs = require('fs');
const sha512 = require('js-sha512');
const aws_s3_uploader = require('../aws_s3_uploader');

function Common() { }

function newPhone(societyId, fields, userId, callback) {
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
                INSERT INTO societies_phones SET 
                    societyId = ?,
                    country = ?,
                    area_code = ?,
                    number = ?,
                    intern = ?,
                    userId = ?,
                    status = 1
            `,
            [
                societyId,
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

                callback(societyId);
            }
        );
    }
    else {
        callback(societyId);
    }
};

function newAddress(societyId, fields, userId, callback) {
    if (
        "addressStreet" in fields && fields.typeId ||
        "locationId" in fields && fields.locationId ||
        "stateId" in fields && fields.stateId ||
        "addressCountry" in fields && fields.addressCountry
    ) {
        connection.query(
            `
                INSERT INTO societies_addresses SET 
                    societyId = ?,
                    street = ?,
                    location = ?,
                    state = ?,
                    country = ?,
                    userId = ?,
                    status = 1
            `,
            [
                societyId,
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

                callback(societyId);
            }
        );
    }
    else {
        callback(societyId);
    }
};

function insertCustomers(societyId, customers, userId, callback) {
    let customersIds = [];
    let customersSQLString = [];
    for (let index in customers) {
        customersIds.push(customers[index].id);
        customersSQLString.push("(" + societyId + ",?," + userId + ",1)");
    }

    connection.query(
        `
            UPDATE societies_customers SET
                status = 0
            WHERE
                societyId = ?
        `,
        [
            societyId,
        ],
        function (err, results) {
            if (err) {
                console.log(err);
            }
            connection.query(
                `
                    INSERT INTO societies_customers 
                        (societyId, customerId, userId, status) 
                        VALUES ` + customersSQLString.join() + `
                `,
                customersIds,
                function (err, results) {
                    if (err) {
                        console.log(err);
                    }

                    callback(societyId);
                }
            );
        }
    );
};

Common.prototype.createSociety = function (fields, userId, callback) {

    connection.query(
        `
            INSERT INTO societies SET 
                image = ?,
                name = ?,
                company = ?,
                rut = ?,
                dicose = ?,
                userId = ?,
                status = 1
        `,
        [
            fields.imageToUploadUrl,
            fields.name.toUpperCase().trim(),
            fields.company.toUpperCase().trim(),
            fields.rut.toUpperCase().trim(),
            fields.dicose.toUpperCase().trim(),
            userId,
        ],
        function (err, results) {
            if (err) {
                console.log(err);
                let __aux_error = err.toString();
                if (__aux_error.toLowerCase().indexOf("duplicate entry") != -1) {
                    __aux_error = "RUT/CUIT duplicado, ya existe otra sociedad con ese RUT/CUIT";
                }
                callback({
                    error: __aux_error,
                    societyId: false,
                });
            }
            else if (results.insertId) {
                insertCustomers(
                    results.insertId,
                    fields.customers,
                    userId, function (societyId) {
                        newAddress(
                            societyId,
                            fields,
                            userId,
                            function (societyId) {
                                newPhone(
                                    societyId,
                                    fields,
                                    userId,
                                    function (societyId) {
                                        callback({
                                            error: false,
                                            societyId: societyId,
                                        });
                                    }
                                );
                            }
                        );
                    }
                );
            }
            else {
                callback({
                    error: "No se pudo registrar al usuario",
                    societyId: false,
                });
            }
        }
    );
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
        const __aux_filen_relative_path = 'images/societies/profile-images/' + __aux_filename;

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

Common.prototype.updateSociety = function (fields, userId, callback) {
    connection.query(
        `
            UPDATE societies SET 
                image = ?,
                name = ?,
                company = ?,
                rut = ?,
                userId = ?,
                status = 1
            WHERE
                id = ?
        `,
        [
            fields.imageToUploadUrl,
            fields.name.toUpperCase().trim(),
            fields.company.toUpperCase().trim(),
            fields.rut.toUpperCase().trim(),
            userId,
            fields.societyId,
        ],
        function (err, results) {
            if (err) {
                console.log(err);
                callback();
            }
            else {
                insertCustomers(
                    fields.societyId,
                    fields.customers,
                    userId, function (societyId) {
                        newAddress(
                            societyId,
                            fields,
                            userId,
                            function (societyId) {
                                newPhone(
                                    societyId,
                                    fields,
                                    userId,
                                    function (societyId) {
                                        callback();
                                    }
                                );
                            }
                        );
                    }
                );
            }
        }
    );
};

module.exports = new Common();