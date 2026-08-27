import {
  createAdminUser,
  getAdminUsers,
  getAdminUserById,
  updateAdminUserStatus,
  deleteAdminUser,
} from "./adminUser.service.js";

// ============================================================
// CREATE ADMIN USER
// ============================================================

export const createAdminUserController = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: "Name, email and password are required",
        errors: [],
      });
    }

    const adminUser = await createAdminUser({
      name,
      email,
      password,
      role,
    });

    return res.status(201).json({
      success: true,
      statusCode: 201,
      message: "Admin user created successfully",
      data: adminUser,
    });
  } catch (error) {
    console.error("Create admin user error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      statusCode: error.statusCode || 500,
      message: error.message || "Failed to create admin user",
      errors: [],
    });
  }
};

// ============================================================
// GET ALL ADMIN USERS
// ============================================================

export const getAdminUsersController = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = "",
      status = "",
    } = req.query;

    const result = await getAdminUsers({
      page,
      limit,
      search,
      status,
    });

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Admin users fetched successfully",
      data: result,
    });
  } catch (error) {
    console.error("Get admin users error:", error);

    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: error.message || "Failed to fetch admin users",
      errors: [],
    });
  }
};

// ============================================================
// GET ADMIN USER BY ID
// ============================================================

export const getAdminUserByIdController = async (req, res) => {
  try {
    const { id } = req.params;

    const adminUser = await getAdminUserById(id);

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Admin user fetched successfully",
      data: adminUser,
    });
  } catch (error) {
    console.error("Get admin user error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      statusCode: error.statusCode || 500,
      message: error.message || "Failed to fetch admin user",
      errors: [],
    });
  }
};

// ============================================================
// UPDATE ADMIN USER STATUS
// ============================================================

export const updateAdminUserStatusController = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: "Status is required",
        errors: [],
      });
    }

    const adminUser = await updateAdminUserStatus(id, status);

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Admin user status updated successfully",
      data: adminUser,
    });
  } catch (error) {
    console.error("Update admin user status error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      statusCode: error.statusCode || 500,
      message: error.message || "Failed to update admin user status",
      errors: [],
    });
  }
};

// ============================================================
// DELETE ADMIN USER
// ============================================================

export const deleteAdminUserController = async (req, res) => {
  try {
    const { id } = req.params;

    await deleteAdminUser(id);

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Admin user deleted successfully",
      data: null,
    });
  } catch (error) {
    console.error("Delete admin user error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      statusCode: error.statusCode || 500,
      message: error.message || "Failed to delete admin user",
      errors: [],
    });
  }
};