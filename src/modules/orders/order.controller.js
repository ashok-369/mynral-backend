import asyncHandler from "../../utils/asyncHandler.js";
import successResponse from "../../utils/response.js";

import {
  createNewOrder,
  getMyOrders,
  getOrder,
  cancelOrder,
} from "./order.service.js";

// ============================================================
// CREATE ORDER
// ============================================================

export const createOrderController = asyncHandler(
  async (req, res) => {
    const order = await createNewOrder(
      req.customer.id,
      req.body
    );

    return successResponse(res, {
      statusCode: 201,
      message: "Order created successfully",
      data: {
        order,
      },
    });
  }
);

// ============================================================
// GET MY ORDERS
// ============================================================

export const getMyOrdersController = asyncHandler(
  async (req, res) => {
    const result = await getMyOrders(
      req.customer.id,
      req.query
    );

    return successResponse(res, {
      statusCode: 200,
      message: "Orders fetched successfully",
      data: result,
    });
  }
);

// ============================================================
// GET SINGLE ORDER
// ============================================================

export const getOrderController = asyncHandler(
  async (req, res) => {
    const order = await getOrder(
      req.customer.id,
      req.params.id
    );

    return successResponse(res, {
      statusCode: 200,
      message: "Order fetched successfully",
      data: {
        order,
      },
    });
  }
);

// ============================================================
// CANCEL ORDER
// ============================================================

export const cancelOrderController = asyncHandler(
  async (req, res) => {
    const order = await cancelOrder(
      req.customer.id,
      req.params.id
    );

    return successResponse(res, {
      statusCode: 200,
      message: "Order cancelled successfully",
      data: {
        order,
      },
    });
  }
);