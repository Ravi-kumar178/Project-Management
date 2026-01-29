import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

//basic configuration
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

//cors configuration
app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(",") || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

import healthCheckRoutes from './routes/healthcheck.routes.js'
import authRoutes from './routes/auth.routes.js'
// health check routes
app.use('/api/v1/healthcheck',healthCheckRoutes);

//auth routes
app.use('/api/v1/auth',authRoutes);

app.get("/", (req, res) => {
  res.send("Hello world");
});

export default app;
