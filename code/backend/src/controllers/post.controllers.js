/**
 * Post Controllers
 *
 * Handles all three Utility Channels: general, borrow_lend, lost_found.
 */

import { Post } from "../models/post.model.js";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";

const VALID_CHANNELS = ["general", "borrow_lend", "lost_found"];

// ── Helpers ───────────────────────────────────────────────────────────────────

const assertPostOpen = (post) => {
    if (post.status === "closed") {
        throw new ApiError(409, "This post is closed and no longer accepts interactions");
    }
};

const assertPostOwner = (post, userId) => {
    if (post.author.toString() !== userId.toString()) {
        throw new ApiError(403, "You are not the author of this post");
    }
};

// ── CRUD ──────────────────────────────────────────────────────────────────────

/**
 * GET /api/v1/posts?channel=general&page=1&limit=20&sort=new
 */
export const listPosts = asyncHandler(async (req, res) => {
    const { channel, status = "open", sort = "new", page = 1, limit = 20, tag } = req.query;

    if (channel && !VALID_CHANNELS.includes(channel)) {
        throw new ApiError(400, `channel must be one of: ${VALID_CHANNELS.join(", ")}`);
    }

    const filter = {};
    if (channel) filter.channel = channel;
    if (status && ["open", "closed"].includes(status)) filter.status = status;
    if (tag) filter.tag = tag.toUpperCase();

    const sortOrder = sort === "top" ? { upvotes: -1, createdAt: -1 } : { createdAt: -1 };
    const skip = (Number(page) - 1) * Number(limit);

    const [posts, total] = await Promise.all([
        Post.find(filter)
            .populate("author", "fullName username avatar branch year")
            .sort(sortOrder)
            .skip(skip)
            .limit(Number(limit)),
        Post.countDocuments(filter),
    ]);

    return res.status(200).json(
        new ApiResponse(200, { posts, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) }, "Posts fetched")
    );
});

/**
 * GET /api/v1/posts/:id
 */
export const getPost = asyncHandler(async (req, res) => {
    const post = await Post.findById(req.params.id)
        .populate("author", "fullName username avatar branch year")
        .populate("closedBy", "fullName username");

    if (!post) throw new ApiError(404, "Post not found");

    return res.status(200).json(new ApiResponse(200, post, "Post fetched"));
});

/**
 * POST /api/v1/posts
 * Create a new post. Images are multipart; max 5 files.
 */
export const createPost = asyncHandler(async (req, res) => {
    const { channel, title, body, tag, location, itemDate } = req.body;

    if (!VALID_CHANNELS.includes(channel)) {
        throw new ApiError(400, `channel must be one of: ${VALID_CHANNELS.join(", ")}`);
    }
    if (!title?.trim()) throw new ApiError(400, "Title is required");
    if (!body?.trim()) throw new ApiError(400, "Body is required");

    // Tag validation
    if (channel === "borrow_lend" && !["LEND", "BORROW"].includes(tag?.toUpperCase())) {
        throw new ApiError(400, "Borrow/Lend posts require tag LEND or BORROW");
    }
    if (channel === "lost_found" && !["LOST", "FOUND"].includes(tag?.toUpperCase())) {
        throw new ApiError(400, "Lost & Found posts require tag LOST or FOUND");
    }

    // Image uploads (Borrow/Lend and Lost & Found only)
    const files = req.files || [];
    if (channel === "general" && files.length > 0) {
        throw new ApiError(400, "General channel posts do not support image uploads");
    }
    if (files.length > 5) {
        throw new ApiError(400, "Maximum 5 images per post");
    }

    const images = [];
    for (const file of files) {
        const result = await uploadOnCloudinary(file.path, {
            folder: "universe/posts",
            resource_type: "image",
        });
        if (!result) throw new ApiError(502, "Failed to upload one or more images");
        images.push({ url: result.secure_url, publicId: result.public_id });
    }

    const post = await Post.create({
        author: req.user._id,
        channel,
        title: title.trim(),
        body: body.trim(),
        tag: tag ? tag.toUpperCase() : null,
        images,
        location: location?.trim() || "",
        itemDate: itemDate ? new Date(itemDate) : null,
    });

    await post.populate("author", "fullName username avatar branch year");

    return res.status(201).json(new ApiResponse(201, post, "Post created"));
});

/**
 * PATCH /api/v1/posts/:id/close
 * Close/resolve a post (author or admin).
 */
export const closePost = asyncHandler(async (req, res) => {
    const post = await Post.findById(req.params.id);
    if (!post) throw new ApiError(404, "Post not found");

    if (post.channel === "general") {
        throw new ApiError(400, "General posts do not have a close/resolve lifecycle");
    }

    assertPostOpen(post);

    const isOwner = post.author.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";
    if (!isOwner && !isAdmin) {
        throw new ApiError(403, "Only the post author or an admin can close this post");
    }

    post.status = "closed";
    post.closedAt = new Date();
    post.closedBy = req.user._id;
    await post.save();

    return res.status(200).json(new ApiResponse(200, post, "Post closed/resolved"));
});

/**
 * DELETE /api/v1/posts/:id
 * Delete a post (author or admin). Also cleans up Cloudinary images.
 */
export const deletePost = asyncHandler(async (req, res) => {
    const post = await Post.findById(req.params.id);
    if (!post) throw new ApiError(404, "Post not found");

    const isOwner = post.author.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";
    if (!isOwner && !isAdmin) {
        throw new ApiError(403, "Only the post author or an admin can delete this post");
    }

    // Delete associated Cloudinary images
    for (const img of post.images || []) {
        if (img.publicId) {
            await deleteFromCloudinary(img.publicId).catch((err) =>
                console.error(`[cloudinary] Failed to delete image ${img.publicId}:`, err?.message)
            );
        }
    }

    // Delete associated comments
    await Comment.deleteMany({ post: post._id });

    await post.deleteOne();

    return res.status(200).json(new ApiResponse(200, {}, "Post deleted"));
});

// ── Voting (General channel only) ─────────────────────────────────────────────

/**
 * POST /api/v1/posts/:id/vote
 * Body: { vote: "up" | "down" }
 */
export const votePost = asyncHandler(async (req, res) => {
    const { vote } = req.body;
    if (!["up", "down"].includes(vote)) throw new ApiError(400, "vote must be 'up' or 'down'");

    const post = await Post.findById(req.params.id);
    if (!post) throw new ApiError(404, "Post not found");
    if (post.channel !== "general") throw new ApiError(400, "Voting is only available in the General channel");
    assertPostOpen(post);

    const userId = req.user._id.toString();
    const existingVote = post.voters.find((v) => v.user.toString() === userId);

    if (existingVote) {
        if (existingVote.vote === vote) {
            // Toggle off (remove vote)
            post.voters = post.voters.filter((v) => v.user.toString() !== userId);
            post[vote === "up" ? "upvotes" : "downvotes"] = Math.max(0, post[vote === "up" ? "upvotes" : "downvotes"] - 1);
        } else {
            // Change vote direction
            post[existingVote.vote === "up" ? "upvotes" : "downvotes"] = Math.max(0, post[existingVote.vote === "up" ? "upvotes" : "downvotes"] - 1);
            existingVote.vote = vote;
            post[vote === "up" ? "upvotes" : "downvotes"] += 1;
        }
    } else {
        post.voters.push({ user: req.user._id, vote });
        post[vote === "up" ? "upvotes" : "downvotes"] += 1;
    }

    await post.save();

    return res.status(200).json(
        new ApiResponse(200, { upvotes: post.upvotes, downvotes: post.downvotes }, "Vote recorded")
    );
});
