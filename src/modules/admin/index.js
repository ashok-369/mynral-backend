import express from "express";

import adminUserRoutes from "./users/adminUser.routes.js";
import adminProductRoutes from "./products/adminProduct.routes.js";


const router = express.Router();

// Admin Users
router.use("/users", adminUserRoutes);

router.use(
  "/products",
  adminProductRoutes
);


export default router;