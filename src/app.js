import express from "express";
import cors from "cors";

const app = express();

//basic config
app.use(express.json({ limit: "15kb"}));
app.use(express.urlencoded({ extended: true, 
    limit: "15kb"}));
app.use(express.static("public"));

//cors configuration
app.use(cors({
    origin: process.env.CORS_ORIGIN?.split(",") || "http://localhost:3000", //or 5173 for vite
    credentials: true,
    methods: [ "GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [" Content-Type", "Authorization"],
}),
);

//import the routes

import healthCheckRouter from "./routes/healthcheck.route.js";

app.use("/api/v1/healthcheck", healthCheckRouter);

app.get('/', (req, res) => {
    res.send("Welcome to project management");
});

app.get('/about', (req, res) => {
    res.send("This is the about page");
});


export default app;