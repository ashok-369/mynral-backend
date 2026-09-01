import bcrypt from "bcrypt";
import crypto from "crypto";

import ApiError from "../../utils/ApiError.js";

import {
   createCustomer,
  findCustomerByMobile,
  findCustomerByMobileWithPassword,
  findCustomerById,
  updateCustomer,
} from "./auth.repository.js";

import {
  createSession,
} from "../sessions/session.repository.js";

import {
  generateOTP,
  getOTPExpiry,
  generateAccessToken,
  generateRefreshToken,
} from "./auth.utils.js";

import { sendOTP } from "../notifications/sms.service.js";


// ============================================================
// Hash Refresh Token
// ============================================================

const hashToken = (token) => {
  return crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
};


// ============================================================
// REGISTER CUSTOMER
// ============================================================

export const registerCustomer = async (data) => {
  const {
    firstName,
    lastName,
    mobile,
    email,
    password,
  } = data;

  // ----------------------------------------------------------
  // Check mobile already exists
  // ----------------------------------------------------------

  const existingCustomer =
    await findCustomerByMobileWithPassword(mobile);

  if (existingCustomer) {
    if (existingCustomer.isMobileVerified) {
      throw new ApiError(
        409,
        "Mobile number is already registered"
      );
    }

    // --------------------------------------------------------
    // Existing but not verified
    // Generate new OTP
    // --------------------------------------------------------

    const otp = generateOTP();
    const otpExpiresAt = getOTPExpiry();

    await updateCustomer(
      existingCustomer._id,
      {
        otp,
        otpExpiresAt,
      }
    );
    // console.log("otp", otp);
    // console.log("otpExpiresAt", otpExpiresAt);
    return {
      customerId: existingCustomer._id,
      mobile: existingCustomer.mobile,
      otpSent: true,
    };
  }

  // ----------------------------------------------------------
  // Hash password
  // ----------------------------------------------------------

  const hashedPassword =
    await bcrypt.hash(password, 12);

  // ----------------------------------------------------------
  // Generate OTP
  // ----------------------------------------------------------

  const otp = generateOTP();

  const otpExpiresAt =
    getOTPExpiry();

  // ----------------------------------------------------------
  // Create Customer
  // ----------------------------------------------------------

  const customer =
    await createCustomer({
      firstName,
      lastName,
      mobile,
      email,
      password: hashedPassword,

      isMobileVerified: false,
      isActive: true,

      otp,
      otpExpiresAt,
    });

  return {
    customerId: customer._id,
    mobile: customer.mobile,
    otpSent: true,
  };
};


// ============================================================
// VERIFY REGISTRATION OTP
// ============================================================

export const verifyRegistrationOTP =
  async (data) => {
    const {
      mobile,
      otp,
    } = data;

    // --------------------------------------------------------
    // Find customer
    // --------------------------------------------------------

    const customer =
      await findCustomerByMobileWithPassword(mobile);

    if (!customer) {
      throw new ApiError(
        404,
        "Customer not found"
      );
    }

    // --------------------------------------------------------
    // Already verified
    // --------------------------------------------------------

    if (customer.isMobileVerified) {
      throw new ApiError(
        409,
        "Mobile number is already verified"
      );
    }

    // --------------------------------------------------------
    // OTP exists
    // --------------------------------------------------------

    if (!customer.otp) {
      throw new ApiError(
        400,
        "OTP not found. Please request a new OTP"
      );
    }

    // --------------------------------------------------------
    // OTP expired
    // --------------------------------------------------------

    if (
      !customer.otpExpiresAt ||
      customer.otpExpiresAt < new Date()
    ) {
      throw new ApiError(
        400,
        "OTP has expired. Please request a new OTP"
      );
    }

    // --------------------------------------------------------
    // OTP mismatch
    // --------------------------------------------------------

    if (customer.otp !== otp) {
      throw new ApiError(
        400,
        "Invalid OTP"
      );
    }

    // --------------------------------------------------------
    // Verify mobile
    // --------------------------------------------------------

    const updatedCustomer =
      await updateCustomer(
        customer._id,
        {
          isMobileVerified: true,

          // Clear OTP after successful verification
          otp: null,
          otpExpiresAt: null,
        }
      );

    // --------------------------------------------------------
    // IMPORTANT:
    // Do NOT generate access/refresh tokens here.
    //
    // Tokens are generated only during LOGIN.
    // --------------------------------------------------------

    return {
      customer: {
        id: updatedCustomer._id,

        firstName:
          updatedCustomer.firstName,

        lastName:
          updatedCustomer.lastName,

        mobile:
          updatedCustomer.mobile,

        email:
          updatedCustomer.email,

        isMobileVerified:
          updatedCustomer.isMobileVerified,
      },
    };
  };


