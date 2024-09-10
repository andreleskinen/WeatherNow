// Wait until the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
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

// Function to get coordinates from OpenWeatherMap API and then fetch weather data
function getCoordinatesAndWeather(city) {
    const geoApiUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(city)}&limit=1&appid=e8de836d7d3bd14d7ca482e4e92bb49d`;

    fetch(geoApiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to fetch coordinates. Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data && data.length > 0) {
                const lat = data[0].lat.toFixed(4);
                const lon = data[0].lon.toFixed(4);
                const cityName = data[0].name;  // Get the city name from the API response
                getWeather(lat, lon, cityName);  // Pass the city name to the next function
            } else {
                alert('City not found.');
            }
        })
        .catch(error => {
            console.error('Error fetching coordinates:', error);
            alert('Failed to fetch coordinates.');
        });
}

// Function to fetch weather forecast data for the next 5 days from Visual Crossing API
function getWeather(lat, lon, cityName) {
    const apiKey = 'FJKMR7YWYPQ3NJTAXW6HTPF7P';  // Replace with your Visual Crossing API key
    const weatherApiUrl = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${lat},${lon}?unitGroup=metric&key=${apiKey}&include=days&elements=datetime,tempmax,tempmin,conditions&forecastDays=5`;

    fetch(weatherApiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error fetching weather data. Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            // Slice the first 5 days
            const dailyTemps = data.days.slice(0, 5).map(day => {
                return {
                    date: day.datetime,
                    maxTemp: day.tempmax,
                    minTemp: day.tempmin
                };
            });

            displayWeather(dailyTemps, cityName);  // Pass the city name to the display function
        })
        .catch(error => {
            console.error('Error fetching weather data:', error);
            alert('Failed to fetch weather data.');
        });
}

// Function to display weather data on the webpage
function displayWeather(dailyTemps, cityName) {
    const currentWeather = document.getElementById('current-weather');
    const weatherResult = document.getElementById('weather-result');

    currentWeather.innerHTML = '';  // Clear previous results for current weather
    weatherResult.innerHTML = '';  // Clear previous results for forecast

    if (dailyTemps.length === 0) {
        currentWeather.innerHTML = '<p>No weather data available.</p>';
        return;
    }

    // Current weather (first day in the list)
    const today = dailyTemps[0];
    const dayName = new Date(today.date).toLocaleDateString('sv-SE', { weekday: 'long' });
    const dateString = new Date(today.date).toLocaleDateString('sv-SE', { year: 'numeric', month: 'long', day: 'numeric' });

    // Round temperatures for today
    let currentWeatherHTML = `
    <div class="forecast today">
        <div class="forecast-header">
            <div class="day">${dayName}</div>
            <div class="date">${dateString}</div>
        </div>
        <div class="forecast-content">
            <div class="location">${cityName}</div>
            <div class="degree">
                <div class="num">${Math.round(today.maxTemp)}<sup>°</sup></div>   
            </div>
        </div>
    </div>
`;

    currentWeather.innerHTML = currentWeatherHTML;

    // Forecast for the next days
    dailyTemps.slice(1).forEach(day => {
        const dayName = new Date(day.date).toLocaleDateString('sv-SE', { weekday: 'long' });

        let forecastHTML = `
            <div class="forecast">
                <div class="forecast-header">
                    <div class="day">${dayName}</div>
                </div>
                <div class="forecast-content">
                    <div class="degree">${Math.round(day.maxTemp)}<sup>°</sup></div>
                    <small>${Math.round(day.minTemp)}°</small>
                </div>
            </div>
        `;
        weatherResult.innerHTML += forecastHTML;
    });
}

// Function to save a city as a favorite
function saveFavoriteCity(city) {
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    if (!favorites.includes(city)) {
        favorites.push(city);
        localStorage.setItem('favorites', JSON.stringify(favorites));
        displayFavorites();
    } else {
        alert(`${city} is already in your favorite list.`);
    }
}

// Function to display favorite cities and allow click and delete events
function displayFavorites() {
    const favoritesList = document.getElementById('favorites-list');
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    favoritesList.innerHTML = '';

    favorites.forEach((city, index) => {
        const li = document.createElement('li');
        
        // Create a clickable link for the city
        const a = document.createElement('a');  
        a.textContent = city;
        a.href = "#";  // Set href to '#' to make it a clickable link

        // Add click event listener to each favorite city
        a.addEventListener('click', function(e) {
            e.preventDefault();  // Prevent default anchor behavior
            getCoordinatesAndWeather(city);  // Fetch weather for the clicked city
        });

        // Create the delete button
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.classList.add('delete-btn');  // Add a class for styling

        // Add event listener for deleting the city
        deleteButton.addEventListener('click', function() {
            deleteFavoriteCity(index);  // Pass the index to delete the correct city
        });

        li.appendChild(a);  // Append the anchor (city link) to the list item
        li.appendChild(deleteButton);  // Append the delete button to the list item
        favoritesList.appendChild(li);  // Append the list item to the favorites list
    });
}

// Function to delete a city from the favorites list
function deleteFavoriteCity(index) {
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    favorites.splice(index, 1);  // Remove the city at the given index
    localStorage.setItem('favorites', JSON.stringify(favorites));  // Update localStorage
    displayFavorites();  // Re-render the favorites list
}

// Function to get city suggestions from OpenWeatherMap API
function getCitySuggestions(query) {
    if (!query) return;  // Exit if the query is empty

    const geoApiUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=5&appid=e8de836d7d3bd14d7ca482e4e92bb49d`;

    fetch(geoApiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to fetch city suggestions. Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data && data.length > 0) {
                displaySuggestions(data);
            } else {
                clearSuggestions();
            }
        })
        .catch(error => {
            console.error('Error fetching city suggestions:', error);
            clearSuggestions();
        });
}

// Function to display the city suggestions
function displaySuggestions(suggestions) {
    const suggestionsList = document.getElementById('suggestions-list');
    suggestionsList.innerHTML = '';  // Clear previous suggestions

    suggestions.forEach(city => {
        const li = document.createElement('li');
        li.textContent = `${city.name}, ${city.country}`;
        li.addEventListener('click', function() {
            document.getElementById('city-input').value = city.name;  // Set input value to selected city
            clearSuggestions();  // Clear suggestions after selection
        });
        suggestionsList.appendChild(li);
    });
}

// Function to clear suggestions
function clearSuggestions() {
    const suggestionsList = document.getElementById('suggestions-list');
    suggestionsList.innerHTML = '';  // Clear all suggestions
}

// Add event listener to the search input field
document.getElementById('city-input').addEventListener('input', function() {
    const query = this.value.trim();
    if (query.length > 1) {  // Fetch suggestions if input has more than 1 character
        getCitySuggestions(query);
    } else {
        clearSuggestions();  // Clear suggestions if input is too short
    }
});
