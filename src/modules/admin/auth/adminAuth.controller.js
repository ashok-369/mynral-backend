import {
  loginAdmin,
  getCurrentAdmin,
} from "./adminAuth.service.js";

// ============================================================
// ADMIN LOGIN
// ============================================================

export const adminLoginController = async (
  req,
  res,
  next
) => {
  try {
    const {
      email,
      password,
    } = req.body;

    const result = await loginAdmin(
      email,
      password
    );

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Admin login successful",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// GET CURRENT ADMIN
// ============================================================

export const getCurrentAdminController =
  async (req, res, next) => {
    try {
      const adminId =
        req.admin?.id ||
        req.admin?._id;

      const admin =
        await getCurrentAdmin(adminId);

      return res.status(200).json({
        success: true,
        statusCode: 200,
        message:
          "Admin profile fetched successfully",
        data: {
          admin,
        },
      });
    } catch (error) {
      next(error);
    }
  };