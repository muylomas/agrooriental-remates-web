function fireFileInputFromImg(){
    $("#imgInp").click();
};

function readURL(input) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();
        
        reader.onload = function(e) {
            $('#profileImg').css('background-image','url(' + e.target.result + ')');
        }
        
        reader.readAsDataURL(input.files[0]); // convert to base64 string
    }
};

$("#imgInp").change(function() {
    readURL(this);
    $("#fileNameToUpload").val($(this).val().replace(/C:\\fakepath\\/i, ''));
});