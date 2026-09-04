import Product from "../../products/product.model.js";
import Variant from "../../products/variant.model.js";

import slugify from "slugify";

// ============================================================
// HELPER - CALCULATE VARIANT PRICE
// ============================================================

const calculateVariantPrice = (
  pricePerGram,
  weight,
  weightUnit = "g"
) => {
  let weightInGrams = Number(weight);

  if (weightUnit === "kg") {
    weightInGrams = Number(weight) * 1000;
  }

  return Number(
    (Number(pricePerGram) * weightInGrams).toFixed(2)
  );
};

// ============================================================
// CREATE PRODUCT
// ============================================================

export const createProduct = async (data) => {
  const {
    name,
    description,
    category,
    images = [],
    pricePerGram,
    sku,
    isActive = true,
    isFeatured = false,
    variants = [],
  } = data;

  if (!name) {
    throw new Error("Product name is required");
  }

  if (!category) {
    throw new Error("Category is required");
  }

  if (
    pricePerGram === undefined ||
    pricePerGram === null
  ) {
    throw new Error("pricePerGram is required");
  }

  if (Number(pricePerGram) < 0) {
    throw new Error("pricePerGram cannot be negative");
  }

  const slug = slugify(name, {
    lower: true,
    strict: true,
  });

  // Check duplicate slug
  const existingProduct = await Product.findOne({
    slug,
  });

  if (existingProduct) {
    throw new Error(
      "A product with this name already exists"
    );
  }

  // Create product
  const product = await Product.create({
    name,
    slug,
    description,
    category,
    images,
    pricePerGram,
    sku,
    isActive,
    isFeatured,
  });

  // ==========================================================
  // CREATE VARIANTS
  // ==========================================================

  const createdVariants = [];

  if (Array.isArray(variants) && variants.length > 0) {
    for (const variantData of variants) {
      const {
        weight,
        weightUnit = "g",
        discountPrice = null,
        stock = 0,
        sku: variantSku,
        isActive: variantIsActive = true,
      } = variantData;

      if (!weight) {
        throw new Error(
          "Variant weight is required"
        );
      }

      const price = calculateVariantPrice(
        pricePerGram,
        weight,
        weightUnit
      );

      if (
        discountPrice !== null &&
        Number(discountPrice) > price
      ) {
        throw new Error(
          "Discount price cannot be greater than variant price"
        );
      }

      const variant = await Variant.create({
        product: product._id,
        weight,
        weightUnit,
        price,
        discountPrice,
        stock,
        sku: variantSku,
        isActive: variantIsActive,
      });

      createdVariants.push(variant);
    }
  }

  return {
    product,
    variants: createdVariants,
  };
};

// ============================================================
// GET ALL PRODUCTS FOR ADMIN
// ============================================================

export const getAllProducts = async (query = {}) => {
  const filter = {};

  if (query.category) {
    filter.category = query.category;
  }

  if (query.isActive !== undefined) {
    filter.isActive =
      query.isActive === "true" ||
      query.isActive === true;
  }

  if (query.isFeatured !== undefined) {
    filter.isFeatured =
      query.isFeatured === "true" ||
      query.isFeatured === true;
  }

  if (query.search) {
    filter.$or = [
      {
        name: {
          $regex: query.search,
          $options: "i",
        },
      },
      {
        sku: {
          $regex: query.search,
          $options: "i",
        },
      },
    ];
  }

  const products = await Product.find(filter)
    .populate(
      "category",
      "name slug image"
    )
    .sort({
      createdAt: -1,
    })
    .lean();

  // Attach variants
  for (const product of products) {
    product.variants =
      await Variant.find({
        product: product._id,
      })
        .sort({
          weight: 1,
        })
        .lean();
  }

  return products;
};

// ============================================================
// GET PRODUCT BY ID
// ============================================================

export const getProductById = async (
  productId
) => {
  const product = await Product.findById(
    productId
  )
    .populate(
      "category",
      "name slug image"
    )
    .lean();

  if (!product) {
    throw new Error("Product not found");
  }

  const variants = await Variant.find({
    product: productId,
  })
    .sort({
      weight: 1,
    })
    .lean();

  return {
    ...product,
    variants,
  };
};

// ============================================================
// UPDATE PRODUCT
// ============================================================

