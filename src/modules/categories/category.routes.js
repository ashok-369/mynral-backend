import express from "express";

import {
  createCategoryController,
  getCategoriesController,
  getAllCategoriesController,
  getCategoryController,
  updateCategoryController,
  deleteCategoryController,
} from "./category.controller.js";

const router = express.Router();

// ============================================================
// PUBLIC
// ============================================================

// Get active categories
router.get(
  "/",
  getCategoriesController
);

// Get single category
router.get(
  "/:id",
  getCategoryController
);

// ============================================================
// ADMIN
// ============================================================

// Create category
router.post(
  "/",
  createCategoryController
);

// Get all categories
router.get(
  "/admin/all",
  getAllCategoriesController
);

// Update category
router.put(
  "/:id",
  updateCategoryController
);

// Delete category
router.delete(
  "/:id",
  deleteCategoryController
);

export default router;