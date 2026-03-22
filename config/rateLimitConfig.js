import { rateLimit } from "express-rate-limit";

// Ratelimit to prevent ddos attack
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests, please try again later",
});

export default limiter;