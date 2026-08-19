import ApiError from "../../utils/ApiError.js";

import {
  createProduct,
  findProductById,
  findProductBySlug,
  findProductBySku,
  findProductByName,
  findProducts,
  countProducts,
  updateProduct,
  deleteProduct,
} from "./product.repository.js";

import Category from "../categories/category.model.js";

// ============================================================
// CREATE PRODUCT
// ============================================================

export const createNewProduct = async (
  data
) => {
  const {
    name,
    slug,
    description,
    category,
    images,
    price,
    discountPrice,
    stock,
    sku,
    unit,
    isActive,
    isFeatured,
  } = data;

  // ----------------------------------------------------------
  // Required fields
  // ----------------------------------------------------------

  if (!name) {
    throw new ApiError(
      400,
      "Product name is required"
    );
  }

  if (!category) {
    throw new ApiError(
      400,
      "Product category is required"
    );
  }

  if (price === undefined) {
    throw new ApiError(
      400,
      "Product price is required"
    );
  }

  if (!sku) {
    throw new ApiError(
      400,
      "Product SKU is required"
    );
  }

  // ----------------------------------------------------------
  // Check category
  // ----------------------------------------------------------

  const existingCategory =
    await Category.findById(category);

  if (!existingCategory) {
    throw new ApiError(
      404,
      "Category not found"
    );
  }

  if (!existingCategory.isActive) {
    throw new ApiError(
      400,
      "Selected category is inactive"
    );
  }

  // ----------------------------------------------------------
  // Check duplicate name
  // ----------------------------------------------------------

  const existingName =
    await findProductByName(name);

  if (existingName) {
    throw new ApiError(
      409,
      "Product with this name already exists"
    );
  }

  // ----------------------------------------------------------
  // Check SKU
  // ----------------------------------------------------------

  const existingSku =
    await findProductBySku(sku);

  if (existingSku) {
    throw new ApiError(
      409,
      "Product SKU already exists"
    );
  }

  // ----------------------------------------------------------
  // Generate slug
  // ----------------------------------------------------------

  const productSlug =
    slug ||
    name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

  const existingSlug =
    await findProductBySlug(
      productSlug
    );

  if (existingSlug) {
    throw new ApiError(
      409,
      "Product slug already exists"
    );
  }

  // ----------------------------------------------------------
  // Validate discount price
  // ----------------------------------------------------------

  if (
    discountPrice !== undefined &&
    discountPrice !== null &&
    discountPrice >= price
  ) {
    throw new ApiError(
      400,
      "Discount price must be less than regular price"
    );
  }

  // ----------------------------------------------------------
  // Create product
  // ----------------------------------------------------------

  const product =
    await createProduct({
      name: name.trim(),

      slug: productSlug,

      description:
        description?.trim() || "",

      category,

      images: images || [],

      price,

      discountPrice:
        discountPrice ?? null,

      stock: stock ?? 0,

      sku: sku.toUpperCase(),

      unit: unit || "piece",

      isActive:
        isActive !== undefined
          ? isActive
          : true,

      isFeatured:
        isFeatured !== undefined
          ? isFeatured
          : false,
    });

  return product;
};

// ============================================================
// GET PRODUCT
// ============================================================

export const getProduct = async (
  productId
) => {
  const product =
    await findProductById(
      productId
    );

  if (!product) {
    throw new ApiError(
      404,
      "Product not found"
    );
  }

  return product;
};

// ============================================================
// GET PRODUCT BY SLUG
// ============================================================

export const getProductBySlug = async (
  slug
) => {
  const product =
    await findProductBySlug(slug);

  if (!product) {
    throw new ApiError(
      404,
      "Product not found"
    );
  }

  return product;
};

// ============================================================
// GET PRODUCTS
// ============================================================

