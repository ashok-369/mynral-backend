import Address from "./address.model.js";

// ============================================================
// CREATE ADDRESS
// ============================================================

export const createAddress = async (data) => {
  return Address.create(data);
};

// ============================================================
// FIND ALL CUSTOMER ADDRESSES
// ============================================================

export const findAddressesByCustomerId = async (
  customerId
) => {
  return Address.find({
    customer: customerId,
  }).sort({
    isDefault: -1,
    createdAt: -1,
  });
};

// ============================================================
// FIND ADDRESS BY ID
// ============================================================

export const findAddressById = async (
  addressId
) => {
  return Address.findById(addressId);
};

// ============================================================
// FIND CUSTOMER ADDRESS BY ID
// ============================================================

export const findCustomerAddressById = async (
  customerId,
  addressId
) => {
  return Address.findOne({
    _id: addressId,
    customer: customerId,
  });
};

// ============================================================
// UPDATE CUSTOMER ADDRESS
// ============================================================

export const updateAddress = async (
  customerId,
  addressId,
  updateData
) => {
  return Address.findOneAndUpdate(
    {
      _id: addressId,
      customer: customerId,
    },
    updateData,
    {
      new: true,
      runValidators: true,
    }
  );
};

// ============================================================
// DELETE CUSTOMER ADDRESS
// ============================================================

export const deleteAddress = async (
  customerId,
  addressId
) => {
  return Address.findOneAndDelete({
    _id: addressId,
    customer: customerId,
  });
};

// ============================================================
// REMOVE DEFAULT FROM CUSTOMER ADDRESSES
// ============================================================

export const removeDefaultAddresses = async (
  customerId
) => {
  return Address.updateMany(
    {
      customer: customerId,
      isDefault: true,
    },
    {
      $set: {
        isDefault: false,
      },
    }
  );
};

// ============================================================
// COUNT CUSTOMER ADDRESSES
// ============================================================

export const countCustomerAddresses = async (
  customerId
) => {
  return Address.countDocuments({
    customer: customerId,
  });
};