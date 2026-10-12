import { Report } from "../models/report.model.js";
import { Post } from "../models/post.model.js";
import { Comment } from "../models/comment.model.js";
import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const TARGET_MODELS = { post: Post, comment: Comment, user: User };

/**
 * POST /api/v1/reports
 * File a report against a post, comment, or user.
 */
export const createReport = asyncHandler(async (req, res) => {
    const { targetType, targetId, reason } = req.body;

    if (!["post", "comment", "user"].includes(targetType)) {
        throw new ApiError(400, "targetType must be post, comment, or user");
    }
    if (!targetId) throw new ApiError(400, "targetId is required");
    if (!reason?.trim()) throw new ApiError(400, "Reason is required");

    // Verify target exists
    const Model = TARGET_MODELS[targetType];
    const target = await Model.findById(targetId);
    if (!target) throw new ApiError(404, `${targetType} not found`);

    // Cannot report yourself
    if (targetType === "user" && targetId === req.user._id.toString()) {
        throw new ApiError(400, "You cannot report yourself");
    }

    try {
        const report = await Report.create({
            reporter: req.user._id,
            targetType,
            targetId,
            reason: reason.trim(),
        });
        return res.status(201).json(new ApiResponse(201, report, "Report submitted"));
    } catch (err) {
        if (err?.code === 11000) {
            throw new ApiError(409, "You have already filed a report against this content");
        }
        throw err;
    }
});

/**
 * GET /api/v1/reports (admin only)
 */
export const listReports = asyncHandler(async (req, res) => {
    const { status, targetType, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (targetType) filter.targetType = targetType;

    const skip = (Number(page) - 1) * Number(limit);
    const [reports, total] = await Promise.all([
        Report.find(filter)
            .populate("reporter", "fullName username avatar")
            .populate("resolvedBy", "fullName username")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit)),
        Report.countDocuments(filter),
    ]);

    return res.status(200).json(
        new ApiResponse(200, { reports, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) }, "Reports fetched")
    );
});

/**
 * PATCH /api/v1/reports/:id (admin only)
 * Resolve or dismiss a report.
 */
export const resolveReport = asyncHandler(async (req, res) => {
    const { status, adminNotes } = req.body;
    if (!["reviewed", "dismissed"].includes(status)) {
        throw new ApiError(400, "status must be reviewed or dismissed");
    }

    const report = await Report.findById(req.params.id);
    if (!report) throw new ApiError(404, "Report not found");

    report.status = status;
    report.resolvedBy = req.user._id;
    report.resolvedAt = new Date();
    if (adminNotes) report.adminNotes = adminNotes.trim();
    await report.save();

    return res.status(200).json(new ApiResponse(200, report, "Report updated"));
});
