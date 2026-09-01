
import express from "express";

import authMiddleware from "../../middlewares/auth.middleware.js";

import {
  getWishlistController,
  addToWishlistController,
  removeFromWishlistController,
  clearWishlistController,
} from "./wishlist.controller.js";

const router = express.Router();

// ============================================================
// CUSTOMER WISHLIST APIs
// ============================================================

// Get logged-in customer's wishlist
// GET /api/wishlist
router.get(
  "/",
  authMiddleware,
  getWishlistController
);

// Add product to wishlist
// POST /api/wishlist/:productId
router.post(
  "/:productId",
  authMiddleware,
  addToWishlistController
);

// Remove product from wishlist
// DELETE /api/wishlist/:productId
router.delete(
  "/:productId",
  authMiddleware,
  removeFromWishlistController
);

// Clear complete wishlist
// DELETE /api/wishlist
router.delete(
  "/",
  authMiddleware,
  clearWishlistController
);

export default router;
