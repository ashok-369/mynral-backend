import express from "express";

import adminAuthMiddleware from "../../../middlewares/adminAuth.middleware.js";

import {
  adminLoginController,
  getCurrentAdminController,
} from "./adminAuth.controller.js";

import {
  adminLoginValidation,
} from "./adminAuth.validation.js";

const router = express.Router();

// ============================================================
// ADMIN AUTHENTICATION
// ============================================================

// Admin login
router.post(
  "/login",
  adminLoginValidation,
  adminLoginController
);

// Current logged-in admin
router.get(
  "/me",
  adminAuthMiddleware,
  getCurrentAdminController
);

export default router;