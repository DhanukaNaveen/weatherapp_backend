import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import weatherRouter from "./routers/weatherRouter.js";

dotenv.config();  // Load environment variables from .env file

const app = express();

// Middleware
app.use(express.json());  // Built-in Express method to parse JSON bodies
app.use(cors());  // Enable CORS for cross-origin requests

// Routes
app.use("/api/weather", weatherRouter);  // All weather-related routes are prefixed with /api/weather

// Start server
app.listen(5000, () => {
  console.log("Server started on port 5000");
});
