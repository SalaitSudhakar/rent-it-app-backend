import User from "../models/userModel.js";
import bcrypt from "bcrypt";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/generateTokens.js";
import AppError from "../utils/appError.js";
import sendAuthResponse from "../utils/sendAuthUserResponse.js";

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
      201
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
      "+password +refreshToken"
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
      200
    );
  } catch (error) {
    next(error);
  }
};