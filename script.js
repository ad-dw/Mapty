"use strict";

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
  #workouts = [];
  constructor() {
    this._getposition();
    form.addEventListener("submit", this._newWorkout.bind(this));
    inputType.addEventListener("change", this._toggleElevationField);
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

  _toggleElevationField() {
    inputCadence.closest(".form__row").classList.toggle("form__row--hidden");
    inputElevation.closest(".form__row").classList.toggle("form__row--hidden");
  }

  _newWorkout(event) {
    event.preventDefault();
    const isANumber = (...args) => args.every((arg) => !isNaN(arg));
    const isAPositiveNumber = (...args) => args.every((arg) => +arg > 0);
    //getting data from the form
    const workoutType = inputType.value;
    const distance = inputDistance.value;
    const duration = inputDuration.value;
    const { lat, lng } = this.#mapEvent.latlng;
    let workout;

    if (workoutType === "running") {
      const cadence = inputCadence.value;
      if (
        !isANumber(distance, duration, cadence) ||
        !isAPositiveNumber(distance, duration, cadence)
      )
        return alert("The data you entered is not valid !!!");
      workout = new Running([lat, lng], distance, duration, cadence);
    }

    if (workoutType === "cycling") {
      const elevation = inputElevation.value;
      if (
        !isANumber(distance, duration, elevation) ||
        !isAPositiveNumber(distance, duration)
      )
        return alert("The data you entered is not valid !!!");
      workout = new Cycling([lat, lng], distance, duration, elevation);
    }
    this.#workouts.push(workout);
    //clearing out form values
    inputDistance.value =
      inputDuration.value =
      inputCadence.value =
      inputElevation.value =
        "";
    inputType.value = "running";
    inputCadence.closest(".form__row").classList.remove("form__row--hidden");
    inputElevation.closest(".form__row").classList.add("form__row--hidden");
    form.classList.add("hidden");
    this._renderWorkoutMarker(workout);
    this._renderWorkout(workout);
  }

  //rendering workout marker
  _renderWorkoutMarker(workout) {
    L.marker(workout.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: `${workout.type}-popup`,
        })
      )
      .setPopupContent(workout.workoutDescription)
      .openPopup();
  }

  //rendering workout in the DOM
  _renderWorkout(workout) {
    let html = `<li class="workout workout--${workout.type}" data-id=${
      workout.id
    }>
    <h2 class="workout__title">${workout.workoutDescription}</h2>
    <div class="workout__details">
      <span class="workout__icon">${
        workout.type === "cycling" ? "🚴‍♀️" : "🏃‍♂️"
      }</span>
      <span class="workout__value">${workout.distance}</span>
      <span class="workout__unit">km</span>
    </div>
    <div class="workout__details">
      <span class="workout__icon">⏱</span>
      <span class="workout__value">${workout.duration}</span>
      <span class="workout__unit">min</span>
    </div>
    <div class="workout__details">
      <span class="workout__icon">⚡️</span>
      <span class="workout__value">${(workout.type === "running"
        ? workout.pace
        : workout.speed
      ).toFixed(1)}</span>
      <span class="workout__unit">${
        workout.type === "running" ? "min / km" : "km / h"
      }</span>
    </div>`;

    if (workout.type === "running") {
      html += `<div class="workout__details">
      <span class="workout__icon">🦶🏼</span>
      <span class="workout__value">${workout.cadence}</span>
      <span class="workout__unit">spm</span>
    </div>
  </li>`;
    }
    if (workout.type === "cycling") {
      html += `<div class="workout__details">
            <span class="workout__icon">⛰</span>
            <span class="workout__value">${workout.elevationGain}</span>
            <span class="workout__unit">m</span>
          </div>
        </li>`;
    }
    form.insertAdjacentHTML("afterend", html);
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

  _setDescription() {
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    this.workoutDescription = `${
      this.type.at(0).toUpperCase() + this.type.slice(1)
    } on ${months[this.date.getMonth()]} ${this.date.getDate()}`;
  }
}

class Running extends Workout {
  type = "running";
  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence;
    this.calcPace();
    this._setDescription();
  }

  calcPace() {
    this.pace = this.duration / this.distance;
  }
}

class Cycling extends Workout {
  type = "cycling";
  constructor(coords, distance, duration, elevationGain) {
    super(coords, distance, duration);
    this.elevationGain = elevationGain;
    this.calcSpeed();
    this._setDescription();
  }

  calcSpeed() {
    this.speed = this.distance / this.duration;
  }
}

const app = new App();
