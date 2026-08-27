import bcrypt from "bcrypt";
import AdminUser from "./adminUser.model.js";

// ============================================================
// CREATE ADMIN USER
// ============================================================

export const createAdminUser = async ({
  name,
  email,
  password,
  role = "admin",
}) => {
  const normalizedEmail = email.toLowerCase().trim();

  // Check if email already exists
  const existingAdmin = await AdminUser.findOne({
    email: normalizedEmail,
  });

  if (existingAdmin) {
    const error = new Error("Admin email is already registered");
    error.statusCode = 409;
    throw error;
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 12);

  const adminUser = await AdminUser.create({
    name: name.trim(),
    email: normalizedEmail,
    password: hashedPassword,
    role,
    status: "active",
  });

  // Don't return password
  const result = adminUser.toObject();
  delete result.password;

  return result;
};

// ============================================================
// GET ALL ADMIN USERS
// ============================================================

export const getAdminUsers = async ({
  page = 1,
  limit = 20,
  search = "",
  status = "",
} = {}) => {
  page = Math.max(Number(page) || 1, 1);
  limit = Math.min(Math.max(Number(limit) || 20, 1), 100);

  const skip = (page - 1) * limit;

  const query = {};

  // Search by name/email
  if (search.trim()) {
    query.$or = [
      {
        name: {
          $regex: search.trim(),
          $options: "i",
        },
      },
      {
        email: {
          $regex: search.trim(),
          $options: "i",
        },
      },
    ];
  }

  // Filter by status
  if (status) {
    query.status = status;
  }

  const [adminUsers, total] = await Promise.all([
    AdminUser.find(query)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),

    AdminUser.countDocuments(query),
  ]);

  return {
    adminUsers,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// ============================================================
// GET ADMIN USER BY ID
// ============================================================

export const getAdminUserById = async (id) => {
  const adminUser = await AdminUser.findById(id)
    .select("-password")
    .lean();

  if (!adminUser) {
    const error = new Error("Admin user not found");
    error.statusCode = 404;
    throw error;
  }

  return adminUser;
};

// ============================================================
// UPDATE ADMIN USER STATUS
// ============================================================

export const updateAdminUserStatus = async (id, status) => {
  const allowedStatuses = [
    "active",
    "inactive",
    "blocked",
  ];

  if (!allowedStatuses.includes(status)) {
    const error = new Error(
      "Invalid status. Allowed values: active, inactive, blocked"
    );

    error.statusCode = 400;
    throw error;
  }

  const adminUser = await AdminUser.findByIdAndUpdate(
    id,
    {
      status,
    },
    {
      new: true,
      runValidators: true,
    }
  )
    .select("-password")
    .lean();

  if (!adminUser) {
    const error = new Error("Admin user not found");
    error.statusCode = 404;
    throw error;
  }

  return adminUser;
};

// ============================================================
// DELETE ADMIN USER
// ============================================================

export const deleteAdminUser = async (id) => {
  const adminUser = await AdminUser.findByIdAndDelete(id);

  if (!adminUser) {
    const error = new Error("Admin user not found");
    error.statusCode = 404;
    throw error;
  }

  return true;
};