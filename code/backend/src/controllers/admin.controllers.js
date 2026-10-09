/**
 * Admin Controllers
 * All routes require verifyJWT + requireAdmin middleware.
 */
import { User } from "../models/user.models.js";
import { Post } from "../models/post.model.js";
import { Report } from "../models/report.model.js";
import { Session } from "../models/session.model.js";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { adminDeductCredits } from "../services/credit.service.js";
import { deleteFromCloudinary } from "../utils/cloudinary.js";

// ── Users ─────────────────────────────────────────────────────────────────────

export const listUsers = asyncHandler(async (req, res) => {
    const { q, status, role, page = 1, limit = 30 } = req.query;
    const filter = {};
    if (q) filter.$or = [
        { username: { $regex: q, $options: "i" } },
        { fullName: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
    ];
    if (status) filter.status = status;
    if (role) filter.role = role;
    const skip = (Number(page) - 1) * Number(limit);
    const [users, total] = await Promise.all([
        User.find(filter).select("-refreshToken -googleId").sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
        User.countDocuments(filter),
    ]);
    return res.status(200).json(new ApiResponse(200, { users, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) }, "Users fetched"));
});

export const suspendUser = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { days = 7, reason = "" } = req.body;
    if (userId === req.user._id.toString()) throw new ApiError(400, "Cannot suspend yourself");
    const suspendedUntil = new Date(Date.now() + Number(days) * 24 * 60 * 60 * 1000);
    const user = await User.findByIdAndUpdate(userId, { status: "suspended", suspendedUntil }, { new: true }).select("-refreshToken");
    if (!user) throw new ApiError(404, "User not found");
    return res.status(200).json(new ApiResponse(200, user, `User suspended for ${days} days`));
});

export const banUser = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    if (userId === req.user._id.toString()) throw new ApiError(400, "Cannot ban yourself");
    const user = await User.findByIdAndUpdate(userId, { status: "banned", suspendedUntil: null }, { new: true }).select("-refreshToken");
    if (!user) throw new ApiError(404, "User not found");
    return res.status(200).json(new ApiResponse(200, user, "User permanently banned"));
});

export const liftRestriction = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const user = await User.findByIdAndUpdate(userId, { status: "active", suspendedUntil: null }, { new: true }).select("-refreshToken");
    if (!user) throw new ApiError(404, "User not found");
    return res.status(200).json(new ApiResponse(200, user, "Restriction lifted"));
});

export const adminDeduct = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { amount = 5, reason } = req.body;
    if (!reason?.trim()) throw new ApiError(400, "Reason is required for credit deduction");
    const { user, transaction } = await adminDeductCredits(userId, req.user._id, reason.trim(), Number(amount));
    return res.status(200).json(new ApiResponse(200, { user, transaction }, "Credits deducted"));
});

// ── Posts ─────────────────────────────────────────────────────────────────────

export const adminDeletePost = asyncHandler(async (req, res) => {
    const post = await Post.findById(req.params.postId);
    if (!post) throw new ApiError(404, "Post not found");
    for (const img of post.images || []) {
        if (img.publicId) await deleteFromCloudinary(img.publicId).catch(() => {});
    }
    await Comment.deleteMany({ post: post._id });
    await post.deleteOne();
    return res.status(200).json(new ApiResponse(200, {}, "Post deleted by admin"));
});

// ── Stats ─────────────────────────────────────────────────────────────────────

export const getAdminStats = asyncHandler(async (req, res) => {
    const [totalUsers, totalPosts, pendingReports, activeSessions] = await Promise.all([
        User.countDocuments(),
        Post.countDocuments(),
        Report.countDocuments({ status: "pending" }),
        Session.countDocuments({ status: { $in: ["pending", "accepted", "scheduled"] } }),
    ]);
    return res.status(200).json(new ApiResponse(200, { totalUsers, totalPosts, pendingReports, activeSessions }, "Stats fetched"));
});
