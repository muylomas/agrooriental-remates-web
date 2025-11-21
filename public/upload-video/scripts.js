function fireFileInputFromImg() {
    $("#uploader-video").click();
};

function readVideoURL(input) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();

        reader.onload = function (e) {
            const file = e.target.files[0];
            const url = URL.createObjectURL(file);
            $('#cattle-video').attr("src", url);
        }

        const file = input.files[0];
        const url = URL.createObjectURL(file);
        $('#cattle-video').attr("src", url);
    }
};

$(document).ready(function () {
    $("#uploader-video").change(function () {
        readVideoURL(this);
        $("#video-name-to-upload").val($(this).val().replace(/C:\\fakepath\\/i, ''));
        $("#video-to-upload-url").val('');
    });
});