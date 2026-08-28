import ApiError from "../../../utils/ApiError.js";

import {
  getAllOrders,
  getAdminOrderById,
  updateOrderStatus,
} from "./adminOrder.service.js";

// ============================================================
// GET ALL ORDERS
// ============================================================

export const getAllOrdersController = async (
  req,
  res,
  next
) => {
  try {
    const {
      status,
      search,
      page,
      limit,
    } = req.query;

    const result = await getAllOrders({
      status,
      search,
      page,
      limit,
    });

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Orders fetched successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// GET SINGLE ORDER
// ============================================================

export const getAdminOrderController = async (
  req,
  res,
  next
) => {
  try {
    const { orderId } = req.params;

    const order =
      await getAdminOrderById(orderId);

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Order fetched successfully",
      data: {
        order,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// UPDATE ORDER STATUS
// ============================================================

export const updateOrderStatusController =
  async (req, res, next) => {
    try {
      const { orderId } = req.params;
      const { status } = req.body;

      if (!status) {
        throw new ApiError(
          400,
          "Order status is required"
        );
      }

      const order =
        await updateOrderStatus(
          orderId,
          status
        );

      return res.status(200).json({
        success: true,
        statusCode: 200,
        message:
          "Order status updated successfully",
        data: {
          order,
        },
      });
    } catch (error) {
      next(error);
    }
  };