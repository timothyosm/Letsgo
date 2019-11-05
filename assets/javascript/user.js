let UUID;
let idInurl;

function userCheck() {
  let url = window.location.href;
  idInurl = url.substr(url.length - 6);

  
  
  rootRef = firebase.database().ref()
  rootRef.child(idInurl).once("value", snapshot => {
      
  let a = snapshot.val();

  if (a == null) {

      UUID = create_UUID();
      console.log('Created UUID');
      console.log(UUID);
  }

  else {
      UUID = idInurl;

      database.ref(UUID).on(
          "value",
          function(snapshot) {
            const data = snapshot.val().locations;
              console.log('reloadedUsers');
            // clear all markers
            for (let i = 0; i < locations.length; i++) {
              locations[i].marker.remove();
            }
      
            // clear locations array
            locations = [];
      
            // repopulate array with full object including marker which also redraws markers
            _.forEach(data, element => {
              locations.push(
                addLocation(
                  element.id,
                  element.name,
                  element.address,
                  element.x,
                  element.y
                )
              );
      
              highestID = 0;
              if (element.id > highestID) highestID = element.id;
              idCounter = highestID;
            });
      
            RedrawList();
            CenterMap();
          },
          function(errorObject) {
            
            // Create Error Handling
            console.log("Errors handled: " + ErrorObject.code);
          }
        );

      console.log('existing UUID');
      console.log(UUID);
  }
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