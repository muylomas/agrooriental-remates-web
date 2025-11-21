const __aux_typeObject = {
    id: 0,
    name: "",
    family: "",
    ageUnit: 5,
    females: 0,
    reproductiveStatus: 0,
    weaned: 0,
    caped: 0,
    calves: 0,
    auctionPriceType: 2,
};

function insertBreedHTML(indBreed, initialize) {
    var __aux_breedObject = {
        id: 0,
        quantity: "",
        females: "",
    };

    if (initialize) {
        if (indBreed >= 0 && indBreed < breedArray.length) {
            __aux_breedObject = {
                id: breedArray[indBreed].breedId,
                quantity: breedArray[indBreed].quantity,
                females: breedArray[indBreed].females,
            };
        }
    }

    let cattleBreedsHTML_options = [];
    for (let indBreedInt in cattleBreeds) {
        if (cattleBreeds[indBreedInt].id == __aux_breedObject.id)
            cattleBreedsHTML_options.push(
                '<option value="' + cattleBreeds[indBreedInt].id + '" selected="selected">' + cattleBreeds[indBreedInt].name + '</option>'
            );
        else
            cattleBreedsHTML_options.push(
                '<option value="' + cattleBreeds[indBreedInt].id + '">' + cattleBreeds[indBreedInt].name + '</option>'
            );
    }

    let __aux_deleteButton = "";
    let __aux_BreedsTitle = "";
    const nextIndBreed = parseInt(indBreed) + 1;

    if (indBreed + 1 > 1) {
        __aux_deleteButton =
            `
                <a class="lot-submit btn btn-inverse-light btn-fw" href="javascript:deleteBreedRow(` + (indBreed + 1) + `)">
                    <i class="mdi mdi-delete text-danger"></i>
                </a>
            `;
    }
    else {
        __aux_BreedsTitle =
            `
                <div class="row mt-3">
                    <div class="col-12">
                        <div class="form-group m-0">
                            <label>
                                Razas (opcional)
                            </label>
                        </div>
                    </div>
                </div>
            `;
    }

    let add_mt_2 = "";
    if (parseInt(indBreed)) {
        add_mt_2 = " mt-2 ";
    }

    $("#cattle-breeds").append(
        __aux_BreedsTitle +
        `
            <div id="breed-container_` + nextIndBreed + `" class="d-flex justify-content-between flex-wrap` + add_mt_2 + `">
                <div class="d-flex align-items-end flex-wrap w-75">
                    <select class="form-control" name="breedId_` + nextIndBreed + `" onchange="insertBreedRow(` + nextIndBreed + `)">
                        <option value="">Raza</option> 
                        ` + cattleBreedsHTML_options.join(" ") + `
                    </select>
                </div>
                <div id="breed_delete_` + nextIndBreed + `" class="d-flex justify-content-between align-items-end flex-wrap invisible">
                    <a class="lot-submit btn btn-inverse-light btn-fw" href="javascript:deleteBreedRow(` + nextIndBreed + `)">
                        <i class="mdi mdi-delete text-danger"></i>
                    </a>
                </div>
            </div>
        `
    );
    $(this).parent().load("view");

    //updateOnType();
};

