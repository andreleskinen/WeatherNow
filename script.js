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

// Wait until the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function () {
    const greetingTextElement = document.getElementById('greeting-text');
    const hoursElement = document.getElementById('hours');
    const minutesElement = document.getElementById('minutes');
    const colonElement = document.getElementById('blinking-colon');

    // Function to update greeting and time
    function updateGreetingAndTime() {
        const currentTime = new Date();
        const hours = currentTime.getHours();
        const minutes = currentTime.getMinutes().toString().padStart(2, '0');  // Ensure two-digit format for minutes

        let greeting;

        if (hours >= 5 && hours < 12) {
            greeting = "Good Morning";
        } else if (hours >= 12 && hours < 18) {
            greeting = "Good Afternoon";
        } else {
            greeting = "Good Evening";
        }

        // Display the greeting and time separately
        greetingTextElement.textContent = greeting;
        hoursElement.textContent = hours;
        minutesElement.textContent = minutes;
    }

    // Function to synchronize the interval to update exactly at the start of a new minute
    function synchronizeClock() {
        updateGreetingAndTime(); // Update time immediately on page load

        const now = new Date();
        const secondsUntilNextMinute = 60 - now.getSeconds();  // How many seconds until the next full minute

        // Set a timeout to trigger the first interval at the start of the next full minute
        setTimeout(function () {
            updateGreetingAndTime();  // Update time at the full minute
            setInterval(updateGreetingAndTime, 60000);  // Then, update every 60 seconds
        }, secondsUntilNextMinute * 1000);  // Timeout in milliseconds until the next minute
    }

    // Function to make the colon blink every second
    function blinkColon() {
        setInterval(function () {
            colonElement.style.visibility = colonElement.style.visibility === 'hidden' ? 'visible' : 'hidden';
        }, 1000);  // Toggle every second
    }

    // Call the synchronization function
    synchronizeClock();
    blinkColon();  // Start blinking the colon

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

    // Button to create a desktop shortcut
    document.getElementById('create-shortcut-btn').addEventListener('click', function () {
        // Website URL and title for the shortcut
        const websiteUrl = window.location.href;
        const websiteTitle = "WeatherNow";

        // Create a .url file content
        const shortcutContent = `[InternetShortcut]\nURL=${websiteUrl}\n`;

        // Create a Blob object with the shortcut content
        const blob = new Blob([shortcutContent], { type: 'text/plain' });

        // Create a download link
        const downloadLink = document.createElement('a');
        downloadLink.href = URL.createObjectURL(blob);
        downloadLink.download = `${websiteTitle}.url`;

        // Simulate a click to trigger the download
        downloadLink.click();

        // Clean up
        URL.revokeObjectURL(downloadLink.href);
    });

    // Initialize the autocomplete for the search input
    const cityInput = document.getElementById('city-input');

    // Create autocomplete object, restricting to cities
    const autocomplete = new google.maps.places.Autocomplete(cityInput, {
        types: ['(cities)'],  // Restrict results to cities only
    });

    // Event listener for when a user selects a place from the autocomplete dropdown
    autocomplete.addListener('place_changed', function () {
        const place = autocomplete.getPlace();

        if (place.geometry) {
            const lat = place.geometry.location.lat().toFixed(4);
            const lon = place.geometry.location.lng().toFixed(4);
            const cityName = place.name;

            // Fetch weather for the selected place
            getWeather(lat, lon, cityName);
        } else {
            alert('Please select a valid city.');
        }
    });
});



// Function to get coordinates from OpenWeatherMap API and fetch weather data
// Function to get coordinates from OpenWeatherMap API and fetch weather data
function getCoordinatesAndWeather(city) {
    const geoApiUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(city)}&limit=1&appid=e8de836d7d3bd14d7ca482e4e92bb49d`;

    fetch(geoApiUrl)
        .then(response => response.json())
        .then(data => {
            if (data && data.length > 0) {
                const lat = data[0].lat.toFixed(4);
                const lon = data[0].lon.toFixed(4);
                const cityName = data[0].name;
                const countryName = data[0].country;  // Extract country

                // Display city and country
                const cityDisplayName = `${cityName}, ${countryName}`;

                // Fetch weather for the city with country name
                getWeather(lat, lon, cityDisplayName);
            } else {
                alert('City not found.');
            }
        })
        .catch(error => {
            console.error('Error fetching coordinates:', error);
            alert('Failed to fetch coordinates.');
        });
}
 
function getWeather(lat, lon, cityName, isCurrentLocation = false) {
    const apiKey = 'FJKMR7YWYPQ3NJTAXW6HTPF7P';  // Your Visual Crossing API key
    const weatherApiUrl = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${lat},${lon}?unitGroup=metric&key=${apiKey}&include=current,hours,days&forecastDays=5`;

    fetch(weatherApiUrl)
        .then(response => response.json())
        .then(data => {
            const current = data.currentConditions;
            const dailyTemps = data.days;
            const hourlyTemps = data.days[0].hours;

            // Update current weather section
            document.getElementById('temperature-value').textContent = Math.round(current.temp);
            document.getElementById('city-name').textContent = cityName;

            // Icon mapping for Visual Crossing weather API to animeradelIkoner icons
            const animeradeIkonerMapping = {
                'clear-day': 'clear-day.svg',
                'clear-night': 'clear-night.svg',
                'cloudy': 'cloudy.svg',
                'partly-cloudy-day': 'partly-cloudy-day.svg',
                'partly-cloudy-night': 'partly-cloudy-night.svg',
                'rain': 'rain.svg',
                'snow': 'snow.svg',
                'overcast': 'cloudy.svg', // Map overcast to cloudy
            };

            const weatherIcon = animeradeIkonerMapping[current.icon.toLowerCase()] || 'default-icon.svg';
            document.getElementById('weather-icon').src = `assets/animeradeIkoner/${weatherIcon}`;

            const todayDate = new Date();
            const weekday = todayDate.toLocaleDateString('en-US', { weekday: 'short' });
            const day = todayDate.getDate();
            const month = todayDate.toLocaleDateString('en-US', { month: 'short' });
            const finalFormattedDate = `${weekday} ${day} ${month}`;

            document.getElementById('date-time').textContent = finalFormattedDate;
            document.getElementById('weather-description').textContent = current.conditions;
            document.getElementById('cloudy-percentage').textContent = `${current.cloudcover}%`;
            document.getElementById('humidity-value').textContent = `${current.humidity}%`;
            document.getElementById('wind-speed').textContent = `${current.windspeed} km/h`;
            document.getElementById('rain-amount').textContent = `${current.precip} mm`;

            displayHourlyForecast(hourlyTemps);
            displayWeather(dailyTemps, cityName, isCurrentLocation, current);

            // Scroll to the weather display section after data is updated
            const weatherDisplayElement = document.getElementById('weather-display');
            weatherDisplayElement.scrollIntoView({ behavior: 'smooth' });
        })
        .catch(error => {
            console.error('Error fetching weather data:', error);
        });
}
 
