function toggleLoadingScreen(state) {
  const loadingElement = $(".loading");

  if (state === "show") loadingElement.removeClass("ion-hide");
  else if (state === "hide") loadingElement.addClass("ion-hide");
}

function homePage() {
  $("#pageTitle").html(`<ion-title>Home Page</ion-title>`);
  document.querySelector("ion-menu-controller").close();

  toggleLoadingScreen("show");
  $.ajax("./assets/javascript/views/home.html")
    .then(response => {
      $(".content").html(response);
      toggleLoadingScreen("hide");
    })
    .catch(error => console.error(error));
}

function navPage() {
  $("#pageTitle").html(`<ion-title>Navigation Page</ion-title>`);
  document.querySelector("ion-menu-controller").close();
  toggleLoadingScreen("show");
  $.ajax("./assets/javascript/views/maps.html")
    .then(response => {
      $(".content").html(response);
      toggleLoadingScreen("hide");
    })
    .catch(error => console.error(error));
}

function itePage() {
  $("#pageTitle").html(`<ion-title>Itinerary Page</ion-title>`);
  document.querySelector("ion-menu-controller").close();
}

function chatPage() {
  $("#pageTitle").html(`<ion-title>Live Chat Page</ion-title>`);
  document.querySelector("ion-menu-controller").close();
}

$(document).ready(function() {
  homePage();
});
