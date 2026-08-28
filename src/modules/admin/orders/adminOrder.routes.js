import express from "express";

import adminAuthMiddleware from "../../../middlewares/adminAuth.middleware.js";

import {
  getAllOrdersController,
  getAdminOrderController,
  updateOrderStatusController,
} from "./adminOrder.controller.js";

const router = express.Router();

// ============================================================
// ADMIN ORDER MANAGEMENT
// ============================================================

// Get all orders
router.get(
  "/",
  adminAuthMiddleware,
  getAllOrdersController
);

// Get single order
router.get(
  "/:orderId",
  adminAuthMiddleware,
  getAdminOrderController
);

router.patch(
  "/:orderId/status",
  adminAuthMiddleware,
  updateOrderStatusController
);

export default router;