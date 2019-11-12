let justdrawn = false;
let urltouse;
function userCheck() {

  let url = window.location.href;
  idInurl = url.substr(url.length - 6);


  rootRef = firebase.database().ref()
  rootRef.child(idInurl).once("value", snapshot => {

    map.resize(); // using this to do a delayed resizing of the map to beat known mapbox size issue
    $('.blackout').css('display', 'none');

    let a = snapshot.val();

    // no UUID exists
    if (a == null) {

      UUID = create_UUID();
      console.log('Created UUID');
      console.log(UUID);
      urltouse = location.href + "#" + UUID;
      $("#urlNav").html(location.href + "#" + UUID);
      $("#fbShare").attr("href", urltouse);
      $("#waShare").attr("href", "whatsapp://send?text=Hey!%20Come%20plan%20a%20trip%20with%20me!%20Just%20follow%20this%20link!" + urltouse);
      window.location.search + UUID;
      addParameterToURL(UUID);

    } else {

      // UUID exists!
      UUID = idInurl;
      console.log('existing UUID');
      console.log(UUID);

    };


    $("#unique-code").click(function () {
      CopyToClipboard();
    });

    database.ref(`${UUID}/locations`).on("value", function (snapshot2) {

      const dataRef = snapshot2.val();

      console.log('Reloaded firebase UUID/locations');
      // clear all markers
      for (let i = 0; i < locations.length; i++) {
        locations[i].marker.remove();
      }

      // clear locations array
      locations = [];

      // repopulate array with full object including marker which also redraws markers
      _.forEach(dataRef, element => {
        locations.push(
          addLocation(
            element.id,
            element.name,
            element.address,
            element.x,
            element.y,
            element.day,
            element.order
          )
        );

        highestID = 0;
        if (element.id > highestID) highestID = element.id;
        idCounter = highestID;
      });


      RedrawList();

      CenterMap();

    },
      function (errorObject) {

        // Create Error Handling


        console.log(ErrorObject);

      });

  })


  function create_UUID() {
    var dt = new Date().getTime();
    let uuid = 'xxxxxx'.replace(/[xy]/g, function (c) {
      var r = (dt + Math.random() * 16) % 16 | 0;
      dt = Math.floor(dt / 16);
      return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
    return uuid;

  }

};




function CopyToClipboard() {
  var text = document.createElement("textarea");
  text.innerHTML = window.location.href;
  Copied = text.createTextRange();
  Copied.execCommand("Copy");
}


function addParameterToURL(param) {
  _url = location.href;
  _url += (_url.split('?')[1] ? '&' : '?') + param;
  return _url;
}
