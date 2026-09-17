// import mongoose from "mongoose";

// import ApiError from "../../utils/ApiError.js";

// import {
//   createOrder,
//   findCustomerOrder,
//   findCustomerOrders,
//   updateOrder,
// } from "./order.repository.js";

// import { findCustomerById } from "../customers/customer.repository.js";

// import { findAddressById } from "../addresses/address.repository.js";

// import {
//   findCartByCustomerId,
//   clearCart,
// } from "../carts/cart.repository.js";

// import Product from "../products/product.model.js";
// import Variant from "../products/variant.model.js";

// import { generateOrderNumber } from "./order.utils.js";

// import {
//   sendOrderConfirmation,
//   sendOrderCancellation,
//   createCustomerOrderNotification,
//   createAdminOrderNotification,
// } from "../notifications/notification.service.js";

// // ============================================================
// // CREATE NEW COD ORDER
// // ============================================================

// export const createNewOrder = async (customerId, data) => {
//   const {
//     addressId,
//     paymentMethod = "COD",
//   } = data;

//   // ==========================================================
//   // VALIDATE PAYMENT METHOD
//   // ==========================================================

//   if (paymentMethod !== "COD") {
//     throw new ApiError(
//       400,
//       "Only Cash on Delivery is currently available"
//     );
//   }

//   // ==========================================================
//   // VALIDATE ADDRESS
//   // ==========================================================

//   if (!addressId) {
//     throw new ApiError(
//       400,
//       "Address is required"
//     );
//   }

//   if (!mongoose.Types.ObjectId.isValid(addressId)) {
//     throw new ApiError(
//       400,
//       "Invalid address ID"
//     );
//   }

//   // ==========================================================
//   // VALIDATE CUSTOMER ID
//   // ==========================================================

//   if (!mongoose.Types.ObjectId.isValid(customerId)) {
//     throw new ApiError(
//       400,
//       "Invalid customer ID"
//     );
//   }

//   // ==========================================================
//   // FIND CUSTOMER
//   // ==========================================================

//   const customer = await findCustomerById(customerId);

//   if (!customer) {
//     throw new ApiError(
//       404,
//       "Customer not found"
//     );
//   }

//   // ==========================================================
//   // CHECK CUSTOMER STATUS
//   // ==========================================================

//   if (!customer.isActive) {
//     throw new ApiError(
//       403,
//       "Customer account is inactive"
//     );
//   }

//   // ==========================================================
//   // FIND CUSTOMER ADDRESS
//   // ==========================================================

//   const address = await findAddressById(
//     addressId,
//     customerId
//   );

//   if (!address) {
//     throw new ApiError(
//       404,
//       "Delivery address not found"
//     );
//   }

//   // ==========================================================
//   // FIND CART
//   // ==========================================================

//   const cart = await findCartByCustomerId(
//     customerId
//   );

//   if (!cart) {
//     throw new ApiError(
//       400,
//       "Cart not found"
//     );
//   }

//   // ==========================================================
//   // VALIDATE CART
//   // ==========================================================

//   if (
//     !cart.items ||
//     cart.items.length === 0
//   ) {
//     throw new ApiError(
//       400,
//       "Your cart is empty"
//     );
//   }

//   // ==========================================================
//   // PREPARE ORDER ITEMS
//   // ==========================================================

//   const orderItems = [];

//   let subtotal = 0;

//   // ==========================================================
//   // VALIDATE CART ITEMS
//   // ==========================================================

//   for (const cartItem of cart.items) {
//     // --------------------------------------------------------
//     // PRODUCT ID
//     // --------------------------------------------------------

//     const productId =
//       cartItem.product?._id ||
//       cartItem.product;

//     // --------------------------------------------------------
//     // VARIANT ID
//     // --------------------------------------------------------

//     const variantId =
//       cartItem.variant?._id ||
//       cartItem.variant ||
//       null;

//     // --------------------------------------------------------
//     // QUANTITY
//     // --------------------------------------------------------

//     const quantity = Number(
//       cartItem.quantity
//     );

//     // --------------------------------------------------------
//     // VALIDATE PRODUCT ID
//     // --------------------------------------------------------

//     if (
//       !productId ||
//       !mongoose.Types.ObjectId.isValid(
//         productId
//       )
//     ) {
//       throw new ApiError(
//         400,
//         "Invalid product in cart"
//       );
//     }

//     // --------------------------------------------------------
//     // VALIDATE QUANTITY
//     // --------------------------------------------------------

//     if (
//       !Number.isInteger(quantity) ||
//       quantity <= 0
//     ) {
//       throw new ApiError(
//         400,
//         "Invalid product quantity"
//       );
//     }

//     // ========================================================
//     // FIND LATEST PRODUCT
//     // ========================================================

//     const product = await Product.findById(
//       productId
//     );

//     if (!product) {
//       throw new ApiError(
//         404,
//         `Product not found: ${productId}`
//       );
//     }

//     // --------------------------------------------------------
//     // PRODUCT ACTIVE CHECK
//     // --------------------------------------------------------

//     if (!product.isActive) {
//       throw new ApiError(
//         400,
//         `Product "${product.name}" is currently unavailable`
//       );
//     }

//     // ========================================================
//     // PRICE / STOCK VARIABLES
//     // ========================================================

//     let sellingPrice;
//     let availableStock;
//     let itemSku;
//     let variant = null;

//     // ========================================================
//     // VARIANT PRODUCT
//     // ========================================================

//     if (variantId) {
//       // ------------------------------------------------------
//       // VALIDATE VARIANT ID
//       // ------------------------------------------------------

//       if (
//         !mongoose.Types.ObjectId.isValid(
//           variantId
//         )
//       ) {
//         throw new ApiError(
//           400,
//           "Invalid product variant"
//         );
//       }

//       // ------------------------------------------------------
//       // FIND VARIANT
//       // ------------------------------------------------------

//       variant = await Variant.findOne({
//         _id: variantId,
//         product: productId,
//       });

