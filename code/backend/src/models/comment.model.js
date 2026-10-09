import mongoose, { Schema } from "mongoose";

const commentSchema = new Schema(
    {
        post: {
            type: Schema.Types.ObjectId,
            ref: "Post",
            required: true,
            index: true,
        },

        author: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        body: {
            type: String,
            required: true,
            trim: true,
            maxlength: [2000, "Comment cannot exceed 2000 characters"],
        },

        // Null = top-level comment; ObjectId = reply to another comment
        parent: {
            type: Schema.Types.ObjectId,
            ref: "Comment",
            default: null,
            index: { sparse: true },
        },

        // Nesting depth (0 = top-level, 1 = reply to top-level, etc.)
        // Capped at 2 levels deep to avoid infinite nesting
        depth: {
            type: Number,
            default: 0,
            min: 0,
            max: 2,
        },
    },
    {
        timestamps: true,
    }
);

// Fetch all comments for a post, newest first
commentSchema.index({ post: 1, createdAt: -1 });
// Fetch replies for a parent comment
commentSchema.index({ parent: 1, createdAt: -1 });

export const Comment = mongoose.model("Comment", commentSchema);
