var googleMapMarker_search = [];
var map_search = null;
var infoWindow_search = null;
var lastMapBounds = {
    latMin: 0,
    latMax: 0,
    lngMin: 0,
    lngMax: 0,
};
var stopRefreshingBounds = false;
var lastLotsSearch = [];

window.addEventListener('load', function () {
    map_search = create_map_search(customerLatLng.lat, customerLatLng.lng);

    if (!infoWindow_search) {
        infoWindow_search = new google.maps.InfoWindow();

        infoWindow_search.open(map_search);
    }

    // Configure the click listener.
    map_search.addListener("idle", (mapsMouseEvent) => {
        if (!stopRefreshingBounds) {
            callForLotsInBounds();
        }
    });

    map_search.addListener("bounds_changed", (mapsMouseEvent) => {
        lastMapBounds = {
            latMin: map_search.getBounds().getSouthWest().lat(),
            latMax: map_search.getBounds().getNorthEast().lat(),
            lngMin: map_search.getBounds().getSouthWest().lng(),
            lngMax: map_search.getBounds().getNorthEast().lng(),
        };
    });
});

function create_map_search(mapLatitude, mapLongitude) {
    const mapOptions = {
        mapId: "search_map_id",
        zoom: 8,
        center: new google.maps.LatLng(mapLatitude, mapLongitude),
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        mapTypeControl: false,
        scaleControl: false,
        streetViewControl: false,
        rotateControl: false,
        fullscreenControl: false,
        draggable: true,
        scrollwheel: false,
        disableDoubleClickZoom: true,
        zoomControl: true,
    };

    return new google.maps.Map(document.getElementById("google-map-search-container"), mapOptions);
};

function callForLotsInBounds() {
    getLotsInBounds(
        lastMapBounds.latMin,
        lastMapBounds.latMax,
        lastMapBounds.lngMin,
        lastMapBounds.lngMax,
        function (mapSearchedLots) {
            for (let clearMarkerIndex in googleMapMarker_search) {
                googleMapMarker_search[clearMarkerIndex].setMap(null);
            }

            googleMapMarker_search = [];

            if (mapSearchedLots.length) {
                drawLotsInMap(map_search, mapSearchedLots);
                lastLotsSearch = mapSearchedLots;
            }
        }
    );
}

function drawLotsInMap(map, lots) {

    if (map) {
        let lotsInMapLatLng = [];
        for (let markerIndex in lots) {
            const __aux_lotLastPrice = (lots[markerIndex].auctionPriceType == 1 ? lots[markerIndex].lastPrice.toFixed(2) : lots[markerIndex].lastPrice.toFixed(0))
            const priceTag = document.createElement("div");
            priceTag.className = "price-tag";
            priceTag.textContent = lots[markerIndex].currency + __aux_lotLastPrice;



            googleMapMarker_search.push(
                new google.maps.marker.AdvancedMarkerElement({
                    map,
                    position: new google.maps.LatLng(lots[markerIndex].addressLatitude, lots[markerIndex].addressLongitude),
                    title: "Lote: " + lots[markerIndex].lotId,
                    content: priceTag,
                })
            );

            google.maps.event.addListener(googleMapMarker_search[googleMapMarker_search.length - 1], 'click', (function (marker, lots, markerIndex) {
                return function () {
                    stopRefreshingBounds = true;// returns LatLng object

                    let lotAddressLatitude = lots[markerIndex].addressLatitude;
                    let lotAddressLongitude = lots[markerIndex].addressLongitude;

                    if (lotsInMapLatLng.includes(lotAddressLatitude + "__" + lotAddressLongitude)) {
                        lotAddressLatitude += (-.00004 * Math.cos((+a * i) / 180 * Math.PI));
                        lotAddressLongitude += (-.00004 * Math.sin((+a * i) / 180 * Math.PI));
                    }
                    else {
                        lotsInMapLatLng.push(lotAddressLatitude + "__" + lotAddressLongitude);
                    }

                    map.setCenter(
                        new google.maps.LatLng(
                            lotAddressLatitude,
                            lotAddressLongitude
                        )
                    );

                    if (infoWindow_search)
                        infoWindow_search.close();

                    const __aux_finalimage = lots[markerIndex].imagesArray[0];

                    infoWindow_search = new google.maps.InfoWindow({
                        content:
                            `
                                <div class='w-100 mb-2' 
                                    onclick='goToLotByIdFromMap(` + lots[markerIndex].lotId + `)'
                                    style='height:140px; background:url(` + __aux_finalimage + `); background-size:cover;'>
                                </div>
                                <div class="px-3 mb-1">
                                    <h5 class="mb-1 text-uppercase">Lote #` + lots[markerIndex].lotId + `</h5>
                                    <h6 class='m-0'>
                                        ` + lots[markerIndex].totalQuantity + " " + lots[markerIndex].type + `
                                    </h6>
                                    <p class='m-0'>
                                        <b>Peso</b>: ` + lots[markerIndex].meanWeight.toFixed(0) + ` Kg
                                    </p>
                                </div>
                                <button class='btn btn-warning btn-lg font-weight-medium text-dark px-3' 
                                    onclick='goToLotByIdFromMap(` + lots[markerIndex].lotId + `)'>
                                        <b>
                                            Quiero el lote / ` + lots[markerIndex].currency + " " + __aux_lotLastPrice + `
                                        </b>
                                        &nbsp;` + (lots[markerIndex].auctionPriceType == 1 ? "por kilo" : "por bulto") + `
                                </button>
                            `
                    });

                    infoWindow_search.open(map, marker);

                    google.maps.event.addListener(infoWindow_search, 'closeclick', function () {
                        stopRefreshingBounds = false;
                    });
                }
            }
            )(googleMapMarker_search[googleMapMarker_search.length - 1], lots, markerIndex));
        }
    }
};

function getLotsInBounds(latMin, latMax, lngMin, lngMax, callback) {
    lastLotsSearch = [];
    cattleTypes = [];
    $("[id^='search-cattle-type-']").each(function () {
        if ($(this).hasClass("btn-success")) {
            cattleTypes.push(parseInt($(this).attr("id").replace('search-cattle-type-', '')));
        }
    });

    cattleCaracteristics = [];
    /*$("[id^='search-cattle-caracteristics-']").each(function () {
        if ($(this).hasClass("btn-warning")) {
            cattleCaracteristics.push(parseInt($(this).attr("id").replace('search-cattle-caracteristics-', '')));
        }
    });*/

    let cattleWintering = "";
    if ($("#wintering-1").hasClass("btn-warning")) {
        cattleWintering = "wintering";
    }
    else if ($("#wintering-0").hasClass("btn-warning")) {
        cattleWintering = "breeding";
    }

    $.post(
        "/api/cattle/search/for/map",
        {
            "latMin": latMin,
            "latMax": latMax,
            "lngMin": lngMin,
            "lngMax": lngMax,
            "cattleTypes": cattleTypes,
            "cattleCaracteristics": cattleCaracteristics,
            "cattleWintering": cattleWintering,
            "cattleSearchText": $("#search-input-text").val(),
        },
        function (results) {
            if (typeof results === 'object' && results !== null) {
                if ("lots" in results) {
                    callback(results.lots);
                }
                else
                    callback([]);
            }
            else
                callback([]);
        }
    );
};