// ============================================================
// CUSTOMER LOGIN
// ============================================================

export const loginCustomer = async (data) => {
  const {
    mobile,
    password,
  } = data;

  // ----------------------------------------------------------
  // Find customer WITH password
  // ----------------------------------------------------------

  const customer =
    await findCustomerByMobileWithPassword(
      mobile
    );

  if (!customer) {
    throw new ApiError(
      401,
      "Invalid mobile number or password"
    );
  }

  // ----------------------------------------------------------
  // Check account status
  // ----------------------------------------------------------

  if (!customer.isActive) {
    throw new ApiError(
      403,
      "Customer account is inactive"
    );
  }

  // ----------------------------------------------------------
  // Check mobile verification
  // ----------------------------------------------------------

  if (!customer.isMobileVerified) {
    throw new ApiError(
      403,
      "Please verify your mobile number before login"
    );
  }

  // ----------------------------------------------------------
  // Check password
  // ----------------------------------------------------------

  if (!customer.password) {
    throw new ApiError(
      500,
      "Customer password is not available"
    );
  }

  const isPasswordValid =
    await bcrypt.compare(
      password,
      customer.password
    );

  if (!isPasswordValid) {
    throw new ApiError(
      401,
      "Invalid mobile number or password"
    );
  }

  // ----------------------------------------------------------
  // Generate Access Token
  // ----------------------------------------------------------

  const accessToken =
    generateAccessToken(customer);

  // ----------------------------------------------------------
  // Create MongoDB Session
  // ----------------------------------------------------------

  const session =
    await createSession({
      customerId: customer._id,

      refreshTokenHash: "pending",

      expiresAt: new Date(
        Date.now() +
          30 *
            24 *
            60 *
            60 *
            1000
      ),

      isRevoked: false,

      revokedAt: null,
    });

  // ----------------------------------------------------------
  // Generate Refresh Token
  // ----------------------------------------------------------

  const refreshToken =
    generateRefreshToken(
      customer,
      session._id
    );

  // ----------------------------------------------------------
  // Hash Refresh Token
  // ----------------------------------------------------------

  const refreshTokenHash =
    hashToken(refreshToken);

  // ----------------------------------------------------------
  // Save Refresh Token Hash
  // ----------------------------------------------------------

  session.refreshTokenHash =
    refreshTokenHash;

  await session.save();

  // ----------------------------------------------------------
  // Return Login Data
  // ----------------------------------------------------------

  return {
    customer: {
      id: customer._id,

      firstName:
        customer.firstName,

      lastName:
        customer.lastName,

      mobile:
        customer.mobile,

      email:
        customer.email,

      isMobileVerified:
        customer.isMobileVerified,
    },

    accessToken,

    refreshToken,
  };
};

// ============================================================
// FORGOT PASSWORD
// ============================================================

export const forgotPassword = async (data) => {
  const { mobile } = data;

  // Find customer
  const customer = await findCustomerByMobile(mobile);

  // Don't reveal whether the mobile exists
  if (!customer) {
    return {
      otpSent: true,
    };
  }

  // Generate OTP
  const otp = generateOTP();
  const otpExpiresAt = getOTPExpiry();

  // Save OTP
  await updateCustomer(customer._id, {
    otp,
    otpExpiresAt,
  });

  console.log(
    `PASSWORD RESET OTP for ${mobile}: ${otp}`
  );

  return {
    otpSent: true,
    mobile: customer.mobile,
  };
};

