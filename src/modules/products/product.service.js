// import ApiError from "../../utils/ApiError.js";

// import {
//   createProduct,
//   findProductById,
//   findProductBySlug,
//   findProductBySku,
//   findProductByName,
//   findProducts,
//   countProducts,
//   updateProduct,
//   deleteProduct,
// } from "./product.repository.js";

// import Category from "../categories/category.model.js";

// // ============================================================
// // CREATE PRODUCT
// // ============================================================

// export const createNewProduct = async (
//   data
// ) => {
//   const {
//     name,
//     slug,
//     description,
//     category,
//     images,
//     price,
//     discountPrice,
//     stock,
//     sku,
//     unit,
//     isActive,
//     isFeatured,
//   } = data;

//   // ----------------------------------------------------------
//   // Required fields
//   // ----------------------------------------------------------

//   if (!name) {
//     throw new ApiError(
//       400,
//       "Product name is required"
//     );
//   }

//   if (!category) {
//     throw new ApiError(
//       400,
//       "Product category is required"
//     );
//   }

//   if (price === undefined) {
//     throw new ApiError(
//       400,
//       "Product price is required"
//     );
//   }

//   if (!sku) {
//     throw new ApiError(
//       400,
//       "Product SKU is required"
//     );
//   }

//   // ----------------------------------------------------------
//   // Check category
//   // ----------------------------------------------------------

//   const existingCategory =
//     await Category.findById(category);

//   if (!existingCategory) {
//     throw new ApiError(
//       404,
//       "Category not found"
//     );
//   }

//   if (!existingCategory.isActive) {
//     throw new ApiError(
//       400,
//       "Selected category is inactive"
//     );
//   }

//   // ----------------------------------------------------------
//   // Check duplicate name
//   // ----------------------------------------------------------

//   const existingName =
//     await findProductByName(name);

//   if (existingName) {
//     throw new ApiError(
//       409,
//       "Product with this name already exists"
//     );
//   }

//   // ----------------------------------------------------------
//   // Check SKU
//   // ----------------------------------------------------------

//   const existingSku =
//     await findProductBySku(sku);

//   if (existingSku) {
//     throw new ApiError(
//       409,
//       "Product SKU already exists"
//     );
//   }

//   // ----------------------------------------------------------
//   // Generate slug
//   // ----------------------------------------------------------

//   const productSlug =
//     slug ||
//     name
//       .toLowerCase()
//       .trim()
//       .replace(/[^a-z0-9]+/g, "-")
//       .replace(/(^-|-$)/g, "");

//   const existingSlug =
//     await findProductBySlug(
//       productSlug
//     );

//   if (existingSlug) {
//     throw new ApiError(
//       409,
//       "Product slug already exists"
//     );
//   }

//   // ----------------------------------------------------------
//   // Validate discount price
//   // ----------------------------------------------------------

//   if (
//     discountPrice !== undefined &&
//     discountPrice !== null &&
//     discountPrice >= price
//   ) {
//     throw new ApiError(
//       400,
//       "Discount price must be less than regular price"
//     );
//   }

//   // ----------------------------------------------------------
//   // Create product
//   // ----------------------------------------------------------

//   const product =
//     await createProduct({
//       name: name.trim(),

//       slug: productSlug,

//       description:
//         description?.trim() || "",

//       category,

//       images: images || [],

//       price,

//       discountPrice:
//         discountPrice ?? null,

//       stock: stock ?? 0,

//       sku: sku.toUpperCase(),

//       unit: unit || "piece",

//       isActive:
//         isActive !== undefined
//           ? isActive
//           : true,

//       isFeatured:
//         isFeatured !== undefined
//           ? isFeatured
//           : false,
//     });

//   return product;
// };

// // ============================================================
// // GET PRODUCT
// // ============================================================

// export const getProduct = async (
//   productId
// ) => {
//   const product =
//     await findProductById(
//       productId
//     );

//   if (!product) {
//     throw new ApiError(
//       404,
//       "Product not found"
//     );
//   }

//   return product;
// };

// // ============================================================
// // GET PRODUCT BY SLUG
// // ============================================================

// export const getProductBySlug = async (
//   slug
// ) => {
//   const product =
//     await findProductBySlug(slug);

