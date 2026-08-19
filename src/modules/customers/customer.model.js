import mongoose from "mongoose";

const customerSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
    },

    lastName: {
      type: String,
      trim: true,
      maxlength: 50,
      default: "",
    },

    mobile: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },

    email: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      select: false,
    },

    // ========================================================
    // MOBILE VERIFICATION
    // ========================================================

    isMobileVerified: {
      type: Boolean,
      default: false,
    },

    // ========================================================
    // EMAIL VERIFICATION
    // ========================================================

    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    // ========================================================
    // OTP
    // Used for registration and password reset
    // ========================================================

    otp: {
      type: String,
      default: null,
    },

    otpExpiresAt: {
      type: Date,
      default: null,
    },

    // ========================================================
    // ACCOUNT STATUS
    // ========================================================

    isActive: {
      type: Boolean,
      default: true,
    },

    lastLoginAt: {
      type: Date,
      default: null,
    },

    profileImage: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Customer =
  mongoose.model(
    "Customer",
    customerSchema
  );

export default Customer;