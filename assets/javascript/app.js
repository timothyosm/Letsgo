let splashGone = false;

// my globalish variables
let geoResponse;
let locations = [];
let idCounter = 0;
let currentX = 0;
let currentY = 0;

let UUID;
let idInurl;

let search;

// Your web app's Firebase configuration
let firebaseConfig = {
  apiKey: "AIzaSyAtogxznLTcME9-Fch0xKwxo0SKNqpuSlc",
  authDomain: "projectone-f20d7.firebaseapp.com",
  databaseURL: "https://projectone-f20d7.firebaseio.com",
  projectId: "projectone-f20d7",
  storageBucket: "projectone-f20d7.appspot.com",
  messagingSenderId: "871353924736",
  appId: "1:871353924736:web:5b3376a4c2bfa2581dba65",
  measurementId: "G-J13VTRGL7G"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
//    firebase.analytics();

var database = firebase.database();

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
  toggleLoadingScreen("show");
  $.ajax("./assets/HTMLPages/itinerary.html")
    .then(response => {
      $(".content").html(response);
      toggleLoadingScreen("hide");
    })
    .catch(error => console.error(error));
}

function chatPage() {
  $("#pageTitle").html(`<ion-title>Live Chat Page</ion-title>`);
  document.querySelector("ion-menu-controller").close();
  toggleLoadingScreen("show");
  $.ajax("./assets/HTMLPages/construction.html")
    .then(response => {
      $(".content").html(response);
      toggleLoadingScreen("hide");
    })
    .catch(error => console.error(error));
}

$(document).ready(function() {
  navPage();
});
