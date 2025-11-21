function fireFileInputFromImg() {
    $("#uploader-image").click();
};

function readURL(input) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();

        reader.onload = function (e) {
            $('#uploader-image-container').css('background-image', 'url(' + e.target.result + ')');
        }

        reader.readAsDataURL(input.files[0]); // convert to base64 string
    }
};

$(document).ready(function () {
    $("#uploader-image").change(function () {
        readURL(this);
        $("#file-name-to-upload").val($(this).val().replace(/C:\\fakepath\\/i, ''));
        $("#image-to-upload-url").val('');
    });
});