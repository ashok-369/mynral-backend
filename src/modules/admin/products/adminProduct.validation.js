import { body, param } from "express-validator";

// ============================================================
// CREATE PRODUCT
// ============================================================

export const createProductValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage(
      "Product name is required"
    ),

  body("category")
    .notEmpty()
    .withMessage(
      "Category is required"
    ),

  body("pricePerGram")
    .notEmpty()
    .withMessage(
      "pricePerGram is required"
    )
    .isFloat({ min: 0 })
    .withMessage(
      "pricePerGram must be a valid positive number"
    ),

  body("sku")
    .optional()
    .trim(),

  body("isActive")
    .optional()
    .isBoolean()
    .withMessage(
      "isActive must be true or false"
    ),

  body("isFeatured")
    .optional()
    .isBoolean()
    .withMessage(
      "isFeatured must be true or false"
    ),
];

// ============================================================
// PRODUCT ID
// ============================================================

export const productIdValidation = [
  param("productId")
    .notEmpty()
    .withMessage(
      "Product ID is required"
    ),
];

// ============================================================
// UPDATE PRODUCT
// ============================================================

export const updateProductValidation = [
  param("productId")
    .notEmpty()
    .withMessage(
      "Product ID is required"
    ),

  body("pricePerGram")
    .optional()
    .isFloat({ min: 0 })
    .withMessage(
      "pricePerGram must be a valid positive number"
    ),

  body("isActive")
    .optional()
    .isBoolean()
    .withMessage(
      "isActive must be true or false"
    ),

  body("isFeatured")
    .optional()
    .isBoolean()
    .withMessage(
      "isFeatured must be true or false"
    ),
];

// ============================================================
// CREATE VARIANT
// ============================================================

export const createVariantValidation = [
  param("productId")
    .notEmpty()
    .withMessage(
      "Product ID is required"
    ),

  body("weight")
    .notEmpty()
    .withMessage(
      "Weight is required"
    )
    .isFloat({ min: 0.01 })
    .withMessage(
      "Weight must be greater than 0"
    ),

  body("weightUnit")
    .optional()
    .isIn(["g", "kg"])
    .withMessage(
      "weightUnit must be g or kg"
    ),

  body("discountPrice")
    .optional({ nullable: true })
    .isFloat({ min: 0 })
    .withMessage(
      "discountPrice must be a valid number"
    ),

  body("stock")
    .optional()
    .isInt({ min: 0 })
    .withMessage(
      "Stock cannot be negative"
    ),

  body("isActive")
    .optional()
    .isBoolean()
    .withMessage(
      "isActive must be true or false"
    ),
];

// ============================================================
// UPDATE VARIANT
// ============================================================

export const updateVariantValidation = [
  param("variantId")
    .notEmpty()
    .withMessage(
      "Variant ID is required"
    ),

  body("weight")
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage(
      "Weight must be greater than 0"
    ),

  body("weightUnit")
    .optional()
    .isIn(["g", "kg"])
    .withMessage(
      "weightUnit must be g or kg"
    ),

  body("discountPrice")
    .optional({ nullable: true })
    .isFloat({ min: 0 })
    .withMessage(
      "discountPrice must be a valid number"
    ),

  body("stock")
    .optional()
    .isInt({ min: 0 })
    .withMessage(
      "Stock cannot be negative"
    ),

  body("isActive")
    .optional()
    .isBoolean()
    .withMessage(
      "isActive must be true or false"
    ),
];

// ============================================================
// STOCK
// ============================================================

export const updateVariantStockValidation = [
  param("variantId")
    .notEmpty()
    .withMessage(
      "Variant ID is required"
    ),

  body("stock")
    .notEmpty()
    .withMessage(
      "Stock is required"
    )
    .isInt({ min: 0 })
    .withMessage(
      "Stock cannot be negative"
    ),
];