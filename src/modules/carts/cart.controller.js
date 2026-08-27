import asyncHandler from "../../utils/asyncHandler.js";
import successResponse from "../../utils/response.js";

import {
  getCustomerCart,
  addProductToCart,
  updateCartItem,
  removeCartItem,
  clearCustomerCart,
} from "./cart.service.js";

// ============================================================
// GET CART
// ============================================================

export const getCartController =
  asyncHandler(async (req, res) => {
    const cart =
      await getCustomerCart(
        req.customer.id
      );

    return successResponse(res, {
      statusCode: 200,
      message: "Cart fetched successfully",
      data: {
        cart,
      },
    });
  });

// ============================================================
// ADD PRODUCT TO CART
// ============================================================

export const addToCartController =
  asyncHandler(async (req, res) => {
    const cart =
      await addProductToCart(
        req.customer.id,
        req.body
      );

    return successResponse(res, {
      statusCode: 200,
      message: "Product added to cart successfully",
      data: {
        cart,
      },
    });
  });

// ============================================================
// UPDATE CART ITEM QUANTITY
// ============================================================

export const updateCartItemController =
  asyncHandler(async (req, res) => {
    const { productId } = req.params;
    const { quantity } = req.body;

    const cart =
      await updateCartItem(
        req.customer.id,
        productId,
        quantity
      );

    return successResponse(res, {
      statusCode: 200,
      message: "Cart item updated successfully",
      data: {
        cart,
      },
    });
  });

// ============================================================
// REMOVE PRODUCT FROM CART
// ============================================================

export const removeCartItemController =
  asyncHandler(async (req, res) => {
    const { productId } = req.params;

    const cart =
      await removeCartItem(
        req.customer.id,
        productId
      );

    return successResponse(res, {
      statusCode: 200,
      message: "Product removed from cart successfully",
      data: {
        cart,
      },
    });
  });

// ============================================================
// CLEAR CART
// ============================================================

export const clearCartController =
  asyncHandler(async (req, res) => {
    const result =
      await clearCustomerCart(
        req.customer.id
      );

    return successResponse(res, {
      statusCode: 200,
      message: "Cart cleared successfully",
      data: result,
    });
  });