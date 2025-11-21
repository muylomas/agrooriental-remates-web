const common_auth = require('../common_auth');
const commonCattle = require('./common');
const formidable = require('formidable');
const modifLot = require('./modifLot');
const commonSaveLotData = require('./saveLotData/common');
const common_customers = require('../customers/common');

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

function processSubmitForm(viewParams, req, callback) {
    const form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        if (err) {
            callback({
                error: "Error al procesar los datos del cliente.",
                lot: 0,
                params: viewParams,
            });
        }
        else {
            commonCattle.farmsFielsIntoArray(
                fields,
                function (farmsParams) {
                    fields.farms = farmsParams;
                    fields.breedQuantity = commonCattle.breedQuantityIntoArray(fields);
                    fields.ageQuantity = commonCattle.ageQuantityIntoArray(fields);
                    fields.teethQuantity = commonCattle.teethQuantityIntoArray(fields);
                    fields.salesagents = commonCattle.salesagentsFielsIntoArray(fields);
                    modifLot.uploadVideo(
                        files,
                        fields,
                        function (replyUpVideo) {
                            fields.videoToUploadUrl = replyUpVideo.url;
                            modifLot.uploadImagesSet(
                                files,
                                fields,
                                function (imageUrlArray) {
                                    for (indexUrlResult in imageUrlArray) {
                                        fields["imageToUploadUrl_" + (parseInt(indexUrlResult) + 1)] =
                                            imageUrlArray[indexUrlResult];
                                    }
                                    viewParams.lot = fields;
                                    let replyVerification = minimunLotParamsVerif(fields);
                                    if (replyVerification.status || fields["submitType"] == "save") {
                                        modifLot.uploadImagesSet(
                                            files,
                                            fields,
                                            function (replyUpImgsArray) {
                                                fields.imageToUploadUrl = replyUpImgsArray;

                                                if (fields["submitType"] == "save") {
                                                    modifLot.savelot(
                                                        fields,
                                                        viewParams.userId,
                                                        function (replySavedLot) {
                                                            if (replyVerification.status) {
                                                                callback({
                                                                    error: replySavedLot.error,
                                                                    savedLotId: replySavedLot.lotId,
                                                                    tabStatuses: replySavedLot.tabStatuses,
                                                                    lot: 0,
                                                                    params: viewParams,
                                                                });
                                                            }
                                                            else {
                                                                callback({
                                                                    error:
                                                                        "<strong>Falta completar los datos mínimos para crear el lote</strong>:<br>" +
                                                                        replyVerification.error,
                                                                    savedLotId: replySavedLot.lotId,
                                                                    tabStatuses: replySavedLot.tabStatuses,
                                                                    lot: 0,
                                                                    params: viewParams,
                                                                });
                                                            }
                                                        }
                                                    );
                                                }
                                                else {
                                                    modifLot.createlot(
                                                        fields,
                                                        viewParams.userId,
                                                        function (replyCreation) {
                                                            if (replyCreation.lotId) {
                                                                if (fields["savedLotId"]) {
                                                                    commonSaveLotData.deleteSavedLotDataByIdAndUserId(
                                                                        fields["savedLotId"],
                                                                        viewParams.userId,
                                                                        function () {
                                                                        }
                                                                    );
                                                                }

                                                                callback({
                                                                    error: replyCreation.error,
                                                                    lot: replyCreation.lotId,
                                                                    savedLotId: 0,
                                                                    tabStatuses: {},
                                                                    params: viewParams,
                                                                });
                                                            }
                                                            else {
                                                                modifLot.savelot(
                                                                    fields,
                                                                    viewParams.userId,
                                                                    function (replySavedLot) {
                                                                        callback({
                                                                            error: replyCreation.error,
                                                                            savedLotId: replySavedLot.lotId,
                                                                            tabStatuses: replySavedLot.tabStatuses,
                                                                            lot: 0,
                                                                            params: viewParams,
                                                                        });
                                                                    }
                                                                );
                                                            }
                                                        }
                                                    );
                                                }
                                            }
                                        );
                                    }
                                    else {
                                        modifLot.savelot(
                                            fields,
                                            viewParams.userId,
                                            function (replySavedLot) {
                                                callback({
                                                    error:
                                                        "<strong>Falta completar los datos mínimos para crear el lote</strong>:<br>" +
                                                        replyVerification.error,
                                                    savedLotId: replySavedLot.lotId,
                                                    tabStatuses: replySavedLot.tabStatuses,
                                                    lot: 0,
                                                    params: viewParams,
                                                });
                                            }
                                        );
                                    }
                                }
                            );
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
            commonCattle.getViewParamsTemplate(
                reply.user,
                function (returnIndexParams) {
                    common_customers.getCustomerById(
                        reply.user.id,
                        function (returnCustomer) {
                            returnIndexParams.customer = returnCustomer;

                            callback(
                                'cattle/new',
                                returnIndexParams,
                                "render"
                            );
                        }
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
            commonCattle.getViewParamsTemplate(
                reply.user,
                function (returnIndexParams) {
                    let indexParams = returnIndexParams;

                    processSubmitForm(
                        indexParams,
                        req,
                        function (returnAfterSubmit) {
                            indexParams = returnAfterSubmit.params;

                            indexParams.savedLotId = returnAfterSubmit.savedLotId;
                            indexParams.tabStatuses = returnAfterSubmit.tabStatuses;

                            if (returnAfterSubmit.error) {
                                indexParams.error = {
                                    msj: returnAfterSubmit.error,
                                    type: "error",
                                    lot: 0,
                                };
                            }
                            else {
                                indexParams.error = {
                                    msj: "Lote creado correctamente!!",
                                    type: "success",
                                    lot: returnAfterSubmit.lot,
                                };
                                indexParams.lot = {
                                    farms: [],
                                    salesagents: [],
                                };
                            }

                            callback(
                                'cattle/new',
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