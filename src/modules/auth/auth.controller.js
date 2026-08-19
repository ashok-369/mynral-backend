import * as authService from "./auth.service.js";
import {
  registerCustomer as registerCustomerService,
  verifyRegistrationOTP as verifyRegistrationOTPService,
  loginCustomer as loginCustomerService,
} from "./auth.service.js";

import asyncHandler from "../../utils/asyncHandler.js";
import successResponse from "../../utils/response.js";
import ApiError from "../../utils/ApiError.js";

import jwt from "jsonwebtoken";
import crypto from "crypto";

import {
  generateAccessToken,
} from "./auth.utils.js";

import {
  findCustomerById,
} from "./auth.repository.js";

import {
  findActiveSession,
  revokeSession,
} from "../sessions/session.repository.js";


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
// Register Customer
// ============================================================

export const registerCustomer =
  asyncHandler(async (req, res) => {
    const result =
      await registerCustomerService(
        req.body
      );

    return successResponse(res, {
      statusCode: 201,

      message:
        "Registration successful. OTP sent to your mobile number.",

      data: result,
    });
  });


// ============================================================
// Verify Registration OTP
// ============================================================

export const verifyRegistrationOTP =
  asyncHandler(async (req, res) => {
    const result =
      await verifyRegistrationOTPService(
        req.body
      );

    return successResponse(res, {
      statusCode: 200,

      message:
        "Mobile number verified successfully",

      data: result,
    });
  });


// ============================================================
// Customer Login
// ============================================================

export const loginCustomer =
  asyncHandler(async (req, res) => {
    const result =
      await loginCustomerService(
        req.body
      );

    // --------------------------------------------------------
    // Store refresh token in HTTP-only cookie
    // --------------------------------------------------------

    res.cookie(
      "mynral_refresh_token",
      result.refreshToken,
      {
        httpOnly: true,

        secure:
          process.env.NODE_ENV ===
          "production",

        sameSite:
          process.env.NODE_ENV ===
          "production"
            ? "none"
            : "lax",

        maxAge:
          30 *
          24 *
          60 *
          60 *
          1000,

        path: "/",
      }
    );

    // --------------------------------------------------------
    // Never send refresh token in response body
    // --------------------------------------------------------

    delete result.refreshToken;

    return successResponse(res, {
      statusCode: 200,

      message:
        "Login successful",

      data: result,
    });
  });


// ============================================================
// Refresh Access Token
// ============================================================

export const refreshAccessToken =
  asyncHandler(async (req, res) => {

    // --------------------------------------------------------
    // 1. Get refresh token from cookie
    // --------------------------------------------------------

    const refreshToken =
      req.cookies?.mynral_refresh_token;

    if (!refreshToken) {
      throw new ApiError(
        401,
        "Refresh token is required"
      );
    }


    // --------------------------------------------------------
    // 2. Verify refresh token
    // --------------------------------------------------------

    let decoded;

    try {
      decoded = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET
      );
    } catch (error) {
      throw new ApiError(
        401,
        "Invalid or expired refresh token"
      );
    }


    // --------------------------------------------------------
    // 3. Validate token type
    // --------------------------------------------------------

    if (
      decoded.type !== "customer"
    ) {
      throw new ApiError(
        401,
        "Invalid refresh token"
      );
    }


    // --------------------------------------------------------
    // 4. Validate session ID
    // --------------------------------------------------------

    if (!decoded.sessionId) {
      throw new ApiError(
        401,
        "Session information missing"
      );
    }


    // --------------------------------------------------------
    // 5. Find active session
    // --------------------------------------------------------

    const session =
      await findActiveSession(
        decoded.sessionId
      );

    if (!session) {
      throw new ApiError(
        401,
        "Session expired or revoked"
      );
    }


    // --------------------------------------------------------
    // 6. Check session expiry
    // --------------------------------------------------------

    if (
      session.expiresAt &&
      session.expiresAt < new Date()
    ) {
      throw new ApiError(
        401,
        "Session expired"
      );
    }


    // --------------------------------------------------------
    // 7. Hash incoming refresh token
    // --------------------------------------------------------

    const incomingTokenHash =
      hashToken(refreshToken);


    // --------------------------------------------------------
    // 8. Compare token hash
    // --------------------------------------------------------

    if (
      incomingTokenHash !==
      session.refreshTokenHash
    ) {
      throw new ApiError(
        401,
        "Invalid refresh token"
      );
    }


    // --------------------------------------------------------
    // 9. Find customer
    // --------------------------------------------------------

    const customer =
      await findCustomerById(
        decoded.id
      );

    if (!customer) {
      throw new ApiError(
        401,
        "Customer account not found"
      );
    }


    // --------------------------------------------------------
    // 10. Check customer account
    // --------------------------------------------------------

    if (!customer.isActive) {
      throw new ApiError(
        403,
        "Customer account is inactive"
      );
    }


    // --------------------------------------------------------
    // 11. Generate new access token
    // --------------------------------------------------------

    const accessToken =
      generateAccessToken(
        customer
      );


    // --------------------------------------------------------
    // 12. Return access token
    // --------------------------------------------------------

    return successResponse(res, {
      statusCode: 200,

      message:
        "Access token refreshed successfully",

      data: {
        accessToken,
      },
    });
  });


