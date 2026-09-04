import {
  createProduct as createProductService,
  getAllProducts,
  getProductById,
  updateProduct as updateProductService,
  deleteProduct as deleteProductService,
  activateProduct as activateProductService,
  deactivateProduct as deactivateProductService,
  createVariant as createVariantService,
  updateVariant as updateVariantService,
  deleteVariant as deleteVariantService,
  updateVariantStock as updateVariantStockService,
} from "./adminProduct.service.js";

// ============================================================
// CREATE PRODUCT
// ============================================================

export const createProduct = async (
  req,
  res,
  next
) => {
  try {
    const result =
      await createProductService(
        req.body
      );

    res.status(201).json({
      success: true,
      statusCode: 201,
      message:
        "Product created successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// GET ALL PRODUCTS
// ============================================================

export const getProducts = async (
  req,
  res,
  next
) => {
  try {
    const products =
      await getAllProducts(
        req.query
      );

    res.status(200).json({
      success: true,
      statusCode: 200,
      message:
        "Products fetched successfully",
      data: products,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// GET PRODUCT BY ID
// ============================================================

export const getProduct = async (
  req,
  res,
  next
) => {
  try {
    const product =
      await getProductById(
        req.params.productId
      );

    res.status(200).json({
      success: true,
      statusCode: 200,
      message:
        "Product fetched successfully",
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
      message:
        "Product updated successfully",
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
      message:
        "Product deleted successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// ACTIVATE PRODUCT
// ============================================================

export const activateProduct = async (
  req,
  res,
  next
) => {
  try {
    const product =
      await activateProductService(
        req.params.productId
      );

    res.status(200).json({
      success: true,
      statusCode: 200,
      message:
        "Product activated successfully",
      data: product,
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
      message:
        "Product deactivated successfully",
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
      message:
        "Product variant created successfully",
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
      message:
        "Product variant updated successfully",
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
      message:
        "Product variant deleted successfully",
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
      message:
        "Variant stock updated successfully",
      data: variant,
    });
  } catch (error) {
    next(error);
  }
};