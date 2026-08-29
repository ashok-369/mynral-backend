import {
  sendOrderStatusUpdate,
  sendOrderShipped,
  sendOrderDelivered,
  sendOrderCancellation,
} from "../../notifications/notification.service.js";


import Order from "../../orders/order.model.js";
import ApiError from "../../../utils/ApiError.js";
import Product from "../../products/product.model.js";

import {
  findCustomerById,
} from "../../customers/customer.repository.js";

// ============================================================
// GET ALL ORDERS
// ============================================================

export const getAllOrders = async ({
  status,
  search,
  page = 1,
  limit = 20,
}) => {
  const currentPage = Math.max(
    Number(page) || 1,
    1
  );

  const perPage = Math.min(
    Math.max(Number(limit) || 20, 1),
    100
  );

  const skip =
    (currentPage - 1) * perPage;

  // ==========================================================
  // Build Filter
  // ==========================================================

  const filter = {};

  // Filter by order status
  if (status) {
    filter.orderStatus =
      status.toUpperCase();
  }

  // Search by order number
  if (search && search.trim()) {
    filter.orderNumber = {
      $regex: search.trim(),
      $options: "i",
    };
  }

  // ==========================================================
  // Get Total Count
  // ==========================================================

  const totalOrders =
    await Order.countDocuments(filter);

  // ==========================================================
  // Get Orders
  // ==========================================================

  const orders = await Order.find(filter)
    .populate(
      "customer",
      "name email mobile phone"
    )
    .sort({
      createdAt: -1,
    })
    .skip(skip)
    .limit(perPage)
    .lean();

  // ==========================================================
  // Pagination
  // ==========================================================

  const totalPages = Math.ceil(
    totalOrders / perPage
  );

  return {
    orders,

    pagination: {
      currentPage,
      limit: perPage,
      totalOrders,
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

export const getAdminOrderById = async (
  orderId
) => {
  const order =
    await Order.findById(orderId)
      .populate(
        "customer",
        "name email mobile phone"
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
  // ==========================================================
  // Find Order
  // ==========================================================

  const order = await Order.findById(orderId);

  if (!order) {
    throw new ApiError(
      404,
      "Order not found"
    );
  }

  // ==========================================================
  // Normalize Status
  // ==========================================================

  const status = String(newStatus)
    .trim()
    .toUpperCase();

  // ==========================================================
  // Allowed Statuses
  // ==========================================================

  const allowedStatuses = [
    "PLACED",
    "CONFIRMED",
    "PROCESSING",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED",
  ];

  if (!allowedStatuses.includes(status)) {
    throw new ApiError(
      400,
      "Invalid order status"
    );
  }

  // ==========================================================
  // Same Status Check
  // ==========================================================

  if (order.orderStatus === status) {
    throw new ApiError(
      400,
      `Order is already ${status}`
    );
  }

  // ==========================================================
  // Valid Status Transitions
  // ==========================================================

  const validTransitions = {
    PLACED: [
      "CONFIRMED",
      "CANCELLED",
    ],

    CONFIRMED: [
      "PROCESSING",
      "CANCELLED",
    ],

    PROCESSING: [
      "SHIPPED",
      "CANCELLED",
    ],

    SHIPPED: [
      "DELIVERED",
    ],

    DELIVERED: [],

    CANCELLED: [],
  };

  // ==========================================================
  // Current Status
  // ==========================================================

  const currentStatus =
    order.orderStatus;

  const possibleStatuses =
    validTransitions[currentStatus] || [];

  // ==========================================================
  // Validate Transition
  // ==========================================================

  if (!possibleStatuses.includes(status)) {
    throw new ApiError(
      400,
      `Cannot change order status from ${currentStatus} to ${status}`
    );
  }

  // ==========================================================
  // ADMIN CANCELLATION
  // ==========================================================

  if (status === "CANCELLED") {
    // --------------------------------------------------------
    // Restore Product Stock
    // --------------------------------------------------------

    for (const item of order.items) {
      const result =
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

      if (result.modifiedCount !== 1) {
        throw new ApiError(
          400,
          `Unable to restore stock for product "${item.name}"`
        );
      }
    }

    // --------------------------------------------------------
    // Cancellation Details
    // --------------------------------------------------------

    order.cancelledAt = new Date();

    order.cancellationReason =
      "Cancelled by admin";
  }

  // ==========================================================
  // Update Order Status
  // ==========================================================

  order.orderStatus = status;

  // ==========================================================
  // Save Order
  // ==========================================================

  const updatedOrder = await order.save();

  // ==========================================================
  // SEND CUSTOMER STATUS EMAIL
  // ==========================================================

  try {
    const customer =
      await findCustomerById(
        updatedOrder.customer
      );

    if (customer?.email) {
      const customerName =
        `${customer.firstName || ""} ${
          customer.lastName || ""
        }`.trim();

      // ------------------------------------------------------
      // SHIPPED EMAIL
      // ------------------------------------------------------

      if (
        updatedOrder.orderStatus ===
        "SHIPPED"
      ) {
        await sendOrderShipped({
          customerEmail:
            customer.email,

          customerName,

          orderNumber:
            updatedOrder.orderNumber,
        });
      }

      // ------------------------------------------------------
      // DELIVERED EMAIL
      // ------------------------------------------------------

      else if (
        updatedOrder.orderStatus ===
        "DELIVERED"
      ) {
        await sendOrderDelivered({
          customerEmail:
            customer.email,

          customerName,

          orderNumber:
            updatedOrder.orderNumber,
        });
      }

      // ------------------------------------------------------
      // OTHER STATUS EMAIL
      // CONFIRMED / PROCESSING
      // ------------------------------------------------------

      else if (
        [
          "CONFIRMED",
          "PROCESSING",
        ].includes(
          updatedOrder.orderStatus
        )
      ) {
        await sendOrderStatusUpdate({
          customerEmail:
            customer.email,

          customerName,

          orderNumber:
            updatedOrder.orderNumber,

          status:
            updatedOrder.orderStatus,
        });
      }
    }
  } catch (emailError) {
    // --------------------------------------------------------
    // Email failure must NOT fail order status update
    // --------------------------------------------------------

    console.error(
      "⚠️ Order status updated successfully, but email failed:",
      emailError.message
    );
  }

  // ==========================================================
  // RETURN UPDATED ORDER
  // ==========================================================

  return updatedOrder;
};

// ============================================================
// ADMIN CANCEL ORDER
// ============================================================

export const cancelAdminOrder = async (
  orderId,
  reason = "Cancelled by admin"
) => {
  // ----------------------------------------------------------
  // Find order
  // ----------------------------------------------------------

  const order = await Order.findById(orderId);

  if (!order) {
    throw new ApiError(
      404,
      "Order not found"
    );
  }

  // ----------------------------------------------------------
  // Check current status
  // ----------------------------------------------------------

  if (order.orderStatus === "CANCELLED") {
    throw new ApiError(
      400,
      "Order is already cancelled"
    );
  }

  if (order.orderStatus === "DELIVERED") {
    throw new ApiError(
      400,
      "Delivered orders cannot be cancelled"
    );
  }

  if (order.orderStatus === "SHIPPED") {
    throw new ApiError(
      400,
      "Shipped orders cannot be cancelled"
    );
  }

  // ----------------------------------------------------------
  // Allowed cancellation statuses
  // ----------------------------------------------------------

  const cancellableStatuses = [
    "PLACED",
    "CONFIRMED",
    "PROCESSING",
  ];

  if (
    !cancellableStatuses.includes(
      order.orderStatus
    )
  ) {
    throw new ApiError(
      400,
      `Order cannot be cancelled when status is ${order.orderStatus}`
    );
  }

  // ----------------------------------------------------------
  // Restore stock
  // ----------------------------------------------------------

  for (const item of order.items) {
    const result =
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

    if (result.modifiedCount !== 1) {
      throw new ApiError(
        400,
        `Unable to restore stock for product "${item.name}"`
      );
    }
  }

  // ----------------------------------------------------------
  // Update cancellation details
  // ----------------------------------------------------------

  order.orderStatus = "CANCELLED";

  order.cancelledAt = new Date();

  order.cancellationReason =
    reason?.trim() ||
    "Cancelled by admin";

  // ----------------------------------------------------------
  // Save
  // ----------------------------------------------------------

  // ----------------------------------------------------------
// Send cancellation email
// ----------------------------------------------------------

try {
  const customer =
    await findCustomerById(
      order.customer
    );

  if (customer?.email) {
    const customerName =
      `${customer.firstName || ""} ${
        customer.lastName || ""
      }`.trim();

    await sendOrderCancellation({
      customerEmail:
        customer.email,

      customerName,

      orderNumber:
        order.orderNumber,

      reason:
        order.cancellationReason,
    });
  }
} catch (emailError) {
  console.error(
    "⚠️ Order cancelled successfully, but cancellation email failed:",
    emailError.message
  );
}

  // ----------------------------------------------------------
  // Return updated order
  // ----------------------------------------------------------

  return order;
};

