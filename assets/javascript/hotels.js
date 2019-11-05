idMarker = 0;

function AccomRequest(LatBLi, LonBLi, LatTRi, LonTRi) {
        
    let LatBL = LatBLi;
    let LonBL = LonBLi;
    let LatTR = LatTRi;
    let LonTR = LonTRi;
   
    console.log('LatBL, LatTR, LonBL, LonTR:');
   console.log(`${LatBL},${LatTR},${LonBL},${LonTR}`);

// testing bounding box



// adds current location to locations array as object
function addBBmarker(idMarker, x, y) {
    return {
      id: idMarker,
      x: x,
      y: y,
      marker: new mapboxgl.Marker().setLngLat([x, y]).addTo(map)
    };
  }

    // push location to array
    idMarker++;
    // push everything including marker to locations array
    locations.push(addBBmarker(idMarker, LatBL, LonBL));
    idMarker++;
    locations.push(addBBmarker(idMarker, LatTR, LonTR));
  







    //map api keys
    //required
    let guest_qty = 1;
    let room_qty = 1;
    let departure_date = "2020-01-15";
    // let bbox = "14.291283,14.948423,120.755688,121.136864";
    let bbox = "115.8605,-31.9527,116,-30";
    let arrival_date = "2020-01-01";
    //optional
    let search_id = "none";
    let children_age = "11,5";
    let price_filter_currencycode = "USD";
    let languagecode = "en-us";
    let travel_purpose = "leisure";
    let categories_filter = "class::1,class::2,class::3";
    let children_qty = "2";
    let order_by = "popularity";

    //api query

    var settings = {
        "async": true,
        "crossDomain": true,
        // "url": "https://apidojo-booking-v1.p.rapidapi.com/properties/list?price_filter_currencycode=USD&travel_purpose=leisure&categories_filter=price%3A%3A9-40%2Cfree_cancellation%3A%3A1%2Cclass%3A%3A1%2Cclass%3A%3A0%2Cclass%3A%3A2&search_id=none&order_by=popularity&children_qty=2&languagecode=en-us&children_age=5%2C7&search_type=city&offset=0&dest_ids=-3712125&guest_qty=1&arrival_date=2020-01-01&departure_date=2020-01-15&room_qty=1",
        "url": `https://apidojo-booking-v1.p.rapidapi.com/properties/list-by-map?search_id=none&children_age=11%2C5&price_filter_currencycode=USD&languagecode=en-us&travel_purpose=leisure&categories_filter=class%3A%3A1%2Cclass%3A%3A2%2Cclass%3A%3A3&children_qty=2&order_by=popularity&guest_qty=1&room_qty=1&departure_date=2020-01-07&bbox=${LatBL}%2C${LatTR}%2C${LonBL}%2C${LonTR}&arrival_date=2020-01-01`,
        "method": "GET",
        "headers": {
            "x-rapidapi-host": "apidojo-booking-v1.p.rapidapi.com",
            "x-rapidapi-key": "5e09f4d7b7msh4cc31226f41c0dcp1a9b37jsnc20d3147bf56"
        }
    }

    // $.ajax(settings).done(function (response) {
    //     console.log("hotel " + response.result[12].hotel_name);
    //     console.log("rating " + response.result[12].facilities_review_score.rating);
    //     console.log(response.result[12].hotel_name);
    //     console.log("address " + response.result[12].address);
    //     console.log(response.result[12].latitude);
    //     console.log(response.result[12].longitude);
    // });
    $.ajax(settings).done(function (response) {
        console.log('APIdojo response:');
        console.log(response);
    });


};