import express from "express";

import adminUserRoutes from "./users/adminUser.routes.js";
import adminProductRoutes from "./products/adminProduct.routes.js";
import adminCustomerRoutes from "./customers/adminCustomer.routes.js";
import adminNotificationRoutes from "./notifications/adminNotification.routes.js";

const router = express.Router();

// ============================================================
// ADMIN USERS
// ============================================================

router.use("/users", adminUserRoutes);

// ============================================================
// ADMIN PRODUCTS
// ============================================================

router.use("/products", adminProductRoutes);

// ============================================================
// ADMIN CUSTOMERS
// ============================================================

router.use("/customers", adminCustomerRoutes);

// ============================================================
// ADMIN NOTIFICATIONS
// ============================================================

router.use(
  "/notifications",
  adminNotificationRoutes
);

export default router;