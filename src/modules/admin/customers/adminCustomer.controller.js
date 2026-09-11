import {
  getAllCustomers,
} from "./adminCustomer.service.js";

// ============================================================
// GET ALL CUSTOMERS
// ============================================================

export const getAllCustomersController = async (
  req,
  res,
  next
) => {
  try {
    const customers =
      await getAllCustomers();

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Customers fetched successfully",
      data: customers,
    });
  } catch (error) {
    next(error);
  }
};