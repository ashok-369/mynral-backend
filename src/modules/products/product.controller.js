import asyncHandler from "../../utils/asyncHandler.js";
import successResponse from "../../utils/response.js";

import {
  createNewProduct,
  getProduct,
  getProductBySlug,
  getProducts,
  updateExistingProduct,
  removeProduct,
} from "./product.service.js";

// ============================================================
// CREATE PRODUCT
// ============================================================

export const createProductController =
  asyncHandler(async (req, res) => {
    const product =
      await createNewProduct(
        req.body
      );

    return successResponse(res, {
      statusCode: 201,
      message:
        "Product created successfully",
      data: {
        product,
      },
    });
  });

// ============================================================
// GET PRODUCTS
// ============================================================

export const getProductsController =
  asyncHandler(async (req, res) => {
    const result =
      await getProducts(
        req.query
      );

    return successResponse(res, {
      statusCode: 200,
      message:
        "Products fetched successfully",
      data: result,
    });
  });

// ============================================================
// GET PRODUCT BY ID
// ============================================================

export const getProductController =
  asyncHandler(async (req, res) => {
    const product =
      await getProduct(
        req.params.id
      );

    return successResponse(res, {
      statusCode: 200,
      message:
        "Product fetched successfully",
      data: {
        product,
      },
    });
  });

// ============================================================
// GET PRODUCT BY SLUG
// ============================================================

export const getProductBySlugController =
  asyncHandler(async (req, res) => {
    const product =
      await getProductBySlug(
        req.params.slug
      );

    return successResponse(res, {
      statusCode: 200,
      message:
        "Product fetched successfully",
      data: {
        product,
      },
    });
  });

// ============================================================
// UPDATE PRODUCT
// ============================================================

export const updateProductController =
  asyncHandler(async (req, res) => {
    const product =
      await updateExistingProduct(
        req.params.id,
        req.body
      );

    return successResponse(res, {
      statusCode: 200,
      message:
        "Product updated successfully",
      data: {
        product,
      },
    });
  });

// ============================================================
// DELETE PRODUCT
// ============================================================

export const deleteProductController =
  asyncHandler(async (req, res) => {
    const result =
      await removeProduct(
        req.params.id
      );

    return successResponse(res, {
      statusCode: 200,
      message:
        "Product deleted successfully",
      data: result,
    });
  });

export const updateProductStockController =
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { stock } = req.body;

    const product =
      await updateProductStock(
        id,
        stock
      );

    return successResponse(res, {
      statusCode: 200,
      message:
        "Product stock updated successfully",
      data: {
        product,
      },
    });
  });