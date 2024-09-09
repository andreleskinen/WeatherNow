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
});

// Function to get coordinates from OpenWeatherMap API and then fetch weather data
function getCoordinatesAndWeather(city) {
    const geoApiUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(city)}&limit=1&appid=792746ecbbd4e6098147a755fc360740`;

    fetch(geoApiUrl, { mode: 'cors' })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to fetch coordinates. Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data && data.length > 0) {
                // Shorten the coordinates to 4 decimal places
                const lat = parseFloat(data[0].lat).toFixed(4);
                const lon = parseFloat(data[0].lon).toFixed(4);

                console.log(`Shortened Coordinates: ${lat}, ${lon}`);
                getWeather(lat, lon); // Pass shortened coordinates to the weather function
            } else {
                alert('City not found.');
            }
        })
        .catch(error => {
            console.error('Error fetching coordinates:', error);
            alert('Failed to fetch coordinates.');
        });
}

// Function to fetch weather data from SMHI API using latitude and longitude
function getWeather(lat, lon) {
    const smhiApiUrl = `https://opendata-download-metfcst.smhi.se/api/category/pmp3g/version/2/geotype/point/lon/${lon}/lat/${lat}/data.json`;


    console.log('Fetching weather data:', smhiApiUrl);

    fetch(smhiApiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error fetching weather data. Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Weather data:', data);  // Log the response for debugging
            if (data && data.timeSeries) {
                const dailyTemps = getMaxMinTempForEachDay(data.timeSeries);
                displayWeather(dailyTemps);
            } else {
                alert('No weather data available.');
            }
        })
        .catch(error => {
            console.error('Error fetching weather data:', error);
            alert('Failed to fetch weather data.');
        });
}

// Function to extract the max and min temperature for each day
function getMaxMinTempForEachDay(timeSeries) {
    const dailyTemps = {};

    timeSeries.forEach(forecast => {
        const forecastDate = new Date(forecast.validTime);
        const dateString = forecastDate.toISOString().split('T')[0];  // Extract the date part
        const temperature = forecast.parameters.find(param => param.name === 't').values[0];  // Find the temperature parameter

        if (!dailyTemps[dateString]) {
            dailyTemps[dateString] = { maxTemp: temperature, minTemp: temperature };
        } else {
            dailyTemps[dateString].maxTemp = Math.max(dailyTemps[dateString].maxTemp, temperature);
            dailyTemps[dateString].minTemp = Math.min(dailyTemps[dateString].minTemp, temperature);
        }
    });

    return Object.entries(dailyTemps).slice(0, 10).map(([date, temps]) => ({ date, ...temps }));
}

// Function to display weather data on the webpage
function displayWeather(dailyTemps) {
    const weatherResult = document.getElementById('weather-result');
    weatherResult.innerHTML = '';  // Clear previous results

    if (dailyTemps.length === 0) {
        weatherResult.innerHTML = '<p>No weather data available.</p>';
        return;
    }

    let weatherHTML = '';  // Build the HTML as a string
    dailyTemps.forEach(day => {
        const dayName = new Date(day.date).toLocaleDateString('en-US', { weekday: 'long' });
        const dateString = new Date(day.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    
        weatherHTML += `
            <div class="weather-card">
                <p class="date">${dateString}</p>
                <p><strong>${dayName}</strong></p>
                <p>Max: ${day.maxTemp}°C</p>
                <p>Min: ${day.minTemp}°C</p>
            </div>
        `;
    });

    weatherResult.innerHTML = weatherHTML;  // Set all the content at once
}