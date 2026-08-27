import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
  {
    // ========================================================
    // CUSTOMER
    // ========================================================

    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
      index: true,
    },

    // ========================================================
    // PERSONAL DETAILS
    // ========================================================

    firstName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
    },

    lastName: {
      type: String,
      trim: true,
      maxlength: 50,
      default: "",
    },

    mobile: {
      type: String,
      required: true,
      trim: true,
    },

    // ========================================================
    // ADDRESS
    // ========================================================

    addressLine1: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    addressLine2: {
      type: String,
      trim: true,
      maxlength: 200,
      default: "",
    },

    landmark: {
      type: String,
      trim: true,
      maxlength: 100,
      default: "",
    },

    city: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    state: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    pincode: {
      type: String,
      required: true,
      trim: true,
    },

    country: {
      type: String,
      trim: true,
      default: "India",
    },

    // ========================================================
    // ADDRESS TYPE
    // ========================================================

    addressType: {
      type: String,
      enum: ["home", "work", "other"],
      default: "home",
    },

    // ========================================================
    // DEFAULT ADDRESS
    // ========================================================

    isDefault: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// ============================================================
// INDEXES
// ============================================================

addressSchema.index({
  customer: 1,
  isDefault: 1,
});

addressSchema.index({
  customer: 1,
  createdAt: -1,
});

const Address = mongoose.model(
  "Address",
  addressSchema
);

export default Address;