function insertAgesHTML(indAge, typeObject, initialize) {
    var __aux_ageObject = {
        id: 0,
        quantity: "",
    };

    if (initialize) {
        if (indAge >= 0 && indAge < agesArray.length) {
            __aux_ageObject = {
                id: parseInt(agesArray[indAge].teethId),
                quantity: agesArray[indAge].quantity,
            };
        }
    }

    let __aux_ageUnitObj = {
        id: 0,
        name: "",
    };
    for (let indAgeUnits in cattleAgeUnits) {
        if (cattleAgeUnits[indAgeUnits].id == typeObject.ageUnit) {
            __aux_ageUnitObj = cattleAgeUnits[indAgeUnits];
        }
    }

    if (__aux_ageUnitObj.id == 5) {

        let cattleTeethsHTML_options = ['<option value="">Dentición</option>'];
        for (let indTeeth in cattleTeeths) {
            if (cattleTeeths[indTeeth].id == __aux_ageObject.id)
                cattleTeethsHTML_options.push(
                    '<option value="' + cattleTeeths[indTeeth].id + '" selected="selected">' + cattleTeeths[indTeeth].name + '</option>'
                );
            else
                cattleTeethsHTML_options.push(
                    '<option value="' + cattleTeeths[indTeeth].id + '">' + cattleTeeths[indTeeth].name + '</option>'
                );
        }

        let __aux_deleteButton = "";
        let __aux_AgesTitle = "";

        if (indAge + 1 > 1 || $("#teeth-title").length) {
            __aux_deleteButton =
                `
                    <a class="lot-submit btn btn-inverse-light btn-fw" href="javascript:deleteTeethRow(` + (indAge + 1) + `)">
                        <i class="mdi mdi-delete text-danger"></i>
                    </a>
                `;
        }
        else {
            __aux_AgesTitle =
                `
                    <div class="row mt-4">
                        <div class="col-12">
                            <div class="form-group m-0">
                                <label>
                                    Dentición (opcional)
                                </label>
                            </div>
                        </div>
                    </div>
                `;
        }

        let add_mt_2 = "";
        if (parseInt(indAge)) {
            add_mt_2 = " mt-2 ";
        }

        const nextIndAge = parseInt(indAge) + 1;
        $("#cattle-ages").append(
            __aux_AgesTitle +
            `
                <div id="age-container_` + nextIndAge + `" class="d-flex justify-content-between flex-wrap` + add_mt_2 + `">
                    <div class="d-flex align-items-end flex-wrap w-75">
                        <select class="form-control mb-2 mr-sm-2" name="teethId_` + nextIndAge + `" onchange="insertTeethRow(` + nextIndAge + `)">
                            ` + cattleTeethsHTML_options.join(" ") + `
                        </select>
                    </div>
                    <div id="age_delete_` + nextIndAge + `" class="d-flex justify-content-between align-items-end flex-wrap invisible">
                        <a class="lot-submit btn btn-inverse-light btn-fw px-0 w-100" href="javascript:deleteTeethRow(` + nextIndAge + `)">
                            <i class="mdi mdi-delete text-danger"></i>
                        </a>
                    </div>
                </div>
            `
        );
    }
    else {
        $("#cattle-ages").html(
            `
                <div id="age-container_1" class="row mt-3">
                    <div class="col-12">
                        <div class="form-group m-0">
                            <label>
                                Edad:
                            </label>
                            <div class="input-group">
                                <input type="hidden" name="ageId_1" value="` + __aux_ageUnitObj.id + `">
                                <input id="ageQuantity_1" class="form-control" type="number" step="1" name="ageQuantity_1" placeholder="XX" value="` + __aux_ageObject.quantity + `">
                                <div class="input-group-append">
                                    <span class="input-group-text bg-primary text-white p-2">
                                        ` + __aux_ageUnitObj.name + `
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `
        );
    }

    $("#age-unit").val(__aux_ageUnitObj.id);

    $(this).parent().load("view");
};

function updateOnTypeFamily() {
    let __aux_cattleTypes = [];
    for (let index in cattleTypes) {
        if (cattleTypes[index].family == $("#type-family-selector").val()) {
            __aux_cattleTypes.push(
                '<option value="' + cattleTypes[index].id + '">' + cattleTypes[index].name + '</option>'
            );
        }
    }

    if (__aux_cattleTypes.length) {
        $("#type-selector").html(__aux_cattleTypes.join(" "));
    }

    $(this).parent().load("view");

    updateOnType();
};

