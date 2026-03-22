// Allow cross-origin requests (API use-case).
// 1. Define CORS options

// const allowedOrigins = ["http://localhost:5173"];

// if (process.env.CLIENT_URL) {
//   allowedOrigins.push(process.env.CLIENT_URL);
// }

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

export default corsOptions;
