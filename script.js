const CONFIG = {
    WEATHER_URL: 'https://api.openweathermap.org/data/2.5/weather',
    FORECAST_URL: 'https://api.openweathermap.org/data/2.5/forecast',
    UNSPLASH_URL: 'https://api.unsplash.com/search/photos',
    WEATHER_API_KEY: 'f00c38e0279b7bc85480c3fe775d518c',
    UNSPLASH_ACCESS_KEY: 'ksijDQ8utgWRajG-NIrB8JfKCHnEvgoGGuj1750lgyo',
    UNITS: 'metric'
};

$(document).ready(() => {
    // DOM Elements
    const $cityInput = $('#city-input');
    const $weatherInfo = $('#weather-info');
    const $cityName = $('#city-name');
    const $date = $('#date');
    const $temp = $('#temperature');
    const $desc = $('#description');
    const $wind = $('#wind-speed');
    const $humidity = $('#humidity');
    const $icon = $('#weather-icon');
    const $btn = $('#city-input-btn');
    const $locationBtn = $('#location-btn');
    const $forecastContainer = $('#forecast-container');
    const $card = $('.weather-card');

    const fetchWeather = async (params) => {
        try {
            setLoading(true);

            // 1. Fetch Current Weather
            const weatherQuery = typeof params === 'string' ? `q=${params}` : `lat=${params.lat}&lon=${params.lon}`;
            const weatherRes = await fetch(`${CONFIG.WEATHER_URL}?${weatherQuery}&appid=${CONFIG.WEATHER_API_KEY}&units=${CONFIG.UNITS}`);
            const weatherData = await weatherRes.json();

            if (!weatherRes.ok) throw new Error(weatherData.message || 'City not found');

            // 2. Fetch Forecast
            const forecastRes = await fetch(`${CONFIG.FORECAST_URL}?${weatherQuery}&appid=${CONFIG.WEATHER_API_KEY}&units=${CONFIG.UNITS}`);
            const forecastData = await forecastRes.json();

            // 3. Update UI
            updateUI(weatherData, forecastData);

            // 4. Update Background
            updateBackground(weatherData.name);

        } catch (error) {
            console.error('Fetch Error:', error);
            alert(error.message || 'Unable to fetch weather data.');
        } finally {
            setLoading(false);
        }
    };

    const updateUI = (current, forecast) => {
        $weatherInfo.hide();

        // Current Weather
        const tempValue = Math.round(current.main.temp);
        $cityName.text(`${current.name}, ${current.sys.country}`);
        $date.text(moment().format('MMMM Do YYYY, h:mm a'));
        $temp.html(`${tempValue}°<span>C</span>`);
        $desc.text(current.weather[0].description);
        $wind.text(`${current.wind.speed} m/s`);
        $humidity.text(`${current.main.humidity}%`);

        const iconCode = current.weather[0].icon;
        $icon.attr('src', `https://openweathermap.org/img/wn/${iconCode}@4x.png`);

        // Handle Weather Vibe
        $card.removeClass('cold moderate hot');
        if (tempValue < 15) {
            $card.addClass('cold');
            $icon.css('filter', 'drop-shadow(0 0 15px #00d2ff)');
        } else if (tempValue <= 28) {
            $card.addClass('moderate');
            $icon.css('filter', 'drop-shadow(0 0 15px #f9d423)');
        } else {
            $card.addClass('hot');
            $icon.css('filter', 'drop-shadow(0 0 15px #ff4e50)');
        }

        // Forecast Processing (OpenWeatherMap returns 40 items, 3 hours apart)
        $forecastContainer.empty();
        const dailyData = forecast.list.filter(item => item.dt_txt.includes('12:00:00'));

        dailyData.forEach(day => {
            const date = moment(day.dt * 1000).format('ddd');
            const temp = Math.round(day.main.temp);
            const icon = day.weather[0].icon;

            const forecastHTML = `
                <div class="forecast-item animate__animated animate__fadeIn">
                    <span class="forecast-day">${date}</span>
                    <img class="forecast-icon" src="https://openweathermap.org/img/wn/${icon}.png" alt="weather">
                    <span class="forecast-temp">${temp}°C</span>
                </div>
            `;
            $forecastContainer.append(forecastHTML);
        });

        $weatherInfo.fadeIn().addClass('animate__fadeInUp');
    };

    const updateBackground = async (query) => {
        try {
            const res = await fetch(`${CONFIG.UNSPLASH_URL}?query=${query}&client_id=${CONFIG.UNSPLASH_ACCESS_KEY}&per_page=1`);
            const data = await res.json();

            if (data.results && data.results.length > 0) {
                const imgUrl = data.results[0].urls.regular;
                $('body').css('background-image', `url('${imgUrl}')`);
            } else {
                // Fallback to generic weather image
                $('body').css('background-image', `url('https://source.unsplash.com/1600x900/?nature,weather')`);
            }
        } catch (err) {
            console.warn('Unsplash Error:', err);
        }
    };

    const setLoading = (isLoading) => {
        $btn.prop('disabled', isLoading).html(isLoading ? '<i class="fas fa-spinner fa-spin"></i>' : '<i class="fas fa-search"></i>');
        $locationBtn.prop('disabled', isLoading);
    };

    // Event Listeners
    $btn.on('click', () => fetchWeather($cityInput.val().trim()));

    $cityInput.on('keypress', (e) => {
        if (e.which === 13) fetchWeather($cityInput.val().trim());
    });

    $locationBtn.on('click', () => {
        if (navigator.geolocation) {
            setLoading(true);
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    fetchWeather({
                        lat: position.coords.latitude,
                        lon: position.coords.longitude
                    });
                },
                (error) => {
                    alert('Location access denied. Please enter city manually.');
                    setLoading(false);
                }
            );
        } else {
            alert('Geolocation not supported by your browser.');
        }
    });

    // Initial weather
    fetchWeather('Mangalore');
});