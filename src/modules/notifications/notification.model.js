// // import mongoose from "mongoose";

// // const notificationSchema = new mongoose.Schema(
// //   {
// //     // ==========================================================
// //     // CUSTOMER
// //     // ==========================================================

// //     customer: {
// //       type: mongoose.Schema.Types.ObjectId,
// //       ref: "Customer",
// //       required: true,
// //       index: true,
// //     },

// //     // ==========================================================
// //     // TYPE
// //     // ==========================================================

// //     type: {
// //       type: String,
// //       enum: [
// //         "ORDER",
// //         "PAYMENT",
// //         "REFUND",
// //         "COUPON",
// //         "ACCOUNT",
// //         "SYSTEM",
// //       ],
// //       required: true,
// //       default: "SYSTEM",
// //     },

// //     // ==========================================================
// //     // TITLE
// //     // ==========================================================

// //     title: {
// //       type: String,
// //       required: true,
// //       trim: true,
// //     },

// //     // ==========================================================
// //     // MESSAGE
// //     // ==========================================================

// //     message: {
// //       type: String,
// //       required: true,
// //       trim: true,
// //     },

// //     // ==========================================================
// //     // ORDER REFERENCE
// //     // ==========================================================

// //     order: {
// //       type: mongoose.Schema.Types.ObjectId,
// //       ref: "Order",
// //       default: null,
// //       index: true,
// //     },

// //     // ==========================================================
// //     // ACTION URL
// //     // ==========================================================

// //     actionUrl: {
// //       type: String,
// //       default: null,
// //       trim: true,
// //     },

// //     // ==========================================================
// //     // READ STATUS
// //     // ==========================================================

// //     isRead: {
// //       type: Boolean,
// //       default: false,
// //       index: true,
// //     },

// //     // ==========================================================
// //     // READ DATE
// //     // ==========================================================

// //     readAt: {
// //       type: Date,
// //       default: null,
// //     },

// //     // ==========================================================
// //     // OPTIONAL EXTRA DATA
// //     // ==========================================================

// //     data: {
// //       type: mongoose.Schema.Types.Mixed,
// //       default: null,
// //     },
// //   },
// //   {
// //     timestamps: true,
// //   }
// // );

// // notificationSchema.index({
// //   customer: 1,
// //   isRead: 1,
// //   createdAt: -1,
// // });

// // notificationSchema.index({
// //   customer: 1,
// //   createdAt: -1,
// // });

// // export default mongoose.model(
// //   "Notification",
// //   notificationSchema
// // );


// import mongoose from "mongoose";

// const notificationSchema = new mongoose.Schema(
//   {
//     // ==========================================================
//     // RECIPIENT TYPE
//     // ==========================================================

//     recipientType: {
//       type: String,
//       enum: ["CUSTOMER", "ADMIN"],
//       required: true,
//       default: "CUSTOMER",
//       index: true,
//     },

//     // ==========================================================
//     // CUSTOMER
//     // ==========================================================

//     customer: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Customer",
//       default: null,
//       index: true,
//     },

//     // ==========================================================
//     // TYPE
//     // ==========================================================

//     type: {
//       type: String,
//       enum: [
//         "ORDER",
//         "PAYMENT",
//         "REFUND",
//         "COUPON",
//         "ACCOUNT",
//         "SYSTEM",
//       ],
//       required: true,
//       default: "SYSTEM",
//     },

//     // ==========================================================
//     // TITLE
//     // ==========================================================

//     title: {
//       type: String,
//       required: true,
//       trim: true,
//     },

//     // ==========================================================
//     // MESSAGE
//     // ==========================================================

//     message: {
//       type: String,
//       required: true,
//       trim: true,
//     },

//     // ==========================================================
//     // ORDER REFERENCE
//     // ==========================================================

//     order: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Order",
//       default: null,
//       index: true,
//     },

//     // ==========================================================
//     // ACTION URL
//     // ==========================================================

