 // Icon mapping for Visual Crossing weather API to your 4th Set - Color icons
 const iconMapping = {
    'clear-day': 'clear-day.svg',
    'clear-night': 'clear-night.svg',
    'cloudy': 'cloudy.svg',
    'fog': 'fog.svg',
    'hail': 'hail.svg',
    'partly-cloudy-day': 'partly-cloudy-day.svg',
    'partly-cloudy-night': 'partly-cloudy-night.svg',
    'rain-snow-showers-day': 'rain-snow-showers-day.svg',
    'rain-snow-showers-night': 'rain-snow-showers-night.svg',
    'rain-snow': 'rain-snow.svg',
    'rain': 'rain.svg',
    'showers-day': 'showers-day.svg',
    'showers-night': 'showers-night.svg',
    'sleet': 'sleet.svg',
    'snow-showers-day': 'snow-showers-day.svg',
    'snow-showers-night': 'snow-showers-night.svg',
    'snow': 'snow.svg',
    'thunder-rain': 'thunder-rain.svg',
    'thunder-showers-day': 'thunder-showers-day.svg',
    'thunder-showers-night': 'thunder-showers-night.svg',
    'thunder': 'thunder.svg',
    'wind': 'wind.svg'
};

document.addEventListener('DOMContentLoaded', function () {
    // Geolocation and fetching weather data on page load
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            const lat = position.coords.latitude.toFixed(4);
            const lon = position.coords.longitude.toFixed(4);
            getWeather(lat, lon, "Your Location", true);  // Fetch weather for user's location
        });
    }

    // Fetch weather when user searches for a city
    document.getElementById('get-weather-btn').addEventListener('click', function () {
        const city = document.getElementById('city-input').value.trim();
        if (city) {
            getCoordinatesAndWeather(city);
        }
    });
});




// Function to get coordinates from OpenWeatherMap API and fetch weather data
// Function to fetch coordinates and weather for a given city
function getCoordinatesAndWeather(city) {
    const geoApiUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(city)}&limit=1&appid=e8de836d7d3bd14d7ca482e4e92bb49d`;

    fetch(geoApiUrl)
        .then(response => response.json())
        .then(data => {
            if (data && data.length > 0) {
                const lat = data[0].lat.toFixed(4);
                const lon = data[0].lon.toFixed(4);
                const cityName = data[0].name;  
                getWeather(lat, lon, cityName);
            } else {
                alert('City not found.');
            }
        })
        .catch(error => {
            console.error('Error fetching coordinates:', error);
            alert('Failed to fetch coordinates.');
        });
}

// Function to fetch weather data
function getWeather(lat, lon, cityName, isCurrentLocation = false) {
    const apiKey = 'FJKMR7YWYPQ3NJTAXW6HTPF7P';  // Your Visual Crossing API key
    const weatherApiUrl = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${lat},${lon}?unitGroup=metric&key=${apiKey}&include=current,days&forecastDays=5`;

    fetch(weatherApiUrl)
        .then(response => response.json())
        .then(data => {
            const current = data.currentConditions;
            const dailyTemps = data.days;  // Array that contains the forecast for the next 5 days

            // Update current weather section
            document.getElementById('temperature-value').textContent = Math.round(current.temp);
            document.getElementById('city-name').textContent = cityName;
            
            // Display current date and time
            document.getElementById('date-time').textContent = new Date(current.datetime).toLocaleString('sv-SE', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'long', year: 'numeric' });
            
            document.getElementById('weather-description').textContent = current.conditions;
            document.getElementById('cloudy-percentage').textContent = `${current.cloudcover}%`;
            document.getElementById('humidity-value').textContent = `${current.humidity}%`;
            document.getElementById('wind-speed').textContent = `${current.windspeed} km/h`;
            document.getElementById('rain-amount').textContent = `${current.precip} mm`;

            // Call displayWeather function to display the 5-day forecast
            displayWeather(dailyTemps, cityName, isCurrentLocation, current);

        })
        .catch(error => {
            console.error('Error fetching weather data:', error);
        });
}



