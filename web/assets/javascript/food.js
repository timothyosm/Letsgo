function food(x, y) {
  $.ajax({
    url: `https://developers.zomato.com/api/v2.1/geocode?lat=${x}&lon=${y}`,
    method: "GET",
    headers: {
      "user-key": "bcda4dbfad87daa44b7690ccebd778db",

      "content-type": "application/json"
    }
  })
    .then(function(asd) {
      console.log(asd);
    })
    .catch(error => {
      console.log(error);
    });
}
