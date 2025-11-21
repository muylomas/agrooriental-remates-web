function lotsDetailsParamsToHTML(lotParams) {

    let __aux_totalQuantity = lotParams.totalQuantity ? lotParams.totalQuantity : 1;

    lotParams["rating_HTML"] = "";
    if (
        "rating" in lotParams && lotParams.rating &&
        "ratingId" in lotParams && lotParams.ratingId
    ) {
        let __aux_stars_HTML = "";
        for (let indStar = 1; indStar <= 6; indStar++) {
            if (lotParams.ratingId < indStar) {
                __aux_stars_HTML += '<i class="mdi mdi-star-outline text-warning"></i>';
            }
            else {
                __aux_stars_HTML += '<i class="mdi mdi-star text-warning"></i>';
            }
        }

        lotParams["rating_HTML"] =
            `
                <h4 class="d-inline"> ` + lotParams.rating + ` </h4>
                <h3 class="d-inline ml-1>` + __aux_stars_HTML + `</h3>
            `;
    }

    lotParams["age_HTML"] = "";
    if ('ageArray' in lotParams && lotParams.ageArray.length && lotParams.ageArray[0].ageUnit != 5) {
        lotParams["age_HTML"] =
            `
                <h4 class="mb-0">
                    <b>` + lotParams.ageArray[0].quantity + `</b>
                    <small>` + lotParams.ageArray[0].ageUnitName + `</small>
                </h4>
            `;
    }

    lotParams["weighed_msg"] = "";
    if ('weighed' in lotParams && lotParams.weighed) {
        lotParams["weighed_msg"] = '<p class="m-0 p-0 text-small">El peso fue estimado</p>';
    }

    lotParams["certified_HTML"] = "";
    if ('certified' in lotParams && lotParams.certified) {
        lotParams["certified_HTML"] =
            `
                <div class="row">
                    <div class="col-6">
                        <div class="d-flex align-items-left">
                            <h2>
                                <i class="mdi mdi-marker-check text-success"></i>
                            </h2>
                            <div class="pl-2 text-small">
                                Lote certificado por MercadoAgro
                            </div>
                        </div>
                    </div>
                </div>
            `;
    }

    lotParams["explanations_HTML"] = "";
    if ('explanations' in lotParams && lotParams.explanations) {
        let __aux_typeReproductiveStatus_HTML = "";
        if ('typeReproductiveStatus' in lotParams && lotParams.typeReproductiveStatus) {
            __aux_typeReproductiveStatus_HTML =
                `
                    <p>
                        <b>Diagnóstico de preñez:</b>&nbsp;
                        ` + lotParams.reproductiveStatus + `
                        ` + (lotParams.pregnancyDiagnosis ? "&nbsp;(" + lotParams.pregnancyDiagnosis.toLowerCase() + ")" : "") + ` 
                        ` + (lotParams.birthSeason ? ", a parir en " + lotParams.birthSeason + "." : "") + ` 
                        ` + (!lotParams.pregnancyDiagnosis && !lotParams.birthSeason ? "." : "") + `
                    </p>
                `;
        }

        lotParams["explanations_HTML"] =
            `
                <div class="row">
                    <div class="col-12">
                        <div class="card border-0">
                            <div class="card-body pt-0">
                                <h6 class="mb-3 pb-2 border-bottom">Descripción</h6>
                                <p class="text-muted">` + lotParams.explanations + `</p>
                                ` + __aux_typeReproductiveStatus_HTML + `
                            </div>
                        </div>
                    </div>
                </div>
            `;
    }

    lotParams["breedsArray_HTML"] = "";
    if ('breedsArray' in lotParams && lotParams.breedsArray && lotParams.breedsArray.length) {
        let __aux_breedsTableRows = "";
        for (let indBreed in lotParams.breedsArray) {
            __aux_breedsTableRows +=
                `
                    <tr>
                        <td>
                            ` + lotParams.breedsArray[indBreed].breedName + `
                            ` + (lotParams.breedsArray[indBreed].crossBreedName ? "&nbsp;x " + lotParams.breedsArray[indBreed].crossBreedName : "") + `
                        </td>
                        <td class="text-center">
                            ` + lotParams.breedsArray[indBreed].quantity + `
                            &nbsp;<small>(` + Math.floor(100 * lotParams.breedsArray[indBreed].quantity / __aux_totalQuantity) + `%)</small>
                        </td>
                    </tr>
                `;
        }

        lotParams["breedsArray_HTML"] =
            `
                <div class="row d-sm-none d-flex">
                    <div class="col-12">
                        <div class="card border-0">
                            <div class="card-body pt-0">
                                <div class="table-responsive">
                                    <table class="table table-striped">
                                        <thead>
                                            <tr>
                                                <th>` + (lotParams.breedsArray.length == 1 ? "Raza" : "Razas") + `</th>
                                                <th class="text-center">Cant.</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            ` + __aux_breedsTableRows + `
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
    }

    lotParams["agesArray_HTML"] = "";
    if ('ageArray' in lotParams && lotParams.ageArray && lotParams.ageArray.length && lotParams.ageArray[0].ageUnit == 5) {
        let __aux_agesTableRows = "";
        for (let indAge in lotParams.ageArray) {
            if (lotParams.ageArray[indAge].teethName)
                __aux_agesTableRows +=
                    `
                        <tr>
                            <td>
                                ` + lotParams.ageArray[indAge].teethName + `
                            </td>
                            <td class="text-center">
                                ` + lotParams.ageArray[indAge].quantity + `
                                &nbsp;<small>(` + Math.floor(100 * lotParams.ageArray[indAge].quantity / __aux_totalQuantity) + `%)</small>
                            </td>
                        </tr>
                    `;
        }

        lotParams["agesArray_HTML"] =
            `
                <div class="row d-sm-none d-flex">
                    <div class="col-12">
                        <div class="card border-0">
                            <div class="card-body pt-0">
                                <div class="table-responsive">
                                    <table class="table table-striped">
                                        <thead>
                                            <tr>
                                                <th>` + (lotParams.ageArray.length == 1 ? "Dentición" : "Denticiones") + `</th>
                                                <th class="text-center">Cant.</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            ` + __aux_agesTableRows + `
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
    }

    lotParams["wcc_count_HTML"] = "";
    let __aux_wcc_count = lotParams.typeWeaned + 2 * lotParams.typeCaped + lotParams.typeCalves;
    if (__aux_wcc_count > 0) {
        let __aux_wcc_lines = "";
        for (let indexWcc in lotParams.wcc) {
            if (lotParams.wcc[indexWcc].enabled) {
                __aux_wcc_lines +=
                    `
                        <div class="align-items-center col-` + Math.floor(12 / __aux_wcc_count) + `">
                            <div class="text-center">
                                <h5 class="text-truncate">
                                    <small class="text-muted">
                                        ` + lotParams.wcc[indexWcc].name + `
                                    </small>
                                </h5>
                                <h2 class="text-muted mt-3 mb-0 lh-normal">
                                    <span style="word-spacing: -1px;letter-spacing: -2px;">
                                        ` + lotParams.wcc[indexWcc].quantity + `
                                    </span>
                                </h2>
                                <p class="text-muted mt-0 mb-2 lh-normal">
                                    (` + Math.round(100 * lotParams.wcc[indexWcc].quantity / __aux_totalQuantity) + `%)
                                </p>
                            </div>
                        </div>
                    `;
            }
        }

        lotParams["wcc_count_HTML"] =
            `
                <div class="row">
                    <div class="col-12">
                        <div class="card border-0">
                            <div class="card-body pt-0">
                                <div class="row">
                                    ` + __aux_wcc_lines + `
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
    }

    const mAMT = ["mochos", "astados", "mochados", "tocos"];
    for (let indMAMT in mAMT) {
        lotParams[mAMT[indMAMT] + "%"] = "";
        if (mAMT[indMAMT] in lotParams && lotParams[mAMT[indMAMT]] && Math.round(100 * lotParams[mAMT[indMAMT]] / __aux_totalQuantity) > 0) {
            lotParams[mAMT[indMAMT] + "%"] = "(" + (Math.round(100 * lotParams[mAMT[indMAMT]] / __aux_totalQuantity)) + "%)";
        }
    }

    lotParams["ration_HTML"] = "<small>No saben comer ración</small>";
    if ("ration" in lotParams && lotParams.ration) {
        lotParams["ration_HTML"] = "<small>Saben comer ración</small>";
    }

    lotParams["tick_HTML"] =
        `
            <mark class="bg-success text-white p-2">
                <b>NO</b>
            </mark>
        `;
    if ("tick" in lotParams && lotParams.tick == 1) {
        lotParams["tick_HTML"] =
            `
                <mark class="bg-warning text-white p-2">
                    <b>SI</b>
                </mark>
            `;
    }

    lotParams["mio_HTML"] =
        `
            <mark class="bg-warning text-white p-2">
                <b>NO</b>
            </mark>
        `;
    if ("mio" in lotParams && lotParams.mio == 1) {
        lotParams["mio_HTML"] =
            `
                <mark class="bg-success text-white p-2">
                    <b>SI</b>
                </mark>
            `;
    }

    lotParams["weighed_HTML"] = "";
    if (!lotParams.weighed) {
        let __aux_weightConfinement = "";
        if (lotParams.weightConfinement) {
            __aux_weightConfinement = "<p>La pesada se realizó con " + lotParams.weightConfinement + " horas de encierro.</p>";
        }

        let __aux_weightComment = "";
        if (lotParams.weightComment) {
            __aux_weightComment =
                `
                    <div class="row">
                        <div class="col-12 mt-3">
                            <h5><small class="text-muted">Obs. pesada</small></h5>
                            <p class="text-primary">` + lotParams.weightComment + `</p>
                        </div>
                    </div>
                `;
        }

        lotParams["weighed_HTML"] =
            `
                <div class="row">
                    <div class="col-12">
                        <div class="card border-0">
                            <div class="card-body pt-0">
                                <h6 class="mb-3 pb-2 border-bottom">
                                    Pesada - ` + lotParams.weightDateFormated + `
                                </h6>
                                <div class="row">
                                    <div class="col-3 align-items-center">
                                        <div class="text-center">
                                            <h5 class="text-truncate">
                                                <small class="text-muted">Cantidad</small>
                                            </h5>
                                            <h2 class="text-truncate text-primary mt-3 mb-2 lh-normal">
                                                <span style="word-spacing: -1px;letter-spacing: -2px;">
                                                    ` + lotParams.weightedPercentage + `
                                                </span>
                                                <span class="text-small">%</span>
                                            </h2>
                                        </div>
                                    </div>
                                    <div class="col-3 align-items-center">
                                        <div class="text-center">
                                            <h5 class="text-truncate">
                                                <small class="text-muted">Peso Min.</small>
                                            </h5>
                                            <h2 class="text-truncate text-primary mt-3 mb-2 lh-normal">
                                                <span style="word-spacing: -1px;letter-spacing: -2px;">
                                                    ` + lotParams.weightMin + `
                                                </span>
                                                <span class="text-small">Kg</span>
                                            </h2>
                                        </div>
                                    </div>
                                    <div class="col-3 align-items-center">
                                        <div class="text-center">
                                            <h5 class="text-truncate">
                                                <small class="text-muted">Peso Máx.</small>
                                            </h5>
                                            <h2 class="text-truncate text-primary mt-3 mb-2 lh-normal">
                                                <span style="word-spacing: -1px;letter-spacing: -2px;">
                                                    ` + lotParams.weightMax + `
                                                </span>
                                                <span class="text-small">Kg</span>
                                            </h2>
                                        </div>
                                    </div>
                                    <div class="col-3 align-items-center">
                                        <div class="text-center">
                                            <h5 class="text-truncate">
                                                <small class="text-muted">Promedio</small>
                                            </h5>
                                            <h2 class="text-truncate text-primary mt-3 mb-2 lh-normal">
                                                <span style="word-spacing: -1px;letter-spacing: -2px;">
                                                    ` + lotParams.weightMean + `
                                                </span>
                                                <span class="text-small">Kg</span>
                                            </h2>
                                        </div>
                                    </div>
                                </div>
                                ` + __aux_weightConfinement + `
                                ` + __aux_weightComment + `
                            </div>
                        </div>
                    </div>
                </div>
            `;
    }

    lotParams["bodyStatus_HTML"] = "";
    if ("bodyStatus" in lotParams && lotParams.bodyStatus) {
        let __aux_stars_HTML = "";
        for (let indStar = 1; indStar <= 5; indStar++) {
            if (lotParams.bodyStatus > indStar - 0.6 && lotParams.bodyStatus < indStar) {
                __aux_stars_HTML += '<i class="mdi mdi-star-half text-warning"></i>';
            }
            else if (lotParams.bodyStatus < indStar) {
                __aux_stars_HTML += '<i class="mdi mdi-star-outline text-warning"></i>';
            }
            else {
                __aux_stars_HTML += '<i class="mdi mdi-star text-warning"></i>';
            }

        }

        lotParams["bodyStatus_HTML"] =
            `
                <h3 class="text-dark m-0">
                    ` + lotParams.bodyStatus.toFixed(1) + `
                    ` + __aux_stars_HTML + `
                </h3>
            `;
    }

    lotParams["health_HTML"] = "";
    if ("health" in lotParams && lotParams.health) {
        lotParams["health_HTML"] =
            `
                <div class="row">
                    <div class="col-12 mt-3">
                        <h5>
                            <small class="text-muted">Obs. sanitarias</small>
                        </h5>
                        <p class="text-primary">
                            ` + lotParams.health + `
                        </p>
                        </div>
                    </div>
                </div>
            `;
    }

    return lotParams;
};