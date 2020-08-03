presentLoading(1500);

// the map canvas itself
mapboxgl.accessToken =
  "pk.eyJ1IjoiY2JhdCIsImEiOiJjazJldXB2cnYwY2poM2ZvMjlrenB4MHNkIn0.H1pPRgzwWigP441VDUyWkQ";
var map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mapbox/light-v10",
  logoPosition: "top-left",
  center: [30, 7],
  zoom: 10,
  pitch: 0,
  maxZoom: 18
});

// search input box
var geocoder = new MapboxGeocoder({
  accessToken: mapboxgl.accessToken,
  placeholder: "Where to?",
  marker: false,
  mapboxgl: mapboxgl
});

// map.addControl(geocoder, "bottom-left");

map.on("load", function() {
  // Listen for the `geocoder.input` event that is triggered when a user makes a search

  geocoder.on("result", function(ev) {
    //set geoResponse with geocoder object and set global long lat variables
    geoResponse = ev.result;
    
    currentX = geoResponse.geometry.coordinates[0];
    currentY = geoResponse.geometry.coordinates[1];

    // move scope icon to geoResponse target
    setScope(currentX, currentY);

    //hide splash screen
    if (splashGone == false) {
      splashGone = true;
      // add geocoder input box to map, update text with search result and hide welcome card
      map.addControl(geocoder, "bottom-left");
      $(".mapboxgl-ctrl-geocoder--input").attr("value", geoResponse.place_name);
      $("._welcome_modal_card").css("display", "none");
    }
    
  });

  // Insert the layer beneath any symbol layer.
  var layers = map.getStyle().layers;

  var labelLayerId;
  for (var i = 0; i < layers.length; i++) {
    if (layers[i].type === "symbol" && layers[i].layout["text-field"]) {
      labelLayerId = layers[i].id;
      break;
    }
  }

  // 3D building Feature
  map.addLayer(
    {
      id: "3d-buildings",
      source: "composite",
      "source-layer": "building",
      filter: ["==", "extrude", "true"],
      type: "fill-extrusion",
      minzoom: 15,
      paint: {
        "fill-extrusion-color": "#aaa",

        // use an 'interpolate' expression to add a smooth transition effect to the
        // buildings as the user zooms in
        "fill-extrusion-height": [
          "interpolate",
          ["linear"],
          ["zoom"],
          15,
          0,
          15.05,
          ["get", "height"]
        ],
        "fill-extrusion-base": [
          "interpolate",
          ["linear"],
          ["zoom"],
          15,
          0,
          15.05,
          ["get", "min_height"]
        ],
        "fill-extrusion-opacity": 0.6
      }
    },
    labelLayerId
  );
});

// clickable cities listener
map.on('click', function (e) {
  var features = map.queryRenderedFeatures(e.point);
  if (features[0] != undefined) {
    FlyToPlace(features[0].properties.name, e.lngLat.lng, e.lngLat.lat, 1);
  }
  });

$(document).ready(function() {
  //add geocoder to welcome card
  $("#search-bar-div").append(geocoder.onAdd(map));
  //run user js stuff
  userCheck();

    if (screen.width < 481) { 
      // window width is less than 480px
      if (mapSearchAddedForMobile==false) {
        // window width is less than 480px
        map.addControl(geocoder, "bottom-left");
        mapSearchAdded = true;
        $("._welcome_modal_card").css("display", "none");
      }
    }

});


$("#add-marker").on("click", async function() {
  // await weatherRequest();

  if (geoResponse == undefined) {
    $(".mapboxgl-ctrl-geocoder--input").attr("value", "Search a place first!");
    $(".mapboxgl-ctrl-geocoder--input").css("color", "darkred");
  } else {
    $("#scope-div").css("display", "none");

    let addText = geoResponse.text;
    let addAddress = geoResponse.place_name;
    let addX = geoResponse.geometry.coordinates[0];
    let addY = geoResponse.geometry.coordinates[1];

    let addDay = cursorDay;
    let addOrder = cursorOrder;

    // push location to array
    idCounter++;
    cursorOrder = cursorOrder + 0.001;
    // push everything including marker to locations array
    locations.push(
      addLocation(idCounter, addText, addAddress, addX, addY, addDay, addOrder)
    );

    // send the data to firebase but not the marker
    database.ref(UUID).set({
      locations: _(locations)
        .map(place => {
          return _.omit(place, ["marker"]);
        })
        .value()
    });
  }
  // mapLines();
});

// center button onclick listener
$("#center-button").on("click", function() {
  CenterMap();
});

// accomodation button onclick listener
$("#accom-button").on("click", function() {
 
  if (currentX == 0 && currentY == 0) {
    $(".mapboxgl-ctrl-geocoder--input").attr("value", "Search a place first!");
    $(".mapboxgl-ctrl-geocoder--input").css("color", "darkred");
  } else {
    $("#scope-div").css("display", "none");
    AccomRequest();
  }
});

$("body").on("click", ".mapboxgl-ctrl-geocoder--input", function() {
  $(this).css("color", "black");
  $(this).select();
});

$("#search-btn1").on("click", function() {
  let searchbox = $(".mapboxgl-ctrl-geocoder--input").val();
  if (searchbox == "") {
    $(".mapboxgl-ctrl-geocoder--input").attr("value", "Search a place first!");
    $(".mapboxgl-ctrl-geocoder--input").css("color", "darkred");
  } else {
  FlyToBBox(searchbox);
  $("._welcome_modal_card").css("display", "none");
  splashGone = true;
  map.addControl(geocoder, "bottom-left");
}
});

