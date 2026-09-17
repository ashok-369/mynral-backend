// import {
//   createNewCoupon,
//   getAllCoupons,
//   getCouponById,
//   updateExistingCoupon,
//   removeCoupon,
//   toggleCouponStatus,
//   validateCoupon,
//   getActiveCoupons,
// } from "./coupon.service.js";

// // ============================================================
// // CREATE COUPON
// // ============================================================

// export const createCouponController =
//   async (
//     req,
//     res,
//     next
//   ) => {
//     try {
//       const coupon =
//         await createNewCoupon(
//           req.body
//         );

//       return res.status(201).json({
//         success: true,
//         statusCode: 201,
//         message:
//           "Coupon created successfully",
//         data: {
//           coupon,
//         },
//       });
//     } catch (error) {
//       next(error);
//     }
//   };

// // ============================================================
// // GET ALL COUPONS
// // ============================================================

// export const getAllCouponsController =
//   async (
//     req,
//     res,
//     next
//   ) => {
//     try {
//       const result =
//         await getAllCoupons(
//           req.query
//         );

//       return res.status(200).json({
//         success: true,
//         statusCode: 200,
//         message:
//           "Coupons fetched successfully",
//         data: result,
//       });
//     } catch (error) {
//       next(error);
//     }
//   };

// // ============================================================
// // GET SINGLE COUPON
// // ============================================================

// export const getCouponController =
//   async (
//     req,
//     res,
//     next
//   ) => {
//     try {
//       const coupon =
//         await getCouponById(
//           req.params.couponId
//         );

//       return res.status(200).json({
//         success: true,
//         statusCode: 200,
//         message:
//           "Coupon fetched successfully",
//         data: {
//           coupon,
//         },
//       });
//     } catch (error) {
//       next(error);
//     }
//   };

// // ============================================================
// // UPDATE COUPON
// // ============================================================

// export const updateCouponController =
//   async (
//     req,
//     res,
//     next
//   ) => {
//     try {
//       const coupon =
//         await updateExistingCoupon(
//           req.params.couponId,
//           req.body
//         );

//       return res.status(200).json({
//         success: true,
//         statusCode: 200,
//         message:
//           "Coupon updated successfully",
//         data: {
//           coupon,
//         },
//       });
//     } catch (error) {
//       next(error);
//     }
//   };

// // ============================================================
// // DELETE COUPON
// // ============================================================

// export const deleteCouponController =
//   async (
//     req,
//     res,
//     next
//   ) => {
//     try {
//       const result =
//         await removeCoupon(
//           req.params.couponId
//         );

//       return res.status(200).json({
//         success: true,
//         statusCode: 200,
//         message:
//           "Coupon deleted successfully",
//         data: result,
//       });
//     } catch (error) {
//       next(error);
//     }
//   };

// // ============================================================
// // TOGGLE COUPON STATUS
// // ============================================================

// export const toggleCouponController =
//   async (
//     req,
//     res,
//     next
//   ) => {
//     try {
//       const coupon =
//         await toggleCouponStatus(
//           req.params.couponId
//         );

//       return res.status(200).json({
//         success: true,
//         statusCode: 200,
//         message:
//           "Coupon status updated successfully",
//         data: {
//           coupon,
//         },
//       });
//     } catch (error) {
//       next(error);
//     }
//   };

// // ============================================================
// // VALIDATE COUPON
// // ============================================================

// export const validateCouponController =
//   async (
//     req,
//     res,
//     next
//   ) => {
//     try {
//       const result =
//         await validateCoupon(
//           req.body
//         );

//       return res.status(200).json({
//         success: true,
//         statusCode: 200,
//         message:
//           "Coupon applied successfully",
//         data: result,
//       });
//     } catch (error) {
//       next(error);
//     }
//   };

//   // ============================================================
// // GET ACTIVE CUSTOMER COUPONS
// // ============================================================

// export const getActiveCouponsController = async (
//   req,
//   res,
//   next
// ) => {
//   try {
//     const coupons = await getActiveCoupons();

//     return res.status(200).json({
//       success: true,
//       statusCode: 200,
//       message: "Active coupons fetched successfully",
//       data: {
//         coupons,
//       },
//     });
//   } catch (error) {
//     next(error);
//   }
// };
import ApiError from "../../utils/ApiError.js";

import {
  createNewCoupon,
  getAllCoupons,
  getCouponById,
  updateExistingCoupon,
  removeCoupon,
  toggleCouponStatus,
  validateCoupon,
  getActiveCoupons,
} from "./coupon.service.js";

// ============================================================
// CREATE COUPON
// POST /api/coupons/admin
// ============================================================

export const createCouponController = async (req, res, next) => {
  try {
    const coupon = await createNewCoupon(req.body);

    return res.status(201).json({
      success: true,
      statusCode: 201,
      message: "Coupon created successfully",
      data: {
        coupon,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// GET ALL COUPONS
// GET /api/coupons/admin
// ============================================================

export const getAllCouponsController = async (req, res, next) => {
  try {
    const result = await getAllCoupons(req.query);

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Coupons fetched successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// GET COUPON BY ID
// GET /api/coupons/admin/:couponId
// ============================================================

export const getCouponController = async (req, res, next) => {
  try {
    const coupon = await getCouponById(req.params.couponId);

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Coupon fetched successfully",
      data: {
        coupon,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// UPDATE COUPON
// PATCH /api/coupons/admin/:couponId
// ============================================================

export const updateCouponController = async (req, res, next) => {
  try {
    const coupon = await updateExistingCoupon(
      req.params.couponId,
      req.body
    );

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Coupon updated successfully",
      data: {
        coupon,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// DELETE COUPON
// DELETE /api/coupons/admin/:couponId
// ============================================================

export const deleteCouponController = async (req, res, next) => {
  try {
    const result = await removeCoupon(req.params.couponId);

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Coupon deleted successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// TOGGLE COUPON STATUS
// PATCH /api/coupons/admin/:couponId/toggle
// ============================================================

export const toggleCouponController = async (req, res, next) => {
  try {
    const coupon = await toggleCouponStatus(
      req.params.couponId
    );

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Coupon status updated successfully",
      data: {
        coupon,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// VALIDATE / APPLY COUPON
// POST /api/coupons/validate
// ============================================================

export const validateCouponController = async (req, res, next) => {
  try {
    // ==========================================================
    // CUSTOMER AUTHENTICATION
    // authMiddleware stores customer information in req.customer
    // ==========================================================

    if (!req.customer?.id) {
      return next(
        new ApiError(
          401,
          "Customer authentication is required"
        )
      );
    }

    // ==========================================================
    // VALIDATE COUPON
    // ==========================================================

    const result = await validateCoupon({
      ...req.body,
      customerId: req.customer.id,
    });

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Coupon applied successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// GET ACTIVE COUPONS
// GET /api/coupons
// ============================================================

export const getActiveCouponsController = async (
  req,
  res,
  next
) => {
  try {
    const coupons = await getActiveCoupons(req.customer?.id);

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Active coupons fetched successfully",
      data: {
        coupons,
      },
    });
  } catch (error) {
    next(error);
  }
};