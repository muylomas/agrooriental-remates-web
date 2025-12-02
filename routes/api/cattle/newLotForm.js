const connection = require('../../connection_db');
const common_auth = require('../../common_auth');
const commonCattle = require('../../cattle/common');
const formidable = require('formidable');
const modifLot = require('../../cattle/modifLot');

const noFarmId = 16;

function newFarmAddress(farmId, instructions, lat, lng, location, state, country, zipCode, callback) {
    connection.query(
        `
            INSERT INTO farms_addresses SET 
                farmId = ?,
                instructions = ?,
                latitude = ?,
                longitude = ?,
                location = ?,
                state = ?,
                country = ?,
                zipcode = ?,
                status = 1
        `,
        [
            farmId,
            instructions.trim(),
            lat,
            lng,
            location,
            state,
            country,
            zipCode,
        ],
        function (err, results) {
            if (err) {
                console.log(err);
            }

            callback();
        }
    );
};

function newFarmSociety(customerId, farmId, callback) {
    let societyId = 0;

    connection.query(
        `
            SELECT 
                IF(clients_societies.societyId IS NULL, 0, clients_societies.societyId) AS societyId
            FROM clients_societies
            LEFT JOIN clients_customers ON clients_customers.clientId = clients_societies.clientId AND clients_customers.status = 1
            LEFT JOIN clients_farms ON clients_farms.clientId = clients_societies.clientId AND clients_farms.status = 1
            WHERE 
                (clients_customers.customerId = ? OR clients_farms.farmId = ?) AND
                clients_societies.status = 1
        `,
        [
            customerId,
            farmId,
        ],
        function (err, resultsClientsSocieties) {
            if (err) {
                console.log(err);
            }
            else if (resultsClientsSocieties.length) {
                societyId = resultsClientsSocieties[0].societyId;
            }

            callback(societyId);
        }
    );
};

