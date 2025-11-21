function hideShowAreacode() {
    if ($("#phone-country").val() == '1') {
        $("#phone-areacode").addClass("d-none");
    }
    else {
        $("#phone-areacode").removeClass("d-none");
    }
};