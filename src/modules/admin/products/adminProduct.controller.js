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

import {
  uploadMultipleToCloudinary,
  deleteMultipleFromCloudinary,
} from "../../../utils/cloudinary.util.js";

// ============================================================
// CREATE PRODUCT
// POST /api/admin/products
// ============================================================

export const createProduct = async (
  req,
  res,
  next
) => {
  let uploadedImages = [];

  try {
    // --------------------------------------------------------
    // UPLOAD IMAGES TO CLOUDINARY
    // --------------------------------------------------------

    if (
      req.files &&
      req.files.length > 0
    ) {
      uploadedImages =
        await uploadMultipleToCloudinary(
          req.files,
          {
            folder:
              "mynral/products",
          }
        );
    }

    // --------------------------------------------------------
    // PRODUCT DATA
    // --------------------------------------------------------

    const productData = {
      ...req.body,
      images: uploadedImages,
    };

    // --------------------------------------------------------
    // CREATE PRODUCT
    // --------------------------------------------------------

    const result =
      await createProductService(
        productData
      );

    // --------------------------------------------------------
    // RESPONSE
    // --------------------------------------------------------

    return res.status(201).json({
      success: true,
      statusCode: 201,
      message:
        "Product created successfully",
      data: result,
    });
  } catch (error) {
    // --------------------------------------------------------
    // CLEANUP CLOUDINARY IMAGES
    // IF DATABASE CREATION FAILS
    // --------------------------------------------------------

    if (
      uploadedImages &&
      uploadedImages.length > 0
    ) {
      try {
        const publicIds =
          uploadedImages
            .map(
              (image) =>
                image.publicId
            )
            .filter(Boolean);

        if (
          publicIds.length > 0
        ) {
          await deleteMultipleFromCloudinary(
            publicIds
          );
        }
      } catch (cleanupError) {
        console.error(
          "Cloudinary cleanup failed after product creation error:",
          cleanupError
        );
      }
    }

    next(error);
  }
};

