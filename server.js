import { envMode } from "./config/envConfig.js";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import connectDB from "./config/databaseConfig.js";
import corsOptions from "./config/corsConfig.js";
import limiter from "./config/rateLimitConfig.js";
import authRoute from "./routes/authRoute.js"
import {notFoundHandler, globalErrorHandler} from "./middleware/errorMiddleware.js"
import sanitizeMiddleware from "./middleware/sanitizeMiddleware.js";

const app = express();

// helmet
app.use(helmet());

// 2. Apply the middleware
app.use(cors(corsOptions));

// rate limit
app.use(limiter);

// Parse incoming JSON request bodies.
app.use(express.json());

// cookie parser to handle cookies
app.use(cookieParser());

// sanitize (remove $ and . which could be a db query)
app.use(sanitizeMiddleware);

app.get("/", (req, res) => {
  res.json({ success: true, message: "Server is running" });
});

// Routes
app.use("/api/auth", authRoute)

// Not found error handler
app.use(notFoundHandler)

// Global error handler
app.use(globalErrorHandler);

// Use PORT from env or fallback to 5000.
const PORT = process.env.PORT || 5000;

// Connect Database and Start the server
const startServer = async () => {
  try {
    await connectDB();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.info(`Server running in ${envMode} mode on port ${PORT}`);
  });
};

startServer();
