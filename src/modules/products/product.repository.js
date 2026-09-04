// import Product from "./product.model.js";

// // ============================================================
// // CREATE PRODUCT
// // ============================================================

// export const createProduct = async (data) => {
//   return Product.create(data);
// };

// // ============================================================
// // FIND PRODUCT BY ID
// // ============================================================

// export const findProductById = async (productId) => {
//   return Product.findById(productId)
//     .populate(
//       "category",
//       "name slug image"
//     );
// };

// // ============================================================
// // FIND PRODUCT BY SLUG
// // ============================================================

// export const findProductBySlug = async (slug) => {
//   return Product.findOne({
//     slug,
//   }).populate(
//     "category",
//     "name slug image"
//   );
// };

// // ============================================================
// // FIND PRODUCT BY SKU
// // ============================================================

// export const findProductBySku = async (sku) => {
//   return Product.findOne({
//     sku: sku.toUpperCase(),
//   });
// };

// // ============================================================
// // FIND PRODUCT BY NAME
// // ============================================================

// export const findProductByName = async (name) => {
//   return Product.findOne({
//     name: {
//       $regex: `^${name}$`,
//       $options: "i",
//     },
//   });
// };

// // ============================================================
// // GET ALL PRODUCTS
// // ============================================================

// export const findProducts = async ({
//   filter = {},
//   skip = 0,
//   limit = 20,
//   sort = {
//     createdAt: -1,
//   },
// }) => {
//   return Product.find(filter)
//     .populate(
//       "category",
//       "name slug image"
//     )
//     .sort(sort)
//     .skip(skip)
//     .limit(limit);
// };

// // ============================================================
// // COUNT PRODUCTS
// // ============================================================

// export const countProducts = async (
//   filter = {}
// ) => {
//   return Product.countDocuments(filter);
// };

// // ============================================================
// // UPDATE PRODUCT
// // ============================================================

// export const updateProduct = async (
//   productId,
//   updateData
// ) => {
//   return Product.findByIdAndUpdate(
//     productId,
//     updateData,
//     {
//       new: true,
//       runValidators: true,
//     }
//   ).populate(
//     "category",
//     "name slug image"
//   );
// };

// // ============================================================
// // DELETE PRODUCT
// // ============================================================

// export const deleteProduct = async (
//   productId
// ) => {
//   return Product.findByIdAndDelete(
//     productId
//   );
// };

import Product from "./product.model.js";
import Variant from "./variant.model.js";

// ============================================================
// PRODUCT
// ============================================================

export const createProduct = async (data) => {
  return Product.create(data);
};

export const findProductById = async (productId) => {
  return Product.findById(productId)
    .populate("category", "name slug image");
};

export const findProductBySlug = async (slug) => {
  return Product.findOne({ slug })
    .populate("category", "name slug image");
};

export const findAllProducts = async (filter = {}) => {
  return Product.find(filter)
    .populate("category", "name slug image")
    .sort({ createdAt: -1 });
};

export const updateProduct = async (productId, data) => {
  return Product.findByIdAndUpdate(
    productId,
    data,
    {
      new: true,
      runValidators: true,
    }
  ).populate("category", "name slug image");
};

export const deleteProduct = async (productId) => {
  return Product.findByIdAndDelete(productId);
};

// ============================================================
// VARIANTS
// ============================================================

export const createVariant = async (data) => {
  return Variant.create(data);
};

export const findVariantById = async (variantId) => {
  return Variant.findById(variantId)
    .populate("product", "name slug pricePerGram");
};

export const findVariantsByProduct = async (productId) => {
  return Variant.find({
    product: productId,
  }).sort({
    weight: 1,
  });
};

export const updateVariant = async (variantId, data) => {
  return Variant.findByIdAndUpdate(
    variantId,
    data,
    {
      new: true,
      runValidators: true,
    }
  );
};

export const deleteVariant = async (variantId) => {
  return Variant.findByIdAndDelete(variantId);
};

export const deleteVariantsByProduct = async (productId) => {
  return Variant.deleteMany({
    product: productId,
  });
};