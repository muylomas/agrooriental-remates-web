function goBackwards() {
    window.history.go(-1);
    return false;
};

function updateOnNidType() {
    if ($("#nid-type-id").val() == 1) {
        $("#company-name-container").addClass("d-none");
    }
    else {
        $("#company-name-container").removeClass("d-none");
    }
};