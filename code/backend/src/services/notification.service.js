/**
 * Notification Service
 *
 * Creates in-app notifications only.
 */

import { Notification } from "../models/notification.model.js";

/**
 * Create an in-app notification.
 *
 * @param {object} opts
 * @param {string}   opts.recipientId
 * @param {string}   opts.type         - one of NOTIFICATION_TYPES
 * @param {string}   opts.message      - human-readable text
 * @param {string=}  opts.relatedId    - related entity ObjectId string
 * @param {string=}  opts.relatedModel - "Session" | "Post" | "User" | etc.
 */
export const createNotification = async ({
    recipientId,
    type,
    message,
    relatedId = null,
    relatedModel = null,
}) => {
    const notification = await Notification.create({
        recipient: recipientId,
        type,
        message,
        relatedId: relatedId || null,
        relatedModel: relatedModel || null,
    });

    return notification;
};

/**
 * Mark a single notification as read.
 */
export const markNotificationRead = async (notificationId, userId) => {
    return Notification.findOneAndUpdate(
        { _id: notificationId, recipient: userId },
        { $set: { read: true } },
        { new: true }
    );
};

/**
 * Mark all notifications for a user as read.
 */
export const markAllNotificationsRead = async (userId) => {
    return Notification.updateMany({ recipient: userId, read: false }, { $set: { read: true } });
};

/**
 * Get paginated notifications for a user (newest first).
 */
export const getNotifications = async (userId, page = 1, limit = 20) => {
    const skip = (page - 1) * limit;
    const [notifications, total, unreadCount] = await Promise.all([
        Notification.find({ recipient: userId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
        Notification.countDocuments({ recipient: userId }),
        Notification.countDocuments({ recipient: userId, read: false }),
    ]);
    return { notifications, total, unreadCount, page, totalPages: Math.ceil(total / limit) };
};
