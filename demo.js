var routingParameters = {
  'routingMode': 'fast',
  'transportMode': 'car',
  'avoid[areas]': 'bbox:13.4,52.51,13.375509629584851,52.588313568689344|bbox:13.53,52.51,13.5,52.588313568689344',
  'return': 'polyline'
}
var platform = new H.service.Platform({
  'apikey': 'kA9AulfRNm5KJXSiKj2wiUVsETSdOvInigM7wC2yEpc'
});
var router = platform.getRoutingService(null, 8);
var service = platform.getSearchService();
var defaultLayers = platform.createDefaultLayers();
var map = new H.Map(document.getElementById('mapContainer'), defaultLayers.vector.normal.map, {
  pixelRatio: window.devicePixelRatio || 1
});
map.getViewModel().addEventListener('sync', function () {
  rotComp = ((map.getViewModel().getLookAtData().heading - 180) % 360)
  console.log("rotcomp: " + rotComp)
})
var ui = H.ui.UI.createDefault(map, defaultLayers);
var routeLine
var startMarker
var endMarker
var interval
var counter = 0
var heatPoints = []
// domIconElement.style.margin = '-20px 0 0 -20px';
var domIconElement = document.createElement('div')
domIconElement.innerHTML = '<img id="self" src="self.png" width="75px"/>'
domIconElement.style = 'z-index:0'
var onResult = function (result) {
  // ensure that at least one route was found
  if (result.routes.length) {
    var object;
    for (object of map.getObjects()) {
      if (object.id === "route") {
        map.removeObject(object);
      }
    }
    result.routes[0].sections.forEach((section) => {
      // Create a linestring to use as a point source for the route line
      let linestring = H.geo.LineString.fromFlexiblePolyline(section.polyline);

      // Create a polyline to display the route:
      routeLine = new H.map.Polyline(linestring, {
        style: { strokeColor: '#00B5FF', lineWidth: 4 }
      });

      routeLine.id = 'route'

      var group = new H.map.Group();
      group.id = 'route'
      // Create a marker for the start point:
      // startMarker = new H.map.Marker(section.departure.place.location);

      // // Create a marker for the end point:
      endMarker = new H.map.Marker(section.arrival.place.location);

      // Add the route polyline and the two markers to the map:
      // group.addObject(startMarker)
      group.addObject(endMarker)
      map.addObject(routeLine);
      map.addObject(group);

      // Set the map's viewport to make the whole route visible:
      map.getViewModel().setLookAtData({ bounds: routeLine.getBoundingBox() });
    });
  }
};
var dangers
function setDangers () {
  var object
  for (object of map.getObjects()) {
    if (object.id === 'danger') {
      map.removeObject(object);
    }
  }
  dangers = new H.map.Group()
  dangers.id = 'danger'
  
  map.addObject(dangers)
  dangers.addEventListener('longpress', function (evt) {
    window.location.hash = evt.target.id
  }, false);
  dangers.addEventListener('tap', function (evt) {
    // event target is the marker itself, group is a parent event target
    // for all objects that it contains
    var bubble = new H.ui.InfoBubble(evt.target.getGeometry(), {
      // read custom data
      content: evt.target.getData()
    });
    // show info bubble
    ui.addBubble(bubble);
  }, false);
  $.ajax({
    url: "https://roadsafeazurefuncs20210609092106.azurewebsites.net/api/GetShortDangerTrigger",
  }).done(function(data) {
    var ars = []
    heatPoints = []
    var deltaLat = (0.01/111.10)
    var deltaLng = (0.01/111.32)
    // var deltaLat = 2
    // var deltaLng = 2
    data.forEach(function (el) {
      if(el.status !== 'onhold') {
        heatPoints[heatPoints.length] = {lng: parseFloat(el.location.longitude), lat: parseFloat(el.location.latitude), value: 10}
      }
      if (el.status === 'confirmed') {
        // var ksidaIconElement = document.createElement('div')
        console.log(el)
        var ic = ('https://zackautocracy.github.io/roadsafewebview/' + el.type.replace(' ','_') + '.png')
        console.log(ic)
        var ksidaIcon = new H.map.Icon(ic, { size: { w: 40, h: 40 } });
        var ksida = new H.map.Marker({ lng: el.location.longitude, lat: el.location.latitude }, {icon: ksidaIcon })
        ksida.setData('<div><img src="' + el.liveImage + '"/></div><div><p>' + el.comment + '</p></div>');
        ksida.id = el.id
        dangers.addObject(ksida)
        var customStyle = {
          strokeColor: '#00B5FF',
          fillColor: 'rgba(0, , 181, 0, 0.5)',
          lineWidth: 1,
          lineCap: 'square'
        };
        ars[ars.length] = 'bbox:' + (parseFloat(el.location.longitude) - deltaLng) + ',' + (parseFloat(el.location.latitude) - deltaLat) + ',' + (parseFloat(el.location.longitude) + deltaLng) + ',' + (parseFloat(el.location.latitude) + deltaLat)

        // var rect = new H.map.Rect(new H.geo.Rect(parseFloat(el.location.latitude) - deltaLat, parseFloat(el.location.longitude) - deltaLng , parseFloat(el.location.latitude) + deltaLat , parseFloat(el.location.longitude) + deltaLng), { style: customStyle })
      }
      // map.addObject(rect)
    })
    routingParameters['avoid[areas]'] = ars.join('|')
    console.log(routingParameters['avoid[areas]'])
    // routingFunc()
  });
}
function calcRoute(startLng, startLat, destLng, destLat) {
  routingParameters['origin'] = startLat + ',' + startLng;
  routingParameters['destination'] = destLat + ',' + destLng;
  // The end point of the route:
  router.calculateRoute(routingParameters, onResult,
    function (error) {
      alert(error.message);
    }
  );
}
var myPosition
function setup(lng, lat) {
  map.setZoom(10);
  map.setCenter({ lng: lng, lat: lat });
  var object
  for (object of map.getObjects()) {
    if (object.id === "me") {
      map.removeObject(object);
    }
  }
  myPosition = new H.map.DomMarker({ lng: lng, lat: lat }, {
    icon: new H.map.DomIcon(domIconElement, {
      onAttach: function (clonedElement, domIcon, domMarker) {
        var clonedContent = clonedElement.getElementsByTagName('img')[0]
        init (clonedContent, { lng: lng, lat: lat })
        console.log()
      },
      onDetach: function (clonedElement, domIcon, domMarker) {
        // stop the rotation if dom icon is not in map's viewport
        clearInterval(interval);
      }
    })
  });
  setDangers()
  myPosition.id = "me"
  map.addObject(myPosition)
}
function initSetup(lng, lat) {
  map.setZoom(4);
  map.setCenter({ lng: lng, lat: lat });
}
var mapEvents = new H.mapevents.MapEvents(map);
var behavior = new H.mapevents.Behavior(mapEvents);
var searchMarker;
function getPosition(s) {
  var object;
  for (object of map.getObjects()) {
    if (object.id === "searchMarkers") {
      map.removeObject(object);
    }
  }
  service.geocode({
    q: s
  }, (result) => {
    console.log("ana hna")
    // Add a marker for each location found
    var g = new H.map.Group()
    g.id = "searchMarkers"
    result.items.forEach(function (item) {
      console.log("kayn Items")
      map.setCenter(item.position);
      map.setZoom(13);
      searchMarker = new H.map.Marker(item.position);
      g.addObject(searchMarker);
      map.addObject(g)
    });
  }, (error) => { alert(error) });
}
setup(6.8498,33.9716)
function routingFunc() {
  var starter = myPosition.getGeometry();
  var ender = searchMarker.getGeometry();
  // console.log(searchMarker)
  calcRoute(starter.lng, starter.lat, ender.lng, ender.lat)
}
var searchBox = document.getElementById("searchInput")
searchBox.addEventListener('keypress', (event) => {
  if (event.keyCode === 13) {
    var searchStr = searchBox.value
    getPosition(searchStr)
  }
})
function goToMyPosition () {
  map.setCenter(myPosition.getGeometry())
}
function updatePosition (lng, lat) {
  myPosition.setGeometry({lng: lng, lat: lat })
}
ui.getControl('mapsettings').setVisibility(false)
ui.getControl('zoom').setVisibility(false)
ui.getControl('scalebar').setVisibility(false)

var heatmapProvider = new H.data.heatmap.Provider({
  colors: new H.data.heatmap.Colors({
    '0':   '#008', // dark blue
    '0.2': '#0b0', // medium green
    '0.5': '#ff0', // yellow
    '0.7': '#f00'  // red
   }, true),
  opacity: 1,
  // Paint assumed values in regions where no data is available
  assumeValues: false
});
var hmap = new H.map.layer.TileLayer(heatmapProvider)

function showHeatMap () {
  console.log(heatPoints)
  heatmapProvider.addData(heatPoints);
  // map.addLayer(hmap);
}
function heatmap() {
  var object
  var flag=0
  for (object of map.getObjects()) {
    if (object.id === 'danger') {
      map.removeObject(object);
      flag = 1
    }
  }
  if (flag === 0) {
    map.addObject(dangers)
    map.removeLayer(hmap)
    console.log("test")
  } else {
    showHeatMap()
    map.addLayer(hmap)
  }
}
