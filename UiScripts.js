function openMenu() {
  document.querySelector("ion-menu-controller").open();
}

function homePage() {
  document.getElementById("pageTitle").innerHTML =
    "<ion-title>Home Page</ion-title>";
  document.querySelector("ion-menu-controller").close();
}

function navPage() {
  document.getElementById("pageTitle").innerHTML =
    "<ion-title>Navigation Page</ion-title>";
  document.querySelector("ion-menu-controller").close();
}

function itePage() {
  document.getElementById("pageTitle").innerHTML =
    "<ion-title>Itinerary Page</ion-title>";
  document.querySelector("ion-menu-controller").close();
}

function chatPage() {
  document.getElementById("pageTitle").innerHTML =
    "<ion-title>Live Chat Page</ion-title>";
  document.querySelector("ion-menu-controller").close();
}
