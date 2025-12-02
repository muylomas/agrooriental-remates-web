var customersInSearch = [];

function addCustomer(indP) {
    let missingCustomer = true;
    for (let index in customersArray) {
        if (customersArray[index].id == customersInSearch[indP].id) {
            missingCustomer = false;
        }
    }

    if (missingCustomer) {
        customersArray.unshift(customersInSearch[indP]);
        insertCustomersInHTML();
    }
};

function removeCustomer(indP) {
    customersArray.splice(indP, 1);
    insertCustomersInHTML();
    if (!multiCustomer)
        $("#customers-search-bar").show();
};


function insertCustomersInHTML() {
    $("#customers-container").html("");

    if (customersArray.length) {
        var __auxInsertCustomer = [];
        sortingIndex = 1;
        for (var index in customersArray) {
            if (!multiCustomer)
                __auxInsertCustomer = [];

            __auxInsertCustomer.push(
                `
                    <div class='row'>
                        <input type='hidden' name='customers_` + index + `' value='` + customersArray[index].id + `'>
                        <div class='col-2'>
                            <a href="/personas/perfil/` + customersArray[index].id + `" target="_blank">
                                <div style='background:url(` + customersArray[index].image + `);
                                    background-size:cover;
                                    background-repeat:no-repeat;
                                    border-radius:50%;
                                    display: inline-block;
                                    width:35px;height:35px;'>
                                    <img src='https://agro-oriental-remates.s3.us-west-1.amazonaws.com/web/images/transparent-pixel.png' 
                                        alt='` + customersArray[index].name + " " + customersArray[index].surname + `'> 
                                </div>
                            </a>
                        </div>
                        <div class='col-7'>
                            <p class="m-0 p-0" style="line-height:35px;">
                                ` + customersArray[index].name + " " + customersArray[index].surname + `
                            </p>
                        </div>
                        <div class='col-3 text-right'>
                            <button type='button' class='btn btn-danger btn-fw' onclick='removeCustomer(` + index + `)'>
                                Quitar
                            </button>
                        </div>
                    </div>
                `
            );
        }



        if (!multiCustomer) {
            $("#customers-container").html(
                `
                    <div class='row'>
                        <div class='col-sm-12'>
                            ` + __auxInsertCustomer.join("") + `
                        </div>
                    </div>
                `
            );
            $("#customers-search-bar").hide();
        }
        else {
            $("#customers-container").html(
                `
                    <div class='row mt-2 mb-4'>
                        <div class='col-sm-12'>
                            ` + __auxInsertCustomer.join("") + `
                        </div>
                    </div>
                `
            );
        }
    }

    $(this).parent().load("view");
};

function getCustomersFromSearch() {
    $("#customers-search-warning").hide();
    $("#customers-search-noresult").hide();
    if ($("#customers-search-input").val().length < 3) {
        $("#customers-search-warning").show();
    }
    else {
        $.get("/api/customers/search/" + encodeURIComponent($("#customers-search-input").val()), function (results) {
            $("#customers-search-results").html("");
            if (results.customers.length) {
                $("#customers-search-input-clear").show();
                var __auxShowArr = [];
                customersInSearch = results.customers;
                for (var index in results.customers) {
                    if (index < 10) {
                        __auxShowArr.push(
                            `
                                <tr>
                                    <td class='py-1'>
                                        <a href="/personas/perfil/` + results.customers[index].id + `" target="_blank">
                                            <div style='background:url(` + results.customers[index].image + `);
                                                background-size:cover;background-repeat:no-repeat;border-radius:50%;
                                                display: inline-block;'>
                                                <img src='https://agro-oriental-remates.s3.us-west-1.amazonaws.com/web/images/transparent-pixel.png' 
                                                    alt='` + results.customers[index].name + " " + results.customers[index].surname + `'> 
                                            </div>
                                        </a>
                                    </td>
                                    <td>` + results.customers[index].name + " " + results.customers[index].surname + `</td>
                                    <td>` + results.customers[index].type + `</td>
                                    <td>
                                        <button 
                                            type="button" 
                                            class="btn btn-primary btn-rounded btn-icon" 
                                            onclick="addCustomer(` + index + `)">
                                                <i class="mdi mdi-plus"></i>
                                        </button>
                                    </td>
                                </tr>
                            `
                        );
                    }
                }
            }
            else if ($("#customers-search-noresult").val().length < 3) {
                $("#customers-search-noresult").show();
            }

            if (results.customers.length > 10) {
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

            $("#customers-search-results").html(
                "<table class='table table-striped'><tbody>" + __auxBodyShowArr + "</tbody></table>"
            );
        });
    }
};

$(document).ready(function () {
    $("#customers-search-button").click(function () {
        getCustomersFromSearch();
    });

    $("#customers-search-input-clear").click(function () {
        $("#customers-search-results").html("");
        $("#customers-search-input-clear").hide();
    });

    let customersSearchInput = document.getElementById("customers-search-input");
    customersSearchInput.addEventListener("keyup", function (event) {
        if (event.keyCode === 13) {
            event.preventDefault();
            getCustomersFromSearch();
        }
    });

    insertCustomersInHTML();
});
