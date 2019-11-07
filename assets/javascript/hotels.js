let addLayers = [];
let HotelArray = [];

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

  $.ajax(settings).done(function(response) {
    console.log(response);

    for (let i = 0; i < response.result.length; i++) {
      HotelArray.push(
        addHotel(
          response.result[i].main_photo_url,
          response.result[i].hotel_name,
          response.result[i].address,
          response.result[i].min_total_price,
          response.result[i].longitude,
          response.result[i].latitude
        )
      );

      map.addLayer({
        id: "places" + [i],
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
    }

    map.on("click", "places", function(e) {
      var coordinates = e.features[0].geometry.coordinates.slice();
      var description = e.features[0].properties.description;

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

function addHotel(photo, hotelName, hotelAdd, hotelPrice, long, lat) {
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
                    <p>Starting From (AUD): $${hotelPrice}</p>
                  </ion-label>
                  </ion-item>`,
      icon: "rocket"
    },
    geometry: {
      type: "Point",
      coordinates: [long, lat]
    }
  };
}

// function food(x, y) {
//   $.ajax({
//     url: `https://developers.zomato.com/api/v2.1/geocode?lat=${x}&lon=${y}`,
//     method: "GET",
//     headers: {
//       "user-key": "bcda4dbfad87daa44b7690ccebd778db",

//       "content-type": "application/json"
//     }
//   })
//     .then(function(asd) {
//       console.log(asd);
//     })
//     .catch(error => {
//       console.log(error);
//     });
// }
