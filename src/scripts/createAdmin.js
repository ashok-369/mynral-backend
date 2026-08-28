import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import bcrypt from "bcrypt";

import AdminUser from "../modules/admin/users/adminUser.model.js";

const createAdmin = async () => {
  try {
    // ============================================================
    // Connect MongoDB
    // ============================================================

    await mongoose.connect(
      process.env.MONGO_URI ||
        process.env.MONGODB_URI
    );

    console.log("MongoDB connected");

    // ============================================================
    // Admin credentials
    // ============================================================

    const name = "MYNRAL Admin";
    const email = "admin@mynralagro.com";
    const password = "Admin@12345";

    // ============================================================
    // Check if admin already exists
    // ============================================================

    const existingAdmin =
      await AdminUser.findOne({ email });

    if (existingAdmin) {
      console.log(
        `Admin already exists with email: ${email}`
      );

      await mongoose.connection.close();
      process.exit(0);
    }

    // ============================================================
    // Hash password
    // ============================================================

    const hashedPassword =
      await bcrypt.hash(password, 12);

    // ============================================================
    // Create admin
    // ============================================================

    const admin = await AdminUser.create({
      name,
      email,
      password: hashedPassword,
      role: "admin",
      status: "active",
    });

    console.log("");
    console.log(
      "=========================================="
    );
    console.log(
      "       ADMIN CREATED SUCCESSFULLY"
    );
    console.log(
      "=========================================="
    );

    console.log(`Name     : ${admin.name}`);
    console.log(`Email    : ${admin.email}`);
    console.log(`Password : ${password}`);
    console.log(`Role     : ${admin.role}`);
    console.log(`Status   : ${admin.status}`);

    console.log(
      "=========================================="
    );
    console.log("");

    await mongoose.connection.close();

    process.exit(0);
  } catch (error) {
    console.error(
      "Failed to create admin:"
    );

    console.error(error);

    await mongoose.connection.close();

    process.exit(1);
  }
};

createAdmin();