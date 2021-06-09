var routingParameters = {
  'routingMode': 'fast',
  'transportMode': 'car',
  'avoid[areas]':'bbox:13.4,52.51,13.375509629584851,52.588313568689344|bbox:13.53,52.51,13.5,52.588313568689344',
  'return': 'polyline'
};

var platform = new H.service.Platform({
  'apikey': 'kA9AulfRNm5KJXSiKj2wiUVsETSdOvInigM7wC2yEpc'
});

var router = platform.getRoutingService(null, 8);
var service = platform.getSearchService();

var defaultLayers = platform.createDefaultLayers();

var map = new H.Map(document.getElementById('mapContainer'),defaultLayers.vector.normal.map,{
    pixelRatio: window.devicePixelRatio || 1
});
var routeLine;
var startMarker;
var endMarker;
var onResult = function(result) {
  // ensure that at least one route was found
  if (result.routes.length) {
    var object;
    for (object of map.getObjects()){
      if (object.id==="route"){
        map.removeObject(object);
      }
    }
    result.routes[0].sections.forEach((section) => {
         // Create a linestring to use as a point source for the route line
        let linestring = H.geo.LineString.fromFlexiblePolyline(section.polyline);

        // Create a polyline to display the route:
        routeLine = new H.map.Polyline(linestring, {
          style: { strokeColor: 'blue', lineWidth: 3 }
        });
        
        routeLine.id="route"

        var group = new H.map.Group();
        group.id="route"
        // Create a marker for the start point:
        startMarker=new H.map.Marker(section.departure.place.location);

        // // Create a marker for the end point:
        endMarker=new H.map.Marker(section.arrival.place.location);

        // Add the route polyline and the two markers to the map:
        group.addObject(startMarker)
        group.addObject(endMarker)
        map.addObject(routeLine);
        map.addObject(group);

        // Set the map's viewport to make the whole route visible:
        map.getViewModel().setLookAtData({bounds: routeLine.getBoundingBox()});
    });
  }
};

function calcRoute(startLng,startLat,destLng,destLat){
  routingParameters['origin'] = startLat+','+startLng;
  routingParameters['destination'] = destLat+','+destLng;
  // The end point of the route:
  router.calculateRoute(routingParameters, onResult,
    function(error) {
      alert(error.message);
    }
  );
}
var myPosition;
// Ensure that the marker can receive drag events
function setup(lng,lat){
  map.setZoom(10);
  map.setCenter({ lng: lng, lat: lat });
  myPosition = new H.map.Marker({ lng: lng, lat: lat });
  map.addObject(myPosition);
}
var mapEvents = new H.mapevents.MapEvents(map);
// window.addEventListener('resize', () => map.getViewPort().resize());
var behavior = new H.mapevents.Behavior(mapEvents);
var str = '200 S Mathilda Ave, Sunnyvale, CA';
function getPosition(s){
  var object;
  for (object of map.getObjects()){
    if (object.id==="searchMarkers"){
      map.removeObject(object);
    }
  }
  service.geocode({
    q: s
  }, (result) => {
    console.log("ana hna")
    // Add a marker for each location found
    var g = new H.map.Group()
    g.id="searchMarkers"
    result.items.forEach((item) => {
      console.log("kayn Items")
      var search = new H.map.Marker(item.position);
      g.addObject(search);
      map.setCenter(item.position);
      map.addObject(g)
    });
  }, alert);
}
// setup(13.4,52.51)
// calcRoute(8.68340740740811,50.1120423728813,13.3846220493377,52.5309916298853)
// setTimeout(calcRoute, 20000,13.4,52.51,20,45.51);
// getPosition("Av Hassan II temara")
var searchBox=document.getElementById("searchInput")
searchBox.addEventListener('keypress', (event) => {
  if (event.keyCode === 13) {
    var searchStr = searchBox.value
    getPosition(searchStr)
    event.preventDefault();
  }

})
