document.addEventListener("DOMContentLoaded", () => {
  const apiKey = "addee62dabbee517e820bdc87c12c970";

  const cityElement = document.getElementById("city-name");
  const tempElement = document.getElementById("temperature");
  const descElement = document.getElementById("description");
  const windElement = document.getElementById("wind");
  const humidityElement = document.getElementById("humidity");
  const iconElement = document.getElementById("weather-icon-img");
  const dateElement = document.querySelector(".date");
  const formElement = document.getElementById("city-search-form");
  const inputElement = document.getElementById("city-input");

  formElement.addEventListener("submit", (event) => {
    event.preventDefault();

    const cityName = inputElement.value.trim();

    if (cityName) {
      fetchWeather(cityName);
    }

    inputElement.value = "";
  });

  async function fetchWeather(city) {
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

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

      cityElement.textContent = "City not found";

      tempElement.textContent = "";
      descElement.textContent = "";
      windElement.textContent = "";
      humidityElement.textContent = "";
      iconElement.src = "";

      document.querySelector(".weather-icon").classList.add("hidden");
      document
        .querySelectorAll(".weather-details")
        .forEach((el) => el.classList.add("hidden"));
    }
  }

  function updateUI(weatherData) {
    const cityName = weatherData.name;
    const temperature = Math.round(weatherData.main.temp);
    const description = weatherData.weather[0].description;
    const windSpeed = weatherData.wind.speed;
    const iconCode = weatherData.weather[0].icon;
    const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@4x.png`;

    document.querySelector(".weather-icon").classList.remove("hidden");
    document
      .querySelectorAll(".weather-details")
      .forEach((el) => el.classList.remove("hidden"));

    cityElement.textContent = cityName;
    tempElement.textContent = `${temperature}°C`;
    descElement.textContent = description;
    iconElement.src = iconUrl;
    iconElement.alt = description;
    windElement.textContent = `${windSpeed} m/s`;
    humidityElement.textContent = `${weatherData.main.humidity}%`;
  }

  function displayCurrentDate() {
    const today = new Date();
    const options = { weekday: "long", month: "long", day: "numeric" };
    dateElement.textContent = today.toLocaleString("en-US", options);
  }

  // Initial Calls
  displayCurrentDate();
  // Fetch weather for a default city when the page loads
  displayCurrentDate();

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        fetchWeatherByCoords(latitude, longitude);
      },
      (error) => {
        console.error("Geolocation error:", error);
        fetchWeather("Copenhagen");
      },
    );
  } else {
    fetchWeather("Copenhagen");
  }

  async function fetchWeatherByCoords(lat, lon) {
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
    try {
      const response = await fetch(apiUrl);
      if (!response.ok) throw new Error("Network response was not ok");
      const data = await response.json();
      updateUI(data);
    } catch (error) {
      console.error("There was a problem fetching the weather data:", error);
      cityElement.textContent = "Error";
      descElement.textContent = "Could not fetch weather data.";
    }
  }
});
