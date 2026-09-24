import express from "express";

import {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  activateProduct,
  deactivateProduct,
  createVariant,
  updateVariant,
  deleteVariant,
  updateVariantStock,
} from "./adminProduct.controller.js";

import adminAuthMiddleware from "../../../middlewares/adminAuth.middleware.js";

import {
  uploadProductImages,
} from "../../../middlewares/upload.middleware.js";

const router =
  express.Router();

// ============================================================
// CREATE PRODUCT
// POST /api/admin/products
// ============================================================

router.post(
  "/",
  adminAuthMiddleware,
  uploadProductImages,
  createProduct
);

// ============================================================
// GET ALL PRODUCTS
// GET /api/admin/products
// ============================================================

router.get(
  "/",
  adminAuthMiddleware,
  getProducts
);

// ============================================================
// CREATE VARIANT
// POST /api/admin/products/:productId/variants
// ============================================================

router.post(
  "/:productId/variants",
  adminAuthMiddleware,
  createVariant
);

// ============================================================
// UPDATE VARIANT
// PATCH /api/admin/products/variants/:variantId
// ============================================================

router.patch(
  "/variants/:variantId",
  adminAuthMiddleware,
  updateVariant
);

// ============================================================
// DELETE VARIANT
// DELETE /api/admin/products/variants/:variantId
// ============================================================

router.delete(
  "/variants/:variantId",
  adminAuthMiddleware,
  deleteVariant
);

// ============================================================
// UPDATE VARIANT STOCK
// PATCH /api/admin/products/variants/:variantId/stock
// ============================================================

router.patch(
  "/variants/:variantId/stock",
  adminAuthMiddleware,
  updateVariantStock
);

// ============================================================
// GET PRODUCT BY ID
// GET /api/admin/products/:productId
// ============================================================

router.get(
  "/:productId",
  adminAuthMiddleware,
  getProduct
);

// ============================================================
// UPDATE PRODUCT
// PATCH /api/admin/products/:productId
// ============================================================
//
// IMPORTANT:
// uploadProductImages is required here because PATCH
// now supports adding new product images.
//
// ============================================================

router.patch(
  "/:productId",
  adminAuthMiddleware,
  uploadProductImages,
  updateProduct
);

// ============================================================
// DELETE PRODUCT
// DELETE /api/admin/products/:productId
// ============================================================

router.delete(
  "/:productId",
  adminAuthMiddleware,
  deleteProduct
);

// ============================================================
// ACTIVATE PRODUCT
// PATCH /api/admin/products/:productId/activate
// ============================================================

router.patch(
  "/:productId/activate",
  adminAuthMiddleware,
  activateProduct
);

// ============================================================
// DEACTIVATE PRODUCT
// PATCH /api/admin/products/:productId/deactivate
// ============================================================

router.patch(
  "/:productId/deactivate",
  adminAuthMiddleware,
  deactivateProduct
);

export default router;