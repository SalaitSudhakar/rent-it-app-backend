import cookieConfig from "../config/cookieConfig.js";

const sendAuthResponse = (
  res,
  user,
  accessToken,
  refreshToken,
  message,
  statusCode,
) => {
  return res
    .status(statusCode)
    .cookie("refreshToken", refreshToken, cookieConfig)
    .json({
      data: {
        name: user.name,
        email: user.email,
        phone: user.phone || "",
        role: user.role,
        accessToken,
      },
      message,
    });
};

export default sendAuthResponse;
