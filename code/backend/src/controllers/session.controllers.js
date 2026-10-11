/**
 * Session Controllers
 */
import { Session } from "../models/session.model.js";
import { SessionListing } from "../models/sessionListing.model.js";
import { Skill } from "../models/skill.model.js";
import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { createNotification } from "../services/notification.service.js";
import { awardTeachingCredits, deductLearningCredits } from "../services/credit.service.js";
import { Rating } from "../models/rating.model.js";

/**
 * POST /api/v1/sessions
 * Learner requests a session with a mentor for a skill.
 * Body: { mentorId, skillId, listingId? }
 */
export const requestSession = asyncHandler(async (req, res) => {
    const { mentorId, skillId, listingId } = req.body;
    const learnerId = req.user._id;

    if (!mentorId || !skillId) throw new ApiError(400, "mentorId and skillId are required");
    if (mentorId.toString() === learnerId.toString()) {
        throw new ApiError(400, "You cannot request a session with yourself");
    }

    const [mentor, skill] = await Promise.all([
        User.findById(mentorId).select("fullName username"),
        Skill.findById(skillId).select("name"),
    ]);
    if (!mentor) throw new ApiError(404, "Mentor not found");
    if (!skill) throw new ApiError(404, "Skill not found");

    // Prevent duplicate active requests for same mentor+learner+skill
    const existing = await Session.findOne({
        mentor: mentorId,
        learner: learnerId,
        skill: skillId,
        status: { $in: ["pending", "accepted", "scheduled"] },
    });
    if (existing) {
        throw new ApiError(409, "You already have an active session request for this skill with this mentor");
    }

    const session = await Session.create({
        mentor: mentorId,
        learner: learnerId,
        skill: skillId,
        listing: listingId || null,
        status: "pending",
    });

    // Notify mentor in-app (+ email via notification service if configured)
    await createNotification({
        recipientId: mentorId,
        type: "session_request",
        message: `${req.user.fullName} wants to learn ${skill.name} from you.`,
        relatedId: session._id,
        relatedModel: "Session",
    });

    return res.status(201).json(new ApiResponse(201, session, "Session request sent"));
});

/**
 * GET /api/v1/sessions
 * Get sessions for the logged-in user.
 * Query: role=mentor|learner|all, status=pending|accepted|...
 */
export const getMySessions = asyncHandler(async (req, res) => {
    const { role = "all", status } = req.query;
    const userId = req.user._id;

    const filter = {};
    if (role === "mentor") filter.mentor = userId;
    else if (role === "learner") filter.learner = userId;
    else filter.$or = [{ mentor: userId }, { learner: userId }];

    if (status) filter.status = status;

    const sessions = await Session.find(filter)
        .populate("mentor", "fullName username avatar averageRating")
        .populate("learner", "fullName username avatar")
        .populate("skill", "name category")
        .sort({ createdAt: -1 });

    return res.status(200).json(new ApiResponse(200, sessions, "Sessions fetched"));
});

/**
 * GET /api/v1/sessions/:id
 */
export const getSession = asyncHandler(async (req, res) => {
    const session = await Session.findById(req.params.id)
        .populate("mentor", "fullName username avatar averageRating credits")
        .populate("learner", "fullName username avatar credits")
        .populate("skill", "name category");

    if (!session) throw new ApiError(404, "Session not found");

    const userId = req.user._id.toString();
    if (
        session.mentor._id.toString() !== userId &&
        session.learner._id.toString() !== userId
    ) {
        throw new ApiError(403, "You are not a participant in this session");
    }

    return res.status(200).json(new ApiResponse(200, session, "Session fetched"));
});

/**
 * PATCH /api/v1/sessions/:id/respond
 * Mentor accepts or rejects a pending session request.
 * Body: { action: "accept" | "reject" }
 */
