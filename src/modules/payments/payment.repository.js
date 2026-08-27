import Payment from "./payment.model.js";

// ============================================================
// CREATE PAYMENT
// ============================================================

export const createPayment = async (
  paymentData
) => {
  return Payment.create(paymentData);
};

// ============================================================
// FIND PAYMENT BY RAZORPAY ORDER ID
// ============================================================

export const findPaymentByRazorpayOrderId =
  async (razorpayOrderId) => {
    return Payment.findOne({
      razorpayOrderId,
    });
  };

// ============================================================
// FIND PAYMENT BY ORDER
// ============================================================

export const findPaymentByOrderId =
  async (orderId) => {
    return Payment.findOne({
      order: orderId,
    });
  };

// ============================================================
// UPDATE PAYMENT
// ============================================================

export const updatePayment = async (
  paymentId,
  updateData
) => {
  return Payment.findByIdAndUpdate(
    paymentId,
    updateData,
    {
      new: true,
      runValidators: true,
    }
  );
};