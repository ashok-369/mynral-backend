import express from "express";

import {
  createVariant,
  getProductVariants,
  getVariant,
  updateVariant,
  deleteVariant,
  updateVariantStock,
} from "./product.controller.js";

const router = express.Router();

// ============================================================
// PRODUCT VARIANTS
// ============================================================

// Create variant for product
router.post(
  "/product/:productId",
  createVariant
);

// Get all variants of product
router.get(
  "/product/:productId",
  getProductVariants
);

// ============================================================
// SINGLE VARIANT
// ============================================================

router.get(
  "/:variantId",
  getVariant
);

router.patch(
  "/:variantId",
  updateVariant
);

router.delete(
  "/:variantId",
  deleteVariant
);

// ============================================================
// STOCK
// ============================================================

router.patch(
  "/:variantId/stock",
  updateVariantStock
);

export default router;