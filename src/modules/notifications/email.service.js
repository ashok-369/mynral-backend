import nodemailer from "nodemailer";

// ============================================================
// DEBUG ENV
// ============================================================

console.log(
  "SMTP_USER:",
  process.env.SMTP_USER
);

console.log(
  "SMTP_PASSWORD EXISTS:",
  !!process.env.SMTP_PASSWORD
);

console.log(
  "SMTP_FROM:",
  process.env.SMTP_FROM
);

// ============================================================
// EMAIL TRANSPORTER
// ============================================================

const transporter = nodemailer.createTransport({
  service: "gmail",

  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

// ============================================================
// VERIFY SMTP CONNECTION
// ============================================================

export const verifyEmailConnection = async () => {
  try {
    await transporter.verify();

    console.log(
      "✅ Email service connected successfully"
    );

    return true;
  } catch (error) {
    console.error(
      "❌ Email service connection failed:",
      error.message
    );

    return false;
  }
};

// ============================================================
// SEND EMAIL
// ============================================================

export const sendEmail = async ({
  to,
  subject,
  html,
  text = "",
}) => {
  try {
    if (!to) {
      throw new Error(
        "Recipient email is required"
      );
    }

    const mailOptions = {
      from: `"MYNRAL Agro" <${
        process.env.SMTP_FROM ||
        process.env.SMTP_USER
      }>`,
      to,
      subject,
      text,
      html,
    };

    const info =
      await transporter.sendMail(
        mailOptions
      );

    console.log(
      `📧 Email sent successfully to ${to}`
    );

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    console.error(
      "❌ Email sending failed:",
      error.message
    );

    throw error;
  }
};

export default {
  sendEmail,
  verifyEmailConnection,
};