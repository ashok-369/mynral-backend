import express from "express";

import adminAuthMiddleware from "../../middlewares/adminAuth.middleware.js";
import authMiddleware from "../../middlewares/auth.middleware.js";

import {
  createCouponController,
  getAllCouponsController,
  getCouponController,
  updateCouponController,
  deleteCouponController,
  toggleCouponController,
  validateCouponController,
} from "./coupon.controller.js";

const router = express.Router();

// ============================================================
// ADMIN COUPON APIs
// ============================================================

// Create coupon
router.post(
  "/admin",
  adminAuthMiddleware,
  createCouponController
);

// Get all coupons
router.get(
  "/admin",
  adminAuthMiddleware,
  getAllCouponsController
);

// Get single coupon
router.get(
  "/admin/:couponId",
  adminAuthMiddleware,
  getCouponController
);

// Update coupon
router.patch(
  "/admin/:couponId",
  adminAuthMiddleware,
  updateCouponController
);

// Delete coupon
router.delete(
  "/admin/:couponId",
  adminAuthMiddleware,
  deleteCouponController
);

// Activate / deactivate coupon
router.patch(
  "/admin/:couponId/toggle",
  adminAuthMiddleware,
  toggleCouponController
);

// ============================================================
// CUSTOMER COUPON API
// ============================================================

// Validate / apply coupon
router.post(
  "/validate",
  authMiddleware,
  validateCouponController
);

export default router;