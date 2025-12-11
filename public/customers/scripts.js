function goBackwards() {
    window.history.go(-1);
    return false;
};

function updateOnNidType() {
    if ($("#nid-type-id").val() == 1) {
        $("#label-company-name").html("Nombre");
        if (!$("input[name='companyName']").val()) {
            $("input[name='companyName']").val(
                $("input[name='name']").val() + " " +
                $("input[name='surname']").val()
            )
        }
    }
    else {
        $("#label-company-name").html("Razón social");
    }
};

var updatingProfile = false;
function updateProfile() {
    updatingProfile = true;
    $("#updating-profile-spinner").removeClass("d-none");
    $.post(
        "/api/customers/profile/update",
        {
            name: $("[name='name']").val(),
            surname: $("[name='surname']").val(),
            nidTypeId: parseInt($("[name='nidTypeId']").val()),
            nid: $("[name='nid']").val(),
            companyName: $("[name='companyName']").val(),
        },
        function (results) {
            updatingProfile = false;
            $("#updating-profile-spinner").addClass("d-none");

            /*let problemsInRequest = true;
            let paymentInAdvanceId = 0;
            let paymentsInAdvanceAmount = 0;
            if ("error" in results) {
                if (!results.error && results.paymentInAdvanceId) {
                    problemsInRequest = false;
                    paymentInAdvanceId = results.paymentInAdvanceId;
                    paymentsInAdvanceAmount = results.paymentsInAdvanceAmount;
                }
            }

            if (problemsInRequest) {
                errorDialog();
            }
            else {
                $("#paymentInAdvanceSection").removeClass("text-left");
                $("#paymentInAdvanceSection").addClass("text-center");
                $("#paymentInAdvanceSection").addClass("bg-warning");
                $("#paymentInAdvanceSection").html(
                    `
                        <p class="m-0 p-2 w-100">
                            Adelanto #` + paymentInAdvanceId + ` por</br>
                            <b>USD ` + paymentsInAdvanceAmount + `</b></br>
                            en proceso
                        </p>
                    `
                );
                successialog();
            }*/
        }
    );
};