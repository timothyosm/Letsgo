async function weatherRequest() {
  let weatherSettings = {
    async: true,
    crossDomain: true,
    url: `https://dark-sky.p.rapidapi.com/${currentY},${currentX}?lang=en&units=auto`,
    method: "GET",
    headers: {
      "x-rapidapi-host": "dark-sky.p.rapidapi.com",
      "x-rapidapi-key": "4020fb3092msh628ee4383384482p116191jsna21559ef8f68"
    }
  };

  $.ajax(weatherSettings).done(function(response) {
    console.log(response);
    currentTemp = response.currently.temperature;
    weekWeather = response.daily.summary;
  });
}
