import express from "express";

import productRoutes from "./product.routes.js";
import variantRoutes from "./variant.routes.js";

const router = express.Router();

// Product APIs
router.use("/products", productRoutes);

// Variant APIs
router.use("/variants", variantRoutes);

export default router;