//       if (!variant) {
//         throw new ApiError(
//           404,
//           `Variant not found for "${product.name}"`
//         );
//       }

//       // ------------------------------------------------------
//       // VARIANT ACTIVE CHECK
//       // ------------------------------------------------------

//       if (!variant.isActive) {
//         throw new ApiError(
//           400,
//           `Variant of "${product.name}" is currently unavailable`
//         );
//       }

//       // ------------------------------------------------------
//       // VARIANT STOCK
//       // ------------------------------------------------------

//       availableStock = Number(
//         variant.stock
//       );

//       if (
//         !Number.isFinite(
//           availableStock
//         ) ||
//         availableStock < quantity
//       ) {
//         throw new ApiError(
//           400,
//           `Only ${availableStock || 0} units of "${product.name}" are available`
//         );
//       }

//       // ------------------------------------------------------
//       // VARIANT PRICE
//       // ------------------------------------------------------

//       const variantPrice = Number(
//         variant.price
//       );

//       const variantDiscountPrice =
//         variant.discountPrice !== null &&
//         variant.discountPrice !== undefined
//           ? Number(variant.discountPrice)
//           : null;

//       if (
//         !Number.isFinite(
//           variantPrice
//         ) ||
//         variantPrice < 0
//       ) {
//         throw new ApiError(
//           400,
//           `Invalid price for variant of "${product.name}"`
//         );
//       }

//       if (
//         variantDiscountPrice !== null &&
//         Number.isFinite(
//           variantDiscountPrice
//         ) &&
//         variantDiscountPrice >= 0 &&
//         variantDiscountPrice < variantPrice
//       ) {
//         sellingPrice =
//           variantDiscountPrice;
//       } else {
//         sellingPrice =
//           variantPrice;
//       }

//       itemSku =
//         variant.sku ||
//         product.sku;

//     } else {
//       // ======================================================
//       // PRODUCT WITHOUT VARIANT
//       // ======================================================

//       availableStock = Number(
//         product.stock
//       );

//       if (
//         !Number.isFinite(
//           availableStock
//         ) ||
//         availableStock < quantity
//       ) {
//         throw new ApiError(
//           400,
//           `Only ${availableStock || 0} units of "${product.name}" are available`
//         );
//       }

//       // ------------------------------------------------------
//       // PRODUCT PRICE
//       // ------------------------------------------------------

//       const productPrice = Number(
//         product.price
//       );

//       const productDiscountPrice =
//         product.discountPrice !== null &&
//         product.discountPrice !== undefined
//           ? Number(product.discountPrice)
//           : null;

//       if (
//         !Number.isFinite(
//           productPrice
//         ) ||
//         productPrice < 0
//       ) {
//         throw new ApiError(
//           400,
//           `Invalid price for product "${product.name}"`
//         );
//       }

//       if (
//         productDiscountPrice !== null &&
//         Number.isFinite(
//           productDiscountPrice
//         ) &&
//         productDiscountPrice >= 0 &&
//         productDiscountPrice < productPrice
//       ) {
//         sellingPrice =
//           productDiscountPrice;
//       } else {
//         sellingPrice =
//           productPrice;
//       }

//       itemSku =
//         product.sku;
//     }

//     // ========================================================
//     // VALIDATE FINAL PRICE
//     // ========================================================

//     if (
//       !Number.isFinite(
//         sellingPrice
//       ) ||
//       sellingPrice < 0
//     ) {
//       throw new ApiError(
//         400,
//         `Invalid selling price for "${product.name}"`
//       );
//     }

//     // ========================================================
//     // CALCULATE ITEM TOTAL
//     // ========================================================

//     const itemTotal =
//       sellingPrice * quantity;

//     if (
//       !Number.isFinite(
//         itemTotal
//       )
//     ) {
//       throw new ApiError(
//         400,
//         `Unable to calculate total for "${product.name}"`
//       );
//     }

//     subtotal += itemTotal;

//     // ========================================================
//     // CREATE ORDER ITEM SNAPSHOT
//     // ========================================================

//     const orderItem = {
//       product: product._id,

//       name: product.name,

//       sku: itemSku,

//       image:
//         product.images &&
//         product.images.length > 0
//           ? product.images[0]
//           : null,

//       quantity,

//       price: sellingPrice,

//       total: itemTotal,
//     };

//     // --------------------------------------------------------
//     // ADD VARIANT INFORMATION IF AVAILABLE
//     // --------------------------------------------------------

//     if (variant) {
//       orderItem.variant = variant._id;

//       orderItem.weight =
//         variant.weight;

//       orderItem.weightUnit =
//         variant.weightUnit;
//     }

//     orderItems.push(
//       orderItem
//     );
//   }

//   // ==========================================================
//   // SHIPPING CALCULATION
//   // ==========================================================
//   // Free shipping for orders >= ₹999
//   // Otherwise ₹50
//   // ==========================================================

//   const shippingCharge =
//     subtotal >= 999
//       ? 0
//       : 50;

//   // ==========================================================
//   // DISCOUNT
//   // ==========================================================
//   // Coupon system will be added later.
//   // ==========================================================

//   const discount = 0;

//   // ==========================================================
//   // FINAL AMOUNT
//   // ==========================================================

//   const totalAmount =
//     subtotal +
//     shippingCharge -
//     discount;

//   if (
//     !Number.isFinite(
//       subtotal
//     ) ||
//     !Number.isFinite(
//       totalAmount
//     )
//   ) {
//     throw new ApiError(
//       400,
//       "Unable to calculate order amount"
//     );
//   }

//   // ==========================================================
//   // ADDRESS SNAPSHOT
//   // ==========================================================

//   const shippingAddress = {
//     firstName:
//       address.firstName ||
//       customer.firstName,

//     lastName:
//       address.lastName ||
//       customer.lastName ||
//       "",

//     mobile:
//       address.mobile ||
//       customer.mobile,

//     addressLine1:
//       address.addressLine1,

//     addressLine2:
//       address.addressLine2 ||
//       "",

//     city:
//       address.city,

//     state:
//       address.state,

//     pincode:
//       address.pincode,

