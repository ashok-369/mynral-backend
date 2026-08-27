import Cart from "./cart.model.js";

// ============================================================
// FIND CART
// ============================================================

export const findCartByCustomerId = async (
  customerId
) => {
  return Cart.findOne({
    customer: customerId,
  }).populate("items.product");
};

// ============================================================
// CREATE CART
// ============================================================

export const createCart = async (
  customerId
) => {
  return Cart.create({
    customer: customerId,
    items: [],
  });
};

// ============================================================
// UPDATE CART
// ============================================================

export const updateCart = async (
  customerId,
  items
) => {
  return Cart.findOneAndUpdate(
    {
      customer: customerId,
    },
    {
      items,
    },
    {
      new: true,
      runValidators: true,
    }
  ).populate("items.product");
};

// ============================================================
// DELETE CART
// ============================================================

export const deleteCart = async (
  customerId
) => {
  return Cart.findOneAndDelete({
    customer: customerId,
  });
};

// ============================================================
// CLEAR CART
// ============================================================

export const clearCart = async (
  customerId
) => {
  return Cart.findOneAndUpdate(
    {
      customer: customerId,
    },
    {
      $set: {
        items: [],
      },
    },
    {
      new: true,
    }
  ).populate("items.product");
};