
import mongoose from "mongoose";

const wishlistSchema = new mongoose.Schema(
  {
    // ==========================================================
    // CUSTOMER
    // ==========================================================

    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
      unique: true,
      index: true,
    },

    // ==========================================================
    // PRODUCTS
    // ==========================================================

    products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
  },
  {
    timestamps: true,
  }
);

// ============================================================
// PREVENT DUPLICATE PRODUCTS IN WISHLIST
// ============================================================

wishlistSchema.path("products").validate(
  function (products) {
    if (!products || products.length === 0) {
      return true;
    }

    const productIds = products.map((id) =>
      id.toString()
    );

    return (
      new Set(productIds).size ===
      productIds.length
    );
  },
  "Duplicate products are not allowed in wishlist"
);

const Wishlist = mongoose.model(
  "Wishlist",
  wishlistSchema
);

export default Wishlist;

