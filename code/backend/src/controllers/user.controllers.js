/**
 * User Controllers
 *
 * Public profile viewing + saved posts management.
 * Profile editing is handled by auth.controllers.js (PATCH /api/v1/auth/profile).
 */

import { User } from "../models/user.models.js";
import { Post } from "../models/post.model.js";
import { Session } from "../models/session.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * GET /api/v1/users/:username
 * View any user's public profile.
 */
export const getUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findOne({ username: req.params.username })
        .select("-refreshToken -googleId")
        .populate("skillsToTeach", "name category")
        .populate("skillsToLearn", "name category");

    if (!user) throw new ApiError(404, "User not found");

    // Count completed sessions as mentor or learner
    const sessionsCompleted = await Session.countDocuments({
        $or: [{ mentor: user._id }, { learner: user._id }],
        status: "completed",
    });

    return res.status(200).json(
        new ApiResponse(200, { ...user.toObject(), sessionsCompleted }, "User profile fetched")
    );
});

/**
 * GET /api/v1/users
 * Search users by name/username (used in Skill Swap user search tab).
 */
export const searchUsers = asyncHandler(async (req, res) => {
    const { q, branch, year, page = 1, limit = 20 } = req.query;

    const filter = { status: "active" };
    if (q) {
        filter.$or = [
            { username: { $regex: q.trim(), $options: "i" } },
            { fullName: { $regex: q.trim(), $options: "i" } },
        ];
    }
    if (branch) filter.branch = branch;
    if (year) filter.year = Number(year);

    const skip = (Number(page) - 1) * Number(limit);

    const [users, total] = await Promise.all([
        User.find(filter)
            .select("fullName username avatar branch year averageRating totalRatings skillsToTeach skillsToLearn")
            .populate("skillsToTeach", "name category")
            .populate("skillsToLearn", "name category")
            .sort({ averageRating: -1 })
            .skip(skip)
            .limit(Number(limit)),
        User.countDocuments(filter),
    ]);

    return res.status(200).json(
        new ApiResponse(200, { users, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) }, "Users fetched")
    );
});

/**
 * POST /api/v1/users/saved/:postId
 * Save (bookmark) a post.
 */
export const savePost = asyncHandler(async (req, res) => {
    const { postId } = req.params;

    const post = await Post.findById(postId);
    if (!post) throw new ApiError(404, "Post not found");

    const user = await User.findById(req.user._id);

    if (!user.savedPosts) user.savedPosts = [];
    if (user.savedPosts.some((id) => id.toString() === postId)) {
        throw new ApiError(409, "Post already saved");
    }

    await User.findByIdAndUpdate(req.user._id, { $addToSet: { savedPosts: postId } });

    return res.status(200).json(new ApiResponse(200, {}, "Post saved"));
});

/**
 * DELETE /api/v1/users/saved/:postId
 * Unsave a post.
 */
export const unsavePost = asyncHandler(async (req, res) => {
    const { postId } = req.params;
    await User.findByIdAndUpdate(req.user._id, { $pull: { savedPosts: postId } });
    return res.status(200).json(new ApiResponse(200, {}, "Post unsaved"));
});

/**
 * GET /api/v1/users/saved
 * Get the authenticated user's saved posts.
 */
export const getSavedPosts = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const user = await User.findById(req.user._id).select("savedPosts");
    const savedIds = user.savedPosts || [];

    const [posts, total] = await Promise.all([
        Post.find({ _id: { $in: savedIds } })
            .populate("author", "fullName username avatar")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit)),
        savedIds.length,
    ]);

    return res.status(200).json(
        new ApiResponse(200, { posts, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) }, "Saved posts fetched")
    );
});
