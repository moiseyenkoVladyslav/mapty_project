"use strict";

//Test word for pushing in git

//New Words :
//obtain - получать
//fetch - приносить
//benefit - выгода, польза
//glance - взглянуть
//pace - темп
//persist - сохраняться
//altitude - высота
//concerned - связанный
//approach - подход

//1 Planning:
//1.1 User story (High level overview)
//1.2 Features
//1.3 Flowchart (What we will build)
//1.4 Architecture (How we will build)

//2 Development

//1.1
//Exam.: As a [type of user], i want [an action] so that [a benefit]

//Geolocation API
//The Geolocation API is an browser API

// 2 Callback Fct. :
//First - callback while success (Have 1 parameter - Position Parameter)
//Second - Error Callback, called by error getting coordinates

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

//Classes Structure
class Workout {
  //class Fields

  date = new Date();
  id = (Date.now() + ``).slice(-10);
  constructor(coords, distance, duration) {
    this.coords = coords; // [lat,long]
    this.distance = distance; // in km
    this.duration = duration; // in min
  }
}
class Running extends Workout {
  type = `running`;

  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence;
    this.calcPace();
  }
  calcPace() {
    //min/km
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}
class Cycling extends Workout {
  type = `cycling`;

  constructor(coords, distance, duration, elevationGane) {
    super(coords, distance, duration);
    this.elevationGane = elevationGane;
    this.calcSpeed();
  }
  calcSpeed() {
    //km/h
    this.speed = this.distance / (this.duration / 60);
    return this.speed;
  }
}

//Test
const run = new Running([39, -12], 5.2, 24, 178);
const cycl = new Cycling([39, -12], 27, 95, 523);
console.log(run, cycl);

////////////////////////////
//Application Architecture
////////////////////////////
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
    //This line of code allow to call this Method immediately, when the page loads.
    this._getPosition();

    //form Listners

    //Inside Handler-Fct, .this-Keyword is set to the Dom-Element its attecht to
    form.addEventListener(`submit`, this._newWorkout.bind(this));
    //Switching Input Fields while changing the Type of Input-Data
    inputType.addEventListener(`change`, this._toggleElevationField);
  }

  //Geolocation API
  //The Geolocation API is an browser API
  _getPosition() {
    navigator.geolocation.getCurrentPosition(
      //EVENT should be called without ()

      //.bind() - set .this-Keyword. In other way, it would be a regular Fct-Call, so .this stays undefined
      this._loadMap.bind(this),
      function () {
        alert(`could not get your coordinates!`);
      }
    );
  }

  _loadMap(position) {
    const { latitude } = position.coords;
    const { longitude } = position.coords;
    console.log(`https://www.google.de/maps/@${latitude},${longitude}`);
    // console.log(`https://www.google.de/maps/@${52.4929552},${13.4570545},14z?entry=ttu`);
    const coords = [latitude, longitude];
    this.#map = L.map("map").setView(coords, 13);
    // console.log(map);

    L.tileLayer("https://tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    L.marker(coords)
      .addTo(this.#map)
      .bindPopup("A pretty CSS popup.<br> Easily customizable.")
      .openPopup();
    //Making Working Event-Handlers on MAP
    //.on() - Method from Leaflet Library is Repleacment of addEventListner()

    //Handling clicks on map
    this.#map.on(`click`, this._showForm.bind(this));
  }

  _showForm(mapE) {
    this.#mapEvent = mapE;
    form.classList.remove(`hidden`);
    //Makink this part of Form PREselected after rendering
    inputDistance.focus();
  }

  _toggleElevationField() {
    inputElevation.closest(`.form__row`).classList.toggle(`form__row--hidden`);
    inputCadence.closest(`.form__row`).classList.toggle(`form__row--hidden`);
  }

  _newWorkout(e) {
    const validInputs = (...inputs) =>
      inputs.every((inp) => Number.isFinite(inp));
    //.every - Methof returns true, if ALL values if inputs-Arrays are Numbers

    const allPoistive = (...inputs) => inputs.every((inp) => inp > 0);
    e.preventDefault();

    //Plan
    //1. Get Data from the form
    const type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    const { lat, lng } = this.#mapEvent.latlng;
    let workout;
    //2. Check if Data is valid

    //3. If Workout running -> create Running-Object/cycling -> Cycle-Object
    if (type === `running`) {
      const cadence = +inputCadence.value;

      //check if Data is valid
      if (
        !validInputs(distance, duration, cadence) ||
        !allPoistive(distance, duration, cadence)
      )
        // if(!Number.isFinite(distance) || (!Number.isFinite(duration))|| (!Number.isFinite(cadence)))
        return alert(`Inputs have to be positiv Numbers`);

      workout = new Running([lat, lng], distance, duration, cadence);
    }

    if (type === `cycling`) {
      const elevGain = +inputElevation.value;

      //check if Data is valid
      if (
        !validInputs(distance, duration, elevGain) ||
        !allPoistive(distance, duration)
      )
        // if(!Number.isFinite(distance) || (!Number.isFinite(duration))|| (!Number.isFinite(cadence)))
        return alert(`Inputs have to be positiv Numbers`);

      workout = new Cycling([lat, lng], distance, duration, elevGain);
    }

    //4. Add new Object to Workout Array
    this.#workouts.push(workout);
    console.log(this.#workouts);

    //5. Render Workout as a Marker on the map
    this.renderWorkoutMarker(workout);
    //6. Render Workout on the list

    //7. Hide Form + clear input Fields
    //Clear input fields
    inputCadence.value =
      inputDistance.value =
      inputDuration.value =
      inputElevation.value =
        ``;
  }
  renderWorkoutMarker(workout) {
    //Display marker

    //defining a Pop-Up MArker
    // //taking coords(lat,lng) from passed in workout-Variable
    L.marker(workout.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 50,
          autoClose: false,
          closeOnClick: false,
          className: `${workout.type}-popup`,
        })
      )
      .setPopupContent(`workout`)
      .openPopup();
  }
}
const app = new App();

//////////////////////////
//Architecture
//////////////////////////

//1.User Stories

//MAIN Question : Where and How to store the Data!
//-> Use Classes and Class Inheritance for store data
//-> Using classes to store Data(raw) + Class for storing Methods, which be used to work with Data and also  Stored the result of operation. So second class provide encapsulation of private Data and MEthods
