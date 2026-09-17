import mongoose from "mongoose";

import {
  sendOrderStatusUpdate,
  sendOrderShipped,
  sendOrderDelivered,
  sendOrderCancellation,
  createCustomerOrderNotification,
  createAdminOrderNotification,
} from "../../notifications/notification.service.js";

import Order from "../../orders/order.model.js";
import ApiError from "../../../utils/ApiError.js";

import Product from "../../products/product.model.js";
import Variant from "../../products/variant.model.js";

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
  // BUILD FILTER
  // ==========================================================

  const filter = {};

  if (status) {
    filter.orderStatus =
      String(status)
        .trim()
        .toUpperCase();
  }

  if (search && search.trim()) {
    filter.orderNumber = {
      $regex: search.trim(),
      $options: "i",
    };
  }

  // ==========================================================
  // GET TOTAL COUNT
  // ==========================================================

  const totalOrders =
    await Order.countDocuments(filter);

  // ==========================================================
  // GET ORDERS
  // ==========================================================

  const orders =
    await Order.find(filter)
      .populate(
        "customer",
        "firstName lastName email mobile phone"
      )
      .sort({
        createdAt: -1,
      })
      .skip(skip)
      .limit(perPage)
      .lean();

  // ==========================================================
  // PAGINATION
  // ==========================================================

  const totalPages =
    Math.ceil(
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
  if (
    !orderId ||
    !mongoose.Types.ObjectId.isValid(orderId)
  ) {
    throw new ApiError(
      400,
      "Invalid order ID"
    );
  }

  const order =
    await Order.findById(orderId)
      .populate(
        "customer",
        "firstName lastName email mobile phone"
      )
      .populate(
        "items.product",
        "name slug images price discountPrice sku"
      )
      .populate(
        "items.variant",
        "weight weightUnit price discountPrice stock sku isActive"
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
  // FIND ORDER
  // ==========================================================

  const order =
    await Order.findById(orderId);

  if (!order) {
    throw new ApiError(
      404,
      "Order not found"
    );
  }

  // ==========================================================
  // NORMALIZE STATUS
  // ==========================================================

  const status =
    String(newStatus)
      .trim()
      .toUpperCase();

  // ==========================================================
  // ALLOWED STATUSES
  // ==========================================================

  const allowedStatuses = [
    "PLACED",
    "CONFIRMED",
    "PROCESSING",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED",
  ];

  if (
    !allowedStatuses.includes(status)
  ) {
    throw new ApiError(
      400,
      "Invalid order status"
    );
  }

  // ==========================================================
  // SAME STATUS
  // ==========================================================

  if (
    order.orderStatus === status
  ) {
    throw new ApiError(
      400,
      `Order is already ${status}`
    );
  }

  // ==========================================================
  // VALID STATUS TRANSITIONS
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
  // CURRENT STATUS
  // ==========================================================

  const currentStatus =
    order.orderStatus;

  const possibleStatuses =
    validTransitions[
      currentStatus
    ] || [];

  // ==========================================================
  // VALIDATE TRANSITION
  // ==========================================================

  if (
    !possibleStatuses.includes(status)
  ) {
    throw new ApiError(
      400,
      `Cannot change order status from ${currentStatus} to ${status}`
    );
  }

  // ==========================================================
  // ADMIN CANCELLATION
  // ==========================================================

  if (
    status === "CANCELLED"
  ) {
    // --------------------------------------------------------
    // RESTORE STOCK
    // --------------------------------------------------------

    for (
      const item of order.items
    ) {
      // ------------------------------------------------------
      // VARIANT STOCK
      // ------------------------------------------------------

      if (item.variant) {
        const result =
          await Variant.updateOne(
            {
              _id:
                item.variant,

              product:
                item.product,
            },
            {
              $inc: {
                stock:
                  item.quantity,
              },
            }
          );

        if (
          result.modifiedCount !== 1
        ) {
          throw new ApiError(
            400,
            `Unable to restore stock for variant of "${item.name}"`
          );
        }
      }

      // ------------------------------------------------------
      // PRODUCT STOCK
      // ------------------------------------------------------

      else {
        const result =
          await Product.updateOne(
            {
              _id:
                item.product,
            },
            {
              $inc: {
                stock:
                  item.quantity,
              },
            }
          );

        if (
          result.modifiedCount !== 1
        ) {
          throw new ApiError(
            400,
            `Unable to restore stock for product "${item.name}"`
          );
        }
      }
    }

    // --------------------------------------------------------
    // CANCELLATION DETAILS
    // --------------------------------------------------------

    order.cancelledAt =
      new Date();

    order.cancellationReason =
      "Cancelled by admin";
  }

  // ==========================================================
  // UPDATE ORDER STATUS
  // ==========================================================

  order.orderStatus =
    status;

  // ==========================================================
  // SAVE ORDER
  // ==========================================================

  const updatedOrder =
    await order.save();

  // ==========================================================
  // CREATE CUSTOMER STATUS NOTIFICATION
  // ==========================================================

  try {
    const notificationMessages = {
      CONFIRMED: {
        title:
          "Order Confirmed",

        message:
          `Your order ${updatedOrder.orderNumber} has been confirmed.`,
      },

      PROCESSING: {
        title:
          "Order Processing",

        message:
          `Your order ${updatedOrder.orderNumber} is now being processed.`,
      },

      SHIPPED: {
        title:
          "Order Shipped",

        message:
          `Your order ${updatedOrder.orderNumber} has been shipped.`,
      },

      DELIVERED: {
        title:
          "Order Delivered",

        message:
          `Your order ${updatedOrder.orderNumber} has been delivered.`,
      },

      CANCELLED: {
        title:
          "Order Cancelled",

        message:
          `Your order ${updatedOrder.orderNumber} has been cancelled.`,
      },
    };

    const notification =
      notificationMessages[
        updatedOrder.orderStatus
      ];

    if (notification) {
      await createCustomerOrderNotification({
        customerId:
          updatedOrder.customer,

        orderId:
          updatedOrder._id,

        title:
          notification.title,

        message:
          notification.message,

        data: {
          orderNumber:
            updatedOrder.orderNumber,

          status:
            updatedOrder.orderStatus,
        },
      });
    }
  } catch (notificationError) {
    console.error(
      "⚠️ Order status updated successfully, but customer notification failed:",
      notificationError.message
    );
  }

  // ==========================================================
  // CREATE ADMIN NOTIFICATION FOR ADMIN CANCELLATION
  // ==========================================================

  if (
    updatedOrder.orderStatus ===
    "CANCELLED"
  ) {
    try {
      await createAdminOrderNotification({
        customerId:
          updatedOrder.customer,

        orderId:
          updatedOrder._id,

        title:
          "Order Cancelled by Admin",

        message:
          `Order ${updatedOrder.orderNumber} was cancelled by admin.`,

        data: {
          orderNumber:
            updatedOrder.orderNumber,

          customerId:
            updatedOrder.customer,

          status:
            updatedOrder.orderStatus,

          reason:
            updatedOrder.cancellationReason,
        },
      });
    } catch (notificationError) {
      console.error(
        "⚠️ Order cancelled successfully, but admin notification failed:",
        notificationError.message
      );
    }
  }

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
      // SHIPPED
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
      // DELIVERED
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

      // ------------------------------------------------------
      // CANCELLED
      // ------------------------------------------------------

      else if (
        updatedOrder.orderStatus ===
        "CANCELLED"
      ) {
        await sendOrderCancellation({
          customerEmail:
            customer.email,

          customerName,

          orderNumber:
            updatedOrder.orderNumber,

          reason:
            updatedOrder.cancellationReason,
        });
      }
    }
  } catch (emailError) {
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
  // ==========================================================
  // FIND ORDER
  // ==========================================================

  const order =
    await Order.findById(orderId);

  if (!order) {
    throw new ApiError(
      404,
      "Order not found"
    );
  }

  // ==========================================================
  // CHECK CURRENT STATUS
  // ==========================================================

  if (
    order.orderStatus ===
    "CANCELLED"
  ) {
    throw new ApiError(
      400,
      "Order is already cancelled"
    );
  }

  if (
    order.orderStatus ===
    "DELIVERED"
  ) {
    throw new ApiError(
      400,
      "Delivered orders cannot be cancelled"
    );
  }

  if (
    order.orderStatus ===
    "SHIPPED"
  ) {
    throw new ApiError(
      400,
      "Shipped orders cannot be cancelled"
    );
  }

  // ==========================================================
  // ALLOWED CANCELLATION STATUSES
  // ==========================================================

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

  // ==========================================================
  // RESTORE STOCK
  // ==========================================================

  for (
    const item of order.items
  ) {
    // --------------------------------------------------------
    // RESTORE VARIANT STOCK
    // --------------------------------------------------------

    if (item.variant) {
      const result =
        await Variant.updateOne(
          {
            _id:
              item.variant,

            product:
              item.product,
          },
          {
            $inc: {
              stock:
                item.quantity,
            },
          }
        );

      if (
        result.modifiedCount !== 1
      ) {
        throw new ApiError(
          400,
          `Unable to restore stock for variant of "${item.name}"`
        );
      }
    }

    // --------------------------------------------------------
    // RESTORE PRODUCT STOCK
    // --------------------------------------------------------

    else {
      const result =
        await Product.updateOne(
          {
            _id:
              item.product,
          },
          {
            $inc: {
              stock:
                item.quantity,
            },
          }
        );

      if (
        result.modifiedCount !== 1
      ) {
        throw new ApiError(
          400,
          `Unable to restore stock for product "${item.name}"`
        );
      }
    }
  }

  // ==========================================================
  // UPDATE CANCELLATION DETAILS
  // ==========================================================

  order.orderStatus =
    "CANCELLED";

  order.cancelledAt =
    new Date();

  order.cancellationReason =
    reason?.trim() ||
    "Cancelled by admin";

  // ==========================================================
  // SAVE UPDATED ORDER
  // ==========================================================

  const updatedOrder =
    await order.save();

  // ==========================================================
  // CREATE CUSTOMER NOTIFICATION
  // ==========================================================

  try {
    await createCustomerOrderNotification({
      customerId:
        updatedOrder.customer,

      orderId:
        updatedOrder._id,

      title:
        "Order Cancelled",

      message:
        `Your order ${updatedOrder.orderNumber} has been cancelled by the store.`,

      data: {
        orderNumber:
          updatedOrder.orderNumber,

        status:
          updatedOrder.orderStatus,

        reason:
          updatedOrder.cancellationReason,
      },
    });
  } catch (notificationError) {
    console.error(
      "⚠️ Order cancelled successfully, but customer notification failed:",
      notificationError.message
    );
  }

  // ==========================================================
  // CREATE ADMIN NOTIFICATION
  // ==========================================================

  try {
    await createAdminOrderNotification({
      customerId:
        updatedOrder.customer,

      orderId:
        updatedOrder._id,

      title:
        "Order Cancelled by Admin",

      message:
        `Order ${updatedOrder.orderNumber} was cancelled by admin.`,

      data: {
        orderNumber:
          updatedOrder.orderNumber,

        customerId:
          updatedOrder.customer,

        status:
          updatedOrder.orderStatus,

        reason:
          updatedOrder.cancellationReason,
      },
    });
  } catch (notificationError) {
    console.error(
      "⚠️ Order cancelled successfully, but admin notification failed:",
      notificationError.message
    );
  }

  // ==========================================================
  // SEND CANCELLATION EMAIL
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

      await sendOrderCancellation({
        customerEmail:
          customer.email,

        customerName,

        orderNumber:
          updatedOrder.orderNumber,

        reason:
          updatedOrder.cancellationReason,
      });
    }
  } catch (emailError) {
    console.error(
      "⚠️ Order cancelled successfully, but cancellation email failed:",
      emailError.message
    );
  }

  // ==========================================================
  // RETURN UPDATED ORDER
  // ==========================================================

  return updatedOrder;
};