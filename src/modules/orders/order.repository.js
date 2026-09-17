// import Order from "./order.model.js";

// // ============================================================
// // CREATE ORDER
// // ============================================================

// export const createOrder = async (orderData) => {
//   return Order.create(orderData);
// };

// // ============================================================
// // FIND ORDER BY ID
// // ============================================================

// export const findOrderById = async (orderId) => {
//   return Order.findById(orderId)
//     .populate(
//       "items.product",
//       "name slug images price sku"
//     );
// };

// // ============================================================
// // FIND CUSTOMER ORDERS
// // ============================================================

// export const findCustomerOrders = async (
//   customerId,
//   {
//     status,
//     search,
//     page = 1,
//     limit = 10,
//   } = {}
// ) => {
//   const currentPage = Math.max(
//     Number(page) || 1,
//     1
//   );

//   const perPage = Math.min(
//     Math.max(Number(limit) || 10, 1),
//     50
//   );

//   const skip =
//     (currentPage - 1) * perPage;

//   // ==========================================================
//   // Build Filter
//   // ==========================================================

//   const filter = {
//     customer: customerId,
//   };

//   // ==========================================================
//   // Filter By Status
//   // ==========================================================

//   if (status) {
//     filter.orderStatus =
//       String(status)
//         .trim()
//         .toUpperCase();
//   }

//   // ==========================================================
//   // Search By Order Number
//   // ==========================================================

//   if (search && search.trim()) {
//     filter.orderNumber = {
//       $regex: search.trim(),
//       $options: "i",
//     };
//   }

//   // ==========================================================
//   // Total Orders
//   // ==========================================================

//   const totalOrders =
//     await Order.countDocuments(filter);

//   // ==========================================================
//   // Get Orders
//   // ==========================================================

//   const orders =
//     await Order.find(filter)
//       .populate(
//         "items.product",
//         "name slug images price sku"
//       )
//       .sort({
//         createdAt: -1,
//       })
//       .skip(skip)
//       .limit(perPage)
//       .lean();

//   // ==========================================================
//   // Pagination
//   // ==========================================================

//   const totalPages = Math.ceil(
//     totalOrders / perPage
//   );

//   return {
//     orders,

//     pagination: {
//       currentPage,
//       limit: perPage,
//       totalOrders,
//       totalPages,

//       hasNextPage:
//         currentPage < totalPages,

//       hasPreviousPage:
//         currentPage > 1,
//     },
//   };
// };

// // ============================================================
// // FIND CUSTOMER ORDER
// // ============================================================

// export const findCustomerOrder = async (
//   orderId,
//   customerId
// ) => {
//   return Order.findOne({
//     _id: orderId,
//     customer: customerId,
//   }).populate(
//     "items.product",
//     "name slug images price sku"
//   );
// };

// // ============================================================
// // UPDATE ORDER
// // ============================================================

// export const updateOrder = async (
//   orderId,
//   updateData
// ) => {
//   return Order.findByIdAndUpdate(
//     orderId,
//     updateData,
//     {
//       new: true,
//       runValidators: true,
//     }
//   ).populate(
//     "items.product",
//     "name slug images price sku"
//   );
// };


import Order from "./order.model.js";

// ============================================================
// CREATE ORDER
// ============================================================

export const createOrder = async (orderData) => {
  const order = await Order.create(orderData);

  return order;
};

// ============================================================
// FIND CUSTOMER ORDERS
// ============================================================

export const findOrdersByCustomer = async (
  customerId,
  options = {}
) => {
  const {
    page = 1,
    limit = 10,
    status,
  } = options;

  const skip = (page - 1) * limit;

  const filter = {
    customer: customerId,
  };

  if (status) {
    filter.orderStatus = status;
  }

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .sort({
        createdAt: -1,
      })
      .skip(skip)
      .limit(limit)
      .populate("items.product")
      .populate("items.variant")
      .lean(),

    Order.countDocuments(filter),
  ]);

  return {
    orders,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// ============================================================
// FIND SINGLE CUSTOMER ORDER
// ============================================================

export const findOrderByCustomer = async (
  customerId,
  orderId
) => {
  return Order.findOne({
    _id: orderId,
    customer: customerId,
  })
    .populate("items.product")
    .populate("items.variant");
};

// ============================================================
// FIND ORDER BY ID
// ============================================================

export const findOrderById = async (orderId) => {
  return Order.findById(orderId);
};

// ============================================================
// UPDATE ORDER
// ============================================================

export const updateOrder = async (
  orderId,
  updateData
) => {
  return Order.findByIdAndUpdate(
    orderId,
    updateData,
    {
      new: true,
      runValidators: true,
    }
  );
};