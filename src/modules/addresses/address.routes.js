import express from "express";

import authMiddleware from "../../middlewares/auth.middleware.js";

import {
  createAddressController,
  getAddressesController,
  getAddressController,
  updateAddressController,
  deleteAddressController,
  setDefaultAddressController,
} from "./address.controller.js";

const router = express.Router();

// ============================================================
// AUTHENTICATION
// ============================================================

router.use(authMiddleware);

// ============================================================
// CUSTOMER ADDRESSES
// ============================================================

// Create address
router.post(
  "/",
  createAddressController
);

// Get all addresses
router.get(
  "/",
  getAddressesController
);

// Get single address
router.get(
  "/:id",
  getAddressController
);

// Update address
router.put(
  "/:id",
  updateAddressController
);

// Set default address
router.patch(
  "/:id/default",
  setDefaultAddressController
);

// Delete address
router.delete(
  "/:id",
  deleteAddressController
);

export default router;