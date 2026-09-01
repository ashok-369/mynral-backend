
import mongoose from "mongoose";

import Wishlist from "./wishlist.model.js";
import Product from "../products/product.model.js";

// ============================================================
// GET MY WISHLIST
// ============================================================

export const getWishlistController = async (
  req,
  res,
  next
) => {
  try {
    const customerId =
      req.user?.id ||
      req.user?._id;

    if (!customerId) {
      return res.status(401).json({
        success: false,
        statusCode: 401,
        message: "Customer authentication required",
      });
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

    // ========================================================
    // NO WISHLIST YET
    // ========================================================

    if (!wishlist) {
      return res.status(200).json({
        success: true,
        statusCode: 200,
        message: "Wishlist fetched successfully",
        data: {
          wishlist: {
            customer: customerId,
            products: [],
          },
        },
      });
    }

    // ========================================================
    // RESPONSE
    // ========================================================

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Wishlist fetched successfully",
      data: {
        wishlist,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// ADD PRODUCT TO WISHLIST
// ============================================================

export const addToWishlistController = async (
  req,
  res,
  next
) => {
  try {
    const customerId =
      req.user?.id ||
      req.user?._id;

    const { productId } = req.params;

    // ========================================================
    // AUTH CHECK
    // ========================================================

    if (!customerId) {
      return res.status(401).json({
        success: false,
        statusCode: 401,
        message: "Customer authentication required",
      });
    }

    // ========================================================
    // PRODUCT ID VALIDATION
    // ========================================================

    if (
      !mongoose.Types.ObjectId.isValid(
        productId
      )
    ) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: "Invalid product ID",
      });
    }

    // ========================================================
    // CHECK PRODUCT
    // ========================================================

    const product =
      await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: "Product not found",
      });
    }

    // ========================================================
    // FIND OR CREATE WISHLIST
    // ========================================================

    let wishlist =
      await Wishlist.findOne({
        customer: customerId,
      });

    if (!wishlist) {
      wishlist = await Wishlist.create({
        customer: customerId,
        products: [productId],
      });
    } else {
      // ======================================================
      // CHECK DUPLICATE
      // ======================================================

      const alreadyExists =
        wishlist.products.some(
          (id) =>
            id.toString() ===
            productId.toString()
        );

      if (alreadyExists) {
        return res.status(409).json({
          success: false,
          statusCode: 409,
          message:
            "Product is already in your wishlist",
        });
      }

      wishlist.products.push(productId);

      await wishlist.save();
    }

    // ========================================================
    // POPULATE PRODUCTS
    // ========================================================

    await wishlist.populate({
      path: "products",
      select:
        "name slug price mrp sellingPrice image images stock category description",
      populate: {
        path: "category",
        select: "name slug",
      },
    });

    // ========================================================
    // RESPONSE
    // ========================================================

    return res.status(201).json({
      success: true,
      statusCode: 201,
      message:
        "Product added to wishlist successfully",
      data: {
        wishlist,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// REMOVE PRODUCT FROM WISHLIST
// ============================================================

export const removeFromWishlistController = async (
  req,
  res,
  next
) => {
  try {
    const customerId =
      req.user?.id ||
      req.user?._id;

    const { productId } = req.params;

    // ========================================================
    // AUTH CHECK
    // ========================================================

    if (!customerId) {
      return res.status(401).json({
        success: false,
        statusCode: 401,
        message: "Customer authentication required",
      });
    }

    // ========================================================
    // PRODUCT ID VALIDATION
    // ========================================================

    if (
      !mongoose.Types.ObjectId.isValid(
        productId
      )
    ) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: "Invalid product ID",
      });
    }

    // ========================================================
    // FIND WISHLIST
    // ========================================================

    const wishlist =
      await Wishlist.findOne({
        customer: customerId,
      });

    if (!wishlist) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: "Wishlist not found",
      });
    }

    // ========================================================
    // CHECK PRODUCT
    // ========================================================

    const productExists =
      wishlist.products.some(
        (id) =>
          id.toString() ===
          productId.toString()
      );

    if (!productExists) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message:
          "Product is not in your wishlist",
      });
    }

    // ========================================================
    // REMOVE PRODUCT
    // ========================================================

    wishlist.products =
      wishlist.products.filter(
        (id) =>
          id.toString() !==
          productId.toString()
      );

    await wishlist.save();

    // ========================================================
    // POPULATE PRODUCTS
    // ========================================================

    await wishlist.populate({
      path: "products",
      select:
        "name slug price mrp sellingPrice image images stock category description",
      populate: {
        path: "category",
        select: "name slug",
      },
    });

    // ========================================================
    // RESPONSE
    // ========================================================

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message:
        "Product removed from wishlist successfully",
      data: {
        wishlist,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// CLEAR WISHLIST
// ============================================================

export const clearWishlistController = async (
  req,
  res,
  next
) => {
  try {
    const customerId =
      req.user?.id ||
      req.user?._id;

    // ========================================================
    // AUTH CHECK
    // ========================================================

    if (!customerId) {
      return res.status(401).json({
        success: false,
        statusCode: 401,
        message: "Customer authentication required",
      });
    }

    // ========================================================
    // FIND WISHLIST
    // ========================================================

    const wishlist =
      await Wishlist.findOne({
        customer: customerId,
      });

    if (!wishlist) {
      return res.status(200).json({
        success: true,
        statusCode: 200,
        message: "Wishlist is already empty",
        data: {
          wishlist: {
            customer: customerId,
            products: [],
          },
        },
      });
    }

    // ========================================================
    // CLEAR PRODUCTS
    // ========================================================

    wishlist.products = [];

    await wishlist.save();

    // ========================================================
    // RESPONSE
    // ========================================================

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message:
        "Wishlist cleared successfully",
      data: {
        wishlist,
      },
    });
  } catch (error) {
    next(error);
  }
};
