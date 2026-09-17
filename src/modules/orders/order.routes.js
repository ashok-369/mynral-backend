// import express from "express";

// import authMiddleware from "../../middlewares/auth.middleware.js";

// import {
//   createOrderController,
//   getMyOrdersController,
//   getOrderController,
//   cancelOrderController,
// } from "./order.controller.js";

// const router = express.Router();

// // ============================================================
// // CUSTOMER ORDER APIs
// // ============================================================

// // Create order
// router.post(
//   "/",
//   authMiddleware,
//   createOrderController
// );

// // Get logged-in customer's orders
// router.get(
//   "/",
//   authMiddleware,
//   getMyOrdersController
// );

// // Get single order
// router.get(
//   "/:id",
//   authMiddleware,
//   getOrderController
// );

// // Cancel order
// router.patch(
//   "/:id/cancel",
//   authMiddleware,
//   cancelOrderController
// );

// export default router;

import express from "express";

import {
  createOrderController,
  getMyOrdersController,
  getOrderController,
  cancelOrderController,
} from "./order.controller.js";

import authMiddleware from "../../middlewares/auth.middleware.js";

const router = express.Router();

// ============================================================
// CUSTOMER ORDERS
// ============================================================

// Create order
router.post(
  "/",
  authMiddleware,
  createOrderController
);

// Get my orders
router.get(
  "/",
  authMiddleware,
  getMyOrdersController
);

// Get single order
router.get(
  "/:id",
  authMiddleware,
  getOrderController
);

// Cancel order
router.patch(
  "/:id/cancel",
  authMiddleware,
  cancelOrderController
);

export default router;