function displayWeather(dailyTemps, cityName, isCurrentLocation = false, currentWeather = null) {
    const forecastContainer = document.getElementById('forecast-container');
    forecastContainer.innerHTML = '';  // Clear previous forecast results

    if (dailyTemps.length === 0 || !currentWeather) {
        forecastContainer.innerHTML = '<p>No weather data available.</p>';
        return;
    }

    dailyTemps.slice(1, 7).forEach(day => {
        const dayDate = new Date(day.datetime);
        const dayName = dayDate.toLocaleDateString('en-US', { weekday: 'short' });
        const iconFileName = iconMapping[day.icon.toLowerCase()] || 'default-icon.svg';

        let weatherDescription = day.conditions;
        if (weatherDescription.includes('Rain')) {
            weatherDescription = 'Rain';
        } else if (weatherDescription === 'Overcast' || weatherDescription === 'Partly Cloudy' || weatherDescription === 'Partially cloudy') {
            weatherDescription = 'Cloudy';
        }

        let forecastHTML = `
            <div class="forecast">
                <div class="forecast-header">
                    <div class="day">${dayName}</div>
                </div>
                <div class="forecast-content">
                    <div class="degree">
                        <div>${Math.round(day.tempmax)}°</div>
                    </div>
                    <div class="weather-description">
                        ${weatherDescription}
                    </div>
                </div>
            </div>
        `;

        forecastContainer.innerHTML += forecastHTML;
    });
}
 
function displayHourlyForecast(hourlyTemps) {
    const hourlyForecastContainer = document.getElementById('hourly-forecast-container');
    hourlyForecastContainer.innerHTML = '';  // Clear any previous hourly forecast

    const now = new Date();
    const currentHour = now.getHours();

    const upcomingHours = hourlyTemps.filter(hour => {
        const hourParts = hour.datetime.split(':');
        return parseInt(hourParts[0], 10) >= currentHour;
    });

    const hoursToDisplay = upcomingHours.slice(0, 6);
    if (hoursToDisplay.length < 6) {
        const remainingHours = hourlyTemps.slice(0, 6 - hoursToDisplay.length);
        hoursToDisplay.push(...remainingHours);
    }

    hoursToDisplay.forEach((hour, index) => {
        let hourTime;
        const timeParts = hour.datetime.split(':');
        const hourNumber = timeParts[0].padStart(2, '0');

        if (index === 0) {
            hourTime = 'Now';
        } else {
            hourTime = `${hourNumber}:00`;
        }

        const temp = Math.round(hour.temp);
        let weatherDescription = hour.conditions || "N/A";
        if (weatherDescription.includes('Rain')) {
            weatherDescription = 'Rain';
        } else if (weatherDescription === 'Overcast' || weatherDescription === 'Partly Cloudy' || weatherDescription === 'Partially cloudy') {
            weatherDescription = 'Cloudy';
        }

        let hourlyHTML = `
            <div class="hour">
                <div class="hour-time">${hourTime}</div>
                <div class="hour-temp">${temp}°</div>
                <div class="hour-description">${weatherDescription}</div>
            </div>
        `;

        hourlyForecastContainer.innerHTML += hourlyHTML;
    });
}
 
 
 
 
document.getElementById('save-favorite-btn').addEventListener('click', function() {
    const city = document.getElementById('city-input').value;
    if (city) {
        const list = document.getElementById('favorites-list');
        const listItem = document.createElement('li');
        listItem.innerHTML = `${city} <button class="delete-btn">Delete</button>`;
        list.appendChild(listItem);
        listItem.querySelector('.delete-btn').addEventListener('click', function() {
            list.removeChild(listItem);
        });
    }
});

function saveFavorite(city) {
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    if (!favorites.includes(city)) {
        favorites.push(city);
        localStorage.setItem('favorites', JSON.stringify(favorites));
        displayFavorites();
    }
}

function displayFavorites() {
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    document.getElementById('favorites-list').innerHTML = favorites.map(city => 
        `<li>${city} <button onclick="removeFavorite('${city}')">Ta bort</button></li>`
    ).join('');
}

function removeFavorite(city) {
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    favorites = favorites.filter(fav => fav !== city);
    localStorage.setItem('favorites', JSON.stringify(favorites));
    displayFavorites();
}

document.addEventListener('DOMContentLoaded', displayFavorites);



 
 
 
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
 