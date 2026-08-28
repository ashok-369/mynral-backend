// import mongoose from "mongoose";
// import ApiError from "../../utils/ApiError.js";

// import {
//   createOrder,
//   findCustomerOrder,
//   findCustomerOrders,
//   updateOrder,
// } from "./order.repository.js";

// import {
//   findCustomerById,
// } from "../customers/customer.repository.js";

// import {
//   findAddressById,
// } from "../addresses/address.repository.js";

// import {
//   findCartByCustomerId,
//   clearCart,
// } from "../carts/cart.repository.js";

// import Product from "../products/product.model.js";

// import {
//   generateOrderNumber,
// } from "./order.utils.js";

// // ============================================================
// // CREATE NEW ORDER
// // ============================================================

// export const createNewOrder = async (
//   customerId,
//   data
// ) => {
//   const {
//     addressId,
//     paymentMethod = "COD",
//   } = data;

//   // ----------------------------------------------------------
//   // Validate address
//   // ----------------------------------------------------------

//   if (!addressId) {
//     throw new ApiError(
//       400,
//       "Address is required"
//     );
//   }

//   // ----------------------------------------------------------
//   // Validate payment method
//   // ----------------------------------------------------------

//   const allowedPaymentMethods = [
//     "COD",
//     "ONLINE",
//     "RAZORPAY"
//   ];

//   if (
//     !allowedPaymentMethods.includes(
//       paymentMethod
//     )
//   ) {
//     throw new ApiError(
//       400,
//       "Invalid payment method"
//     );
//   }

//   // ----------------------------------------------------------
//   // Find customer
//   // ----------------------------------------------------------

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

//   // ----------------------------------------------------------
//   // Check customer status
//   // ----------------------------------------------------------

//   if (!customer.isActive) {
//     throw new ApiError(
//       403,
//       "Customer account is inactive"
//     );
//   }

//   // ----------------------------------------------------------
//   // Find address
//   // ----------------------------------------------------------

//   const address =
//     await findAddressById(
//       addressId,
//       customerId
//     );

//   if (!address) {
//     throw new ApiError(
//       404,
//       "Delivery address not found"
//     );
//   }

//   // ----------------------------------------------------------
//   // Find cart
//   // ----------------------------------------------------------

//   const cart = await findCartByCustomerId(
//   customerId
// );

//   if (!cart) {
//     throw new ApiError(
//       400,
//       "Cart not found"
//     );
//   }

//   // ----------------------------------------------------------
//   // Validate cart items
//   // ----------------------------------------------------------

//   if (
//     !cart.items ||
//     cart.items.length === 0
//   ) {
//     throw new ApiError(
//       400,
//       "Your cart is empty"
//     );
//   }

//   // ----------------------------------------------------------
//   // Prepare order items
//   // ----------------------------------------------------------

//   const orderItems = [];

//   let subtotal = 0;

//   // ----------------------------------------------------------
//   // Validate every product
//   // ----------------------------------------------------------

//   for (const cartItem of cart.items) {
//     const productId =
//       cartItem.product?._id ||
//       cartItem.product;

//     const quantity =
//       Number(cartItem.quantity);

//     if (!productId) {
//       throw new ApiError(
//         400,
//         "Invalid product in cart"
//       );
//     }

//     if (
//       !Number.isInteger(quantity) ||
//       quantity <= 0
//     ) {
//       throw new ApiError(
//         400,
//         "Invalid product quantity"
//       );
//     }

//     // --------------------------------------------------------
//     // Find product
//     // --------------------------------------------------------

//     const product =
//       await Product.findById(
//         productId
//       );

//     if (!product) {
//       throw new ApiError(
//         404,
//         `Product not found: ${productId}`
//       );
//     }

//     // --------------------------------------------------------
//     // Product active check
//     // --------------------------------------------------------

//     if (!product.isActive) {
//       throw new ApiError(
//         400,
//         `Product "${product.name}" is currently unavailable`
//       );
//     }

//     // --------------------------------------------------------
//     // Stock check
//     // --------------------------------------------------------

//     if (
//       product.stock < quantity
//     ) {
//       throw new ApiError(
//         400,
//         `Only ${product.stock} units of "${product.name}" are available`
//       );
//     }

//     // --------------------------------------------------------
//     // Determine price
//     // --------------------------------------------------------

