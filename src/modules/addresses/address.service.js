import mongoose from "mongoose";
import ApiError from "../../utils/ApiError.js";

import {
  createAddress,
  findAddressesByCustomerId,
  findCustomerAddressById,
  updateAddress,
  deleteAddress,
  removeDefaultAddresses,
  countCustomerAddresses,
} from "./address.repository.js";

// ============================================================
// VALIDATE ADDRESS ID
// ============================================================

const validateAddressId = (addressId) => {
  if (!mongoose.Types.ObjectId.isValid(addressId)) {
    throw new ApiError(
      400,
      "Invalid address ID"
    );
  }
};

// ============================================================
// NORMALIZE ADDRESS DATA
// ============================================================

const prepareAddressData = (data) => {
  const addressData = {};

  if (data.firstName !== undefined) {
    addressData.firstName =
      String(data.firstName).trim();
  }

  if (data.lastName !== undefined) {
    addressData.lastName =
      String(data.lastName).trim();
  }

  if (data.mobile !== undefined) {
    addressData.mobile =
      String(data.mobile).trim();
  }

  if (data.addressLine1 !== undefined) {
    addressData.addressLine1 =
      String(data.addressLine1).trim();
  }

  if (data.addressLine2 !== undefined) {
    addressData.addressLine2 =
      String(data.addressLine2).trim();
  }

  if (data.landmark !== undefined) {
    addressData.landmark =
      String(data.landmark).trim();
  }

  if (data.city !== undefined) {
    addressData.city =
      String(data.city).trim();
  }

  if (data.state !== undefined) {
    addressData.state =
      String(data.state).trim();
  }

  if (data.pincode !== undefined) {
    addressData.pincode =
      String(data.pincode).trim();
  }

  if (data.country !== undefined) {
    addressData.country =
      String(data.country).trim();
  }

  if (data.addressType !== undefined) {
    addressData.addressType =
      data.addressType;
  }

  if (data.isDefault !== undefined) {
    addressData.isDefault =
      Boolean(data.isDefault);
  }

  return addressData;
};

// ============================================================
// VALIDATE COMMON ADDRESS FIELDS
// ============================================================

const validateAddressFields = (addressData) => {
  // ----------------------------------------------------------
  // Mobile
  // ----------------------------------------------------------

  if (
    addressData.mobile !== undefined &&
    !/^[0-9]{10}$/.test(
      addressData.mobile
    )
  ) {
    throw new ApiError(
      400,
      "Please provide a valid 10-digit mobile number"
    );
  }

  // ----------------------------------------------------------
  // Pincode
  // ----------------------------------------------------------

  if (
    addressData.pincode !== undefined &&
    !/^[0-9]{6}$/.test(
      addressData.pincode
    )
  ) {
    throw new ApiError(
      400,
      "Please provide a valid 6-digit pincode"
    );
  }

  // ----------------------------------------------------------
  // Address type
  // ----------------------------------------------------------

  if (
    addressData.addressType !== undefined &&
    ![
      "home",
      "work",
      "other",
    ].includes(
      addressData.addressType
    )
  ) {
    throw new ApiError(
      400,
      "Invalid address type"
    );
  }
};

// ============================================================
// CREATE ADDRESS
// ============================================================

export const createCustomerAddress = async (
  customerId,
  data
) => {
  const addressData =
    prepareAddressData(data);

  // ----------------------------------------------------------
  // Required fields
  // ----------------------------------------------------------

  const requiredFields = [
    "firstName",
    "mobile",
    "addressLine1",
    "city",
    "state",
    "pincode",
  ];

  for (const field of requiredFields) {
    if (!addressData[field]) {
      throw new ApiError(
        400,
        `${field} is required`
      );
    }
  }

  // ----------------------------------------------------------
  // Validate fields
  // ----------------------------------------------------------

  validateAddressFields(
    addressData
  );

  // ----------------------------------------------------------
  // Count existing addresses
  // ----------------------------------------------------------

  const addressCount =
    await countCustomerAddresses(
      customerId
    );

  // ----------------------------------------------------------
  // First address becomes default
  // ----------------------------------------------------------

  if (addressCount === 0) {
    addressData.isDefault = true;
  }

  // ----------------------------------------------------------
  // Make new address default
  // ----------------------------------------------------------

  if (addressData.isDefault === true) {
    await removeDefaultAddresses(
      customerId
    );
  }

  // ----------------------------------------------------------
  // Attach customer
  // ----------------------------------------------------------

  addressData.customer =
    customerId;

  // ----------------------------------------------------------
  // Create address
  // ----------------------------------------------------------

  const address =
    await createAddress(
      addressData
    );

  return address;
};

