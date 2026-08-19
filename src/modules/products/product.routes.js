import express from "express";

import authMiddleware from "../../middlewares/auth.middleware.js";

import {
  createProductController,
  getProductsController,
  getProductController,
  getProductBySlugController,
  updateProductController,
  deleteProductController,
  updateProductStockController,
} from "./product.controller.js";

const router = express.Router();

// ============================================================
// PUBLIC PRODUCT APIs
// ============================================================

// Get all products
router.get(
  "/",
  getProductsController
);

// Get product by slug
// Example: /api/products/slug/fresh-tomatoes
router.get(
  "/slug/:slug",
  getProductBySlugController
);

// Get product by ID
// Example: /api/products/65f123...
router.get(
  "/:id",
  getProductController
);

// ============================================================
// AUTHENTICATED PRODUCT APIs
// ============================================================

// Create product
router.post(
  "/",
  authMiddleware,
  createProductController
);

// Update product
router.put(
  "/:id",
  authMiddleware,
  updateProductController
);

// Update product stock
router.patch(
  "/:id/stock",
  authMiddleware,
  updateProductStockController
);

// Delete product
router.delete(
  "/:id",
  authMiddleware,
  deleteProductController
);

export default router;