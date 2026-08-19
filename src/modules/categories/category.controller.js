import asyncHandler from "../../utils/asyncHandler.js";
import successResponse from "../../utils/response.js";

import {
  createNewCategory,
  getCategories,
  getAllCategories,
  getCategory,
  updateExistingCategory,
  removeCategory,
} from "./category.service.js";

// ============================================================
// CREATE CATEGORY
// ============================================================

export const createCategoryController =
  asyncHandler(async (req, res) => {
    const category =
      await createNewCategory(
        req.body
      );

    return successResponse(res, {
      statusCode: 201,
      message:
        "Category created successfully",
      data: {
        category,
      },
    });
  });

// ============================================================
// GET ACTIVE CATEGORIES
// ============================================================

export const getCategoriesController =
  asyncHandler(async (req, res) => {
    const categories =
      await getCategories();

    return successResponse(res, {
      statusCode: 200,
      message:
        "Categories fetched successfully",
      data: {
        categories,
      },
    });
  });

// ============================================================
// GET ALL CATEGORIES
// ============================================================

export const getAllCategoriesController =
  asyncHandler(async (req, res) => {
    const categories =
      await getAllCategories();

    return successResponse(res, {
      statusCode: 200,
      message:
        "Categories fetched successfully",
      data: {
        categories,
      },
    });
  });

// ============================================================
// GET CATEGORY
// ============================================================

export const getCategoryController =
  asyncHandler(async (req, res) => {
    const category =
      await getCategory(
        req.params.id
      );

    return successResponse(res, {
      statusCode: 200,
      message:
        "Category fetched successfully",
      data: {
        category,
      },
    });
  });

// ============================================================
// UPDATE CATEGORY
// ============================================================

export const updateCategoryController =
  asyncHandler(async (req, res) => {
    const category =
      await updateExistingCategory(
        req.params.id,
        req.body
      );

    return successResponse(res, {
      statusCode: 200,
      message:
        "Category updated successfully",
      data: {
        category,
      },
    });
  });

// ============================================================
// DELETE CATEGORY
// ============================================================

export const deleteCategoryController =
  asyncHandler(async (req, res) => {
    const result =
      await removeCategory(
        req.params.id
      );

    return successResponse(res, {
      statusCode: 200,
      message:
        "Category deleted successfully",
      data: result,
    });
  });