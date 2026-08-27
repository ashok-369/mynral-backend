import asyncHandler from "../../utils/asyncHandler.js";
import successResponse from "../../utils/response.js";

import {
  getAllOrders,
  getAdminOrder,
  updateOrderStatus,
  cancelAdminOrder,
} from "./admin-order.service.js";

// ============================================================
// GET ALL ORDERS
// ============================================================

export const getAllOrdersController =
  asyncHandler(
    async (req, res) => {
      const result =
        await getAllOrders(
          req.query
        );

      return successResponse(
        res,
        {
          statusCode: 200,
          message:
            "Orders fetched successfully",
          data: result,
        }
      );
    }
  );

// ============================================================
// GET SINGLE ORDER
// ============================================================

export const getAdminOrderController =
  asyncHandler(
    async (req, res) => {
      const order =
        await getAdminOrder(
          req.params.id
        );

      return successResponse(
        res,
        {
          statusCode: 200,
          message:
            "Order fetched successfully",
          data: {
            order,
          },
        }
      );
    }
  );

// ============================================================
// UPDATE ORDER STATUS
// ============================================================

export const updateOrderStatusController =
  asyncHandler(
    async (req, res) => {
      const {
        status,
      } = req.body;

      const order =
        await updateOrderStatus(
          req.params.id,
          status
        );

      return successResponse(
        res,
        {
          statusCode: 200,
          message:
            "Order status updated successfully",
          data: {
            order,
          },
        }
      );
    }
  );

// ============================================================
// CANCEL ORDER
// ============================================================

export const cancelAdminOrderController =
  asyncHandler(
    async (req, res) => {
      const {
        reason,
      } = req.body;

      const order =
        await cancelAdminOrder(
          req.params.id,
          reason
        );

      return successResponse(
        res,
        {
          statusCode: 200,
          message:
            "Order cancelled successfully",
          data: {
            order,
          },
        }
      );
    }
  );