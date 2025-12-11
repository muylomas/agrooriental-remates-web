function goBackwards() {
    window.history.go(-1);
    return false;
};

function updateOnNidType() {
    if ($("#nid-type-id").val() == 1) {
        $("#label-company-name").hmtl("Nombre");
    }
    else {
        $("#label-company-name").hmtl("Razón social");
    }
};