import axios from 'axios';
import dotenv from 'dotenv';
import fs from 'fs/promises'; // Use promises version to handle async file reading
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import NodeCache from 'node-cache';

dotenv.config();  // Load environment variables from .env file

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const weatherCache = new NodeCache({ stdTTL: 300, checkperiod: 320 }); // Cache expires in 5 minutes

// Fetch all city codes from cities.json
export async function getCityCodes(req, res) {
  try {
    const filePath = path.join(__dirname, '../data/cities.json');
    const data = await fs.readFile(filePath, 'utf-8');
    const cities = JSON.parse(data);
    
    if (!cities.List || !Array.isArray(cities.List)) {
      return res.status(500).json({ error: 'Invalid cities data structure' });
    }
    
    const cityCodes = cities.List.map(city => city.CityCode);  // Extract CityCode values
    res.json(cityCodes);  // Return the array of CityCode values
  } catch (err) {
    console.error('Error reading cities.json:', err);
    res.status(500).json({ error: 'Unable to fetch cities data' });
  }
}

// Fetch weather data for a specific city
export async function getWeather(req, res) {
  const cityCode = req.params.cityCode;

  // Validate cityCode
  if (!cityCode || isNaN(cityCode)) {
    return res.status(400).json({ error: 'Invalid city code' });
  }

  // Check cache
  const cachedWeather = weatherCache.get(cityCode);
  if (cachedWeather) {
    console.log('Serving from cache...');
    return res.json(cachedWeather);
  }

  try {
    const response = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
      params: {
        id: cityCode,
        appid: process.env.API_KEY,
        units: 'metric'
      },
      timeout: 5000 // Add timeout to prevent hanging requests
    });

    if (response.data.cod !== 200) {
      return res.status(404).json({ error: 'City not found' });
    }

    const weatherResponse = {
      city: response.data.name,
      temperature: response.data.main.temp,
      weather: response.data.weather[0].description,
      cityCode: cityCode,
      humidity: response.data.main.humidity,
      windSpeed: response.data.wind.speed
    };

    weatherCache.set(cityCode, weatherResponse);
    res.json(weatherResponse);

  } catch (error) {
    console.error('Error fetching weather data:', error.message);
    
    if (error.response) {
      // OpenWeatherMap API error
      if (error.response.status === 404) {
        return res.status(404).json({ error: 'City not found' });
      }
      return res.status(error.response.status).json({ 
        error: 'Weather API error', 
        details: error.response.data 
      });
    } else if (error.request) {
      // Network error
      return res.status(503).json({ error: 'Weather service unavailable' });
    } else {
      // Other error
      return res.status(500).json({ error: 'Unable to fetch weather data' });
    }
  }
}
