// Wait for the DOM to be fully loaded before running the script
document.addEventListener("DOMContentLoaded", () => {
  // --- Configuration ---
  const apiKey = "addee62dabbee517e820bdc87c12c970";

  // --- DOM Element Selection ---
  const cityElement = document.getElementById("city-name");
  const tempElement = document.getElementById("temperature");
  const descElement = document.getElementById("description");
  const windElement = document.getElementById("wind");
  const humidityElement = document.getElementById("humidity");
  const iconElement = document.getElementById("weather-icon-img");
  const dateElement = document.querySelector(".date");
  const formElement = document.getElementById("city-search-form");
  const inputElement = document.getElementById("city-input");

  // --- Event Listener for the Form Submission ---
  formElement.addEventListener("submit", (event) => {
    // Prevent the default form submission which reloads the page
    event.preventDefault();

    const cityName = inputElement.value.trim(); // Get city from input and remove whitespace

    if (cityName) {
      fetchWeather(cityName);
    }
    // Optional: Clear the input field after search
    inputElement.value = "";
  });

  // --- Function to Fetch Weather Data by City Name ---
  async function fetchWeather(city) {
    // Note the change in the API endpoint URL (using q= instead of lat= and lon=)
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

    try {
      const response = await fetch(apiUrl);
      // If the city is not found, OpenWeatherMap returns a 404 error
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
      // Display a user-friendly error message
      cityElement.textContent = "City not found";

      // Clear other fields
      tempElement.textContent = "";
      descElement.textContent = "";
      windElement.textContent = "";
      humidityElement.textContent = "";
      iconElement.src = "";

      // Hide weather img
      document.querySelector(".weather-icon").classList.add("hidden");
      document
        .querySelectorAll(".weather-details")
        .forEach((el) => el.classList.add("hidden"));
    }
  }

  // --- Function to Update the UI ---
  function updateUI(weatherData) {
    const cityName = weatherData.name;
    const temperature = Math.round(weatherData.main.temp);
    const description = weatherData.weather[0].description;
    const windSpeed = weatherData.wind.speed;
    const iconCode = weatherData.weather[0].icon;
    const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@4x.png`;

    // Display weather img
    document.querySelector(".weather-icon").classList.remove("hidden");
    document
      .querySelectorAll(".weather-details")
      .forEach((el) => el.classList.remove("hidden"));

    // Update content
    cityElement.textContent = cityName;
    tempElement.textContent = `${temperature}°C`;
    descElement.textContent = description;
    iconElement.src = iconUrl;
    iconElement.alt = description;
    windElement.textContent = `${windSpeed} m/s`;
    humidityElement.textContent = `${weatherData.main.humidity}%`;
  }

  // --- Function to format and display the current date ---
  function displayCurrentDate() {
    const today = new Date();
    const options = { weekday: "long", month: "long", day: "numeric" };
    dateElement.textContent = today.toLocaleString("en-US", options);
  }

  // --- Initial Calls ---
  displayCurrentDate();
  // Fetch weather for a default city when the page loads
  displayCurrentDate();

  // Try to fetch weather based on user's location
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        fetchWeatherByCoords(latitude, longitude);
      },
      (error) => {
        console.error("Geolocation error:", error);
        // Fallback to a default city if user denies location access
        fetchWeather("Copenhagen");
      }
    );
  } else {
    // If geolocation is not supported
    fetchWeather("Copenhagen");
  }

  // --- Function to Fetch Weather Data by Coordinates ---
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
