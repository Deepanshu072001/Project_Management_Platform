import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";   // ← ADD THIS


const app = express();

//basic config
app.use(express.json({ limit: "15kb"}));
app.use(express.urlencoded({ extended: true, 
    limit: "15kb"}));
app.use(express.static("public"));
app.use(cookieParser());                     // ← AND ADD THIS


//cors configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(",").map(o => o.trim())
    : ["http://localhost:5173", "http://localhost:3000"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

//import the routes

import healthCheckRouter from "./routes/healthcheck.route.js";
import authRouter from "./routes/auth.route.js"
import projectRouter from "./routes/project.route.js";
import memberRouter from "./routes/member.route.js";
import taskRouter from "./routes/task.route.js";
import subtaskRouter from "./routes/subtask.route.js";
import noteRouter from "./routes/note.route.js";
import adminRouter from "./routes/admin.route.js";


app.use("/api/v1/healthcheck", healthCheckRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/projects", projectRouter);
app.use("/api/v1/projects", memberRouter);
app.use("/api/v1/tasks", taskRouter);
app.use("/api/v1/subtasks", subtaskRouter);
app.use("/api/v1/notes", noteRouter);
app.use("/api/v1/admin", adminRouter);


app.get('/', (req, res) => {
    res.send("Welcome to project management");
});

app.get('/about', (req, res) => {
    res.send("This is the about page");
});


export default app;