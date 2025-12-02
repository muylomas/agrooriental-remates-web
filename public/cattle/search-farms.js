var farmsInSearch = [];

function addFarm(indP) {
    let missingFarm = true;
    for (let index in farmsInLot) {
        if (farmsInLot[index].id == farmsInSearch[indP].id) {
            missingFarm = false;
        }
    }

    if (missingFarm) {
        farmsInLot.unshift(farmsInSearch[indP]);
        insertFarmsInHTML();
    }
};

function removeFarm(indP) {
    farmsInLot.splice(indP, 1);
    insertFarmsInHTML();
    $("#search-farms-container").show();
};


function insertFarmsInHTML() {
    $("#farms-in-lot").html("");

    if (farmsInLot && farmsInLot.length) {
        var __auxInsertProd = [];
        sortingIndex = 1;
        for (var index in farmsInLot) {
            let __aux_society_html = "";
            if (farmsInLot[index].societyName && farmsInLot[index].societyCompany) {
                __aux_society_html =
                    '<p class="m-0 p-0">' + farmsInLot[index].societyName + " (" + farmsInLot[index].societyCompany + ')</p>';
            }

            __auxInsertProd.push(
                `
                    <input type='hidden' name='farms_` + index + `' value='` + farmsInLot[index].id + `'>
                    <input type='hidden' name='society_` + index + `' value='` + farmsInLot[index].societyId + `'>
                    <div class='row mt-2'>
                        <div class='col-sm-1 col-2'>
                            <a href="/sociedades/perfil/` + farmsInLot[index].id + `" target="_blank">
                                <div style='background:url(` + farmsInLot[index].image + `);
                                    background-size:cover;
                                    background-repeat:no-repeat;
                                    border-radius:50%;
                                    display: inline-block;
                                    height:40px;'>
                                    <img src='https://agro-oriental-remates.s3.us-west-1.amazonaws.com/web/images/transparent-pixel.png' 
                                        class="h-100"
                                        alt='` + farmsInLot[index].name + `'> 
                                </div>
                            </a>
                        </div>
                        <div class='col-sm-8 col-6'>
                            ` + __aux_society_html + ` 
                            <p class="m-0 p-0">` + farmsInLot[index].name + `</p> 
                        </div>
                        <div class='col-sm-3 col-4 text-right'>
                            <button type='button' class='btn btn-danger btn-fw' onclick='removeFarm(` + index + `)'>
                                Quitar
                            </button>
                        </div>
                    </div>
                `
            );
        }

        $("#farms-in-lot").html(
            `
                <div class='row mt-2 mb-4'>
                    <div class='col-sm-12'>
                        ` + __auxInsertProd.join("") + `
                    </div>
                </div>
            `);

        $("#search-farms-container").hide();
        $(this).parent().load("view");
    }
};

function getFarmsFromSearch() {
    $("#farms-search-warning").hide();
    $("#farms-search-noresult").hide();
    if ($("#farms-search-input").val().length < 3) {
        $("#farms-search-warning").show();
    }
    else {
        $.get("/api/farms/search/" + encodeURIComponent($("#farms-search-input").val()), function (results) {
            $("#farms-search-results").html("");
            if (results.farms.length) {
                $("#farms-search-input-clear").show();
                var __auxShowArr = [];
                farmsInSearch = results.farms;
                for (var index in results.farms) {
                    if (index < 10) {
                        __auxShowArr.push(
                            `
                                <tr>
                                    <td class='py-1' style="width:50px;">
                                        <a href="/sociedades/perfil/` + results.farms[index].id + `" target="_blank">
                                            <div style='background:url(` + results.farms[index].image + `);
                                                background-size:cover;background-repeat:no-repeat;border-radius:50%;
                                                display: inline-block;'>
                                                <img src='https://agro-oriental-remates.s3.us-west-1.amazonaws.com/web/images/transparent-pixel.png' 
                                                    alt='` + results.farms[index].name + `'> 
                                            </div>
                                        </a>
                                    </td>
                                    <td class="text-left">
                                        <p class="text-left mb-0">
                                            ` + results.farms[index].societyName + " (" + results.farms[index].societyCompany + ")" + `
                                        </p>
                                        <p class="text-left text-small mb-0">
                                            ` + results.farms[index].name + `
                                        </p>  
                                    </td>
                                    <td class='text-right'>
                                        <button 
                                            type="button" 
                                            class="btn btn-primary btn-rounded btn-icon" 
                                            onclick="addFarm(` + index + `)">
                                                <i class="mdi mdi-plus"></i>
                                        </button>
                                    </td>
                                </tr>
                            `
                        );
                    }
                }
            }
            else if ($("#farms-search-noresult").val().length < 3) {
                $("#farms-search-noresult").show();
            }

            if (results.farms.length > 10) {
                __auxShowArr.push(
                    "<tr>" +
                    "<td colspan='5'>Hay más resultados, refiná la búsqueda ...</td>" +
                    "</tr>"
                );
            }

            let __auxBodyShowArr = ""
            if (__auxShowArr) {
                __auxBodyShowArr = __auxShowArr.join(" ");
            }

            $("#farms-search-results").html(
                "<table class='table table-striped'><tbody>" + __auxBodyShowArr + "</tbody></table>"
            );
        });
    }
};

$(document).ready(function () {
    $("#farms-search-button").click(function () {
        getFarmsFromSearch();
    });

    $("#farms-search-input-clear").click(function () {
        $("#farms-search-results").html("");
        $("#farms-search-input-clear").hide();
    });

    let farmsSearchInput = document.getElementById("farms-search-input");
    if (farmsSearchInput) {
        farmsSearchInput.addEventListener("keyup", function (event) {
            if (event.keyCode === 13) {
                event.preventDefault();
                getFarmsFromSearch();
            }
        });
    }

    insertFarmsInHTML();
});
