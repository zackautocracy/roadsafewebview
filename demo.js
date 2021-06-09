//  // Initialize the platform object:
//  var platform = new H.service.Platform({
//   'apikey': 'kA9AulfRNm5KJXSiKj2wiUVsETSdOvInigM7wC2yEpc'
// });

// // Obtain the default map types from the platform object
// var maptypes = platform.createDefaultLayers();

// // Instantiate (and display) a map object:
// var map;
// var mapEvents;
// var behavior;
// function showPosition(position) {
//   map = new H.Map(
//   document.getElementById('mapContainer'),
//   maptypes.vector.normal.map,
//   {
//     zoom: 18,
//     center: { lng: position.coords.longitude, lat: position.coords.latitude }
//   });
//   var you = new H.map.Marker({lat:position.coords.latitude, lng:position.coords.longitude});
//   map.addObject(you);
//   mapEvents = new H.mapevents.MapEvents(map)
//   window.addEventListener('resize', () => map.getViewPort().resize());
//   behavior = new H.mapevents.Behavior(mapEvents)
// }
// if (navigator.geolocation) {
//   navigator.geolocation.getCurrentPosition(showPosition);
// } else {
//   map = new H.Map(
//   document.getElementById('mapContainer'),
//   maptypes.vector.normal.map,
//   {
//     zoom: 10,
//     center: { lng: 13.4, lat: 52.51 }
//   });
//   mapEvents = new H.mapevents.MapEvents(map)
//   behavior = new H.mapevents.Behavior(mapEvents)
// }
var onResult = function(result) {
  // ensure that at least one route was found
  if (result.routes.length) {
    console.log(result.routes[0].sections)
    result.routes[0].sections.forEach((section) => {
         // Create a linestring to use as a point source for the route line
        let linestring = H.geo.LineString.fromFlexiblePolyline(section.polyline);

        // Create a polyline to display the route:
        let routeLine = new H.map.Polyline(linestring, {
          style: { strokeColor: 'blue', lineWidth: 3 }
        });

        // Create a marker for the start point:
        // let startMarker = new H.map.Marker(section.departure.place.location);

        // // Create a marker for the end point:
        // let endMarker = new H.map.Marker(section.arrival.place.location);

        // Add the route polyline and the two markers to the map:
        // map.addObjects([routeLine, startMarker, endMarker]);
        map.addObject(routeLine);

        // Set the map's viewport to make the whole route visible:
        // map.getViewModel().setLookAtData({bounds: routeLine.getBoundingBox()});
    });
  }
};

var routingParameters = {
  'routingMode': 'fast',
  'transportMode': 'car',
  // The start point of the route:
  'origin': '50.1120423728813,8.68340740740811',
  // The end point of the route:
  'destination': '52.5309916298853,13.3846220493377',
  'avoid[areas]':'bbox:13.4,52.51,13.375509629584851,52.588313568689344|bbox:13.53,52.51,13.5,52.588313568689344',
  // Include the route shape in the response
  'return': 'polyline'
};
var platform = new H.service.Platform({
  'apikey': 'kA9AulfRNm5KJXSiKj2wiUVsETSdOvInigM7wC2yEpc'
});
var router = platform.getRoutingService(null, 8);
function addDraggableMarker(map, behavior){

  var marker = new H.map.Marker({ lng: 13.4, lat: 52.51 }, {
    // mark the object as volatile for the smooth dragging
    volatility: true
  });
  // Ensure that the marker can receive drag events
  marker.draggable = true;
  map.addObject(marker);

  // disable the default draggability of the underlying map
  // and calculate the offset between mouse and target's position
  // when starting to drag a marker object:
  map.addEventListener('dragstart', function(ev) {
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
  map.addEventListener('dragend', function(ev) {
    var target = ev.target;
    if (target instanceof H.map.Marker) {
      routingParameters['origin'] = target.getGeometry().lat + ',' + target.getGeometry().lng;
      router.calculateRoute(routingParameters, onResult,
        function(error) {
          alert(error.message);
        }
      );
      behavior.enable();
    }
  }, false);

  // Listen to the drag event and move the position of the marker
  // as necessary
   map.addEventListener('drag', function(ev) {
    var target = ev.target,
        pointer = ev.currentPointer;
    if (target instanceof H.map.Marker) {
      target.setGeometry(map.screenToGeo(pointer.viewportX - target['offset'].x, pointer.viewportY - target['offset'].y));
    }
  }, false);
}
function addDraggableMarker2(map, behavior){

  var marker = new H.map.Marker({lat: 52.588313568689344, lng: 13.375509629584851}, {
    // mark the object as volatile for the smooth dragging
    volatility: true
  });
  // Ensure that the marker can receive drag events
  marker.draggable = true;
  map.addObject(marker);

  // disable the default draggability of the underlying map
  // and calculate the offset between mouse and target's position
  // when starting to drag a marker object:
  map.addEventListener('dragstart', function(ev) {
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
  map.addEventListener('dragend', function(ev) {
    var target = ev.target;
    if (target instanceof H.map.Marker) {
      routingParameters['destination'] = target.getGeometry().lat + ',' + target.getGeometry().lng;
      router.calculateRoute(routingParameters, onResult,
        function(error) {
          alert(error.message);
        }
      );
      behavior.enable();
    }
  }, false);

  // Listen to the drag event and move the position of the marker
  // as necessary
   map.addEventListener('drag', function(ev) {
    var target = ev.target,
        pointer = ev.currentPointer;
    if (target instanceof H.map.Marker) {
      target.setGeometry(map.screenToGeo(pointer.viewportX - target['offset'].x, pointer.viewportY - target['offset'].y));
    }
  }, false);
}

// Get an instance of the routing service version 8:


// Call calculateRoute() with the routing parameters,
// the callback and an error callback function (called if a
// communication error occurs):

// Get an object containing the default map layers:
var defaultLayers = platform.createDefaultLayers();

// Instantiate the map using the vecor map with the
// default style as the base layer:
var map = new H.Map(document.getElementById('mapContainer'),
  defaultLayers.vector.normal.map,
  {
    zoom: 10,
    center: { lng: 13.4, lat: 52.51 },
    pixelRatio: window.devicePixelRatio || 1
  }
);
var mapEvents = new H.mapevents.MapEvents(map);
// window.addEventListener('resize', () => map.getViewPort().resize());
var behavior = new H.mapevents.Behavior(mapEvents);
function drawAreas(map) {    
  var firstArea = new H.map.Rect(new H.geo.Rect(52.51,13.4,52.588313568689344,13.375509629584851));  
  var SecondArea = new H.map.Rect(new H.geo.Rect(52.51,13.53,52.588313568689344,13.5));  
  map.addObject(firstArea);  
  map.addObject(SecondArea);  
}
drawAreas(map)
addDraggableMarker(map, behavior);
addDraggableMarker2(map, behavior);
// Create the parameters for the routing request:

// Define a callback function to process the routing response:

