// import mongoose from "mongoose";

// const couponSchema = new mongoose.Schema(
//   {
//     // ==========================================================
//     // COUPON CODE
//     // ==========================================================

//     code: {
//       type: String,
//       required: true,
//       unique: true,
//       trim: true,
//       uppercase: true,
//     },

//     // ==========================================================
//     // DESCRIPTION
//     // ==========================================================

//     description: {
//       type: String,
//       trim: true,
//       default: "",
//     },

//     // ==========================================================
//     // DISCOUNT TYPE
//     // ==========================================================

//     discountType: {
//       type: String,
//       enum: ["PERCENTAGE", "FIXED"],
//       required: true,
//     },

//     // ==========================================================
//     // DISCOUNT VALUE
//     // ==========================================================

//     discountValue: {
//       type: Number,
//       required: true,
//       min: 0,
//     },

//     // ==========================================================
//     // MAXIMUM DISCOUNT
//     // ==========================================================
//     // Mainly useful for percentage coupons.
//     // Example:
//     // 20% OFF up to ₹500

//     maxDiscountAmount: {
//       type: Number,
//       default: null,
//       min: 0,
//     },

//     // ==========================================================
//     // MINIMUM ORDER AMOUNT
//     // ==========================================================

//     minimumOrderAmount: {
//       type: Number,
//       default: 0,
//       min: 0,
//     },

//     // ==========================================================
//     // START DATE
//     // ==========================================================

//     startDate: {
//       type: Date,
//       required: true,
//     },

//     // ==========================================================
//     // EXPIRY DATE
//     // ==========================================================

//     expiryDate: {
//       type: Date,
//       required: true,
//     },

//     // ==========================================================
//     // TOTAL USAGE LIMIT
//     // ==========================================================

//     usageLimit: {
//       type: Number,
//       default: null,
//       min: 1,
//     },

//     // ==========================================================
//     // CURRENT USAGE COUNT
//     // ==========================================================

//     usedCount: {
//       type: Number,
//       default: 0,
//       min: 0,
//     },

//     // ==========================================================
//     // PER CUSTOMER LIMIT
//     // ==========================================================

//     perCustomerLimit: {
//       type: Number,
//       default: 1,
//       min: 1,
//     },

//     // ==========================================================
//     // ACTIVE STATUS
//     // ==========================================================

//     isActive: {
//       type: Boolean,
//       default: true,
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// // ============================================================
// // VALIDATION
// // ============================================================

// couponSchema.pre("validate", function () {
//   // Percentage discount cannot exceed 100%
//   if (
//     this.discountType === "PERCENTAGE" &&
//     this.discountValue > 100
//   ) {
//     throw new Error(
//       "Percentage discount cannot exceed 100%"
//     );
//   }

//   // Expiry date must be after start date
//   if (
//     this.expiryDate &&
//     this.startDate &&
//     this.expiryDate <= this.startDate
//   ) {
//     throw new Error(
//       "Expiry date must be after start date"
//     );
//   }
// });

// export default mongoose.model(
//   "Coupon",
//   couponSchema
// );


import mongoose from "mongoose";

const couponUsageSchema = new mongoose.Schema(
  {
    // ==========================================================
    // CUSTOMER
    // ==========================================================

    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },

    // ==========================================================
    // ORDER
    // ==========================================================

    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },

    // ==========================================================
    // DISCOUNT USED
    // ==========================================================

    discountAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    // ==========================================================
    // USED AT
    // ==========================================================

    usedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    _id: true,
  }
);

// ============================================================
// COUPON SCHEMA
// ============================================================

const couponSchema = new mongoose.Schema(
  {
    // ==========================================================
    // COUPON CODE
    // ==========================================================

    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },

    // ==========================================================
    // DESCRIPTION
    // ==========================================================

    description: {
      type: String,
      trim: true,
      default: "",
    },

    // ==========================================================
    // DISCOUNT TYPE
    // ==========================================================

    discountType: {
      type: String,
      enum: ["PERCENTAGE", "FIXED"],
      required: true,
    },

    // ==========================================================
    // DISCOUNT VALUE
    // ==========================================================

    discountValue: {
      type: Number,
      required: true,
      min: 0,
    },

    // ==========================================================
    // MAXIMUM DISCOUNT
    // ==========================================================

    maxDiscountAmount: {
      type: Number,
      default: null,
      min: 0,
    },

    // ==========================================================
    // MINIMUM ORDER AMOUNT
    // ==========================================================

    minimumOrderAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    // ==========================================================
    // START DATE
    // ==========================================================

    startDate: {
      type: Date,
      required: true,
    },

    // ==========================================================
    // EXPIRY DATE
    // ==========================================================

    expiryDate: {
      type: Date,
      required: true,
    },

    // ==========================================================
    // TOTAL USAGE LIMIT
    // ==========================================================
    // null = unlimited usage

    usageLimit: {
      type: Number,
      default: null,
      min: 1,
    },

    // ==========================================================
    // CURRENT TOTAL USAGE
    // ==========================================================

    usedCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    // ==========================================================
    // PER CUSTOMER LIMIT
    // ==========================================================

    perCustomerLimit: {
      type: Number,
      default: 1,
      min: 1,
    },

    // ==========================================================
    // USAGE HISTORY
    // ==========================================================

    usageHistory: {
      type: [couponUsageSchema],
      default: [],
    },

    // ==========================================================
    // ACTIVE STATUS
    // ==========================================================

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// ============================================================
// VALIDATION
// ============================================================

couponSchema.pre("validate", function () {
  // ----------------------------------------------------------
  // Percentage discount cannot exceed 100%
  // ----------------------------------------------------------

  if (
    this.discountType === "PERCENTAGE" &&
    this.discountValue > 100
  ) {
    throw new Error(
      "Percentage discount cannot exceed 100%"
    );
  }

  // ----------------------------------------------------------
  // Expiry must be after start
  // ----------------------------------------------------------

  if (
    this.expiryDate &&
    this.startDate &&
    this.expiryDate <= this.startDate
  ) {
    throw new Error(
      "Expiry date must be after start date"
    );
  }

  // ----------------------------------------------------------
  // Used count cannot exceed usage limit
  // ----------------------------------------------------------

  if (
    this.usageLimit !== null &&
    this.usedCount > this.usageLimit
  ) {
    throw new Error(
      "Coupon used count cannot exceed usage limit"
    );
  }
});

// ============================================================
// MODEL
// ============================================================

export default mongoose.model(
  "Coupon",
  couponSchema
);