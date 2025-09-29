import axios from 'axios';  // Import Axios to make HTTP requests to external APIs (in this case, OpenWeatherMap)
import dotenv from 'dotenv';  // Import dotenv to load environment variables from a .env file
import fs from 'fs/promises'; // Import the 'fs' module to read files asynchronously using promises
import path from 'path';  // Import 'path' to handle file paths easily
import { fileURLToPath } from 'url';  // Import function to convert URL to file path
import { dirname } from 'path';  // Import 'dirname' to get the directory name from a file path
import NodeCache from 'node-cache';  // Import NodeCache to store data in memory with expiration (for caching)

dotenv.config();  // Load environment variables from the .env file (like API keys)

// Get the current file's path and its directory path for later use
const __filename = fileURLToPath(import.meta.url);  // Get the full file path of the current file
const __dirname = dirname(__filename);  // Get the directory path of the current file

// Initialize a cache with NodeCache, data will expire after 5 minutes (300 seconds)
const weatherCache = new NodeCache({ stdTTL: 300, checkperiod: 320 });  // Cache stored in memory (RAM) on the server

// Fetch all city codes from cities.json
export async function getCityCodes(req, res) {
  try {
    // Build the path to the cities.json file
    const filePath = path.join(__dirname, '../data/cities.json');
    
    // Read the file content asynchronously as UTF-8 text
    const data = await fs.readFile(filePath, 'utf-8');
    
    // Parse the JSON data into a JavaScript object
    const cities = JSON.parse(data);
    
    // Validate if 'List' is present and is an array
    if (!Array.isArray(cities.List)) {
      return res.status(500).json({ error: 'Invalid cities data structure' });
    }
    
    // Extract the CityCode values from the cities array and send them as the response
    const cityCodes = cities.List.map(city => city.CityCode);
    res.json(cityCodes);  
  } catch (err) {
    console.error('Error reading cities.json:', err);  // Log the error
    res.status(500).json({ error: 'Unable to fetch cities data' });  // Send a generic error message
  }
}

// Fetch weather data for a specific city
export async function getWeather(req, res) {
  const cityCode = req.params.cityCode;  // Get the city code from the request URL

  // Validate the city code to ensure it's a valid number
  if (!cityCode || isNaN(cityCode)) {  // If the cityCode is not present (null, undefined, empty string) OR if it's not a valid number (NaN)
    return res.status(400).json({ error: 'Invalid city code' });  // Send an error response if the city code is invalid
  }

  // Check if the weather data for this city code is already cached (to avoid redundant API calls)
  const cachedWeather = weatherCache.get(cityCode);  // Retrieve the cached weather data using the city code as the key
  if (cachedWeather) {  // This condition checks whether cachedWeather contains valid data.
    console.log('Serving from cache...');
    return res.json(cachedWeather);  // Return the cached weather data directly
  }

  try {
    // Make a request to the OpenWeatherMap API to fetch weather data for the specified city code
    const response = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
      params: {
        id: cityCode,  // Pass the city code
        appid: process.env.API_KEY,  // API key from environment variables
        units: 'metric'  // Use metric units (Celsius for temperature)
      },
      timeout: 5000  // Set a timeout of 5 seconds to avoid hanging requests
    });

    // If the API call is successful, format the response
    const weatherResponse = {
      city: response.data.name,
      temperature: response.data.main.temp,
      weather: response.data.weather[0].description,
      cityCode: cityCode,
      humidity: response.data.main.humidity,
      windSpeed: response.data.wind.speed
    };

    // Store the weather data in cache with the city code as the key
    weatherCache.set(cityCode, weatherResponse);
    
    // Send the weather data as a response
    res.json(weatherResponse);
  } catch (error) {
    // Simplified error handling
    console.error('Error fetching weather data:', error.message);  // Log the error message
    res.status(500).json({ error: 'Unable to fetch weather data' });  // Send a generic error message for all errors
  }
}
