import Order from "../../orders/order.model.js";
import ApiError from "../../../utils/ApiError.js";

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

  const order =
    await Order.findById(orderId);

  if (!order) {
    throw new ApiError(
      404,
      "Order not found"
    );
  }

  // ==========================================================
  // Normalize Status
  // ==========================================================

  const status =
    String(newStatus)
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
    ],

    SHIPPED: [
      "DELIVERED",
    ],

    DELIVERED: [],

    CANCELLED: [],
  };

  // ==========================================================
  // Get Current Status
  // ==========================================================

  const currentStatus =
    order.orderStatus;

  const possibleStatuses =
    validTransitions[currentStatus] || [];

  // ==========================================================
  // Validate Transition
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
  // Update Status
  // ==========================================================

  order.orderStatus = status;

  // ==========================================================
  // Save Order
  // ==========================================================

  await order.save();

  // ==========================================================
  // Return Updated Order
  // ==========================================================

  return order;
};