function createFarm(farmName, instructions, lat, lng, location, state, country, zipCode, customerId, callback) {
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
                userId = 0,
                customerId = ?,
                status = 1
        `,
        [
            "",
            farmName.toUpperCase().trim(),
            "",
            0,
            2,
            1,
            0,
            0,
            customerId,
        ],
        function (err, results) {
            let farmId = 0;
            if (err) {
                console.log(err);
                callback(farmId, false);
            }
            else if (results.insertId) {
                farmId = results.insertId;
                newFarmSociety(
                    customerId,
                    farmId,
                    function (societyId) {
                        if (societyId) {
                            newFarmAddress(
                                farmId,
                                instructions,
                                lat,
                                lng,
                                location, state, country, zipCode,
                                function () {
                                    callback(farmId, societyId);
                                }
                            )
                        }
                        else {
                            callback(farmId, false);
                        }
                    }
                );
            }
            else
                callback(farmId, false);
        }
    );
};

function farmFromFields(customerId, fields, callback) {
    let societiesId = [0];
    let societiesIdString = ["?"];
    let farmsId = [];
    let farmsIdString = [];

    if ("customerFarmSelect" in fields && fields.customerFarmSelect && parseInt(fields.customerFarmSelect)) {
        if (fields.customerFarmSelect == "10000001") {
            for (let index in fields) {
                if (index.indexOf("farms_") != -1) {
                    if (fields[index.replace("farms_", "society_")]) {
                        societiesId.push(fields[index.replace("farms_", "society_")]);
                        societiesIdString.push("?");
                    }

                    farmsId.push(fields[index]);
                    farmsIdString.push("?");
                }
            }

            selectFarmsByIds(farmsId, farmsIdString, societiesId, societiesIdString, function (farms) {
                callback(farms)
            });
        }
        else if (fields.customerFarmSelect == "10000002") {
            if (
                "farmName" in fields && fields.farmName &&
                "addressLatitude" in fields && fields.addressLatitude &&
                "addressLongitude" in fields && fields.addressLongitude
            ) {
                createFarm(
                    fields.farmName,
                    fields.addressInstructions.trim(),
                    fields.addressLatitude,
                    fields.addressLongitude,
                    fields.addressLocation,
                    fields.addressState,
                    fields.addressCountry,
                    fields.addressZipCode,
                    customerId,
                    function (newFarmId, societyId) {
                        if (newFarmId) {
                            farmsId.push(newFarmId);
                            farmsIdString.push("?");

                            if (societyId) {
                                societiesId.push(societyId);
                                societiesIdString.push("?");
                            }

                            selectFarmsByIds(farmsId, farmsIdString, societiesId, societiesIdString, function (farms) {
                                callback(farms)
                            });
                        }
                        else {
                            callback([]);
                        }
                    }
                );
            }
        }
        else {
            farmsId.push(fields.customerFarmSelect);
            farmsIdString.push("?");

            selectFarmsByIds(farmsId, farmsIdString, societiesId, societiesIdString, function (farms) {
                callback(farms)
            });
        }
    }
};

function selectFarmsByIds(farmsId, farmsIdString, societiesId, societiesIdString, callback) {
    let farms = [];

    if (!farmsId.length) {
        farmsId.push(noFarmId);
        farmsIdString.push("?");
    }

    if (farmsId.length) {
        connection.query(
            `
                SELECT 
                    farms_complete.farmId AS id,
                    farms_complete.farmName AS name,
                    IF(
                        farms_complete.farmImage IS NULL OR farms_complete.farmImage = "",
                        "https://agro-oriental-remates.s3.us-west-1.amazonaws.com/images/farms/no-profile-img.png",
                        farms_complete.farmImage
                    ) AS image,
                    societies_complete.societyId AS societyId,
                    societies_complete.societyName AS societyName,
                    societies_complete.societyCompany AS societyCompany
                FROM farms_complete 
                LEFT JOIN societies_complete ON societies_complete.societyId IN (` + societiesIdString.join() + `)
                WHERE farms_complete.farmId IN (` + farmsIdString.join() + `)
            `,
            societiesId.concat(farmsId),
            function (err, results) {
                if (err) {
                    console.log(err);
                }
                else if (results.length) {
                    farms = results;
                }

                callback(farms);
            }
        );
    }
    else
        callback(farms);

};

function breedQuantityIntoArray(fields) {
    let totalQuantity = parseInt(fields.totalLotQuantity);
    let totalFemalesQuantity = 0;
    if (fields.totalMalesQuantity && parseInt(fields.totalMalesQuantity) > 0) {
        totalFemalesQuantity = totalQuantity - parseInt(fields.totalMalesQuantity);
    }

    let breedQuantity = [];
    if (totalQuantity) {
        totalQuantity = parseInt(totalQuantity);
        for (let index in fields) {
            if (index.indexOf("breedId_") != -1) {
                const indexIntoNumber = index.replace("breedId_", "");
                if (fields["breedId_" + indexIntoNumber]) {
                    breedQuantity.push({
                        breedId: fields["breedId_" + indexIntoNumber],
                        crossBreedId: "",
                        quantity: 1,
                        females: 0,
                    });
                }
            }
        }

        if (!breedQuantity.length) {
            let noBreedId = 1001;
            if (fields["typeFamily"] == "ovinos")
                noBreedId = 1002;

            breedQuantity.push({
                breedId: noBreedId,
                crossBreedId: "",
                quantity: totalQuantity,
                females: totalFemalesQuantity,
            });
        }
        else if (totalQuantity > breedQuantity.length) {
            breedQuantity[0].quantity = totalQuantity - breedQuantity.length + 1;
        }
    }

    return breedQuantity;
};

function teethQuantityIntoArray(fields) {
    let totalQuantity = parseInt(fields.totalLotQuantity);
    let teethQuantity = [];
    if (totalQuantity) {
        totalQuantity = parseInt(totalQuantity);
        for (let index in fields) {
            if (index.indexOf("teethId_") != -1) {
                let indexIntoNumber = index.replace("teethId_", "");
                if (fields["teethId_" + indexIntoNumber]) {
                    teethQuantity.push({
                        id: fields["teethId_" + indexIntoNumber],
                        quantity: 1,
                    });
                }
            }
        }

        if (totalQuantity > teethQuantity.length && teethQuantity.length) {
            teethQuantity[0].quantity = totalQuantity - teethQuantity.length + 1;
        }
    }

    return teethQuantity;
};

const paramsVerifGuide = {
    "typeId": "Falta indicar el tipo de ganado.",
    "feedingId": "Falta indicar el tratamiento nutricional del ganado.",
    "weightMean": "Falta indicar el peso promedio por animal del ganado.",
    "auctionPriceType": "Falta indicar el tipo de remate.",
    "salePrice": "Falta indicar el precio de venta del lote.",
    "startPrice": "Falta indicar el precio inicial de la subasta.",
    "stepPrice": "Falta indicar el incremento mínimo por puja.",
    "auctionStart": "Falta indicar la fecha y hora de comienzo de la subasta.",
    "auctionEnd": "Falta indicar la fecha y hora de finalización de la subasta.",
    "paymentTermId": "Falta indicar las condiciones de pago.",
    "bodyStatus": "Falta indicar un puntaje del 1 al 5 que indique el estado corporal del lote.",
    "rating": "Falta indicar la clase del ganado.",
};

const paramsVerifGuideWeighed = {
    "weightedPercentage": "Falta indicar el porcentaje de ganado pesado.",
    "weightDate": "Falta ingresar la fecha de pesada del ganado.",
    "weightMin": "Falta indicar el peso mínimo por cabeza de ganado.",
    "weightMax": "Falta indicar el peso máximo por cabeza de ganado.",
    "weightConfinement": "Falta indicar los días de encierro previo a la pesada.",
};

function minimunLotParamsVerif(fields) {
    let verifPass = true;
    let errorsArray = [];
    let errorFields = [];

    if (!("videoToUploadUrl" in fields) || !fields.videoToUploadUrl) {
        verifPass = false;
        errorsArray.push("&ensp; - Problemas con el video, falta o se generó un error al subir el video.");
    }

    if (!("farms" in fields) || !fields.farms.length) {
        verifPass = false;
        errorsArray.push("&ensp; - Falta indicar el establecimiento donde se encuentra el ganado.");
    }

    let cattleHeadsCount = 0;
    if (!("breedQuantity" in fields) || !fields.breedQuantity.length) {
        verifPass = false;
        errorsArray.push("&ensp; - Falta indicar las razas del ganado.");
        errorFields.push("breedId_");
    }
    else {
        for (let indexBreed in fields.breedQuantity) {
            cattleHeadsCount += fields.breedQuantity[indexBreed].quantity;
            if (fields.breedQuantity[indexBreed].quantity < fields.breedQuantity[indexBreed].females) {
                errorsArray.push("&ensp; - Las hembras no pueden superar a la cantidad del ganado para la raza.");
                errorFields.push("breedFemales_");
            }
        }
    }

    if (
        (
            !("ageQuantity" in fields) || !fields.ageQuantity.length
        ) &&
        (
            !("teethQuantity" in fields) || !fields.teethQuantity.length
        )
    ) {
        verifPass = false;
        errorsArray.push("&ensp; - Falta indicar las edad del ganado.");
        errorFields.push("ageQuantity");
        errorFields.push("teethQuantity");
    }
    else {
        if (("teethQuantity" in fields) && fields.teethQuantity.length) {
            let teethHeadsCount = 0;
            for (let indexTeeth in fields.teethQuantity) {
                teethHeadsCount += fields.teethQuantity[indexTeeth].quantity;
            }

            if (teethHeadsCount > cattleHeadsCount) {
                errorsArray.push("&ensp; - La cantidad de cabezas indicadas con dentición supera a la cantidad de animales en el lote.");
                errorFields.push("teethQuantity_");
            }
        }
    }

    let hornsCount = 0;
    let hornsFields = ["mochos", "astados", "mochados", "tocos"];
    for (let indexHorns in hornsFields) {
        if (indexHorns in fields && fields[indexHorns])
            hornsCount += parseInt(fields && fields[indexHorns]);
    }

    if (hornsCount > cattleHeadsCount) {
        errorsArray.push("&ensp; - La cantidad de cabezas indicadas como mochos, astados, mochados y tocos supera a la cantidad de animales en el lote.");
        errorFields.push("mochos");
        errorFields.push("astados");
        errorFields.push("mochados");
        errorFields.push("tocos");
    }

    if (!("weighed" in fields) || fields.weighed != '1') {

        for (let indexWeighed in paramsVerifGuideWeighed) {
            if (!(indexWeighed in fields) || !fields[indexWeighed]) {
                verifPass = false;
                errorsArray.push("&ensp; -  " + paramsVerifGuideWeighed[indexWeighed]);
                errorFields.push("indexWeighed");
            }
        }

        if (
            "weightMax" in fields && fields.weightMax &&
            "weightMin" in fields && fields.weightMin
        ) {
            if (fields.weightMin > fields.weightMax) {
                let __aux_weightMin = fields.weightMax;
                fields.weightMax = fields.weightMin;
                fields.weightMin = __aux_weightMin;
            }

            if (fields.weightMean < fields.weightMin || fields.weightMean > fields.weightMax) {
                fields.weightMean = (fields.weightMin + fields.weightMax) / 2;
            }
        }

    }

    for (let index in paramsVerifGuide) {
        if (!(index in fields) || !fields[index]) {
            verifPass = false;
            errorsArray.push("&ensp; -  " + paramsVerifGuide[index]);
            errorFields.push("index");
        }
    }

    if (!("salesagents" in fields) || !fields.salesagents.length) {
        verifPass = false;
        errorsArray.push("&ensp; - Falta indicar el agente de venta de este lote.");
    }

    return {
        error: errorsArray.join("<br>"),
        errorFields: errorFields,
        status: verifPass,
    };
};

function mediaUpload(files, fields, callback) {
    let videoToUploadUrl = "";
    modifLot.uploadVideo(
        files,
        fields,
        function (replyUpVideo) {
            videoToUploadUrl = replyUpVideo.url;
            callback(videoToUploadUrl);
        }
    );
};

function processSubmitForm(userId, params, callback) {
    const form = new formidable.IncomingForm();
    form.parse(params, function (err, fields, files) {
        if (err) {
            callback(
                savedLotId,
                {},
            );
        }
        else {
            farmFromFields(
                userId,
                fields,
                function (farmsParams) {
                    fields.farms = farmsParams;
                    fields.breedQuantity = breedQuantityIntoArray(fields);
                    fields.teethQuantity = teethQuantityIntoArray(fields);
                    fields.ageQuantity = commonCattle.ageQuantityIntoArray(fields);
                    fields.salesagents = commonCattle.salesagentsFielsIntoArray(fields);
                    mediaUpload(files, fields, function (replyUpVideo) {
                        fields.videoToUploadUrl = replyUpVideo;
                        const replyVerification = minimunLotParamsVerif(fields);
                        modifLot.savelot(
                            fields,
                            userId,
                            function (replySavedLot) {
                                if (replyVerification.status) {
                                    callback({
                                        savedLotId: replySavedLot.lotId,
                                        tabStatuses: replySavedLot.tabStatuses,
                                    });
                                }
                                else {
                                    callback({
                                        savedLotId: replySavedLot.lotId,
                                        tabStatuses: replySavedLot.tabStatuses,
                                    });
                                }
                            }
                        );
                    });
                }
            );
        }
    });
};

function Common() { }

Common.prototype.submit = function (sessionID, params, callback) {
    common_auth.basic(sessionID, function (reply) {
        if (reply.err) {
            callback(
                0,
                {},
            );
        }
        else {
            processSubmitForm(
                reply.user.id,
                params,
                function (processReply) {
                    callback(
                        processReply.savedLotId,
                        processReply.tabStatuses,
                    );
                }
            );
        }
    });
}

module.exports = new Common();