export const respondToSession = asyncHandler(async (req, res) => {
    const { action } = req.body;
    if (!["accept", "reject"].includes(action)) {
        throw new ApiError(400, "action must be 'accept' or 'reject'");
    }

    const session = await Session.findById(req.params.id);
    if (!session) throw new ApiError(404, "Session not found");
    if (session.mentor.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Only the mentor can respond to a session request");
    }
    if (session.status !== "pending") {
        throw new ApiError(409, `Session is already ${session.status}`);
    }

    session.status = action === "accept" ? "accepted" : "rejected";
    await session.save();

    const notifType = action === "accept" ? "session_accepted" : "session_rejected";
    await createNotification({
        recipientId: session.learner,
        type: notifType,
        message: `${req.user.fullName} has ${action === "accept" ? "accepted" : "rejected"} your session request.`,
        relatedId: session._id,
        relatedModel: "Session",
    });

    return res.status(200).json(new ApiResponse(200, session, `Session ${action === "accept" ? "accepted" : "rejected"}`));
});

/**
 * PATCH /api/v1/sessions/:id/cancel
 */
export const cancelSession = asyncHandler(async (req, res) => {
    const session = await Session.findById(req.params.id);
    if (!session) throw new ApiError(404, "Session not found");

    const userId = req.user._id.toString();
    if (session.mentor.toString() !== userId && session.learner.toString() !== userId) {
        throw new ApiError(403, "You are not a participant in this session");
    }
    if (["completed", "cancelled", "rejected"].includes(session.status)) {
        throw new ApiError(409, `Session is already ${session.status}`);
    }

    session.status = "cancelled";
    session.cancelledBy = req.user._id;
    session.cancellationReason = req.body.reason?.trim() || "";
    await session.save();

    return res.status(200).json(new ApiResponse(200, session, "Session cancelled"));
});

/**
 * PATCH /api/v1/sessions/:id/complete
 * Either participant marks that the session has been completed from their side.
 * Requires the other participant to also confirm via /confirm-complete.
 */
export const markSessionComplete = asyncHandler(async (req, res) => {
    const session = await Session.findById(req.params.id);
    if (!session) throw new ApiError(404, "Session not found");

    const userId = req.user._id.toString();
    const isMentor = session.mentor.toString() === userId;
    const isLearner = session.learner.toString() === userId;

    if (!isMentor && !isLearner) throw new ApiError(403, "You are not a participant in this session");
    if (!["accepted", "scheduled"].includes(session.status)) {
        throw new ApiError(409, `Cannot mark a ${session.status} session as complete`);
    }

    if (isMentor) {
        if (session.mentorConfirmed) throw new ApiError(409, "You have already marked this session complete");
        session.mentorConfirmed = true;
    } else {
        if (session.learnerConfirmed) throw new ApiError(409, "You have already marked this session complete");
        session.learnerConfirmed = true;
    }

    // If both have now confirmed, complete immediately
    if (session.mentorConfirmed && session.learnerConfirmed) {
        return finalizeCompletion(session, req.user, res);
    }

    // Record who requested first
    if (!session.completionRequestedBy) {
        session.completionRequestedBy = req.user._id;
        session.completionRequestedAt = new Date();
    }

    await session.save();

    // Notify the OTHER participant
    const otherParticipantId = isMentor ? session.learner : session.mentor;
    await createNotification({
        recipientId: otherParticipantId,
        type: "session_completion_request",
        message: `${req.user.fullName} has marked the session as complete. Please confirm to transfer credits.`,
        relatedId: session._id,
        relatedModel: "Session",
    });

    return res.status(200).json(new ApiResponse(200, session, "Marked as complete. Waiting for the other participant to confirm."));
});

/**
 * PATCH /api/v1/sessions/:id/confirm-complete
 * Second participant confirms completion → credits transferred.
 */
