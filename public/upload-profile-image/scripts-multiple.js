function fireFileInputFromImg(imageIndex) {
    $("#uploader-image-" + imageIndex).click();
};

function readURL(input, imageIndex) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();

        reader.onload = function (e) {
            $("#uploader-image-container-" + imageIndex).css('background-image', 'url(' + e.target.result + ')');
        }

        reader.readAsDataURL(input.files[0]); // convert to base64 string
    }
};

$(document).ready(function () {
    $("[id^='uploader-image-']").change(function () {
        let imageIndex = $(this).attr("id").replace("uploader-image-", "");
        readURL(this, imageIndex);
        $("#file-name-to-upload-" + imageIndex).val($(this).val().replace(/C:\\fakepath\\/i, ''));
        $("#image-to-upload-url-" + imageIndex).val('');
    });
});