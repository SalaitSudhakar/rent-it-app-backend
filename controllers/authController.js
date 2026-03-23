import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/generateTokens.js";
import User from "../models/userModel.js";

export const register = async (req, res, next) => {
  try {
    const { name, email, password, phone = "" } = req.body;

    const user = await User.findOne({ email });

    const error = new Error();
    if (user) {
      error.message = "This email is already registered";
      error.statusCode = 409;
      return next(error);
    }

    const role = "customer";
    const userData = {
      name,
      email,
      password,
      role,
    };

    if (phone) {
      userData.phone = phone;
    }

    const newUser = new User(userData);
    await newUser.save();

    const accessToken = generateAccessToken(newUser._id, newUser.role);
    const refreshToken = generateRefreshToken(newUser._id);

    newUser.refreshToken = refreshToken;
    await newUser.save();

    res
      .status(201)
      .cookie("refreshToken", refreshToken, {
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      })
      .json({
        data: { name, email, phone: phone || "" , role, accessToken },
        message: "User Registered Successfully",
      });
  } catch (error) {
    next(error);
  }
};