export const confirmCompletion = asyncHandler(async (req, res) => {
    const session = await Session.findById(req.params.id);
    if (!session) throw new ApiError(404, "Session not found");

    const userId = req.user._id.toString();
    const isMentor = session.mentor.toString() === userId;
    const isLearner = session.learner.toString() === userId;

    if (!isMentor && !isLearner) throw new ApiError(403, "You are not a participant in this session");
    if (session.status === "completed") throw new ApiError(409, "Session is already completed");
    if (!["accepted", "scheduled"].includes(session.status)) {
        throw new ApiError(409, `Cannot confirm completion of a ${session.status} session`);
    }

    if (isMentor) {
        if (session.mentorConfirmed) throw new ApiError(409, "You have already confirmed completion");
        session.mentorConfirmed = true;
    } else {
        if (session.learnerConfirmed) throw new ApiError(409, "You have already confirmed completion");
        session.learnerConfirmed = true;
    }

    if (session.mentorConfirmed && session.learnerConfirmed) {
        return finalizeCompletion(session, req.user, res);
    }

    await session.save();
    return res.status(200).json(new ApiResponse(200, session, "Confirmation recorded. Waiting for the other participant."));
});

// Internal helper — finalizes a session when both parties have confirmed
async function finalizeCompletion(session, requestingUser, res) {
    session.status = "completed";
    session.completedAt = new Date();
    await session.save();

    // Transfer credits (idempotent via unique transaction index)
    try {
        await awardTeachingCredits(session.mentor, session._id);
    } catch (err) {
        if (!err.message?.includes("already been awarded")) throw err;
    }
    try {
        await deductLearningCredits(session.learner, session._id);
    } catch (err) {
        if (!err.message?.includes("already been deducted")) throw err;
    }

    // Notify both participants
    const populated = await Session.findById(session._id)
        .populate("mentor", "fullName")
        .populate("learner", "fullName")
        .populate("skill", "name");

    await createNotification({
        recipientId: session.mentor,
        type: "session_completed",
        message: `Session for ${populated.skill?.name || "a skill"} is now complete. You earned +10 credits! You can now rate ${populated.learner?.fullName}.`,
        relatedId: session._id,
        relatedModel: "Session",
    });
    await createNotification({
        recipientId: session.learner,
        type: "session_completed",
        message: `Session for ${populated.skill?.name || "a skill"} is now complete. 5 credits have been deducted. You can now rate ${populated.mentor?.fullName}.`,
        relatedId: session._id,
        relatedModel: "Session",
    });

    return res.status(200).json(new ApiResponse(200, populated, "Session completed. Credits transferred. Rating is now available."));
}

/**
 * POST /api/v1/sessions/:id/no-show
 * Report a no-show for a scheduled session.
 */
export const reportNoShow = asyncHandler(async (req, res) => {
    const session = await Session.findById(req.params.id);
    if (!session) throw new ApiError(404, "Session not found");

    const userId = req.user._id.toString();
    if (session.mentor.toString() !== userId && session.learner.toString() !== userId) {
        throw new ApiError(403, "You are not a participant in this session");
    }
    if (!["accepted", "scheduled"].includes(session.status)) {
        throw new ApiError(409, "No-show can only be reported for accepted/scheduled sessions");
    }
    if (session.noShowReportedBy) {
        throw new ApiError(409, "A no-show has already been reported for this session");
    }

    session.noShowReportedBy = req.user._id;
    await session.save();

    // Notify admin via the report system
    await import("../models/report.model.js").then(async ({ Report }) => {
        await Report.create({
            reporter: req.user._id,
            targetType: "user",
            targetId: session.mentor.toString() === userId ? session.learner : session.mentor,
            reason: `No-show reported for session ${session._id}`,
        }).catch(() => {}); // non-fatal
    });

    return res.status(200).json(new ApiResponse(200, {}, "No-show reported. Admin will review the case."));
});

// ── Session Listings ─────────────────────────────────────────────────────────

/**
 * POST /api/v1/sessions/listings
 * Mentor creates a session listing.
 */
export const createListing = asyncHandler(async (req, res) => {
    const { skillId, title, description, mode, availability } = req.body;
    if (!skillId || !title?.trim() || !mode) throw new ApiError(400, "skillId, title, and mode are required");
    if (!["Online", "Offline", "Both"].includes(mode)) throw new ApiError(400, "mode must be Online, Offline, or Both");

    const skill = await Skill.findById(skillId);
    if (!skill) throw new ApiError(404, "Skill not found");

    const listing = await SessionListing.create({
        mentor: req.user._id,
        skill: skillId,
        title: title.trim(),
        description: description?.trim() || "",
        mode,
        availability: availability || [],
    });

    await listing.populate("skill", "name category");
    return res.status(201).json(new ApiResponse(201, listing, "Session listing created"));
});

