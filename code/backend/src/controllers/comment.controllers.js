/**
 * Comment Controllers
 *
 * Supports top-level comments and nested replies (max depth 2).
 * Sorted: newest first.
 * Comments are non-editable.
 * Closed posts reject new comments.
 */

import { Comment } from "../models/comment.model.js";
import { Post } from "../models/post.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * GET /api/v1/posts/:postId/comments
 * Returns all top-level comments with their replies (2 levels deep), newest first.
 */
export const getComments = asyncHandler(async (req, res) => {
    const { postId } = req.params;
    const { page = 1, limit = 30 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const post = await Post.findById(postId).select("_id status");
    if (!post) throw new ApiError(404, "Post not found");

    // Fetch top-level comments (newest first)
    const [topLevel, total] = await Promise.all([
        Comment.find({ post: postId, parent: null })
            .populate("author", "fullName username avatar")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit)),
        Comment.countDocuments({ post: postId, parent: null }),
    ]);

    // Fetch all replies for these top-level comments
    const topLevelIds = topLevel.map((c) => c._id);
    const replies = await Comment.find({ post: postId, parent: { $in: topLevelIds } })
        .populate("author", "fullName username avatar")
        .sort({ createdAt: -1 });

    // Nest replies under their parent
    const result = topLevel.map((comment) => ({
        ...comment.toObject(),
        replies: replies
            .filter((r) => r.parent.toString() === comment._id.toString())
            .map((r) => r.toObject()),
    }));

    return res.status(200).json(
        new ApiResponse(200, { comments: result, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) }, "Comments fetched")
    );
});

/**
 * POST /api/v1/posts/:postId/comments
 * Create a top-level comment or reply.
 * Body: { body, parentId? }
 */
export const createComment = asyncHandler(async (req, res) => {
    const { postId } = req.params;
    const { body, parentId } = req.body;

    if (!body?.trim()) throw new ApiError(400, "Comment body is required");

    const post = await Post.findById(postId).select("_id status");
    if (!post) throw new ApiError(404, "Post not found");
    if (post.status === "closed") {
        throw new ApiError(409, "This post is closed — no new comments are accepted");
    }

    let depth = 0;
    let parentDoc = null;

    if (parentId) {
        parentDoc = await Comment.findById(parentId);
        if (!parentDoc) throw new ApiError(404, "Parent comment not found");
        if (parentDoc.post.toString() !== postId) {
            throw new ApiError(400, "Parent comment does not belong to this post");
        }
        depth = parentDoc.depth + 1;
        if (depth > 2) {
            throw new ApiError(400, "Maximum comment nesting depth (2) reached");
        }
    }

    const comment = await Comment.create({
        post: postId,
        author: req.user._id,
        body: body.trim(),
        parent: parentId || null,
        depth,
    });

    await comment.populate("author", "fullName username avatar");

    return res.status(201).json(new ApiResponse(201, comment, "Comment created"));
});

/**
 * DELETE /api/v1/posts/:postId/comments/:commentId
 * Delete a comment (author or admin).
 */
export const deleteComment = asyncHandler(async (req, res) => {
    const { commentId, postId } = req.params;

    const comment = await Comment.findById(commentId);
    if (!comment) throw new ApiError(404, "Comment not found");
    if (comment.post.toString() !== postId) {
        throw new ApiError(400, "Comment does not belong to this post");
    }

    const isOwner = comment.author.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";
    if (!isOwner && !isAdmin) {
        throw new ApiError(403, "Only the comment author or an admin can delete this comment");
    }

    // Delete replies to this comment as well
    await Comment.deleteMany({ parent: commentId });
    await comment.deleteOne();

    return res.status(200).json(new ApiResponse(200, {}, "Comment deleted"));
});
