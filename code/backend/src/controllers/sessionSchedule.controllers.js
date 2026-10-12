/**
 * Session Schedule Controllers
 * Handles scheduling details for accepted sessions.
 */

import { Session } from "../models/session.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { createNotification } from "../services/notification.service.js";

/**
 * PATCH /api/v1/session-schedule/:id
 * Update scheduling details for an accepted session.
 * Body: { scheduledDate, scheduledTime, durationMinutes, mode, meetingLink }
 */
export const updateSessionSchedule = asyncHandler(async (req, res) => {
    const session = await Session.findById(req.params.id)
        .populate("mentor", "fullName")
        .populate("learner", "fullName")
        .populate("skill", "name");

    if (!session) throw new ApiError(404, "Session not found");

    const userId = req.user._id.toString();
    const isMentor = session.mentor._id.toString() === userId;
    const isLearner = session.learner._id.toString() === userId;

    if (!isMentor && !isLearner) {
        throw new ApiError(403, "You are not a participant in this session");
    }

    if (!["accepted", "scheduled"].includes(session.status)) {
        throw new ApiError(409, "Can only update schedule for accepted or scheduled sessions");
    }

    const { scheduledDate, scheduledTime, durationMinutes, mode, meetingLink } = req.body;

    // Update fields if provided
    if (scheduledDate !== undefined) {
        if (scheduledDate && new Date(scheduledDate) < new Date()) {
            throw new ApiError(400, "Scheduled date cannot be in the past");
        }
        session.scheduledDate = scheduledDate ? new Date(scheduledDate) : null;
    }

    if (scheduledTime !== undefined) {
        if (scheduledTime && !/^([01]\d|2[0-3]):([0-5]\d)$/.test(scheduledTime)) {
            throw new ApiError(400, "Invalid time format. Use HH:MM (24-hour format)");
        }
        session.scheduledTime = scheduledTime?.trim() || null;
    }

    if (durationMinutes !== undefined) {
        if (durationMinutes && (durationMinutes < 15 || durationMinutes > 300)) {
            throw new ApiError(400, "Duration must be between 15 and 300 minutes");
        }
        session.durationMinutes = durationMinutes || null;
    }

    if (mode !== undefined) {
        if (mode && !["Online", "Offline"].includes(mode)) {
            throw new ApiError(400, "Mode must be 'Online' or 'Offline'");
        }
        session.mode = mode || null;
    }

    if (meetingLink !== undefined) {
        session.meetingLink = meetingLink?.trim() || null;
    }

    // If all required fields are now filled, move to scheduled status
    if (
        session.status === "accepted" &&
        session.scheduledDate &&
        session.scheduledTime &&
        session.mode
    ) {
        session.status = "scheduled";
    }

    await session.save();

    // Notify the other participant
    const otherParticipantId = isMentor ? session.learner._id : session.mentor._id;
    const otherParticipantName = isMentor ? session.learner.fullName : session.mentor.fullName;

    await createNotification({
        recipientId: otherParticipantId,
        type: "session_scheduled",
        message: `${req.user.fullName} updated the schedule for your ${session.skill?.name || "session"}. Check the session details.`,
        relatedId: session._id,
        relatedModel: "Session",
    });

    return res.status(200).json(
        new ApiResponse(200, session, session.status === "scheduled" 
            ? "Session scheduled successfully" 
            : "Session details updated")
    );
});

/**
 * GET /api/v1/session-schedule/:id
 * Get current scheduling details for a session.
 */
export const getSessionSchedule = asyncHandler(async (req, res) => {
    const session = await Session.findById(req.params.id)
        .populate("mentor", "fullName username avatar")
        .populate("learner", "fullName username avatar")
        .populate("skill", "name category")
        .select("scheduledDate scheduledTime durationMinutes mode meetingLink status");

    if (!session) throw new ApiError(404, "Session not found");

    const userId = req.user._id.toString();
    if (
        session.mentor._id.toString() !== userId &&
        session.learner._id.toString() !== userId
    ) {
        throw new ApiError(403, "You are not a participant in this session");
    }

    return res.status(200).json(new ApiResponse(200, session, "Schedule details fetched"));
});