//   if (!product) {
//     throw new ApiError(
//       404,
//       "Product not found"
//     );
//   }

//   return product;
// };

// // ============================================================
// // GET PRODUCTS
// // ============================================================

// export const getProducts = async ({
//   page = 1,
//   limit = 20,
//   category,
//   search,
//   minPrice,
//   maxPrice,
//   featured,
//   sortBy = "createdAt",
//   sortOrder = "desc",
// }) => {
//   page = Math.max(
//     Number(page) || 1,
//     1
//   );

//   limit = Math.min(
//     Math.max(Number(limit) || 20, 1),
//     100
//   );

//   const filter = {
//     isActive: true,
//   };

//   // ----------------------------------------------------------
//   // Category
//   // ----------------------------------------------------------

//   if (category) {
//     filter.category = category;
//   }

//   // ----------------------------------------------------------
//   // Search
//   // ----------------------------------------------------------

//   if (search) {
//     filter.$text = {
//       $search: search,
//     };
//   }

//   // ----------------------------------------------------------
//   // Price
//   // ----------------------------------------------------------

//   if (
//     minPrice !== undefined ||
//     maxPrice !== undefined
//   ) {
//     filter.price = {};

//     if (minPrice !== undefined) {
//       filter.price.$gte =
//         Number(minPrice);
//     }

//     if (maxPrice !== undefined) {
//       filter.price.$lte =
//         Number(maxPrice);
//     }
//   }

//   // ----------------------------------------------------------
//   // Featured
//   // ----------------------------------------------------------

//   if (featured === "true") {
//     filter.isFeatured = true;
//   }

//   // ----------------------------------------------------------
//   // Sorting
//   // ----------------------------------------------------------

//   const allowedSortFields = [
//     "createdAt",
//     "price",
//     "name",
//   ];

//   if (
//     !allowedSortFields.includes(
//       sortBy
//     )
//   ) {
//     sortBy = "createdAt";
//   }

//   const sort = {
//     [sortBy]:
//       sortOrder === "asc"
//         ? 1
//         : -1,
//   };

//   // ----------------------------------------------------------
//   // Pagination
//   // ----------------------------------------------------------

//   const skip =
//     (page - 1) * limit;

//   const [products, total] =
//     await Promise.all([
//       findProducts({
//         filter,
//         skip,
//         limit,
//         sort,
//       }),

//       countProducts(filter),
//     ]);

//   const totalPages =
//     Math.ceil(total / limit);

//   return {
//     products,

//     pagination: {
//       page,
//       limit,
//       total,
//       totalPages,
//       hasNextPage:
//         page < totalPages,
//       hasPreviousPage:
//         page > 1,
//     },
//   };
// };

// // ============================================================
// // UPDATE PRODUCT
// // ============================================================

// export const updateExistingProduct =
//   async (
//     productId,
//     data
//   ) => {
//     const product =
//       await findProductById(
//         productId
//       );

//     if (!product) {
//       throw new ApiError(
//         404,
//         "Product not found"
//       );
//     }

//     const updateData = {};

//     if (data.name !== undefined) {
//       updateData.name =
//         data.name.trim();
//     }

//     if (
//       data.description !==
//       undefined
//     ) {
//       updateData.description =
//         data.description.trim();
//     }

//     if (data.category !== undefined) {
//       const category =
//         await Category.findById(
//           data.category
//         );

//       if (!category) {
//         throw new ApiError(
//           404,
//           "Category not found"
//         );
//       }

//       updateData.category =
//         data.category;
//     }

//     if (data.images !== undefined) {
//       updateData.images =
//         data.images;
//     }

//     if (data.price !== undefined) {
//       updateData.price =
//         data.price;
//     }

//     if (
//       data.discountPrice !==
//       undefined
//     ) {
//       if (
//         data.discountPrice !==
//           null &&
//         data.discountPrice >=
//           (data.price ??
//             product.price)
//       ) {
//         throw new ApiError(
//           400,
//           "Discount price must be less than regular price"
//         );
//       }

//       updateData.discountPrice =
//         data.discountPrice;
//     }

//     if (data.stock !== undefined) {
//       updateData.stock =
//         data.stock;
//     }

