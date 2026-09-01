import axios from "axios";

/**
 * Send OTP SMS using MSG91
 *
 * Required .env:
 * MSG91_AUTH_KEY=your_msg91_auth_key
 * MSG91_TEMPLATE_ID=your_template_id
 * MSG91_SENDER_ID=your_sender_id
 */
export const sendOTP = async (mobile, otp) => {
  try {
    // Make sure the number is in the format expected by your MSG91 setup.
    // Example: 9876543210 -> 919876543210
    const formattedMobile = mobile.startsWith("91")
      ? mobile
      : `91${mobile}`;

    const response = await axios.post(
      "https://control.msg91.com/api/v5/otp",
      {
        template_id: process.env.MSG91_TEMPLATE_ID,
        mobile: formattedMobile,
        otp: otp,
      },
      {
        headers: {
          authkey: process.env.MSG91_AUTH_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    console.log(
      `✅ OTP SMS sent to ${formattedMobile}`
    );

    return response.data;
  } catch (error) {
    console.error(
      "❌ Failed to send OTP SMS:",
      error.response?.data || error.message
    );

    throw new Error(
      "Unable to send OTP SMS"
    );
  }
};