// Function to get coordinates from city name and fetch weather
function getCoordinatesAndWeather(city) {
    const geoApiUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(city)}&limit=1&appid=e8de836d7d3bd14d7ca482e4e92bb49d`;

    fetch(geoApiUrl)
        .then(response => response.json())
        .then(data => {
            if (data && data.length > 0) {
                const lat = data[0].lat.toFixed(4);
                const lon = data[0].lon.toFixed(4);
                const cityName = data[0].name;
                getWeather(lat, lon, cityName);
            } else {
                alert('City not found.');
            }
        })
        .catch(error => {
            console.error('Error fetching coordinates:', error);
        });
}


// Function to reverse geocode latitude and longitude to get the actual city name
function fetchReverseGeocode(lat, lon, dailyTemps, currentWeather) {
    const reverseGeocodeUrl = `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=e8de836d7d3bd14d7ca482e4e92bb49d`;

    fetch(reverseGeocodeUrl)
        .then(response => response.json())
        .then(data => {
            if (data && data.length > 0) {
                const actualCityName = data[0].name;  // The actual city name, e.g., Åkersberga
                displayWeather(dailyTemps, actualCityName, true, currentWeather);  // Pass the actual city name to display
            } else {
                console.error('Reverse geocoding failed.');
                displayWeather(dailyTemps, 'Unknown Location', true, currentWeather);
            }
        })
        .catch(error => {
            console.error('Error fetching reverse geocode data:', error);
            displayWeather(dailyTemps, 'Unknown Location', true, currentWeather);
        });
}

function displayWeather(dailyTemps, cityName, isCurrentLocation = false, currentWeather = null) {
    const forecastContainer = document.getElementById('forecast-container');
    forecastContainer.innerHTML = '';  // Clear previous forecast results

    if (dailyTemps.length === 0 || !currentWeather) {
        forecastContainer.innerHTML = '<p>No weather data available.</p>';
        return;
    }

    // Display forecast for the next 5 days, skipping the first item (which is today)
    dailyTemps.slice(1, 6).forEach(day => { // Skip today (index 0)
        const dayDate = new Date(day.datetime);  // Make sure you're using the correct date field
        const dayName = dayDate.toLocaleDateString('sv-SE', { weekday: 'long' });
        const iconFileName = iconMapping[day.icon] || 'default-icon.svg';  // Use your icon mapping

        let forecastHTML = `
            <div class="forecast">
                <div class="forecast-header">
                    <div class="day">${dayName}</div>
                </div>
                <div class="forecast-content">
                    <div class="degree">
                        <div>H: ${Math.round(day.tempmax)}°</div>
                        <div>L: ${Math.round(day.tempmin)}°</div>
                        <!-- Commenting out the icons for now -->
                        <!-- <div class="icon"><img src="assets/iconsmono/${iconFileName}" alt="Weather Icon" class="weather-icon"></div> -->
                    </div>
                </div>
            </div>
        `;

        forecastContainer.innerHTML += forecastHTML;
    });
}

// Function to save favorite city
function saveFavoriteCity(city) {
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    if (!favorites.includes(city)) {  // Prevent duplicates
        favorites.push(city);
        localStorage.setItem('favorites', JSON.stringify(favorites));
    }
    displayFavorites();  // Update the list of favorites
}

// Function to display favorite cities
function displayFavorites() {
    const favoritesList = document.getElementById('favorites-list');
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    favoritesList.innerHTML = '';

    favorites.forEach((city, index) => {
        const li = document.createElement('li');

        const a = document.createElement('a');
        a.textContent = city;
        a.href = "#";

        a.addEventListener('click', function(e) {
            e.preventDefault();
            getCoordinatesAndWeather(city); // Your existing function to get weather for the city
        });

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.classList.add('delete-btn');

        deleteButton.addEventListener('click', function() {
            deleteFavoriteCity(index);
        });

        li.appendChild(a);
        li.appendChild(deleteButton);
        favoritesList.appendChild(li);
    });
}

// Function to delete a favorite city
function deleteFavoriteCity(index) {
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    favorites.splice(index, 1);  // Remove city from the array
    localStorage.setItem('favorites', JSON.stringify(favorites));  // Update localStorage
    displayFavorites();  // Re-render favorites list
}

// Event listener for the "Add to Favorites" button
document.getElementById('save-favorite-btn').addEventListener('click', function() {
    const city = document.getElementById('city-input').value;
    if (city.trim() !== "") {
        saveFavoriteCity(city);
    }
});

// Initially display the favorites when the page loads
window.onload = displayFavorites;
