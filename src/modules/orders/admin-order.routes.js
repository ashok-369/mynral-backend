import express from "express";

import adminAuthMiddleware from "../../middlewares/adminAuth.middleware.js";


import {
  getAllOrdersController,
  getAdminOrderController,
  updateOrderStatusController,
  cancelAdminOrderController,
} from "./admin-order.controller.js";

const router = express.Router();

// ============================================================
// ADMIN ORDER APIs
// ============================================================

router.use(
  adminAuthMiddleware
);

// ============================================================
// GET ALL ORDERS
// ============================================================

router.get(
  "/",
  getAllOrdersController
);

// ============================================================
// GET SINGLE ORDER
// ============================================================

router.get(
  "/:id",
  getAdminOrderController
);

// ============================================================
// UPDATE ORDER STATUS
// ============================================================

router.patch(
  "/:id/status",
  updateOrderStatusController
);

// ============================================================
// CANCEL ORDER
// ============================================================

router.patch(
  "/:id/cancel",
  cancelAdminOrderController
);

export default router;