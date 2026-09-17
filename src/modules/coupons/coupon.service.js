// import mongoose from "mongoose";

// import ApiError from "../../utils/ApiError.js";

// import {
//   createCoupon,
//   findCouponById,
//   findCouponByCode,
//   findAllCoupons,
//   updateCoupon,
//   deleteCoupon,
//   findActiveCoupons,
// } from "./coupon.repository.js";

// import Coupon from "./coupon.model.js";

// // ============================================================
// // CREATE COUPON
// // ============================================================

// export const createNewCoupon = async (
//   data
// ) => {
//   let {
//     code,
//     description = "",
//     discountType,
//     discountValue,
//     maxDiscountAmount = null,
//     minimumOrderAmount = 0,
//     startDate,
//     expiryDate,
//     usageLimit = null,
//     perCustomerLimit = 1,
//     isActive = true,
//   } = data;

//   // ----------------------------------------------------------
//   // Validate code
//   // ----------------------------------------------------------

//   if (!code || !code.trim()) {
//     throw new ApiError(
//       400,
//       "Coupon code is required"
//     );
//   }

//   code = code.trim().toUpperCase();

//   // ----------------------------------------------------------
//   // Validate discount type
//   // ----------------------------------------------------------

//   if (
//     !["PERCENTAGE", "FIXED"].includes(
//       discountType
//     )
//   ) {
//     throw new ApiError(
//       400,
//       "Discount type must be PERCENTAGE or FIXED"
//     );
//   }

//   // ----------------------------------------------------------
//   // Validate discount value
//   // ----------------------------------------------------------

//   discountValue =
//     Number(discountValue);

//   if (
//     !Number.isFinite(discountValue) ||
//     discountValue <= 0
//   ) {
//     throw new ApiError(
//       400,
//       "Discount value must be greater than 0"
//     );
//   }

//   if (
//     discountType === "PERCENTAGE" &&
//     discountValue > 100
//   ) {
//     throw new ApiError(
//       400,
//       "Percentage discount cannot exceed 100%"
//     );
//   }

//   // ----------------------------------------------------------
//   // Validate minimum order
//   // ----------------------------------------------------------

//   minimumOrderAmount =
//     Number(minimumOrderAmount);

//   if (
//     !Number.isFinite(
//       minimumOrderAmount
//     ) ||
//     minimumOrderAmount < 0
//   ) {
//     throw new ApiError(
//       400,
//       "Invalid minimum order amount"
//     );
//   }

//   // ----------------------------------------------------------
//   // Validate maximum discount
//   // ----------------------------------------------------------

//   if (
//     maxDiscountAmount !== null &&
//     maxDiscountAmount !== undefined
//   ) {
//     maxDiscountAmount =
//       Number(maxDiscountAmount);

//     if (
//       !Number.isFinite(
//         maxDiscountAmount
//       ) ||
//       maxDiscountAmount <= 0
//     ) {
//       throw new ApiError(
//         400,
//         "Invalid maximum discount amount"
//       );
//     }
//   }

//   // ----------------------------------------------------------
//   // Validate dates
//   // ----------------------------------------------------------

//   const start =
//     new Date(startDate);

//   const expiry =
//     new Date(expiryDate);

//   if (
//     Number.isNaN(start.getTime()) ||
//     Number.isNaN(expiry.getTime())
//   ) {
//     throw new ApiError(
//       400,
//       "Invalid coupon dates"
//     );
//   }

//   if (expiry <= start) {
//     throw new ApiError(
//       400,
//       "Expiry date must be after start date"
//     );
//   }

//   // ----------------------------------------------------------
//   // Validate usage limit
//   // ----------------------------------------------------------

//   if (
//     usageLimit !== null &&
//     usageLimit !== undefined
//   ) {
//     usageLimit = Number(
//       usageLimit
//     );

//     if (
//       !Number.isInteger(usageLimit) ||
//       usageLimit <= 0
//     ) {
//       throw new ApiError(
//         400,
//         "Usage limit must be a positive integer"
//       );
//     }
//   }

//   // ----------------------------------------------------------
//   // Validate customer limit
//   // ----------------------------------------------------------

//   perCustomerLimit =
//     Number(perCustomerLimit);

