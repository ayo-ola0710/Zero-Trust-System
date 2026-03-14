import express from "express";
import cookieParser from "cookie-parser";
import expressLayouts from "express-ejs-layouts";
import path from "path";
import { fileURLToPath } from "url";

import authRouter from "./api/routes/authRoute.js";
import resourceRouter from "./api/routes/resourceRoute.js";
import viewRouter from "./api/routes/viewRoute.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// View Engine Configuration
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(expressLayouts);
app.set("layout", "layout"); // Default layout

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Important for form submissions
app.use(cookieParser());

// Routes
app.use("/api/auth", authRouter);
app.use("/api/resource", resourceRouter);
app.use("/", viewRouter);

app.get("/health", (req, res) => {
  res.send({
    message: "Server is healthy",
  });
});

export default app;