export const updateProduct = async (
  productId,
  data
) => {
  const product = await Product.findById(
    productId
  );

  if (!product) {
    throw new Error("Product not found");
  }

  const updateData = {};

  // ----------------------------------------------------------
  // BASIC FIELDS
  // ----------------------------------------------------------

  if (data.name !== undefined) {
    updateData.name = data.name;

    updateData.slug = slugify(data.name, {
      lower: true,
      strict: true,
    });
  }

  if (data.description !== undefined) {
    updateData.description =
      data.description;
  }

  if (data.category !== undefined) {
    updateData.category = data.category;
  }

  if (data.images !== undefined) {
    updateData.images = data.images;
  }

  if (data.sku !== undefined) {
    updateData.sku = data.sku;
  }

  if (data.isActive !== undefined) {
    updateData.isActive = data.isActive;
  }

  if (data.isFeatured !== undefined) {
    updateData.isFeatured =
      data.isFeatured;
  }

  // ----------------------------------------------------------
  // PRICE PER GRAM
  // ----------------------------------------------------------

  const priceChanged =
    data.pricePerGram !== undefined;

  if (priceChanged) {
    if (Number(data.pricePerGram) < 0) {
      throw new Error(
        "pricePerGram cannot be negative"
      );
    }

    updateData.pricePerGram =
      Number(data.pricePerGram);
  }

  // ----------------------------------------------------------
  // UPDATE PRODUCT
  // ----------------------------------------------------------

  const updatedProduct =
    await Product.findByIdAndUpdate(
      productId,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    )
      .populate(
        "category",
        "name slug image"
      )
      .lean();

  // ----------------------------------------------------------
  // RECALCULATE ALL VARIANT PRICES
  // ----------------------------------------------------------

  if (priceChanged) {
    const variants = await Variant.find({
      product: productId,
    });

    for (const variant of variants) {
      const newPrice =
        calculateVariantPrice(
          data.pricePerGram,
          variant.weight,
          variant.weightUnit
        );

      let discountPrice =
        variant.discountPrice;

      // Prevent discount price > new price
      if (
        discountPrice !== null &&
        Number(discountPrice) > newPrice
      ) {
        discountPrice = null;
      }

      await Variant.findByIdAndUpdate(
        variant._id,
        {
          price: newPrice,
          discountPrice,
        },
        {
          runValidators: true,
        }
      );
    }
  }

  const variants = await Variant.find({
    product: productId,
  })
    .sort({
      weight: 1,
    })
    .lean();

  return {
    ...updatedProduct,
    variants,
  };
};

// ============================================================
// DELETE PRODUCT
// ============================================================

export const deleteProduct = async (
  productId
) => {
  const product = await Product.findById(
    productId
  );

  if (!product) {
    throw new Error("Product not found");
  }

  // Delete all variants
  await Variant.deleteMany({
    product: productId,
  });

  // Delete product
  await Product.findByIdAndDelete(
    productId
  );

  return {
    productId,
    deleted: true,
  };
};

// ============================================================
// ACTIVATE PRODUCT
// ============================================================

