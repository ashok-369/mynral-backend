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

const router = express.Router();

// ============================================================
// PRODUCT ROUTES
// ============================================================

router.post("/", adminAuthMiddleware, createProduct);

router.get("/", adminAuthMiddleware, getProducts);

// ============================================================
// VARIANT ROUTES
// IMPORTANT: Keep these before product :productId routes
// ============================================================

router.post(
  "/:productId/variants",
  adminAuthMiddleware,
  createVariant
);

router.patch(
  "/variants/:variantId",
  adminAuthMiddleware,
  updateVariant
);

router.delete(
  "/variants/:variantId",
  adminAuthMiddleware,
  deleteVariant
);

router.patch(
  "/variants/:variantId/stock",
  adminAuthMiddleware,
  updateVariantStock
);

// ============================================================
// PRODUCT ID ROUTES
// ============================================================

router.get(
  "/:productId",
  adminAuthMiddleware,
  getProduct
);

router.patch(
  "/:productId",
  adminAuthMiddleware,
  updateProduct
);

router.delete(
  "/:productId",
  adminAuthMiddleware,
  deleteProduct
);

router.patch(
  "/:productId/activate",
  adminAuthMiddleware,
  activateProduct
);

router.patch(
  "/:productId/deactivate",
  adminAuthMiddleware,
  deactivateProduct
);

export default router;