var societiesInSearch = [];

function addSociety(indP) {
    let missingSociety = true;
    for (let index in societiesInFarm) {
        if (societiesInFarm[index].id == societiesInSearch[indP].id) {
            missingSociety = false;
        }
    }

    if (missingSociety) {
        societiesInFarm.unshift(societiesInSearch[indP]);
        insertSocietiesInHTML();
    }
};

function removeSociety(indP) {
    societiesInFarm.splice(indP, 1);
    insertSocietiesInHTML();
};


function insertSocietiesInHTML() {
    $("#societies-in-farm").html("");

    if (societiesInFarm.length) {
        var __auxInsertProd = [];
        sortingIndex = 1;

        let societiesSearchInput = document.getElementById("societies-search-input");

        for (var index in societiesInFarm) {
            let __aux_removeButton = "";
            if (societiesSearchInput) {
                __aux_removeButton =
                    `
                        <button type='button' class='btn btn-danger btn-fw' onclick='removeSociety(` + index + `)'>
                            Quitar
                        </button>
                    `;
            }

            __auxInsertProd.push(
                `
                    <div class='row mt-2'>
                        <input type='hidden' name='societies_` + index + `' value='` + societiesInFarm[index].id + `'>
                        <div class='col-sm-2'>
                            <a href="/sociedades/perfil/` + societiesInFarm[index].id + `" target="_blank">
                                <div style='background:url(` + societiesInFarm[index].image + `);
                                    background-size:cover;
                                    background-repeat:no-repeat;
                                    border-radius:50%;
                                    display: inline-block;
                                    width:35px;height:35px;'>
                                    <img src='https://agro-oriental-remates.s3.us-west-1.amazonaws.com/web/images/transparent-pixel.png' 
                                        alt='` + societiesInFarm[index].name + `'> 
                                </div>
                            </a>
                        </div>
                        <div class='col-sm-7'>
                            <p class="m-0 p-0">
                                ` + societiesInFarm[index].name + `<br>
                                <span class="text-small"><b>` + societiesInFarm[index].company + `</b></span>
                            </p> 
                        </div>
                        <div class='col-sm-3 text-right'>
                            ` + __aux_removeButton + `
                        </div>
                    </div>
                `
            );
        }

        $("#societies-in-farm").html(
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

function getSocietiesFromSearch() {
    $("#societies-search-warning").hide();
    $("#societies-search-noresult").hide();
    if ($("#societies-search-input").val().length < 3) {
        $("#societies-search-warning").show();
    }
    else {
        $.get("/api/societies/search/" + encodeURIComponent($("#societies-search-input").val()), function (results) {
            $("#societies-search-results").html("");
            if (results.societies.length) {
                $("#societies-search-input-clear").show();
                var __auxShowArr = [];
                societiesInSearch = results.societies;
                for (var index in results.societies) {
                    if (index < 10) {
                        __auxShowArr.push(
                            `
                                <tr>
                                    <td class='py-1'>
                                        <a href="/sociedades/perfil/` + results.societies[index].id + `" target="_blank">
                                            <div style='background:url(` + results.societies[index].image + `);
                                                background-size:cover;background-repeat:no-repeat;border-radius:50%;
                                                display: inline-block;'>
                                                <img src='https://agro-oriental-remates.s3.us-west-1.amazonaws.com/web/images/transparent-pixel.png' 
                                                    alt='` + results.societies[index].name + `'> 
                                            </div>
                                        </a>
                                    </td>
                                    <td>
                                        <p>
                                            ` + results.societies[index].name + `<br>
                                            <span class="text-small"><b>` + results.societies[index].company + `</b></span><br>
                                            <span class="text-small">` + results.societies[index].rut + `</span>  
                                        </p>  
                                    </td>
                                    <td class='text-right'>
                                        <button 
                                            type="button" 
                                            class="btn btn-primary btn-rounded btn-icon" 
                                            onclick="addSociety(` + index + `)">
                                                <i class="mdi mdi-plus"></i>
                                        </button>
                                    </td>
                                </tr>
                            `
                        );
                    }
                }
            }
            else if ($("#societies-search-noresult").val().length < 3) {
                $("#societies-search-noresult").show();
            }

            if (results.societies.length > 10) {
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

            $("#societies-search-results").html(
                "<table class='table table-striped'><tbody>" + __auxBodyShowArr + "</tbody></table>"
            );
        });
    }
};

$(document).ready(function () {
    $("#societies-search-button").click(function () {
        getSocietiesFromSearch();
    });

    $("#societies-search-input-clear").click(function () {
        $("#societies-search-results").html("");
        $("#societies-search-input-clear").hide();
    });

    let societiesSearchInput = document.getElementById("societies-search-input");
    if (societiesSearchInput) {
        societiesSearchInput.addEventListener("keyup", function (event) {
            if (event.keyCode === 13) {
                event.preventDefault();
                getSocietiesFromSearch();
            }
        });
    }

    insertSocietiesInHTML();
});
