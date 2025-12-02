const connection = require('../connection_db');
const common_gral = require('../common_gral');
const fs = require('fs');
const sha512 = require('js-sha512');
const aws_s3_uploader = require('../aws_s3_uploader');

function Common() { }

function newPhone(farmId, fields, userId, callback) {
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
                INSERT INTO farms_phones SET 
                    farmId = ?,
                    country = ?,
                    area_code = ?,
                    number = ?,
                    intern = ?,
                    userId = ?,
                    status = 1
            `,
            [
                farmId,
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

                callback(farmId);
            }
        );
    }
    else {
        callback(farmId);
    }
};

function newAddress(farmId, fields, userId, callback) {
    if ("addressStreet" in fields && fields.addressStreet) {
        connection.query(
            `
                INSERT INTO farms_addresses SET 
                    farmId = ?,
                    street = ?,
                    instructions = ?,
                    location = ?,
                    state = ?,
                    country = ?,
                    zipcode = ?,
                    latitude = ?,
                    longitude = ?,
                    userId = ?,
                    status = 1
            `,
            [
                farmId,
                fields.addressStreet.trim(),
                fields.addressInstructions.trim(),
                fields.addressLocation,
                fields.addressState,
                fields.addressCountry,
                fields.addressZipCode,
                fields.addressLatitude,
                fields.addressLongitude,
                userId,
            ],
            function (err, results) {
                if (err) {
                    console.log(err);
                }

                callback(farmId);
            }
        );
    }
    else {
        callback(farmId);
    }
};

Common.prototype.createfarm = function (fields, userId, callback) {

    if (fields.farmOwner != "1") {
        fields.farmOwner = 0;
    }

    if (fields.farmRented != "1") {
        fields.farmRented = 0;
    }

    if (!fields.surface) {
        fields.surface = 0;
    }

    connection.query(
        `
            INSERT INTO farms SET 
                image = ?,
                name = ?,
                dicose = ?,
                surface = ?,
                type = ?,
                exploitation = ?,
                owner = ?,
                rented = ?,
                userId = ?,
                customerId = 0,
                status = 1
        `,
        [
            fields.imageToUploadUrl,
            fields.name.toUpperCase().trim(),
            fields.dicose.toUpperCase().trim(),
            fields.surface,
            fields.typeId,
            fields.exploitationId,
            fields.farmOwner,
            fields.farmRented,
            userId,
        ],
        function (err, results) {
            if (err) {
                console.log(err);
                let __aux_error = err.toString();
                if (__aux_error.toLowerCase().indexOf("duplicate entry") != -1) {
                    __aux_error = "Ya existe otro establecimiento con ese nombre.";
                }
                callback({
                    error: __aux_error,
                    farmId: false,
                });
            }
            else if (results.insertId) {
                const farmId = results.insertId;
                newAddress(
                    farmId,
                    fields,
                    userId,
                    function (farmId) {
                        newPhone(
                            farmId,
                            fields,
                            userId,
                            function (farmId) {
                                callback({
                                    error: false,
                                    farmId: farmId,
                                });
                            }
                        );
                    }
                );
            }
            else {
                callback({
                    error: "No se pudo registrar al usuario",
                    farmId: false,
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
        const __aux_filen_relative_path = 'images/farms/profile-images/' + __aux_filename;

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

Common.prototype.updatefarm = function (fields, userId, callback) {
    if (fields.farmOwner != "1") {
        fields.farmOwner = 0;
    }

    if (fields.farmRented != "1") {
        fields.farmRented = 0;
    }

    if (!fields.surface) {
        fields.surface = 0;
    }

    connection.query(
        `
            UPDATE farms SET 
                image = ?,
                name = ?,
                dicose = ?,
                surface = ?,
                type = ?,
                exploitation = ?,
                owner = ?,
                rented = ?,
                userId = ?,
                status = 1
            WHERE
                id = ?
        `,
        [
            fields.imageToUploadUrl,
            fields.name.toUpperCase().trim(),
            fields.dicose.toUpperCase().trim(),
            fields.surface,
            fields.typeId,
            fields.exploitationId,
            fields.farmOwner,
            fields.farmRented,
            userId,
            fields.farmId,
        ],
        function (err, results) {
            if (err) {
                console.log(err);
                callback();
            }
            else {
                newAddress(
                    fields.farmId,
                    fields,
                    userId,
                    function (farmId) {
                        newPhone(
                            farmId,
                            fields,
                            userId,
                            function (farmId) {
                                callback();
                            }
                        );
                    }
                );
            }
        }
    );
};

module.exports = new Common();