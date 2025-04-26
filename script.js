"use strict";

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector(".form");
const containerWorkouts = document.querySelector(".workouts");
const inputType = document.querySelector(".form__input--type");
const inputDistance = document.querySelector(".form__input--distance");
const inputDuration = document.querySelector(".form__input--duration");
const inputCadence = document.querySelector(".form__input--cadence");
const inputElevation = document.querySelector(".form__input--elevation");

let coords;
let map;
let mapEvent;
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      coords = position.coords;
      map = L.map("map").setView([coords.latitude, coords.longitude], 13);
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.fr/hot/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);
      map.on("click", (mapE) => {
        form.classList.remove("hidden");
        mapEvent = mapE;
      });
    },
    () => alert("I'm afraid we couldn't get your location")
  );
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  L.marker([mapEvent.latlng.lat, mapEvent.latlng.lng])
    .addTo(map)
    .bindPopup(
      L.popup({
        maxWidth: 250,
        minWidth: 100,
        autoClose: false,
        closeOnClick: false,
        className: "running-popup",
      })
    )
    .setPopupContent("Workout")
    .openPopup();
  form.classList.add("hidden");
});