//   if (
//     !Number.isInteger(
//       perCustomerLimit
//     ) ||
//     perCustomerLimit <= 0
//   ) {
//     throw new ApiError(
//       400,
//       "Per customer limit must be a positive integer"
//     );
//   }

//   // ----------------------------------------------------------
//   // Check duplicate coupon
//   // ----------------------------------------------------------

//   const existingCoupon =
//     await findCouponByCode(code);

//   if (existingCoupon) {
//     throw new ApiError(
//       409,
//       "Coupon code already exists"
//     );
//   }

//   // ----------------------------------------------------------
//   // Create
//   // ----------------------------------------------------------

//   return await createCoupon({
//     code,
//     description,
//     discountType,
//     discountValue,
//     maxDiscountAmount,
//     minimumOrderAmount,
//     startDate: start,
//     expiryDate: expiry,
//     usageLimit,
//     perCustomerLimit,
//     isActive,
//   });
// };

// // ============================================================
// // GET ALL COUPONS
// // ============================================================

// export const getAllCoupons = async (
//   query = {}
// ) => {
//   return await findAllCoupons(query);
// };

// // ============================================================
// // GET SINGLE COUPON
// // ============================================================

// export const getCouponById = async (
//   couponId
// ) => {
//   if (
//     !mongoose.Types.ObjectId.isValid(
//       couponId
//     )
//   ) {
//     throw new ApiError(
//       400,
//       "Invalid coupon ID"
//     );
//   }

//   const coupon =
//     await findCouponById(couponId);

//   if (!coupon) {
//     throw new ApiError(
//       404,
//       "Coupon not found"
//     );
//   }

//   return coupon;
// };

// // ============================================================
// // UPDATE COUPON
// // ============================================================

// export const updateExistingCoupon =
//   async (
//     couponId,
//     data
//   ) => {
//     if (
//       !mongoose.Types.ObjectId.isValid(
//         couponId
//       )
//     ) {
//       throw new ApiError(
//         400,
//         "Invalid coupon ID"
//       );
//     }

//     const coupon =
//       await findCouponById(
//         couponId
//       );

//     if (!coupon) {
//       throw new ApiError(
//         404,
//         "Coupon not found"
//       );
//     }

//     // --------------------------------------------------------
//     // Normalize code
//     // --------------------------------------------------------

//     if (data.code) {
//       data.code =
//         data.code.trim().toUpperCase();

//       const existingCoupon =
//         await findCouponByCode(
//           data.code
//         );

//       if (
//         existingCoupon &&
//         existingCoupon._id.toString() !==
//           couponId
//       ) {
//         throw new ApiError(
//           409,
//           "Coupon code already exists"
//         );
//       }
//     }

//     // --------------------------------------------------------
//     // Validate discount type
//     // --------------------------------------------------------

//     if (
//       data.discountType &&
//       ![
//         "PERCENTAGE",
//         "FIXED",
//       ].includes(data.discountType)
//     ) {
//       throw new ApiError(
//         400,
//         "Invalid discount type"
//       );
//     }

//     // --------------------------------------------------------
//     // Validate percentage
//     // --------------------------------------------------------

//     if (
//       data.discountType ===
//         "PERCENTAGE" &&
//       Number(data.discountValue) > 100
//     ) {
//       throw new ApiError(
//         400,
//         "Percentage discount cannot exceed 100%"
//       );
//     }

//     return await updateCoupon(
//       couponId,
//       data
//     );
//   };

// // ============================================================
// // DELETE COUPON
// // ============================================================

// export const removeCoupon = async (
//   couponId
// ) => {
//   if (
//     !mongoose.Types.ObjectId.isValid(
//       couponId
//     )
//   ) {
//     throw new ApiError(
//       400,
//       "Invalid coupon ID"
//     );
//   }

//   const coupon =
//     await findCouponById(couponId);

//   if (!coupon) {
//     throw new ApiError(
//       404,
//       "Coupon not found"
//     );
//   }

//   await deleteCoupon(couponId);

//   return {
//     message: "Coupon deleted successfully",
//   };
// };

// // ============================================================
// // ACTIVATE / DEACTIVATE COUPON
// // ============================================================

