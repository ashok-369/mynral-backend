import asyncHandler from "../../utils/asyncHandler.js";
import successResponse from "../../utils/response.js";

import {
  createRazorpayOrder,
  verifyRazorpayPayment,
  getPaymentByOrder,
} from "./payment.service.js";

// ============================================================
// CREATE RAZORPAY ORDER
// ============================================================

export const createRazorpayOrderController =
  asyncHandler(
    async (req, res) => {
      const {
        orderId,
      } = req.body;

      const payment =
        await createRazorpayOrder(
          req.customer.id,
          orderId
        );

      return successResponse(res, {
        statusCode: 201,
        message:
          "Razorpay order created successfully",
        data: {
          payment,
        },
      });
    }
  );

// ============================================================
// VERIFY PAYMENT
// ============================================================

export const verifyRazorpayPaymentController =
  asyncHandler(
    async (req, res) => {
      const result =
        await verifyRazorpayPayment(
          req.customer.id,
          req.body
        );

      return successResponse(res, {
        statusCode: 200,
        message:
          "Payment verified successfully",
        data: result,
      });
    }
  );

// ============================================================
// GET PAYMENT
// ============================================================

export const getPaymentController =
  asyncHandler(
    async (req, res) => {
      const payment =
        await getPaymentByOrder(
          req.customer.id,
          req.params.orderId
        );

      return successResponse(res, {
        statusCode: 200,
        message:
          "Payment fetched successfully",
        data: {
          payment,
        },
      });
    }
  );