function updateOnType() {
    let result = getTypeObjtec();
    if (result.isSelected) {
        if (parseInt($("#age-unit").val()) != result.typeObject.ageUnit) {
            $("#cattle-ages").html("");
            if (!$("#ages-container_1").length && !$("#teeth-title").length) {
                insertAgesHTML(0, result.typeObject, false);
            }
        }
        showHideWeightDestare(result.typeObject);

        if (result.typeObject.auctionPriceType == 1) {
            $(".selling-prices-units").html("por kilo");
        }
        else {
            $(".selling-prices-units").html("por bulto");
        }
    }
    else {
        showHideWeightDestare(__aux_typeObject);
    }

    showHideCalvesWeaningCapedEntire();
};

function getTypeObjtec() {
    let __aux_index_cattleTypes = false;
    let __aux_index_cattleTypes_val = 0;

    if ($("[name='typeId']").val()) {
        for (let index in cattleTypes) {
            if (cattleTypes[index].id == parseInt($("[name='typeId']").val())) {
                __aux_index_cattleTypes = true;
                __aux_index_cattleTypes_val = index;
            }
        }
    }

    return {
        isSelected: __aux_index_cattleTypes,
        typeObject: cattleTypes[__aux_index_cattleTypes_val],
    };
};

function showHideWeightDestare(typeObject) {
    if (typeObject.auctionPriceType == 2) {
        $("#weight-destare").hide();
    }
    else {
        $("#weight-destare").show();
    }
};

function showHideCalvesWeaningCapedEntire() {
    switch ($("[name='typeId']").val()) {
        case "6":
            $("#total-males-quantity").show();
            $("#calves-weaning").show();
            $("#caped-entire").show();
            $("#weight-calves-mean").hide();
            updateOnTypesRelatedToCalves();
            break;
        case "15":
            $("#calves-weaning").show();
            $("#caped-entire").show();
            $("#total-males-quantity").hide();
            $("#weight-calves-mean").hide();
            updateOnTypesRelatedToCalves();
            break;
        case "3":
            $("#calves-weaning").show();
            $("#caped-entire").hide();
            $("#total-males-quantity").hide();
            $("#weight-calves-mean").hide();
            updateOnTypesRelatedToCalves();
            break;
        case "8":
            $("#weight-calves-mean").show();
            $("#calves-weaning").hide();
            $("#caped-entire").hide();
            $("#total-males-quantity").hide();
            updateOnTypesRelatedToCalves();
            break;
        default:
            $("#calves-weaning").hide();
            $("#caped-entire").hide();
            $("#total-males-quantity").hide();
            $("#weight-calves-mean").hide();

            $("[name='calves']").val(0);
            $("[name='weaning']").val(0);
            $("[name='entire']").val(0);
            $("[name='caped']").val(0);
            $("[name='totalMalesQuantity']").val(0);
            $("[name='weightCalvesMean']").val(0);

            break;
    }
};

function insertBreedRow(idFrom) {
    if ($("#cattle-breeds > div:last-child").find("select").val()) {
        insertBreedHTML(idFrom, false);
    }

    let empty_inputs = [];
    $("[id^='breed-container_']").each(function () {
        if (!([$("#cattle-breeds > div:last-child").attr("id")].includes($(this).attr('id')))) {
            $(this).find("[id^='breed_delete_']").removeClass("invisible");
            if (!$(this).find("select").val())
                $(this).remove();
        }
        else {
            if (!$(this).find("select").val()) {
                empty_inputs.push($(this).attr("id"));
            }
            $(this).find("[id^='breed_delete_']").addClass("invisible");
        }
    });

    if (empty_inputs.length > 1) {
        $("#" + empty_inputs[0]).remove();
    }
};

function deleteBreedRow(idFrom) {
    if ($("#breed-container_" + idFrom).length) {
        $("#breed-container_" + idFrom).remove();
    }
};

