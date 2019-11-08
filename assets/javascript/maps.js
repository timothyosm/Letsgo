// the map canvas itself
mapboxgl.accessToken =
  "pk.eyJ1IjoiY2JhdCIsImEiOiJjazJldXB2cnYwY2poM2ZvMjlrenB4MHNkIn0.H1pPRgzwWigP441VDUyWkQ";
var map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mapbox/light-v10",
  logoPosition: "top-left",
  center: [30, 7],
  zoom: 0.9,
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

map.on("load", function () {
  // Listen for the `geocoder.input` event that is triggered when a user makes a search

  geocoder.on("result", function (ev) {

    geoResponse = ev.result;
    currentX = geoResponse.geometry.coordinates[0];
    currentY = geoResponse.geometry.coordinates[1];

    var iconz = document.getElementById("scope-div");
    pointerX = geoResponse.geometry.coordinates[0];
    pointerY = geoResponse.geometry.coordinates[1];
    $("#scope-div").css("display", "block");
    // add marker to map
    new mapboxgl.Marker(iconz).setLngLat([pointerX, pointerY]).addTo(map);

    //hide splash screen
    if (splashGone == false) {
    
    map.addControl(geocoder, "bottom-left");
    splashGone = true;
    let search = geoResponse.place_name;
    
    $(".mapboxgl-ctrl-geocoder--input").attr("value", search);

    $("._welcome_modal_card").css('display', 'none');
    }
  });
});



$(document).ready(function() {
  $("#search-bar-div").append(geocoder.onAdd(map));
  userCheck();

  
});

// adds current location to locations array as object
function addLocation(idCounter, name, address, x, y) {
  return {
    id: idCounter,
    name: name,
    address: address,
    x: x,
    y: y,
    marker: new mapboxgl.Marker().setLngLat([x, y]).addTo(map)
  };
}

$("#add-marker").on("click", function () {
  if (geoResponse == undefined) {
    $("#location-list").append(
      "Search for a building, street or landmark first!"
    );
  } else {
    $("#scope-div").css("display", "none");

    let addText = geoResponse.text;
    let addAddress = geoResponse.place_name;
    let addX = geoResponse.geometry.coordinates[0];
    let addY = geoResponse.geometry.coordinates[1];

    // push location to array
    idCounter++;

    // push everything including marker to locations array
    locations.push(addLocation(idCounter, addText, addAddress, addX, addY));

    console.log("locations array after ADD MARKER:");
    console.log(locations);

    // send the data to firebase but not the marker
    database.ref(UUID).set({
      locations: _(locations)
        .map(place => {
          return _.omit(place, ["marker"]);
        })
        .value()
    });

  }
});

// center button onclick listener
$("#center-button").on("click", function () {
  CenterMap();
});

// refreshes itinery list
function RedrawList() {
  $("#location-list").html("");

  for (let i = 0; i < locations.length; i++) {
    $("#location-list").append(`
    <ion-card>
    <ion-card-header>
        <ion-card-subtitle></ion-card-subtitle>
        <ion-card-title>${locations[i].name}</ion-card-title>
    </ion-card-header>
    <ion-card-content>
        ${locations[i].address}
    </ion-card-content>
    <ion-item>
        <ion-button class="zoom-location" color="dark" data-number="${locations[i].id}">Go To</ion-button>
        <ion-button class="remove-location" color="dark" data-number="${locations[i].id}">Delete</ion-button>
        <ion-button class="Add-event" color="dark" data-number="${locations[i].id}">Add Event</ion-button>
    </ion-item>
</ion-card>

        `);
  console.log("Y:" + locations[i].y);
  console.log("X:" + locations[i].x);

  }

}

function CenterMap() {
  if (locations.length > 1) {
    // zooming to include all markers
    var coordinates = [];
    // get coordinates from locations object
    for (let i = 0; i < locations.length; i++) {
      let arrToPush = [locations[i].x, locations[i].y];
      coordinates.push(arrToPush);
    }

    var bounds = coordinates.reduce(function (bounds, coord) {
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

// remove location click listener

$("body").on("click", ".remove-location", function () {
  keyToRemove = $(this).attr("data-number");

  for (let i = 0; i < locations.length; i++) {
    if (locations[i].id == keyToRemove) {
      locations[i].marker.remove();
      var removedLocation = locations.splice(i, 1);
    }
  }

  console.log("locations array after Delete Marker:");
  console.log(locations);

  // send the data to firebase but not the marker
  database.ref(UUID).set({
    locations: _(locations)
      .map(place => {
        return _.omit(place, ["marker"]);
      })
      .value()
  });
});

$("body").on("click", ".zoom-location", function () {
  let keyToZoom = $(this).attr("data-number");
  for (let i = 0; i < locations.length; i++) {
    if (locations[i].id == keyToZoom) {
      map.flyTo({
        center: [locations[i].x, locations[i].y],
        zoom: 10
      });

      currentX = locations[i].x;
      currentY = locations[i].y;
    }
  }
});

// accomodation button onclick listener
$("#accom-button").on("click", function() {
  // let zoomLevel = map.getZoom();
  // alert(zoomLevel);
  // if (zoomLevel < 10) {
  //   alert('Search is too broad. You need to zoom in further to display Accomodation');
  // } else {
  //   alert('display accomodation layer');
  // };

  let x = currentX;
  let y = currentY;

  if (x == 0 && y == 0) {
    alert("Please give us an idea of where you want to stay!");
  } else {
    console.log("Coordinates of point of focus:");
    console.log(x + ":" + y);

    AccomRequest();
  }
});

// // food button onclick listener
// $("#food-button").on("click", function() {
//   let x = currentX;
//   let y = currentY;
//   if (x == 0 && y == 0){
//     alert('Please give us an idea of where you want to stay!');
//   } else {
//     food(x, y);
//   };
// });


$("#search-btn1").on("click", function() {

  // document.getElementById('geocoder').appendChild(geocoder.onAdd(map));
     $("._welcome_modal_card").css('display', 'none');

    splashGone = true;
     map.addControl(geocoder, "bottom-left");
});



$("#search-btn2").on("click", function() {

  let random = chance.country({ full: true });
  $(".mapboxgl-ctrl-geocoder--input").attr("value", random);
  
  FlyToBBox(random);

  map.addControl(geocoder, "bottom-left");
  splashGone = true;
  
  $(".mapboxgl-ctrl-geocoder--input").attr("value", random);

  $("._welcome_modal_card").css('display', 'none');

});


function FlyToBBox(search) {
    
    $.ajax({
        url: `https://api.mapbox.com/geocoding/v5/mapbox.places/${search}.json?access_token=pk.eyJ1IjoiY2JhdCIsImEiOiJjazJldXB2cnYwY2poM2ZvMjlrenB4MHNkIn0.H1pPRgzwWigP441VDUyWkQ&cachebuster=1573056323881&autocomplete=true`,
        method: "GET"
      }).then(function(geoReply) {
          console.log(geoReply.features[0].bbox[0]);

          map.fitBounds(geoReply.features[0].bbox, {
            padding: 10
          });

      }).catch(error => {
        console.log(error);
        });
    };


