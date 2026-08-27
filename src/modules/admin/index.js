import express from "express";

import adminUserRoutes from "./users/adminUser.routes.js";

const router = express.Router();

// Admin Users
router.use("/users", adminUserRoutes);

export default router;