import asyncHandler from "../../utils/asyncHandler.js";
import successResponse from "../../utils/response.js";

import {
  createCustomerAddress,
  getCustomerAddresses,
  getCustomerAddress,
  updateCustomerAddress,
  removeCustomerAddress,
  setDefaultCustomerAddress,
} from "./address.service.js";

// ============================================================
// CREATE ADDRESS
// ============================================================

export const createAddressController =
  asyncHandler(async (req, res) => {
    const address =
      await createCustomerAddress(
        req.customer.id,
        req.body
      );

    return successResponse(res, {
      statusCode: 201,
      message:
        "Address created successfully",
      data: {
        address,
      },
    });
  });

// ============================================================
// GET ALL ADDRESSES
// ============================================================

export const getAddressesController =
  asyncHandler(async (req, res) => {
    const addresses =
      await getCustomerAddresses(
        req.customer.id
      );

    return successResponse(res, {
      statusCode: 200,
      message:
        "Addresses fetched successfully",
      data: {
        addresses,
      },
    });
  });

// ============================================================
// GET SINGLE ADDRESS
// ============================================================

export const getAddressController =
  asyncHandler(async (req, res) => {
    const address =
      await getCustomerAddress(
        req.customer.id,
        req.params.id
      );

    return successResponse(res, {
      statusCode: 200,
      message:
        "Address fetched successfully",
      data: {
        address,
      },
    });
  });

// ============================================================
// UPDATE ADDRESS
// ============================================================

export const updateAddressController =
  asyncHandler(async (req, res) => {
    const address =
      await updateCustomerAddress(
        req.customer.id,
        req.params.id,
        req.body
      );

    return successResponse(res, {
      statusCode: 200,
      message:
        "Address updated successfully",
      data: {
        address,
      },
    });
  });

// ============================================================
// DELETE ADDRESS
// ============================================================

export const deleteAddressController =
  asyncHandler(async (req, res) => {
    const result =
      await removeCustomerAddress(
        req.customer.id,
        req.params.id
      );

    return successResponse(res, {
      statusCode: 200,
      message:
        "Address deleted successfully",
      data: result,
    });
  });

// ============================================================
// SET DEFAULT ADDRESS
// ============================================================

export const setDefaultAddressController =
  asyncHandler(async (req, res) => {
    const address =
      await setDefaultCustomerAddress(
        req.customer.id,
        req.params.id
      );

    return successResponse(res, {
      statusCode: 200,
      message:
        "Default address updated successfully",
      data: {
        address,
      },
    });
  });