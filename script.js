const API_KEY = "1ca7eefc7750341fd186ba41ab46838a";

const searchForm = document.getElementById("searchForm");
const cityInput = document.getElementById("cityInput");

const weatherCard = document.getElementById("weatherCard");
const errorMsg = document.getElementById("errorMsg");
const loader = document.getElementById("loader");

const cityName = document.getElementById("cityName");
const currentDate = document.getElementById("currentDate");
const weatherDesc = document.getElementById("weatherDesc");
const weatherIcon = document.getElementById("weatherIcon");

const tempDisplay = document.getElementById("tempDisplay");
const feelsLike = document.getElementById("feelsLike");

const humidityVal = document.getElementById("humidityVal");
const windVal = document.getElementById("windVal");
const pressureVal = document.getElementById("pressureVal");
const visibilityVal = document.getElementById("visibilityVal");

const sunriseVal = document.getElementById("sunriseVal");
const sunsetVal = document.getElementById("sunsetVal");

const themeBtn = document.getElementById("themeBtn");
const locationBtn = document.getElementById("locationBtn");
const saveCityBtn = document.getElementById("saveCityBtn");
const favoriteCities = document.getElementById("favoriteCities");

let currentCity = "";

searchForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const city = cityInput.value.trim();

    if (city === "") {
        showError("Please enter a city name.");
        return;
    }

    getWeather(city);
});

locationBtn.addEventListener("click", () => {
    getCurrentLocation();
});

themeBtn.addEventListener("click", toggleTheme);

saveCityBtn.addEventListener("click", saveCity);

window.addEventListener("load", () => {
    showToday();

    loadSavedCities();

    const savedTheme = localStorage.getItem("theme");

    if (savedTheme === "dark") {
        document.body.classList.add("dark");
        themeBtn.innerHTML = `<i class="fa-solid fa-sun"></i>`;
    }
});

/* 
   Fetch weather by city
 */

async function getWeather(city) {

    loader.classList.remove("hidden");
    weatherCard.classList.add("hidden");
    errorMsg.textContent = "";

    const url =
    `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`;

    try {

        const response = await fetch(url);

        const data = await response.json();

        if (data.cod != 200) {
            throw new Error(data.message);
        }

        currentCity = data.name;

        updateWeather(data);

    }

    catch (error) {

        showError("Couldn't find that city.");

    }

    finally {

        loader.classList.add("hidden");

    }

}
/* 
   Update weather on screen
 */

function updateWeather(data) {

    weatherCard.classList.remove("hidden");

    cityName.textContent = `${data.name}, ${data.sys.country}`;

    tempDisplay.textContent = `${Math.round(data.main.temp)}°C`;

    feelsLike.textContent = `${Math.round(data.main.feels_like)}°C`;

    weatherDesc.textContent = capitalizeWords(data.weather[0].description);

    humidityVal.textContent = `${data.main.humidity}%`;

    windVal.textContent = `${data.wind.speed} m/s`;

    pressureVal.textContent = `${data.main.pressure} hPa`;

    visibilityVal.textContent = `${data.visibility / 1000} km`;

    currentDate.textContent = formatDate();

    sunriseVal.textContent = convertTime(data.sys.sunrise);

    sunsetVal.textContent = convertTime(data.sys.sunset);

    const iconCode = data.weather[0].icon;

    weatherIcon.src =
        `https://openweathermap.org/img/wn/${iconCode}@4x.png`;

    weatherIcon.alt = data.weather[0].description;

    changeBackground(data.weather[0].main);

}

/* 
   Background according to weather
 */

function changeBackground(weather) {

    document.body.classList.remove(
        "sunny",
        "cloudy",
        "rainy",
        "snow",
        "mist",
        "thunder"
    );

    weather = weather.toLowerCase();

    if (weather.includes("clear")) {

        document.body.classList.add("sunny");

    }

    else if (weather.includes("cloud")) {

        document.body.classList.add("cloudy");

    }

    else if (weather.includes("rain") || weather.includes("drizzle")) {

        document.body.classList.add("rainy");

    }

    else if (weather.includes("snow")) {

        document.body.classList.add("snow");

    }

    else if (
        weather.includes("mist") ||
        weather.includes("fog") ||
        weather.includes("haze")
    ) {

        document.body.classList.add("mist");

    }

    else if (weather.includes("thunder")) {

        document.body.classList.add("thunder");

    }

}

/* 
   Today's date
 */

function formatDate() {

    const today = new Date();

    return today.toLocaleDateString("en-IN", {

        weekday: "long",
        day: "numeric",
        month: "long"

    });

}

function showToday() {

    currentDate.textContent = formatDate();

}

/* 
   Convert sunrise & sunset time
*/

function convertTime(unixTime) {

    const date = new Date(unixTime * 1000);

    return date.toLocaleTimeString("en-IN", {

        hour: "2-digit",
        minute: "2-digit"

    });

}

/* 
   First letter capital
 */

function capitalizeWords(text) {

    return text.replace(/\b\w/g, letter => letter.toUpperCase());

}

/* 
   Error message
 */

function showError(message) {

    weatherCard.classList.add("hidden");

    errorMsg.textContent = message;

}
/* -----------------------------
   Get current location
------------------------------ */

function getCurrentLocation() {

    if (!navigator.geolocation) {
        showError("Geolocation is not supported by your browser.");
        return;
    }

    loader.classList.remove("hidden");
    errorMsg.textContent = "";

    navigator.geolocation.getCurrentPosition(
        async (position) => {

            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;

            const url =
                `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`;

            try {

                const response = await fetch(url);
                const data = await response.json();

                currentCity = data.name;

                updateWeather(data);

            } catch (error) {

                showError("Unable to fetch your location weather.");

            } finally {

                loader.classList.add("hidden");

            }

        },
        () => {

            loader.classList.add("hidden");
            showError("Location access was denied.");

        }
    );

}

/* -----------------------------
   Save favourite city
------------------------------ */

function saveCity() {

    if (currentCity === "") return;

    let cities =
        JSON.parse(localStorage.getItem("weatherCities")) || [];

    if (!cities.includes(currentCity)) {

        cities.push(currentCity);

        localStorage.setItem(
            "weatherCities",
            JSON.stringify(cities)
        );

        loadSavedCities();

    }

}

/* -----------------------------
   Load favourite cities
------------------------------ */

function loadSavedCities() {

    favoriteCities.innerHTML = "";

    const cities =
        JSON.parse(localStorage.getItem("weatherCities")) || [];

    if (cities.length === 0) {

        favoriteCities.innerHTML =
            "<p>No favourite cities yet.</p>";

        return;

    }

    cities.forEach((city) => {

        const chip = document.createElement("div");

        chip.className = "city-chip";

        chip.textContent = city;

        chip.title = "Click to view weather";

        chip.addEventListener("click", () => {

            cityInput.value = city;
            getWeather(city);

        });

        favoriteCities.appendChild(chip);

    });

}

/* -----------------------------
   Dark mode
------------------------------ */

function toggleTheme() {

    document.body.classList.toggle("dark");

    const isDark =
        document.body.classList.contains("dark");

    if (isDark) {

        localStorage.setItem("theme", "dark");

        themeBtn.innerHTML =
            `<i class="fa-solid fa-sun"></i>`;

    } else {

        localStorage.setItem("theme", "light");

        themeBtn.innerHTML =
            `<i class="fa-solid fa-moon"></i>`;

    }

}

/* -----------------------------
   Default city on first load
------------------------------ */

window.addEventListener("DOMContentLoaded", () => {

    getWeather("Guwahati");

});