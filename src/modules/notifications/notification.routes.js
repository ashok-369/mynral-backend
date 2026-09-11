import express from "express";

import authMiddleware from "../../middlewares/auth.middleware.js";

import {
getNotifications,
getUnreadNotificationCount,
markAsRead,
markAllAsRead,
deleteCustomerNotification,
deleteReadNotifications,
} from "./notification.controller.js";

const router = express.Router();

// ============================================================
// AUTHENTICATION
// ============================================================

router.use(authMiddleware);

// ============================================================
// GET CUSTOMER NOTIFICATIONS
// GET /api/notifications
// ============================================================

router.get(
"/",
getNotifications
);

// ============================================================
// GET UNREAD COUNT
// GET /api/notifications/unread-count
// ============================================================

router.get(
"/unread-count",
getUnreadNotificationCount
);

// ============================================================
// MARK ALL AS READ
// PATCH /api/notifications/read-all
// ============================================================

router.patch(
"/read-all",
markAllAsRead
);

// ============================================================
// DELETE ALL READ NOTIFICATIONS
// DELETE /api/notifications/read
// ============================================================

router.delete(
"/read",
deleteReadNotifications
);

// ============================================================
// MARK ONE AS READ
// PATCH /api/notifications/:id/read
// ============================================================

router.patch(
"/:id/read",
markAsRead
);

// ============================================================
// DELETE ONE NOTIFICATION
// DELETE /api/notifications/:id
// ============================================================

router.delete(
"/:id",
deleteCustomerNotification
);

export default router;
