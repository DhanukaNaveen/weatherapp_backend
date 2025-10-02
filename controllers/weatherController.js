import axios from 'axios';  
import dotenv from 'dotenv';  
import fs from 'fs/promises'; 
import path from 'path';  
import { fileURLToPath } from 'url';  
import { dirname } from 'path';  
import NodeCache from 'node-cache'; 

dotenv.config();  


const __filename = fileURLToPath(import.meta.url);  
const __dirname = dirname(__filename);  


const weatherCache = new NodeCache({ stdTTL: 300, checkperiod: 320 });  


export async function getCityCodes(req, res) {
  try {

    const filePath = path.join(__dirname, '../data/cities.json');
    const data = await fs.readFile(filePath, 'utf-8');
    const cities = JSON.parse(data);
    
    if (!Array.isArray(cities.List)) {
      return res.status(500).json({ error: 'Invalid cities data structure' });
    }
    
    const cityCodes = cities.List.map(city => city.CityCode);
    res.json(cityCodes);  
  } catch (err) {
    console.error('Error reading cities.json:', err);  
    res.status(500).json({ error: 'Unable to fetch cities data' });  
  }
}


export async function getWeather(req, res) {
  const cityCode = req.params.cityCode;  

  if (!cityCode || isNaN(cityCode)) {  
    return res.status(400).json({ error: 'Invalid city code' });  
  }

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
      timeout: 5000  
    });

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
    res.status(500).json({ error: 'Unable to fetch weather data' });  
  }
}
