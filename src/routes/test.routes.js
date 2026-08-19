import express from "express";
import { body } from "express-validator";

import validate from "../middlewares/validation.middleware.js";
import asyncHandler from "../utils/asyncHandler.js";
import successResponse from "../utils/response.js";

const router = express.Router();

router.post(
  "/validation",

  [
    body("name")
      .trim()
      .notEmpty()
      .withMessage("Name is required")
      .isLength({ min: 2 })
      .withMessage("Name must be at least 2 characters"),

    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Enter a valid email address"),
  ],

  validate,

  asyncHandler(async (req, res) => {
    return successResponse(res, {
      statusCode: 200,
      message: "Validation successful",
      data: {
        name: req.body.name,
        email: req.body.email,
      },
    });
  })
);

export default router;