// export const toggleCouponStatus =
//   async (couponId) => {
//     if (
//       !mongoose.Types.ObjectId.isValid(
//         couponId
//       )
//     ) {
//       throw new ApiError(
//         400,
//         "Invalid coupon ID"
//       );
//     }

//     const coupon =
//       await findCouponById(
//         couponId
//       );

//     if (!coupon) {
//       throw new ApiError(
//         404,
//         "Coupon not found"
//       );
//     }

//     coupon.isActive =
//       !coupon.isActive;

//     await coupon.save();

//     return coupon;
//   };

// // ============================================================
// // VALIDATE COUPON FOR CUSTOMER
// // ============================================================

// export const validateCoupon = async ({
//   code,
//   subtotal,
// }) => {
//   if (!code || !code.trim()) {
//     throw new ApiError(
//       400,
//       "Coupon code is required"
//     );
//   }

//   subtotal = Number(subtotal);

//   if (
//     !Number.isFinite(subtotal) ||
//     subtotal < 0
//   ) {
//     throw new ApiError(
//       400,
//       "Invalid subtotal"
//     );
//   }

//   const coupon =
//     await findCouponByCode(
//       code.trim().toUpperCase()
//     );

//   if (!coupon) {
//     throw new ApiError(
//       404,
//       "Invalid coupon code"
//     );
//   }

//   // ----------------------------------------------------------
//   // Active check
//   // ----------------------------------------------------------

//   if (!coupon.isActive) {
//     throw new ApiError(
//       400,
//       "Coupon is inactive"
//     );
//   }

//   // ----------------------------------------------------------
//   // Date check
//   // ----------------------------------------------------------

//   const now = new Date();

//   if (now < coupon.startDate) {
//     throw new ApiError(
//       400,
//       "Coupon is not active yet"
//     );
//   }

//   if (now > coupon.expiryDate) {
//     throw new ApiError(
//       400,
//       "Coupon has expired"
//     );
//   }

//   // ----------------------------------------------------------
//   // Usage limit
//   // ----------------------------------------------------------

//   if (
//     coupon.usageLimit !== null &&
//     coupon.usedCount >=
//       coupon.usageLimit
//   ) {
//     throw new ApiError(
//       400,
//       "Coupon usage limit has been reached"
//     );
//   }

//   // ----------------------------------------------------------
//   // Minimum order
//   // ----------------------------------------------------------

//   if (
//     subtotal <
//     coupon.minimumOrderAmount
//   ) {
//     throw new ApiError(
//       400,
//       `Minimum order amount is ₹${coupon.minimumOrderAmount}`
//     );
//   }

//   // ----------------------------------------------------------
//   // Calculate discount
//   // ----------------------------------------------------------

//   let discountAmount = 0;

//   if (
//     coupon.discountType ===
//     "PERCENTAGE"
//   ) {
//     discountAmount =
//       (subtotal *
//         coupon.discountValue) /
//       100;

//     if (
//       coupon.maxDiscountAmount !==
//         null &&
//       discountAmount >
//         coupon.maxDiscountAmount
//     ) {
//       discountAmount =
//         coupon.maxDiscountAmount;
//     }
//   } else {
//     discountAmount =
//       coupon.discountValue;
//   }

//   // ----------------------------------------------------------
//   // Discount cannot exceed subtotal
//   // ----------------------------------------------------------

//   discountAmount = Math.min(
//     discountAmount,
//     subtotal
//   );

//   const finalAmount =
//     subtotal - discountAmount;

//   return {
//     couponId: coupon._id,
//     code: coupon.code,

//     discountType:
//       coupon.discountType,

//     discountValue:
//       coupon.discountValue,

//     subtotal,

//     discountAmount,

//     finalAmount,
//   };
// };

// // ============================================================
// // GET ACTIVE COUPONS FOR CUSTOMER
// // ============================================================

// export const getActiveCoupons = async () => {
//    return findActiveCoupons();
// };

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
import Order from "../orders/order.model.js";

// ============================================================
// CREATE COUPON
// ============================================================

