import express from "express";

import {
  registerCustomer,
  verifyRegistrationOTP,
  loginCustomer,
  refreshAccessToken,
  logoutCustomer,
  forgotPassword,
  verifyResetOTP,
  resetPassword,
} from "./auth.controller.js";

import {
  registerValidation,
  verifyRegistrationOTPValidation,
  loginValidation,
  verifyResetOTPValidation
} from "./auth.validation.js";

import validate from "../../middlewares/validation.middleware.js";

const router = express.Router();


// ============================================================
// REGISTER
// ============================================================

router.post(
  "/register",
  registerValidation,
  validate,
  registerCustomer
);


// ============================================================
// VERIFY REGISTRATION OTP
// ============================================================

router.post(
  "/verify-otp",
  verifyRegistrationOTPValidation,
  validate,
  verifyRegistrationOTP
);


// ============================================================
// LOGIN
// ============================================================

router.post(
  "/login",
  loginValidation,
  validate,
  loginCustomer
);


// ============================================================
// FORGOT PASSWORD
// ============================================================

router.post(
  "/forgot-password",
  forgotPassword
);


// ============================================================
// REFRESH TOKEN
// ============================================================

router.post(
  "/refresh",
  refreshAccessToken
);


// ============================================================
// LOGOUT
// ============================================================

router.post(
  "/logout",
  logoutCustomer
);

// ============================================================
// VERIFY PASSWORD RESET OTP
// ============================================================

router.post(
  "/verify-reset-otp",
  verifyResetOTPValidation,
  validate,
  verifyResetOTP
);


// ============================================================
// RESET PASSWORD
// ============================================================

router.post(
  "/reset-password",
  resetPassword
);

export default router;