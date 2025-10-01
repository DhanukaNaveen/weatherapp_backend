import express from 'express';
import { getWeather, getCityCodes } from '../controllers/weatherController.js';

const weatherRouter = express.Router();

weatherRouter.get("/cities", getCityCodes);  
weatherRouter.get("/:cityCode", getWeather);

export default weatherRouter;
