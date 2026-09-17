// import mongoose from "mongoose";

// const orderItemSchema = new mongoose.Schema(
//   {
//     product: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Product",
//       required: true,
//     },

//     name: {
//       type: String,
//       required: true,
//       trim: true,
//     },

//     sku: {
//       type: String,
//       required: true,
//       trim: true,
//       uppercase: true,
//     },

//     image: {
//       type: String,
//       default: null,
//     },

//     quantity: {
//       type: Number,
//       required: true,
//       min: 1,
//     },

//     price: {
//       type: Number,
//       required: true,
//       min: 0,
//     },

//     total: {
//       type: Number,
//       required: true,
//       min: 0,
//     },
//   },
//   { _id: false }
// );

// const addressSnapshotSchema = new mongoose.Schema(
//   {
//     firstName: {
//       type: String,
//       required: true,
//     },

//     lastName: {
//       type: String,
//       default: "",
//     },

//     mobile: {
//       type: String,
//       required: true,
//     },

//     addressLine1: {
//       type: String,
//       required: true,
//     },

//     addressLine2: {
//       type: String,
//       default: "",
//     },

//     city: {
//       type: String,
//       required: true,
//     },

//     state: {
//       type: String,
//       required: true,
//     },

//     pincode: {
//       type: String,
//       required: true,
//     },

//     landmark: {
//       type: String,
//       default: "",
//     },
//   },
//   { _id: false }
// );

// const orderSchema = new mongoose.Schema(
//   {
//     customer: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Customer",
//       required: true,
//       index: true,
//     },

//     orderNumber: {
//       type: String,
//       required: true,
//       unique: true,
//       index: true,
//     },

//     items: {
//       type: [orderItemSchema],
//       required: true,
//       validate: {
//         validator: (items) =>
//           items.length > 0,
//         message: "Order must contain at least one item",
//       },
//     },

//     shippingAddress: {
//       type: addressSnapshotSchema,
//       required: true,
//     },

//     subtotal: {
//       type: Number,
//       required: true,
//       min: 0,
//     },

//     shippingCharge: {
//       type: Number,
//       default: 0,
//       min: 0,
//     },

//     discount: {
//       type: Number,
//       default: 0,
//       min: 0,
//     },

//     totalAmount: {
//       type: Number,
//       required: true,
//       min: 0,
//     },

//     paymentMethod: {
//       type: String,
//       enum: [
//         "COD",
//         "ONLINE",
//         "RAZORPAY"
//       ],
//       required: true,
//     },

//     paymentStatus: {
//       type: String,
//       enum: [
//         "PENDING",
//         "PAID",
//         "FAILED",
//         "REFUNDED",
//       ],
//       default: "PENDING",
//     },

// //razorpay code only when paymentMethod is RAZORPAY

//     razorpayOrderId: {
//       type: String,
//       default: null,
//       index: true,
//     },

//     razorpayPaymentId: {
//       type: String,
//       default: null,
//       index: true,
//     },

//     razorpaySignature: {
//       type: String,
//       default: null,
//     },






//    orderStatus: {
//   type: String,
//   enum: [
//     "PLACED",
//     "CONFIRMED",
//     "PROCESSING",
//     "SHIPPED",
//     "DELIVERED",
//     "CANCELLED",
//   ],
//   default: "PLACED",
// },

//     cancelledAt: {
//       type: Date,
//       default: null,
//     },

//     cancellationReason: {
//       type: String,
//       default: "",
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// orderSchema.index({
//   customer: 1,
//   createdAt: -1,
// });

// orderSchema.index({
//   orderStatus: 1,
// });

// const Order = mongoose.model(
//   "Order",
//   orderSchema
// );

// export default Order;

import mongoose from "mongoose";

// ============================================================
// ORDER ITEM
// ============================================================

const orderItemSchema = new mongoose.Schema(
  {
    // Parent product
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    // Selected variant
    // IMPORTANT:
    // This is null for products without variants.
    variant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Variant",
      default: null,
    },

    // Product name snapshot
    name: {
      type: String,
      required: true,
      trim: true,
    },

    // Variant name/weight snapshot
    variantLabel: {
      type: String,
      default: "",
      trim: true,
    },

    // SKU snapshot
    sku: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },

    // Product/variant image snapshot
    image: {
      type: String,
      default: null,
    },

    // Quantity ordered
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    // Actual backend selling price
    price: {
      type: Number,
      required: true,
      min: 0,
    },

    // price * quantity
    total: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    _id: false,
  }
);

// ============================================================
// ADDRESS SNAPSHOT
// ============================================================

const addressSnapshotSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },

    lastName: {
      type: String,
      default: "",
    },

    mobile: {
      type: String,
      required: true,
    },

    addressLine1: {
      type: String,
      required: true,
    },

    addressLine2: {
      type: String,
      default: "",
    },

    city: {
      type: String,
      required: true,
    },

    state: {
      type: String,
      required: true,
    },

    pincode: {
      type: String,
      required: true,
    },

    landmark: {
      type: String,
      default: "",
    },
  },
  {
    _id: false,
  }
);

// ============================================================
// ORDER
// ============================================================

const orderSchema = new mongoose.Schema(
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
    // ORDER NUMBER
    // ========================================================

    orderNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    // ========================================================
    // ITEMS
    // ========================================================

    items: {
      type: [orderItemSchema],
      required: true,

      validate: {
        validator: (items) =>
          Array.isArray(items) && items.length > 0,

        message: "Order must contain at least one item",
      },
    },

    // ========================================================
    // SHIPPING ADDRESS
    // ========================================================

    shippingAddress: {
      type: addressSnapshotSchema,
      required: true,
    },

    // ========================================================
    // AMOUNTS
    // ========================================================

    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },

    shippingCharge: {
      type: Number,
      default: 0,
      min: 0,
    },

    discount: {
      type: Number,
      default: 0,
      min: 0,
    },

    couponCode: {
      type: String,
      default: null,
      trim: true,
      uppercase: true,
    },

    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    // ========================================================
    // PAYMENT
    // ========================================================

    paymentMethod: {
      type: String,
      enum: [
        "COD",
        "ONLINE",
        "RAZORPAY",
      ],
      required: true,
    },

    paymentStatus: {
      type: String,
      enum: [
        "PENDING",
        "PAID",
        "FAILED",
        "REFUNDED",
      ],
      default: "PENDING",
    },

    // ========================================================
    // RAZORPAY
    // ========================================================

    razorpayOrderId: {
      type: String,
      default: null,
      index: true,
    },

    razorpayPaymentId: {
      type: String,
      default: null,
      index: true,
    },

    razorpaySignature: {
      type: String,
      default: null,
    },

    // ========================================================
    // ORDER STATUS
    // ========================================================

    orderStatus: {
      type: String,
      enum: [
        "PLACED",
        "CONFIRMED",
        "PROCESSING",
        "SHIPPED",
        "DELIVERED",
        "CANCELLED",
      ],
      default: "PLACED",
    },

    // ========================================================
    // CANCELLATION
    // ========================================================

    cancelledAt: {
      type: Date,
      default: null,
    },

    cancellationReason: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// ============================================================
// INDEXES
// ============================================================

orderSchema.index({
  customer: 1,
  createdAt: -1,
});

orderSchema.index({
  orderStatus: 1,
});

// ============================================================
// MODEL
// ============================================================

const Order = mongoose.model(
  "Order",
  orderSchema
);

export default Order;