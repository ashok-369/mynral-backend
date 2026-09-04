import mongoose from "mongoose";

const variantSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },

    weight: {
      type: Number,
      required: true,
      min: 1,
    },

    weightUnit: {
      type: String,
      enum: ["g", "kg"],
      default: "g",
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    discountPrice: {
      type: Number,
      min: 0,
      default: null,
    },

    stock: {
      type: Number,
      default: 0,
      min: 0,
    },

    sku: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

variantSchema.index(
  {
    product: 1,
    weight: 1,
    weightUnit: 1,
  },
  {
    unique: true,
  }
);

const Variant = mongoose.model("Variant", variantSchema);

export default Variant;