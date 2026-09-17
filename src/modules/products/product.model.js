
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

// import mongoose from "mongoose";

// const productSchema = new mongoose.Schema(
//   {
//     // ============================================================
//     // PRODUCT NAME
//     // ============================================================

//     name: {
//       type: String,
//       required: true,
//       trim: true,
//     },

//     // ============================================================
//     // PRODUCT SLUG
//     // ============================================================

//     slug: {
//       type: String,
//       required: true,
//       unique: true,
//       lowercase: true,
//       trim: true,
//     },

//     // ============================================================
//     // PRODUCT DESCRIPTION
//     // ============================================================

//     description: {
//       type: String,
//       trim: true,
//     },

//     // ============================================================
//     // CATEGORY
//     // ============================================================

//     category: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Category",
//       required: true,
//     },

//     // ============================================================
//     // PRODUCT IMAGES
//     // ============================================================
//     // Cloudinary image structure
//     //
//     // Example:
//     // images: [
//     //   {
//     //     url: "https://res.cloudinary.com/....",
//     //     publicId: "mynral/products/almonds_abc123"
//     //   }
//     // ]
//     //
//     // publicId is required so that the image can be deleted
//     // from Cloudinary later.
//     // ============================================================

//     images: [
//       {
//         url: {
//           type: String,
//           required: true,
//           trim: true,
//         },

//         publicId: {
//           type: String,
//           required: true,
//           trim: true,
//         },
//       },
//     ],

//     // ============================================================
//     // PRICE PER GRAM
//     // ============================================================

//     pricePerGram: {
//       type: Number,
//       required: true,
//       min: 0,
//     },

//     // ============================================================
//     // SKU
//     // ============================================================

//     sku: {
//       type: String,
//       unique: true,
//       sparse: true,
//       trim: true,
//     },

//     // ============================================================
//     // ACTIVE STATUS
//     // ============================================================

//     isActive: {
//       type: Boolean,
//       default: true,
//     },

//     // ============================================================
//     // FEATURED STATUS
//     // ============================================================

//     isFeatured: {
//       type: Boolean,
//       default: false,
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// // ============================================================
// // PRODUCT MODEL
// // ============================================================

// const Product = mongoose.model("Product", productSchema);

// export default Product;