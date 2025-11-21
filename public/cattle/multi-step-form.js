var currentTab = 0;
document.addEventListener("DOMContentLoaded", function (event) {
    inspectFarmSelect();
    showTab(currentTab);
    $("#waiting-for-api").hide();
});

function showTab(n) {
    var x = document.getElementsByClassName("tab");
    x[n].style.display = "block";
    if (n == 0) {
        document.getElementById("prevBtn").style.display = "none";
    } else {
        document.getElementById("prevBtn").style.display = "inline";
    }

    if (n == (x.length - 1)) {
        document.getElementById("nextBtn").innerHTML = "Finalizar";
    } else {
        document.getElementById("nextBtn").innerHTML = "Siguiente";
    }

    fixStepIndicator(n);
}

function nextPrev(n) {
    const tabsElement = document.getElementsByClassName("tab");
    if (n == 1) {
        $("#waiting-for-api").show();
        $('#prevBtn').prop('disabled', true);
        $('#nextBtn').prop('disabled', true);

        $("#cattle-video").parent().removeClass("border-danger");
        $("#farms-search-input").addClass("border-danger");

        saveCattleProcc(
            function (error, tabStatuses) {

                if (validateForm(currentTab, tabStatuses)) {
                    tabsElement[currentTab].style.display = "none";
                    currentTab = currentTab + n;
                    if (currentTab >= tabsElement.length) {
                        document.getElementById("nextprevious").style.display = "none";
                        document.getElementById("all-steps").style.display = "none";
                        document.getElementById("thank-you-message").style.display = "block";

                    }
                    else
                        showTab(currentTab);
                }

                $('#prevBtn').prop('disabled', false);
                $('#nextBtn').prop('disabled', false);
                $("#waiting-for-api").hide();
            }
        );
    }

    if (n == -1 && currentTab > 0) {
        tabsElement[currentTab].style.display = "none";
        currentTab = currentTab + n;
        if (currentTab <= 0) {
            currentTab = 0;
        }
        document.getElementById("all-steps").style.display = "block";
        document.getElementById("thank-you-message").style.display = "none";

        showTab(currentTab);
    }
};

function validateForm(tabIndex, tabStatuses) {
    var valid = true;

    $("#farms-search-input").removeClass("border-danger");
    $("#type-selector").removeClass("border-danger");
    $("[name='totalLotQuantity']").removeClass("border-danger");
    $("#weight-mean-input").removeClass("border-danger");
    $("[name='startPrice']").removeClass("border-danger");
    $("[name='salePrice']").removeClass("border-danger");
    $("[name='paymentTermId']").removeClass("border-danger");
    $("[name='paymentTermId']").removeClass("border-danger");
    $("#cattle-video").parent().removeClass("border-danger");

    switch (tabIndex) {
        case 0:
            if (!tabStatuses["tab" + tabIndex]) {
                $("#farms-search-input").addClass("border-danger");
            }

            valid = tabStatuses["tab" + tabIndex];
            break;
        case 1:
            if (!tabStatuses["tab" + tabIndex]) {
                if (!$("#type-selector").val())
                    $("#type-selector").addClass("border-danger");
                if (!$("[name='totalLotQuantity']").val() || !parseInt($("[name='totalLotQuantity']").val())) {
                    $("[name='totalLotQuantity']").addClass("border-danger");
                }
            }

            valid = tabStatuses["tab" + tabIndex];
            break;
        case 2:
            valid = tabStatuses["tab" + tabIndex];
            break;
        case 3:
            if (!tabStatuses["tab" + tabIndex]) {
                if (!$("#weight-mean-input").val())
                    $("#weight-mean-input").addClass("border-danger");
            }

            valid = tabStatuses["tab" + tabIndex];
            break;
        case 4:
            if (!tabStatuses["tab" + tabIndex]) {
                if (!$("[name='startPrice']").val() || $("[name='startPrice']").val() == '0')
                    $("[name='startPrice']").addClass("border-danger");
                if (!$("[name='salePrice']").val() || $("[name='startPrice']").val() == '0')
                    $("[name='salePrice']").addClass("border-danger");
                if (!$("[name='paymentTermId']").val())
                    $("[name='paymentTermId']").addClass("border-danger");
            }

            valid = tabStatuses["tab" + tabIndex];
            break;
        case 5:
            if (tabStatuses["tab" + tabIndex]) {
                $("#video-to-upload-url").val(tabStatuses.lot.videoToUploadUrl);
                $("#cattle-video").attr("src", tabStatuses.lot.videoToUploadUrl);
                $("#uploader-video").val("");
                $("#cattle-video").parent().removeClass("border-danger");
            }
            else {
                $("#cattle-video").parent().addClass("border-danger");
            }

            valid = tabStatuses["tab" + tabIndex];
            break;
        default:
            valid = false;
    }


    if (valid) {
        document.getElementsByClassName("step-top-bar")[currentTab].className += " finish";
    }

    return valid;
}

function fixStepIndicator(n) {
    /*
    var i, x = document.getElementsByClassName("step-top-bar");
    for (i = 0; i < x.length; i++) {
        x[i].className = x[i].className.replace(" active", "");
    }
    x[n].className += " active";
    */

    $("#all-steps span.step").removeClass("active");
    $("#all-steps span.step:nth-child(" + (n + 2) + ")").addClass("active");
}

function updateOnTypesRelatedToCalves() {
    if (["15", "3", "6"].includes($("[name='typeId']").val())) {
        if ($("[name='calves-weaning']:checked").val() == "1") {
            $("[name='calves']").val(0);
            $("[name='weaning']").val(Math.round(parseInt($("[name='totalLotQuantity']").val()) / 2));
        }
        else {
            $("[name='calves']").val($("[name='totalLotQuantity']").val());
            $("[name='weaning']").val(0);
        }
    }

    if (["15", "6"].includes($("[name='typeId']").val())) {
        if ($("[name='caped-entire']:checked").val() == "1") {
            $("[name='entire']").val(0);
            $("[name='caped']").val($("[name='totalLotQuantity']").val());
        }
        else {
            $("[name='entire']").val($("[name='totalLotQuantity']").val());
            $("[name='caped']").val(0);
        }
    }

    if (!(["8"].includes($("[name='typeId']").val()))) {
        $("[name='weightCalvesMean']").val(0);
    }
};

// Saving procedure
async function saveCattleProcc(callback) {
    updateOnTypesRelatedToCalves();

    const formElementObject = document.getElementById("cattle-new-form");
    const formData = new FormData(formElementObject);
    formData.append("submitType", "save");

    try {

        const response = await fetch(
            "/api/cattle/lot/new/save", {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }

        const jsonReply = await response.json();

        if ("savedLotId" in jsonReply && jsonReply.savedLotId) {
            $("input[name='savedLotId']").val(jsonReply.savedLotId);
        }

        callback(false, jsonReply.tabStatuses);
    } catch (error) {
        console.error(error.message);

        callback(true, {});
    }
};

function inspectFarmSelect() {
    if ($("[name='customerFarmSelect']").val() == "10000001") {
        $("#farms-in-lot").removeClass("d-none");
        $("#search-farms-container").removeClass("d-none");
        $("#new-farm-input").addClass("d-none");
    }
    else if ($("[name='customerFarmSelect']").val() == "10000002") {
        $("#farms-in-lot").addClass("d-none");
        $("#search-farms-container").addClass("d-none");
        $("#new-farm-input").removeClass("d-none");
    }
    else {
        $("#farms-in-lot").addClass("d-none");
        $("#search-farms-container").addClass("d-none");
        $("#new-farm-input").addClass("d-none");
    }
}