//     if (data.unit !== undefined) {
//       updateData.unit =
//         data.unit.trim();
//     }

//     if (
//       data.isActive !==
//       undefined
//     ) {
//       updateData.isActive =
//         data.isActive;
//     }

//     if (
//       data.isFeatured !==
//       undefined
//     ) {
//       updateData.isFeatured =
//         data.isFeatured;
//     }

//     const updatedProduct =
//       await updateProduct(
//         productId,
//         updateData
//       );

//     return updatedProduct;
//   };

// // ============================================================
// // DELETE PRODUCT
// // ============================================================

// export const removeProduct = async (
//   productId
// ) => {
//   const product =
//     await findProductById(
//       productId
//     );

//   if (!product) {
//     throw new ApiError(
//       404,
//       "Product not found"
//     );
//   }

//   await deleteProduct(productId);

//   return {
//     deleted: true,
//     productId,
//   };
// };

import slugify from "slugify";

import Product from "./product.model.js";
import Variant from "./variant.model.js";

import {
  createProduct,
  findProductById,
  findProductBySlug,
  findAllProducts,
  updateProduct,
  deleteProduct,
  createVariant,
  findVariantById,
  findVariantsByProduct,
  updateVariant,
  deleteVariant,
  deleteVariantsByProduct,
} from "./product.repository.js";

// ============================================================
// HELPER
// ============================================================

const calculateVariantPrice = (pricePerGram, weight, weightUnit) => {
  let weightInGrams = weight;

  if (weightUnit === "kg") {
    weightInGrams = weight * 1000;
  }

  return Number((pricePerGram * weightInGrams).toFixed(2));
};

// ============================================================
// CREATE PRODUCT
// ============================================================

export const createProductService = async (data) => {
  if (!data.name) {
    throw new Error("Product name is required");
  }

  if (!data.category) {
    throw new Error("Category is required");
  }

  if (
    data.pricePerGram === undefined ||
    data.pricePerGram === null
  ) {
    throw new Error("pricePerGram is required");
  }

  const slug =
    data.slug ||
    slugify(data.name, {
      lower: true,
      strict: true,
    });

  const existingProduct = await findProductBySlug(slug);

  if (existingProduct) {
    throw new Error("Product with this name already exists");
  }

  return createProduct({
    ...data,
    slug,
  });
};

// ============================================================
// GET ALL PRODUCTS
// ============================================================

export const getAllProductsService = async (query = {}) => {
  const filter = {};

  if (query.category) {
    filter.category = query.category;
  }

  if (query.isActive !== undefined) {
    filter.isActive = query.isActive === "true";
  }

  if (query.isFeatured !== undefined) {
    filter.isFeatured = query.isFeatured === "true";
  }

  return findAllProducts(filter);
};

// ============================================================
// GET PRODUCT BY ID
// ============================================================

export const getProductByIdService = async (productId) => {
  const product = await findProductById(productId);

  if (!product) {
    throw new Error("Product not found");
  }

  const variants = await findVariantsByProduct(productId);

  return {
    ...product.toObject(),
    variants,
  };
};

// ============================================================
// GET PRODUCT BY SLUG
// ============================================================

export const getProductBySlugService = async (slug) => {
  const product = await findProductBySlug(slug);

  if (!product) {
    throw new Error("Product not found");
  }

  const variants = await findVariantsByProduct(product._id);

  return {
    ...product.toObject(),
    variants,
  };
};

// ============================================================
// UPDATE PRODUCT
// ============================================================

export const updateProductService = async (
  productId,
  data
) => {
  const product = await findProductById(productId);

  if (!product) {
    throw new Error("Product not found");
  }

  let updateData = {
    ...data,
  };

  // --------------------------------------------
  // Update slug if product name changes
  // --------------------------------------------

  if (data.name) {
    updateData.slug = slugify(data.name, {
      lower: true,
      strict: true,
    });
  }

  const updatedProduct = await updateProduct(
    productId,
    updateData
  );

  // --------------------------------------------
  // Recalculate variant prices if
  // pricePerGram changes
  // --------------------------------------------

  if (data.pricePerGram !== undefined) {
    const variants = await findVariantsByProduct(productId);

    for (const variant of variants) {
      const newPrice = calculateVariantPrice(
        data.pricePerGram,
        variant.weight,
        variant.weightUnit
      );

      await updateVariant(variant._id, {
        price: newPrice,
      });
    }
  }

  const variants = await findVariantsByProduct(productId);

  return {
    ...updatedProduct.toObject(),
    variants,
  };
};