//     landmark:
//       address.landmark ||
//       "",
//   };

//   // ==========================================================
//   // GENERATE ORDER NUMBER
//   // ==========================================================

//   const orderNumber =
//     generateOrderNumber();

//   // ==========================================================
//   // PREPARE ORDER
//   // ==========================================================

//   const orderData = {
//     customer: customerId,

//     orderNumber,

//     items: orderItems,

//     shippingAddress,

//     subtotal,

//     shippingCharge,

//     discount,

//     totalAmount,

//     paymentMethod: "COD",

//     paymentStatus: "PENDING",

//     orderStatus: "PLACED",
//   };

//   // ==========================================================
//   // CREATE ORDER
//   // ==========================================================

//   const order =
//     await createOrder(
//       orderData
//     );

//   // ==========================================================
//   // REDUCE STOCK
//   // ==========================================================

//   try {
//     for (const item of orderItems) {
//       // ------------------------------------------------------
//       // VARIANT STOCK
//       // ------------------------------------------------------

//       if (item.variant) {
//         const result =
//           await Variant.updateOne(
//             {
//               _id: item.variant,

//               product:
//                 item.product,

//               stock: {
//                 $gte:
//                   item.quantity,
//               },
//             },
//             {
//               $inc: {
//                 stock:
//                   -item.quantity,
//               },
//             }
//           );

//         if (
//           result.modifiedCount !== 1
//         ) {
//           throw new ApiError(
//             400,
//             `Unable to update stock for variant of "${item.name}"`
//           );
//         }
//       }

//       // ------------------------------------------------------
//       // PRODUCT STOCK
//       // ------------------------------------------------------
//       // Only update product stock when the product itself
//       // does not use a variant.
//       // ------------------------------------------------------

//       else {
//         const result =
//           await Product.updateOne(
//             {
//               _id:
//                 item.product,

//               stock: {
//                 $gte:
//                   item.quantity,
//               },
//             },
//             {
//               $inc: {
//                 stock:
//                   -item.quantity,
//               },
//             }
//           );

//         if (
//           result.modifiedCount !== 1
//         ) {
//           throw new ApiError(
//             400,
//             `Unable to update stock for product "${item.name}"`
//           );
//         }
//       }
//     }
//   } catch (error) {
//     // --------------------------------------------------------
//     // DELETE ORDER IF STOCK UPDATE FAILS
//     // --------------------------------------------------------

//     await mongoose
//       .model("Order")
//       .findByIdAndDelete(
//         order._id
//       );

//     throw error;
//   }

//   // ==========================================================
//   // CLEAR CART
//   // ==========================================================

//   await clearCart(
//     customerId
//   );

//   // ==========================================================
//   // CUSTOMER ORDER NOTIFICATION
//   // ==========================================================

//   try {
//     await createCustomerOrderNotification({
//       customerId:
//         customerId,

//       orderId:
//         order._id,

//       title:
//         "Order Placed Successfully",

//       message:
//         `Your order ${order.orderNumber} has been placed successfully.`,

//       data: {
//         orderNumber:
//           order.orderNumber,

//         status:
//           order.orderStatus,

//         totalAmount:
//           order.totalAmount,
//       },
//     });
//   } catch (notificationError) {
//     // Notification failure must NOT fail the order
//     console.error(
//       "⚠️ Order created successfully, but customer notification failed:",
//       notificationError.message
//     );
//   }

//   // ==========================================================
//   // ADMIN ORDER NOTIFICATION
//   // ==========================================================

//   try {
//     await createAdminOrderNotification({
//       customerId:
//         customerId,

//       orderId:
//         order._id,

//       title:
//         "New Order Received",

//       message:
//         `New order ${order.orderNumber} has been placed by ${
//           customer.firstName ||
//           "Customer"
//         }.`,

//       data: {
//         orderNumber:
//           order.orderNumber,

//         customerId:
//           customerId,

//         status:
//           order.orderStatus,

//         totalAmount:
//           order.totalAmount,
//       },
//     });
//   } catch (notificationError) {
//     // Notification failure must NOT fail the order
//     console.error(
//       "⚠️ Order created successfully, but admin notification failed:",
//       notificationError.message
//     );
//   }

//   // ==========================================================
//   // SEND ORDER CONFIRMATION EMAIL
//   // ==========================================================

//   try {
//     await sendOrderConfirmation({
//       customerEmail:
//         customer.email,

//       customerName:
//         `${customer.firstName || ""} ${
//           customer.lastName || ""
//         }`.trim(),

//       orderNumber:
//         order.orderNumber,

//       items:
//         order.items,

//       totalAmount:
//         order.totalAmount,
//     });
//   } catch (emailError) {
//     // Email failure should NOT fail the order
//     console.error(
//       "⚠️ Order created successfully, but confirmation email failed:",
//       emailError.message
//     );
//   }

//   // ==========================================================
//   // RETURN CREATED ORDER
//   // ==========================================================

//   return order;
// };

// // ============================================================
// // GET CUSTOMER ORDER HISTORY
// // ============================================================

// export const getMyOrders = async (
//   customerId,
//   query = {}
// ) => {
//   const {
//     status,
//     search,
//     page = 1,
//     limit = 10,
//   } = query;

//   const result =
//     await findCustomerOrders(
//       customerId,
//       {
//         status,
//         search,
//         page,
//         limit,
//       }
//     );

//   return result;
// };

// // ============================================================
// // GET SINGLE ORDER
// // ============================================================

// export const getOrder = async (
//   customerId,
//   orderId
// ) => {
//   // ==========================================================
//   // VALIDATE ORDER ID
//   // ==========================================================

//   if (
//     !mongoose.Types.ObjectId.isValid(
//       orderId
//     )
//   ) {
//     throw new ApiError(
//       400,
//       "Invalid order ID"
//     );
//   }

//   // ==========================================================
//   // FIND CUSTOMER ORDER
//   // ==========================================================

//   const order =
//     await findCustomerOrder(
//       orderId,
//       customerId
//     );