// ============================================================
// Customer Logout
// ============================================================

export const logoutCustomer =
  asyncHandler(async (req, res) => {

    // --------------------------------------------------------
    // 1. Get refresh token
    // --------------------------------------------------------

    const refreshToken =
      req.cookies?.mynral_refresh_token;


    // --------------------------------------------------------
    // 2. Revoke session
    // --------------------------------------------------------

    if (refreshToken) {
      try {
        const decoded =
          jwt.verify(
            refreshToken,
            process.env.JWT_REFRESH_SECRET
          );


        // ----------------------------------------------------
        // Revoke MongoDB session
        // ----------------------------------------------------

        if (decoded.sessionId) {
          await revokeSession(
            decoded.sessionId
          );
        }

      } catch (error) {
        // ----------------------------------------------------
        // Token may already be expired/invalid.
        // Logout should still continue.
        // ----------------------------------------------------
      }
    }


    // --------------------------------------------------------
    // 3. Clear refresh token cookie
    // --------------------------------------------------------

    res.clearCookie(
      "mynral_refresh_token",
      {
        httpOnly: true,

        secure:
          process.env.NODE_ENV ===
          "production",

        sameSite:
          process.env.NODE_ENV ===
          "production"
            ? "none"
            : "lax",

        path: "/",
      }
    );


    // --------------------------------------------------------
    // 4. Response
    // --------------------------------------------------------

    return successResponse(res, {
      statusCode: 200,

      message:
        "Logout successful",

      data: null,
    });
  });


  // ============================================================
// FORGOT PASSWORD
// ============================================================

export const forgotPassword = asyncHandler(
  async (req, res) => {
    const result = await authService.forgotPassword(
      req.body
    );

    return successResponse(res, {
      statusCode: 200,
      message:
        "If the mobile number is registered, an OTP has been sent.",
      data: result,
    });
  }
);


// ============================================================
// VERIFY PASSWORD RESET OTP
// ============================================================

export const verifyResetOTP =
  asyncHandler(async (req, res) => {
    const result =
      await authService.verifyResetOTP(
        req.body
      );

    return successResponse(res, {
      statusCode: 200,
      message:
        "Password reset OTP verified successfully",
      data: result,
    });
  });

  // ============================================================
// RESET PASSWORD
// ============================================================

export const resetPassword = asyncHandler(
  async (req, res) => {
    const result =
      await authService.resetPassword(req.body);

    return successResponse(res, {
      statusCode: 200,
      message: "Password reset successful",
      data: result,
    });
  }
);