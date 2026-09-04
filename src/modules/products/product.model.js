// import mongoose from "mongoose";

// const productSchema = new mongoose.Schema(
//   {
//     // ==========================================================
//     // BASIC INFORMATION
//     // ==========================================================

//     name: {
//       type: String,
//       required: true,
//       trim: true,
//       maxlength: 200,
//     },

//     slug: {
//       type: String,
//       required: true,
//       unique: true,
//       lowercase: true,
//       trim: true,
//       index: true,
//     },

//     description: {
//       type: String,
//       trim: true,
//       default: "",
//     },

//     // ==========================================================
//     // CATEGORY
//     // ==========================================================

//     category: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Category",
//       required: true,
//       index: true,
//     },

//     // ==========================================================
//     // PRODUCT IMAGES
//     // ==========================================================

//     images: [
//       {
//         type: String,
//         trim: true,
//       },
//     ],

//     // ==========================================================
//     // PRICING
//     // ==========================================================

//     price: {
//       type: Number,
//       required: true,
//       min: 0,
//     },

//     discountPrice: {
//       type: Number,
//       default: null,
//       min: 0,
//     },

//     // ==========================================================
//     // INVENTORY
//     // ==========================================================

//     stock: {
//       type: Number,
//       required: true,
//       default: 0,
//       min: 0,
//     },

//     sku: {
//       type: String,
//       required: true,
//       unique: true,
//       trim: true,
//       uppercase: true,
//       index: true,
//     },

//     // ==========================================================
//     // UNIT
//     // ==========================================================

//     unit: {
//       type: String,
//       required: true,
//       trim: true,
//       default: "piece",
//     },

//     // ==========================================================
//     // PRODUCT STATUS
//     // ==========================================================

//     isActive: {
//       type: Boolean,
//       default: true,
//       index: true,
//     },

//     isFeatured: {
//       type: Boolean,
//       default: false,
//       index: true,
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// // ============================================================
// // INDEXES
// // ============================================================

// productSchema.index({
//   name: "text",
//   description: "text",
// });

// productSchema.index({
//   category: 1,
//   isActive: 1,
// });

// productSchema.index({
//   price: 1,
// });

// productSchema.index({
//   createdAt: -1,
// });

// const Product = mongoose.model(
//   "Product",
//   productSchema
// );

// export default Product;
import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    images: [
      {
        type: String,
      },
    ],

    pricePerGram: {
      type: Number,
      required: true,
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

    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model("Product", productSchema);

export default Product;