export const getProducts = async ({
  page = 1,
  limit = 20,
  category,
  search,
  minPrice,
  maxPrice,
  featured,
  sortBy = "createdAt",
  sortOrder = "desc",
}) => {
  page = Math.max(
    Number(page) || 1,
    1
  );

  limit = Math.min(
    Math.max(Number(limit) || 20, 1),
    100
  );

  const filter = {
    isActive: true,
  };

  // ----------------------------------------------------------
  // Category
  // ----------------------------------------------------------

  if (category) {
    filter.category = category;
  }

  // ----------------------------------------------------------
  // Search
  // ----------------------------------------------------------

  if (search) {
    filter.$text = {
      $search: search,
    };
  }

  // ----------------------------------------------------------
  // Price
  // ----------------------------------------------------------

  if (
    minPrice !== undefined ||
    maxPrice !== undefined
  ) {
    filter.price = {};

    if (minPrice !== undefined) {
      filter.price.$gte =
        Number(minPrice);
    }

    if (maxPrice !== undefined) {
      filter.price.$lte =
        Number(maxPrice);
    }
  }

  // ----------------------------------------------------------
  // Featured
  // ----------------------------------------------------------

  if (featured === "true") {
    filter.isFeatured = true;
  }

  // ----------------------------------------------------------
  // Sorting
  // ----------------------------------------------------------

  const allowedSortFields = [
    "createdAt",
    "price",
    "name",
  ];

  if (
    !allowedSortFields.includes(
      sortBy
    )
  ) {
    sortBy = "createdAt";
  }

  const sort = {
    [sortBy]:
      sortOrder === "asc"
        ? 1
        : -1,
  };

  // ----------------------------------------------------------
  // Pagination
  // ----------------------------------------------------------

  const skip =
    (page - 1) * limit;

  const [products, total] =
    await Promise.all([
      findProducts({
        filter,
        skip,
        limit,
        sort,
      }),

      countProducts(filter),
    ]);

  const totalPages =
    Math.ceil(total / limit);

  return {
    products,

    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage:
        page < totalPages,
      hasPreviousPage:
        page > 1,
    },
  };
};

// ============================================================
// UPDATE PRODUCT
// ============================================================

export const updateExistingProduct =
  async (
    productId,
    data
  ) => {
    const product =
      await findProductById(
        productId
      );

    if (!product) {
      throw new ApiError(
        404,
        "Product not found"
      );
    }

    const updateData = {};

    if (data.name !== undefined) {
      updateData.name =
        data.name.trim();
    }

    if (
      data.description !==
      undefined
    ) {
      updateData.description =
        data.description.trim();
    }

    if (data.category !== undefined) {
      const category =
        await Category.findById(
          data.category
        );

      if (!category) {
        throw new ApiError(
          404,
          "Category not found"
        );
      }

      updateData.category =
        data.category;
    }

    if (data.images !== undefined) {
      updateData.images =
        data.images;
    }

    if (data.price !== undefined) {
      updateData.price =
        data.price;
    }

    if (
      data.discountPrice !==
      undefined
    ) {
      if (
        data.discountPrice !==
          null &&
        data.discountPrice >=
          (data.price ??
            product.price)
      ) {
        throw new ApiError(
          400,
          "Discount price must be less than regular price"
        );
      }

      updateData.discountPrice =
        data.discountPrice;
    }

    if (data.stock !== undefined) {
      updateData.stock =
        data.stock;
    }

    if (data.unit !== undefined) {
      updateData.unit =
        data.unit.trim();
    }

    if (
      data.isActive !==
      undefined
    ) {
      updateData.isActive =
        data.isActive;
    }

    if (
      data.isFeatured !==
      undefined
    ) {
      updateData.isFeatured =
        data.isFeatured;
    }

    const updatedProduct =
      await updateProduct(
        productId,
        updateData
      );

    return updatedProduct;
  };

// ============================================================
// DELETE PRODUCT
// ============================================================

export const removeProduct = async (
  productId
) => {
  const product =
    await findProductById(
      productId
    );

  if (!product) {
    throw new ApiError(
      404,
      "Product not found"
    );
  }

  await deleteProduct(productId);

  return {
    deleted: true,
    productId,
  };
};