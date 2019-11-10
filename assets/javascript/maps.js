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

    //set geoResponse with geocoder object and set global long lat variables
    geoResponse = ev.result;
    currentX = geoResponse.geometry.coordinates[0];
    currentY = geoResponse.geometry.coordinates[1];

    // add marker to map
    var iconz = document.getElementById("scope-div");
    pointerX = geoResponse.geometry.coordinates[0];
    pointerY = geoResponse.geometry.coordinates[1];
    $("#scope-div").css("display", "block");
    new mapboxgl.Marker(iconz).setLngLat([pointerX, pointerY]).addTo(map);

    //hide splash screen
    if (splashGone == false) {
    splashGone = true;
    // add geocoder input box to map, update text with search result and hide welcome card
    map.addControl(geocoder, "bottom-left");
    $(".mapboxgl-ctrl-geocoder--input").attr("value", geoResponse.place_name);
    $("._welcome_modal_card").css('display', 'none');
    };
  });
});


$(document).ready(function() {



  //add geocoder to welcome card
  $("#search-bar-div").append(geocoder.onAdd(map));
  //run user js stuff
  userCheck();
  
});

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

    let addDay = 0;
    let addOrder = 1;

    // push location to array
    idCounter++;

    // push everything including marker to locations array  
    locations.push(addLocation(idCounter, addText, addAddress, addX, addY, addDay, addOrder));
  
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


function sort() {

    trip=[];
    lastDay = 0;
    itemTotal = locations.length;

    // get last day
    for (let i = 0; i < locations.length; i++) {
      if (locations[i].day > lastDay) lastDay = locations[i].day;
    };

  for (let dayCounter = 0; dayCounter < lastDay+1; dayCounter++) {   // THE BUG IS IN THIS LOOP ADDING 11 ITERATIONS!

      currentDay = [];
      // get day
      for (let i = 0; i < locations.length; i++) {
          if (locations[i].day == dayCounter) {
              currentDay.push(locations[i]);
          };
      };

      
      //bubble sort day
      let sorted = false;
      while (!sorted) {
          
          sorted = true;

          for (let i = 0; i < currentDay.length-1; i++) {
              
              if (currentDay[i].order > currentDay[i+1].order) {
                  let temp = currentDay[i+1];
                  currentDay[i+1] = currentDay[i];
                  currentDay[i] = temp;
                  sorted=false;
              };
          };
      };

      //push day to trip array
      
        trip.push(currentDay);
      
  };
  console.log('le trip');
  console.log(trip);
}

// refreshes itinery list
function RedrawList() {

  sort();

  // start redrawing itinery list
  $("#location-list").html("");
  $('#location-list').append('<div class="container"><div class="row">');

  for (let d = 0; d < trip.length; d++) {

  //iterate for each day
  $('#location-list').append(`<ul id="day${d}-div" class="connectedSortable" data-day="${d}"></ul>`);

      theDay = trip[d];
      
      $(`#day${d}-div`).append('<div class="col-3">');
      $(`#day${d}-div`).append('Day ' + (d + 1));

      for(var i in theDay) {
              
          li = $(`
                      <li>
                          <ion-card>
                              <ion-card-header>
                                  <ion-card-subtitle></ion-card-subtitle>
                              <ion-card-title>${theDay[i].name}</ion-card-title>
                          </ion-card-header>
                          <ion-card-content>
                              Address:${theDay[i].address} Long:${theDay[i].x} Lat:${theDay[i].y} Day:${theDay[i].day} Order:${theDay[i].order}
                          </ion-card-content>
                          <ion-item>
                              <ion-button class="zoom-location" color="dark" data-number="${theDay[i].id}">Go To</ion-button>
                              <ion-button class="remove-location" color="dark" data-number="${theDay[i].id}">Delete</ion-button>
                              <ion-button class="Add-event" color="dark" data-number="${theDay[i].id}">Add Event</ion-button>
                          </ion-item>
                          </ion-card>
                      </li>
              `);
                  
              li.data('d', theDay[i]);
              $(`#day${d}-div`).append(li);
              
          }
          $(`#day${d}-div`).append('</div>');

          $(`#day${d}-div`).sortable({
              connectWith: ".connectedSortable",
              update: function(event, ui) {
              new_locations = $(this).find('li').map(function(i, el) {
                  return $(el).data('d')
                  }).get()
                 
              // update that day in trip array 
              trip[d] = new_locations;

              for (let l = 0; l < trip[d].length; l++) {
                  //sets order key to l - its index in day array
                  trip[d][l].order = l;
                  //sets day key to d - its day's index in trip
                  trip[d][l].day = d;
              }
              

              locations = [];
              

              for (let g = 0; g < trip.length; g++) {
                  //iterates for each day
                  for(let h = 0; h < trip[g].length; h++) {
                    locations.push(trip[g][h]);
                  }
              }

              if (locations.length == itemTotal ) {

                  database.ref(UUID).set({
                    locations: _(locations)
                      .map(place => {
                        return _.omit(place, ["marker"]);
                      })
                      .value()
                      
                    });
              }
             
              
            }


          });



  };
  $(`location-list`).append('</div></div>');
  
};

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

  
  let searchbox = $(".mapboxgl-ctrl-geocoder--input").val();
  
  FlyToBBox(searchbox);
  $("._welcome_modal_card").css('display', 'none');
    splashGone = true;
     map.addControl(geocoder, "bottom-left");
});


$("#search-btn2").on("click", function() {

  let random = chance.country({ full: true });
  FlyToBBox(random);
  map.addControl(geocoder, "bottom-left");
  splashGone = true;
  $("._welcome_modal_card").css('display', 'none');
});


function FlyToBBox(search) {
    
    $.ajax({
        url: `https://api.mapbox.com/geocoding/v5/mapbox.places/${search}.json?access_token=pk.eyJ1IjoiY2JhdCIsImEiOiJjazJldXB2cnYwY2poM2ZvMjlrenB4MHNkIn0.H1pPRgzwWigP441VDUyWkQ&cachebuster=1573056323881&autocomplete=true`,
        method: "GET"
      }).then(function(fuzzyReply) {
        
        geoResponse = fuzzyReply.features[0];
        $(".mapboxgl-ctrl-geocoder--input").attr("value", geoResponse.place_name);

        // set global long lats
        currentX = geoResponse.geometry.coordinates[0];
        currentY = geoResponse.geometry.coordinates[1];
    
        // set scope
        var iconz = document.getElementById("scope-div");
        pointerX = geoResponse.geometry.coordinates[0];
        pointerY = geoResponse.geometry.coordinates[1];
        $("#scope-div").css("display", "block");
        new mapboxgl.Marker(iconz).setLngLat([pointerX, pointerY]).addTo(map);
    
        // if geoResponse is a an address or POI do geometry, else do bbox
        if (geoResponse.place_type[0] == "address" || geoResponse.place_type[0] == "poi") {
          map.flyTo({
            center: [geoResponse.geometry.coordinates[0], geoResponse.geometry.coordinates[1]],
            zoom: 15
          });
        } else {
          map.fitBounds(geoResponse.bbox, {
            padding: 10
          });
        };
          
      }).catch(error => {
        console.log(error);
        });
    };


