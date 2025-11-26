function changeVideoImageDisplay(lotId) {
    if (
        !($("#image-" + lotId).is(":hidden"))
    ) {
        $("#image-" + lotId).hide();
        $("#video-" + lotId).show();
        $("#view-in-youtube-" + lotId).show();
        $("#view-in-youtube-" + lotId).removeClass("d-none");
        $("#view-media-selector-" + lotId + " i").removeClass("mdi-video");
        $("#view-media-selector-" + lotId + " i").addClass("mdi-camera");

    }
    else {
        $("#image-" + lotId).show();
        $("#video-" + lotId).hide();
        $("#view-in-youtube-" + lotId).hide();
        $("#view-media-selector-" + lotId + " i").removeClass("mdi-camera");
        $("#view-media-selector-" + lotId + " i").addClass("mdi-video");
    }
};