// ============================================================
// VERIFY RESET PASSWORD OTP
// ============================================================

export const verifyResetOTP = async (data) => {
  const mobile = String(data.mobile).trim();
  const otp = String(data.otp).trim();

  // ----------------------------------------------------------
  // Find customer
  // ----------------------------------------------------------

  const customer =
    await findCustomerByMobile(mobile);

  if (!customer) {
    throw new ApiError(
      404,
      "Customer not found"
    );
  }

  // ----------------------------------------------------------
  // Debug OTP information
  // ----------------------------------------------------------

  // console.log("=================================");
  // console.log("VERIFY RESET OTP");
  // console.log("Mobile:", mobile);
  // console.log("OTP received:", otp);
  // console.log("OTP stored:", customer.otp);
  // console.log(
  //   "OTP expiry:",
  //   customer.otpExpiresAt
  // );
  // console.log(
  //   "Current time:",
  //   new Date()
  // );
  // console.log("=================================");

  // ----------------------------------------------------------
  // Check OTP exists
  // ----------------------------------------------------------

  if (!customer.otp) {
    throw new ApiError(
      400,
      "OTP not found. Please request a new OTP"
    );
  }

  // ----------------------------------------------------------
  // Check OTP expiry
  // ----------------------------------------------------------

  if (
    !customer.otpExpiresAt ||
    new Date(customer.otpExpiresAt) < new Date()
  ) {
    throw new ApiError(
      400,
      "OTP has expired. Please request a new OTP"
    );
  }

  // ----------------------------------------------------------
  // Compare OTP
  // ----------------------------------------------------------

  if (
    String(customer.otp).trim() !== otp
  ) {
    throw new ApiError(
      400,
      "Invalid OTP"
    );
  }

  // ----------------------------------------------------------
  // OTP verified
  // ----------------------------------------------------------

  return {
    verified: true,
    mobile: customer.mobile,
  };
};

// ============================================================
// RESET PASSWORD
// ============================================================

export const resetPassword = async (data) => {
  const {
    mobile,
    otp,
    newPassword,
    confirmPassword,
  } = data;

  // ----------------------------------------------------------
  // Normalize values
  // ----------------------------------------------------------

  const normalizedMobile =
    String(mobile).trim();

  const normalizedOtp =
    String(otp).trim();

  // ----------------------------------------------------------
  // Check passwords
  // ----------------------------------------------------------

  if (newPassword !== confirmPassword) {
    throw new ApiError(
      400,
      "Passwords do not match"
    );
  }

  // ----------------------------------------------------------
  // Find customer
  // ----------------------------------------------------------

  const customer =
    await findCustomerByMobile(
      normalizedMobile
    );

  if (!customer) {
    throw new ApiError(
      404,
      "Customer not found"
    );
  }

  // ----------------------------------------------------------
  // Check OTP exists
  // ----------------------------------------------------------

  if (!customer.otp) {
    throw new ApiError(
      400,
      "OTP not found. Please request a new OTP"
    );
  }

  // ----------------------------------------------------------
  // Check OTP expiry
  // ----------------------------------------------------------

  if (
    !customer.otpExpiresAt ||
    new Date(customer.otpExpiresAt) <
      new Date()
  ) {
    throw new ApiError(
      400,
      "OTP has expired. Please request a new OTP"
    );
  }

  // ----------------------------------------------------------
  // Check OTP
  // ----------------------------------------------------------

  if (
    String(customer.otp).trim() !==
    normalizedOtp
  ) {
    throw new ApiError(
      400,
      "Invalid OTP"
    );
  }

  // ----------------------------------------------------------
  // Hash new password
  // ----------------------------------------------------------

  const hashedPassword =
    await bcrypt.hash(
      newPassword,
      12
    );

  // ----------------------------------------------------------
  // Update password
  // ----------------------------------------------------------

  await updateCustomer(
    customer._id,
    {
      password: hashedPassword,

      // Clear OTP after successful reset
      otp: null,
      otpExpiresAt: null,
    }
  );

  // ----------------------------------------------------------
  // Return success
  // ----------------------------------------------------------

  return {
    passwordReset: true,
  };
};