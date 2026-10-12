import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
    getNotifications,
    markNotificationRead,
    markAllNotificationsRead,
} from "../services/notification.service.js";

export const listNotifications = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20 } = req.query;
    const data = await getNotifications(req.user._id, Number(page), Number(limit));
    return res.status(200).json(new ApiResponse(200, data, "Notifications fetched"));
});

export const readNotification = asyncHandler(async (req, res) => {
    const notification = await markNotificationRead(req.params.id, req.user._id);
    return res.status(200).json(new ApiResponse(200, notification, "Notification marked as read"));
});

export const readAllNotifications = asyncHandler(async (req, res) => {
    await markAllNotificationsRead(req.user._id);
    return res.status(200).json(new ApiResponse(200, {}, "All notifications marked as read"));
});
