import {
findAdminNotifications,
countAdminUnreadNotifications,
findAdminNotificationById,
markAdminNotificationAsRead,
markAllAdminNotificationsAsRead,
deleteAdminNotification,
deleteAllReadAdminNotifications,
} from "../../notifications/notification.repository.js";

// ============================================================
// GET ADMIN NOTIFICATIONS
// GET /api/admin/notifications
// ============================================================

export const getAdminNotifications = async (
req,
res,
next
) => {
try {
const page = Number(req.query.page) || 1;
const limit = Number(req.query.limit) || 20;


const unreadOnly =
  req.query.unreadOnly === "true";

const result = await findAdminNotifications({
  page,
  limit,
  unreadOnly,
});

res.status(200).json({
  success: true,
  statusCode: 200,
  message: "Admin notifications fetched successfully",
  data: result.notifications,
  pagination: {
    total: result.total,
    page: result.page,
    limit: result.limit,
    totalPages: result.totalPages,
  },
});


} catch (error) {
next(error);
}
};

// ============================================================
// GET ADMIN UNREAD COUNT
// GET /api/admin/notifications/unread-count
// ============================================================

export const getAdminUnreadNotificationCount =
async (req, res, next) => {
try {
const count =
await countAdminUnreadNotifications();


  res.status(200).json({
    success: true,
    statusCode: 200,
    message:
      "Admin unread notification count fetched successfully",
    data: {
      count,
    },
  });
} catch (error) {
  next(error);
}


};

// ============================================================
// MARK ONE ADMIN NOTIFICATION AS READ
// PATCH /api/admin/notifications/:id/read
// ============================================================

export const markAdminAsRead = async (
req,
res,
next
) => {
try {
const notification =
await findAdminNotificationById(
req.params.id
);


if (!notification) {
  return res.status(404).json({
    success: false,
    statusCode: 404,
    message: "Notification not found",
  });
}

const updatedNotification =
  await markAdminNotificationAsRead(
    req.params.id
  );

res.status(200).json({
  success: true,
  statusCode: 200,
  message:
    "Admin notification marked as read",
  data: updatedNotification,
});


} catch (error) {
next(error);
}
};

// ============================================================
// MARK ALL ADMIN NOTIFICATIONS AS READ
// PATCH /api/admin/notifications/read-all
// ============================================================

export const markAllAdminAsRead = async (
req,
res,
next
) => {
try {
const result =
await markAllAdminNotificationsAsRead();


res.status(200).json({
  success: true,
  statusCode: 200,
  message:
    "All admin notifications marked as read",
  data: {
    modifiedCount:
      result.modifiedCount,
  },
});


} catch (error) {
next(error);
}
};

// ============================================================
// DELETE ONE ADMIN NOTIFICATION
// DELETE /api/admin/notifications/:id
// ============================================================

export const deleteAdminNotificationById =
async (req, res, next) => {
try {
const notification =
await deleteAdminNotification(
req.params.id
);


  if (!notification) {
    return res.status(404).json({
      success: false,
      statusCode: 404,
      message: "Notification not found",
    });
  }

  res.status(200).json({
    success: true,
    statusCode: 200,
    message:
      "Admin notification deleted successfully",
    data: notification,
  });
} catch (error) {
  next(error);
}


};

// ============================================================
// DELETE ALL READ ADMIN NOTIFICATIONS
// DELETE /api/admin/notifications/read
// ============================================================

export const deleteReadAdminNotifications =
async (req, res, next) => {
try {
const result =
await deleteAllReadAdminNotifications();


  res.status(200).json({
    success: true,
    statusCode: 200,
    message:
      "Read admin notifications deleted successfully",
    data: {
      deletedCount:
        result.deletedCount,
    },
  });
} catch (error) {
  next(error);
}


};
