const requiredEnvVariables = [
  "MONGODB_URI",
  "JWT_ACCESS_SECRET",
  "JWT_REFRESH_SECRET",
  "JWT_ACCESS_EXPIRES_IN",
  "JWT_REFRESH_EXPIRES_IN",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "STRIPE_COMMISSION_RATE",
  "CLIENT_URL",
  "EMAIL_USER",
  "EMAIL_PASS"
];

export default function validateEnvVariables() {
  let missing_keys = [];

  requiredEnvVariables.forEach((envVar) => {
    if (!process.env[envVar]) {
      missing_keys.push(envVar);
    }
  });

  if (missing_keys.length > 0) {
    console.error(
      `Error: Some Keys required keys are missing\n${missing_keys.join("\n")}`,
    );
    process.exit(1);
  } else {
    console.info('Environment variables validated successfully')
  }
}