function insertTeethRow(idFrom) {
    if ($("#cattle-ages > div:last-child").find("select").val()) {
        result = getTypeObjtec();

        if (result.isSelected) {
            insertAgesHTML(idFrom, result.typeObject, false);
        }
        else {
            insertAgesHTML(idFrom, __aux_typeObject, false);
        }
    }

    let empty_inputs = [];
    $("[id^='age-container_']").each(function () {
        if (!([$("#cattle-ages > div:last-child").attr("id")].includes($(this).attr('id')))) {
            last_input_id = $(this).attr("id");
            $(this).find("[id^='age_delete_']").removeClass("invisible");
            if (!$(this).find("select").val())
                $(this).remove();
        }
        else {
            if (!$(this).find("select").val()) {
                empty_inputs.push($(this).attr("id"));
            }
            $(this).find("[id^='age_delete_']").addClass("invisible");
        }
    });

    if (empty_inputs.length > 1) {
        $("#" + empty_inputs[0]).remove();
    }
};

function deleteTeethRow(idFrom) {
    if ($("#age-container_" + idFrom).length) {
        $("#age-container_" + idFrom).remove();
    }
};

function auctionPriceTypeChange() {
    if ($("#auction-price-type").val() == "2") {
        $("#step-price-input").attr("step", "1");
        $("#start-price-input").attr("step", "1");
        $("#sale-price-input").attr("step", "1");
        $("#step-price-input").attr("placeholder", "0");
        $("#start-price-input").attr("placeholder", "0");
        $("#sale-price-input").attr("placeholder", "0");
    }
    else {
        $("#step-price-input").attr("step", ".01");
        $("#start-price-input").attr("step", ".01");
        $("#sale-price-input").attr("step", ".01");
        $("#step-price-input").attr("placeholder", "0.00");
        $("#start-price-input").attr("placeholder", "0.00");
        $("#sale-price-input").attr("placeholder", "0.00");
    }

    $(this).parent().load("view");
};

function weighedChange() {
    $('input[type=radio][name=weighed]').each(function () {
        if (this.checked) {
            if (this.value == '1') {
                $("[id^='weighed-extra-fields-']").hide();
            }
            else {
                $("[id^='weighed-extra-fields-']").show();
            }
        }
    });
}

function updateOnStartAuctionDate() {
    if ($("#auction-start-input").val()) {
        let initialDate = new Date($("#auction-start-input").val());
        const minDateNumber = initialDate.setTime(initialDate.getTime() + (2 * 60 * 60 * 1000));
        const maxDateNumber = initialDate.setDate(initialDate.getDate() + 3);
        const dateTimeLocalValueMin = (new Date(minDateNumber).toISOString()).slice(0, -1);
        const dateTimeLocalValueMax = (new Date(maxDateNumber).toISOString()).slice(0, -1);

        $("#auction-end-input").attr("min", dateTimeLocalValueMin);
        $("#auction-end-input").attr("max", dateTimeLocalValueMax);

        $(this).parent().load("view");
    }
}

$(document).ready(function () {
    if (breedArray && breedArray.length) {
        for (let index in breedArray) {
            if (!$("#breed-container_" + (parseInt(index) + 1)).length) {
                insertBreedHTML(index, true);
            }
        }

        insertBreedRow(breedArray.length);
    }
    else {
        insertBreedHTML(0, false);
    }

    resultTypeObject = getTypeObjtec();

    if (agesArray.length && resultTypeObject.isSelected) {
        for (let index in agesArray) {
            if (!$("#ages-container_" + (index + 1)).length) {
                insertAgesHTML(index, resultTypeObject.typeObject, true);
            }
        }

        if (resultTypeObject.typeObject.ageUnit == 5) {
            insertAgesHTML(agesArray.length, resultTypeObject.typeObject, false);
        }

        insertTeethRow(agesArray.length);
    }
    else {
        if (resultTypeObject.isSelected) {
            insertAgesHTML(0, resultTypeObject.typeObject, false);
        }
        else {
            insertAgesHTML(0, __aux_typeObject, false);
        }
    }

    $('input[type=radio][name=weighed]').change(function () {
        weighedChange();
    });
    weighedChange();

    updateOnStartAuctionDate();

    auctionPriceTypeChange();

    updateOnTypeFamily()
});