// import Notification from "./notification.model.js";

// // ============================================================
// // CREATE NOTIFICATION
// // ============================================================

// export const createNotification = async (
//   data
// ) => {
//   return Notification.create(data);
// };

// // ============================================================
// // GET CUSTOMER NOTIFICATIONS
// // ============================================================

// export const findCustomerNotifications =
//   async ({
//     customerId,
//     page = 1,
//     limit = 20,
//     unreadOnly = false,
//   }) => {
//     const skip = (page - 1) * limit;

//     const filter = {
//       customer: customerId,
//     };

//     if (unreadOnly) {
//       filter.isRead = false;
//     }

//     const [notifications, total] =
//       await Promise.all([
//         Notification.find(filter)
//           .populate(
//             "order",
//             "_id orderNumber status totalAmount"
//           )
//           .sort({
//             createdAt: -1,
//           })
//           .skip(skip)
//           .limit(limit)
//           .lean(),

//         Notification.countDocuments(
//           filter
//         ),
//       ]);

//     return {
//       notifications,
//       total,
//       page,
//       limit,
//       totalPages:
//         Math.ceil(total / limit) || 1,
//     };
//   };

// // ============================================================
// // GET UNREAD COUNT
// // ============================================================

// export const countUnreadNotifications =
//   async (customerId) => {
//     return Notification.countDocuments({
//       customer: customerId,
//       isRead: false,
//     });
//   };

// // ============================================================
// // FIND NOTIFICATION
// // ============================================================

// export const findNotificationById =
//   async ({
//     notificationId,
//     customerId,
//   }) => {
//     return Notification.findOne({
//       _id: notificationId,
//       customer: customerId,
//     });
//   };

// // ============================================================
// // MARK ONE AS READ
// // ============================================================

// export const markNotificationAsRead =
//   async ({
//     notificationId,
//     customerId,
//   }) => {
//     return Notification.findOneAndUpdate(
//       {
//         _id: notificationId,
//         customer: customerId,
//       },
//       {
//         $set: {
//           isRead: true,
//           readAt: new Date(),
//         },
//       },
//       {
//         new: true,
//       }
//     );
//   };

// // ============================================================
// // MARK ALL AS READ
// // ============================================================

// export const markAllNotificationsAsRead =
//   async (customerId) => {
//     return Notification.updateMany(
//       {
//         customer: customerId,
//         isRead: false,
//       },
//       {
//         $set: {
//           isRead: true,
//           readAt: new Date(),
//         },
//       }
//     );
//   };

// // ============================================================
// // DELETE ONE
// // ============================================================

// export const deleteNotification =
//   async ({
//     notificationId,
//     customerId,
//   }) => {
//     return Notification.findOneAndDelete({
//       _id: notificationId,
//       customer: customerId,
//     });
//   };

// // ============================================================
// // DELETE ALL READ
// // ============================================================

// export const deleteAllReadNotifications =
//   async (customerId) => {
//     return Notification.deleteMany({
//       customer: customerId,
//       isRead: true,
//     });
//   };


import Notification from "./notification.model.js";

// ============================================================
// CREATE NOTIFICATION
// ============================================================

export const createNotification = async (data) => {
return Notification.create(data);
};

// ============================================================
// GET CUSTOMER NOTIFICATIONS
// ============================================================

export const findCustomerNotifications = async ({
customerId,
page = 1,
limit = 20,
unreadOnly = false,
}) => {
const skip = (page - 1) * limit;

const filter = {
recipientType: "CUSTOMER",
customer: customerId,
};

if (unreadOnly) {
filter.isRead = false;
}

const [notifications, total] = await Promise.all([
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


Notification.countDocuments(filter),


]);

return {
notifications,
total,
page,
limit,
totalPages: Math.ceil(total / limit) || 1,
};
};

// ============================================================
// GET CUSTOMER UNREAD COUNT
// ============================================================

export const countUnreadNotifications = async (
customerId
) => {
return Notification.countDocuments({
recipientType: "CUSTOMER",
customer: customerId,
isRead: false,
});
};

// ============================================================
// FIND CUSTOMER NOTIFICATION
// ============================================================

export const findNotificationById = async ({
notificationId,
customerId,
}) => {
return Notification.findOne({
_id: notificationId,
recipientType: "CUSTOMER",
customer: customerId,
});
};

// ============================================================
// MARK CUSTOMER NOTIFICATION AS READ
// ============================================================

export const markNotificationAsRead = async ({
notificationId,
customerId,
}) => {
return Notification.findOneAndUpdate(
{
_id: notificationId,
recipientType: "CUSTOMER",
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
// MARK ALL CUSTOMER NOTIFICATIONS AS READ
// ============================================================

export const markAllNotificationsAsRead = async (
customerId
) => {
return Notification.updateMany(
{
recipientType: "CUSTOMER",
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
// DELETE CUSTOMER NOTIFICATION
// ============================================================

export const deleteNotification = async ({
notificationId,
customerId,
}) => {
return Notification.findOneAndDelete({
_id: notificationId,
recipientType: "CUSTOMER",
customer: customerId,
});
};

// ============================================================
// DELETE ALL READ CUSTOMER NOTIFICATIONS
// ============================================================

export const deleteAllReadNotifications = async (
customerId
) => {
return Notification.deleteMany({
recipientType: "CUSTOMER",
customer: customerId,
isRead: true,
});
};

// ============================================================
// GET ADMIN NOTIFICATIONS
// ============================================================

export const findAdminNotifications = async ({
page = 1,
limit = 20,
unreadOnly = false,
}) => {
const skip = (page - 1) * limit;

const filter = {
recipientType: "ADMIN",
};

if (unreadOnly) {
filter.isRead = false;
}

const [notifications, total] = await Promise.all([
Notification.find(filter)
.populate(
"customer",
"_id firstName lastName mobile email"
)
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


Notification.countDocuments(filter),


]);

return {
notifications,
total,
page,
limit,
totalPages: Math.ceil(total / limit) || 1,
};
};

// ============================================================
// GET ADMIN UNREAD COUNT
// ============================================================

export const countAdminUnreadNotifications =
async () => {
return Notification.countDocuments({
recipientType: "ADMIN",
isRead: false,
});
};

// ============================================================
// FIND ADMIN NOTIFICATION
// ============================================================

export const findAdminNotificationById = async (
notificationId
) => {
return Notification.findOne({
_id: notificationId,
recipientType: "ADMIN",
});
};

// ============================================================
// MARK ADMIN NOTIFICATION AS READ
// ============================================================

export const markAdminNotificationAsRead = async (
notificationId
) => {
return Notification.findOneAndUpdate(
{
_id: notificationId,
recipientType: "ADMIN",
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
// MARK ALL ADMIN NOTIFICATIONS AS READ
// ============================================================

export const markAllAdminNotificationsAsRead =
async () => {
return Notification.updateMany(
{
recipientType: "ADMIN",
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
// DELETE ADMIN NOTIFICATION
// ============================================================

export const deleteAdminNotification = async (
notificationId
) => {
return Notification.findOneAndDelete({
_id: notificationId,
recipientType: "ADMIN",
});
};

// ============================================================
// DELETE ALL READ ADMIN NOTIFICATIONS
// ============================================================

export const deleteAllReadAdminNotifications =
async () => {
return Notification.deleteMany({
recipientType: "ADMIN",
isRead: true,
});
};

