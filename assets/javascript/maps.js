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
  // anchor: 'center',

  placeholder: "Where to?",
  marker: false,
  mapboxgl: mapboxgl
});

map.addControl(geocoder, "bottom-left");

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
  });
});


$(document).ready(function () {

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
$("#accom-button").on("click", function () {
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
    alert('Please give us an idea of where you want to stay!');
  } else {

    console.log('Coordinates of point of focus:')
    console.log(x + ':' + y);

    // alert((x-.1) + ',' + (y-.1) + ',' +  (x+.1) + ',' +  (y+.1));
    AccomRequest((x - .1), (y - .1), (x + .1), (y + .1));

    // console.log(geoResponse);
  };

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


// AUTO PITCH ON ZOOM FUNCTION - WIP - NOT WORKING

// map.on("zoom", function() {

//   // map.jumpTo({pitch: 20})
// //   const currentZoom = map.getZoom();
// //   map.setPitch(20);
// // //   if (currentZoom < 10) {
// // //     map.setPitch({

// // //       pitch: 0 // Angle of cameraview

// // //   });
// // //   } else if (currentZoom > 5) {
// // //     map.setPitch({

// // //       pitch: 20 // Angle of cameraview

// // //   });
// // //   } else if (currentZoom > 10) {
// // //     map.setPitch({

// // //       pitch: 40 // Angle of cameraview

// // //   });
// // //   } else if (currentZoom > 15) {
// // //     map.setPitch({

// // //       pitch: 60 // Angle of cameraview

// // //   });
// // //   };

// });