//   if (!order) {
//     throw new ApiError(
//       404,
//       "Order not found"
//     );
//   }

//   return order;
// };

// // ============================================================
// // CANCEL CUSTOMER ORDER
// // ============================================================

// export const cancelOrder = async (
//   customerId,
//   orderId,
//   reason = ""
// ) => {
//   // ==========================================================
//   // VALIDATE ORDER ID
//   // ==========================================================

//   if (
//     !mongoose.Types.ObjectId.isValid(
//       orderId
//     )
//   ) {
//     throw new ApiError(
//       400,
//       "Invalid order ID"
//     );
//   }

//   // ==========================================================
//   // FIND CUSTOMER ORDER
//   // ==========================================================

//   const order =
//     await findCustomerOrder(
//       orderId,
//       customerId
//     );

//   if (!order) {
//     throw new ApiError(
//       404,
//       "Order not found"
//     );
//   }

//   // ==========================================================
//   // FIND CUSTOMER
//   // ==========================================================

//   const customer =
//     await findCustomerById(
//       customerId
//     );

//   if (!customer) {
//     throw new ApiError(
//       404,
//       "Customer not found"
//     );
//   }

//   // ==========================================================
//   // CHECK CURRENT ORDER STATUS
//   // ==========================================================

//   if (
//     order.orderStatus ===
//     "CANCELLED"
//   ) {
//     throw new ApiError(
//       400,
//       "Order is already cancelled"
//     );
//   }

//   if (
//     order.orderStatus ===
//     "DELIVERED"
//   ) {
//     throw new ApiError(
//       400,
//       "Delivered orders cannot be cancelled"
//     );
//   }

//   if (
//     order.orderStatus ===
//     "SHIPPED"
//   ) {
//     throw new ApiError(
//       400,
//       "Shipped orders cannot be cancelled"
//     );
//   }

//   // ==========================================================
//   // ONLY ALLOW CANCELLATION FOR:
//   // PLACED / CONFIRMED / PROCESSING
//   // ==========================================================

//   const cancellableStatuses = [
//     "PLACED",
//     "CONFIRMED",
//     "PROCESSING",
//   ];

//   if (
//     !cancellableStatuses.includes(
//       order.orderStatus
//     )
//   ) {
//     throw new ApiError(
//       400,
//       `Order cannot be cancelled when status is ${order.orderStatus}`
//     );
//   }

//   // ==========================================================
//   // RESTORE STOCK
//   // ==========================================================

//   for (const item of order.items) {
//     // --------------------------------------------------------
//     // RESTORE VARIANT STOCK
//     // --------------------------------------------------------

//     if (item.variant) {
//       const result =
//         await Variant.updateOne(
//           {
//             _id:
//               item.variant,

//             product:
//               item.product,
//           },
//           {
//             $inc: {
//               stock:
//                 item.quantity,
//             },
//           }
//         );

//       if (
//         result.modifiedCount !== 1
//       ) {
//         throw new ApiError(
//           400,
//           `Unable to restore stock for variant of "${item.name}"`
//         );
//       }
//     }

//     // --------------------------------------------------------
//     // RESTORE PRODUCT STOCK
//     // --------------------------------------------------------

//     else {
//       const result =
//         await Product.updateOne(
//           {
//             _id:
//               item.product,
//           },
//           {
//             $inc: {
//               stock:
//                 item.quantity,
//             },
//           }
//         );

//       if (
//         result.modifiedCount !== 1
//       ) {
//         throw new ApiError(
//           400,
//           `Unable to restore stock for product "${item.name}"`
//         );
//       }
//     }
//   }

//   // ==========================================================
//   // UPDATE ORDER
//   // ==========================================================

//   const updatedOrder =
//     await updateOrder(
//       orderId,
//       {
//         orderStatus:
//           "CANCELLED",

//         cancelledAt:
//           new Date(),

//         cancellationReason:
//           reason?.trim() ||
//           "Cancelled by customer",
//       }
//     );

//   if (!updatedOrder) {
//     throw new ApiError(
//       404,
//       "Order not found"
//     );
//   }

//   // ==========================================================
//   // CUSTOMER CANCELLATION NOTIFICATION
//   // ==========================================================

//   try {
//     await createCustomerOrderNotification({
//       customerId:
//         customerId,

//       orderId:
//         updatedOrder._id,

//       title:
//         "Order Cancelled",

//       message:
//         `Your order ${updatedOrder.orderNumber} has been cancelled.`,

//       data: {
//         orderNumber:
//           updatedOrder.orderNumber,

//         status:
//           updatedOrder.orderStatus,

//         reason:
//           updatedOrder.cancellationReason,
//       },
//     });
//   } catch (notificationError) {
//     console.error(
//       "⚠️ Order cancelled successfully, but customer notification failed:",
//       notificationError.message
//     );
//   }

//   // ==========================================================
//   // ADMIN CANCELLATION NOTIFICATION
//   // ==========================================================

//   try {
//     await createAdminOrderNotification({
//       customerId:
//         customerId,

//       orderId:
//         updatedOrder._id,

//       title:
//         "Order Cancelled by Customer",

//       message:
//         `Customer cancelled order ${updatedOrder.orderNumber}.`,

//       data: {
//         orderNumber:
//           updatedOrder.orderNumber,

//         customerId:
//           customerId,

//         status:
//           updatedOrder.orderStatus,

//         reason:
//           updatedOrder.cancellationReason,
//       },
//     });
//   } catch (notificationError) {
//     console.error(
//       "⚠️ Order cancelled successfully, but admin notification failed:",
//       notificationError.message
//     );
//   }

//   // ==========================================================
//   // SEND CANCELLATION EMAIL
//   // ==========================================================

//   try {
//     await sendOrderCancellation({
//       customerEmail:
//         customer.email,

//       customerName:
//         `${customer.firstName || ""} ${
//           customer.lastName || ""
//         }`.trim(),

//       orderNumber:
//         updatedOrder.orderNumber,

