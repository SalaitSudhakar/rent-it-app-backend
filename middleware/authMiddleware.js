import jwt from "jsonwebtoken";

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;

export const verifyToken = (req, res, next) => {
  const authorizationHeader = req.headers["authorization"];

  const error = new Error();

  if (
    !authorizationHeader ||
    !authorizationHeader.startsWith("Bearer ") ||
    authorizationHeader.endsWith(" ")
  ) {
    error.message = "Token is missing";
    error.statusCode = 401;

    return next(error);
  }

  const token = authorizationHeader.split(" ")[1]; // Get the Authorization field from header split it into size 2 array. because it has "bearer [token]". so, accessing index 1 returns the token

  try {
    const verifiedUserData = jwt.verify(token, JWT_ACCESS_SECRET);
    req.user = verifiedUserData;
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      err.message = "Token is Expired";
    } else if (err.name === "JsonWebTokenError") {
      err.message = "Invalid Token or tampered";
    }
    err.statusCode = 401;
    return next(err);
  }

  next();
};
