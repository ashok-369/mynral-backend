import mongoose from "mongoose";

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
    // Mainly useful for percentage coupons.
    // Example:
    // 20% OFF up to ₹500

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

    usageLimit: {
      type: Number,
      default: null,
      min: 1,
    },

    // ==========================================================
    // CURRENT USAGE COUNT
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
  // Percentage discount cannot exceed 100%
  if (
    this.discountType === "PERCENTAGE" &&
    this.discountValue > 100
  ) {
    throw new Error(
      "Percentage discount cannot exceed 100%"
    );
  }

  // Expiry date must be after start date
  if (
    this.expiryDate &&
    this.startDate &&
    this.expiryDate <= this.startDate
  ) {
    throw new Error(
      "Expiry date must be after start date"
    );
  }
});

export default mongoose.model(
  "Coupon",
  couponSchema
);