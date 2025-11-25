function changeVideoImageDisplay(lotId) {
    if (
        !($("#image-" + lotId).is(":hidden")) ||
        $("#video-" + lotId).is(":hidden")
    ) {
        console.log("Caso 1");
        $("#image-" + lotId).hide();
        $("#video-" + lotId).show();
    }
    else {
        console.log("Caso 2");
        $("#image-" + lotId).show();
        $("#video-" + lotId).hide();
    }
};