import dotenv from "dotenv";
import path from "path";
import validateEnvVariables from "../validators/validateEnvVariables.js";

// Environment mode: development, production, test, etc.
// Default to development when NODE_ENV is absent.
const envMode = process.env.NODE_ENV || "development";

// Load .env files only in non-production environments.
// In production, rely on environment variables set by the deployment platform.
if (envMode !== "production") {
  const envFile = `.env.${envMode}`;
  dotenv.config({
    path: path.resolve(process.cwd(), envFile),
    debug: envMode !== "production", // Log dotenv activity in non-production.
  });
}

validateEnvVariables();

export { envMode };
