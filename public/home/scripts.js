function expandMap(lotId) {
    if ($("#google-map-bottom-desc-" + lotId).css("height") == "150px") {
        $("#google-map-bottom-desc-" + lotId).stop().animate({ height: "0", width: "0" });
        $("#google-map-bottom-desc-text-" + lotId).hide();
        $("#google-map-under-desc-text-" + lotId).show();
        $("#map-closed-icon-" + lotId).css("background-image", "url(https://agro-oriental-remates.s3.us-west-1.amazonaws.com/images/home/maps-icon.png)");
    }
    else {
        $("#google-map-bottom-desc-" + lotId).stop().animate({ height: "150px", width: "100%" });
        $("#google-map-bottom-desc-text-" + lotId).show();
        $("#google-map-under-desc-text-" + lotId).hide();
        $("#map-closed-icon-" + lotId).css("background-image", "url(https://agro-oriental-remates.s3.us-west-1.amazonaws.com/images/home/maps-close-icon.png)");
    }
}

function clickOnCattleVideo(lotId) {
    if (
        $("#iconbar-overlay-" + lotId).is(":hidden") ||
        $("#bottom-overlay-" + lotId).is(":hidden") ||
        $(".topbar-overlay-video").is(":hidden")
    ) {
        $("#iconbar-overlay-" + lotId).show();
        $("#bottom-overlay-" + lotId).show();

        $(".topbar-overlay-video").show();
    }
    else {
        $("#iconbar-overlay-" + lotId).hide();
        $("#bottom-overlay-" + lotId).hide();

        $(".topbar-overlay-video").hide();
    }
};