import crypto from "crypto";

const generateOTP = () => {
  // crypto.randomInt is a cryptographically secure function
  // Generates a random integer between the min (inclusive) and max (exclusive)
  const min = 100000;
  const max = 1000000;

  const otp = crypto.randomInt(min, max);

  return otp.toString();
};

export default generateOTP;
