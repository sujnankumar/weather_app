const CONFIG = {
    URL: 'https://api.openweathermap.org/data/2.5/weather',
    API_KEY: 'f00c38e0279b7bc85480c3fe775d518c',
    UNITS: 'metric'
};

$(document).ready(() => {
    const $cityInput = $('#city-input');
    const $weatherInfo = $('#weather-info');
    const $cityName = $('#city-name');
    const $date = $('#date');
    const $temp = $('#temperature');
    const $desc = $('#description');
    const $wind = $('#wind-speed');
    const $icon = $('#weather-icon');
    const $btn = $('#city-input-btn');

    const fetchWeather = async (city) => {
        const query = city.trim();
        if (!query) {
            alert('Please enter a city name.');
            return;
        }

        try {
            setLoading(true);
            const response = await fetch(`${CONFIG.URL}?q=${query}&appid=${CONFIG.API_KEY}&units=${CONFIG.UNITS}`);
            const data = await response.json();

            if (response.ok) {
                updateUI(data);
            } else {
                alert(data.message || 'City not found.');
            }
        } catch (error) {
            console.error('Fetch Error:', error);
            alert('Unable to connect to the weather service.');
        } finally {
            setLoading(false);
        }
    };

    const updateUI = (data) => {
        $weatherInfo.hide();

        const tempValue = Math.round(data.main.temp);
        $cityName.text(`${data.name}, ${data.sys.country}`);
        $date.text(moment().format('MMMM Do YYYY'));
        $temp.html(`${tempValue}°<span>C</span>`);
        $desc.text(data.weather[0].description);
        $wind.text(`Wind: ${data.wind.speed} m/s`);

        const iconCode = data.weather[0].icon;
        // Add a timestamp to the URL to force the browser to refresh the image
        $icon.attr('src', `https://openweathermap.org/img/wn/${iconCode}@2x.png?t=${new Date().getTime()}`);

        // Update vibe based on temp
        const $card = $('.weather-card');
        $card.removeClass('cold moderate hot');

        if (tempValue < 15) {
            $card.addClass('cold');
            $icon.css('filter', 'drop-shadow(0 5px 15px rgba(0, 210, 255, 0.6))');
        } else if (tempValue <= 25) {
            $card.addClass('moderate');
            $icon.css('filter', 'drop-shadow(0 5px 15px rgba(249, 212, 35, 0.6))');
        } else {
            $card.addClass('hot');
            $icon.css('filter', 'drop-shadow(0 5px 15px rgba(255, 78, 80, 0.6))');
        }

        $weatherInfo.fadeIn().addClass('animate__fadeInUp');
    };

    const setLoading = (isLoading) => {
        $btn.prop('disabled', isLoading).text(isLoading ? '...' : 'Get');
        if (isLoading) {
            $cityInput.css('opacity', '0.7');
        } else {
            $cityInput.css('opacity', '1');
        }
    };
    $btn.on('click', () => fetchWeather($cityInput.val()));

    $cityInput.on('keypress', (e) => {
        if (e.which === 13) fetchWeather($cityInput.val());
    });

    fetchWeather('Mangalore');
});