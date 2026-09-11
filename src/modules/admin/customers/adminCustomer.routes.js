import express from "express";

import adminAuthMiddleware from "../../../middlewares/adminAuth.middleware.js";

import {
  getAllCustomersController,
} from "./adminCustomer.controller.js";

const router = express.Router();

// ============================================================
// ADMIN AUTHENTICATION
// ============================================================

router.use(adminAuthMiddleware);

// ============================================================
// CUSTOMER ROUTES
// ============================================================

// GET ALL CUSTOMERS
router.get(
  "/",
  getAllCustomersController
);

export default router;