$("#search-btn2").on("click", function() {
  let random = chance.country({ full: true });
  FlyToBBox(random);
  map.addControl(geocoder, "bottom-left");
  
  splashGone = true;
  $("._welcome_modal_card").css("display", "none");
  
});

function CenterMap() {
  if (locations.length > 1) {
    // zooming to include all markers
    var coordinates = [];
    // get coordinates from locations object
    for (let i = 0; i < locations.length; i++) {
      let arrToPush = [locations[i].x, locations[i].y];
      coordinates.push(arrToPush);
    }

    var bounds = coordinates.reduce(function(bounds, coord) {
      return bounds.extend(coord);
    }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));

    map.fitBounds(bounds, {
      padding: 100
    });
  } else if (locations.length == 1) {
    // just one location zoom setting and center in
    map.flyTo({
      center: [locations[0].x, locations[0].y],
      zoom: 10
    });
  } else {
    // if no markers left then zoom out and center map back to inital state
    map.flyTo({
      center: [30, 7],
      zoom: 0.99
    });
  }
}

function mapLines() {
  map.addLayer({
    id: "route",
    type: "line",
    source: {
      type: "geojson",
      data: {
        type: "Feature",
        properties: {},
        geometry: {
          type: "LineString",
          coordinates: [
            [locations[0].x, locations[0].y],
            [locations[1].x, locations[1].y]
          ]
        }
      }
    },
    layout: {
      "line-join": "round",
      "line-cap": "round"
    },
    paint: {
      "line-color": "#888",
      "line-width": 2,
      "line-dasharray": [2, 5]
    }
  });
}

async function presentLoading(a) {
  const loading = document.createElement("ion-loading");
  (loading.message = "Loading..."), (loading.duration = a);

  document.body.appendChild(loading);
  await loading.present();

  const { role, data } = await loading.onDidDismiss();


  RedrawList();
}

$("#close-btn").click(function() {
  $("._welcome_modal_card").hide();
  splashGone = true;
  map.addControl(geocoder, "bottom-left");
  event.stopPropagation();
});

function darkMode() {
  if (document.getElementById("darkmode").classList.toggle("toggle-checked")) {
    map.setStyle("mapbox://styles/mapbox/dark-v10");
  } else {
    map.setStyle("mapbox://styles/mapbox/light-v10");
  }
}

function setScope(scopeX, scopeY){
  var iconz = document.getElementById("scope-div");
  $("#scope-div").css("display", "block");
  new mapboxgl.Marker(iconz).setLngLat([scopeX, scopeY]).addTo(map);
}

// adds current location to locations array as object
function addLocation(idCounter, name, address, x, y, day, order) {
  return {
    id: idCounter,
    name: name,
    address: address,
    x: x,
    y: y,
    day: day,
    order: order,
    marker: new mapboxgl.Marker().setLngLat([x, y]).addTo(map)
  };
}


  function FlyToPlace(search, long, lat, range) {

    let a = long-range;
    let b = lat-range;
    let c = long+range;
    let d = lat+range;

    $.ajax({
      url: `https://api.mapbox.com/geocoding/v5/mapbox.places/${search}.json?bbox=${a},${b},${c},${d}&access_token=pk.eyJ1IjoiY2JhdCIsImEiOiJjazJldXB2cnYwY2poM2ZvMjlrenB4MHNkIn0.H1pPRgzwWigP441VDUyWkQ&cachebuster=1573056323881&autocomplete=true`,
      method: "GET"
    })
      .then(function(fuzzyReply) {
        
        if (fuzzyReply.features[0] != undefined) {
          geoResponse = fuzzyReply.features[0];
        
        $(".mapboxgl-ctrl-geocoder--input").attr("value", geoResponse.place_name);
 
        currentX = geoResponse.geometry.coordinates[0];
        currentY = geoResponse.geometry.coordinates[1];
        setScope(currentX, currentY);

        var zoomLevel = map.getZoom();  
        map.flyTo({
                center: [
                  geoResponse.geometry.coordinates[0],
                  geoResponse.geometry.coordinates[1]
                ],
                zoom: zoomLevel
              });
      }
      })
      .catch(error => {
        console.log(error);
      });
  }
  

  function FlyToBBox(search) {
    $.ajax({
      url: `https://api.mapbox.com/geocoding/v5/mapbox.places/${search}.json?access_token=pk.eyJ1IjoiY2JhdCIsImEiOiJjazJldXB2cnYwY2poM2ZvMjlrenB4MHNkIn0.H1pPRgzwWigP441VDUyWkQ&cachebuster=1573056323881&autocomplete=true`,
      method: "GET"
    })
      .then(function(fuzzyReply) {
        geoResponse = fuzzyReply.features[0];
        $(".mapboxgl-ctrl-geocoder--input").attr("value", geoResponse.place_name);
  
        // set global long lats
        currentX = geoResponse.geometry.coordinates[0];
        currentY = geoResponse.geometry.coordinates[1];
  
        setScope(currentX, currentY);
  
        // if geoResponse is a an address or POI do geometry, else do bbox
        if (
          geoResponse.place_type[0] == "address" ||
          geoResponse.place_type[0] == "poi"
        ) {
          map.flyTo({
            center: [
              geoResponse.geometry.coordinates[0],
              geoResponse.geometry.coordinates[1]
            ],
            zoom: 15
          });
        } else {
          map.fitBounds(geoResponse.bbox, {
            padding: 10
          });
        }
      })
      .catch(error => {
        console.log(error);
      });
  }