//     const sellingPrice =
//       product.discountPrice !== null &&
//       product.discountPrice !== undefined &&
//       product.discountPrice <
//         product.price
//         ? product.discountPrice
//         : product.price;

//     const itemTotal =
//       sellingPrice * quantity;

//     subtotal += itemTotal;

//     // --------------------------------------------------------
//     // Create order item snapshot
//     // --------------------------------------------------------

//     orderItems.push({
//       product: product._id,
//       name: product.name,
//       sku: product.sku,
//       image:
//         product.images &&
//         product.images.length > 0
//           ? product.images[0]
//           : null,
//       quantity,
//       price: sellingPrice,
//       total: itemTotal,
//     });
//   }

//   // ----------------------------------------------------------
//   // Shipping calculation
//   // ----------------------------------------------------------
//   // You can change this business rule later.
//   // Example: free shipping above ₹999.

//   const shippingCharge =
//     subtotal >= 999
//       ? 0
//       : 50;

//   // ----------------------------------------------------------
//   // Discount
//   // ----------------------------------------------------------
//   // Coupon system will be added later.

//   const discount = 0;

//   // ----------------------------------------------------------
//   // Final amount
//   // ----------------------------------------------------------

//   const totalAmount =
//     subtotal +
//     shippingCharge -
//     discount;

//   // ----------------------------------------------------------
//   // Create address snapshot
//   // ----------------------------------------------------------
//   // We save the address inside the order so that
//   // changing/deleting the customer's address later
//   // does not change old orders.

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
//       address.addressLine2 || "",

//     city:
//       address.city,

//     state:
//       address.state,

//     pincode:
//       address.pincode,

//     landmark:
//       address.landmark || "",
//   };

//   // ----------------------------------------------------------
//   // Generate order number
//   // ----------------------------------------------------------

//   const orderNumber =
//     generateOrderNumber();

//   // ----------------------------------------------------------
//   // Create order
//   // ----------------------------------------------------------

//   const orderData = {
//     customer: customerId,

//     orderNumber,

//     items: orderItems,

//     shippingAddress,

//     subtotal,

//     shippingCharge,

//     discount,

//     totalAmount,

//     paymentMethod,

//     paymentStatus:
//       paymentMethod === "COD"
//         ? "PENDING"
//         : "PENDING",

//     orderStatus: "PLACED",
//   };

//   // ----------------------------------------------------------
//   // Create order in database
//   // ----------------------------------------------------------

//   const order =
//     await createOrder(
//       orderData
//     );

//   // ----------------------------------------------------------
//   // Reduce product stock
//   // ----------------------------------------------------------
//   // Stock is reduced only after order creation.

//   try {
//     for (const item of orderItems) {
//       const result =
//         await Product.updateOne(
//           {
//             _id: item.product,
//             stock: {
//               $gte: item.quantity,
//             },
//           },
//           {
//             $inc: {
//               stock:
//                 -item.quantity,
//             },
//           }
//         );

//       if (
//         result.modifiedCount !== 1
//       ) {
//         throw new ApiError(
//           400,
//           `Unable to update stock for product "${item.name}"`
//         );
//       }
//     }
//   } catch (error) {
//     // --------------------------------------------------------
//     // If stock update fails, delete created order
//     // --------------------------------------------------------

//     await mongoose
//       .model("Order")
//       .findByIdAndDelete(
//         order._id
//       );

//     throw error;
//   }

//   // ----------------------------------------------------------
//   // Clear cart
//   // ----------------------------------------------------------

//   await clearCart(
//     customerId
//   );

//   // ----------------------------------------------------------
//   // Return order
//   // ----------------------------------------------------------

//   return order;
// };

// // ============================================================
// // GET CUSTOMER ORDERS
// // ============================================================

// export const getMyOrders = async (
//   customerId,
//   query = {}
// ) => {
//   const orders =
//     await findCustomerOrders(
//       customerId
//     );

//   return {
//     orders,
//     count: orders.length,
//   };
// };

// // ============================================================
// // GET SINGLE ORDER
// // ============================================================

// export const getOrder = async (
//   customerId,
//   orderId
// ) => {
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
// // CANCEL ORDER
// // ============================================================

// export const cancelOrder = async (
//   customerId,
//   orderId
// ) => {
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

//   // ----------------------------------------------------------
//   // Find customer's order
//   // ----------------------------------------------------------

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

