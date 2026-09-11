import {
  findAllCustomers,
} from "./adminCustomer.repository.js";

// ============================================================
// GET ALL CUSTOMERS
// ============================================================

export const getAllCustomers = async () => {
  const customers =
    await findAllCustomers();

  return customers;
};