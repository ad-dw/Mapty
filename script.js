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

class App {
  #map;
  #mapEvent;
  constructor() {
    this._getposition();
    form.addEventListener("submit", this._newWorkout.bind(this));
  }

  _getposition() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(this._loadMap.bind(this), () =>
        alert("I'm afraid we couldn't get your location")
      );
    }
  }

  _loadMap(position) {
    this.#map = L.map("map").setView(
      [position.coords.latitude, position.coords.longitude],
      13
    );
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.fr/hot/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);
    L.marker([position.coords.latitude, position.coords.longitude])
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          maxHeight: 20,
          autoClose: false,
          closeOnClick: false,
          className: "initial-popup",
        })
      )
      .setPopupContent("You're here!")
      .openPopup();
    this.#map.on("click", this._showForm.bind(this));
  }

  _showForm(mapE) {
    form.classList.remove("hidden");
    this.#mapEvent = mapE;
    inputType.focus();
  }

  _toggleElevationField() {}

  _newWorkout(event) {
    event.preventDefault();
    inputType.value =
      inputDistance.value =
      inputDuration.value =
      inputCadence.value =
      inputElevation.value =
        "";
    L.marker([this.#mapEvent.latlng.lat, this.#mapEvent.latlng.lng])
      .addTo(this.#map)
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
  }
}

class Workout {
  date = new Date();
  id = (Date.now() + "").slice(-10);
  constructor(coords, distance, duration) {
    this.coords = coords;
    this.distance = distance;
    this.duration = duration;
  }
}

class Running extends Workout {
  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence;
    this.calcPace();
  }

  calcPace() {
    this.pace = this.duration / this.distance;
  }
}

class Cycling extends Workout {
  constructor(coords, distance, duration, elevationGain) {
    super(coords, distance, duration);
    this.elevationGain = elevationGain;
    this.calcSpeed();
  }

  calcSpeed() {
    this.speed = this.distance / this.duration;
  }
}

const app = new App();
