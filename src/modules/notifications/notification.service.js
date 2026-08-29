import {
  sendEmail,
} from "./email.service.js";

import {
  orderConfirmationTemplate,
  orderCancellationTemplate,
  orderStatusTemplate,
  orderShippedTemplate,
  orderDeliveredTemplate,
} from "./template.service.js";

// ============================================================
// ORDER CONFIRMATION
// ============================================================

export const sendOrderConfirmation = async ({
  customerEmail,
  customerName,
  orderNumber,
  totalAmount,
}) => {
  if (!customerEmail) {
    console.log(
      "⚠️ Order confirmation skipped: customer email not available"
    );

    return null;
  }

  const html = orderConfirmationTemplate({
    customerName,
    orderNumber,
    totalAmount,
  });

  return await sendEmail({
    to: customerEmail,
    subject: `MYNRAL Order Confirmed - ${orderNumber}`,
    html,
  });
};

// ============================================================
// ORDER CANCELLATION
// ============================================================

export const sendOrderCancellation = async ({
  customerEmail,
  customerName,
  orderNumber,
  reason,
}) => {
  if (!customerEmail) {
    console.log(
      "⚠️ Cancellation email skipped: customer email not available"
    );

    return null;
  }

  const html = orderCancellationTemplate({
    customerName,
    orderNumber,
    reason,
  });

  return await sendEmail({
    to: customerEmail,
    subject: `MYNRAL Order Cancelled - ${orderNumber}`,
    html,
  });
};

// ============================================================
// ORDER STATUS
// ============================================================

export const sendOrderStatusUpdate = async ({
  customerEmail,
  customerName,
  orderNumber,
  status,
}) => {
  if (!customerEmail) {
    console.log(
      "⚠️ Status email skipped: customer email not available"
    );

    return null;
  }

  const html = orderStatusTemplate({
    customerName,
    orderNumber,
    status,
  });

  return await sendEmail({
    to: customerEmail,
    subject: `MYNRAL Order Update - ${orderNumber}`,
    html,
  });
};

// ============================================================
// ORDER SHIPPED
// ============================================================

export const sendOrderShipped = async ({
  customerEmail,
  customerName,
  orderNumber,
}) => {
  if (!customerEmail) {
    console.log(
      "⚠️ Shipping email skipped: customer email not available"
    );

    return null;
  }

  const html = orderShippedTemplate({
    customerName,
    orderNumber,
  });

  return await sendEmail({
    to: customerEmail,
    subject: `MYNRAL Order Shipped - ${orderNumber}`,
    html,
  });
};

// ============================================================
// ORDER DELIVERED
// ============================================================

export const sendOrderDelivered = async ({
  customerEmail,
  customerName,
  orderNumber,
}) => {
  if (!customerEmail) {
    console.log(
      "⚠️ Delivery email skipped: customer email not available"
    );

    return null;
  }

  const html = orderDeliveredTemplate({
    customerName,
    orderNumber,
  });

  return await sendEmail({
    to: customerEmail,
    subject: `MYNRAL Order Delivered - ${orderNumber}`,
    html,
  });
};

// ============================================================
// DEFAULT EXPORT
// ============================================================

export default {
  sendOrderConfirmation,
  sendOrderCancellation,
  sendOrderStatusUpdate,
  sendOrderShipped,
  sendOrderDelivered,
};