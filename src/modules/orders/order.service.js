import mongoose from "mongoose";

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
import Variant from "../products/variant.model.js";

import { generateOrderNumber } from "./order.utils.js";

import {
  sendOrderConfirmation,
  sendOrderCancellation,
  createCustomerOrderNotification,
  createAdminOrderNotification,
} from "../notifications/notification.service.js";

// ============================================================
// CREATE NEW COD ORDER
// ============================================================

export const createNewOrder = async (customerId, data) => {
  const {
    addressId,
    paymentMethod = "COD",
  } = data;

  // ==========================================================
  // VALIDATE PAYMENT METHOD
  // ==========================================================

  if (paymentMethod !== "COD") {
    throw new ApiError(
      400,
      "Only Cash on Delivery is currently available"
    );
  }

  // ==========================================================
  // VALIDATE ADDRESS
  // ==========================================================

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

  // ==========================================================
  // VALIDATE CUSTOMER ID
  // ==========================================================

  if (!mongoose.Types.ObjectId.isValid(customerId)) {
    throw new ApiError(
      400,
      "Invalid customer ID"
    );
  }

  // ==========================================================
  // FIND CUSTOMER
  // ==========================================================

  const customer = await findCustomerById(customerId);

  if (!customer) {
    throw new ApiError(
      404,
      "Customer not found"
    );
  }

  // ==========================================================
  // CHECK CUSTOMER STATUS
  // ==========================================================

  if (!customer.isActive) {
    throw new ApiError(
      403,
      "Customer account is inactive"
    );
  }

  // ==========================================================
  // FIND CUSTOMER ADDRESS
  // ==========================================================

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

  // ==========================================================
  // FIND CART
  // ==========================================================

  const cart = await findCartByCustomerId(
    customerId
  );

  if (!cart) {
    throw new ApiError(
      400,
      "Cart not found"
    );
  }

  // ==========================================================
  // VALIDATE CART
  // ==========================================================

  if (
    !cart.items ||
    cart.items.length === 0
  ) {
    throw new ApiError(
      400,
      "Your cart is empty"
    );
  }

  // ==========================================================
  // PREPARE ORDER ITEMS
  // ==========================================================

  const orderItems = [];

  let subtotal = 0;

  // ==========================================================
  // VALIDATE CART ITEMS
  // ==========================================================

  for (const cartItem of cart.items) {
    // --------------------------------------------------------
    // PRODUCT ID
    // --------------------------------------------------------

    const productId =
      cartItem.product?._id ||
      cartItem.product;

    // --------------------------------------------------------
    // VARIANT ID
    // --------------------------------------------------------

    const variantId =
      cartItem.variant?._id ||
      cartItem.variant ||
      null;

    // --------------------------------------------------------
    // QUANTITY
    // --------------------------------------------------------

    const quantity = Number(
      cartItem.quantity
    );

    // --------------------------------------------------------
    // VALIDATE PRODUCT ID
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
    // VALIDATE QUANTITY
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

    // ========================================================
    // FIND LATEST PRODUCT
    // ========================================================

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
    // PRODUCT ACTIVE CHECK
    // --------------------------------------------------------

    if (!product.isActive) {
      throw new ApiError(
        400,
        `Product "${product.name}" is currently unavailable`
      );
    }

    // ========================================================
    // PRICE / STOCK VARIABLES
    // ========================================================

    let sellingPrice;
    let availableStock;
    let itemSku;
    let variant = null;

    // ========================================================
    // VARIANT PRODUCT
    // ========================================================

    if (variantId) {
      // ------------------------------------------------------
      // VALIDATE VARIANT ID
      // ------------------------------------------------------

      if (
        !mongoose.Types.ObjectId.isValid(
          variantId
        )
      ) {
        throw new ApiError(
          400,
          "Invalid product variant"
        );
      }

      // ------------------------------------------------------
      // FIND VARIANT
      // ------------------------------------------------------

      variant = await Variant.findOne({
        _id: variantId,
        product: productId,
      });

      if (!variant) {
        throw new ApiError(
          404,
          `Variant not found for "${product.name}"`
        );
      }

      // ------------------------------------------------------
      // VARIANT ACTIVE CHECK
      // ------------------------------------------------------

      if (!variant.isActive) {
        throw new ApiError(
          400,
          `Variant of "${product.name}" is currently unavailable`
        );
      }

      // ------------------------------------------------------
      // VARIANT STOCK
      // ------------------------------------------------------

      availableStock = Number(
        variant.stock
      );

      if (
        !Number.isFinite(
          availableStock
        ) ||
        availableStock < quantity
      ) {
        throw new ApiError(
          400,
          `Only ${availableStock || 0} units of "${product.name}" are available`
        );
      }

      // ------------------------------------------------------
      // VARIANT PRICE
      // ------------------------------------------------------

      const variantPrice = Number(
        variant.price
      );

      const variantDiscountPrice =
        variant.discountPrice !== null &&
        variant.discountPrice !== undefined
          ? Number(variant.discountPrice)
          : null;

      if (
        !Number.isFinite(
          variantPrice
        ) ||
        variantPrice < 0
      ) {
        throw new ApiError(
          400,
          `Invalid price for variant of "${product.name}"`
        );
      }

      if (
        variantDiscountPrice !== null &&
        Number.isFinite(
          variantDiscountPrice
        ) &&
        variantDiscountPrice >= 0 &&
        variantDiscountPrice < variantPrice
      ) {
        sellingPrice =
          variantDiscountPrice;
      } else {
        sellingPrice =
          variantPrice;
      }

      itemSku =
        variant.sku ||
        product.sku;

    } else {
      // ======================================================
      // PRODUCT WITHOUT VARIANT
      // ======================================================

      availableStock = Number(
        product.stock
      );

      if (
        !Number.isFinite(
          availableStock
        ) ||
        availableStock < quantity
      ) {
        throw new ApiError(
          400,
          `Only ${availableStock || 0} units of "${product.name}" are available`
        );
      }

      // ------------------------------------------------------
      // PRODUCT PRICE
      // ------------------------------------------------------

      const productPrice = Number(
        product.price
      );

      const productDiscountPrice =
        product.discountPrice !== null &&
        product.discountPrice !== undefined
          ? Number(product.discountPrice)
          : null;

      if (
        !Number.isFinite(
          productPrice
        ) ||
        productPrice < 0
      ) {
        throw new ApiError(
          400,
          `Invalid price for product "${product.name}"`
        );
      }

      if (
        productDiscountPrice !== null &&
        Number.isFinite(
          productDiscountPrice
        ) &&
        productDiscountPrice >= 0 &&
        productDiscountPrice < productPrice
      ) {
        sellingPrice =
          productDiscountPrice;
      } else {
        sellingPrice =
          productPrice;
      }

      itemSku =
        product.sku;
    }

    // ========================================================
    // VALIDATE FINAL PRICE
    // ========================================================

    if (
      !Number.isFinite(
        sellingPrice
      ) ||
      sellingPrice < 0
    ) {
      throw new ApiError(
        400,
        `Invalid selling price for "${product.name}"`
      );
    }

    // ========================================================
    // CALCULATE ITEM TOTAL
    // ========================================================

    const itemTotal =
      sellingPrice * quantity;

    if (
      !Number.isFinite(
        itemTotal
      )
    ) {
      throw new ApiError(
        400,
        `Unable to calculate total for "${product.name}"`
      );
    }

    subtotal += itemTotal;

    // ========================================================
    // CREATE ORDER ITEM SNAPSHOT
    // ========================================================

    const orderItem = {
      product: product._id,

      name: product.name,

      sku: itemSku,

      image:
        product.images &&
        product.images.length > 0
          ? product.images[0]
          : null,

      quantity,

      price: sellingPrice,

      total: itemTotal,
    };

    // --------------------------------------------------------
    // ADD VARIANT INFORMATION IF AVAILABLE
    // --------------------------------------------------------

    if (variant) {
      orderItem.variant = variant._id;

      orderItem.weight =
        variant.weight;

      orderItem.weightUnit =
        variant.weightUnit;
    }

    orderItems.push(
      orderItem
    );
  }

  // ==========================================================
  // SHIPPING CALCULATION
  // ==========================================================
  // Free shipping for orders >= ₹999
  // Otherwise ₹50
  // ==========================================================

  const shippingCharge =
    subtotal >= 999
      ? 0
      : 50;

  // ==========================================================
  // DISCOUNT
  // ==========================================================
  // Coupon system will be added later.
  // ==========================================================

  const discount = 0;

  // ==========================================================
  // FINAL AMOUNT
  // ==========================================================

  const totalAmount =
    subtotal +
    shippingCharge -
    discount;

  if (
    !Number.isFinite(
      subtotal
    ) ||
    !Number.isFinite(
      totalAmount
    )
  ) {
    throw new ApiError(
      400,
      "Unable to calculate order amount"
    );
  }

  // ==========================================================
  // ADDRESS SNAPSHOT
  // ==========================================================

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
      address.addressLine2 ||
      "",

    city:
      address.city,

    state:
      address.state,

    pincode:
      address.pincode,

    landmark:
      address.landmark ||
      "",
  };

  // ==========================================================
  // GENERATE ORDER NUMBER
  // ==========================================================

  const orderNumber =
    generateOrderNumber();

  // ==========================================================
  // PREPARE ORDER
  // ==========================================================

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

  // ==========================================================
  // CREATE ORDER
  // ==========================================================

  const order =
    await createOrder(
      orderData
    );

  // ==========================================================
  // REDUCE STOCK
  // ==========================================================

  try {
    for (const item of orderItems) {
      // ------------------------------------------------------
      // VARIANT STOCK
      // ------------------------------------------------------

      if (item.variant) {
        const result =
          await Variant.updateOne(
            {
              _id: item.variant,

              product:
                item.product,

              stock: {
                $gte:
                  item.quantity,
              },
            },
            {
              $inc: {
                stock:
                  -item.quantity,
              },
            }
          );

        if (
          result.modifiedCount !== 1
        ) {
          throw new ApiError(
            400,
            `Unable to update stock for variant of "${item.name}"`
          );
        }
      }

      // ------------------------------------------------------
      // PRODUCT STOCK
      // ------------------------------------------------------
      // Only update product stock when the product itself
      // does not use a variant.
      // ------------------------------------------------------

      else {
        const result =
          await Product.updateOne(
            {
              _id:
                item.product,

              stock: {
                $gte:
                  item.quantity,
              },
            },
            {
              $inc: {
                stock:
                  -item.quantity,
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
    }
  } catch (error) {
    // --------------------------------------------------------
    // DELETE ORDER IF STOCK UPDATE FAILS
    // --------------------------------------------------------

    await mongoose
      .model("Order")
      .findByIdAndDelete(
        order._id
      );

    throw error;
  }

  // ==========================================================
  // CLEAR CART
  // ==========================================================

  await clearCart(
    customerId
  );

  // ==========================================================
  // CUSTOMER ORDER NOTIFICATION
  // ==========================================================

  try {
    await createCustomerOrderNotification({
      customerId:
        customerId,

      orderId:
        order._id,

      title:
        "Order Placed Successfully",

      message:
        `Your order ${order.orderNumber} has been placed successfully.`,

      data: {
        orderNumber:
          order.orderNumber,

        status:
          order.orderStatus,

        totalAmount:
          order.totalAmount,
      },
    });
  } catch (notificationError) {
    // Notification failure must NOT fail the order
    console.error(
      "⚠️ Order created successfully, but customer notification failed:",
      notificationError.message
    );
  }

  // ==========================================================
  // ADMIN ORDER NOTIFICATION
  // ==========================================================

  try {
    await createAdminOrderNotification({
      customerId:
        customerId,

      orderId:
        order._id,

      title:
        "New Order Received",

      message:
        `New order ${order.orderNumber} has been placed by ${
          customer.firstName ||
          "Customer"
        }.`,

      data: {
        orderNumber:
          order.orderNumber,

        customerId:
          customerId,

        status:
          order.orderStatus,

        totalAmount:
          order.totalAmount,
      },
    });
  } catch (notificationError) {
    // Notification failure must NOT fail the order
    console.error(
      "⚠️ Order created successfully, but admin notification failed:",
      notificationError.message
    );
  }

  // ==========================================================
  // SEND ORDER CONFIRMATION EMAIL
  // ==========================================================

  try {
    await sendOrderConfirmation({
      customerEmail:
        customer.email,

      customerName:
        `${customer.firstName || ""} ${
          customer.lastName || ""
        }`.trim(),

      orderNumber:
        order.orderNumber,

      items:
        order.items,

      totalAmount:
        order.totalAmount,
    });
  } catch (emailError) {
    // Email failure should NOT fail the order
    console.error(
      "⚠️ Order created successfully, but confirmation email failed:",
      emailError.message
    );
  }

  // ==========================================================
  // RETURN CREATED ORDER
  // ==========================================================

  return order;
};

// ============================================================
// GET CUSTOMER ORDER HISTORY
// ============================================================

export const getMyOrders = async (
  customerId,
  query = {}
) => {
  const {
    status,
    search,
    page = 1,
    limit = 10,
  } = query;

  const result =
    await findCustomerOrders(
      customerId,
      {
        status,
        search,
        page,
        limit,
      }
    );

  return result;
};

// ============================================================
// GET SINGLE ORDER
// ============================================================

export const getOrder = async (
  customerId,
  orderId
) => {
  // ==========================================================
  // VALIDATE ORDER ID
  // ==========================================================

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

  // ==========================================================
  // FIND CUSTOMER ORDER
  // ==========================================================

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
  // ==========================================================
  // VALIDATE ORDER ID
  // ==========================================================

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

  // ==========================================================
  // FIND CUSTOMER ORDER
  // ==========================================================

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

  // ==========================================================
  // FIND CUSTOMER
  // ==========================================================

  const customer =
    await findCustomerById(
      customerId
    );

  if (!customer) {
    throw new ApiError(
      404,
      "Customer not found"
    );
  }

  // ==========================================================
  // CHECK CURRENT ORDER STATUS
  // ==========================================================

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

  // ==========================================================
  // ONLY ALLOW CANCELLATION FOR:
  // PLACED / CONFIRMED / PROCESSING
  // ==========================================================

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

  // ==========================================================
  // RESTORE STOCK
  // ==========================================================

  for (const item of order.items) {
    // --------------------------------------------------------
    // RESTORE VARIANT STOCK
    // --------------------------------------------------------

    if (item.variant) {
      const result =
        await Variant.updateOne(
          {
            _id:
              item.variant,

            product:
              item.product,
          },
          {
            $inc: {
              stock:
                item.quantity,
            },
          }
        );

      if (
        result.modifiedCount !== 1
      ) {
        throw new ApiError(
          400,
          `Unable to restore stock for variant of "${item.name}"`
        );
      }
    }

    // --------------------------------------------------------
    // RESTORE PRODUCT STOCK
    // --------------------------------------------------------

    else {
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
  }

  // ==========================================================
  // UPDATE ORDER
  // ==========================================================

  const updatedOrder =
    await updateOrder(
      orderId,
      {
        orderStatus:
          "CANCELLED",

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

  // ==========================================================
  // CUSTOMER CANCELLATION NOTIFICATION
  // ==========================================================

  try {
    await createCustomerOrderNotification({
      customerId:
        customerId,

      orderId:
        updatedOrder._id,

      title:
        "Order Cancelled",

      message:
        `Your order ${updatedOrder.orderNumber} has been cancelled.`,

      data: {
        orderNumber:
          updatedOrder.orderNumber,

        status:
          updatedOrder.orderStatus,

        reason:
          updatedOrder.cancellationReason,
      },
    });
  } catch (notificationError) {
    console.error(
      "⚠️ Order cancelled successfully, but customer notification failed:",
      notificationError.message
    );
  }

  // ==========================================================
  // ADMIN CANCELLATION NOTIFICATION
  // ==========================================================

  try {
    await createAdminOrderNotification({
      customerId:
        customerId,

      orderId:
        updatedOrder._id,

      title:
        "Order Cancelled by Customer",

      message:
        `Customer cancelled order ${updatedOrder.orderNumber}.`,

      data: {
        orderNumber:
          updatedOrder.orderNumber,

        customerId:
          customerId,

        status:
          updatedOrder.orderStatus,

        reason:
          updatedOrder.cancellationReason,
      },
    });
  } catch (notificationError) {
    console.error(
      "⚠️ Order cancelled successfully, but admin notification failed:",
      notificationError.message
    );
  }

  // ==========================================================
  // SEND CANCELLATION EMAIL
  // ==========================================================

  try {
    await sendOrderCancellation({
      customerEmail:
        customer.email,

      customerName:
        `${customer.firstName || ""} ${
          customer.lastName || ""
        }`.trim(),

      orderNumber:
        updatedOrder.orderNumber,

      reason:
        updatedOrder.cancellationReason,
    });
  } catch (emailError) {
    // Email failure should NOT fail cancellation
    console.error(
      "⚠️ Order cancelled successfully, but cancellation email failed:",
      emailError.message
    );
  }

  // ==========================================================
  // RETURN UPDATED ORDER
  // ==========================================================

  return updatedOrder;
};