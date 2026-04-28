document.addEventListener("DOMContentLoaded", () => {
  const API_KEY = "addee62dabbee517e820bdc87c12c970";
  const DEFAULT_CITY = "Copenhagen";
  const WEATHER_API_URL = "https://api.openweathermap.org/data/2.5/weather";

  const cityElement = document.getElementById("city-name");
  const tempElement = document.getElementById("temperature");
  const descElement = document.getElementById("description");
  const windElement = document.getElementById("wind");
  const humidityElement = document.getElementById("humidity");
  const iconElement = document.getElementById("weather-icon-img");
  const dateElement = document.querySelector(".date");
  const formElement = document.getElementById("city-search-form");
  const inputElement = document.getElementById("city-input");
  const searchButton = formElement.querySelector("button");
  const weatherIcon = document.querySelector(".weather-icon");
  const weatherDetails = document.querySelectorAll(".weather-details");

  formElement.addEventListener("submit", (event) => {
    event.preventDefault();

    const cityName = inputElement.value.trim();

    if (cityName) {
      fetchWeather(cityName);
    }

    inputElement.value = "";
  });

  async function fetchWeather(city) {
    const params = new URLSearchParams({
      q: city,
      appid: API_KEY,
      units: "metric",
    });

    await fetchAndDisplayWeather(`${WEATHER_API_URL}?${params}`);
  }

  async function fetchWeatherByCoords(lat, lon) {
    const params = new URLSearchParams({
      lat,
      lon,
      appid: API_KEY,
      units: "metric",
    });

    await fetchAndDisplayWeather(`${WEATHER_API_URL}?${params}`);
  }

  async function fetchAndDisplayWeather(apiUrl) {
    setLoadingState(true);

    try {
      const response = await fetch(apiUrl);

      if (response.status === 404) {
        throw new Error("City not found");
      }

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      updateUI(data);
    } catch (error) {
      console.error("There was a problem fetching the weather data:", error);
      showError(error.message === "City not found" ? "City not found" : "Weather unavailable");
    } finally {
      setLoadingState(false);
    }
  }

  function updateUI(weatherData) {
    const temperature = Math.round(weatherData.main.temp);
    const description = weatherData.weather[0].description;
    const windSpeed = Math.round(weatherData.wind.speed);
    const iconCode = weatherData.weather[0].icon;
    const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@4x.png`;

    setWeatherDetailsVisibility(true);

    cityElement.textContent = weatherData.name;
    tempElement.textContent = `${temperature}\u00b0C`;
    descElement.textContent = description;
    iconElement.src = iconUrl;
    iconElement.alt = description;
    windElement.textContent = `${windSpeed} m/s`;
    humidityElement.textContent = `${weatherData.main.humidity}%`;
  }

  function setLoadingState(isLoading) {
    searchButton.disabled = isLoading;
    searchButton.textContent = isLoading ? "Loading" : "Search";

    if (isLoading) {
      cityElement.textContent = "Loading...";
      descElement.textContent = "Fetching current weather";
    }
  }

  function showError(message) {
    cityElement.textContent = message;
    tempElement.textContent = "";
    descElement.textContent = "Try another city name.";
    windElement.textContent = "";
    humidityElement.textContent = "";
    iconElement.removeAttribute("src");
    iconElement.alt = "";
    setWeatherDetailsVisibility(false);
  }

  function setWeatherDetailsVisibility(isVisible) {
    weatherIcon.classList.toggle("hidden", !isVisible);
    weatherDetails.forEach((element) => {
      element.classList.toggle("hidden", !isVisible);
    });
  }

  function displayCurrentDate() {
    const today = new Date();
    const options = { weekday: "long", month: "long", day: "numeric" };
    dateElement.textContent = today.toLocaleString("en-US", options);
  }

  displayCurrentDate();

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        fetchWeatherByCoords(latitude, longitude);
      },
      (error) => {
        console.error("Geolocation error:", error);
        fetchWeather(DEFAULT_CITY);
      },
      { timeout: 10000 },
    );
  } else {
    fetchWeather(DEFAULT_CITY);
  }
});
