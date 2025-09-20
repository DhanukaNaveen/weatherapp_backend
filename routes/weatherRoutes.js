const express = require('express');
const { getWeatherData } = require('../controllers/weatherController');

const router = express.Router();

// Route to get weather data by city code
router.get('/weather/:cityCode', getWeatherData);

module.exports = router;
