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
import sendEmail from "../utils/sendEmail.js";
import { reset_password_otp_template } from "../utils/emailTemplates.js";
import generateOTP from "../utils/generateOTP.js";

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
    const id = req.user?.sub;

    if (!refreshToken) {
      return res.status(200).json({
        message: "Logged out successfully",
      });
    }

    const user = await User.findById(id).select("+refreshToken");

    if (user) {
      user.refreshToken = null;
      await user.save();
    }

    // clear cookies
    return res
      .clearCookie("refreshToken", cookieConfig)
      .json({ message: "User logged out successfully" });
  } catch (error) {
    next(error);
  }
};

// forgot password
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return next(new AppError("Email does not found", 404));
    }

    const otp = generateOTP();

    const hashedOTP = await bcrypt.hash(otp, 10);
    user.passwordResetOTP = hashedOTP;
    //static method for generating milliseconds since epoch
    user.passwordResetOTPExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes from otp sent
    await user.save();

    const emailOptions = {
      to: user.email,
      subject: "OTP for reset password - Rent It",
      html: reset_password_otp_template(otp, "Rent It"),
    };

    try {
      await sendEmail(emailOptions);
    } catch (error) {
      return next(new AppError("Error sending otp mail", 400));
    }

    return res.status(200).json({ message: "OTP send successfully" });
  } catch (error) {
    next(error);
  }
};

// Reset Password
export const resetPassword = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;

    const user = await User.findOne({ email }).select("+passwordResetOTP");
    if (!user) return next(new AppError("User Does not found", 404));

    const isOtpExpired = Date.now() > user.passwordResetOTPExpiry;
    if (isOtpExpired) return next(new AppError("OTP Expired", 400));

    const otpMatched = await bcrypt.compare(otp, user.passwordResetOTP);
    if (!otpMatched) return next(new AppError("Invalid OTP", 400));

    user.password = newPassword;

    // Reset passwordReset Fields
    user.passwordResetOTP = null;
    user.passwordResetOTPExpiry = null;

    await user.save();

    res.status(200).json({ message: "password verified Successfully" });
  } catch (error) {
    next(error);
  }
};
