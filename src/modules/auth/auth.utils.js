import otpGenerator from "otp-generator";
import jwt from "jsonwebtoken";

// ============================================================
// Generate OTP
// ============================================================

export const generateOTP = () => {
  return otpGenerator.generate(6, {
    digits: true,
    lowerCaseAlphabets: false,
    upperCaseAlphabets: false,
    specialChars: false,
  });
};

// ============================================================
// OTP Expiry
// ============================================================

export const getOTPExpiry = () => {
  const expiry = new Date();

  expiry.setMinutes(
    expiry.getMinutes() + 5
  );

  return expiry;
};

// ============================================================
// Generate Access Token
// ============================================================

export const generateAccessToken = (
  customer
) => {
  return jwt.sign(
    {
      id: customer._id.toString(),
      type: "customer",
    },

    process.env.JWT_SECRET,

    {
      expiresIn:
        process.env.JWT_EXPIRES_IN ||
        "15m",
    }
  );
};

// ============================================================
// Generate Refresh Token
// ============================================================

export const generateRefreshToken = (
  customer,
  sessionId
) => {
  return jwt.sign(
    {
      id: customer._id.toString(),

      type: "customer",

      sessionId:
        sessionId.toString(),
    },

    process.env.JWT_REFRESH_SECRET,

    {
      expiresIn:
        process.env.JWT_REFRESH_EXPIRES_IN ||
        "30d",
    }
  );
};