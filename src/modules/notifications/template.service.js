// ============================================================
// COMMON EMAIL LAYOUT
// ============================================================

const emailLayout = ({
  title,
  content,
}) => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />

  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  />

  <title>${title}</title>
</head>

<body
  style="
    margin:0;
    padding:0;
    background:#f5f5f5;
    font-family:Arial, Helvetica, sans-serif;
  "
>

  <table
    width="100%"
    cellpadding="0"
    cellspacing="0"
    style="padding:30px 10px;"
  >

    <tr>
      <td align="center">

        <table
          width="600"
          cellpadding="0"
          cellspacing="0"
          style="
            max-width:600px;
            width:100%;
            background:#ffffff;
            border-radius:8px;
            overflow:hidden;
          "
        >

          <!-- HEADER -->

          <tr>
            <td
              style="
                background:#1f4d2b;
                padding:25px;
                text-align:center;
              "
            >

              <h1
                style="
                  margin:0;
                  color:#ffffff;
                  font-size:28px;
                "
              >
                MYNRAL
              </h1>

              <p
                style="
                  margin:6px 0 0;
                  color:#ffffff;
                  font-size:14px;
                "
              >
                Premium Agro Products
              </p>

            </td>
          </tr>

          <!-- CONTENT -->

          <tr>
            <td style="padding:35px 30px;">

              ${content}

            </td>
          </tr>

          <!-- FOOTER -->

          <tr>
            <td
              style="
                background:#f7f7f7;
                padding:20px;
                text-align:center;
                font-size:12px;
                color:#777;
              "
            >

              <p style="margin:0;">
                Thank you for shopping with MYNRAL.
              </p>

              <p style="margin:8px 0 0;">
                © ${new Date().getFullYear()} MYNRAL Agro
              </p>

            </td>
          </tr>

        </table>

      </td>
    </tr>

  </table>

</body>
</html>
`;
};

// ============================================================
// ORDER CONFIRMATION
// ============================================================

export const orderConfirmationTemplate = ({
  customerName,
  orderNumber,
  totalAmount,
}) => {
  return emailLayout({
    title: "Order Confirmation",

    content: `
      <h2 style="color:#222;">
        Order Confirmed 🎉
      </h2>

      <p>
        Hello <strong>${customerName || "Customer"}</strong>,
      </p>

      <p>
        Thank you for your order with MYNRAL.
        Your order has been successfully placed.
      </p>

      <div
        style="
          background:#f5f5f5;
          padding:20px;
          border-radius:6px;
          margin:20px 0;
        "
      >

        <p>
          <strong>Order Number:</strong>
          ${orderNumber}
        </p>

        <p>
          <strong>Total Amount:</strong>
          ₹${Number(totalAmount || 0).toFixed(2)}
        </p>

      </div>

      <p>
        We will notify you when your order status changes.
      </p>

      <p>
        Regards,<br />
        <strong>MYNRAL Team</strong>
      </p>
    `,
  });
};

// ============================================================
// ORDER CANCELLATION
// ============================================================

export const orderCancellationTemplate = ({
  customerName,
  orderNumber,
  reason,
}) => {
  return emailLayout({
    title: "Order Cancelled",

    content: `
      <h2 style="color:#b42318;">
        Order Cancelled
      </h2>

      <p>
        Hello <strong>${customerName || "Customer"}</strong>,
      </p>

      <p>
        Your MYNRAL order has been cancelled successfully.
      </p>

      <div
        style="
          background:#f5f5f5;
          padding:20px;
          border-radius:6px;
          margin:20px 0;
        "
      >

        <p>
          <strong>Order Number:</strong>
          ${orderNumber}
        </p>

        ${
          reason
            ? `
              <p>
                <strong>Reason:</strong>
                ${reason}
              </p>
            `
            : ""
        }

      </div>

      <p>
        If you have any questions, please contact our support team.
      </p>

      <p>
        Regards,<br />
        <strong>MYNRAL Team</strong>
      </p>
    `,
  });
};

// ============================================================
// ORDER STATUS UPDATE
// ============================================================

export const orderStatusTemplate = ({
  customerName,
  orderNumber,
  status,
}) => {
  return emailLayout({
    title: "Order Status Update",

    content: `
      <h2>
        Order Status Updated
      </h2>

      <p>
        Hello <strong>${customerName || "Customer"}</strong>,
      </p>

      <p>
        Your MYNRAL order status has been updated.
      </p>

      <div
        style="
          background:#f5f5f5;
          padding:20px;
          border-radius:6px;
          margin:20px 0;
          text-align:center;
        "
      >

        <p>
          <strong>Order Number</strong>
        </p>

        <p>
          ${orderNumber}
        </p>

        <p>
          <strong>Current Status</strong>
        </p>

        <p
          style="
            font-size:20px;
            font-weight:bold;
            text-transform:capitalize;
          "
        >
          ${status}
        </p>

      </div>

      <p>
        Thank you for shopping with MYNRAL.
      </p>

      <p>
        Regards,<br />
        <strong>MYNRAL Team</strong>
      </p>
    `,
  });
};

// ============================================================
// ORDER SHIPPED
// ============================================================

export const orderShippedTemplate = ({
  customerName,
  orderNumber,
}) => {
  return emailLayout({
    title: "Order Shipped",

    content: `
      <h2>
        Your Order Has Been Shipped 🚚
      </h2>

      <p>
        Hello <strong>${customerName || "Customer"}</strong>,
      </p>

      <p>
        Great news! Your MYNRAL order is on its way.
      </p>

      <div
        style="
          background:#f5f5f5;
          padding:20px;
          border-radius:6px;
          margin:20px 0;
        "
      >

        <p>
          <strong>Order Number:</strong>
          ${orderNumber}
        </p>

      </div>

      <p>
        We will notify you once your order has been delivered.
      </p>

      <p>
        Regards,<br />
        <strong>MYNRAL Team</strong>
      </p>
    `,
  });
};

// ============================================================
// ORDER DELIVERED
// ============================================================

export const orderDeliveredTemplate = ({
  customerName,
  orderNumber,
}) => {
  return emailLayout({
    title: "Order Delivered",

    content: `
      <h2>
        Order Delivered 🎉
      </h2>

      <p>
        Hello <strong>${customerName || "Customer"}</strong>,
      </p>

      <p>
        Your MYNRAL order has been delivered successfully.
      </p>

      <div
        style="
          background:#f5f5f5;
          padding:20px;
          border-radius:6px;
          margin:20px 0;
        "
      >

        <p>
          <strong>Order Number:</strong>
          ${orderNumber}
        </p>

      </div>

      <p>
        We hope you enjoy your purchase.
      </p>

      <p>
        Regards,<br />
        <strong>MYNRAL Team</strong>
      </p>
    `,
  });
};