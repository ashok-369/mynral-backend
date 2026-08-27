import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
      index: true,
    },

    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      index: true,
    },

    razorpayOrderId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    razorpayPaymentId: {
      type: String,
      default: null,
      index: true,
    },

    razorpaySignature: {
      type: String,
      default: null,
    },

    amount: {
      type: Number,
      required: true,
      min: 1,
    },

    currency: {
      type: String,
      default: "INR",
    },

    status: {
      type: String,
      enum: [
        "CREATED",
        "PAID",
        "FAILED",
        "REFUNDED",
      ],
      default: "CREATED",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

const Payment = mongoose.model(
  "Payment",
  paymentSchema
);

export default Payment;