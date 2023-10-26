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
//glimpse - проблеск, намек

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

//Classes Structure
class Workout {
  //class Fields

  date = new Date();
  id = (Date.now() + ``).slice(-10);
  clicks = 0;

  constructor(coords, distance, duration) {
    this.coords = coords; // [lat,long]
    this.distance = distance; // in km
    this.duration = duration; // in min
  }
  _setDescription() {
    // prettier-ignore
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${
      months[this.date.getMonth()]
    } ${this.date.getDate()}`;
  }
  click() {
    this.clicks++;
  }
}
class Running extends Workout {
  type = `running`;

  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence;
    this.calcPace();
    this._setDescription();
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
    this._setDescription();
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
  #mapZoomLvl = 13;
  #workouts = [];

  constructor() {
    //This line of code allow to call this Method immediately, when the page loads.
    //Get users position
    this._getPosition();

    //Get data from local storage, if any data is avaible. 
    this._getLocalStorage();

    //form Listners

    //Inside Handler-Fct, .this-Keyword is set to the Dom-Element its attecht to
    form.addEventListener(`submit`, this._newWorkout.bind(this));
    //Switching Input Fields while changing the Type of Input-Data
    inputType.addEventListener(`change`, this._toggleElevationField);

    containerWorkouts.addEventListener(`click`, this._moveToPopup.bind(this));
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
    this.#map = L.map("map").setView(coords, this.#mapZoomLvl);
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

    //This part of code should be here because of not avaiable of map-var. in _setLocalStorage
    this.#workouts.forEach(work =>{
      this._renderWorkoutMarker(work);
    })
  }

  _showForm(mapE) {
    this.#mapEvent = mapE;
    form.classList.remove(`hidden`);
    //Makink this part of Form PREselected after rendering
    inputDistance.focus();
  }
  _hideForm() {
    //Empty Inputs
    inputDistance.value =
      inputDuration.value =
      inputCadence.value =
      inputElevation.value =
        ` `;

    //Important ! Setting display-property to none, makes ANIMATION not triggered on this object
    form.style.display = `none`;
    form.classList.add(`hidden`);
    setTimeout(() => {
      form.style.display = `grid`;
    }, 1000);
  }

  _toggleElevationField() {
    inputElevation.closest(`.form__row`).classList.toggle(`form__row--hidden`);
    inputCadence.closest(`.form__row`).classList.toggle(`form__row--hidden`);
  }

  _newWorkout(e) {
    //Helper Functions
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
    this._renderWorkoutMarker(workout);
    //6. Render Workout on the list
    this._renderWorkout(workout);

    //7. Hide Form + clear input Fields
    //Clear input fields
    this._hideForm();

    //8. Store the data in local Storage 
    this._setLocalStorage(); 
  }
  _renderWorkoutMarker(workout) {
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
      .setPopupContent(
        `${workout.type === `running` ? `🏃‍♂️` : `🚴‍♀️`} ${workout.description}`
      )
      .openPopup();
  }
  _renderWorkout(workout) {
    let html = `
      <li class="workout workout--${workout.type}" data-id="${workout.id}">
      <h2 class="workout__title">${workout.description}</h2>
      <div class="workout__details">
        <span class="workout__icon">${
          workout.type === `running` ? `🏃‍♂️` : `🚴‍♀️`
        }</span>
        <span class="workout__value">${workout.distance}</span>
        <span class="workout__unit">km</span>
      </div>
      <div class="workout__details">
        <span class="workout__icon">⏱</span>
        <span class="workout__value">${workout.duration}</span>
        <span class="workout__unit">min</span>
      </div>
    `;
    if (workout.type === `running`) {
      html += `
      <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.pace.toFixed(1)}</span>
            <span class="workout__unit">min/km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">🦶🏼</span>
            <span class="workout__value">${workout.cadence}</span>
            <span class="workout__unit">spm</span>
          </div>
        </li>
      `;
    }
    if (workout.type === `cycling`) {
      html += `
        <div class="workout__details">
          <span class="workout__icon">⚡️</span>
          <span class="workout__value">${workout.speed.toFixed(1)}</span>
          <span class="workout__unit">km/h</span>
        </div>
        <div class="workout__details">
          <span class="workout__icon">⛰</span>
          <span class="workout__value">${workout.elevationGane}</span>
          <span class="workout__unit">m</span>
          </div>
        </li>
      `;
    }
    form.insertAdjacentHTML(`afterend`, html);
  }
  _moveToPopup(e) {
    //.closest() - link to the nearest Object with selected class
    //After it with unique ID of training-Element it can be found in Data array
    const workoutEl = e.target.closest(`.workout`);
    console.log(workoutEl);
    if (!workoutEl) return;

    const workout = this.#workouts.find(
      (work) => work.id === workoutEl.dataset.id
    );
    console.log(workout);

    //.setView() - sets the position of the screen centered on selected Object. 1par. - Coords, 2par. - lvl of zooming, 3par - add. setting like animation etc.
    this.#map.setView(workout.coords, this.#mapZoomLvl, {
      animate: true,
      pan: {
        duration: 1,
      },
    });
    //Using the public interface
    // workout.click();
  }
  _setLocalStorage(){
    //There are a local-storage API, that are provided by the browser. (localStorage).
    //Only for SMALL amount of DATA
    
    //1Par. - key/name of setted variable, 2Par. - value setted as a STRING . 
    //JSON.stringify() - convert object to string 
    localStorage.setItem(`workout`,JSON.stringify(this.#workouts));
  };
  _getLocalStorage(){
  //When converting Object -> String = Loosing of Prototype Chain!
  
    //JSON.parse() - convert STRING to OBJECT
    const data = JSON.parse(localStorage.getItem(`workout`));

    if(!data) return;

    //Normally there is no data while first loading. After it, all the data will be stored in local storage.
    this.#workouts = data;
   
    this.#workouts.forEach(work =>{
      this._renderWorkout(work);
    })
  }
  reset(){
    //Method for deleting of local storage data 
    localStorage.removeItem(`workout`);
    location.reload();
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




//Challenges: 
//
//1. Edit Workout
//2. Delete Workout
//3. Delete all Workouts
//4. Sort Workouts by Distanca or 
//5. Rebuild Object from local Storage
//6. More realistic error messeage

//Hard: 
//1. Abbility to show all Workouts on the map 
//2. Abbility to draw lines and shapes instead of just points

//After Async JS: 
//1. Geocode locations grom coordinates
//2.Display weather data for workout time and place 
