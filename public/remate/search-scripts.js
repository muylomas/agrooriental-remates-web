function toggleCategorySelection(catId) {
    if ($("#search-cattle-type-" + catId).hasClass("btn-success")) {
        $("#search-cattle-type-" + catId).addClass("btn-light");
        $("#search-cattle-type-" + catId).removeClass("btn-success");
    }
    else {
        $("#search-cattle-type-" + catId).addClass("btn-success");
        $("#search-cattle-type-" + catId).removeClass("btn-light");
    }

    callForLotsInBounds();
};

function toggleWintering(wintering) {
    if (wintering) {
        $("#wintering-0").removeClass("btn-warning");
        $("#wintering-0").addClass("btn-light");
    }
    else {
        $("#wintering-1").removeClass("btn-warning");
        $("#wintering-1").addClass("btn-light");
    }

    $("[id^='search-cattle-type-']").removeClass("btn-success");
    $("[id^='search-cattle-type-']").addClass("btn-light");

    if ($("#wintering-" + wintering).hasClass("btn-warning")) {
        $("#wintering-" + wintering).addClass("btn-light");
        $("#wintering-" + wintering).removeClass("btn-warning");
        $(".categories-scrolling-items__item").show();
    }
    else {
        $("#wintering-" + wintering).addClass("btn-warning");
        $("#wintering-" + wintering).removeClass("btn-light");
        if (wintering) {
            $(".categories-scrolling-items__item").hide();
            $(".wintering").show();
        }
        else {
            $(".categories-scrolling-items__item").show();
            $(".wintering").hide();
        }
    }

    callForLotsInBounds();
};

function goToLotByIdFromMap(lotId) {
    if (lastLotsSearch.length) {
        lots = lastLotsSearch;
        $("#fsvs-body").html("");
        includeSlidesInFsvs();

        initFsvs();

        lastLotsSearch = [];
    }

    let slideToIndex = 0;
    for (let index in lots) {
        if (lots[index].lotId == lotId) {
            slideToIndex = index;
        }
    }

    slider.rebind();
    slider.startSlider();
    slider.slideToIndex(slideToIndex);

    $(".search-overlay-video").removeClass("open");
    $(".topbar-overlay-video").show();
};

$(document).ready(function () {
    $("#search-for-cattle").on("click", function () {
        $(".search-overlay-video").addClass("open");
        $(".topbar-overlay-video").hide();
        slider.unbind();
        slider.stopSlider();
    });

    $("#search-overlay-video-close").on("click", function () {
        if (lastLotsSearch.length) {
            lots = lastLotsSearch;
            $("#fsvs-body").html("");
            includeSlidesInFsvs();
            initFsvs();
            window.history.pushState({ "html": document.html, "pageTitle": document.title }, "", "/");
            lastLotsSearch = [];
        }

        $(".search-overlay-video").removeClass("open");
        $(".topbar-overlay-video").show();
        slider.rebind();
        slider.startSlider();
    });
});