export const createNewCoupon = async (data) => {
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

  // ==========================================================
  // COUPON CODE
  // ==========================================================

  if (!code || !code.trim()) {
    throw new ApiError(
      400,
      "Coupon code is required"
    );
  }

  code = code.trim().toUpperCase();

  // ==========================================================
  // DISCOUNT TYPE
  // ==========================================================

  if (
    !["PERCENTAGE", "FIXED"].includes(discountType)
  ) {
    throw new ApiError(
      400,
      "Discount type must be PERCENTAGE or FIXED"
    );
  }

  // ==========================================================
  // DISCOUNT VALUE
  // ==========================================================

  discountValue = Number(discountValue);

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

  // ==========================================================
  // MINIMUM ORDER AMOUNT
  // ==========================================================

  minimumOrderAmount = Number(
    minimumOrderAmount
  );

  if (
    !Number.isFinite(minimumOrderAmount) ||
    minimumOrderAmount < 0
  ) {
    throw new ApiError(
      400,
      "Invalid minimum order amount"
    );
  }

  // ==========================================================
  // MAXIMUM DISCOUNT
  // ==========================================================

  if (
    maxDiscountAmount !== null &&
    maxDiscountAmount !== undefined
  ) {
    maxDiscountAmount = Number(
      maxDiscountAmount
    );

    if (
      !Number.isFinite(maxDiscountAmount) ||
      maxDiscountAmount <= 0
    ) {
      throw new ApiError(
        400,
        "Invalid maximum discount amount"
      );
    }
  }

  // ==========================================================
  // DATES
  // ==========================================================

  const start = new Date(startDate);
  const expiry = new Date(expiryDate);

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

  // ==========================================================
  // TOTAL USAGE LIMIT
  // ==========================================================

  if (
    usageLimit !== null &&
    usageLimit !== undefined
  ) {
    usageLimit = Number(usageLimit);

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

  // ==========================================================
  // PER CUSTOMER LIMIT
  // ==========================================================

  perCustomerLimit = Number(
    perCustomerLimit
  );

  if (
    !Number.isInteger(perCustomerLimit) ||
    perCustomerLimit <= 0
  ) {
    throw new ApiError(
      400,
      "Per customer limit must be a positive integer"
    );
  }

  // ==========================================================
  // CHECK DUPLICATE CODE
  // ==========================================================

  const existingCoupon =
    await findCouponByCode(code);

  if (existingCoupon) {
    throw new ApiError(
      409,
      "Coupon code already exists"
    );
  }

  // ==========================================================
  // CREATE
  // ==========================================================

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
// GET COUPON BY ID
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

export const updateExistingCoupon = async (
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
    await findCouponById(couponId);

  if (!coupon) {
    throw new ApiError(
      404,
      "Coupon not found"
    );
  }

  // ==========================================================
  // CODE
  // ==========================================================

  if (data.code) {
    data.code = data.code
      .trim()
      .toUpperCase();

    const existingCoupon =
      await findCouponByCode(data.code);

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

  // ==========================================================
  // DISCOUNT TYPE
  // ==========================================================

  if (
    data.discountType &&
    !["PERCENTAGE", "FIXED"].includes(
      data.discountType
    )
  ) {
    throw new ApiError(
      400,
      "Invalid discount type"
    );
  }

  // ==========================================================
  // DISCOUNT VALUE
  // ==========================================================

  if (
    data.discountValue !== undefined
  ) {
    data.discountValue = Number(
      data.discountValue
    );

    if (
      !Number.isFinite(
        data.discountValue
      ) ||
      data.discountValue <= 0
    ) {
      throw new ApiError(
        400,
        "Discount value must be greater than 0"
      );
    }

    const finalDiscountType =
      data.discountType ||
      coupon.discountType;

    if (
      finalDiscountType === "PERCENTAGE" &&
      data.discountValue > 100
    ) {
      throw new ApiError(
        400,
        "Percentage discount cannot exceed 100%"
      );
    }
  }

  // ==========================================================
  // MINIMUM ORDER AMOUNT
  // ==========================================================

  if (
    data.minimumOrderAmount !== undefined
  ) {
    data.minimumOrderAmount = Number(
      data.minimumOrderAmount
    );

    if (
      !Number.isFinite(
        data.minimumOrderAmount
      ) ||
      data.minimumOrderAmount < 0
    ) {
      throw new ApiError(
        400,
        "Invalid minimum order amount"
      );
    }
  }

  // ==========================================================
  // MAXIMUM DISCOUNT
  // ==========================================================

  if (
    data.maxDiscountAmount !== undefined &&
    data.maxDiscountAmount !== null
  ) {
    data.maxDiscountAmount = Number(
      data.maxDiscountAmount
    );

    if (
      !Number.isFinite(
        data.maxDiscountAmount
      ) ||
      data.maxDiscountAmount <= 0
    ) {
      throw new ApiError(
        400,
        "Invalid maximum discount amount"
      );
    }
  }

  // ==========================================================
  // USAGE LIMIT
  // ==========================================================

  if (
    data.usageLimit !== undefined
  ) {
    if (
      data.usageLimit === null ||
      data.usageLimit === ""
    ) {
      data.usageLimit = null;
    } else {
      data.usageLimit = Number(
        data.usageLimit
      );

      if (
        !Number.isInteger(
          data.usageLimit
        ) ||
        data.usageLimit <= 0
      ) {
        throw new ApiError(
          400,
          "Usage limit must be a positive integer"
        );
      }
    }
  }

  // ==========================================================
  // PER CUSTOMER LIMIT
  // ==========================================================

  if (
    data.perCustomerLimit !== undefined
  ) {
    data.perCustomerLimit = Number(
      data.perCustomerLimit
    );

    if (
      !Number.isInteger(
        data.perCustomerLimit
      ) ||
      data.perCustomerLimit <= 0
    ) {
      throw new ApiError(
        400,
        "Per customer limit must be a positive integer"
      );
    }
  }

  // ==========================================================
  // DATES
  // ==========================================================

  if (
    data.startDate !== undefined ||
    data.expiryDate !== undefined
  ) {
    const finalStartDate =
      data.startDate
        ? new Date(data.startDate)
        : coupon.startDate;

    const finalExpiryDate =
      data.expiryDate
        ? new Date(data.expiryDate)
        : coupon.expiryDate;

    if (
      Number.isNaN(
        finalStartDate.getTime()
      ) ||
      Number.isNaN(
        finalExpiryDate.getTime()
      )
    ) {
      throw new ApiError(
        400,
        "Invalid coupon dates"
      );
    }

    if (
      finalExpiryDate <=
      finalStartDate
    ) {
      throw new ApiError(
        400,
        "Expiry date must be after start date"
      );
    }

    if (data.startDate) {
      data.startDate =
        finalStartDate;
    }

    if (data.expiryDate) {
      data.expiryDate =
        finalExpiryDate;
    }
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
// TOGGLE COUPON STATUS
// ============================================================

export const toggleCouponStatus = async (
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

  coupon.isActive =
    !coupon.isActive;

  await coupon.save();

  return coupon;
};

// ============================================================
// VALIDATE COUPON
// POST /api/coupons/validate
// ============================================================

export const validateCoupon = async ({
  code,
  subtotal,
  customerId,
}) => {
  // ==========================================================
  // CUSTOMER ID
  // ==========================================================

  if (!customerId) {
    throw new ApiError(
      401,
      "Customer authentication is required"
    );
  }

  if (
    !mongoose.Types.ObjectId.isValid(
      customerId
    )
  ) {
    throw new ApiError(
      401,
      "Invalid customer authentication"
    );
  }

  // ==========================================================
  // COUPON CODE
  // ==========================================================

  if (
    !code ||
    !code.trim()
  ) {
    throw new ApiError(
      400,
      "Coupon code is required"
    );
  }

  // ==========================================================
  // SUBTOTAL
  // ==========================================================

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

  // ==========================================================
  // FIND COUPON
  // ==========================================================

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

  // ==========================================================
  // ACTIVE
  // ==========================================================

  if (!coupon.isActive) {
    throw new ApiError(
      400,
      "Coupon is inactive"
    );
  }

  // ==========================================================
  // DATE VALIDATION
  // ==========================================================

  const now = new Date();

  if (
    now < coupon.startDate
  ) {
    throw new ApiError(
      400,
      "Coupon is not active yet"
    );
  }

  if (
    now > coupon.expiryDate
  ) {
    throw new ApiError(
      400,
      "Coupon has expired"
    );
  }

  // ==========================================================
  // TOTAL USAGE LIMIT
  // ==========================================================

  if (
    coupon.usageLimit !== null &&
    coupon.usageLimit !== undefined &&
    coupon.usedCount >=
      coupon.usageLimit
  ) {
    throw new ApiError(
      400,
      "Coupon usage limit has been reached"
    );
  }

  // ==========================================================
  // CUSTOMER USAGE LIMIT
  //
  // We use existing orders instead of a separate
  // couponUsage collection.
  // ==========================================================

  const previousUsageCount =
    await Order.countDocuments({
      customer: customerId,
      couponCode: coupon.code,
      orderStatus: {
        $ne: "CANCELLED",
      },
    });

  if (
    previousUsageCount >=
    coupon.perCustomerLimit
  ) {
    throw new ApiError(
      400,
      `You can use this coupon only ${coupon.perCustomerLimit} time${
        coupon.perCustomerLimit > 1
          ? "s"
          : ""
      }`
    );
  }

  // ==========================================================
  // MINIMUM ORDER AMOUNT
  // ==========================================================

  if (
    subtotal <
    coupon.minimumOrderAmount
  ) {
    throw new ApiError(
      400,
      `Minimum order amount is ₹${coupon.minimumOrderAmount}`
    );
  }

  // ==========================================================
  // CALCULATE DISCOUNT
  // ==========================================================

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
      coupon.maxDiscountAmount !==
        undefined &&
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

  // ==========================================================
  // NEVER DISCOUNT MORE THAN SUBTOTAL
  // ==========================================================

  discountAmount = Math.min(
    discountAmount,
    subtotal
  );

  // ==========================================================
  // FINAL AMOUNT
  // ==========================================================

  const finalAmount =
    subtotal - discountAmount;

  // ==========================================================
  // RESPONSE
  // ==========================================================

  return {
    couponId: coupon._id,
    code: coupon.code,
    description: coupon.description,

    discountType:
      coupon.discountType,

    discountValue:
      coupon.discountValue,

    maxDiscountAmount:
      coupon.maxDiscountAmount,

    minimumOrderAmount:
      coupon.minimumOrderAmount,

    usageLimit:
      coupon.usageLimit,

    usedCount:
      coupon.usedCount,

    perCustomerLimit:
      coupon.perCustomerLimit,

    customerUsedCount:
      previousUsageCount,

    subtotal,

    discountAmount,

    finalAmount,
  };
};

// ============================================================
// GET ACTIVE COUPONS
// ============================================================

export const getActiveCoupons = async (customerId) => {
  const coupons = await findActiveCoupons();

  if (!customerId) {
    return coupons;
  }

  const enrichedCoupons = await Promise.all(
    coupons.map(async (coupon) => {
      // --------------------------------------------------------
      // Per-customer usage count (exclude CANCELLED orders)
      // --------------------------------------------------------
      const customerUsedCount = await Order.countDocuments({
        customer: customerId,
        couponCode: coupon.code,
        orderStatus: {
          $ne: "CANCELLED",
        },
      });

      // --------------------------------------------------------
      // Per-customer limit (use stored value; default is 1)
      // --------------------------------------------------------
      const perCustomerLimit = Number(
        coupon.perCustomerLimit ?? 1
      );

      // --------------------------------------------------------
      // Total usage limit exhausted?
      // --------------------------------------------------------
      const usageLimitReached =
        coupon.usageLimit !== null &&
        coupon.usageLimit !== undefined &&
        coupon.usedCount >= coupon.usageLimit;

      // --------------------------------------------------------
      // Coupon is already used by this customer if they have
      // hit their personal limit OR the global limit is full
      // --------------------------------------------------------
      const alreadyUsed =
        customerUsedCount >= perCustomerLimit ||
        usageLimitReached;

      // --------------------------------------------------------
      // Remaining uses for this customer
      // --------------------------------------------------------
      const customerRemainingUses = Math.max(
        0,
        perCustomerLimit - customerUsedCount
      );

      return {
        ...coupon,
        customerUsedCount,
        perCustomerLimit,
        usageLimitReached,
        customerRemainingUses,
        alreadyUsed,
      };
    })
  );

  return enrichedCoupons;
};