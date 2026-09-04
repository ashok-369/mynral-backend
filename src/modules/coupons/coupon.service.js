import mongoose from "mongoose";

import ApiError from "../../utils/ApiError.js";

import {
  createCoupon,
  findCouponById,
  findCouponByCode,
  findAllCoupons,
  updateCoupon,
  deleteCoupon,
  findActiveCoupons,
} from "./coupon.repository.js";

import Coupon from "./coupon.model.js";

// ============================================================
// CREATE COUPON
// ============================================================

export const createNewCoupon = async (
  data
) => {
  let {
    code,
    description = "",
    discountType,
    discountValue,
    maxDiscountAmount = null,
    minimumOrderAmount = 0,
    startDate,
    expiryDate,
    usageLimit = null,
    perCustomerLimit = 1,
    isActive = true,
  } = data;

  // ----------------------------------------------------------
  // Validate code
  // ----------------------------------------------------------

  if (!code || !code.trim()) {
    throw new ApiError(
      400,
      "Coupon code is required"
    );
  }

  code = code.trim().toUpperCase();

  // ----------------------------------------------------------
  // Validate discount type
  // ----------------------------------------------------------

  if (
    !["PERCENTAGE", "FIXED"].includes(
      discountType
    )
  ) {
    throw new ApiError(
      400,
      "Discount type must be PERCENTAGE or FIXED"
    );
  }

  // ----------------------------------------------------------
  // Validate discount value
  // ----------------------------------------------------------

  discountValue =
    Number(discountValue);

  if (
    !Number.isFinite(discountValue) ||
    discountValue <= 0
  ) {
    throw new ApiError(
      400,
      "Discount value must be greater than 0"
    );
  }

  if (
    discountType === "PERCENTAGE" &&
    discountValue > 100
  ) {
    throw new ApiError(
      400,
      "Percentage discount cannot exceed 100%"
    );
  }

  // ----------------------------------------------------------
  // Validate minimum order
  // ----------------------------------------------------------

  minimumOrderAmount =
    Number(minimumOrderAmount);

  if (
    !Number.isFinite(
      minimumOrderAmount
    ) ||
    minimumOrderAmount < 0
  ) {
    throw new ApiError(
      400,
      "Invalid minimum order amount"
    );
  }

  // ----------------------------------------------------------
  // Validate maximum discount
  // ----------------------------------------------------------

  if (
    maxDiscountAmount !== null &&
    maxDiscountAmount !== undefined
  ) {
    maxDiscountAmount =
      Number(maxDiscountAmount);

    if (
      !Number.isFinite(
        maxDiscountAmount
      ) ||
      maxDiscountAmount <= 0
    ) {
      throw new ApiError(
        400,
        "Invalid maximum discount amount"
      );
    }
  }

  // ----------------------------------------------------------
  // Validate dates
  // ----------------------------------------------------------

  const start =
    new Date(startDate);

  const expiry =
    new Date(expiryDate);

  if (
    Number.isNaN(start.getTime()) ||
    Number.isNaN(expiry.getTime())
  ) {
    throw new ApiError(
      400,
      "Invalid coupon dates"
    );
  }

  if (expiry <= start) {
    throw new ApiError(
      400,
      "Expiry date must be after start date"
    );
  }

  // ----------------------------------------------------------
  // Validate usage limit
  // ----------------------------------------------------------

  if (
    usageLimit !== null &&
    usageLimit !== undefined
  ) {
    usageLimit = Number(
      usageLimit
    );

    if (
      !Number.isInteger(usageLimit) ||
      usageLimit <= 0
    ) {
      throw new ApiError(
        400,
        "Usage limit must be a positive integer"
      );
    }
  }

  // ----------------------------------------------------------
  // Validate customer limit
  // ----------------------------------------------------------

  perCustomerLimit =
    Number(perCustomerLimit);

  if (
    !Number.isInteger(
      perCustomerLimit
    ) ||
    perCustomerLimit <= 0
  ) {
    throw new ApiError(
      400,
      "Per customer limit must be a positive integer"
    );
  }

  // ----------------------------------------------------------
  // Check duplicate coupon
  // ----------------------------------------------------------

  const existingCoupon =
    await findCouponByCode(code);

  if (existingCoupon) {
    throw new ApiError(
      409,
      "Coupon code already exists"
    );
  }

  // ----------------------------------------------------------
  // Create
  // ----------------------------------------------------------

  return await createCoupon({
    code,
    description,
    discountType,
    discountValue,
    maxDiscountAmount,
    minimumOrderAmount,
    startDate: start,
    expiryDate: expiry,
    usageLimit,
    perCustomerLimit,
    isActive,
  });
};

// ============================================================
// GET ALL COUPONS
// ============================================================

export const getAllCoupons = async (
  query = {}
) => {
  return await findAllCoupons(query);
};

// ============================================================
// GET SINGLE COUPON
// ============================================================

export const getCouponById = async (
  couponId
) => {
  if (
    !mongoose.Types.ObjectId.isValid(
      couponId
    )
  ) {
    throw new ApiError(
      400,
      "Invalid coupon ID"
    );
  }

  const coupon =
    await findCouponById(couponId);

  if (!coupon) {
    throw new ApiError(
      404,
      "Coupon not found"
    );
  }

  return coupon;
};

// ============================================================
// UPDATE COUPON
// ============================================================

