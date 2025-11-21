$(document).ready(function () {
    if (document.getElementById("farm-create-form") != null) {
        let val = document.getElementById("farm-create-form");
        val.onkeypress = function (key) {
            var btn = 0 || key.keyCode || key.charCode;
            if (btn == 13) {
                key.preventDefault();
            }
        }
    }
    if (document.getElementById("farm-update-form") != null) {
        let val = document.getElementById("farm-update-form");
        val.onkeypress = function (key) {
            var btn = 0 || key.keyCode || key.charCode;
            if (btn == 13) {
                key.preventDefault();
            }
        }
    }

    $("[name='name']").on('change', function () {
        $("[name='autocomplete-marker-label']").val($(this).val());
        if ($("[name='addressLatitude']").val() && $("[name='addressLongitude']").val()) {
            init_map($("[name='addressLatitude']").val(), $("[name='addressLongitude']").val());
        }
    });
});