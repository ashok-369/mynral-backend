import Notification from "./notification.model.js";

// ============================================================
// CREATE NOTIFICATION
// ============================================================

export const createNotification = async (
  data
) => {
  return Notification.create(data);
};

// ============================================================
// GET CUSTOMER NOTIFICATIONS
// ============================================================

export const findCustomerNotifications =
  async ({
    customerId,
    page = 1,
    limit = 20,
    unreadOnly = false,
  }) => {
    const skip = (page - 1) * limit;

    const filter = {
      customer: customerId,
    };

    if (unreadOnly) {
      filter.isRead = false;
    }

    const [notifications, total] =
      await Promise.all([
        Notification.find(filter)
          .populate(
            "order",
            "_id orderNumber status totalAmount"
          )
          .sort({
            createdAt: -1,
          })
          .skip(skip)
          .limit(limit)
          .lean(),

        Notification.countDocuments(
          filter
        ),
      ]);

    return {
      notifications,
      total,
      page,
      limit,
      totalPages:
        Math.ceil(total / limit) || 1,
    };
  };

// ============================================================
// GET UNREAD COUNT
// ============================================================

export const countUnreadNotifications =
  async (customerId) => {
    return Notification.countDocuments({
      customer: customerId,
      isRead: false,
    });
  };

// ============================================================
// FIND NOTIFICATION
// ============================================================

export const findNotificationById =
  async ({
    notificationId,
    customerId,
  }) => {
    return Notification.findOne({
      _id: notificationId,
      customer: customerId,
    });
  };

// ============================================================
// MARK ONE AS READ
// ============================================================

export const markNotificationAsRead =
  async ({
    notificationId,
    customerId,
  }) => {
    return Notification.findOneAndUpdate(
      {
        _id: notificationId,
        customer: customerId,
      },
      {
        $set: {
          isRead: true,
          readAt: new Date(),
        },
      },
      {
        new: true,
      }
    );
  };

// ============================================================
// MARK ALL AS READ
// ============================================================

export const markAllNotificationsAsRead =
  async (customerId) => {
    return Notification.updateMany(
      {
        customer: customerId,
        isRead: false,
      },
      {
        $set: {
          isRead: true,
          readAt: new Date(),
        },
      }
    );
  };

// ============================================================
// DELETE ONE
// ============================================================

export const deleteNotification =
  async ({
    notificationId,
    customerId,
  }) => {
    return Notification.findOneAndDelete({
      _id: notificationId,
      customer: customerId,
    });
  };

// ============================================================
// DELETE ALL READ
// ============================================================

export const deleteAllReadNotifications =
  async (customerId) => {
    return Notification.deleteMany({
      customer: customerId,
      isRead: true,
    });
  };