//       reason:
//         updatedOrder.cancellationReason,
//     });
//   } catch (emailError) {
//     // Email failure should NOT fail cancellation
//     console.error(
//       "⚠️ Order cancelled successfully, but cancellation email failed:",
//       emailError.message
//     );
//   }

//   // ==========================================================
//   // RETURN UPDATED ORDER
//   // ==========================================================

//   return updatedOrder;
// };


import mongoose from "mongoose";

import Order from "./order.model.js";

import {
  findOrdersByCustomer,
  findOrderByCustomer,
} from "./order.repository.js";

import Product from "../products/product.model.js";
import Variant from "../products/variant.model.js";

import Address from "../addresses/address.model.js";
import Cart from "../carts/cart.model.js";

import Customer from "../customers/customer.model.js";
import Coupon from "../coupons/coupon.model.js";
import { validateCoupon } from "../coupons/coupon.service.js";

import {
  createCustomerOrderNotification,
  sendOrderConfirmation,
  sendOrderCancellation,
} from "../notifications/notification.service.js";

// ============================================================
// HELPERS
// ============================================================

const toNumber = (value) => {
  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : 0;
};

// ============================================================
// GET EFFECTIVE VARIANT PRICE
// ============================================================

const getVariantPrice = (variant) => {
  const basePrice = toNumber(
    variant.price ??
      variant.sellingPrice ??
      variant.salePrice
  );

  const discountPrice = toNumber(
    variant.discountPrice ??
      variant.discountedPrice ??
      variant.offerPrice
  );

  if (
    discountPrice > 0 &&
    discountPrice < basePrice
  ) {
    return discountPrice;
  }

  return basePrice;
};

// ============================================================
// GET PRODUCT PRICE
// ============================================================

const getProductPrice = (product) => {
  const sellingPrice = toNumber(
    product.sellingPrice
  );

  const price = toNumber(
    product.price
  );

  return sellingPrice > 0
    ? sellingPrice
    : price;
};

// ============================================================
// GET VARIANT LABEL
// ============================================================

const getVariantLabel = (variant) => {
  if (!variant) {
    return "";
  }

  if (variant.label) {
    return variant.label;
  }

  if (variant.name) {
    return variant.name;
  }

  if (variant.size) {
    return variant.size;
  }

  if (
    variant.weight !== undefined &&
    variant.weight !== null
  ) {
    return `${variant.weight}${
      variant.weightUnit || ""
    }`;
  }

  if (
    variant.value !== undefined &&
    variant.value !== null
  ) {
    return `${variant.value}${
      variant.unit || ""
    }`;
  }

  return "";
};

// ============================================================
// GET VARIANT SKU
// ============================================================

const getVariantSku = (
  variant,
  product
) => {
  return (
    variant?.sku ||
    product?.sku ||
    `SKU-${product._id}`
  )
    .toString()
    .toUpperCase();
};

// ============================================================
// GET IMAGE
// ============================================================

const getItemImage = (
  variant,
  product
) => {
  return (
    variant?.image ||
    product?.image ||
    product?.images?.[0] ||
    null
  );
};

// ============================================================
// GENERATE ORDER NUMBER
// ============================================================

const generateOrderNumber = () => {
  const timestamp =
    Date.now().toString();

  const random =
    Math.floor(
      1000 + Math.random() * 9000
    ).toString();

  return `MYN-${timestamp.slice(-8)}-${random}`;
};

// ============================================================
// CREATE NEW ORDER
// ============================================================