// ============================================================
// GET ALL CUSTOMER ADDRESSES
// ============================================================

export const getCustomerAddresses = async (
  customerId
) => {
  return findAddressesByCustomerId(
    customerId
  );
};

// ============================================================
// GET SINGLE CUSTOMER ADDRESS
// ============================================================

export const getCustomerAddress = async (
  customerId,
  addressId
) => {
  validateAddressId(
    addressId
  );

  const address =
    await findCustomerAddressById(
      customerId,
      addressId
    );

  if (!address) {
    throw new ApiError(
      404,
      "Address not found"
    );
  }

  return address;
};

// ============================================================
// UPDATE CUSTOMER ADDRESS
// ============================================================

export const updateCustomerAddress = async (
  customerId,
  addressId,
  data
) => {
  validateAddressId(
    addressId
  );

  // ----------------------------------------------------------
  // Check ownership
  // ----------------------------------------------------------

  const existingAddress =
    await findCustomerAddressById(
      customerId,
      addressId
    );

  if (!existingAddress) {
    throw new ApiError(
      404,
      "Address not found"
    );
  }

  // ----------------------------------------------------------
  // Prepare update data
  // ----------------------------------------------------------

  const updateData =
    prepareAddressData(data);

  // ----------------------------------------------------------
  // Validate fields
  // ----------------------------------------------------------

  validateAddressFields(
    updateData
  );

  // ----------------------------------------------------------
  // Check update fields
  // ----------------------------------------------------------

  if (
    Object.keys(updateData).length === 0
  ) {
    throw new ApiError(
      400,
      "No address fields provided for update"
    );
  }

  // ----------------------------------------------------------
  // Make address default
  // ----------------------------------------------------------

  if (
    updateData.isDefault === true
  ) {
    await removeDefaultAddresses(
      customerId
    );
  }

  // ----------------------------------------------------------
  // Update address
  // ----------------------------------------------------------

  const updatedAddress =
    await updateAddress(
      customerId,
      addressId,
      updateData
    );

  if (!updatedAddress) {
    throw new ApiError(
      404,
      "Address not found"
    );
  }

  return updatedAddress;
};

// ============================================================
// DELETE CUSTOMER ADDRESS
// ============================================================

export const removeCustomerAddress = async (
  customerId,
  addressId
) => {
  validateAddressId(
    addressId
  );

  // ----------------------------------------------------------
  // Check ownership
  // ----------------------------------------------------------

  const address =
    await findCustomerAddressById(
      customerId,
      addressId
    );

  if (!address) {
    throw new ApiError(
      404,
      "Address not found"
    );
  }

  const wasDefault =
    address.isDefault;

  // ----------------------------------------------------------
  // Delete address
  // ----------------------------------------------------------

  const deletedAddress =
    await deleteAddress(
      customerId,
      addressId
    );

  if (!deletedAddress) {
    throw new ApiError(
      404,
      "Address not found"
    );
  }

  // ----------------------------------------------------------
  // If default was deleted,
  // make another address default
  // ----------------------------------------------------------

  if (wasDefault) {
    const remainingAddresses =
      await findAddressesByCustomerId(
        customerId
      );

    if (
      remainingAddresses.length > 0
    ) {
      await updateAddress(
        customerId,
        remainingAddresses[0]._id,
        {
          isDefault: true,
        }
      );
    }
  }

  return {
    deleted: true,
    addressId,
  };
};

// ============================================================
// SET DEFAULT CUSTOMER ADDRESS
// ============================================================

export const setDefaultCustomerAddress =
  async (
    customerId,
    addressId
  ) => {
    validateAddressId(
      addressId
    );

    // --------------------------------------------------------
    // Check ownership
    // --------------------------------------------------------

    const address =
      await findCustomerAddressById(
        customerId,
        addressId
      );

    if (!address) {
      throw new ApiError(
        404,
        "Address not found"
      );
    }

    // --------------------------------------------------------
    // Remove current default
    // --------------------------------------------------------

    await removeDefaultAddresses(
      customerId
    );

    // --------------------------------------------------------
    // Set selected address as default
    // --------------------------------------------------------

    const updatedAddress =
      await updateAddress(
        customerId,
        addressId,
        {
          isDefault: true,
        }
      );

    if (!updatedAddress) {
      throw new ApiError(
        404,
        "Address not found"
      );
    }

    return updatedAddress;
  };