var salesagentsInSearch = [];

function addSalesAgent(indP) {
    let missingSalesAgent = true;
    for (let index in salesagentsInLot) {
        if (salesagentsInLot[index].id == salesagentsInSearch[indP].id) {
            missingSalesAgent = false;
        }
    }

    if (missingSalesAgent) {
        salesagentsInLot.unshift(salesagentsInSearch[indP]);
        insertSalesAgentsInHTML();
    }
};

function removeSalesAgent(indP) {
    salesagentsInLot.splice(indP, 1);
    insertSalesAgentsInHTML();
    $("#search-salesagents-container").show();
};


function insertSalesAgentsInHTML() {
    $("#salesagents-in-lot").html("");

    if (salesagentsInLot && salesagentsInLot.length) {
        var __auxInsertProd = [];
        sortingIndex = 1;
        for (var index in salesagentsInLot) {

            __auxInsertProd.push(
                `
                    <div class='row mt-2'>
                        <input type='hidden' name='salesagents_` + index + `' value='` + salesagentsInLot[index].id + `'>
                        <div class='col-sm-1'>
                            <a href="/sociedades/perfil/` + salesagentsInLot[index].id + `" target="_blank">
                                <div style='background:url(` + salesagentsInLot[index].image + `);
                                    background-size:cover;
                                    background-repeat:no-repeat;
                                    border-radius:50%;
                                    display: inline-block;
                                    width:35px;height:35px;'>
                                    <img src='https://mercadoagro-backoffice.s3.amazonaws.com/images/transparent-pixel.png' 
                                        alt='` + salesagentsInLot[index].name + " " + salesagentsInLot[index].surname + `'> 
                                </div>
                            </a>
                        </div>
                        <div class='col-sm-3'>
                            <p class="m-0 p-0">
                                ` + salesagentsInLot[index].name + " " + salesagentsInLot[index].surname + `
                            </p> 
                        </div>
                        <div class='col-sm-2 text-right'>
                            <button type='button' class='btn btn-danger btn-fw' onclick='removeSalesAgent(` + index + `)'>
                                Quitar
                            </button>
                        </div>
                        <div class='col-sm-6 text-right'></div>
                    </div>
                `
            );
        }

        $("#salesagents-in-lot").html(
            `
                <div class='row mt-2 mb-4'>
                    <div class='col-sm-12'>
                        ` + __auxInsertProd.join("") + `
                    </div>
                </div>
            `);

        $("#search-salesagents-container").hide();
        $(this).parent().load("view");
    }
};

function getsalesagentsFromSearch() {
    $("#salesagents-search-warning").hide();
    $("#salesagents-search-noresult").hide();
    if ($("#salesagents-search-input").val().length < 3) {
        $("#salesagents-search-warning").show();
    }
    else {
        $.get("/api/users/search/" + encodeURIComponent($("#salesagents-search-input").val()) + "/salesagents", function (results) {
            $("#salesagents-search-results").html("");
            if (results.salesagents.length) {
                $("#salesagents-search-input-clear").show();
                var __auxShowArr = [];
                salesagentsInSearch = results.salesagents;
                for (var index in results.salesagents) {
                    if (index < 10) {
                        __auxShowArr.push(
                            `
                                <tr>
                                    <td class='py-1'>
                                        <a href="/sociedades/perfil/` + results.salesagents[index].id + `" target="_blank">
                                            <div style='background:url(` + results.salesagents[index].image + `);
                                                background-size:cover;background-repeat:no-repeat;border-radius:50%;
                                                display: inline-block;'>
                                                <img src='https://mercadoagro-backoffice.s3.amazonaws.com/images/transparent-pixel.png' 
                                                    alt='` + results.salesagents[index].name + `'> 
                                            </div>
                                        </a>
                                    </td>
                                    <td>
                                        <p>
                                            ` + results.salesagents[index].name + `
                                        </p>  
                                    </td>
                                    <td class='text-right'>
                                        <button 
                                            type="button" 
                                            class="btn btn-primary btn-rounded btn-icon" 
                                            onclick="addSalesAgent(` + index + `)">
                                                <i class="mdi mdi-plus"></i>
                                        </button>
                                    </td>
                                </tr>
                            `
                        );
                    }
                }
            }
            else if ($("#salesagents-search-noresult").val().length < 3) {
                $("#salesagents-search-noresult").show();
            }

            if (results.salesagents.length > 10) {
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

            $("#salesagents-search-results").html(
                "<table class='table table-striped'><tbody>" + __auxBodyShowArr + "</tbody></table>"
            );
        });
    }
};

$(document).ready(function () {
    $("#salesagents-search-button").click(function () {
        getsalesagentsFromSearch();
    });

    $("#salesagents-search-input-clear").click(function () {
        $("#salesagents-search-results").html("");
        $("#salesagents-search-input-clear").hide();
    });

    let salesagentsSearchInput = document.getElementById("salesagents-search-input");
    if (salesagentsSearchInput) {
        salesagentsSearchInput.addEventListener("keyup", function (event) {
            if (event.keyCode === 13) {
                event.preventDefault();
                getsalesagentsFromSearch();
            }
        });
    }

    insertSalesAgentsInHTML();
});