//     actionUrl: {
//       type: String,
//       default: null,
//       trim: true,
//     },

//     // ==========================================================
//     // READ STATUS
//     // ==========================================================

//     isRead: {
//       type: Boolean,
//       default: false,
//       index: true,
//     },

//     // ==========================================================
//     // READ DATE
//     // ==========================================================

//     readAt: {
//       type: Date,
//       default: null,
//     },

//     // ==========================================================
//     // EXTRA DATA
//     // ==========================================================

//     data: {
//       type: mongoose.Schema.Types.Mixed,
//       default: null,
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// // ============================================================
// // CUSTOMER NOTIFICATION INDEX
// // ============================================================

// notificationSchema.index({
//   recipientType: 1,
//   customer: 1,
//   isRead: 1,
//   createdAt: -1,
// });

// // ============================================================
// // CUSTOMER NOTIFICATION LIST INDEX
// // ============================================================

// notificationSchema.index({
//   recipientType: 1,
//   customer: 1,
//   createdAt: -1,
// });

// // ============================================================
// // ADMIN NOTIFICATION INDEX
// // ============================================================

// notificationSchema.index({
//   recipientType: 1,
//   isRead: 1,
//   createdAt: -1,
// });

// export default mongoose.model(
//   "Notification",
//   notificationSchema
// );

import mongoose from "mongoose";

const notificationSchema =
  new mongoose.Schema(
    {
      // ======================================================
      // RECIPIENT TYPE
      // ======================================================

      recipientType: {
        type: String,

        enum: [
          "CUSTOMER",
          "ADMIN",
        ],

        required: true,

        default:
          "CUSTOMER",

        index: true,
      },

      // ======================================================
      // CUSTOMER
      // ======================================================

      customer: {
        type:
          mongoose.Schema.Types.ObjectId,

        ref:
          "Customer",

        default:
          null,

        index: true,
      },

      // ======================================================
      // TYPE
      // ======================================================

      type: {
        type: String,

        enum: [
          "ORDER",
          "PAYMENT",
          "REFUND",
          "COUPON",
          "ACCOUNT",
          "SYSTEM",
        ],

        required: true,

        default:
          "SYSTEM",
      },

      // ======================================================
      // TITLE
      // ======================================================

      title: {
        type: String,

        required: true,

        trim: true,
      },

      // ======================================================
      // MESSAGE
      // ======================================================

      message: {
        type: String,

        required: true,

        trim: true,
      },

      // ======================================================
      // ORDER REFERENCE
      // ======================================================

      order: {
        type:
          mongoose.Schema.Types.ObjectId,

        ref:
          "Order",

        default:
          null,

        index: true,
      },

      // ======================================================
      // ACTION URL
      // ======================================================

      actionUrl: {
        type: String,

        default:
          null,

        trim: true,
      },

      // ======================================================
      // READ STATUS
      // ======================================================

      isRead: {
        type: Boolean,

        default: false,

        index: true,
      },

      // ======================================================
      // READ DATE
      // ======================================================

      readAt: {
        type: Date,

        default:
          null,
      },

      // ======================================================
      // EXTRA DATA
      // ======================================================

      data: {
        type:
          mongoose.Schema.Types.Mixed,

        default:
          null,
      },
    },
    {
      timestamps: true,
    }
  );

// ============================================================
// CUSTOMER NOTIFICATION INDEX
// ============================================================

notificationSchema.index({
  recipientType: 1,
  customer: 1,
  isRead: 1,
  createdAt: -1,
});

// ============================================================
// CUSTOMER NOTIFICATION LIST INDEX
// ============================================================

notificationSchema.index({
  recipientType: 1,
  customer: 1,
  createdAt: -1,
});

// ============================================================
// ADMIN NOTIFICATION INDEX
// ============================================================

notificationSchema.index({
  recipientType: 1,
  isRead: 1,
  createdAt: -1,
});

// ============================================================
// MODEL
// ============================================================

export default mongoose.model(
  "Notification",
  notificationSchema
);