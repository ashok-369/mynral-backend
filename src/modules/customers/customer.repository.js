import Customer from "./customer.model.js";

// ============================================================
// FIND CUSTOMER BY ID
// ============================================================

export const findCustomerById = async (customerId) => {
  return Customer.findById(customerId);
};

// ============================================================
// FIND CUSTOMER PROFILE
// ============================================================

export const findCustomerProfileById = async (
  customerId
) => {
  return Customer.findById(customerId).select(
    "-password -otp -otpExpiresAt"
  );
};

// ============================================================
// FIND CUSTOMER BY EMAIL
// ============================================================

export const findCustomerByEmail = async (
  email
) => {
  return Customer.findOne({ email });
};

// ============================================================
// FIND CUSTOMER BY ID WITH PASSWORD
// ============================================================

export const findCustomerByIdWithPassword = async (
  customerId
) => {
  return Customer.findById(customerId).select(
    "+password"
  );
};

// ============================================================
// UPDATE CUSTOMER
// ============================================================

export const updateCustomer = async (
  customerId,
  updateData
) => {
  return Customer.findByIdAndUpdate(
    customerId,
    updateData,
    {
      returnDocument: "after",
      runValidators: true,
    }
  ).select(
    "-password -otp -otpExpiresAt"
  );
};