import express from "express";

import authMiddleware from "../../middlewares/auth.middleware.js";

import {
  createRazorpayOrderController,
  verifyRazorpayPaymentController,
  getPaymentController,
} from "./payment.controller.js";

const router =
  express.Router();

// ============================================================
// CREATE RAZORPAY ORDER
// ============================================================

router.post(
  "/create-order",
  authMiddleware,
  createRazorpayOrderController
);

// ============================================================
// VERIFY RAZORPAY PAYMENT
// ============================================================

router.post(
  "/verify",
  authMiddleware,
  verifyRazorpayPaymentController
);

// ============================================================
// GET PAYMENT BY ORDER
// ============================================================

router.get(
  "/:orderId",
  authMiddleware,
  getPaymentController
);

export default router;