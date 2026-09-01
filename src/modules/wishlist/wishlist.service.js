
import mongoose from "mongoose";

import Wishlist from "./wishlist.model.js";
import Product from "../product/product.model.js";

// ============================================================
// GET CUSTOMER WISHLIST
// ============================================================

export const getWishlist = async (customerId) => {
  if (!customerId) {
    throw new Error(
      "Customer ID is required"
    );
  }

  const wishlist =
    await Wishlist.findOne({
      customer: customerId,
    }).populate({
      path: "products",
      select:
        "name slug price mrp sellingPrice image images stock category description",
      populate: {
        path: "category",
        select: "name slug",
      },
    });

  // ==========================================================
  // RETURN EMPTY WISHLIST
  // ==========================================================

  if (!wishlist) {
    return {
      customer: customerId,
      products: [],
    };
  }

  return wishlist;
};

// ============================================================
// ADD PRODUCT TO WISHLIST
// ============================================================

export const addToWishlist = async (
  customerId,
  productId
) => {
  if (!customerId) {
    throw new Error(
      "Customer ID is required"
    );
  }

  if (!productId) {
    throw new Error(
      "Product ID is required"
    );
  }

  // ==========================================================
  // VALIDATE PRODUCT ID
  // ==========================================================

  if (
    !mongoose.Types.ObjectId.isValid(
      productId
    )
  ) {
    throw new Error(
      "Invalid product ID"
    );
  }

  // ==========================================================
  // CHECK PRODUCT
  // ==========================================================

  const product =
    await Product.findById(productId);

  if (!product) {
    throw new Error(
      "Product not found"
    );
  }

  // ==========================================================
  // FIND CUSTOMER WISHLIST
  // ==========================================================

  let wishlist =
    await Wishlist.findOne({
      customer: customerId,
    });

  // ==========================================================
  // CREATE WISHLIST
  // ==========================================================

  if (!wishlist) {
    wishlist =
      await Wishlist.create({
        customer: customerId,
        products: [productId],
      });
  } else {
    // ========================================================
    // CHECK DUPLICATE PRODUCT
    // ========================================================

    const alreadyExists =
      wishlist.products.some(
        (id) =>
          id.toString() ===
          productId.toString()
      );

    if (alreadyExists) {
      throw new Error(
        "Product is already in your wishlist"
      );
    }

    // ========================================================
    // ADD PRODUCT
    // ========================================================

    wishlist.products.push(
      productId
    );

    await wishlist.save();
  }

  // ==========================================================
  // POPULATE PRODUCTS
  // ==========================================================

  await wishlist.populate({
    path: "products",
    select:
      "name slug price mrp sellingPrice image images stock category description",
    populate: {
      path: "category",
      select: "name slug",
    },
  });

  return wishlist;
};

// ============================================================
// REMOVE PRODUCT FROM WISHLIST
// ============================================================

export const removeFromWishlist = async (
  customerId,
  productId
) => {
  if (!customerId) {
    throw new Error(
      "Customer ID is required"
    );
  }

  if (!productId) {
    throw new Error(
      "Product ID is required"
    );
  }

  // ==========================================================
  // VALIDATE PRODUCT ID
  // ==========================================================

  if (
    !mongoose.Types.ObjectId.isValid(
      productId
    )
  ) {
    throw new Error(
      "Invalid product ID"
    );
  }

  // ==========================================================
  // FIND WISHLIST
  // ==========================================================

  const wishlist =
    await Wishlist.findOne({
      customer: customerId,
    });

  if (!wishlist) {
    throw new Error(
      "Wishlist not found"
    );
  }

  // ==========================================================
  // CHECK PRODUCT
  // ==========================================================

  const productExists =
    wishlist.products.some(
      (id) =>
        id.toString() ===
        productId.toString()
    );

  if (!productExists) {
    throw new Error(
      "Product is not in your wishlist"
    );
  }

  // ==========================================================
  // REMOVE PRODUCT
  // ==========================================================

  wishlist.products =
    wishlist.products.filter(
      (id) =>
        id.toString() !==
        productId.toString()
    );

  await wishlist.save();

  // ==========================================================
  // POPULATE PRODUCTS
  // ==========================================================

  await wishlist.populate({
    path: "products",
    select:
      "name slug price mrp sellingPrice image images stock category description",
    populate: {
      path: "category",
      select: "name slug",
    },
  });

  return wishlist;
};

// ============================================================
// CLEAR CUSTOMER WISHLIST
// ============================================================

export const clearWishlist = async (
  customerId
) => {
  if (!customerId) {
    throw new Error(
      "Customer ID is required"
    );
  }

  // ==========================================================
  // FIND WISHLIST
  // ==========================================================

  const wishlist =
    await Wishlist.findOne({
      customer: customerId,
    });

  // ==========================================================
  // ALREADY EMPTY
  // ==========================================================

  if (!wishlist) {
    return {
      customer: customerId,
      products: [],
    };
  }

  // ==========================================================
  // REMOVE ALL PRODUCTS
  // ==========================================================

  wishlist.products = [];

  await wishlist.save();

  return wishlist;
};

