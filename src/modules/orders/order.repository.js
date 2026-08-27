import Order from "./order.model.js";

// ============================================================
// CREATE ORDER
// ============================================================

export const createOrder = async (orderData) => {
  return Order.create(orderData);
};

// ============================================================
// FIND ORDER BY ID
// ============================================================

export const findOrderById = async (orderId) => {
  return Order.findById(orderId)
    .populate(
      "items.product",
      "name slug images price sku"
    );
};

// ============================================================
// FIND CUSTOMER ORDERS
// ============================================================

export const findCustomerOrders = async (
  customerId
) => {
  return Order.find({
    customer: customerId,
  })
    .sort({
      createdAt: -1,
    })
    .populate(
      "items.product",
      "name slug images price sku"
    );
};

// ============================================================
// FIND CUSTOMER ORDER
// ============================================================

export const findCustomerOrder = async (
  orderId,
  customerId
) => {
  return Order.findOne({
    _id: orderId,
    customer: customerId,
  }).populate(
    "items.product",
    "name slug images price sku"
  );
};

// ============================================================
// UPDATE ORDER
// ============================================================

export const updateOrder = async (
  orderId,
  updateData
) => {
  return Order.findByIdAndUpdate(
    orderId,
    updateData,
    {
      new: true,
      runValidators: true,
    }
  ).populate(
    "items.product",
    "name slug images price sku"
  );
};