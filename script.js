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

document.addEventListener('DOMContentLoaded', function() {
    // Check if geolocation is available
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            const lat = position.coords.latitude.toFixed(4);
            const lon = position.coords.longitude.toFixed(4);
            getWeather(lat, lon, "Your Location", true);  // Fetch weather for user's location with flag
        }, function(error) {
            console.error('Error getting location:', error);
            alert('Failed to get your location.');
        });
    } else {
        alert('Geolocation is not supported by this browser.');
    }

    // Event listener for the 'Get Weather' button
    document.getElementById('get-weather-btn').addEventListener('click', function() {
        const city = document.getElementById('city-input').value.trim();
        if (city) {
            getCoordinatesAndWeather(city);
        } else {
            alert('Please enter a city name.');
        }
    });

    // Event listener for the 'Save as Favorite' button
    document.getElementById('save-favorite-btn').addEventListener('click', function() {
        const city = document.getElementById('city-input').value.trim();
        if (city) {
            saveFavoriteCity(city);
        } else {
            alert('Please enter a city name to save.');
        }
    });

    // Display saved favorites when the page loads
    displayFavorites();
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
    const apiKey = 'FJKMR7YWYPQ3NJTAXW6HTPF7P';  // Replace with your Visual Crossing API key
    const weatherApiUrl = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${lat},${lon}?unitGroup=metric&key=${apiKey}&include=current,days&elements=datetime,temp,tempmax,tempmin,conditions,icon&forecastDays=5`;

    fetch(weatherApiUrl)
        .then(response => response.json())
        .then(data => {
            // Extract current weather
            const currentWeather = {
                date: data.currentConditions.datetime,
                temp: data.currentConditions.temp,
                conditions: data.currentConditions.conditions,
                icon: data.currentConditions.icon
            };

            // Extract 5-day forecast
            const dailyTemps = data.days.slice(0, 5).map(day => ({
                date: day.datetime,
                maxTemp: day.tempmax,
                minTemp: day.tempmin,
                icon: day.icon  // Get the icon from the API response
            }));

            // If it's the current location, reverse geocode the lat/lon to get the actual location name
            if (isCurrentLocation) {
                fetchReverseGeocode(lat, lon, dailyTemps, currentWeather);
            } else {
                displayWeather(dailyTemps, cityName, isCurrentLocation, currentWeather);
            }
        })
        .catch(error => {
            console.error('Error fetching weather data:', error);
            alert('Failed to fetch weather data.');
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

// Update the displayWeather function to use currentWeather.temp for live temperature
function displayWeather(dailyTemps, cityName, isCurrentLocation = false, currentWeather = null) {
    const currentWeatherElement = document.getElementById('current-weather');
    const weatherResult = document.getElementById('weather-result');

    currentWeatherElement.innerHTML = '';  // Clear previous results for current weather
    weatherResult.innerHTML = '';  // Clear previous results for forecast

    if (dailyTemps.length === 0 || !currentWeather) {
        currentWeatherElement.innerHTML = '<p>No weather data available.</p>';
        return;
    }

    const today = dailyTemps[0];

    // Get the current date
    const currentDate = new Date();
    const todayDate = new Date(today.date);

    // Check if the weather date is the current date, if so, display "idag"
    const isToday = (currentDate.toDateString() === todayDate.toDateString());
    const dayName = isToday ? "idag" : todayDate.toLocaleDateString('sv-SE', { weekday: 'long' });

    // Get the day number and shortened month name (e.g., "10 sep")
    const dayNumber = todayDate.getDate();  // Get the day number (e.g., "10")
    const monthShort = todayDate.toLocaleDateString('sv-SE', { month: 'short' });  // Get the shortened month (e.g., "sep")
    const dateString = `${dayNumber} ${monthShort}`;

    // Get the icon from the API response and map it to your local icon
    const iconFileName = iconMapping[currentWeather.icon] || 'default-icon.svg';  // Use currentWeather.icon instead of today.icon

    // Show "Your Location" when it's the current location, and display the actual city name underneath
    const locationLabel = isCurrentLocation ? "Your Location" : cityName;
    const actualCityName = isCurrentLocation ? cityName : '';  // Show actual city name only if it's the current location

    let currentWeatherHTML = `
    <div class="forecast today">
        <div class="forecast-header">
            <div class="day-date">
                <div class="day">${dayName}</div>
                <div class="date">${dateString}</div>
            </div>
        </div>
        <div class="forecast-content">
            <div class="location">${locationLabel}</div>
            ${isCurrentLocation ? `<div class="actual-location">${actualCityName}</div>` : ''} <!-- Show actual city name only if geolocation is used -->
            <div class="degree">
                <div class="num">${Math.round(currentWeather.temp)}<sup>°</sup></div>  <!-- Use currentWeather.temp instead of today.maxTemp -->
                <div class="icon"><img src="assets/icons/${iconFileName}" alt="Weather Icon" class="weather-icon"></div>   
            </div>
            <div class="temp-range">
                H: ${Math.round(today.maxTemp)}° L: ${Math.round(today.minTemp)}°
            </div>
        </div>
    </div>
    `;

    currentWeatherElement.innerHTML = currentWeatherHTML;

    // Add forecast for the next days (after today)
    let weatherHTML = '';
    dailyTemps.slice(1).forEach(day => {
        const dayDate = new Date(day.date);
        const dayName = dayDate.toLocaleDateString('sv-SE', { weekday: 'long' });
        const dayNumber = dayDate.getDate();
        const monthShort = dayDate.toLocaleDateString('sv-SE', { month: 'short' });
        const dateString = `${dayNumber} ${monthShort}`;
        const iconFileName = iconMapping[day.icon] || 'default-icon.svg';  // Map the icon for each day

        weatherHTML += `
            <div class="forecast">
                <div class="forecast-header">
                    <div class="day-date">
                        <div class="day">${dayName}</div>
                        <div class="date">${dateString}</div>
                    </div>
                </div>
                <div class="forecast-content">
                    <div class="degree">${Math.round(day.maxTemp)}<sup>°</sup></div>
                    <small>${Math.round(day.minTemp)}°</small>
                    <div class="icon"><img src="assets/icons/${iconFileName}" alt="Weather Icon" class="weather-icon"></div>
                </div>
            </div>
        `;
    });

    weatherResult.innerHTML = weatherHTML;
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
            getCoordinatesAndWeather(city);
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
