import {
findCustomerNotifications,
countUnreadNotifications,
findNotificationById,
markNotificationAsRead,
markAllNotificationsAsRead,
deleteNotification,
deleteAllReadNotifications,
} from "./notification.repository.js";

// ============================================================
// GET CUSTOMER NOTIFICATIONS
// ============================================================

export const getNotifications = async (
req,
res,
next
) => {
try {
const customerId = req.customer?.id || req.user?.id;

    if (!customerId) {
      return res.status(401).json({
        success: false,
        statusCode: 401,
        message: "Customer authentication required",
      });
    }


const page = Number(req.query.page) || 1;

const limit = Number(req.query.limit) || 20;

const unreadOnly =
  req.query.unreadOnly === "true";

const result =
  await findCustomerNotifications({
    customerId,
    page,
    limit,
    unreadOnly,
  });

res.status(200).json({
  success: true,
  statusCode: 200,
  message:
    "Notifications fetched successfully",
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
// GET UNREAD NOTIFICATION COUNT
// ============================================================

export const getUnreadNotificationCount =
async (req, res, next) => {
try {
const customerId = req.customer?.id || req.user?.id;

    if (!customerId) {
      return res.status(401).json({
        success: false,
        statusCode: 401,
        message: "Customer authentication required",
      });
    }


  const count =
    await countUnreadNotifications(
      customerId
    );

  res.status(200).json({
    success: true,
    statusCode: 200,
    message:
      "Unread notification count fetched successfully",
    data: {
      count,
    },
  });
} catch (error) {
  next(error);
}


};

// ============================================================
// MARK ONE NOTIFICATION AS READ
// ============================================================

export const markAsRead = async (
req,
res,
next
) => {
try {
const customerId = req.customer?.id || req.user?.id;

    if (!customerId) {
      return res.status(401).json({
        success: false,
        statusCode: 401,
        message: "Customer authentication required",
      });
    }


const notification =
  await findNotificationById({
    notificationId: req.params.id,
    customerId,
  });

if (!notification) {
  return res.status(404).json({
    success: false,
    statusCode: 404,
    message: "Notification not found",
  });
}

const updatedNotification =
  await markNotificationAsRead({
    notificationId: req.params.id,
    customerId,
  });

res.status(200).json({
  success: true,
  statusCode: 200,
  message:
    "Notification marked as read",
  data: updatedNotification,
});


} catch (error) {
next(error);
}
};

// ============================================================
// MARK ALL NOTIFICATIONS AS READ
// ============================================================

export const markAllAsRead = async (
req,
res,
next
) => {
try {
const customerId = req.customer?.id || req.user?.id;

    if (!customerId) {
      return res.status(401).json({
        success: false,
        statusCode: 401,
        message: "Customer authentication required",
      });
    }

const result =
  await markAllNotificationsAsRead(
    customerId
  );

res.status(200).json({
  success: true,
  statusCode: 200,
  message:
    "All notifications marked as read",
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
// DELETE ONE NOTIFICATION
// ============================================================

export const deleteCustomerNotification =
async (req, res, next) => {
try {
const customerId = req.customer?.id || req.user?.id;

    if (!customerId) {
      return res.status(401).json({
        success: false,
        statusCode: 401,
        message: "Customer authentication required",
      });
    }


  const notification =
    await deleteNotification({
      notificationId: req.params.id,
      customerId,
    });

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
      "Notification deleted successfully",
    data: notification,
  });
} catch (error) {
  next(error);
}


};

// ============================================================
// DELETE ALL READ NOTIFICATIONS
// ============================================================

export const deleteReadNotifications =
async (req, res, next) => {
try {
const customerId = req.customer?.id || req.user?.id;

    if (!customerId) {
      return res.status(401).json({
        success: false,
        statusCode: 401,
        message: "Customer authentication required",
      });
    }


  const result =
    await deleteAllReadNotifications(
      customerId
    );

  res.status(200).json({
    success: true,
    statusCode: 200,
    message:
      "Read notifications deleted successfully",
    data: {
      deletedCount:
        result.deletedCount,
    },
  });
} catch (error) {
  next(error);
}


};
