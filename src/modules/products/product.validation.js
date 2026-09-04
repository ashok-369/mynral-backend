import { body, param } from "express-validator";

export const createProductValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Product name is required"),

  body("category")
    .notEmpty()
    .withMessage("Category is required"),

  body("pricePerGram")
    .notEmpty()
    .withMessage("pricePerGram is required")
    .isFloat({ min: 0 })
    .withMessage(
      "pricePerGram must be a positive number"
    ),
];

export const updateProductValidation = [
  param("productId")
    .notEmpty()
    .withMessage("Product ID is required"),

  body("pricePerGram")
    .optional()
    .isFloat({ min: 0 })
    .withMessage(
      "pricePerGram must be a positive number"
    ),
];

export const createVariantValidation = [
  param("productId")
    .notEmpty()
    .withMessage("Product ID is required"),

  body("weight")
    .notEmpty()
    .withMessage("Weight is required")
    .isFloat({ min: 1 })
    .withMessage("Weight must be greater than 0"),

  body("weightUnit")
    .optional()
    .isIn(["g", "kg"])
    .withMessage(
      "weightUnit must be g or kg"
    ),

  body("stock")
    .optional()
    .isInt({ min: 0 })
    .withMessage(
      "Stock must be a positive number"
    ),

  body("discountPrice")
    .optional()
    .isFloat({ min: 0 })
    .withMessage(
      "discountPrice must be a positive number"
    ),
];

export const updateVariantValidation = [
  param("variantId")
    .notEmpty()
    .withMessage("Variant ID is required"),

  body("weight")
    .optional()
    .isFloat({ min: 1 })
    .withMessage("Weight must be greater than 0"),

  body("weightUnit")
    .optional()
    .isIn(["g", "kg"])
    .withMessage(
      "weightUnit must be g or kg"
    ),

  body("stock")
    .optional()
    .isInt({ min: 0 })
    .withMessage(
      "Stock must be a positive number"
    ),
];