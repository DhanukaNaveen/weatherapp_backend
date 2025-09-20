const axios = require('axios');
const NodeCache = require('node-cache');
const weatherCache = new NodeCache({ stdTTL: 300, checkperiod: 320 }); // Cache expires in 5 minutes

// Fetch weather data from OpenWeatherMap API
const getWeatherData = async (req, res) => {
  const cityCode = req.params.cityCode;
  const apiKey = process.env.API_KEY;

  // Check if cached data exists
  let cachedWeather = weatherCache.get(cityCode);
  if (cachedWeather) {
    console.log('Serving from cache...');
    return res.json(cachedWeather);
  }

  try {
    // Fetch data from OpenWeatherMap API
    const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?id=${cityCode}&appid=${apiKey}`);
    const weatherData = {
      city: response.data.name,
      temperature: response.data.main.temp,
      weather: response.data.weather[0].description,
    };

    // Cache the data for future use
    weatherCache.set(cityCode, weatherData);

    // Send the response
    return res.json(weatherData);
  } catch (error) {
    console.error('Error fetching weather data:', error);
    return res.status(500).json({ error: 'Unable to fetch weather data' });
  }
};

module.exports = { getWeatherData };
