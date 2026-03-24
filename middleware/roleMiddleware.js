import AppError from "../utils/appError.js";

export const allowRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return next(new AppError("You are not authorized", 403));
    }

    next();
  };
};
