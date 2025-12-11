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