
// import mongoose from "mongoose";

// const productSchema = new mongoose.Schema(
//   {
//     name: {
//       type: String,
//       required: true,
//       trim: true,
//     },

//     slug: {
//       type: String,
//       required: true,
//       unique: true,
//       lowercase: true,
//       trim: true,
//     },

//     description: {
//       type: String,
//       trim: true,
//     },

//     category: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Category",
//       required: true,
//     },

//     images: [
//       {
//         type: String,
//       },
//     ],

//     pricePerGram: {
//       type: Number,
//       required: true,
//       min: 0,
//     },

//     sku: {
//       type: String,
//       unique: true,
//       sparse: true,
//       trim: true,
//     },

//     isActive: {
//       type: Boolean,
//       default: true,
//     },

//     isFeatured: {
//       type: Boolean,
//       default: false,
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// const Product = mongoose.model("Product", productSchema);

// export default Product;

import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    // ==========================================================
    // PRODUCT NAME
    // ==========================================================

    name: {
      type: String,
      required: true,
      trim: true,
    },

    // ==========================================================
    // SLUG
    // ==========================================================

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    // ==========================================================
    // DESCRIPTION
    // ==========================================================

    description: {
      type: String,
      trim: true,
    },

    // ==========================================================
    // CATEGORY
    // ==========================================================

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    // ==========================================================
    // PRODUCT IMAGES
    // ==========================================================
    // Cloudinary images
    //
    // url      -> frontend image URL
    // publicId -> Cloudinary identifier used for deletion
    // ==========================================================

    images: [
      {
        url: {
          type: String,
          required: true,
          trim: true,
        },

        publicId: {
          type: String,
          required: true,
          trim: true,
        },

        width: {
          type: Number,
        },

        height: {
          type: Number,
        },

        format: {
          type: String,
          trim: true,
        },
      },
    ],

    // ==========================================================
    // PRICE PER GRAM
    // ==========================================================

    pricePerGram: {
      type: Number,
      min: 0,
    },

    // ==========================================================
    // SKU
    // ==========================================================

    sku: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
    },

    // ==========================================================
    // ACTIVE
    // ==========================================================

    isActive: {
      type: Boolean,
      default: true,
    },

    // ==========================================================
    // FEATURED
    // ==========================================================

    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model(
  "Product",
  productSchema
);

export default Product;