//   // ----------------------------------------------------------
//   // Already cancelled
//   // ----------------------------------------------------------

//   if (
//     order.orderStatus ===
//     "CANCELLED"
//   ) {
//     throw new ApiError(
//       400,
//       "Order is already cancelled"
//     );
//   }

//   // ----------------------------------------------------------
//   // Cannot cancel delivered order
//   // ----------------------------------------------------------

//   if (
//     order.orderStatus ===
//     "DELIVERED"
//   ) {
//     throw new ApiError(
//       400,
//       "Delivered orders cannot be cancelled"
//     );
//   }

//   // ----------------------------------------------------------
//   // Cannot cancel shipped order
//   // ----------------------------------------------------------

//   if (
//     order.orderStatus ===
//     "SHIPPED"
//   ) {
//     throw new ApiError(
//       400,
//       "Shipped orders cannot be cancelled"
//     );
//   }

//   // ----------------------------------------------------------
//   // Update order
//   // ----------------------------------------------------------

//   const updatedOrder =
//     await updateOrder(
//       orderId,
//       {
//         orderStatus:
//           "CANCELLED",

//         cancelledAt:
//           new Date(),

//         cancellationReason:
//           "Cancelled by customer",
//       }
//     );

//   if (!updatedOrder) {
//     throw new ApiError(
//       404,
//       "Order not found"
//     );
//   }

//   // ----------------------------------------------------------
//   // Restore product stock
//   // ----------------------------------------------------------

//   for (const item of order.items) {
//     await Product.updateOne(
//       {
//         _id: item.product,
//       },
//       {
//         $inc: {
//           stock: item.quantity,
//         },
//       }
//     );
//   }

//   // ----------------------------------------------------------
//   // Return updated order
//   // ----------------------------------------------------------

//   return updatedOrder;
// };

import mongoose from "mongoose";
//import Order from "./order.model.js";

import ApiError from "../../utils/ApiError.js";

import {
  createOrder,
  findCustomerOrder,
  findCustomerOrders,
  updateOrder,
} from "./order.repository.js";

import { findCustomerById } from "../customers/customer.repository.js";

import { findAddressById } from "../addresses/address.repository.js";

import {
  findCartByCustomerId,
  clearCart,
} from "../carts/cart.repository.js";

import Product from "../products/product.model.js";

import { generateOrderNumber } from "./order.utils.js";

// ============================================================
// CREATE NEW COD ORDER
// ============================================================

