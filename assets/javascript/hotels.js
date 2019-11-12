let addLayers = [];
let HotelArray = [];
let placesId = 0;

function AccomRequest() {
  let settings = {
    async: true,
    crossDomain: true,
    url: `https://apidojo-booking-v1.p.rapidapi.com/properties/list?price_filter_currencycode=AU&search_id=none&order_by=distance&longitude=${currentX}&latitude=${currentY}&children_qty=2&languagecode=en-us&children_age=5%2C7&search_type=latlong&offset=0&dest_ids=0&guest_qty=1&arrival_date=2020-03-13&departure_date=2020-03-15&room_qty=1`,
    method: "GET",
    headers: {
      "x-rapidapi-host": "apidojo-booking-v1.p.rapidapi.com",
      "x-rapidapi-key": "4020fb3092msh628ee4383384482p116191jsna21559ef8f68"
    }
  };

  $.ajax(settings).done(function (response) {
    console.log(response);

    FlyToHotels(response);

    for (let i = 0; i < response.result.length; i++) {
      HotelArray.push(
        addHotel(
          response.result[i].main_photo_url,
          response.result[i].hotel_name,
          response.result[i].address,
          response.result[i].min_total_price,
          response.result[i].longitude,
          response.result[i].latitude,
          response.result[i].url
        )
      );
    }
    placesId++;
    console.log(placesId);
    map.addLayer({
      id: "places" + placesId,
      class: "target-place",
      type: "symbol",
      source: {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: HotelArray
        }
      },
      layout: {
        "icon-image": "{icon}-15",
        "icon-allow-overlap": true
      }
    });

    map.on("click", "places" + placesId, function (e) {
      
      var coordinates = e.features[0].geometry.coordinates.slice();
      var description = e.features[0].properties.description;
      
      //hide scope icon div
      $("#scope-div").css("display", "none");

      //scrape out the name of the joint!
      let fish = description;
      console.log(fish);
      let pointA = fish.indexOf("<h3>");
      let theGoods = fish.slice(pointA+4);
      let pointB = theGoods.indexOf("</h3>");
      
      let theName = theGoods.slice(0, pointB);

      //scape out address
      let fishAdd = description;
      let pointC = fishAdd.indexOf("<p>Address");
      let theGoods2 = fish.slice(pointC+12);
      let pointD = theGoods2.indexOf("</p>");
      
      let theAdd = theGoods2.slice(0, pointD);

      let theX = e.features[0].geometry.coordinates[0];
      let theY = e.features[0].geometry.coordinates[1];

      // overwrite geoResponse ready for marker add
      geoResponse.text = theName;
      geoResponse.place_name = theAdd;
      geoResponse.geometry.coordinates[0] = theX;
      geoResponse.geometry.coordinates[1] = theY;
      
      //run fly to by name within 50m radius of hotel
      FlyToPlace(theName, theX, theY, 0.0005);

      //set geocoder input box to name text
      $(`.mapboxgl-ctrl-geocoder--input`).attr(`value`, `${theName}`);

      // Ensure that if the map is zoomed out such that multiple
      // copies of the feature are visible, the popup appears
      // over the copy being pointed to.
      while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
        coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
      }

      new mapboxgl.Popup()
        .setLngLat(coordinates)
        .setHTML(description)
        .addTo(map);
    });
  });
}

function addHotel(photo, hotelName, hotelAdd, hotelPrice, long, lat, url) {
  return {
    type: "Feature",
    properties: {
      description: `<ion-item>
                  <ion-thumbnail slot="start">
                  <img src="${photo}"/>
                  </ion-thumbnail>
                  <ion-label>
                    <h3>${hotelName}</h3>
                    <p>Address: ${hotelAdd}</p>
                    <p>Starting From (AUD): ${hotelPrice}</p>
                    <a href=${url} target="_blank">Book now!</ion-icon></a>
                  </ion-label>
                  </ion-item>`,
      icon: "suitcase"
    },
    geometry: {
      type: "Point",
      coordinates: [long, lat]
    }
  };
}


// fit map nice and tight around hotels
function FlyToHotels(response) {
  
  if (response != null) {
    
    var coordinates = [];
    for (let i = 0; i < response.result.length; i++) {
      let arrToPush = [response.result[i].longitude, response.result[i].latitude];
      coordinates.push(arrToPush);
    }
 
    var bounds = coordinates.reduce(function(bounds, coord) {
      return bounds.extend(coord);
    }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));

    map.fitBounds(bounds, {
      padding: 20
    });
    
  }
} 
