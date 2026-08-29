import express from "express";

import adminAuthMiddleware from "../../../middlewares/adminAuth.middleware.js";

import {
  getAllOrdersController,
  getAdminOrderController,
  updateOrderStatusController,
  cancelAdminOrderController,
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

// Cancel order
router.patch(
  "/:orderId/cancel",
  adminAuthMiddleware,
  cancelAdminOrderController
);


export default router;