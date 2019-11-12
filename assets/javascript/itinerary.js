
function Sort() {

  trip = [];
  lastDay = 0;
  itemTotal = locations.length;

  // get last day
  for (let i = 0; i < locations.length; i++) {
    if (locations[i].day > lastDay) lastDay = locations[i].day;
  };

  for (let dayCounter = 0; dayCounter <= lastDay; dayCounter++) {

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

      for (let i = 0; i < currentDay.length - 1; i++) {

        if (currentDay[i].order > currentDay[i + 1].order) {
          let temp = currentDay[i + 1];
          currentDay[i + 1] = currentDay[i];
          currentDay[i] = temp;
          sorted = false;
        };
      };
    };

    //push day to trip array
    trip.push(currentDay);

  };
 

  // This re-keys day and order for all items at their sorted position

  for (let d = 0; d < trip.length; d++) {
    // roll through each day and set the day & order keys
    for (let l = 0; l < trip[d].length; l++) {
      //sets order key to l - its index in day array
      trip[d][l].order = l;
      //sets day key to d - its day's index in trip
      trip[d][l].day = d;
    }

    // trip.day.location back into flat locations array
    locations = [];
    for (let g = 0; g < trip.length; g++) {
      //iterates for each day
      for (let h = 0; h < trip[g].length; h++) {
        locations.push(trip[g][h]);
      }
    }
  }
}



// refreshes itinery list
function RedrawList() {

  Sort();

  // start redrawing itinery list
  $("#location-list").html("");

  for (let d = 0; d <= trip.length; d++) {

     //iterate for each day
     if (d < trip.length) $('#location-list').append(`<div id="day${d}-div" onclick="DayCursor(this)" class="connectedSortable day-cursor-target rounded" data-day="${d}" style="margin-top:5px; background-color: rgb(246,246,244); min-height: 180px;"></div>`);
     if (d == trip.length) $('#location-list').append(`<div id="day${d}-div" onclick="EmptyDayCursor(this)" class="connectedSortable day-cursor-target rounded" data-day="${d}" style="margin-top:10px; color: lightgray; background-color: rgb(246,246,244); min-height: 50px;"></div>`);
 
     theDay = trip[d];
 
     $(`#day${d}-div`).append('&nbsp;&nbsp;Day ' + (d + 1));
     for (var i in theDay) {
 
 
       ul = $(`
                      <ul>
                           <ion-card style="z-index:1000; height:100%; width: 96%;" class="cursor-target" data-day="${d}" data-order="${theDay[i].order}" onclick="CursorCard(this, 'down')">
                               <ion-card-header class="cursor-target" style="background-color: white;" data-day="${d}" data-order="${theDay[i].order}" onclick="CursorCard(this, 'up')">
                               <ion-card-title><ion-icon ios="ios-reorder" md="md-reorder"></ion-icon>${theDay[i].name}</ion-card-title>
                           </ion-card-header>
                           <ion-card-content style="background-color: white;">
                               ${theDay[i].address}
                           </ion-card-content>
                           <ion-item style="background-color: white;">                      
                               <ion-button class="zoom-location" data-number="${theDay[i].id}" onClick="theZoomButton(this)">Go To</ion-button>
                               <ion-button class="remove-location" data-number="${theDay[i].id}" onClick="theDeleteButton(this)">Delete</ion-button>
                               
                               </ion-item>
                           </ion-card>
                       </ul>
               `);
              // Long:${theDay[i].x} Lat:${theDay[i].y} Day:${theDay[i].day} Order:${theDay[i].order}

      ul.data('d', theDay[i]);
      $(`#day${d}-div`).append(ul);
      // mapLines()
    }
    $(`#day${d}-div`).append('</div>');

    $(`#day${d}-div`).sortable({
      connectWith: ".connectedSortable",
      update: function (event, ui) {
        new_locations = $(this).find('ul').map(function (i, el) {
          return $(el).data('d')
        }).get()

        // update that day in trip array 
        trip[d] = new_locations;

        // roll through each day and set the day & order keys
        for (let l = 0; l < trip[d].length; l++) {
          //sets order key to l - its index in day array
          trip[d][l].order = l;
          //sets day key to d - its day's index in trip
          trip[d][l].day = d;
        }

        // trip.day.location back into flat locations array
        locations = [];
        for (let g = 0; g < trip.length; g++) {
          //iterates for each day
          for (let h = 0; h < trip[g].length; h++) {
            locations.push(trip[g][h]);
          }
        }

        if (locations.length == itemTotal) {

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
};

function theDeleteButton (thispass) {
  event.stopPropagation();
  
  keyToRemove = $(thispass).attr("data-number");
  for (let i = 0; i < locations.length; i++) {
    if (locations[i].id == keyToRemove) {
      locations[i].marker.remove();
      var removedLocation = locations.splice(i, 1);
    }
  }


  // send the data to firebase but not the marker
  database.ref(UUID).set({
    locations: _(locations)
      .map(place => {
        return _.omit(place, ["marker"]);
      })
      .value()
  });
}


function theZoomButton (thispass) {
  event.stopPropagation();
  
  let keyToZoom = $(thispass).attr("data-number");
  
  for (let i = 0; i < locations.length; i++) {
    if (locations[i].id == keyToZoom) {
      map.flyTo({
        center: [locations[i].x, locations[i].y],
        zoom: 12
      });
      currentX = locations[i].x;
      currentY = locations[i].y;
    }
  }
}

function CursorCard(thispass, pos) {

event.stopPropagation();
$(".cursor-target").css('border', 'none');
$(".day-cursor-target").css('background-color', 'rgb(246,246,244)');

if (pos == 'up') {
  cursorOrder = ($(thispass).attr('data-order')) - .001;
  $(thispass).css('border-top', '5px solid lightblue');
}
if (pos == 'down') {
  cursorOrder = ($(thispass).attr('data-order')) + .001;
  $(thispass).css('border-bottom', '5px solid lightblue');
}
cursorDay = ($(thispass).attr('data-day'));
}

function DayCursor(thispass) {
  // event.stopPropagation();
  $(".cursor-target").css('border', 'none');
  $(".day-cursor-target").css('background-color', 'rgb(246,246,244)');
  $(thispass).css('background-color', 'lightblue');
  cursorDay = ($(thispass).attr('data-day'));
  cursorOrder = 999;
}

function EmptyDayCursor(thispass) {
  $(".cursor-target").css('border', 'none');
  $(".day-cursor-target").css('background-color', 'rgb(246,246,244)');
  $(thispass).css('background-color', 'lightblue');
  cursorDay = ($(thispass).attr('data-day'));
  cursorOrder = 0;
}
