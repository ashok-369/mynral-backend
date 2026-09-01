import {
  createNewCoupon,
  getAllCoupons,
  getCouponById,
  updateExistingCoupon,
  removeCoupon,
  toggleCouponStatus,
  validateCoupon,
} from "./coupon.service.js";

// ============================================================
// CREATE COUPON
// ============================================================

export const createCouponController =
  async (
    req,
    res,
    next
  ) => {
    try {
      const coupon =
        await createNewCoupon(
          req.body
        );

      return res.status(201).json({
        success: true,
        statusCode: 201,
        message:
          "Coupon created successfully",
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
// ============================================================

export const getAllCouponsController =
  async (
    req,
    res,
    next
  ) => {
    try {
      const result =
        await getAllCoupons(
          req.query
        );

      return res.status(200).json({
        success: true,
        statusCode: 200,
        message:
          "Coupons fetched successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

// ============================================================
// GET SINGLE COUPON
// ============================================================

export const getCouponController =
  async (
    req,
    res,
    next
  ) => {
    try {
      const coupon =
        await getCouponById(
          req.params.couponId
        );

      return res.status(200).json({
        success: true,
        statusCode: 200,
        message:
          "Coupon fetched successfully",
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
// ============================================================

export const updateCouponController =
  async (
    req,
    res,
    next
  ) => {
    try {
      const coupon =
        await updateExistingCoupon(
          req.params.couponId,
          req.body
        );

      return res.status(200).json({
        success: true,
        statusCode: 200,
        message:
          "Coupon updated successfully",
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
// ============================================================

export const deleteCouponController =
  async (
    req,
    res,
    next
  ) => {
    try {
      const result =
        await removeCoupon(
          req.params.couponId
        );

      return res.status(200).json({
        success: true,
        statusCode: 200,
        message:
          "Coupon deleted successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

// ============================================================
// TOGGLE COUPON STATUS
// ============================================================

export const toggleCouponController =
  async (
    req,
    res,
    next
  ) => {
    try {
      const coupon =
        await toggleCouponStatus(
          req.params.couponId
        );

      return res.status(200).json({
        success: true,
        statusCode: 200,
        message:
          "Coupon status updated successfully",
        data: {
          coupon,
        },
      });
    } catch (error) {
      next(error);
    }
  };

// ============================================================
// VALIDATE COUPON
// ============================================================

export const validateCouponController =
  async (
    req,
    res,
    next
  ) => {
    try {
      const result =
        await validateCoupon(
          req.body
        );

      return res.status(200).json({
        success: true,
        statusCode: 200,
        message:
          "Coupon applied successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };