function findIndexByLotId(lotId) {
    let result = { found: false, id: 0 };
    for (let index in lots) {
        if (lots[index].lotId == lotId) {
            result = { found: true, id: index };
        }
    }

    return result;
};

function changeVideoImageDisplay(lotId) {
    if (
        !($("#image-" + lotId).is(":hidden"))
    ) {
        $("#image-" + lotId).hide();

        const indexById = findIndexByLotId(lotId);
        if (indexById.found && lotId in lots && lots[indexById.id].video) {
            $("#cattle-media-container-" + lotId).prepend(
                `
                    <video id="video-`+ lotId + `" class="position-absolute top-50 start-50 translate-middle" preload="auto" playsinline="" autoplay="autoplay" loop="" muted="">
                        <source id="video-source-`+ lotId + `" type="video/mp4" src="` + lots[indexById.id].video + `"/>
                    </video>
                `
            );

            $("#view-in-youtube-" + lotId).show();
            $("#view-in-youtube-" + lotId).removeClass("d-none");
            $("#view-media-selector-" + lotId + " i").removeClass("mdi-video");
            $("#view-media-selector-" + lotId + " i").addClass("mdi-camera");
        }

    }
    else {
        $("#image-" + lotId).show();
        $("#video-" + lotId).remove();
        $("#view-in-youtube-" + lotId).hide();
        $("#view-media-selector-" + lotId + " i").removeClass("mdi-camera");
        $("#view-media-selector-" + lotId + " i").addClass("mdi-video");
    }
};