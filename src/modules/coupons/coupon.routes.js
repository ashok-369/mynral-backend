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
  getActiveCouponsController,
} from "./coupon.controller.js";

const router = express.Router();

// ============================================================
// CUSTOMER COUPON APIs
// ============================================================

// Get active and currently valid coupons
router.get(
  "/",
  authMiddleware,
  getActiveCouponsController
);

// Validate / apply coupon
router.post(
  "/validate",
  authMiddleware,
  validateCouponController
);

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

export default router;