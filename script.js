
function displayFavorites() {
    const favoritesList = document.getElementById('favorites-list');
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    favoritesList.innerHTML = '';

    favorites.forEach(city => {
        const li = document.createElement('li');
        li.textContent = city;

        const removeButton = document.createElement('button');
        removeButton.textContent = 'Remove';
        removeButton.classList.add('remove-favorite');
        li.appendChild(removeButton);

        favoritesList.appendChild(li);

        
        removeButton.addEventListener('click', function() {
            removeFavoriteCity(city);
        });
    });
}


function removeFavoriteCity(city) {
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    favorites = favorites.filter(favCity => favCity !== city);
    localStorage.setItem('favorites', JSON.stringify(favorites));
    displayFavorites(); 
}


function saveFavoriteCity(city) {
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    if (!favorites.includes(city)) {
        favorites.push(city);
        localStorage.setItem('favorites', JSON.stringify(favorites));
        displayFavorites();
    }
}


document.getElementById('get-weather-btn').addEventListener('click', function() {
    const city = document.getElementById('city-input').value;
    getWeather(city);
});


document.getElementById('save-favorite-btn').addEventListener('click', function() {
    const city = document.getElementById('city-input').value;
    if (city) {
        saveFavoriteCity(city);
    } else {
        alert('Please enter a city name to save.');
    }
});


document.getElementById('favorites-list').addEventListener('click', function(event) {
    if (event.target.tagName === 'LI') {
        const city = event.target.textContent;
        getWeather(city);
    }
});

function getWeather(city) {
    if (!city) {
        alert('Please enter a city name.');
        return;
    }

    const loader = document.getElementById('loader');
    loader.style.display = 'block';

    const accessKey = '95d688d7aff475573fc9c366a0a4f478';
    const url = `https://api.weatherstack.com/current?access_key=${accessKey}&query=${city}`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            displayWeather(data, city);
            loader.style.display = 'none';
        })
        .catch(error => {
            console.error('Error fetching weather data:', error);
            alert('Failed to fetch weather data. Please try again later.');
            loader.style.display = 'none';
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

window.onload = displayFavorites;
