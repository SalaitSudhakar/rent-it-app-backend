import jwt from "jsonwebtoken";
import AppError from "../utils/AppError";

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;

export const verifyToken = (req, res, next) => {
  const authorizationHeader = req.headers["authorization"];

  if (
    !authorizationHeader ||
    !authorizationHeader.startsWith("Bearer ") ||
    authorizationHeader.endsWith(" ")
  ) {
    return next(new AppError("Token is missing", 401));
  }

  const token = authorizationHeader.split(" ")[1]; // Get the Authorization field from header split it into size 2 array. because it has "bearer [token]". so, accessing index 1 returns the token

  try {
    const verifiedUserData = jwt.verify(token, JWT_ACCESS_SECRET);
    req.user = verifiedUserData;
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return next(new AppError("Token is Expired", 401));
    } else if (err.name === "JsonWebTokenError") {
      return next(new AppError("Invalid Token or tampered", 401));
    }
  }

  next();
};