export const createNewOrder = async (
  customerId,
  payload
) => {
  const session =
    await mongoose.startSession();

  try {
    let createdOrder = null;

    // ========================================================
    // EMAIL INFORMATION
    // ========================================================

    let customerEmail = null;
    let customerName = "Customer";

    // ========================================================
    // TRANSACTION
    // ========================================================

    await session.withTransaction(
      async () => {
        // ======================================================
        // VALIDATE REQUEST
        // ======================================================

        const {
          addressId,
          paymentMethod,
          paymentStatus,
          items,
          couponCode,
        } = payload;

        if (!addressId) {
          throw new Error(
            "Delivery address is required"
          );
        }

        // ======================================================
        // COD ONLY
        // ======================================================

        if (
          !paymentMethod ||
          !["COD"].includes(
            paymentMethod
          )
        ) {
          throw new Error(
            "Only Cash on Delivery is currently available"
          );
        }

        // ======================================================
        // ITEMS
        // ======================================================

        if (
          !Array.isArray(items) ||
          items.length === 0
        ) {
          throw new Error(
            "Order must contain at least one item"
          );
        }

        // ======================================================
        // CUSTOMER
        // ======================================================

        const customer =
          await Customer.findById(
            customerId
          )
            .select(
              "_id firstName lastName email"
            )
            .session(session)
            .lean();

        if (!customer) {
          throw new Error(
            "Customer not found"
          );
        }

        customerEmail =
          customer.email || null;

        customerName =
          [
            customer.firstName,
            customer.lastName,
          ]
            .filter(Boolean)
            .join(" ")
            .trim() ||
          "Customer";

        // ======================================================
        // ADDRESS
        // ======================================================

        const address =
          await Address.findOne({
            _id: addressId,
            customer: customerId,
          }).session(session);

        if (!address) {
          throw new Error(
            "Delivery address not found"
          );
        }

        // ======================================================
        // ORDER ITEMS
        // ======================================================

        const orderItems = [];

        let subtotal = 0;

        const stockChanges = [];

        // ======================================================
        // PROCESS ITEMS
        // ======================================================

        for (
          const requestedItem of items
        ) {
          const {
            productId,
            variantId,
          } = requestedItem;

          // ====================================================
          // PRODUCT ID
          // ====================================================

          if (
            !productId ||
            !mongoose.Types.ObjectId.isValid(
              productId
            )
          ) {
            throw new Error(
              "Invalid product ID"
            );
          }

          // ====================================================
          // QUANTITY
          // ====================================================

          const quantity =
            Number(
              requestedItem.quantity
            );

          if (
            !Number.isInteger(
              quantity
            ) ||
            quantity < 1
          ) {
            throw new Error(
              "Invalid product quantity"
            );
          }

          // ====================================================
          // FIND ACTIVE PRODUCT
          // ====================================================

          const product =
            await Product.findOne({
              _id: productId,
              isActive: true,
            }).session(session);

          if (!product) {
            throw new Error(
              "Product not found or inactive"
            );
          }

          // ====================================================
          // VARIANT PRODUCT
          // ====================================================

          if (variantId) {
            // ==================================================
            // VALIDATE VARIANT ID
            // ==================================================

            if (
              !mongoose.Types.ObjectId.isValid(
                variantId
              )
            ) {
              throw new Error(
                `Invalid variant for "${product.name}"`
              );
            }

            // ==================================================
            // FIND EXACT VARIANT
            // ==================================================

            const selectedVariant =
              await Variant.findOne({
                _id: variantId,
                product: product._id,
                isActive: true,
              }).session(session);

            if (!selectedVariant) {
              throw new Error(
                `Selected variant for "${product.name}" was not found or is inactive`
              );
            }

            // ==================================================
            // READ VARIANT STOCK
            // ==================================================

            const variantStock =
              Number(
                selectedVariant.stock
              );

            // ==================================================
            // DEBUG LOG
            // ==================================================

            console.log(
              "================================================"
            );

            console.log(
              "ORDER VARIANT STOCK CHECK"
            );

            console.log({
              productId:
                product._id.toString(),

              productName:
                product.name,

              variantId:
                selectedVariant._id.toString(),

              variantLabel:
                getVariantLabel(
                  selectedVariant
                ),

              variantStockRaw:
                selectedVariant.stock,

              variantStockParsed:
                variantStock,

              requestedQuantity:
                quantity,

              variantPrice:
                selectedVariant.price,

              variantDiscountPrice:
                selectedVariant.discountPrice,
            });

            console.log(
              "================================================"
            );

            // ==================================================
            // STOCK VALIDATION
            // ==================================================

            if (
              !Number.isFinite(
                variantStock
              ) ||
              variantStock < quantity
            ) {
              throw new Error(
                `Only ${
                  Number.isFinite(
                    variantStock
                  )
                    ? variantStock
                    : 0
                } units of "${product.name}" are available`
              );
            }

            // ==================================================
            // VARIANT PRICE
            // ==================================================

            const price =
              getVariantPrice(
                selectedVariant
              );

            if (
              !Number.isFinite(price) ||
              price <= 0
            ) {
              throw new Error(
                `Price is not configured for the selected variant of "${product.name}"`
              );
            }

            // ==================================================
            // TOTAL
            // ==================================================

            const total =
              price * quantity;

            // ==================================================
            // SKU
            // ==================================================

            const sku =
              getVariantSku(
                selectedVariant,
                product
              );

            // ==================================================
            // LABEL
            // ==================================================

            const variantLabel =
              getVariantLabel(
                selectedVariant
              );

            // ==================================================
            // IMAGE
            // ==================================================

            const image =
              getItemImage(
                selectedVariant,
                product
              );

            // ==================================================
            // PUSH ORDER ITEM
            // ==================================================

            orderItems.push({
              product:
                product._id,

              variant:
                selectedVariant._id,

              name:
                product.name,

              variantLabel,

              sku,

              image,

              quantity,

              price,

              total,
            });

            // ==================================================
            // SUBTOTAL
            // ==================================================

            subtotal += total;

            // ==================================================
            // STOCK CHANGE
            // ==================================================

            stockChanges.push({
              type: "variant",

              variantId:
                selectedVariant._id,

              quantity,
            });

            continue;
          }

          // ====================================================
          // NORMAL PRODUCT WITHOUT VARIANT
          // ====================================================

          const productStock =
            toNumber(
              product.stock
            );

          if (
            productStock < quantity
          ) {
            throw new Error(
              `Only ${productStock} units of "${product.name}" are available`
            );
          }

          // ====================================================
          // PRODUCT PRICE
          // ====================================================

          const price =
            getProductPrice(product);

          if (
            !Number.isFinite(price) ||
            price <= 0
          ) {
            throw new Error(
              `Price is not configured for "${product.name}"`
            );
          }

          // ====================================================
          // TOTAL
          // ====================================================

          const total =
            price * quantity;

          // ====================================================
          // SKU
          // ====================================================

          const sku =
            (
              product.sku ||
              `SKU-${product._id}`
            )
              .toString()
              .toUpperCase();

          // ====================================================
          // IMAGE
          // ====================================================

          const image =
            getItemImage(
              null,
              product
            );

          // ====================================================
          // ORDER ITEM
          // ====================================================

          orderItems.push({
            product:
              product._id,

            variant: null,

            name:
              product.name,

            variantLabel: "",

            sku,

            image,

            quantity,

            price,

            total,
          });

          // ====================================================
          // SUBTOTAL
          // ====================================================

          subtotal += total;

          // ====================================================
          // STOCK CHANGE
          // ====================================================

          stockChanges.push({
            type: "product",

            productId:
              product._id,

            quantity,
          });
        }

        // ======================================================
        // SHIPPING
        // ======================================================

        const shippingCharge =
          subtotal >= 999
            ? 0
            : 50;

        // ======================================================
        // DISCOUNT
        // ======================================================

        let discount = 0;
        let appliedCoupon = null;

        if (couponCode && couponCode.trim()) {
          try {
            const couponResult = await validateCoupon({
              code: couponCode.trim().toUpperCase(),
              subtotal,
              customerId,
            });
            discount = Number(couponResult.discountAmount) || 0;
            appliedCoupon = couponResult;
          } catch (couponErr) {
            console.warn("Coupon validation failed during order: " + couponErr.message);
            throw new Error(couponErr.message || "Invalid coupon code");
          }
        }

        // ======================================================
        // TOTAL
        // ======================================================

        const totalAmount =
          subtotal +
          shippingCharge -
          discount;

        // ======================================================
        // PAYMENT STATUS
        // ======================================================

        const finalPaymentStatus =
          paymentMethod === "COD"
            ? "PENDING"
            : paymentStatus ||
              "PENDING";

        // ======================================================
        // ADDRESS SNAPSHOT
        // ======================================================

        const shippingAddress = {
          firstName:
            address.firstName,

          lastName:
            address.lastName || "",

          mobile:
            address.mobile,

          addressLine1:
            address.addressLine1 ||
            address.address ||
            address.street,

          addressLine2:
            address.addressLine2 || "",

          city:
            address.city,

          state:
            address.state,

          pincode:
            address.pincode,

          landmark:
            address.landmark || "",
        };

        if (
          !shippingAddress.addressLine1
        ) {
          throw new Error(
            "Delivery address line is required"
          );
        }

        // ======================================================
        // ORDER DATA
        // ======================================================

        const orderData = {
          customer:
            customerId,

          orderNumber:
            generateOrderNumber(),

          items:
            orderItems,

          shippingAddress,

          subtotal,

          shippingCharge,

          discount,

          couponCode:
            appliedCoupon ? appliedCoupon.code : null,

          totalAmount,

          paymentMethod,

          paymentStatus:
            finalPaymentStatus,

          orderStatus:
            "PLACED",
        };

        // ======================================================
        // CREATE ORDER
        // ======================================================

        const orderResult =
          await Order.create(
            [orderData],
            {
              session,
            }
          );

        createdOrder =
          orderResult[0];

        // ======================================================
        // UPDATE COUPON USAGE
        // ======================================================

        if (appliedCoupon && appliedCoupon.couponId) {
          await Coupon.updateOne(
            { _id: appliedCoupon.couponId },
            {
              $inc: { usedCount: 1 },
              $push: {
                usageHistory: {
                  customer: customerId,
                  order: createdOrder._id,
                  discountAmount: discount,
                  usedAt: new Date(),
                },
              },
            },
            { session }
          );
        }

        // ======================================================
        // REDUCE STOCK
        // ======================================================

        for (
          const stockChange of
            stockChanges
        ) {
          // ====================================================
          // VARIANT STOCK
          // ====================================================

          if (
            stockChange.type ===
            "variant"
          ) {
            const result =
              await Variant.updateOne(
                {
                  _id:
                    stockChange.variantId,

                  isActive: true,

                  stock: {
                    $gte:
                      stockChange.quantity,
                  },
                },
                {
                  $inc: {
                    stock:
                      -stockChange.quantity,
                  },
                },
                {
                  session,
                }
              );

            console.log(
              "VARIANT STOCK REDUCTION:",
              {
                variantId:
                  stockChange.variantId.toString(),

                quantity:
                  stockChange.quantity,

                matchedCount:
                  result.matchedCount,

                modifiedCount:
                  result.modifiedCount,
              }
            );

            if (
              result.modifiedCount !== 1
            ) {
              throw new Error(
                "Stock changed while placing the order. Please try again."
              );
            }

            continue;
          }

          // ====================================================
          // PRODUCT STOCK
          // ====================================================

          const result =
            await Product.updateOne(
              {
                _id:
                  stockChange.productId,

                isActive: true,

                stock: {
                  $gte:
                    stockChange.quantity,
                },
              },
              {
                $inc: {
                  stock:
                    -stockChange.quantity,
                },
              },
              {
                session,
              }
            );

          if (
            result.modifiedCount !== 1
          ) {
            throw new Error(
              "Stock changed while placing the order. Please try again."
            );
          }
        }

        // ======================================================
        // CLEAR CUSTOMER CART
        // ======================================================

        await Cart.deleteMany(
          {
            customer:
              customerId,
          },
          {
            session,
          }
        );
      }
    );

    // ==========================================================
    // TRANSACTION SUCCESS
    // ==========================================================

    if (!createdOrder) {
      throw new Error(
        "Order could not be created"
      );
    }

    console.log(
      `✅ Order transaction completed: ${createdOrder.orderNumber}`
    );

    // ==========================================================
    // CUSTOMER NOTIFICATION
    // ==========================================================

    try {
      await createCustomerOrderNotification({
        customerId,

        orderId:
          createdOrder._id,

        title:
          "Order placed successfully",

        message:
          `Your order ${createdOrder.orderNumber} has been placed successfully.`,

        actionUrl:
          `/orders/${createdOrder._id}`,

        data: {
          orderNumber:
            createdOrder.orderNumber,

          totalAmount:
            createdOrder.totalAmount,

          paymentMethod:
            createdOrder.paymentMethod,

          orderStatus:
            createdOrder.orderStatus,
        },
      });

      console.log(
        `🔔 Order notification created: ${createdOrder.orderNumber}`
      );
    } catch (notificationError) {
      console.error(
        "⚠️ Order notification failed:",
        notificationError.message
      );
    }

    // ==========================================================
    // ORDER CONFIRMATION EMAIL
    // ==========================================================

    try {
      if (!customerEmail) {
        console.log(
          "⚠️ Order confirmation email skipped: customer email not available"
        );
      } else {
        await sendOrderConfirmation({
          customerEmail,

          customerName,

          orderNumber:
            createdOrder.orderNumber,

          totalAmount:
            createdOrder.totalAmount,
        });

        console.log(
          `📧 Order confirmation email sent to ${customerEmail}`
        );
      }
    } catch (emailError) {
      console.error(
        "⚠️ Order confirmation email failed:",
        emailError.message
      );
    }

    return createdOrder;
  } finally {
    await session.endSession();
  }
};