export const updateExistingCoupon =
  async (
    couponId,
    data
  ) => {
    if (
      !mongoose.Types.ObjectId.isValid(
        couponId
      )
    ) {
      throw new ApiError(
        400,
        "Invalid coupon ID"
      );
    }

    const coupon =
      await findCouponById(
        couponId
      );

    if (!coupon) {
      throw new ApiError(
        404,
        "Coupon not found"
      );
    }

    // --------------------------------------------------------
    // Normalize code
    // --------------------------------------------------------

    if (data.code) {
      data.code =
        data.code.trim().toUpperCase();

      const existingCoupon =
        await findCouponByCode(
          data.code
        );

      if (
        existingCoupon &&
        existingCoupon._id.toString() !==
          couponId
      ) {
        throw new ApiError(
          409,
          "Coupon code already exists"
        );
      }
    }

    // --------------------------------------------------------
    // Validate discount type
    // --------------------------------------------------------

    if (
      data.discountType &&
      ![
        "PERCENTAGE",
        "FIXED",
      ].includes(data.discountType)
    ) {
      throw new ApiError(
        400,
        "Invalid discount type"
      );
    }

    // --------------------------------------------------------
    // Validate percentage
    // --------------------------------------------------------

    if (
      data.discountType ===
        "PERCENTAGE" &&
      Number(data.discountValue) > 100
    ) {
      throw new ApiError(
        400,
        "Percentage discount cannot exceed 100%"
      );
    }

    return await updateCoupon(
      couponId,
      data
    );
  };

// ============================================================
// DELETE COUPON
// ============================================================

export const removeCoupon = async (
  couponId
) => {
  if (
    !mongoose.Types.ObjectId.isValid(
      couponId
    )
  ) {
    throw new ApiError(
      400,
      "Invalid coupon ID"
    );
  }

  const coupon =
    await findCouponById(couponId);

  if (!coupon) {
    throw new ApiError(
      404,
      "Coupon not found"
    );
  }

  await deleteCoupon(couponId);

  return {
    message: "Coupon deleted successfully",
  };
};

// ============================================================
// ACTIVATE / DEACTIVATE COUPON
// ============================================================

export const toggleCouponStatus =
  async (couponId) => {
    if (
      !mongoose.Types.ObjectId.isValid(
        couponId
      )
    ) {
      throw new ApiError(
        400,
        "Invalid coupon ID"
      );
    }

    const coupon =
      await findCouponById(
        couponId
      );

    if (!coupon) {
      throw new ApiError(
        404,
        "Coupon not found"
      );
    }

    coupon.isActive =
      !coupon.isActive;

    await coupon.save();

    return coupon;
  };

// ============================================================
// VALIDATE COUPON FOR CUSTOMER
// ============================================================

export const validateCoupon = async ({
  code,
  subtotal,
}) => {
  if (!code || !code.trim()) {
    throw new ApiError(
      400,
      "Coupon code is required"
    );
  }

  subtotal = Number(subtotal);

  if (
    !Number.isFinite(subtotal) ||
    subtotal < 0
  ) {
    throw new ApiError(
      400,
      "Invalid subtotal"
    );
  }

  const coupon =
    await findCouponByCode(
      code.trim().toUpperCase()
    );

  if (!coupon) {
    throw new ApiError(
      404,
      "Invalid coupon code"
    );
  }

  // ----------------------------------------------------------
  // Active check
  // ----------------------------------------------------------

  if (!coupon.isActive) {
    throw new ApiError(
      400,
      "Coupon is inactive"
    );
  }

  // ----------------------------------------------------------
  // Date check
  // ----------------------------------------------------------

  const now = new Date();

  if (now < coupon.startDate) {
    throw new ApiError(
      400,
      "Coupon is not active yet"
    );
  }

  if (now > coupon.expiryDate) {
    throw new ApiError(
      400,
      "Coupon has expired"
    );
  }

  // ----------------------------------------------------------
  // Usage limit
  // ----------------------------------------------------------

  if (
    coupon.usageLimit !== null &&
    coupon.usedCount >=
      coupon.usageLimit
  ) {
    throw new ApiError(
      400,
      "Coupon usage limit has been reached"
    );
  }

  // ----------------------------------------------------------
  // Minimum order
  // ----------------------------------------------------------

  if (
    subtotal <
    coupon.minimumOrderAmount
  ) {
    throw new ApiError(
      400,
      `Minimum order amount is ₹${coupon.minimumOrderAmount}`
    );
  }

  // ----------------------------------------------------------
  // Calculate discount
  // ----------------------------------------------------------

  let discountAmount = 0;

  if (
    coupon.discountType ===
    "PERCENTAGE"
  ) {
    discountAmount =
      (subtotal *
        coupon.discountValue) /
      100;

    if (
      coupon.maxDiscountAmount !==
        null &&
      discountAmount >
        coupon.maxDiscountAmount
    ) {
      discountAmount =
        coupon.maxDiscountAmount;
    }
  } else {
    discountAmount =
      coupon.discountValue;
  }

  // ----------------------------------------------------------
  // Discount cannot exceed subtotal
  // ----------------------------------------------------------

  discountAmount = Math.min(
    discountAmount,
    subtotal
  );

  const finalAmount =
    subtotal - discountAmount;

  return {
    couponId: coupon._id,
    code: coupon.code,

    discountType:
      coupon.discountType,

    discountValue:
      coupon.discountValue,

    subtotal,

    discountAmount,

    finalAmount,
  };
};

// ============================================================
// GET ACTIVE COUPONS FOR CUSTOMER
// ============================================================

export const getActiveCoupons = async () => {
   return findActiveCoupons();
};