// ============================================================
// DELETE PRODUCT
// ============================================================

export const deleteProductService = async (productId) => {
  const product = await findProductById(productId);

  if (!product) {
    throw new Error("Product not found");
  }

  // Delete all variants belonging to product
  await deleteVariantsByProduct(productId);

  await deleteProduct(productId);

  return {
    productId,
  };
};

// ============================================================
// DEACTIVATE PRODUCT
// ============================================================

export const deactivateProductService = async (productId) => {
  const product = await findProductById(productId);

  if (!product) {
    throw new Error("Product not found");
  }

  return updateProduct(productId, {
    isActive: false,
  });
};

// ============================================================
// CREATE VARIANT
// ============================================================

export const createVariantService = async (
  productId,
  data
) => {
  const product = await findProductById(productId);

  if (!product) {
    throw new Error("Product not found");
  }

  if (!data.weight) {
    throw new Error("Variant weight is required");
  }

  const weightUnit = data.weightUnit || "g";

  const price = calculateVariantPrice(
    product.pricePerGram,
    data.weight,
    weightUnit
  );

  let discountPrice = null;

  if (
    data.discountPrice !== undefined &&
    data.discountPrice !== null
  ) {
    discountPrice = Number(data.discountPrice);

    if (discountPrice > price) {
      throw new Error(
        "Discount price cannot be greater than variant price"
      );
    }
  }

  return createVariant({
    product: productId,
    weight: data.weight,
    weightUnit,
    price,
    discountPrice,
    stock: data.stock || 0,
    sku: data.sku,
    isActive:
      data.isActive !== undefined
        ? data.isActive
        : true,
  });
};

// ============================================================
// GET VARIANTS
// ============================================================

export const getProductVariantsService = async (
  productId
) => {
  const product = await findProductById(productId);

  if (!product) {
    throw new Error("Product not found");
  }

  return findVariantsByProduct(productId);
};

// ============================================================
// GET VARIANT
// ============================================================

export const getVariantByIdService = async (
  variantId
) => {
  const variant = await findVariantById(variantId);

  if (!variant) {
    throw new Error("Variant not found");
  }

  return variant;
};

// ============================================================
// UPDATE VARIANT
// ============================================================

export const updateVariantService = async (
  variantId,
  data
) => {
  const variant = await findVariantById(variantId);

  if (!variant) {
    throw new Error("Variant not found");
  }

  const product = await findProductById(
    variant.product._id || variant.product
  );

  if (!product) {
    throw new Error("Product not found");
  }

  const weight =
    data.weight !== undefined
      ? data.weight
      : variant.weight;

  const weightUnit =
    data.weightUnit !== undefined
      ? data.weightUnit
      : variant.weightUnit;

  const price = calculateVariantPrice(
    product.pricePerGram,
    weight,
    weightUnit
  );

  const updateData = {
    ...data,
    weight,
    weightUnit,
    price,
  };

  if (
    updateData.discountPrice !== undefined &&
    updateData.discountPrice !== null
  ) {
    if (updateData.discountPrice > price) {
      throw new Error(
        "Discount price cannot be greater than variant price"
      );
    }
  }

  return updateVariant(variantId, updateData);
};

// ============================================================
// DELETE VARIANT
// ============================================================

export const deleteVariantService = async (
  variantId
) => {
  const variant = await findVariantById(variantId);

  if (!variant) {
    throw new Error("Variant not found");
  }

  await deleteVariant(variantId);

  return {
    variantId,
  };
};

// ============================================================
// UPDATE VARIANT STOCK
// ============================================================

export const updateVariantStockService = async (
  variantId,
  stock
) => {
  const variant = await findVariantById(variantId);

  if (!variant) {
    throw new Error("Variant not found");
  }

  if (stock < 0) {
    throw new Error("Stock cannot be negative");
  }

  return updateVariant(variantId, {
    stock,
  });
};