// ============================================================
// GET MY ORDERS
// ============================================================

export const getMyOrders = async (
  customerId,
  query = {}
) => {
  const page = Math.max(
    Number(query.page) || 1,
    1
  );

  const limit = Math.min(
    Math.max(
      Number(query.limit) || 10,
      1
    ),
    100
  );

  const status =
    query.status || "";

  return findOrdersByCustomer(
    customerId,
    {
      page,
      limit,
      status,
    }
  );
};

// ============================================================
// GET SINGLE ORDER
// ============================================================

export const getOrder = async (
  customerId,
  orderId
) => {
  if (
    !mongoose.Types.ObjectId.isValid(
      orderId
    )
  ) {
    throw new Error(
      "Invalid order ID"
    );
  }

  const order =
    await findOrderByCustomer(
      customerId,
      orderId
    );

  if (!order) {
    throw new Error(
      "Order not found"
    );
  }

  return order;
};

// ============================================================
// CANCEL ORDER
// ============================================================

export const cancelOrder = async (
  customerId,
  orderId,
  reason = ""
) => {
  const session =
    await mongoose.startSession();

  try {
    let cancelledOrder = null;

    // ========================================================
    // CUSTOMER EMAIL
    // ========================================================

    let customerEmail = null;
    let customerName = "Customer";

    // ========================================================
    // TRANSACTION
    // ========================================================

    await session.withTransaction(
      async () => {
        // ====================================================
        // VALIDATE ORDER ID
        // ====================================================

        if (
          !mongoose.Types.ObjectId.isValid(
            orderId
          )
        ) {
          throw new Error(
            "Invalid order ID"
          );
        }

        // ====================================================
        // FIND ORDER
        // ====================================================

        const order =
          await Order.findOne({
            _id: orderId,
            customer: customerId,
          }).session(session);

        if (!order) {
          throw new Error(
            "Order not found"
          );
        }

        // ====================================================
        // FIND CUSTOMER
        // ====================================================

        const customer =
          await Customer.findById(
            customerId
          )
            .select(
              "_id firstName lastName email"
            )
            .session(session)
            .lean();

        if (!customer) {
          throw new Error(
            "Customer not found"
          );
        }

        customerEmail =
          customer.email || null;

        customerName =
          [
            customer.firstName,
            customer.lastName,
          ]
            .filter(Boolean)
            .join(" ")
            .trim() ||
          "Customer";

        // ====================================================
        // CHECK STATUS
        // ====================================================

        const cancellableStatuses = [
          "PLACED",
          "CONFIRMED",
          "PROCESSING",
        ];

        if (
          !cancellableStatuses.includes(
            order.orderStatus
          )
        ) {
          throw new Error(
            `Order cannot be cancelled because it is already ${order.orderStatus}`
          );
        }

        // ====================================================
        // RESTORE STOCK
        // ====================================================

        for (
          const item of order.items
        ) {
          // ==================================================
          // VARIANT
          // ==================================================

          if (item.variant) {
            const result =
              await Variant.updateOne(
                {
                  _id:
                    item.variant,
                },
                {
                  $inc: {
                    stock:
                      item.quantity,
                  },
                },
                {
                  session,
                }
              );

            console.log(
              "VARIANT STOCK RESTORATION:",
              {
                variantId:
                  item.variant.toString(),

                quantity:
                  item.quantity,

                matchedCount:
                  result.matchedCount,

                modifiedCount:
                  result.modifiedCount,
              }
            );

            if (
              result.modifiedCount !== 1
            ) {
              throw new Error(
                `Unable to restore stock for "${item.name}"`
              );
            }

            continue;
          }

          // ==================================================
          // NORMAL PRODUCT
          // ==================================================

          const result =
            await Product.updateOne(
              {
                _id:
                  item.product,
              },
              {
                $inc: {
                  stock:
                    item.quantity,
                },
              },
              {
                session,
              }
            );

          if (
            result.modifiedCount !== 1
          ) {
            throw new Error(
              `Unable to restore stock for "${item.name}"`
            );
          }
        }

        // ====================================================
        // CANCEL ORDER
        // ====================================================

        order.orderStatus =
          "CANCELLED";

        order.cancelledAt =
          new Date();

        order.cancellationReason =
          reason?.trim() ||
          "Cancelled by customer";

        // ====================================================
        // RESTORE COUPON USAGE
        // ====================================================

        if (order.couponCode) {
          await Coupon.updateOne(
            { code: order.couponCode, usedCount: { $gt: 0 } },
            {
              $inc: { usedCount: -1 },
              $pull: {
                usageHistory: {
                  order: order._id,
                },
              },
            },
            { session }
          );
        }

        // ====================================================
        // SAVE
        // ====================================================

        await order.save({
          session,
        });

        cancelledOrder =
          order;
      }
    );

    // ==========================================================
    // TRANSACTION SUCCESS
    // ==========================================================

    if (!cancelledOrder) {
      throw new Error(
        "Order could not be cancelled"
      );
    }

    console.log(
      `✅ Order cancellation transaction completed: ${cancelledOrder.orderNumber}`
    );

    // ==========================================================
    // CUSTOMER NOTIFICATION
    // ==========================================================

    try {
      await createCustomerOrderNotification({
        customerId,

        orderId:
          cancelledOrder._id,

        title:
          "Order cancelled",

        message:
          `Your order ${cancelledOrder.orderNumber} has been cancelled successfully.`,

        actionUrl:
          `/orders/${cancelledOrder._id}`,

        data: {
          orderNumber:
            cancelledOrder.orderNumber,

          cancellationReason:
            cancelledOrder.cancellationReason,

          orderStatus:
            cancelledOrder.orderStatus,
        },
      });

      console.log(
        `🔔 Cancellation notification created: ${cancelledOrder.orderNumber}`
      );
    } catch (notificationError) {
      console.error(
        "⚠️ Cancellation notification failed:",
        notificationError.message
      );
    }

    // ==========================================================
    // CANCELLATION EMAIL
    // ==========================================================

    try {
      if (!customerEmail) {
        console.log(
          "⚠️ Cancellation email skipped: customer email not available"
        );
      } else {
        await sendOrderCancellation({
          customerEmail,

          customerName,

          orderNumber:
            cancelledOrder.orderNumber,

          reason:
            cancelledOrder.cancellationReason,
        });

        console.log(
          `📧 Cancellation email sent to ${customerEmail}`
        );
      }
    } catch (emailError) {
      console.error(
        "⚠️ Cancellation email failed:",
        emailError.message
      );
    }

    return cancelledOrder;
  } finally {
    await session.endSession();
  }
};