// ============================================================
// GET ALL PRODUCTS
// GET /api/admin/products
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

    return res.status(200).json({
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
// GET /api/admin/products/:productId
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

    return res.status(200).json({
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
// PATCH /api/admin/products/:productId
// ============================================================
//
// Supports:
//
// - Product information update
// - Price update
// - Add new images
// - Remove existing images
//
// Form-data:
//
// images = new image files
//
// removeImagePublicIds = JSON array
//
// Example:
//
// [
//   "mynral/products/old-image-1",
//   "mynral/products/old-image-2"
// ]
//
// ============================================================

export const updateProduct = async (
  req,
  res,
  next
) => {
  let uploadedImages = [];

  try {
    // ========================================================
    // UPLOAD NEW IMAGES
    // ========================================================

    if (
      req.files &&
      req.files.length > 0
    ) {
      uploadedImages =
        await uploadMultipleToCloudinary(
          req.files,
          {
            folder:
              "mynral/products",
          }
        );
    }

    // ========================================================
    // PARSE REMOVE IMAGE PUBLIC IDS
    // ========================================================

    let removeImagePublicIds = [];

    if (
      req.body.removeImagePublicIds !==
      undefined
    ) {
      // ------------------------------------------------------
      // CASE 1:
      // Already an array
      // ------------------------------------------------------

      if (
        Array.isArray(
          req.body
            .removeImagePublicIds
        )
      ) {
        removeImagePublicIds =
          req.body.removeImagePublicIds;
      }

      // ------------------------------------------------------
      // CASE 2:
      // JSON string from multipart/form-data
      // ------------------------------------------------------

      else if (
        typeof req.body
          .removeImagePublicIds ===
        "string"
      ) {
        try {
          const parsed =
            JSON.parse(
              req.body
                .removeImagePublicIds
            );

          if (
            !Array.isArray(parsed)
          ) {
            throw new Error(
              "removeImagePublicIds must be an array"
            );
          }

          removeImagePublicIds =
            parsed;
        } catch (parseError) {
          throw new Error(
            "removeImagePublicIds must be a valid JSON array"
          );
        }
      }
    }

    // ========================================================
    // CLEAN PUBLIC IDS
    // ========================================================

    removeImagePublicIds =
      removeImagePublicIds
        .filter(
          (publicId) =>
            typeof publicId ===
              "string" &&
            publicId.trim()
        )
        .map(
          (publicId) =>
            publicId.trim()
        );

    // ========================================================
    // PREPARE PRODUCT DATA
    // ========================================================

    const productData = {
      ...req.body,

      // Newly uploaded Cloudinary images
      newImages: uploadedImages,

      // Existing images to remove
      removeImagePublicIds,
    };

    // --------------------------------------------------------
    // NEVER ALLOW RAW `images` FROM FORM DATA
    // --------------------------------------------------------

    delete productData.images;

    // ========================================================
    // UPDATE PRODUCT
    // ========================================================

    const updatedProduct =
      await updateProductService(
        req.params.productId,
        productData
      );

    // ========================================================
    // DELETE REMOVED IMAGES FROM CLOUDINARY
    // ========================================================
    //
    // Important:
    //
    // MongoDB has already been updated successfully.
    //
    // If Cloudinary deletion fails, we should NOT
    // roll back the MongoDB update.
    //
    // ========================================================

    if (
      removeImagePublicIds.length >
      0
    ) {
      try {
        await deleteMultipleFromCloudinary(
          removeImagePublicIds
        );
      } catch (cloudinaryError) {
        console.error(
          "Cloudinary image deletion failed during product update:",
          cloudinaryError
        );
      }
    }

    // ========================================================
    // RESPONSE
    // ========================================================

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message:
        "Product updated successfully",
      data: updatedProduct,
    });
  } catch (error) {
    // ========================================================
    // CLEANUP NEWLY UPLOADED IMAGES
    // ========================================================
    //
    // If MongoDB update fails after Cloudinary upload,
    // delete the newly uploaded images so we don't create
    // orphaned Cloudinary files.
    //
    // ========================================================

    if (
      uploadedImages &&
      uploadedImages.length > 0
    ) {
      try {
        const publicIds =
          uploadedImages
            .map(
              (image) =>
                image.publicId
            )
            .filter(Boolean);

        if (
          publicIds.length > 0
        ) {
          await deleteMultipleFromCloudinary(
            publicIds
          );
        }
      } catch (cleanupError) {
        console.error(
          "Cloudinary cleanup failed after product update error:",
          cleanupError
        );
      }
    }

    next(error);
  }
};

// ============================================================
// DELETE PRODUCT
// DELETE /api/admin/products/:productId
// ============================================================

export const deleteProduct = async (
  req,
  res,
  next
) => {
  try {
    // ========================================================
    // DELETE PRODUCT FROM DATABASE
    // ========================================================

    const result =
      await deleteProductService(
        req.params.productId
      );

    // ========================================================
    // DELETE PRODUCT IMAGES FROM CLOUDINARY
    // ========================================================

    if (
      result.imagePublicIds &&
      result.imagePublicIds.length >
        0
    ) {
      try {
        await deleteMultipleFromCloudinary(
          result.imagePublicIds
        );
      } catch (cloudinaryError) {
        // ----------------------------------------------------
        // Do not fail the product deletion because Cloudinary
        // cleanup failed.
        // ----------------------------------------------------

        console.error(
          "Cloudinary image deletion failed after product deletion:",
          cloudinaryError
        );
      }
    }

    // ========================================================
    // REMOVE INTERNAL CLOUDINARY IDS
    // FROM API RESPONSE
    // ========================================================

    const {
      imagePublicIds,
      ...responseData
    } = result;

    // ========================================================
    // RESPONSE
    // ========================================================

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message:
        "Product deleted successfully",
      data: responseData,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// ACTIVATE PRODUCT
// PATCH /api/admin/products/:productId/activate
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

    return res.status(200).json({
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
// PATCH /api/admin/products/:productId/deactivate
// ============================================================

export const deactivateProduct =
  async (
    req,
    res,
    next
  ) => {
    try {
      const product =
        await deactivateProductService(
          req.params.productId
        );

      return res.status(200).json({
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
// POST /api/admin/products/:productId/variants
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

    return res.status(201).json({
      success: true,
      statusCode: 201,
      message:
        "Variant created successfully",
      data: variant,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// UPDATE VARIANT
// PATCH /api/admin/products/variants/:variantId
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

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message:
        "Variant updated successfully",
      data: variant,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// DELETE VARIANT
// DELETE /api/admin/products/variants/:variantId
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

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message:
        "Variant deleted successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// UPDATE VARIANT STOCK
// PATCH /api/admin/products/variants/:variantId/stock
// ============================================================

export const updateVariantStock =
  async (
    req,
    res,
    next
  ) => {
    try {
      const { stock } =
        req.body;

      const variant =
        await updateVariantStockService(
          req.params.variantId,
          stock
        );

      return res.status(200).json({
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