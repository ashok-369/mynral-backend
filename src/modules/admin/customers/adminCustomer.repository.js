import Customer from "../../customers/customer.model.js";

// ============================================================
// GET ALL CUSTOMERS
// ============================================================

export const findAllCustomers = async () => {
  return Customer.find()
    .sort({ createdAt: -1 })
    .lean();
};