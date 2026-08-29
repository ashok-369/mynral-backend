import "dotenv/config";

import app from "./app.js";
import connectDatabase from "./config/database.js";

import {
  verifyEmailConnection,
} from "./modules/notifications/email.service.js";

const PORT = process.env.PORT || 8500;

const startServer = async () => {
  try {
    // ========================================================
    // CONNECT DATABASE
    // ========================================================

    await connectDatabase();

    // ========================================================
    // VERIFY EMAIL
    // ========================================================

    await verifyEmailConnection();

    // ========================================================
    // START SERVER
    // ========================================================

    app.listen(PORT, () => {
      console.log(
        `🚀 MYNRAL Agro Backend running on port ${PORT}`
      );

      console.log(
        `🌐 http://localhost:${PORT}`
      );
    });
  } catch (error) {
    console.error(
      "❌ Server startup failed"
    );

    console.error(error.message);

    process.exit(1);
  }
};

startServer();