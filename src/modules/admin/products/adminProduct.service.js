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
    (
      Number(pricePerGram) * weightInGrams
    ).toFixed(2)
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

  // ----------------------------------------------------------
  // VALIDATION
  // ----------------------------------------------------------

  if (!name) {
    throw new Error(
      "Product name is required"
    );
  }

  if (!category) {
    throw new Error(
      "Category is required"
    );
  }

  if (
    pricePerGram === undefined ||
    pricePerGram === null
  ) {
    throw new Error(
      "pricePerGram is required"
    );
  }

  if (Number(pricePerGram) < 0) {
    throw new Error(
      "pricePerGram cannot be negative"
    );
  }

  // ----------------------------------------------------------
  // GENERATE SLUG
  // ----------------------------------------------------------

  const slug = slugify(name, {
    lower: true,
    strict: true,
  });

  // ----------------------------------------------------------
  // CHECK DUPLICATE PRODUCT
  // ----------------------------------------------------------

  const existingProduct =
    await Product.findOne({
      slug,
    });

  if (existingProduct) {
    throw new Error(
      "A product with this name already exists"
    );
  }

  // ----------------------------------------------------------
  // CREATE PRODUCT
  // ----------------------------------------------------------

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

  if (
    Array.isArray(variants) &&
    variants.length > 0
  ) {
    for (const variantData of variants) {
      const {
        weight,
        weightUnit = "g",
        discountPrice = null,
        stock = 0,
        sku: variantSku,
        isActive: variantIsActive = true,
      } = variantData;

      // ------------------------------------------------------
      // VALIDATE WEIGHT
      // ------------------------------------------------------

      if (!weight) {
        throw new Error(
          "Variant weight is required"
        );
      }

      if (Number(weight) <= 0) {
        throw new Error(
          "Variant weight must be greater than 0"
        );
      }

      // ------------------------------------------------------
      // CALCULATE PRICE
      // ------------------------------------------------------

      const price =
        calculateVariantPrice(
          pricePerGram,
          weight,
          weightUnit
        );

      // ------------------------------------------------------
      // VALIDATE DISCOUNT PRICE
      // ------------------------------------------------------

      if (
        discountPrice !== null &&
        Number(discountPrice) > price
      ) {
        throw new Error(
          "Discount price cannot be greater than variant price"
        );
      }

      // ------------------------------------------------------
      // CREATE VARIANT
      // ------------------------------------------------------

      const variant =
        await Variant.create({
          product: product._id,
          weight,
          weightUnit,
          price,
          discountPrice,
          stock,
          sku: variantSku,
          isActive: variantIsActive,
        });

      createdVariants.push(
        variant
      );
    }
  }

  // ----------------------------------------------------------
  // RETURN
  // ----------------------------------------------------------

  return {
    product,
    variants: createdVariants,
  };
};

// ============================================================
// GET ALL PRODUCTS FOR ADMIN
// ============================================================

export const getAllProducts = async (
  query = {}
) => {
  const filter = {};

  // ----------------------------------------------------------
  // CATEGORY FILTER
  // ----------------------------------------------------------

  if (query.category) {
    filter.category = query.category;
  }

  // ----------------------------------------------------------
  // ACTIVE FILTER
  // ----------------------------------------------------------

  if (query.isActive !== undefined) {
    filter.isActive =
      query.isActive === "true" ||
      query.isActive === true;
  }

  // ----------------------------------------------------------
  // FEATURED FILTER
  // ----------------------------------------------------------

  if (query.isFeatured !== undefined) {
    filter.isFeatured =
      query.isFeatured === "true" ||
      query.isFeatured === true;
  }

  // ----------------------------------------------------------
  // SEARCH
  // ----------------------------------------------------------

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

  // ----------------------------------------------------------
  // GET PRODUCTS
  // ----------------------------------------------------------

  const products =
    await Product.find(filter)
      .populate(
        "category",
        "name slug image"
      )
      .sort({
        createdAt: -1,
      })
      .lean();

  // ----------------------------------------------------------
  // ATTACH VARIANTS
  // ----------------------------------------------------------

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
  // ----------------------------------------------------------
  // GET PRODUCT
  // ----------------------------------------------------------

  const product =
    await Product.findById(
      productId
    )
      .populate(
        "category",
        "name slug image"
      )
      .lean();

  if (!product) {
    throw new Error(
      "Product not found"
    );
  }

  // ----------------------------------------------------------
  // GET VARIANTS
  // ----------------------------------------------------------

  const variants =
    await Variant.find({
      product: productId,
    })
      .sort({
        weight: 1,
      })
      .lean();

  // ----------------------------------------------------------
  // RETURN
  // ----------------------------------------------------------

  return {
    ...product,
    variants,
  };
};

