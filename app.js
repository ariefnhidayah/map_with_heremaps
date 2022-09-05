let map
// let svgMarkup = 'https://img.icons8.com/dusk/48/000000/marker.png';
let marker
let behavior
initialize();
getCurrentLocation()
// Define a variable holding SVG mark-up that defines an icon image:
function initialize() {
    // Initialize the platform object:
    var platform = new H.service.Platform({
        apikey: ""
    });

    // Obtain the default map types from the platform object
    var maptypes = platform.createDefaultLayers();

    // Instantiate (and display) a map object:
    map = new H.Map(
        document.getElementById("mapContainer"),
        maptypes.vector.normal.map, {
            zoom: 13,
            center: {
                lng: 106.816666,
                lat: -6.200000
            }
        },
    );

    // Enable the event system on the map instance:
    var mapEvents = new H.mapevents.MapEvents(map);

    map.addEventListener('pointermove', function (event) {
        // if (event.target instanceof H.map.Marker) {
        //     map.getViewPort().element.style.cursor = 'pointer';
        // } else {
        //     map.getViewPort().element.style.cursor = 'auto';
        // }
        map.getViewPort().element.style.cursor = 'pointer';
    }, false);

    // Instantiate the default behavior, providing the mapEvents object:
    behaviour = new H.mapevents.Behavior(mapEvents);
    new H.ui.UI.createDefault(map, maptypes);

}

function getCurrentLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(getLatLng);
    } else {
        return alert("???")
    }
}

function getLatLng(position) {
    // Create an icon, an object holding the latitude and longitude, and a marker:
    // var icon = new H.map.Icon(svgMarkup)
    var coords = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
    }
    marker = new H.map.Marker(coords, {
        // icon: icon,
        volatility: true
    }, );

    // Add the marker to the map and center the map at the location of the marker:
    addMarker(marker, coords)
    addDraggableMarker(map, behaviour)

    // Add event listener:
    map.addEventListener('tap', function (evt) {
        // Log 'tap' and 'mouse' events:
        // console.log(evt.type, evt.currentPointer.type);
        var coord = map.screenToGeo(evt.currentPointer.viewportX, evt.currentPointer.viewportY);
        
        marker = new H.map.Marker(coord, {
            // icon: icon,
            volatility: true
        }, );
        console.log(coord)
        map.removeObjects(map.getObjects())
        addMarker(marker, coord, true, true)
        addDraggableMarker(map, behaviour)
    });
}

function addMarker(marker, coords, isCenter = true, isAnimated = false) {
    map.addObject(marker);
    if (isCenter) {
        map.setCenter(coords, isAnimated);
    }
}

function addDraggableMarker(map, behavior) {
    // Ensure that the marker can receive drag events
    marker.draggable = true;
    map.addObject(marker);

    // disable the default draggability of the underlying map
    // and calculate the offset between mouse and target's position
    // when starting to drag a marker object:
    map.addEventListener('dragstart', function (ev) {
        var target = ev.target,
            pointer = ev.currentPointer;
        if (target instanceof H.map.Marker) {
            var targetPosition = map.geoToScreen(target.getGeometry());
            target['offset'] = new H.math.Point(pointer.viewportX - targetPosition.x, pointer.viewportY - targetPosition.y);
            behavior.disable();
        }
    }, false);


    // re-enable the default draggability of the underlying map
    // when dragging has completed
    map.addEventListener('dragend', function (ev) {
        var target = ev.target;
        let pointer = ev.currentPointer;
        if (target instanceof H.map.Marker) {
            let coord = map.screenToGeo(pointer.viewportX - target['offset'].x, pointer.viewportY - target['offset'].y)
            console.log(coord)
            behavior.enable();
        }
    }, false);

    // Listen to the drag event and move the position of the marker
    // as necessary
    map.addEventListener('drag', function (ev) {
        var target = ev.target,
            pointer = ev.currentPointer;
        if (target instanceof H.map.Marker) {
            let coord = map.screenToGeo(pointer.viewportX - target['offset'].x, pointer.viewportY - target['offset'].y)
            target.setGeometry(coord);
        }
    }, false);
}