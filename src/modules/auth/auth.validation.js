import { body } from "express-validator";

export const registerValidation = [
  body("firstName")
    .trim()
    .notEmpty()
    .withMessage("First name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage(
      "First name must be between 2 and 50 characters"
    ),

  body("lastName")
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage(
      "Last name cannot exceed 50 characters"
    ),

  body("mobile")
    .trim()
    .notEmpty()
    .withMessage("Mobile number is required")
    .matches(/^[6-9]\d{9}$/)
    .withMessage(
      "Enter a valid Indian mobile number"
    ),

  body("email")
    .optional()
    .trim()
    .isEmail()
    .withMessage(
      "Enter a valid email address"
    )
    .normalizeEmail(),

  body("password")
    .optional()
    .isLength({ min: 8 })
    .withMessage(
      "Password must be at least 8 characters"
    ),
];

export const verifyRegistrationOTPValidation = [
  body("mobile")
    .trim()
    .notEmpty()
    .withMessage("Mobile number is required")
    .matches(/^[6-9]\d{9}$/)
    .withMessage(
      "Enter a valid Indian mobile number"
    ),

  body("otp")
    .trim()
    .notEmpty()
    .withMessage("OTP is required")
    .matches(/^\d{6}$/)
    .withMessage(
      "OTP must be exactly 6 digits"
    ),
];

/*
|--------------------------------------------------------------------------
| Login Validation
|--------------------------------------------------------------------------
*/

export const loginValidation = [
  body("mobile")
    .trim()
    .notEmpty()
    .withMessage("Mobile number is required")
    .matches(/^[6-9]\d{9}$/)
    .withMessage(
      "Enter a valid Indian mobile number"
    ),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8 })
    .withMessage(
      "Password must be at least 8 characters"
    ),
];

export const verifyResetOTPValidation = [
  body("mobile")
    .trim()
    .notEmpty()
    .withMessage("Mobile number is required"),

  body("otp")
    .trim()
    .notEmpty()
    .withMessage("OTP is required")
    .isLength({ min: 6, max: 6 })
    .withMessage("OTP must be 6 digits")
    .isNumeric()
    .withMessage("OTP must contain only numbers"),
];