
// my globalish variables
let geoResponse;
let locations = [];
let idCounter = -1;



 
 
   // Your web app's Firebase configuration
   var firebaseConfig = {
     apiKey: "AIzaSyAtogxznLTcME9-Fch0xKwxo0SKNqpuSlc",
     authDomain: "projectone-f20d7.firebaseapp.com",
     databaseURL: "https://projectone-f20d7.firebaseio.com",
     projectId: "projectone-f20d7",
     storageBucket: "projectone-f20d7.appspot.com",
     messagingSenderId: "871353924736",
     appId: "1:871353924736:web:5b3376a4c2bfa2581dba65",
     measurementId: "G-J13VTRGL7G"
   };
   // Initialize Firebase
   firebase.initializeApp(firebaseConfig);
//    firebase.analytics();

   var database = firebase.database();

// the map canvas itself
mapboxgl.accessToken = 'pk.eyJ1IjoiY2JhdCIsImEiOiJjazJldXB2cnYwY2poM2ZvMjlrenB4MHNkIn0.H1pPRgzwWigP441VDUyWkQ';
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/light-v10',
    center: [30, 7],
    zoom: 1,
    pitch: 0,
    maxZoom: 18
});


// search input box
var geocoder = new MapboxGeocoder({
    accessToken: mapboxgl.accessToken,
    mapboxgl: mapboxgl
});
map.addControl(geocoder, 'top-right');



map.on('load', function() {

    // Listen for the `geocoder.input` event that is triggered when a user makes a search
    geocoder.on('result', function(ev) {

        geoResponse = ev.result;
    });

});




$( document ).ready(function() {
   

    database.ref("locations").on("value", function(snapshot) {
        const data = snapshot.val();

        locations = [];

        _.forEach(data, element => {
            locations.push(addLocation(element.id, element.name, element.address, element.x, element.y));
        });

        RedrawList()



        // var id1 = snapshot.val().id;
        // var addText1 = snapshot.val().name;
        // var addAddress1 = snapshot.val().address;
        // var addX1 = snapshot.val().x;
        // var addY1 = snapshot.val().y;

        
   
        // locations.push(addLocation(id1, addText1, addAddress1, addX1, addY1));
        // RedrawList();


    }, function(errorObject) {
        // Create Error Handling

        console.log('Errors handled: ' + ErrorObject.code);

    });


});



// adds current location to locations array as object
function addLocation(idCounter, name, address, x, y) {
    
    return {
      id : idCounter,
      name : name,
      address : address,
      x: x,
      y: y,
      marker: new mapboxgl.Marker().setLngLat([x, y]).addTo(map)
  
    };
  };

$('#add-marker').on("click", function() {
    if (geoResponse == undefined) {
        $('#location-list').append('Search for a building, street or landmark first!');
    } else {
        console.log(geoResponse);


        let addText = geoResponse.text
        let addAddress = geoResponse.place_name;
        let addX = geoResponse.geometry.coordinates[0];
        let addY = geoResponse.geometry.coordinates[1];

        // push location to array
        idCounter++;

        database.ref('locations').push(_.omit(addLocation(idCounter, addText, addAddress, addX, addY), ['marker']));

        console.log('locations array:');
        console.log(locations);


        database.ref().set({
            locations: _(locations).map(place => {
                return  _.omit(place, ['marker']);
            }).value()

        });



        // RedrawList(); // run redraw funtion
        CenterMap();
    };
});

// center button onclick listener
$('#center-button').on("click", function() {

    CenterMap();

});

// refreshes itinery list
function RedrawList() {

    $('#location-list').html("")

    for (let i = 0; i < locations.length; i++) {
        $('#location-list').append(`
        ${locations[i].name} <input type="button" class="remove-location btn-dark" value="X" data-number="${locations[i].id}"><br>
        <h6>${locations[i].address}<br>
        X: ${locations[i].x} Y:${locations[i].y}</h6>
        `)

    };
};
    
// Center the map, zooming to include all locations added
function CenterMap() {

    if (locations.length > 0) {

    // get coordinates from locations object
        var coordinates = [];
        
        for (let i = 0; i < locations.length; i++) {
            let arrToPush = [locations[i].x, locations[i].y]
            coordinates.push(arrToPush);
        };

        console.log(coordinates);

        var bounds = coordinates.reduce(function(bounds, coord) {
        return bounds.extend(coord);
        }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));
        
        map.fitBounds(bounds, {
        padding: 100
        });

    
    };

};



// remove location click listener

$('body').on('click', '.remove-location', function (){
    
    keyToRemove = $(this).attr('data-number');



    for (let i = 0; i < locations.length; i++) {

        if (locations[i].id == keyToRemove) {
            locations[i].marker.remove();
            var removedLocation = locations.splice(i,1);
        };

    };


firebase.ref('locations').child(key).remove();

    console.log(locations);
    
    RedrawList();
    CenterMap();

});

