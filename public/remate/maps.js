function create_map(mapLatitude, mapLongitude, mapContainerId) {
    const mapOptions = {
        mapId: mapContainerId,
        zoom: 8,
        center: new google.maps.LatLng(mapLatitude, mapLongitude),
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        mapTypeControl: false,
        scaleControl: false,
        streetViewControl: false,
        rotateControl: false,
        fullscreenControl: false,
        draggable: false,
        scrollwheel: false,
        disableDoubleClickZoom: false,
        zoomControl: false,
    };

    var map = new google.maps.Map(document.getElementById(mapContainerId), mapOptions);

    return map;
};

function update_marker_position(map, mapLatitude, mapLongitude, mapLabel, infoWindow, googleMapMarker) {
    if (infoWindow)
        infoWindow.close();

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