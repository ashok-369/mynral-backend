import express from "express";

import authMiddleware from "../../middlewares/auth.middleware.js";

import {
  getCartController,
  addToCartController,
  updateCartItemController,
  removeCartItemController,
  clearCartController,
} from "./cart.controller.js";

const router = express.Router();

// ============================================================
// CUSTOMER CART APIs
// ============================================================

// Get current customer's cart
router.get(
  "/",
  authMiddleware,
  getCartController
);

// Add product to cart
router.post(
  "/items",
  authMiddleware,
  addToCartController
);

// Update product quantity
router.put(
  "/items/:productId",
  authMiddleware,
  updateCartItemController
);

// Remove product from cart
router.delete(
  "/items/:productId",
  authMiddleware,
  removeCartItemController
);

// Clear entire cart
router.delete(
  "/",
  authMiddleware,
  clearCartController
);

export default router;