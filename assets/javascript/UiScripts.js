$(document).ready(function() {
  homePage();
});

function homePage() {
  $("#pageTitle").html(`<ion-title>Home Page</ion-title>`);
  document.querySelector("ion-menu-controller").close();
}

function navPage() {
  $("#pageTitle").html(`<ion-title>Navigation Page</ion-title>`);
  document.querySelector("ion-menu-controller").close();
}

function itePage() {
  $("#pageTitle").html(`<ion-title>Itinerary Page</ion-title>`);
  document.querySelector("ion-menu-controller").close();
}

function chatPage() {
  $("#pageTitle").html(`<ion-title>Live Chat Page</ion-title>`);
  document.querySelector("ion-menu-controller").close();
}
