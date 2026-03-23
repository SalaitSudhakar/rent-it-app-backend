import jwt from "jsonwebtoken";

const accessTokenSecret = process.env.JWT_ACCESS_SECRET;
const accessTokenExpiresIn = process.env.JWT_ACCESS_EXPIRES_IN;
const refreshTokenSecret = process.env.JWT_REFRESH_SECRET;
const refreshTokenExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN;

export function generateAccessToken(userId, role) {
  if (!userId) throw new Error("User Id is missing for token generation");
  return jwt.sign({ sub: userId, role: role }, accessTokenSecret, {
    expiresIn: accessTokenExpiresIn,
  });
}

export function generateRefreshToken(userId) {
  if (!userId) throw new Error("User Id is missing for token generation");
  return jwt.sign({ sub: userId }, refreshTokenSecret, {
    expiresIn: refreshTokenExpiresIn,
  });
}
