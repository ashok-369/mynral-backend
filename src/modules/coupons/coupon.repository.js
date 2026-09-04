import Coupon from "./coupon.model.js";

// ============================================================
// CREATE COUPON
// ============================================================

export const createCoupon = async (data) => {
  return await Coupon.create(data);
};

// ============================================================
// FIND COUPON BY ID
// ============================================================

export const findCouponById = async (
  couponId
) => {
  return await Coupon.findById(couponId);
};

// ============================================================
// FIND COUPON BY CODE
// ============================================================

export const findCouponByCode = async (
  code
) => {
  return await Coupon.findOne({
    code: code.toUpperCase(),
  });
};

// ============================================================
// FIND ALL COUPONS
// ============================================================

export const findAllCoupons = async ({
  page = 1,
  limit = 20,
  search = "",
  isActive,
}) => {
  const currentPage = Math.max(
    Number(page) || 1,
    1
  );

  const perPage = Math.min(
    Math.max(Number(limit) || 20, 1),
    100
  );

  const skip =
    (currentPage - 1) * perPage;

  const filter = {};

  if (search && search.trim()) {
    filter.code = {
      $regex: search.trim(),
      $options: "i",
    };
  }

  if (
    isActive !== undefined &&
    isActive !== ""
  ) {
    filter.isActive =
      String(isActive) === "true";
  }

  const totalCoupons =
    await Coupon.countDocuments(filter);

  const coupons =
    await Coupon.find(filter)
      .sort({
        createdAt: -1,
      })
      .skip(skip)
      .limit(perPage)
      .lean();

  const totalPages = Math.ceil(
    totalCoupons / perPage
  );

  return {
    coupons,

    pagination: {
      currentPage,
      limit: perPage,
      totalCoupons,
      totalPages,

      hasNextPage:
        currentPage < totalPages,

      hasPreviousPage:
        currentPage > 1,
    },
  };
};

// ============================================================
// UPDATE COUPON
// ============================================================

export const updateCoupon = async (
  couponId,
  data
) => {
  return await Coupon.findByIdAndUpdate(
    couponId,
    data,
    {
      new: true,
      runValidators: true,
    }
  );
};

// ============================================================
// DELETE COUPON
// ============================================================

export const deleteCoupon = async (
  couponId
) => {
  return await Coupon.findByIdAndDelete(
    couponId
  );
};

// ============================================================
// FIND ACTIVE CUSTOMER COUPONS
// ============================================================

export const findActiveCoupons = async () => {
  const now = new Date();

  return Coupon.find({
    isActive: true,

    startDate: {
      $lte: now,
    },

    expiryDate: {
      $gte: now,
    },

    $or: [
      {
        usageLimit: null,
      },
      {
        $expr: {
          $lt: ["$usedCount", "$usageLimit"],
        },
      },
    ],
  })
    .select(
      "code description discountType discountValue maxDiscountAmount minimumOrderAmount startDate expiryDate usageLimit usedCount perCustomerLimit isActive"
    )
    .sort({
      createdAt: -1,
    })
    .lean();
};