export const activateProduct = async (
  productId
) => {
  const product = await Product.findByIdAndUpdate(
    productId,
    {
      isActive: true,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!product) {
    throw new Error("Product not found");
  }

  return product;
};

// ============================================================
// DEACTIVATE PRODUCT
// ============================================================

export const deactivateProduct = async (
  productId
) => {
  const product = await Product.findByIdAndUpdate(
    productId,
    {
      isActive: false,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!product) {
    throw new Error("Product not found");
  }

  return product;
};

// ============================================================
// CREATE VARIANT
// ============================================================

export const createVariant = async (
  productId,
  data
) => {
  const product = await Product.findById(
    productId
  );

  if (!product) {
    throw new Error("Product not found");
  }

  const {
    weight,
    weightUnit = "g",
    discountPrice = null,
    stock = 0,
    sku,
    isActive = true,
  } = data;

  if (!weight) {
    throw new Error("Weight is required");
  }

  if (Number(weight) <= 0) {
    throw new Error(
      "Weight must be greater than 0"
    );
  }

  const price = calculateVariantPrice(
    product.pricePerGram,
    weight,
    weightUnit
  );

  if (
    discountPrice !== null &&
    Number(discountPrice) > price
  ) {
    throw new Error(
      "Discount price cannot be greater than variant price"
    );
  }

  // Check duplicate variant
  const existingVariant =
    await Variant.findOne({
      product: productId,
      weight,
      weightUnit,
    });

  if (existingVariant) {
    throw new Error(
      "This variant already exists"
    );
  }

  return Variant.create({
    product: productId,
    weight,
    weightUnit,
    price,
    discountPrice,
    stock,
    sku,
    isActive,
  });
};


// ============================================================
// UPDATE VARIANT
// ============================================================

export const updateVariant = async (
  variantId,
  data
) => {
  const variant =
    await Variant.findById(variantId);

  if (!variant) {
    throw new Error("Variant not found");
  }

  // ----------------------------------------------------------
  // FIND PRODUCT
  // ----------------------------------------------------------

  const product =
    await Product.findById(
      variant.product
    );

  if (!product) {
    throw new Error("Product not found");
  }

  // ----------------------------------------------------------
  // GET UPDATED WEIGHT / UNIT
  // ----------------------------------------------------------

  const weight =
    data.weight !== undefined
      ? Number(data.weight)
      : variant.weight;

  const weightUnit =
    data.weightUnit !== undefined
      ? data.weightUnit
      : variant.weightUnit;

  // ----------------------------------------------------------
  // VALIDATE WEIGHT
  // ----------------------------------------------------------

  if (weight <= 0) {
    throw new Error(
      "Weight must be greater than 0"
    );
  }

  // ----------------------------------------------------------
  // CHECK DUPLICATE VARIANT
  // ----------------------------------------------------------
  // A product cannot have two variants with
  // the same weight + weightUnit.
  //
  // Exclude the current variant from the search.
  // ----------------------------------------------------------

  const duplicateVariant =
    await Variant.findOne({
      product: variant.product,
      weight,
      weightUnit,
      _id: {
        $ne: variantId,
      },
    });

  if (duplicateVariant) {
    const displayWeight =
      `${weight} ${weightUnit}`;

    const error =
      new Error(
        `A variant with ${displayWeight} already exists for this product`
      );

    error.statusCode = 409;

    throw error;
  }

  // ----------------------------------------------------------
  // PRICE
  // ----------------------------------------------------------
  // If admin sends price, use that price.
  //
  // Example:
  // {
  //   "weight": 1,
  //   "weightUnit": "kg",
  //   "price": 500
  // }
  //
  // Then price will be 500, NOT recalculated from
  // product.pricePerGram.
  //
  // If price is not provided, keep the existing price.
  // ----------------------------------------------------------

  let price;

  if (data.price !== undefined) {
    price = Number(data.price);

    if (price < 0) {
      throw new Error(
        "Price cannot be negative"
      );
    }
  } else {
    price = variant.price;
  }

  // ----------------------------------------------------------
  // UPDATE DATA
  // ----------------------------------------------------------

  const updateData = {
    weight,
    weightUnit,
    price,
  };

  // ----------------------------------------------------------
  // DISCOUNT PRICE
  // ----------------------------------------------------------

  if (data.discountPrice !== undefined) {
    if (
      data.discountPrice !== null &&
      Number(data.discountPrice) < 0
    ) {
      throw new Error(
        "Discount price cannot be negative"
      );
    }

    if (
      data.discountPrice !== null &&
      Number(data.discountPrice) > price
    ) {
      throw new Error(
        "Discount price cannot be greater than variant price"
      );
    }

    updateData.discountPrice =
      data.discountPrice === null
        ? null
        : Number(data.discountPrice);
  }

  // ----------------------------------------------------------
  // SKU
  // ----------------------------------------------------------

  if (data.sku !== undefined) {
    updateData.sku = data.sku;
  }

  // ----------------------------------------------------------
  // ACTIVE STATUS
  // ----------------------------------------------------------

  if (data.isActive !== undefined) {
    updateData.isActive =
      data.isActive;
  }

  // ----------------------------------------------------------
  // DO NOT UPDATE STOCK HERE
  // ----------------------------------------------------------
  // Stock has its own endpoint:
  //
  // PATCH /api/admin/products/variants/:variantId/stock
  //
  // Therefore stock is intentionally NOT included here.
  // ----------------------------------------------------------

  const updatedVariant =
    await Variant.findByIdAndUpdate(
      variantId,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

  if (!updatedVariant) {
    throw new Error("Variant not found");
  }

  return updatedVariant;
};


// ============================================================
// DELETE VARIANT
// ============================================================

export const deleteVariant = async (
  variantId
) => {
  const variant =
    await Variant.findByIdAndDelete(
      variantId
    );

  if (!variant) {
    throw new Error("Variant not found");
  }

  return {
    variantId,
    deleted: true,
  };
};

// ============================================================
// UPDATE VARIANT STOCK
// ============================================================

export const updateVariantStock = async (
  variantId,
  stock
) => {
  if (stock === undefined) {
    throw new Error("Stock is required");
  }

  if (Number(stock) < 0) {
    throw new Error(
      "Stock cannot be negative"
    );
  }

  const variant =
    await Variant.findByIdAndUpdate(
      variantId,
      {
        stock: Number(stock),
      },
      {
        new: true,
        runValidators: true,
      }
    );

  if (!variant) {
    throw new Error("Variant not found");
  }

  return variant;
};