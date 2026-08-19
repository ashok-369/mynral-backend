import bcrypt from "bcrypt";
import ApiError from "../../utils/ApiError.js";

import {
  findCustomerProfileById,
  findCustomerByEmail,
  findCustomerByIdWithPassword,
  updateCustomer,
} from "./customer.repository.js";

import {
  revokeAllCustomerSessions,
} from "../sessions/session.repository.js";

// ============================================================
// GET CUSTOMER PROFILE
// ============================================================

export const getCustomerProfile = async (customerId) => {
  const customer =
    await findCustomerProfileById(customerId);

  if (!customer) {
    throw new ApiError(
      404,
      "Customer not found"
    );
  }

  if (!customer.isActive) {
    throw new ApiError(
      403,
      "Customer account is inactive"
    );
  }

  return {
    id: customer._id,
    firstName: customer.firstName,
    lastName: customer.lastName,
    mobile: customer.mobile,
    email: customer.email,
    isMobileVerified:
      customer.isMobileVerified,
    isEmailVerified:
      customer.isEmailVerified,
    isActive: customer.isActive,
    createdAt: customer.createdAt,
    updatedAt: customer.updatedAt,
  };
};

// ============================================================
// UPDATE CUSTOMER PROFILE
// ============================================================

export const updateCustomerProfile = async (
  customerId,
  data
) => {
  const customer =
    await findCustomerProfileById(customerId);

  if (!customer) {
    throw new ApiError(
      404,
      "Customer not found"
    );
  }

  if (!customer.isActive) {
    throw new ApiError(
      403,
      "Customer account is inactive"
    );
  }

  // ----------------------------------------------------------
  // Prepare allowed fields
  // ----------------------------------------------------------

  const updateData = {};

  if (data.firstName !== undefined) {
    updateData.firstName =
      data.firstName.trim();
  }

  if (data.lastName !== undefined) {
    updateData.lastName =
      data.lastName.trim();
  }

  if (data.email !== undefined) {
    updateData.email =
      data.email.trim().toLowerCase();
  }

  // ----------------------------------------------------------
  // Check fields
  // ----------------------------------------------------------

  if (
    Object.keys(updateData).length === 0
  ) {
    throw new ApiError(
      400,
      "No profile fields provided for update"
    );
  }

  // ----------------------------------------------------------
  // Check duplicate email
  // ----------------------------------------------------------

  if (updateData.email) {
    const existingCustomer =
      await findCustomerByEmail(
        updateData.email
      );

    if (
      existingCustomer &&
      existingCustomer._id.toString() !==
        customerId.toString()
    ) {
      throw new ApiError(
        409,
        "Email address is already registered"
      );
    }
  }

  // ----------------------------------------------------------
  // Update customer
  // ----------------------------------------------------------

  const updatedCustomer =
    await updateCustomer(
      customerId,
      updateData
    );

  if (!updatedCustomer) {
    throw new ApiError(
      404,
      "Customer not found"
    );
  }

  // ----------------------------------------------------------
  // Return updated profile
  // ----------------------------------------------------------

  return {
    id: updatedCustomer._id,
    firstName:
      updatedCustomer.firstName,
    lastName:
      updatedCustomer.lastName,
    mobile:
      updatedCustomer.mobile,
    email:
      updatedCustomer.email,
    isMobileVerified:
      updatedCustomer.isMobileVerified,
    isEmailVerified:
      updatedCustomer.isEmailVerified,
    isActive:
      updatedCustomer.isActive,
    updatedAt:
      updatedCustomer.updatedAt,
  };
};

// ============================================================
// CHANGE CUSTOMER PASSWORD
// ============================================================

export const changeCustomerPassword = async (
  customerId,
  data
) => {
  const {
    currentPassword,
    newPassword,
  } = data;

  // ----------------------------------------------------------
  // Validate current password
  // ----------------------------------------------------------

  if (!currentPassword) {
    throw new ApiError(
      400,
      "Current password is required"
    );
  }

  // ----------------------------------------------------------
  // Validate new password
  // ----------------------------------------------------------

  if (!newPassword) {
    throw new ApiError(
      400,
      "New password is required"
    );
  }

  // ----------------------------------------------------------
  // Check password length
  // ----------------------------------------------------------

  if (newPassword.length < 8) {
    throw new ApiError(
      400,
      "New password must be at least 8 characters long"
    );
  }

  // ----------------------------------------------------------
  // Find customer with password
  // ----------------------------------------------------------

  const customer =
    await findCustomerByIdWithPassword(
      customerId
    );

  if (!customer) {
    throw new ApiError(
      404,
      "Customer not found"
    );
  }

  // ----------------------------------------------------------
  // Check account status
  // ----------------------------------------------------------

  if (!customer.isActive) {
    throw new ApiError(
      403,
      "Customer account is inactive"
    );
  }

  // ----------------------------------------------------------
  // Check password exists
  // ----------------------------------------------------------

  if (!customer.password) {
    throw new ApiError(
      500,
      "Customer password is not available"
    );
  }

  // ----------------------------------------------------------
  // Verify current password
  // ----------------------------------------------------------

  const isCurrentPasswordValid =
    await bcrypt.compare(
      currentPassword,
      customer.password
    );

  if (!isCurrentPasswordValid) {
    throw new ApiError(
      401,
      "Current password is incorrect"
    );
  }

  // ----------------------------------------------------------
  // Prevent same password
  // ----------------------------------------------------------

  const isSamePassword =
    await bcrypt.compare(
      newPassword,
      customer.password
    );

  if (isSamePassword) {
    throw new ApiError(
      400,
      "New password must be different from current password"
    );
  }

  // ----------------------------------------------------------
  // Hash new password
  // ----------------------------------------------------------

  const hashedPassword =
    await bcrypt.hash(
      newPassword,
      12
    );

  // ----------------------------------------------------------
  // Update password
  // ----------------------------------------------------------

  const updatedCustomer =
    await updateCustomer(
      customerId,
      {
        password: hashedPassword,
      }
    );

  if (!updatedCustomer) {
    throw new ApiError(
      404,
      "Customer not found"
    );
  }

  // ----------------------------------------------------------
  // Revoke all existing sessions
  //
  // This forces login again on other devices/sessions.
  // ----------------------------------------------------------

  await revokeAllCustomerSessions(
    customerId
  );

  // ----------------------------------------------------------
  // Return success
  // ----------------------------------------------------------

  return {
    passwordChanged: true,
    sessionsRevoked: true,
  };
};