// ============================================================
// UPDATE PRODUCT
// ============================================================
//
// Supports:
//
// 1. Basic product updates
// 2. Price per gram update
// 3. Adding new Cloudinary images
// 4. Removing existing Cloudinary images
//
// Expected data from controller:
//
// {
//   name,
//   description,
//   category,
//   pricePerGram,
//   sku,
//   isActive,
//   isFeatured,
//   newImages: [],
//   removeImagePublicIds: []
// }
//
// ============================================================

export const updateProduct = async (
  productId,
  data
) => {
  // ----------------------------------------------------------
  // FIND PRODUCT
  // ----------------------------------------------------------

  const product =
    await Product.findById(
      productId
    );

  if (!product) {
    throw new Error(
      "Product not found"
    );
  }

  const updateData = {};

  // ==========================================================
  // BASIC FIELDS
  // ==========================================================

  // ----------------------------------------------------------
  // NAME
  // ----------------------------------------------------------

  if (data.name !== undefined) {
    updateData.name = data.name;

    updateData.slug = slugify(
      data.name,
      {
        lower: true,
        strict: true,
      }
    );

    // Check duplicate slug
    const existingProduct =
      await Product.findOne({
        slug: updateData.slug,
        _id: {
          $ne: productId,
        },
      });

    if (existingProduct) {
      throw new Error(
        "A product with this name already exists"
      );
    }
  }

  // ----------------------------------------------------------
  // DESCRIPTION
  // ----------------------------------------------------------

  if (
    data.description !== undefined
  ) {
    updateData.description =
      data.description;
  }

  // ----------------------------------------------------------
  // CATEGORY
  // ----------------------------------------------------------

  if (
    data.category !== undefined
  ) {
    updateData.category =
      data.category;
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

  if (
    data.isActive !== undefined
  ) {
    updateData.isActive =
      data.isActive;
  }

  // ----------------------------------------------------------
  // FEATURED STATUS
  // ----------------------------------------------------------

  if (
    data.isFeatured !== undefined
  ) {
    updateData.isFeatured =
      data.isFeatured;
  }

  // ==========================================================
  // PRODUCT IMAGES
  // ==========================================================
  //
  // Existing images:
  //
  // [
  //   {
  //     url: "...",
  //     publicId: "..."
  //   }
  // ]
  //
  // New images come from Cloudinary:
  //
  // data.newImages
  //
  // Images to remove:
  //
  // data.removeImagePublicIds
  //
  // ==========================================================

  const currentImages =
    Array.isArray(product.images)
      ? product.images.map(
          (image) => {
            // Backward compatibility
            // in case old documents
            // contain plain image URLs.
            if (
              typeof image ===
              "string"
            ) {
              return {
                url: image,
                publicId: null,
              };
            }

            return image.toObject
              ? image.toObject()
              : image;
          }
        )
      : [];

  // ----------------------------------------------------------
  // PUBLIC IDS TO REMOVE
  // ----------------------------------------------------------

  const removeImagePublicIds =
    Array.isArray(
      data.removeImagePublicIds
    )
      ? data.removeImagePublicIds.filter(
          Boolean
        )
      : [];

  // ----------------------------------------------------------
  // NEW CLOUDINARY IMAGES
  // ----------------------------------------------------------

  const newImages =
    Array.isArray(data.newImages)
      ? data.newImages
      : [];

  // ----------------------------------------------------------
  // REMOVE EXISTING IMAGES
  // ----------------------------------------------------------

  const remainingImages =
    currentImages.filter(
      (image) => {
        if (!image.publicId) {
          return true;
        }

        return !removeImagePublicIds.includes(
          image.publicId
        );
      }
    );

  // ----------------------------------------------------------
  // ADD NEW IMAGES
  // ----------------------------------------------------------

  if (
    removeImagePublicIds.length >
      0 ||
    newImages.length > 0
  ) {
    updateData.images = [
      ...remainingImages,
      ...newImages,
    ];
  }

  // ==========================================================
  // PRICE PER GRAM
  // ==========================================================

  const priceChanged =
    data.pricePerGram !==
    undefined;

  if (priceChanged) {
    const newPricePerGram =
      Number(
        data.pricePerGram
      );

    if (
      Number.isNaN(
        newPricePerGram
      )
    ) {
      throw new Error(
        "pricePerGram must be a valid number"
      );
    }

    if (
      newPricePerGram < 0
    ) {
      throw new Error(
        "pricePerGram cannot be negative"
      );
    }

    updateData.pricePerGram =
      newPricePerGram;
  }

  // ==========================================================
  // UPDATE PRODUCT
  // ==========================================================

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

  if (!updatedProduct) {
    throw new Error(
      "Product not found"
    );
  }

  // ==========================================================
  // RECALCULATE VARIANT PRICES
  // ==========================================================
  //
  // Existing behavior retained:
  //
  // When pricePerGram changes,
  // variant prices are recalculated.
  //
  // Discount price is reset to null
  // if it becomes greater than the
  // newly calculated variant price.
  //
  // ==========================================================

  if (priceChanged) {
    const variants =
      await Variant.find({
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

      // ------------------------------------------------------
      // PREVENT INVALID DISCOUNT PRICE
      // ------------------------------------------------------

      if (
        discountPrice !== null &&
        Number(discountPrice) >
          newPrice
      ) {
        discountPrice = null;
      }

      // ------------------------------------------------------
      // UPDATE VARIANT PRICE
      // ------------------------------------------------------

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

  // ==========================================================
  // GET UPDATED VARIANTS
  // ==========================================================

  const variants =
    await Variant.find({
      product: productId,
    })
      .sort({
        weight: 1,
      })
      .lean();

  // ==========================================================
  // RETURN
  // ==========================================================

  return {
    ...updatedProduct,
    variants,
  };
};

// ============================================================
// DELETE PRODUCT
// ============================================================
//
// IMPORTANT:
// This function does NOT directly delete from Cloudinary.
//
// It returns the Cloudinary public IDs to the controller.
//
// The controller will then call:
//
// deleteMultipleFromCloudinary()
//
// ============================================================

export const deleteProduct = async (
  productId
) => {
  // ----------------------------------------------------------
  // FIND PRODUCT
  // ----------------------------------------------------------

  const product =
    await Product.findById(
      productId
    );

  if (!product) {
    throw new Error(
      "Product not found"
    );
  }

  // ==========================================================
  // GET CLOUDINARY PUBLIC IDS
  // ==========================================================

  const imagePublicIds =
    Array.isArray(product.images)
      ? product.images
          .map(
            (image) =>
              image?.publicId
          )
          .filter(Boolean)
      : [];

  // ==========================================================
  // DELETE ALL VARIANTS
  // ==========================================================

  await Variant.deleteMany({
    product: productId,
  });

  // ==========================================================
  // DELETE PRODUCT
  // ==========================================================

  await Product.findByIdAndDelete(
    productId
  );

  // ==========================================================
  // RETURN
  // ==========================================================

  return {
    productId,
    deleted: true,
    imagePublicIds,
  };
};

// ============================================================
// ACTIVATE PRODUCT
// ============================================================

export const activateProduct = async (
  productId
) => {
  const product =
    await Product.findByIdAndUpdate(
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
    throw new Error(
      "Product not found"
    );
  }

  return product;
};

// ============================================================
// DEACTIVATE PRODUCT
// ============================================================

export const deactivateProduct =
  async (productId) => {
    const product =
      await Product.findByIdAndUpdate(
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
      throw new Error(
        "Product not found"
      );
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
  // ----------------------------------------------------------
  // FIND PRODUCT
  // ----------------------------------------------------------

  const product =
    await Product.findById(
      productId
    );

  if (!product) {
    throw new Error(
      "Product not found"
    );
  }

  // ----------------------------------------------------------
  // GET DATA
  // ----------------------------------------------------------

  const {
    weight,
    weightUnit = "g",
    discountPrice = null,
    stock = 0,
    sku,
    isActive = true,
  } = data;

  // ----------------------------------------------------------
  // VALIDATE WEIGHT
  // ----------------------------------------------------------

  if (!weight) {
    throw new Error(
      "Weight is required"
    );
  }

  if (Number(weight) <= 0) {
    throw new Error(
      "Weight must be greater than 0"
    );
  }

  // ----------------------------------------------------------
  // CALCULATE PRICE
  // ----------------------------------------------------------

  const price =
    calculateVariantPrice(
      product.pricePerGram,
      weight,
      weightUnit
    );

  // ----------------------------------------------------------
  // VALIDATE DISCOUNT PRICE
  // ----------------------------------------------------------

  if (
    discountPrice !== null &&
    Number(discountPrice) > price
  ) {
    throw new Error(
      "Discount price cannot be greater than variant price"
    );
  }

  // ----------------------------------------------------------
  // CHECK DUPLICATE VARIANT
  // ----------------------------------------------------------

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

  // ----------------------------------------------------------
  // CREATE VARIANT
  // ----------------------------------------------------------

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
  // ----------------------------------------------------------
  // FIND VARIANT
  // ----------------------------------------------------------

  const variant =
    await Variant.findById(
      variantId
    );

  if (!variant) {
    throw new Error(
      "Variant not found"
    );
  }

  // ----------------------------------------------------------
  // FIND PRODUCT
  // ----------------------------------------------------------

  const product =
    await Product.findById(
      variant.product
    );

  if (!product) {
    throw new Error(
      "Product not found"
    );
  }

  // ==========================================================
  // GET UPDATED WEIGHT / UNIT
  // ==========================================================

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

  // ==========================================================
  // CHECK DUPLICATE VARIANT
  // ==========================================================

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

  // ==========================================================
  // PRICE
  // ==========================================================
  //
  // Admin can manually update variant price.
  //
  // If price is not provided,
  // existing price remains unchanged.
  //
  // ==========================================================

  let price;

  if (data.price !== undefined) {
    price = Number(data.price);

    if (
      Number.isNaN(price)
    ) {
      throw new Error(
        "Price must be a valid number"
      );
    }

    if (price < 0) {
      throw new Error(
        "Price cannot be negative"
      );
    }
  } else {
    price = variant.price;
  }

  // ==========================================================
  // UPDATE DATA
  // ==========================================================

  const updateData = {
    weight,
    weightUnit,
    price,
  };

  // ==========================================================
  // DISCOUNT PRICE
  // ==========================================================

  if (
    data.discountPrice !==
    undefined
  ) {
    if (
      data.discountPrice !== null &&
      Number(
        data.discountPrice
      ) < 0
    ) {
      throw new Error(
        "Discount price cannot be negative"
      );
    }

    if (
      data.discountPrice !== null &&
      Number(
        data.discountPrice
      ) > price
    ) {
      throw new Error(
        "Discount price cannot be greater than variant price"
      );
    }

    updateData.discountPrice =
      data.discountPrice === null
        ? null
        : Number(
            data.discountPrice
          );
  }

  // ==========================================================
  // SKU
  // ==========================================================

  if (data.sku !== undefined) {
    updateData.sku = data.sku;
  }

  // ==========================================================
  // ACTIVE STATUS
  // ==========================================================

  if (
    data.isActive !== undefined
  ) {
    updateData.isActive =
      data.isActive;
  }

  // ==========================================================
  // STOCK IS NOT UPDATED HERE
  // ==========================================================
  //
  // Stock has its own endpoint:
  //
  // PATCH
  // /api/admin/products/variants/:variantId/stock
  //
  // ==========================================================

  // ==========================================================
  // UPDATE VARIANT
  // ==========================================================

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
    throw new Error(
      "Variant not found"
    );
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
    throw new Error(
      "Variant not found"
    );
  }

  return {
    variantId,
    deleted: true,
  };
};

// ============================================================
// UPDATE VARIANT STOCK
// ============================================================

export const updateVariantStock =
  async (
    variantId,
    stock
  ) => {
    // --------------------------------------------------------
    // VALIDATE STOCK
    // --------------------------------------------------------

    if (stock === undefined) {
      throw new Error(
        "Stock is required"
      );
    }

    if (Number(stock) < 0) {
      throw new Error(
        "Stock cannot be negative"
      );
    }

    // --------------------------------------------------------
    // UPDATE STOCK
    // --------------------------------------------------------

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
      throw new Error(
        "Variant not found"
      );
    }

    return variant;
  };