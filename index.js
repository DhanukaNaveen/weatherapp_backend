import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import weatherRouter from "./routers/weatherRouter.js";

dotenv.config();  

const app = express();

// Middleware
app.use(express.json());  
app.use(cors());  

// Routes
app.use("/api/weather", weatherRouter);  

// Start server
app.listen(5000, () => {
  console.log("Server started on port 5000");
});
