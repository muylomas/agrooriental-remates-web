function changeVideoImageDisplay(lotId) {
    if (
        !($("#image-" + lotId).is(":hidden"))
    ) {
        $("#image-" + lotId).hide();
        $("#video-" + lotId).show();
    }
    else {
        $("#image-" + lotId).show();
        $("#video-" + lotId).hide();
    }
};