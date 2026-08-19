import jwt from "jsonwebtoken";
import ApiError from "../utils/ApiError.js";

const authMiddleware = (
  req,
  res,
  next
) => {
  // ==========================================================
  // Get Authorization Header
  // ==========================================================

  const authHeader =
    req.headers.authorization;

  if (!authHeader) {
    return next(
      new ApiError(
        401,
        "Authentication token is required"
      )
    );
  }


  // ==========================================================
  // Validate Bearer Format
  // ==========================================================

  if (
    !authHeader.startsWith("Bearer ")
  ) {
    return next(
      new ApiError(
        401,
        "Invalid authorization format"
      )
    );
  }


  // ==========================================================
  // Extract Token
  // ==========================================================

  const token =
    authHeader.split(" ")[1];

  if (!token) {
    return next(
      new ApiError(
        401,
        "Authentication token is required"
      )
    );
  }


  // ==========================================================
  // Verify JWT
  // ==========================================================

  try {
    const decoded =
      jwt.verify(
        token,
        process.env.JWT_SECRET
      );


    // ========================================================
    // Validate Token Type
    // ========================================================

    if (
      decoded.type !== "customer"
    ) {
      return next(
        new ApiError(
          401,
          "Invalid customer authentication token"
        )
      );
    }


    // ========================================================
    // Validate Customer ID
    // ========================================================

    if (!decoded.id) {
      return next(
        new ApiError(
          401,
          "Customer information missing"
        )
      );
    }


    // ========================================================
    // Attach Customer Information
    // ========================================================

    req.customer = {
      id: decoded.id,
      type: decoded.type,
    };


    // ========================================================
    // Continue
    // ========================================================

    next();

  } catch (error) {
    return next(
      new ApiError(
        401,
        "Invalid or expired authentication token"
      )
    );
  }
};

export default authMiddleware;