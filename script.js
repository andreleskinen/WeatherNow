document.getElementById('get-weather-btn').addEventListener('click', function() {
    const city = document.getElementById('city-input').value;
    getWeather(city);
});

function getWeather(city) {
    if (!city) {
        alert('Please enter a city name.');
        return;
    }

    const accessKey = '95d688d7aff475573fc9c366a0a4f478'; // Your Weatherstack API key
    const url = `https://api.weatherstack.com/current?access_key=${accessKey}&query=${city}`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            displayWeather(data, city);
        })
        .catch(error => {
            console.error('Error fetching weather data:', error);
            alert('Failed to fetch weather data. Please try again later.');
        });
}

function displayWeather(data, city) {
    const weatherResult = document.getElementById('weather-result');

    if (data.current) {
        weatherResult.innerHTML = `
            <h2>Weather in ${data.location.name}, ${data.location.country}</h2>
            <p>Temperature: ${data.current.temperature}°C</p>
            <p>Wind: ${data.current.wind_speed} km/h</p>
            <p>Description: ${data.current.weather_descriptions[0]}</p>
            <img src="${data.current.weather_icons[0]}" alt="Weather Icon">
        `;
    } else {
        weatherResult.innerHTML = `<p>Weather data not found for "${city}". Please check the city name and try again.</p>`;
    }
}