export const reset_password_otp_template = (otp, appName) => {
  return `
  <div style="font-family: Arial, sans-serif; background:#f4f4f4; padding:20px;">
    <div style="max-width:500px; margin:auto; background:white; padding:20px; border-radius:8px; text-align:center;">
      
      <h2 style="color:#333;">${appName}</h2>
      
      <p style="font-size:16px; color:#555;">
        Use the OTP below to reset your password
      </p>

      <div style="font-size:32px; font-weight:bold; letter-spacing:5px; margin:20px 0; color:#000;">
        ${otp}
      </div>

      <p style="color:#888; font-size:14px;">
        This OTP is valid for <b>10 minutes</b>.
      </p>

      <p style="color:#888; font-size:12px;">
        If you didn't request this, ignore this email.
      </p>

    </div>
  </div>
  `;
};
