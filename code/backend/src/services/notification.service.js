/**
 * Notification Service
 *
 * Creates in-app notifications and (where applicable) sends emails.
 * Email failures are caught and logged — they never propagate to the caller.
 */

import { Notification } from "../models/notification.model.js";

// ── Email events that warrant an email in addition to in-app notification ───
const EMAIL_NOTIFICATION_TYPES = new Set([
    "session_request",
    "session_accepted",
    "session_rejected",
    "session_completion_request",
    "no_show_reported",
    "admin_action",
]);

/**
 * Create an in-app notification and optionally send an email.
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

    // Fire-and-forget email for high-priority events
    if (EMAIL_NOTIFICATION_TYPES.has(type)) {
        sendEmailNotification({ recipientId, type, message }).catch((err) => {
            console.error(`[email] Failed to send notification email (type=${type}):`, err?.message);
        });
    }

    return notification;
};

/**
 * Send an email notification. Imported lazily to avoid circular deps.
 * Errors are caught by the caller (fire-and-forget).
 */
const sendEmailNotification = async ({ recipientId, type, message }) => {
    try {
        const { sendEmail } = await import("./email.service.js");
        const { User } = await import("../models/user.models.js");

        const user = await User.findById(recipientId).select("email fullName");
        if (!user?.email) return;

        await sendEmail({
            to: user.email,
            subject: getEmailSubject(type),
            text: `Hi ${user.fullName},\n\n${message}\n\nLog in to UniVerse to view details.\n\nhttps://universe.thapar.edu`,
        });
    } catch (err) {
        // Already caught by caller; re-throw so caller can log it
        throw err;
    }
};

const getEmailSubject = (type) => {
    const subjects = {
        session_request: "UniVerse — New session request",
        session_accepted: "UniVerse — Session request accepted",
        session_rejected: "UniVerse — Session request rejected",
        session_completion_request: "UniVerse — Session completion confirmation needed",
        no_show_reported: "UniVerse — No-show reported",
        admin_action: "UniVerse — Account action",
    };
    return subjects[type] || "UniVerse — Notification";
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