/**
 * GET /api/v1/sessions/listings
 * Get active session listings, optionally filtered by skillId or mentorId.
 */
export const getListings = asyncHandler(async (req, res) => {
    const { skillId, mentorId, page = 1, limit = 20 } = req.query;
    const filter = { isActive: true };
    if (skillId) filter.skill = skillId;
    if (mentorId) filter.mentor = mentorId;

    const skip = (Number(page) - 1) * Number(limit);
    const [listings, total] = await Promise.all([
        SessionListing.find(filter)
            .populate("mentor", "fullName username avatar averageRating")
            .populate("skill", "name category")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit)),
        SessionListing.countDocuments(filter),
    ]);

    return res.status(200).json(
        new ApiResponse(200, { listings, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) }, "Listings fetched")
    );
});

/**
 * PATCH /api/v1/sessions/listings/:listingId
 */
export const updateListing = asyncHandler(async (req, res) => {
    const listing = await SessionListing.findById(req.params.listingId);
    if (!listing) throw new ApiError(404, "Listing not found");
    if (listing.mentor.toString() !== req.user._id.toString()) throw new ApiError(403, "Not your listing");

    const allowed = ["title", "description", "mode", "availability", "isActive"];
    for (const key of allowed) {
        if (req.body[key] !== undefined) listing[key] = req.body[key];
    }
    await listing.save();
    return res.status(200).json(new ApiResponse(200, listing, "Listing updated"));
});

/**
 * DELETE /api/v1/sessions/listings/:listingId
 */
export const deleteListing = asyncHandler(async (req, res) => {
    const listing = await SessionListing.findById(req.params.listingId);
    if (!listing) throw new ApiError(404, "Listing not found");
    if (listing.mentor.toString() !== req.user._id.toString() && req.user.role !== "admin") {
        throw new ApiError(403, "Not authorized");
    }
    await listing.deleteOne();
    return res.status(200).json(new ApiResponse(200, {}, "Listing deleted"));
});

// ── Ratings ───────────────────────────────────────────────────────────────────

/**
 * POST /api/v1/sessions/:id/rate
 * Rate the other participant after a completed session.
 */
export const rateSession = asyncHandler(async (req, res) => {
    const { stars } = req.body;
    if (!Number.isInteger(stars) || stars < 1 || stars > 5) throw new ApiError(400, "stars must be an integer between 1 and 5");

    const session = await Session.findById(req.params.id);
    if (!session) throw new ApiError(404, "Session not found");
    if (session.status !== "completed") throw new ApiError(409, "You can only rate after a session is completed");

    const userId = req.user._id.toString();
    const isMentor = session.mentor.toString() === userId;
    const isLearner = session.learner.toString() === userId;
    if (!isMentor && !isLearner) throw new ApiError(403, "You are not a participant in this session");

    // Determine ratee
    const rateeId = isMentor ? session.learner : session.mentor;

    // Check if already rated
    const existing = await Rating.findOne({ session: session._id, rater: req.user._id });
    if (existing) throw new ApiError(409, "You have already rated this session");

    const rating = await Rating.create({
        session: session._id,
        rater: req.user._id,
        ratee: rateeId,
        stars,
    });

    // Update ratee's averageRating and totalRatings
    const ratee = await User.findById(rateeId);
    const newTotal = ratee.totalRatings + 1;
    const newAvg = ((ratee.averageRating * ratee.totalRatings) + stars) / newTotal;
    await User.findByIdAndUpdate(rateeId, { averageRating: newAvg, totalRatings: newTotal });

    // Mark rated flags
    if (isMentor) session.mentorRated = true;
    else session.learnerRated = true;
    await session.save();

    return res.status(201).json(new ApiResponse(201, rating, "Rating submitted"));
});
