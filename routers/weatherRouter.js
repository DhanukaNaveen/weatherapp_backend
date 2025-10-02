import express from 'express';
import { getWeather, getCityCodes } from '../controllers/weatherController.js';
import jwtCheck from '../middleware/jwtMiddleware.js';

const weatherRouter = express.Router();

weatherRouter.get("/cities",jwtCheck, getCityCodes);  
weatherRouter.get("/:cityCode",jwtCheck, getWeather);

export default weatherRouter;
