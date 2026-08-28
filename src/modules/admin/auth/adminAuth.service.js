import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

import AdminUser from "../users/adminUser.model.js";
import ApiError from "../../../utils/ApiError.js";

// ============================================================
// Generate Admin Token
// ============================================================

const generateAdminToken = (admin) => {
  if (!process.env.JWT_SECRET) {
    throw new ApiError(
      500,
      "JWT_SECRET is not configured"
    );
  }

  return jwt.sign(
    {
      id: admin._id.toString(),
      type: "admin",
    },
    process.env.JWT_SECRET,
    {
      expiresIn:
        process.env.JWT_EXPIRES_IN || "1d",
    }
  );
};

// ============================================================
// Admin Login
// ============================================================

export const loginAdmin = async (
  email,
  password
) => {
  // ==========================================================
  // Find Admin
  // ==========================================================

  const admin = await AdminUser.findOne({
    email: email.toLowerCase().trim(),
  }).select("+password");

  if (!admin) {
    throw new ApiError(
      401,
      "Invalid email or password"
    );
  }

  // ==========================================================
  // Check Admin Status
  // ==========================================================

  if (admin.status !== "active") {
    throw new ApiError(
      403,
      `Admin account is ${admin.status}`
    );
  }

  // ==========================================================
  // Check Password
  // ==========================================================

  const isPasswordValid =
    await bcrypt.compare(
      password,
      admin.password
    );

  if (!isPasswordValid) {
    throw new ApiError(
      401,
      "Invalid email or password"
    );
  }

  // ==========================================================
  // Update Last Login
  // ==========================================================

  admin.lastLoginAt = new Date();

  await admin.save();

  // ==========================================================
  // Generate Token
  // ==========================================================

  const accessToken =
    generateAdminToken(admin);

  // ==========================================================
  // Remove Password
  // ==========================================================

  const adminResponse =
    admin.toObject();

  delete adminResponse.password;

  // ==========================================================
  // Return
  // ==========================================================

  return {
    admin: adminResponse,
    accessToken,
  };
};

// ============================================================
// Get Current Admin
// ============================================================

export const getCurrentAdmin = async (
  adminId
) => {
  const admin =
    await AdminUser.findById(adminId)
      .select("-password");

  if (!admin) {
    throw new ApiError(
      404,
      "Admin user not found"
    );
  }

  return admin;
};