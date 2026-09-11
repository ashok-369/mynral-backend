import express from "express";

import adminAuthMiddleware from "../../../middlewares/adminAuth.middleware.js";

import {
  getAdminNotifications,
  getAdminUnreadNotificationCount,
  markAdminAsRead,
  markAllAdminAsRead,
  deleteAdminNotificationById,
  deleteReadAdminNotifications,
} from "./adminNotification.controller.js";

const router = express.Router();

router.use(adminAuthMiddleware);

router.get(
  "/",
  getAdminNotifications
);

router.get(
  "/unread-count",
  getAdminUnreadNotificationCount
);

router.patch(
  "/read-all",
  markAllAdminAsRead
);

router.delete(
  "/read",
  deleteReadAdminNotifications
);

router.patch(
  "/:id/read",
  markAdminAsRead
);

router.delete(
  "/:id",
  deleteAdminNotificationById
);

export default router;