import mongoose from "mongoose";

const adminUserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      select: false,
    },

    role: {
      type: String,
      enum: ["admin", "super_admin"],
      default: "admin",
    },

    status: {
      type: String,
      enum: ["active", "inactive", "blocked"],
      default: "active",
    },

    lastLoginAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const AdminUser = mongoose.model("AdminUser", adminUserSchema);

export default AdminUser;