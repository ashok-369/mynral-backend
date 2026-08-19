import Customer from "../customers/customer.model.js";

// ============================================================
// Find Customer By Mobile
// Used for registration and OTP verification
// ============================================================

const findCustomerByMobile = async (mobile) => {
  return Customer.findOne({
    mobile,
  });
};

// ============================================================
// Find Customer By Mobile With Password
// Used for customer login
// ============================================================

const findCustomerByMobileWithPassword = async (mobile) => {
  return Customer.findOne({
    mobile,
  }).select("+password");
};

// ============================================================
// Find Customer By Email
// ============================================================

const findCustomerByEmail = async (email) => {
  return Customer.findOne({
    email,
  });
};

// ============================================================
// Create Customer
// ============================================================

const createCustomer = async (customerData) => {
  return Customer.create(customerData);
};

// ============================================================
// Find Customer By ID
// ============================================================

const findCustomerById = async (customerId) => {
  return Customer.findById(customerId);
};

// ============================================================
// Update Customer
// ============================================================

const updateCustomer = async (
  customerId,
  updateData
) => {
  return Customer.findByIdAndUpdate(
    customerId,
    updateData,
    {
      new: true,
      runValidators: true,
    }
  );
};

export {
  findCustomerByMobile,
  findCustomerByMobileWithPassword,
  findCustomerByEmail,
  createCustomer,
  findCustomerById,
  updateCustomer,
};