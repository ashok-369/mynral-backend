import express from "express";

import authMiddleware from "../../middlewares/auth.middleware.js";

import {
  getProfile,
  updateProfile,
  changePassword,
} from "./customer.controller.js";

import {
  updateProfileValidation,
} from "./customer.validation.js";

import validate from "../../middlewares/validation.middleware.js";

const router = express.Router();

// GET CUSTOMER PROFILE
router.get(
  "/profile",
  authMiddleware,
  getProfile
);

// UPDATE CUSTOMER PROFILE
router.put(
  "/profile",
  authMiddleware,
  updateProfileValidation,
  validate,
  updateProfile
);

// ============================================================
// CHANGE PASSWORD
// ============================================================

router.put(
  "/change-password",
  authMiddleware,
  changePassword
);

export default router;