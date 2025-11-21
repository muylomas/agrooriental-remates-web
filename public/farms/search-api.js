var farmsInSearch = [];

function addFarm(indP) {
    let missingFarm = true;
    for (let index in farmsInFarm) {
        if (farmsInFarm[index].id == farmsInSearch[indP].id) {
            missingFarm = false;
        }
    }

    if (missingFarm) {
        farmsInFarm.unshift(farmsInSearch[indP]);
        insertFarmsInHTML();
    }
};

function removeFarm(indP) {
    farmsInFarm.splice(indP, 1);
    insertFarmsInHTML();
};


function insertFarmsInHTML() {
    $("#farms-in-farm").html("");

    if (farmsInFarm.length) {
        var __auxInsertProd = [];
        sortingIndex = 1;
        for (var index in farmsInFarm) {

            __auxInsertProd.push(
                `
                    <div class='row mt-2'>
                        <input type='hidden' name='farms_` + index + `' value='` + farmsInFarm[index].id + `'>
                        <div class='col-sm-2'>
                            <a href="/sociedades/perfil/` + farmsInFarm[index].id + `" target="_blank">
                                <div style='background:url(` + farmsInFarm[index].image + `);
                                    background-size:cover;
                                    background-repeat:no-repeat;
                                    border-radius:50%;
                                    display: inline-block;
                                    width:35px;height:35px;'>
                                    <img src='https://mercadoagro-backoffice.s3.amazonaws.com/images/transparent-pixel.png' 
                                        alt='` + farmsInFarm[index].name + `'> 
                                </div>
                            </a>
                        </div>
                        <div class='col-sm-7'>
                            <p class="m-0 p-0">
                                ` + farmsInFarm[index].name + `
                            </p> 
                        </div>
                        <div class='col-sm-3 text-right'>
                            <button type='button' class='btn btn-danger btn-fw' onclick='removeFarm(` + index + `)'>
                                Quitar
                            </button>
                        </div>
                    </div>
                `
            );
        }

        $("#farms-in-farm").html(
            `
                <div class='row mt-2 mb-4'>
                    <div class='col-sm-12'>
                        ` + __auxInsertProd.join("") + `
                    </div>
                </div>
            `);
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
                                    <td class='py-1'>
                                        <a href="/sociedades/perfil/` + results.farms[index].id + `" target="_blank">
                                            <div style='background:url(` + results.farms[index].image + `);
                                                background-size:cover;background-repeat:no-repeat;border-radius:50%;
                                                display: inline-block;'>
                                                <img src='https://mercadoagro-backoffice.s3.amazonaws.com/images/transparent-pixel.png' 
                                                    alt='` + results.farms[index].name + `'> 
                                            </div>
                                        </a>
                                    </td>
                                    <td>
                                        <p>
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
    farmsSearchInput.addEventListener("keyup", function (event) {
        if (event.keyCode === 13) {
            event.preventDefault();
            getFarmsFromSearch();
        }
    });

    insertFarmsInHTML();
});
