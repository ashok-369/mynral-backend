import Razorpay from "razorpay";
import crypto from "crypto";

import ApiError from "../../utils/ApiError.js";

import Order from "../orders/order.model.js";

import {
  createPayment,
  findPaymentByRazorpayOrderId,
  findPaymentByOrderId,
  updatePayment,
} from "./payment.repository.js";

// ============================================================
// RAZORPAY INSTANCE
// ============================================================

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret:
    process.env.RAZORPAY_KEY_SECRET,
});

// ============================================================
// CREATE RAZORPAY ORDER
// ============================================================

export const createRazorpayOrder =
  async (
    customerId,
    orderId
  ) => {
    // ----------------------------------------------------------
    // Find MYNRAL order
    // ----------------------------------------------------------

    const order =
      await Order.findOne({
        _id: orderId,
        customer: customerId,
      });

    if (!order) {
      throw new ApiError(
        404,
        "Order not found"
      );
    }

    // ----------------------------------------------------------
    // Check order status
    // ----------------------------------------------------------

    if (
      order.orderStatus === "CANCELLED"
    ) {
      throw new ApiError(
        400,
        "Cancelled order cannot be paid"
      );
    }

    // ----------------------------------------------------------
    // Check payment status
    // ----------------------------------------------------------

    if (
      order.paymentStatus === "PAID"
    ) {
      throw new ApiError(
        400,
        "Order is already paid"
      );
    }

    // ----------------------------------------------------------
    // Check amount
    // ----------------------------------------------------------

    if (
      !order.totalAmount ||
      order.totalAmount <= 0
    ) {
      throw new ApiError(
        400,
        "Invalid order amount"
      );
    }

    // ----------------------------------------------------------
    // Create Razorpay amount
    // ₹999 -> 99900 paise
    // ----------------------------------------------------------

    const amountInPaise = Math.round(
      order.totalAmount * 100
    );

    // ----------------------------------------------------------
    // Create Razorpay order
    // ----------------------------------------------------------

    const razorpayOrder =
      await razorpay.orders.create({
        amount: amountInPaise,
        currency: "INR",
        receipt: order.orderNumber,
        notes: {
          customerId:
            customerId.toString(),
          orderId:
            order._id.toString(),
        },
      });

    // ----------------------------------------------------------
    // Save Razorpay order ID
    // ----------------------------------------------------------

    order.paymentMethod =
      "RAZORPAY";

    order.paymentStatus =
      "PENDING";

    order.razorpayOrderId =
      razorpayOrder.id;

    await order.save();

    // ----------------------------------------------------------
    // Create payment record
    // ----------------------------------------------------------

    const payment =
      await createPayment({
        customer: customerId,
        order: order._id,
        razorpayOrderId:
          razorpayOrder.id,
        amount:
          order.totalAmount,
        currency: "INR",
        status: "CREATED",
      });

    // ----------------------------------------------------------
    // Return checkout information
    // ----------------------------------------------------------

    return {
      paymentId: payment._id,

      orderId: order._id,

      orderNumber:
        order.orderNumber,

      razorpayOrderId:
        razorpayOrder.id,

      amount:
        razorpayOrder.amount,

      currency:
        razorpayOrder.currency,

      keyId:
        process.env.RAZORPAY_KEY_ID,
    };
  };

// ============================================================
// VERIFY RAZORPAY PAYMENT
// ============================================================

export const verifyRazorpayPayment =
  async (
    customerId,
    data
  ) => {
    const {
      orderId,
      razorpayPaymentId,
      razorpaySignature,
    } = data;

    // ----------------------------------------------------------
    // Validate input
    // ----------------------------------------------------------

    if (!orderId) {
      throw new ApiError(
        400,
        "Order ID is required"
      );
    }

    if (!razorpayPaymentId) {
      throw new ApiError(
        400,
        "Razorpay payment ID is required"
      );
    }

    if (!razorpaySignature) {
      throw new ApiError(
        400,
        "Razorpay signature is required"
      );
    }

    // ----------------------------------------------------------
    // Find MYNRAL order
    // ----------------------------------------------------------

    const order =
      await Order.findOne({
        _id: orderId,
        customer: customerId,
      });

    if (!order) {
      throw new ApiError(
        404,
        "Order not found"
      );
    }

    // ----------------------------------------------------------
    // Razorpay order ID must come from DB
    // ----------------------------------------------------------

    if (!order.razorpayOrderId) {
      throw new ApiError(
        400,
        "Razorpay order has not been created"
      );
    }

    // ----------------------------------------------------------
    // Generate signature
    // ----------------------------------------------------------

    const signatureBody =
      `${order.razorpayOrderId}|${razorpayPaymentId}`;

    const expectedSignature =
      crypto
        .createHmac(
          "sha256",
          process.env.RAZORPAY_KEY_SECRET
        )
        .update(signatureBody)
        .digest("hex");

    // ----------------------------------------------------------
    // Timing-safe comparison
    // ----------------------------------------------------------

    const expectedBuffer =
      Buffer.from(
        expectedSignature,
        "hex"
      );

    const receivedBuffer =
      Buffer.from(
        razorpaySignature,
        "hex"
      );

    if (
      expectedBuffer.length !==
      receivedBuffer.length
    ) {
      throw new ApiError(
        400,
        "Invalid payment signature"
      );
    }

    const signatureValid =
      crypto.timingSafeEqual(
        expectedBuffer,
        receivedBuffer
      );

    if (!signatureValid) {
      throw new ApiError(
        400,
        "Invalid payment signature"
      );
    }

    // ----------------------------------------------------------
    // Find payment record
    // ----------------------------------------------------------

    const payment =
      await findPaymentByRazorpayOrderId(
        order.razorpayOrderId
      );

    if (!payment) {
      throw new ApiError(
        404,
        "Payment record not found"
      );
    }

    // ----------------------------------------------------------
    // Idempotency
    // ----------------------------------------------------------

    if (
      payment.status === "PAID" ||
      order.paymentStatus === "PAID"
    ) {
      return {
        paymentVerified: true,
        alreadyProcessed: true,
        order,
      };
    }

    // ----------------------------------------------------------
    // Update payment
    // ----------------------------------------------------------

    await updatePayment(
      payment._id,
      {
        razorpayPaymentId,
        razorpaySignature,
        status: "PAID",
      }
    );

    // ----------------------------------------------------------
    // Update order
    // ----------------------------------------------------------

    order.paymentStatus =
      "PAID";

    order.razorpayPaymentId =
      razorpayPaymentId;

    order.razorpaySignature =
      razorpaySignature;

    order.paymentMethod =
      "RAZORPAY";

    // ----------------------------------------------------------
    // Confirm order
    // ----------------------------------------------------------

    if (
      order.orderStatus === "PLACED"
    ) {
      order.orderStatus =
        "CONFIRMED";
    }

    await order.save();

    return {
      paymentVerified: true,
      alreadyProcessed: false,
      order,
    };
  };

// ============================================================
// GET PAYMENT BY ORDER
// ============================================================

export const getPaymentByOrder =
  async (
    customerId,
    orderId
  ) => {
    const order =
      await Order.findOne({
        _id: orderId,
        customer: customerId,
      });

    if (!order) {
      throw new ApiError(
        404,
        "Order not found"
      );
    }

    const payment =
      await findPaymentByOrderId(
        orderId
      );

    if (!payment) {
      throw new ApiError(
        404,
        "Payment not found"
      );
    }

    return payment;
  };