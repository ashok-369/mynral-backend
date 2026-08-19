import asyncHandler from "../../utils/asyncHandler.js";
import successResponse from "../../utils/response.js";

import {
  getCustomerProfile,
  updateCustomerProfile,
  changeCustomerPassword,
} from "./customer.service.js";


// ============================================================
// GET CUSTOMER PROFILE
// ============================================================

export const getProfile =
  asyncHandler(async (req, res) => {
    const customer =
      await getCustomerProfile(
        req.customer.id
      );

    return successResponse(res, {
      statusCode: 200,
      message:
        "Customer profile fetched successfully",
      data: {
        customer,
      },
    });
  });


// ============================================================
// UPDATE CUSTOMER PROFILE
// ============================================================

export const updateProfile =
  asyncHandler(async (req, res) => {
    const customer =
      await updateCustomerProfile(
        req.customer.id,
        req.body
      );

    return successResponse(res, {
      statusCode: 200,
      message:
        "Customer profile updated successfully",
      data: {
        customer,
      },
    });
  });

  // ============================================================
// CHANGE CUSTOMER PASSWORD
// ============================================================

export const changePassword =
  asyncHandler(async (req, res) => {
    const result =
      await changeCustomerPassword(
        req.customer.id,
        req.body
      );

    return successResponse(res, {
      statusCode: 200,
      message:
        "Password changed successfully",
      data: result,
    });
  });