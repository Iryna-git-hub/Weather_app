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

    // SVG icon for wind
    const windIcon = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
            xmlns="http://www.w3.org/2000/svg" stroke="#ffffff" stroke-width="0.24">
        <path fill-rule="evenodd" clip-rule="evenodd"
                d="M6.25 5.5C6.25 3.70508 7.70507 2.25 9.5 2.25C11.2949 2.25 12.75 3.70507 12.75 5.5C12.75 7.29493 11.2949 8.75 9.5 8.75H3C2.58579 8.75 2.25 8.41421 2.25 8C2.25 7.58579 2.58579 7.25 3 7.25H9.5C10.4665 7.25 11.25 6.4665 11.25 5.5C11.25 4.5335 10.4665 3.75 9.5 3.75C8.5335 3.75 7.75 4.5335 7.75 5.5V5.85714C7.75 6.27136 7.41421 6.60714 7 6.60714C6.58579 6.60714 6.25 6.27136 6.25 5.85714V5.5ZM14.25 7.5C14.25 5.15279 16.1528 3.25 18.5 3.25C20.8472 3.25 22.75 5.15279 22.75 7.5C22.75 9.84721 20.8472 11.75 18.5 11.75H2C1.58579 11.75 1.25 11.4142 1.25 11C1.25 10.5858 1.58579 10.25 2 10.25H18.5C20.0188 10.25 21.25 9.01878 21.25 7.5C21.25 5.98122 20.0188 4.75 18.5 4.75C16.9812 4.75 15.75 5.98122 15.75 7.5V8C15.75 8.41421 15.4142 8.75 15 8.75C14.5858 8.75 14.25 8.41421 14.25 8V7.5ZM3.25 14C3.25 13.5858 3.58579 13.25 4 13.25H18.5C20.8472 13.25 22.75 15.1528 22.75 17.5C22.75 19.8472 20.8472 21.75 18.5 21.75C16.1528 21.75 14.25 19.8472 14.25 17.5V17C14.25 16.5858 14.5858 16.25 15 16.25C15.4142 16.25 15.75 16.5858 15.75 17V17.5C15.75 19.0188 16.9812 20.25 18.5 20.25C20.0188 20.25 21.25 19.0188 21.25 17.5C21.25 15.9812 20.0188 14.75 18.5 14.75H4C3.58579 14.75 3.25 14.4142 3.25 14Z"
                fill="#e0ffed"/>
        </svg>`;

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
