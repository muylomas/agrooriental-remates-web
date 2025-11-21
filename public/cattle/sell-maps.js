var googleMapMarker = null;
var map = null;
var infoWindow = null;

window.addEventListener('load', function () {
    const uyLatlng = { lat: -32.91738186664808, lng: -55.924416022336466, };
    map = create_map(uyLatlng.lat, uyLatlng.lng);
    // Create the initial InfoWindow.
    if (!infoWindow) {
        infoWindow = new google.maps.InfoWindow({
            content: "Hacé click en el mapa para seleccionar la ubicación!",
            position: uyLatlng,
        });

        infoWindow.open(map);
    }

    var geocoder = new google.maps.Geocoder();

    // Configure the click listener.
    map.addListener("click", (mapsMouseEvent) => {
        // Close the current InfoWindow.
        update_marker_position(map, mapsMouseEvent.latLng.lat(), mapsMouseEvent.latLng.lng());
        $("[name='addressLatitude']").val(mapsMouseEvent.latLng.lat());
        $("[name='addressLongitude']").val(mapsMouseEvent.latLng.lng());

        geocoder.geocode({
            'latLng': mapsMouseEvent.latLng
        }, function (results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                if (results[0]) {
                    const place = results[0];
                    for (let indAddComp in place.address_components) {
                        if (place.address_components[indAddComp].types.includes("locality")) {
                            $("[name='addressLocation']").val(place.address_components[indAddComp].long_name);
                        }
                        if (place.address_components[indAddComp].types.includes("administrative_area_level_1")) {
                            $("[name='addressState']").val(place.address_components[indAddComp].long_name
                                .replace(" Department", "")
                                .replace("Departamento de ", "")
                                .trim());
                        }
                        if (place.address_components[indAddComp].types.includes("country")) {
                            $("[name='addressCountry']").val(place.address_components[indAddComp].long_name);
                        }
                        if (place.address_components[indAddComp].types.includes("postal_code")) {
                            $("[name='addressZipCode']").val(place.address_components[indAddComp].long_name);
                        }
                    }
                }
            }
        }
        );
    });

    if ($("[name='addressLatitude']").val() && $("[name='addressLongitude']").val()) {
        update_marker_position(
            map,
            parseFloat($("[name='addressLatitude']").val()),
            parseFloat($("[name='addressLongitude']").val())
        );
    }
});

function create_map(mapLatitude, mapLongitude) {
    const mapOptions = {
        mapId: "google-map-for-cattle",
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

    var map = new google.maps.Map(document.getElementById("googleMap"), mapOptions);

    return map;
};

function update_marker_position(map, mapLatitude, mapLongitude) {
    if (infoWindow)
        infoWindow.close();

    let mapLabel = "Ubicación";
    if ($("[name='farmName']").val()) {
        mapLabel = $("[name='farmName']").val();
    }

    if (map) {
        if (googleMapMarker) {
            googleMapMarker.setMap(null);
        }

        googleMapMarker = new google.maps.marker.AdvancedMarkerElement({
            map,
            position: new google.maps.LatLng(mapLatitude, mapLongitude),
        });

        infoWindow = new google.maps.InfoWindow({
            content: '<span style="color:#111; text-align:center; display:block;" ><b>' + mapLabel + '</b> </span>'
        });
        infoWindow.open(map, googleMapMarker);
    }
};

function freightCalc(farmId, fromLatitude, fromLongitude, toLatitude, toLongitude, callback) {
    var start = new google.maps.LatLng(fromLatitude, fromLongitude)
    var end = new google.maps.LatLng(toLatitude, toLongitude)
    var directionsService = new google.maps.DirectionsService()
    const request = {
        origin: start,
        destination: end,
        travelMode: google.maps.TravelMode.DRIVING
    }
    directionsService.route(request, function (response, status) {
        if (status == google.maps.DirectionsStatus.OK) {
            callback(
                farmId,
                response.routes[0].legs[0].distance.text,
                response.routes[0].legs[0].distance.value / 1000,
                response.routes[0].legs[0].duration.text,
            );
        } else {
            console.log("No se pudo realizar el c&aacute;lculo de distancia");
        }
    })
};