export const createNewOrder = async (customerId, data) => {
  const {
    addressId,
    paymentMethod = "COD",
  } = data;

  // ----------------------------------------------------------
  // Validate payment method
  // ----------------------------------------------------------

  if (paymentMethod !== "COD") {
    throw new ApiError(
      400,
      "Only Cash on Delivery is currently available"
    );
  }

  // ----------------------------------------------------------
  // Validate address
  // ----------------------------------------------------------

  if (!addressId) {
    throw new ApiError(
      400,
      "Address is required"
    );
  }

  if (!mongoose.Types.ObjectId.isValid(addressId)) {
    throw new ApiError(
      400,
      "Invalid address ID"
    );
  }

  // ----------------------------------------------------------
  // Validate customer ID
  // ----------------------------------------------------------

  if (!mongoose.Types.ObjectId.isValid(customerId)) {
    throw new ApiError(
      400,
      "Invalid customer ID"
    );
  }

  // ----------------------------------------------------------
  // Find customer
  // ----------------------------------------------------------

  const customer = await findCustomerById(customerId);

  if (!customer) {
    throw new ApiError(
      404,
      "Customer not found"
    );
  }

  // ----------------------------------------------------------
  // Check customer status
  // ----------------------------------------------------------

  if (!customer.isActive) {
    throw new ApiError(
      403,
      "Customer account is inactive"
    );
  }

  // ----------------------------------------------------------
  // Find customer address
  // ----------------------------------------------------------

  const address = await findAddressById(
    addressId,
    customerId
  );

  if (!address) {
    throw new ApiError(
      404,
      "Delivery address not found"
    );
  }

  // ----------------------------------------------------------
  // Find cart
  // ----------------------------------------------------------

  const cart = await findCartByCustomerId(
    customerId
  );

  if (!cart) {
    throw new ApiError(
      400,
      "Cart not found"
    );
  }

  // ----------------------------------------------------------
  // Validate cart
  // ----------------------------------------------------------

  if (
    !cart.items ||
    cart.items.length === 0
  ) {
    throw new ApiError(
      400,
      "Your cart is empty"
    );
  }

  // ----------------------------------------------------------
  // Prepare order items
  // ----------------------------------------------------------

  const orderItems = [];

  let subtotal = 0;

  // ----------------------------------------------------------
  // Validate products and stock
  // ----------------------------------------------------------

  for (const cartItem of cart.items) {
    const productId =
      cartItem.product?._id ||
      cartItem.product;

    const quantity = Number(
      cartItem.quantity
    );

    // --------------------------------------------------------
    // Validate product ID
    // --------------------------------------------------------

    if (
      !productId ||
      !mongoose.Types.ObjectId.isValid(
        productId
      )
    ) {
      throw new ApiError(
        400,
        "Invalid product in cart"
      );
    }

    // --------------------------------------------------------
    // Validate quantity
    // --------------------------------------------------------

    if (
      !Number.isInteger(quantity) ||
      quantity <= 0
    ) {
      throw new ApiError(
        400,
        "Invalid product quantity"
      );
    }

    // --------------------------------------------------------
    // Find latest product
    // --------------------------------------------------------

    const product = await Product.findById(
      productId
    );

    if (!product) {
      throw new ApiError(
        404,
        `Product not found: ${productId}`
      );
    }

    // --------------------------------------------------------
    // Product active check
    // --------------------------------------------------------

    if (!product.isActive) {
      throw new ApiError(
        400,
        `Product "${product.name}" is currently unavailable`
      );
    }

    // --------------------------------------------------------
    // Stock validation
    // --------------------------------------------------------

    if (product.stock < quantity) {
      throw new ApiError(
        400,
        `Only ${product.stock} units of "${product.name}" are available`
      );
    }

    // --------------------------------------------------------
    // Calculate selling price
    // --------------------------------------------------------

    const sellingPrice =
      product.discountPrice !== null &&
      product.discountPrice !== undefined &&
      product.discountPrice < product.price
        ? product.discountPrice
        : product.price;

    // --------------------------------------------------------
    // Calculate item total
    // --------------------------------------------------------

    const itemTotal =
      sellingPrice * quantity;

    subtotal += itemTotal;

    // --------------------------------------------------------
    // Order item snapshot
    // --------------------------------------------------------

    orderItems.push({
      product: product._id,
      name: product.name,
      sku: product.sku,

      image:
        product.images &&
        product.images.length > 0
          ? product.images[0]
          : null,

      quantity,

      price: sellingPrice,

      total: itemTotal,
    });
  }

  // ----------------------------------------------------------
  // Shipping calculation
  // ----------------------------------------------------------
  // Free shipping for orders >= ₹999
  // Otherwise ₹50

  const shippingCharge =
    subtotal >= 999
      ? 0
      : 50;

  // ----------------------------------------------------------
  // Discount
  // ----------------------------------------------------------
  // Coupon system will be added later.

  const discount = 0;

  // ----------------------------------------------------------
  // Final amount
  // ----------------------------------------------------------

  const totalAmount =
    subtotal +
    shippingCharge -
    discount;

  // ----------------------------------------------------------
  // Address snapshot
  // ----------------------------------------------------------

  const shippingAddress = {
    firstName:
      address.firstName ||
      customer.firstName,

    lastName:
      address.lastName ||
      customer.lastName ||
      "",

    mobile:
      address.mobile ||
      customer.mobile,

    addressLine1:
      address.addressLine1,

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

  // ----------------------------------------------------------
  // Generate order number
  // ----------------------------------------------------------

  const orderNumber =
    generateOrderNumber();

  // ----------------------------------------------------------
  // Prepare order
  // ----------------------------------------------------------

  const orderData = {
    customer: customerId,

    orderNumber,

    items: orderItems,

    shippingAddress,

    subtotal,

    shippingCharge,

    discount,

    totalAmount,

    paymentMethod: "COD",

    paymentStatus: "PENDING",

    orderStatus: "PLACED",
  };

  // ----------------------------------------------------------
  // Create order
  // ----------------------------------------------------------

  const order = await createOrder(
    orderData
  );

  // ----------------------------------------------------------
  // Reduce stock
  // ----------------------------------------------------------

  try {
    for (const item of orderItems) {
      const result =
        await Product.updateOne(
          {
            _id: item.product,
            stock: {
              $gte: item.quantity,
            },
          },
          {
            $inc: {
              stock: -item.quantity,
            },
          }
        );

      if (
        result.modifiedCount !== 1
      ) {
        throw new ApiError(
          400,
          `Unable to update stock for product "${item.name}"`
        );
      }
    }
  } catch (error) {
    // --------------------------------------------------------
    // Delete order if stock update fails
    // --------------------------------------------------------

    await mongoose
      .model("Order")
      .findByIdAndDelete(order._id);

    throw error;
  }

  // ----------------------------------------------------------
  // Clear cart
  // ----------------------------------------------------------

  await clearCart(customerId);

  // ----------------------------------------------------------
  // Return created order
  // ----------------------------------------------------------

  return order;
};

// ============================================================
// GET CUSTOMER ORDERS
// ============================================================

export const getMyOrders = async (
  customerId,
  query = {}
) => {
  const orders =
    await findCustomerOrders(
      customerId
    );

  return {
    orders,
    count: orders.length,
  };
};

// ============================================================
// GET SINGLE ORDER
// ============================================================

export const getOrder = async (
  customerId,
  orderId
) => {
  // ----------------------------------------------------------
  // Validate order ID
  // ----------------------------------------------------------

  if (
    !mongoose.Types.ObjectId.isValid(
      orderId
    )
  ) {
    throw new ApiError(
      400,
      "Invalid order ID"
    );
  }

  // ----------------------------------------------------------
  // Find customer's order
  // ----------------------------------------------------------

  const order =
    await findCustomerOrder(
      orderId,
      customerId
    );

  if (!order) {
    throw new ApiError(
      404,
      "Order not found"
    );
  }

  return order;
};



// ============================================================
// CANCEL CUSTOMER ORDER
// ============================================================

export const cancelOrder = async (
  customerId,
  orderId,
  reason = ""
) => {
  // ----------------------------------------------------------
  // Validate order ID
  // ----------------------------------------------------------

  if (
    !mongoose.Types.ObjectId.isValid(orderId)
  ) {
    throw new ApiError(
      400,
      "Invalid order ID"
    );
  }

  // ----------------------------------------------------------
  // Find customer's order
  // ----------------------------------------------------------

  const order =
    await findCustomerOrder(
      orderId,
      customerId
    );

  if (!order) {
    throw new ApiError(
      404,
      "Order not found"
    );
  }

  // ----------------------------------------------------------
  // Check current order status
  // ----------------------------------------------------------

  if (
    order.orderStatus ===
    "CANCELLED"
  ) {
    throw new ApiError(
      400,
      "Order is already cancelled"
    );
  }

  if (
    order.orderStatus ===
    "DELIVERED"
  ) {
    throw new ApiError(
      400,
      "Delivered orders cannot be cancelled"
    );
  }

  if (
    order.orderStatus ===
    "SHIPPED"
  ) {
    throw new ApiError(
      400,
      "Shipped orders cannot be cancelled"
    );
  }

  // ----------------------------------------------------------
  // Only allow cancellation for:
  // PLACED / CONFIRMED / PROCESSING
  // ----------------------------------------------------------

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
    throw new ApiError(
      400,
      `Order cannot be cancelled when status is ${order.orderStatus}`
    );
  }

  // ----------------------------------------------------------
  // Restore product stock
  // ----------------------------------------------------------

  for (const item of order.items) {
    const result =
      await Product.updateOne(
        {
          _id: item.product,
        },
        {
          $inc: {
            stock: item.quantity,
          },
        }
      );

    if (
      result.modifiedCount !== 1
    ) {
      throw new ApiError(
        400,
        `Unable to restore stock for product "${item.name}"`
      );
    }
  }

  // ----------------------------------------------------------
  // Update order
  // ----------------------------------------------------------

  const updatedOrder =
    await updateOrder(
      orderId,
      {
        orderStatus: "CANCELLED",

        cancelledAt:
          new Date(),

        cancellationReason:
          reason?.trim() ||
          "Cancelled by customer",
      }
    );

  if (!updatedOrder) {
    throw new ApiError(
      404,
      "Order not found"
    );
  }

  // ----------------------------------------------------------
  // Return updated order
  // ----------------------------------------------------------

  return updatedOrder;
};