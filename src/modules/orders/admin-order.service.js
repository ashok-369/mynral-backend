import mongoose from "mongoose";
import ApiError from "../../utils/ApiError.js";

import Order from "./order.model.js";
import Product from "../products/product.model.js";

// ============================================================
// GET ALL ORDERS
// ============================================================

export const getAllOrders = async (query = {}) => {
  const {
    page = 1,
    limit = 20,
    status,
    paymentStatus,
  } = query;

  const currentPage = Math.max(
    Number(page) || 1,
    1
  );

  const currentLimit = Math.min(
    Math.max(Number(limit) || 20, 1),
    100
  );

  const skip =
    (currentPage - 1) * currentLimit;

  // ----------------------------------------------------------
  // Build filter
  // ----------------------------------------------------------

  const filter = {};

  if (status) {
    filter.orderStatus = status;
  }

  if (paymentStatus) {
    filter.paymentStatus = paymentStatus;
  }

  // ----------------------------------------------------------
  // Fetch orders
  // ----------------------------------------------------------

  const [orders, total] =
    await Promise.all([
      Order.find(filter)
        .populate(
          "customer",
          "firstName lastName mobile email"
        )
        .populate(
          "items.product",
          "name slug images price sku"
        )
        .sort({
          createdAt: -1,
        })
        .skip(skip)
        .limit(currentLimit),

      Order.countDocuments(filter),
    ]);

  const totalPages = Math.ceil(
    total / currentLimit
  );

  return {
    orders,

    pagination: {
      page: currentPage,
      limit: currentLimit,
      total,
      totalPages,

      hasNextPage:
        currentPage < totalPages,

      hasPreviousPage:
        currentPage > 1,
    },
  };
};

// ============================================================
// GET SINGLE ORDER
// ============================================================

export const getAdminOrder = async (
  orderId
) => {
  // ----------------------------------------------------------
  // Validate order ID
  // ----------------------------------------------------------

  if (
    !mongoose.Types.ObjectId.isValid(
      orderId
    )
  ) {
    throw new ApiError(
      400,
      "Invalid order ID"
    );
  }

  // ----------------------------------------------------------
  // Find order
  // ----------------------------------------------------------

  const order =
    await Order.findById(orderId)
      .populate(
        "customer",
        "firstName lastName mobile email"
      )
      .populate(
        "items.product",
        "name slug images price sku"
      );

  if (!order) {
    throw new ApiError(
      404,
      "Order not found"
    );
  }

  return order;
};

// ============================================================
// UPDATE ORDER STATUS
// ============================================================

export const updateOrderStatus = async (
  orderId,
  newStatus
) => {
  // ----------------------------------------------------------
  // Validate order ID
  // ----------------------------------------------------------

  if (
    !mongoose.Types.ObjectId.isValid(
      orderId
    )
  ) {
    throw new ApiError(
      400,
      "Invalid order ID"
    );
  }

  // ----------------------------------------------------------
  // Allowed statuses
  // ----------------------------------------------------------

  const allowedStatuses = [
    "PLACED",
    "CONFIRMED",
    "PROCESSING",
    "SHIPPED",
    "DELIVERED",
  ];

  if (
    !allowedStatuses.includes(
      newStatus
    )
  ) {
    throw new ApiError(
      400,
      "Invalid order status"
    );
  }

  // ----------------------------------------------------------
  // Find order
  // ----------------------------------------------------------

  const order =
    await Order.findById(orderId);

  if (!order) {
    throw new ApiError(
      404,
      "Order not found"
    );
  }

  // ----------------------------------------------------------
  // Cannot update cancelled order
  // ----------------------------------------------------------

  if (
    order.orderStatus ===
    "CANCELLED"
  ) {
    throw new ApiError(
      400,
      "Cancelled orders cannot be updated"
    );
  }

  // ----------------------------------------------------------
  // Cannot change delivered order
  // ----------------------------------------------------------

  if (
    order.orderStatus ===
    "DELIVERED"
  ) {
    throw new ApiError(
      400,
      "Delivered orders cannot be updated"
    );
  }

  // ----------------------------------------------------------
  // Validate status transition
  // ----------------------------------------------------------

  const statusFlow = [
    "PLACED",
    "CONFIRMED",
    "PROCESSING",
    "SHIPPED",
    "DELIVERED",
  ];

  const currentIndex =
    statusFlow.indexOf(
      order.orderStatus
    );

  const newIndex =
    statusFlow.indexOf(
      newStatus
    );

  // Allow moving forward only
  if (newIndex < currentIndex) {
    throw new ApiError(
      400,
      `Order cannot move from ${order.orderStatus} to ${newStatus}`
    );
  }

  // ----------------------------------------------------------
  // Update order
  // ----------------------------------------------------------

  order.orderStatus =
    newStatus;

  // COD remains pending until delivery/payment collection.
  // For now we don't automatically mark COD as PAID.

  await order.save();

  // ----------------------------------------------------------
  // Return populated order
  // ----------------------------------------------------------

  return Order.findById(
    order._id
  )
    .populate(
      "customer",
      "firstName lastName mobile email"
    )
    .populate(
      "items.product",
      "name slug images price sku"
    );
};

// ============================================================
// CANCEL ORDER
// ============================================================

export const cancelAdminOrder = async (
  orderId,
  reason = "Cancelled by admin"
) => {
  // ----------------------------------------------------------
  // Validate order ID
  // ----------------------------------------------------------

  if (
    !mongoose.Types.ObjectId.isValid(
      orderId
    )
  ) {
    throw new ApiError(
      400,
      "Invalid order ID"
    );
  }

  // ----------------------------------------------------------
  // Find order
  // ----------------------------------------------------------

  const order =
    await Order.findById(orderId);

  if (!order) {
    throw new ApiError(
      404,
      "Order not found"
    );
  }

  // ----------------------------------------------------------
  // Already cancelled
  // ----------------------------------------------------------

  if (
    order.orderStatus ===
    "CANCELLED"
  ) {
    throw new ApiError(
      400,
      "Order is already cancelled"
    );
  }

  // ----------------------------------------------------------
  // Cannot cancel delivered order
  // ----------------------------------------------------------

  if (
    order.orderStatus ===
    "DELIVERED"
  ) {
    throw new ApiError(
      400,
      "Delivered orders cannot be cancelled"
    );
  }

  // ----------------------------------------------------------
  // Update order
  // ----------------------------------------------------------

  order.orderStatus =
    "CANCELLED";

  order.cancelledAt =
    new Date();

  order.cancellationReason =
    reason;

  await order.save();

  // ----------------------------------------------------------
  // Restore product stock
  // ----------------------------------------------------------

  for (const item of order.items) {
    await Product.updateOne(
      {
        _id: item.product,
      },
      {
        $inc: {
          stock: item.quantity,
        },
      }
    );
  }

  // ----------------------------------------------------------
  // Return updated order
  // ----------------------------------------------------------

  return Order.findById(
    order._id
  )
    .populate(
      "customer",
      "firstName lastName mobile email"
    )
    .populate(
      "items.product",
      "name slug images price sku"
    );
};