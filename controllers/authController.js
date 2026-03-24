import User from "../models/userModel.js";
import bcrypt from "bcrypt";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/generateTokens.js";
import jwt from "jsonwebtoken";
import AppError from "../utils/appError.js";
import sendAuthResponse from "../utils/sendAuthUserResponse.js";
import cookieConfig from "../config/cookieConfig.js";

export const register = async (req, res, next) => {
  try {
    const { name, email, password, phone = "" } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return next(new AppError("Email already registered", 409));
    }

    const newUser = await User.create({
      name,
      email,
      password,
      ...(phone && { phone }),
    });

    const accessToken = generateAccessToken(newUser._id, newUser.role);
    const refreshToken = generateRefreshToken(newUser._id);

    newUser.refreshToken = refreshToken;
    await newUser.save();

    return sendAuthResponse(
      res,
      newUser,
      accessToken,
      refreshToken,
      "User Registered Successfully",
      201,
    );
  } catch (error) {
    next(error);
  }
};

// Login
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select(
      "+password +refreshToken",
    );

    if (!user) {
      return next(new AppError("Invalid email or password", 401));
    }

    const isPasswordMatched = await bcrypt.compare(password, user.password);

    if (!isPasswordMatched) {
      return next(new AppError("Invalid email or password", 401));
    }

    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = refreshToken;
    await user.save();

    return sendAuthResponse(
      res,
      user,
      accessToken,
      refreshToken,
      "User Logged in successfully",
      200,
    );
  } catch (error) {
    next(error);
  }
};

// Refresh
export const refreshToken = async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) return next(new AppError("Unauthorized", 401));

    // 1. Verify token
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch (err) {
      return next(new AppError("Invalid or expired token", 401));
    }

    // 2. Find user
    const user = await User.findById(decoded.sub).select("+refreshToken");
    if (!user || !user.refreshToken)
      return next(new AppError("Unauthorized", 401));

    // 3. Match refresh token with DB
    if (user.refreshToken !== refreshToken) {
      user.refreshToken = null;
      await user.save();

      return next(new AppError("session expired. Please login again", 401));
    }

    // Generate access Token
    const newAccessToken = generateAccessToken(user._id, user.role);
    const newRefreshToken = generateRefreshToken(user._id);

    user.refreshToken = newRefreshToken;
    await user.save();

    return res
      .status(200)
      .cookie("refreshToken", newRefreshToken, cookieConfig)
      .json({
        accessToken: newAccessToken,
      });
  } catch (error) {
    next(error);
  }
};

// logout
export const logout = async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      return res.status(200).json({
        message: "Logged out successfully",
      });
    }

    const user = await User.findOne({ refreshToken }).select(
      "+refreshToken",
    );

    if (user) {
      user.refreshToken = null;
      await user.save();
    }

    // clear cookies
    return res
      .clearCookie("refreshToken")
      .json({ message: "User logged out successfully" });
  } catch (error) {
    next(error);
  }
};
