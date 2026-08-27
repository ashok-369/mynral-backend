import ApiError from "../../utils/ApiError.js";

import Product from "../products/product.model.js";

import {
  findCartByCustomerId,
  createCart,
  updateCart,
  deleteCart,
} from "./cart.repository.js";

// ============================================================
// GET CART
// ============================================================

export const getCustomerCart = async (
  customerId
) => {
  let cart =
    await findCartByCustomerId(
      customerId
    );

  if (!cart) {
    cart =
      await createCart(customerId);
  }

  return cart;
};

// ============================================================
// ADD TO CART
// ============================================================

export const addProductToCart = async (
  customerId,
  data
) => {
  const {
    productId,
    quantity = 1,
  } = data;

  if (!productId) {
    throw new ApiError(
      400,
      "Product ID is required"
    );
  }

  if (
    !Number.isInteger(quantity) ||
    quantity < 1
  ) {
    throw new ApiError(
      400,
      "Quantity must be at least 1"
    );
  }

  // ----------------------------------------------------------
  // Check product
  // ----------------------------------------------------------

  const product =
    await Product.findById(
      productId
    );

  if (!product) {
    throw new ApiError(
      404,
      "Product not found"
    );
  }

  // ----------------------------------------------------------
  // Check product status
  // ----------------------------------------------------------

  if (
    product.isActive === false
  ) {
    throw new ApiError(
      400,
      "Product is currently unavailable"
    );
  }

  // ----------------------------------------------------------
  // Check stock
  // ----------------------------------------------------------

  if (
    product.stock < quantity
  ) {
    throw new ApiError(
      400,
      "Insufficient product stock"
    );
  }

  // ----------------------------------------------------------
  // Get / create cart
  // ----------------------------------------------------------

  let cart =
    await findCartByCustomerId(
      customerId
    );

  if (!cart) {
    cart =
      await createCart(customerId);
  }

  // ----------------------------------------------------------
  // Check existing item
  // ----------------------------------------------------------

  const existingItem =
    cart.items.find(
      (item) =>
        item.product._id.toString() ===
        productId.toString()
    );

  if (existingItem) {
    const newQuantity =
      existingItem.quantity +
      quantity;

    if (
      newQuantity > product.stock
    ) {
      throw new ApiError(
        400,
        `Only ${product.stock} items are available`
      );
    }

    existingItem.quantity =
      newQuantity;
  } else {
    cart.items.push({
      product: productId,
      quantity,
    });
  }

  await cart.save();

  return findCartByCustomerId(
    customerId
  );
};

// ============================================================
// UPDATE CART ITEM
// ============================================================

export const updateCartItem = async (
  customerId,
  productId,
  quantity
) => {
  if (
    !Number.isInteger(quantity) ||
    quantity < 1
  ) {
    throw new ApiError(
      400,
      "Quantity must be at least 1"
    );
  }

  const product =
    await Product.findById(
      productId
    );

  if (!product) {
    throw new ApiError(
      404,
      "Product not found"
    );
  }

  if (
    quantity > product.stock
  ) {
    throw new ApiError(
      400,
      `Only ${product.stock} items are available`
    );
  }

  const cart =
    await findCartByCustomerId(
      customerId
    );

  if (!cart) {
    throw new ApiError(
      404,
      "Cart not found"
    );
  }

  const item =
    cart.items.find(
      (item) =>
        item.product._id.toString() ===
        productId.toString()
    );

  if (!item) {
    throw new ApiError(
      404,
      "Product is not in cart"
    );
  }

  item.quantity = quantity;

  await cart.save();

  return findCartByCustomerId(
    customerId
  );
};

// ============================================================
// REMOVE CART ITEM
// ============================================================

export const removeCartItem = async (
  customerId,
  productId
) => {
  const cart =
    await findCartByCustomerId(
      customerId
    );

  if (!cart) {
    throw new ApiError(
      404,
      "Cart not found"
    );
  }

  const originalLength =
    cart.items.length;

  cart.items =
    cart.items.filter(
      (item) =>
        item.product._id.toString() !==
        productId.toString()
    );

  if (
    cart.items.length ===
    originalLength
  ) {
    throw new ApiError(
      404,
      "Product is not in cart"
    );
  }

  await cart.save();

  return findCartByCustomerId(
    customerId
  );
};

// ============================================================
// CLEAR CART
// ============================================================

export const clearCustomerCart = async (
  customerId
) => {
  await deleteCart(customerId);

  return {
    cartCleared: true,
  };
};