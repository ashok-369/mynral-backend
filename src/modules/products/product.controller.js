// import asyncHandler from "../../utils/asyncHandler.js";
// import successResponse from "../../utils/response.js";

// import {
//   createNewProduct,
//   getProduct,
//   getProductBySlug,
//   getProducts,
//   updateExistingProduct,
//   removeProduct,
// } from "./product.service.js";

// // ============================================================
// // CREATE PRODUCT
// // ============================================================

// export const createProductController =
//   asyncHandler(async (req, res) => {
//     const product =
//       await createNewProduct(
//         req.body
//       );

//     return successResponse(res, {
//       statusCode: 201,
//       message:
//         "Product created successfully",
//       data: {
//         product,
//       },
//     });
//   });

// // ============================================================
// // GET PRODUCTS
// // ============================================================

// export const getProductsController =
//   asyncHandler(async (req, res) => {
//     const result =
//       await getProducts(
//         req.query
//       );

//     return successResponse(res, {
//       statusCode: 200,
//       message:
//         "Products fetched successfully",
//       data: result,
//     });
//   });

// // ============================================================
// // GET PRODUCT BY ID
// // ============================================================

// export const getProductController =
//   asyncHandler(async (req, res) => {
//     const product =
//       await getProduct(
//         req.params.id
//       );

//     return successResponse(res, {
//       statusCode: 200,
//       message:
//         "Product fetched successfully",
//       data: {
//         product,
//       },
//     });
//   });

// // ============================================================
// // GET PRODUCT BY SLUG
// // ============================================================

// export const getProductBySlugController =
//   asyncHandler(async (req, res) => {
//     const product =
//       await getProductBySlug(
//         req.params.slug
//       );

//     return successResponse(res, {
//       statusCode: 200,
//       message:
//         "Product fetched successfully",
//       data: {
//         product,
//       },
//     });
//   });

// // ============================================================
// // UPDATE PRODUCT
// // ============================================================

// export const updateProductController =
//   asyncHandler(async (req, res) => {
//     const product =
//       await updateExistingProduct(
//         req.params.id,
//         req.body
//       );

//     return successResponse(res, {
//       statusCode: 200,
//       message:
//         "Product updated successfully",
//       data: {
//         product,
//       },
//     });
//   });

// // ============================================================
// // DELETE PRODUCT
// // ============================================================

// export const deleteProductController =
//   asyncHandler(async (req, res) => {
//     const result =
//       await removeProduct(
//         req.params.id
//       );

//     return successResponse(res, {
//       statusCode: 200,
//       message:
//         "Product deleted successfully",
//       data: result,
//     });
//   });

// export const updateProductStockController =
//   asyncHandler(async (req, res) => {
//     const { id } = req.params;
//     const { stock } = req.body;

//     const product =
//       await updateProductStock(
//         id,
//         stock
//       );

//     return successResponse(res, {
//       statusCode: 200,
//       message:
//         "Product stock updated successfully",
//       data: {
//         product,
//       },
//     });
//   });

import {
  createProductService,
  getAllProductsService,
  getProductByIdService,
  getProductBySlugService,
  updateProductService,
  deleteProductService,
  deactivateProductService,
  createVariantService,
  getProductVariantsService,
  getVariantByIdService,
  updateVariantService,
  deleteVariantService,
  updateVariantStockService,
} from "./product.service.js";

// ============================================================
// CREATE PRODUCT
// ============================================================

export const createProduct = async (req, res, next) => {
  try {
    const product = await createProductService(req.body);

    res.status(201).json({
      success: true,
      statusCode: 201,
      message: "Product created successfully",
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// GET ALL PRODUCTS
// ============================================================

export const getProducts = async (req, res, next) => {
  try {
    const products = await getAllProductsService(
      req.query
    );

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Products fetched successfully",
      data: products,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// GET PRODUCT BY ID
// ============================================================

export const getProduct = async (req, res, next) => {
  try {
    const product = await getProductByIdService(
      req.params.productId
    );

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Product fetched successfully",
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// GET PRODUCT BY SLUG
// ============================================================

export const getProductBySlug = async (
  req,
  res,
  next
) => {
  try {
    const product =
      await getProductBySlugService(
        req.params.slug
      );

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Product fetched successfully",
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// UPDATE PRODUCT
// ============================================================

export const updateProduct = async (
  req,
  res,
  next
) => {
  try {
    const product =
      await updateProductService(
        req.params.productId,
        req.body
      );

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Product updated successfully",
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// DELETE PRODUCT
// ============================================================

export const deleteProduct = async (
  req,
  res,
  next
) => {
  try {
    const result =
      await deleteProductService(
        req.params.productId
      );

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Product deleted successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// DEACTIVATE PRODUCT
// ============================================================

export const deactivateProduct = async (
  req,
  res,
  next
) => {
  try {
    const product =
      await deactivateProductService(
        req.params.productId
      );

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Product deactivated successfully",
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// CREATE VARIANT
// ============================================================

export const createVariant = async (
  req,
  res,
  next
) => {
  try {
    const variant =
      await createVariantService(
        req.params.productId,
        req.body
      );

    res.status(201).json({
      success: true,
      statusCode: 201,
      message: "Variant created successfully",
      data: variant,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// GET PRODUCT VARIANTS
// ============================================================

export const getProductVariants = async (
  req,
  res,
  next
) => {
  try {
    const variants =
      await getProductVariantsService(
        req.params.productId
      );

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Variants fetched successfully",
      data: variants,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// GET VARIANT
// ============================================================

export const getVariant = async (
  req,
  res,
  next
) => {
  try {
    const variant =
      await getVariantByIdService(
        req.params.variantId
      );

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Variant fetched successfully",
      data: variant,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// UPDATE VARIANT
// ============================================================

export const updateVariant = async (
  req,
  res,
  next
) => {
  try {
    const variant =
      await updateVariantService(
        req.params.variantId,
        req.body
      );

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Variant updated successfully",
      data: variant,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// DELETE VARIANT
// ============================================================

export const deleteVariant = async (
  req,
  res,
  next
) => {
  try {
    const result =
      await deleteVariantService(
        req.params.variantId
      );

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Variant deleted successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// UPDATE STOCK
// ============================================================

export const updateVariantStock = async (
  req,
  res,
  next
) => {
  try {
    const variant =
      await updateVariantStockService(
        req.params.variantId,
        req.body.stock
      );

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Variant stock updated successfully",
      data: variant,
    });
  } catch (error) {
    next(error);
  }
};