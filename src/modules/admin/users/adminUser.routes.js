import express from "express";

import {
  createAdminUserController,
  getAdminUsersController,
  getAdminUserByIdController,
  updateAdminUserStatusController,
  deleteAdminUserController,
} from "./adminUser.controller.js";

import adminAuthMiddleware from "../../../middlewares/adminAuth.middleware.js";

const router = express.Router();

// ============================================================
// ADMIN AUTHENTICATION
// ============================================================

router.use(adminAuthMiddleware);

// ============================================================
// ADMIN USERS
// ============================================================

// Create admin user
// POST /api/admin/users
router.post("/", createAdminUserController);

// Get all admin users
// GET /api/admin/users
router.get("/", getAdminUsersController);

// Get admin user by ID
// GET /api/admin/users/:id
router.get("/:id", getAdminUserByIdController);

// Update admin user status
// PATCH /api/admin/users/:id/status
router.patch(
  "/:id/status",
  updateAdminUserStatusController
);

// Delete admin user
// DELETE /api/admin/users/:id
router.delete(
  "/:id",
  deleteAdminUserController
);

export default router;