import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import cookieParser from "cookie-parser";
import connectDB from "./database/databaseConfig.js";

// Environment mode: development, production, test, etc.
// Default to development when NODE_ENV is absent.
const envMode = process.env.NODE_ENV || "development";

// Load .env.<mode> file so configs can differ by environment.
const envFile = `.env.${envMode}`;
dotenv.config({
  path: path.resolve(process.cwd(), envFile),
  debug: envMode !== "production", // Log dotenv activity in non-production.
});

// Use PORT from env or fallback to 5000.
const PORT = process.env.PORT || 5000;

const app = express();

// Parse incoming JSON request bodies.
app.use(express.json());

// cookie parser to handle cookies
app.use(cookieParser());

// Allow cross-origin requests (API use-case).
// 1. Define CORS options
const corsOptions = {
  // Take the URL from .env, or default to a safe local one
  origin: process.env.CLIENT_URL || "http://localhost:5173",

  // HTTP methods you want to allow
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],

  // Allow browser to send cookies/headers (important for Auth)
  credentials: true,

  // Success status for legacy browsers (IE11, various SmartTVs)
  optionsSuccessStatus: 200,
};

// 2. Apply the middleware
app.use(cors(corsOptions));

app.get("/", (req, res) => {
  res.send(`<div>
    <h1 style='text-align:center;'>Home page</h1>
    <p style='text-align:center;'>Welcome to my rental App</p>
</div>
`);
});

const mongodbURI = process.env.MONGODB_URI;

if (!mongodbURI) {
  console.error("MongoDB URI is missing");
  process.exit(1); // terminate code if URI missing
}

// Connect Database and Start the server
const startServer = async () => {
  try {
    await connectDB(mongodbURI);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.info(`Server running in ${envMode} mode on port ${PORT}`);
  });
};

startServer()
